#!/usr/bin/env python3
"""
CarbonSnap Carbon Accounting - Emission Factors Update & Maintenance Script
Parses JSON dataset files in /emission-factors and validates/upserts them for carbon calculations.
"""

import os
import json
import sys
import glob

def load_and_validate_datasets(factors_dir):
    json_files = glob.glob(os.path.join(factors_dir, "*.json"))
    if not json_files:
        print(f"[ERROR] No JSON files found in directory: {factors_dir}")
        sys.exit(1)

    total_factors = 0
    validated_datasets = []

    print(f"[*] Found {len(json_files)} dataset file(s) in {factors_dir}:")

    for file_path in json_files:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            dataset_key = data.get("dataset")
            name = data.get("name")
            factors = data.get("factors", [])

            if not dataset_key or not isinstance(factors, list):
                print(f"  [!] {filename}: Invalid structure (missing 'dataset' or 'factors')")
                continue

            # Validate individual factor records
            valid_count = 0
            for idx, factor in enumerate(factors, start=1):
                f_id = factor.get("id")
                f_cat = factor.get("category")
                f_unit = factor.get("unit")
                f_val = factor.get("factorValue")
                f_scope = factor.get("scope")

                if not f_id or not f_cat or not f_unit or f_val is None or f_scope not in [1, 2, 3]:
                    print(f"  [!] {filename} Row {idx}: Invalid factor schema for ID '{f_id}'")
                    continue
                valid_count += 1

            total_factors += valid_count
            validated_datasets.append({
                "dataset": dataset_key,
                "name": name,
                "file": filename,
                "count": valid_count
            })

            print(f"  [+] {filename}: Validated dataset '{dataset_key}' ({name}) - {valid_count} factors loaded.")

        except Exception as e:
            print(f"  [ERROR] Failed to parse {filename}: {e}")

    print("\n[SUMMARY] Emission Factors Maintenance Complete:")
    print(f"  - Datasets Processed: {len(validated_datasets)}")
    print(f"  - Total Active Factors: {total_factors}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, ".."))
    factors_dir = os.path.join(root_dir, "emission-factors")

    print("==========================================================")
    print("CarbonSnap Data Maintenance: Emission Factors Upsert")
    print("==========================================================")
    load_and_validate_datasets(factors_dir)
