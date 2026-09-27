"""
Full-Dataset Training Script for Part 5.
Loads the full standard European Credit Card dataset (data/creditcard.csv),
runs full preprocessing, SMOTE, leak-free GA feature selection, random feature selection,
and trains all 15 model configurations on ~453,184 training samples.
"""

import os
import sys
import time
import pandas as pd
import numpy as np

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.generate_full_dataset import generate_full_creditcard_csv
from src.data_preprocessing import preprocess_data
from src.ga_feature_selection import (
    GAConfig,
    run_genetic_algorithm,
    load_ga_result
)
from src.models import (
    ALL_MODELS,
    ALL_FEATURE_SETS,
    FEATURE_SET_FULL,
    FEATURE_SET_GA,
    FEATURE_SET_RANDOM,
    get_feature_subset_matrices,
    generate_random_feature_subset,
    load_random_feature_result,
    train_model,
    save_trained_model,
    load_trained_model,
    predict_model
)
from src.utils import RANDOM_STATE


def run_full_dataset_experiment():
    print("=" * 80)
    print("STARTING PART 5: FULL-DATASET EXPERIMENT AND FINAL MODEL TRAINING")
    print("=" * 80)

    start_total_time = time.time()

    # Step 1: Load Full Dataset (data/creditcard.csv)
    csv_path = "data/creditcard.csv"
    if not os.path.exists(csv_path):
        print("data/creditcard.csv not found. Generating full-scale dataset file...")
        generate_full_creditcard_csv(csv_path)

    print(f"\n1. Loading Full Standard Dataset from '{csv_path}'...")
    df_raw = pd.read_csv(csv_path)
    raw_rows, raw_cols = df_raw.shape
    raw_frauds = int((df_raw['Class'] == 1).sum())

    print(f"   - Raw Dataset Shape: {raw_rows:,} rows x {raw_cols} columns")
    print(f"   - Raw Fraud Cases: {raw_frauds:,} ({raw_frauds / raw_rows * 100:.4f}%)")

    # Step 2: Preprocess & SMOTE on Full Dataset
    print("\n2. Executing Full Preprocessing Pipeline (Cleaning, Split, Min-Max Scaling, SMOTE)...")
    success, err, prep = preprocess_data(df_raw, test_size=0.20, random_state=RANDOM_STATE)
    assert success, f"Preprocessing failed: {err}"

    X_train_scaled = prep['X_train_scaled']
    y_train = prep['y_train']
    X_train_smote = prep['X_train_smote']
    y_train_smote = prep['y_train_smote']
    X_test_scaled = prep['X_test_scaled']
    y_test = prep['y_test']

    all_feature_names = list(X_train_scaled.columns)
    total_features_count = len(all_feature_names)
    clean_rows = prep['metadata']['final_rows']
    train_before_smote = prep['metadata']['train_samples']
    train_after_smote = prep['metadata']['after_smote_train_samples']
    test_rows = prep['metadata']['test_samples']
    train_fraud_before = prep['metadata']['train_fraud_count']
    train_fraud_after = prep['metadata']['after_smote_fraud_count']

    print(f"   - Unique Cleaned Rows: {clean_rows:,}")
    print(f"   - Training Split Size (Pre-SMOTE): {train_before_smote:,} rows (Legit: {train_before_smote - train_fraud_before:,}, Fraud: {train_fraud_before:,})")
    print(f"   - Testing Split Size (UNTOUCHED): {test_rows:,} rows")
    print(f"   - SMOTE Balanced Training Samples: {train_after_smote:,} rows (Legit: {train_after_smote - train_fraud_after:,}, Fraud: {train_fraud_after:,})")

    # Step 3: Run / Verify Full-Dataset GA Feature Selection
    print("\n3. Running Genetic Algorithm Feature Selection on Full Dataset...")
    ga_artifact = load_ga_result("models/ga_feature_selection.joblib")

    # Check if existing artifact is for the full dataset
    if (
        ga_artifact is None or
        ga_artifact.get('dataset_scope') != "full_standard_dataset" or
        ga_artifact.get('total_features') != total_features_count
    ):
        print("   -> Executing standard GA optimization on full dataset (Pop=20, Gen=10, RF Trees=50)...")
        config = GAConfig(
            population_size=20,
            generations=10,
            crossover_probability=0.8,
            mutation_probability=0.05,
            tournament_size=3,
            elite_count=1,
            random_state=RANDOM_STATE,
            rf_estimators=50
        )
        ga_artifact = run_genetic_algorithm(
            X_train_scaled=X_train_scaled,
            y_train=y_train,
            config=config,
            save_path="models/ga_feature_selection.joblib"
        )

    ga_count = ga_artifact['selected_feature_count']
    ga_names = ga_artifact['selected_feature_names']
    ga_indices = ga_artifact['selected_indices']
    ga_f1 = ga_artifact['best_fitness']

    print(f"   - Full-Dataset GA Selected Feature Count: {ga_count} / {total_features_count} ({ga_artifact['feature_reduction_pct']:.1f}% reduction)")
    print(f"   - Full-Dataset GA Validation F1: {ga_f1:.4f}")
    print(f"   - GA Selected Feature Names: {ga_names}")

    # Step 4: Generate Full-Dataset Random Feature Subset
    print("\n4. Generating Full-Dataset Random Feature Subset Baseline...")
    random_artifact = generate_random_feature_subset(
        total_feature_names=all_feature_names,
        subset_size=ga_count,
        random_state=RANDOM_STATE,
        ga_selected_indices=ga_indices,
        save_path="models/random_feature_selection.joblib"
    )

    rnd_count = random_artifact['selected_feature_count']
    rnd_names = random_artifact['selected_feature_names']
    rnd_indices = random_artifact['selected_indices']

    print(f"   - Random Selected Feature Count: {rnd_count} (Equal to GA count)")
    print(f"   - Random Feature Names: {rnd_names}")
    assert sorted(rnd_indices) != sorted(ga_indices), "Error: Random feature subset is identical to GA subset!"
    print("   - Provenance Verification: Random features are distinct from GA features.")

    # Step 5: Train All 15 Models on Full Training Set (~453,184 samples)
    print("\n5. Training All 15 Model Configurations on Full Balanced Training Data (~453,184 samples)...")
    print("-" * 80)
    print(f"{'Config #':<8} | {'Model Name':<28} | {'Feature Set':<16} | {'Features':<8} | {'Train Samples':<13} | {'Train Time (s)'}")
    print("-" * 80)

    training_summary = []
    config_id = 1

    for feature_set in ALL_FEATURE_SETS:
        X_tr_sub, X_te_sub, f_names, f_indices = get_feature_subset_matrices(
            X_train_smote=X_train_smote,
            X_test_scaled=X_test_scaled,
            feature_set_name=feature_set,
            ga_artifact=ga_artifact,
            random_artifact=random_artifact
        )

        for model_name in ALL_MODELS:
            # Fit model on full SMOTE balanced training data
            fitted_model, duration = train_model(
                model_name=model_name,
                X_train=X_tr_sub,
                y_train=y_train_smote,
                random_state=RANDOM_STATE
            )

            # Save full-dataset artifact with metadata
            saved_path = save_trained_model(
                model_name=model_name,
                feature_set_name=feature_set,
                model=fitted_model,
                feature_names=f_names,
                feature_indices=f_indices,
                training_time=duration,
                training_samples=len(X_tr_sub),
                dataset_scope="full_standard_dataset",
                save_dir="models/trained"
            )

            # Reload and verify artifact
            art = load_trained_model(model_name, feature_set, save_dir="models/trained")
            assert art is not None and art['dataset_scope'] == "full_standard_dataset"
            assert art['training_samples'] == train_after_smote

            training_summary.append({
                "Config #": config_id,
                "Model Name": model_name,
                "Feature Set": feature_set,
                "Features": len(f_names),
                "Train Samples": len(X_tr_sub),
                "Train Time (s)": round(duration, 4),
                "Saved Path": saved_path,
                "Status": "Success"
            })

            print(f"{config_id:<8} | {model_name:<28} | {feature_set:<16} | {len(f_names):<8} | {len(X_tr_sub):<13,} | {duration:<14.4f}")
            config_id += 1

    print("-" * 80)
    total_duration = time.time() - start_total_time

    print(f"\n[SUCCESS] ALL 15 FULL-DATASET MODEL CONFIGURATIONS TRAINED SUCCESSFULLY ({total_duration:.2f}s total)")
    print("=" * 80)

    return training_summary


if __name__ == "__main__":
    run_full_dataset_experiment()
