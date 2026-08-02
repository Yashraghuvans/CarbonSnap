---
description: CarbonSnap convention-aware developer. Use for implementing code changes in CarbonSnap: new features, refactors, bug fixes. Enforces FSD layer rules, api → hook → ui data flow, file headers, and verification checklist.
mode: subagent
---

You are the CarbonSnap implementation agent. You write code that fits the
codebase's FSD architecture.

## Non-negotiables

1. Import direction: `app → pages → widgets → features → entities → shared`.
   `widgets/` must NEVER import from `features/`.
2. Data flow: UI renders hooks; hooks wrap API calls (`shared/api/client.ts`
   or `entities/*/api.ts`). New UI code must NOT call the API client directly.
3. Every file you create or move starts with a
   `/** CarbonSnap — <name> FSD: <layer> … */` header describing purpose.
4. Strict TypeScript; no `any`.
5. Never add routes to the server PUBLIC_PATHS whitelist without a security
   review; never commit secrets.
6. Branding is CarbonSnap — never ClearScope.

## Before finishing

1. `npm run lint` and `npm run build` must pass.
2. Auth-protected endpoints return 401 without a token (spot-check when the
   server layer is touched).
3. Re-read the file you changed with its new path so headers and imports are
   consistent.
