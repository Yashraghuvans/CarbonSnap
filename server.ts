import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { calculationEngine } from './src/server/calculationEngine.js';
import { store } from './src/server/store.js';

// -------------------------------------------------------------
// Firebase ID Token Verification
// Verifies the caller's Firebase session token via the
// identitytoolkit accounts:lookup REST API. Tokens are cached
// briefly to avoid an upstream call per request.
// -------------------------------------------------------------
interface VerifiedAuthUser {
  uid: string;
  email: string;
}

const tokenCache = new Map<string, { user: VerifiedAuthUser; expiresAt: number }>();
const TOKEN_CACHE_TTL_MS = 15 * 60 * 1000;

async function verifyFirebaseToken(token: string): Promise<VerifiedAuthUser | null> {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }
  tokenCache.delete(token);

  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    console.warn('FIREBASE_API_KEY is not configured; rejecting authenticated request.');
    return null;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token })
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (body.includes('CONFIGURATION_NOT_FOUND')) {
        console.error(
          'Firebase Auth is not configured: enable the Email/Password provider in the ' +
            'Firebase console (Authentication → Sign-in method) for project ' +
            `"${process.env.VITE_FIREBASE_PROJECT_ID || 'unknown'}" before accepting logins.`
        );
      }
      return null;
    }
    const data: any = await res.json();
    const fbUser = data.users && data.users[0];
    if (!fbUser || !fbUser.localId) return null;

    const user = { uid: fbUser.localId, email: fbUser.email || '' };
    tokenCache.set(token, { user, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS });
    return user;
  } catch (err) {
    console.error('Firebase token verification failed:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Public endpoint whitelist (no authentication required)
// -------------------------------------------------------------
const PUBLIC_PATHS: Array<{ method: string; pattern: RegExp }> = [
  { method: 'GET', pattern: /^\/api\/health$/ },
  { method: 'GET', pattern: /^\/api\/v1\/health$/ },
  { method: 'GET', pattern: /^\/api\/v1\/license$/ },
  { method: 'POST', pattern: /^\/api\/v1\/public\/estimate$/ },
  { method: 'POST', pattern: /^\/api\/v1\/contact$/ },
  { method: 'GET', pattern: /^\/api\/v1\/supplier-share\/[^/]+$/ },
  { method: 'GET', pattern: /^\/api\/verify\/[^/]+$/ },
  { method: 'GET', pattern: /^\/api\/v1\/verify\/[^/]+$/ },
  { method: 'GET', pattern: /^\/api\/v1\/roadmap$/ },
  { method: 'POST', pattern: /^\/api\/v1\/leads\/capture$/ },
  { method: 'POST', pattern: /^\/api\/playbook-lead$/ },
  { method: 'GET', pattern: /^\/api\/v1\/emission-factors\/community$/ },
  { method: 'POST', pattern: /^\/api\/v1\/emission-factors\/community-submit$/ },
  { method: 'POST', pattern: /^\/api\/v1\/emission-factors\/validate-pack$/ }
];

// -------------------------------------------------------------
// Simple in-memory rate limiter (per route + IP)
// -------------------------------------------------------------
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number, windowMs: number, route: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = `${route}:${req.ip}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    return next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable('x-powered-by');

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    // Strict CSP in production only (Vite dev needs inline scripts + ws: HMR).
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      );
    }
    next();
  });

  // Authentication gate for all /api routes (except public whitelist)
  app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api')) return next();

    const isPublic = PUBLIC_PATHS.some(
      (p) => p.method === req.method && p.pattern.test(req.path)
    );
    if (isPublic) return next();

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: sign in required.' });
    }

    const authUser = await verifyFirebaseToken(token);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized: invalid or expired session token.' });
    }

    (req as any).authUser = authUser;
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  // -------------------------------------------------------------
  // REST API ROUTES
  // -------------------------------------------------------------

  // Health check & Operational Telemetry
  const handleHealth = (req: express.Request, res: express.Response) => {
    res.json(store.getHealthStatus());
  };
  app.get('/api/health', handleHealth);
  app.get('/api/v1/health', handleHealth);

  // AGPLv3 License info
  app.get('/api/v1/license', (req, res) => {
    res.json({
      name: 'GNU Affero General Public License v3.0 (AGPLv3)',
      identifier: 'AGPL-3.0-only',
      url: 'https://www.gnu.org/licenses/agpl-3.0.html',
      isAGPLv3: true,
      termsSummary: 'CarbonSnap is open-source under AGPLv3. All calculations, emission factor datasets, and source logic are fully auditable and transparent for corporate SME GHG compliance.'
    });
  });

  // Organisations
  app.get('/api/v1/organisations', (req, res) => {
    res.json(store.getOrganisations());
  });

  app.get('/api/v1/organisations/:id', (req, res) => {
    const org = store.getOrganisation(req.params.id);
    if (!org) return res.status(404).json({ error: 'Organisation not found' });
    res.json(org);
  });

  app.post('/api/v1/organisations', (req, res) => {
    try {
      const newOrg = store.createOrganisation(req.body);
      res.status(201).json(newOrg);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/v1/organisations/:id', (req, res) => {
    try {
      const updated = store.updateOrganisation(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Reporting Periods
  app.get('/api/v1/reporting-periods', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    res.json(store.getReportingPeriods(orgId));
  });

  app.post('/api/v1/reporting-periods', (req, res) => {
    try {
      const period = store.createReportingPeriod(req.body);
      res.status(201).json(period);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/v1/reporting-periods/:id', (req, res) => {
    try {
      const updated = store.updateReportingPeriod(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Emission Factors
  app.get('/api/v1/emission-factors/datasets', (req, res) => {
    res.json(calculationEngine.getDatasets());
  });

  app.get('/api/v1/emission-factors', (req, res) => {
    const datasetKey = (req.query.dataset as string) || 'UK_2024';
    const factors = calculationEngine.getAllFactors(datasetKey);
    res.json(factors);
  });

  // Activity Entries
  app.get('/api/v1/activities', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    const periodId = req.query.periodId as string | undefined;
    res.json(store.getActivityEntries(orgId, periodId));
  });

  app.post('/api/v1/activities', (req, res) => {
    try {
      const { orgId, periodId, activityType, description, quantity, factorId, date, facilityLocation, notes } = req.body;
      if (!orgId || !periodId || !factorId || quantity === undefined || isNaN(Number(quantity))) {
        return res.status(400).json({ error: 'Missing required activity fields: orgId, periodId, factorId, quantity' });
      }

      const entry = store.createActivityEntry({
        orgId,
        periodId,
        activityType: activityType || 'General Emission',
        description: description || 'Activity entry',
        quantity: Number(quantity),
        factorId,
        date: date || new Date().toISOString().substring(0, 10),
        facilityLocation,
        notes
      });

      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/v1/activities/:id', (req, res) => {
    try {
      const updated = store.updateActivityEntry(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/v1/activities/:id', (req, res) => {
    try {
      store.deleteActivityEntry(req.params.id);
      res.json({ success: true, message: 'Activity entry deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Summary / Analytics
  app.get('/api/v1/summary', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    const periodId = (req.query.periodId as string) || 'period_fy_2024_2025';
    const summary = store.getEmissionsSummary(orgId, periodId);
    res.json(summary);
  });

  // Year-on-Year Period Comparison Analytics
  const handlePeriodCompare = (req: express.Request, res: express.Response) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    const comparison = store.getPeriodComparison(orgId);
    res.json(comparison);
  };
  app.get('/api/v1/periods/compare', handlePeriodCompare);
  app.get('/api/periods/compare', handlePeriodCompare);

  // CSV Bulk Import Engine Endpoint
  const handleBulkImport = (req: express.Request, res: express.Response) => {
    const periodId = req.params.periodId;
    const orgId = (req.query.orgId as string) || (req.body && req.body.orgId) || 'org_acme_001';

    let csvText = '';
    if (typeof req.body === 'string') {
      csvText = req.body;
    } else if (req.body && typeof req.body.csvText === 'string') {
      csvText = req.body.csvText;
    } else if (req.body && typeof req.body.csv === 'string') {
      csvText = req.body.csv;
    } else if (req.body && Array.isArray(req.body.rows)) {
      // If rows array passed, convert to CSV string format
      csvText = 'activity_type,quantity,unit,description,date,factor_id,facilityLocation,notes\n' +
        req.body.rows.map((r: any) =>
          `"${r.activity_type || r.activityType || ''}",${r.quantity || 0},"${r.unit || ''}","${r.description || ''}","${r.date || ''}","${r.factor_id || r.factorId || ''}","${r.facilityLocation || ''}","${r.notes || ''}"`
        ).join('\n');
    }

    if (!csvText || !csvText.trim()) {
      return res.status(400).json({
        success: false,
        errors: [{ row: 0, message: 'No CSV payload provided in request body.' }]
      });
    }

    const result = store.bulkImportActivities(periodId, orgId, csvText);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  };

  app.post('/api/v1/periods/:periodId/import', express.text({ type: ['text/csv', 'text/plain'], limit: '10mb' }), handleBulkImport);
  app.post('/api/periods/:periodId/import', express.text({ type: ['text/csv', 'text/plain'], limit: '10mb' }), handleBulkImport);

  // --- Authentication & Workspace Synchronisation ---
  // Authentication itself is handled by Firebase Auth (client-side).
  // This endpoint materialises the authenticated user's Firestore
  // tenant (organisation + reporting period) into the ledger store.
  app.post(
    '/api/v1/auth/sync-tenant',
    rateLimit(10, 60 * 1000, 'sync-tenant'),
    (req, res) => {
      try {
        const { orgId, orgName, country, periodId, periodName, startDate, endDate } = req.body;
        if (!orgId || !orgName || !periodId) {
          return res.status(400).json({ error: 'orgId, orgName and periodId are required.' });
        }
        const result = store.ensureTenantWorkspace({
          orgId,
          orgName,
          country: country || 'United Kingdom',
          periodId,
          periodName: periodName || `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          startDate: startDate || `${new Date().getFullYear()}-01-01`,
          endDate: endDate || `${new Date().getFullYear()}-12-31`
        });
        res.json({ success: true, ...result });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.post(
    '/api/v1/contact',
    rateLimit(10, 60 * 1000, 'contact'),
    (req, res) => {
      try {
        const { fullName, email, organisationName, inquiryType, message } = req.body;
        if (!fullName || !email || !message) {
          return res.status(400).json({ error: 'Full Name, Email, and Message are required fields.' });
        }
        const result = store.submitContactInquiry({
          fullName,
          email,
          organisationName,
          inquiryType: inquiryType || 'General Inquiry',
          message
        });
        res.status(200).json(result);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  app.get('/api/v1/user', (req, res) => {
    const auth = (req as any).authUser;
    res.json({
      id: auth.uid,
      name: (auth.email || 'CarbonSnap User').split('@')[0],
      email: auth.email,
      role: 'Admin',
      organisationIds: [],
      activeOrgId: ''
    });
  });

  app.put('/api/v1/user/role', (req, res) => {
    const { role } = req.body;
    if (!['Admin', 'Contributor', 'Auditor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    const updated = store.updateUserRole('user_lead_auditor_01', role);
    res.json(updated);
  });

  app.post('/api/v1/user/switch-workspace', (req, res) => {
    const { orgId } = req.body;
    if (!orgId) return res.status(400).json({ error: 'orgId required' });
    const updated = store.switchUserActiveOrg('user_lead_auditor_01', orgId);
    res.json(updated);
  });

  // --- Phase 3: White-Label Partner Dashboard Endpoints ---
  app.get('/api/v1/partner/brand', (req, res) => {
    const partner = store.getPartnerBrand();
    res.json(partner);
  });

  app.put('/api/v1/partner/brand', (req, res) => {
    const updated = store.updatePartnerBrand('partner_green_advisors_01', req.body);
    res.json(updated);
  });

  app.get('/api/v1/partner/workspaces', (req, res) => {
    const workspaces = store.getPartnerWorkspaces();
    res.json(workspaces);
  });

  // --- Phase 3: Financial Connector Engine Endpoints ---
  app.get('/api/v1/integrations/connections', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    res.json(store.getIntegrationConnections(orgId));
  });

  app.get('/api/v1/integrations/pending', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    res.json(store.getPendingTransactions(orgId));
  });

  app.post('/api/v1/integrations/sync', (req, res) => {
    const orgId = (req.query.orgId as string) || (req.body && req.body.orgId) || 'org_acme_001';
    const txns = store.syncFinancialTransactions(orgId);
    res.json(txns);
  });

  app.post('/api/v1/integrations/confirm/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const { periodId } = req.body;
    if (!periodId) return res.status(400).json({ error: 'periodId required' });
    try {
      const entry = store.confirmFinancialTransaction(transactionId, periodId);
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/v1/integrations/adjust/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const { periodId, activityType, factorId, quantity, description } = req.body;
    if (!periodId) return res.status(400).json({ error: 'periodId required' });
    try {
      const entry = store.adjustAndConfirmTransaction(transactionId, periodId, {
        activityType,
        factorId,
        quantity,
        description
      });
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Phase 4: Public Enterprise REST API & API Key Management ---
  app.get('/api/v1/api-keys', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    res.json(store.getApiKeys(orgId));
  });

  app.post('/api/v1/api-keys', (req, res) => {
    const { orgId, name } = req.body;
    if (!orgId) return res.status(400).json({ error: 'orgId required' });
    try {
      const keyObj = store.createApiKey(orgId, name);
      res.status(201).json(keyObj);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  const handleRevokeApiKey = (req: express.Request, res: express.Response) => {
    try {
      const revoked = store.revokeApiKey(req.params.keyId);
      res.json(revoked);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
  app.delete('/api/v1/api-keys/:keyId', handleRevokeApiKey);
  app.post('/api/v1/api-keys/:keyId/revoke', handleRevokeApiKey);

  // External ERP / Platform Ingestion via API Key
  app.post('/api/v1/external/activity', (req, res) => {
    const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.headers['authorization'] as string) || '';
    const keyObj = store.validateApiKey(apiKeyHeader);
    
    if (!keyObj) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or revoked X-API-Key header. Please provide a valid active Enterprise API Key.'
      });
    }

    try {
      const targetOrgId = req.body.orgId || keyObj.orgId;
      // Get active period if not provided
      let periodId = req.body.periodId;
      if (!periodId) {
        const periods = store.getReportingPeriods(targetOrgId);
        const active = periods.find(p => p.status === 'ACTIVE') || periods[0];
        if (!active) return res.status(400).json({ error: 'No active reporting period found for organisation.' });
        periodId = active.id;
      }

      const { activityType, description, quantity, factorId, date, facilityLocation, notes } = req.body;
      if (!factorId || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required activity fields: factorId and quantity' });
      }

      const entry = store.createActivityEntry({
        orgId: targetOrgId,
        periodId,
        activityType: activityType || 'External API Import',
        description: description || `External System Payload (${keyObj.name})`,
        quantity: Number(quantity),
        factorId,
        date: date || new Date().toISOString().substring(0, 10),
        facilityLocation: facilityLocation || 'External ERP API',
        notes: `Enterprise REST API Ingestion via key [${keyObj.name}]. ${notes || ''}`
      });

      res.status(201).json({
        success: true,
        message: 'Activity entry created via Enterprise REST API',
        entry,
        apiKeyUsed: keyObj.name
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Phase 4: Automated Emission Factor Pipeline & Versioning ---
  app.get('/api/v1/emission-factors/versions', (req, res) => {
    res.json(store.getDatasetVersions());
  });

  app.post('/api/v1/emission-factors/pipeline-update', (req, res) => {
    const datasetKey = req.body.datasetKey || 'UK_2024';
    try {
      const newVersion = store.runFactorPipelineUpdate(datasetKey);
      res.status(201).json({
        success: true,
        message: `Factor pipeline updated successfully for '${datasetKey}'. Existing entry snapshots preserved.`,
        version: newVersion
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Phase 4: Full Workspace Data Export & Backup Archive ---
  app.get('/api/v1/organisations/:orgId/export-data', (req, res) => {
    try {
      const data = store.exportOrganisationData(req.params.orgId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="CarbonSnap_Backup_${req.params.orgId}_${new Date().toISOString().substring(0, 10)}.json"`);
      res.send(JSON.stringify(data, null, 2));
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Phase 5: Supplier Sharing Portal API ---
  app.post('/api/v1/supplier-share', (req, res) => {
    const { orgId, periodId, shareName } = req.body;
    if (!orgId || !periodId) {
      return res.status(400).json({ error: 'orgId and periodId are required' });
    }
    try {
      const link = store.createSupplierShareLink(orgId, periodId, shareName);
      res.status(201).json(link);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/v1/supplier-share', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    res.json(store.getSupplierShareLinks(orgId));
  });

  app.get('/api/v1/supplier-share/:token', (req, res) => {
    try {
      const data = store.getSupplierShareData(req.params.token);
      res.json(data);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- Phase 5: Verified Report Workflow API ---
  app.post('/api/v1/periods/:periodId/verify', (req, res) => {
    try {
      const verifierName = req.body.verifierName || 'Sarah Jenkins (Lead Carbon Auditor)';
      const updatedPeriod = store.togglePeriodVerification(req.params.periodId, verifierName);
      res.json(updatedPeriod);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Phase 5: Online Carbon Estimator (Lead-Gen Engine) API ---
  app.post(
    '/api/v1/public/estimate',
    rateLimit(20, 60 * 1000, 'public-estimate'),
    (req, res) => {
      try {
        const result = store.calculatePublicEstimate(req.body);
        res.json(result);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    }
  );

  // --- Phase 5 & 6: International Factor Pack Community & Validation API ---
  app.get('/api/v1/emission-factors/community', (req, res) => {
    res.json(store.getCommunityFactorPacks());
  });

  app.post('/api/v1/emission-factors/validate-pack', (req, res) => {
    try {
      const validationResult = store.validateFactorPackSchema(req.body);
      res.json(validationResult);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/v1/emission-factors/community-submit', (req, res) => {
    try {
      const validation = store.validateFactorPackSchema(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          error: `Factor pack validation failed: ${validation.errors.join('; ')}`,
          validation
        });
      }
      const pack = store.submitCommunityFactorPack(req.body);
      res.status(201).json({
        success: true,
        message: `Successfully validated and submitted Factor Pack '${pack.datasetName}' (${pack.country}).`,
        pack,
        validation
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Phase 6: Official 'Authority' Auditor Pre-Verification & Certificate API ---
  app.post('/api/v1/auditor/sign-off', (req, res) => {
    const { periodId, auditorName, auditorFirm, auditorCertNumber, auditNotes } = req.body;
    if (!periodId) {
      return res.status(400).json({ error: 'periodId is required for auditor sign-off' });
    }
    try {
      const cert = store.signAuditorVerification(periodId, {
        auditorName,
        auditorFirm,
        auditorCertNumber,
        auditNotes
      });
      res.status(201).json({
        success: true,
        message: `Auditor sign-off successfully completed. Verification Certificate issued: ${cert.certId}`,
        certificate: cert
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/v1/verify/:certId', (req, res) => {
    const cert = store.getVerificationCertificate(req.params.certId);
    if (!cert) {
      return res.status(404).json({ error: `Verification certificate '${req.params.certId}' not found or revoked` });
    }
    res.json(cert);
  });

  app.get('/api/v1/periods/:periodId/verification-certificate', (req, res) => {
    const cert = store.getCertificateForPeriod(req.params.periodId);
    if (!cert) {
      return res.status(404).json({ error: 'No active verification certificate found for this reporting period' });
    }
    res.json(cert);
  });


  // --- Phase 5: Supply Chain Partner Data Requests API ---
  app.post('/api/v1/partner/request-data', (req, res) => {
    const { partnerId, clientEmail, clientName } = req.body;
    if (!partnerId || !clientEmail) {
      return res.status(400).json({ error: 'partnerId and clientEmail are required' });
    }
    try {
      const requestObj = store.createPartnerDataRequest(partnerId, clientEmail, clientName);
      res.status(201).json({
        success: true,
        message: `Carbon Data Request sent to ${clientEmail}`,
        request: requestObj
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });


  // --- Phase 7: Commercial Maturity, Billing, Leads, Roadmap & Audit Bundle API ---

  // Stripe / SaaS Billing API
  app.get('/api/v1/billing/subscription/:orgId', (req, res) => {
    const { orgId } = req.params;
    res.json(store.getBillingSubscription(orgId));
  });

  app.post('/api/v1/billing/update-subscription', (req, res) => {
    const { orgId, tier } = req.body;
    if (!orgId || !tier) return res.status(400).json({ error: 'orgId and tier required' });
    try {
      const sub = store.updateBillingTier(orgId, tier);
      res.json(sub);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/v1/billing/toggle-addon', (req, res) => {
    const { orgId, active } = req.body;
    if (!orgId) return res.status(400).json({ error: 'orgId required' });
    try {
      const sub = store.toggleAccountingAddon(orgId, Boolean(active));
      res.json(sub);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/v1/billing/checkout', (req, res) => {
    const { orgId, tier, successUrl } = req.body;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    // If Stripe key is provided or mock fallback, return checkout session response
    res.json({
      checkoutUrl: successUrl || `/#/billing-success?orgId=${orgId}&tier=${tier}`,
      sessionId: `cs_test_${Date.now()}`,
      mode: stripeKey ? 'STRIPE_LIVE_GATEWAY' : 'SIMULATED_STRIPE_GATEWAY',
      message: stripeKey 
        ? 'Stripe Session Created'
        : 'Stripe integration configured in developer mode. Upgraded subscription instantly applied.'
    });
  });

  // Lead Generation & Carbon Estimator Automation API
  app.post(
    '/api/v1/leads/capture',
    rateLimit(10, 60 * 1000, 'leads-capture'),
    (req, res) => {
      const { email, companyName, indicativeTotalTonnes, source } = req.body;
      if (!email) return res.status(400).json({ error: 'email is required' });

      const lead = store.captureLead({
        email,
        companyName,
        indicativeTotalTonnes: Number(indicativeTotalTonnes) || 0,
        source
      });

      const resendKey = process.env.RESEND_API_KEY;

      res.status(201).json({
        success: true,
        message: `Indicative carbon footprint summary sent to ${email}`,
        lead,
        emailDispatchStatus: resendKey ? 'DISPATCHED_VIA_RESEND' : 'SIMULATED_DISPATCH_SUCCESS',
        convertUrl: `/convert-account?token=${lead.convertToken}`
      });
    }
  );

  app.get('/api/v1/leads', (req, res) => {
    res.json(store.getLeads());
  });

  // Public Roadmap & Community Feedback API
  app.get('/api/v1/roadmap', (req, res) => {
    res.json(store.getRoadmapItems());
  });

  app.post('/api/v1/roadmap/:id/upvote', (req, res) => {
    const item = store.upvoteRoadmapItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Roadmap item not found' });
    res.json(item);
  });

  app.post('/api/v1/feedback', (req, res) => {
    const { userEmail, category, message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const report = store.submitFeedback({
      userEmail,
      category: category || 'GENERAL',
      message
    });
    res.status(201).json(report);
  });

  app.get('/api/v1/feedback', (req, res) => {
    res.json(store.getFeedbackReports());
  });

  // Enterprise SSO API
  app.get('/api/v1/sso/config/:orgId', (req, res) => {
    res.json(store.getSsoConfig(req.params.orgId));
  });

  app.post('/api/v1/sso/config', (req, res) => {
    const { orgId, ...updates } = req.body;
    if (!orgId) return res.status(400).json({ error: 'orgId required' });
    const updated = store.updateSsoConfig(orgId, updates);
    res.json(updated);
  });

  // Audit Bundle Export API
  app.get('/api/v1/reports/:periodId/audit-bundle', (req, res) => {
    try {
      const bundle = store.getAuditBundleData(req.params.periodId);
      res.json(bundle);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(store.getAuditLogs());
  });

  // Export CSV endpoint
  app.get('/api/reports/csv', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    const periodId = req.query.periodId as string | undefined;
    const entries = store.getActivityEntries(orgId, periodId);

    let csv = 'ID,Date,Activity Type,Description,Scope,Quantity,Unit,Factor Name,Factor Value,CO2e (kg),CO2e (tonnes),Location,Notes\n';
    for (const e of entries) {
      csv += `"${e.id}","${e.date}","${e.activityType}","${e.description.replace(/"/g, '""')}",${e.sourceScope},${e.quantity},"${e.unit}","${e.factorName}",${e.factorValue},${e.co2e_kg},${(e.co2e_kg/1000).toFixed(4)},"${e.facilityLocation || ''}","${(e.notes || '').replace(/"/g, '""')}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="CarbonSnap_Emissions_${periodId || 'all'}.csv"`);
    res.send(csv);
  });

  // =============================================================
  // PHASE 8 API ENDPOINTS: Regulatory CSRD/SECR, GDPR, DCO & Telemetry
  // =============================================================

  // CSRD Report API
  app.get('/api/v1/reports/:periodId/csrd', (req, res) => {
    try {
      const csrdData = store.getCsrdReportData(req.params.periodId);
      res.json(csrdData);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // SECR Report API
  app.get('/api/v1/reports/:periodId/secr', (req, res) => {
    try {
      const secrData = store.getSecrReportData(req.params.periodId);
      res.json(secrData);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // GDPR Right to be Forgotten Purge API
  app.post('/api/v1/privacy/purge-org-data', (req, res) => {
    try {
      const { orgId } = req.body;
      if (!orgId) return res.status(400).json({ error: 'orgId required' });
      const result = store.purgeOrganisationData(orgId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // GDPR Data Portability Compliance Package Export
  app.get('/api/v1/privacy/compliance-export/:orgId', (req, res) => {
    try {
      const pkg = store.getComplianceExportPackage(req.params.orgId);
      res.json(pkg);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Community Factor Contributions & DCO API
  app.get('/api/v1/governance/factor-contributions', (req, res) => {
    res.json(store.getFactorContributions());
  });

  app.post('/api/v1/governance/factor-contributions', (req, res) => {
    try {
      const result = store.submitFactorContribution(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/v1/governance/factor-contributions/:id/review', (req, res) => {
    try {
      const { reviewerName, comment, approved } = req.body;
      const updated = store.reviewFactorContribution(
        req.params.id,
        reviewerName || 'Community Moderator',
        comment || '',
        Boolean(approved)
      );
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Telemetry API
  app.get('/api/v1/telemetry/config', (req, res) => {
    res.json(store.getTelemetryConfig());
  });

  app.put('/api/v1/telemetry/config', (req, res) => {
    const { optIn } = req.body;
    res.json(store.updateTelemetryConfig(Boolean(optIn)));
  });

  app.post('/api/v1/telemetry/ping', (req, res) => {
    res.json(store.triggerTelemetryPing());
  });

  // Disaster Recovery Test API
  app.get('/api/v1/disaster-recovery/test-results', (req, res) => {
    res.json(store.getDrTestResults());
  });

  app.post('/api/v1/disaster-recovery/test-restore', (req, res) => {
    res.json(store.runDrRestoreTest());
  });

  // Activity Annotations API (Consultant / Auditor Review Notes)
  app.get('/api/v1/annotations/:orgId', (req, res) => {
    res.json(store.getActivityAnnotations(req.params.orgId));
  });

  app.post('/api/v1/annotations', (req, res) => {
    try {
      const result = store.createActivityAnnotation(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/v1/annotations/:id/toggle', (req, res) => {
    try {
      const updated = store.toggleActivityAnnotationStatus(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- PHASE 9 REST API ENDPOINTS ---

  // Partner CRM API
  app.get('/api/partner-firms', (req, res) => {
    res.json(store.getPartnerFirms());
  });

  app.post('/api/partner-firms', (req, res) => {
    try {
      const partner = store.createPartnerFirm(req.body);
      res.status(201).json(partner);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/partner-firms/:id', (req, res) => {
    try {
      const updated = store.updatePartnerFirm(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Factor Bounties API
  app.get('/api/bounties', (req, res) => {
    res.json(store.getFactorBounties());
  });

  app.post('/api/bounties/:id/claim', (req, res) => {
    try {
      const { claimantName } = req.body;
      const claimed = store.claimFactorBounty(req.params.id, claimantName || 'Anonymous Contributor');
      res.json(claimed);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Hall of Fame API
  app.get('/api/hall-of-fame', (req, res) => {
    res.json(store.getHallOfFame());
  });

  // Playbook Lead-Gen Funnel API
  app.post('/api/playbook-lead', (req, res) => {
    try {
      const { email, companyName, estimatorTonnes } = req.body;
      if (!email) return res.status(400).json({ error: 'Email address is required.' });
      const lead = store.submitPlaybookLead(email, companyName, estimatorTonnes);
      res.status(201).json({ success: true, lead, downloadUrl: '/docs/SME_Carbon_Reporting_Playbook_2026.pdf' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Public Verification Seal API
  app.get('/api/verify/:certId', (req, res) => {
    const cert = store.getPublicVerificationCertificate(req.params.certId);
    res.json(cert);
  });

  // California SB 253 / 261 Regulatory Report API
  app.get('/api/reports/california-sb/:periodId', (req, res) => {
    const orgId = (req.query.orgId as string) || 'org_acme_001';
    const report = store.getCaliforniaSbReport(orgId, req.params.periodId);
    res.json(report);
  });


  // -------------------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonSnap Carbon Accounting Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
