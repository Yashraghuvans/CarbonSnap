import {
  Award,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { signAuditorVerification } from '../lib/api';
import {
  ActivityEntry,
  AuditLog,
  EmissionsSummary,
  Organisation,
  ReportingPeriod,
  VerificationCertificate
} from '../types';

interface AuditorPortalViewProps {
  activeOrg: Organisation | null;
  activePeriod: ReportingPeriod | null;
  activities: ActivityEntry[];
  summary: EmissionsSummary | null;
  auditLogs: AuditLog[];
  onCertificateIssued?: (cert: VerificationCertificate) => void;
}

export const AuditorPortalView: React.FC<AuditorPortalViewProps> = ({
  activeOrg,
  activePeriod,
  activities,
  summary,
  auditLogs,
  onCertificateIssued
}) => {
  const [auditorName, setAuditorName] = useState('Sarah Jenkins');
  const [auditorFirm, setAuditorFirm] = useState('GreenPath Advisory & Carbon Audit LLP');
  const [auditorCertNumber, setAuditorCertNumber] = useState('UK-ISO14064-AUD-9912');
  const [auditNotes, setAuditNotes] = useState(
    'Full Scope 1, Scope 2, and Scope 3 activity trail audited against GHG Protocol Corporate Standard and SECR guidelines. Data accuracy verified with underlying financial transactions.'
  );

  const [signing, setSigning] = useState(false);
  const [issuedCert, setIssuedCert] = useState<VerificationCertificate | null>(null);

  const handleSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) return;
    setSigning(true);
    try {
      const res = await signAuditorVerification(activePeriod.id, {
        auditorName,
        auditorFirm,
        auditorCertNumber,
        auditNotes
      });
      setIssuedCert(res.certificate);
      if (onCertificateIssued) onCertificateIssued(res.certificate);
    } catch (err: any) {
      alert(err.message || 'Error signing off auditor verification');
    } finally {
      setSigning(false);
    }
  };

  if (!activeOrg || !activePeriod || !summary) {
    return <div className="p-8 text-center text-black font-black uppercase">Loading Auditor Review Data...</div>;
  }

  // Calculate audit readiness metrics
  const totalEntries = activities.length;
  const verifiedFactorsCount = activities.filter((a) => a.factorValue > 0).length;
  const dataCompletenessScore = totalEntries > 0 ? Math.round((verifiedFactorsCount / totalEntries) * 100) : 100;

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto text-black">
      {/* Title Header */}
      <div className="bg-black text-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-400 text-black font-black text-xs uppercase px-2.5 py-0.5 border border-black tracking-widest flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Official Lead Auditor Review Portal</span>
          </span>
          <span className="text-xs font-mono text-neutral-300">
            GHG Protocol ISO 14064 Standard
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center space-x-3">
          <Award className="w-8 h-8 text-emerald-400" />
          <span>Carbon Audit & Assurance Sign-Off</span>
        </h1>

        <p className="text-sm font-bold text-neutral-300 max-w-2xl">
          Authorized environmental body partners can review <strong className="text-white">{activeOrg.name}</strong> ({activePeriod.name}) carbon logs, inspect transaction trails, and issue an official <strong className="text-emerald-400">Digital Verification Seal</strong>.
        </p>
      </div>

      {/* Audit Readiness Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">Total Audited Footprint</span>
          <div className="text-2xl font-black font-mono text-black">{summary.totalCo2eTonnes.toFixed(2)} t CO₂e</div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">100% Calculated</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">Data Completeness</span>
          <div className="text-2xl font-black font-mono text-emerald-700">{dataCompletenessScore}%</div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase block">{totalEntries} verified entries</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 1 & 2 Breakdown</span>
          <div className="text-lg font-black font-mono text-black">
            {(summary.scope1Tonnes + summary.scope2Tonnes).toFixed(2)} t CO₂e
          </div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase block">Direct Utilities</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-500 block">Audit Logs Trail</span>
          <div className="text-2xl font-black font-mono text-black">{auditLogs.length}</div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase block">Immutable Events</span>
        </div>
      </div>

      {/* Audit Sign-Off Form & Certificate Result */}
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-black text-amber-400 font-black text-[10px] uppercase px-2 py-0.5">
              Legal Assurance Statement
            </span>
            <h2 className="text-lg font-black uppercase tracking-tight text-black">
              Auditor Verification Credentials & Sign-Off
            </h2>
          </div>

          {activePeriod.is_verified && (
            <span className="bg-emerald-300 text-black font-black text-xs uppercase px-3 py-1 border border-black flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Report Currently Verified</span>
            </span>
          )}
        </div>

        {issuedCert ? (
          <div className="p-6 bg-emerald-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-start justify-between border-b-2 border-black pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-400 border-2 border-black flex items-center justify-center text-black font-black">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="bg-black text-emerald-400 font-black text-[10px] uppercase px-2 py-0.5 tracking-widest">
                    OFFICIAL ASSURANCE CERTIFICATE ISSUED
                  </span>
                  <h3 className="text-xl font-black uppercase text-black mt-1">
                    {issuedCert.orgName} — Verification Certificate
                  </h3>
                  <p className="text-xs font-bold text-neutral-700 uppercase">
                    Issued by {issuedCert.auditorName} ({issuedCert.auditorFirm})
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs font-black text-black block">{issuedCert.certId}</span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Status: {issuedCert.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold uppercase font-mono bg-white p-4 border-2 border-black">
              <div>
                <span className="text-neutral-500 block text-[10px]">Auditor Cert #</span>
                <span className="text-black font-black">{issuedCert.auditorCertNumber}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Verification Date</span>
                <span className="text-black font-black">{new Date(issuedCert.verifiedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Signature Hash</span>
                <span className="text-black font-black text-[10px] break-all">{issuedCert.digitalSignatureHash}</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-100 border border-black text-xs font-bold uppercase text-black">
              <span className="font-black block text-[10px] text-neutral-600">Auditor Notes:</span>
              "{issuedCert.auditNotes}"
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignOff} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold uppercase">
              <div>
                <label className="block text-black font-black mb-1">
                  Lead Auditor Name *
                </label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">
                  Auditing Firm / Consultancy *
                </label>
                <input
                  type="text"
                  required
                  value={auditorFirm}
                  onChange={(e) => setAuditorFirm(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">
                  ISO 14064 Auditor Accreditation # *
                </label>
                <input
                  type="text"
                  required
                  value={auditorCertNumber}
                  onChange={(e) => setAuditorCertNumber(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-mono font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div className="text-xs font-bold uppercase">
              <label className="block text-black font-black mb-1">
                Auditor Audit Notes & Verification Statement *
              </label>
              <textarea
                rows={3}
                required
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                className="w-full p-3 bg-neutral-50 border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={signing}
              className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-8 py-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{signing ? 'Generating Certificate...' : 'Digitally Sign & Issue Verification Seal'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Activity Trail Inspection Panel for Auditors */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black tracking-widest border-b-2 border-black pb-1">
          Audited Scope Activity Entries ({activities.length})
        </h2>

        <div className="divide-y-2 divide-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {activities.map((a) => (
            <div key={a.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold uppercase">
              <div>
                <span className="font-black text-black">{a.description}</span>
                <div className="text-[10px] font-mono text-neutral-500">
                  Date: {a.date} | Scope {a.sourceScope} | {a.quantity} {a.unit} @ {a.factorValue} ({a.factorName})
                </div>
              </div>

              <span className="font-mono font-black text-black bg-neutral-100 px-2 py-1 border border-black self-start sm:self-auto">
                {a.co2e_kg} kg CO₂e
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
