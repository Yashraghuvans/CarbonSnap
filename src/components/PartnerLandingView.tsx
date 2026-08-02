import {
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  Globe,
  Layers,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { createPartnerFirm } from '../lib/api';

interface PartnerLandingViewProps {
  onPartnerAdded?: () => void;
}

export const PartnerLandingView: React.FC<PartnerLandingViewProps> = ({ onPartnerAdded }) => {
  const [smeClientsCount, setSmeClientsCount] = useState<number>(50);
  const [feePerClient, setFeePerClient] = useState<number>(1500);

  const [firmName, setFirmName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [tier, setTier] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState('');

  const annualGrossRevenue = smeClientsCount * feePerClient;
  const platformCost = tier === 'ENTERPRISE' ? 4990 : tier === 'PROFESSIONAL' ? 2490 : 990;
  const netMarginGbp = annualGrossRevenue - platformCost;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmName.trim() || !contactEmail.trim()) return;
    try {
      setSubmitting(true);
      await createPartnerFirm({
        name: firmName,
        type: 'ACCOUNTING_FIRM',
        contactName: contactName || 'Lead Partner',
        contactEmail,
        clientWorkspacesCount: smeClientsCount,
        whiteLabelTier: tier,
        status: 'RECRUITED'
      });
      setSubmittedMsg(`Success! Partner account for ${firmName} onboarded. Our Partner Team will reach out within 24 hours.`);
      setFirmName('');
      setContactName('');
      setContactEmail('');
      onPartnerAdded?.();
    } catch (err: any) {
      alert(err.message || 'Failed to submit partner application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 font-sans">
      {/* Hero Header */}
      <div className="bg-black text-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-400 text-black border border-black px-3 py-1 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 9 Partner Force Multiplier Program</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none">
            White-Label Carbon Accounting for Accounting & Advisory Firms
          </h1>
          <p className="text-sm font-bold text-neutral-300 uppercase tracking-wide leading-relaxed">
            Turn mandatory SME ESG compliance into a high-margin £150k+ recurring advisory service line. Onboard hundreds of client workspaces in minutes under your firm's own brand.
          </p>
        </div>
      </div>

      {/* Interactive ROI Calculator */}
      <div className="bg-amber-50 border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-black" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                Partner Revenue & Advisory ROI Estimator
              </h2>
              <p className="text-xs font-bold text-neutral-600 uppercase">
                Calculate annual net recurring advisory margin for your accounting practice
              </p>
            </div>
          </div>
          <span className="bg-amber-400 border border-black text-black font-mono font-black text-xs uppercase px-3 py-1">
            Force Multiplier Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6 font-mono text-xs">
            <div className="space-y-2">
              <div className="flex justify-between items-center font-black uppercase text-black">
                <span>Number of SME Client Workspaces:</span>
                <span className="bg-black text-amber-400 px-2 py-0.5 text-sm">{smeClientsCount} Clients</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={smeClientsCount}
                onChange={(e) => setSmeClientsCount(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-neutral-300 border border-black"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center font-black uppercase text-black">
                <span>Annual ESG Advisory Fee Per Client:</span>
                <span className="bg-black text-amber-400 px-2 py-0.5 text-sm">£{feePerClient.toLocaleString()} / yr</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={feePerClient}
                onChange={(e) => setFeePerClient(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-neutral-300 border border-black"
              />
            </div>

            <div className="bg-white border-2 border-black p-4 space-y-2">
              <span className="font-black uppercase text-[10px] text-neutral-500">Selected Partner Tier:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTier('STARTER')}
                  className={`p-2 border border-black text-[10px] font-black uppercase text-center cursor-pointer ${
                    tier === 'STARTER' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                  }`}
                >
                  Starter (£990/yr)
                </button>
                <button
                  type="button"
                  onClick={() => setTier('PROFESSIONAL')}
                  className={`p-2 border border-black text-[10px] font-black uppercase text-center cursor-pointer ${
                    tier === 'PROFESSIONAL' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                  }`}
                >
                  Pro (£2,490/yr)
                </button>
                <button
                  type="button"
                  onClick={() => setTier('ENTERPRISE')}
                  className={`p-2 border border-black text-[10px] font-black uppercase text-center cursor-pointer ${
                    tier === 'ENTERPRISE' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                  }`}
                >
                  Enterprise (£4,990/yr)
                </button>
              </div>
            </div>
          </div>

          {/* ROI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1">
              <span className="text-[10px] font-black uppercase text-neutral-500">Gross Advisory Revenue</span>
              <div className="text-2xl font-black font-mono text-black">
                £{annualGrossRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-neutral-600 font-mono uppercase">
                {smeClientsCount} clients × £{feePerClient.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border-2 border-black p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1">
              <span className="text-[10px] font-black uppercase text-neutral-500">CarbonSnap Platform Fee</span>
              <div className="text-2xl font-black font-mono text-amber-700">
                -£{platformCost.toLocaleString()}
              </div>
              <p className="text-[10px] text-neutral-600 font-mono uppercase">
                Fixed annual white-label cost
              </p>
            </div>

            <div className="sm:col-span-2 bg-emerald-300 border-2 border-black p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-black">Net Partner Annual Profit Margin</span>
                <DollarSign className="w-5 h-5 text-black" />
              </div>
              <div className="text-3xl font-black font-mono text-black">
                £{netMarginGbp.toLocaleString()} / year
              </div>
              <p className="text-[11px] font-bold text-black uppercase">
                // {Math.round((netMarginGbp / (annualGrossRevenue || 1)) * 100)}% Gross Margin. Includes unlimited automated SECR, CSRD, GHG Protocol & California SB 253 reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="w-10 h-10 bg-black text-amber-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black uppercase text-black">Multi-Client Workspace Switcher</h3>
          <p className="text-xs font-mono text-neutral-600 leading-relaxed uppercase">
            Manage 100+ client organisations from a single unified partner dashboard with role-based access control for senior auditors and junior accountants.
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="w-10 h-10 bg-black text-amber-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black uppercase text-black">Custom Domain & White-Labeling</h3>
          <p className="text-xs font-mono text-neutral-600 leading-relaxed uppercase">
            Host client portals on your custom domain (e.g. carbon.yourfirm.com) with custom logos, brand color schemes, and automated client email invitations.
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="w-10 h-10 bg-black text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black uppercase text-black">Audit-Ready Assurance Seals</h3>
          <p className="text-xs font-mono text-neutral-600 leading-relaxed uppercase">
            Issue cryptographically verified PDF audit reports with SHA-256 signatures, DESNZ 2024 dataset pedigree, and instant online public verification seal links.
          </p>
        </div>
      </div>

      {/* Onboarding Application Form */}
      <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center space-x-3 border-b-2 border-black pb-4">
          <Briefcase className="w-6 h-6 text-black" />
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-black">
              Apply for CarbonSnap Partner Program
            </h3>
            <p className="text-xs font-mono text-neutral-600 uppercase">
              // Join the 100 accounting firms building modern carbon accounting practices.
            </p>
          </div>
        </div>

        {submittedMsg ? (
          <div className="bg-emerald-100 border-2 border-black p-4 text-emerald-950 font-mono font-bold text-xs space-y-2">
            <p>{submittedMsg}</p>
            <button
              onClick={() => setSubmittedMsg('')}
              className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase hover:bg-neutral-800"
            >
              Submit Another Partner Application
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="font-black uppercase text-[10px] text-neutral-700">Accounting / Consulting Firm Name *</label>
              <input
                type="text"
                required
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="e.g. BDO Carbon Advisory"
                className="w-full bg-neutral-50 border-2 border-black p-2.5 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black uppercase text-[10px] text-neutral-700">Lead Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. David Wright"
                className="w-full bg-neutral-50 border-2 border-black p-2.5 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black uppercase text-[10px] text-neutral-700">Work Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="david.wright@firm.com"
                className="w-full bg-neutral-50 border-2 border-black p-2.5 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black uppercase text-[10px] text-neutral-700">Estimated SME Client Workspaces</label>
              <select
                value={smeClientsCount}
                onChange={(e) => setSmeClientsCount(Number(e.target.value))}
                className="w-full bg-neutral-50 border-2 border-black p-2.5 font-bold focus:outline-none"
              >
                <option value={10}>10 - 25 Clients</option>
                <option value={50}>25 - 75 Clients</option>
                <option value={100}>75 - 150 Clients</option>
                <option value={200}>150+ Clients</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black hover:bg-neutral-800 text-amber-400 border-2 border-black font-black text-xs uppercase px-6 py-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Partner Application...' : 'Submit Partner Onboarding Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
