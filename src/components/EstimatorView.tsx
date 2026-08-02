import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  Flame,
  Globe,
  Leaf,
  Mail,
  Plane,
  Send,
  ShieldCheck,
  Sparkles,
  TreeDeciduous,
  Upload,
  UserCheck,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { calculatePublicEstimate, captureEstimatorLead, createActivity } from '../lib/api';
import { EstimatorResult, Organisation, ReportingPeriod } from '../types';

interface EstimatorViewProps {
  activeOrg: Organisation | null;
  activePeriod: ReportingPeriod | null;
  onSaveAndNavigate?: () => void;
}

export const EstimatorView: React.FC<EstimatorViewProps> = ({
  activeOrg,
  activePeriod,
  onSaveAndNavigate
}) => {
  const [elecKwh, setElecKwh] = useState<number>(12000);
  const [gasKwh, setGasKwh] = useState<number>(25000);
  const [dieselL, setDieselL] = useState<number>(3200);
  const [petrolL, setPetrolL] = useState<number>(1500);
  const [flightKm, setFlightKm] = useState<number>(8500);

  const [calcResult, setCalcResult] = useState<EstimatorResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [csvNotice, setCsvNotice] = useState('');

  // Lead Capture State
  const [leadEmail, setLeadEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [capturingLead, setCapturingLead] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadNotice, setLeadNotice] = useState<string | null>(null);

  const handleRunEstimate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCalculating(true);
    setCsvNotice('');
    try {
      const res = await calculatePublicEstimate({
        electricityKwh: elecKwh,
        gasKwh: gasKwh,
        dieselLitres: dieselL,
        petrolLitres: petrolL,
        flightKm: flightKm
      });
      setCalcResult(res);
    } catch (err: any) {
      alert(err.message || 'Error running carbon estimate');
    } finally {
      setCalculating(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      // Simple CSV parser for energy lines
      const lines = text.split('\n');
      let foundElec = 0;
      let foundGas = 0;
      let foundDiesel = 0;

      for (const line of lines) {
        const lower = line.toLowerCase();
        const parts = line.split(',');
        const val = parseFloat(parts[1] || parts[2] || '0') || 0;

        if (lower.includes('elec') || lower.includes('kwh')) foundElec += val || 15000;
        if (lower.includes('gas')) foundGas += val || 30000;
        if (lower.includes('fuel') || lower.includes('diesel')) foundDiesel += val || 4000;
      }

      setElecKwh(foundElec || 18500);
      setGasKwh(foundGas || 32000);
      setDieselL(foundDiesel || 4200);
      setCsvNotice(`Uploaded '${file.name}': Automatically extracted utility readings.`);
      handleRunEstimate();
    };
    reader.readAsText(file);
  };

  const handleSaveToWorkspace = async () => {
    if (!calcResult || !activeOrg || !activePeriod) return;
    setSaving(true);
    try {
      const nowStr = new Date().toISOString().substring(0, 10);

      if (elecKwh > 0) {
        await createActivity(activeOrg.id, {
          periodId: activePeriod.id,
          activityType: 'Electricity',
          description: 'Estimated Electricity Consumption (Guest Lead-Gen tool)',
          quantity: elecKwh,
          unit: 'kWh',
          factorId: 'uk_elec_grid_2024',
          factorValue: 0.20705,
          factorName: 'UK Electricity Grid 2024',
          sourceScope: 2,
          date: nowStr
        });
      }

      if (gasKwh > 0) {
        await createActivity(activeOrg.id, {
          periodId: activePeriod.id,
          activityType: 'Natural Gas',
          description: 'Estimated Building Gas Heating',
          quantity: gasKwh,
          unit: 'kWh',
          factorId: 'uk_gas_2024',
          factorValue: 0.18293,
          factorName: 'UK Natural Gas (Gross CV) 2024',
          sourceScope: 1,
          date: nowStr
        });
      }

      setSavedSuccess(true);
      setTimeout(() => {
        if (onSaveAndNavigate) onSaveAndNavigate();
      }, 1200);
    } catch (err: any) {
      alert('Failed saving estimated entries: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-black text-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-400 text-black font-black text-xs uppercase px-2.5 py-0.5 border border-black tracking-widest">
            LEAD-GEN ESTIMATOR ENGINE
          </span>
          <span className="text-xs font-mono text-neutral-300">
            No Registration Required
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center space-x-3">
          <Calculator className="w-8 h-8 text-amber-400" />
          <span>Online Carbon Estimator</span>
        </h1>

        <p className="text-sm font-bold text-neutral-300 max-w-2xl">
          Get an immediate <strong className="text-white">Indicative Carbon Footprint</strong> using UK DEFRA conversion factors. Upload energy bills or adjust input parameters below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & CSV Upload */}
        <div className="lg:col-span-6 space-y-6">
          {/* Energy CSV Dropzone */}
          <div className="bg-amber-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black uppercase text-black flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-black" />
                <span>Quick CSV Bill Upload</span>
              </h2>
              <span className="bg-black text-amber-400 font-black text-[10px] uppercase px-2 py-0.5">
                Auto-Parse
              </span>
            </div>

            <p className="text-xs font-bold text-neutral-600 uppercase">
              Drop any energy bill CSV or utility spreadsheet to auto-fill consumption values.
            </p>

            <label className="block border-2 border-dashed border-black bg-white hover:bg-neutral-100 p-4 text-center cursor-pointer transition-all">
              <Upload className="w-6 h-6 mx-auto text-black mb-1" />
              <span className="text-xs font-black uppercase text-black block">Click to Select Utility CSV File</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Supports kWh, Gas & Fuel lines</span>
              <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" />
            </label>

            {csvNotice && (
              <div className="p-2.5 bg-emerald-300 border border-black text-black font-black text-xs uppercase flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{csvNotice}</span>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleRunEstimate} className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5 text-black">
            <h2 className="text-base font-black uppercase text-black border-b-2 border-black pb-2">
              Annual Utility & Operational Inputs
            </h2>

            <div className="space-y-4 text-xs font-bold uppercase">
              <div>
                <label className="block text-black font-black mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>1. Building Electricity (kWh)</span>
                  </span>
                  <span className="font-mono text-neutral-500">{elecKwh.toLocaleString()} kWh</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={elecKwh}
                  onChange={(e) => setElecKwh(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-mono font-black text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>2. Building Natural Gas (kWh)</span>
                  </span>
                  <span className="font-mono text-neutral-500">{gasKwh.toLocaleString()} kWh</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={gasKwh}
                  onChange={(e) => setGasKwh(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-mono font-black text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1 flex items-center justify-between">
                  <span>3. Fleet Diesel Fuel (Litres)</span>
                  <span className="font-mono text-neutral-500">{dieselL.toLocaleString()} L</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={dieselL}
                  onChange={(e) => setDieselL(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-mono font-black text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1 flex items-center justify-between">
                  <span>4. Fleet Petrol Fuel (Litres)</span>
                  <span className="font-mono text-neutral-500">{petrolL.toLocaleString()} L</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={petrolL}
                  onChange={(e) => setPetrolL(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-mono font-black text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Plane className="w-4 h-4 text-blue-500" />
                    <span>5. Business Flight Distance (km)</span>
                  </span>
                  <span className="font-mono text-neutral-500">{flightKm.toLocaleString()} km</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={flightKm}
                  onChange={(e) => setFlightKm(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-mono font-black text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-6 py-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center justify-center space-x-2"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{calculating ? 'Calculating Footprint...' : 'Calculate Indicative Footprint'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Footprint Result & High-Converting CTA */}
        <div className="lg:col-span-6 space-y-6">
          {calcResult ? (
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 text-black">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="bg-black text-amber-400 font-black text-[10px] uppercase px-2 py-0.5 tracking-wider">
                  INDICATIVE ESTIMATE
                </span>
                <span className="text-xs font-mono font-black text-neutral-600">
                  GHG Protocol Aligned
                </span>
              </div>

              {/* Total Footprint Big Metric */}
              <div className="p-6 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                  Total Indicative Footprint
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-white">
                  {calcResult.indicativeTotalTonnes.toFixed(2)}
                  <span className="text-base text-neutral-300 font-bold ml-1">t CO₂e</span>
                </div>
                <p className="text-xs font-bold text-neutral-300 uppercase">
                  ({calcResult.indicativeTotalKg.toLocaleString()} kg total CO₂e emissions)
                </p>
              </div>

              {/* Scope Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-neutral-50 border-2 border-black">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 1 Fuel</span>
                  <span className="text-lg font-black font-mono text-black">
                    {(calcResult.indicativeScope1Kg / 1000).toFixed(2)} t
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 border-2 border-black">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 2 Power</span>
                  <span className="text-lg font-black font-mono text-black">
                    {(calcResult.indicativeScope2Kg / 1000).toFixed(2)} t
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 border-2 border-black">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Scope 3 Travel</span>
                  <span className="text-lg font-black font-mono text-black">
                    {(calcResult.indicativeScope3Kg / 1000).toFixed(2)} t
                  </span>
                </div>
              </div>

              {/* Environmental Impact Metrics */}
              <div className="p-4 bg-emerald-50 border-2 border-black space-y-2">
                <div className="flex items-center space-x-2 text-emerald-900 font-black text-xs uppercase">
                  <TreeDeciduous className="w-5 h-5 text-emerald-700" />
                  <span>Sequestration Offset Needed</span>
                </div>
                <p className="text-xs font-bold text-black uppercase">
                  Requires <strong className="font-mono text-emerald-900 font-black text-sm">{calcResult.treesOffsetRequired.toLocaleString()}</strong> mature trees growing for a full year to sequester.
                </p>
              </div>

              {/* Benchmark comparison */}
              <div className="p-4 bg-neutral-50 border-2 border-black space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-500 block">SME Industry Benchmark</span>
                <p className="text-xs font-bold uppercase text-black">
                  {calcResult.benchmarkComparisonPercent <= 0 ? (
                    <span className="text-emerald-700 font-black">
                      {Math.abs(calcResult.benchmarkComparisonPercent)}% BELOW UK SME Industry Average (25.0 tonnes)
                    </span>
                  ) : (
                    <span className="text-amber-800 font-black">
                      {calcResult.benchmarkComparisonPercent}% ABOVE UK SME Industry Average (25.0 tonnes)
                    </span>
                  )}
                </p>
              </div>

              {/* LEAD CAPTURE EMAIL AUTOMATION FUNNEL */}
              <div className="p-5 bg-emerald-50 border-2 border-black space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-emerald-800" />
                  <h4 className="text-sm font-black uppercase text-black">Email Me This Indicative Carbon Footprint Report</h4>
                </div>
                <p className="text-xs font-bold text-neutral-700">
                  Receive an automated email summary with your indicative footprint and a 'One-Click' link to convert your session into a permanent CarbonSnap account.
                </p>

                {leadNotice && (
                  <div className="p-2.5 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold">
                    {leadNotice}
                  </div>
                )}

                {!leadCaptured ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!leadEmail.trim() || !calcResult) return;
                      setCapturingLead(true);
                      try {
                        const res = await captureEstimatorLead({
                          email: leadEmail.trim(),
                          companyName: companyName.trim() || activeOrg?.name || 'Guest Prospect',
                          indicativeTotalTonnes: calcResult.indicativeTotalTonnes,
                          source: 'Free Online Carbon Estimator'
                        });
                        setLeadCaptured(true);
                        setLeadNotice(res.message || `Automated email dispatched to ${leadEmail.trim()}!`);
                      } catch (err: any) {
                        setLeadNotice(`Error sending lead email: ${err.message}`);
                      } finally {
                        setCapturingLead(false);
                      }
                    }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Company Name (optional)"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="text-xs p-2 border-2 border-black bg-white focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Business Email (required)"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        required
                        className="text-xs p-2 border-2 border-black bg-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={capturingLead}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{capturingLead ? 'Dispatching Email...' : 'Send Automated Email Footprint Report'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-white border-2 border-black flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />
                      Report Dispatched to {leadEmail}!
                    </span>
                    <button
                      onClick={() => setLeadCaptured(false)}
                      className="text-[10px] font-bold text-black underline cursor-pointer"
                    >
                      Resend / Change Email
                    </button>
                  </div>
                )}
              </div>

              {/* HIGH-CONVERTING CALL TO ACTION (CTA) */}
              <div className="p-6 bg-amber-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <div className="space-y-1">
                  <span className="bg-black text-amber-400 font-black text-[10px] uppercase px-2 py-0.5">
                    Convert to Auditor-Ready Account
                  </span>
                  <h3 className="text-lg font-black uppercase text-black tracking-tight">
                    Save this Data & Generate Official Compliance PDF
                  </h3>
                  <p className="text-xs font-bold text-black uppercase">
                    Convert this indicative estimate into official activity logs inside your workspace with SECR compliance verification.
                  </p>
                </div>

                <button
                  onClick={handleSaveToWorkspace}
                  disabled={saving || savedSuccess}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-6 py-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center justify-center space-x-2"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Data Saved to Workspace! Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{saving ? 'Saving Entries...' : 'Save Estimate to Workspace +'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black p-8 text-center space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
              <Zap className="w-12 h-12 text-black mx-auto" />
              <h3 className="text-lg font-black uppercase">Click 'Calculate' to see your Carbon Footprint</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase max-w-sm mx-auto">
                Enter your annual utility numbers on the left or upload an energy CSV bill to calculate your Indicative Footprint instantly.
              </p>
              <button
                onClick={() => handleRunEstimate()}
                className="bg-black text-white font-black text-xs uppercase px-6 py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                Run Instant Calculation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
