"""
Unit tests for SMOTE class imbalance handling, test set immutability, and reproducibility.
"""

import numpy as np
import pandas as pd
import pytest

from app import generate_sample_credit_card_data
from src.data_preprocessing import preprocess_data, apply_smote
from src.utils import RANDOM_STATE


@pytest.fixture
def prep_data():
    """Execute preprocessing pipeline on synthetic dataset."""
    df = generate_sample_credit_card_data(n_samples=1000)
    success, err, prep = preprocess_data(df, test_size=0.20, random_state=RANDOM_STATE)
    assert success
    return prep


def test_smote_balances_classes(prep_data):
    """Test 1: Verify SMOTE produces exact 1:1 class balance on training data."""
    y_train_smote = prep_data['y_train_smote']

    count_legit = int((y_train_smote == 0).sum())
    count_fraud = int((y_train_smote == 1).sum())

    assert count_legit > 0
    assert count_fraud > 0
    assert count_legit == count_fraud


def test_original_training_data_imbalanced(prep_data):
    """Test 2: Verify original training data is imbalanced before SMOTE."""
    y_train = prep_data['y_train']

    count_legit = int((y_train == 0).sum())
    count_fraud = int((y_train == 1).sum())

    assert count_legit > count_fraud * 2


def test_test_set_immutability(prep_data):
    """Test 3: Verify test set (X_test_scaled, y_test) remains 100% untouched after SMOTE."""
    meta = prep_data['metadata']
    X_test_scaled = prep_data['X_test_scaled']
    y_test = prep_data['y_test']

    assert meta['test_set_untouched'] is True
    assert meta['test_samples_before_smote'] == meta['test_samples_after_smote']
    assert meta['test_fraud_before_smote'] == meta['test_fraud_after_smote']
    assert len(X_test_scaled) == 200
    assert len(y_test) == 200


def test_feature_count_after_smote(prep_data):
    """Test 4: Verify feature count is 30 before and after SMOTE."""
    X_train_scaled = prep_data['X_train_scaled']
    X_train_smote = prep_data['X_train_smote']

    assert X_train_scaled.shape[1] == 30
    assert X_train_smote.shape[1] == 30


def test_no_target_leakage_in_smote(prep_data):
    """Test 5: Verify target column 'Class' is absent from X_train_smote."""
    X_train_smote = prep_data['X_train_smote']
    target_col = prep_data['target_col']

    assert target_col not in X_train_smote.columns


def test_smote_reproducibility(prep_data):
    """Test 6: Verify SMOTE execution is 100% reproducible with random_state=42."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']

    X_smote_1, y_smote_1, _ = apply_smote(X_train_scaled, y_train, random_state=RANDOM_STATE)
    X_smote_2, y_smote_2, _ = apply_smote(X_train_scaled, y_train, random_state=RANDOM_STATE)

    assert np.allclose(X_smote_1.values, X_smote_2.values)
    assert (y_smote_1.values == y_smote_2.values).all()
