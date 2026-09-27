"""
Genetic Algorithm (GA) Based Feature Selection Module.
Uses Random Forest Classifier as the fitness evaluator to identify optimal feature subsets.

Data Leakage Prevention Safeguard:
1. GA validation split is created BEFORE SMOTE on the original scaled training data (X_train_scaled, y_train).
2. SMOTE is applied ONLY to the GA training portion (X_ga_tr, y_ga_tr).
3. The GA validation portion (X_ga_val, y_ga_val) is NEVER SMOTEd and retains the original natural class distribution.
4. The final test set (X_test_scaled, y_test) is NEVER accessed during GA optimization.
"""

from dataclasses import dataclass, field
import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any, Optional

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

from src.utils import RANDOM_STATE
from src.data_preprocessing import apply_smote


@dataclass
class GAConfig:
    """
    Configuration dataclass for Genetic Algorithm parameters.
    """
    population_size: int = 20
    generations: int = 10
    crossover_probability: float = 0.8
    mutation_probability: float = 0.05
    tournament_size: int = 3
    elite_count: int = 1
    random_state: int = RANDOM_STATE
    rf_estimators: int = 50

    def validate(self):
        """Validate GA hyperparameter bounds."""
        if self.population_size < 2:
            raise ValueError("population_size must be >= 2")
        if self.generations < 1:
            raise ValueError("generations must be >= 1")
        if not (0.0 <= self.crossover_probability <= 1.0):
            raise ValueError("crossover_probability must be between 0.0 and 1.0")
        if not (0.0 <= self.mutation_probability <= 1.0):
            raise ValueError("mutation_probability must be between 0.0 and 1.0")
        if not (1 <= self.tournament_size <= self.population_size):
            raise ValueError("tournament_size must be between 1 and population_size")
        if not (0 <= self.elite_count < self.population_size):
            raise ValueError("elite_count must be < population_size")
        if self.rf_estimators < 5:
            raise ValueError("rf_estimators must be >= 5")


def initialize_population(
    pop_size: int,
    num_features: int,
    random_state: int = RANDOM_STATE
) -> np.ndarray:
    """
    Generate initial population of binary chromosomes.

    Parameters
    ----------
    pop_size : int
        Number of chromosomes in population.
    num_features : int
        Length of each chromosome (number of features).
    random_state : int
        Random seed for reproducibility.

    Returns
    -------
    np.ndarray
        2D binary array of shape (pop_size, num_features).
    """
    rng = np.random.RandomState(random_state)
    # Random binary matrix (0 or 1)
    population = rng.randint(0, 2, size=(pop_size, num_features))

    # Repair any all-zero chromosomes
    for i in range(pop_size):
        population[i] = ensure_valid_chromosome(population[i], rng)

    return population


def ensure_valid_chromosome(
    chromosome: np.ndarray,
    rng: Optional[np.random.RandomState] = None
) -> np.ndarray:
    """
    Ensure chromosome has at least one active feature (prevents empty feature subsets).

    Parameters
    ----------
    chromosome : np.ndarray
        1D binary numpy array.
    rng : np.random.RandomState, optional
        Random generator instance.

    Returns
    -------
    np.ndarray
        Repaired binary chromosome with sum > 0.
    """
    chrom = np.array(chromosome, dtype=int).copy()
    if np.sum(chrom) == 0:
        if rng is None:
            rng = np.random.RandomState(RANDOM_STATE)
        idx = rng.randint(0, len(chrom))
        chrom[idx] = 1
    return chrom


