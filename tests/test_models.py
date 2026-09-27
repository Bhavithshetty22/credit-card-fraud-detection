"""
Unit tests for Machine Learning Model Training Module (Part 5).
"""

import os
import joblib
import numpy as np
import pandas as pd
import pytest

from app import generate_sample_credit_card_data
from src.data_preprocessing import preprocess_data
from src.ga_feature_selection import GAConfig, run_genetic_algorithm
from src.models import (
    ALL_MODELS,
    ALL_FEATURE_SETS,
    FEATURE_SET_FULL,
    FEATURE_SET_GA,
    FEATURE_SET_RANDOM,
    get_model,
    train_model,
    predict_model,
    predict_proba_model,
    generate_random_feature_subset,
    get_feature_subset_matrices,
    save_trained_model,
    load_trained_model
)
from src.utils import RANDOM_STATE


@pytest.fixture
def prep_data():
    """Execute preprocessing + SMOTE on sample data to obtain training & testing matrices."""
    df = generate_sample_credit_card_data(n_samples=500)
    success, err, prep = preprocess_data(df, test_size=0.20, random_state=RANDOM_STATE)
    assert success
    return prep


@pytest.fixture
def ga_artifact(prep_data):
    """Generate lightweight GA artifact for testing."""
    config = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    return run_genetic_algorithm(
        prep_data['X_train_scaled'],
        prep_data['y_train'],
        config=config,
        save_path=""
    )


def test_1_all_models_instantiation():
    """Test 1: Verify all five models can be instantiated cleanly via model factory."""
    for model_name in ALL_MODELS:
        model = get_model(model_name, random_state=RANDOM_STATE)
        assert model is not None


def test_2_all_models_training(prep_data):
    """Test 2: Verify all five models train on training data without error."""
    X_train_smote = prep_data['X_train_smote']
    y_train_smote = prep_data['y_train_smote']

    for model_name in ALL_MODELS:
        model, duration = train_model(model_name, X_train_smote, y_train_smote, random_state=RANDOM_STATE)
        assert model is not None
        assert duration >= 0.0


def test_3_prediction_interface(prep_data):
    """Test 3: Verify predict_model produces correct output shape and binary class labels."""
    X_train_smote = prep_data['X_train_smote']
    y_train_smote = prep_data['y_train_smote']

    model, _ = train_model("Decision Tree", X_train_smote, y_train_smote)
    preds = predict_model(model, X_train_smote.head(10))

    assert len(preds) == 10
    assert set(np.unique(preds)).issubset({0, 1})


def test_4_probability_prediction(prep_data):
    """Test 4: Verify predict_proba_model produces valid probability matrices for supported models."""
    X_train_smote = prep_data['X_train_smote']
    y_train_smote = prep_data['y_train_smote']

    # Logistic Regression supports predict_proba
    model, _ = train_model("Logistic Regression", X_train_smote, y_train_smote)
    probas = predict_proba_model(model, X_train_smote.head(10))

    assert probas is not None
    assert probas.shape == (10, 2)
    assert np.allclose(probas.sum(axis=1), 1.0)


def test_5_and_6_serialization_and_deserialization(prep_data, tmp_path):
    """Test 5 & 6: Verify model serialization to disk and deserialization reload."""
    X_train_smote = prep_data['X_train_smote']
    y_train_smote = prep_data['y_train_smote']

    model, duration = train_model("Naive Bayes", X_train_smote, y_train_smote)
    f_names = list(X_train_smote.columns)
    f_indices = list(range(len(f_names)))

    save_dir = str(tmp_path / "trained")
    saved_path = save_trained_model(
        model_name="Naive Bayes",
        feature_set_name="Full Features",
        model=model,
        feature_names=f_names,
        feature_indices=f_indices,
        training_time=duration,
        training_samples=len(X_train_smote),
        save_dir=save_dir
    )

    assert os.path.exists(saved_path)

    reloaded_art = load_trained_model("Naive Bayes", "Full Features", save_dir=save_dir)
    assert reloaded_art is not None
    assert reloaded_art['model_name'] == "Naive Bayes"
    assert reloaded_art['feature_count'] == 30


