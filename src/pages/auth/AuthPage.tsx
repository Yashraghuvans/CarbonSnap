/**
 * CarbonSnap — AuthPage.tsx
 * FSD: pages layer — auth page
 * Two-column login / register / forgot-password UI backed by Firebase (email + Google).
 */
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onBackToLanding: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onBackToLanding }) => {
  const { signIn, signInWithGoogle, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Register state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [country, setCountry] = useState('GB');
  const [logoUrl, setLogoUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-emerald-400' };
    return { score, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(password);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) return setErrorMessage('Full Name is required.');
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      return setErrorMessage('A valid corporate email address is required.');
    }
    if (!password || password.length < 6) {
      return setErrorMessage('Password must be at least 6 characters long.');
    }
    if (!organisationName.trim()) {
      return setErrorMessage('Organisation Name is required to initialize your tenant workspace.');
    }
    if (!termsAccepted || !privacyAccepted) {
      return setErrorMessage('You must accept the Terms of Service and Privacy Policy to continue.');
    }

    setLoading(true);
    try {
      const { organisation } = await signUp({
        fullName,
        email,
        password,
        organisationName,
        country,
        logoUrl
      });
      setSuccessMessage(
        `Account created! Workspace '${organisation.name}' is ready. Redirecting to your dashboard...`
      );
      // Success is handled by App: the auth state change flips the view to the dashboard.
    } catch (err: any) {
      setErrorMessage(err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Please sign in instead.'
        : err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      return setErrorMessage('Please enter a valid email address.');
    }
    if (!loginPassword) return setErrorMessage('Password is required.');

    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      setSuccessMessage('Welcome back! Redirecting to your workspace...');
    } catch (err: any) {
      setErrorMessage(
        err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found'
          ? 'Invalid email or password. Please check your credentials and try again.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Please wait a moment and try again.'
          : err.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      return setErrorMessage('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await resetPassword(forgotEmail);
      setSuccessMessage('Password reset instructions sent. Check your inbox for the link.');
    } catch (err: any) {
      setErrorMessage(
        err.code === 'auth/user-not-found'
          ? 'No account found for this email address.'
          : err.message || 'Failed to send password reset.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMessage('Signed in with Google! Redirecting to your workspace...');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      setErrorMessage(
        err.code === 'auth/account-exists-with-different-credential'
          ? 'An account already exists with this email. Please sign in with your email and password instead.'
          : err.code === 'auth/unauthorized-domain'
          ? 'This domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.'
          : err.message || 'Google sign-in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white border-2 border-black p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400';

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans antialiased selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          {/* LEFT COLUMN: Brand & Value Proposition */}
          <div className="bg-black text-white p-8 sm:p-10 flex flex-col justify-between gap-8 border-b-4 lg:border-b-0 lg:border-r-4 border-black">
            <div className="space-y-6">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-[10px] font-black uppercase text-amber-300 hover:text-amber-200 cursor-pointer tracking-widest"
              >
                ← Back to CarbonSnap Home
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2">
                  <span className="bg-amber-300 text-black font-black text-xs uppercase px-2.5 py-1 border-2 border-amber-300 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
                    CarbonSnap
                  </span>
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                  Auditor-Ready Carbon Accounting for SMEs.
                </h1>
                <p className="text-xs sm:text-sm font-bold text-neutral-400 leading-relaxed">
                  Sign in to your workspace to track Scope 1, 2 &amp; 3 emissions, generate
                  compliance-ready GHG reports, and stay ahead of CSRD, SECR and SB 253.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: <FileCheck2 className="w-4 h-4 text-amber-300" />,
                    title: 'One-Click GHG Reports',
                    desc: 'Formal, auditor-ready disclosures in PDF — CSRD, SECR, GHG Protocol & SB 253.'
                  },
                  {
                    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                    title: 'SHA-256 Verified Ledger',
                    desc: 'Every activity entry is timestamped and audit-logged for full traceability.'
                  },
                  {
                    icon: <Building2 className="w-4 h-4 text-sky-400" />,
                    title: 'Multi-Workspace Tenant',
                    desc: 'Manage multiple organisations and reporting periods from one secure dashboard.'
                  },
                  {
                    icon: <Lock className="w-4 h-4 text-red-400" />,
                    title: 'Secure by Default',
                    desc: 'Your data is stored in encrypted cloud collections, and every API call is authenticated.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-neutral-900 border-2 border-neutral-700 p-3.5"
                  >
                    <div className="p-1.5 bg-neutral-800 border border-neutral-600 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-wider">{item.title}</h3>
                      <p className="text-[11px] font-semibold text-neutral-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-neutral-700 pt-4 flex items-center justify-between text-[10px] font-bold uppercase text-neutral-500">
              <span>AGPLv3 Open Source</span>
              <span>UK DESNZ 2024 • US EPA • IPCC AR6</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Forms */}
          <div className="p-8 sm:p-10 bg-white flex flex-col justify-center">
            {/* Mode Tabs */}
            <div className="grid grid-cols-2 border-2 border-black mb-8">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-3 font-black text-xs uppercase tracking-widest cursor-pointer border-r-2 border-black transition-colors ${
                  mode === 'login' ? 'bg-black text-amber-300' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-3 font-black text-xs uppercase tracking-widest cursor-pointer transition-colors ${
                  mode === 'register' ? 'bg-black text-amber-300' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Start Your Workspace'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h2>
            <p className="text-[11px] font-bold uppercase text-neutral-500 mb-6">
              {mode === 'login' && 'Sign in to access your carbon accounting dashboard.'}
              {mode === 'register' && 'Create your user profile & organisation tenant in one step.'}
              {mode === 'forgot' && 'Enter your email to receive password recovery instructions.'}
            </p>

            {/* Feedback */}
            {errorMessage && (
              <div className="mb-5 p-3 bg-red-100 border-2 border-red-600 text-red-900 font-bold text-xs uppercase flex items-center space-x-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-5 p-3 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 font-bold text-xs uppercase flex items-center space-x-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign-In (available for both login & register) */}
            {(mode === 'login' || mode === 'register') && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={loading}
                  className="w-full bg-white hover:bg-neutral-50 text-black font-black text-xs uppercase tracking-widest py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2.5 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 border-t-2 border-black" />
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    or
                  </span>
                  <div className="flex-1 border-t-2 border-black" />
                </div>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-3 bg-neutral-50 p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-black uppercase text-black">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[10px] font-black text-neutral-600 hover:underline uppercase cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest py-3.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <p className="text-center text-xs font-bold text-neutral-600 pt-1">
                  New to CarbonSnap?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-black text-black underline hover:text-amber-600 cursor-pointer uppercase"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-3 bg-amber-50/60 p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center space-x-1">
                    <UserIcon className="w-3.5 h-3.5 text-black" />
                    <span>Step 1: Admin User Credentials</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Sam Taylor"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">
                        Corporate Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="sam@acmecorp.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase">
                          <span className="text-neutral-600">Password Strength:</span>
                          <span className="text-black">{passwordStrength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-200 border border-black overflow-hidden flex">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 bg-emerald-50/60 p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-black" />
                    <span>Step 2: Organisation Tenant Profile</span>
                  </span>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">
                      Organisation Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Tech Solutions Ltd"
                      value={organisationName}
                      onChange={(e) => setOrganisationName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">
                        Primary Jurisdiction <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="GB">United Kingdom (DESNZ 2024)</option>
                        <option value="US">United States (US EPA GHG)</option>
                        <option value="DE">Germany (UBA GHG)</option>
                        <option value="FR">France (ADEME Bilans)</option>
                        <option value="EU">European Union (CSRD Standards)</option>
                        <option value="CA">Canada (ECCC)</option>
                        <option value="AU">Australia (NGER Factors)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">
                        Brand Logo URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://acme.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-bold bg-amber-50/70 p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-amber-500 border-2 border-black rounded-none cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-black leading-tight">
                      I agree to the <strong>Terms of Service</strong> and acknowledge the{' '}
                      <strong>AGPLv3 Open Source License</strong>. <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-amber-500 border-2 border-black rounded-none cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-black leading-tight">
                      I have read and agree to the <strong>Privacy Policy</strong> regarding GDPR
                      compliance &amp; data protection. <span className="text-red-600">*</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest py-3.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Initializing Workspace...' : 'Create Account & Launch Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs font-bold text-neutral-600 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-black text-black underline hover:text-amber-600 cursor-pointer uppercase"
                  >
                    Sign In Here
                  </button>
                </p>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-3 bg-amber-50 p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <label className="block text-[10px] font-black uppercase text-black mb-1">
                    Enter your registered account email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest py-3.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending Request...' : 'Send Password Recovery Email'}
                </button>

                <p className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs font-black text-black underline hover:text-amber-600 cursor-pointer uppercase"
                  >
                    ← Return to Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
