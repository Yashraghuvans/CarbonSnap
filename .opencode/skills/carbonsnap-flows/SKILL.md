---
name: carbonsnap-flows
description: CarbonSnap key-flows skill. Use when working on or explaining the end-to-end flows — auth/sign-in, workspace provisioning, activity entry and tCO2e calculation, reporting, supplier share portal, API security. Front-load keywords like "flow", "auth", "workspace", "tenant", "activity", "calculation", "report", "share portal", "401", "token".
---

# CarbonSnap Key Flows

Read `docs/flows.md` for the canonical flow documentation; this skill is the
quick reference.

## 1. Auth flow (email/password or Google)

1. `AuthContext` (`src/features/auth/AuthContext.tsx`) signs in via Firebase
   Auth (email/password, Google popup, or reset link).
2. Client stores the ID token via `getAuthToken()`; every API call attaches
   `Authorization: Bearer <idToken>`.
3. Server middleware (`server.ts`) verifies with Identity Toolkit
   `accounts:lookup` (15-min cache) → `401` on failure.
4. No token = only PUBLIC_PATHS routes (health, license, public estimate,
   contact, roadmap, share portals, leads) are reachable.

## 2. Workspace provisioning

1. Sign-up (or first Google sign-in) writes `users`, `organisations`,
   `reportingPeriods` docs to Firestore (local-session fallback if rules not deployed).
2. `POST /api/v1/auth/sync-tenant` (idempotent) materialises the tenant into
   the ledger store (`src/server/store.ts`).
3. `useWorkspace` loads orgs/periods/factors; `useInventory` loads the ledger.

## 3. Activity → calculation

1. UI saves an activity (amount + unit + factor id/auto-match).
2. `calculationEngine.ts` computes `tCO2e = amount × co2e_per_unit / 1000`
   (Scope 2 supports location-based vs market-based, e.g. `uk_elec_grid_2024`
   vs `uk_elec_green_2024`).
3. Summary aggregates by scope/category (`/api/v1/summary`).

## 4. Reporting

`ReportsView` → `/api/v1/reports/:periodId/{secr,csrd}` or
`/api/reports/california-sb/:periodId`; certificates carry SHA-256 checksums
verifiable publicly at `/api/verify/:certId`.

## 5. Supplier share portal

`POST /api/v1/supplier-share` creates a token → public
`/share/:token` portal (`features/supply-chain/SupplierSharePortal.tsx`).

## Security reminders

- Never move a route into PUBLIC_PATHS without review.
- Scratch Firebase test accounts: `@example.com` only; delete after use.
