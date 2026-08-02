# Regulatory Compliance & GHG Reporting Standards

CarbonSnap is architected to align with the major global GHG accounting and disclosure frameworks. This document explains how each framework maps onto CarbonSnap's data model and reporting outputs.

---

## 1. GHG Protocol Corporate Accounting and Reporting Standard

The international baseline for corporate carbon accounting.

* **Scope 1** — direct emissions from owned sources (fuels, fleets, stationary combustion, refrigerants).
* **Scope 2** — indirect emissions from purchased energy, with **location-based** and **market-based** (green tariff) electricity factors both supported (e.g. `uk_elec_grid_2024` vs `uk_elec_green_2024`).
* **Scope 3** — value-chain emissions across the 15 standard categories (purchased goods, travel, freight, waste…).

**CarbonSnap mapping:** activity categories, the scoped ledger, and factor matching implement the standard's calculation rules; the summary engine reports totals per scope.

---

## 2. EU CSRD / ESRS E1

Mandatory climate reporting for companies in scope of the EU Corporate Sustainability Reporting Directive.

* **ESRS E1-6** requires gross Scope 1, 2 and 3 emissions, plus total emissions.
* Intensity metrics — emissions per headcount and per €/£ million revenue — are supported in report generation.
* The **audit-bundle** endpoint (`/api/v1/reports/:periodId/audit-bundle`) packages the evidence trail (activity ledger, factor versions, checksums) needed for limited and reasonable assurance.

---

## 3. UK SECR (Streamlined Energy & Carbon Reporting)

Mandatory reporting for large UK unquoted companies and LLPs.

* Annual energy use (kWh) and associated `tCO2e`.
* UK **DESNZ/DEFRA** annual conversion factors (`emission-factors/UK_2024.json`).
* Intensity ratio (`tCO2e` per £1M revenue / per headcount).

**CarbonSnap mapping:** `GET /api/v1/reports/:periodId/secr` generates the SECR disclosure; factor versions are pinned so calculations are reproducible across years.

---

## 4. California SB 253 (Climate Corporate Data Accountability Act)

US businesses with revenues over **$1B** operating in California must publicly disclose Scope 1, 2 and 3 emissions.

* Full alignment with **US EPA GHG Factors Hub** datasets (`emission-factors/US_EPA_2024.json`).
* `GET /api/reports/california-sb/:periodId` produces the SB 253-style disclosure.

---

## 5. IPCC AR6 Global Warming Potentials

All factors convert non-CO₂ gases (`CH₄`, `N₂O`, `HFCs`, `PFCs`, `SF₆`) using **IPCC Sixth Assessment Report** 100-year GWPs (`emission-factors/GHG_GLOBAL_2024.json`).

---

## Verification & audit trail

Every generated report and verification certificate carries a **SHA-256 checksum** of the underlying calculated data. Auditors can verify a certificate without an account at `/api/verify/:certId`, and pull the full evidence bundle for assurance engagements.
