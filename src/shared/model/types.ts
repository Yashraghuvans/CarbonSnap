/**
 * CarbonSnap — types.ts
 * FSD: shared layer — canonical domain types
 * Organisation, ReportingPeriod, ActivityEntry, EmissionFactor, EmissionsSummary and friends.
 */
export type ScopeType = 1 | 2 | 3;

export type UserRole = 'Admin' | 'Contributor' | 'Auditor';

export type PersonaType = 'SAM_SME_OPS' | 'PRIYA_ACCOUNTANT' | 'EMMA_CONSULTANT' | 'DEFAULT_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisationIds: string[];
  activeOrgId: string;
}

export interface Organisation {
  id: string;
  name: string;
  country: string;
  logoUrl?: string;
  industrySector: string;
  employeeCount: number;
  annualRevenueGbp: number;
  license: string;
  partnerId?: string;
  createdAt: string;
}

export interface PartnerBrand {
  id: string;
  partnerName: string;
  logoUrl?: string;
  primaryColor: string; // e.g. '#0f172a' or '#166534'
  contactEmail: string;
  managedOrgIds: string[];
  customDomains?: string[]; // e.g. ['carbon.partnerfirm.com']
}

export interface IntegrationConnection {
  id: string;
  orgId: string;
  provider: 'Xero' | 'QuickBooks' | 'Sage' | 'SAP';
  status: 'CONNECTED' | 'DISCONNECTED';
  lastSyncedAt: string;
  accountName: string;
}

export interface PendingFinancialTransaction {
  id: string;
  orgId: string;
  provider: 'Xero' | 'QuickBooks' | 'Sage' | 'SAP';
  transactionDate: string;
  vendorName: string;
  accountCode: string;
  amountGbp: number;
  description: string;
  suggestedActivityType: string;
  suggestedFactorId: string;
  suggestedQuantity: number;
  suggestedUnit: string;
  confidenceScore: number; // 0 - 100%
  status: 'PENDING' | 'CONFIRMED' | 'IGNORED';
}

