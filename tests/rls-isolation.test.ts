import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const dropDb = 'drop database if exists carbonsnap_rls_test;';
const createDb = 'create database carbonsnap_rls_test;';

const roles = `
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
`;

function psql(database: string, sql: string) {
  return execFileSync('sudo', ['-u', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-d', database, '-c', sql], {
    encoding: 'utf8'
  });
}

function psqlFile(database: string, file: string) {
  execFileSync('sudo', ['-u', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-d', database, '-f', file], {
    encoding: 'utf8',
    stdio: 'pipe'
  });
}

describe('workspace row level security', () => {
  it('keeps one user from reading another organisation and blocks direct entitlement writes', () => {
    psql('postgres', dropDb);
    psql('postgres', createDb);
    psql('carbonsnap_rls_test', roles);
    psqlFile('carbonsnap_rls_test', 'supabase/migrations/20261107114812_workspace_rls.sql');
    psqlFile('carbonsnap_rls_test', 'supabase/migrations/20261107115119_emission_factor_seed.sql');

    const script = `
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
set role authenticated;
select public.create_workspace(
  'Alpha Ltd', 'United Kingdom', 'Services', 4, 1000,
  'FY 2026', '2026-01-01', '2026-12-31'
);
reset role;

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
set role authenticated;
select count(*) as visible_orgs from public.organisations;
select public.create_workspace(
  'Beta Ltd', 'United Kingdom', 'Services', 2, 500,
  'FY 2026', '2026-01-01', '2026-12-31'
);
select count(*) as own_orgs from public.organisations;
do $$
begin
  begin
    insert into public.subscriptions (org_id, status, livemode)
    select id, 'active', false from public.organisations limit 1;
    raise exception 'subscription insert should have been denied';
  exception when insufficient_privilege then
    null;
  end;
end $$;
reset role;
`;
    const output = psql('carbonsnap_rls_test', script);
    assert.match(output, /visible_orgs[\s\S]*?\n\s*0\n/);
    assert.match(output, /own_orgs[\s\S]*?\n\s*1\n/);
  });
});
