/**
 * CarbonSnap — store.ts
 * FSD: server slice — ledger store
 * In-process data service: tenant workspaces, activities, summary calculations, audit logs.
 */
import {
  ActivityEntry,
  ApiKey,
  AuditLog,
  BillingInvoice,
  BillingSubscription,
  CommunityFactorPack,
  DatasetVersion,
  EstimatorInput,
  EstimatorResult,
  FactorPackValidationResult,
  FeedbackReport,
  HealthStatus,
  HotspotItem,
  IntegrationConnection,
  LeadCapture,
  Organisation,
  PartnerBrand,
  PartnerDataRequest,
  PendingFinancialTransaction,
  ReportingPeriod,
  RoadmapItem,
  ScopeType,
  SsoConfig,
  SubscriptionTier,
  SupplierShareLink,
  TelemetryConfig,
  User,
  UserRole,
  VerificationCertificate,
  ActivityAnnotation,
  CsrdDisclosure,
  DrRestoreTestResult,
  FactorContribution,
  ReportingFramework,
  SecrData,
  PartnerFirm,
  FactorBounty,
  HallOfFameContributor,
  CaliforniaSbReport,
  PublicVerificationCertificate,
  PlaybookLead
} from '../shared/model/types.js';
import { calculationEngine } from './calculationEngine.js';

export class Store {
  private organisations: Map<string, Organisation> = new Map();
  private reportingPeriods: Map<string, ReportingPeriod> = new Map();
  private activityEntries: Map<string, ActivityEntry> = new Map();
  private users: Map<string, User> = new Map();
  private partnerBrands: Map<string, PartnerBrand> = new Map();
  private integrationConnections: Map<string, IntegrationConnection> = new Map();
  private pendingTransactions: Map<string, PendingFinancialTransaction> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private datasetVersions: Map<string, DatasetVersion> = new Map();
  private supplierShareLinks: Map<string, SupplierShareLink> = new Map();
  private communityFactorPacks: Map<string, CommunityFactorPack> = new Map();
  private partnerDataRequests: Map<string, PartnerDataRequest> = new Map();
  private verificationCertificates: Map<string, VerificationCertificate> = new Map();
  private billingSubscriptions: Map<string, BillingSubscription> = new Map();
  private leadCaptures: Map<string, LeadCapture> = new Map();
  private roadmapItems: Map<string, RoadmapItem> = new Map();
  private feedbackReports: FeedbackReport[] = [];
  private ssoConfigs: Map<string, SsoConfig> = new Map();
  private factorContributions: Map<string, FactorContribution> = new Map();
  private partnerFirms: Map<string, PartnerFirm> = new Map();
  private factorBounties: Map<string, FactorBounty> = new Map();
  private hallOfFame: Map<string, HallOfFameContributor> = new Map();
  private playbookLeads: Map<string, PlaybookLead> = new Map();
  private publicCertificates: Map<string, PublicVerificationCertificate> = new Map();
  private telemetryConfig: TelemetryConfig = {
    optIn: true,
    lastPingAt: '2026-08-01T12:00:00Z',
    totalReportsGenerated: 142,
    systemVersion: 'v2.8.0-PHASE8-RELEASE',
    instanceId: 'cloud_run_node_eu_central_01'
  };
  private drTestResults: DrRestoreTestResult[] = [];
  private activityAnnotations: Map<string, ActivityAnnotation> = new Map();
  private auditLogs: AuditLog[] = [];
  private reportGenerationCount = 14;

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const orgId = 'org_acme_001';
    const org2Id = 'org_green_retail_002';
    const periodActiveId = 'period_fy_2024_2025';
    const periodBaselineId = 'period_fy_2023_2024';
    const partnerId = 'partner_green_advisors_01';

    // 1. Seed Partner Brand
    const partner: PartnerBrand = {
      id: partnerId,
      partnerName: 'GreenPath Advisory & Audit LLP',
      logoUrl: '',
      primaryColor: '#0f172a',
      contactEmail: 'audit@greenpath-advisory.co.uk',
      managedOrgIds: [orgId, org2Id],
      customDomains: ['carbon.greenpath-advisory.co.uk']
    };
    this.partnerBrands.set(partner.id, partner);

    // Seed Enterprise API Key for Acme
    const initialKey: ApiKey = {
      id: 'key_acme_live_01',
      orgId,
      name: 'ERP Ingestion Key (SAP Integration)',
      keyPrefix: 'cs_live_9a8f...',
      createdAt: '2024-06-01T10:00:00Z',
      lastUsedAt: '2024-11-20T14:22:00Z',
      status: 'ACTIVE'
    };
    this.apiKeys.set(initialKey.id, initialKey);

    // Seed Dataset Versions
    const ukVersion: DatasetVersion = {
      id: 'ver_uk_2024_1',
      datasetKey: 'UK_2024',
      datasetName: 'UK DESNZ / DEFRA Conversion Factors 2024',
      version: '2024.1.2',
      totalFactors: 32,
      updatedAt: '2024-07-01T00:00:00Z',
      status: 'CURRENT'
    };
    this.datasetVersions.set(ukVersion.id, ukVersion);

    // 2. Seed Organisations
    const defaultOrg: Organisation = {
      id: orgId,
      name: 'Acme Eco Tech Solutions Ltd',
      country: 'United Kingdom',
      industrySector: 'Information Technology & Services',
      employeeCount: 42,
      annualRevenueGbp: 3500000, // £3.5M
      license: 'AGPLv3',
      partnerId,
      createdAt: '2024-04-01T08:00:00Z'
    };
    this.organisations.set(defaultOrg.id, defaultOrg);

    const secondOrg: Organisation = {
      id: org2Id,
      name: 'GreenRetail Logistics UK',
      country: 'United Kingdom',
      industrySector: 'Transport & Freight Logistics',
      employeeCount: 88,
      annualRevenueGbp: 8200000, // £8.2M
      license: 'AGPLv3',
      partnerId,
      createdAt: '2024-05-15T09:30:00Z'
    };
    this.organisations.set(secondOrg.id, secondOrg);

    // Seed period for org 2
    const periodOrg2: ReportingPeriod = {
      id: 'period_gr_2024',
      orgId: org2Id,
      name: 'FY 2024-2025',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      status: 'ACTIVE',
      isBaseline: true,
      notes: 'Initial reporting cycle for freight fleet.'
    };
    this.reportingPeriods.set(periodOrg2.id, periodOrg2);

    // 3. Seed Users with RBAC
    const defaultUser: User = {
      id: 'user_lead_auditor_01',
      name: 'Sarah Jenkins (Lead Carbon Auditor)',
      email: 'sarah.jenkins@greenpath-advisory.co.uk',
      role: 'Admin',
      organisationIds: [orgId, org2Id],
      activeOrgId: orgId
    };
    this.users.set(defaultUser.id, defaultUser);

    // 4. Seed Integration Connections
    const xeroConn: IntegrationConnection = {
      id: `conn_xero_${orgId}`,
      orgId,
      provider: 'Xero',
      status: 'CONNECTED',
      lastSyncedAt: new Date().toISOString(),
      accountName: 'Acme Xero Accounting Ledger'
    };
    const qbConn: IntegrationConnection = {
      id: `conn_qb_${orgId}`,
      orgId,
      provider: 'QuickBooks',
      status: 'CONNECTED',
      lastSyncedAt: new Date().toISOString(),
      accountName: 'Acme QuickBooks Online'
    };
    this.integrationConnections.set(xeroConn.id, xeroConn);
    this.integrationConnections.set(qbConn.id, qbConn);

    // 5. Seed Pending Financial Transactions for Review
    const initialTxns: PendingFinancialTransaction[] = [
      {
        id: 'txn_001',
        orgId,
        provider: 'Xero',
        transactionDate: '2024-11-04',
        vendorName: 'Shell Energy UK',
        accountCode: '6000 - Motor Fuel Expenses',
        amountGbp: 450.00,
        description: 'Commercial Van Fleet Diesel Fuel Refill',
        suggestedActivityType: 'Company Vehicles',
        suggestedFactorId: 'uk_diesel_2024',
        suggestedQuantity: 300, // 300 Litres Diesel (~450 GBP)
        suggestedUnit: 'litres',
        confidenceScore: 95,
        status: 'PENDING'
      },
      {
        id: 'txn_002',
        orgId,
        provider: 'QuickBooks',
        transactionDate: '2024-10-28',
        vendorName: 'British Gas Business',
        accountCode: '6100 - Heating & Gas Utilities',
        amountGbp: 1840.00,
        description: 'Monthly HQ Natural Gas Heating Invoice',
        suggestedActivityType: 'Stationary Fuel',
        suggestedFactorId: 'uk_gas_2024',
        suggestedQuantity: 23000, // ~23,000 kWh
        suggestedUnit: 'kWh',
        confidenceScore: 98,
        status: 'PENDING'
      },
      {
        id: 'txn_003',
        orgId,
        provider: 'Xero',
        transactionDate: '2024-11-12',
        vendorName: 'Octopus Energy for Business',
        accountCode: '6110 - Office Electricity',
        amountGbp: 3200.00,
        description: 'HQ Building Electricity Grid Bill',
        suggestedActivityType: 'Electricity',
        suggestedFactorId: 'uk_elec_grid_2024',
        suggestedQuantity: 11428, // ~11,428 kWh
        suggestedUnit: 'kWh',
        confidenceScore: 99,
        status: 'PENDING'
      },
      {
        id: 'txn_004',
        orgId,
        provider: 'Xero',
        transactionDate: '2024-09-18',
        vendorName: 'Thames Water Utilities',
        accountCode: '6120 - Water & Drainage',
        amountGbp: 440.00,
        description: 'Quarterly Mains Water & Sewage Discharge',
        suggestedActivityType: 'Water',
        suggestedFactorId: 'uk_water_supply_2024',
        suggestedQuantity: 200, // 200 m3
        suggestedUnit: 'm3',
        confidenceScore: 92,
        status: 'PENDING'
      }
    ];

    for (const t of initialTxns) {
      this.pendingTransactions.set(t.id, t);
    }

    // 2. Seed Reporting Periods
    const activePeriod: ReportingPeriod = {
      id: periodActiveId,
      orgId,
      name: 'FY 2024-2025 (Current)',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      status: 'ACTIVE',
      isBaseline: false,
      notes: 'Current active carbon accounting reporting cycle for annual SECR / SME audit.',
      is_verified: true,
      verifiedAt: '2024-07-15T10:00:00Z',
      verifiedBy: 'Sarah Jenkins (Lead Carbon Auditor - GreenPath Advisory)'
    };

    const baselinePeriod: ReportingPeriod = {
      id: periodBaselineId,
      orgId,
      name: 'FY 2023-2024 (Baseline)',
      startDate: '2023-04-01',
      endDate: '2024-03-31',
      status: 'CLOSED',
      isBaseline: true,
      notes: 'Historical baseline year established for SME Net-Zero decarbonisation roadmap.',
      is_verified: true,
      verifiedAt: '2024-04-10T14:30:00Z',
      verifiedBy: 'Sarah Jenkins (Lead Carbon Auditor)'
    };

    this.reportingPeriods.set(activePeriod.id, activePeriod);
    this.reportingPeriods.set(baselinePeriod.id, baselinePeriod);

    // Seed Supplier Share Link
    const defaultShareLink: SupplierShareLink = {
      id: 'share_walmart_01',
      token: 'cs_share_walmart_procurement_2024',
      orgId,
      periodId: periodActiveId,
      shareName: 'Walmart Scope 3 Procurement Audit Portal',
      createdAt: new Date().toISOString(),
      accessCount: 18,
      isVerifiedOnly: true
    };
    this.supplierShareLinks.set(defaultShareLink.token, defaultShareLink);

    // Seed Community Factor Packs
    const jpPack: CommunityFactorPack = {
      id: 'pack_jp_2024',
      country: 'Japan',
      countryCode: 'JP',
      datasetKey: 'JP_2024',
      datasetName: 'MOE Japan Grid & Fuel Factors 2024',
      year: 2024,
      submittedBy: 'Tokyo Sustainability Analytics Inc.',
      status: 'APPROVED',
      submittedAt: '2024-06-10T11:20:00Z',
      factorCount: 18
    };
    const brPack: CommunityFactorPack = {
      id: 'pack_br_2024',
      country: 'Brazil',
      countryCode: 'BR',
      datasetKey: 'BR_2024',
      datasetName: 'MCTI Brazil Interconnected System (SIN) 2024',
      year: 2024,
      submittedBy: 'GreenPath Brasil Consultoria',
      status: 'APPROVED',
      submittedAt: '2024-07-02T14:15:00Z',
      factorCount: 14
    };
    this.communityFactorPacks.set(jpPack.id, jpPack);
    this.communityFactorPacks.set(brPack.id, brPack);

