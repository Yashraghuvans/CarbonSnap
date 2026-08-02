# REST API Reference

CarbonSnap exposes a versioned REST API under `/api/v1/`. All routes except the public whitelist require Firebase authentication.

---

## Authentication

Every request must carry a Firebase ID token:

```http
Authorization: Bearer <firebase_id_token>
```

Unauthenticated or invalid requests return `401`. Public routes (health, license, public estimate, contact, roadmap, share-portal verification) do not require a token. `GET /api/v1/user` returns the authenticated user's profile (including Firestore profile data when available).

---

## Core Ledger Endpoints

### Health & license

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health`, `/api/v1/health` | — | Service health & version |
| `GET` | `/api/v1/license` | — | License details |

### Organisations (tenant workspaces)

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/organisations` | ✔ | List organisations for the authenticated user |
| `POST` | `/api/v1/organisations` | ✔ | Create an organisation |
| `GET` | `/api/v1/organisations/:id` | ✔ | Organisation details |
| `PUT` | `/api/v1/organisations/:id` | ✔ | Update organisation |
| `GET` | `/api/v1/organisations/:orgId/export-data` | ✔ | Data export (GDPR/portability) |

### Reporting periods

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/reporting-periods` | ✔ | List periods for an organisation |
| `POST` | `/api/v1/reporting-periods` | ✔ | Create a reporting period |
| `PUT` | `/api/v1/reporting-periods/:id` | ✔ | Update a period |
| `POST` | `/api/v1/periods/:periodId/import` | ✔ | CSV bulk import (max 10 MB) |

### Activity ledger

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/activities` | ✔ | List activities (`?organisationId=` & `?periodId=`) |
| `POST` | `/api/v1/activities` | ✔ | Add an activity (auto factor-matching) |
| `GET` | `/api/v1/activities/:id` | ✔ | Activity details |
| `PUT` | `/api/v1/activities/:id` | ✔ | Update activity |
| `DELETE` | `/api/v1/activities/:id` | ✔ | Delete activity |

```json
// POST /api/v1/activities
{
  "organisationId": "org_1722500000_ab12",
  "periodId": "period_org_1722500000_ab12_2024",
  "scope": 2,
  "category": "Electricity",
  "description": "Main office electricity",
  "amount": 15000,
  "unit": "kWh",
  "countryCode": "UK",
  "factorYear": 2024
}
```

### Summary & comparison

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/summary` | ✔ | Footprint summary (`?organisationId=` & `?periodId=`) |
| `GET` | `/api/v1/periods/compare` | ✔ | Compare periods (`?organisationId=` & `?periodIds=` or `?baselineId=` & `?currentId=`) |

---

## Emission Factors

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/emission-factors/datasets` | ✔ | Available datasets (UK, US EPA, global) |
| `GET` | `/api/v1/emission-factors` | ✔ | Factors (`?country=UK&year=2024` …) |
| `GET` | `/api/v1/emission-factors/versions` | ✔ | Factor-pack versions |
| `GET` | `/api/v1/emission-factors/community` | ✔ | Community-submitted factor packs |
| `POST` | `/api/v1/emission-factors/validate-pack` | — | Validate a factor-pack JSON |
| `POST` | `/api/v1/emission-factors/community-submit` | ✔ | Submit a community factor pack |
| `POST` | `/api/v1/emission-factors/pipeline-update` | ✔ | Trigger factor-pipeline refresh |

---

