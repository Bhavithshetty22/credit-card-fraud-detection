"""
Data preprocessing, validation, and summary functions for Credit Card Fraud Detection.
"""

from typing import Tuple, Optional, Dict, Any, List
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from imblearn.over_sampling import SMOTE
import joblib

from src.utils import find_target_column, RANDOM_STATE


def load_data(file_source: Any) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """
    Load data from a CSV file source (file object or file path).

    Parameters
    ----------
    file_source : Any
        Streamlit UploadedFile or file path string.

    Returns
    -------
    Tuple[Optional[pd.DataFrame], Optional[str]]
        Loaded DataFrame and error message if any.
    """
    try:
        df = pd.read_csv(file_source)
        return df, None
    except pd.errors.EmptyDataError:
        return None, "The uploaded file is empty. Please upload a valid CSV dataset."
    except Exception as e:
        return None, f"Failed to parse CSV file: {str(e)}"


def validate_dataset(df: pd.DataFrame) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validate the dataset format and detect the target column.

    Parameters
    ----------
    df : pd.DataFrame
        The input DataFrame.

    Returns
    -------
    Tuple[bool, Optional[str], Optional[str]]
        (is_valid, error_message, target_column_name)
    """
    if df is None or df.empty:
        return False, "The dataset contains no rows or data.", None

    target_col = find_target_column(df)
    if target_col is None:
        return (
            False,
            "Target column not found! Expected one of: 'Class', 'class', 'target', 'Target', 'fraud', 'Fraud'.",
            None
        )

    return True, None, target_col


def get_dataset_shape(df: pd.DataFrame) -> Tuple[int, int]:
    """
    Get row and column count of dataset dynamically.
    """
    return df.shape[0], df.shape[1]


def get_data_types_table(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate a formatted DataFrame containing column names and their data types.
    """
    dt_df = pd.DataFrame({
        "Column Name": df.columns,
        "Data Type": [str(dtype) for dtype in df.dtypes]
    })
    return dt_df


