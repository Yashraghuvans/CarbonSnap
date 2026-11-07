-- CarbonSnap workspace schema.
-- Authorization uses organisation_members, never user-editable auth metadata.
-- Security definer functions live in the private schema, which is not exposed as an API schema.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to postgres, service_role;

grant usage on schema public to anon, authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  industry_sector text not null default '',
  employee_count integer not null default 0 check (employee_count >= 0),
  annual_revenue_gbp numeric not null default 0 check (annual_revenue_gbp >= 0),
  created_at timestamptz not null default now()
);

create table public.organisation_members (
  org_id uuid not null references public.organisations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'contributor', 'auditor')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index organisation_members_user_idx on public.organisation_members (user_id);

create table public.reporting_periods (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'ACTIVE' check (status in ('DRAFT', 'ACTIVE', 'CLOSED')),
  is_baseline boolean not null default false,
  notes text not null default '',
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz not null default now(),
  check (start_date < end_date)
);

create index reporting_periods_org_idx on public.reporting_periods (org_id);

create table public.emission_factors (
  id text primary key,
  dataset text not null,
  category text not null,
  name text not null,
  scope smallint not null check (scope in (1, 2, 3)),
  unit text not null,
  factor_value numeric not null check (factor_value >= 0),
  dataset_source text not null default '',
  description text not null default ''
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  period_id uuid not null references public.reporting_periods (id) on delete cascade,
  activity_type text not null,
  description text not null,
  quantity numeric not null check (quantity >= 0),
  unit text not null,
  source_scope smallint not null check (source_scope in (1, 2, 3)),
  factor_id text not null references public.emission_factors (id),
  factor_name text not null,
  factor_value numeric not null,
  co2e_kg numeric not null,
  activity_date date not null,
  facility_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activities_org_period_idx on public.activities (org_id, period_id);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

create index audit_logs_org_idx on public.audit_logs (org_id, created_at desc);

create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  org_id uuid not null references public.organisations (id) on delete cascade,
  period_id uuid not null references public.reporting_periods (id) on delete cascade,
  share_name text not null,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  org_id uuid primary key references public.organisations (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'none',
  price_id text,
  livemode boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint subscriptions_test_mode check (livemode = false)
);

create table public.stripe_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  organisation_name text not null default '',
  inquiry_type text not null default 'General',
  message text not null,
  created_at timestamptz not null default now(),
  check (length(trim(full_name)) > 0),
  check (position('@' in email) > 1),
  check (length(trim(message)) > 0)
);

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.reporting_periods enable row level security;
alter table public.emission_factors enable row level security;
alter table public.activities enable row level security;
alter table public.audit_logs enable row level security;
alter table public.share_links enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.contact_inquiries enable row level security;

alter table public.profiles force row level security;
alter table public.organisations force row level security;
alter table public.organisation_members force row level security;
alter table public.reporting_periods force row level security;
alter table public.emission_factors force row level security;
alter table public.activities force row level security;
alter table public.audit_logs force row level security;
alter table public.share_links force row level security;
alter table public.subscriptions force row level security;
alter table public.stripe_events force row level security;
alter table public.contact_inquiries force row level security;

