---
name: carbonsnap-mapping
description: CarbonSnap codebase map skill. Use when working on ANY CarbonSnap code — finding files, planning changes, or deciding where new code goes. Teaches the FSD layer structure (app → pages → widgets → features → entities → shared), the api → hook → ui data flow, import-direction rules, file-header conventions, and the exact mapping of concerns to file paths. Front-load keywords like "FSD", "where does X live", "add a feature", "import from", "layer", "hook", "api", "CarbonSnap".
---

# CarbonSnap Codebase Mapping

Always read `AGENTS.md` first, then `docs/README.md` for the docs map.

## FSD layers (import direction: outer → inner, never reverse)

| Layer | Purpose | Location |
| :--- | :--- | :--- |
| `app` | Shell, providers, routing | `src/app/` |
| `pages` | Route-level compositions | `src/pages/` |
| `widgets` | Composite blocks (navbar, landing, dashboard view) | `src/widgets/` |
| `features` | User flows with own UI | `src/features/` |
| `entities` | Domain API slices | `src/entities/` |
| `shared` | API client, hooks, i18n, types | `src/shared/` |
| `server` (backend) | Ledger store + calculation engine | `src/server/` |

## api → hook → ui data flow

1. **api** — `src/shared/api/client.ts` (all endpoints), `src/entities/<domain>/api.ts` slices.
2. **hook** — `src/shared/hooks/useWorkspace.ts`, `useInventory.ts`; feature hooks live in `src/features/<f>/hooks.ts`.
3. **ui** — pages/widgets/features render hook data. New UI must never import `shared/api/client` directly.

## Rules

- A `widgets/` file may NOT import from `features/`.
- A `pages/` file may import from `widgets` and `features`.
- Every source file starts with a `/** CarbonSnap — <name> FSD: <layer> … */` header.
- Auth: no dashboard without a verified Firebase token; PUBLIC_PATHS additions need review.
- Factor ids: `uk_elec_grid_2024` (`<cc>_<category>_<variant>_<year>`).

## Concern → file map (cheatsheet)

Auth → `src/features/auth/AuthContext.tsx` · API → `src/shared/api/client.ts` · Firestore →
`src/shared/api/firestore.ts` · Types → `src/shared/model/types.ts` · Workspace state →
`src/shared/hooks/useWorkspace.ts` · Inventory → `src/shared/hooks/useInventory.ts` ·
Routing → `src/app/App.tsx` · Dashboard → `src/pages/dashboard/DashboardPage.tsx` ·
Nav → `src/widgets/navbar/Navbar.tsx` · Backend → `src/server/` + `server.ts`.
