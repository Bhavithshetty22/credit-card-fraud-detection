"""
Visualization module for Credit Card Fraud EDA using Matplotlib and Seaborn.
"""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import Optional

# Set consistent plotting aesthetic
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')


def plot_class_distribution(
    legit_count: int,
    fraud_count: int,
    legit_pct: float,
    fraud_pct: float
) -> plt.Figure:
    """
    Create a bar chart visualizing the class distribution (Legitimate vs Fraudulent).

    Parameters
    ----------
    legit_count : int
        Number of legitimate transactions.
    fraud_count : int
        Number of fraudulent transactions.
    legit_pct : float
        Percentage of legitimate transactions.
    fraud_pct : float
        Percentage of fraudulent transactions.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    fig, ax = plt.subplots(figsize=(8, 5))

    categories = ['Legitimate (0)', 'Fraudulent (1)']
    counts = [legit_count, fraud_count]
    colors = ['#1f77b4', '#d9534f']

    bars = ax.bar(categories, counts, color=colors, width=0.5, edgecolor='black', alpha=0.85)

    ax.set_title('Target Class Distribution', fontsize=14, fontweight='bold', pad=15)
    ax.set_ylabel('Transaction Count', fontsize=12)
    ax.set_yscale('log')  # Log scale to make extreme imbalance visually clear
    ax.grid(axis='y', linestyle='--', alpha=0.7)

    # Annotate counts and percentages on top of bars
    for bar, count, pct in zip(bars, counts, [legit_pct, fraud_pct]):
        height = bar.get_height()
        ax.annotate(
            f'{count:,}\n({pct:.3f}%)',
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 8),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=11, fontweight='bold'
        )

    plt.tight_layout()
    return fig


def plot_correlation_heatmap(df: pd.DataFrame, annot: bool = False) -> plt.Figure:
    """
    Create a correlation heatmap for numerical features in the dataset.

    Parameters
    ----------
    df : pd.DataFrame
        Dataset containing numerical columns.
    annot : bool
        Whether to annotate numerical values in heatmap cells.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    num_df = df.select_dtypes(include=[np.number])
    corr = num_df.corr()

    # Dynamic figure size depending on number of features
    num_features = num_df.shape[1]
    fig_size = max(10, min(16, num_features * 0.45))

    fig, ax = plt.subplots(figsize=(fig_size, fig_size * 0.85))

    sns.heatmap(
        corr,
        ax=ax,
        cmap='coolwarm',
        vmin=-1.0,
        vmax=1.0,
        center=0,
        annot=annot,
        fmt='.2f',
        annot_kws={"size": 7},
        cbar_kws={'label': 'Pearson Correlation Coefficient'},
        linewidths=0.5,
        linecolor='white'
    )

    ax.set_title('Feature Correlation Heatmap', fontsize=14, fontweight='bold', pad=15)
    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()
    return fig


def plot_amount_distribution(
    df: pd.DataFrame,
    amount_col: str = 'Amount',
    target_col: Optional[str] = None
) -> plt.Figure:
    """
    Plot the distribution of transaction amounts (overall and by class if target_col is provided).

    Parameters
    ----------
    df : pd.DataFrame
        Dataset DataFrame.
    amount_col : str
        Column name representing transaction amount.
    target_col : Optional[str]
        Target column name for class breakdown.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Overall Distribution (Log Scale)
    sns.histplot(
        df[amount_col],
        bins=50,
        kde=True,
        ax=axes[0],
        color='#2b5c8f',
        log_scale=(False, True)
    )
    axes[0].set_title('Overall Amount Distribution (Log Scale)', fontsize=12, fontweight='bold')
    axes[0].set_xlabel('Transaction Amount', fontsize=11)
    axes[0].set_ylabel('Frequency (Log Count)', fontsize=11)

    # Class Breakdown Distribution (if target_col is valid)
    if target_col and target_col in df.columns:
        legit_amounts = df[df[target_col] == 0][amount_col] if 0 in df[target_col].values else df[amount_col]
        fraud_amounts = df[df[target_col] == 1][amount_col] if 1 in df[target_col].values else df[df[target_col] != 0][amount_col]

        sns.kdeplot(legit_amounts, ax=axes[1], label='Legitimate', color='#1f77b4', fill=True, alpha=0.3)
        sns.kdeplot(fraud_amounts, ax=axes[1], label='Fraudulent', color='#d9534f', fill=True, alpha=0.5)
        axes[1].set_title('Legitimate vs Fraudulent Amount Density', fontsize=12, fontweight='bold')
        axes[1].set_xlabel('Transaction Amount', fontsize=11)
        axes[1].set_ylabel('Density', fontsize=11)
        axes[1].legend()
    else:
        # Boxplot fallback
        sns.boxplot(x=df[amount_col], ax=axes[1], color='#2b5c8f')
        axes[1].set_title('Transaction Amount Boxplot', fontsize=12, fontweight='bold')
        axes[1].set_xlabel('Amount', fontsize=11)

    plt.tight_layout()
    return fig


def plot_time_distribution(
    df: pd.DataFrame,
    time_col: str = 'Time',
    target_col: Optional[str] = None
) -> plt.Figure:
    """
    Plot the distribution of transaction time (seconds elapsed).

    Parameters
    ----------
    df : pd.DataFrame
        Dataset DataFrame.
    time_col : str
        Column name representing transaction time.
    target_col : Optional[str]
        Target column name for class breakdown.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    fig, ax = plt.subplots(figsize=(10, 5))

    if target_col and target_col in df.columns:
        sns.histplot(
            data=df,
            x=time_col,
            hue=target_col,
            bins=50,
            kde=True,
            palette={0: '#1f77b4', 1: '#d9534f'},
            ax=ax,
            alpha=0.6,
            element='step'
        )
        ax.set_title('Transaction Time Distribution by Class (Seconds)', fontsize=13, fontweight='bold', pad=12)
    else:
        sns.histplot(df[time_col], bins=50, kde=True, ax=ax, color='#2b5c8f')
        ax.set_title('Transaction Time Distribution (Seconds)', fontsize=13, fontweight='bold', pad=12)

    ax.set_xlabel('Time (Seconds)', fontsize=11)
    ax.set_ylabel('Transaction Count', fontsize=11)

    plt.tight_layout()
    return fig