create or replace function private.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members m
    where m.org_id = target_org
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.org_role(target_org uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.organisation_members m
  where m.org_id = target_org
    and m.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.protect_profile_flags()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.onboarding_completed is distinct from old.onboarding_completed
     and current_setting('carbonsnap.allow_onboarding', true) is distinct from '1' then
    raise exception 'onboarding status is managed by workspace setup';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_flags on public.profiles;
create trigger profiles_protect_flags
  before update on public.profiles
  for each row execute function private.protect_profile_flags();

create or replace function private.apply_emission_factor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  factor public.emission_factors%rowtype;
begin
  if new.quantity is null or new.quantity < 0 then
    raise exception 'quantity must be zero or greater';
  end if;

  select * into factor from public.emission_factors where id = new.factor_id;
  if not found then
    raise exception 'unknown emission factor';
  end if;

  new.unit := factor.unit;
  new.source_scope := factor.scope;
  new.factor_value := factor.factor_value;
  new.factor_name := factor.name;
  new.co2e_kg := round(new.quantity * factor.factor_value, 4);
  if new.activity_type is null or length(trim(new.activity_type)) = 0 then
    new.activity_type := factor.category;
  end if;
  if new.description is null or length(trim(new.description)) = 0 then
    new.description := factor.name;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists activities_apply_factor on public.activities;
create trigger activities_apply_factor
  before insert or update on public.activities
  for each row execute function private.apply_emission_factor();

create or replace function private.create_workspace(
  org_name text,
  country text,
  industry_sector text,
  employee_count integer,
  annual_revenue_gbp numeric,
  period_name text,
  period_start date,
  period_end date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  new_org uuid;
  new_period uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if org_name is null or length(trim(org_name)) < 2 or length(trim(org_name)) > 120 then
    raise exception 'organisation name must be between 2 and 120 characters';
  end if;
  if country is null or length(trim(country)) < 2 then
    raise exception 'country is required';
  end if;
  if employee_count is null or employee_count < 0 then
    raise exception 'employee count must be zero or greater';
  end if;
  if annual_revenue_gbp is null or annual_revenue_gbp < 0 then
    raise exception 'annual revenue must be zero or greater';
  end if;
  if period_name is null or length(trim(period_name)) < 2 then
    raise exception 'reporting period name is required';
  end if;
  if period_start is null or period_end is null or period_start >= period_end then
    raise exception 'period start must be before period end';
  end if;

  insert into public.organisations (name, country, industry_sector, employee_count, annual_revenue_gbp)
  values (trim(org_name), trim(country), coalesce(trim(industry_sector), ''), employee_count, annual_revenue_gbp)
  returning id into new_org;

  insert into public.organisation_members (org_id, user_id, role)
  values (new_org, uid, 'owner');

  insert into public.reporting_periods (org_id, name, start_date, end_date, status, is_baseline)
  values (new_org, trim(period_name), period_start, period_end, 'ACTIVE', true)
  returning id into new_period;

  perform set_config('carbonsnap.allow_onboarding', '1', true);
  update public.profiles
  set onboarding_completed = true
  where id = uid;

  return jsonb_build_object('org_id', new_org, 'period_id', new_period);
end;
$$;

create or replace function public.create_workspace(
  org_name text,
  country text,
  industry_sector text,
  employee_count integer,
  annual_revenue_gbp numeric,
  period_name text,
  period_start date,
  period_end date
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.create_workspace(
    org_name,
    country,
    industry_sector,
    employee_count,
    annual_revenue_gbp,
    period_name,
    period_start,
    period_end
  );
$$;

revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.org_role(uuid) from public;
revoke all on function private.create_workspace(text, text, text, integer, numeric, text, date, date) from public;
revoke all on function public.create_workspace(text, text, text, integer, numeric, text, date, date) from public;
grant execute on function private.is_org_member(uuid) to authenticated, service_role;
grant execute on function private.org_role(uuid) to authenticated, service_role;
grant execute on function private.create_workspace(text, text, text, integer, numeric, text, date, date) to authenticated, service_role;
grant execute on function public.create_workspace(text, text, text, integer, numeric, text, date, date) to authenticated;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy organisations_select on public.organisations
  for select to authenticated
  using ((select private.is_org_member(id)));

create policy organisations_update on public.organisations
  for update to authenticated
  using ((select private.org_role(id)) = 'owner')
  with check ((select private.org_role(id)) = 'owner');

create policy members_select on public.organisation_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_org_member(org_id))
  );

create policy periods_select on public.reporting_periods
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create policy periods_insert on public.reporting_periods
  for insert to authenticated
  with check ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy periods_update on public.reporting_periods
  for update to authenticated
  using ((select private.org_role(org_id)) in ('owner', 'contributor'))
  with check ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy periods_delete on public.reporting_periods
  for delete to authenticated
  using ((select private.org_role(org_id)) = 'owner');

create policy factors_read on public.emission_factors
  for select to anon, authenticated
  using (true);

create policy activities_select on public.activities
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create policy activities_insert on public.activities
  for insert to authenticated
  with check ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy activities_update on public.activities
  for update to authenticated
  using ((select private.org_role(org_id)) in ('owner', 'contributor'))
  with check ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy activities_delete on public.activities
  for delete to authenticated
  using ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy audit_select on public.audit_logs
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create policy audit_insert on public.audit_logs
  for insert to authenticated
  with check ((select private.is_org_member(org_id)));

create policy shares_select on public.share_links
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create policy shares_insert on public.share_links
  for insert to authenticated
  with check ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy shares_delete on public.share_links
  for delete to authenticated
  using ((select private.org_role(org_id)) in ('owner', 'contributor'));

create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using ((select private.is_org_member(org_id)));

create policy contact_insert on public.contact_inquiries
  for insert to anon, authenticated
  with check (true);

grant select, update on public.profiles to authenticated;
grant select, update on public.organisations to authenticated;
grant select on public.organisation_members to authenticated;
grant select, insert, update, delete on public.reporting_periods to authenticated;
grant select on public.emission_factors to anon, authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant select, insert, delete on public.share_links to authenticated;
grant select on public.subscriptions to authenticated;
grant insert on public.contact_inquiries to anon, authenticated;
