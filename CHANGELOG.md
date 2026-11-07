# Changelog

## Unreleased

- Added a local Supabase migration for workspace data, membership, and row-level security (`supabase/migrations/20261107114812_workspace_rls.sql`). It has not been applied to a remote project. The application does not read or write it yet.
- Added `@supabase/supabase-js`, `stripe`, and `posthog-js` for the auth, test billing, and analytics work. They are not wired into the interface yet.

Not done: dashboard crash fixes, landing-page copy, sign-in, onboarding, Stripe test checkout, and PostHog capture. Hosted Supabase, Google OAuth, Stripe prices, and the PostHog host are still unconfigured. See GitHub issue #1.