def evaluate_chromosome(
    chromosome: np.ndarray,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    rf_estimators: int = 50,
    random_state: int = RANDOM_STATE,
    fitness_cache: Optional[Dict[Tuple[int, ...], float]] = None
) -> Tuple[float, Dict[str, float]]:
    """
    Evaluate fitness of a feature subset chromosome using a Random Forest classifier.

    Fitness Metric: Validation F1-Score (Primary metric due to class imbalance context).

    Parameters
    ----------
    chromosome : np.ndarray
        1D binary array representing feature selection mask.
    X_train : pd.DataFrame
        Balanced GA training features (SMOTE applied).
    y_train : pd.Series
        Balanced GA training labels (SMOTE applied).
    X_val : pd.DataFrame
        Natural, imbalanced GA validation features (SMOTE NOT applied).
    y_val : pd.Series
        Natural, imbalanced GA validation labels (SMOTE NOT applied).
    rf_estimators : int
        Number of trees in Random Forest fitness evaluator.
    random_state : int
        Random state seed.
    fitness_cache : dict, optional
        Cache dictionary mapping chromosome tuples to computed fitness scores.

    Returns
    -------
    Tuple[float, Dict[str, float]]
        (fitness_score, metrics_dict)
    """
    chrom_tuple = tuple(chromosome)
    if fitness_cache is not None and chrom_tuple in fitness_cache:
        cached_f1 = fitness_cache[chrom_tuple]
        return cached_f1, {"f1": cached_f1, "cached": 1.0}

    # Extract selected feature indices
    selected_indices = np.where(chromosome == 1)[0]
    if len(selected_indices) == 0:
        return 0.0, {"f1": 0.0, "precision": 0.0, "recall": 0.0, "roc_auc": 0.5}

    X_tr_sub = X_train.iloc[:, selected_indices]
    X_val_sub = X_val.iloc[:, selected_indices]

    # Train Random Forest fitness evaluator
    rf = RandomForestClassifier(
        n_estimators=rf_estimators,
        random_state=random_state,
        n_jobs=-1
    )
    rf.fit(X_tr_sub, y_train)

    y_pred = rf.predict(X_val_sub)
    f1 = float(f1_score(y_val, y_pred, zero_division=0))
    precision = float(precision_score(y_val, y_pred, zero_division=0))
    recall = float(recall_score(y_val, y_pred, zero_division=0))

    try:
        y_proba = rf.predict_proba(X_val_sub)[:, 1]
        auc = float(roc_auc_score(y_val, y_proba))
    except Exception:
        auc = 0.5

    metrics = {
        "f1": f1,
        "precision": precision,
        "recall": recall,
        "roc_auc": auc
    }

    if fitness_cache is not None:
        fitness_cache[chrom_tuple] = f1

    return f1, metrics


def tournament_selection(
    population: np.ndarray,
    fitnesses: np.ndarray,
    tournament_size: int,
    rng: np.random.RandomState
) -> np.ndarray:
    """
    Select one parent chromosome using Tournament Selection.
    """
    pop_size = len(population)
    selected_indices = rng.choice(pop_size, size=tournament_size, replace=False)
    tournament_fitnesses = fitnesses[selected_indices]
    winner_idx = selected_indices[np.argmax(tournament_fitnesses)]
    return population[winner_idx].copy()


