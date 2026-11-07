/**
 * CarbonSnap — client.ts
 * FSD: shared layer — HTTP API client (api level of ui→hook→api)
 * authedFetch + token handling and every REST endpoint wrapper for /api/v1.
 */
import { firebaseAuth } from './firebase';
import { submitContactInquiryToFirestore } from './firestore';
import {
  ActivityEntry,
  ActivityFormData,
  AuditLog,
  EmissionFactor,
  EmissionFactorDataset,
  EmissionsSummary,
  IntegrationConnection,
  Organisation,
  PartnerBrand,
  PendingFinancialTransaction,
  ReportingPeriod,
  User,
  UserRole
} from '../model/types';

// -------------------------------------------------------------
// Authenticated fetch helper
// Attaches the current Firebase ID token to every request so the
// API server can verify the caller before serving data.
// -------------------------------------------------------------
let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser) return null;
  if (!cachedToken) {
    cachedToken = await currentUser.getIdToken();
  }
  return cachedToken;
}

export function clearCachedToken(): void {
  cachedToken = null;
}

export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

export async function fetchOrganisations(): Promise<Organisation[]> {
  const res = await authedFetch('/api/v1/organisations');
  if (!res.ok) throw new Error('Failed to fetch organisations');
  return res.json();
}

export async function createOrganisation(data: Partial<Organisation>): Promise<Organisation> {
  const res = await authedFetch('/api/v1/organisations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create organisation');
  return res.json();
}

export async function updateOrganisation(id: string, updates: Partial<Organisation>): Promise<Organisation> {
  const res = await authedFetch(`/api/v1/organisations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update organisation');
  return res.json();
}

export async function fetchReportingPeriods(orgId: string): Promise<ReportingPeriod[]> {
  const res = await authedFetch(`/api/v1/reporting-periods?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch reporting periods');
  return res.json();
}

export async function createReportingPeriod(data: Partial<ReportingPeriod>): Promise<ReportingPeriod> {
  const res = await authedFetch('/api/v1/reporting-periods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create reporting period');
  return res.json();
}

export async function updateReportingPeriod(id: string, updates: Partial<ReportingPeriod>): Promise<ReportingPeriod> {
  const res = await authedFetch(`/api/v1/reporting-periods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update reporting period');
  return res.json();
}

export async function fetchEmissionFactorDatasets(): Promise<EmissionFactorDataset[]> {
  const res = await authedFetch('/api/v1/emission-factors/datasets');
  if (!res.ok) throw new Error('Failed to fetch emission factor datasets');
  return res.json();
}

export async function fetchEmissionFactors(datasetKey = 'UK_2024'): Promise<EmissionFactor[]> {
  const res = await authedFetch(`/api/v1/emission-factors?dataset=${datasetKey}`);
  if (!res.ok) throw new Error('Failed to fetch emission factors');
  return res.json();
}

export async function fetchActivities(orgId: string, periodId?: string): Promise<ActivityEntry[]> {
  const url = periodId
    ? `/api/v1/activities?orgId=${orgId}&periodId=${periodId}`
    : `/api/v1/activities?orgId=${orgId}`;
  const res = await authedFetch(url);
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

export async function createActivity(orgId: string, data: ActivityFormData): Promise<ActivityEntry> {
  const res = await authedFetch('/api/v1/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, orgId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create activity');
  }
  return res.json();
}

export async function updateActivity(id: string, updates: Partial<ActivityEntry>): Promise<ActivityEntry> {
  const res = await authedFetch(`/api/v1/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update activity');
  return res.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await authedFetch(`/api/v1/activities/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete activity');
}

export async function fetchSummary(orgId: string, periodId: string): Promise<EmissionsSummary> {
  const res = await authedFetch(`/api/v1/summary?orgId=${orgId}&periodId=${periodId}`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await authedFetch('/api/audit-logs');
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function importActivitiesCsv(
  periodId: string,
  orgId: string,
  csvText: string
): Promise<{
  success: boolean;
  importedCount?: number;
  totalCo2eKg?: number;
  entries?: ActivityEntry[];
  errors?: Array<{ row: number; message: string }>;
}> {
  const res = await authedFetch(`/api/v1/periods/${periodId}/import?orgId=${orgId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvText, orgId })
  });
  const data = await res.json();
  if (!res.ok && !data.errors) {
    throw new Error(data.error || 'Bulk CSV import failed');
  }
  return data;
}

