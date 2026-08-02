import React, { useEffect, useState } from 'react';
import { ActivityLogView } from './components/ActivityLogView';
import { AnalyticsView } from './components/AnalyticsView';
import { AuditorPortalView } from './components/AuditorPortalView';
import { BillingPortalView } from './components/BillingPortalView';
import { DashboardView } from './components/DashboardView';
import { DocumentationView } from './components/DocumentationView';
import { EmissionFactorsView } from './components/EmissionFactorsView';
import { EnterpriseAdminView } from './components/EnterpriseAdminView';
import { EstimatorView } from './components/EstimatorView';
import { FactorPackContributionView } from './components/FactorPackContributionView';
import { FinancialIntegrationsView } from './components/FinancialIntegrationsView';
import { LaunchArticlesView } from './components/LaunchArticlesView';
import { LandingView } from './components/LandingView';
import { LicenseView } from './components/LicenseView';
import { Navbar, NavTab } from './components/Navbar';
import { OrganisationModal } from './components/OrganisationModal';
import { PartnerDashboardView } from './components/PartnerDashboardView';
import { PeriodModal } from './components/PeriodModal';
import { ReportsView } from './components/ReportsView';
import { RoadmapFeedbackView } from './components/RoadmapFeedbackView';
import { SupplierSharePortal } from './components/SupplierSharePortal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Language } from './i18n/translations';
import {
  clearCachedToken,
  createActivity,
  createOrganisation,
  createReportingPeriod,
  deleteActivity,
  fetchActivities,
  fetchAuditLogs,
  fetchEmissionFactorDatasets,
  fetchEmissionFactors,
  fetchOrganisations,
  fetchReportingPeriods,
  fetchSummary,
  syncTenantWorkspace,
  updateActivity,
  updateOrganisation,
  updateReportingPeriod
} from './lib/api';
import {
  ActivityEntry,
  ActivityFormData,
  AuditLog,
  EmissionFactor,
  EmissionFactorDataset,
  EmissionsSummary,
  Organisation,
  PersonaType,
  ReportingPeriod,
  UserRole
} from './types';
import { AuthPage } from './pages/AuthPage';

type PublicView = 'landing' | 'auth';

