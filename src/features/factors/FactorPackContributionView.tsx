/**
 * CarbonSnap — FactorPackContributionView.tsx
 * FSD: features layer — factor pack contributions
 * Submit community emission-factor packs for governance review.
 */
import {
  AlertCircle,
  CheckCircle2,
  FileCode,
  Globe,
  Plus,
  ShieldCheck,
  Upload,
  UserCheck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fetchCommunityFactorPacks, submitCommunityFactorPack } from '../../shared/api/client';
import { CommunityFactorPack } from '../../shared/model/types';

export const FactorPackContributionView: React.FC = () => {
  const [packs, setPacks] = useState<CommunityFactorPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [jsonInput, setJsonInput] = useState('');
  const [country, setCountry] = useState('Germany');
  const [countryCode, setCountryCode] = useState('DE');
  const [datasetKey, setDatasetKey] = useState('DE_UBA_2024');
  const [datasetName, setDatasetName] = useState('UBA Germany Emission Factors 2024');
  const [submittedBy, setSubmittedBy] = useState('Berlin Climate Tech Hub');

  const [validationError, setValidationError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = () => {
    setLoading(true);
    fetchCommunityFactorPacks()
      .then((data) => {
        setPacks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const sampleJsonTemplate = JSON.stringify(
    {
      datasetKey: "DE_UBA_2024",
      datasetName: "UBA Germany Official Grid & Heating Factors 2024",
      country: "Germany",
      countryCode: "DE",
      year: 2024,
      submittedBy: "Berlin Sustainability Engineering",
      factors: [
        {
          id: "de_elec_grid_2024",
          category: "Electricity",
          name: "Germany Strommix Electricity Grid 2024",
          scope: 2,
          unit: "kWh",
          factorValue: 0.38000,
          datasetSource: "Umweltbundesamt (UBA) 2024",
          description: "Official German electricity grid emission factor"
        },
        {
          id: "de_gas_heating_2024",
          category: "Stationary Combustion",
          name: "Erdgas Natural Gas Heating",
          scope: 1,
          unit: "kWh",
          factorValue: 0.20100,
          datasetSource: "UBA Germany 2024",
          description: "German natural gas heating combustion factor"
        }
      ]
    },
    null,
    2
  );

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setJsonInput(content);
        setValidationError('');
      }
    };
    reader.readAsText(file);
  };

  const handleValidateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSubmitSuccess('');

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonInput || sampleJsonTemplate);
    } catch (err: any) {
      setValidationError('Invalid JSON syntax: ' + err.message);
      return;
    }

    // Client-side schema pre-validation
    if (!parsedData.datasetKey || !parsedData.datasetName || !parsedData.country) {
      setValidationError('Schema validation error: Missing required root fields (datasetKey, datasetName, country)');
      return;
    }

    if (!Array.isArray(parsedData.factors) || parsedData.factors.length === 0) {
      setValidationError('Schema validation error: "factors" must be a non-empty array of conversion objects');
      return;
    }

    for (let i = 0; i < parsedData.factors.length; i++) {
      const f = parsedData.factors[i];
      if (f.factorValue === undefined || !f.unit) {
        setValidationError(`Schema validation error at factors[${i}]: factorValue and unit are required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await submitCommunityFactorPack(parsedData);
      setSubmitSuccess(res.message || 'Factor Pack validated and approved!');
      loadPacks();
    } catch (err: any) {
      setValidationError(err.message || 'Validation failed on server');
    } finally {
      setSubmitting(false);
    }
  };

  const supportedCountryCards = [
    { name: 'United Kingdom', code: 'UK', flag: '🇬🇧', status: 'Official DEFRA 2024', factorsCount: 32 },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', status: 'UBA 2024 Active', factorsCount: 24 },
    { name: 'United States', code: 'US', flag: '🇺🇸', status: 'EPA eGRID 2024', factorsCount: 28 },
    { name: 'France', code: 'FR', flag: '🇫🇷', status: 'ADEME Base Empreinte', factorsCount: 22 },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', status: 'MOE Japan 2024', factorsCount: 18 },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', status: 'MCTI Interconnected SIN', factorsCount: 14 }
  ];

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto text-black">
      {/* Title Banner */}
      <div className="bg-black text-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-black font-black text-[10px] uppercase px-2 py-0.5 border border-black tracking-widest">
              Global Scale Moat
            </span>
            <span className="text-xs font-mono text-neutral-300">
              Open Source Emission Factor Contribution
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1 flex items-center space-x-2">
            <Globe className="w-7 h-7 text-amber-400" />
            <span>International Factor Pack Contribution UI</span>
          </h1>
          <p className="text-xs font-bold text-neutral-300 uppercase mt-1">
            // Fulfilling the global scaling mandate by allowing community engineers to submit localized factor packs conforming to <code className="font-mono text-amber-300">emission-factors/schema.json</code>.
          </p>
        </div>

        <span className="bg-white text-black font-black text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
          Schema V2 Validated
        </span>
      </div>

      {/* Country Coverage Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black tracking-widest border-b-2 border-black pb-1">
          Supported Country Factor Packs & Global Coverage
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {supportedCountryCards.map((c) => (
            <div key={c.code} className="p-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.flag}</span>
                <span className="text-[10px] font-mono font-black bg-black text-white px-1.5 py-0.5">
                  {c.code}
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-black mt-1">{c.name}</h3>
              <p className="text-[10px] font-bold text-neutral-500 uppercase">{c.status}</p>
              <span className="text-[10px] font-mono font-bold text-emerald-800 block pt-1">
                {c.factorsCount} factors
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Schema Submission Form */}
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div>
            <h2 className="text-base font-black uppercase text-black flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-black" />
              <span>Submit New Country Factor Pack (JSON)</span>
            </h2>
            <p className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
              Upload or paste JSON dataset conforming to <span className="font-mono bg-neutral-100 px-1 border border-black text-black">schema.json</span>
            </p>
          </div>

          <label className="bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-1">
            <Upload className="w-4 h-4" />
            <span>Upload .JSON File</span>
            <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
          </label>
        </div>

        {/* Form Container */}
        <form onSubmit={handleValidateAndSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-black">
                Factor Pack JSON Data
              </label>
              <button
                type="button"
                onClick={() => setJsonInput(sampleJsonTemplate)}
                className="text-[10px] font-black uppercase text-neutral-600 hover:text-black underline cursor-pointer"
              >
                Load Sample Germany (DE) JSON Template
              </button>
            </div>

            <textarea
              rows={12}
              value={jsonInput || sampleJsonTemplate}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-neutral-900 text-amber-300 border-2 border-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {validationError && (
            <div className="p-4 bg-red-100 border-2 border-black text-red-900 font-bold text-xs uppercase flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-black text-emerald-900 font-black text-xs uppercase flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-bold uppercase text-neutral-500">
              * Backend validation service checks required fields (<code className="font-mono text-black font-black">factorValue</code>, <code className="font-mono text-black font-black">unit</code>, <code className="font-mono text-black font-black">year</code>).
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase px-6 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer inline-flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{submitting ? 'Validating Schema...' : 'Validate & Submit Factor Pack +'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Community Approved Factor Packs List */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase text-black tracking-widest border-b-2 border-black pb-1">
          Community Submitted & Reviewed Datasets
        </h2>

        <div className="divide-y-2 divide-black border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {packs.map((p) => (
            <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold uppercase">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-black text-sm">{p.datasetName}</span>
                  <span className="bg-emerald-300 text-black font-black text-[10px] px-2 py-0.5 border border-black">
                    {p.status}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 font-mono">
                  Country: {p.country} ({p.countryCode}) | Year: {p.year} | Factors: {p.factorCount}
                </div>
                <div className="text-[10px] text-neutral-500">
                  Contributor: {p.submittedBy} | Submitted: {new Date(p.submittedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-neutral-100 border border-black p-2 font-mono text-[10px] font-black text-black">
                {p.datasetKey}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
