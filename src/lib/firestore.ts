import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { firebaseDb } from './firebase';

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'Admin' | 'Contributor' | 'Auditor';
  organisationIds: string[];
  activeOrgId: string;
  createdAt: number;
}

export interface FirestoreOrganisation {
  id: string;
  name: string;
  country: string;
  logoUrl?: string;
  industrySector: string;
  employeeCount: number;
  annualRevenueGbp: number;
  license: string;
  ownerUid: string;
  createdAt: number;
}

export interface FirestoreReportingPeriod {
  id: string;
  orgId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  isBaseline: boolean;
  notes: string;
}

const usersCol = () => collection(firebaseDb, 'users');
const organisationsCol = () => collection(firebaseDb, 'organisations');
const reportingPeriodsCol = () => collection(firebaseDb, 'reportingPeriods');
const contactInquiriesCol = () => collection(firebaseDb, 'contactInquiries');

// -------------------------------------------------------------
// Users
// -------------------------------------------------------------
export async function createUserProfile(profile: Omit<FirestoreUserProfile, 'createdAt'>): Promise<void> {
  await setDoc(doc(usersCol(), profile.uid), {
    ...profile,
    createdAt: serverTimestamp()
  });
}

export async function fetchUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  const snap = await getDoc(doc(usersCol(), uid));
  return snap.exists() ? (snap.data() as FirestoreUserProfile) : null;
}

// -------------------------------------------------------------
// Organisations & Reporting Periods
// -------------------------------------------------------------
export async function createOrganisationRecord(
  organisation: Omit<FirestoreOrganisation, 'createdAt'>
): Promise<void> {
  await setDoc(doc(organisationsCol(), organisation.id), {
    ...organisation,
    createdAt: serverTimestamp()
  });
}

export async function fetchOrganisationsForUser(uid: string): Promise<FirestoreOrganisation[]> {
  const q = query(organisationsCol(), where('ownerUid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreOrganisation);
}

export async function createReportingPeriodRecord(period: FirestoreReportingPeriod): Promise<void> {
  await setDoc(doc(reportingPeriodsCol(), period.id), period);
}

export async function fetchReportingPeriodsForOrg(orgId: string): Promise<FirestoreReportingPeriod[]> {
  const q = query(reportingPeriodsCol(), where('orgId', '==', orgId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreReportingPeriod);
}

// -------------------------------------------------------------
// Contact Inquiries (public contact form)
// -------------------------------------------------------------
export async function submitContactInquiryToFirestore(data: {
  fullName: string;
  email: string;
  organisationName?: string;
  inquiryType: string;
  message: string;
}): Promise<{ inquiryId: string }> {
  const ref = await addDoc(contactInquiriesCol(), {
    ...data,
    createdAt: serverTimestamp()
  });
  return { inquiryId: ref.id };
}
