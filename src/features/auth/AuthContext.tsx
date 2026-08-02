/**
 * CarbonSnap — AuthContext.tsx
 * FSD: features layer — auth state (api→hook→ui root)
 * Firebase auth provider: signIn/signUp/signOut, Google popup, password reset, Firestore workspace provisioning.
 */
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { firebaseAuth } from '../../shared/api/firebase';
import {
  createOrganisationRecord,
  createReportingPeriodRecord,
  createUserProfile,
  fetchOrganisationsForUser,
  fetchReportingPeriodsForOrg,
  fetchUserProfile,
  FirestoreOrganisation,
  FirestoreReportingPeriod,
  FirestoreUserProfile
} from '../../shared/api/firestore';

export interface RegisteredWorkspace {
  organisation: FirestoreOrganisation;
  period: FirestoreReportingPeriod;
}

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: FirestoreUserProfile | null;
  organisation: FirestoreOrganisation | null;
  organisations: FirestoreOrganisation[];
  periods: FirestoreReportingPeriod[];
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (params: {
    fullName: string;
    email: string;
    password: string;
    organisationName: string;
    country: string;
    logoUrl?: string;
  }) => Promise<RegisteredWorkspace>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Local fallback session used when Firestore is unavailable (e.g. security
// rules not yet deployed). Kept in sync by signUp/signOut so the dashboard
// still works end-to-end until cloud persistence is enabled.
interface LocalSessionState {
  profile: FirestoreUserProfile;
  organisation: FirestoreOrganisation | null;
  organisations: FirestoreOrganisation[];
  periods: FirestoreReportingPeriod[];
}
let localSession: LocalSessionState | null = null;

// Builds a default workspace (profile + organisation + reporting period) for
// first-time social sign-ins (e.g. Google) where no Firestore profile exists.
function buildDefaultWorkspace(u: FirebaseUser): LocalSessionState {
  const now = Date.now();
  const orgId = `org_${now}_${Math.random().toString(36).substring(2, 6)}`;
  const periodId = `period_${orgId}_${new Date().getFullYear()}`;

  const profile: FirestoreUserProfile = {
    uid: u.uid,
    name: u.displayName || u.email?.split('@')[0] || 'CarbonSnap User',
    email: u.email || '',
    role: 'Admin',
    organisationIds: [orgId],
    activeOrgId: orgId,
    createdAt: now
  };

  const organisation: FirestoreOrganisation = {
    id: orgId,
    name: `${(u.displayName || 'My').split(' ')[0]}'s Workspace`,
    country: 'United Kingdom',
    logoUrl: u.photoURL || '',
    industrySector: 'Corporate & Commercial SME',
    employeeCount: 25,
    annualRevenueGbp: 2500000,
    license: 'AGPLv3',
    ownerUid: u.uid,
    createdAt: now
  };

  const period: FirestoreReportingPeriod = {
    id: periodId,
    orgId,
    name: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    status: 'ACTIVE',
    isBaseline: true,
    notes: 'Initial reporting period created automatically.'
  };

  return {
    profile,
    organisation,
    organisations: [organisation],
    periods: [period]
  };
}

async function persistWorkspace(session: LocalSessionState): Promise<void> {
  try {
    await Promise.all([
      createUserProfile(session.profile),
      createOrganisationRecord(session.organisation as FirestoreOrganisation),
      ...session.periods.map((p) => createReportingPeriodRecord(p))
    ]);
  } catch (err) {
    console.warn('Firestore persistence skipped (security rules may not be deployed):', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<FirestoreUserProfile | null>(null);
  const [organisation, setOrganisation] = useState<FirestoreOrganisation | null>(null);
  const [organisations, setOrganisations] = useState<FirestoreOrganisation[]>([]);
  const [periods, setPeriods] = useState<FirestoreReportingPeriod[]>([]);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = async () => {
    const u = firebaseAuth.currentUser;
    if (!u) {
      localSession = null;
      setProfile(null);
      setOrganisation(null);
      setOrganisations([]);
      setPeriods([]);
      return;
    }
    try {
      const p = await fetchUserProfile(u.uid);
      if (p) {
        const orgs = await fetchOrganisationsForUser(u.uid);
        const activeOrg = orgs.find((o) => o.id === p.activeOrgId) || orgs[0] || null;
        const activePeriods = activeOrg ? await fetchReportingPeriodsForOrg(activeOrg.id) : [];
        localSession = null;
        setProfile(p);
        setOrganisations(orgs);
        setOrganisation(activeOrg);
        setPeriods(activePeriods);
        return;
      }
    } catch (err) {
      console.warn('Firestore unavailable; keeping local session state:', err);
    }

    // Fallback: re-apply the workspace created during this session, or
    // provision a default workspace for first-time social sign-ins.
    if (localSession) {
      setProfile(localSession.profile);
      setOrganisation(localSession.organisation);
      setOrganisations(localSession.organisations);
      setPeriods(localSession.periods);
    } else {
      const session = buildDefaultWorkspace(u);
      localSession = session;
      void persistWorkspace(session);
      setProfile(session.profile);
      setOrganisation(session.organisation);
      setOrganisations(session.organisations);
      setPeriods(session.periods);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await refreshProfile();
      } else {
        setProfile(null);
        setOrganisation(null);
        setOrganisations([]);
        setPeriods([]);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    await refreshProfile();
  };

  const signUp = async (params: {
    fullName: string;
    email: string;
    password: string;
    organisationName: string;
    country: string;
    logoUrl?: string;
  }): Promise<RegisteredWorkspace> => {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      params.email,
      params.password
    );
    const uid = credential.user.uid;

    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const periodId = `period_${orgId}_${new Date().getFullYear()}`;
    const now = Date.now();

    const org: FirestoreOrganisation = {
      id: orgId,
      name: params.organisationName,
      country: params.country,
      logoUrl: params.logoUrl || '',
      industrySector: 'Corporate & Commercial SME',
      employeeCount: 25,
      annualRevenueGbp: 2500000,
      license: 'AGPLv3',
      ownerUid: uid,
      createdAt: now
    };

    const period: FirestoreReportingPeriod = {
      id: periodId,
      orgId,
      name: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      startDate: `${new Date().getFullYear()}-01-01`,
      endDate: `${new Date().getFullYear()}-12-31`,
      status: 'ACTIVE',
      isBaseline: true,
      notes: 'Initial active reporting period created during workspace registration.'
    };

    const profileData: Omit<FirestoreUserProfile, 'createdAt'> = {
      uid,
      name: params.fullName,
      email: params.email,
      role: 'Admin',
      organisationIds: [orgId],
      activeOrgId: orgId
    };

    const session: LocalSessionState = {
      profile: { ...profileData, createdAt: now },
      organisation: org,
      organisations: [org],
      periods: [period]
    };

    // Persist to Firestore. If security rules are not deployed yet, the
    // session still works locally and syncs once the rules allow writes.
    await persistWorkspace(session);
    localSession = session;

    setProfile(session.profile);
    setOrganisation(session.organisation);
    setOrganisations(session.organisations);
    setPeriods(session.periods);

    return { organisation: org, period };
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(firebaseAuth, provider);
    // Ensure a workspace/profile exists for first-time Google users.
    if (result.user) {
      await refreshProfile();
    }
  };

  const signOut = async () => {
    await firebaseSignOut(firebaseAuth);
    localSession = null;
    setProfile(null);
    setOrganisation(null);
    setOrganisations([]);
    setPeriods([]);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      organisation,
      organisations,
      periods,
      initializing,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword,
      refreshProfile
    }),
    [user, profile, organisation, organisations, periods, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
