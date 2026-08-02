/**
 * CarbonSnap — LegalModal.tsx
 * FSD: widgets layer — legal modal
 * AGPLv3 / privacy / terms overlay presented from the landing page.
 */
import React from 'react';
import { ShieldCheck, X, FileText, Lock, Cookie, Scale } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'cookie' | 'trademark';

interface LegalModalProps {
  isOpen: boolean;
  docType: LegalDocType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, docType, onClose }) => {
  if (!isOpen || !docType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {docType === 'privacy' && <Lock className="w-6 h-6 text-black" />}
              {docType === 'terms' && <Scale className="w-6 h-6 text-black" />}
              {docType === 'cookie' && <Cookie className="w-6 h-6 text-black" />}
              {docType === 'trademark' && <FileText className="w-6 h-6 text-black" />}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase bg-black text-amber-300 px-2 py-0.5 inline-block mb-1">
                CarbonSnap Legal & Compliance Disclosure
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight">
                {docType === 'privacy' && 'Privacy Policy (GDPR & Data Protection)'}
                {docType === 'terms' && 'Terms of Service (AGPLv3 & Liability Limits)'}
                {docType === 'cookie' && 'Cookie & Local Storage Policy'}
                {docType === 'trademark' && 'Trademark & Brand Usage Guidelines'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-amber-300 hover:bg-amber-400 border-2 border-black text-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs font-bold text-neutral-800 leading-relaxed pr-2">
          {docType === 'privacy' && (
            <div className="space-y-4">
              <p className="bg-emerald-50 border-2 border-emerald-600 p-3 text-emerald-900 font-bold">
                <strong>GDPR & UK DPA 2018 Compliance Statement:</strong> CarbonSnap (CarbonSnap) is committed to protecting your corporate and personal data. We collect data solely to process your organisation’s greenhouse gas emission accounting.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">1. Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Registration Data:</strong> Full name, professional email address, organisation name, primary jurisdiction, and hashed passwords.</li>
                <li><strong>Operational Emission Data:</strong> Fuel consumption, energy bills, flight miles, logistics records, and vendor invoices entered into your ledger.</li>
                <li><strong>Technical Telemetry:</strong> Anonymised server health metrics (opt-out available for self-hosted instances).</li>
              </ul>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">2. How We Store & Secure Data</h3>
              <p>
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Cloud instances undergo automated daily encrypted snapshots stored in EU data centers (AWS EU-West Frankfurt). Self-hosted instances keep all data strictly within your local environment.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">3. Your Data Rights</h3>
              <p>
                Under GDPR / UK GDPR, you have the right to request full JSON data exports of your organisation’s activity ledger at any time via the settings tab, or to request complete deletion ("Right to be Forgotten") by contacting our Data Protection Officer at <span className="font-mono underline">privacy.app</span>.
              </p>
            </div>
          )}

          {docType === 'terms' && (
            <div className="space-y-4">
              <p className="bg-amber-50 border-2 border-black p-3 text-amber-900 font-bold">
                <strong>Open Source License Notice:</strong> CarbonSnap is licensed under the <strong>GNU Affero General Public License v3.0 (AGPLv3)</strong>.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">1. Disclaimer of Warranty</h3>
              <p className="uppercase text-[11px] font-black text-neutral-900">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">2. Indicative Report & Audit Disclaimer</h3>
              <p className="bg-red-50 border-2 border-red-600 p-3 text-red-950">
                <strong>CRITICAL COMPLIANCE NOTICE:</strong> Calculations performed by CarbonSnap are indicative estimations derived from user-provided inputs and official emission factor libraries (UK DEFRA, US EPA, IPCC). Reports generated are "Auditor-Ready" disclosures but do <strong>NOT</strong> constitute a legally certified or independent assurance audit unless formally reviewed and signed off by an accredited third-party GHG auditor.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">3. Limitation of Liability</h3>
              <p>
                In no event shall CarbonSnap authors, contributors, or copyright holders be liable for any claim, damages, regulatory fines, or tax adjustments arising from inaccurate user data entry or reliance on generated disclosures.
              </p>
            </div>
          )}

          {docType === 'cookie' && (
            <div className="space-y-4">
              <p className="bg-sky-50 border-2 border-black p-3 text-sky-900 font-bold">
                CarbonSnap uses minimal, privacy-first cookies and browser local storage to maintain session state.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">1. Strictly Necessary Cookies</h3>
              <p>
                These cookies are required for authentication tokens, active organisation tenant selection, and session persistence. They cannot be turned off.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">2. Local Storage Usage</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="bg-neutral-100 p-0.5 font-mono">carbonsnap_session_user</code>: Stores user session state.</li>
                <li><code className="bg-neutral-100 p-0.5 font-mono">carbonsnap_cookie_consent</code>: Stores your cookie preferences.</li>
                <li><code className="bg-neutral-100 p-0.5 font-mono">carbonsnap_lang</code>: Saves preferred language selection.</li>
              </ul>
            </div>
          )}

          {docType === 'trademark' && (
            <div className="space-y-4">
              <p className="bg-neutral-100 border-2 border-black p-3 text-black font-bold">
                CarbonSnap™ and CarbonSnap™ are trademarks of CarbonSnap Open Source ESG Software Initiative.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">1. Brand Usage</h3>
              <p>
                While the source code is free and open-source under AGPLv3, the CarbonSnap name, logo, and CarbonSnap branding are subject to trademark protection. You may not use the brand names to imply official endorsement of third-party commercial services without prior written permission.
              </p>

              <h3 className="text-sm font-black uppercase text-black border-b-2 border-black pb-1">2. White-Label Portals</h3>
              <p>
                Commercial advisory partners on our Partner tier are granted explicit license to white-label the user interface and PDF export headers for client delivery.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-black flex justify-end shrink-0 mt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-amber-300 font-black text-xs uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
