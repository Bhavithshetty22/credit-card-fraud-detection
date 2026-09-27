"""
Realistic Fraud Detection Model Training Pipeline.
Uses data/fraudTest.csv (and data/fraudTrain.csv if present).
Outputs trained realistic models & encoders to models/trained_realistic/.
"""

import os
import sys
import json
import logging
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)
from imblearn.over_sampling import SMOTE

# ── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s"
)
logger = logging.getLogger(__name__)


def haversine_distance(lat1, lon1, lat2, lon2):
    """Compute Haversine distance in km between two sets of lat/long points."""
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0)**2
    c = 2 * np.arcsin(np.sqrt(a))
    return 6371.0 * c


class RealisticFeatureEngineer:
    """Encoder and feature transformer fitted on training data only."""
    
    def __init__(self):
        self.ohe_category = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        self.merchant_freq = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        self.amt_raw_skew = None
        self.amt_log_skew = None

    def fit_transform(self, df: pd.DataFrame, is_train: bool = True) -> np.ndarray:
        df_feats = pd.DataFrame()
        
        # Datetime conversion
        trans_dt = pd.to_datetime(df['trans_date_trans_time'])
        dob_dt = pd.to_datetime(df['dob'])
        
        # 1. Age
        df_feats['age'] = (trans_dt - dob_dt).dt.days / 365.25
        
        # 2. Time features
        df_feats['hour_of_day'] = trans_dt.dt.hour
        df_feats['day_of_week'] = trans_dt.dt.dayofweek
        df_feats['is_weekend'] = (df_feats['day_of_week'] >= 5).astype(int)
        
        # 3. Distance
        df_feats['distance_km'] = haversine_distance(
            df['lat'], df['long'], df['merch_lat'], df['merch_long']
        )
        
        # 4. Gender
        df_feats['gender_binary'] = (df['gender'] == 'M').astype(int)
        
        # 5. Amount (log-transform)
        if is_train:
            self.amt_raw_skew = float(df['amt'].skew())
            df_feats['amt_log'] = np.log1p(df['amt'])
            self.amt_log_skew = float(df_feats['amt_log'].skew())
        else:
            df_feats['amt_log'] = np.log1p(df['amt'])
            
        # 6. City population
        df_feats['city_pop'] = df['city_pop'].values
        
        # 7. Merchant Frequency Encoding (fit on train only)
        if is_train:
            self.merchant_freq = df['merchant'].value_counts(normalize=True).to_dict()
        df_feats['merchant_freq'] = df['merchant'].map(self.merchant_freq).fillna(0.0).values
        
        # 8. Category One-Hot Encoding (fit on train only)
        cat_df = df[['category']].copy()
        if is_train:
            cat_encoded = self.ohe_category.fit_transform(cat_df)
        else:
            cat_encoded = self.ohe_category.transform(cat_df)
            
        cat_feature_names = [f"category_{c.replace('category_', '')}" for c in self.ohe_category.get_feature_names_out()]
        cat_encoded_df = pd.DataFrame(cat_encoded, columns=cat_feature_names, index=df_feats.index)
        
        # Combine all features
        X_df = pd.concat([df_feats, cat_encoded_df], axis=1)
        
        if is_train:
            self.feature_names = list(X_df.columns)
            X_scaled = self.scaler.fit_transform(X_df)
        else:
            X_scaled = self.scaler.transform(X_df)
            
        return X_scaled, X_df.columns.tolist()


