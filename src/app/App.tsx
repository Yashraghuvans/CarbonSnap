/**
 * CarbonSnap — app/App
 * FSD: app layer. The application shell: providers + routing between the
 * four page compositions (landing, auth, share portal, dashboard).
 * Flow: ui → hook → api. Auth state lives here; dashboard data lives in
 * shared hooks (useWorkspace / useInventory) consumed by the pages.
 */
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { AuthPage } from '../pages/auth/AuthPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LandingPage } from '../pages/landing/LandingPage';
import { SharePortalPage } from '../pages/share/SharePortalPage';
import { clearCachedToken } from '../shared/api/client';

type PublicView = 'landing' | 'auth';

function AppShell() {
  const { user, signOut } = useAuth();

  const [publicView, setPublicView] = useState<PublicView>(() =>
    window.location.hash === '#/auth' ? 'auth' : 'landing'
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [activeShareToken, setActiveShareToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    return path.startsWith('/share/') ? path.replace('/share/', '') : null;
  });

  const isAuthenticated = !!user;

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setPublicView('auth');
    window.history.pushState({}, '', '#/auth');
  };

  const backToLanding = () => {
    setPublicView('landing');
    window.history.pushState({}, '', '/');
  };

  const handleSignOut = async () => {
    await signOut();
    clearCachedToken();
    setPublicView('landing');
    window.history.pushState({}, '', '/');
  };

  // 1. Public supplier-share portal (no login required).
  if (activeShareToken) {
    return (
      <SharePortalPage
        token={activeShareToken}
        onClosePortal={() => {
          setActiveShareToken(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // 2. Unauthenticated: public landing page OR login / sign-up page ONLY.
  if (!isAuthenticated) {
    return publicView === 'auth' ? (
      <AuthPage initialMode={authMode} onBackToLanding={backToLanding} />
    ) : (
      <LandingPage onOpenAuth={openAuth} />
    );
  }

  // 3. Authenticated: the full carbon accounting dashboard.
  return <DashboardPage onSignOut={handleSignOut} onOpenShareToken={setActiveShareToken} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
