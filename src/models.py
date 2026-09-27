"""
Machine Learning Classifier Factory, Training, and Random Feature Selection Module.
Supports 5 Classifiers: Decision Tree, Random Forest, Logistic Regression, ANN (MLPClassifier), Naive Bayes.
Supports 3 Feature Configurations: Full Features, GA Features, Random Features.
"""

import os
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional, List

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB

from src.utils import RANDOM_STATE

# Registered Model Identifiers
MODEL_DECISION_TREE = "Decision Tree"
MODEL_RANDOM_FOREST = "Random Forest"
MODEL_LOGISTIC_REGRESSION = "Logistic Regression"
MODEL_ANN = "Artificial Neural Network"
MODEL_NAIVE_BAYES = "Naive Bayes"

ALL_MODELS = [
    MODEL_DECISION_TREE,
    MODEL_RANDOM_FOREST,
    MODEL_LOGISTIC_REGRESSION,
    MODEL_ANN,
    MODEL_NAIVE_BAYES
]

# Registered Feature Configurations
FEATURE_SET_FULL = "Full Features"
FEATURE_SET_GA = "GA Features"
FEATURE_SET_RANDOM = "Random Features"

ALL_FEATURE_SETS = [
    FEATURE_SET_FULL,
    FEATURE_SET_GA,
    FEATURE_SET_RANDOM
]


def get_model(model_name: str, random_state: int = RANDOM_STATE) -> Any:
    """
    Model Factory: Instantiate baseline scikit-learn classifier for training.

    Parameters
    ----------
    model_name : str
        Name of classifier requested.
    random_state : int
        Random seed for reproducibility.

    Returns
    -------
    classifier instance
    """
    if model_name == MODEL_DECISION_TREE:
        return DecisionTreeClassifier(
            random_state=random_state
        )

    elif model_name == MODEL_RANDOM_FOREST:
        return RandomForestClassifier(
            n_estimators=100,
            random_state=random_state,
            n_jobs=-1
        )

    elif model_name == MODEL_LOGISTIC_REGRESSION:
        return LogisticRegression(
            max_iter=1000,
            random_state=random_state
        )

    elif model_name == MODEL_ANN:
        return MLPClassifier(
            hidden_layer_sizes=(64, 32),
            max_iter=100,
            random_state=random_state
        )

    elif model_name == MODEL_NAIVE_BAYES:
        return GaussianNB()

    else:
        raise ValueError(f"Unknown model name '{model_name}'. Allowed options: {ALL_MODELS}")


def generate_random_feature_subset(
    total_feature_names: List[str],
    subset_size: int,
    random_state: int = RANDOM_STATE,
    ga_selected_indices: Optional[List[int]] = None,
    save_path: str = "models/random_feature_selection.joblib"
) -> Dict[str, Any]:
    """
    Generate a reproducible random feature subset matching the GA selected feature count.

    Parameters
    ----------
    total_feature_names : List[str]
        Full list of feature names available in dataset.
    subset_size : int
        Target number of features to select (must equal GA feature count).
    random_state : int
        Random seed.
    ga_selected_indices : List[int], optional
        GA selected feature indices to ensure the random subset is not identical.
    save_path : str
        Path to persist the random feature selection artifact.

    Returns
    -------
    Dict[str, Any]
        Dictionary containing random selected indices, feature names, count, and random_state.
    """
    num_total = len(total_feature_names)
    if subset_size <= 0 or subset_size > num_total:
        raise ValueError(f"subset_size ({subset_size}) must be between 1 and {num_total}")

    rng = np.random.RandomState(random_state)
    all_indices = list(range(num_total))

    # Perform initial random sample
    random_indices = sorted(rng.choice(all_indices, size=subset_size, replace=False).tolist())

    # If randomly sampled subset happens to be identical to GA subset, regenerate deterministically
    if ga_selected_indices is not None and sorted(random_indices) == sorted(ga_selected_indices):
        # Shift random seed to ensure difference
        rng_alt = np.random.RandomState(random_state + 999)
        random_indices = sorted(rng_alt.choice(all_indices, size=subset_size, replace=False).tolist())

    random_feature_names = [total_feature_names[i] for i in random_indices]

    artifact = {
        "dataset_scope": "full_standard_dataset" if num_total == 30 else "test_fixture_dataset",
        "selected_indices": random_indices,
        "selected_feature_names": random_feature_names,
        "total_features": num_total,
        "selected_feature_count": len(random_indices),
        "random_state": random_state
    }

    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        joblib.dump(artifact, save_path)

    return artifact


