/**
 * CarbonSnap — BillingPortalView.tsx
 * FSD: features layer — billing portal
 * SaaS tier cards, subscription state, add-ons and checkout actions.
 */
import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Building2,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  ExternalLink,
  Server,
  Cloud,
  Users
} from 'lucide-react';
import { Organisation, BillingSubscription, SubscriptionTier } from '../../shared/model/types';
import {
  fetchBillingSubscription,
  updateBillingTier,
  toggleAccountingAddon,
  createBillingCheckoutSession
} from '../../shared/api/client';

interface BillingPortalViewProps {
  org: Organisation | null;
}

export const BillingPortalView: React.FC<BillingPortalViewProps> = ({ org }) => {
  const [sub, setSub] = useState<BillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const orgId = org?.id || 'org_acme_001';

  const loadSub = async () => {
    setLoading(true);
    try {
      const data = await fetchBillingSubscription(orgId);
      setSub(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSub();
  }, [orgId]);

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await createBillingCheckoutSession(orgId, tier);
      const updated = await updateBillingTier(orgId, tier);
      setSub(updated);
      setMessage(`Successfully updated subscription plan to ${tier}. ${res.message}`);
    } catch (e: any) {
      setMessage(`Billing update failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAddon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const active = e.target.checked;
    setActionLoading(true);
    try {
      const updated = await toggleAccountingAddon(orgId, active);
      setSub(updated);
      setMessage(`Accounting Integration Add-On (+$99/mo) ${active ? 'activated' : 'disabled'}.`);
    } catch (e: any) {
      setMessage(`Addon toggle failed: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 font-sans">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        <span className="font-bold text-neutral-800 uppercase text-xs">Loading Subscription details...</span>
      </div>
    );
  }

  const eazicoreTiers: Array<{
    id: SubscriptionTier;
    name: string;
    priceDisplay: string;
    numericPrice: number;
    description: string;
    icon: React.ReactNode;
    features: string[];
    popular?: boolean;
    badgeText?: string;
  }> = [
    {
      id: 'COMMUNITY' as SubscriptionTier,
      name: 'Community (Self-Hosted)',
      priceDisplay: '$0',
      numericPrice: 0,
      description: 'Run it on your own server. Full open-source AGPLv3 transparency.',
      icon: <Server className="w-5 h-5 text-black" />,
      features: [
        'All calculations engine features',
        'Manual activity logging & ledger',
        'CSV bulk import validation',
        'Auditor-ready PDF report generation',
        'Run on your own server / Docker'
      ]
    },
    {
      id: 'PRO',
      name: 'CarbonSnap Cloud',
      priceDisplay: '$79',
      numericPrice: 79,
      description: 'Fully managed cloud instance for SMEs with zero devops overhead.',
      icon: <Cloud className="w-5 h-5 text-black" />,
      popular: true,
      badgeText: 'Recommended for SMEs',
      features: [
        'Automatic emission factor updates (DEFRA 2024)',
        'Daily automated encrypted backups',
        'Managed cloud uptime & SLA guarantee',
        'Priority email & auditor support',
        'SHA-256 digital verification seals'
      ]
    },
    {
      id: 'ENTERPRISE',
      name: 'White-Label Partner',
      priceDisplay: '$500',
      numericPrice: 500,
      description: 'Designed for accounting firms and ESG advisors managing client portfolios.',
      icon: <Users className="w-5 h-5 text-black" />,
      features: [
        'Multi-tenant management for advisory firms',
        'Custom domain & white-label partner branding',
        'Dedicated partner dashboard for client workspaces',
        'Unlimited client organization seats',
        'API & webhook programmatic ingestion'
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-amber-300 border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-black text-amber-300 text-xs font-black uppercase px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                CarbonSnap Billing
              </span>
              <span className="bg-white text-black text-xs px-2.5 py-1 border-2 border-black font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                Eazicore Monetization
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black uppercase">
              Subscription & Billing Portal
            </h1>
            <p className="text-black font-bold text-xs max-w-2xl">
              Choose the deployment tier that fits your SME setup: Self-hosted Community ($0), Managed Cloud ($79/mo), or White-Label Partner ($500/mo).
            </p>
          </div>

          {sub && (
            <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-1 min-w-[240px]">
              <div className="text-[10px] text-neutral-600 uppercase font-black">Current Workspace Plan</div>
              <div className="text-xl font-black text-black flex items-center justify-between">
                <span>{sub.tier === 'PRO' ? 'CARBONSNAP CLOUD' : sub.tier}</span>
                <span className="text-amber-700 font-black">${sub.monthlyPriceUsd}/mo</span>
              </div>
              <div className="text-[10px] text-neutral-800 pt-1 border-t-2 border-black flex justify-between font-bold">
                <span>Status:</span>
                <span className="bg-emerald-300 px-1.5 py-0.5 border border-black text-black font-black uppercase">{sub.status}</span>
              </div>
              <div className="text-[10px] text-neutral-800 flex justify-between font-bold">
                <span>Next Billing Date:</span>
                <span className="font-mono">{sub.nextBillingDate}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-100 border-2 border-black text-emerald-950 font-bold text-xs uppercase flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{message}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-black text-black underline hover:text-amber-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pricing Tiers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-black uppercase flex items-center space-x-2">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-300" />
            <span>Select Your Subscription Tier</span>
          </h2>
          <span className="text-xs font-bold uppercase text-neutral-600">3-Tier Scaling Path</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {eazicoreTiers.map((t) => {
            const isCurrent = sub?.tier === t.id || (t.id === ('COMMUNITY' as SubscriptionTier) && sub?.tier === ('STARTER' as SubscriptionTier));
            return (
              <div
                key={t.id}
                className={`bg-white border-4 border-black p-6 flex flex-col justify-between transition-all relative ${
                  t.popular
                    ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-amber-50/50'
                    : 'shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {t.popular && (
                  <div className="absolute -top-4 right-6 bg-amber-300 text-black text-[10px] font-black px-3 py-1 border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {t.badgeText}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {t.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-black">{t.name}</h3>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black text-black">{t.priceDisplay}</span>
                        <span className="text-neutral-600 text-xs font-bold uppercase">
                          {t.numericPrice === 0 ? '/ Forever' : '/ month'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-neutral-700 min-h-[36px]">{t.description}</p>

                  <ul className="space-y-2 pt-4 border-t-2 border-black text-xs font-bold text-black">
                    {t.features.map((f, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <div className="w-full py-3 px-4 bg-black text-amber-300 text-xs font-black border-2 border-black flex items-center justify-center space-x-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Active Workspace Plan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectTier(t.id)}
                      disabled={actionLoading}
                      className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase border-2 border-black transition-colors flex items-center justify-center space-x-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
                    >
                      <span>
                        {t.numericPrice === 0 ? 'SWITCH TO SELF-HOSTED' : t.numericPrice > (sub?.monthlyPriceUsd || 0) ? 'UPGRADE PLAN' : 'SELECT PLAN'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Accounting Add-On Section */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-black" />
              <h3 className="text-lg font-black uppercase text-black">Accounting Integration Add-On</h3>
              <span className="bg-amber-300 text-black text-xs font-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                +$99 / month
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-700 mt-1 max-w-2xl">
              Connect Xero or QuickBooks Online to automatically convert utility expenses and fuel transactions directly into Scope 1 & Scope 2 GHG activity entries.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(sub?.accountingAddonActive)}
              onChange={handleToggleAddon}
              disabled={actionLoading}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-neutral-200 border-2 border-black peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border after:border-black after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
            <span className="ml-3 text-xs font-black uppercase text-black">
              {sub?.accountingAddonActive ? 'ADD-ON ACTIVE' : 'ENABLE ADD-ON'}
            </span>
          </label>
        </div>

        {/* Invoice & Payment Receipts History */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-black" />
              <h3 className="text-base font-black uppercase text-black">Stripe Billing History & Receipts</h3>
            </div>
            <span className="text-[10px] text-black font-black uppercase font-mono">
              Stripe Customer ID: {sub?.stripeCustomerId || 'cus_AcmeCorp_9912'}
            </span>
          </div>

          <div className="border-2 border-black overflow-hidden">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-amber-300 text-black font-black uppercase border-b-2 border-black">
                <tr>
                  <th className="py-2.5 px-4">Invoice ID</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black bg-white">
                {sub?.invoices && sub.invoices.length > 0 ? (
                  sub.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-black">{inv.id}</td>
                      <td className="py-2.5 px-4 text-black">{inv.periodName}</td>
                      <td className="py-2.5 px-4 text-neutral-700">{inv.date}</td>
                      <td className="py-2.5 px-4 font-black text-black">${inv.amountUsd}.00 USD</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 bg-emerald-300 text-black border border-black text-[10px] font-black uppercase">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading Official Stripe Receipt for Invoice ${inv.id}`);
                          }}
                          className="inline-flex items-center space-x-1 text-black font-black hover:underline uppercase"
                        >
                          <span>PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-neutral-600 font-bold">
                      No invoices recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
