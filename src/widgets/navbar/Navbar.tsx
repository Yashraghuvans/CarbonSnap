/**
 * CarbonSnap — Navbar.tsx
 * FSD: widgets layer — sidebar & mobile navigation
 * Grouped navigation (Core / Connectors / Resources), org & period selectors, role/persona/language controls.
 */
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  Globe,
  LineChart,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Rocket,
  Server,
  ShieldCheck,
  UserCheck,
  X,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { Organisation, PersonaType, ReportingPeriod, UserRole } from '../../shared/model/types';
import { Language, translations } from '../../shared/i18n/translations';

export type NavTab =
  | 'landing'
  | 'dashboard'
  | 'activities'
  | 'integrations'
  | 'analytics'
  | 'partner'
  | 'reports'
  | 'factors'
  | 'org'
  | 'license'
  | 'enterprise'
  | 'estimator'
  | 'auditor'
  | 'docs'
  | 'launch'
  | 'billing'
  | 'roadmap';

interface NavbarProps {
  organisations: Organisation[];
  activeOrg: Organisation | null;
  reportingPeriods: ReportingPeriod[];
  activePeriod: ReportingPeriod | null;
  activeTab: NavTab;
  userRole: UserRole;
  activePersona?: PersonaType;
  lang: Language;
  currentUserEmail?: string;
  onSelectTab: (tab: NavTab) => void;
  onSelectOrg: (orgId: string) => void;
  onSelectPeriod: (periodId: string) => void;
  onSelectUserRole: (role: UserRole) => void;
  onSelectPersona?: (persona: PersonaType) => void;
  onSelectLang: (lang: Language) => void;
  onOpenOrgModal: () => void;
  onOpenPeriodModal: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  organisations,
  activeOrg,
  reportingPeriods,
  activePeriod,
  activeTab,
  userRole,
  activePersona,
  lang,
  currentUserEmail,
  onSelectTab,
  onSelectOrg,
  onSelectPeriod,
  onSelectUserRole,
  onSelectPersona,
  onSelectLang,
  onOpenOrgModal,
  onOpenPeriodModal,
  onSignOut
}) => {
  const t = translations[lang];
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  const navItems: { section: string; items: { id: NavTab; label: string; icon: React.ReactNode; buttonId: string; badge?: string; highlight?: boolean }[] }[] = [
    {
      section: 'Core Carbon Accounting',
      items: [
        { id: 'dashboard', label: t.dashboard, icon: <BarChart3 className="w-4 h-4" />, buttonId: 'nav-dashboard-tab' },
        { id: 'activities', label: t.activities, icon: <FileSpreadsheet className="w-4 h-4" />, buttonId: 'nav-activities-tab' },
        { id: 'analytics', label: t.analytics, icon: <LineChart className="w-4 h-4" />, buttonId: 'nav-analytics-tab' },
        { id: 'reports', label: t.reports, icon: <FileCheck className="w-4 h-4" />, buttonId: 'nav-reports-tab' },
        { id: 'factors', label: t.factors, icon: <FileCheck className="w-4 h-4 text-emerald-600" />, buttonId: 'nav-factors-tab' },
      ]
    },
    {
      section: 'Connectors & Partner Tools',
      items: [
        { id: 'integrations', label: t.financialConnectors, icon: <Zap className="w-4 h-4 text-amber-500" />, buttonId: 'nav-integrations-tab' },
        { id: 'partner', label: t.partnerDashboard, icon: <Briefcase className="w-4 h-4" />, buttonId: 'nav-partner-tab' },
        { id: 'estimator', label: t.estimator, icon: <Calculator className="w-4 h-4" />, buttonId: 'nav-estimator-tab', highlight: true },
        { id: 'enterprise', label: t.enterpriseAdmin, icon: <Server className="w-4 h-4 text-amber-500" />, buttonId: 'nav-enterprise-tab' },
        { id: 'auditor', label: t.auditorPortal, icon: <Award className="w-4 h-4 text-emerald-600" />, buttonId: 'nav-auditor-tab' },
      ]
    },
    {
      section: 'Resources & Governance',
      items: [
        { id: 'billing', label: t.billing, icon: <CreditCard className="w-4 h-4 text-amber-500" />, buttonId: 'nav-billing-tab' },
        { id: 'docs', label: t.docsHub, icon: <BookOpen className="w-4 h-4 text-amber-500" />, buttonId: 'nav-docs-tab' },
        { id: 'launch', label: t.launchArticles, icon: <Rocket className="w-4 h-4 text-emerald-500" />, buttonId: 'nav-launch-tab' },
        { id: 'roadmap', label: t.roadmapHub, icon: <MapPin className="w-4 h-4 text-amber-600" />, buttonId: 'nav-roadmap-tab' },
        { id: 'org', label: t.orgProfile, icon: <Building2 className="w-4 h-4" />, buttonId: 'nav-org-tab' },
        { id: 'license', label: t.license, icon: <ShieldCheck className="w-4 h-4" />, buttonId: 'nav-license-tab' },
      ]
    }
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-black font-sans divide-y-2 divide-black">
      {/* Brand Header */}
      <div className="p-4 space-y-2 bg-amber-300 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-2xl font-black uppercase tracking-tight text-black font-sans">
                CarbonSnap
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-neutral-800 tracking-wider block">
              Carbon Accounting & Advisory Engine
            </span>
          </div>

          <span className="inline-block bg-black text-amber-300 font-black text-[9px] uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            AGPLv3
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase text-neutral-800 leading-tight">
          SME Carbon Accounting & Advisory Engine
        </p>
      </div>

      {/* Workspace & Period Context Selectors */}
      <div className="p-3 bg-neutral-50 space-y-2 font-mono text-xs">
        {/* Workspace Select */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-500 flex items-center space-x-1">
              <Building2 className="w-3 h-3" />
              <span>Workspace:</span>
            </span>
          </div>

          <select
            id="org-select"
            value={activeOrg?.id || ''}
            onChange={(e) => onSelectOrg(e.target.value)}
            className="w-full bg-white border-2 border-black p-1.5 font-bold text-xs uppercase focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {organisations.map((org) => (
              <option key={org.id} value={org.id} className="bg-white text-black font-bold">
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reporting Period Select */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-500 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Period:</span>
            </span>
            <button
              id="new-period-btn"
              onClick={onOpenPeriodModal}
              disabled={userRole !== 'Admin'}
              title="Add Reporting Period"
              className="p-0.5 bg-white hover:bg-black hover:text-white border border-black text-black transition-colors cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <select
            id="period-select"
            value={activePeriod?.id || ''}
            onChange={(e) => onSelectPeriod(e.target.value)}
            className="w-full bg-white border-2 border-black p-1.5 font-bold text-xs uppercase focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {reportingPeriods.map((period) => (
              <option key={period.id} value={period.id} className="bg-white text-black font-bold">
                {period.name} {period.isBaseline ? '(Base)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vertical Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider px-2 block">
              {group.section}
            </span>
            <div className="space-y-0.5 font-sans">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={item.buttonId}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(255,191,0,1)]'
                        : item.highlight
                        ? 'bg-amber-100 border-black text-black hover:bg-amber-200'
                        : 'bg-white border-transparent hover:border-black text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role, Persona, Language Control Panel */}
      <div className="p-3 bg-neutral-100 space-y-2 border-t-2 border-black font-mono text-xs">
        {/* Persona Select */}
        <div className="flex items-center justify-between bg-white border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-[10px] font-black uppercase text-neutral-600 flex items-center space-x-1">
            <Briefcase className="w-3 h-3" />
            <span>Persona:</span>
          </span>
          <select
            id="persona-select"
            value={activePersona || 'DEFAULT_ADMIN'}
            onChange={(e) => onSelectPersona?.(e.target.value as PersonaType)}
            className="bg-transparent font-black focus:outline-none cursor-pointer text-[11px] uppercase text-right"
          >
            <option value="DEFAULT_ADMIN">Default Admin</option>
            <option value="SAM_SME_OPS">Sam (SME Ops)</option>
            <option value="PRIYA_ACCOUNTANT">Priya (Acct)</option>
            <option value="EMMA_CONSULTANT">Emma (Auditor)</option>
          </select>
        </div>

        {/* RBAC Role Select */}
        <div className="flex items-center justify-between bg-white border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-[10px] font-black uppercase text-neutral-600 flex items-center space-x-1">
            <UserCheck className="w-3 h-3" />
            <span>Role:</span>
          </span>
          <select
            id="role-select"
            value={userRole}
            onChange={(e) => onSelectUserRole(e.target.value as UserRole)}
            className="bg-transparent font-black focus:outline-none cursor-pointer text-[11px] uppercase text-right"
          >
            <option value="Admin">{t.roleAdmin}</option>
            <option value="Contributor">{t.roleContributor}</option>
            <option value="Auditor">{t.roleAuditor}</option>
          </select>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center justify-between bg-white border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-[10px] font-black uppercase text-neutral-600 flex items-center space-x-1 pl-1">
            <Globe className="w-3 h-3" />
            <span>Lang:</span>
          </span>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => onSelectLang('en')}
              className={`px-2 py-0.5 text-[10px] font-black uppercase cursor-pointer border border-black ${
                lang === 'en' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onSelectLang('de')}
              className={`px-2 py-0.5 text-[10px] font-black uppercase cursor-pointer border border-black ${
                lang === 'de' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
              }`}
            >
              DE
            </button>
          </div>
        </div>

        {/* Sign Out / Exit Workspace Button */}
        {currentUserEmail && (
          <div className="flex items-center justify-between bg-white border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-neutral-600 flex items-center space-x-1 min-w-0">
              <UserCheck className="w-3 h-3 shrink-0" />
              <span className="truncate">{currentUserEmail}</span>
            </span>
          </div>
        )}
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full mt-2 py-2 px-3 bg-red-100 hover:bg-red-200 text-red-950 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-700" />
            <span>Sign Out Workspace</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Column Navigation Sidebar (md and above) */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 shrink-0 border-r-2 border-black bg-white z-30 print:hidden overflow-hidden">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Top Header with Drawer Toggle (< md) */}
      <header className="md:hidden sticky top-0 z-40 bg-amber-300 border-b-2 border-black p-3 flex items-center justify-between text-black print:hidden">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-black uppercase tracking-tight text-black font-sans">
              CarbonSnap
            </span>
            <span className="text-[9px] font-black bg-black text-amber-300 uppercase px-1.5 py-0.5 border border-black">
              Carbon Accounting
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Sidebar Slide-out Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full border-r-4 border-black z-10 overflow-y-auto">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};
