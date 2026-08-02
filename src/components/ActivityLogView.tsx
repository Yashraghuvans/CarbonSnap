import { Calculator, Edit2, Filter, Fuel, Plus, Search, Trash2, Upload, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { ActivityEntry, ActivityFormData, EmissionFactor, Organisation, ReportingPeriod, UserRole } from '../types';
import { BulkImportModal } from './BulkImportModal';
import { Language, translations } from '../i18n/translations';

interface ActivityLogViewProps {
  activities: ActivityEntry[];
  emissionFactors: EmissionFactor[];
  activeOrg: Organisation | null;
  activePeriod: ReportingPeriod | null;
  userRole?: UserRole;
  lang?: Language;
  onAddActivity: (data: ActivityFormData) => Promise<void>;
  onUpdateActivity: (id: string, updates: Partial<ActivityEntry>) => Promise<void>;
  onDeleteActivity: (id: string) => Promise<void>;
  onRefreshData?: () => Promise<void>;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  activities,
  emissionFactors,
  activeOrg,
  activePeriod,
  userRole = 'Admin',
  lang = 'en',
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onRefreshData
}) => {
  const t = translations[lang];
  const isReadOnly = userRole === 'Auditor';
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  // Form State
  const [selectedFactorId, setSelectedFactorId] = useState<string>(
    emissionFactors.length > 0 ? emissionFactors[0].id : 'uk_elec_grid_2024'
  );
  const [activityType, setActivityType] = useState<string>('Electricity');
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [location, setLocation] = useState<string>('Main HQ Office');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Table Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 1 | 2 | 3>('ALL');

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Active selected emission factor object
  const activeFactor = emissionFactors.find(f => f.id === selectedFactorId) || emissionFactors[0];

  // Calculated CO2e live preview
  const numericQty = typeof quantity === 'number' ? quantity : 0;
  const liveCo2eKg = activeFactor ? Math.round(numericQty * activeFactor.factorValue * 10000) / 10000 : 0;
  const liveCo2eTonnes = liveCo2eKg / 1000;

  // Handle factor change with auto-populated defaults
  const handleFactorSelect = (factorId: string) => {
    setSelectedFactorId(factorId);
    const f = emissionFactors.find(item => item.id === factorId);
    if (f) {
      setActivityType(f.category);
      if (!description) {
        setDescription(`${f.name} activity record`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) {
      setFormError('Please select or create an active reporting period first.');
      return;
    }
    if (!numericQty || numericQty <= 0) {
      setFormError('Please enter a valid positive quantity.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a descriptive activity name.');
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onAddActivity({
        periodId: activePeriod.id,
        activityType,
        description,
        quantity: numericQty,
        factorId: selectedFactorId,
        date,
        facilityLocation: location,
        notes
      });

      // Reset form
      setDescription('');
      setQuantity('');
      setNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to record activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    try {
      await onUpdateActivity(editingEntry.id, {
        description: editingEntry.description,
        quantity: editingEntry.quantity,
        date: editingEntry.date,
        facilityLocation: editingEntry.facilityLocation,
        notes: editingEntry.notes
      });
      setEditingEntry(null);
    } catch (err) {
      alert('Failed to update activity entry');
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(a => {
    const matchesSearch =
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.facilityLocation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'ALL' || a.sourceScope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Auditor Notice Banner */}
      {isReadOnly && (
        <div className="bg-amber-100 border-2 border-black p-4 font-black text-xs uppercase text-amber-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {t.auditorNotice}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-black" />
            <span>{t.activities}</span>
          </h1>
          <p className="text-xs font-bold uppercase text-neutral-500 mt-1">
            // Log SME energy, fuel, travel, waste, and water data with plain-language inputs and instant conversion snapshots.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="bulk-import-btn"
            onClick={() => setIsBulkImportOpen(true)}
            disabled={isReadOnly}
            className="inline-flex items-center space-x-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-40 font-black text-xs uppercase tracking-wider px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>{t.importCsvData}</span>
          </button>
          <div className="text-xs font-black uppercase tracking-wider bg-neutral-100 text-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Period: {activePeriod?.name}
          </div>
        </div>
      </div>

      {/* MANUAL ENTRY FORM CARD */}
      <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center space-x-2 text-lg font-black uppercase tracking-tight">
            <Plus className="w-5 h-5 text-black" />
            <span>Record Activity Transaction</span>
          </div>
          <span className="text-xs font-bold uppercase text-neutral-500">// MANUAL ENTRY FORM</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-4 bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black">
              ERR: {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Emission Category / Factor select */}
            <div>
              <label htmlFor="factor-select" className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Activity Type & Factor
              </label>
              <select
                id="factor-select"
                value={selectedFactorId}
                onChange={(e) => handleFactorSelect(e.target.value)}
                className="w-full bg-white border-2 border-black text-black font-bold text-xs p-3.5 focus:outline-none focus:bg-neutral-50 uppercase appearance-none cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {emissionFactors.map((f) => (
                  <option key={f.id} value={f.id} className="bg-white text-black font-bold">
                    [{f.category}] {f.name} (Scope {f.scope})
                  </option>
                ))}
              </select>
              {activeFactor && (
                <p className="text-[11px] font-bold uppercase text-neutral-500 mt-2">
                  Scope {activeFactor.scope} • Unit: {activeFactor.unit} • Factor: {activeFactor.factorValue} kg CO₂e
                </p>
              )}
            </div>

            {/* 2. Description */}
            <div>
              <label htmlFor="act-desc-input" className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Description
              </label>
              <input
                id="act-desc-input"
                type="text"
                placeholder="Electricity Bill - Main Office"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border-2 border-black text-black font-bold text-xs p-3.5 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                required
              />
            </div>

            {/* 3. Quantity */}
            <div>
              <label htmlFor="act-qty-input" className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Quantity ({activeFactor?.unit || 'units'})
              </label>
              <div className="relative">
                <input
                  id="act-qty-input"
                  type="number"
                  step="any"
                  placeholder="450.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border-2 border-black text-black font-black text-xs p-3.5 pr-16 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
                  required
                />
                <span className="absolute right-3 top-3.5 text-xs font-black uppercase text-black pointer-events-none">
                  {activeFactor?.unit}
                </span>
              </div>
            </div>

            {/* 4. Date */}
            <div>
              <label htmlFor="act-date-input" className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Transaction Date
              </label>
              <input
                id="act-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border-2 border-black text-black font-bold text-xs p-3.5 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
              />
            </div>

            {/* 5. Location */}
            <div>
              <label htmlFor="act-loc-input" className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Facility / Location
              </label>
              <input
                id="act-loc-input"
                type="text"
                placeholder="HQ Building / Fleet"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border-2 border-black text-black font-bold text-xs p-3.5 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            {/* 6. Notes */}
            <div>
              <label htmlFor="act-notes-input" className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Notes & Reference
              </label>
              <input
                id="act-notes-input"
                type="text"
                placeholder="Invoice #99281"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border-2 border-black text-black font-bold text-xs p-3.5 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          {/* LIVE COMPUTATION PREVIEW WIDGET */}
          <div className="bg-neutral-50 border-2 border-black p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black text-black uppercase tracking-widest block mb-1">
                // REAL-TIME COMPUTED EMISSION SNAPSHOT
              </span>
              <p className="text-xs font-bold text-neutral-600 font-mono">
                Formula: {numericQty || 0} {activeFactor?.unit} × {activeFactor?.factorValue} kg CO₂e/{activeFactor?.unit}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-2xl font-black text-black font-mono">
                  {liveCo2eKg.toLocaleString()} <span className="text-xs font-bold">kg CO₂e</span>
                </div>
                <div className="text-xs font-bold uppercase text-neutral-600">
                  = {liveCo2eTonnes.toFixed(4)} t CO₂e
                </div>
              </div>

              <button
                id="submit-activity-btn"
                type="submit"
                disabled={submitting || isReadOnly}
                className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest px-8 py-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {submitting ? 'RECORDING...' : 'Record Transaction +'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ACTIVITY RECORDS LOG TABLE */}
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        {/* Table Header & Search Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-black uppercase tracking-tight text-black">Recent Activity Transactions</h3>
            <span className="px-2.5 py-0.5 bg-black text-white font-black text-xs uppercase">
              {filteredActivities.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-black" />
              <input
                id="activity-search-input"
                type="text"
                placeholder="SEARCH RECORDS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs font-bold bg-white border-2 border-black uppercase focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            {/* Scope Filter */}
            <div className="flex items-center space-x-1.5 bg-white border-2 border-black px-3 py-2 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Filter className="w-3.5 h-3.5 text-black" />
              <select
                id="activity-scope-filter"
                value={scopeFilter}
                onChange={(e) =>
                  setScopeFilter(e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as 1 | 2 | 3))
                }
                className="bg-transparent focus:outline-none cursor-pointer font-bold uppercase"
              >
                <option value="ALL">All Scopes</option>
                <option value="1">Scope 1 (Direct)</option>
                <option value="2">Scope 2 (Power)</option>
                <option value="3">Scope 3 (Value Chain)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black text-xs font-black text-black uppercase tracking-wider bg-neutral-100">
                <th className="py-3 px-4 border-r-2 border-black">Date</th>
                <th className="py-3 px-4 border-r-2 border-black">Activity</th>
                <th className="py-3 px-4 border-r-2 border-black">Scope</th>
                <th className="py-3 px-4 border-r-2 border-black text-right">Quantity</th>
                <th className="py-3 px-4 border-r-2 border-black text-right">Impact (kg CO₂e)</th>
                <th className="py-3 px-4 border-r-2 border-black text-right">Impact (t CO₂e)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-bold">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 uppercase font-black">
                    No activity records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((entry, idx) => {
                  return (
                    <tr key={entry.id} className={idx % 2 === 1 ? 'bg-neutral-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-r-2 border-black font-mono font-bold text-black">{entry.date}</td>
                      <td className="py-3 px-4 border-r-2 border-black">
                        <div className="font-black text-black uppercase">{entry.description}</div>
                        <div className="text-[10px] font-bold uppercase text-neutral-500">
                          {entry.factorName} • {entry.facilityLocation || 'HQ'}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-r-2 border-black">
                        <span className="inline-block px-2 py-0.5 bg-black text-white font-black text-[10px] uppercase">
                          Scope {entry.sourceScope}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r-2 border-black text-right font-mono font-bold text-black">
                        {entry.quantity.toLocaleString()} {entry.unit}
                      </td>
                      <td className="py-3 px-4 border-r-2 border-black text-right font-mono font-black text-black">
                        {entry.co2e_kg.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 border-r-2 border-black text-right font-mono font-black text-black">
                        {(entry.co2e_kg / 1000).toFixed(3)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            id={`edit-act-${entry.id}`}
                            onClick={() => setEditingEntry(entry)}
                            className="p-1 hover:bg-black hover:text-white transition-colors border border-black cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`del-act-${entry.id}`}
                            onClick={() => onDeleteActivity(entry.id)}
                            className="p-1 hover:bg-black hover:text-white transition-colors border border-black cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans">
          <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full space-y-4">
            <h3 className="text-lg font-black uppercase tracking-tight text-black border-b-2 border-black pb-2">
              Edit Activity Record
            </h3>
            <div className="space-y-3 text-xs font-bold uppercase">
              <div>
                <label className="block text-black mb-1">Description</label>
                <input
                  type="text"
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  className="w-full p-2.5 border-2 border-black font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-black mb-1">
                  Quantity ({editingEntry.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingEntry.quantity}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, quantity: Number(e.target.value) })
                  }
                  className="w-full p-2.5 border-2 border-black font-black font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-black mb-1">Date</label>
                <input
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  className="w-full p-2.5 border-2 border-black font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t-2 border-black">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-xs font-black uppercase text-black hover:bg-neutral-200 border-2 border-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 text-xs font-black uppercase bg-black text-white border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {activePeriod && activeOrg && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          periodId={activePeriod.id}
          periodName={activePeriod.name}
          orgId={activeOrg.id}
          lang={lang}
          onSuccess={async () => {
            setIsBulkImportOpen(false);
            if (onRefreshData) {
              await onRefreshData();
            }
          }}
        />
      )}
    </div>
  );
};
