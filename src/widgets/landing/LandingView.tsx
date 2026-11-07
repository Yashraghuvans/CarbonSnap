/**
 * CarbonSnap — LandingView.tsx
 * FSD: widgets layer — landing hero & marketing sections
 * Hero, value pillars, how-it-works, estimator embed, compliance badges, pricing tiers, contact form.
 */
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
import { EstimatorView } from '../../features/estimator/EstimatorView';
import { submitContactForm } from '../../shared/api/client';

interface LandingViewProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
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
            Carbon accounting
          </span>
        </div>

        {/* Quick Anchor Links & Action Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => scrollToSection('pricing-section')}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center space-x-1"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
            <span>Talk to us</span>
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
              Scope 1, 2, and 3 activity records
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-none">
            Carbon accounting for growing businesses.
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-bold text-neutral-800 max-w-3xl leading-relaxed">
            Record fuel, electricity, travel, and purchased goods, then prepare greenhouse gas reports from those entries.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 sm:px-6 py-3.5 sm:py-4 bg-emerald-100 hover:bg-emerald-200 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-800" />
              <span>Create a workspace</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t-2 border-black">
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">Scope 1–3</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">Activity ledger</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">DEFRA</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">UK 2024 factors included</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">EPA</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">US 2024 factors included</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-black">IPCC</div>
              <div className="text-[10px] font-bold uppercase text-neutral-600">Global factors included</div>
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
                Prepare greenhouse gas report layouts from the activity ledger, including GHG Protocol, UK SECR, EU CSRD, and California SB 253 sections. A report is not an independent assurance opinion.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[10px] font-black uppercase text-neutral-600">
              <span>Feature: Report layouts</span>
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
                Factor libraries included
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                UK DESNZ/DEFRA, US EPA, and IPCC factors ship with the product so entries can be converted without a separate spreadsheet of coefficients.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[10px] font-black uppercase text-neutral-600">
              <span>Feature: Included factor packs</span>
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

      {/* 4. HOW IT WORKS — 3 STEPS */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
            From Zero to Auditor-Ready
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">
            How CarbonSnap Works in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <span className="absolute -top-4 left-4 bg-black text-amber-300 font-black text-xs uppercase px-2 py-0.5 border-2 border-black">
              Step 01
            </span>
            <div className="pt-4 space-y-3">
              <div className="w-12 h-12 bg-amber-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Building2 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase text-black">Create Your Workspace</h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                Sign up with email or Google. CarbonSnap auto-provisions your organisation profile and current financial-year reporting period.
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <span className="absolute -top-4 left-4 bg-black text-amber-300 font-black text-xs uppercase px-2 py-0.5 border-2 border-black">
              Step 02
            </span>
            <div className="pt-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FileSpreadsheet className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase text-black">Enter Operational Data</h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                Manually record fuel, electricity, travel and freight — or bulk-import from Xero, QuickBooks and spreadsheets. Factors match automatically.
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <span className="absolute -top-4 left-4 bg-black text-amber-300 font-black text-xs uppercase px-2 py-0.5 border-2 border-black">
              Step 03
            </span>
            <div className="pt-4 space-y-3">
              <div className="w-12 h-12 bg-sky-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <FileCheck2 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase text-black">Generate & Verify Reports</h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                Produce SHA-256-verified GHG disclosures for CSRD, SECR, SB 253 or GHG Protocol — shareable with your auditor instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Factor datasets strip */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Layers className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <span className="block text-xs font-black uppercase text-black">Built-In 2024 Factor Libraries</span>
              <span className="block text-[10px] font-bold uppercase text-neutral-600">
                UK DESNZ/DEFRA • US EPA GHG Hub • IPCC AR6 Global
              </span>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-amber-300 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Create a workspace</span>
          </button>
        </div>
      </section>

      {/* 5. COMPLIANCE & FRAMEWORKS BADGES SECTION */}
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

      <section id="pricing-section" className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">
          Use it as a workspace, not a download
        </h2>
        <p className="text-sm font-bold text-neutral-700 max-w-3xl">
          CarbonSnap is the place to keep an organisation&apos;s activity records and prepare greenhouse gas reports. A published price is not shown here because checkout is not configured.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="px-5 py-3 bg-black text-amber-300 font-black text-xs uppercase border-2 border-black"
          >
            Create a workspace
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('contact-section')}
            className="px-5 py-3 bg-white font-black text-xs uppercase border-2 border-black"
          >
            Contact the team
          </button>
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
            Reach out to our carbon accounting specialists for advisory guidance, enterprise white-labeling, or how the workspace fits your reporting period.
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
                <option value="Product question">Product question</option>
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
            Create a workspace and start a reporting period when you are ready to record activity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-center"
          >
            Create a workspace
          </button>
        </div>
      </section>

    </div>
  );
};
