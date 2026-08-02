import {
  BookOpen,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Download,
  FileCode,
  Globe,
  Layers,
  PackageCheck,
  Server,
  ShieldCheck,
  Terminal,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';

export const DocumentationView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'self-hosting' | 'user-manual' | 'contributor' | 'marketplaces' | 'api-sdk'
  >('self-hosting');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeCode = `version: '3.8'

services:
  carbonsnap:
    image: ghcr.io/carbonsnap/carbonsnap:latest
    container_name: carbonsnap_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - APP_URL=https://carbon.yourdomain.com
      - GEMINI_API_KEY=your_gemini_key_here
      - TELEMETRY_ENABLED=true
    restart: unless-stopped
    volumes:
      - carbonsnap_data:/app/data

volumes:
  carbonsnap_data:
    driver: local`;

  const umbrelAppYml = `manifestVersion: 1
id: carbonsnap-carbon
name: CarbonSnap Carbon Accounting
tagline: Open-source carbon accounting for SMEs
category: Business & Productivity
version: 1.0.0
port: 3000
description: |
  CarbonSnap delivers GHG Protocol aligned Scope 1, 2, & 3 carbon accounting for SMEs.
  Calculate footprints, connect QuickBooks/Xero, and export SECR-ready PDF reports.
developer: CarbonSnap Foundation
website: https://github.com/Yashraghuvans/CarbonSnap
support: https://github.com/Yashraghuvans/CarbonSnap/issues
gallery:
  - https://raw.githubusercontent.com/carbonsnap/carbonsnap/main/assets/preview.png`;

  const unraidXmlTemplate = `<?xml version="1.0"?>
<Container version="2">
  <Name>CarbonSnap-Carbon</Name>
  <Repository>ghcr.io/carbonsnap/carbonsnap:latest</Repository>
  <Registry>https://ghcr.io</Registry>
  <Network>bridge</Network>
  <Privileged>false</Privileged>
  <Support>https://github.com/Yashraghuvans/CarbonSnap/issues</Support>
  <Overview>Open-source Scope 1, 2, and 3 carbon accounting software for SMEs under AGPLv3.</Overview>
  <Category>Tools: Productivity:</Category>
  <WebUI>http://[IP]:[PORT:3000]</WebUI>
  <Config Name="Web Port" Target="3000" Default="3000" Mode="tcp" Description="Web UI Access Port" Type="Port" Hidden="false" Required="true"/>
  <Config Name="Gemini API Key" Target="GEMINI_API_KEY" Default="" Description="Gemini API Key for Receipt AI Parsing" Type="Variable" Hidden="true" Required="false"/>
</Container>`;

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto text-black">
      {/* Title Header */}
      <div className="bg-black text-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-400 text-black font-black text-xs uppercase px-2.5 py-0.5 border border-black tracking-widest">
            PHASE 6 DOCUMENTATION HUB
          </span>
          <span className="text-xs font-mono text-neutral-300">
            AGPLv3 Open Source Developer Portal
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-amber-400" />
          <span>Documentation & Developer Hub</span>
        </h1>

        <p className="text-sm font-bold text-neutral-300 max-w-2xl">
          Complete self-hosting guides, contributor factor pack specifications, one-click marketplace deployment manifests, and interactive REST API SDK specs.
        </p>

        {/* Sub-tab Navigation Buttons */}
        <div className="pt-4 flex flex-wrap gap-2 border-t border-neutral-800">
          {[
            { id: 'self-hosting', label: '1. Self-Hosting Guide', icon: Server },
            { id: 'user-manual', label: '2. User Manual', icon: BookOpen },
            { id: 'contributor', label: '3. Factor Pack Spec', icon: Code2 },
            { id: 'marketplaces', label: '4. App Store Templates', icon: PackageCheck },
            { id: 'api-sdk', label: '5. OpenAPI & SDK', icon: Terminal }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-black uppercase border-2 border-black cursor-pointer transition-all ${
                  active
                    ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: SELF-HOSTING GUIDE */}
      {activeSubTab === 'self-hosting' && (
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg font-black uppercase text-black flex items-center space-x-2">
              <Server className="w-5 h-5 text-black" />
              <span>Self-Hosting Guide (Docker & VPS Deployment)</span>
            </h2>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
              Deploy CarbonSnap on any Linux VPS, Hetzner, AWS EC2, or local home server in 5 minutes.
            </p>
          </div>

          <div className="space-y-4 text-xs font-bold uppercase">
            <h3 className="font-black text-black text-sm border-b border-black pb-1">
              Quickstart Terminal Command
            </h3>

            <div className="bg-neutral-900 text-amber-300 p-4 font-mono text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <code>docker run -d -p 3000:3000 --name carbonsnap ghcr.io/carbonsnap/carbonsnap:latest</code>
              <button
                onClick={() => handleCopyCode('docker run -d -p 3000:3000 --name carbonsnap ghcr.io/carbonsnap/carbonsnap:latest', 'run_cmd')}
                className="bg-amber-400 hover:bg-amber-300 text-black font-black px-2.5 py-1 text-[10px] uppercase border border-black cursor-pointer"
              >
                {copiedKey === 'run_cmd' ? 'COPIED' : 'COPY'}
              </button>
            </div>

            <h3 className="font-black text-black text-sm border-b border-black pb-1 pt-2">
              Required Environment Variables Reference
            </h3>

            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black text-white font-black">
                  <tr>
                    <th className="p-2 border-b border-black">Variable</th>
                    <th className="p-2 border-b border-black">Default</th>
                    <th className="p-2 border-b border-black">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono">
                  <tr>
                    <td className="p-2 font-black text-black">PORT</td>
                    <td className="p-2 text-neutral-600">3000</td>
                    <td className="p-2 text-neutral-800">Inbound HTTP server port</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-black text-black">GEMINI_API_KEY</td>
                    <td className="p-2 text-neutral-600">(Optional)</td>
                    <td className="p-2 text-neutral-800">API Key for AI receipt OCR parsing & automated factor suggestions</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-black text-black">APP_URL</td>
                    <td className="p-2 text-neutral-600">http://localhost:3000</td>
                    <td className="p-2 text-neutral-800">Canonical domain name for supplier portal share links</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-black text-black">TELEMETRY_ENABLED</td>
                    <td className="p-2 text-neutral-600">true</td>
                    <td className="p-2 text-neutral-800">Anonymous operational metrics for system health monitoring</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USER MANUAL */}
      {activeSubTab === 'user-manual' && (
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg font-black uppercase text-black flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-black" />
              <span>User Manual & SECR Compliance Workflow</span>
            </h2>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
              Step-by-step instructions for managing Scope 1, 2, & 3 emissions data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase">
            <div className="p-4 bg-amber-50 border-2 border-black space-y-2">
              <span className="bg-black text-amber-400 font-black text-[10px] px-2 py-0.5">
                Module 1
              </span>
              <h3 className="font-black text-sm uppercase text-black">Activity Entry & Receipt AI Parsing</h3>
              <p className="text-neutral-700">
                Log building natural gas, fleet fuel, electricity grid, and travel entries manually or drag-and-drop fuel receipt images for instant Gemini AI OCR extraction.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border-2 border-black space-y-2">
              <span className="bg-black text-emerald-400 font-black text-[10px] px-2 py-0.5">
                Module 2
              </span>
              <h3 className="font-black text-sm uppercase text-black">Financial ERP Auto-Sync (QuickBooks & Xero)</h3>
              <p className="text-neutral-700">
                Connect QuickBooks or Xero to pull utility ledgers automatically. CarbonSnap categorizes vendor lines into Scope 1 & 2 fuel factors with high confidence.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border-2 border-black space-y-2">
              <span className="bg-black text-white font-black text-[10px] px-2 py-0.5">
                Module 3
              </span>
              <h3 className="font-black text-sm uppercase text-black">Scope 3 Supplier Portal Link Sharing</h3>
              <p className="text-neutral-700">
                Generate secure read-only URLs in the Reports view to allow corporate buyers (e.g. Walmart, Amazon) to inspect carbon proof without requiring logins.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-black space-y-2">
              <span className="bg-black text-blue-300 font-black text-[10px] px-2 py-0.5">
                Module 4
              </span>
              <h3 className="font-black text-sm uppercase text-black">Auditor Pre-Verification & PDF Seals</h3>
              <p className="text-neutral-700">
                Environmental body partners log in via the Auditor Review Portal, sign off on reporting periods, and attach verified digital assurance certificates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FACTOR PACK SPECIFICATION */}
      {activeSubTab === 'contributor' && (
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg font-black uppercase text-black flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-black" />
              <span>Factor Pack JSON Schema Specification (schema.json)</span>
            </h2>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
              Contribute new national emission datasets (e.g., Japan 2025, Brazil MCTI) conforming to the specification below.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs text-black">
            <div className="p-4 bg-neutral-900 text-amber-300 border-2 border-black overflow-x-auto">
              <pre>{`{
  "datasetKey": "JP_MOE_2024",
  "datasetName": "Japan Ministry of the Environment Grid Factors 2024",
  "country": "Japan",
  "countryCode": "JP",
  "year": 2024,
  "factors": [
    {
      "id": "jp_elec_tepco_2024",
      "category": "Electricity",
      "name": "TEPCO Tokyo Electric Power Grid 2024",
      "scope": 2,
      "unit": "kWh",
      "factorValue": 0.44100,
      "datasetSource": "MOE Japan 2024"
    }
  ]
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: APP STORE TEMPLATES */}
      {activeSubTab === 'marketplaces' && (
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg font-black uppercase text-black flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-black" />
              <span>Self-Hosted Marketplace Deployment Manifests</span>
            </h2>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
              One-click configuration templates for Umbrel, Unraid, Cloudron, and Docker Compose.
            </p>
          </div>

          <div className="space-y-6">
            {/* Umbrel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs uppercase">1. Umbrel OS App Store Manifest (umbrel-app.yml)</span>
                <button
                  onClick={() => handleCopyCode(umbrelAppYml, 'umbrel')}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-2.5 py-1 text-[10px] uppercase border border-black cursor-pointer"
                >
                  {copiedKey === 'umbrel' ? 'COPIED' : 'COPY MANIFEST'}
                </button>
              </div>
              <textarea
                rows={6}
                readOnly
                value={umbrelAppYml}
                className="w-full p-3 font-mono text-xs bg-neutral-900 text-amber-300 border-2 border-black"
              />
            </div>

            {/* Unraid XML */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-black text-xs uppercase">2. Unraid Community Apps Template (carbonsnap.xml)</span>
                <button
                  onClick={() => handleCopyCode(unraidXmlTemplate, 'unraid')}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-2.5 py-1 text-[10px] uppercase border border-black cursor-pointer"
                >
                  {copiedKey === 'unraid' ? 'COPIED' : 'COPY TEMPLATE'}
                </button>
              </div>
              <textarea
                rows={6}
                readOnly
                value={unraidXmlTemplate}
                className="w-full p-3 font-mono text-xs bg-neutral-900 text-amber-300 border-2 border-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: API & SDK */}
      {activeSubTab === 'api-sdk' && (
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg font-black uppercase text-black flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-black" />
              <span>Interactive REST API & Enterprise SDK</span>
            </h2>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
              Embed CarbonSnap emissions calculation engine directly into your enterprise platforms.
            </p>
          </div>

          <div className="space-y-4 text-xs font-bold uppercase font-mono">
            <div className="p-4 bg-neutral-50 border-2 border-black space-y-2 text-black">
              <span className="bg-black text-white px-2 py-0.5 font-black text-[10px]">POST /api/v1/public/estimate</span>
              <p className="text-neutral-700 font-sans">
                Calculates instant indicative Scope 1, 2, & 3 emissions based on raw kWh and fuel inputs.
              </p>
              <div className="bg-neutral-900 text-amber-300 p-3 text-[11px]">
                curl -X POST http://localhost:3000/api/v1/public/estimate -H "Content-Type: application/json" -d '&#123;"electricityKwh": 12000, "gasKwh": 25000&#125;'
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-2 border-black space-y-2 text-black">
              <span className="bg-black text-white px-2 py-0.5 font-black text-[10px]">GET /api/v1/verify/:certId</span>
              <p className="text-neutral-700 font-sans">
                Retrieves verified GHG Protocol auditor assurance certificate details for external compliance checks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
