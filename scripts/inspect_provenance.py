import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import glob
import pandas as pd
import joblib
from src.data_preprocessing import preprocess_data
from src.utils import RANDOM_STATE

csv_path = "data/creditcard.csv"
print("=== 1. RAW DATASET ===")
if os.path.exists(csv_path):
    df_raw = pd.read_csv(csv_path)
    print(f"Raw shape: {df_raw.shape}")
    print(f"Duplicates: {df_raw.duplicated().sum()}")
    print(f"Frauds: {(df_raw['Class'] == 1).sum()}")

    print("\n=== 2. PREPROCESSING RUN ===")
    success, err, prep = preprocess_data(df_raw, test_size=0.20, random_state=RANDOM_STATE)
    meta = prep['metadata']
    for k, v in meta.items():
        print(f"  {k}: {v}")
else:
    print("creditcard.csv not found!")

print("\n=== 3. GA FEATURE SELECTION ARTIFACT ===")
ga_path = "models/ga_feature_selection.joblib"
if os.path.exists(ga_path):
    ga = joblib.load(ga_path)
    for k in ["dataset_scope", "total_features", "selected_feature_count", "selected_feature_names", "best_fitness", "ga_train_before_smote_samples", "ga_train_after_smote_samples", "ga_val_samples", "feature_reduction_pct"]:
        if k in ga:
            print(f"  {k}: {ga[k]}")

print("\n=== 4. RANDOM FEATURE SELECTION ARTIFACT ===")
rnd_path = "models/random_feature_selection.joblib"
if os.path.exists(rnd_path):
    rnd = joblib.load(rnd_path)
    for k in ["dataset_scope", "total_features", "selected_feature_count", "selected_feature_names", "selected_indices", "random_state"]:
        if k in rnd:
            print(f"  {k}: {rnd[k]}")

print("\n=== 5. ALL 15 TRAINED MODEL ARTIFACTS ===")
trained_files = sorted(glob.glob("models/trained/*.joblib"))
print(f"Total trained model files found: {len(trained_files)}")
print(f"{'Filename':<50} | {'Model Name':<26} | {'Feature Set':<15} | {'Feats':<6} | {'Train Samples':<13} | {'Scope':<22} | {'Time (s)'}")
print("-" * 150)
for f in trained_files:
    art = joblib.load(f)
    fname = os.path.basename(f)
    m_name = art.get('model_name', 'N/A')
    f_set = art.get('feature_set_name', 'N/A')
    f_cnt = art.get('feature_count', 'N/A')
    t_samp = art.get('training_samples', 'N/A')
    scope = art.get('dataset_scope', 'N/A')
    t_time = art.get('training_time', 0.0)
    print(f"{fname:<50} | {m_name:<26} | {f_set:<15} | {f_cnt:<6} | {t_samp:<13} | {scope:<22} | {t_time:<.4f}")