def two_point_crossover(
    parent1: np.ndarray,
    parent2: np.ndarray,
    crossover_prob: float,
    rng: np.random.RandomState
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Perform two-point crossover between two parent chromosomes.
    """
    if rng.rand() > crossover_prob:
        return parent1.copy(), parent2.copy()

    length = len(parent1)
    if length < 3:
        point = rng.randint(1, length)
        child1 = np.concatenate([parent1[:point], parent2[point:]])
        child2 = np.concatenate([parent2[:point], parent1[point:]])
        return child1, child2

    pt1, pt2 = sorted(rng.choice(range(1, length), size=2, replace=False))

    child1 = parent1.copy()
    child2 = parent2.copy()

    child1[pt1:pt2] = parent2[pt1:pt2]
    child2[pt1:pt2] = parent1[pt1:pt2]

    return child1, child2


def bit_flip_mutation(
    chromosome: np.ndarray,
    mutation_prob: float,
    rng: np.random.RandomState
) -> np.ndarray:
    """
    Apply bit-flip mutation to a chromosome.
    """
    mutated = chromosome.copy()
    for i in range(len(mutated)):
        if rng.rand() < mutation_prob:
            mutated[i] = 1 - mutated[i]
    return ensure_valid_chromosome(mutated, rng)


def run_genetic_algorithm(
    X_train_scaled: pd.DataFrame,
    y_train: pd.Series,
    config: Optional[GAConfig] = None,
    save_path: str = "models/ga_feature_selection.joblib",
    progress_callback: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Execute Genetic Algorithm Feature Selection using Random Forest fitness evaluator.

    Clean Methodological Workflow (Leakage-Free Validation):
    1. Splits X_train_scaled, y_train into GA Train (80%) and GA Validation (20%) BEFORE SMOTE.
    2. Applies SMOTE ONLY to the GA Training split -> X_ga_tr_smote, y_ga_tr_smote.
    3. Keeps GA Validation split (X_ga_val, y_ga_val) UNTOUCHED and WITHOUT SMOTE.
    4. Evaluates chromosomes by training RF on X_ga_tr_smote and predicting on X_ga_val (F1 Score).

    Parameters
    ----------
    X_train_scaled : pd.DataFrame
        Original scaled training features before SMOTE (from Part 2).
    y_train : pd.Series
        Original training target labels before SMOTE (from Part 2).
    config : GAConfig, optional
        GA Hyperparameters config instance.
    save_path : str
        File path to save the GA artifact object.
    progress_callback : callable, optional
        Callback function for Streamlit live progress updates (gen, max_gen, best_fit, avg_fit, n_feats).

    Returns
    -------
    Dict[str, Any]
        Dictionary containing GA optimization results, best chromosome, selected feature names,
        metadata, and convergence history DataFrame.
    """
    if config is None:
        config = GAConfig()
    config.validate()

    feature_names = list(X_train_scaled.columns)
    num_features = len(feature_names)

    # Step 1: Create GA Train/Val Split BEFORE SMOTE on original scaled training data
    X_ga_tr, X_ga_val, y_ga_tr, y_ga_val = train_test_split(
        X_train_scaled,
        y_train,
        test_size=0.20,
        random_state=config.random_state,
        stratify=y_train
    )

    # Step 2: Apply SMOTE ONLY to GA Training Data
    X_ga_tr_smote, y_ga_tr_smote, _ = apply_smote(
        X_ga_tr,
        y_ga_tr,
        random_state=config.random_state
    )

    # Step 3: Compute Validation Set Statistics (No SMOTE)
    ga_val_samples = len(X_ga_val)
    ga_val_fraud_count = int((y_ga_val == 1).sum())
    ga_val_fraud_pct = (ga_val_fraud_count / ga_val_samples * 100) if ga_val_samples > 0 else 0.0

    rng = np.random.RandomState(config.random_state)
    fitness_cache: Dict[Tuple[int, ...], float] = {}

    # Step 4: Initialize Population
    population = initialize_population(
        pop_size=config.population_size,
        num_features=num_features,
        random_state=config.random_state
    )

    history = []
    global_best_chromosome: Optional[np.ndarray] = None
    global_best_fitness = -1.0
    global_best_metrics: Dict[str, float] = {}

    # Step 5: Generational Loop
    for gen in range(1, config.generations + 1):
        fitnesses = np.zeros(config.population_size)
        feat_counts = np.zeros(config.population_size, dtype=int)

        # Evaluate Population
        for i in range(config.population_size):
            fit, _ = evaluate_chromosome(
                chromosome=population[i],
                X_train=X_ga_tr_smote,
                y_train=y_ga_tr_smote,
                X_val=X_ga_val,
                y_val=y_ga_val,
                rf_estimators=config.rf_estimators,
                random_state=config.random_state,
                fitness_cache=fitness_cache
            )
            fitnesses[i] = fit
            feat_counts[i] = int(np.sum(population[i]))

        # Track Generation Stats
        best_gen_idx = np.argmax(fitnesses)
        best_gen_fitness = float(fitnesses[best_gen_idx])
        avg_gen_fitness = float(np.mean(fitnesses))
        best_gen_feat_count = int(feat_counts[best_gen_idx])

        # Track Global Best
        if best_gen_fitness > global_best_fitness:
            global_best_fitness = best_gen_fitness
            global_best_chromosome = population[best_gen_idx].copy()
            _, global_best_metrics = evaluate_chromosome(
                chromosome=global_best_chromosome,
                X_train=X_ga_tr_smote,
                y_train=y_ga_tr_smote,
                X_val=X_ga_val,
                y_val=y_ga_val,
                rf_estimators=config.rf_estimators,
                random_state=config.random_state,
                fitness_cache=None
            )

        history.append({
            "Generation": gen,
            "Best Fitness": round(best_gen_fitness, 4),
            "Average Fitness": round(avg_gen_fitness, 4),
            "Selected Features": best_gen_feat_count
        })

        if progress_callback is not None:
            progress_callback(gen, config.generations, best_gen_fitness, avg_gen_fitness, best_gen_feat_count)

        # Elitism: Preserve top elite chromosomes
        elite_indices = np.argsort(fitnesses)[::-1][:config.elite_count]
        new_population = [population[idx].copy() for idx in elite_indices]

        # Generate Offspring for remaining population slots
        while len(new_population) < config.population_size:
            p1 = tournament_selection(population, fitnesses, config.tournament_size, rng)
            p2 = tournament_selection(population, fitnesses, config.tournament_size, rng)

            c1, c2 = two_point_crossover(p1, p2, config.crossover_probability, rng)

            c1 = bit_flip_mutation(c1, config.mutation_probability, rng)
            c2 = bit_flip_mutation(c2, config.mutation_probability, rng)

            new_population.append(c1)
            if len(new_population) < config.population_size:
                new_population.append(c2)

        population = np.array(new_population[:config.population_size])

    # Final extraction
    if global_best_chromosome is None:
        global_best_chromosome = population[0].copy()
        global_best_fitness = 0.0

    selected_indices = np.where(global_best_chromosome == 1)[0].tolist()
    selected_feature_names = [feature_names[i] for i in selected_indices]
    feature_reduction_pct = ((num_features - len(selected_feature_names)) / num_features) * 100.0

    history_df = pd.DataFrame(history)

    result = {
        "best_chromosome": global_best_chromosome.tolist(),
        "best_fitness": round(global_best_fitness, 4),
        "fitness_metric": "F1-Score",
        "fitness_evaluator": "RandomForestClassifier",
        "selected_indices": selected_indices,
        "selected_feature_names": selected_feature_names,
        "total_features": num_features,
        "selected_feature_count": len(selected_feature_names),
        "removed_feature_count": num_features - len(selected_feature_names),
        "feature_reduction_pct": round(feature_reduction_pct, 2),
        "config": config.__dict__,
        "history_df": history_df,
        "metrics": global_best_metrics,

        # Methodology Validation Metadata
        "dataset_scope": "full_standard_dataset" if len(X_train_scaled) > 10000 else "test_fixture_dataset",
        "ga_train_before_smote_samples": len(X_ga_tr),
        "ga_train_after_smote_samples": len(X_ga_tr_smote),
        "ga_train_fraud_count_after_smote": int((y_ga_tr_smote == 1).sum()),
        "ga_val_samples": ga_val_samples,
        "ga_val_fraud_count": ga_val_fraud_count,
        "ga_val_fraud_pct": round(ga_val_fraud_pct, 4),
        "ga_val_smote_applied": False,
        "test_set_untouched": True
    }

    # Save artifact
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        joblib.dump(result, save_path)

    return result


def load_ga_result(save_path: str = "models/ga_feature_selection.joblib") -> Optional[Dict[str, Any]]:
    """
    Load persisted GA feature selection result dictionary.
    """
    if os.path.exists(save_path):
        try:
            return joblib.load(save_path)
        except Exception:
            return None
    return None
