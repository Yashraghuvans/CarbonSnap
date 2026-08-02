# CarbonSnap Feature Inventory

Every user-facing flow, its FSD layer, and its location. Features follow the
`api → hook → ui` data flow; most live in `src/features/<feature>/` with the
UI in the feature folder root and (when extracted) `hooks.ts`/`api.ts`.

---

## Authentication

| Feature | Layer | Files |
| :--- | :--- | :--- |
| Sign in / sign up (email/password) | features/auth + pages/auth | `features/auth/AuthContext.tsx`, `pages/auth/AuthPage.tsx` |
| Google sign-in (popup) | features/auth | `features/auth/AuthContext.tsx` |
| Password reset | features/auth | `features/auth/AuthContext.tsx` |
| Workspace auto-provisioning on first sign-in | features/auth | `features/auth/AuthContext.tsx` (buildDefaultWorkspace + persistWorkspace) |

## Core carbon accounting

| Feature | Layer | Files |
| :--- | :--- | :--- |
| Dashboard overview | widgets | `widgets/dashboard/DashboardView.tsx` |
| Activity ledger (CRUD) | features/activities | `features/activities/ActivityLogView.tsx` |
| CSV bulk import | features/activities | `features/activities/BulkImportModal.tsx` |
| Emission factor explorer | features/factors | `features/factors/EmissionFactorsView.tsx` |
| Factor pack contributions | features/factors | `features/factors/FactorPackContributionView.tsx` |
| Footprint estimator | features/estimator | `features/estimator/EstimatorView.tsx` |
| Analytics & YoY | features/analytics | `features/analytics/AnalyticsView.tsx` |
| GHG report generation | features/reports | `features/reports/ReportsView.tsx` |
| Verification certificate | features/reports | `features/reports/VerificationCertificateView.tsx`, `PublicVerificationModal.tsx` |
| Org profile & periods | features/org | `features/org/OrganisationModal.tsx`, `PeriodModal.tsx` |

## Partner, integrations & supply chain

| Feature | Layer | Files |
| :--- | :--- | :--- |
| Financial integrations (Xero/QuickBooks) | features/integrations | `features/integrations/FinancialIntegrationsView.tsx` |
| Partner (white-label advisory) dashboard | features/partner | `features/partner/PartnerDashboardView.tsx` |
| Partner program landing | features/partner | `features/partner/PartnerLandingView.tsx` |
| Supplier share portal (public) | features/supply-chain | `features/supply-chain/SupplierSharePortal.tsx` |
| Billing & SaaS tiers | features/billing | `features/billing/BillingPortalView.tsx` |

## Governance & engagement

| Feature | Layer | Files |
| :--- | :--- | :--- |
| Enterprise admin (SSO, API keys, DR) | features/governance | `features/governance/EnterpriseAdminView.tsx` |
| Auditor review portal | features/governance | `features/governance/AuditorPortalView.tsx` |
| Roadmap & feedback | features/feedback | `features/feedback/RoadmapFeedbackView.tsx` |
| In-app documentation | features/cms | `features/cms/DocumentationView.tsx` |
| Launch & press hub | features/cms | `features/cms/LaunchArticlesView.tsx`, `LaunchCopyModal.tsx` |
| License view | features/license | `features/license/LicenseView.tsx` |

## Shell & public marketing

| Concern | Layer | Files |
| :--- | :--- | :--- |
| App shell + routing | app | `app/App.tsx`, `app/main.tsx` |
| Landing page | pages | `pages/landing/LandingPage.tsx` |
| Landing marketing sections | widgets | `widgets/landing/LandingView.tsx` |
| Sidebar navigation | widgets | `widgets/navbar/Navbar.tsx` |
| Legal modal | widgets | `widgets/legal/LegalModal.tsx` |
| Share portal page | pages | `pages/share/SharePortalPage.tsx` |

## Shared (api → hook → ui foundations)

| Concern | Layer | Files |
| :--- | :--- | :--- |
| HTTP client (all endpoints) | shared/api | `shared/api/client.ts` |
| Firebase init | shared/api | `shared/api/firebase.ts` |
| Firestore helpers | shared/api | `shared/api/firestore.ts` |
| Domain types | shared/model | `shared/model/types.ts` |
| Workspace hook | shared/hooks | `shared/hooks/useWorkspace.ts` |
| Inventory hook | shared/hooks | `shared/hooks/useInventory.ts` |
| Translations (en/de) | shared/i18n | `shared/i18n/translations.ts` |
| Domain API slices | entities | `entities/organisation/api.ts`, `entities/activity/api.ts`, `entities/factor/api.ts` |

## Backend (server slice)

| Concern | Layer | Files |
| :--- | :--- | :--- |
| Express API + auth middleware + rate limits | backend | `server.ts` |
| Ledger store | backend | `src/server/store.ts` |
| Calculation engine | backend | `src/server/calculationEngine.ts` |
