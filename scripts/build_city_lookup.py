"""
City Lookup Generator.
Extracts unique (city, state) combinations with lat, long, city_pop from fraud dataset
and saves to backend/data/city_lookup.json.
"""

import os
import json
import logging
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(message)s")
logger = logging.getLogger(__name__)


def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(root_dir, "data")
    backend_data_dir = os.path.join(root_dir, "backend", "data")
    os.makedirs(backend_data_dir, exist_ok=True)

    test_path = os.path.join(data_dir, "fraudTest.csv")
    train_path = os.path.join(data_dir, "fraudTrain.csv")

    dfs = []
    if os.path.exists(test_path):
        logger.info("Reading %s...", test_path)
        dfs.append(pd.read_csv(test_path, usecols=['city', 'state', 'lat', 'long', 'city_pop']))

    if os.path.exists(train_path):
        logger.info("Reading %s...", train_path)
        dfs.append(pd.read_csv(train_path, usecols=['city', 'state', 'lat', 'long', 'city_pop']))

    if not dfs:
        logger.error("No dataset found in data/!")
        return

    df = pd.concat(dfs, ignore_index=True)
    logger.info("Total input rows: %d", len(df))

    # Clean strings
    df['city'] = df['city'].astype(str).str.strip()
    df['state'] = df['state'].astype(str).str.strip()

    # Drop duplicates by (city, state), keeping first occurrence
    unique_cities = df.drop_duplicates(subset=['city', 'state']).copy()
    logger.info("Unique (city, state) pairs found: %d", len(unique_cities))

    # Construct lookup dictionary
    # Key format: "City, State" (e.g., "Columbia, SC")
    # Also support lowercase lookup key for case-insensitive matching
    lookup = {}
    for _, row in unique_cities.iterrows():
        c_name = row['city']
        s_code = row['state']
        key = f"{c_name}, {s_code}".strip()
        key_lower = key.lower()

        entry = {
            "city": c_name,
            "state": s_code,
            "lat": float(row['lat']),
            "long": float(row['long']),
            "city_pop": int(row['city_pop']),
        }

        # Store with both exact and lowercase keys for flexible lookup
        lookup[key] = entry
        lookup[key_lower] = entry
        lookup[c_name.lower()] = entry  # Fallback by city name alone if state not given

    output_path = os.path.join(backend_data_dir, "city_lookup.json")
    with open(output_path, "w") as f:
        json.dump(lookup, f, indent=2)

    logger.info("Saved city lookup table with %d unique cities to %s", len(unique_cities), output_path)
    print(f"SUCCESS: {len(unique_cities)} unique cities saved to {output_path}")


if __name__ == "__main__":
    main()
