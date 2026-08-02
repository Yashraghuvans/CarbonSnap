import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  FileCheck2,
  Server,
  ArrowRight,
  Github,
  CheckCircle2,
  Sparkles,
  Calculator,
  Download,
  Building2,
  Layers,
  Award,
  Lock,
  Globe,
  Mail,
  User as UserIcon,
  MessageSquare,
  Send,
  AlertCircle,
  HelpCircle,
  Check,
  PhoneCall,
  CreditCard,
  Cloud,
  Users
} from 'lucide-react';
import { EstimatorView } from './EstimatorView';
import { submitContactForm } from '../lib/api';

interface LandingViewProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
  const [showSelfHostModal, setShowSelfHostModal] = useState(false);

  // Contact Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [inquiryType, setInquiryType] = useState('Enterprise Onboarding');
  const [message, setMessage] = useState('');

  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    setContactSuccess(null);

    if (!fullName.trim()) {
      setContactError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setContactError('Please enter a valid work email address.');
      return;
    }
    if (!message.trim()) {
      setContactError('Please enter your message or inquiry.');
      return;
    }

    setContactLoading(true);
    try {
      const res = await submitContactForm({
        fullName,
        email,
        organisationName,
        inquiryType,
        message
      });
      setContactSuccess(res.message || 'Thank you! Your inquiry has been sent to our carbon advisory team.');
      setFullName('');
      setEmail('');
      setOrganisationName('');
      setMessage('');
    } catch (err: any) {
      setContactError(err.message || 'Failed to submit contact form.');
    } finally {
      setContactLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Banner Navigation Bar - Fully Responsive */}
      <header className="bg-amber-300 border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-2">
            <span className="bg-black text-amber-300 font-black text-xs uppercase px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              CarbonSnap
            </span>
          </div>
          <span className="text-[10px] font-black uppercase bg-white px-2 py-0.5 border border-black text-black">
            AGPLv3 Open Source
          </span>
        </div>

        {/* Quick Anchor Links & Action Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => scrollToSection('pricing-section')}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center space-x-1"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
            <span>Pricing & Tiers</span>
          </button>

          <button
            onClick={() => scrollToSection('contact-section')}
            className="px-3 py-1.5 bg-amber-100 hover:bg-white text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center space-x-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Advisory</span>
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black font-black text-xs uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Sign In
          </button>

          <button
            onClick={() => onOpenAuth('register')}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-amber-300 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Create Workspace
          </button>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="bg-white border-4 border-black p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="max-w-4xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-black uppercase text-emerald-950">
              Auditor-Ready • AGPLv3 Open Source Engine
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-none">
            Free, Open-Source Carbon Accounting for SMEs.
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-bold text-neutral-800 max-w-3xl leading-relaxed">
            Be compliance-ready in minutes. Generate auditor-ready GHG reports without the $50k enterprise price tag.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowSelfHostModal(true)}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-neutral-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <span>Self-Host Now</span>
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 sm:px-6 py-3.5 sm:py-4 bg-emerald-100 hover:bg-emerald-200 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-800" />
              <span>Start Free Carbon Accounting</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t-2 border-black">
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">100%</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">Open Source AGPLv3</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">£0</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">Forever Free Self-Host</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">DEFRA 2024</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">Built-in Conversion Factors</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">CSRD Ready</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">EU & UK SECR Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION GRID */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
            Built for Modern B2B SMEs
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">
            3 Pillars of CarbonSnap Carbon Accounting
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FileSpreadsheet className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase text-black">
                Intelligent Guided Spreadsheet
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                Replace messy Excel workbooks with a standardized digital ledger. Automated factor lookup mapping Scope 1, 2, and 3 activities directly to DEFRA, EPA, and IPCC datasets.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[10px] font-black uppercase text-neutral-600">
              <span>Feature: CSV Bulk Import</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FileCheck2 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase text-black">
                One-Click GHG Reports
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                Generate formal, auditor-ready GHG disclosures in PDF format. Compliant with EU CSRD, UK SECR, GHG Protocol Corporate Standard, and California SB 253.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[10px] font-black uppercase text-neutral-600">
              <span>Feature: SHA-256 Hash Proof</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-sky-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Server className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase text-black">
                Zero-Cost Tech Stack
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                Open source under AGPLv3 license. Run it on your own infrastructure with single-command Docker deployment, or use our fully managed CarbonSnap Cloud service.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[10px] font-black uppercase text-neutral-600">
              <span>Feature: Full Data Sovereignty</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. ESTIMATOR TOOL EMBEDDED PLACEHOLDER */}
      <section className="bg-amber-50 border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-300 border border-black px-2.5 py-0.5 text-xs font-black uppercase text-black mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Footprint Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">
              Get an Indicative Footprint in 2 Minutes
            </h2>
            <p className="text-xs font-bold text-neutral-700">
              Enter basic SME operational parameters to generate an instant baseline estimate before full onboarding.
            </p>
          </div>
        </div>

        {/* Embedded Estimator Instance */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <EstimatorView />
        </div>
      </section>

      {/* 4. COMPLIANCE & FRAMEWORKS BADGES SECTION */}
      <section className="bg-black text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase text-amber-300 tracking-widest">
            Regulatory & Audit Compatibility
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">
            Built strictly for Global Compliance Standards
          </h2>
          <p className="text-xs font-bold text-neutral-400">
            CarbonSnap supports major international reporting frameworks with verified calculation methodologies.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-neutral-900 border-2 border-neutral-700 p-4 rounded text-center space-y-2">
            <Award className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-black uppercase text-white">EU CSRD</h4>
            <p className="text-[10px] text-neutral-400 font-bold">ESRS E1 Climate Change Disclosures</p>
          </div>

          <div className="bg-neutral-900 border-2 border-neutral-700 p-4 rounded text-center space-y-2">
            <Building2 className="w-6 h-6 text-amber-300 mx-auto" />
            <h4 className="text-sm font-black uppercase text-white">UK SECR</h4>
            <p className="text-[10px] text-neutral-400 font-bold">Streamlined Energy & Carbon Reporting</p>
          </div>

          <div className="bg-neutral-900 border-2 border-neutral-700 p-4 rounded text-center space-y-2">
            <Globe className="w-6 h-6 text-sky-400 mx-auto" />
            <h4 className="text-sm font-black uppercase text-white">GHG Protocol</h4>
            <p className="text-[10px] text-neutral-400 font-bold">Scope 1, 2, and 3 Corporate Standard</p>
          </div>

          <div className="bg-neutral-900 border-2 border-neutral-700 p-4 rounded text-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400 mx-auto" />
            <h4 className="text-sm font-black uppercase text-white">California SB 253</h4>
            <p className="text-[10px] text-neutral-400 font-bold">Climate Corporate Data Accountability Act</p>
          </div>
        </div>
      </section>

      {/* 5. PRICING & SAAS SUBSCRIPTION TIERS SECTION */}
      <section id="pricing-section" className="space-y-6">
        <div className="bg-amber-300 border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-black text-amber-300 px-2.5 py-0.5 text-xs font-black uppercase mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transparent SaaS & Self-Host Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-black">
              Pick the Perfect Tier for Your Growth
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-800 max-w-2xl">
              From free self-hosted AGPLv3 community engines to fully managed CarbonSnap Cloud and white-label advisory portals.
            </p>
          </div>
          <span className="text-xs font-black uppercase bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black self-start md:self-center">
            No Hidden Setup Fees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Community Self-Hosted */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Server className="w-6 h-6 text-black" />
                </div>
                <span className="text-[10px] font-black uppercase bg-neutral-200 border border-black px-2 py-0.5 text-black">
                  100% Free AGPLv3
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-black">Community (Self-Hosted)</h3>
                <p className="text-xs font-bold text-neutral-600 mt-1">
                  Run on your own server. Full open-source transparency and complete data control.
                </p>
              </div>

              <div className="flex items-baseline space-x-1 border-b-2 border-black pb-4">
                <span className="text-4xl font-black text-black">$0</span>
                <span className="text-xs font-bold text-neutral-600 uppercase">/ forever free</span>
              </div>

              <ul className="space-y-2.5 text-xs font-bold text-neutral-800">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full carbon calculations engine</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>DEFRA 2024 & EPA factor libraries</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Manual ledger & CSV bulk import</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Auditor-ready PDF report generation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Single-command Docker container deploy</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowSelfHostModal(true)}
              className="w-full py-3 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4 text-black" />
              <span>Get Self-Host Docker</span>
            </button>
          </div>

          {/* Tier 2: CarbonSnap Cloud (Popular) */}
          <div className="bg-amber-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-4 bg-black text-amber-300 border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Recommended for SMEs
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Cloud className="w-6 h-6 text-black" />
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-300 border border-black px-2 py-0.5 text-black">
                  Managed Cloud
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-black">CarbonSnap Cloud</h3>
                <p className="text-xs font-bold text-neutral-700 mt-1">
                  Fully managed cloud instance for growing SMEs with zero devops overhead.
                </p>
              </div>

              <div className="flex items-baseline space-x-1 border-b-2 border-black pb-4">
                <span className="text-4xl font-black text-black">$79</span>
                <span className="text-xs font-bold text-neutral-700 uppercase">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs font-bold text-neutral-900">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Automatic emission factor updates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Daily automated encrypted cloud backups</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Managed cloud uptime & SLA guarantee</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>SHA-256 auditor verification seals</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Priority email & advisory support</span>
                </li>
              </ul>
            </div>

            
          </div>

          {/* Tier 3: White-Label Partner */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-sky-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <span className="text-[10px] font-black uppercase bg-sky-300 border border-black px-2 py-0.5 text-black">
                  Advisory Partner
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-black">White-Label Partner</h3>
                <p className="text-xs font-bold text-neutral-600 mt-1">
                  Designed for accounting firms and ESG advisors managing client portfolios.
                </p>
              </div>

              <div className="flex items-baseline space-x-1 border-b-2 border-black pb-4">
                <span className="text-4xl font-black text-black">$500</span>
                <span className="text-xs font-bold text-neutral-600 uppercase">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs font-bold text-neutral-800">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Multi-tenant client portfolio portal</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Custom domain & white-label branding</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated partner dashboard</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unlimited client organisation seats</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>API & webhook programmatic ingestion</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setInquiryType('Partnership / White-Label');
                scrollToSection('contact-section');
              }}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-amber-300 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4 text-amber-300" />
              <span>Contact Partner Advisory</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. CONTACT FORM SECTION */}
      <section id="contact-section" className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-amber-300 border border-black px-2.5 py-0.5 text-xs font-black uppercase text-black">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Sustainability Advisory</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-black">
            Have Questions or Need Customized Onboarding?
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-700">
            Reach out to our carbon accounting specialists for advisory guidance, enterprise white-labeling, or self-hosted technical support.
          </p>
        </div>

        {contactSuccess && (
          <div className="p-4 bg-emerald-100 border-2 border-black text-emerald-950 font-bold text-xs uppercase flex items-center space-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Check className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{contactSuccess}</span>
          </div>
        )}

        {contactError && (
          <div className="p-4 bg-red-100 border-2 border-black text-red-950 font-bold text-xs uppercase flex items-center space-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
            <span>{contactError}</span>
          </div>
        )}

        <form onSubmit={handleContactSubmit} className="space-y-4 bg-neutral-50 p-4 sm:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">
                Corporate Work Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">
                Organisation / Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Global Logistics Ltd"
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">
                Inquiry Category
              </label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="Enterprise Onboarding">Enterprise Cloud Onboarding</option>
                <option value="Carbon Audit Advisory">Carbon Audit & GHG Reporting</option>
                <option value="Custom Factor Pack Request">Custom Emission Factor Request</option>
                <option value="Technical Support / Self-Host">Technical Support / Self-Hosting</option>
                <option value="Partnership / White-Label">Partnership / Advisory Firm White-Label</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-black mb-1">
              Message or Specific Requirements <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your carbon reporting timelines, headcount, or specific compliance standards required..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={contactLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-black" />
            <span>{contactLoading ? 'Sending Inquiry...' : 'Submit Contact Inquiry'}</span>
          </button>
        </form>
      </section>

      {/* 6. CTA BOTTOM BANNER */}
      <section className="bg-amber-300 border-4 border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-black leading-tight">
            Ready to streamline your SME carbon accounting?
          </h3>
          <p className="text-xs font-bold text-black">
            Join hundreds of SMEs using CarbonSnap to generate verified carbon disclosures in minutes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          
          <button
            onClick={() => scrollToSection('pricing-section')}
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center"
          >
            View Pricing Tiers
          </button>
        </div>
      </section>

      {/* SELF-HOST INSTRUCTIONS MODAL */}
      {showSelfHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center space-x-2">
                <Github className="w-5 h-5 text-black" />
                <h3 className="text-lg font-black uppercase text-black">Self-Host CarbonSnap (AGPLv3)</h3>
              </div>
              <button
                onClick={() => setShowSelfHostModal(false)}
                className="px-2 py-1 bg-amber-300 font-black text-xs border border-black cursor-pointer"
              >
                X
              </button>
            </div>

            <p className="text-xs font-bold text-neutral-700 leading-relaxed">
              CarbonSnap is 100% open-source software under the AGPLv3 license. You can spin up an instance on your own cloud server or local machine in seconds.
            </p>

            <div className="space-y-2 bg-neutral-900 text-amber-300 p-4 border-2 border-black font-mono text-xs">
              <div className="text-neutral-500"># 1. Clone the open-source repository</div>
              <div>git clone https://github.com/Yashraghuvans/CarbonSnap.git</div>
              <div className="pt-2 text-neutral-500"># 2. Run via Docker Compose</div>
              <div>cd carbonsnap && docker-compose up -d</div>
              <div className="pt-2 text-neutral-500"># 3. Access locally on port 3000</div>
              <div className="text-emerald-400">http://localhost:3000</div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={() => setShowSelfHostModal(false)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
