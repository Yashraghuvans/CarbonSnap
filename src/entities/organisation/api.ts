/**
 * CarbonSnap — entities/organisation/api
 * FSD: entity layer (organisation domain) — API slice.
 * Flow: ui → hook → api. Exposes the tenant-scoped API surface for
 * organisations, reporting periods, comparisons and user workspace ops.
 */
export {
  fetchOrganisations,
  createOrganisation,
  updateOrganisation,
  fetchReportingPeriods,
  createReportingPeriod,
  updateReportingPeriod,
  fetchPeriodComparison,
  fetchUser,
  updateUserRole,
  switchUserWorkspace,
  syncTenantWorkspace
} from '../../shared/api/client';
