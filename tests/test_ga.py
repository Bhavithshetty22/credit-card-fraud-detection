"""
Unit tests for Genetic Algorithm (GA) Feature Selection Module.
Includes verification of leak-free GA validation methodology.
"""

import numpy as np
import pandas as pd
import pytest

from app import generate_sample_credit_card_data
from src.data_preprocessing import preprocess_data
from src.ga_feature_selection import (
    GAConfig,
    initialize_population,
    ensure_valid_chromosome,
    evaluate_chromosome,
    tournament_selection,
    two_point_crossover,
    bit_flip_mutation,
    run_genetic_algorithm
)
from src.utils import RANDOM_STATE


@pytest.fixture
def prep_data():
    """Execute preprocessing on sample data to obtain X_train_scaled, y_train, X_test_scaled, y_test."""
    df = generate_sample_credit_card_data(n_samples=1000)
    success, err, prep = preprocess_data(df, test_size=0.20, random_state=RANDOM_STATE)
    assert success
    return prep


def test_1_ga_val_created_before_smote(prep_data):
    """Test 1: Verify GA validation set is created before SMOTE and has original imbalanced distribution."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']

    config = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    res = run_genetic_algorithm(X_train_scaled, y_train, config=config, save_path="")

    # Fraud pct in GA val should match original train fraud pct (~0.5% in sample)
    assert res['ga_val_smote_applied'] is False
    assert res['ga_val_fraud_pct'] < 5.0  # Natural imbalanced distribution


def test_2_ga_train_data_is_smoted(prep_data):
    """Test 2: Verify GA training set is SMOTEd to a 1:1 balanced ratio."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']

    config = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    res = run_genetic_algorithm(X_train_scaled, y_train, config=config, save_path="")

    # GA train post-SMOTE should have equal fraud and legit counts
    assert res['ga_train_after_smote_samples'] > res['ga_train_before_smote_samples']
    assert res['ga_train_fraud_count_after_smote'] == res['ga_train_after_smote_samples'] // 2


def test_3_ga_val_is_not_smoted(prep_data):
    """Test 3: Verify GA validation set is NOT SMOTEd and retains original fraud count."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']

    config = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    res = run_genetic_algorithm(X_train_scaled, y_train, config=config, save_path="")

    assert res['ga_val_samples'] == int(len(X_train_scaled) * 0.20)
    assert res['ga_val_smote_applied'] is False


def test_4_final_test_set_untouched(prep_data):
    """Test 4: Verify final test set (X_test_scaled, y_test) remains completely untouched."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']
    X_test_scaled_before = prep_data['X_test_scaled'].copy()
    y_test_before = prep_data['y_test'].copy()

    config = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    res = run_genetic_algorithm(X_train_scaled, y_train, config=config, save_path="")

    assert res['test_set_untouched'] is True
    pd.testing.assert_frame_equal(prep_data['X_test_scaled'], X_test_scaled_before)
    pd.testing.assert_series_equal(prep_data['y_test'], y_test_before)


def test_5_no_validation_leakage(prep_data):
    """Test 5: Verify GA function parameters do not accept test data."""
    import inspect
    sig = inspect.signature(run_genetic_algorithm)
    params = list(sig.parameters.keys())

    assert "X_test" not in params
    assert "y_test" not in params
    assert "X_test_scaled" not in params


def test_6_ga_reproducibility(prep_data):
    """Test 6: Verify running GA twice with identical seed produces identical results."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']

    config1 = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    config2 = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)

    res1 = run_genetic_algorithm(X_train_scaled, y_train, config=config1, save_path="")
    res2 = run_genetic_algorithm(X_train_scaled, y_train, config=config2, save_path="")

    assert res1['best_chromosome'] == res2['best_chromosome']
    assert res1['best_fitness'] == res2['best_fitness']
    assert res1['selected_feature_names'] == res2['selected_feature_names']


def test_7_chromosome_length(prep_data):
    """Test 7: Verify chromosome length matches number of features dynamically."""
    X_train_scaled = prep_data['X_train_scaled']
    num_features = X_train_scaled.shape[1]

    pop = initialize_population(pop_size=5, num_features=num_features, random_state=RANDOM_STATE)
    assert pop.shape == (5, num_features)
    assert len(pop[0]) == 30


def test_8_binary_genes(prep_data):
    """Test 8: Verify every gene in population is strictly binary (0 or 1)."""
    X_train_scaled = prep_data['X_train_scaled']
    pop = initialize_population(pop_size=10, num_features=X_train_scaled.shape[1], random_state=RANDOM_STATE)

    unique_val_set = set(np.unique(pop))
    assert unique_val_set.issubset({0, 1})


def test_9_non_empty_chromosome():
    """Test 9: Verify all-zero chromosome is repaired to have at least 1 active feature."""
    all_zeros = np.zeros(30, dtype=int)
    repaired = ensure_valid_chromosome(all_zeros)

    assert np.sum(repaired) > 0
    assert len(repaired) == 30


def test_10_crossover_and_mutation():
    """Test 10: Verify crossover and mutation preserve chromosome length and binary properties."""
    rng = np.random.RandomState(RANDOM_STATE)
    p1 = np.ones(30, dtype=int)
    p2 = np.zeros(30, dtype=int)

    c1, c2 = two_point_crossover(p1, p2, crossover_prob=1.0, rng=rng)
    assert len(c1) == 30 and len(c2) == 30

    mutated = bit_flip_mutation(c1, mutation_prob=0.1, rng=rng)
    assert len(mutated) == 30
    assert np.sum(mutated) > 0


def test_11_ga_result_dictionary(prep_data, tmp_path):
    """Test 11: Verify GA result dictionary structure and persistence."""
    X_train_scaled = prep_data['X_train_scaled']
    y_train = prep_data['y_train']
    save_path = str(tmp_path / "ga_result.joblib")

    config = GAConfig(population_size=4, generations=2, rf_estimators=10, random_state=RANDOM_STATE)
    res = run_genetic_algorithm(X_train_scaled, y_train, config=config, save_path=save_path)

    expected_keys = [
        "best_chromosome", "best_fitness", "fitness_metric", "fitness_evaluator",
        "selected_indices", "selected_feature_names", "total_features",
        "selected_feature_count", "removed_feature_count", "feature_reduction_pct",
        "config", "history_df", "metrics", "ga_train_before_smote_samples",
        "ga_train_after_smote_samples", "ga_val_samples", "ga_val_fraud_pct",
        "ga_val_smote_applied", "test_set_untouched"
    ]
    for key in expected_keys:
        assert key in res

    assert res['total_features'] == 30
    assert len(res['selected_feature_names']) == res['selected_feature_count']