def get_missing_values_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate total missing values and missing values per column.
    """
    missing_series = df.isnull().sum()
    total_missing = int(missing_series.sum())

    missing_per_col = pd.DataFrame({
        "Column Name": missing_series.index,
        "Missing Count": missing_series.values,
        "Percentage (%)": (missing_series.values / len(df) * 100).round(4)
    })

    return {
        "total_missing": total_missing,
        "missing_per_column": missing_per_col
    }


def get_duplicate_count(df: pd.DataFrame) -> int:
    """
    Calculate total number of duplicate rows in dataset.
    """
    return int(df.duplicated().sum())


def get_target_analysis(df: pd.DataFrame, target_col: str) -> Dict[str, Any]:
    """
    Perform target variable analysis (legitimate vs fraudulent transactions).

    Parameters
    ----------
    df : pd.DataFrame
        Dataset DataFrame.
    target_col : str
        Target column name.

    Returns
    -------
    Dict[str, Any]
        Dictionary containing counts and percentages.
    """
    total_transactions = len(df)

    # Normalize target values to handle numeric, bool, or string
    target_series = df[target_col]
    val_counts = target_series.value_counts()

    # Identify fraud (typically 1 or True or 'Fraud') vs legit (0 or False or 'Legitimate')
    fraud_count = 0
    legit_count = 0

    for val, count in val_counts.items():
        val_str = str(val).strip().lower()
        if val_str in ['1', 'true', 'fraud', 'fraudulent', '1.0']:
            fraud_count += count
        elif val_str in ['0', 'false', 'legit', 'legitimate', 'normal', '0.0']:
            legit_count += count
        else:
            # Fallback if binary values are other integers/categories
            if val == target_series.max():
                fraud_count += count
            else:
                legit_count += count

    # If all values counted through fallback equal total, fine
    if legit_count + fraud_count != total_transactions:
        # Fallback to standard sorting by value (0 -> legit, 1 -> fraud)
        sorted_keys = sorted(val_counts.keys())
        if len(sorted_keys) >= 2:
            legit_count = int(val_counts[sorted_keys[0]])
            fraud_count = int(val_counts[sorted_keys[1]])
        elif len(sorted_keys) == 1:
            legit_count = int(val_counts[sorted_keys[0]])
            fraud_count = 0

    fraud_percentage = (fraud_count / total_transactions * 100) if total_transactions > 0 else 0.0

    return {
        "target_column": target_col,
        "total_transactions": total_transactions,
        "legitimate_count": legit_count,
        "fraudulent_count": fraud_count,
        "fraud_percentage": round(fraud_percentage, 4)
    }


def get_basic_statistics(df: pd.DataFrame) -> pd.DataFrame:
    """
    Get statistical summary of numerical features.
    """
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty:
        return pd.DataFrame()
    return num_df.describe().T


def get_feature_stats(df: pd.DataFrame, col_name: str) -> Optional[Dict[str, float]]:
    """
    Compute mean, median, min, max stats for a specific feature column.
    """
    if col_name not in df.columns:
        return None

    series = pd.to_numeric(df[col_name], errors='coerce')
    return {
        "mean": float(series.mean()),
        "median": float(series.median()),
        "min": float(series.min()),
        "max": float(series.max()),
        "std": float(series.std())
    }


def preprocess_data(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = RANDOM_STATE,
    scaler_save_path: str = "models/scaler.joblib"
) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Leakage-safe preprocessing pipeline for credit card fraud detection:
    1. Validation
    2. Duplicate Removal & Reporting
    3. Feature-Target Separation
    4. Numerical Features Check
    5. Stratified Train/Test Split (80/20)
    6. Min-Max Scaling (Fit ONLY on Training Data)
    7. Persistence of Scaler

    Parameters
    ----------
    df : pd.DataFrame
        Raw dataset.
    test_size : float
        Proportion of dataset to include in test split (default 0.20).
    random_state : int
        Random state seed (default 42).
    scaler_save_path : str
        File path to persist the fitted scaler.

    Returns
    -------
    Tuple[bool, Optional[str], Optional[Dict[str, Any]]]
        (success, error_message, pipeline_output_dict)
    """
    if df is None or df.empty:
        return False, "Empty or invalid dataset provided.", None

    # Step 1: Duplicate Handling
    original_rows = len(df)
    duplicates_found = int(df.duplicated().sum())
    df_cleaned = df.drop_duplicates().copy()
    duplicates_removed = duplicates_found
    final_rows = len(df_cleaned)

    # Step 2: Target Identification & Validation
    target_col = find_target_column(df_cleaned)
    if not target_col:
        return False, "Target column not found in dataset.", None

    y_raw = df_cleaned[target_col]
    unique_targets = y_raw.unique()

    if len(unique_targets) < 2:
        return False, f"Target column '{target_col}' has only one class ({unique_targets}). Cannot perform binary classification split.", None

    # Standardize target binary representation (0 = Legit, 1 = Fraud)
    y = y_raw.copy()
    if y.dtype == object or y.dtype == bool:
        y_mapped = y.astype(str).str.strip().str.lower()
        y = y_mapped.map(lambda val: 1 if val in ['1', 'true', 'fraud', 'fraudulent', '1.0'] else 0)

    # Step 3: Feature Separation & Numerical Validation
    X = df_cleaned.drop(columns=[target_col])
    feature_names = list(X.columns)
    num_features = len(feature_names)

    non_numeric_cols = [col for col in X.columns if not pd.api.types.is_numeric_dtype(X[col])]
    if non_numeric_cols:
        return (
            False,
            f"Non-numerical features detected: {non_numeric_cols}. The current pipeline requires numerical input features.",
            None
        )

    # Check minimum sample size for stratified split
    class_counts = y.value_counts()
    min_class_count = class_counts.min()
    if min_class_count < 2:
        return False, f"Insufficient samples for minority class ({min_class_count} samples). Requires at least 2 samples for stratified split.", None

    # Step 4: Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    # Calculate fraud counts and percentages
    train_samples = len(X_train)
    test_samples = len(X_test)

    train_fraud_count = int((y_train == 1).sum())
    train_legit_count = int((y_train == 0).sum())
    train_fraud_pct = (train_fraud_count / train_samples * 100) if train_samples > 0 else 0.0

    test_fraud_count = int((y_test == 1).sum())
    test_legit_count = int((y_test == 0).sum())
    test_fraud_pct = (test_fraud_count / test_samples * 100) if test_samples > 0 else 0.0

    # Step 5: Min-Max Scaling (Fit ONLY on X_train to prevent data leakage)
    scaler = MinMaxScaler()
    X_train_scaled_arr = scaler.fit_transform(X_train)
    X_test_scaled_arr = scaler.transform(X_test)  # Transformed only using fit parameters from X_train

    X_train_scaled = pd.DataFrame(X_train_scaled_arr, columns=feature_names, index=X_train.index)
    X_test_scaled = pd.DataFrame(X_test_scaled_arr, columns=feature_names, index=X_test.index)

    # Step 6: Persist Scaler using joblib
    try:
        os.makedirs(os.path.dirname(scaler_save_path), exist_ok=True)
        joblib.dump(scaler, scaler_save_path)
    except Exception as e:
        print(f"Warning: Failed to persist scaler to {scaler_save_path}: {e}")

    # Step 7: Apply SMOTE on Training Data ONLY (Strict Data Leakage Rule)
    X_train_smote, y_train_smote, smote_obj = apply_smote(
        X_train_scaled, y_train, random_state=random_state
    )

    # Calculate SMOTE metadata metrics
    after_smote_train_samples = len(X_train_smote)
    after_smote_legit_count = int((y_train_smote == 0).sum())
    after_smote_fraud_count = int((y_train_smote == 1).sum())
    after_smote_fraud_pct = (after_smote_fraud_count / after_smote_train_samples * 100) if after_smote_train_samples > 0 else 0.0

    synthetic_fraud_generated = after_smote_fraud_count - train_fraud_count

    # Verify test set remained completely untouched
    test_samples_before_smote = len(X_test_scaled)
    test_samples_after_smote = len(X_test_scaled)
    test_fraud_before_smote = test_fraud_count
    test_fraud_after_smote = int((y_test == 1).sum())
    test_set_untouched = (
        test_samples_before_smote == test_samples_after_smote and
        test_fraud_before_smote == test_fraud_after_smote
    )

    # Metadata payload
    metadata = {
        "original_rows": original_rows,
        "duplicates_found": duplicates_found,
        "duplicates_removed": duplicates_removed,
        "final_rows": final_rows,
        "num_features": num_features,
        "train_samples": train_samples,
        "test_samples": test_samples,
        "train_fraud_count": train_fraud_count,
        "train_legit_count": train_legit_count,
        "train_fraud_pct": round(train_fraud_pct, 4),
        "test_fraud_count": test_fraud_count,
        "test_legit_count": test_legit_count,
        "test_fraud_pct": round(test_fraud_pct, 4),
        "target_col": target_col,
        "feature_names": feature_names,
        "random_state": random_state,
        "test_size": test_size,
        "scaling_method": "MinMaxScaler (0 - 1)",

        # SMOTE Metadata
        "before_smote_train_samples": train_samples,
        "before_smote_legit_count": train_legit_count,
        "before_smote_fraud_count": train_fraud_count,
        "before_smote_fraud_pct": round(train_fraud_pct, 4),

        "after_smote_train_samples": after_smote_train_samples,
        "after_smote_legit_count": after_smote_legit_count,
        "after_smote_fraud_count": after_smote_fraud_count,
        "after_smote_fraud_pct": round(after_smote_fraud_pct, 4),

        "synthetic_fraud_generated": synthetic_fraud_generated,
        "test_samples_before_smote": test_samples_before_smote,
        "test_samples_after_smote": test_samples_after_smote,
        "test_fraud_before_smote": test_fraud_before_smote,
        "test_fraud_after_smote": test_fraud_after_smote,
        "test_set_untouched": test_set_untouched,
        "smote_applied": True
    }

    pipeline_result = {
        "X_train": X_train,
        "X_test": X_test,
        "X_train_scaled": X_train_scaled,
        "X_test_scaled": X_test_scaled,
        "X_train_smote": X_train_smote,
        "y_train_smote": y_train_smote,
        "y_train": y_train,
        "y_test": y_test,
        "scaler": scaler,
        "smote": smote_obj,
        "feature_names": feature_names,
        "target_col": target_col,
        "metadata": metadata
    }

    return True, None, pipeline_result