export interface ReportingPeriod {
  id: string;
  orgId: string;
  name: string; // e.g., 'FY 2024-2025' or 'Q1 2024'
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  isBaseline: boolean;
  notes?: string;
  is_verified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface EmissionFactor {
  id: string;
  category: string;
  name: string;
  scope: ScopeType;
  unit: string;
  factorValue: number; // kg CO2e per unit
  datasetSource: string;
  description: string;
}

export interface EmissionFactorDataset {
  dataset: string;
  name: string;
  year: number;
  country: string;
  description: string;
  factors: EmissionFactor[];
}

export interface ActivityEntry {
  id: string;
  orgId: string;
  periodId: string;
  activityType: string; // e.g. 'Electricity', 'Natural Gas', 'Company Vehicle Petrol', 'Business Travel'
  description: string;
  quantity: number;
  unit: string;
  sourceScope: ScopeType;
  factorId: string;
  factorName: string;
  factorValue: number; // Snapshot of factor value at entry creation
  co2e_kg: number;     // Calculated: quantity * factorValue (Denormalized snapshot)
  date: string;
  facilityLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFormData {
  periodId: string;
  activityType: string;
  description: string;
  quantity: number;
  unit?: string;
  factorId: string;
  factorValue?: number;
  factorName?: string;
  sourceScope?: ScopeType;
  date: string;
  facilityLocation?: string;
  notes?: string;
}

export interface HotspotItem {
  rank: number;
  category: string;
  scope: ScopeType;
  co2e_kg: number;
  co2e_tonnes: number;
  percentage: number;
  recommendation: string;
}

export interface EmissionsSummary {
  orgId: string;
  periodId: string;
  periodName: string;
  scope1_kg: number;
  scope2_kg: number;
  scope3_kg: number;
  total_kg: number;
  total_tonnes: number;
  scope1_percent: number;
  scope2_percent: number;
  scope3_percent: number;
  intensityPerEmployee_kg: number;
  intensityPerRevenue_kgPer1k: number;
  activityCount: number;
  byCategory: Array<{
    category: string;
    scope: ScopeType;
    co2e_kg: number;
    co2e_tonnes: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    scope1_kg: number;
    scope2_kg: number;
    scope3_kg: number;
    total_kg: number;
  }>;
  hotspots: HotspotItem[];
}

export interface ApiKey {
  id: string;
  orgId: string;
  name: string;
  keyPrefix: string;
  fullKey?: string; // Only shown when freshly created
  createdAt: string;
  lastUsedAt?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface DatasetVersion {
  id: string;
  datasetKey: string; // e.g. 'UK_2024'
  datasetName: string;
  version: string;
  totalFactors: number;
  updatedAt: string;
  status: 'CURRENT' | 'ARCHIVED';
}

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  uptimeSeconds: number;
  database: {
    connected: boolean;
    engine: string;
    latencyMs: number;
    recordsCount: number;
  };
  storage: {
    status: string;
    freeSpaceMb: number;
  };
  telemetry: {
    enabled: boolean;
    instanceId: string;
    totalReportsGenerated: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
}

export interface LicenseInfo {
  name: string;
  identifier: string;
  url: string;
  isAGPLv3: boolean;
  termsSummary: string;
}

export interface SupplierShareLink {
  id: string;
  token: string;
  orgId: string;
  periodId: string;
  shareName: string;
  createdAt: string;
  accessCount: number;
  isVerifiedOnly: boolean;
}

export interface CommunityFactorPack {
  id: string;
  country: string;
  countryCode: string;
  datasetKey: string;
  datasetName: string;
  year: number;
  submittedBy: string;
  status: 'APPROVED' | 'PENDING_REVIEW';
  submittedAt: string;
  factorCount: number;
}

export interface EstimatorInput {
  electricityKwh: number;
  gasKwh: number;
  dieselLitres: number;
  petrolLitres: number;
  flightKm: number;
}

export interface EstimatorResult {
  indicativeScope1Kg: number;
  indicativeScope2Kg: number;
  indicativeScope3Kg: number;
  indicativeTotalKg: number;
  indicativeTotalTonnes: number;
  treesOffsetRequired: number;
  benchmarkComparisonPercent: number;
}

export interface PartnerDataRequest {
  id: string;
  partnerId: string;
  clientEmail: string;
  clientName: string;
  status: 'SENT' | 'ACCEPTED' | 'COMPLETED';
  requestUrl: string;
  createdAt: string;
}

export interface VerificationCertificate {
  certId: string;
  orgId: string;
  orgName: string;
  periodId: string;
  periodName: string;
  verifiedAt: string;
  auditorName: string;
  auditorFirm: string;
  auditorCertNumber: string;
  auditNotes: string;
  digitalSignatureHash: string;
  publicVerifyUrl: string;
  totalEmissionsTonnes: number;
  scope1Tonnes: number;
  scope2Tonnes: number;
  scope3Tonnes: number;
  status: 'VALID' | 'REVOKED';
}

export interface FactorPackValidationResult {
  valid: boolean;
  complianceScore: number;
  errors: string[];
  warnings: string[];
  bountyEligible: boolean;
  validatedFactorCount: number;
}

export interface LaunchArticle {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTimeMinutes: number;
  author: string;
  publishedAt: string;
  summary: string;
  content: string[];
  ctaText?: string;
  ctaAction?: string;
}

export type SubscriptionTier = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface BillingInvoice {
  id: string;
  amountUsd: number;
  date: string;
  pdfUrl: string;
  status: 'PAID' | 'PENDING';
  periodName: string;
}

export interface BillingSubscription {
  orgId: string;
  tier: SubscriptionTier;
  monthlyPriceUsd: number;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  accountingAddonActive: boolean;
  accountingAddonPriceUsd: number;
  nextBillingDate: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  invoices: BillingInvoice[];
}

export interface LeadCapture {
  id: string;
  email: string;
  companyName: string;
  indicativeTotalTonnes: number;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  capturedAt: string;
  emailSent: boolean;
  convertToken: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  upvotes: number;
  githubIssueUrl: string;
}

export interface FeedbackReport {
  id: string;
  userEmail: string;
  category: 'BUG' | 'FEATURE_REQUEST' | 'GENERAL';
  message: string;
  submittedAt: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface SsoConfig {
  orgId: string;
  provider: 'OKTA' | 'AZURE_AD' | 'GOOGLE_WORKSPACE';
  domain: string;
  entityId: string;
  ssoUrl: string;
  enabled: boolean;
  lastSyncedAt: string;
}

// --- PHASE 8 TYPES: Regulatory Specialisation, GDPR & Governance ---

export type ReportingFramework = 'GHG_PROTOCOL' | 'EU_CSRD' | 'UK_SECR' | 'US_CALIFORNIA_SB';

export interface CsrdDisclosure {
  governanceNarrative: string;
  doubleMaterialityAssessment: {
    impactMateriality: 'HIGH' | 'MEDIUM' | 'LOW';
    financialMateriality: 'HIGH' | 'MEDIUM' | 'LOW';
    keyTopics: string[];
  };
  climateTransitionPlan: string;
  physicalRisks: string;
  transitionalRisks: string;
  esrsE1Targets: {
    targetYear: number;
    reductionPercentage: number;
    baseYear: number;
  };
}

export interface SecrData {
  ukEnergyConsumptionKwh: {
    electricityKwh: number;
    gasKwh: number;
    transportKwh: number;
    totalKwh: number;
  };
  scope1TonnesCo2e: number;
  scope2TonnesCo2e: number;
  scope3TonnesCo2e?: number;
  totalTonnesCo2e: number;
  intensityRatio: {
    metric: string;
    value: number;
  };
  energyEfficiencyActionsTaken: string;
  calculationMethodology: string;
}

export interface FactorContribution {
  id: string;
  datasetName: string;
  countryRegion: string;
  contributorName: string;
  contributorEmail: string;
  dcoSigned: boolean;
  dcoSignature: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviews: {
    reviewerName: string;
    comment: string;
    approved: boolean;
    date: string;
  }[];
  factorDataJson: string;
  submittedAt: string;
  factorsCount: number;
}

export interface TelemetryConfig {
  optIn: boolean;
  lastPingAt?: string;
  totalReportsGenerated: number;
  systemVersion: string;
  instanceId: string;
}

export interface DrRestoreTestResult {
  id: string;
  testedAt: string;
  backupSource: string;
  restoredSuccessfully: boolean;
  durationMs: number;
  recordsVerifiedCount: number;
  statusMessage: string;
}

export type UserPersona = 'STANDARD' | 'SAM_OPS' | 'PRIYA_ACCOUNTANT' | 'EMMA_CONSULTANT';

export interface ActivityAnnotation {
  id: string;
  activityId: string;
  orgId: string;
  authorName: string;
  authorRole: 'CONSULTANT' | 'AUDITOR' | 'CLIENT';
  note: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface PartnerFirm {
  id: string;
  name: string;
  type: 'ACCOUNTING_FIRM' | 'SUSTAINABILITY_CONSULTANCY' | 'ADVISORY';
  contactName: string;
  contactEmail: string;
  clientWorkspacesCount: number;
  whiteLabelTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'PROSPECT' | 'RECRUITED' | 'ACTIVE_PARTNER';
  joinedAt: string;
}

export interface FactorBounty {
  id: string;
  countryCode: string;
  countryName: string;
  region: string;
  priority: 'HIGH' | 'MEDIUM' | 'URGENT';
  rewardBountyUsd: number;
  status: 'OPEN' | 'IN_CLAIM' | 'COMPLETED';
  claimedBy?: string;
  targetRegistry: string;
}

export interface HallOfFameContributor {
  id: string;
  name: string;
  organization?: string;
  country: string;
  contributionsCount: number;
  totalFactorsAdded: number;
  badges: string[];
  verifiedAt: string;
}

export interface CaliforniaSbReport {
  sb253Disclosure: {
    entityName: string;
    fiscalYear: string;
    scope1EmissionsMt: number;
    scope2EmissionsMt: number;
    scope3EmissionsMt: number;
    totalEmissionsMt: number;
    assuranceLevel: 'LIMITED_ASSURANCE' | 'REASONABLE_ASSURANCE';
    reportingStandard: string;
  };
  sb261FinancialRisk: {
    governanceOversight: string;
    physicalRisksIdentified: string[];
    transitionRisksIdentified: string[];
    riskMitigationStrategy: string;
  };
}

export interface PublicVerificationCertificate {
  certificateId: string;
  reportId: string;
  organisationName: string;
  reportingPeriodName: string;
  verifiedBy: string;
  verifiedAt: string;
  sha256Hash: string;
  totalTonnesCo2e: number;
  scope1Tonnes: number;
  scope2Tonnes: number;
  scope3Tonnes: number;
  datasetVersionsUsed: string[];
  frameworksCompliant: string[];
  verificationStatus: 'VALID_CERTIFIED' | 'REVOKED';
}

export interface PlaybookLead {
  id: string;
  email: string;
  companyName?: string;
  estimatorTonnes?: number;
  downloadedAt: string;
}


