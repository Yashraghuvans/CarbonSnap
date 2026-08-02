import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Flame, BarChart3, AlertCircle, ShieldCheck, Award, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { fetchPeriodComparison } from '../lib/api';
import { Language, translations } from '../i18n/translations';

interface AnalyticsViewProps {
  orgId: string;
  lang: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orgId, lang }) => {
  const t = translations[lang];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparisonData();
  }, [orgId]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPeriodComparison(orgId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="text-xs font-black uppercase tracking-wider text-black">Loading Decarbonisation Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-100 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-black mx-auto" />
        <h3 className="text-sm font-black uppercase text-black">Failed to Load Analytics</h3>
        <p className="text-xs font-bold uppercase text-neutral-700">{error}</p>
      </div>
    );
  }

  const { periods, hotspot, yoyChangePercent } = data;

  // Format chart data for stacked bar chart
  const chartData = periods.map((p: any) => ({
    name: p.periodName,
    'Scope 1 (Direct)': p.scope1_tonnes,
    'Scope 2 (Power)': p.scope2_tonnes,
    'Scope 3 (Chain)': p.scope3_tonnes,
    Total: p.total_tonnes
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Title & Header */}
      <div className="bg-black border-2 border-black p-6 sm:p-8 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center space-x-3 mb-2">
          <BarChart3 className="w-6 h-6 text-white" />
          <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
            // Multi-Year Decarbonisation
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          {t.analyticsTitle}
        </h1>
        <p className="text-xs font-bold uppercase text-neutral-300 mt-2 leading-relaxed">
          {t.analyticsSubtitle} &bull; <span className="text-white underline">{data.orgName}</span>
        </p>
      </div>

      {/* Top Banner KPI Cards & Hotspot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hotspot Card (Highlighted by prompt) */}
        <div className="md:col-span-2 bg-amber-50 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-black shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600 block">
                  {t.hotspotTitle}
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-black">
                  {hotspot.category}
                </h3>
              </div>
            </div>
            <span className="bg-black text-white text-xs font-black uppercase px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {hotspot.percentage}% of Footprint
            </span>
          </div>

          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm sm:text-base font-black uppercase text-black leading-snug">
              "{hotspot.message}"
            </p>
            <p className="text-xs font-bold uppercase text-neutral-600 mt-2">
              Decarbonisation Recommendation: Target {hotspot.category} for high-impact emission reduction interventions in the next period.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-black uppercase pt-2">
            <span className="text-neutral-600">Total Contributor Impact:</span>
            <span className="font-mono text-black font-extrabold">{hotspot.co2e_tonnes} t CO₂e ({hotspot.co2e_kg.toLocaleString()} kg)</span>
          </div>
        </div>

        {/* YoY Reduction KPI Card */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-neutral-600 mb-2">
              <Award className="w-5 h-5 text-black" />
              <span className="text-xs font-black uppercase tracking-wider">
                {t.yoyTrendTitle.split(' ')[0]} Change vs Baseline
              </span>
            </div>
            <div className="mt-2">
              {yoyChangePercent !== null ? (
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl font-black font-mono tracking-tight ${yoyChangePercent <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {yoyChangePercent > 0 ? `+${yoyChangePercent}%` : `${yoyChangePercent}%`}
                  </span>
                  {yoyChangePercent <= 0 ? (
                    <TrendingDown className="w-6 h-6 text-emerald-700 shrink-0" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-red-700 shrink-0" />
                  )}
                </div>
              ) : (
                <span className="text-2xl font-black font-mono text-black">N/A</span>
              )}
            </div>
          </div>

          <div className="border-t-2 border-black pt-3">
            <p className="text-xs font-bold uppercase text-neutral-600 leading-relaxed">
              {yoyChangePercent !== null && yoyChangePercent <= 0
                ? t.yoyReduction + ' achieved against Net-Zero historical baseline year.'
                : t.yoyIncrease + ' detected. Review active period operational activity.'}
            </p>
          </div>
        </div>

      </div>

      {/* Stacked Bar Chart */}
      <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-black" />
            <h3 className="text-lg font-black uppercase tracking-tight text-black">
              {t.yoyTrendTitle}
            </h3>
          </div>
          <span className="text-xs font-bold uppercase font-mono bg-neutral-100 border border-black px-2.5 py-1">
            Units: Tonnes CO₂e (t)
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#000' }} />
              <YAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: '#000' }} label={{ value: 't CO₂e', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0px 0px #000', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000' }} />
              <Bar dataKey="Scope 1 (Direct)" stackId="a" fill="#171717" />
              <Bar dataKey="Scope 2 (Power)" stackId="a" fill="#525252" />
              <Bar dataKey="Scope 3 (Chain)" stackId="a" fill="#a3a3a3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Period Comparison Data Table */}
      <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight text-black border-b-2 border-black pb-3">
          Reporting Cycle Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100 text-black uppercase font-black">
                <th className="p-3">Period Name</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Scope 1 (t)</th>
                <th className="p-3 text-right">Scope 2 (t)</th>
                <th className="p-3 text-right">Scope 3 (t)</th>
                <th className="p-3 text-right">Total (t CO₂e)</th>
                <th className="p-3 text-right">Intensity / FTE (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-200 uppercase font-bold">
              {periods.map((p: any) => (
                <tr key={p.periodId} className="hover:bg-neutral-50">
                  <td className="p-3 text-black font-black flex items-center space-x-2">
                    <span>{p.periodName}</span>
                    {p.isBaseline && (
                      <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5">
                        Baseline Anchor
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${p.status === 'ACTIVE' ? 'bg-emerald-200 text-black' : 'bg-neutral-200 text-black'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-black">{p.scope1_tonnes.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono text-black">{p.scope2_tonnes.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono text-black">{p.scope3_tonnes.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono font-black text-black">{p.total_tonnes.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono text-black">{p.intensityPerEmployee_kg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