def plot_split_class_distribution(y_train: pd.Series, y_test: pd.Series) -> plt.Figure:
    """
    Create a side-by-side visualization comparing class proportions in Training vs Testing sets
    to demonstrate preserved stratification.

    Parameters
    ----------
    y_train : pd.Series
        Target labels for training set.
    y_test : pd.Series
        Target labels for testing set.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    train_counts = y_train.value_counts()
    test_counts = y_test.value_counts()

    train_legit = train_counts.get(0, 0)
    train_fraud = train_counts.get(1, 0)
    train_total = len(y_train)

    test_legit = test_counts.get(0, 0)
    test_fraud = test_counts.get(1, 0)
    test_total = len(y_test)

    train_pcts = [(train_legit / train_total * 100) if train_total > 0 else 0, (train_fraud / train_total * 100) if train_total > 0 else 0]
    test_pcts = [(test_legit / test_total * 100) if test_total > 0 else 0, (test_fraud / test_total * 100) if test_total > 0 else 0]

    categories = ['Legitimate (0)', 'Fraudulent (1)']
    colors = ['#1f77b4', '#d9534f']

    # Training Split Plot
    bars_train = axes[0].bar(categories, train_pcts, color=colors, width=0.45, edgecolor='black', alpha=0.85)
    axes[0].set_title(f'Training Set Distribution (N={train_total:,})', fontsize=12, fontweight='bold')
    axes[0].set_ylabel('Percentage of Set (%)', fontsize=11)
    axes[0].set_ylim(0, 115)
    axes[0].grid(axis='y', linestyle='--', alpha=0.7)

    for bar, count, pct in zip(bars_train, [train_legit, train_fraud], train_pcts):
        axes[0].annotate(
            f'{count:,}\n({pct:.3f}%)',
            xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=10, fontweight='bold'
        )

    # Testing Split Plot
    bars_test = axes[1].bar(categories, test_pcts, color=colors, width=0.45, edgecolor='black', alpha=0.85)
    axes[1].set_title(f'Testing Set Distribution (N={test_total:,})', fontsize=12, fontweight='bold')
    axes[1].set_ylabel('Percentage of Set (%)', fontsize=11)
    axes[1].set_ylim(0, 115)
    axes[1].grid(axis='y', linestyle='--', alpha=0.7)

    for bar, count, pct in zip(bars_test, [test_legit, test_fraud], test_pcts):
        axes[1].annotate(
            f'{count:,}\n({pct:.3f}%)',
            xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=10, fontweight='bold'
        )

    plt.tight_layout()
    return fig


def plot_smote_comparison(y_train_before: pd.Series, y_train_after: pd.Series) -> plt.Figure:
    """
    Create side-by-side bar plots comparing the training class distribution before and after SMOTE.

    Parameters
    ----------
    y_train_before : pd.Series
        Original imbalanced training set labels.
    y_train_after : pd.Series
        Balanced training set labels after SMOTE.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    before_counts = y_train_before.value_counts()
    after_counts = y_train_after.value_counts()

    b_legit = before_counts.get(0, 0)
    b_fraud = before_counts.get(1, 0)
    b_total = len(y_train_before)
    b_fraud_pct = (b_fraud / b_total * 100) if b_total > 0 else 0

    a_legit = after_counts.get(0, 0)
    a_fraud = after_counts.get(1, 0)
    a_total = len(y_train_after)
    a_fraud_pct = (a_fraud / a_total * 100) if a_total > 0 else 0

    categories = ['Legitimate (0)', 'Fraudulent (1)']
    colors = ['#1f77b4', '#d9534f']

    # Before SMOTE (Log scale to clearly show count disparity)
    bars_before = axes[0].bar(categories, [b_legit, b_fraud], color=colors, width=0.45, edgecolor='black', alpha=0.85)
    axes[0].set_title(f'Before SMOTE (Imbalanced: {b_total:,} samples)', fontsize=12, fontweight='bold')
    axes[0].set_ylabel('Transaction Count (Log Scale)', fontsize=11)
    axes[0].set_yscale('log')
    axes[0].grid(axis='y', linestyle='--', alpha=0.7)

    for bar, count, pct in zip(bars_before, [b_legit, b_fraud], [100.0 - b_fraud_pct, b_fraud_pct]):
        axes[0].annotate(
            f'{count:,}\n({pct:.3f}%)',
            xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
            xytext=(0, 6),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=10, fontweight='bold'
        )

    # After SMOTE (Linear scale showing 1:1 balance)
    bars_after = axes[1].bar(categories, [a_legit, a_fraud], color=colors, width=0.45, edgecolor='black', alpha=0.85)
    axes[1].set_title(f'After SMOTE (Balanced: {a_total:,} samples)', fontsize=12, fontweight='bold')
    axes[1].set_ylabel('Transaction Count', fontsize=11)
    axes[1].set_ylim(0, max(a_legit, a_fraud) * 1.25)
    axes[1].grid(axis='y', linestyle='--', alpha=0.7)

    for bar, count, pct in zip(bars_after, [a_legit, a_fraud], [100.0 - a_fraud_pct, a_fraud_pct]):
        axes[1].annotate(
            f'{count:,}\n({pct:.1f}%)',
            xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
            xytext=(0, 6),
            textcoords="offset points",
            ha='center', va='bottom',
            fontsize=10, fontweight='bold'
        )

    plt.tight_layout()
    return fig


