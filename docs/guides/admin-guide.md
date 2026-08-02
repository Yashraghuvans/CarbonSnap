# Administration Guide

Covers organisation settings, reporting periods, roles, and multi-tenant workspaces in CarbonSnap.

---

## Roles & permissions

| Role | Permissions |
| :--- | :--- |
| **Owner / Admin** | Full control: organisation settings, billing, invitations, reporting-period management, report generation. |
| **Analyst** | Add, edit and delete activity ledger entries; run calculations; preview disclosures. |
| **Auditor / Viewer** | Read-only access to ledger items, calculation methodologies, and verified GHG reports. |

---

## Organisations & reporting periods

* **Organisations** are tenant workspaces. Each user profile references one or more organisations and an active one.
* **Reporting periods** define a fiscal window (e.g. `FY2024: 2024-01-01 → 2024-12-31`). Activities belong to a period; summaries and reports are period-scoped.
* New workspaces are provisioned automatically at sign-up; `POST /api/v1/auth/sync-tenant` keeps the ledger store in sync with Firestore.

### Locking periods

To protect audited historical data:

1. Go to **Organisation Profile → Reporting Periods**.
2. Select the period (e.g. `FY2023`).
3. Set the period status to `Locked`.

Locked periods freeze activity edits for non-admin users, preserving audit integrity.

---

## Multi-tenant advisory workspaces

ESG consultancies managing several client SMEs can:

* Maintain a separate workspace per client under one partner login.
* Switch between clients via the **Organisation Selector**.
* White-label exported reports with firm logos and advisory disclaimers (`/api/v1/partner/brand`).
* Request data from client organisations (`/api/v1/partner/request-data`) and review it in **Integrations**.

---

## Security & compliance operations

* **Audit logs:** export ledger changes via `/api/audit-logs` for assurance reviews.
* **Data deletion:** GDPR right-to-erasure via `POST /api/v1/privacy/purge-org-data`; compliance exports via `/api/v1/privacy/compliance-export/:orgId`.
* **Verification:** every report carries a SHA-256 checksum verifiable at `/api/verify/:certId` (public, no login required).
* **Disaster recovery:** run restore tests via `/api/v1/disaster-recovery/test-restore` and review results at `/api/v1/disaster-recovery/test-results`.
