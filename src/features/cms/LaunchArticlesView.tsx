/**
 * CarbonSnap — LaunchArticlesView.tsx
 * FSD: features layer — launch & press hub
 * Articles and launch copy with navigation shortcuts to estimator and docs.
 */
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { LaunchArticle } from '../../shared/model/types';
import { LaunchCopyModal } from './LaunchCopyModal';

interface LaunchArticlesViewProps {
  onOpenEstimator?: () => void;
  onOpenDocs?: () => void;
}

export const LaunchArticlesView: React.FC<LaunchArticlesViewProps> = ({
  onOpenEstimator,
  onOpenDocs
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art_001');
  const [showLaunchCopyModal, setShowLaunchCopyModal] = useState(false);


  const articles: LaunchArticle[] = [
    {
      id: 'art_001',
      title: 'Why We Built an Open-Source Carbon Accounting Tool for SMEs',
      subtitle: 'Democratizing GHG Protocol accounting and breaking down the $20,000 enterprise software barrier.',
      category: 'Founder Vision',
      readTimeMinutes: 4,
      author: 'Founder & Engineering Team',
      publishedAt: '2026-07-26',
      summary: 'Expensive carbon accounting platforms charge SMEs tens of thousands per year for basic spreadsheet wrappers. We built CarbonSnap under AGPLv3 to give every small business an unassailable, audit-ready carbon standard for free.',
      content: [
        'When enterprise enterprise software vendors began charging small businesses $15,000+ per year just to calculate basic Scope 1 and Scope 2 emissions, we realized the carbon accounting market was broken.',
        'Small businesses generate over 50% of commercial greenhouse emissions globally, yet they are given terrible choices: pay exorbitant SaaS fees, hire expensive auditors, or struggle with broken spreadsheets.',
        'CarbonSnap was born to solve this. By releasing the calculation engine, financial ledger parsers, and international emission factor datasets under the GNU AGPLv3 open-source license, we ensure that no SME is locked out of sustainability compliance.',
        'Our open-source foundation creates an unassailable moat of trust: calculations are 100% transparent, auditable by independent environmental bodies, and self-hostable in under 5 minutes.'
      ],
      ctaText: 'Test the Online Estimator',
      ctaAction: 'estimator'
    },
    {
      id: 'art_002',
      title: 'The Carbon Compliance Deadlines Every SME Must Know in 2024-2026',
      subtitle: 'SECR, EU CSRD Scope 3 pressures, and US SB 253 corporate buyer requirements.',
      category: 'Regulatory Outlook',
      readTimeMinutes: 5,
      author: 'Regulatory Compliance Lead',
      publishedAt: '2026-07-20',
      summary: 'Even if your business is under 250 employees, your enterprise customers (Walmart, Amazon, NHS, Unilever) are legally mandated to audit their Scope 3 supply chain. Here are the deadlines you cannot afford to miss.',
      content: [
        'Regulatory carbon reporting is no longer just for FTSE 100 or Fortune 500 multinationals. Through Scope 3 procurement rules, enterprise compliance mandates trickle directly down to suppliers.',
        '1. UK SECR Framework: Requires unquoted companies exceeding 2 of 3 criteria (250+ employees, £36m turnover, £18m balance sheet) to disclose annual energy and GHG emissions in directors’ reports.',
        '2. EU CSRD (Corporate Sustainability Reporting Directive): Requires over 50,000 companies to report detailed value-chain carbon data starting FY2024/2025.',
        '3. Corporate Scope 3 RFP Deadlines: Major enterprise buyers now require carbon intensity data on vendor bids. Bidders without verified GHG reporting risk losing key tenders.'
      ],
      ctaText: 'Read Developer Docs',
      ctaAction: 'docs'
    },
    {
      id: 'art_003',
      title: 'How to Self-Host Your Carbon Accounting System in 5 Minutes',
      subtitle: 'Complete technical tutorial covering Docker Compose, Umbrel OS, and Unraid.',
      category: 'Technical Tutorial',
      readTimeMinutes: 3,
      author: 'DevOps & Community Lead',
      publishedAt: '2026-07-15',
      summary: 'Learn how to spin up a production-ready CarbonSnap instance on Docker, Hetzner, or local home server with zero telemetry tracking and total data sovereignty.',
      content: [
        'Self-hosting carbon accounting ensures your financial ledgers and utility invoices never leave your private server infrastructure.',
        'Step 1: Install Docker on your Linux VPS or homelab server.',
        'Step 2: Run "docker run -d -p 3000:3000 ghcr.io/carbonsnap/carbonsnap:latest".',
        'Step 3: Open http://localhost:3000 to access your private Scope 1, 2, and 3 accounting workspace.',
        'Optional: Add your GEMINI_API_KEY environment variable to enable instant AI fuel receipt OCR scanning.'
      ],
      ctaText: 'Deploy on Docker',
      ctaAction: 'docs'
    }
  ];

  const currentArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto text-black">
      {/* Title Banner */}
      <div className="bg-black text-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-400 text-black font-black text-xs uppercase px-2.5 py-0.5 border border-black tracking-widest flex items-center space-x-1">
            <Rocket className="w-3.5 h-3.5 text-black" />
            <span>Market Launch & Content Hub</span>
          </span>
          <span className="text-xs font-mono text-neutral-300">
            Phase 6 Authority Building
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center space-x-3">
          <Flame className="w-8 h-8 text-amber-400" />
          <span>Launch Stories & Regulatory Insights</span>
        </h1>

        <p className="text-sm font-bold text-neutral-300 max-w-2xl">
          Foundational vision articles, regulatory SME survival guides, and technical tutorials for self-hosting carbon compliance.
        </p>

        {/* Lead-Gen Estimator CTA Banner */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Top-of-Funnel Lead Generator Active</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLaunchCopyModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase px-4 py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
            >
              <Rocket className="w-4 h-4 text-black" />
              <span>Show HN / Product Hunt Launch Copy</span>
            </button>

            <button
              onClick={onOpenEstimator}
              className="bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase px-5 py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-black fill-black" />
              <span>Launch Free Carbon Estimator</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Grid: Article Navigation & Article Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article Titles Selection List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-black uppercase text-black tracking-widest border-b-2 border-black pb-1">
            Foundational Articles ({articles.length})
          </h2>

          <div className="space-y-3">
            {articles.map((art) => {
              const active = art.id === selectedArticleId;
              return (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`w-full text-left p-4 border-2 border-black cursor-pointer transition-all ${
                    active
                      ? 'bg-amber-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1">
                    <span className="bg-black text-white px-2 py-0.5">{art.category}</span>
                    <span className="text-neutral-600 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{art.readTimeMinutes} min</span>
                    </span>
                  </div>

                  <h3 className="font-black text-xs uppercase leading-tight text-black mt-2">
                    {art.title}
                  </h3>

                  <p className="text-[10px] font-bold text-neutral-600 uppercase mt-1 line-clamp-2">
                    {art.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Article Display */}
        <div className="lg:col-span-8 bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-2 border-black pb-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase font-mono text-neutral-500">
              <span className="bg-black text-amber-400 font-black px-2 py-0.5 text-[10px]">
                {currentArticle.category}
              </span>
              <span>Published {currentArticle.publishedAt}</span>
              <span>•</span>
              <span>By {currentArticle.author}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              {currentArticle.title}
            </h1>

            <p className="text-sm font-bold text-neutral-700 uppercase">
              {currentArticle.subtitle}
            </p>
          </div>

          <div className="space-y-4 text-xs font-bold text-neutral-800 uppercase leading-relaxed font-sans">
            {currentArticle.content.map((p, idx) => (
              <p key={idx} className="p-3 bg-neutral-50 border-l-4 border-black">
                {p}
              </p>
            ))}
          </div>

          {/* Action CTA at bottom of article */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black">Ready to get compliance-ready?</span>

            {currentArticle.ctaAction === 'estimator' ? (
              <button
                onClick={onOpenEstimator}
                className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
              >
                <span>{currentArticle.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            ) : (
              <button
                onClick={onOpenDocs}
                className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
              >
                <span>{currentArticle.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <LaunchCopyModal
        isOpen={showLaunchCopyModal}
        onClose={() => setShowLaunchCopyModal(false)}
      />
    </div>
  );
};

