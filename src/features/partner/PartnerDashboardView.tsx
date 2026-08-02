/**
 * CarbonSnap — PartnerDashboardView.tsx
 * FSD: features layer — partner dashboard
 * White-label advisory workspace: client workspaces, branding and data requests.
 */
import React, { useEffect, useState } from 'react';
import {
  fetchPartnerBrand,
  fetchPartnerWorkspaces,
  sendPartnerDataRequest,
  updatePartnerBrand
} from '../../shared/api/client';
import { Language, translations } from '../../shared/i18n/translations';
import { PartnerBrand, UserRole } from '../../shared/model/types';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  Palette,
  Send,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

interface PartnerDashboardViewProps {
  userRole: UserRole;
  lang: Language;
  onSwitchWorkspace?: (orgId: string) => Promise<void>;
}

export const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({
  userRole,
  lang,
  onSwitchWorkspace
}) => {
  const t = translations[lang];
  const [partnerBrand, setPartnerBrand] = useState<PartnerBrand | null>(null);
  const [workspaces, setWorkspaces] = useState<
    Array<{
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
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Branding Form State
  const [partnerName, setPartnerName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f172a');
  const [contactEmail, setContactEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Phase 5 Supply Chain Data Request State
  const [reqClientEmail, setReqClientEmail] = useState('');
  const [reqClientName, setReqClientName] = useState('');
  const [reqSuccessMsg, setReqSuccessMsg] = useState('');
  const [requesting, setRequesting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [brand, list] = await Promise.all([
        fetchPartnerBrand(),
        fetchPartnerWorkspaces()
      ]);
      setPartnerBrand(brand);
      setWorkspaces(list);
      if (brand) {
        setPartnerName(brand.partnerName);
        setPrimaryColor(brand.primaryColor);
        setContactEmail(brand.contactEmail);
      }
    } catch (e) {
      console.error('Failed to load partner dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updatePartnerBrand({
        partnerName,
        primaryColor,
        contactEmail
      });
      setPartnerBrand(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update partner brand:', err);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqClientEmail.trim() || !partnerBrand) return;
    setRequesting(true);
    setReqSuccessMsg('');
    try {
      const res = await sendPartnerDataRequest(partnerBrand.id, reqClientEmail.trim(), reqClientName.trim());
      setReqSuccessMsg(`Automated Carbon Data Request sent to '${reqClientEmail}' with pre-filled advisory branding!`);
      setReqClientEmail('');
      setReqClientName('');
    } catch (err: any) {
      alert(err.message || 'Failed sending data request');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
            <Briefcase className="w-7 h-7 text-black" />
            <span>{t.partnerTitle}</span>
          </h1>
          <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
            // {t.partnerSubtitle}
          </p>
        </div>
        <div className="bg-black text-white px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Advisory Partner Portal</span>
        </div>
      </div>

      {/* Managed Client Workspaces Table */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>{t.managedClients} ({workspaces.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-black uppercase text-neutral-400">
            Loading client workspaces...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-black font-black uppercase text-black">
                  <th className="p-3">{t.clientName}</th>
                  <th className="p-3">Sector & Location</th>
                  <th className="p-3">Reporting Period</th>
                  <th className="p-3 font-right">{t.footprint}</th>
                  <th className="p-3">{t.intensityFte}</th>
                  <th className="p-3 text-right">Switch Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-black">
                {workspaces.map((ws) => (
                  <tr key={ws.orgId} className="hover:bg-neutral-50 font-medium">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-black text-black text-sm">{ws.orgName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">ID: {ws.orgId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-black">{ws.industrySector}</div>
                      <div className="text-[10px] text-neutral-500">{ws.country} &bull; {ws.employeeCount} FTEs</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-black">{ws.activePeriodName}</div>
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-black px-1.5 py-0.5">
                        {ws.periodStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-black text-sm">
                      {ws.totalFootprintTonnes.toFixed(2)} t
                    </td>
                    <td className="p-3 text-neutral-700 font-bold">
                      {ws.intensityPerEmployee_kg} kg / FTE
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSwitchWorkspace && onSwitchWorkspace(ws.orgId)}
                        className="bg-black text-white hover:bg-neutral-800 font-black text-[10px] uppercase px-3 py-1.5 border border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Phase 5: Supply Chain Request Logic (Request Carbon Data from Client SMEs) */}
      <div className="bg-amber-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-black text-amber-400 font-black text-[10px] uppercase px-2 py-0.5 border border-black tracking-widest">
                Automated Lead Gen
              </span>
              <h2 className="text-base font-black uppercase text-black flex items-center space-x-2">
                <Mail className="w-5 h-5 text-black" />
                <span>Request Carbon Data from Client SME</span>
              </h2>
            </div>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-1">
              // Send an automated Scope 3 invitation deep link to a client SME pre-filled with {partnerBrand?.partnerName || 'Advisory Firm'} branding.
            </p>
          </div>

          <span className="text-xs font-black uppercase font-mono bg-black text-white px-3 py-1 border border-black self-start sm:self-auto">
            White-Label Onboarding
          </span>
        </div>

        <form onSubmit={handleSendRequest} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase text-black mb-1">
              Client Contact Email *
            </label>
            <input
              type="email"
              required
              placeholder="sme.founder@supplier.co.uk"
              value={reqClientEmail}
              onChange={(e) => setReqClientEmail(e.target.value)}
              className="w-full p-2.5 bg-white border-2 border-black text-xs font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-black mb-1">
              Client Business Name
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Precision Engineering Ltd"
              value={reqClientName}
              onChange={(e) => setReqClientName(e.target.value)}
              className="w-full p-2.5 bg-white border-2 border-black text-xs font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={requesting}
              className="w-full bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-5 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{requesting ? 'Sending Request...' : 'Send Carbon Request +'}</span>
            </button>
          </div>
        </form>

        {reqSuccessMsg && (
          <div className="p-3 bg-emerald-300 border-2 border-black text-black font-black text-xs uppercase flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{reqSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* White-Label Partner Branding Settings */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4 max-w-2xl">
        <div className="border-b-2 border-black pb-3 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase text-black flex items-center space-x-2">
            <Palette className="w-5 h-5 text-black" />
            <span>{t.whiteLabelBranding}</span>
          </h2>
          {saveSuccess && (
            <span className="text-xs font-black uppercase text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
          <div>
            <label className="block font-black uppercase text-black mb-1">
              {t.partnerNameLabel}
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              required
              className="w-full p-2.5 border-2 border-black font-bold focus:outline-hidden"
              placeholder="e.g. GreenPath Advisory & Audit LLP"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase text-black mb-1">
                {t.brandColorLabel}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 border-2 border-black cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full p-2 border-2 border-black font-mono font-bold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-black uppercase text-black mb-1">
                Auditor Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full p-2.5 border-2 border-black font-bold focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-black uppercase text-black mb-1">
              Custom Domain Mapping (Phase 4 Deep White-Labeling)
            </label>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-black shrink-0" />
              <input
                type="text"
                placeholder="e.g. carbon.greenpath-advisory.co.uk"
                value={partnerBrand?.customDomains?.[0] || 'carbon.greenpath-advisory.co.uk'}
                onChange={(e) => {
                  if (partnerBrand) {
                    setPartnerBrand({
                      ...partnerBrand,
                      customDomains: [e.target.value]
                    });
                  }
                }}
                className="w-full p-2.5 border-2 border-black font-mono font-bold focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1">
              // Custom DNS CNAME record mapping. Routes client requests directly to white-labeled tenant context.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 font-black text-xs uppercase tracking-wider px-5 py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              {t.applyBrand}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