export async function fetchPeriodComparison(orgId: string): Promise<{
  orgId: string;
  orgName: string;
  periods: Array<{
    periodId: string;
    periodName: string;
    startDate: string;
    endDate: string;
    status: string;
    isBaseline: boolean;
    scope1_kg: number;
    scope2_kg: number;
    scope3_kg: number;
    total_kg: number;
    scope1_tonnes: number;
    scope2_tonnes: number;
    scope3_tonnes: number;
    total_tonnes: number;
    intensityPerEmployee_kg: number;
    intensityPerRevenue_kgPer1k: number;
    activityCount: number;
  }>;
  hotspot: {
    category: string;
    co2e_kg: number;
    co2e_tonnes: number;
    percentage: number;
    message: string;
  };
  yoyChangePercent: number | null;
}> {
  const res = await authedFetch(`/api/v1/periods/compare?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch period comparison');
  return res.json();
}

// --- Phase 3: User & RBAC API ---
export async function fetchUser(): Promise<User> {
  const res = await authedFetch('/api/v1/user');
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUserRole(role: UserRole): Promise<User> {
  const res = await authedFetch('/api/v1/user/role', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error('Failed to update user role');
  return res.json();
}

export async function switchUserWorkspace(orgId: string): Promise<User> {
  const res = await authedFetch('/api/v1/user/switch-workspace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId })
  });
  if (!res.ok) throw new Error('Failed to switch workspace');
  return res.json();
}

// --- Phase 3: Partner Brand & Workspaces API ---
export async function fetchPartnerBrand(): Promise<PartnerBrand> {
  const res = await authedFetch('/api/v1/partner/brand');
  if (!res.ok) throw new Error('Failed to fetch partner brand');
  return res.json();
}

export async function updatePartnerBrand(updates: Partial<PartnerBrand>): Promise<PartnerBrand> {
  const res = await authedFetch('/api/v1/partner/brand', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update partner brand');
  return res.json();
}

export async function fetchPartnerWorkspaces(): Promise<Array<{
  orgId: string;
  orgName: string;
  country: string;
  industrySector: string;
  employeeCount: number;
  annualRevenueGbp: number;
  activePeriodName: string;
  periodStatus: string;
  totalFootprintTonnes: number;
  intensityPerEmployee_kg: number;
  activityCount: number;
  lastUpdated: string;
}>> {
  const res = await authedFetch('/api/v1/partner/workspaces');
  if (!res.ok) throw new Error('Failed to fetch partner workspaces');
  return res.json();
}

// --- Phase 3: Financial Connector Engine API ---
export async function fetchIntegrationConnections(orgId: string): Promise<IntegrationConnection[]> {
  const res = await authedFetch(`/api/v1/integrations/connections?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch integration connections');
  return res.json();
}

export async function fetchPendingTransactions(orgId: string): Promise<PendingFinancialTransaction[]> {
  const res = await authedFetch(`/api/v1/integrations/pending?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch pending transactions');
  return res.json();
}

export async function syncFinancialTransactions(orgId: string): Promise<PendingFinancialTransaction[]> {
  const res = await authedFetch(`/api/v1/integrations/sync?orgId=${orgId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to sync financial transactions');
  return res.json();
}

export async function confirmFinancialTransaction(transactionId: string, periodId: string): Promise<ActivityEntry> {
  const res = await authedFetch(`/api/v1/integrations/confirm/${transactionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodId })
  });
  if (!res.ok) throw new Error('Failed to confirm transaction');
  return res.json();
}

export async function adjustAndConfirmTransaction(
  transactionId: string,
  periodId: string,
  adjustments: {
    activityType?: string;
    factorId?: string;
    quantity?: number;
    description?: string;
  }
): Promise<ActivityEntry> {
  const res = await authedFetch(`/api/v1/integrations/adjust/${transactionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodId, ...adjustments })
  });
  if (!res.ok) throw new Error('Failed to adjust and confirm transaction');
  return res.json();
}

// --- Phase 4: Public Enterprise API, Pipeline & Health API ---
export async function fetchApiKeys(orgId: string) {
  const res = await authedFetch(`/api/v1/api-keys?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch API keys');
  return res.json();
}

export async function createApiKey(orgId: string, name: string) {
  const res = await authedFetch('/api/v1/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, name })
  });
  if (!res.ok) throw new Error('Failed to create API key');
  return res.json();
}

export async function revokeApiKey(keyId: string) {
  const res = await authedFetch(`/api/v1/api-keys/${keyId}/revoke`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to revoke API key');
  return res.json();
}

export async function fetchDatasetVersions() {
  const res = await authedFetch('/api/v1/emission-factors/versions');
  if (!res.ok) throw new Error('Failed to fetch factor dataset versions');
  return res.json();
}

export async function triggerPipelineUpdate(datasetKey: string) {
  const res = await authedFetch('/api/v1/emission-factors/pipeline-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasetKey })
  });
  if (!res.ok) throw new Error('Failed to update factor pipeline');
  return res.json();
}

export async function fetchHealthStatus() {
  const res = await authedFetch('/api/v1/health');
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

// --- Phase 5: Supplier Sharing, Verification, Estimator & Community Packs ---
export async function createSupplierShareLink(orgId: string, periodId: string, shareName: string) {
  const res = await authedFetch('/api/v1/supplier-share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, periodId, shareName })
  });
  if (!res.ok) throw new Error('Failed to create supplier share link');
  return res.json();
}

export async function fetchSupplierShareLinks(orgId: string) {
  const res = await authedFetch(`/api/v1/supplier-share?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch supplier share links');
  return res.json();
}

export async function fetchSupplierShareData(token: string) {
  const res = await authedFetch(`/api/v1/supplier-share/${token}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to load supplier share portal data');
  }
  return res.json();
}

export async function togglePeriodVerification(periodId: string, verifierName?: string) {
  const res = await authedFetch(`/api/v1/periods/${periodId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verifierName })
  });
  if (!res.ok) throw new Error('Failed to toggle report verification');
  return res.json();
}

