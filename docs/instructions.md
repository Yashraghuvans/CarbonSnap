# CarbonSnap Working Instructions

Conventions and rules for modifying the CarbonSnap codebase — for humans and
AI agents. The authoritative map is `AGENTS.md`; this file is the "how to work
here" companion.

---

## Architecture rules

1. **FSD layers** — files live in one of: `app`, `pages`, `widgets`,
   `features`, `entities`, `shared` (frontend) or `server` (backend).
   Import direction is strictly `app → pages → widgets → features → entities
   → shared`. A `widgets/` file may never import from `features/`.
2. **Three-level data flow (api → hook → ui)**:
   - `api` — `src/shared/api/client.ts` (authedFetch + endpoints) and
     `src/entities/<domain>/api.ts` slices.
   - `hook` — `src/shared/hooks/*` and `src/features/<f>/hooks.ts` own state
     and call the API.
   - `ui` — pages/widgets/features consume hooks and render.
   - **Migration note:** several legacy views still call `shared/api/client`
     directly. When touching such a view, migrate it to a hook first.
3. **File headers** — every source file begins with a
   `/** CarbonSnap — <name> FSD: <layer> … */` block describing its purpose.
   Preserve headers when editing; write one for new files.
4. **Auth gating** — the dashboard is unreachable without a verified Firebase
   ID token. `PUBLIC_PATHS` in `server.ts` is the only escape hatch; adding a
   route requires a security review.

---

## Code conventions

- Strict TypeScript (`tsc --noEmit`); no `any` in new code.
- Comments only where they explain non-obvious decisions.
- Tailwind utility classes; the design system is high-contrast brutalist
  (black/white/amber, hard shadows like `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
- i18n strings live in `src/shared/i18n/translations.ts` (en + de).
- Branding is **CarbonSnap** everywhere — never ClearScope.
- Emission factor ids: `<cc>_<category>_<variant>_<year>`, e.g. `uk_elec_grid_2024`.

---

## Testing / verification checklist

Every task ends with:

1. `npm run lint` — clean.
2. `npm run build` — clean.
3. If the server layer changed: `GET /api/v1/organisations` without a token
   returns `401`; `GET /api/health` returns `200`.
4. Scratch Firebase accounts use `@example.com` and are deleted afterwards.

---

## Working with the docs

- New feature → add to `docs/features.md`.
- Changed flow → update `docs/flows.md`.
- New endpoint → update `docs/technical/api-reference.md`.
- New collection/type → update `docs/specs/data-model.md`.