def load_random_feature_result(save_path: str = "models/random_feature_selection.joblib") -> Optional[Dict[str, Any]]:
    """
    Load persisted Random Feature selection artifact.
    """
    if os.path.exists(save_path):
        try:
            return joblib.load(save_path)
        except Exception:
            return None
    return None


def get_feature_subset_matrices(
    X_train_smote: pd.DataFrame,
    X_test_scaled: pd.DataFrame,
    feature_set_name: str,
    ga_artifact: Optional[Dict[str, Any]] = None,
    random_artifact: Optional[Dict[str, Any]] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, List[str], List[int]]:
    """
    Extract specific feature columns for training and testing matrices based on feature set configuration.

    Parameters
    ----------
    X_train_smote : pd.DataFrame
        Full SMOTE-balanced training features dataframe.
    X_test_scaled : pd.DataFrame
        Full scaled testing features dataframe.
    feature_set_name : str
        "Full Features", "GA Features", or "Random Features".
    ga_artifact : dict, optional
        Loaded GA artifact dictionary.
    random_artifact : dict, optional
        Loaded Random feature artifact dictionary.

    Returns
    -------
    Tuple[pd.DataFrame, pd.DataFrame, List[str], List[int]]
        (X_tr_sub, X_te_sub, selected_feature_names, selected_indices)
    """
    all_feature_names = list(X_train_smote.columns)
    total_cols = len(all_feature_names)

    if feature_set_name == FEATURE_SET_FULL:
        indices = list(range(total_cols))
        names = all_feature_names
        return X_train_smote, X_test_scaled, names, indices

    elif feature_set_name == FEATURE_SET_GA:
        if ga_artifact is None:
            raise ValueError("GA Feature Set requested but ga_artifact is None or missing.")
        indices = ga_artifact['selected_indices']
        names = ga_artifact['selected_feature_names']

        X_tr_sub = X_train_smote.iloc[:, indices]
        X_te_sub = X_test_scaled.iloc[:, indices]
        return X_tr_sub, X_te_sub, names, indices

    elif feature_set_name == FEATURE_SET_RANDOM:
        if random_artifact is None:
            if ga_artifact is not None:
                ga_count = ga_artifact['selected_feature_count']
                ga_indices = ga_artifact['selected_indices']
            else:
                ga_count = max(1, total_cols // 2)
                ga_indices = None
            random_artifact = generate_random_feature_subset(
                total_feature_names=all_feature_names,
                subset_size=ga_count,
                random_state=RANDOM_STATE,
                ga_selected_indices=ga_indices
            )

        indices = random_artifact['selected_indices']
        names = random_artifact['selected_feature_names']

        X_tr_sub = X_train_smote.iloc[:, indices]
        X_te_sub = X_test_scaled.iloc[:, indices]
        return X_tr_sub, X_te_sub, names, indices

    else:
        raise ValueError(f"Unknown feature set configuration '{feature_set_name}'. Allowed: {ALL_FEATURE_SETS}")


def train_model(
    model_name: str,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    random_state: int = RANDOM_STATE
) -> Tuple[Any, float]:
    """
    Train a classifier model on supplied training data and record training duration.

    Parameters
    ----------
    model_name : str
        Classifier model identifier.
    X_train : pd.DataFrame
        Training feature matrix.
    y_train : pd.Series
        Training labels.
    random_state : int
        Random seed.

    Returns
    -------
    Tuple[Any, float]
        (fitted_model_instance, training_duration_seconds)
    """
    model = get_model(model_name, random_state=random_state)

    t0 = time.perf_counter()
    model.fit(X_train, y_train)
    training_time = time.perf_counter() - t0

    return model, float(training_time)


def get_model_filename(model_name: str, feature_set_name: str) -> str:
    """
    Helper to generate normalized joblib filename for trained models.
    Maps to standard names: decision_tree_full.joblib, random_forest_ga.joblib, etc.
    """
    m_map = {
        MODEL_DECISION_TREE: "decision_tree",
        MODEL_RANDOM_FOREST: "random_forest",
        MODEL_LOGISTIC_REGRESSION: "logistic_regression",
        MODEL_ANN: "ann",
        MODEL_NAIVE_BAYES: "naive_bayes"
    }
    f_map = {
        FEATURE_SET_FULL: "full",
        FEATURE_SET_GA: "ga",
        FEATURE_SET_RANDOM: "random"
    }
    m_slug = m_map.get(model_name, model_name.lower().replace(" ", "_"))
    f_slug = f_map.get(feature_set_name, feature_set_name.lower().replace(" ", "_"))
    return f"{m_slug}_{f_slug}.joblib"


def save_trained_model(
    model_name: str,
    feature_set_name: str,
    model: Any,
    feature_names: List[str],
    feature_indices: List[int],
    training_time: float,
    training_samples: int,
    dataset_scope: str = "full_standard_dataset",
    save_dir: str = "models/trained"
) -> str:
    """
    Save trained model instance along with metadata to joblib file.

    Returns
    -------
    str
        Filepath to saved model artifact.
    """
    os.makedirs(save_dir, exist_ok=True)
    filename = get_model_filename(model_name, feature_set_name)
    filepath = os.path.join(save_dir, filename)

    artifact = {
        "model_name": model_name,
        "feature_set": feature_set_name,
        "feature_set_name": feature_set_name,
        "model": model,
        "feature_names": feature_names,
        "feature_indices": feature_indices,
        "feature_count": len(feature_names),
        "training_time": training_time,
        "training_sample_count": training_samples,
        "training_samples": training_samples,
        "dataset_scope": dataset_scope,
        "random_state": RANDOM_STATE,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    joblib.dump(artifact, filepath)
    return filepath


def load_trained_model(
    model_name: str,
    feature_set_name: str,
    save_dir: str = "models/trained"
) -> Optional[Dict[str, Any]]:
    """
    Load trained model artifact dictionary from disk.
    Supports both standard short filename (e.g. decision_tree_full.joblib)
    and legacy long filename (e.g. decision_tree_full_features.joblib).
    """
    filename = get_model_filename(model_name, feature_set_name)
    filepath = os.path.join(save_dir, filename)
    if os.path.exists(filepath):
        try:
            return joblib.load(filepath)
        except Exception:
            pass

    # Legacy fallback check
    m_slug = model_name.lower().replace(" ", "_")
    f_slug = feature_set_name.lower().replace(" ", "_")
    legacy_filepath = os.path.join(save_dir, f"{m_slug}_{f_slug}.joblib")
    if os.path.exists(legacy_filepath):
        try:
            return joblib.load(legacy_filepath)
        except Exception:
            pass

    return None


def predict_model(model: Any, X: pd.DataFrame) -> np.ndarray:
    """
    Generate class predictions using trained classifier.
    """
    return model.predict(X)


def predict_proba_model(model: Any, X: pd.DataFrame) -> Optional[np.ndarray]:
    """
    Generate prediction probabilities if supported by classifier.
    """
    if hasattr(model, "predict_proba"):
        try:
            return model.predict_proba(X)
        except Exception:
            return None
    return None
