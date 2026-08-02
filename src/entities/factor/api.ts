/**
 * CarbonSnap — entities/factor/api
 * FSD: entity layer (emission factor domain) — API slice.
 * Flow: ui → hook → api. Exposes the emission factor API surface:
 * datasets, factor lookups, dataset versions, pipeline refresh and
 * community factor-pack contributions.
 */
export {
  fetchEmissionFactorDatasets,
  fetchEmissionFactors,
  fetchDatasetVersions,
  triggerPipelineUpdate,
  fetchCommunityFactorPacks,
  submitCommunityFactorPack,
  validateFactorPack
} from '../../shared/api/client';
