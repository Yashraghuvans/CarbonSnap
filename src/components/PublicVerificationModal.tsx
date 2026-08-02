import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  Globe,
  Lock,
  QrCode,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fetchPublicVerificationCertificate } from '../lib/api';
import { PublicVerificationCertificate } from '../types';

interface PublicVerificationModalProps {
  isOpen: boolean;
  initialCertId?: string;
  onClose: () => void;
}

export const PublicVerificationModal: React.FC<PublicVerificationModalProps> = ({
  isOpen,
  initialCertId = 'cert_val_acme_2024',
  onClose
}) => {
  const [certId, setCertId] = useState(initialCertId);
  const [certData, setCertData] = useState<PublicVerificationCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadCertificate = async (idToFetch: string) => {
    try {
      setLoading(true);
      const data = await fetchPublicVerificationCertificate(idToFetch);
      setCertData(data);
    } catch (err) {
      console.error('Failed loading public verification seal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCertificate(certId || initialCertId);
    }
  }, [isOpen, initialCertId]);

  if (!isOpen) return null;

  const publicUrl = `https://carbonsnap.vercel.app/verify/${certData?.certificateId || certId}`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-4 border-black max-w-2xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black text-white hover:bg-neutral-800 border-2 border-black p-1.5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b-2 border-black pb-4">
          <div className="w-12 h-12 bg-emerald-400 border-2 border-black flex items-center justify-center text-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Public Verification Seal Registry // carbonsnap.vercel.app/verify</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              Audit-Ready Assurance Certificate
            </h2>
          </div>
        </div>

        {/* Certificate Search Input */}
        <div className="flex items-center space-x-2 bg-neutral-100 border-2 border-black p-2 font-mono text-xs">
          <Search className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter Certificate ID or SHA-256 Hash..."
            className="w-full bg-transparent font-bold focus:outline-none uppercase"
          />
          <button
            onClick={() => loadCertificate(certId)}
            className="bg-black text-white font-black text-[10px] uppercase px-3 py-1.5 border border-black hover:bg-neutral-800 cursor-pointer"
          >
            Verify
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center font-mono text-xs uppercase font-bold text-neutral-600">
            Verifying cryptographic digital seal & factor dataset pedigree...
          </div>
        ) : certData ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="bg-emerald-100 border-2 border-black p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase text-emerald-950 block">
                    STATUS: {certData.verificationStatus === 'VALID_CERTIFIED' ? 'VALID & AUDIT CERTIFIED' : 'REVOKED'}
                  </span>
                  <p className="text-[10px] font-mono text-emerald-900 uppercase">
                    ISO 14064-3 Third-Party Assurance Verified
                  </p>
                </div>
              </div>
              <span className="bg-emerald-400 border border-black text-black font-mono font-black text-[10px] uppercase px-2 py-0.5">
                Official Seal
              </span>
            </div>

            {/* Certificate Details Card */}
            <div className="bg-neutral-50 border-2 border-black p-5 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-neutral-300 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Certified Entity:</span>
                  <span className="font-black text-sm text-black">{certData.organisationName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Reporting Period:</span>
                  <span className="font-bold text-black">{certData.reportingPeriodName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border border-black p-3 text-center">
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">Total Footprint</span>
                  <span className="text-base font-black text-black">{certData.totalTonnesCo2e} tCO2e</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">Scope 1</span>
                  <span className="text-sm font-bold text-neutral-800">{certData.scope1Tonnes} t</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">Scope 2</span>
                  <span className="text-sm font-bold text-neutral-800">{certData.scope2Tonnes} t</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">Scope 3</span>
                  <span className="text-sm font-bold text-neutral-800">{certData.scope3Tonnes} t</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Lead Auditor Verification:</span>
                  <p className="font-bold text-neutral-900">{certData.verifiedBy}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Compliant Regulatory Frameworks:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {certData.frameworksCompliant.map((fw, idx) => (
                      <span key={idx} className="bg-neutral-200 border border-black px-1.5 py-0.5 text-[9px] font-black uppercase">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Factor Dataset Versions Used:</span>
                  <ul className="list-disc list-inside text-[10px] text-neutral-700">
                    {certData.datasetVersionsUsed.map((ds, idx) => (
                      <li key={idx}>{ds}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Cryptographic Signature Hash */}
              <div className="bg-black text-white p-3 border border-black space-y-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400">
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Cryptographic SHA-256 Signature Hash:</span>
                  </span>
                  <span>IMMUTABLE LOG</span>
                </div>
                <p className="font-mono text-[10px] break-all text-neutral-300">
                  {certData.sha256Hash}
                </p>
              </div>
            </div>

            {/* Verification Link & Actions */}
            <div className="bg-amber-100 border-2 border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-xs font-mono">
                <span className="font-black uppercase text-black block">Public Verification Link:</span>
                <p className="text-[11px] text-neutral-800 break-all">{publicUrl}</p>
              </div>
              <button
                onClick={copyPublicUrl}
                className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-4 py-2 border-2 border-black flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied Link!' : 'Copy Verification Link'}</span>
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-black text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-black hover:bg-neutral-800 cursor-pointer"
          >
            Close Verification Registry
          </button>
        </div>
      </div>
    </div>
  );
};
