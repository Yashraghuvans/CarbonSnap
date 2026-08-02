# CarbonSnap Data Model

Canonical domain types and persistence layout. Types live in
`src/shared/model/types.ts`; Firestore records in `src/shared/api/firestore.ts`;
the server ledger in `src/server/store.ts`.

---

## Firestore collections (tenant registry)

### `users/{uid}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| `uid` | string | Firebase Auth uid |
| `name` | string | Display name |
| `email` | string | Login email |
| `role` | string | `Admin` / `Contributor` / `Auditor` |
| `organisationIds` | string[] | Workspaces the user belongs to |
| `activeOrgId` | string | Preferred workspace |
| `createdAt` | number | Epoch ms |

Rules: read/write only by `request.auth.uid == uid`.

### `organisations/{orgId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| `id`, `name` | string | `org_<ts>_<rand>` |
| `country`, `industrySector` | string | Defaults: `United Kingdom`, SME sector |
| `employeeCount` | number, `annualRevenueGbp` | number |
| `logoUrl` | string | empty by default |
| `license` | string | `AGPLv3` |
| `ownerUid` | string | Creator — required for update/delete |

Rules: any authenticated user may create/read; update/delete requires
`ownerUid == request.auth.uid`.

### `reportingPeriods/{periodId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| `id`, `orgId` | string | `period_<orgId>_<year>` |
| `name` | string | e.g. `FY 2026-2027` |
| `startDate`, `endDate` | string | ISO dates |
| `status` | string | `ACTIVE` / `LOCKED` |
| `isBaseline` | boolean | First period is baseline |
| `notes` | string | |

### `contactInquiries/{inquiryId}`

| Field | Type |
| :--- | :--- |
| `fullName`, `email`, `organisationName`, `inquiryType`, `message` | string |
| `createdAt` | number |

Rules: anyone may create; read requires auth.

---

## Server ledger store (`src/server/store.ts`)

In-process per-tenant workspace:

```
workspace = {
  org: { id, name, country, period: { id, name, startDate, endDate } },
  activities: ActivityEntry[],   // scoped by org + period
  auditLogs: AuditLog[],
  summary: EmissionsSummary      // recomputed after each mutation
}
```

`ensureTenantWorkspace` creates/mirrors a Firestore tenant; every mutation
recomputes the summary deterministically via `calculationEngine.ts`.

---

## Core domain types (shared/model/types.ts)

| Type | Purpose |
| :--- | :--- |
| `Organisation` | Workspace profile (server shape, `createdAt: string`) |
| `ReportingPeriod` | Fiscal window with `status`/`isBaseline` |
| `ActivityEntry` | Ledger row: scope, category, description, amount, unit, factorId, co2eKg |
| `ActivityFormData` | Input shape for create/update |
| `EmissionFactor` | `id`, `scope`, `category`, `unit`, `co2ePerUnit`, per-gas breakdown |
| `EmissionFactorDataset` | Dataset metadata (UK/EPA/global + year) |
| `EmissionsSummary` | Totals by scope, category breakdown, intensity metrics, audit trail |
| `AuditLog` | Immutable change log entries |
| `UserRole` / `PersonaType` / `Language` | Enums for RBAC, personas, i18n |

Factor ids follow `<cc>_<category>_<variant>_<year>` (e.g. `uk_elec_grid_2024`).
