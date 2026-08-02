# Developer & Contributor Guide

Thank you for contributing to CarbonSnap! This guide covers local development, verification, and pull request requirements. Please also read the [Code of Conduct](../../CODE_OF_CONDUCT.md).

---

## Local Development Setup

### Prerequisites

* Node.js **v20+**
* npm or bun

### Initial setup

```bash
git clone https://github.com/Yashraghuvans/CarbonSnap.git
cd CarbonSnap

npm install          # or: bun install

# Configure Firebase credentials (see README → Firebase Setup)
cp .env.example .env
# fill in VITE_FIREBASE_* values from your Firebase web-app config

# Start the dev server (Express + Vite on port 3000)
npm run dev
```

The dev server hot-reloads changes to `/src` and restarts on `server.ts` edits.

---

## Verification Commands

Run before opening a pull request:

```bash
npm run lint         # strict TypeScript check (tsc --noEmit)
npm run build        # production bundles (client + server)
npm start            # run the production server to smoke-test
```

Smoke-test checklist:

* `GET /api/health` returns `200` with `status: "ok"`.
* `GET /api/v1/organisations` without a token returns `401` (not data).
* Signing in via the app issues a Firebase token that unlocks the dashboard and protected routes.

---

## Pull Request Acceptance Criteria

1. **Clean lint:** `npm run lint` passes with no errors.
2. **Builds:** `npm run build` completes successfully.
3. **Calculation integrity:** changes to `src/lib/calculator.ts` or factor datasets must be verified against official DEFRA/DESNZ, EPA or IPCC figures.
4. **No secrets:** never commit `.env`, API keys, or Firebase service-account files.
5. **Docs:** user-visible behavior changes update the relevant guide in `docs/`.
6. **Signed commits:** commits are signed off (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).

---

## Project Layout

```text
src/
  lib/           calculation engine, Firebase init, Firestore helpers, API client
  context/       AuthContext (Firebase auth + workspace session)
  pages/         AuthPage, dashboard views, landing
  server/        data service & ledger store
server.ts        Express API + auth middleware + rate limiting
emission-factors/  localized conversion factor packs (UK, US EPA, global)
firestore.rules  Firestore security rules
```

---

## Emission Factor Packs

Contributing a localized factor pack (e.g. `CA_2024.json`) is one of the highest-impact contributions:

1. Create the JSON in `/emission-factors/` following the schema in [emission-factors/README.md](../../emission-factors/README.md).
2. Validate it:
   ```bash
   python scripts/update_emission_factors.py --validate emission-factors/CA_2024.json
   ```
3. Reference the new pack in `/emission-factors/README.md` and the README table.

---

## Coding Standards

* **TypeScript strict mode** enabled; no `any` in new code.
* **React:** functional components with explicit, typed props.
* **Styling:** Tailwind utility classes following the existing high-contrast design system.
* **No comments in code unless they explain a non-obvious decision.**
