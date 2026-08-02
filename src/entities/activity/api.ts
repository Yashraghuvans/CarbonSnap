/**
 * CarbonSnap — entities/activity/api
 * FSD: entity layer (activity domain) — API slice.
 * Flow: ui → hook → api. Exposes the ledger API surface: activities,
 * the emissions summary, audit logs and CSV bulk import.
 */
export {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchSummary,
  fetchAuditLogs,
  importActivitiesCsv
} from '../../shared/api/client';
