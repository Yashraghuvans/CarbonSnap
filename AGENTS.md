# AGENTS.md — CarbonSnap Codebase Map

This file is the single source of truth for working on the CarbonSnap
codebase, whether you are a human contributor or an AI agent.

**Always start here.** Then read `docs/README.md` (docs map), `docs/instructions.md`
(conventions), `docs/features.md` (feature inventory), `docs/flows.md` (key flows).

---

## 1. What CarbonSnap Is

Open-source (AGPLv3) carbon accounting platform for SMEs. React SPA + Express
REST API. Firebase Authentication (email/password + Google popup) issues ID
tokens; every protected `/api/*` route verifies them server-side. Firestore is
the tenant registry; an in-process ledger store holds activities/summaries.

## 2. Repository Map

```
docs/                  Guides, specs, features, flows, docs index
emission-factors/      UK DESNZ/DEFRA, US EPA, IPCC AR6 JSON factor packs
scripts/               Factor pack validation/sync tooling
src/
  app/                 App shell (providers + routing) & entry point
  pages/               Route-level compositions (landing, auth, dashboard, share)
  widgets/             Composite blocks (navbar, landing sections, dashboard view)
  features/            User flows; each owns its UI (api → hook → ui pattern)
  entities/            Domain API slices (organisation, activity, factor)
  shared/              api client, hooks, i18n, domain types
  server/              BACKEND slice (ledger store + calculation engine) — imported by server.ts
server.ts              Express API: auth middleware, rate limits, security headers
firestore.rules        Firestore security rules (deploy via firebase CLI)
Dockerfile, firebase.json, .env.example
```

## 3. Architecture Rules (FSD + api → hook → ui)

- **Layer import direction** (outer may import inner, never the reverse):
  `app → pages → widgets → features → entities → shared`.
  A `widgets/` file may NOT import from `features/`; a `pages/` file may import
  from `widgets` and `features`.
- **Three-level data flow**: `api → hook → ui`
  1. `api` — `src/shared/api/client.ts` (authedFetch + every REST endpoint) and
     `src/entities/*/api.ts` domain slices.
  2. `hook` — `src/shared/hooks/useWorkspace.ts`, `useInventory.ts`, and feature
     hooks wrap API calls and own state.
  3. `ui` — pages/widgets/features render hook data; UI must NOT call
     `shared/api/client` directly (legacy views still do — migrate them when
     touched; see docs/instructions.md).
- **Every source file starts with a `/** CarbonSnap — ... FSD: ... */` header**
  describing its purpose. Preserve it; write one for new files.
- **Auth gating**: no dashboard without a verified Firebase token. Never add a
  route to the server `PUBLIC_PATHS` whitelist without a security review.
- **Secrets**: never commit `.env` values. Use `VITE_FIREBASE_*` for the public
  Firebase web config, server-side secrets in `.env` only.

## 4. Key Files (mapping)

| Concern | Location |
| :--- | :--- |
| Auth state, sign-in/up, Google, workspace provisioning | `src/features/auth/AuthContext.tsx` |
| HTTP API layer (authedFetch, all endpoints) | `src/shared/api/client.ts` |
| Firebase client init | `src/shared/api/firebase.ts` |
| Firestore helpers (users/orgs/periods/inquiries) | `src/shared/api/firestore.ts` |
| Domain types (Organisation, ActivityEntry, …) | `src/shared/model/types.ts` |
| Workspace hook (orgs, periods, factors, tenant sync) | `src/shared/hooks/useWorkspace.ts` |
| Inventory hook (activities, summary, audit) | `src/shared/hooks/useInventory.ts` |
| App shell + routing | `src/app/App.tsx` |
| Dashboard page (authenticated shell) | `src/pages/dashboard/DashboardPage.tsx` |
| Landing page + marketing sections | `src/pages/landing/LandingPage.tsx` + `src/widgets/landing/LandingView.tsx` |
| Sidebar navigation (grouped) | `src/widgets/navbar/Navbar.tsx` |
| Express API, auth middleware, hardening | `server.ts` |
| Ledger store (tenant workspaces, activities, summaries) | `src/server/store.ts` |
| Calculation engine (tCO2e, Scope 2 location/market) | `src/server/calculationEngine.ts` |
| Emission factor datasets | `emission-factors/*.json` |
| i18n (en/de strings) | `src/shared/i18n/translations.ts` |

## 5. Commands

```bash
npm run dev        # Express + Vite dev server on :3000 (no hot restart for server.ts)
npm run lint       # strict typecheck — MUST pass before finishing any change
npm run build      # client + server bundles — MUST pass before finishing any change
npm start          # run production bundle (dist/server.cjs)
```

Port 3000 recovery when switching dev sessions:
`lsof -ti :3000 | xargs kill -9; sleep 1; (npm run dev > /tmp/carbonsnap-dev.log 2>&1 &)`

## 6. Conventions

- Strict TypeScript; no `any` in new code.
- File header comment on every source file (see §3).
- Firebase test accounts must use `@example.com` (the `@test.local` TLD is
  rejected). Delete scratch accounts after verification.
- Emission factor ids look like `uk_elec_grid_2024` (`<cc>_<category>_<variant>_<year>`).
- Comments in code only where they explain non-obvious decisions.

## 7. Verification Checklist (every task)

1. `npm run lint` — clean.
2. `npm run build` — clean.
3. Auth-protected endpoints return `401` without a token.
4. Branding says CarbonSnap (never ClearScope).
5. No secrets committed.
