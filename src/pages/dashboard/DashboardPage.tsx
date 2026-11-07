/**
 * CarbonSnap — pages/dashboard/DashboardPage
 * FSD: page layer. The authenticated application shell: sidebar navigation,
 * tab routing, organisation/period context, modals and footer.
 * Flow: ui → hook → api — all data arrives via useWorkspace and
 * useInventory hooks; this page only composes widgets and feature views.
 */
import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { ActivityLogView } from '../../features/activities/ActivityLogView';
import { AnalyticsView } from '../../features/analytics/AnalyticsView';
import { BillingPortalView } from '../../features/billing/BillingPortalView';
import { AuditorPortalView } from '../../features/governance/AuditorPortalView';
import { EnterpriseAdminView } from '../../features/governance/EnterpriseAdminView';
import { EstimatorView } from '../../features/estimator/EstimatorView';
import { EmissionFactorsView } from '../../features/factors/EmissionFactorsView';
import { FactorPackContributionView } from '../../features/factors/FactorPackContributionView';
import { FinancialIntegrationsView } from '../../features/integrations/FinancialIntegrationsView';
import { DocumentationView } from '../../features/cms/DocumentationView';
import { LaunchArticlesView } from '../../features/cms/LaunchArticlesView';
import { LicenseView } from '../../features/license/LicenseView';
import { OrganisationModal } from '../../features/org/OrganisationModal';
import { PeriodModal } from '../../features/org/PeriodModal';
import { PartnerDashboardView } from '../../features/partner/PartnerDashboardView';
import { ReportsView } from '../../features/reports/ReportsView';
import { RoadmapFeedbackView } from '../../features/feedback/RoadmapFeedbackView';
import { useInventory } from '../../shared/hooks/useInventory';
import { useWorkspace } from '../../shared/hooks/useWorkspace';
import { Language } from '../../shared/i18n/translations';
import { PersonaType, UserRole } from '../../shared/model/types';
import { DashboardView } from '../../widgets/dashboard/DashboardView';
import { Navbar, NavTab } from '../../widgets/navbar/Navbar';

