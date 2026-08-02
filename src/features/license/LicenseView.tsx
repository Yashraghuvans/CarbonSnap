/**
 * CarbonSnap — LicenseView.tsx
 * FSD: features layer — license view
 * AGPLv3 license summary presented in-app.
 */
import { CheckCircle2, Code2, ExternalLink, FileCode, ShieldCheck } from 'lucide-react';
import React from 'react';

export const LicenseView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-black border-2 border-black p-8 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center space-x-3 mb-3">
          <ShieldCheck className="w-6 h-6 text-white" />
          <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
            // Open Source Governance & Transparency
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          GNU Affero General Public License (AGPLv3)
        </h1>
        <p className="text-xs font-bold uppercase text-neutral-300 mt-3 leading-relaxed">
          CarbonSnap is built as a self-hostable, transparent, intelligent spreadsheet for SME carbon accounting.
          All calculation methodologies, conversion factor datasets, and source code are open and auditable under AGPLv3.
        </p>
      </div>

      {/* Core Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <Code2 className="w-6 h-6 text-black" />
          <h3 className="text-base font-black uppercase tracking-tight text-black">Pure Auditability</h3>
          <p className="text-xs font-bold uppercase text-neutral-600 leading-relaxed">
            Every CO₂e value is calculated via pure server-side deterministic mapping (<code className="bg-neutral-100 border border-black px-1 py-0.5 font-mono">quantity * factor</code>). No black box computations.
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <FileCode className="w-6 h-6 text-black" />
          <h3 className="text-base font-black uppercase tracking-tight text-black">Self-Hostable Monorepo</h3>
          <p className="text-xs font-bold uppercase text-neutral-600 leading-relaxed">
            Designed for lightweight SME deployment via Docker or local Node.js containers without lock-in or recurring cloud vendor costs.
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <CheckCircle2 className="w-6 h-6 text-black" />
          <h3 className="text-base font-black uppercase tracking-tight text-black">DESNZ & EPA Standards</h3>
          <p className="text-xs font-bold uppercase text-neutral-600 leading-relaxed">
            Pre-bundled with UK 2024 Government conversion factor datasets (DESNZ / Defra) and US EPA GHG Center standards.
          </p>
        </div>
      </div>

      {/* Full AGPLv3 License Summary */}
      <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-black border-b-2 border-black pb-3">
          AGPLv3 License Terms & SME Freedom
        </h3>

        <div className="text-xs font-bold uppercase text-black space-y-4 leading-relaxed">
          <p>
            <strong className="font-black text-black block mb-1">// 1. Freedom to Run & Self-Host:</strong> Anyone may run, inspect, modify, and host CarbonSnap for internal corporate reporting, ESG audits, or third-party carbon assessments.
          </p>
          <p>
            <strong className="font-black text-black block mb-1">// 2. Network Copyleft:</strong> If you modify CarbonSnap and offer it as a web service over a network, you must make the full source code of your modifications available to users under the AGPLv3 license.
          </p>
          <p>
            <strong className="font-black text-black block mb-1">// 3. Verification & Compliance:</strong> CarbonSnap provides complete audit log tracing to verify data integrity for Streamlined Energy and Carbon Reporting (SECR) and ISO 14064 standards.
          </p>
        </div>

        <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs font-black uppercase">
          <span className="text-neutral-500 font-mono">License: AGPL-3.0-only</span>
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:underline font-black inline-flex items-center space-x-1 border border-black px-3 py-1 bg-neutral-100"
          >
            <span>Read Official GNU AGPLv3 Text</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
