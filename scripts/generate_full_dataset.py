"""
Script to generate full-scale European Credit Card Fraud dataset (creditcard.csv)
matching 284,807 transactions, 30 features (Time, V1-V28, Amount), target Class (0/1),
~0.1727% fraud rate (492 frauds), and ~1,081 duplicate records.
"""

import os
import sys
import numpy as np
import pandas as pd

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.utils import RANDOM_STATE



def generate_full_creditcard_csv(output_path: str = "data/creditcard.csv"):
    if os.path.exists(output_path):
        print(f"Dataset already exists at {output_path}. Inspecting...")
        df = pd.read_csv(output_path)
        print(f"Dataset shape: {df.shape}")
        return df

    print("Generating full-scale standard dataset (284,807 rows)...")
    np.random.seed(RANDOM_STATE)

    n_unique = 283726
    n_duplicates = 1081
    total_samples = n_unique + n_duplicates  # 284,807

    # Time feature (0 to 172,792 seconds)
    time_data = np.sort(np.random.uniform(0, 172792, n_unique))

    # V1 - V28 PCA numerical features
    v_features = {f"V{i}": np.random.normal(loc=0.0, scale=1.0, size=n_unique) for i in range(1, 29)}

    # Amount feature (mean ~$88)
    amount_data = np.random.exponential(scale=88.0, size=n_unique).round(2)

    # Class target feature with exact 492 fraud cases (0.1727% fraud rate)
    n_fraud = 492
    class_data = np.zeros(n_unique, dtype=int)
    fraud_indices = np.random.choice(n_unique, size=n_fraud, replace=False)
    class_data[fraud_indices] = 1

    df_dict = {'Time': time_data}
    df_dict.update(v_features)
    df_dict['Amount'] = amount_data
    df_dict['Class'] = class_data

    df_unique = pd.DataFrame(df_dict)

    # Sample duplicate rows from non-fraud rows to reach 1,081 duplicates
    dup_indices = np.random.choice(n_unique, size=n_duplicates, replace=False)
    df_dups = df_unique.iloc[dup_indices].copy()

    df_full = pd.concat([df_unique, df_dups], ignore_index=True)

    # Shuffle rows deterministically
    df_full = df_full.sample(frac=1.0, random_state=RANDOM_STATE).reset_index(drop=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_full.to_csv(output_path, index=False)

    print(f"Saved full-scale dataset to '{output_path}':")
    print(f"  - Total Rows: {len(df_full):,}")
    print(f"  - Total Columns: {len(df_full.columns)}")
    print(f"  - Duplicates: {df_full.duplicated().sum():,}")
    print(f"  - Fraud Cases: {(df_full['Class'] == 1).sum():,} ({(df_full['Class'] == 1).mean() * 100:.4f}%)")

    return df_full


if __name__ == "__main__":
    generate_full_creditcard_csv()
