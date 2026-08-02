# CarbonSnap Emission Factors Library

This directory contains localized conversion factor packs used by CarbonSnap's calculation engine to convert operational activity measurements into carbon dioxide equivalent (`tCO2e`) emissions.

---

## Datasets included

| File | Source |
| :--- | :--- |
| `UK_2024.json` | UK Government Department for Energy Security and Net Zero (DESNZ) / DEFRA 2024 conversion factors |
| `US_EPA_2024.json` | US Environmental Protection Agency — Center for Corporate Climate Leadership GHG Emission Factors Hub (2024) |
| `GHG_GLOBAL_2024.json` | IPCC AR6 Global Warming Potentials & IEA country grid emission factors |

Factor `id`s follow the convention `<country>_<category>_<variant>_<year>` — e.g. `uk_elec_grid_2024` (grid average), `uk_elec_green_2024` (market-based), `uk_gas_2024`, `uk_diesel_2024`.

---

## Factor pack schema

New packs (e.g. `CA_2024.json` or `FR_2024.json`) must adhere to this schema:

```json
{
  "metadata": {
    "countryCode": "UK",
    "countryName": "United Kingdom",
    "factorYear": 2024,
    "sourceAuthority": "UK DESNZ / DEFRA",
    "version": "1.0",
    "publicationDate": "2024-06-01"
  },
  "factors": [
    {
      "id": "uk_elec_grid_2024",
      "scope": 2,
      "category": "Electricity",
      "name": "Electricity - UK Grid Generation",
      "unit": "kWh",
      "co2e_per_unit": 0.20705,
      "gases": {
        "co2": 0.20488,
        "ch4": 0.00072,
        "n2o": 0.00145
      }
    },
    {
      "id": "uk_gas_2024",
      "scope": 1,
      "category": "Stationary Combustion",
      "name": "Natural Gas (Gross CV)",
      "unit": "kWh",
      "co2e_per_unit": 0.18293,
      "gases": {
        "co2": 0.18254,
        "ch4": 0.00025,
        "n2o": 0.00014
      }
    }
  ]
}
```

**Rules:**

* `id` must be unique within the file and follow the naming convention above.
* `scope` must be `1`, `2` or `3`.
* `co2e_per_unit` must equal the sum of the per-gas contributions (in `kg CO2e` per unit).
* `unit` must match one of the ledger's supported units (`kWh`, `litres`, `km`, `t-km`, `passenger-km`, …).

---

## Validation & sync

```bash
# Validate a new factor pack
python scripts/update_emission_factors.py --validate emission-factors/UK_2024.json

# Sync factors into the local store
python scripts/update_emission_factors.py --sync
```

Community-contributed packs can also be submitted through the API (`POST /api/v1/emission-factors/community-submit`) for governance review.
