/**
 * CarbonSnap — BulkImportModal.tsx
 * FSD: features layer — CSV bulk import
 * CSV upload flow: template download, column mapping, row validation and import preview.
 */
import React, { useState } from 'react';
import { Upload, X, AlertTriangle, CheckCircle2, Download, FileText, RefreshCw, ShieldAlert } from 'lucide-react';
import { importActivitiesCsv } from '../../shared/api/client';
import { Language, translations } from '../../shared/i18n/translations';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodId: string;
  periodName: string;
  orgId: string;
  lang: Language;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  periodId,
  periodName,
  orgId,
  lang,
  onSuccess
}) => {
  const t = translations[lang];
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Array<{ row: number; message: string }> | null>(null);
  const [importResult, setImportResult] = useState<{ count: number; totalCo2e: number } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || '');
      setErrors(null);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleCsv = `activity_type,quantity,unit,description,date,facilityLocation,notes
Electricity,45000,kWh,London HQ Main Office Power,2024-06-15,London HQ,Quarterly bill
Natural Gas,28000,kWh,HQ Boiler Gas Heating,2024-11-20,London HQ,Winter heating
Company Vehicles,1500,litres,Delivery Van Diesel Fuel,2024-08-10,Fleet Depot,Fuel card log
Business Travel,2400,pkm,Frankfurt Client Flight,2024-09-05,Frankfurt Route,Short haul flight
Waste,2.5,tonnes,Shredded Paper Recycling,2024-10-01,HQ Compound,Recycling cert
Water,350,m3,Mains Water Supply,2024-07-30,London HQ,Thames Water meter
Purchased Goods,12500,GBP_spend,IT Hardware Refresh,2024-05-18,IT Dept,10 laptops`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CarbonSnap_Bulk_Import_Sample_${periodId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setLoading(true);
    setErrors(null);
    setImportResult(null);

    try {
      const res = await importActivitiesCsv(periodId, orgId, csvText);
      if (res.success) {
        setImportResult({
          count: res.importedCount || 0,
          totalCo2e: Math.round(((res.totalCo2eKg || 0) / 1000) * 1000) / 1000
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else if (res.errors) {
        setErrors(res.errors);
      }
    } catch (err: any) {
      setErrors([{ row: 0, message: err.message || 'Import request failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-black" />
              <h2 className="text-xl font-black uppercase tracking-tight text-black">
                {t.bulkImportTitle}
              </h2>
            </div>
            <p className="text-xs font-bold uppercase text-neutral-600 mt-1">
              {t.bulkImportSubtitle} &bull; <span className="text-black">{periodName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-black hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Safety Guarantee Banner */}
        <div className="bg-amber-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-black shrink-0 mt-0.5" />
          <p className="text-xs font-bold uppercase leading-relaxed text-black">
            {t.transactionGuarantee}
          </p>
        </div>

        {/* Success Alert */}
        {importResult && (
          <div className="bg-emerald-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-black shrink-0" />
            <div>
              <h4 className="text-sm font-black uppercase text-black">{t.importSuccess}</h4>
              <p className="text-xs font-bold uppercase text-neutral-800 mt-0.5">
                {t.importedCountMsg.replace('{count}', String(importResult.count)).replace('{co2e}', String(importResult.totalCo2e))}
              </p>
            </div>
          </div>
        )}

        {/* Validation Errors Rollback Display */}
        {errors && errors.length > 0 && (
          <div className="bg-red-100 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center space-x-2 border-b-2 border-black pb-2">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
              <h4 className="text-sm font-black uppercase text-red-900">
                {t.importErrorTitle} ({errors.length} {errors.length === 1 ? 'Error' : 'Errors'})
              </h4>
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {errors.map((err, idx) => (
                <li key={idx} className="text-xs font-mono font-bold text-red-950 bg-white border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {err.row > 0 ? t.rowError.replace('{row}', String(err.row)).replace('{message}', err.message) : err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Picker & Sample Download */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <label className="flex-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 border-2 border-dashed border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Upload className="w-6 h-6 text-black mx-auto mb-1" />
              <span className="text-xs font-black uppercase text-black block">{t.dropCsvFile}</span>
              <span className="text-[10px] font-bold uppercase text-neutral-500">.csv files only</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center justify-center space-x-2 px-4 py-4 bg-white border-2 border-black text-xs font-black uppercase text-black hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-black" />
              <span>{t.downloadSampleCsv}</span>
            </button>
          </div>

          {/* Paste Raw CSV Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase text-black">
              {t.pasteCsvText}
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setErrors(null);
                setImportResult(null);
              }}
              placeholder={`activity_type,quantity,unit,description,date,facilityLocation,notes
Electricity,48000,kWh,London Office Grid Power,2024-06-30,London HQ,Octopus bill
Waste,1.8,tonnes,Shredded Cardboard Recycling,2024-09-30,HQ Compound,Recycling cert
Water,450,m3,Mains Water Supply,2024-10-01,London HQ,Thames Water`}
              className="w-full p-3 font-mono text-xs font-bold bg-neutral-50 border-2 border-black focus:outline-none focus:bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              disabled={loading || !csvText.trim()}
              className="px-6 py-2.5 text-xs font-black uppercase bg-black text-white border-2 border-black hover:bg-neutral-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Validating Batch...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-white" />
                  <span>{t.validateAndImport}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
