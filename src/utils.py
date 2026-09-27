"""
Utility constants and helper functions for Credit Card Fraud Detection.
"""

from typing import Optional, List
import pandas as pd

# Global Random State for Reproducibility
RANDOM_STATE: int = 42

# Recognized target column names in order of preference
TARGET_ALIASES: List[str] = [
    'Class',
    'class',
    'target',
    'Target',
    'fraud',
    'Fraud'
]


def find_target_column(df: pd.DataFrame) -> Optional[str]:
    """
    Detect the target column in the given DataFrame based on common aliases.

    Parameters
    ----------
    df : pd.DataFrame
        The loaded dataset.

    Returns
    -------
    Optional[str]
        The matching target column name if found, else None.
    """
    for alias in TARGET_ALIASES:
        if alias in df.columns:
            return alias

    # Secondary fallback: case-insensitive check
    df_cols_lower = {col.lower(): col for col in df.columns}
    for alias in TARGET_ALIASES:
        if alias.lower() in df_cols_lower:
            return df_cols_lower[alias.lower()]

    return None
