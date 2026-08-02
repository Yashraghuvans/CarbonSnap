# Technical Architecture & System Design

CarbonSnap is a lightweight, security-first carbon accounting platform: a React single-page application backed by an Express REST API, with Firebase handling authentication and tenant metadata.

---

## High-Level Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript (strict), Vite, Tailwind CSS, Lucide icons, Recharts, Motion |
| **Authentication** | Firebase Authentication — email/password and Google (popup) sign-in |
| **Tenant registry** | Firebase Firestore — `users`, `organisations`, `reportingPeriods`, `contactInquiries` collections (rules in `firestore.rules`) |
| **Backend** | Express.js on Node.js/TypeScript; every `/api/*` route (except a small public whitelist) verifies the caller's Firebase ID token |
| **Ledger & calculation** | In-process data service with deterministic factor conversion engine (`src/lib/calculator.ts`) |
| **Packaging** | Single-command Docker image (see `Dockerfile`) bundling static assets + API on port `3000` |

---

## Security Model

```text
   [ Client Browser ]
         │  Firebase Auth (sign-in / sign-up / reset password / Google popup)
         ▼
   [ Firebase Auth ]   →  issues ID token (~1 hour validity)
         │
         │  Authorization: Bearer <idToken> on every /api request
         ▼
   [ Express.js Server (server.ts) ]
         │  requireAuth middleware
         │   ├── PUBLIC_PATHS whitelist (health, license, public estimate,
         │   │   contact, roadmap, share-portal token routes, leads/capture…)
         │   └── everything else → Identity Toolkit accounts:lookup
         │                         (cached 15 min, cached token replay)
         │
         ├── Data service & ledger store
         │      ├── /api/v1/organisations
         │      ├── /api/v1/reporting-periods
         │      └── /api/v1/activities | summary | periods/compare
         │
         ├── Calculation engine (src/lib/calculator.ts)
         │      └── Emission factor datasets (/emission-factors/*.json)
         │
         └── Reporting endpoints (SECR / CSRD / SB 253, audit bundles, certificates)
```

### Authentication flow

1. The client signs in via **Firebase Auth** (email/password, password reset, or Google popup).
2. The dashboard attaches the Firebase ID token as `Authorization: Bearer <idToken>` on every API call.
3. `requireAuth` validates the token server-side with the Google Identity Toolkit `accounts:lookup` API (results cached for 15 minutes; rate-limited per IP).
4. Requests that fail verification receive `401`; unauthenticated users never reach the dashboard route.

### Workspace provisioning

1. On sign-up (or first Google sign-in), `users`, `organisations` and `reportingPeriods` documents are written to Firestore (local-session fallback applies until rules are deployed).
2. `POST /api/v1/auth/sync-tenant` materialises the Firestore tenant into the ledger store (idempotent).
3. All ledger operations (activities, summaries, reports) are scoped by `orgId`/`periodId`.

### Additional hardening

* Security headers (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`); `x-powered-by` disabled.
* In-memory per-IP rate limiting on contact, estimate, lead-capture and tenant-sync endpoints.
* Body-size limits: 1 MB JSON, 10 MB CSV import.
* No secrets in the repository — credentials live in `.env` (template: `.env.example`); Firebase web config is public by design (`VITE_FIREBASE_*`).
* Firestore security rules lock user profiles to their owner and restrict org writes to the `ownerUid`.

---

## Calculation Engine Specification

The engine maps operational metrics to `tCO2e` (tonnes of CO₂-equivalent):

```
Emissions (tCO2e) = (Activity Amount × Conversion Factor) / 1000
```

### Greenhouse gases accounted

* `CO₂` (carbon dioxide)
* `CH₄` (methane — converted via GWP)
* `N₂O` (nitrous oxide — converted via GWP)
* `HFCs / PFCs / SF₆` (refrigerants)

Global Warming Potentials align with **IPCC AR6** 100-year metrics. Scope 2 supports location-based and market-based (green-tariff) electricity factors, e.g. `uk_elec_grid_2024` vs `uk_elec_green_2024`.

### Data flow

```text
   [ Client Browser ]
         │  REST API requests (/api/v1/*)
         ▼
   [ Express.js Server ]
         ├── Data service & ledger store
         │      ├── /api/v1/activities
         │      ├── /api/v1/organisations
         │      └── /api/v1/reporting-periods
         ├── Calculation engine (src/lib/calculator.ts)
         │      └── Emission factor datasets (/emission-factors/*.json)
         └── Reporting / PDF / audit-bundle generators
```
