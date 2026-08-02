/**
 * CarbonSnap — SupplierSharePortal.tsx
 * FSD: features layer — supplier share portal
 * Public, token-based portal where suppliers review buyer-shared footprint data.
 */
import {
  Award,
  Briefcase,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  Globe,
  Printer,
  ShieldCheck,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fetchSupplierShareData } from '../../shared/api/client';
import { EmissionsSummary, Organisation, PartnerBrand, ReportingPeriod, SupplierShareLink } from '../../shared/model/types';

interface SupplierSharePortalProps {
  token?: string;
  onBack?: () => void;
}

export const SupplierSharePortal: React.FC<SupplierSharePortalProps> = ({
  token = 'cs_share_walmart_procurement_2024',
  onBack
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [shareLink, setShareLink] = useState<SupplierShareLink | null>(null);
  const [org, setOrg] = useState<Organisation | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
  const [summary, setSummary] = useState<EmissionsSummary | null>(null);
  const [partnerBrand, setPartnerBrand] = useState<PartnerBrand | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchSupplierShareData(token)
      .then((data) => {
        setShareLink(data.shareLink);
        setOrg(data.organisation);
        setPeriod(data.reportingPeriod);
        setSummary(data.summary);
        setPartnerBrand(data.partnerBrand);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed loading supplier share portal data');
        setLoading(false);
      });
  }, [token]);

  const copyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border-2 border-black p-8 text-center space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Zap className="w-8 h-8 text-black animate-bounce mx-auto" />
          <h2 className="text-lg font-black uppercase text-black">Verifying Supplier Token...</h2>
          <p className="text-xs font-bold text-neutral-500 uppercase">// Accessing obfuscated Scope 3 compliance record</p>
        </div>
      </div>
    );
  }

  if (error || !summary || !org || !period) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-red-50 border-2 border-black p-8 text-center space-y-4 max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck className="w-10 h-10 text-red-700 mx-auto" />
          <h2 className="text-xl font-black uppercase text-red-900">Invalid or Expired Share Token</h2>
          <p className="text-xs font-bold text-red-800 uppercase">{error || 'Unable to verify supplier carbon data.'}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-black text-white font-black text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Return to Application
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans p-4 sm:p-8 space-y-6">
      {/* Top Banner Bar */}
      <div className="max-w-5xl mx-auto bg-black text-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-black font-black text-[10px] uppercase px-1.5 py-0.5 border border-black">
                Public Supplier Portal
              </span>
              <span className="text-xs font-mono text-neutral-300">
                Views: {shareLink?.accessCount}
              </span>
            </div>
            <h1 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">
              {shareLink?.shareName}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyShareUrl}
            className="bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase px-4 py-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer inline-flex items-center space-x-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'LINK COPIED!' : 'SHARE LINK'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-white hover:bg-neutral-200 text-black border-2 border-black font-black text-xs uppercase px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Public Document Container */}
      <div className="max-w-5xl mx-auto bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-8">
        
        {/* White-Label Partner Header Banner (If available) */}
        {partnerBrand && (
          <div
            className="p-4 border-2 border-black text-white flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: partnerBrand.primaryColor || '#0f172a' }}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-white" />
              <span className="font-black text-sm uppercase tracking-wider">{partnerBrand.partnerName}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 border border-white">
              Verified Advisory Partner
            </span>
          </div>
        )}

        {/* Supplier Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-6">
          <div className="space-y-1">
            <span className="text-2xl font-black uppercase tracking-tight text-black block">
              {org.name}
            </span>
            <p className="text-xs font-bold uppercase text-neutral-600">
              Sector: {org.industrySector} | Country: {org.country} | Employees: {org.employeeCount}
            </p>
            <p className="text-xs font-bold uppercase text-neutral-500 pt-1">
              // Official Scope 3 Supplier Carbon Summary statement provided to enterprise buyers.
            </p>
          </div>

          <div className="text-right bg-neutral-50 border-2 border-black p-4 space-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Reporting Cycle</span>
            <span className="text-base font-black uppercase text-black block">{period.name}</span>
            <span className="text-xs font-mono font-bold text-neutral-600 block">
              {period.startDate} to {period.endDate}
            </span>
          </div>
        </div>

        {/* AUDIT-READY VERIFIED SEAL BADGE */}
        {period.is_verified ? (
          <div className="bg-emerald-50 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-400 border-2 border-black flex items-center justify-center text-black shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-black text-emerald-400 font-black text-[10px] uppercase px-2 py-0.5 tracking-widest">
                    VERIFIED ASSURANCE
                  </span>
                  <span className="text-xs font-black text-emerald-900 uppercase">
                    GHG Protocol & SECR Compliant
                  </span>
                </div>
                <h3 className="text-base font-black uppercase text-black mt-0.5">
                  Auditor Verified Carbon Statement
                </h3>
                <p className="text-xs font-bold text-neutral-700 uppercase">
                  Verified by: <strong className="text-black font-black">{period.verifiedBy}</strong> on {period.verifiedAt ? new Date(period.verifiedAt).toLocaleDateString() : 'Active'}
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-black pl-4 hidden sm:block">
              <span className="text-[10px] font-black uppercase text-emerald-900 block">Verification Seal ID</span>
              <span className="text-xs font-mono font-black text-black">CS_VER_2024_{period.id.toUpperCase()}</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-black p-4 text-xs font-bold uppercase text-amber-900 flex items-center justify-between">
            <span>Note: This reporting period summary is in DRAFT state and pending formal external verification.</span>
            <span className="bg-amber-300 border border-black text-black font-black text-[10px] px-2 py-0.5">UNVERIFIED DRAFT</span>
          </div>
        )}

        {/* High Level Totals Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase text-amber-400 block tracking-wider">Gross Carbon Footprint</span>
            <div className="text-3xl font-black font-mono mt-2 text-white">
              {summary.total_tonnes.toFixed(2)} <span className="text-xs font-bold">t CO₂e</span>
            </div>
            <span className="text-[11px] font-bold text-neutral-400 block mt-1 uppercase">
              {summary.total_kg.toLocaleString()} kg CO₂e
            </span>
          </div>

          <div className="p-5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase text-neutral-500 block">Scope 1 Direct</span>
            <div className="text-2xl font-black font-mono mt-2">
              {(summary.scope1_kg / 1000).toFixed(2)} t
            </div>
            <span className="text-xs font-bold text-neutral-600 block mt-1 uppercase">{summary.scope1_percent}% of total</span>
          </div>

          <div className="p-5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase text-neutral-500 block">Scope 2 Electricity</span>
            <div className="text-2xl font-black font-mono mt-2">
              {(summary.scope2_kg / 1000).toFixed(2)} t
            </div>
            <span className="text-xs font-bold text-neutral-600 block mt-1 uppercase">{summary.scope2_percent}% of total</span>
          </div>

          <div className="p-5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase text-neutral-500 block">Scope 3 Value Chain</span>
            <div className="text-2xl font-black font-mono mt-2">
              {(summary.scope3_kg / 1000).toFixed(2)} t
            </div>
            <span className="text-xs font-bold text-neutral-600 block mt-1 uppercase">{summary.scope3_percent}% of total</span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-black uppercase tracking-widest border-b-2 border-black pb-1">
            Category Breakdown for Scope 3 Buyer Reporting
          </h3>

          <div className="border-2 border-black overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white font-black uppercase border-b-2 border-black">
                  <th className="p-3 border-r border-neutral-700">Category</th>
                  <th className="p-3 border-r border-neutral-700">GHG Scope</th>
                  <th className="p-3 border-r border-neutral-700 text-right">Emissions (t CO₂e)</th>
                  <th className="p-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-black font-bold uppercase text-black">
                {summary.byCategory.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="p-3 border-r border-black font-black text-black">{cat.category}</td>
                    <td className="p-3 border-r border-black font-black">
                      <span className="bg-neutral-200 border border-black px-2 py-0.5 text-[10px]">
                        Scope {cat.scope}
                      </span>
                    </td>
                    <td className="p-3 border-r border-black text-right font-black">
                      {cat.co2e_tonnes.toFixed(2)} t
                    </td>
                    <td className="p-3 text-right font-black">{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Verification Signature Block */}
        <div className="border-t-2 border-black pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase text-neutral-600">
          <div>
            <p className="font-black text-black">CarbonSnap Open Carbon Accounting Engine v1.4</p>
            <p>// Public Supplier Share Portal | Open Source AGPLv3 License</p>
          </div>

          <div className="text-right border-2 border-black p-3 bg-neutral-50 font-mono">
            <span className="text-[10px] text-neutral-500 block uppercase">Digital Verification Stamp</span>
            <span className="font-black text-black">CS-SHARE-VERIFIED-DATA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
