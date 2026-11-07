/**
 * CarbonSnap — inventorySafety.ts
 * FSD: shared layer — defensive formatting for inventory views.
 * Summary and activity payloads can omit fields when a request fails
 * or a row is incomplete. These helpers keep the dashboard from throwing.
 */

export function formatTonnes(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export function formatFixed(value: unknown, digits: number): string {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : (0).toFixed(digits);
}

export function activityMatchesQuery(
  activity: {
    description?: string | null;
    activityType?: string | null;
    facilityLocation?: string | null;
    sourceScope?: number | null;
  },
  query: string,
  scope: 'ALL' | 1 | 2 | 3
): boolean {
  const needle = query.trim().toLowerCase();
  const haystack = [activity.description, activity.activityType, activity.facilityLocation]
    .filter((part): part is string => typeof part === 'string')
    .join(' ')
    .toLowerCase();
  const matchesText = needle.length === 0 || haystack.includes(needle);
  const matchesScope = scope === 'ALL' || activity.sourceScope === scope;
  return matchesText && matchesScope;
}
