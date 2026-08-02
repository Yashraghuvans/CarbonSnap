# CarbonSnap — Auditor-Ready Carbon Accounting for SMEs

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Compliance](https://img.shields.io/badge/Compliance-EU_CSRD_%7C_UK_SECR_%7C_GHG_Protocol-emerald)](docs/regulatory/compliance-standards.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

> **The 10-minute carbon report for SMEs.** CarbonSnap is an AGPLv3 open-source carbon accounting platform built for small and medium-sized enterprises, sustainability consultants, and corporate supply-chain leads — compliance-ready without enterprise SaaS price tags.

---

## Why CarbonSnap

Traditional ESG software is bloated, expensive, and locks your carbon data into proprietary silos. CarbonSnap is the open, auditor-transparent alternative:

| | |
| :--- | :--- |
| **⚡ 10-minute onboarding** | Guided workflows let non-specialists (ops managers, finance leads) calculate their Scope 1, 2 and 3 footprint in minutes. |
| **📊 Auditor-ready reports** | Standardized disclosures aligned with **EU CSRD (ESRS E1)**, **UK SECR**, **California SB 253** and the **GHG Protocol Corporate Standard**. |
| **🌍 Built-in conversion factors** | Official 2024 datasets from UK DESNZ/DEFRA, the US EPA GHG Emission Factors Hub and global IPCC AR6 values. |
| **🔒 100% data sovereignty** | Self-host on your own infrastructure with a single Docker command, or use the managed cloud tier. |
| **🤝 AGPLv3 open source** | Free forever for self-hosting. No arbitrary user limits, no paywalled exports. |

---

## Quick Start

### Docker (production-style, single command)

```bash
git clone https://github.com/Yashraghuvans/CarbonSnap.git
cd CarbonSnap

cp .env.example .env   # then fill in your Firebase values
docker build -t carbonsnap .
docker run -p 3000:3000 --env-file .env carbonsnap
```

Open **http://localhost:3000**.

### Local development

```bash
npm install          # or: bun install
npm run dev          # Express + Vite dev server on port 3000
```

### Verify before shipping

```bash
npm run lint         # strict TypeScript check (tsc --noEmit)
npm run build        # production bundle + server bundle
npm start            # run the production server (dist/server.cjs)
```

---

## Firebase Setup

CarbonSnap uses **Firebase Authentication** (email/password + Google) and **Firestore** for tenant data:

1. Create a Firebase project and enable **Email/Password** and **Google** sign-in providers (Authentication → Sign-in method).
2. Copy your web-app config (Project settings → Your apps → SDK setup and configuration) into `.env`.
3. Deploy the security rules once, from a machine authenticated with the Firebase CLI:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <project-id>
   ```
4. If you host on a custom domain, add it under **Authentication → Settings → Authorized domains** so Google popup sign-in keeps working.

All backend routes verify the caller's Firebase ID token — no token, no dashboard.

---

## Documentation

| Guide | Description |
| :--- | :--- |
| [User Manual](docs/guides/user-manual.md) | Step-by-step guide for SME managers: activity entry, factor matching, report generation. |
| [Admin Guide](docs/guides/admin-guide.md) | Organisations, reporting periods, roles and multi-tenant workspaces. |
| [Self-Hosting Guide](docs/guides/self-hosting.md) | Production deployment, environment variables, reverse proxy and SSL. |
| [Technical Architecture](docs/technical/architecture.md) | Stack, security model, calculation engine and data flow. |
| [API Reference](docs/technical/api-reference.md) | RESTful `/api/v1/` endpoints: activities, factors, reports, integrations. |
| [Compliance Standards](docs/regulatory/compliance-standards.md) | Deep-dive into GHG Protocol, EU CSRD, UK SECR and SB 253 alignment. |
| [Contributor Guide](docs/technical/contributor-guide.md) | Development setup, verification commands, PR criteria. |

---

## Emission Factors Library

Localized conversion-factor packs live in [`/emission-factors`](emission-factors/):

* `UK_2024.json` — UK Government DESNZ/DEFRA 2024 conversion factors
* `US_EPA_2024.json` — US EPA Center for Corporate Climate Leadership (2024)
* `GHG_GLOBAL_2024.json` — IPCC AR6 GWP values & IEA country grid factors

To add a new country pack, see the [Emission Factors documentation](emission-factors/README.md).

---

## License & Community

* **License:** [GNU Affero General Public License v3.0 (AGPLv3)](LICENSE)
* **Contributing:** See [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md)
* **Security:** Report vulnerabilities via [SECURITY.md](SECURITY.md)
* **Support:** See [SUPPORT.md](SUPPORT.md)

*Maintained by the CarbonSnap open-source sustainability community.*
