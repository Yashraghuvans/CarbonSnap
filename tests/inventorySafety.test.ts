import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { activityMatchesQuery, formatTonnes } from '../src/shared/model/inventorySafety.ts';

describe('inventory safety', () => {
  it('formats a real total and does not require a missing tonne field', () => {
    assert.equal(formatTonnes(12.5), '12.50');
    assert.equal(formatTonnes(undefined), '0.00');
  });

  it('matches activity search when description is missing', () => {
    const row = { activityType: 'Electricity', facilityLocation: null, sourceScope: 2 as const };
    assert.equal(activityMatchesQuery(row, 'elec', 'ALL'), true);
    assert.equal(activityMatchesQuery(row, 'diesel', 'ALL'), false);
    assert.equal(activityMatchesQuery(row, '', 1), false);
  });
});