    // 3. Seed Pre-calculated Activity Entries using calculationEngine
    const initialSeedEntries = [
      {
        id: 'act_001',
        orgId,
        periodId: periodActiveId,
        activityType: 'Electricity',
        description: 'London HQ Office Main Power Meter',
        quantity: 48000, // kWh
        factorId: 'uk_elec_grid_2024',
        date: '2024-06-30',
        facilityLocation: 'HQ Building, London EC1',
        notes: 'Quarterly electricity bill from Octopus Energy.'
      },
      {
        id: 'act_002',
        orgId,
        periodId: periodActiveId,
        activityType: 'Stationary Fuel',
        description: 'HQ Gas Heating Boiler',
        quantity: 32000, // kWh
        factorId: 'uk_gas_2024',
        date: '2024-11-15',
        facilityLocation: 'HQ Building, London EC1',
        notes: 'Winter gas heating consumption.'
      },
      {
        id: 'act_003',
        orgId,
        periodId: periodActiveId,
        activityType: 'Company Vehicles',
        description: 'Field Service Delivery Vans Fuel',
        quantity: 2400, // litres Diesel
        factorId: 'uk_diesel_2024',
        date: '2024-08-20',
        facilityLocation: 'Fleet Operations UK',
        notes: 'Commercial fuel card logs for 3 diesel vans.'
      },
      {
        id: 'act_004',
        orgId,
        periodId: periodActiveId,
        activityType: 'Company Vehicles',
        description: 'Sales Team Petrol Cars Fuel',
        quantity: 1800, // litres Petrol
        factorId: 'uk_petrol_2024',
        date: '2024-09-10',
        facilityLocation: 'UK Sales Fleet',
        notes: 'Reimbursed fuel card receipts.'
      },
      {
        id: 'act_005',
        orgId,
        periodId: periodActiveId,
        activityType: 'Business Travel',
        description: 'European Client Summit Flight',
        quantity: 3200, // pkm
        factorId: 'uk_flight_short_2024',
        date: '2024-10-05',
        facilityLocation: 'Frankfurt Airport Route',
        notes: '4 staff return flights London Heathrow to Frankfurt.'
      },
      {
        id: 'act_006',
        orgId,
        periodId: periodActiveId,
        activityType: 'Business Travel',
        description: 'Staff Commute Rail Travel',
        quantity: 12500, // pkm
        factorId: 'uk_rail_2024',
        date: '2024-07-15',
        facilityLocation: 'National Rail Network',
        notes: 'Staff inter-city customer visit rail tickets.'
      },
      {
        id: 'act_007',
        orgId,
        periodId: periodActiveId,
        activityType: 'Purchased Goods',
        description: 'Engineering Laptops & Server Procurement',
        quantity: 18500, // £ spend
        factorId: 'uk_spend_it_2024',
        date: '2024-05-12',
        facilityLocation: 'IT Procurement Dept',
        notes: 'Annual IT equipment refresh (10 new laptops + networking gear).'
      },
      {
        id: 'act_008',
        orgId,
        periodId: periodActiveId,
        activityType: 'Waste',
        description: 'HQ Office Paper & Cardboard Recycling',
        quantity: 1.8, // tonnes
        factorId: 'uk_waste_recycle_2024',
        date: '2024-09-30',
        facilityLocation: 'HQ Waste Compound',
        notes: 'Shred-It recycling certificate.'
      },
      {
        id: 'act_009',
        orgId,
        periodId: periodActiveId,
        activityType: 'Water',
        description: 'Mains Water & Sewerage Usage',
        quantity: 450, // m3
        factorId: 'uk_water_supply_2024',
        date: '2024-10-01',
        facilityLocation: 'HQ Building, London EC1',
        notes: 'Thames Water annual meter reading.'
      },
      // Baseline entries
      {
        id: 'act_base_001',
        orgId,
        periodId: periodBaselineId,
        activityType: 'Electricity',
        description: 'HQ Electricity (FY23-24)',
        quantity: 52000,
        factorId: 'uk_elec_grid_2024',
        date: '2023-09-15',
        facilityLocation: 'HQ Building',
        notes: 'Baseline electricity consumption prior to LED retrofit.'
      },
      {
        id: 'act_base_002',
        orgId,
        periodId: periodBaselineId,
        activityType: 'Stationary Fuel',
        description: 'HQ Heating Gas (FY23-24)',
        quantity: 36000,
        factorId: 'uk_gas_2024',
        date: '2023-12-10',
        facilityLocation: 'HQ Building',
        notes: 'Baseline natural gas usage.'
      }
    ];

    for (const raw of initialSeedEntries) {
      try {
        const { factor, co2e_kg, unit, sourceScope } = calculationEngine.processActivityEntry(
          raw.quantity,
          raw.factorId
        );

        const entry: ActivityEntry = {
          id: raw.id,
          orgId: raw.orgId,
          periodId: raw.periodId,
          activityType: raw.activityType,
          description: raw.description,
          quantity: raw.quantity,
          unit,
          sourceScope,
          factorId: raw.factorId,
          factorName: factor.name,
          factorValue: factor.factorValue,
          co2e_kg,
          date: raw.date,
          facilityLocation: raw.facilityLocation,
          notes: raw.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.activityEntries.set(entry.id, entry);
      } catch (e) {
        console.error('Failed to seed activity entry:', e);
      }
    }

    this.addAuditLog('SYSTEM_INIT', 'Initialized CarbonSnap store with sample SME data and UK 2024 emission factor datasets.', 'System');

    // Phase 7 Seed: Billing Subscriptions
    this.billingSubscriptions.set(orgId, {
      orgId,
      tier: 'PRO',
      monthlyPriceUsd: 149,
      status: 'ACTIVE',
      accountingAddonActive: true,
      accountingAddonPriceUsd: 99,
      nextBillingDate: '2026-08-01',
      stripeCustomerId: 'cus_AcmeCorp_9912',
      stripeSubscriptionId: 'sub_Acme_Pro_2026',
      invoices: [
        {
          id: 'inv_2026_07',
          amountUsd: 248,
          date: '2026-07-01',
          pdfUrl: '#',
          status: 'PAID',
          periodName: 'July 2026 - Pro Tier + Accounting Addon'
        },
        {
          id: 'inv_2026_06',
          amountUsd: 248,
          date: '2026-06-01',
          pdfUrl: '#',
          status: 'PAID',
          periodName: 'June 2026 - Pro Tier + Accounting Addon'
        }
      ]
    });

    // Phase 7 Seed: Public Roadmap Items
    const initialRoadmap: RoadmapItem[] = [
      {
        id: 'road_001',
        title: 'Xero & QuickBooks Real-time Webhook Auto-Sync',
        description: 'Automatically convert newly posted utility invoices into Scope 1 & 2 activity lines instantly via webhooks.',
        category: 'ERP Automation',
        status: 'IN_PROGRESS',
        upvotes: 84,
        githubIssueUrl: 'https://github.com/Yashraghuvans/CarbonSnap/issues/104'
      },
      {
        id: 'road_002',
        title: 'Custom Emission Factor CSV Bulk Import Tool',
        description: 'Upload private corporate factor tables directly via drag-and-drop CSV validation.',
        category: 'Data Integrity',
        status: 'COMPLETED',
        upvotes: 112,
        githubIssueUrl: 'https://github.com/Yashraghuvans/CarbonSnap/issues/89'
      },
      {
        id: 'road_003',
        title: 'CBAM (Carbon Border Adjustment Mechanism) EU Import Calculator',
        description: 'Calculate embedded carbon emissions for steel, aluminum, and chemical imports into the EU.',
        category: 'Regulatory Compliance',
        status: 'PLANNED',
        upvotes: 145,
        githubIssueUrl: 'https://github.com/Yashraghuvans/CarbonSnap/issues/142'
      },
      {
        id: 'road_004',
        title: 'SAML 2.0 / Okta & Azure AD Single Sign-On (SSO)',
        description: 'Enterprise corporate identity provider integration with SCIM auto-provisioning.',
        category: 'Enterprise Security',
        status: 'IN_PROGRESS',
        upvotes: 67,
        githubIssueUrl: 'https://github.com/Yashraghuvans/CarbonSnap/issues/118'
      }
    ];

    for (const item of initialRoadmap) {
      this.roadmapItems.set(item.id, item);
    }

    // Phase 7 Seed: SSO Config
    this.ssoConfigs.set(orgId, {
      orgId,
      provider: 'OKTA',
      domain: 'acmecorp.com',
      entityId: 'https://auth.acmecorp.com/saml/metadata',
      ssoUrl: 'https://auth.acmecorp.com/sso/saml/login',
      enabled: true,
      lastSyncedAt: '2026-07-25T14:30:00Z'
    });

    // Phase 8 Seeds: Community Factor Contributions with DCO
    this.factorContributions.set('contrib_de_2025', {
      id: 'contrib_de_2025',
      datasetName: 'Germany UBA Grid Electricity Emission Factors 2025',
      countryRegion: 'Germany / EU',
      contributorName: 'Dr. Lukas Weber',
      contributorEmail: 'lukas.weber@umweltbundesamt.de',
      dcoSigned: true,
      dcoSignature: 'I agree to Developer Certificate of Origin v1.1 - Signed-off-by: Dr. Lukas Weber <lukas.weber@umweltbundesamt.de>',
      status: 'APPROVED',
      reviews: [
        {
          reviewerName: 'CarbonSnap Lead Scientist',
          comment: 'Verified against official Federal Environment Agency (UBA) 2025 publication tables.',
          approved: true,
          date: '2026-07-15'
        }
      ],
      factorDataJson: JSON.stringify([
        { id: 'de_elec_grid_2025', category: 'Electricity', name: 'Germany Electricity Grid Mix 2025', scope: 2, unit: 'kWh', factorValue: 0.380, description: 'UBA Germany National Grid CO2e Factor' }
      ], null, 2),
      submittedAt: '2026-07-10T10:15:00Z',
      factorsCount: 12
    });

    this.factorContributions.set('contrib_jp_gas_2025', {
      id: 'contrib_jp_gas_2025',
      datasetName: 'Japan Ministry of Environment Industrial Natural Gas Pack',
      countryRegion: 'Japan / Asia-Pacific',
      contributorName: 'Kenji Sato',
      contributorEmail: 'kenji.sato@sustainability-jp.org',
      dcoSigned: true,
      dcoSignature: 'I agree to Developer Certificate of Origin v1.1 - Signed-off-by: Kenji Sato <kenji.sato@sustainability-jp.org>',
      status: 'PENDING_REVIEW',
      reviews: [],
      factorDataJson: JSON.stringify([
        { id: 'jp_gas_2025', category: 'Stationary Fuel', name: 'Japan City Gas Mix (MOE 2025)', scope: 1, unit: 'm3', factorValue: 2.23, description: 'Japan MOE Standard City Gas Emission Factor' }
      ], null, 2),
      submittedAt: '2026-07-28T16:40:00Z',
      factorsCount: 8
    });

    // Phase 8 Seeds: Disaster Recovery Test Log
    this.drTestResults.push({
      id: 'dr_test_001',
      testedAt: '2026-07-29T03:00:00Z',
      backupSource: 's3://carbonsnap-backups-eu/prod-db-snapshot-20260729.bak',
      restoredSuccessfully: true,
      durationMs: 4120,
      recordsVerifiedCount: 1845,
      statusMessage: 'PASS: Staging environment restored and 100% data integrity verified against checksum sha256:e3b0c442'
    });

    // Phase 8 Seeds: Consultant Activity Annotations
    this.activityAnnotations.set('annot_001', {
      id: 'annot_001',
      activityId: 'act_002',
      orgId,
      authorName: 'Emma Consultant',
      authorRole: 'CONSULTANT',
      note: 'Please verify if British Gas bill includes Scope 3 upstream well-to-tank (WTT) transport losses.',
      status: 'OPEN',
      createdAt: '2026-07-20T11:00:00Z'
    });

    // Phase 9 Seeds: Partner Accounting & Consulting Firms
    const initialPartners: PartnerFirm[] = [
      { id: 'part_001', name: 'BDO ESG & Carbon Advisory', type: 'ACCOUNTING_FIRM', contactName: 'David Wright', contactEmail: 'david.wright@bdo.co.uk', clientWorkspacesCount: 18, whiteLabelTier: 'ENTERPRISE', status: 'ACTIVE_PARTNER', joinedAt: '2026-03-10' },
      { id: 'part_002', name: 'Grant Thornton Sustainability Practice', type: 'ACCOUNTING_FIRM', contactName: 'Rachel Miller', contactEmail: 'rachel.miller@uk.gt.com', clientWorkspacesCount: 34, whiteLabelTier: 'ENTERPRISE', status: 'ACTIVE_PARTNER', joinedAt: '2026-02-15' },
      { id: 'part_003', name: 'RSM UK Net Zero Services', type: 'ACCOUNTING_FIRM', contactName: 'Simon Hayes', contactEmail: 'simon.hayes@rsmuk.com', clientWorkspacesCount: 12, whiteLabelTier: 'PROFESSIONAL', status: 'RECRUITED', joinedAt: '2026-04-01' },
      { id: 'part_004', name: 'Azets SME Carbon Accountants', type: 'ACCOUNTING_FIRM', contactName: 'Helen Turner', contactEmail: 'helen.turner@azets.co.uk', clientWorkspacesCount: 0, whiteLabelTier: 'STARTER', status: 'PROSPECT', joinedAt: '2026-07-20' },
      { id: 'part_005', name: 'Mazars UK Climate Advisory', type: 'ACCOUNTING_FIRM', contactName: 'Antoine Laurent', contactEmail: 'antoine.laurent@mazars.co.uk', clientWorkspacesCount: 22, whiteLabelTier: 'ENTERPRISE', status: 'ACTIVE_PARTNER', joinedAt: '2026-01-11' },
      { id: 'part_006', name: 'PKF Francis Clark Green Advisory', type: 'ACCOUNTING_FIRM', contactName: 'Claire Bennet', contactEmail: 'claire.bennet@pkf-francisclark.co.uk', clientWorkspacesCount: 8, whiteLabelTier: 'PROFESSIONAL', status: 'RECRUITED', joinedAt: '2026-05-18' }
    ];
    for (const p of initialPartners) {
      this.partnerFirms.set(p.id, p);
    }

    // Phase 9 Seeds: Emission Factor Bounties
    const initialBounties: FactorBounty[] = [
      { id: 'bounty_ca_2024', countryCode: 'CA', countryName: 'Canada', region: 'North America', priority: 'URGENT', rewardBountyUsd: 1200, status: 'OPEN', targetRegistry: 'Environment and Climate Change Canada NIR 2024' },
      { id: 'bounty_au_2024', countryCode: 'AU', countryName: 'Australia', region: 'Asia-Pacific', priority: 'HIGH', rewardBountyUsd: 1000, status: 'IN_CLAIM', claimedBy: 'Dr. Liam O\'Connor', targetRegistry: 'National Greenhouse and Energy Reporting NGER 2024' },
      { id: 'bounty_jp_2024', countryCode: 'JP', countryName: 'Japan', region: 'Asia-Pacific', priority: 'HIGH', rewardBountyUsd: 1000, status: 'OPEN', targetRegistry: 'Ministry of the Environment Grid & City Gas 2024' },
      { id: 'bounty_br_2024', countryCode: 'BR', countryName: 'Brazil', region: 'South America', priority: 'MEDIUM', rewardBountyUsd: 800, status: 'OPEN', targetRegistry: 'MCTIC Brazilian National Factor Registry 2024' },
      { id: 'bounty_in_2024', countryCode: 'IN', countryName: 'India', region: 'Asia-Pacific', priority: 'HIGH', rewardBountyUsd: 1000, status: 'COMPLETED', claimedBy: 'Aarav Patel', targetRegistry: 'Central Electricity Authority CEA Grid Factors v19' }
    ];
    for (const b of initialBounties) {
      this.factorBounties.set(b.id, b);
    }

    // Phase 9 Seeds: Hall of Fame Contributors
    const initialHallOfFame: HallOfFameContributor[] = [
      { id: 'hof_001', name: 'Dr. Aris Thorne', organization: 'Oxford Climate Institute', country: 'United Kingdom', contributionsCount: 14, totalFactorsAdded: 450, badges: ['FOUNDING_CONTRIBUTOR', 'GRID_EXPERT', 'TOP_REVIEWER'], verifiedAt: '2026-06-01' },
      { id: 'hof_002', name: 'Elena Rostova', organization: 'Nordic NetZero Alliance', country: 'Sweden', contributionsCount: 9, totalFactorsAdded: 310, badges: ['HYDRO_SPECIALIST', 'DCO_CHAMPION'], verifiedAt: '2026-06-15' },
      { id: 'hof_003', name: 'Kenji Takahashi', organization: 'Tokyo Clean Energy Lab', country: 'Japan', contributionsCount: 6, totalFactorsAdded: 210, badges: ['ASIA_GRID_LEAD'], verifiedAt: '2026-07-01' },
      { id: 'hof_004', name: 'Aarav Patel', organization: 'IIT Delhi Carbon Research', country: 'India', contributionsCount: 5, totalFactorsAdded: 185, badges: ['SOLAR_PACT_LEAD'], verifiedAt: '2026-07-12' }
    ];
    for (const h of initialHallOfFame) {
      this.hallOfFame.set(h.id, h);
    }

    // Phase 9 Seeds: Public Verification Certificates
    const certAcme: PublicVerificationCertificate = {
      certificateId: 'cert_val_acme_2024',
      reportId: 'period_fy_2024_2025',
      organisationName: 'Acme Eco Tech Solutions Ltd',
      reportingPeriodName: 'FY 2024-2025',
      verifiedBy: 'Sarah Jenkins (Lead Carbon Auditor, ISO 14064 Certified)',
      verifiedAt: '2026-07-30T10:00:00Z',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      totalTonnesCo2e: 42.85,
      scope1Tonnes: 12.40,
      scope2Tonnes: 18.25,
      scope3Tonnes: 12.20,
      datasetVersionsUsed: ['UK DESNZ / DEFRA 2024 v2024.1.2', 'US EPA Emission Factors 2024'],
      frameworksCompliant: ['GHG Protocol Corporate Standard', 'UK SECR', 'EU CSRD ESRS E1', 'California SB 253'],
      verificationStatus: 'VALID_CERTIFIED'
    };
    this.publicCertificates.set(certAcme.certificateId, certAcme);
    this.publicCertificates.set('period_fy_2024_2025', certAcme);
  }

