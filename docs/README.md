# CarbonSnap Documentation — Index & Context

This folder is the documentation hub for the CarbonSnap codebase. It is
structured so that both humans and AI agents can find the right document
quickly and understand how the repository is organised.

---

## Folder map

| Path | What it is |
| :--- | :--- |
| `README.md` | **This file** — folder context, mapping, and navigation index |
| `instructions.md` | Working instructions: conventions, architecture rules, verification checklist |
| `features.md` | Feature inventory — every user flow, its layer and file location |
| `flows.md` | Key end-to-end flows (auth, provisioning, calculation, reporting, sharing) |
| `specs/` | Contract-level specs (data model, security model) |
| `guides/` | User-facing and ops guides (user manual, admin guide, self-hosting) |
| `technical/` | Engineering docs (architecture, API reference, contributor guide) |
| `regulatory/` | Compliance standards (GHG Protocol, CSRD, SECR, SB 253) |

## Source-of-truth hierarchy

1. **`AGENTS.md`** (repo root) — the codebase map; start here for any code work.
2. **`instructions.md`** — how to write code correctly in this repo.
3. **`features.md` + `flows.md`** — what exists and how it works.
4. **`specs/`** — the contracts those features implement.
5. Guides/technical/regulatory — depth on demand.

## Mapping: docs ↔ code

| Concern | Docs | Code |
| :--- | :--- | :--- |
| Architecture & layers | `technical/architecture.md` | `src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` |
| REST API surface | `technical/api-reference.md`, `specs/api-contract.md` | `server.ts`, `src/shared/api/client.ts` |
| Data model | `specs/data-model.md` | `src/shared/model/types.ts`, `src/server/store.ts` |
| Security model | `specs/security-model.md`, `technical/architecture.md` | `server.ts` auth middleware, `firestore.rules` |
| Feature inventory | `features.md` | `src/features/*` |
| Key flows | `flows.md` | hooks + feature views |
| Factor packs | `emission-factors/README.md` | `emission-factors/*.json` |

## Maintenance rule

Every user-visible or architectural change must update the matching doc here:
new feature → `features.md`; changed flow → `flows.md`; new endpoint →
`technical/api-reference.md`; new collection/type → `specs/data-model.md`.