export async function calculatePublicEstimate(input: {
  electricityKwh: number;
  gasKwh: number;
  dieselLitres: number;
  petrolLitres: number;
  flightKm: number;
}) {
  const res = await authedFetch('/api/v1/public/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Failed to calculate public estimate');
  return res.json();
}

export async function fetchCommunityFactorPacks() {
  const res = await authedFetch('/api/v1/emission-factors/community');
  if (!res.ok) throw new Error('Failed to fetch community factor packs');
  return res.json();
}

export async function submitCommunityFactorPack(data: any) {
  const res = await authedFetch('/api/v1/emission-factors/community-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to submit factor pack');
  }
  return res.json();
}

export async function sendPartnerDataRequest(partnerId: string, clientEmail: string, clientName: string) {
  const res = await authedFetch('/api/v1/partner/request-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partnerId, clientEmail, clientName })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send data request');
  }
  return res.json();
}

export async function validateFactorPack(data: any) {
  const res = await authedFetch('/api/v1/emission-factors/validate-pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to validate factor pack');
  }
  return res.json();
}

export async function signAuditorVerification(periodId: string, payload: {
  auditorName?: string;
  auditorFirm?: string;
  auditorCertNumber?: string;
  auditNotes?: string;
}) {
  const res = await authedFetch('/api/v1/auditor/sign-off', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodId, ...payload })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed auditor verification sign-off');
  }
  return res.json();
}

export async function fetchVerificationCertificate(certId: string) {
  const res = await authedFetch(`/api/v1/verify/${certId}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to load verification certificate');
  }
  return res.json();
}

export async function fetchPeriodVerificationCertificate(periodId: string) {
  const res = await authedFetch(`/api/v1/periods/${periodId}/verification-certificate`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

// --- Phase 7 API Client Functions ---

export async function fetchBillingSubscription(orgId: string) {
  const res = await authedFetch(`/api/v1/billing/subscription/${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch billing subscription');
  return res.json();
}

export async function updateBillingTier(orgId: string, tier: string) {
  const res = await authedFetch('/api/v1/billing/update-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, tier })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update billing subscription');
  }
  return res.json();
}

export async function toggleAccountingAddon(orgId: string, active: boolean) {
  const res = await authedFetch('/api/v1/billing/toggle-addon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, active })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to toggle accounting add-on');
  }
  return res.json();
}

