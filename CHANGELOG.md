# Changelog

## Unreleased

- Added a local Supabase migration for workspace data, membership, and row-level security (`supabase/migrations/20261107114812_workspace_rls.sql`) and seeded the packaged emission factors. It has not been applied to a remote project. The running application still uses Firebase and the in-memory ledger.
- Added `@supabase/supabase-js`, `stripe`, and `posthog-js`. They are not wired into sign-in, checkout, or analytics yet.
- Auditor totals now use the summary fields the API returns. Activity search no longer throws when a text or number field is missing. A failed inventory request shows an error and a retry instead of an endless spinner.
- Unknown public certificate ids return 404. An empty reporting period no longer receives invented kilowatt-hour totals.
- Landing page no longer leads with self-hosting, open-source pricing, or unpublished dollar amounts.
- Missing Firebase web config no longer throws while the page is loading.

Not done: Supabase sign-in, onboarding persistence, Stripe test checkout, and PostHog capture. Hosted Supabase, Google OAuth, Stripe prices, and the PostHog host are still unconfigured. See GitHub issues #1 and #5.