function AppShell() {
  const {
    user,
    profile,
    organisation,
    organisations: cloudOrganisations,
    periods: cloudPeriods,
    initializing: authInitializing,
    signOut
  } = useAuth();

  // Application Core State
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organisation | null>(null);

  const [reportingPeriods, setReportingPeriods] = useState<ReportingPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<ReportingPeriod | null>(null);

  const [datasets, setDatasets] = useState<EmissionFactorDataset[]>([]);
  const [selectedDatasetKey, setSelectedDatasetKey] = useState<string>('UK_2024');
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [summary, setSummary] = useState<EmissionsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // RBAC User Role State & Persona
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [activePersona, setActivePersona] = useState<PersonaType>('DEFAULT_ADMIN');

  // Language & Navigation
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Public navigation (unauthenticated)
  const [publicView, setPublicView] = useState<PublicView>(() =>
    window.location.hash === '#/auth' ? 'auth' : 'landing'
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [activeShareToken, setActiveShareToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      return path.replace('/share/', '');
    }
    return null;
  });

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [booting, setBooting] = useState(true);

  const isAuthenticated = !!user;
  const loading = authInitializing || (isAuthenticated && booting);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setPublicView('auth');
    window.history.pushState({}, '', '#/auth');
  };

  const backToLanding = () => {
    setPublicView('landing');
    window.history.pushState({}, '', '/');
  };

  const handleSignOut = async () => {
    await signOut();
    clearCachedToken();
    setActiveTab('dashboard');
    setPublicView('landing');
    window.history.pushState({}, '', '/');
  };

  // 1. Initial Load (authenticated): synchronise the Firestore tenant
  //    into the ledger store, then load organisations & factor datasets.
  useEffect(() => {
    if (!isAuthenticated || !profile) return;

    let cancelled = false;
    async function init() {
      setBooting(true);
      try {
        // Materialise the user's Firestore workspace into the ledger store
        // so the carbon accounting APIs can serve their data.
        if (organisation && cloudPeriods.length > 0) {
          const p = cloudPeriods[0];
          await syncTenantWorkspace({
            orgId: organisation.id,
            orgName: organisation.name,
            country: organisation.country,
            periodId: p.id,
            periodName: p.name,
            startDate: p.startDate,
            endDate: p.endDate
          });
        }

        const [serverOrgs, dsData] = await Promise.all([
          fetchOrganisations(),
          fetchEmissionFactorDatasets()
        ]);

        const myOrgIds = new Set(cloudOrganisations.map((o) => o.id));
        const myOrgs =
          myOrgIds.size > 0 ? serverOrgs.filter((o) => myOrgIds.has(o.id)) : serverOrgs;

        if (cancelled) return;
        setOrganisations(myOrgs);
        const preferred =
          myOrgs.find((o) => o.id === profile.activeOrgId) ||
          myOrgs.find((o) => o.id === organisation?.id) ||
          myOrgs[0] ||
          null;
        setActiveOrg(preferred);
        setDatasets(dsData);
      } catch (err) {
        console.error('Failed initial load:', err);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile?.uid, cloudOrganisations, cloudPeriods]);

  // 2. Load Reporting Periods whenever Active Org changes
  useEffect(() => {
    if (!activeOrg || !isAuthenticated) return;
    async function loadPeriods() {
      try {
        const periods = await fetchReportingPeriods(activeOrg!.id);
        setReportingPeriods(periods);
        // Default to active period or first period
        const currentActive = periods.find((p) => p.status === 'ACTIVE') || periods[0] || null;
        setActivePeriod(currentActive);
      } catch (err) {
        console.error('Failed to load reporting periods:', err);
      }
    }
    loadPeriods();
  }, [activeOrg, isAuthenticated]);

  // 3. Load Emission Factors whenever Dataset selection changes
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadFactors() {
      try {
        const factors = await fetchEmissionFactors(selectedDatasetKey);
        setEmissionFactors(factors);
      } catch (err) {
        console.error('Failed to load emission factors:', err);
      }
    }
    loadFactors();
  }, [selectedDatasetKey, isAuthenticated]);

  // 4. Reload Activities, Summary, and Audit Logs whenever Active Org or Active Period changes
  const refreshData = async () => {
    if (!activeOrg || !activePeriod || !isAuthenticated) return;
    try {
      const [acts, sum, logs] = await Promise.all([
        fetchActivities(activeOrg.id, activePeriod.id),
        fetchSummary(activeOrg.id, activePeriod.id),
        fetchAuditLogs()
      ]);
      setActivities(acts);
      setSummary(sum);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to refresh carbon inventory data:', err);
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg, activePeriod, isAuthenticated]);

  // Handler functions
  const handleSelectOrg = (orgId: string) => {
    const found = organisations.find((o) => o.id === orgId);
    if (found) setActiveOrg(found);
  };

  const handleSelectPeriod = (periodId: string) => {
    const found = reportingPeriods.find((p) => p.id === periodId);
    if (found) setActivePeriod(found);
  };

  const handleAddActivity = async (formData: ActivityFormData) => {
    if (!activeOrg) return;
    await createActivity(activeOrg.id, formData);
    await refreshData();
  };

  const handleUpdateActivity = async (id: string, updates: Partial<ActivityEntry>) => {
    await updateActivity(id, updates);
    await refreshData();
  };

  const handleDeleteActivity = async (id: string) => {
    await deleteActivity(id);
    await refreshData();
  };

  const handleCreateOrg = async (data: Partial<Organisation>) => {
    const newOrg = await createOrganisation(data);
    const updatedOrgs = await fetchOrganisations();
    setOrganisations(updatedOrgs);
    setActiveOrg(newOrg);
  };

  const handleUpdateOrg = async (data: Partial<Organisation>) => {
    if (!activeOrg) return;
    const updated = await updateOrganisation(activeOrg.id, data);
    setActiveOrg(updated);
    setOrganisations(organisations.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleCreatePeriod = async (data: Partial<ReportingPeriod>) => {
    if (!activeOrg) return;
    const newPeriod = await createReportingPeriod({ ...data, orgId: activeOrg.id });
    const periods = await fetchReportingPeriods(activeOrg.id);
    setReportingPeriods(periods);
    setActivePeriod(newPeriod);
    await refreshData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest">BOOTING CARBONSNAP ENGINE...</p>
        </div>
      </div>
    );
  }

  if (activeShareToken) {
    return (
      <SupplierSharePortal
        token={activeShareToken}
        onClosePortal={() => {
          setActiveShareToken(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // 1. Unauthenticated State: Public Landing Page OR Login / Sign Up page ONLY.
  if (!isAuthenticated) {
    if (publicView === 'auth') {
      return (
        <AuthPage
          initialMode={authMode}
          onBackToLanding={backToLanding}
        />
      );
    }

    return (
      <div className="min-h-screen bg-neutral-100 text-black font-sans antialiased selection:bg-black selection:text-white flex flex-col justify-between">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <LandingView onOpenAuth={openAuth} />
        </main>

        <footer className="bg-white border-t-2 border-black text-black py-6 text-xs font-bold uppercase tracking-wider print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} CarbonSnap • AGPLv3 Open Source Carbon Accounting</p>
            <div className="flex items-center space-x-4">
              <span>UK DESNZ 2024 GHG Factors</span>
              <span>•</span>
              <span>US EPA GHG Hub</span>
              <span>•</span>
              <button
                onClick={() => openAuth('login')}
                className="font-black underline hover:text-amber-600 cursor-pointer"
              >
                Sign In Workspace
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 2. Authenticated State: Show Full Application Dashboard & Sidebar Navigation
  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans flex flex-col md:flex-row antialiased selection:bg-black selection:text-white">
      {/* Left Column Navigation Sidebar */}
      <Navbar
        organisations={organisations}
        activeOrg={activeOrg}
        reportingPeriods={reportingPeriods}
        activePeriod={activePeriod}
        activeTab={activeTab}
        userRole={userRole}
        activePersona={activePersona}
        lang={lang}
        currentUserEmail={profile?.email || user.email || ''}
        onSelectTab={setActiveTab}
        onSelectOrg={handleSelectOrg}
        onSelectPeriod={handleSelectPeriod}
        onSelectUserRole={setUserRole}
        onSelectPersona={setActivePersona}
        onSelectLang={setLang}
        onOpenOrgModal={() => setIsOrgModalOpen(true)}
        onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              org={activeOrg}
              period={activePeriod}
              activePersona={activePersona}
              onNavigateToActivities={() => setActiveTab('activities')}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'activities' && (
            <ActivityLogView
              activities={activities}
              emissionFactors={emissionFactors}
              activeOrg={activeOrg}
              activePeriod={activePeriod}
              userRole={userRole}
              lang={lang}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onRefreshData={refreshData}
            />
          )}

          {activeTab === 'integrations' && activeOrg && (
            <FinancialIntegrationsView
              orgId={activeOrg.id}
              activePeriod={activePeriod}
              userRole={userRole}
              lang={lang}
              onRefreshData={refreshData}
            />
          )}

          {activeTab === 'analytics' && activeOrg && (
            <AnalyticsView orgId={activeOrg.id} lang={lang} />
          )}

          {activeTab === 'partner' && (
            <PartnerDashboardView
              userRole={userRole}
              lang={lang}
              onSwitchWorkspace={async (orgId) => {
                handleSelectOrg(orgId);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'factors' && (
            <div className="space-y-8">
              <FactorPackContributionView />
              <EmissionFactorsView
                datasets={datasets}
                factors={emissionFactors}
                selectedDataset={selectedDatasetKey}
                onSelectDataset={setSelectedDatasetKey}
              />
            </div>
          )}

          {activeTab === 'estimator' && (
            <EstimatorView
              activeOrg={activeOrg}
              activePeriod={activePeriod}
              onSaveAndNavigate={async () => {
                if (activePeriod && activeOrg) {
                  const acts = await fetchActivities(activeOrg.id, activePeriod.id);
                  setActivities(acts);
                  const sum = await fetchSummary(activeOrg.id, activePeriod.id);
                  setSummary(sum);
                }
                setActiveTab('activities');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              summary={summary}
              org={activeOrg}
              period={activePeriod}
              activities={activities}
              auditLogs={auditLogs}
              userRole={userRole}
              lang={lang}
              onOpenShareToken={(token) => setActiveShareToken(token)}
            />
          )}

          {activeTab === 'org' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <div className="border-b-2 border-black pb-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Organisation Profile & Headcount</h2>
                  <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
                    // SME corporate parameters for carbon intensity indexing
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs font-bold uppercase">
                  <div>
                    <span className="text-neutral-500 block mb-1">Organisation Name</span>
                    <span className="font-black text-black text-lg block">{activeOrg?.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Industry Sector</span>
                    <span className="font-black text-black text-base block">{activeOrg?.industrySector}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Headcount (Employees)</span>
                    <span className="font-black text-black text-base block">{activeOrg?.employeeCount} FTE</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Annual Revenue</span>
                    <span className="font-black text-black text-base block">
                      £{(activeOrg?.annualRevenueGbp || 0).toLocaleString()} GBP
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-black flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsOrgModalOpen(true)}
                    disabled={userRole === 'Auditor'}
                    className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-40"
                  >
                    Edit Profile Parameters +
                  </button>

                  {activeOrg && (
                    <a
                      href={`/api/v1/organisations/${activeOrg.id}/export-data`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
                    >
                      <span>Download Backup Archive (JSON)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <EnterpriseAdminView org={activeOrg} userRole={userRole} />
          )}

          {activeTab === 'auditor' && (
            <AuditorPortalView
              activeOrg={activeOrg}
              activePeriod={activePeriod}
              activities={activities}
              summary={summary}
              auditLogs={auditLogs}
              onCertificateIssued={() => {
                refreshData();
              }}
            />
          )}

          {activeTab === 'docs' && <DocumentationView />}

          {activeTab === 'launch' && (
            <LaunchArticlesView
              onOpenEstimator={() => setActiveTab('estimator')}
              onOpenDocs={() => setActiveTab('docs')}
            />
          )}

          {activeTab === 'billing' && <BillingPortalView org={activeOrg} />}

          {activeTab === 'roadmap' && <RoadmapFeedbackView />}

          {activeTab === 'license' && <LicenseView />}

        </main>

        {/* Footer */}
        <footer className="bg-white border-t-2 border-black text-black py-6 text-xs font-bold uppercase tracking-wider print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} CarbonSnap • AGPLv3 Open Source</p>
            <div className="flex items-center space-x-4">
              <span>UK DESNZ 2024 GHG Factors</span>
              <span>•</span>
              <span>US EPA GHG Hub</span>
              <span>•</span>
              <button
                onClick={() => setActiveTab('license')}
                className="font-black hover:underline cursor-pointer"
              >
                AGPLv3 License
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <OrganisationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSubmit={activeOrg ? handleUpdateOrg : handleCreateOrg}
        initialOrg={activeOrg}
      />

      <PeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSubmit={handleCreatePeriod}
        orgId={activeOrg?.id || ''}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