interface DashboardPageProps {
  onSignOut: () => Promise<void> | void;
  onOpenShareToken: (token: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSignOut, onOpenShareToken }) => {
  const {
    user,
    profile,
    organisation: sessionOrg,
    organisations: cloudOrganisations,
    periods: cloudPeriods,
    initializing: authInitializing
  } = useAuth();

  // RBAC user role & persona (client-side demo personas).
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [activePersona, setActivePersona] = useState<PersonaType>('DEFAULT_ADMIN');

  // Language & navigation.
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const isAuthenticated = !!user;

  // Hook layer: workspace (orgs/periods/factors) + carbon inventory.
  const workspace = useWorkspace({
    isAuthenticated,
    profileUid: profile?.uid,
    cloudOrganisations,
    cloudPeriods,
    preferredOrgId: profile?.activeOrgId,
    fallbackOrgId: sessionOrg?.id
  });

  const inventory = useInventory({
    isAuthenticated,
    activeOrgId: workspace.activeOrgId,
    activePeriodId: workspace.activePeriodId
  });

  const loading = authInitializing || (isAuthenticated && workspace.booting);

  if (inventory.error && !inventory.summary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black font-sans p-6">
        <div className="max-w-lg border-2 border-black p-6 space-y-3">
          <h1 className="text-xl font-black uppercase">Inventory unavailable</h1>
          <p className="text-sm font-bold text-neutral-700">{inventory.error}</p>
          <button
            type="button"
            onClick={() => void inventory.refresh()}
            className="px-4 py-2 bg-black text-white text-xs font-black uppercase"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans flex flex-col md:flex-row antialiased selection:bg-black selection:text-white">
      {/* Left Column Navigation Sidebar */}
      <Navbar
        organisations={workspace.organisations}
        activeOrg={workspace.activeOrg}
        reportingPeriods={workspace.reportingPeriods}
        activePeriod={workspace.activePeriod}
        activeTab={activeTab}
        userRole={userRole}
        activePersona={activePersona}
        lang={lang}
        currentUserEmail={profile?.email || user.email || ''}
        onSelectTab={setActiveTab}
        onSelectOrg={workspace.selectOrg}
        onSelectPeriod={workspace.selectPeriod}
        onSelectUserRole={setUserRole}
        onSelectPersona={setActivePersona}
        onSelectLang={setLang}
        onOpenOrgModal={() => setIsOrgModalOpen(true)}
        onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
        onSignOut={onSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={inventory.summary}
              org={workspace.activeOrg}
              period={workspace.activePeriod}
              activePersona={activePersona}
              onNavigateToActivities={() => setActiveTab('activities')}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'activities' && (
            <ActivityLogView
              activities={inventory.activities}
              emissionFactors={workspace.emissionFactors}
              activeOrg={workspace.activeOrg}
              activePeriod={workspace.activePeriod}
              userRole={userRole}
              lang={lang}
              onAddActivity={inventory.addActivity}
              onUpdateActivity={inventory.updateActivity}
              onDeleteActivity={inventory.deleteActivity}
              onRefreshData={inventory.refresh}
            />
          )}

          {activeTab === 'integrations' && workspace.activeOrg && (
            <FinancialIntegrationsView
              orgId={workspace.activeOrg.id}
              activePeriod={workspace.activePeriod}
              userRole={userRole}
              lang={lang}
              onRefreshData={inventory.refresh}
            />
          )}

          {activeTab === 'analytics' && workspace.activeOrg && (
            <AnalyticsView orgId={workspace.activeOrg.id} lang={lang} />
          )}

          {activeTab === 'partner' && (
            <PartnerDashboardView
              userRole={userRole}
              lang={lang}
              onSwitchWorkspace={async (orgId) => {
                workspace.selectOrg(orgId);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'factors' && (
            <div className="space-y-8">
              <FactorPackContributionView />
              <EmissionFactorsView
                datasets={workspace.datasets}
                factors={workspace.emissionFactors}
                selectedDataset={workspace.selectedDatasetKey}
                onSelectDataset={workspace.setSelectedDatasetKey}
              />
            </div>
          )}

          {activeTab === 'estimator' && (
            <EstimatorView
              activeOrg={workspace.activeOrg}
              activePeriod={workspace.activePeriod}
              onSaveAndNavigate={async () => {
                await inventory.refresh();
                setActiveTab('activities');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              summary={inventory.summary}
              org={workspace.activeOrg}
              period={workspace.activePeriod}
              activities={inventory.activities}
              auditLogs={inventory.auditLogs}
              userRole={userRole}
              lang={lang}
              onOpenShareToken={onOpenShareToken}
            />
          )}

          {activeTab === 'org' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <div className="border-b-2 border-black pb-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Organisation Profile & Headcount</h2>
                  <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
                    SME corporate parameters for carbon intensity indexing
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs font-bold uppercase">
                  <div>
                    <span className="text-neutral-500 block mb-1">Organisation Name</span>
                    <span className="font-black text-black text-lg block">{workspace.activeOrg?.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Industry Sector</span>
                    <span className="font-black text-black text-base block">{workspace.activeOrg?.industrySector}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Headcount (Employees)</span>
                    <span className="font-black text-black text-base block">{workspace.activeOrg?.employeeCount} FTE</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">Annual Revenue</span>
                    <span className="font-black text-black text-base block">
                      £{(workspace.activeOrg?.annualRevenueGbp || 0).toLocaleString()} GBP
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

                  {workspace.activeOrg && (
                    <a
                      href={`/api/v1/organisations/${workspace.activeOrg.id}/export-data`}
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
            <EnterpriseAdminView org={workspace.activeOrg} userRole={userRole} />
          )}

          {activeTab === 'auditor' && (
            <AuditorPortalView
              activeOrg={workspace.activeOrg}
              activePeriod={workspace.activePeriod}
              activities={inventory.activities}
              summary={inventory.summary}
              auditLogs={inventory.auditLogs}
              onCertificateIssued={() => {
                void inventory.refresh();
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

          {activeTab === 'billing' && <BillingPortalView org={workspace.activeOrg} />}

          {activeTab === 'roadmap' && <RoadmapFeedbackView />}

          {activeTab === 'license' && <LicenseView />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t-2 border-black text-black py-6 text-xs font-bold uppercase tracking-wider print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} CarbonSnap</p>
            <div className="flex items-center space-x-4">
              <span>UK DESNZ 2024 GHG Factors</span>
              <span>•</span>
              <span>US EPA GHG Hub</span>
              <span>•</span>
              <button
                onClick={() => setActiveTab('license')}
                className="font-black hover:underline cursor-pointer"
              >
                License
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <OrganisationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSubmit={workspace.activeOrg ? workspace.updateOrg : workspace.createOrg}
        initialOrg={workspace.activeOrg}
      />

      <PeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSubmit={workspace.createPeriod}
        orgId={workspace.activeOrg?.id || ''}
      />
    </div>
  );
};
