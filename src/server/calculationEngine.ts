/**
 * CarbonSnap — calculationEngine.ts
 * FSD: server slice — calculation engine
 * Deterministic tCO2e conversion using emission factor datasets with Scope 2 location/market logic.
 */
import fs from 'fs';
import path from 'path';
import { EmissionFactor, EmissionFactorDataset, ScopeType } from '../shared/model/types.js';

export class CalculationEngine {
  private datasets: Map<string, EmissionFactorDataset> = new Map();

  constructor() {
    this.loadDatasets();
  }

  public loadDatasets(): void {
    const factorsDir = path.join(process.cwd(), 'emission-factors');
    if (!fs.existsSync(factorsDir)) {
      console.warn('Emission factors directory does not exist:', factorsDir);
      return;
    }

    const files = fs.readdirSync(factorsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const filePath = path.join(factorsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content) as EmissionFactorDataset;
        if (data.dataset && Array.isArray(data.factors)) {
          this.datasets.set(data.dataset, data);
        }
      } catch (err) {
        console.error(`Failed to load dataset ${file}:`, err);
      }
    }
  }

  public getDatasets(): EmissionFactorDataset[] {
    return Array.from(this.datasets.values());
  }

  public getAllFactors(datasetKey = 'UK_2024'): EmissionFactor[] {
    const dataset = this.datasets.get(datasetKey) || this.datasets.get('UK_2024');
    if (!dataset) return [];
    return dataset.factors;
  }

  public getFactorById(factorId: string): EmissionFactor | undefined {
    for (const dataset of this.datasets.values()) {
      const match = dataset.factors.find(f => f.id === factorId);
      if (match) return match;
    }
    return undefined;
  }

  /**
   * Pure calculation function: quantity * factorValue = co2e_kg
   * Returns calculated co2e in kilograms (kg CO2e)
   */
  public calculateCo2e(quantity: number, factorValue: number): number {
    if (isNaN(quantity) || quantity < 0) return 0;
    if (isNaN(factorValue) || factorValue < 0) return 0;
    
    const rawResult = quantity * factorValue;
    // Round to 4 decimal places for scientific precision without floating point noise
    return Math.round(rawResult * 10000) / 10000;
  }

  /**
   * Evaluates an activity entry payload and returns full snapshot values
   */
  public processActivityEntry(
    quantity: number,
    factorId: string
  ): {
    factor: EmissionFactor;
    co2e_kg: number;
    unit: string;
    sourceScope: ScopeType;
  } {
    const factor = this.getFactorById(factorId);
    if (!factor) {
      throw new Error(`Emission factor '${factorId}' not found in active datasets.`);
    }

    const co2e_kg = this.calculateCo2e(quantity, factor.factorValue);

    return {
      factor,
      co2e_kg,
      unit: factor.unit,
      sourceScope: factor.scope
    };
  }
}

export const calculationEngine = new CalculationEngine();
