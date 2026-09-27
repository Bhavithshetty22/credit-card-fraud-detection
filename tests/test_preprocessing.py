"""
Unit tests for data preprocessing pipeline, validation, leakage checks, and scaling.
"""

import os
import joblib
import pandas as pd
import numpy as np
import pytest

from app import generate_sample_credit_card_data
from src.data_preprocessing import (
    load_data,
    validate_dataset,
    preprocess_data,
    get_scaling_comparison_table,
    get_feature_list_table
)
from src.utils import find_target_column, RANDOM_STATE


@pytest.fixture
def sample_df():
    """Generate reproducible sample credit card dataset (1,000 samples)."""
    return generate_sample_credit_card_data(n_samples=1000)


def test_target_column_detection(sample_df):
    """Test target column detection logic for various aliases."""
    assert find_target_column(sample_df) == "Class"

    df_alt = sample_df.rename(columns={"Class": "fraud_target"})
    df_alt_renamed = df_alt.rename(columns={"fraud_target": "target"})
    assert find_target_column(df_alt_renamed) == "target"


def test_invalid_target_validation():
    """Test validation when dataset is missing target or has invalid binary labels."""
    df_no_target = pd.DataFrame({"V1": [1, 2, 3], "V2": [4, 5, 6]})
    is_valid, err, target_col = validate_dataset(df_no_target)
    assert not is_valid
    assert "Target column not found" in err

    df_single_class = pd.DataFrame({"V1": [1, 2, 3], "Class": [0, 0, 0]})
    success, err, prep = preprocess_data(df_single_class)
    assert not success
    assert "only one class" in err


def test_non_numeric_features_error():
    """Test error handling when dataset contains non-numerical feature columns."""
    df_cat = pd.DataFrame({
        "V1": [1.0, 2.0, 3.0, 4.0, 5.0],
        "Category": ["A", "B", "A", "B", "A"],
        "Class": [0, 0, 0, 1, 0]
    })
    success, err, prep = preprocess_data(df_cat)
    assert not success
    assert "Non-numerical features detected" in err


def test_duplicate_removal(sample_df):
    """Test duplicate detection and removal."""
    # Append 10 duplicate rows
    df_dup = pd.concat([sample_df, sample_df.iloc[:10]], ignore_index=True)
    assert df_dup.duplicated().sum() == 10

    success, err, prep = preprocess_data(df_dup, test_size=0.20, random_state=RANDOM_STATE)
    assert success
    meta = prep['metadata']

    assert meta['duplicates_found'] == 10
    assert meta['duplicates_removed'] == 10
    assert meta['final_rows'] == len(sample_df)


def test_feature_target_separation(sample_df):
    """Test feature and target separation without target leakage."""
    success, err, prep = preprocess_data(sample_df)
    assert success

    X_train = prep['X_train']
    X_test = prep['X_test']
    y_train = prep['y_train']
    y_test = prep['y_test']

    assert "Class" not in X_train.columns
    assert "Class" not in X_test.columns
    assert len(X_train) == len(y_train)
    assert len(X_test) == len(y_test)
    assert X_train.shape[1] == 30
    assert X_test.shape[1] == 30


def test_stratified_split(sample_df):
    """Test stratified train/test split proportion preservation."""
    success, err, prep = preprocess_data(sample_df, test_size=0.20, random_state=RANDOM_STATE)
    assert success
    meta = prep['metadata']

    assert meta['train_samples'] == 800
    assert meta['test_samples'] == 200

    # Verify fraud ratio is preserved (~0.5% in sample)
    assert abs(meta['train_fraud_pct'] - meta['test_fraud_pct']) < 0.1


def test_scaler_data_leakage_safeguard(sample_df):
    """Test that MinMaxScaler is fit ONLY on training data."""
    success, err, prep = preprocess_data(sample_df, test_size=0.20, random_state=RANDOM_STATE)
    assert success

    X_train = prep['X_train']
    X_train_scaled = prep['X_train_scaled']
    X_test_scaled = prep['X_test_scaled']
    scaler = prep['scaler']

    # Min-Max of X_train_scaled should be [0, 1]
    assert np.allclose(X_train_scaled.min(axis=0), 0.0, atol=1e-5)
    assert np.allclose(X_train_scaled.max(axis=0), 1.0, atol=1e-5)

    # Scaler min_ and data_min_ must match X_train, NOT combined data or X_test
    assert np.allclose(scaler.data_min_, X_train.min(axis=0).values)
    assert np.allclose(scaler.data_max_, X_train.max(axis=0).values)


def test_scaler_persistence(sample_df, tmp_path):
    """Test joblib scaler saving and loading capability."""
    save_path = os.path.join(tmp_path, "scaler.joblib")
    success, err, prep = preprocess_data(sample_df, scaler_save_path=save_path)
    assert success
    assert os.path.exists(save_path)

    loaded_scaler = joblib.load(save_path)
    X_test = prep['X_test']
    X_test_scaled_direct = loaded_scaler.transform(X_test)

    assert np.allclose(X_test_scaled_direct, prep['X_test_scaled'].values)
