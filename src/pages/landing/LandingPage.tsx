/**
 * CarbonSnap — pages/landing/LandingPage
 * FSD: page layer. Composes the public marketing page for unauthenticated
 * visitors: hero content (widgets/landing) + public footer.
 * Flow: ui → hook → api (no auth required for public marketing sections).
 */
import React from 'react';
import { LandingView } from '../../widgets/landing/LandingView';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans antialiased selection:bg-black selection:text-white flex flex-col justify-between">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <LandingView onOpenAuth={onOpenAuth} />
      </main>

      <footer className="bg-white border-t-2 border-black text-black py-6 text-xs font-bold uppercase tracking-wider print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CarbonSnap • AGPLv3 Open Source Carbon Accounting</p>
          <div className="flex items-center space-x-4">
            <span>UK DESNZ 2024 GHG Factors</span>
            <span>•</span>
            <span>US EPA GHG Hub</span>
            <span>•</span>
            <button
              onClick={() => onOpenAuth('login')}
              className="font-black underline hover:text-amber-600 cursor-pointer"
            >
              Sign In Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
