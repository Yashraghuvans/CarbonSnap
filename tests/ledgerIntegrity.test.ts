import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { store } from '../src/server/store.ts';

describe('ledger integrity', () => {
  it('does not invent a certificate for an unknown id', () => {
    const cert = store.getPublicVerificationCertificate('not-a-real-certificate');
    assert.equal(cert, null);
  });

  it('does not invent energy totals for an empty reporting period', () => {
    const org = store.createOrganisation({
      name: 'Empty Period Co',
      country: 'United Kingdom',
      industrySector: 'Test',
      employeeCount: 1,
      annualRevenueGbp: 0,
      license: ''
    });
    const [period] = store.getReportingPeriods(org.id);
    const secr = store.getSecrReportData(period.id);
    assert.equal(secr.ukEnergyConsumptionKwh.electricityKwh, 0);
    assert.equal(secr.ukEnergyConsumptionKwh.gasKwh, 0);
    assert.equal(secr.ukEnergyConsumptionKwh.transportKwh, 0);
    assert.equal(secr.ukEnergyConsumptionKwh.totalKwh, 0);
  });
});
