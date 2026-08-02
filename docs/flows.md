# CarbonSnap Key Flows

End-to-end flows through the CarbonSnap stack, with the code touch-points for
each step. These are the flows an agent should consult when modifying
behaviour.

---

## 1. Authentication (email/password or Google)

```text
[ Browser ] → AuthPage (pages/auth)
   → Firebase Auth signIn/signUp/signInWithPopup (features/auth/AuthContext)
   → ID token cached (shared/api/client → getAuthToken)
   → every /api call: Authorization: Bearer <idToken>
   → server.ts requireAuth → Identity Toolkit accounts:lookup (15-min cache)
   → 401 on invalid/missing token; public whitelist untouched
```

Touch-points: `pages/auth/AuthPage.tsx`, `features/auth/AuthContext.tsx`,
`shared/api/client.ts`, `server.ts`.

Edge cases: `auth/popup-closed-by-user` (ignore), `account-exists-with-different-credential`
(prompt email/password instead), `unauthorized-domain` (add domain in Firebase console).

## 2. Workspace provisioning (first sign-in)

1. Sign-up/Google flow writes `users`, `organisations`, `reportingPeriods` to
   Firestore (`features/auth/AuthContext.tsx` → `shared/api/firestore.ts`).
   If Firestore rules are not deployed, a local session fallback applies and
   syncs later.
2. Dashboard boots → `useWorkspace` (`shared/hooks/useWorkspace.ts`) calls
   `POST /api/v1/auth/sync-tenant` (idempotent) to materialise the tenant in
   the ledger store (`src/server/store.ts`).
3. `useWorkspace` loads organisations + factor datasets; period selection
   triggers period + inventory loading.

## 3. Activity entry → calculation → summary

```text
ActivityLogView → onAddActivity (useInventory) → POST /api/v1/activities
   → ledger store validates factor id → calculationEngine.compute
     tCO2e = amount × co2e_per_unit / 1000
   → GET /api/v1/summary aggregates by scope/category
```

Scope 2 supports location-based (`uk_elec_grid_2024`) vs market-based
(`uk_elec_green_2024`). Invalid factor ids are rejected with `400`.

## 4. Report generation & verification

1. `ReportsView` → `GET /api/v1/reports/:periodId/{secr,csrd}` or
   `GET /api/reports/california-sb/:periodId`.
2. Reports carry SHA-256 checksums; certificates via
   `GET /api/v1/periods/:periodId/verification-certificate`.
3. Auditors verify publicly at `GET /api/verify/:certId` (no login).
4. Evidence trail: `GET /api/v1/reports/:periodId/audit-bundle` + `/api/audit-logs`.

## 5. Supplier share portal

```text
ReportsView "share" → POST /api/v1/supplier-share → token
   → App routes /share/:token → pages/share/SharePortalPage
   → features/supply-chain/SupplierSharePortal (public, token-scoped)
```

## 6. Estimator → saved ledger

`EstimatorView` computes an indicative footprint; "save" converts the result
into real activities for the active period via `useInventory.addActivity`.

## Security invariants

- No verified token → no `/api/v1` data; public surface is only
  `PUBLIC_PATHS` in `server.ts`.
- Tenant isolation: all ledger ops scoped by `orgId`/`periodId`; Firestore
  rules lock `users/{uid}` to `request.auth.uid == uid`.
- Rate limits on contact/estimate/leads/sync-tenant; body limits on JSON/CSV.
