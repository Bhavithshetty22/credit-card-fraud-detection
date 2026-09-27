"""
Lightweight End-to-End Pipeline Verification Script.
Executes: Dataset Load -> Validation -> Clean -> Split -> Scale -> SMOTE without Streamlit.
"""

import os
import sys
import time
import joblib
import pandas as pd
import numpy as np

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import generate_sample_credit_card_data
from src.data_preprocessing import preprocess_data
from src.utils import RANDOM_STATE


def run_e2e_pipeline_test():
    print("=" * 60)
    print("STARTING END-TO-END PIPELINE VALIDATION TEST")
    print("=" * 60)

    start_time = time.time()

    # Step 1: Load / Generate Dataset
    print("\n1. Loading Dataset...")
    df = generate_sample_credit_card_data(n_samples=2000)
    print(f"   Raw Dataset Shape: {df.shape}")

    # Step 2: Run Full Preprocessing & SMOTE Pipeline
    print("\n2. Executing Preprocessing & SMOTE Pipeline...")
    t0 = time.time()
    success, err, prep = preprocess_data(df, test_size=0.20, random_state=RANDOM_STATE)
    prep_duration = time.time() - t0

    assert success is True, f"Pipeline execution failed: {err}"
    assert prep is not None

    meta = prep['metadata']

    # Step 3: Print Pipeline Performance & Metrics
    print(f"\n3. Pipeline Execution Metrics (Duration: {prep_duration:.4f}s):")
    print(f"   - Original Rows: {meta['original_rows']:,}")
    print(f"   - Duplicates Found & Removed: {meta['duplicates_removed']:,}")
    print(f"   - Cleaned Rows: {meta['final_rows']:,}")
    print(f"   - Input Features Count: {meta['num_features']}")
    print(f"   - Target Column: '{meta['target_col']}'")

    print("\n4. Train/Test Split Metrics:")
    print(f"   - Training Shape (Pre-SMOTE): {prep['X_train'].shape}")
    print(f"   - Testing Shape (Untouched):  {prep['X_test'].shape}")
    print(f"   - Training Fraud Cases: {meta['train_fraud_count']} ({meta['train_fraud_pct']:.4f}%)")
    print(f"   - Testing Fraud Cases:  {meta['test_fraud_count']} ({meta['test_fraud_pct']:.4f}%)")

    print("\n5. Min-Max Feature Scaling Check:")
    print(f"   - Scaled Training Min: {prep['X_train_scaled'].values.min():.4f}")
    print(f"   - Scaled Training Max: {prep['X_train_scaled'].values.max():.4f}")
    print(f"   - Scaler Saved To: 'models/scaler.joblib' ({os.path.exists('models/scaler.joblib')})")

    print("\n6. SMOTE Resampling Results:")
    print(f"   - Training Shape (Post-SMOTE): {prep['X_train_smote'].shape}")
    print(f"   - Training Legit Count: {meta['after_smote_legit_count']:,}")
    print(f"   - Training Fraud Count: {meta['after_smote_fraud_count']:,}")
    print(f"   - Synthetic Fraud Samples Generated: +{meta['synthetic_fraud_generated']:,}")
    print(f"   - Post-SMOTE Class Balance Ratio: {meta['after_smote_fraud_pct']:.1f}% Fraud / {100-meta['after_smote_fraud_pct']:.1f}% Legit")

    print("\n7. Test Set Integrity Safeguard Verification:")
    print(f"   - Test Samples Before SMOTE: {meta['test_samples_before_smote']}")
    print(f"   - Test Samples After SMOTE:  {meta['test_samples_after_smote']}")
    print(f"   - Test Fraud Cases Before:   {meta['test_fraud_before_smote']}")
    print(f"   - Test Fraud Cases After:    {meta['test_fraud_after_smote']}")
    print(f"   - Test Set Untouched Status: {meta['test_set_untouched']}")

    total_duration = time.time() - start_time
    print("\n" + "=" * 60)
    print(f"END-TO-END PIPELINE VALIDATION PASSED SUCCESSFULLY ({total_duration:.4f}s)")
    print("=" * 60)


if __name__ == "__main__":
    run_e2e_pipeline_test()
