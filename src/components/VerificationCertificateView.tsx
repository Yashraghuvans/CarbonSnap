import {
  Award,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  Globe,
  Printer,
  ShieldCheck,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fetchVerificationCertificate } from '../lib/api';
import { VerificationCertificate } from '../types';

interface VerificationCertificateViewProps {
  certId: string;
  onClose?: () => void;
}

export const VerificationCertificateView: React.FC<VerificationCertificateViewProps> = ({
  certId,
  onClose
}) => {
  const [cert, setCert] = useState<VerificationCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchVerificationCertificate(certId)
      .then((data) => {
        setCert(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Verification Certificate not found');
        setLoading(false);
      });
  }, [certId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-black font-black uppercase bg-white border-2 border-black">
        Verifying Cryptographic Certificate Stamps...
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="p-8 text-center space-y-4 bg-red-50 border-2 border-black max-w-lg mx-auto my-8">
        <X className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="text-lg font-black uppercase text-red-900">Certificate Verification Failed</h2>
        <p className="text-xs font-bold text-red-700 uppercase">{error}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-black text-white font-black text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Close Viewer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-sans text-black">
      {/* Printable Certificate Card */}
      <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 text-black relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black cursor-pointer print:hidden"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        )}

        {/* Certificate Seal Banner */}
        <div className="border-b-4 border-black pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-emerald-400 font-black text-[10px] uppercase px-2 py-0.5 tracking-widest">
                VERIFIED CARBON CERTIFICATE
              </span>
              <span className="text-xs font-mono font-black text-neutral-600">
                GHG PROTOCOL ISO 14064
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              Official Carbon Verification Statement
            </h1>
            <p className="text-xs font-bold text-neutral-600 uppercase">
              // Issued under the UK Streamlined Energy and Carbon Reporting (SECR) Framework.
            </p>
          </div>

          <div className="w-16 h-16 bg-emerald-300 border-2 border-black flex items-center justify-center text-black shrink-0">
            <Award className="w-10 h-10" />
          </div>
        </div>

        {/* Organization & Period Header */}
        <div className="bg-emerald-50 border-2 border-black p-4 space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-900 block">Organization Name</span>
          <h2 className="text-2xl font-black uppercase text-black">{cert.orgName}</h2>
          <span className="text-xs font-bold uppercase text-neutral-700 block">
            Reporting Period: <strong className="text-black font-black">{cert.periodName}</strong>
          </span>
        </div>

        {/* Verified Emissions Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-black text-white border-2 border-black">
            <span className="text-[10px] font-black uppercase text-amber-400 block">Total Verified</span>
            <span className="text-xl font-black font-mono text-white">{cert.totalEmissionsTonnes.toFixed(2)} t</span>
          </div>

          <div className="p-3 bg-neutral-50 border-2 border-black">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 1 (Direct)</span>
            <span className="text-base font-black font-mono text-black">{cert.scope1Tonnes.toFixed(2)} t</span>
          </div>

          <div className="p-3 bg-neutral-50 border-2 border-black">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 2 (Power)</span>
            <span className="text-base font-black font-mono text-black">{cert.scope2Tonnes.toFixed(2)} t</span>
          </div>

          <div className="p-3 bg-neutral-50 border-2 border-black">
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 3 (Chain)</span>
            <span className="text-base font-black font-mono text-black">{cert.scope3Tonnes.toFixed(2)} t</span>
          </div>
        </div>

        {/* Auditor Verification Details */}
        <div className="border-2 border-black p-4 space-y-3 bg-white">
          <h3 className="text-xs font-black uppercase text-black border-b border-black pb-1">
            Independent Lead Carbon Auditor Sign-Off
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold uppercase">
            <div>
              <span className="text-neutral-500 text-[10px] block">Lead Auditor</span>
              <span className="text-black font-black">{cert.auditorName}</span>
            </div>

            <div>
              <span className="text-neutral-500 text-[10px] block">Auditing Firm / Practice</span>
              <span className="text-black font-black">{cert.auditorFirm}</span>
            </div>

            <div>
              <span className="text-neutral-500 text-[10px] block">Accreditation #</span>
              <span className="text-black font-mono font-black">{cert.auditorCertNumber}</span>
            </div>

            <div>
              <span className="text-neutral-500 text-[10px] block">Verification Date</span>
              <span className="text-black font-mono font-black">{new Date(cert.verifiedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-black text-xs font-bold uppercase text-neutral-800">
            <span className="text-[10px] font-black text-black block">Auditor Assurance Statement:</span>
            "{cert.auditNotes}"
          </div>
        </div>

        {/* Cryptographic Hash Stamp Footer */}
        <div className="border-t-2 border-black pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px]">
          <div>
            <span className="font-black text-black uppercase block">Digital Certificate ID</span>
            <span className="text-neutral-600 font-bold">{cert.certId}</span>
          </div>

          <div className="sm:text-right">
            <span className="font-black text-black uppercase block">Signature Cryptographic Hash</span>
            <span className="text-emerald-800 font-black">{cert.digitalSignatureHash}</span>
          </div>
        </div>

        {/* Print Button */}
        <div className="pt-2 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
