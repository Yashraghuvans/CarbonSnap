# User Manual

Welcome to CarbonSnap! This guide is for SME operations managers, sustainability officers, finance leads and auditors. It walks you through calculating, tracking and reporting your organisation's greenhouse gas (GHG) emissions.

---

## 1. Sign in & onboarding

1. Open CarbonSnap and choose **Sign In**, **Create Account**, or **Continue with Google**.
2. On first sign-up you'll be asked for your name, email and organisation name — CarbonSnap auto-creates your workspace with a default reporting period for the current financial year.
3. Review **Organisation Settings** (name, sector, headcount) and the **Reporting Period** dates; adjust if your fiscal year differs.

---

## 2. The activity ledger

CarbonSnap splits emissions into the three GHG Protocol scopes:

* **Scope 1 — Direct:** facility natural gas, company fleet diesel/petrol, stationary generators.
* **Scope 2 — Indirect energy:** purchased grid electricity (location-based or market-based/green tariff).
* **Scope 3 — Value chain:** business travel (flights, trains, taxis), freight, purchased goods & services, waste.

### Manual entry

1. Go to **Activity Ledger** → **Add Activity**.
2. Choose a category (e.g. `Electricity`, `Diesel`, `Air Travel`).
3. Enter the amount and unit (e.g. `12,500 kWh`, `450 Litres`, `2,400 Passenger-km`).
4. Pick the factor dataset (`UK 2024`, `US EPA 2024`, `Global`) — or let CarbonSnap auto-match.
5. **Save.** CarbonSnap immediately computes the `tCO2e` for the activity.

---

## 3. CSV bulk upload

If your data lives in spreadsheets or accounting tools (Xero, QuickBooks, SAP):

1. Go to **Activity Ledger** → **Bulk CSV Import**.
2. Download the standard CSV template.
3. Map your columns to `date`, `category`, `amount`, `unit`, `notes`.
4. Upload. CarbonSnap validates rows, matches emission factors, and flags unmapped items for review.

---

## 4. Footprint summary & comparison

* The **Summary** view shows your total `tCO2e` broken down by scope and activity.
* **Compare** two periods (e.g. FY2024 vs FY2025) to track year-on-year reduction progress.

---

## 5. Auditor-ready reports

1. Open **GHG Reports**.
2. Pick the reporting period and framework — **EU CSRD / ESRS E1**, **UK SECR**, **California SB 253**, or **GHG Protocol**.
3. Review the scope breakdown, then **Download** the official PDF report.

Every report carries a **SHA-256 verification checksum**; auditors can verify authenticity via the public verification link on each certificate.
