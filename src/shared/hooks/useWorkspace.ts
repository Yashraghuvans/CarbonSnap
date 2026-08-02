/**
 * CarbonSnap — shared/hooks/useWorkspace
 * FSD: shared layer (hooks)
 * Flow: ui → hook → api. This hook owns tenant-scoped data loading:
 * organisations, reporting periods, emission factor datasets and factors.
 * It mirrors the Firestore tenant into the ledger store on first load.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createOrganisation,
  createReportingPeriod,
  fetchEmissionFactorDatasets,
  fetchEmissionFactors,
  fetchOrganisations,
  fetchReportingPeriods,
  syncTenantWorkspace,
  updateOrganisation,
  updateReportingPeriod
} from '../api/client';
import type {
  EmissionFactor,
  EmissionFactorDataset,
  Organisation,
  ReportingPeriod
} from '../model/types';
import type { FirestoreOrganisation } from '../api/firestore';

interface UseWorkspaceInput {
  isAuthenticated: boolean;
  profileUid?: string;
  /** Organisations from the Firestore tenant registry. */
  cloudOrganisations: FirestoreOrganisation[];
  /** Reporting periods from the Firestore tenant registry. */
  cloudPeriods: ReportingPeriod[];
  /** Organisation the profile prefers (profile.activeOrgId). */
  preferredOrgId?: string;
  /** Fallback organisation from the session (first cloud org). */
  fallbackOrgId?: string;
}

export function useWorkspace(input: UseWorkspaceInput) {
  const {
    isAuthenticated,
    profileUid,
    cloudOrganisations,
    cloudPeriods,
    preferredOrgId,
    fallbackOrgId
  } = input;

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organisation | null>(null);
  const [reportingPeriods, setReportingPeriods] = useState<ReportingPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<ReportingPeriod | null>(null);
  const [datasets, setDatasets] = useState<EmissionFactorDataset[]>([]);
  const [selectedDatasetKey, setSelectedDatasetKey] = useState<string>('UK_2024');
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [booting, setBooting] = useState(false);

  const activeOrgId = activeOrg?.id ?? null;
  const activePeriodId = activePeriod?.id ?? null;

  // Initial load: materialise the Firestore tenant into the ledger store,
  // then fetch organisations and factor datasets.
  useEffect(() => {
    if (!isAuthenticated || !profileUid) return;
    let cancelled = false;

    async function init() {
      setBooting(true);
      try {
        const cloudOrg = cloudOrganisations[0] ?? null;
        if (cloudOrg && cloudPeriods.length > 0) {
          const p = cloudPeriods[0];
          await syncTenantWorkspace({
            orgId: cloudOrg.id,
            orgName: cloudOrg.name,
            country: cloudOrg.country,
            periodId: p.id,
            periodName: p.name,
            startDate: p.startDate,
            endDate: p.endDate
          });
        }

        const [serverOrgs, dsData] = await Promise.all([
          fetchOrganisations(),
          fetchEmissionFactorDatasets()
        ]);
        if (cancelled) return;

        const myOrgIds = new Set(cloudOrganisations.map((o) => o.id));
        const myOrgs = myOrgIds.size > 0 ? serverOrgs.filter((o) => myOrgIds.has(o.id)) : serverOrgs;

        setOrganisations(myOrgs);
        setActiveOrg(
          myOrgs.find((o) => o.id === preferredOrgId) ||
            myOrgs.find((o) => o.id === fallbackOrgId) ||
            myOrgs[0] ||
            null
        );
        setDatasets(dsData);
      } catch (err) {
        console.error('[useWorkspace] initial load failed:', err);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profileUid]);

  // Load reporting periods whenever the active org changes.
  useEffect(() => {
    if (!activeOrg || !isAuthenticated) return;
    let cancelled = false;
    async function loadPeriods() {
      try {
        const periods = await fetchReportingPeriods(activeOrg.id);
        if (cancelled) return;
        setReportingPeriods(periods);
        setActivePeriod(periods.find((p) => p.status === 'ACTIVE') || periods[0] || null);
      } catch (err) {
        console.error('[useWorkspace] failed to load reporting periods:', err);
      }
    }
    loadPeriods();
    return () => {
      cancelled = true;
    };
  }, [activeOrg, isAuthenticated]);

  // Load emission factors whenever the dataset selection changes.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    async function loadFactors() {
      try {
        const factors = await fetchEmissionFactors(selectedDatasetKey);
        if (!cancelled) setEmissionFactors(factors);
      } catch (err) {
        console.error('[useWorkspace] failed to load emission factors:', err);
      }
    }
    loadFactors();
    return () => {
      cancelled = true;
    };
  }, [selectedDatasetKey, isAuthenticated]);

  const selectOrg = useCallback(
    (orgId: string) => {
      const found = organisations.find((o) => o.id === orgId);
      if (found) setActiveOrg(found);
    },
    [organisations]
  );

  const selectPeriod = useCallback(
    (periodId: string) => {
      const found = reportingPeriods.find((p) => p.id === periodId);
      if (found) setActivePeriod(found);
    },
    [reportingPeriods]
  );

  const createOrg = useCallback(
    async (data: Partial<Organisation>) => {
      const newOrg = await createOrganisation(data);
      const updatedOrgs = await fetchOrganisations();
      setOrganisations(updatedOrgs);
      setActiveOrg(newOrg);
      return newOrg;
    },
    []
  );

  const updateOrg = useCallback(
    async (data: Partial<Organisation>) => {
      if (!activeOrg) return;
      const updated = await updateOrganisation(activeOrg.id, data);
      setActiveOrg(updated);
      setOrganisations(organisations.map((o) => (o.id === updated.id ? updated : o)));
      return updated;
    },
    [activeOrg, organisations]
  );

  const createPeriod = useCallback(
    async (data: Partial<ReportingPeriod>) => {
      if (!activeOrg) return;
      const newPeriod = await createReportingPeriod({ ...data, orgId: activeOrg.id });
      const periods = await fetchReportingPeriods(activeOrg.id);
      setReportingPeriods(periods);
      setActivePeriod(newPeriod);
      return newPeriod;
    },
    [activeOrg]
  );

  const updatePeriod = useCallback(
    async (id: string, updates: Partial<ReportingPeriod>) => {
      const updated = await updateReportingPeriod(id, updates);
      setReportingPeriods(reportingPeriods.map((p) => (p.id === updated.id ? updated : p)));
      if (activePeriod?.id === updated.id) setActivePeriod(updated);
      return updated;
    },
    [reportingPeriods, activePeriod]
  );

  return useMemo(
    () => ({
      booting,
      organisations,
      activeOrg,
      activeOrgId,
      reportingPeriods,
      activePeriod,
      activePeriodId,
      datasets,
      selectedDatasetKey,
      setSelectedDatasetKey,
      emissionFactors,
      selectOrg,
      selectPeriod,
      createOrg,
      updateOrg,
      createPeriod,
      updatePeriod
    }),
    [
      booting,
      organisations,
      activeOrg,
      activeOrgId,
      reportingPeriods,
      activePeriod,
      activePeriodId,
      datasets,
      selectedDatasetKey,
      emissionFactors,
      selectOrg,
      selectPeriod,
      createOrg,
      updateOrg,
      createPeriod,
      updatePeriod
    ]
  );
}