def apply_smote(
    X_train_scaled: pd.DataFrame,
    y_train: pd.Series,
    random_state: int = RANDOM_STATE
) -> Tuple[pd.DataFrame, pd.Series, SMOTE]:
    """
    Apply Synthetic Minority Over-sampling Technique (SMOTE) strictly on the scaled training data.
    Dynamically adjusts k_neighbors if minority class sample count is small (< 6).

    Parameters
    ----------
    X_train_scaled : pd.DataFrame
        Scaled training features.
    y_train : pd.Series
        Training target labels.
    random_state : int
        Random seed for reproducibility.

    Returns
    -------
    Tuple[pd.DataFrame, pd.Series, SMOTE]
        (X_train_smote, y_train_smote, smote_instance)
    """
    min_samples = int(y_train.value_counts().min())
    k_neighbors = min(5, max(1, min_samples - 1))

    smote = SMOTE(k_neighbors=k_neighbors, random_state=random_state)
    X_res, y_res = smote.fit_resample(X_train_scaled, y_train)

    X_train_smote = pd.DataFrame(X_res, columns=X_train_scaled.columns)
    y_train_smote = pd.Series(y_res, name=y_train.name)

    return X_train_smote, y_train_smote, smote


def get_scaling_comparison_table(X_train: pd.DataFrame, X_train_scaled: pd.DataFrame) -> pd.DataFrame:
    """
    Generate a feature-by-feature min/max comparison table before and after Min-Max scaling.
    """
    comp_data = []
    for col in X_train.columns:
        orig_min = float(X_train[col].min())
        orig_max = float(X_train[col].max())
        scaled_min = float(X_train_scaled[col].min())
        scaled_max = float(X_train_scaled[col].max())

        comp_data.append({
            "Feature": col,
            "Original Min": round(orig_min, 4),
            "Original Max": round(orig_max, 4),
            "Scaled Min": round(scaled_min, 4),
            "Scaled Max": round(scaled_max, 4)
        })

    return pd.DataFrame(comp_data)


def get_feature_list_table(feature_names: List[str]) -> pd.DataFrame:
    """
    Generate a 1-indexed table of feature names.
    """
    return pd.DataFrame({
        "#": range(1, len(feature_names) + 1),
        "Feature Name": feature_names
    })