## Reporting & Compliance

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/reports/:periodId/secr` | ✔ | UK SECR report |
| `GET` | `/api/v1/reports/:periodId/csrd` | ✔ | EU CSRD (ESRS E1) report |
| `GET` | `/api/reports/california-sb/:periodId` | ✔ | California SB 253 report |
| `GET` | `/api/v1/reports/:periodId/audit-bundle` | ✔ | Auditor evidence bundle (SHA-256 verified) |
| `GET` | `/api/v1/periods/:periodId/verify` | ✔ | Verification check for a period |
| `GET` | `/api/v1/periods/:periodId/verification-certificate` | ✔ | Verification certificate |
| `GET` | `/api/verify/:certId` | — | Public certificate verification |

---

## Partner, Integrations & Billing

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET`/`PUT` | `/api/v1/partner/brand` | ✔ | White-label branding |
| `GET` | `/api/v1/partner/workspaces` | ✔ | Advisory client workspaces |
| `POST` | `/api/v1/partner/request-data` | ✔ | Request data from a client org |
| `GET`/`POST` | `/api/v1/integrations/connections` | ✔ | Accounting-tool connections |
| `GET` | `/api/v1/integrations/pending` | ✔ | Pending sync transactions |
| `POST` | `/api/v1/integrations/sync` | ✔ | Sync transactions from an integration |
| `POST` | `/api/v1/integrations/confirm/:transactionId` | ✔ | Confirm a mapped transaction |
| `POST` | `/api/v1/integrations/adjust/:transactionId` | ✔ | Adjust a mapped transaction |
| `GET` | `/api/v1/billing/subscription/:orgId` | ✔ | Subscription state |
| `POST` | `/api/v1/billing/update-subscription` | ✔ | Change plan |
| `POST` | `/api/v1/billing/toggle-addon` | ✔ | Toggle add-ons |
| `POST` | `/api/v1/billing/checkout` | ✔ | Create a checkout session |
| `POST` | `/api/v1/api-keys` | ✔ | Create API key |
| `GET` | `/api/v1/api-keys` | ✔ | List API keys |
| `PUT` | `/api/v1/api-keys/:keyId` | ✔ | Update API key |
| `POST` | `/api/v1/api-keys/:keyId/revoke` | ✔ | Revoke API key |
| `POST` | `/api/v1/external/activity` | ✔ | Ingest activity from external tools |

---

## Public & Engagement Routes

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/contact` | — | Contact form (rate-limited, Firestore-first) |
| `POST` | `/api/v1/leads` | — | Lead capture (rate-limited) |
| `GET` | `/api/v1/roadmap` | — | Public roadmap |
| `POST` | `/api/v1/roadmap/:id/upvote` | — | Upvote a roadmap item |
| `POST` | `/api/v1/feedback` | ✔ | Submit feedback |
| `GET` | `/api/v1/supplier-share` | ✔ | List supplier share links |
| `POST` | `/api/v1/supplier-share` | ✔ | Create a share link |
| `GET` | `/api/v1/supplier-share/:token` | — | Public supplier data portal |
| `GET`/`POST` | `/api/partner-firms` | ✔ | Partner firm registry |
| `GET` | `/api/bounties` | — | Open bounties |
| `POST` | `/api/bounties/:id/claim` | — | Claim a bounty |
| `GET` | `/api/hall-of-fame` | — | Community hall of fame |
| `POST` | `/api/playbook-lead` | — | Playbook lead capture |

---

## Admin & Governance

| Method | Path | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/auditor/sign-off` | ✔ | Auditor sign-off records |
| `GET` | `/api/audit-logs` | ✔ | Audit log export |
| `GET` | `/api/reports/csv` | ✔ | CSV report export |
| `POST` | `/api/v1/privacy/purge-org-data` | ✔ | GDPR data deletion |
| `GET` | `/api/v1/privacy/compliance-export/:orgId` | ✔ | GDPR compliance export |
| `GET`/`POST` | `/api/v1/governance/factor-contributions` | ✔ | Factor contribution registry |
| `POST` | `/api/v1/governance/factor-contributions/:id/review` | ✔ | Review a contribution |
| `GET`/`PUT` | `/api/v1/sso/config` | ✔ | SSO configuration |
| `GET` | `/api/v1/telemetry/config` | — | Telemetry opt-in config |
| `POST` | `/api/v1/telemetry/ping` | — | Anonymous usage ping |
| `GET` | `/api/v1/disaster-recovery/test-results` | ✔ | DR test results |
| `POST` | `/api/v1/disaster-recovery/test-restore` | ✔ | DR restore test |
| `GET`/`POST` | `/api/v1/annotations` | ✔ | Annotations |
| `PUT` | `/api/v1/annotations/:id/toggle` | ✔ | Resolve/toggle an annotation |