export async function createBillingCheckoutSession(orgId: string, tier: string) {
  const res = await authedFetch('/api/v1/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, tier, successUrl: window.location.origin })
  });
  if (!res.ok) throw new Error('Failed to initiate checkout session');
  return res.json();
}

export async function captureEstimatorLead(payload: {
  email: string;
  companyName?: string;
  indicativeTotalTonnes: number;
  source?: string;
}) {
  const res = await authedFetch('/api/v1/leads/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to capture lead');
  }
  return res.json();
}

export async function fetchLeads() {
  const res = await authedFetch('/api/v1/leads');
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchRoadmapItems() {
  const res = await authedFetch('/api/v1/roadmap');
  if (!res.ok) throw new Error('Failed to fetch roadmap items');
  return res.json();
}

export async function upvoteRoadmapItem(id: string) {
  const res = await authedFetch(`/api/v1/roadmap/${id}/upvote`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to upvote roadmap item');
  return res.json();
}

export async function submitFeedback(payload: {
  userEmail?: string;
  category: string;
  message: string;
}) {
  const res = await authedFetch('/api/v1/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit feedback');
  }
  return res.json();
}

export async function fetchFeedbackReports() {
  const res = await authedFetch('/api/v1/feedback');
  if (!res.ok) throw new Error('Failed to fetch feedback reports');
  return res.json();
}

export async function fetchSsoConfig(orgId: string) {
  const res = await authedFetch(`/api/v1/sso/config/${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch SSO configuration');
  return res.json();
}

export async function updateSsoConfig(payload: any) {
  const res = await authedFetch('/api/v1/sso/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update SSO configuration');
  return res.json();
}

export async function fetchAuditBundle(periodId: string) {
  const res = await authedFetch(`/api/v1/reports/${periodId}/audit-bundle`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch audit bundle');
  }
  return res.json();
}

// --- PHASE 8 API FUNCTIONS ---

export async function fetchCsrdReport(periodId: string) {
  const res = await authedFetch(`/api/v1/reports/${periodId}/csrd`);
  if (!res.ok) throw new Error('Failed to fetch CSRD report disclosure');
  return res.json();
}

export async function fetchSecrReport(periodId: string) {
  const res = await authedFetch(`/api/v1/reports/${periodId}/secr`);
  if (!res.ok) throw new Error('Failed to fetch SECR report data');
  return res.json();
}

export async function purgeOrganisationData(orgId: string) {
  const res = await authedFetch('/api/v1/privacy/purge-org-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to purge organisation data');
  }
  return res.json();
}

export async function fetchComplianceExport(orgId: string) {
  const res = await authedFetch(`/api/v1/privacy/compliance-export/${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch GDPR compliance export package');
  return res.json();
}

export async function fetchFactorContributions() {
  const res = await authedFetch('/api/v1/governance/factor-contributions');
  if (!res.ok) throw new Error('Failed to fetch community factor contributions');
  return res.json();
}

export async function submitFactorContribution(payload: any) {
  const res = await authedFetch('/api/v1/governance/factor-contributions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit factor contribution');
  }
  return res.json();
}

export async function reviewFactorContribution(id: string, payload: { reviewerName: string; comment: string; approved: boolean }) {
  const res = await authedFetch(`/api/v1/governance/factor-contributions/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to review factor contribution');
  return res.json();
}

export async function fetchTelemetryConfig() {
  const res = await authedFetch('/api/v1/telemetry/config');
  if (!res.ok) throw new Error('Failed to fetch telemetry config');
  return res.json();
}

export async function updateTelemetryConfig(optIn: boolean) {
  const res = await authedFetch('/api/v1/telemetry/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optIn })
  });
  if (!res.ok) throw new Error('Failed to update telemetry configuration');
  return res.json();
}

export async function triggerTelemetryPing() {
  const res = await authedFetch('/api/v1/telemetry/ping', { method: 'POST' });
  if (!res.ok) throw new Error('Telemetry ping failed');
  return res.json();
}

export async function fetchDrTestResults() {
  const res = await authedFetch('/api/v1/disaster-recovery/test-results');
  if (!res.ok) throw new Error('Failed to fetch disaster recovery test logs');
  return res.json();
}

export async function runDrRestoreTest() {
  const res = await authedFetch('/api/v1/disaster-recovery/test-restore', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger disaster recovery test');
  return res.json();
}

export async function fetchActivityAnnotations(orgId: string) {
  const res = await authedFetch(`/api/v1/annotations/${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch activity annotations');
  return res.json();
}

export async function createActivityAnnotation(payload: any) {
  const res = await authedFetch('/api/v1/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create activity annotation');
  return res.json();
}

export async function toggleActivityAnnotation(id: string) {
  const res = await authedFetch(`/api/v1/annotations/${id}/toggle`, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to toggle annotation status');
  return res.json();
}

// --- PHASE 9 API CLIENT HELPERS ---

export async function fetchPartnerFirms() {
  const res = await authedFetch('/api/partner-firms');
  if (!res.ok) throw new Error('Failed to fetch partner firms CRM list');
  return res.json();
}

export async function createPartnerFirm(payload: any) {
  const res = await authedFetch('/api/partner-firms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add partner firm');
  return res.json();
}

export async function updatePartnerFirm(id: string, payload: any) {
  const res = await authedFetch(`/api/partner-firms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update partner firm');
  return res.json();
}

export async function fetchFactorBounties() {
  const res = await authedFetch('/api/bounties');
  if (!res.ok) throw new Error('Failed to fetch factor bounties');
  return res.json();
}

export async function claimFactorBounty(id: string, claimantName: string) {
  const res = await authedFetch(`/api/bounties/${id}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimantName })
  });
  if (!res.ok) throw new Error('Failed to claim factor bounty');
  return res.json();
}

export async function fetchHallOfFame() {
  const res = await authedFetch('/api/hall-of-fame');
  if (!res.ok) throw new Error('Failed to fetch Hall of Fame contributors');
  return res.json();
}

export async function submitPlaybookLead(email: string, companyName?: string, estimatorTonnes?: number) {
  const res = await authedFetch('/api/playbook-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, companyName, estimatorTonnes })
  });
  if (!res.ok) throw new Error('Failed to submit playbook lead');
  return res.json();
}

export async function fetchPublicVerificationCertificate(certId: string) {
  const res = await authedFetch(`/api/verify/${certId}`);
  if (!res.ok) throw new Error('Failed to fetch public verification certificate');
  return res.json();
}

export async function fetchCaliforniaSbReport(periodId: string, orgId: string) {
  const res = await authedFetch(`/api/reports/california-sb/${periodId}?orgId=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch California SB 253/261 report');
  return res.json();
}

// --- Phase 10: Auth & Workspace Synchronisation ---
export async function syncTenantWorkspace(payload: {
  orgId: string;
  orgName: string;
  country: string;
  periodId: string;
  periodName: string;
  startDate: string;
  endDate: string;
}) {
  const res = await authedFetch('/api/v1/auth/sync-tenant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to synchronise workspace');
  }
  return res.json();
}

export async function submitContactForm(data: {
  fullName: string;
  email: string;
  organisationName?: string;
  inquiryType?: string;
  message: string;
}) {
  // Primary: persist to the Firebase 'contactInquiries' collection.
  try {
    const { inquiryId } = await submitContactInquiryToFirestore({
      fullName: data.fullName,
      email: data.email,
      organisationName: data.organisationName,
      inquiryType: data.inquiryType || 'General Inquiry',
      message: data.message
    });
    return {
      success: true,
      inquiryId,
      message: `Thank you ${data.fullName}! Your inquiry has been logged. Our ESG advisory team will contact you at ${data.email} within 24 hours.`
    };
  } catch (err) {
    console.warn('Firestore contact submission failed, falling back to server API:', err);
  }
  // Fallback: server-side inquiry log.
  const res = await authedFetch('/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send contact inquiry');
  }
  return res.json();
}