def plot_ga_convergence(history_df: pd.DataFrame) -> plt.Figure:
    """
    Plot Genetic Algorithm convergence curve (Best Fitness & Average Fitness vs. Generation).

    Parameters
    ----------
    history_df : pd.DataFrame
        DataFrame containing 'Generation', 'Best Fitness', 'Average Fitness', 'Selected Features'.

    Returns
    -------
    plt.Figure
        Matplotlib figure object.
    """
    fig, ax1 = plt.subplots(figsize=(10, 5))

    gens = history_df['Generation']
    best_fit = history_df['Best Fitness']
    avg_fit = history_df['Average Fitness']

    line1 = ax1.plot(gens, best_fit, marker='o', color='#2b5c8f', linewidth=2.5, label='Best Fitness (F1)')
    line2 = ax1.plot(gens, avg_fit, marker='s', linestyle='--', color='#28a745', linewidth=2.0, label='Average Fitness (F1)')

    ax1.set_xlabel('Generation', fontsize=11, fontweight='bold')
    ax1.set_ylabel('Fitness (Validation F1-Score)', fontsize=11, fontweight='bold', color='#2b5c8f')
    ax1.set_xticks(gens)
    ax1.grid(True, linestyle='--', alpha=0.6)

    # Secondary y-axis for selected features count if present
    if 'Selected Features' in history_df.columns:
        ax2 = ax1.twinx()
        feats = history_df['Selected Features']
        line3 = ax2.plot(gens, feats, marker='^', linestyle=':', color='#d9534f', linewidth=1.8, label='Selected Features Count')
        ax2.set_ylabel('Selected Features Count', fontsize=11, fontweight='bold', color='#d9534f')

        # Combine legends
        lines = line1 + line2 + line3
        labels = [l.get_label() for l in lines]
        ax1.legend(lines, labels, loc='center right', frameon=True, facecolor='white', framealpha=0.9)
    else:
        ax1.legend(loc='lower right', frameon=True)

    plt.title('Genetic Algorithm Optimization Convergence History', fontsize=13, fontweight='bold', pad=12)
    plt.tight_layout()
    return fig
