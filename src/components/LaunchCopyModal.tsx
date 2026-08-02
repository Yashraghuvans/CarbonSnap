import {
  Code,
  Copy,
  ExternalLink,
  Github,
  MessageSquare,
  Rocket,
  Terminal,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface LaunchCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaunchCopyModal: React.FC<LaunchCopyModalProps> = ({ isOpen, onClose }) => {
  const [copiedHn, setCopiedHn] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [copiedDocker, setCopiedDocker] = useState(false);

  if (!isOpen) return null;

  const showHnCopy = `Show HN: CarbonSnap – Open-Source, Audit-Ready SME Carbon Accounting Engine

Hey HN! We're building CarbonSnap (https://github.com/Yashraghuvans/CarbonSnap) – an open-source, full-stack carbon accounting platform designed specifically for SMEs and their accounting advisors.

Why we built it:
Existing corporate carbon accounting platforms cost $15k-$50k/year and lock your GHG data behind proprietary walls. On the other hand, manual spreadsheets are error-prone and fail SECR, CSRD, and GHG Protocol audits.

CarbonSnap solves this with a 10-minute workflow:
- ⚡ Auto-calculates Scope 1, 2, and 3 emissions from energy bills and ERP transactions.
- 📜 Versioned DESNZ/DEFRA 2024 & US EPA factor datasets built-in.
- 🔐 Immutable SHA-256 audit trails with public verification seal URLs.
- 💼 Native Multi-tenant Partner CRM for accounting firms to offer white-label carbon services.
- ⚖️ AGPLv3 licensed. Self-host with a single command: docker-compose up -d.

We'd love your feedback on our calculation engine and community factor bounty registry!`;

  const dockerComposeYaml = `version: '3.8'

services:
  carbonsnap-app:
    image: ghcr.io/carbonsnap/carbonsnap-app:latest
    container_name: carbonsnap_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - LICENSE=AGPLv3
    volumes:
      - carbonsnap_data:/app/data

volumes:
  carbonsnap_data:
    driver: local`;

  const readmeMarkdown = `# CarbonSnap – Open-Source SME Carbon Accounting Engine

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Docker Pulls](https://img.shields.io/badge/docker-ready-emerald.svg)](https://ghcr.io/carbonsnap/carbonsnap-app)
[![Build Status](https://img.shields.io/badge/CI%2FCD-passing-success.svg)](#)

CarbonSnap is the open-source, audit-ready carbon accounting platform for SMEs, accounting practices, and climate consultants.

## 🚀 Quick Start (1 Command)

\`\`\`bash
docker-compose up -d
\`\`\`

Access the live workspace at \`http://localhost:3000\`.

## ✨ Key Features
- **Scope 1, 2, 3 Calculation Engine**: Built-in DESNZ/DEFRA 2024 and US EPA factor datasets.
- **Audit-Ready Certificates**: SHA-256 cryptographic signatures with public verification URLs (\`carbonsnap.vercel.app/verify/{id}\`).
- **Partner CRM**: Multi-client workspace management for accounting firms.
- **Community Factor Registry**: Global emission factor bounty program with DCO signature validation.

## 📄 License
Licensed under the **GNU Affero General Public License v3 (AGPLv3)**.`;

  const copyText = (text: string, setCopiedFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-4 border-black max-w-3xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black text-white hover:bg-neutral-800 border-2 border-black p-1.5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b-2 border-black pb-4">
          <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black">
            <Rocket className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
              Phase 9 Launch Orchestration // Market Entry Assets
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              Show HN, Product Hunt & Public Repo Assets
            </h2>
          </div>
        </div>

        {/* Show HN Copy */}
        <div className="bg-neutral-50 border-2 border-black p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between font-black uppercase text-black">
            <span>1. "Show HN" & Product Hunt Launch Copy:</span>
            <button
              onClick={() => copyText(showHnCopy, setCopiedHn)}
              className="bg-black hover:bg-neutral-800 text-white px-3 py-1 text-[10px] uppercase border border-black flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedHn ? 'Copied Launch Copy!' : 'Copy Copy'}</span>
            </button>
          </div>
          <pre className="bg-white border border-black p-3 text-[11px] text-neutral-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {showHnCopy}
          </pre>
        </div>

        {/* docker-compose.yml */}
        <div className="bg-neutral-50 border-2 border-black p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between font-black uppercase text-black">
            <span>2. Single-Command `docker-compose.yml` Guide:</span>
            <button
              onClick={() => copyText(dockerComposeYaml, setCopiedDocker)}
              className="bg-black hover:bg-neutral-800 text-white px-3 py-1 text-[10px] uppercase border border-black flex items-center space-x-1 cursor-pointer"
            >
              <Terminal className="w-3 h-3 text-amber-400" />
              <span>{copiedDocker ? 'Copied Compose Guide!' : 'Copy Compose YAML'}</span>
            </button>
          </div>
          <pre className="bg-black text-amber-400 border border-black p-3 text-[11px] overflow-x-auto">
            {dockerComposeYaml}
          </pre>
        </div>

        {/* Public README */}
        <div className="bg-neutral-50 border-2 border-black p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between font-black uppercase text-black">
            <span>3. Public README.md (AGPLv3 & Badges):</span>
            <button
              onClick={() => copyText(readmeMarkdown, setCopiedReadme)}
              className="bg-black hover:bg-neutral-800 text-white px-3 py-1 text-[10px] uppercase border border-black flex items-center space-x-1 cursor-pointer"
            >
              <Code className="w-3 h-3" />
              <span>{copiedReadme ? 'Copied README!' : 'Copy README.md'}</span>
            </button>
          </div>
          <pre className="bg-white border border-black p-3 text-[11px] text-neutral-800 whitespace-pre-wrap max-h-36 overflow-y-auto">
            {readmeMarkdown}
          </pre>
        </div>

        {/* Community Links */}
        <div className="bg-amber-100 border-2 border-black p-4 space-y-2">
          <span className="text-xs font-black uppercase text-black block">4. Integrated Community Moats:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <a
              href="https://github.com/Yashraghuvans/CarbonSnap/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-black p-3 font-bold hover:bg-amber-200 flex items-center justify-between text-black cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-black" />
                <span>GitHub Discussions</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://discord.gg/carbonsnap"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-black p-3 font-bold hover:bg-amber-200 flex items-center justify-between text-black cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-700" />
                <span>Discord Community Server</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-black text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-black hover:bg-neutral-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
