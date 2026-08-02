import { Award, BookOpen, CheckCircle2, Code2, Database, DollarSign, ExternalLink, Globe, Plus, Search, ShieldCheck, Trophy, UserCheck, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { claimFactorBounty, fetchFactorBounties, fetchFactorContributions, fetchHallOfFame, reviewFactorContribution, submitFactorContribution } from '../lib/api';
import { EmissionFactor, EmissionFactorDataset, FactorBounty, FactorContribution, HallOfFameContributor } from '../types';

interface EmissionFactorsViewProps {
  datasets: EmissionFactorDataset[];
  factors: EmissionFactor[];
  selectedDataset: string;
  onSelectDataset: (datasetKey: string) => void;
}

export const EmissionFactorsView: React.FC<EmissionFactorsViewProps> = ({
  datasets,
  factors,
  selectedDataset,
  onSelectDataset
}) => {
  const [search, setSearch] = useState('');
  const [contributions, setContributions] = useState<FactorContribution[]>([]);
  const [bounties, setBounties] = useState<FactorBounty[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameContributor[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'OFFICIAL' | 'COMMUNITY' | 'BOUNTIES'>('OFFICIAL');
  const [claimingBountyId, setClaimingBountyId] = useState<string | null>(null);
  const [claimantNameInput, setClaimantNameInput] = useState('');

  // Submit DCO Form State
  const [datasetName, setDatasetName] = useState('');
  const [countryRegion, setCountryRegion] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [dcoSigned, setDcoSigned] = useState(false);
  const [factorDataJson, setFactorDataJson] = useState('[\n  {\n    "id": "custom_factor_01",\n    "category": "Electricity",\n    "name": "Custom Regional Grid Factor",\n    "scope": 2,\n    "unit": "kWh",\n    "factorValue": 0.250,\n    "description": "Verified regional grid factor"\n  }\n]');
  const [submitting, setSubmitting] = useState(false);

  // Peer Review State
  const [reviewingContrib, setReviewingContrib] = useState<FactorContribution | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewingLoading, setReviewingLoading] = useState(false);

  const loadData = async () => {
    try {
      const [contribData, bountyData, hofData] = await Promise.all([
        fetchFactorContributions(),
        fetchFactorBounties(),
        fetchHallOfFame()
      ]);
      setContributions(contribData);
      setBounties(bountyData);
      setHallOfFame(hofData);
    } catch (e) {
      console.error('Failed loading factor registry data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimBounty = async (bountyId: string) => {
    if (!claimantNameInput.trim()) {
      alert('Please enter your name/organization to claim this bounty.');
      return;
    }
    try {
      await claimFactorBounty(bountyId, claimantNameInput.trim());
      setClaimingBountyId(null);
      setClaimantNameInput('');
      loadData();
      alert('Bounty successfully claimed! You can now submit the dataset pack via the Community DCO Portal.');
    } catch (e: any) {
      alert(e.message || 'Failed claiming bounty');
    }
  };


  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dcoSigned) {
      alert('You must digitally sign the Developer Certificate of Origin (DCO) to submit a factor pack.');
      return;
    }
    setSubmitting(true);
    try {
      const sig = `I agree to Developer Certificate of Origin v1.1 - Signed-off-by: ${contributorName} <${contributorEmail}>`;
      await submitFactorContribution({
        datasetName,
        countryRegion,
        contributorName,
        contributorEmail,
        dcoSigned: true,
        dcoSignature: sig,
        factorDataJson
      });
      setShowSubmitModal(false);
      setDatasetName('');
      setCountryRegion('');
      setContributorName('');
      setContributorEmail('');
      setDcoSigned(false);
      loadData();
      alert('Community Factor Pack successfully submitted with signed DCO!');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePeerReviewAction = async (approved: boolean) => {
    if (!reviewingContrib) return;
    setReviewingLoading(true);
    try {
      await reviewFactorContribution(reviewingContrib.id, {
        reviewerName: 'Verified Community Moderator',
        comment: reviewComment || (approved ? 'Factor dataset verified against official regional registry.' : 'Requires additional citation sources.'),
        approved
      });
      setReviewingContrib(null);
      setReviewComment('');
      loadData();

    } catch (e: any) {
      alert(e.message);
    } finally {
      setReviewingLoading(false);
    }
  };

  const currentDatasetObj = datasets.find(d => d.dataset === selectedDataset) || datasets[0];

  const filteredFactors = factors.filter(
    f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
            <Database className="w-6 h-6 text-black" />
            <span>Emission Factor Dataset Library</span>
          </h1>
          <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
            // Official conversion factors from DESNZ (UK), US EPA, and IPCC global standards + Open Community DCO Submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('OFFICIAL')}
            className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
              activeTab === 'OFFICIAL'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Official Standard Packs
          </button>
          <button
            onClick={() => setActiveTab('COMMUNITY')}
            className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
              activeTab === 'COMMUNITY'
                ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Community DCO Portal ({contributions.length})
          </button>
          <button
            onClick={() => setActiveTab('BOUNTIES')}
            className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
              activeTab === 'BOUNTIES'
                ? 'bg-emerald-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Factor Bounties & Hall of Fame
          </button>
        </div>
      </div>

      {activeTab === 'BOUNTIES' ? (
        <div className="space-y-8">
          {/* Factor Bounty Program */}
          <div className="bg-emerald-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-emerald-800" />
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-emerald-950">
                    Emission Factor Bounty Registry
                  </h2>
                  <p className="text-xs font-mono font-bold text-emerald-800 uppercase">
                    // Fund & build open-source regional datasets for missing country factors.
                  </p>
                </div>
              </div>
              <span className="bg-emerald-400 border border-black font-mono font-black text-xs uppercase px-3 py-1 text-black">
                Phase 9 Bounty Program
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bounties.map((b) => (
                <div key={b.id} className="bg-white border-2 border-black p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                      {b.countryName} ({b.countryCode})
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                      b.priority === 'URGENT' ? 'bg-rose-300 text-rose-950' : b.priority === 'HIGH' ? 'bg-amber-300 text-amber-950' : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {b.priority} PRIORITY
                    </span>
                  </div>

                  <h3 className="text-sm font-black uppercase text-black line-clamp-2">{b.targetRegistry}</h3>

                  <div className="bg-neutral-100 border border-black p-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-600 uppercase">Bounty Reward:</span>
                    <span className="font-black text-emerald-700 font-mono text-sm">${b.rewardBountyUsd} USD</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-bold uppercase text-neutral-500">Status:</span>
                    {b.status === 'COMPLETED' ? (
                      <span className="bg-emerald-200 border border-black px-2 py-0.5 text-emerald-900 font-black uppercase">COMPLETED</span>
                    ) : b.status === 'IN_CLAIM' ? (
                      <span className="bg-amber-200 border border-black px-2 py-0.5 text-amber-900 font-black uppercase">CLAIMED BY {b.claimedBy}</span>
                    ) : (
                      <span className="bg-neutral-100 border border-black px-2 py-0.5 text-black font-black uppercase">OPEN FOR CLAIM</span>
                    )}
                  </div>

                  {b.status === 'OPEN' && (
                    <div className="pt-2">
                      {claimingBountyId === b.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Your Name / Organization..."
                            value={claimantNameInput}
                            onChange={(e) => setClaimantNameInput(e.target.value)}
                            className="w-full bg-white border border-black p-1.5 text-xs font-bold focus:outline-none uppercase"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClaimBounty(b.id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase p-1.5 border border-black cursor-pointer"
                            >
                              Confirm Claim
                            </button>
                            <button
                              onClick={() => setClaimingBountyId(null)}
                              className="bg-neutral-200 text-black font-bold text-[10px] uppercase p-1.5 border border-black cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setClaimingBountyId(b.id)}
                          className="w-full bg-black hover:bg-neutral-800 text-amber-400 font-black text-xs uppercase p-2 border border-black flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Claim Factor Bounty (${b.rewardBountyUsd})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CarbonSnap Hall of Fame */}
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center space-x-2 border-b-2 border-black pb-3">
              <Award className="w-6 h-6 text-amber-600" />
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  CarbonSnap Global Hall of Fame
                </h2>
                <p className="text-xs font-mono font-bold text-neutral-600 uppercase">
                  // Top open-source climate scientists and dataset contributors verified by CI/CD.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-black font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100 border-b border-black font-black uppercase text-[10px]">
                    <th className="p-3 border-r border-black">Contributor</th>
                    <th className="p-3 border-r border-black">Organization / Country</th>
                    <th className="p-3 border-r border-black">Verified Packs</th>
                    <th className="p-3 border-r border-black">Factors Added</th>
                    <th className="p-3">Community Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-bold">
                  {hallOfFame.map((hof) => (
                    <tr key={hof.id} className="hover:bg-amber-50">
                      <td className="p-3 border-r border-black font-black text-black">{hof.name}</td>
                      <td className="p-3 border-r border-black text-neutral-700">{hof.organization || hof.country}</td>
                      <td className="p-3 border-r border-black text-black">{hof.contributionsCount} Packs</td>
                      <td className="p-3 border-r border-black text-emerald-700">{hof.totalFactorsAdded} Factors</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {hof.badges.map((badge, idx) => (
                            <span key={idx} className="bg-amber-200 border border-black px-1.5 py-0.5 text-[9px] font-black uppercase text-black">
                              {badge.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'OFFICIAL' ? (
        <>
          {/* Dataset Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {datasets.map((d) => (
              <button
                key={d.dataset}
                onClick={() => onSelectDataset(d.dataset)}
                className={`p-6 border-2 border-black text-left transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  selectedDataset === d.dataset
                    ? 'bg-black text-white font-black'
                    : 'bg-white text-black hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedDataset === d.dataset ? 'text-white' : 'text-black'}`}>
                    {d.country} ({d.year})
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 font-mono font-bold uppercase border border-current ${selectedDataset === d.dataset ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {d.factors.length} Factors
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">{d.name}</h3>
                <p className={`text-xs font-bold uppercase mt-2 line-clamp-2 ${selectedDataset === d.dataset ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  {d.description}
                </p>
              </button>
            ))}
          </div>

          {/* Dataset Details & Factors Search Table */}
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-black">{currentDatasetObj?.name}</h3>
                <p className="text-xs font-bold text-neutral-500 uppercase">
                  // Active conversion rates for greenhouse gas reporting
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-black" />
                <input
                  id="factors-search-input"
                  type="text"
                  placeholder="FILTER FACTORS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs font-bold bg-white border-2 border-black uppercase focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-black text-xs font-black text-black uppercase tracking-wider bg-neutral-100">
                    <th className="py-3 px-4 border-r-2 border-black">Category</th>
                    <th className="py-3 px-4 border-r-2 border-black">Factor Name</th>
                    <th className="py-3 px-4 border-r-2 border-black">Scope</th>
                    <th className="py-3 px-4 border-r-2 border-black text-right">Factor Value</th>
                    <th className="py-3 px-4 border-r-2 border-black">Unit</th>
                    <th className="py-3 px-4 border-r-2 border-black">Dataset</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black font-bold">
                  {filteredFactors.map((f, idx) => {
                    return (
                      <tr key={f.id} className={idx % 2 === 1 ? 'bg-neutral-50' : 'bg-white'}>
                        <td className="py-3 px-4 border-r-2 border-black uppercase font-black">{f.category}</td>
                        <td className="py-3 px-4 border-r-2 border-black uppercase font-black text-black">{f.name}</td>
                        <td className="py-3 px-4 border-r-2 border-black">
                          <span className="inline-block px-2 py-0.5 bg-black text-white font-black text-[10px] uppercase">
                            Scope {f.scope}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-r-2 border-black text-right font-mono font-black text-black">
                          {f.factorValue}
                        </td>
                        <td className="py-3 px-4 border-r-2 border-black font-mono font-bold text-black uppercase">
                          kg CO₂e / {f.unit}
                        </td>
                        <td className="py-3 px-4 border-r-2 border-black font-mono text-[11px] uppercase text-neutral-600">{f.datasetSource}</td>
                        <td className="py-3 px-4 text-neutral-600 max-w-xs uppercase font-medium">{f.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* PHASE 8: COMMUNITY GOVERNANCE & DCO PORTAL VIEW */
        <div className="space-y-6">
          <div className="bg-amber-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-black" />
                <h2 className="text-lg font-black uppercase text-black">
                  Developer Certificate of Origin (DCO v1.1) Contributor Portal
                </h2>
              </div>
              <p className="text-xs text-neutral-700 font-mono mt-1">
                Open governance model allowing local industry associations, grid operators, and climate research groups to contribute verified conversion factor packs under DCO legal sign-off.
              </p>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-800 text-amber-400 font-black text-xs uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Factor Pack (DCO Signed)</span>
            </button>
          </div>

          {/* Submissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contributions.map((c) => (
              <div key={c.id} className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-500">{c.countryRegion}</span>
                    <h3 className="text-base font-black uppercase text-black">{c.datasetName}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 border-2 border-black font-mono ${
                      c.reviewStatus === 'APPROVED'
                        ? 'bg-emerald-300 text-black'
                        : c.reviewStatus === 'REJECTED'
                        ? 'bg-red-300 text-black'
                        : 'bg-amber-300 text-black'
                    }`}
                  >
                    {c.reviewStatus}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Contributor:</span>
                    <span className="font-bold text-black">{c.contributorName} ({c.contributorEmail})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Submitted Date:</span>
                    <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="p-2 bg-neutral-100 border border-black text-[10px] font-bold text-emerald-900 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{c.dcoSignature}</span>
                  </div>
                </div>

                {c.peerReviews && c.peerReviews.length > 0 && (
                  <div className="bg-neutral-50 border border-black p-3 text-xs font-mono space-y-1">
                    <span className="text-[10px] font-black uppercase text-neutral-500">Peer Review History:</span>
                    {c.peerReviews.map((rev, i) => (
                      <div key={i} className="text-[11px] font-bold text-black">
                        ✓ {rev.reviewerName}: "{rev.comment}"
                      </div>
                    ))}
                  </div>
                )}

                {c.reviewStatus === 'PENDING_REVIEW' && (
                  <div className="pt-2">
                    <button
                      onClick={() => setReviewingContrib(c)}
                      className="w-full bg-black text-white hover:bg-neutral-800 font-black text-xs uppercase py-2 border border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Perform Peer Review & Verification
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DCO SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border-4 border-black p-6 max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] space-y-4 my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-black" />
                <h3 className="text-base font-black uppercase text-black">
                  Submit Factor Pack under Developer Certificate of Origin
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-black font-black text-sm uppercase px-2 py-1 bg-neutral-200 border border-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitContribution} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase text-neutral-700 block">Dataset Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nordic Hydro Grid 2026"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="w-full border-2 border-black p-2 uppercase font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-neutral-700 block">Country / Region</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SE / NO / FI"
                    value={countryRegion}
                    onChange={(e) => setCountryRegion(e.target.value)}
                    className="w-full border-2 border-black p-2 uppercase font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase text-neutral-700 block">Contributor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lars Eriksson"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    className="w-full border-2 border-black p-2 font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-neutral-700 block">Contributor Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lars@nordicclimate.org"
                    value={contributorEmail}
                    onChange={(e) => setContributorEmail(e.target.value)}
                    className="w-full border-2 border-black p-2 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-neutral-700 block">Factor Items JSON Array</label>
                <textarea
                  rows={5}
                  value={factorDataJson}
                  onChange={(e) => setFactorDataJson(e.target.value)}
                  className="w-full border-2 border-black p-2 font-mono text-[11px] bg-black text-amber-300 focus:outline-none"
                />
              </div>

              {/* DCO Sign-off Box */}
              <div className="bg-amber-100 border-2 border-black p-4 space-y-2">
                <h4 className="font-black text-black uppercase text-xs">Developer Certificate of Origin (DCO) Version 1.1</h4>
                <p className="text-[10px] text-neutral-700 font-mono leading-tight">
                  By checking the box below, I certify that the emission factor dataset submitted was created in whole or in part by me and I have the right to submit it under open community governance licenses.
                </p>

                <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dcoSigned}
                    onChange={(e) => setDcoSigned(e.target.checked)}
                    className="w-4 h-4 border-2 border-black text-black focus:ring-0"
                  />
                  <span className="text-xs font-black uppercase text-black">
                    I agree to DCO v1.1 and digitally sign this submission.
                  </span>
                </label>

                {contributorName && contributorEmail && (
                  <div className="text-[10px] font-mono font-bold text-neutral-800 pt-1">
                    Signature: Signed-off-by: {contributorName} &lt;{contributorEmail}&gt;
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="bg-neutral-200 hover:bg-neutral-300 text-black font-black text-xs uppercase px-4 py-2 border-2 border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!dcoSigned || submitting}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase px-5 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Factor Dataset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PEER REVIEW MODAL */}
      {reviewingContrib && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center space-x-2 border-b-2 border-black pb-2">
              <UserCheck className="w-5 h-5 text-black" />
              <h3 className="text-base font-black uppercase">Peer Review: {reviewingContrib.datasetName}</h3>
            </div>

            <p className="text-xs text-neutral-800 font-mono">
              Submitted by <strong>{reviewingContrib.contributorName}</strong> ({reviewingContrib.countryRegion}). DCO Signature verified.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-black block">Reviewer Notes / Verification Source:</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="e.g. Cross-referenced against regional grid authority publication."
                className="w-full border-2 border-black p-2 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReviewingContrib(null)}
                className="bg-neutral-200 text-black font-black text-xs uppercase px-3 py-2 border-2 border-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePeerReviewAction(false)}
                disabled={reviewingLoading}
                className="bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase px-3 py-2 border-2 border-black cursor-pointer disabled:opacity-50"
              >
                Reject Pack
              </button>
              <button
                onClick={() => handlePeerReviewAction(true)}
                disabled={reviewingLoading}
                className="bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
              >
                Approve & Merge Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
