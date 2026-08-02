/**
 * CarbonSnap — ReportsView.tsx
 * FSD: features layer — GHG report generation
 * Report builder: SECR / CSRD / SB 253 / GHG Protocol output, share links, download.
 */
import {
  Award,
  Briefcase,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  Globe,
  Printer,
  Share2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  createSupplierShareLink,
  fetchPartnerBrand,
  fetchSupplierShareLinks,
  togglePeriodVerification
} from '../../shared/api/client';
import { Language, translations } from '../../shared/i18n/translations';
import {
  ActivityEntry,
  AuditLog,
  CaliforniaSbReport,
  CsrdDisclosure,
  EmissionsSummary,
  Organisation,
  PartnerBrand,
  ReportingFramework,
  ReportingPeriod,
  SecrData,
  SupplierShareLink,
  UserRole
} from '../../shared/model/types';
import { fetchCaliforniaSbReport, fetchCsrdReport, fetchSecrReport } from '../../shared/api/client';
import { PublicVerificationModal } from './PublicVerificationModal';


interface ReportsViewProps {
  summary: EmissionsSummary | null;
  org: Organisation | null;
  period: ReportingPeriod | null;
  activities: ActivityEntry[];
  auditLogs: AuditLog[];
  userRole?: UserRole;
  lang?: Language;
  onOpenShareToken?: (token: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  org,
  period,
  activities,
  auditLogs,
  userRole = 'Admin',
  lang = 'en',
  onOpenShareToken
}) => {
  const t = translations[lang];
  const [partnerBrand, setPartnerBrand] = useState<PartnerBrand | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<ReportingPeriod | null>(period);
  const [shareLinks, setShareLinks] = useState<SupplierShareLink[]>([]);
  const [newShareName, setNewShareName] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [selectedFramework, setSelectedFramework] = useState<ReportingFramework>('GHG_PROTOCOL');
  const [csrdData, setCsrdData] = useState<CsrdDisclosure | null>(null);
  const [secrData, setSecrData] = useState<SecrData | null>(null);
  const [californiaData, setCaliforniaData] = useState<CaliforniaSbReport | null>(null);
  const [loadingFrameworkData, setLoadingFrameworkData] = useState(false);
  const [showPublicSealModal, setShowPublicSealModal] = useState(false);

  useEffect(() => {
    setCurrentPeriod(period);
  }, [period]);

  useEffect(() => {
    if (!period?.id) return;
    if (selectedFramework === 'EU_CSRD') {
      setLoadingFrameworkData(true);
      fetchCsrdReport(period.id)
        .then(setCsrdData)
        .catch((e) => console.error(e))
        .finally(() => setLoadingFrameworkData(false));
    } else if (selectedFramework === 'UK_SECR') {
      setLoadingFrameworkData(true);
      fetchSecrReport(period.id)
        .then(setSecrData)
        .catch((e) => console.error(e))
        .finally(() => setLoadingFrameworkData(false));
    } else if (selectedFramework === 'US_CALIFORNIA_SB') {
      setLoadingFrameworkData(true);
      fetchCaliforniaSbReport(period.id, org?.id || 'org_acme_001')
        .then(setCaliforniaData)
        .catch((e) => console.error(e))
        .finally(() => setLoadingFrameworkData(false));
    }
  }, [period?.id, selectedFramework, org?.id]);


  useEffect(() => {
    fetchPartnerBrand()
      .then(setPartnerBrand)
      .catch(() => {});

    if (org?.id) {
      fetchSupplierShareLinks(org.id)
        .then(setShareLinks)
        .catch(() => {});
    }
  }, [org?.id]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!org || !period) return;
    window.open(`/api/reports/csv?orgId=${org.id}&periodId=${period.id}`, '_blank');
  };

  const handleToggleVerification = async () => {
    if (!currentPeriod) return;
    setVerifying(true);
    try {
      const updated = await togglePeriodVerification(currentPeriod.id);
      setCurrentPeriod(updated);
    } catch (err: any) {
      alert(err.message || 'Failed updating report verification status');
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateShareLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || !currentPeriod || !newShareName.trim()) return;
    try {
      const link = await createSupplierShareLink(org.id, currentPeriod.id, newShareName.trim());
      setShareLinks(prev => [link, ...prev]);
      setNewShareName('');
    } catch (err: any) {
      alert(err.message || 'Failed generating supplier share link');
    }
  };

  const copyShareUrl = (token: string) => {
    const fullUrl = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (!summary) {
    return <div className="p-8 text-center text-black font-black uppercase">Loading summary report data...</div>;
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Top Actions Bar (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
            <FileCheck className="w-6 h-6 text-black" />
            <span>{t.reportTitle}</span>
          </h1>
          <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
            // {t.reportSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audit Verification Toggle Button */}
          {userRole !== 'Contributor' && currentPeriod && (
            <button
              onClick={handleToggleVerification}
              disabled={verifying}
              className={`inline-flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
                currentPeriod.is_verified
                  ? 'bg-emerald-300 hover:bg-emerald-200 text-black'
                  : 'bg-amber-300 hover:bg-amber-200 text-black'
              }`}
            >
              <Award className="w-4 h-4 text-black" />
              <span>
                {currentPeriod.is_verified ? 'Verified (Click to Revoke)' : 'Mark Audit Verified'}
              </span>
            </button>
          )}

          <button
            id="print-pdf-btn"
            onClick={handlePrintPdf}
            className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printPdfReport}</span>
          </button>

          <button
            id="download-csv-btn"
            onClick={handleDownloadCsv}
            className="inline-flex items-center space-x-2 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            id="download-audit-bundle-btn"
            onClick={async () => {
              if (!period) return;
              try {
                const res = await fetch(`/api/v1/reports/${period.id}/audit-bundle`);
                if (!res.ok) throw new Error('Bundle generation failed');
                const bundle = await res.json();

                // Download full audit bundle JSON package
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `AuditBundle_${org?.name || 'Org'}_${period.name.replace(/\s+/g, '_')}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              } catch (e: any) {
                alert(`Error downloading audit bundle: ${e.message}`);
              }
            }}
            className="inline-flex items-center space-x-2 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-black" />
            <span>Audit Bundle (.json/csv)</span>
          </button>
        </div>
      </div>

      {/* PHASE 8: SPECIALIZED REGULATORY FRAMEWORK SELECTOR */}
      <div className="bg-neutral-900 border-2 border-black p-4 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Regulatory Reporting Framework:
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFramework('GHG_PROTOCOL')}
              className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
                selectedFramework === 'GHG_PROTOCOL'
                  ? 'bg-emerald-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              GHG Protocol Corporate Standard
            </button>

            <button
              onClick={() => setSelectedFramework('EU_CSRD')}
              className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
                selectedFramework === 'EU_CSRD'
                  ? 'bg-indigo-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              EU CSRD (ESRS E1)
            </button>

            <button
              onClick={() => setSelectedFramework('UK_SECR')}
              className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
                selectedFramework === 'UK_SECR'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              UK SECR (Energy & Carbon)
            </button>

            <button
              onClick={() => setSelectedFramework('US_CALIFORNIA_SB')}
              className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
                selectedFramework === 'US_CALIFORNIA_SB'
                  ? 'bg-rose-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              California SB 253 / 261
            </button>
          </div>
        </div>

        {/* Framework Description Note */}
        <p className="text-[11px] font-mono text-neutral-400">
          {selectedFramework === 'GHG_PROTOCOL' && 'Standard Scope 1, 2, and 3 accounting breakdown aligned with WRI/WBCSD GHG Protocol.'}
          {selectedFramework === 'EU_CSRD' && 'European Sustainability Reporting Standards (ESRS E1) - Double materiality, qualitative risks & decarbonization transition plan.'}
          {selectedFramework === 'UK_SECR' && 'UK Streamlined Energy & Carbon Reporting - Mandatory kWh energy consumption, intensity metrics (tCO2e/£1M turnover), & efficiency actions.'}
          {selectedFramework === 'US_CALIFORNIA_SB' && 'California Climate Corporate Data Accountability Act (SB 253) & Climate-Related Financial Risk Act (SB 261) - Scope 1-3 disclosures & TCFD physical/transition risk governance.'}
        </p>
      </div>


      {/* CSRD TEMPLATE VIEW */}
      {selectedFramework === 'EU_CSRD' && csrdData && (
        <div className="bg-indigo-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-indigo-300 text-xs font-black uppercase px-2.5 py-1">
                EU Regulation Directive 2022/2464
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                EU CSRD - ESRS E1 Climate Change Disclosure Template
              </h3>
            </div>
            <span className="text-xs font-bold font-mono text-black bg-indigo-200 px-3 py-1 border border-black">
              Double Materiality Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Double Materiality Matrix */}
            <div className="bg-white border-2 border-black p-4 space-y-3">
              <h4 className="text-xs font-black uppercase text-black border-b-2 border-black pb-1">
                1. Double Materiality Assessment Matrix
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="p-3 bg-indigo-100 border border-black">
                  <span className="text-[10px] text-neutral-600 uppercase block">Impact Materiality</span>
                  <span className="text-base font-black text-indigo-900">{csrdData.doubleMaterialityAssessment.impactMateriality}</span>
                </div>
                <div className="p-3 bg-indigo-100 border border-black">
                  <span className="text-[10px] text-neutral-600 uppercase block">Financial Materiality</span>
                  <span className="text-base font-black text-indigo-900">{csrdData.doubleMaterialityAssessment.financialMateriality}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-600 block mb-1">Key ESRS Material Topics:</span>
                <ul className="list-disc list-inside text-xs font-bold text-neutral-800 space-y-1">
                  {csrdData.doubleMaterialityAssessment.keyTopics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Climate Targets & Transition Plan */}
            <div className="bg-white border-2 border-black p-4 space-y-3">
              <h4 className="text-xs font-black uppercase text-black border-b-2 border-black pb-1">
                2. ESRS E1 Net-Zero Targets & Transition Plan
              </h4>
              <div className="p-3 bg-emerald-100 border border-black text-xs font-bold space-y-1">
                <span className="text-[10px] uppercase text-emerald-900 block">Reduction Target</span>
                <p className="text-sm font-black text-emerald-950">
                  {csrdData.esrsE1Targets.reductionPercentage}% absolute reduction by {csrdData.esrsE1Targets.targetYear} (vs {csrdData.esrsE1Targets.baseYear} baseline)
                </p>
              </div>
              <p className="text-xs text-neutral-800 leading-relaxed font-mono bg-neutral-50 p-3 border border-black">
                {csrdData.climateTransitionPlan}
              </p>
            </div>

            {/* Governance Narrative */}
            <div className="bg-white border-2 border-black p-4 space-y-2 md:col-span-2">
              <h4 className="text-xs font-black uppercase text-black border-b-2 border-black pb-1">
                3. Climate Governance & Board Oversight
              </h4>
              <p className="text-xs text-neutral-800 leading-relaxed font-mono">
                {csrdData.governanceNarrative}
              </p>
            </div>

            {/* Risks */}
            <div className="bg-white border-2 border-black p-4 space-y-2">
              <h4 className="text-xs font-black uppercase text-red-900 border-b-2 border-black pb-1">
                Physical Climate Risks
              </h4>
              <p className="text-xs text-neutral-800 font-mono">{csrdData.physicalRisks}</p>
            </div>
            <div className="bg-white border-2 border-black p-4 space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-900 border-b-2 border-black pb-1">
                Transitional & Policy Risks
              </h4>
              <p className="text-xs text-neutral-800 font-mono">{csrdData.transitionalRisks}</p>
            </div>
          </div>
        </div>
      )}

      {/* SECR TEMPLATE VIEW */}
      {selectedFramework === 'UK_SECR' && secrData && (
        <div className="bg-amber-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-amber-300 text-xs font-black uppercase px-2.5 py-1">
                UK Companies Act 2006 (Strategic Report)
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                UK SECR (Streamlined Energy and Carbon Reporting) Disclosure
              </h3>
            </div>
            <span className="text-xs font-bold font-mono text-black bg-amber-200 px-3 py-1 border border-black">
              DESNZ / DEFRA Guidance Aligned
            </span>
          </div>

          {/* Energy Use Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-black p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-neutral-600">Electricity (kWh)</span>
              <div className="text-xl font-black text-black">{secrData.ukEnergyConsumptionKwh.electricityKwh.toLocaleString()}</div>
            </div>
            <div className="bg-white border-2 border-black p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-neutral-600">Natural Gas (kWh)</span>
              <div className="text-xl font-black text-black">{secrData.ukEnergyConsumptionKwh.gasKwh.toLocaleString()}</div>
            </div>
            <div className="bg-white border-2 border-black p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-neutral-600">Transport Fuel (kWh)</span>
              <div className="text-xl font-black text-black">{secrData.ukEnergyConsumptionKwh.transportKwh.toLocaleString()}</div>
            </div>
            <div className="bg-amber-300 border-2 border-black p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-black">Total UK Energy (kWh)</span>
              <div className="text-xl font-black text-black">{secrData.ukEnergyConsumptionKwh.totalKwh.toLocaleString()}</div>
            </div>
          </div>

          {/* Mandatory Intensity Metric & Scope 1/2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-black p-4 space-y-2">
              <span className="text-xs font-black uppercase text-black block border-b-2 border-black pb-1">
                Mandatory Intensity Ratio
              </span>
              <div className="text-2xl font-black text-emerald-900">
                {secrData.intensityRatio.value} <span className="text-xs font-bold text-neutral-600">tCO2e</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-600 uppercase">{secrData.intensityRatio.metric}</p>
            </div>

            <div className="bg-white border-2 border-black p-4 space-y-2">
              <span className="text-xs font-black uppercase text-black block border-b-2 border-black pb-1">
                Scope 1 & 2 Emissions (tCO2e)
              </span>
              <div className="text-xs font-bold space-y-1">
                <div className="flex justify-between">
                  <span>Scope 1 (Direct Gas/Fleet):</span>
                  <span className="font-mono font-black">{secrData.scope1TonnesCo2e.toFixed(2)} t</span>
                </div>
                <div className="flex justify-between">
                  <span>Scope 2 (Electricity Grid):</span>
                  <span className="font-mono font-black">{secrData.scope2TonnesCo2e.toFixed(2)} t</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black font-black text-black">
                  <span>Total Scope 1 & 2:</span>
                  <span className="font-mono text-sm">{secrData.totalTonnesCo2e.toFixed(2)} tCO2e</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black p-4 space-y-2">
              <span className="text-xs font-black uppercase text-black block border-b-2 border-black pb-1">
                Calculation Methodology
              </span>
              <p className="text-[11px] font-mono text-neutral-800 leading-snug">
                {secrData.calculationMethodology}
              </p>
            </div>

            <div className="bg-white border-2 border-black p-4 space-y-2 md:col-span-3">
              <span className="text-xs font-black uppercase text-black block border-b-2 border-black pb-1">
                Principal Energy Efficiency Measures Taken
              </span>
              <p className="text-xs text-neutral-800 leading-relaxed font-mono">
                {secrData.energyEfficiencyActionsTaken}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CALIFORNIA SB 253 / 261 TEMPLATE VIEW */}
      {selectedFramework === 'US_CALIFORNIA_SB' && californiaData && (
        <div className="bg-rose-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-rose-300 text-xs font-black uppercase px-2.5 py-1">
                US California Legislation (SB 253 / SB 261)
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                California Climate Corporate Data & Risk Disclosure
              </h3>
            </div>

            <button
              onClick={() => setShowPublicSealModal(true)}
              className="bg-black hover:bg-neutral-800 text-amber-400 font-black text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Inspect Public Verification Seal</span>
            </button>
          </div>

          {/* SB 253 Disclosure Grid */}
          <div className="bg-white border-2 border-black p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="font-black text-black uppercase text-xs">
                1. SB 253 GHG Corporate Data Disclosure ({californiaData.sb253Disclosure.fiscalYear})
              </span>
              <span className="bg-rose-200 border border-black text-rose-950 px-2 py-0.5 text-[10px] font-black uppercase">
                Assurance: {californiaData.sb253Disclosure.assuranceLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 border border-black text-center">
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 1 (Direct)</span>
                <span className="text-base font-black text-black">{californiaData.sb253Disclosure.scope1EmissionsMt} MT CO2e</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 2 (Electricity)</span>
                <span className="text-base font-black text-black">{californiaData.sb253Disclosure.scope2EmissionsMt} MT CO2e</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 3 (Value Chain)</span>
                <span className="text-base font-black text-black">{californiaData.sb253Disclosure.scope3EmissionsMt} MT CO2e</span>
              </div>
              <div className="bg-rose-300 border border-black p-1">
                <span className="text-[10px] font-black uppercase text-black block">Total MT CO2e</span>
                <span className="text-base font-black text-black">{californiaData.sb253Disclosure.totalEmissionsMt} MT</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-neutral-600 uppercase">
              Standard: {californiaData.sb253Disclosure.reportingStandard}
            </p>
          </div>

          {/* SB 261 Climate Financial Risk */}
          <div className="bg-white border-2 border-black p-5 space-y-4 font-mono text-xs">
            <span className="font-black text-black uppercase text-xs block border-b border-black pb-2">
              2. SB 261 Climate-Related Financial Risk Assessment (TCFD Framework)
            </span>

            <div className="space-y-3">
              <div>
                <span className="font-black uppercase text-black block text-[11px] mb-1">Board & Executive Governance Oversight:</span>
                <p className="p-3 bg-neutral-50 border border-black leading-relaxed text-neutral-800">
                  {californiaData.sb261FinancialRisk.governanceOversight}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 border border-black space-y-1">
                  <span className="font-black uppercase text-red-950 text-[11px] block">Physical Climate Risks Identified:</span>
                  <ul className="list-disc list-inside text-[11px] text-red-900 space-y-1">
                    {californiaData.sb261FinancialRisk.physicalRisksIdentified.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 border border-black space-y-1">
                  <span className="font-black uppercase text-amber-950 text-[11px] block">Transition Climate Risks Identified:</span>
                  <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-1">
                    {californiaData.sb261FinancialRisk.transitionRisksIdentified.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <span className="font-black uppercase text-black block text-[11px] mb-1">Risk Mitigation & Adaptation Strategy:</span>
                <p className="p-3 bg-emerald-50 border border-black leading-relaxed text-emerald-950 font-bold">
                  {californiaData.sb261FinancialRisk.riskMitigationStrategy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: SUPPLIER SHARING PORTAL GENERATOR WIDGET (Hidden during print) */}
      <div className="bg-amber-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-black text-amber-400 font-black text-[10px] uppercase px-2 py-0.5 border border-black tracking-widest">
                Scope 3 Value Chain
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-black">
                Supplier Sharing Portal (Corporate Buyer Access)
              </h3>
            </div>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-1">
              // Generate secure read-only URLs for Walmart, Amazon, or corporate tenders without requiring buyer logins.
            </p>
          </div>

          <span className="text-xs font-black uppercase font-mono bg-black text-white px-3 py-1 border border-black self-start sm:self-auto">
            Portability Engine
          </span>
        </div>

        <form onSubmit={handleCreateShareLink} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="e.g. Walmart Scope 3 Procurement Compliance Audit 2024"
            value={newShareName}
            onChange={(e) => setNewShareName(e.target.value)}
            className="flex-1 p-2.5 bg-white border-2 border-black text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
          <button
            type="submit"
            className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer whitespace-nowrap"
          >
            + Generate Share Link
          </button>
        </form>

        {shareLinks.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-black">
            <span className="text-[11px] font-black uppercase text-black block">
              Active Share Links ({shareLinks.length})
            </span>
            <div className="divide-y-2 divide-black border-2 border-black bg-white">
              {shareLinks.map((s) => (
                <div key={s.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold uppercase">
                  <div>
                    <span className="font-black text-black">{s.shareName}</span>
                    <div className="text-[10px] font-mono text-neutral-500">
                      Token: {s.token} | Created: {new Date(s.createdAt).toLocaleDateString()} | Views: {s.accessCount}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onOpenShareToken && (
                      <button
                        onClick={() => onOpenShareToken(s.token)}
                        className="bg-neutral-100 hover:bg-neutral-200 border border-black text-black px-2.5 py-1 text-[10px] font-black uppercase cursor-pointer inline-flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Preview Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => copyShareUrl(s.token)}
                      className="bg-amber-400 hover:bg-amber-300 border border-black text-black px-2.5 py-1 text-[10px] font-black uppercase cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedToken === s.token ? 'COPIED!' : 'COPY URL'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE EXECUTIVE REPORT DOCUMENT CONTAINER */}
      <div id="printable-report" className="bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black space-y-8 font-sans print:border-none print:p-0 print:shadow-none">
        
        {/* Partner White-Label Branding Banner (If active) */}
        {partnerBrand && (
          <div
            className="p-4 border-2 border-black text-white flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: partnerBrand.primaryColor || '#0f172a' }}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-white" />
              <span className="font-black text-sm uppercase tracking-wider">{partnerBrand.partnerName}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 border border-white">
              Certified Carbon Advisory Partner
            </span>
          </div>
        )}

        {/* VERIFIED ASSURANCE SEAL BADGE */}
        {currentPeriod?.is_verified ? (
          <div className="bg-emerald-50 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-400 border-2 border-black flex items-center justify-center text-black shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-black text-emerald-400 font-black text-[10px] uppercase px-2 py-0.5 tracking-widest">
                    AUDIT-READY VERIFIED
                  </span>
                  <span className="text-xs font-black text-emerald-900 uppercase">
                    GHG Protocol & SECR Verification Seal
                  </span>
                </div>
                <h3 className="text-base font-black uppercase text-black mt-0.5">
                  Official Verification Assurance Statement
                </h3>
                <p className="text-xs font-bold text-neutral-700 uppercase">
                  Verified by: <strong className="text-black font-black">{currentPeriod.verifiedBy || 'Lead Carbon Auditor'}</strong> on {currentPeriod.verifiedAt ? new Date(currentPeriod.verifiedAt).toLocaleDateString() : 'Current Cycle'}
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-black pl-4 font-mono">
              <span className="text-[10px] font-black uppercase text-emerald-900 block">Verification Stamp</span>
              <span className="text-xs font-black text-black">VER-2024-{currentPeriod.id.toUpperCase()}</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-100 border-2 border-black p-3 text-xs font-bold uppercase text-amber-900 flex items-center justify-between">
            <span>DRAFT UNVERIFIED REPORT STATEMENT — Subject to external lead auditor verification.</span>
            <span className="bg-amber-300 border border-black text-black font-black text-[10px] px-2 py-0.5">
              UNVERIFIED
            </span>
          </div>
        )}


        {/* Letterhead Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              {org?.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} className="h-10 w-auto border border-black object-contain" />
              ) : (
                <div className="w-10 h-10 bg-black text-white font-black flex items-center justify-center text-lg border-2 border-black">
                  {org?.name ? org.name.charAt(0) : 'C'}
                </div>
              )}
              <div>
                <span className="text-2xl font-black text-black tracking-tight uppercase block">CarbonSnap</span>
                <span className="text-[10px] font-black uppercase text-neutral-500">Corporate Carbon Inventory Report</span>
              </div>
            </div>
            <h2 className="text-base font-black uppercase tracking-tight text-black mt-3">
              Annual Greenhouse Gas Emissions & Decarbonisation Statement
            </h2>
            <p className="text-xs font-bold uppercase text-neutral-600">
              Calculated in accordance with GHG Protocol Corporate Accounting Standard & Official 2024 Conversion Factors.
            </p>
          </div>

          <div className="text-right text-xs font-bold uppercase text-black space-y-1 bg-neutral-50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black text-black text-sm">{org?.name}</p>
            <p className="text-neutral-600">{org?.industrySector}</p>
            <p>Country: <span className="font-black">{org?.country}</span></p>
            <p className="font-mono text-[11px] text-neutral-500 pt-1 border-t border-black">
              Generated: {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        {/* Reporting Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-neutral-50 border-2 border-black text-xs font-bold uppercase">
          <div>
            <span className="text-neutral-500 block mb-0.5">Reporting Period</span>
            <span className="font-black text-black">{period?.name}</span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5">Cycle Window</span>
            <span className="font-black text-black">
              {period?.startDate} to {period?.endDate}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5">Organisation Headcount</span>
            <span className="font-black text-black">{org?.employeeCount} Employees</span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5">Annual Turnover</span>
            <span className="font-black text-black">
              £{((org?.annualRevenueGbp || 0) / 1000000).toFixed(2)}M GBP
            </span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-widest border-b-2 border-black pb-1">
            1. Executive Carbon Footprint Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-black text-white border-2 border-black">
              <span className="text-xs text-neutral-300 block font-black uppercase tracking-wider">Total Gross Footprint</span>
              <div className="text-3xl font-black font-mono mt-2">
                {summary.total_tonnes.toFixed(2)} <span className="text-xs font-bold">t CO₂e</span>
              </div>
              <span className="text-[11px] font-bold text-neutral-400 block mt-1 uppercase">
                {summary.total_kg.toLocaleString()} kg CO₂e
              </span>
            </div>

            <div className="p-5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs text-neutral-600 block font-black uppercase tracking-wider">Scope 1 Direct Fuel</span>
              <div className="text-2xl font-black font-mono mt-2">
                {(summary.scope1_kg / 1000).toFixed(2)} t CO₂e
              </div>
              <span className="text-xs font-bold text-black block mt-1 uppercase">{summary.scope1_percent}% of total</span>
            </div>

            <div className="p-5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs text-neutral-600 block font-black uppercase tracking-wider">Scope 2 Power</span>
              <div className="text-2xl font-black font-mono mt-2">
                {(summary.scope2_kg / 1000).toFixed(2)} t CO₂e
              </div>
              <span className="text-xs font-bold text-black block mt-1 uppercase">{summary.scope2_percent}% of total</span>
            </div>

            <div className="p-5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs text-neutral-600 block font-black uppercase tracking-wider">Scope 3 Value Chain</span>
              <div className="text-2xl font-black font-mono mt-2">
                {(summary.scope3_kg / 1000).toFixed(2)} t CO₂e
              </div>
              <span className="text-xs font-bold text-black block mt-1 uppercase">{summary.scope3_percent}% of total</span>
            </div>
          </div>
        </div>

        {/* Normalization & Intensity Ratios */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-widest border-b-2 border-black pb-1">
            2. Intensity & Efficiency Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase">
            <div className="p-5 bg-neutral-50 border-2 border-black">
              <span className="font-black text-neutral-600 block">Headcount Intensity Ratio</span>
              <div className="text-xl font-black text-black mt-2">
                {summary.intensityPerEmployee_kg.toLocaleString()} kg CO₂e per Employee
              </div>
              <p className="text-neutral-500 text-[11px] font-bold mt-1">
                // Benchmark metric for UK SME corporate ESG disclosure.
              </p>
            </div>

            <div className="p-5 bg-neutral-50 border-2 border-black">
              <span className="font-black text-neutral-600 block">Turnover Intensity Ratio</span>
              <div className="text-xl font-black text-black mt-2">
                {summary.intensityPerRevenue_kgPer1k.toFixed(2)} kg CO₂e per £1,000 Turnover
              </div>
              <p className="text-neutral-500 text-[11px] font-bold mt-1">
                // Economic carbon decoupling efficiency indicator.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Category Inventory Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-black uppercase tracking-widest border-b-2 border-black pb-1">
            3. GHG Protocol Inventory Breakdown by Category
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black text-xs font-black text-black uppercase tracking-wider">
                <th className="py-3 px-4 border-r-2 border-black">Emission Source Category</th>
                <th className="py-3 px-4 border-r-2 border-black">Scope</th>
                <th className="py-3 px-4 border-r-2 border-black text-right">CO₂e (kg)</th>
                <th className="py-3 px-4 border-r-2 border-black text-right">CO₂e (tonnes)</th>
                <th className="py-3 px-4 text-right">% Share</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-bold">
              {summary.byCategory.map((cat, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-r-2 border-black font-black uppercase">{cat.category}</td>
                  <td className="py-3 px-4 border-r-2 border-black">
                    <span className="px-2 py-0.5 bg-black text-white font-black text-[10px] uppercase">
                      Scope {cat.scope}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-r-2 border-black text-right font-mono font-bold">{cat.co2e_kg.toLocaleString()}</td>
                  <td className="py-3 px-4 border-r-2 border-black text-right font-mono font-black text-black">{cat.co2e_tonnes} t</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{cat.percentage}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-black text-white font-black border-t-2 border-black">
                <td colSpan={2} className="py-3.5 px-4 uppercase tracking-wider">TOTAL CORPORATE CARBON INVENTORY</td>
                <td className="py-3.5 px-4 text-right font-mono">{summary.total_kg.toLocaleString()} kg</td>
                <td className="py-3.5 px-4 text-right font-mono">{summary.total_tonnes.toFixed(3)} t</td>
                <td className="py-3.5 px-4 text-right font-mono">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Phase 3: Calculation Appendix for Third-Party Auditors */}
        <div className="space-y-4 pt-4">
          <div className="border-b-2 border-black pb-1 flex items-center justify-between">
            <h3 className="text-sm font-black text-black uppercase tracking-widest">
              4. {t.calcAppendixTitle}
            </h3>
            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black">
              Auditor Verified
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase">
            // {t.calcAppendixSubtitle}
          </p>

          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-black text-black uppercase">
                <th className="p-2 border-r border-black">{t.colDate}</th>
                <th className="p-2 border-r border-black">{t.colDesc}</th>
                <th className="p-2 border-r border-black">{t.colQty}</th>
                <th className="p-2 border-r border-black">{t.colFactorId}</th>
                <th className="p-2 border-r border-black">{t.colFormula}</th>
                <th className="p-2 text-right">{t.colCo2eKg}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black border-b-2 border-black font-medium">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-neutral-50">
                  <td className="p-2 border-r border-black font-bold">{act.date}</td>
                  <td className="p-2 border-r border-black font-sans font-bold text-black">{act.description}</td>
                  <td className="p-2 border-r border-black font-bold">
                    {act.quantity} {act.unit}
                  </td>
                  <td className="p-2 border-r border-black text-[10px]">
                    <div className="font-bold text-black">{act.factorId}</div>
                    <div className="text-neutral-500">{act.factorName}</div>
                  </td>
                  <td className="p-2 border-r border-black text-[10px] text-neutral-700 font-mono">
                    {act.quantity} * {act.factorValue} kg/unit
                  </td>
                  <td className="p-2 text-right font-black text-black font-mono">
                    {act.co2e_kg.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance Sign-off & Methodology Statement Footer */}
        <div className="pt-6 border-t-2 border-black space-y-4">
          <div className="bg-neutral-100 border-2 border-black p-4 text-xs font-bold uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black block mb-1 text-black">// Methodology Statement</span>
            <p className="leading-relaxed text-neutral-800">
              This carbon footprint assessment was conducted in accordance with the <strong className="font-black text-black">GHG Protocol Corporate Accounting and Reporting Standard (Revised Edition)</strong> and <strong className="font-black text-black">ISO 14064-1</strong>. Emission factors applied are sourced from official 2024 government conversion factors (UK DESNZ/Defra, US EPA GHG Center, IPCC Guidelines). All calculations are server-side deterministic mapping (<code className="bg-white border border-black px-1 font-mono text-[11px]">quantity * factorValue</code>) and fully auditable under the GNU AGPLv3 license.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold uppercase text-neutral-600">
            <div>
              <p className="font-black text-black">CarbonSnap Open-Source Decarbonisation Engine</p>
              <p>Licensed under GNU AGPLv3 &bull; Open Audit Verification ID: CS-{period?.id}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-black">Compliance Standard</p>
              <p>GHG Protocol Corporate Standard & ISO 14064-1</p>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIT TRAIL LOG SECTION */}
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 print:hidden">
        <h3 className="text-base font-black uppercase tracking-tight text-black flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-black" />
          <span>Transparent Calculation Audit Trail Log</span>
        </h3>
        <p className="text-xs font-bold uppercase text-neutral-500">
          // Immutable system events tracking activity entries, factor snapshot calculations, and edits.
        </p>

        <div className="max-h-52 overflow-y-auto border-2 border-black text-xs font-bold uppercase divide-y-2 divide-black">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 hover:bg-neutral-50 flex items-start justify-between gap-2">
              <div>
                <span className="font-black text-black font-mono text-[11px] mr-2">[{log.action}]</span>
                <span className="text-neutral-800">{log.details}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PublicVerificationModal
        isOpen={showPublicSealModal}
        initialCertId={period?.id ? `cert_val_${period.id}` : 'cert_val_acme_2024'}
        onClose={() => setShowPublicSealModal(false)}
      />
    </div>
  );
};