def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(root_dir, "data")
    output_dir = os.path.join(root_dir, "models", "trained_realistic")
    os.makedirs(output_dir, exist_ok=True)

    train_path = os.path.join(data_dir, "fraudTrain.csv")
    test_path = os.path.join(data_dir, "fraudTest.csv")

    has_train = os.path.exists(train_path)
    has_test = os.path.exists(test_path)

    if has_train and has_test:
        logger.info("Found both fraudTrain.csv and fraudTest.csv. Using dataset default split.")
        df_train = pd.read_csv(train_path)
        df_test = pd.read_csv(test_path)
    elif has_test:
        logger.info("Only fraudTest.csv found. Performing 80/20 stratified split on is_fraud.")
        df_full = pd.read_csv(test_path)
        df_train, df_test = train_test_split(
            df_full, test_size=0.20, random_state=42, stratify=df_full['is_fraud']
        )
    else:
        logger.error("No dataset files found in data/!")
        sys.exit(1)

    y_train = df_train['is_fraud'].values
    y_test = df_test['is_fraud'].values

    train_fraud = int((y_train == 1).sum())
    train_legit = int((y_train == 0).sum())
    test_fraud = int((y_test == 1).sum())
    test_legit = int((y_test == 0).sum())

    logger.info("Dataset Split Breakdown:")
    logger.info("  Train set: %d total (%d legit, %d fraud - %.4f%%)", len(y_train), train_legit, train_fraud, 100*train_fraud/len(y_train))
    logger.info("  Test set:  %d total (%d legit, %d fraud - %.4f%%)", len(y_test), test_legit, test_fraud, 100*test_fraud/len(y_test))

    if test_fraud < 100:
        logger.warning("WARNING: Test split contains fewer than 100 fraud examples (%d). Evaluation metrics may be unreliable!", test_fraud)

    # ── Feature Engineering ───────────────────────────────────────────────────
    logger.info("Performing feature engineering...")
    fe = RealisticFeatureEngineer()
    X_train_scaled, feature_names = fe.fit_transform(df_train, is_train=True)
    X_test_scaled, _ = fe.fit_transform(df_test, is_train=False)

    logger.info("Feature engineering complete. Total features: %d", len(feature_names))
    logger.info("Amount Skewness -> Raw: %.4f, Log-Transformed: %.4f", fe.amt_raw_skew, fe.amt_log_skew)
    logger.info("Features: %s", feature_names)

    # ── SMOTE Resampling on Train Only ────────────────────────────────────────
    logger.info("Applying SMOTE resampling on training set...")
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train_scaled, y_train)

    logger.info("SMOTE Resampling Breakdown:")
    logger.info("  Before SMOTE: %d total (%d legit, %d fraud)", len(y_train), train_legit, train_fraud)
    logger.info("  After SMOTE:  %d total (%d legit, %d fraud)", len(y_train_res), int((y_train_res==0).sum()), int((y_train_res==1).sum()))

    # ── Model Training ────────────────────────────────────────────────────────
    models = {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
        "decision_tree": DecisionTreeClassifier(random_state=42, max_depth=12),
        "random_forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "naive_bayes": GaussianNB(),
        "ann": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200, random_state=42),
    }

    eval_results = []
    trained_artifacts = {}

    for name, model in models.items():
        logger.info("Training %s...", name)
        model.fit(X_train_res, y_train_res)

        preds = model.predict(X_test_scaled)
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_test_scaled)[:, 1]
        else:
            probs = preds.astype(float)

        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, zero_division=0))
        rec = float(recall_score(y_test, preds, zero_division=0))
        f1 = float(f1_score(y_test, preds, zero_division=0))
        auc = float(roc_auc_score(y_test, probs))
        cm = confusion_matrix(y_test, preds).tolist()

        res_entry = {
            "model_key": name,
            "accuracy": round(acc, 6),
            "precision": round(prec, 6),
            "recall": round(rec, 6),
            "f1_score": round(f1, 6),
            "roc_auc": round(auc, 6),
            "confusion_matrix": cm,
            "tn": cm[0][0],
            "fp": cm[0][1],
            "fn": cm[1][0],
            "tp": cm[1][1],
        }
        eval_results.append(res_entry)
        trained_artifacts[name] = model

        logger.info("  [%s] -> F1: %.4f | Recall: %.4f | Precision: %.4f | Accuracy: %.4f | AUC: %.4f",
                    name, f1, rec, prec, acc, auc)

    # Sort results by F1 score
    eval_results.sort(key=lambda x: x["f1_score"], reverse=True)
    best_model = eval_results[0]

    logger.info("======================================================================")
    logger.info("BEST MODEL SELECTED: %s (F1 = %.6f)", best_model["model_key"], best_model["f1_score"])
    logger.info("Confusion Matrix for Best Model (%s):", best_model["model_key"])
    logger.info("  True Negatives  (TN): %d", best_model["tn"])
    logger.info("  False Positives (FP): %d", best_model["fp"])
    logger.info("  False Negatives (FN): %d", best_model["fn"])
    logger.info("  True Positives  (TP): %d", best_model["tp"])
    logger.info("======================================================================")

    # Save artifacts to models/trained_realistic/
    logger.info("Saving realistic model artifacts to %s...", output_dir)
    joblib.dump(fe, os.path.join(output_dir, "feature_engineer.joblib"))
    joblib.dump(fe.scaler, os.path.join(output_dir, "scaler.joblib"))
    
    for name, model_obj in trained_artifacts.items():
        artifact_file = f"{name}_realistic.joblib"
        joblib.dump(model_obj, os.path.join(output_dir, artifact_file))
        logger.info("  Saved %s", artifact_file)

    metrics_file = os.path.join(output_dir, "evaluation_results_realistic.json")
    with open(metrics_file, "w") as f:
        json.dump({
            "best_model": best_model["model_key"],
            "split_info": {
                "train_total": len(y_train),
                "train_fraud": train_fraud,
                "test_total": len(y_test),
                "test_fraud": test_fraud,
            },
            "amt_skewness": {
                "raw": fe.amt_raw_skew,
                "log_transformed": fe.amt_log_skew,
            },
            "feature_names": feature_names,
            "models": eval_results,
        }, f, indent=2)

    logger.info("Metrics report saved to %s", metrics_file)
    logger.info("Realistic model training pipeline complete!")


if __name__ == "__main__":
    main()
