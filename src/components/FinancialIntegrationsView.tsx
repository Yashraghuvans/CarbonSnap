import React, { useEffect, useState } from 'react';
import {
  adjustAndConfirmTransaction,
  confirmFinancialTransaction,
  fetchEmissionFactors,
  fetchIntegrationConnections,
  fetchPendingTransactions,
  syncFinancialTransactions
} from '../lib/api';
import { Language, translations } from '../i18n/translations';
import {
  EmissionFactor,
  IntegrationConnection,
  PendingFinancialTransaction,
  ReportingPeriod,
  UserRole
} from '../types';
import {
  CheckCircle2,
  Database,
  Edit3,
  ExternalLink,
  Layers,
  Link,
  RefreshCw,
  Zap
} from 'lucide-react';

interface FinancialIntegrationsViewProps {
  orgId: string;
  activePeriod: ReportingPeriod | null;
  userRole: UserRole;
  lang: Language;
  onRefreshData?: () => Promise<void>;
}

export const FinancialIntegrationsView: React.FC<FinancialIntegrationsViewProps> = ({
  orgId,
  activePeriod,
  userRole,
  lang,
  onRefreshData
}) => {
  const t = translations[lang];
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [pendingTxns, setPendingTxns] = useState<PendingFinancialTransaction[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adjustingTxn, setAdjustingTxn] = useState<PendingFinancialTransaction | null>(null);

  // Adjustment form state
  const [adjType, setAdjType] = useState('');
  const [adjFactorId, setAdjFactorId] = useState('');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjDesc, setAdjDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [conns, txns, factors] = await Promise.all([
        fetchIntegrationConnections(orgId),
        fetchPendingTransactions(orgId),
        fetchEmissionFactors('UK_2024')
      ]);
      setConnections(conns);
      setPendingTxns(txns);
      setEmissionFactors(factors);
    } catch (e) {
      console.error('Failed to load financial integration data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncFinancialTransactions(orgId);
      await loadData();
    } catch (e) {
      console.error('Failed sync:', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleConfirm = async (txnId: string) => {
    if (!activePeriod) return;
    try {
      await confirmFinancialTransaction(txnId, activePeriod.id);
      await loadData();
      if (onRefreshData) await onRefreshData();
    } catch (e) {
      console.error('Failed confirming transaction:', e);
    }
  };

  const openAdjustModal = (txn: PendingFinancialTransaction) => {
    setAdjustingTxn(txn);
    setAdjType(txn.suggestedActivityType);
    setAdjFactorId(txn.suggestedFactorId);
    setAdjQty(txn.suggestedQuantity);
    setAdjDesc(txn.description);
  };

  const handleSaveAdjust = async () => {
    if (!adjustingTxn || !activePeriod) return;
    try {
      await adjustAndConfirmTransaction(adjustingTxn.id, activePeriod.id, {
        activityType: adjType,
        factorId: adjFactorId,
        quantity: adjQty,
        description: adjDesc
      });
      setAdjustingTxn(null);
      await loadData();
      if (onRefreshData) await onRefreshData();
    } catch (e) {
      console.error('Failed adjusting transaction:', e);
    }
  };

  const isReadOnly = userRole === 'Auditor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
            <Zap className="w-7 h-7 text-black" />
            <span>{t.integrationsTitle}</span>
          </h1>
          <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
            // {t.integrationsSubtitle}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || isReadOnly}
          className="inline-flex items-center space-x-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-black text-xs uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Ledger...' : t.syncLedger}</span>
        </button>
      </div>

      {/* Connection Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { provider: 'Xero', color: 'bg-sky-100' },
          { provider: 'QuickBooks', color: 'bg-emerald-100' },
          { provider: 'Sage', color: 'bg-teal-100' },
          { provider: 'SAP', color: 'bg-purple-100' }
        ].map((item) => {
          const conn = connections.find((c) => c.provider === item.provider);
          const isConnected = !!conn && conn.status === 'CONNECTED';

          return (
            <div
              key={item.provider}
              className={`p-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                isConnected ? item.color : 'bg-neutral-50'
              } flex flex-col justify-between space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-base uppercase text-black tracking-tight">
                  {item.provider}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                    isConnected ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {isConnected ? 'Active' : 'Not Linked'}
                </span>
              </div>
              <div className="text-xs font-bold text-neutral-700">
                {conn ? conn.accountName : 'No OAuth2 connection established.'}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between">
                <span>{conn ? `Synced: ${conn.lastSyncedAt.substring(0, 10)}` : 'Manual OAuth'}</span>
                <Link className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Screen for Auto-Classified Transactions */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>{t.reviewPendingTitle}</span>
            </h2>
            <p className="text-xs font-bold text-neutral-500 uppercase">
              Target Reporting Period: {activePeriod ? activePeriod.name : 'None Selected'}
            </p>
          </div>
          <span className="bg-black text-white text-xs font-black px-3 py-1 border border-black uppercase">
            {pendingTxns.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-black uppercase text-neutral-400">
            Loading ledger transactions...
          </div>
        ) : pendingTxns.length === 0 ? (
          <div className="p-10 text-center bg-neutral-50 border-2 border-dashed border-black space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-black uppercase text-black">{t.noPendingTxns}</p>
            <p className="text-xs font-bold text-neutral-500">
              Click &quot;Sync Financial Ledger&quot; above to import latest invoices from Xero / QuickBooks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-black font-black uppercase text-black">
                  <th className="p-3">Date / Source</th>
                  <th className="p-3">{t.vendorName}</th>
                  <th className="p-3">{t.accountCode}</th>
                  <th className="p-3">{t.amount}</th>
                  <th className="p-3">{t.suggestedMapping}</th>
                  <th className="p-3 text-center">{t.confidence}</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-black">
                {pendingTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-neutral-50 font-medium">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-black">{txn.transactionDate}</div>
                      <span className="text-[10px] font-black uppercase bg-neutral-200 text-black px-1.5 py-0.5 border border-black">
                        {txn.provider}
                      </span>
                    </td>
                    <td className="p-3 font-black text-black">{txn.vendorName}</td>
                    <td className="p-3 font-mono text-neutral-600">{txn.accountCode}</td>
                    <td className="p-3 font-black text-black">£{txn.amountGbp.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="font-bold text-black">{txn.suggestedActivityType}</div>
                      <div className="text-[10px] text-neutral-500">
                        {txn.suggestedQuantity} {txn.suggestedUnit} &bull; Factor: {txn.suggestedFactorId}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
                          txn.confidenceScore >= 95
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {txn.confidenceScore}% Match
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleConfirm(txn.id)}
                        disabled={isReadOnly}
                        className="bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-black text-[10px] uppercase px-3 py-1.5 border border-black cursor-pointer inline-flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.confirmCommit}</span>
                      </button>
                      <button
                        onClick={() => openAdjustModal(txn)}
                        disabled={isReadOnly}
                        className="bg-neutral-100 text-black hover:bg-neutral-200 disabled:opacity-50 font-black text-[10px] uppercase px-2.5 py-1.5 border border-black cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Mapping Modal */}
      {adjustingTxn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-6 space-y-4">
            <div className="border-b-2 border-black pb-3">
              <h3 className="text-lg font-black uppercase text-black">
                Adjust Financial Mapping: {adjustingTxn.vendorName}
              </h3>
              <p className="text-xs font-bold text-neutral-500">
                Amount: £{adjustingTxn.amountGbp.toFixed(2)} GBP &bull; Date: {adjustingTxn.transactionDate}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-black uppercase text-black mb-1">Description</label>
                <input
                  type="text"
                  value={adjDesc}
                  onChange={(e) => setAdjDesc(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-black mb-1">Activity Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold focus:outline-hidden"
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Stationary Fuel">Stationary Fuel (Natural Gas)</option>
                  <option value="Company Vehicles">Company Vehicles (Petrol/Diesel)</option>
                  <option value="Business Travel">Business Travel (Flight/Rail)</option>
                  <option value="Water">Water Supply</option>
                  <option value="Waste">Waste Recycling</option>
                  <option value="Purchased Goods">Purchased Goods & Services</option>
                </select>
              </div>

              <div>
                <label className="block font-black uppercase text-black mb-1">Emission Factor</label>
                <select
                  value={adjFactorId}
                  onChange={(e) => setAdjFactorId(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold focus:outline-hidden"
                >
                  {emissionFactors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.unit}) - {f.factorValue} kg CO₂e
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black uppercase text-black mb-1">Quantity</label>
                <input
                  type="number"
                  value={adjQty}
                  onChange={(e) => setAdjQty(Number(e.target.value))}
                  className="w-full p-2 border-2 border-black font-bold focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t-2 border-black">
              <button
                onClick={() => setAdjustingTxn(null)}
                className="px-4 py-2 bg-neutral-100 text-black border-2 border-black font-black uppercase text-xs cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveAdjust}
                className="px-4 py-2 bg-black text-white border-2 border-black font-black uppercase text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {t.confirmCommit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
