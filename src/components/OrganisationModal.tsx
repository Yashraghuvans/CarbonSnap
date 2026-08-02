import { Building2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Organisation } from '../types';

interface OrganisationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Organisation>) => Promise<void>;
  initialOrg?: Organisation | null;
}

export const OrganisationModal: React.FC<OrganisationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialOrg
}) => {
  const [name, setName] = useState(initialOrg?.name || '');
  const [country, setCountry] = useState(initialOrg?.country || 'United Kingdom');
  const [sector, setSector] = useState(initialOrg?.industrySector || 'Technology & Professional Services');
  const [employees, setEmployees] = useState<number>(initialOrg?.employeeCount || 25);
  const [revenue, setRevenue] = useState<number>(initialOrg?.annualRevenueGbp || 2500000);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name,
        country,
        industrySector: sector,
        employeeCount: Number(employees),
        annualRevenueGbp: Number(revenue)
      });
      onClose();
    } catch (err) {
      alert('Failed to save organisation settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-black" />
            <h3 className="text-lg font-black uppercase tracking-tight text-black">
              {initialOrg ? 'Edit Organisation Profile' : 'Create New SME Organisation'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:bg-neutral-200 border border-black cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase">
          <div>
            <label className="block text-black mb-1">Company / Entity Name</label>
            <input
              type="text"
              required
              placeholder="GreenTech Logistics Ltd"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-black mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div>
              <label className="block text-black mb-1">Industry Sector</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full p-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-black mb-1">Employee Headcount (FTE)</label>
              <input
                type="number"
                min="1"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full p-3 bg-white border-2 border-black text-black font-black font-mono focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div>
              <label className="block text-black mb-1">Annual Revenue (£ GBP)</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full p-3 bg-white border-2 border-black text-black font-black font-mono focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
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
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
