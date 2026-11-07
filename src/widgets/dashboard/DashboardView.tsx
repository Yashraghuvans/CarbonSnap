/**
 * CarbonSnap — DashboardView.tsx
 * FSD: widgets layer — dashboard overview
 * Footprint summary cards, scope breakdown, trend chart and navigation shortcuts.
 */
import { ArrowUpRight, BarChart3, Building, Factory, Fuel, Globe, Users, Zap } from 'lucide-react';
import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { CheckCircle2, AlertCircle, Award, Briefcase, CalendarCheck, CheckSquare, Layers, ShieldCheck, UserCheck } from 'lucide-react';
import { EmissionsSummary, Organisation, PersonaType, ReportingPeriod } from '../../shared/model/types';

interface DashboardViewProps {
  summary: EmissionsSummary | null;
  org: Organisation | null;
  period: ReportingPeriod | null;
  activePersona?: PersonaType;
  onNavigateToActivities: () => void;
  onNavigateToReports: () => void;
}

const SCOPE_COLORS = {
  scope1: '#f59e0b', // Amber/Orange for Direct Fuel
  scope2: '#10b981', // Emerald for Power
  scope3: '#0284c7'  // Sky Blue for Supply Chain
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  org,
  period,
  activePersona = 'DEFAULT_ADMIN',
  onNavigateToActivities,
  onNavigateToReports
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center p-12 text-black font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-widest">Calculating Carbon Footprint Snapshot...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Scope 1 (Direct Fuel)', value: summary.scope1_kg, color: '#000000' },
    { name: 'Scope 2 (Electricity)', value: summary.scope2_kg, color: '#525252' },
    { name: 'Scope 3 (Value Chain)', value: summary.scope3_kg, color: '#a3a3a3' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner / Hero Summary */}
      <div className="bg-white border-2 border-black p-8 text-black relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-2 border-black pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-black uppercase tracking-widest mb-2">
              <span className="w-2 h-2 bg-black inline-block" />
              <span>ACTIVE PERIOD: {period?.name || 'Q3 2024'}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-black leading-none">
              {org?.name || 'SME Organisation'}
            </h1>
            <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider max-w-2xl mt-3">
              // Real-time carbon inventory mapped to official UK Government & GHG Protocol corporate standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-add-activity-btn"
              onClick={onNavigateToActivities}
              className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <span>+ Log Activity Entry</span>
            </button>

            <button
              id="dash-export-report-btn"
              onClick={onNavigateToReports}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black text-xs font-black uppercase tracking-widest px-6 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <span>View Audit PDF Report</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {/* PERSONA-SPECIFIC OPERATIONAL DASHBOARDS */}
        {activePersona === 'SAM_SME_OPS' && (
          <div className="bg-amber-50 border-2 border-black p-5 mt-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-black" />
                <h3 className="text-sm font-black uppercase tracking-tight text-black">
                  Sam's SME Operations Portal // Quarterly Data Collection Checklist
                </h3>
              </div>
              <span className="bg-amber-400 border border-black font-mono font-black text-[10px] uppercase px-2 py-0.5">
                Role: SME Ops Manager
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold font-mono">
              <div className="bg-white border border-black p-3 space-y-1">
                <div className="flex justify-between items-center text-emerald-800">
                  <span>Q3 Electricity Bills</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[10px] text-neutral-500 uppercase">12,450 kWh logged via CSV upload</p>
              </div>

              <div className="bg-white border border-black p-3 space-y-1">
                <div className="flex justify-between items-center text-amber-900">
                  <span>Q3 Fleet Diesel Fuel</span>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[10px] text-neutral-500 uppercase">Missing Sep receipts (Pending 3 vans)</p>
              </div>

              <div className="bg-white border border-black p-3 space-y-1">
                <div className="flex justify-between items-center text-emerald-800">
                  <span>Supplier Scope 3 Portal</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[10px] text-neutral-500 uppercase">5 key suppliers submitted questionnaires</p>
              </div>
            </div>
          </div>
        )}

        {activePersona === 'PRIYA_ACCOUNTANT' && (
          <div className="bg-indigo-50 border-2 border-black p-5 mt-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-900" />
                <h3 className="text-sm font-black uppercase tracking-tight text-indigo-950">
                  Priya's Accounting Portfolio View // Multi-Client Workspace Carbon Intensities
                </h3>
              </div>
              <span className="bg-indigo-300 border border-black font-mono font-black text-[10px] uppercase px-2 py-0.5 text-black">
                Role: Enterprise Accountant
              </span>
            </div>

            <div className="overflow-x-auto bg-white border border-black text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-100 border-b border-black font-black uppercase text-[10px]">
                    <th className="p-2 border-r border-black">Client Workspace</th>
                    <th className="p-2 border-r border-black">Revenue</th>
                    <th className="p-2 border-r border-black">Total Emissions</th>
                    <th className="p-2 border-r border-black">Carbon Intensity</th>
                    <th className="p-2">SECR / CSRD Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-bold">
                  <tr>
                    <td className="p-2 border-r border-black font-black">{org?.name || 'Acme Corp'}</td>
                    <td className="p-2 border-r border-black">£{(org?.annualRevenueGbp || 5000000).toLocaleString()}</td>
                    <td className="p-2 border-r border-black">{summary.total_tonnes.toFixed(2)} tCO2e</td>
                    <td className="p-2 border-r border-black text-emerald-800">
                      {((summary.total_tonnes / (org?.annualRevenueGbp || 5000000)) * 1000000).toFixed(2)} t / £1M
                    </td>
                    <td className="p-2"><span className="bg-emerald-200 border border-black px-1.5 py-0.5 text-[10px]">AUDIT READY</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-black font-black">BioTech Global Ltd</td>
                    <td className="p-2 border-r border-black">£12,400,000</td>
                    <td className="p-2 border-r border-black">142.50 tCO2e</td>
                    <td className="p-2 border-r border-black text-emerald-800">11.49 t / £1M</td>
                    <td className="p-2"><span className="bg-amber-200 border border-black px-1.5 py-0.5 text-[10px]">DATA PENDING</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePersona === 'EMMA_CONSULTANT' && (
          <div className="bg-emerald-50 border-2 border-black p-5 mt-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-950" />
                <h3 className="text-sm font-black uppercase tracking-tight text-emerald-950">
                  Emma's Lead Audit Workspace // Verification & Review Queue
                </h3>
              </div>
              <span className="bg-emerald-400 border border-black font-mono font-black text-[10px] uppercase px-2 py-0.5 text-black">
                Role: Lead Climate Auditor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold font-mono">
              <div className="bg-white border border-black p-3 space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Pending Verification</span>
                <span className="text-xl font-black text-black">12 Entries</span>
                <p className="text-[10px] text-amber-800">Requires audit note sign-off</p>
              </div>

              <div className="bg-white border border-black p-3 space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Audit Certificates</span>
                <span className="text-xl font-black text-black">{period?.is_verified ? '1 Active Certificate' : '0 Certificates'}</span>
                <p className="text-[10px] text-emerald-800">{period?.is_verified ? 'SHA-256 Hash Verified' : 'Ready for verification'}</p>
              </div>

              <div className="bg-white border border-black p-3 space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Data Quality Rating</span>
                <span className="text-xl font-black text-black">94.8% (Grade A)</span>
                <p className="text-[10px] text-neutral-600">DESNZ 2024 Verified</p>
              </div>
            </div>
          </div>
        )}

        {/* Primary KPI Metrics Grid - Inspired by metadata layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {/* Total Footprint */}
          <div className="border-2 border-black p-5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
                <span>Total Emissions</span>
                <Globe className="w-4 h-4 text-black" />
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-black leading-none">
                {summary.total_tonnes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-black uppercase tracking-wider text-black mt-1">t CO₂e</div>
            </div>
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-t border-black pt-2 mt-4">
              {summary.total_kg.toLocaleString()} kg CO₂e ({summary.activityCount} records)
            </div>
          </div>

          {/* Scope 1 Direct */}
          <div className="border-2 border-black p-5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
                <span>Scope 1 (Direct)</span>
                <Fuel className="w-4 h-4 text-black" />
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-black leading-none">
                {(summary.scope1_kg / 1000).toFixed(2)}
              </div>
              <div className="text-xs font-black uppercase tracking-wider text-black mt-1">t CO₂e</div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-black uppercase tracking-wider border-t border-black pt-2 mt-4">
              <span>Fuel & Heating</span>
              <span className="font-black bg-black text-white px-1.5 py-0.5">{summary.scope1_percent}%</span>
            </div>
          </div>

          {/* Scope 2 Electricity */}
          <div className="border-2 border-black p-5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
                <span>Scope 2 (Indirect)</span>
                <Zap className="w-4 h-4 text-black" />
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-black leading-none">
                {(summary.scope2_kg / 1000).toFixed(2)}
              </div>
              <div className="text-xs font-black uppercase tracking-wider text-black mt-1">t CO₂e</div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-black uppercase tracking-wider border-t border-black pt-2 mt-4">
              <span>Power Grid</span>
              <span className="font-black bg-black text-white px-1.5 py-0.5">{summary.scope2_percent}%</span>
            </div>
          </div>

          {/* Scope 3 Value Chain */}
          <div className="border-2 border-black p-5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
                <span>Scope 3 (Value Chain)</span>
                <Factory className="w-4 h-4 text-black" />
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-black leading-none">
                {(summary.scope3_kg / 1000).toFixed(2)}
              </div>
              <div className="text-xs font-black uppercase tracking-wider text-black mt-1">t CO₂e</div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-black uppercase tracking-wider border-t border-black pt-2 mt-4">
              <span>Supply Chain</span>
              <span className="font-black bg-black text-white px-1.5 py-0.5">{summary.scope3_percent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* SME Intensity & Normalized Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-neutral-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-black" />
              <span>Emissions Per Employee</span>
            </div>
            <div className="text-3xl font-black text-black tracking-tight mt-2">
              {summary.intensityPerEmployee_kg.toLocaleString()}{' '}
              <span className="text-xs font-bold text-neutral-500 uppercase">kg CO₂e / FTE</span>
            </div>
            <p className="text-xs font-bold text-neutral-500 uppercase mt-2">
              // Indexed across {org?.employeeCount || 1} staff
            </p>
          </div>
          <div className="w-16 h-16 border-2 border-black bg-neutral-100 flex items-center justify-center text-black font-black text-base uppercase">
            {org?.employeeCount || 1} FTE
          </div>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-neutral-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-black" />
              <span>Revenue Intensity Index</span>
            </div>
            <div className="text-3xl font-black text-black tracking-tight mt-2">
              {summary.intensityPerRevenue_kgPer1k.toFixed(2)}{' '}
              <span className="text-xs font-bold text-neutral-500 uppercase">kg / £1,000 Revenue</span>
            </div>
            <p className="text-xs font-bold text-neutral-500 uppercase mt-2">
              // Economic density (£{((org?.annualRevenueGbp || 0) / 1000000).toFixed(1)}M)
            </p>
          </div>
          <div className="w-16 h-16 border-2 border-black bg-neutral-100 flex items-center justify-center text-black font-black text-base uppercase">
            £{(org?.annualRevenueGbp ? org.annualRevenueGbp / 1000000 : 0).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* PHASE 4: HOTSPOT ANALYSIS ENGINE */}
      {(summary.hotspots ?? []).length > 0 && (
        <div className="bg-amber-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-black font-black text-[10px] uppercase px-2 py-0.5 border border-black tracking-widest">
                  Phase 4 Analytics
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-black">
                  Carbon Hotspot Identification Engine
                </h3>
              </div>
              <p className="text-xs font-bold text-neutral-600 uppercase mt-1">
                // Programmatically identified top 3 drivers accounting for majority footprint
              </p>
            </div>
            <span className="text-xs font-black uppercase font-mono bg-black text-white px-3 py-1 border border-black">
              Top Impact Contributors
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {summary.hotspots.map((spot) => (
              <div key={spot.rank} className="bg-white border-2 border-black p-4 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                      Hotspot #{spot.rank}
                    </span>
                    <span className="text-xs font-black uppercase text-amber-900 bg-amber-200 border border-black px-2 py-0.5">
                      Scope {spot.scope}
                    </span>
                  </div>

                  <h4 className="text-sm font-black uppercase text-black mt-2">
                    {spot.category}
                  </h4>

                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-black">{spot.percentage}%</span>
                    <span className="text-xs font-bold uppercase text-neutral-500">
                      of total footprint ({spot.co2e_tonnes} t CO₂e)
                    </span>
                  </div>

                  <p className="text-xs font-bold text-neutral-700 bg-neutral-50 border border-black p-2.5 mt-3 leading-relaxed">
                    <strong className="text-black uppercase tracking-wide block mb-1">Decarbonisation Action:</strong>
                    {spot.recommendation}
                  </p>
                </div>

                <div className="w-full bg-neutral-200 h-2 border border-black overflow-hidden mt-2">
                  <div className="bg-amber-500 h-full" style={{ width: `${Math.min(spot.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scope Distribution Pie Chart */}
        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">GHG Scope Breakdown</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase">// Proportional impact distribution</p>
            </div>
            <BarChart3 className="w-5 h-5 text-black" />
          </div>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-500 text-xs font-bold uppercase">
              No activity entries logged yet for this reporting period.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${(val / 1000).toFixed(2)} t CO₂e (${val.toLocaleString()} kg)`, 'Emissions']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Emissions by Category</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase">// Top operational contributors</p>
            </div>
          </div>

          {(summary.byCategory ?? []).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-500 text-xs font-bold uppercase">
              No categories populated yet. Log activities to generate breakdown.
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {(summary.byCategory ?? []).map((cat, idx) => {
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-black uppercase">
                      <span className="text-black">{cat.category}</span>
                      <span className="text-black">
                        {cat.co2e_tonnes} t CO₂e ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 border border-black overflow-hidden flex">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {(summary.monthlyTrend ?? []).length > 0 && (
        <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Monthly Trajectory</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase">// Carbon volume timeline across the period</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#000', fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11, fill: '#000', fontWeight: 'bold' }} unit=" kg" />
                <Tooltip formatter={(val: number) => [`${val.toLocaleString()} kg CO₂e`, 'Emissions']} />
                <Legend />
                <Bar dataKey="scope1_kg" name="Scope 1 Direct" fill="#000000" stackId="a" />
                <Bar dataKey="scope2_kg" name="Scope 2 Power" fill="#525252" stackId="a" />
                <Bar dataKey="scope3_kg" name="Scope 3 Supply Chain" fill="#a3a3a3" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GHG Scope Reference Guide for SMEs */}
      <div className="bg-white border-2 border-black p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <h4 className="text-xs font-black text-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
          SME Greenhouse Gas Protocol Framework Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold uppercase">
          <div className="p-4 border-2 border-black bg-neutral-50">
            <span className="inline-block px-2 py-0.5 font-black bg-black text-white text-[10px] tracking-wider mb-2">
              SCOPE 1 • DIRECT
            </span>
            <p className="text-black font-black text-sm">Direct Fuel Combustion</p>
            <p className="text-neutral-600 font-bold mt-1 text-[11px] normal-case">
              Gas heating, company fleet, generator fuel, and refrigerant losses.
            </p>
          </div>

          <div className="p-4 border-2 border-black bg-neutral-50">
            <span className="inline-block px-2 py-0.5 font-black bg-black text-white text-[10px] tracking-wider mb-2">
              SCOPE 2 • POWER
            </span>
            <p className="text-black font-black text-sm">Purchased Energy</p>
            <p className="text-neutral-600 font-bold mt-1 text-[11px] normal-case">
              Grid electricity used in facilities, office units, and district heating.
            </p>
          </div>

          <div className="p-4 border-2 border-black bg-neutral-50">
            <span className="inline-block px-2 py-0.5 font-black bg-black text-white text-[10px] tracking-wider mb-2">
              SCOPE 3 • VALUE CHAIN
            </span>
            <p className="text-black font-black text-sm">Upstream & Downstream</p>
            <p className="text-neutral-600 font-bold mt-1 text-[11px] normal-case">
              Business flights, commuting, waste disposal, water treatment, and procurement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
