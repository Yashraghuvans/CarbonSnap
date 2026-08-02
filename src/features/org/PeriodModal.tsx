/**
 * CarbonSnap — PeriodModal.tsx
 * FSD: features layer — reporting period modal
 * Create reporting periods (dates, baseline flag, status) for the active org.
 */
import { Calendar, X } from 'lucide-react';
import React, { useState } from 'react';
import { ReportingPeriod } from '../../shared/model/types';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ReportingPeriod>) => Promise<void>;
  orgId: string;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orgId
}) => {
  const [name, setName] = useState('FY 2025-2026');
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'CLOSED'>('ACTIVE');
  const [isBaseline, setIsBaseline] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        orgId,
        name,
        startDate,
        endDate,
        status,
        isBaseline,
        notes
      });
      onClose();
    } catch (err) {
      alert('Failed to create reporting period');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-black" />
            <h3 className="text-lg font-black uppercase tracking-tight text-black">Add Carbon Reporting Period</h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:bg-neutral-200 border border-black cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase">
          <div>
            <label className="block text-black mb-1">Period Name</label>
            <input
              type="text"
              required
              placeholder="FY 2025-2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-black mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
              />
            </div>
            <div>
              <label className="block text-black mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-black mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE (Accepting Entries)</option>
              <option value="DRAFT">DRAFT (Under Setup)</option>
              <option value="CLOSED">CLOSED (Audits Locked)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="is-baseline-check"
              type="checkbox"
              checked={isBaseline}
              onChange={(e) => setIsBaseline(e.target.checked)}
              className="w-4 h-4 text-black border-2 border-black accent-black focus:ring-0 cursor-pointer"
            />
            <label htmlFor="is-baseline-check" className="font-black text-black cursor-pointer">
              Set as Baseline Year (Net-Zero Anchor)
            </label>
          </div>

          <div>
            <label className="block text-black mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="SECR Annual Audit Year"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-black uppercase text-black hover:bg-neutral-200 border-2 border-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-black uppercase bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
