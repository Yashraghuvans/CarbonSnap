/**
 * CarbonSnap — shared/hooks/useInventory
 * FSD: shared layer (hooks)
 * Flow: ui → hook → api. Owns the carbon inventory data for the active
 * org/period: activities, emissions summary, audit logs, and their CRUD
 * handlers. Every mutation refreshes the inventory afterwards.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  fetchAuditLogs,
  fetchSummary,
  updateActivity
} from '../api/client';
import type { ActivityEntry, ActivityFormData, AuditLog, EmissionsSummary } from '../model/types';

interface UseInventoryInput {
  isAuthenticated: boolean;
  activeOrgId: string | null;
  activePeriodId: string | null;
}

export function useInventory(input: UseInventoryInput) {
  const { isAuthenticated, activeOrgId, activePeriodId } = input;

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [summary, setSummary] = useState<EmissionsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!activeOrgId || !activePeriodId || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [acts, sum, logs] = await Promise.all([
        fetchActivities(activeOrgId, activePeriodId),
        fetchSummary(activeOrgId, activePeriodId),
        fetchAuditLogs()
      ]);
      setActivities(acts);
      setSummary(sum);
      setAuditLogs(logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load the carbon inventory.';
      setError(message);
      console.error('[useInventory] failed to refresh inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, activePeriodId, isAuthenticated]);

  // Reload whenever the active org or period changes.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addActivity = useCallback(
    async (formData: ActivityFormData) => {
      if (!activeOrgId) return;
      await createActivity(activeOrgId, formData);
      await refresh();
    },
    [activeOrgId, refresh]
  );

  const updateActivityById = useCallback(
    async (id: string, updates: Partial<ActivityEntry>) => {
      await updateActivity(id, updates);
      await refresh();
    },
    [refresh]
  );

  const deleteActivityById = useCallback(
    async (id: string) => {
      await deleteActivity(id);
      await refresh();
    },
    [refresh]
  );

  return useMemo(
    () => ({
      loading,
      error,
      activities,
      summary,
      auditLogs,
      refresh,
      addActivity,
      updateActivity: updateActivityById,
      deleteActivity: deleteActivityById
    }),
    [loading, error, activities, summary, auditLogs, refresh, addActivity, updateActivityById, deleteActivityById]
  );
}