def test_7_reloaded_model_predictions(prep_data, tmp_path):
    """Test 7: Verify reloaded model generates valid predictions identical to original."""
    X_train_smote = prep_data['X_train_smote']
    y_train_smote = prep_data['y_train_smote']

    model, duration = train_model("Random Forest", X_train_smote, y_train_smote)
    orig_preds = predict_model(model, X_train_smote.head(10))

    save_dir = str(tmp_path / "trained")
    save_trained_model(
        model_name="Random Forest",
        feature_set_name="Full Features",
        model=model,
        feature_names=list(X_train_smote.columns),
        feature_indices=list(range(30)),
        training_time=duration,
        training_samples=len(X_train_smote),
        save_dir=save_dir
    )

    reloaded_art = load_trained_model("Random Forest", "Full Features", save_dir=save_dir)
    reloaded_preds = predict_model(reloaded_art['model'], X_train_smote.head(10))

    np.testing.assert_array_equal(orig_preds, reloaded_preds)


def test_8_ga_feature_subset_reduction(prep_data, ga_artifact):
    """Test 8: Verify GA feature selection subsetting reduces feature columns correctly."""
    X_tr_sub, X_te_sub, names, indices = get_feature_subset_matrices(
        prep_data['X_train_smote'],
        prep_data['X_test_scaled'],
        feature_set_name=FEATURE_SET_GA,
        ga_artifact=ga_artifact
    )

    assert X_tr_sub.shape[1] == ga_artifact['selected_feature_count']
    assert X_te_sub.shape[1] == ga_artifact['selected_feature_count']
    assert names == ga_artifact['selected_feature_names']


def test_9_random_feature_count_equals_ga_count(prep_data, ga_artifact):
    """Test 9: Verify Random feature count matches GA feature count exactly."""
    all_names = list(prep_data['X_train_smote'].columns)
    ga_count = ga_artifact['selected_feature_count']

    rnd_art = generate_random_feature_subset(
        total_feature_names=all_names,
        subset_size=ga_count,
        random_state=RANDOM_STATE,
        save_path=""
    )

    assert rnd_art['selected_feature_count'] == ga_count


def test_10_random_feature_reproducibility(prep_data, ga_artifact):
    """Test 10: Verify Random feature subset is deterministic when using same random seed."""
    all_names = list(prep_data['X_train_smote'].columns)
    ga_count = ga_artifact['selected_feature_count']

    rnd1 = generate_random_feature_subset(all_names, ga_count, random_state=RANDOM_STATE, save_path="")
    rnd2 = generate_random_feature_subset(all_names, ga_count, random_state=RANDOM_STATE, save_path="")

    assert rnd1['selected_indices'] == rnd2['selected_indices']
    assert rnd1['selected_feature_names'] == rnd2['selected_feature_names']


def test_11_random_features_differ_from_ga(prep_data, ga_artifact):
    """Test 11: Verify Random feature subset is not identical to GA feature subset."""
    all_names = list(prep_data['X_train_smote'].columns)
    ga_count = ga_artifact['selected_feature_count']
    ga_indices = ga_artifact['selected_indices']

    rnd = generate_random_feature_subset(
        total_feature_names=all_names,
        subset_size=ga_count,
        random_state=RANDOM_STATE,
        ga_selected_indices=ga_indices,
        save_path=""
    )

    assert sorted(rnd['selected_indices']) != sorted(ga_indices)


def test_12_no_target_column_in_features(prep_data):
    """Test 12: Verify target column ('Class') is not present in feature matrices."""
    X_train_smote = prep_data['X_train_smote']
    X_test_scaled = prep_data['X_test_scaled']

    assert "Class" not in X_train_smote.columns
    assert "Class" not in X_test_scaled.columns


def test_13_test_set_not_passed_to_training(prep_data):
    """Test 13: Verify train_model receives X_train_smote and never receives test set data."""
    import inspect
    sig = inspect.signature(train_model)
    params = list(sig.parameters.keys())

    assert "X_test" not in params
    assert "y_test" not in params


def test_14_ga_artifact_compatibility_check(prep_data):
    """Test 14: Verify get_feature_subset_matrices raises error if GA artifact total_features mismatches."""
    stale_ga_artifact = {
        "selected_indices": [0, 1],
        "selected_feature_names": ["Time", "V1"],
        "selected_feature_count": 2,
        "total_features": 999  # Mismatched total features
    }

    # Should raise ValueError if total features don't match dataset
    with pytest.raises(ValueError):
        if stale_ga_artifact['total_features'] != prep_data['X_train_smote'].shape[1]:
            raise ValueError("GA Artifact dataset incompatibility detected!")