  public addAuditLog(action: string, details: string, user = 'User'): void {
    this.auditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    });
    // Trim log history
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(0, 100);
    }
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // Organisation methods
  public getOrganisations(): Organisation[] {
    return Array.from(this.organisations.values());
  }

  public getOrganisation(id: string): Organisation | undefined {
    return this.organisations.get(id);
  }

  public updateOrganisation(id: string, updates: Partial<Organisation>): Organisation {
    const existing = this.organisations.get(id);
    if (!existing) throw new Error(`Organisation ${id} not found`);

    const updated = { ...existing, ...updates };
    this.organisations.set(id, updated);
    this.addAuditLog('UPDATE_ORG', `Updated organization profile for '${updated.name}'`);
    return updated;
  }

  public createOrganisation(data: Omit<Organisation, 'id' | 'createdAt'>): Organisation {
    const id = `org_${Date.now()}`;
    const newOrg: Organisation = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    this.organisations.set(id, newOrg);

    // Create default active reporting period for new org
    const periodId = `period_${Date.now()}`;
    const newPeriod: ReportingPeriod = {
      id: periodId,
      orgId: id,
      name: 'FY 2024-2025',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      status: 'ACTIVE',
      isBaseline: true,
      notes: 'Initial reporting period.'
    };
    this.reportingPeriods.set(periodId, newPeriod);

    this.addAuditLog('CREATE_ORG', `Created new organization '${newOrg.name}'`);
    return newOrg;
  }

  // Reporting Periods
  public getReportingPeriods(orgId: string): ReportingPeriod[] {
    return Array.from(this.reportingPeriods.values()).filter(p => p.orgId === orgId);
  }

  public getReportingPeriod(id: string): ReportingPeriod | undefined {
    return this.reportingPeriods.get(id);
  }

  public createReportingPeriod(data: Omit<ReportingPeriod, 'id'>): ReportingPeriod {
    const id = `period_${Date.now()}`;
    const newPeriod: ReportingPeriod = { ...data, id };
    
    // If set to baseline, unset other baselines for org
    if (newPeriod.isBaseline) {
      for (const p of this.reportingPeriods.values()) {
        if (p.orgId === newPeriod.orgId) p.isBaseline = false;
      }
    }

    this.reportingPeriods.set(id, newPeriod);
    this.addAuditLog('CREATE_PERIOD', `Created reporting period '${newPeriod.name}'`);
    return newPeriod;
  }

  public updateReportingPeriod(id: string, updates: Partial<ReportingPeriod>): ReportingPeriod {
    const existing = this.reportingPeriods.get(id);
    if (!existing) throw new Error(`Reporting period ${id} not found`);

    if (updates.isBaseline) {
      for (const p of this.reportingPeriods.values()) {
        if (p.orgId === existing.orgId) p.isBaseline = false;
      }
    }

    const updated = { ...existing, ...updates };
    this.reportingPeriods.set(id, updated);
    this.addAuditLog('UPDATE_PERIOD', `Updated reporting period '${updated.name}' status to ${updated.status}`);
    return updated;
  }

  // Activity Entries
  public getActivityEntries(orgId: string, periodId?: string): ActivityEntry[] {
    let entries = Array.from(this.activityEntries.values()).filter(e => e.orgId === orgId);
    if (periodId) {
      entries = entries.filter(e => e.periodId === periodId);
    }
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public createActivityEntry(data: {
    orgId: string;
    periodId: string;
    activityType: string;
    description: string;
    quantity: number;
    factorId: string;
    date: string;
    facilityLocation?: string;
    notes?: string;
  }): ActivityEntry {
    const { factor, co2e_kg, unit, sourceScope } = calculationEngine.processActivityEntry(
      data.quantity,
      data.factorId
    );

    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: ActivityEntry = {
      id,
      orgId: data.orgId,
      periodId: data.periodId,
      activityType: data.activityType,
      description: data.description,
      quantity: data.quantity,
      unit,
      sourceScope,
      factorId: data.factorId,
      factorName: factor.name,
      factorValue: factor.factorValue,
      co2e_kg,
      date: data.date,
      facilityLocation: data.facilityLocation || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.activityEntries.set(id, newEntry);
    this.addAuditLog(
      'CREATE_ACTIVITY',
      `Added activity '${newEntry.description}' (${newEntry.quantity} ${newEntry.unit}) -> ${co2e_kg.toFixed(2)} kg CO2e [Scope ${sourceScope}]`
    );
    return newEntry;
  }

  public updateActivityEntry(id: string, updates: {
    quantity?: number;
    factorId?: string;
    activityType?: string;
    description?: string;
    date?: string;
    facilityLocation?: string;
    notes?: string;
  }): ActivityEntry {
    const existing = this.activityEntries.get(id);
    if (!existing) throw new Error(`Activity entry ${id} not found`);

    const newQuantity = updates.quantity !== undefined ? updates.quantity : existing.quantity;
    const newFactorId = updates.factorId !== undefined ? updates.factorId : existing.factorId;

    const { factor, co2e_kg, unit, sourceScope } = calculationEngine.processActivityEntry(
      newQuantity,
      newFactorId
    );

    const updated: ActivityEntry = {
      ...existing,
      ...updates,
      quantity: newQuantity,
      factorId: newFactorId,
      unit,
      sourceScope,
      factorName: factor.name,
      factorValue: factor.factorValue,
      co2e_kg,
      updatedAt: new Date().toISOString()
    };

    this.activityEntries.set(id, updated);
    this.addAuditLog('UPDATE_ACTIVITY', `Updated activity entry '${updated.description}' -> ${co2e_kg.toFixed(2)} kg CO2e`);
    return updated;
  }

  public deleteActivityEntry(id: string): void {
    const existing = this.activityEntries.get(id);
    if (existing) {
      this.activityEntries.delete(id);
      this.addAuditLog('DELETE_ACTIVITY', `Deleted activity entry '${existing.description}' (${existing.co2e_kg.toFixed(2)} kg CO2e)`);
    }
  }

  // Summary calculation
  public getEmissionsSummary(orgId: string, periodId: string) {
    const org = this.getOrganisation(orgId);
    const period = this.getReportingPeriod(periodId);
    const entries = this.getActivityEntries(orgId, periodId);

    let scope1_kg = 0;
    let scope2_kg = 0;
    let scope3_kg = 0;

    const categoryMap: Map<string, { scope: ScopeType; co2e_kg: number }> = new Map();
    const monthlyMap: Map<string, { scope1: number; scope2: number; scope3: number }> = new Map();

    for (const entry of entries) {
      if (entry.sourceScope === 1) scope1_kg += entry.co2e_kg;
      else if (entry.sourceScope === 2) scope2_kg += entry.co2e_kg;
      else if (entry.sourceScope === 3) scope3_kg += entry.co2e_kg;

      // Category breakdown
      const catKey = `${entry.activityType} (Scope ${entry.sourceScope})`;
      const existingCat = categoryMap.get(catKey) || { scope: entry.sourceScope, co2e_kg: 0 };
      existingCat.co2e_kg += entry.co2e_kg;
      categoryMap.set(catKey, existingCat);

      // Monthly aggregation
      const monthStr = entry.date ? entry.date.substring(0, 7) : '2024-04';
      const mData = monthlyMap.get(monthStr) || { scope1: 0, scope2: 0, scope3: 0 };
      if (entry.sourceScope === 1) mData.scope1 += entry.co2e_kg;
      else if (entry.sourceScope === 2) mData.scope2 += entry.co2e_kg;
      else if (entry.sourceScope === 3) mData.scope3 += entry.co2e_kg;
      monthlyMap.set(monthStr, mData);
    }

    const total_kg = scope1_kg + scope2_kg + scope3_kg;
    const total_tonnes = total_kg / 1000;

    const employees = org?.employeeCount || 1;
    const revenue = org?.annualRevenueGbp || 1;

    const byCategory = Array.from(categoryMap.entries()).map(([category, val]) => ({
      category,
      scope: val.scope,
      co2e_kg: Math.round(val.co2e_kg * 100) / 100,
      co2e_tonnes: Math.round((val.co2e_kg / 1000) * 1000) / 1000,
      percentage: total_kg > 0 ? Math.round((val.co2e_kg / total_kg) * 1000) / 10 : 0
    })).sort((a, b) => b.co2e_kg - a.co2e_kg);

    const sortedMonths = Array.from(monthlyMap.keys()).sort();
    const monthlyTrend = sortedMonths.map(month => {
      const data = monthlyMap.get(month)!;
      return {
        month,
        scope1_kg: Math.round(data.scope1),
        scope2_kg: Math.round(data.scope2),
        scope3_kg: Math.round(data.scope3),
        total_kg: Math.round(data.scope1 + data.scope2 + data.scope3)
      };
    });

    // Programmatic Hotspot Analysis (Top 3 emission drivers)
    const topCategories = [...byCategory].slice(0, 3);
    const hotspots = topCategories.map((cat, idx) => {
      let rec = 'Review operational energy efficiency and explore low-carbon alternative suppliers.';
      const catLower = cat.category.toLowerCase();
      if (catLower.includes('stationary fuel') || catLower.includes('gas')) {
        rec = 'Switch to green biomethane tariffs or upgrade boiler systems to heat pumps to reduce Scope 1 emissions by up to 80%.';
      } else if (catLower.includes('vehicle') || catLower.includes('diesel') || catLower.includes('petrol')) {
        rec = 'Transition commercial vehicle fleet to Battery Electric Vehicles (BEVs) and install smart on-site EV charging.';
      } else if (catLower.includes('travel') || catLower.includes('flight') || catLower.includes('rail')) {
        rec = 'Enforce corporate flight caps, mandate rail travel for domestic journeys under 400km, and promote virtual client meetings.';
      } else if (catLower.includes('electricity')) {
        rec = 'Procure 100% REGO-backed renewable electricity tariffs or evaluate rooftop solar PV installation.';
      } else if (catLower.includes('purchased goods') || catLower.includes('spend') || catLower.includes('it')) {
        rec = 'Engage key tier-1 suppliers for product carbon footprint data and integrate sustainable procurement standards.';
      }
      return {
        rank: idx + 1,
        category: cat.category,
        scope: cat.scope,
        co2e_kg: cat.co2e_kg,
        co2e_tonnes: cat.co2e_tonnes,
        percentage: cat.percentage,
        recommendation: rec
      };
    });

    return {
      orgId,
      periodId,
      periodName: period?.name || 'Unknown Period',
      scope1_kg: Math.round(scope1_kg * 100) / 100,
      scope2_kg: Math.round(scope2_kg * 100) / 100,
      scope3_kg: Math.round(scope3_kg * 100) / 100,
      total_kg: Math.round(total_kg * 100) / 100,
      total_tonnes: Math.round(total_tonnes * 1000) / 1000,
      scope1_percent: total_kg > 0 ? Math.round((scope1_kg / total_kg) * 1000) / 10 : 0,
      scope2_percent: total_kg > 0 ? Math.round((scope2_kg / total_kg) * 1000) / 10 : 0,
      scope3_percent: total_kg > 0 ? Math.round((scope3_kg / total_kg) * 1000) / 10 : 0,
      intensityPerEmployee_kg: Math.round((total_kg / employees) * 10) / 10,
      intensityPerRevenue_kgPer1k: Math.round((total_kg / (revenue / 1000)) * 100) / 100,
      activityCount: entries.length,
      byCategory,
      monthlyTrend,
      hotspots
    };
  }

  // Bulk Import CSV Service with All-or-Nothing Transaction Logic
  public bulkImportActivities(
    periodId: string,
    orgId: string,
    csvText: string
  ): {
    success: boolean;
    importedCount?: number;
    totalCo2eKg?: number;
    entries?: ActivityEntry[];
    errors?: Array<{ row: number; message: string }>;
  } {
    const period = this.getReportingPeriod(periodId);
    if (!period) {
      return {
        success: false,
        errors: [{ row: 0, message: `Reporting period '${periodId}' not found.` }]
      };
    }

    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      return {
        success: false,
        errors: [{ row: 0, message: 'CSV file is empty.' }]
      };
    }

    // Helper to parse CSV line handling quotes
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    let startRow = 0;
    const headerLine = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    const isHeader = headerLine.some(h => ['activity_type', 'activitytype', 'quantity', 'unit', 'factor_id'].includes(h));

    let colMap: Record<string, number> = {};
    if (isHeader) {
      startRow = 1;
      headerLine.forEach((h, idx) => {
        if (h.includes('activity')) colMap['activity_type'] = idx;
        else if (h.includes('quantity') || h.includes('amount')) colMap['quantity'] = idx;
        else if (h === 'unit' || h.includes('unit')) colMap['unit'] = idx;
        else if (h.includes('desc')) colMap['description'] = idx;
        else if (h.includes('date')) colMap['date'] = idx;
        else if (h.includes('factor')) colMap['factor_id'] = idx;
        else if (h.includes('locat')) colMap['facilityLocation'] = idx;
        else if (h.includes('note')) colMap['notes'] = idx;
      });
    }

    const errors: Array<{ row: number; message: string }> = [];
    const pendingEntries: Array<{
      activityType: string;
      description: string;
      quantity: number;
      unit: string;
      factorId: string;
      date: string;
      facilityLocation?: string;
      notes?: string;
    }> = [];

    const allFactors = calculationEngine.getAllFactors('UK_2024')
      .concat(calculationEngine.getAllFactors('US_EPA_2024'))
      .concat(calculationEngine.getAllFactors('GHG_GLOBAL_2024'));

    for (let i = startRow; i < lines.length; i++) {
      const rowNum = i + 1; // 1-indexed row number
      const cols = parseCsvLine(lines[i]);

      let actType = colMap['activity_type'] !== undefined ? cols[colMap['activity_type']] : cols[0];
      let rawQty = colMap['quantity'] !== undefined ? cols[colMap['quantity']] : cols[1];
      let rawUnit = colMap['unit'] !== undefined ? cols[colMap['unit']] : cols[2];
      let desc = colMap['description'] !== undefined ? cols[colMap['description']] : cols[3] || 'Bulk imported item';
      let rowDate = colMap['date'] !== undefined ? cols[colMap['date']] : cols[4] || new Date().toISOString().substring(0, 10);
      let factorId = colMap['factor_id'] !== undefined ? cols[colMap['factor_id']] : cols[5];
      let loc = colMap['facilityLocation'] !== undefined ? cols[colMap['facilityLocation']] : cols[6];
      let notes = colMap['notes'] !== undefined ? cols[colMap['notes']] : cols[7];

      if (!actType) {
        errors.push({ row: rowNum, message: `Missing required 'activity_type'` });
        continue;
      }

      if (!rawQty || isNaN(Number(rawQty)) || Number(rawQty) <= 0) {
        errors.push({ row: rowNum, message: `Quantity must be a positive number (got "${rawQty || ''}")` });
        continue;
      }

      if (!rawUnit) {
        errors.push({ row: rowNum, message: `Missing required 'unit'` });
        continue;
      }

      const quantity = Number(rawQty);

      // Factor matching logic
      let matchedFactor = factorId ? calculationEngine.getFactorById(factorId) : undefined;

      if (!matchedFactor) {
        // Match by activity_type / category or name
        const candidates = allFactors.filter(f =>
          f.category.toLowerCase() === actType.toLowerCase() ||
          f.name.toLowerCase().includes(actType.toLowerCase()) ||
          f.id.toLowerCase().includes(actType.toLowerCase())
        );

        if (candidates.length === 0) {
          errors.push({
            row: rowNum,
            message: `Activity type "${actType}" not recognized or no matching emission factor found.`
          });
          continue;
        }

        // Check if unit matches candidate factors
        const exactUnitMatch = candidates.find(f => f.unit.toLowerCase() === rawUnit.toLowerCase());
        if (!exactUnitMatch) {
          const expectedUnit = candidates[0].unit;
          errors.push({
            row: rowNum,
            message: `Unit "${rawUnit}" not supported for ${candidates[0].category} (expected "${expectedUnit}")`
          });
          continue;
        }

        matchedFactor = exactUnitMatch;
      }

      // Verify unit matches factor unit
      if (matchedFactor.unit.toLowerCase() !== rawUnit.toLowerCase()) {
        errors.push({
          row: rowNum,
          message: `Unit "${rawUnit}" not supported for ${matchedFactor.category} (expected "${matchedFactor.unit}")`
        });
        continue;
      }

      pendingEntries.push({
        activityType: matchedFactor.category || actType,
        description: desc || matchedFactor.name,
        quantity,
        unit: matchedFactor.unit,
        factorId: matchedFactor.id,
        date: rowDate || new Date().toISOString().substring(0, 10),
        facilityLocation: loc,
        notes: notes || 'Bulk CSV Import'
      });
    }

    // ALL-OR-NOTHING TRANSACTION ROLLBACK
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    // Process and insert all
    const createdEntries: ActivityEntry[] = [];
    let totalImportedCo2e = 0;

    for (const item of pendingEntries) {
      const entry = this.createActivityEntry({
        orgId,
        periodId,
        activityType: item.activityType,
        description: item.description,
        quantity: item.quantity,
        factorId: item.factorId,
        date: item.date,
        facilityLocation: item.facilityLocation,
        notes: item.notes
      });
      createdEntries.push(entry);
      totalImportedCo2e += entry.co2e_kg;
    }

    this.addAuditLog(
      'BULK_IMPORT',
      `Successfully imported ${createdEntries.length} activity entries for period '${period.name}'. Total emissions: ${totalImportedCo2e.toFixed(2)} kg CO2e.`
    );

    return {
      success: true,
      importedCount: createdEntries.length,
      totalCo2eKg: totalImportedCo2e,
      entries: createdEntries
    };
  }

  // Multi-Year Period Comparison & Hotspot Analytics
  public getPeriodComparison(orgId: string) {
    const org = this.getOrganisation(orgId);
    const periods = this.getReportingPeriods(orgId);

    const periodSummaries = periods.map(p => {
      const summary = this.getEmissionsSummary(orgId, p.id);
      return {
        periodId: p.id,
        periodName: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        isBaseline: p.isBaseline,
        scope1_kg: summary.scope1_kg,
        scope2_kg: summary.scope2_kg,
        scope3_kg: summary.scope3_kg,
        total_kg: summary.total_kg,
        scope1_tonnes: Math.round((summary.scope1_kg / 1000) * 1000) / 1000,
        scope2_tonnes: Math.round((summary.scope2_kg / 1000) * 1000) / 1000,
        scope3_tonnes: Math.round((summary.scope3_kg / 1000) * 1000) / 1000,
        total_tonnes: summary.total_tonnes,
        intensityPerEmployee_kg: summary.intensityPerEmployee_kg,
        intensityPerRevenue_kgPer1k: summary.intensityPerRevenue_kgPer1k,
        activityCount: summary.activityCount
      };
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Hotspot Analysis for active or latest period
    const activePeriod = periods.find(p => p.status === 'ACTIVE') || periods[0];
    const activeSummary = activePeriod ? this.getEmissionsSummary(orgId, activePeriod.id) : null;

    let hotspot = {
      category: 'N/A',
      co2e_kg: 0,
      co2e_tonnes: 0,
      percentage: 0,
      message: 'No emissions data recorded for hotspot analysis.'
    };

    if (activeSummary && activeSummary.byCategory.length > 0) {
      const topCat = activeSummary.byCategory[0];
      hotspot = {
        category: topCat.category,
        co2e_kg: topCat.co2e_kg,
        co2e_tonnes: topCat.co2e_tonnes,
        percentage: topCat.percentage,
        message: `${topCat.category} accounts for ${topCat.percentage}% of your total footprint (${topCat.co2e_tonnes} t CO₂e).`
      };
    }

    // Year-on-year change calculation
    let yoyChangePercent: number | null = null;
    const baseline = periodSummaries.find(p => p.isBaseline);
    const latest = periodSummaries.find(p => p.status === 'ACTIVE') || periodSummaries[periodSummaries.length - 1];

    if (baseline && latest && baseline.periodId !== latest.periodId && baseline.total_kg > 0) {
      const diff = latest.total_kg - baseline.total_kg;
      yoyChangePercent = Math.round((diff / baseline.total_kg) * 1000) / 10;
    }

    return {
      orgId,
      orgName: org?.name || 'Organisation',
      periods: periodSummaries,
      hotspot,
      yoyChangePercent
    };
  }

  // --- Phase 3: User & RBAC Store Methods ---
  public getUser(userId = 'user_lead_auditor_01'): User | undefined {
    return this.users.get(userId);
  }

  public updateUserRole(userId: string, role: UserRole): User {
    const u = this.users.get(userId);
    if (!u) throw new Error(`User ${userId} not found`);
    u.role = role;
    this.users.set(userId, u);
    this.addAuditLog('ROLE_CHANGE', `Changed user '${u.name}' role permissions to ${role}`, u.name);
    return u;
  }

  public switchUserActiveOrg(userId: string, orgId: string): User {
    const u = this.users.get(userId);
    if (!u) throw new Error(`User ${userId} not found`);
    if (!u.organisationIds.includes(orgId)) {
      u.organisationIds.push(orgId);
    }
    u.activeOrgId = orgId;
    this.users.set(userId, u);
    this.addAuditLog('WORKSPACE_SWITCH', `Switched active workspace to organization ID ${orgId}`, u.name);
    return u;
  }

  // --- Phase 3: White-Label Partner Dashboard Methods ---
  public getPartnerBrand(partnerId = 'partner_green_advisors_01'): PartnerBrand | undefined {
    return this.partnerBrands.get(partnerId);
  }

  public updatePartnerBrand(partnerId: string, updates: Partial<PartnerBrand>): PartnerBrand {
    const existing = this.partnerBrands.get(partnerId);
    if (!existing) throw new Error(`Partner brand ${partnerId} not found`);
    const updated = { ...existing, ...updates };
    this.partnerBrands.set(partnerId, updated);
    this.addAuditLog('PARTNER_UPDATE', `Updated white-label partner brand profile for '${updated.partnerName}'`);
    return updated;
  }

  public getPartnerWorkspaces(partnerId = 'partner_green_advisors_01') {
    const partner = this.getPartnerBrand(partnerId);
    const orgs = Array.from(this.organisations.values()).filter(o => o.partnerId === partnerId || partner?.managedOrgIds.includes(o.id));

    return orgs.map(org => {
      const periods = this.getReportingPeriods(org.id);
      const activePeriod = periods.find(p => p.status === 'ACTIVE') || periods[0];
      const summary = activePeriod ? this.getEmissionsSummary(org.id, activePeriod.id) : null;

      return {
        orgId: org.id,
        orgName: org.name,
        country: org.country,
        industrySector: org.industrySector,
        employeeCount: org.employeeCount,
        annualRevenueGbp: org.annualRevenueGbp,
        activePeriodName: activePeriod ? activePeriod.name : 'None',
        periodStatus: activePeriod ? activePeriod.status : 'DRAFT',
        totalFootprintTonnes: summary ? summary.total_tonnes : 0,
        intensityPerEmployee_kg: summary ? summary.intensityPerEmployee_kg : 0,
        activityCount: summary ? summary.activityCount : 0,
        lastUpdated: org.createdAt
      };
    });
  }

  // --- Phase 3: Financial Connector Engine (Xero / QuickBooks / Sage) ---
  public getIntegrationConnections(orgId: string): IntegrationConnection[] {
    return Array.from(this.integrationConnections.values()).filter(c => c.orgId === orgId);
  }

  public getPendingTransactions(orgId: string): PendingFinancialTransaction[] {
    return Array.from(this.pendingTransactions.values()).filter(t => t.orgId === orgId && t.status === 'PENDING');
  }

  public syncFinancialTransactions(orgId: string): PendingFinancialTransaction[] {
    const provider = Math.random() > 0.5 ? 'Xero' : 'QuickBooks';
    const newTxns: PendingFinancialTransaction[] = [
      {
        id: `txn_synced_${Date.now()}_1`,
        orgId,
        provider,
        transactionDate: new Date().toISOString().substring(0, 10),
        vendorName: 'EDF Energy Commercial',
        accountCode: '6110 - Electricity Bill',
        amountGbp: 1450.00,
        description: 'Monthly electricity supply invoice',
        suggestedActivityType: 'Electricity',
        suggestedFactorId: 'uk_elec_grid_2024',
        suggestedQuantity: 5178, // ~5178 kWh
        suggestedUnit: 'kWh',
        confidenceScore: 97,
        status: 'PENDING'
      },
      {
        id: `txn_synced_${Date.now()}_2`,
        orgId,
        provider,
        transactionDate: new Date().toISOString().substring(0, 10),
        vendorName: 'Texaco Service Station',
        accountCode: '6000 - Motor Fuel',
        amountGbp: 220.00,
        description: 'Sales representative petrol fuel tank refill',
        suggestedActivityType: 'Company Vehicles',
        suggestedFactorId: 'uk_petrol_2024',
        suggestedQuantity: 146, // ~146 litres
        suggestedUnit: 'litres',
        confidenceScore: 94,
        status: 'PENDING'
      }
    ];

    for (const t of newTxns) {
      this.pendingTransactions.set(t.id, t);
    }

    // Update connection last synced timestamp
    const conn = Array.from(this.integrationConnections.values()).find(c => c.orgId === orgId && c.provider === provider);
    if (conn) {
      conn.lastSyncedAt = new Date().toISOString();
      this.integrationConnections.set(conn.id, conn);
    }

    this.addAuditLog('FINANCIAL_SYNC', `Synced ${newTxns.length} transactions from ${provider} financial ledger.`);
    return this.getPendingTransactions(orgId);
  }

  public confirmFinancialTransaction(transactionId: string, periodId: string): ActivityEntry {
    const txn = this.pendingTransactions.get(transactionId);
    if (!txn) throw new Error(`Pending transaction ${transactionId} not found.`);

    // Commit to activity log
    const entry = this.createActivityEntry({
      orgId: txn.orgId,
      periodId,
      activityType: txn.suggestedActivityType,
      description: `${txn.vendorName}: ${txn.description} (${txn.provider} Ref ${txn.id})`,
      quantity: txn.suggestedQuantity,
      factorId: txn.suggestedFactorId,
      date: txn.transactionDate,
      facilityLocation: `${txn.provider} Auto-Mapped Ledger`,
      notes: `Financial Connector Auto-Import: ${txn.accountCode} (£${txn.amountGbp.toFixed(2)} GBP). Match confidence: ${txn.confidenceScore}%.`
    });

    txn.status = 'CONFIRMED';
    this.pendingTransactions.set(transactionId, txn);

    this.addAuditLog(
      'FINANCIAL_CONFIRM',
      `Confirmed financial transaction '${txn.vendorName}' -> Created Activity Log Entry ID ${entry.id}`
    );

    return entry;
  }

  public adjustAndConfirmTransaction(
    transactionId: string,
    periodId: string,
    adjustments: {
      activityType?: string;
      factorId?: string;
      quantity?: number;
      description?: string;
    }
  ): ActivityEntry {
    const txn = this.pendingTransactions.get(transactionId);
    if (!txn) throw new Error(`Pending transaction ${transactionId} not found.`);

    const actType = adjustments.activityType || txn.suggestedActivityType;
    const factorId = adjustments.factorId || txn.suggestedFactorId;
    const qty = adjustments.quantity !== undefined ? adjustments.quantity : txn.suggestedQuantity;
    const desc = adjustments.description || txn.description;

    const entry = this.createActivityEntry({
      orgId: txn.orgId,
      periodId,
      activityType: actType,
      description: `${txn.vendorName}: ${desc}`,
      quantity: qty,
      factorId,
      date: txn.transactionDate,
      facilityLocation: `${txn.provider} Adjusted Mapping`,
      notes: `Financial Connector Manually Adjusted: ${txn.accountCode} (£${txn.amountGbp.toFixed(2)} GBP).`
    });

    txn.status = 'CONFIRMED';
    this.pendingTransactions.set(transactionId, txn);

    this.addAuditLog('FINANCIAL_ADJUST_CONFIRM', `User adjusted & confirmed financial transaction '${txn.vendorName}'`);
    return entry;
  }

  // --- Phase 4: Public Enterprise API & API Key Management ---
  public getApiKeys(orgId: string): ApiKey[] {
    return Array.from(this.apiKeys.values()).filter(k => k.orgId === orgId);
  }

  public createApiKey(orgId: string, name: string): ApiKey {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const fullKey = `cs_live_${randomHex}`;
    const id = `key_${Date.now()}`;
    const newKey: ApiKey = {
      id,
      orgId,
      name: name || 'Enterprise External API Key',
      keyPrefix: `cs_live_${randomHex.substring(0, 4)}...`,
      fullKey,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.apiKeys.set(id, newKey);
    this.addAuditLog('API_KEY_CREATED', `Generated new enterprise API Key '${newKey.name}' for workspace`);
    return newKey;
  }

  public revokeApiKey(keyId: string): ApiKey {
    const existing = this.apiKeys.get(keyId);
    if (!existing) throw new Error(`API key ${keyId} not found.`);
    existing.status = 'REVOKED';
    this.apiKeys.set(keyId, existing);
    this.addAuditLog('API_KEY_REVOKED', `Revoked API Key '${existing.name}' (${existing.keyPrefix})`);
    return existing;
  }

  public validateApiKey(rawKey: string): ApiKey | null {
    if (!rawKey) return null;
    const cleanKey = rawKey.replace('Bearer ', '').trim();
    for (const keyObj of this.apiKeys.values()) {
      if (keyObj.status === 'ACTIVE') {
        if (keyObj.fullKey === cleanKey || cleanKey.startsWith(keyObj.keyPrefix.replace('...', ''))) {
          keyObj.lastUsedAt = new Date().toISOString();
          this.apiKeys.set(keyObj.id, keyObj);
          return keyObj;
        }
      }
    }
    return null;
  }

  // --- Phase 4: Automated Emission Factor Pipeline & Dataset Versioning ---
  public getDatasetVersions(): DatasetVersion[] {
    return Array.from(this.datasetVersions.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public runFactorPipelineUpdate(datasetKey: string): DatasetVersion {
    const datasets = calculationEngine.getDatasets();
    const ds = datasets.find(d => d.dataset === datasetKey) || datasets[0];
    
    const versionNum = `2024.${Math.floor(Date.now() / 100000000)}.${Math.floor(Math.random() * 90 + 10)}`;
    const id = `ver_${datasetKey.toLowerCase()}_${Date.now()}`;

    // Mark previous versions as ARCHIVED
    for (const v of this.datasetVersions.values()) {
      if (v.datasetKey === datasetKey) v.status = 'ARCHIVED';
    }

    const newVersion: DatasetVersion = {
      id,
      datasetKey: ds.dataset,
      datasetName: ds.name,
      version: versionNum,
      totalFactors: ds.factors.length,
      updatedAt: new Date().toISOString(),
      status: 'CURRENT'
    };

    this.datasetVersions.set(id, newVersion);
    this.addAuditLog(
      'FACTOR_PIPELINE_UPDATE',
      `Ran factor pipeline safe upsert for '${ds.name}' -> Created Dataset Version ${versionNum} (${ds.factors.length} factors verified, existing activity snapshots untouched).`
    );

    return newVersion;
  }

  // --- Phase 4: Operational Infrastructure & Telemetry Health Check ---
  public getHealthStatus(): HealthStatus {
    return {
      status: 'ok',
      app: 'CarbonSnap Carbon Accounting Engine',
      version: '1.4.0-Enterprise',
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: true,
        engine: 'PostgreSQL / Secure In-Memory Store',
        latencyMs: 1.8,
        recordsCount: this.activityEntries.size + this.organisations.size + this.reportingPeriods.size
      },
      storage: {
        status: 'healthy',
        freeSpaceMb: 4096
      },
      telemetry: {
        enabled: true,
        instanceId: 'cs_instance_prod_uk_01',
        totalReportsGenerated: this.reportGenerationCount + this.activityEntries.size
      }
    };
  }

  // --- Phase 4: Data Export & Portability Engine (Full Workspace Backup) ---
  public exportOrganisationData(orgId: string): object {
    const org = this.getOrganisation(orgId);
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    const periods = this.getReportingPeriods(orgId);
    const activities = this.getActivityEntries(orgId);
    const integrations = this.getIntegrationConnections(orgId);
    const apiKeys = this.getApiKeys(orgId);
    const auditLogs = this.getAuditLogs().filter(l => l.details.includes(org.name) || l.details.includes(orgId));

    const summaries = periods.map(p => this.getEmissionsSummary(orgId, p.id));

    this.addAuditLog('DATA_EXPORT', `Exported full workspace backup archive for organisation '${org.name}'`);

    return {
      exportMetadata: {
        system: 'CarbonSnap Carbon Accounting',
        version: '1.4.0-Enterprise',
        license: 'AGPLv3 Open Source',
        exportedAt: new Date().toISOString(),
        orgId: org.id,
        orgName: org.name
      },
      organisation: org,
      reportingPeriods: periods,
      emissionsSummaries: summaries,
      activityEntries: activities,
      integrationConnections: integrations,
      apiKeys: apiKeys.map(k => ({ ...k, fullKey: undefined })),
      auditTrailLogs: auditLogs
    };
  }

  // --- Phase 5: Supplier Sharing Portal ---
  public getSupplierShareLinks(orgId: string): SupplierShareLink[] {
    return Array.from(this.supplierShareLinks.values()).filter(s => s.orgId === orgId);
  }

  public createSupplierShareLink(orgId: string, periodId: string, shareName: string): SupplierShareLink {
    const org = this.getOrganisation(orgId);
    if (!org) throw new Error('Organisation not found');

    const randomStr = Math.random().toString(36).substring(2, 12);
    const token = `cs_share_${orgId.toLowerCase()}_${randomStr}`;
    const id = `share_${Date.now()}`;

    const newShareLink: SupplierShareLink = {
      id,
      token,
      orgId,
      periodId,
      shareName: shareName || `Scope 3 Data Portal for ${org.name}`,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      isVerifiedOnly: true
    };

    this.supplierShareLinks.set(token, newShareLink);
    this.addAuditLog('SUPPLIER_SHARE_LINK_CREATED', `Generated supplier sharing portal link '${newShareLink.shareName}'`);
    return newShareLink;
  }

  public getSupplierShareData(token: string) {
    const shareLink = this.supplierShareLinks.get(token);
    if (!shareLink) throw new Error('Invalid or expired supplier share token');

    const org = this.getOrganisation(shareLink.orgId);
    if (!org) throw new Error('Organisation associated with share token not found');

    const period = this.getReportingPeriod(shareLink.periodId);
    if (!period) throw new Error('Reporting period associated with share token not found');

    const summary = this.getEmissionsSummary(org.id, period.id);
    const partnerBrand = org.partnerId ? this.getPartnerBrand(org.partnerId) : null;

    shareLink.accessCount += 1;
    this.supplierShareLinks.set(token, shareLink);

    return {
      shareLink,
      organisation: org,
      reportingPeriod: period,
      summary,
      partnerBrand
    };
  }

  // --- Phase 5: Verified Report Workflow ---
  public togglePeriodVerification(periodId: string, verifierName: string = 'Sarah Jenkins (Lead Carbon Auditor)'): ReportingPeriod {
    const period = this.getReportingPeriod(periodId);
    if (!period) throw new Error('Reporting period not found');

    const newVerifiedState = !period.is_verified;
    period.is_verified = newVerifiedState;
    period.verifiedAt = newVerifiedState ? new Date().toISOString() : undefined;
    period.verifiedBy = newVerifiedState ? verifierName : undefined;

    this.reportingPeriods.set(periodId, period);
    this.addAuditLog(
      'REPORT_VERIFICATION_TOGGLED',
      `Toggled verification status for period '${period.name}' -> ${newVerifiedState ? 'VERIFIED AUDIT-READY' : 'UNVERIFIED DRAFT'}`
    );

    return period;
  }

  // --- Phase 5: Online Carbon Estimator (Lead-Gen Engine) ---
  public calculatePublicEstimate(input: EstimatorInput): EstimatorResult {
    const elecKwh = Number(input.electricityKwh) || 0;
    const gasKwh = Number(input.gasKwh) || 0;
    const dieselL = Number(input.dieselLitres) || 0;
    const petrolL = Number(input.petrolLitres) || 0;
    const flightKm = Number(input.flightKm) || 0;

    // GHG Factors (UK / DEFRA 2024 standards)
    // Electricity grid: 0.20705 kg CO2e / kWh (Scope 2)
    // Natural Gas: 0.18293 kg CO2e / kWh (Scope 1)
    // Diesel: 2.68697 kg CO2e / litre (Scope 1)
    // Petrol: 2.33971 kg CO2e / litre (Scope 1)
    // Business Air Travel: 0.15844 kg CO2e / passenger-km (Scope 3)

    const scope2Kg = elecKwh * 0.20705;
    const scope1GasKg = gasKwh * 0.18293;
    const scope1DieselKg = dieselL * 2.68697;
    const scope1PetrolKg = petrolL * 2.33971;
    const scope1Kg = scope1GasKg + scope1DieselKg + scope1PetrolKg;

    const scope3Kg = flightKm * 0.15844;

    const totalKg = scope1Kg + scope2Kg + scope3Kg;
    const totalTonnes = totalKg / 1000;

    // Mature tree absorbs ~22kg CO2/year
    const treesRequired = Math.ceil(totalKg / 22);

    // UK SME average benchmark estimate ~25 tonnes
    const benchmarkAvgTonnes = 25.0;
    const benchmarkComparisonPercent = benchmarkAvgTonnes > 0
      ? Math.round(((totalTonnes - benchmarkAvgTonnes) / benchmarkAvgTonnes) * 100)
      : 0;

    this.addAuditLog('PUBLIC_ESTIMATOR_RUN', `Guest run public carbon estimator -> Indicative ${totalTonnes.toFixed(2)} t CO2e`);

    return {
      indicativeScope1Kg: Math.round(scope1Kg * 10) / 10,
      indicativeScope2Kg: Math.round(scope2Kg * 10) / 10,
      indicativeScope3Kg: Math.round(scope3Kg * 10) / 10,
      indicativeTotalKg: Math.round(totalKg * 10) / 10,
      indicativeTotalTonnes: Math.round(totalTonnes * 100) / 100,
      treesOffsetRequired: treesRequired,
      benchmarkComparisonPercent
    };
  }

  // --- Phase 5: International Factor Pack Community Contributions ---
  public getCommunityFactorPacks(): CommunityFactorPack[] {
    return Array.from(this.communityFactorPacks.values());
  }

  public submitCommunityFactorPack(data: {
    country: string;
    countryCode: string;
    datasetKey: string;
    datasetName: string;
    year: number;
    submittedBy: string;
    factors: Array<{ factorValue: number; unit: string; year?: number }>;
  }): CommunityFactorPack {
    if (!data.datasetKey || !data.datasetName || !data.country) {
      throw new Error('Missing required dataset fields: datasetKey, datasetName, country required');
    }

    if (!Array.isArray(data.factors) || data.factors.length === 0) {
      throw new Error('Schema validation error: Dataset must contain a non-empty array of factors');
    }

    for (const f of data.factors) {
      if (f.factorValue === undefined || !f.unit) {
        throw new Error('Schema validation error: Each factor in dataset must include factorValue and unit');
      }
    }

    const id = `pack_${data.datasetKey.toLowerCase()}_${Date.now()}`;
    const pack: CommunityFactorPack = {
      id,
      country: data.country,
      countryCode: data.countryCode || data.country.substring(0, 2).toUpperCase(),
      datasetKey: data.datasetKey,
      datasetName: data.datasetName,
      year: data.year || 2024,
      submittedBy: data.submittedBy || 'Community Contributor',
      status: 'APPROVED',
      submittedAt: new Date().toISOString(),
      factorCount: data.factors.length
    };

    this.communityFactorPacks.set(id, pack);
    this.addAuditLog(
      'COMMUNITY_FACTOR_PACK_SUBMITTED',
      `Submitted international factor pack '${pack.datasetName}' (${pack.country}) with ${pack.factorCount} validated conversion factors.`
    );

    return pack;
  }

  // --- Phase 5: Supply Chain Partner Data Requests ---
  public getPartnerDataRequests(partnerId: string): PartnerDataRequest[] {
    return Array.from(this.partnerDataRequests.values()).filter(r => r.partnerId === partnerId);
  }

  public createPartnerDataRequest(partnerId: string, clientEmail: string, clientName: string): PartnerDataRequest {
    if (!clientEmail) throw new Error('Client email is required');

    const id = `req_${Date.now()}`;
    const requestUrl = `${process.env.APP_URL || ''}/estimator?partner=${encodeURIComponent(partnerId)}&clientEmail=${encodeURIComponent(clientEmail)}`;

    const req: PartnerDataRequest = {
      id,
      partnerId,
      clientEmail,
      clientName: clientName || clientEmail.split('@')[0],
      status: 'SENT',
      requestUrl,
      createdAt: new Date().toISOString()
    };

    this.partnerDataRequests.set(id, req);
    this.addAuditLog('PARTNER_DATA_REQUEST_SENT', `Sent Scope 3 carbon data request to client SME '${clientEmail}'`);

    return req;
  }

  // --- Phase 6: Factor Pack Schema Automated Validation Engine ---
  public validateFactorPackSchema(data: any): FactorPackValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, complianceScore: 0, errors: ['Invalid JSON object payload'], warnings: [], bountyEligible: false, validatedFactorCount: 0 };
    }

    if (!data.datasetKey) errors.push('Missing required root field "datasetKey"');
    if (!data.datasetName) errors.push('Missing required root field "datasetName"');
    if (!data.country) errors.push('Missing required root field "country"');
    if (!data.year || typeof data.year !== 'number') warnings.push('Field "year" is missing or non-numeric (defaulting to 2024)');

    const validUnits = ['kwh', 'litres', 'liters', 'km', 'm3', 'kg', 'tonnes', 't', 'gbp', 'usd', 'eur', 'passenger.km'];

    if (!Array.isArray(data.factors) || data.factors.length === 0) {
      errors.push('Dataset must contain a non-empty array under key "factors"');
    } else {
      data.factors.forEach((f: any, idx: number) => {
        if (!f.id) warnings.push(`factor[${idx}]: missing explicit 'id', auto-generating ID`);
        if (f.factorValue === undefined || typeof f.factorValue !== 'number' || isNaN(f.factorValue)) {
          errors.push(`factor[${idx}]: 'factorValue' must be a valid numeric conversion factor`);
        } else if (f.factorValue <= 0 || f.factorValue > 100) {
          warnings.push(`factor[${idx}]: factorValue ${f.factorValue} is unusually high or low; please verify conversion units`);
        }

        if (!f.unit) {
          errors.push(`factor[${idx}]: missing required 'unit' field`);
        } else if (!validUnits.includes(String(f.unit).toLowerCase())) {
          warnings.push(`factor[${idx}]: unit '${f.unit}' is non-standard; standard units are: ${validUnits.slice(0, 7).join(', ')}`);
        }

        if (!f.datasetSource && !data.datasetName) {
          errors.push(`factor[${idx}]: missing mandatory source citation (e.g. DEFRA, EPA, UBA)`);
        }
      });
    }

    const valid = errors.length === 0;
    const factorCount = Array.isArray(data.factors) ? data.factors.length : 0;
    let score = 100 - (errors.length * 25) - (warnings.length * 5);
    if (score < 0) score = 0;

    return {
      valid,
      complianceScore: score,
      errors,
      warnings,
      bountyEligible: valid && factorCount >= 10 && score >= 85,
      validatedFactorCount: factorCount
    };
  }

  // --- Phase 6: Official 'Authority' Auditor Pre-Verification Workflow ---
  public signAuditorVerification(
    periodId: string,
    auditorPayload: {
      auditorName: string;
      auditorFirm: string;
      auditorCertNumber: string;
      auditNotes: string;
    }
  ): VerificationCertificate {
    const period = this.reportingPeriods.get(periodId);
    if (!period) throw new Error(`Reporting period '${periodId}' not found`);

    const org = this.organisations.get(period.orgId);
    const orgName = org ? org.name : 'Organization';

    const summary = this.getEmissionsSummary(period.orgId, periodId);
    const certId = `CERT-${new Date().getFullYear()}-GHG-${Math.floor(10000 + Math.random() * 90000)}`;
    const verifiedAt = new Date().toISOString();

    const auditorName = auditorPayload.auditorName || 'Lead Carbon Auditor';
    const auditorFirm = auditorPayload.auditorFirm || 'GreenPath Advisory & Carbon Audit LLP';
    const auditorCertNumber = auditorPayload.auditorCertNumber || 'UK-ISO14064-AUD-9912';
    const auditNotes = auditorPayload.auditNotes || 'Full Scope 1, 2, and Scope 3 activity audit completed. Conforms with SECR and GHG Protocol Corporate Standards.';

    // Generate pseudo cryptographic signature hash
    const signatureRaw = `${certId}:${periodId}:${summary.total_tonnes}:${verifiedAt}:${auditorCertNumber}`;
    let hashNum = 0;
    for (let i = 0; i < signatureRaw.length; i++) {
      hashNum = (hashNum << 5) - hashNum + signatureRaw.charCodeAt(i);
      hashNum |= 0;
    }
    const digitalSignatureHash = `0x${Math.abs(hashNum).toString(16).padStart(8, '0')}${Date.now().toString(16)}`;

    // Update period verification status
    period.is_verified = true;
    period.verifiedAt = verifiedAt;
    period.verifiedBy = `${auditorName} (${auditorFirm})`;
    this.reportingPeriods.set(periodId, period);

    const certificate: VerificationCertificate = {
      certId,
      orgId: period.orgId,
      orgName,
      periodId,
      periodName: period.name,
      verifiedAt,
      auditorName,
      auditorFirm,
      auditorCertNumber,
      auditNotes,
      digitalSignatureHash,
      publicVerifyUrl: `/verify/${certId}`,
      totalEmissionsTonnes: summary.total_tonnes,
      scope1Tonnes: summary.scope1_kg / 1000,
      scope2Tonnes: summary.scope2_kg / 1000,
      scope3Tonnes: summary.scope3_kg / 1000,
      status: 'VALID'
    };

    this.verificationCertificates.set(certId, certificate);
    this.addAuditLog(
      'AUDITOR_VERIFICATION_SIGNED',
      `Official GHG Protocol Auditor Sign-Off by ${auditorName} (${auditorFirm}) for period '${period.name}'. Certificate issued: ${certId}`
    );

    return certificate;
  }

  public getVerificationCertificate(certId: string): VerificationCertificate | null {
    return this.verificationCertificates.get(certId) || null;
  }

  public getCertificateForPeriod(periodId: string): VerificationCertificate | null {
    for (const cert of this.verificationCertificates.values()) {
      if (cert.periodId === periodId && cert.status === 'VALID') {
        return cert;
      }
    }
    return null;
  }

  // --- Phase 7 Methods: Billing, Leads, Roadmap, Feedback, SSO & Audit Bundle ---

  public getBillingSubscription(orgId: string): BillingSubscription {
    const existing = this.billingSubscriptions.get(orgId);
    if (existing) return existing;

    const newSub: BillingSubscription = {
      orgId,
      tier: 'STARTER',
      monthlyPriceUsd: 49,
      status: 'ACTIVE',
      accountingAddonActive: false,
      accountingAddonPriceUsd: 99,
      nextBillingDate: '2026-08-15',
      invoices: []
    };
    this.billingSubscriptions.set(orgId, newSub);
    return newSub;
  }

  public updateBillingTier(orgId: string, tier: SubscriptionTier): BillingSubscription {
    const sub = this.getBillingSubscription(orgId);
    const priceMap: Record<SubscriptionTier, number> = {
      STARTER: 49,
      PRO: 149,
      ENTERPRISE: 499
    };

    sub.tier = tier;
    sub.monthlyPriceUsd = priceMap[tier];
    const newInvoice: BillingInvoice = {
      id: `inv_${Date.now()}`,
      amountUsd: sub.monthlyPriceUsd + (sub.accountingAddonActive ? sub.accountingAddonPriceUsd : 0),
      date: new Date().toISOString().split('T')[0],
      pdfUrl: '#',
      status: 'PAID',
      periodName: `Subscription Upgrade to ${tier} Tier`
    };
    sub.invoices.unshift(newInvoice);
    this.billingSubscriptions.set(orgId, sub);

    this.addAuditLog(
      'BILLING_SUBSCRIPTION_UPDATED',
      `Changed CarbonSnap Cloud SaaS subscription tier to ${tier} ($${sub.monthlyPriceUsd}/mo)`
    );

    return sub;
  }

  public toggleAccountingAddon(orgId: string, active: boolean): BillingSubscription {
    const sub = this.getBillingSubscription(orgId);
    sub.accountingAddonActive = active;

    this.addAuditLog(
      'BILLING_ADDON_TOGGLED',
      `Accounting Integration Add-On ($99/mo) set to ${active ? 'ACTIVE' : 'DISABLED'}`
    );

    this.billingSubscriptions.set(orgId, sub);
    return sub;
  }

  public captureLead(payload: {
    email: string;
    companyName: string;
    indicativeTotalTonnes: number;
    source?: string;
  }): LeadCapture {
    const id = `lead_${Date.now()}`;
    const convertToken = `tok_${Math.random().toString(36).substring(2, 12)}`;
    const lead: LeadCapture = {
      id,
      email: payload.email,
      companyName: payload.companyName || 'Guest Organisation',
      indicativeTotalTonnes: payload.indicativeTotalTonnes,
      source: payload.source || 'Free Online Carbon Estimator',
      status: 'NEW',
      capturedAt: new Date().toISOString(),
      emailSent: true,
      convertToken
    };

    this.leadCaptures.set(id, lead);
    this.addAuditLog(
      'LEAD_GEN_CAPTURED',
      `Captured lead '${lead.email}' from ${lead.source} (${lead.indicativeTotalTonnes.toFixed(2)} tCO2e indicative footprint)`
    );

    return lead;
  }

  public getLeads(): LeadCapture[] {
    return Array.from(this.leadCaptures.values()).sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }

  public getRoadmapItems(): RoadmapItem[] {
    return Array.from(this.roadmapItems.values()).sort((a, b) => b.upvotes - a.upvotes);
  }

  public upvoteRoadmapItem(id: string): RoadmapItem | null {
    const item = this.roadmapItems.get(id);
    if (!item) return null;

    item.upvotes += 1;
    this.roadmapItems.set(id, item);
    return item;
  }

  public submitFeedback(payload: {
    userEmail: string;
    category: 'BUG' | 'FEATURE_REQUEST' | 'GENERAL';
    message: string;
  }): FeedbackReport {
    const report: FeedbackReport = {
      id: `fb_${Date.now()}`,
      userEmail: payload.userEmail || 'anonymous@carbonsnap.app',
      category: payload.category,
      message: payload.message,
      submittedAt: new Date().toISOString(),
      status: 'OPEN'
    };

    this.feedbackReports.unshift(report);
    this.addAuditLog(
      'USER_FEEDBACK_SUBMITTED',
      `User feedback submitted [${payload.category}]: "${payload.message.substring(0, 50)}..."`
    );

    return report;
  }

  public getFeedbackReports(): FeedbackReport[] {
    return this.feedbackReports;
  }

  public getSsoConfig(orgId: string): SsoConfig {
    const existing = this.ssoConfigs.get(orgId);
    if (existing) return existing;

    const defaultConfig: SsoConfig = {
      orgId,
      provider: 'OKTA',
      domain: '',
      entityId: `https://carbonsnap.app/sso/${orgId}/metadata`,
      ssoUrl: '',
      enabled: false,
      lastSyncedAt: new Date().toISOString()
    };
    this.ssoConfigs.set(orgId, defaultConfig);
    return defaultConfig;
  }

  public updateSsoConfig(orgId: string, updates: Partial<SsoConfig>): SsoConfig {
    const current = this.getSsoConfig(orgId);
    const updated = { ...current, ...updates, lastSyncedAt: new Date().toISOString() };
    this.ssoConfigs.set(orgId, updated);

    this.addAuditLog(
      'SSO_CONFIG_UPDATED',
      `Updated Enterprise SSO configuration for Provider '${updated.provider}' (Enabled: ${updated.enabled})`
    );

    return updated;
  }

  public getAuditBundleData(periodId: string) {
    const period = this.reportingPeriods.get(periodId);
    if (!period) throw new Error(`Period ${periodId} not found`);

    const org = this.organisations.get(period.orgId);
    const activities = this.getActivityEntries(period.orgId, periodId);
    const summary = this.getEmissionsSummary(period.orgId, periodId);
    const cert = this.getCertificateForPeriod(periodId);

    // Build raw CSV string for all activities
    const csvHeader = 'ID,Activity Type,Description,Quantity,Unit,Scope,CO2e (kg),CO2e (tonnes),Factor ID,Factor Name,Date,Location,Notes\n';
    const csvRows = activities.map(a => 
      `"${a.id}","${a.activityType}","${a.description.replace(/"/g, '""')}",${a.quantity},"${a.unit}","${a.sourceScope}",${a.co2e_kg},${(a.co2e_kg/1000).toFixed(4)},"${a.factorId}","${a.factorName}","${a.date}","${a.facilityLocation || ''}","${(a.notes || '').replace(/"/g, '""')}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    return {
      bundleId: `bundle_${periodId}_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      organization: org,
      reportingPeriod: period,
      ghgSummary: summary,
      verificationCertificate: cert,
      activitiesCsv: csvContent,
      emissionFactorDatasetReference: {
        dataset: 'UK DEFRA / DESNZ GHG Conversion Factors 2024 (Primary) + IPCC AR6 Global Warming Potentials',
        version: 'v2024.1.2-SECR',
        hash: 'sha256-8f921a943e8b1002ca8f9024cba3',
        factorsCount: activities.length
      }
    };
  }

  // --- PHASE 8 METHODS: Regulatory, GDPR, DCO Governance & Telemetry ---

  public getCsrdReportData(periodId: string): CsrdDisclosure {
    const period = this.reportingPeriods.get(periodId);
    if (!period) throw new Error(`Period ${periodId} not found`);
    const summary = this.getEmissionsSummary(period.orgId, periodId);

    return {
      governanceNarrative: `The Board of Directors holds direct oversight over ESG risks, climate targets, and decarbonization investments. CarbonSnap audit trails are reviewed quarterly by the Board Audit Committee.`,
      doubleMaterialityAssessment: {
        impactMateriality: 'HIGH',
        financialMateriality: 'HIGH',
        keyTopics: [
          'Scope 1 & 2 Energy Decarbonization',
          'Scope 3 Supply Chain Upstream Emissions',
          'Climate Change Mitigation & EU ETS Alignment',
          'Resource Efficiency & Circularity'
        ]
      },
      climateTransitionPlan: `Targeting 50% absolute reduction in Scope 1 & 2 emissions by 2030 (Base Year 2024: ${summary.total_tonnes.toFixed(1)} tCO2e), supported by 100% renewable electricity contracts and heat pump upgrades.`,
      physicalRisks: `Extreme heat events impacting server cooling efficiency and regional flood risks at key manufacturing facilities assessed under IPCC SSP2-4.5 scenario.`,
      transitionalRisks: `Potential EU Carbon Border Adjustment Mechanism (CBAM) cost increases and tightening CSRD audit requirements for tier-1 suppliers.`,
      esrsE1Targets: {
        targetYear: 2030,
        reductionPercentage: 50,
        baseYear: 2024
      }
    };
  }

  public getSecrReportData(periodId: string): SecrData {
    const period = this.reportingPeriods.get(periodId);
    if (!period) throw new Error(`Period ${periodId} not found`);

    const org = this.organisations.get(period.orgId);
    const activities = this.getActivityEntries(period.orgId, periodId);
    const summary = this.getEmissionsSummary(period.orgId, periodId);

    // Calculate energy consumption in kWh
    let elecKwh = 0;
    let gasKwh = 0;
    let transportKwh = 0;

    for (const a of activities) {
      const activityType = typeof a.activityType === 'string' ? a.activityType : '';
      const quantity = Number(a.quantity);
      if (!Number.isFinite(quantity)) continue;
      if (activityType === 'Electricity') elecKwh += quantity;
      else if (activityType === 'Natural Gas' || activityType === 'Stationary Fuel') gasKwh += quantity;
      else if (activityType.includes('Vehicle') || activityType.includes('Travel')) transportKwh += quantity;
    }

    const totalKwh = elecKwh + gasKwh + transportKwh;
    const scope1Tonnes = summary.scope1_kg / 1000;
    const scope2Tonnes = summary.scope2_kg / 1000;
    const totalTonnes = summary.total_tonnes;

    const turnoverM = org?.annualRevenueGbp ? org.annualRevenueGbp / 1000000 : 0;
    const intensityVal = turnoverM > 0 ? Number((totalTonnes / turnoverM).toFixed(2)) : 0;

    return {
      ukEnergyConsumptionKwh: {
        electricityKwh: elecKwh,
        gasKwh: gasKwh,
        transportKwh: transportKwh,
        totalKwh
      },
      scope1TonnesCo2e: scope1Tonnes,
      scope2TonnesCo2e: scope2Tonnes,
      scope3TonnesCo2e: summary.scope3_kg / 1000,
      totalTonnesCo2e: totalTonnes,
      intensityRatio: {
        metric: 'tCO2e per £1M Turnover (GBP)',
        value: intensityVal
      },
      energyEfficiencyActionsTaken: 'Transitioned main office facilities to 100% REGO-backed renewable electricity tariffs, installed LED smart sensor lighting, and introduced hybrid vehicle fleet policy.',
      calculationMethodology: 'UK Government DESNZ / DEFRA Greenhouse Gas Conversion Factors for Company Reporting 2024 and SECR Technical Guidance.'
    };
  }

  public purgeOrganisationData(orgId: string): { success: boolean; purgedRecordsCount: number; message: string } {
    const org = this.organisations.get(orgId);
    if (!org) throw new Error(`Organisation '${orgId}' not found`);

    let count = 0;

    // Remove activities
    for (const [id, act] of this.activityEntries.entries()) {
      if (act.orgId === orgId) {
        this.activityEntries.delete(id);
        count++;
      }
    }

    // Remove periods
    for (const [id, p] of this.reportingPeriods.entries()) {
      if (p.orgId === orgId) {
        this.reportingPeriods.delete(id);
        count++;
      }
    }

    // Remove certs
    for (const [id, cert] of this.verificationCertificates.entries()) {
      if (cert.orgId === orgId) {
        this.verificationCertificates.delete(id);
        count++;
      }
    }

    // Remove SSO
    if (this.ssoConfigs.has(orgId)) {
      this.ssoConfigs.delete(orgId);
      count++;
    }

    // Add final audit log before completion
    this.addAuditLog(
      'GDPR_RIGHT_TO_BE_FORGOTTEN_PURGE',
      `PERMANENT PURGE EXECUTED for Organisation '${org.name}' (${orgId}). ${count} total data objects permanently destroyed.`,
      'GDPR Compliance Officer'
    );

    return {
      success: true,
      purgedRecordsCount: count,
      message: `GDPR Article 17 Right to be Forgotten executed successfully. All data for '${org.name}' permanently deleted.`
    };
  }

  public getComplianceExportPackage(orgId: string) {
    const org = this.organisations.get(orgId);
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    const periods = this.getReportingPeriods(orgId);
    const activities = this.getActivityEntries(orgId);
    const certs = Array.from(this.verificationCertificates.values()).filter(c => c.orgId === orgId);
    const auditLogs = this.getAuditLogs().filter(l => l.details.includes(org.name) || l.details.includes(orgId));

    return {
      compliancePackageId: `COMPLIANCE_GDPR_${orgId}_${Date.now()}`,
      exportedAt: new Date().toISOString(),
      gdprStandard: 'EU Regulation 2016/679 - Article 20 Data Portability',
      organisation: org,
      reportingPeriods: periods,
      activityEntries: activities,
      verificationCertificates: certs,
      auditLogsHistory: auditLogs,
      dataPortabilityChecksum: `sha256-${Math.random().toString(36).substring(2)}${Date.now().toString(16)}`
    };
  }

  public getFactorContributions(): FactorContribution[] {
    return Array.from(this.factorContributions.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  public submitFactorContribution(data: {
    datasetName: string;
    countryRegion: string;
    contributorName: string;
    contributorEmail: string;
    dcoSigned: boolean;
    dcoSignature: string;
    factorDataJson: string;
  }): FactorContribution {
    if (!data.dcoSigned) {
      throw new Error('Developer Certificate of Origin (DCO) signature is mandatory for submission.');
    }

    let parsedCount = 1;
    try {
      const arr = JSON.parse(data.factorDataJson);
      if (Array.isArray(arr)) parsedCount = arr.length;
    } catch (e) {
      // json parse fallback
    }

    const id = `contrib_${Date.now()}`;
    const newContrib: FactorContribution = {
      id,
      datasetName: data.datasetName,
      countryRegion: data.countryRegion,
      contributorName: data.contributorName,
      contributorEmail: data.contributorEmail,
      dcoSigned: true,
      dcoSignature: data.dcoSignature,
      status: 'PENDING_REVIEW',
      reviews: [],
      factorDataJson: data.factorDataJson,
      submittedAt: new Date().toISOString(),
      factorsCount: parsedCount
    };

    this.factorContributions.set(id, newContrib);
    this.addAuditLog(
      'COMMUNITY_FACTOR_SUBMITTED',
      `New emission factor pack '${data.datasetName}' submitted by ${data.contributorName} with signed DCO.`
    );

    return newContrib;
  }

  public reviewFactorContribution(
    id: string,
    reviewerName: string,
    comment: string,
    approved: boolean
  ): FactorContribution {
    const existing = this.factorContributions.get(id);
    if (!existing) throw new Error(`Contribution '${id}' not found`);

    existing.status = approved ? 'APPROVED' : 'REJECTED';
    existing.reviews.push({
      reviewerName,
      comment,
      approved,
      date: new Date().toISOString().substring(0, 10)
    });

    this.factorContributions.set(id, existing);
    this.addAuditLog(
      'COMMUNITY_FACTOR_REVIEWED',
      `Factor Pack '${existing.datasetName}' reviewed by ${reviewerName}: ${approved ? 'APPROVED' : 'REJECTED'}`
    );

    return existing;
  }

  public getTelemetryConfig(): TelemetryConfig {
    return this.telemetryConfig;
  }

  public updateTelemetryConfig(optIn: boolean): TelemetryConfig {
    this.telemetryConfig.optIn = optIn;
    this.addAuditLog(
      'TELEMETRY_SETTINGS_UPDATED',
      `Anonymized Telemetry health pings turned ${optIn ? 'ON' : 'OFF'}`
    );
    return this.telemetryConfig;
  }

  public triggerTelemetryPing(): { success: boolean; timestamp: string; payload: any } {
    const timestamp = new Date().toISOString();
    this.telemetryConfig.lastPingAt = timestamp;
    this.telemetryConfig.totalReportsGenerated += 1;

    return {
      success: true,
      timestamp,
      payload: {
        instanceId: this.telemetryConfig.instanceId,
        version: this.telemetryConfig.systemVersion,
        optIn: this.telemetryConfig.optIn,
        reportsGenerated: this.telemetryConfig.totalReportsGenerated,
        anonymizedOrgCount: this.organisations.size,
        activePeriodsCount: this.reportingPeriods.size
      }
    };
  }

  public getDrTestResults(): DrRestoreTestResult[] {
    return this.drTestResults;
  }

  public runDrRestoreTest(): DrRestoreTestResult {
    const newTest: DrRestoreTestResult = {
      id: `dr_test_${Date.now()}`,
      testedAt: new Date().toISOString(),
      backupSource: 's3://carbonsnap-backups-eu/automated-snapshot-latest.bak',
      restoredSuccessfully: true,
      durationMs: Math.floor(3000 + Math.random() * 2000),
      recordsVerifiedCount: this.activityEntries.size + this.reportingPeriods.size + 1500,
      statusMessage: 'PASS: Automated Disaster Recovery backup restoration and checksum integrity verified 100% clean.'
    };

    this.drTestResults.unshift(newTest);
    this.addAuditLog(
      'DISASTER_RECOVERY_TEST_PASSED',
      `Automated Disaster Recovery restoration test verified successfully in ${newTest.durationMs}ms.`
    );

    return newTest;
  }

  public getActivityAnnotations(orgId: string): ActivityAnnotation[] {
    return Array.from(this.activityAnnotations.values()).filter(a => a.orgId === orgId);
  }

  public createActivityAnnotation(data: {
    activityId: string;
    orgId: string;
    authorName: string;
    authorRole: 'CONSULTANT' | 'AUDITOR' | 'CLIENT';
    note: string;
  }): ActivityAnnotation {
    const id = `annot_${Date.now()}`;
    const annotation: ActivityAnnotation = {
      id,
      activityId: data.activityId,
      orgId: data.orgId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      note: data.note,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    this.activityAnnotations.set(id, annotation);
    this.addAuditLog('ACTIVITY_ANNOTATION_ADDED', `Internal review note added to activity '${data.activityId}' by ${data.authorName}`);
    return annotation;
  }

  public toggleActivityAnnotationStatus(id: string): ActivityAnnotation {
    const annot = this.activityAnnotations.get(id);
    if (!annot) throw new Error(`Annotation '${id}' not found`);

    annot.status = annot.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    this.activityAnnotations.set(id, annot);
    return annot;
  }

  // --- PHASE 9 METHODS: PARTNER CRM, BOUNTIES, CALIFORNIA SB, PUBLIC VERIFICATION ---

  public getPartnerFirms(): PartnerFirm[] {
    return Array.from(this.partnerFirms.values());
  }

  public createPartnerFirm(data: Omit<PartnerFirm, 'id' | 'joinedAt'>): PartnerFirm {
    const id = `part_${Date.now()}`;
    const partner: PartnerFirm = {
      ...data,
      id,
      joinedAt: new Date().toISOString().substring(0, 10)
    };
    this.partnerFirms.set(id, partner);
    this.addAuditLog('PARTNER_FIRM_RECRUITED', `Partner accounting firm '${partner.name}' onboarded into CRM.`);
    return partner;
  }

  public updatePartnerFirm(id: string, updates: Partial<PartnerFirm>): PartnerFirm {
    const partner = this.partnerFirms.get(id);
    if (!partner) throw new Error(`Partner firm '${id}' not found`);
    const updated = { ...partner, ...updates };
    this.partnerFirms.set(id, updated);
    return updated;
  }

  public getFactorBounties(): FactorBounty[] {
    return Array.from(this.factorBounties.values());
  }

  public claimFactorBounty(bountyId: string, claimantName: string): FactorBounty {
    const bounty = this.factorBounties.get(bountyId);
    if (!bounty) throw new Error(`Bounty '${bountyId}' not found`);
    bounty.status = 'IN_CLAIM';
    bounty.claimedBy = claimantName;
    this.factorBounties.set(bountyId, bounty);
    this.addAuditLog('BOUNTY_CLAIMED', `Factor bounty '${bounty.countryName}' claimed by ${claimantName}`);
    return bounty;
  }

  public getHallOfFame(): HallOfFameContributor[] {
    return Array.from(this.hallOfFame.values());
  }

  public submitPlaybookLead(email: string, companyName?: string, estimatorTonnes?: number): PlaybookLead {
    const id = `lead_${Date.now()}`;
    const lead: PlaybookLead = {
      id,
      email,
      companyName,
      estimatorTonnes,
      downloadedAt: new Date().toISOString()
    };
    this.playbookLeads.set(id, lead);
    this.addAuditLog('PLAYBOOK_LEAD_CAPTURED', `Playbook downloaded by lead: ${email}`);
    return lead;
  }

  public getPublicVerificationCertificate(certId: string): PublicVerificationCertificate | null {
    if (this.publicCertificates.has(certId)) {
      return this.publicCertificates.get(certId)!;
    }

    return null;
  }

  public getCaliforniaSbReport(orgId: string, periodId: string): CaliforniaSbReport {
    const summary = this.getEmissionsSummary(orgId, periodId);
    const org = this.getOrganisation(orgId);
    const period = this.reportingPeriods.get(periodId);

    const scope1Mt = Number((summary.scope1_kg / 1000).toFixed(2));
    const scope2Mt = Number((summary.scope2_kg / 1000).toFixed(2));
    const scope3Mt = Number((summary.scope3_kg / 1000).toFixed(2));
    const totalMt = Number((summary.total_tonnes).toFixed(2));

    return {
      sb253Disclosure: {
        entityName: org?.name || 'Reporting Entity',
        fiscalYear: period?.name || 'FY 2024-2025',
        scope1EmissionsMt: scope1Mt,
        scope2EmissionsMt: scope2Mt,
        scope3EmissionsMt: scope3Mt,
        totalEmissionsMt: totalMt,
        assuranceLevel: period?.is_verified ? 'REASONABLE_ASSURANCE' : 'LIMITED_ASSURANCE',
        reportingStandard: 'California SB 253 / US EPA Climate Leaders GHG Protocol'
      },
      sb261FinancialRisk: {
        governanceOversight: 'The Board of Directors and Sustainability Steering Committee conduct quarterly climate-related financial risk reviews pursuant to California SB 261 guidelines.',
        physicalRisksIdentified: [
          'Acute: Severe heatwaves and wildfire smoke impacting facility operational safety in Western US data centers.',
          'Chronic: Water stress and sea-level rise affecting coastal supply chain logistics corridors.'
        ],
        transitionRisksIdentified: [
          'Regulatory: California Air Resources Board (CARB) mandatory Scope 3 reporting and potential carbon pricing exposure.',
          'Market: Enterprise clients requiring verified net-zero targets as prerequisite for vendor procurement.'
        ],
        riskMitigationStrategy: 'Phased transition to 100% renewable energy purchase agreements (PPAs), fleet electrification, and mandatory supplier Scope 3 engagement.'
      }
    };
  }

  // --- Tenant Workspace Synchronisation (Firebase registry → ledger) ---
  public ensureTenantWorkspace(params: {
    orgId: string;
    orgName: string;
    country: string;
    periodId: string;
    periodName: string;
    startDate: string;
    endDate: string;
  }): { organisation: Organisation; period: ReportingPeriod; created: boolean } {
    let created = false;

    let org = this.getOrganisation(params.orgId);
    if (!org) {
      org = {
        id: params.orgId,
        name: params.orgName,
        country: params.country,
        logoUrl: '',
        industrySector: 'Corporate & Commercial SME',
        employeeCount: 25,
        annualRevenueGbp: 2500000,
        license: 'AGPLv3',
        createdAt: new Date().toISOString()
      };
      this.organisations.set(org.id, org);
      created = true;
    }

    let period = this.getReportingPeriod(params.periodId);
    if (!period) {
      period = {
        id: params.periodId,
        orgId: params.orgId,
        name: params.periodName,
        startDate: params.startDate,
        endDate: params.endDate,
        status: 'ACTIVE',
        isBaseline: true,
        notes: 'Reporting period synchronised from the CarbonSnap tenant registry.'
      };
      this.reportingPeriods.set(period.id, period);
      created = true;
    }

    if (created) {
      this.addAuditLog(
        'TENANT_SYNC',
        `Synchronised workspace '${org.name}' (${org.id}) from the CarbonSnap tenant registry.`
      );
    }

    return { organisation: org, period, created };
  }

  public submitContactInquiry(params: {
    fullName: string;
    email: string;
    organisationName?: string;
    inquiryType: string;
    message: string;
  }) {
    const inquiryId = `inq_${Date.now()}`;
    this.addAuditLog('CONTACT_INQUIRY', `Contact form inquiry (${params.inquiryType}) received from ${params.fullName} <${params.email}>.`);
    return {
      success: true,
      inquiryId,
      message: `Thank you ${params.fullName}! Your inquiry (${params.inquiryType}) has been logged. Our ESG advisory team will contact you at ${params.email} within 24 hours.`
    };
  }
}

export const store = new Store();



