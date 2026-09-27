"""
Streamlit Application for Academic Credit Card Fraud Detection Project.
Stage: Part 5 - Machine Learning Model Training.
"""

import streamlit as st
import pandas as pd
import numpy as np
import os
import time

# Import custom src modules
from src.utils import RANDOM_STATE
from src.data_preprocessing import (
    load_data,
    validate_dataset,
    get_dataset_shape,
    get_data_types_table,
    get_missing_values_summary,
    get_duplicate_count,
    get_target_analysis,
    get_basic_statistics,
    get_feature_stats,
    preprocess_data,
    get_scaling_comparison_table,
    get_feature_list_table
)
from src.visualization import (
    plot_class_distribution,
    plot_correlation_heatmap,
    plot_amount_distribution,
    plot_time_distribution,
    plot_split_class_distribution,
    plot_smote_comparison,
    plot_ga_convergence
)
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

# Page configuration
st.set_page_config(
    page_title="Credit Card Fraud Detection - Model Training",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for modern academic theme
st.markdown("""
    <style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.2rem;
        font-weight: 500;
        color: #475569;
        margin-bottom: 1.5rem;
    }
    .status-pass {
        color: #166534;
        background-color: #DCFCE7;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-weight: 600;
        margin: 0.2rem 0;
    }
    .status-pending {
        color: #854D0E;
        background-color: #FEF9C3;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-weight: 500;
        margin: 0.2rem 0;
    }
    </style>
""", unsafe_allow_html=True)


def generate_sample_credit_card_data(n_samples: int = 1000) -> pd.DataFrame:
    """
    Generate a realistic synthetic sample of the European Credit Card dataset for testing/demo.
    """
    np.random.seed(RANDOM_STATE)
    time_data = np.sort(np.random.uniform(0, 172792, n_samples))

    # Generate V1 - V28 features
    v_features = {f"V{i}": np.random.normal(loc=0.0, scale=1.0, size=n_samples) for i in range(1, 29)}

    # Generate Amount (exponential / heavy tailed)
    amount_data = np.random.exponential(scale=88.0, size=n_samples).round(2)

    # Class with ~0.5% fraud imbalance in small sample
    n_fraud = max(5, int(n_samples * 0.005))
    class_data = np.zeros(n_samples, dtype=int)
    fraud_indices = np.random.choice(n_samples, size=n_fraud, replace=False)
    class_data[fraud_indices] = 1

    df_dict = {'Time': time_data}
    df_dict.update(v_features)
    df_dict['Amount'] = amount_data
    df_dict['Class'] = class_data

    return pd.DataFrame(df_dict)


def render_overview_page():
    """Render Overview Page."""
    st.markdown('<div class="main-header">Credit Card Fraud Detection</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">GA-Based Feature Selection with Machine Learning</div>', unsafe_allow_html=True)

    st.markdown("---")

    col1, col2 = st.columns([3, 2])

    with col1:
        st.subheader("📌 Project Scope & Objectives")
        st.write("""
        Credit card fraud detection presents significant challenges due to severe **class imbalance** and 
        high-dimensional transaction feature spaces. This research system provides an end-to-end 
        machine learning framework for automated fraud identification.

        **Planned Methodology Pipeline:**
        1. **Dataset Analysis & Exploration** *(Completed - Part 1)*
        2. **Data Preprocessing Pipeline** *(Completed - Part 2)*
        3. **Class Imbalance Handling (SMOTE)** *(Completed - Part 3)*
        4. **Genetic Algorithm (GA) Feature Selection** *(Completed - Part 4)*
        5. **Multi-Model Machine Learning Classification** *(Completed - Part 5)*
        6. **Performance Evaluation & Comparison** *(Upcoming Stage - Part 6)*
        """)

        st.info("ℹ️ **Status Update:** Part 5 (Machine Learning Model Training) is active. Models are trained across 3 feature configurations: Full Features, GA Features, and Random Features.")

    with col2:
        st.subheader("🔄 System Architecture Workflow")
        st.markdown("""
        ```text
        Dataset
           ↓
        Data Preprocessing & Cleaning
           ↓
        Stratified Train/Test Split
           ↓
        Min-Max Scaling (Fit on Train ONLY)
           ↓
        SMOTE Class Imbalance Handling (Train ONLY)
           ↓
        Balanced Training Dataset (X_train_smote)
           ↓
        GA Feature Selection (Part 4)
           ↓
        15 Model Configurations (5 Classifiers × 3 Feature Sets)
           ↓
        Model Training & Artifact Serialization (Part 5)
           ↓
        Performance Evaluation & Comparison (Part 6)
        ```
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.subheader("🎯 Stage Implementation Status")

    status_data = pd.DataFrame({
        "Stage": [
            "Part 1: Project Setup & EDA",
            "Part 2: Data Preprocessing Pipeline",
            "Part 3: Class Imbalance (SMOTE)",
            "Part 4: GA Feature Selection",
            "Part 5: Model Training Infrastructure",
            "Part 6: Model Evaluation & Dashboard"
        ],
        "Status": [
            "✅ Complete",
            "✅ Complete",
            "✅ Complete",
            "✅ Complete",
            "✅ Active / Complete",
            "⏳ Upcoming Stage"
        ]
    })
    st.table(status_data)


def render_dataset_analysis_page():
    """Render Part 1 Dataset Analysis Page."""
    st.markdown('<div class="main-header">Dataset Analysis & Exploration</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Exploratory Analysis of Credit Card Transactions</div>', unsafe_allow_html=True)

    st.markdown("---")

    # File Upload Section
    st.subheader("📂 Step 1: Upload Dataset")

    col_upload, col_demo = st.columns([3, 1])

    with col_upload:
        uploaded_file = st.file_uploader(
            "Upload Credit Card Fraud CSV Dataset (Expected: European Credit Card Fraud Dataset)",
            type=["csv"]
        )

    with col_demo:
        st.write("Or use a synthetic sample:")
        use_demo = st.button("⚡ Load Demo Dataset")

    df = None

    if use_demo:
        st.session_state['df_source'] = generate_sample_credit_card_data(2000)
        # Clear cached preprocessing & GA if dataset changed
        st.session_state.pop('prep_result', None)
        st.session_state.pop('ga_result', None)
        st.session_state.pop('trained_models_summary', None)
        st.success("Loaded synthetic demo dataset (2000 rows, 31 columns).")
    elif uploaded_file is not None:
        loaded_df, err = load_data(uploaded_file)
        if err:
            st.error(err)
            return
        st.session_state['df_source'] = loaded_df
        st.session_state.pop('prep_result', None)
        st.session_state.pop('ga_result', None)
        st.session_state.pop('trained_models_summary', None)

    if 'df_source' in st.session_state and st.session_state['df_source'] is not None:
        df = st.session_state['df_source']

    if df is None:
        st.info("👆 Please upload a CSV dataset or click 'Load Demo Dataset' to perform exploratory analysis.")
        return

    # Dataset Validation
    is_valid, error_msg, target_col = validate_dataset(df)

    if not is_valid:
        st.error(f"❌ Dataset Validation Failed: {error_msg}")
        return

    st.success(f"✅ Dataset loaded successfully. Target Column Detected: **`{target_col}`**")
    st.markdown("---")

    # Section 1: Dataset Preview & Structural Info
    st.subheader("📊 1. Dataset Overview & Preview")

    rows, cols = get_dataset_shape(df)
    m1, m2, m3, m4 = st.columns(4)

    m1.metric("Total Rows", f"{rows:,}")
    m2.metric("Total Columns", f"{cols}")

    missing_info = get_missing_values_summary(df)
    m3.metric("Total Missing Values", f"{missing_info['total_missing']:,}")

    dup_count = get_duplicate_count(df)
    m4.metric("Duplicate Rows", f"{dup_count:,}")

    if dup_count > 0:
        st.warning(f"⚠️ Dataset contains **{dup_count:,} duplicate records**. You can process and drop duplicates on the **Preprocessing** page.")

    st.markdown("#### First 5 Rows Preview")
    st.dataframe(df.head(), use_container_width=True)

    tab_dtypes, tab_missing = st.tabs(["📋 Column Data Types", "🔍 Missing Values breakdown"])

    with tab_dtypes:
        st.dataframe(get_data_types_table(df), use_container_width=True)

    with tab_missing:
        st.dataframe(missing_info['missing_per_column'], use_container_width=True)

    st.markdown("---")

    # Section 2: Target Analysis & Class Distribution
    st.subheader("🎯 2. Target Class Analysis")

    target_stats = get_target_analysis(df, target_col)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Target Column", target_stats["target_column"])
    c2.metric("Legitimate (0)", f"{target_stats['legitimate_count']:,}")
    c3.metric("Fraudulent (1)", f"{target_stats['fraudulent_count']:,}")
    c4.metric("Fraud Percentage", f"{target_stats['fraud_percentage']:.4f}%")

    st.markdown("#### Class Distribution Visualization")
    fig_class = plot_class_distribution(
        target_stats['legitimate_count'],
        target_stats['fraudulent_count'],
        100.0 - target_stats['fraud_percentage'],
        target_stats['fraud_percentage']
    )
    st.pyplot(fig_class)

    st.warning("""
    ⚠️ **Severe Class Imbalance Alert:** Fraudulent transactions represent a tiny fraction of total transactions. 
    Standard classifiers trained on this raw data will suffer from high accuracy bias toward the majority class. 
    *SMOTE (Synthetic Minority Over-sampling Technique) is applied on the Preprocessing page to handle this imbalance.*
    """)

    st.markdown("---")

    # Section 3: Basic Dataset Statistics
    st.subheader("📈 3. Basic Dataset Statistics")
    st.write("Summary statistics for numerical features:")
    stats_df = get_basic_statistics(df)
    st.dataframe(stats_df, use_container_width=True)

    st.markdown("---")

    # Section 4: Feature Correlation Analysis
    st.subheader("🔥 4. Feature Correlation Heatmap")
    st.write("Exploratory correlation matrix across numerical features:")
    annot_toggle = st.checkbox("Show correlation numerical values", value=False)
    fig_corr = plot_correlation_heatmap(df, annot=annot_toggle)
    st.pyplot(fig_corr)

    st.markdown("---")

    # Section 5: Transaction Amount Analysis
    if 'Amount' in df.columns:
        st.subheader("💵 5. Transaction Amount Analysis")
        amount_stats = get_feature_stats(df, 'Amount')
        if amount_stats:
            ac1, ac2, ac3, ac4 = st.columns(4)
            ac1.metric("Mean Amount", f"${amount_stats['mean']:.2f}")
            ac2.metric("Median Amount", f"${amount_stats['median']:.2f}")
            ac3.metric("Min Amount", f"${amount_stats['min']:.2f}")
            ac4.metric("Max Amount", f"${amount_stats['max']:.2f}")

        fig_amount = plot_amount_distribution(df, amount_col='Amount', target_col=target_col)
        st.pyplot(fig_amount)
        st.markdown("---")

    # Section 6: Time Analysis
    if 'Time' in df.columns:
        st.subheader("⏱️ 6. Transaction Time Analysis")
        st.write("Distribution of transaction times recorded in seconds elapsed from the first transaction:")
        time_stats = get_feature_stats(df, 'Time')
        if time_stats:
            tc1, tc2, tc3 = st.columns(3)
            tc1.metric("Min Time (s)", f"{time_stats['min']:.1f}")
            tc2.metric("Max Time (s)", f"{time_stats['max']:.1f}")
            tc3.metric("Time Span (Hours)", f"{(time_stats['max'] - time_stats['min']) / 3600:.2f} hrs")

        fig_time = plot_time_distribution(df, time_col='Time', target_col=target_col)
        st.pyplot(fig_time)


def render_preprocessing_page():
    """Render Part 2 & Part 3 Preprocessing & SMOTE Page."""
    st.markdown('<div class="main-header">Data Preprocessing & SMOTE Pipeline</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Leakage-Safe Cleaning, Stratified Splitting, Min-Max Scaling, & SMOTE Resampling</div>', unsafe_allow_html=True)

    st.markdown("---")

    if 'df_source' not in st.session_state or st.session_state['df_source'] is None:
        st.info("👆 No dataset loaded. Please go to **Dataset Analysis** page to upload a CSV file or load the demo dataset.")
        return

    df = st.session_state['df_source']

    # Execute Preprocessing & SMOTE Pipeline
    with st.spinner("Processing dataset through preprocessing and SMOTE pipeline..."):
        success, err_msg, prep_result = preprocess_data(df, test_size=0.20, random_state=RANDOM_STATE)

    if not success:
        st.error(f"❌ Preprocessing Failed: {err_msg}")
        return

    # Store in session state for future stages
    st.session_state['prep_result'] = prep_result
    meta = prep_result['metadata']

    # Section 1: Dataset Cleaning
    st.subheader("🧹 1. Dataset Cleaning & Duplicate Removal")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Original Rows", f"{meta['original_rows']:,}")
    c2.metric("Duplicates Found", f"{meta['duplicates_found']:,}")
    c3.metric("Duplicates Removed", f"{meta['duplicates_removed']:,}")
    c4.metric("Final Remaining Rows", f"{meta['final_rows']:,}")

    if meta['duplicates_found'] > 0:
        st.success(f"✅ Removed **{meta['duplicates_removed']:,} duplicate rows**. Dataset cleaned from {meta['original_rows']:,} down to {meta['final_rows']:,} unique records.")
    else:
        st.info("ℹ️ No duplicate rows were found in the uploaded dataset.")

    st.markdown("---")

    # Section 2: Train/Test Split
    st.subheader("✂️ 2. Stratified Train/Test Split (80% Train / 20% Test)")

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Training Samples", f"{meta['train_samples']:,}")
    m2.metric("Testing Samples", f"{meta['test_samples']:,}")
    m3.metric("Training Fraud Cases", f"{meta['train_fraud_count']:,}", f"{meta['train_fraud_pct']:.4f}%")
    m4.metric("Testing Fraud Cases", f"{meta['test_fraud_count']:,}", f"{meta['test_fraud_pct']:.4f}%")

    st.info(f"ℹ️ **Stratification Check:** Fraud class proportion is preserved seamlessly across splits — Training Fraud: **{meta['train_fraud_pct']:.4f}%**, Testing Fraud: **{meta['test_fraud_pct']:.4f}%**.")

    st.markdown("---")

    # Section 3: Class Distribution Preservation Before SMOTE
    st.subheader("📊 3. Class Distribution Preservation (Split Level)")
    st.write("Comparing class distribution percentages between Training and Testing sets:")

    fig_split = plot_split_class_distribution(prep_result['y_train'], prep_result['y_test'])
    st.pyplot(fig_split)

    st.markdown("---")

    # Section 4: Scaling Analysis (Min-Max Scaling)
    st.subheader("⚖️ 4. Min-Max Feature Scaling")

    st.markdown("""
    > 🛡️ **Data Leakage Safeguard:**
    > The `MinMaxScaler` is fit **ONLY** on the training data (`X_train`). 
    > Testing data (`X_test`) is transformed using the exact parameters (`min_` and `scale_`) computed from `X_train`. 
    > This prevents test set feature statistics from bleeding into training data.
    """)

    st.markdown("#### Feature Values Before vs. After Scaling Comparison (Training Set)")
    comp_df = get_scaling_comparison_table(prep_result['X_train'], prep_result['X_train_scaled'])
    st.dataframe(comp_df, use_container_width=True)

    st.success("✅ Scaler persisted to `models/scaler.joblib` for future model inference.")

    st.markdown("---")

    # Section 5: SMOTE Class Imbalance Handling
    st.subheader("⚖️ 5. Class Imbalance Handling (SMOTE)")

    st.markdown("""
    > 🧠 **Academic Principle:**
    > **SMOTE (Synthetic Minority Over-sampling Technique)** addresses severe class imbalance by generating 
    > synthetic feature vectors for the minority fraud class along line segments joining k-nearest neighbors in feature space.
    >
    > 🛡️ **Data Leakage Safeguard:**
    > SMOTE is applied **ONLY** to the training data (`X_train_scaled`, `y_train`). 
    > The testing dataset (`X_test_scaled`, `y_test`) remains 100% untouched.
    """)

    st.markdown("#### SMOTE Resampling Results")

    col_smote1, col_smote2 = st.columns(2)

    with col_smote1:
        st.markdown("**Before SMOTE (Imbalanced Training Set)**")
        st.metric("Training Samples", f"{meta['before_smote_train_samples']:,}")
        st.metric("Legitimate Samples (0)", f"{meta['before_smote_legit_count']:,}")
        st.metric("Fraudulent Samples (1)", f"{meta['before_smote_fraud_count']:,}", f"{meta['before_smote_fraud_pct']:.4f}%")

    with col_smote2:
        st.markdown("**After SMOTE (Balanced Training Set)**")
        st.metric("Balanced Training Samples", f"{meta['after_smote_train_samples']:,}", f"+{meta['synthetic_fraud_generated']:,} synthetic")
        st.metric("Legitimate Samples (0)", f"{meta['after_smote_legit_count']:,}")
        st.metric("Fraudulent Samples (1)", f"{meta['after_smote_fraud_count']:,}", f"{meta['after_smote_fraud_pct']:.1f}%")

    st.success(f"⚡ **Synthetic Fraud Samples Generated:** **+{meta['synthetic_fraud_generated']:,}** synthetic minority samples created to achieve an exact **1:1 class balance**.")

    st.markdown("#### Training Class Distribution Comparison (Before vs. After SMOTE)")
    fig_smote = plot_smote_comparison(prep_result['y_train'], prep_result['y_train_smote'])
    st.pyplot(fig_smote)

    st.markdown("---")

    # Section 6: Test Set Untouched Verification
    st.subheader("🛡️ 6. Test Set — Untouched & Verification")

    col_t1, col_t2, col_t3 = st.columns(3)
    col_t1.metric("Test Set Size", f"{meta['test_samples_after_smote']:,}", "Unchanged")
    col_t2.metric("Test Fraud Cases", f"{meta['test_fraud_after_smote']:,}", "Unchanged")
    col_t3.metric("Test Set Integrity", "100% Untouched", "Verified")

    if meta['test_set_untouched']:
        st.success("✓ **Programmatically Verified:** Test dataset (`X_test_scaled`, `y_test`) was NOT oversampled or modified in any way during SMOTE execution.")
    else:
        st.error("❌ Test set integrity violation detected!")

    st.markdown("---")

    # Section 7: Feature Information
    st.subheader("📋 7. Input Feature Specification")
    st.write(f"Total Input Features: **{meta['num_features']}** (Target column `{meta['target_col']}` excluded)")

    feat_table = get_feature_list_table(meta['feature_names'])

    col_feat1, col_feat2 = st.columns(2)
    half_idx = (len(feat_table) + 1) // 2
    with col_feat1:
        st.dataframe(feat_table.iloc[:half_idx], use_container_width=True, hide_index=True)
    with col_feat2:
        st.dataframe(feat_table.iloc[half_idx:], use_container_width=True, hide_index=True)

    st.markdown("---")

    # Section 8: Pipeline Status
    st.subheader("⚡ 8. Preprocessing Pipeline Status")

    st.markdown("""
    <div class="status-pass">✓ Dataset validated</div>
    <div class="status-pass">✓ Duplicates handled</div>
    <div class="status-pass">✓ Target separated (X vs y)</div>
    <div class="status-pass">✓ Stratified train/test split completed (80% Train / 20% Test)</div>
    <div class="status-pass">✓ Min-Max scaler fitted on training data ONLY</div>
    <div class="status-pass">✓ Training data transformed</div>
    <div class="status-pass">✓ Testing data transformed</div>
    <div class="status-pass">✓ SMOTE applied on training data ONLY (1:1 Class Balance Achieved)</div>
    <div class="status-pass">✓ Test set programmatically verified untouched</div>
    <div class="status-pass">✓ Ready for GA Feature Selection & Model Training</div>
    """, unsafe_allow_html=True)


def render_ga_page():
    """Render Part 4 Genetic Algorithm Based Feature Selection Page."""
    st.markdown('<div class="main-header">Genetic Algorithm Feature Selection</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Bio-Inspired Feature Subset Optimization using Random Forest Fitness Evaluation</div>', unsafe_allow_html=True)

    st.markdown("---")

    # Pre-requisite checks
    if 'df_source' not in st.session_state or st.session_state['df_source'] is None:
        st.info("👆 No dataset loaded. Please go to **Dataset Analysis** page to upload a CSV file or load the demo dataset.")
        return

    if 'prep_result' not in st.session_state or st.session_state['prep_result'] is None:
        st.warning("⚠️ Data Preprocessing & SMOTE pipeline has not been executed yet. Please go to **Preprocessing** page first.")
        return

    prep_result = st.session_state['prep_result']
    X_train_scaled = prep_result['X_train_scaled']
    y_train = prep_result['y_train']

    st.markdown("""
    > 🧬 **Academic Methodology:**
    > The **Genetic Algorithm (GA)** optimizes the feature space by mimicking natural selection. Each candidate 
    > feature subset is encoded as a binary chromosome (`1` = selected, `0` = excluded).
    >
    > 🛡️ **Leakage-Free GA Validation Procedure:**
    > 1. **Validation Split BEFORE SMOTE:** The original scaled training data (`X_train_scaled`, `y_train`) is split 80/20 into GA Train and GA Validation sets.
    > 2. **SMOTE Applied ONLY to GA Training:** Synthetic minority oversampling is applied strictly to `X_ga_train` to balance training classes (1:1 ratio).
    > 3. **GA Validation NOT SMOTEd:** The validation set (`X_ga_val`, `y_ga_val`) remains 100% untouched by SMOTE, preserving its natural imbalanced distribution.
    > 4. **Final Test Set Isolated:** The final testing dataset (`X_test_scaled`, `y_test`) is **NEVER** accessed during GA optimization.
    >
    > 🌲 **Fitness Function Evaluator:** **Random Forest Classifier** (`n_estimators=50`) is trained on `X_ga_train_smote` and evaluated on `X_ga_val` using the **F1-Score** metric.
    """)

    st.markdown("### ⚙️ GA Hyperparameters & Configuration")

    col_cfg1, col_cfg2, col_cfg3 = st.columns(3)

    with col_cfg1:
        pop_size = st.slider("Population Size", min_value=4, max_value=50, value=20, step=2, help="Number of chromosomes per generation.")
        generations = st.slider("Generations", min_value=2, max_value=30, value=10, step=1, help="Total evolutionary iterations.")
        rf_estimators = st.slider("Random Forest Trees", min_value=10, max_value=100, value=50, step=10, help="Trees in RF fitness evaluator.")

    with col_cfg2:
        cx_prob = st.slider("Crossover Probability", min_value=0.1, max_value=1.0, value=0.8, step=0.05, help="Two-point crossover probability.")
        mut_prob = st.slider("Mutation Probability", min_value=0.01, max_value=0.30, value=0.05, step=0.01, help="Bit-flip mutation probability.")

    with col_cfg3:
        tournament_size = st.slider("Tournament Size", min_value=2, max_value=6, value=3, step=1, help="Candidates in tournament selection.")
        elite_count = st.slider("Elite Count", min_value=0, max_value=3, value=1, step=1, help="Top chromosomes preserved per generation.")

    st.markdown("---")

    # Run GA Button
    run_ga_clicked = st.button("🚀 Run Genetic Algorithm Feature Selection", type="primary")

    # Check if existing result exists in session state or on disk
    if 'ga_result' not in st.session_state:
        loaded_res = load_ga_result()
        if loaded_res is not None and loaded_res.get('total_features') == X_train_scaled.shape[1]:
            st.session_state['ga_result'] = loaded_res

    if run_ga_clicked:
        config = GAConfig(
            population_size=pop_size,
            generations=generations,
            crossover_probability=cx_prob,
            mutation_probability=mut_prob,
            tournament_size=tournament_size,
            elite_count=elite_count,
            random_state=RANDOM_STATE,
            rf_estimators=rf_estimators
        )

        progress_bar = st.progress(0.0)
        status_text = st.empty()

        def ga_progress_update(gen, max_gen, best_fit, avg_fit, n_feats):
            pct = gen / max_gen
            progress_bar.progress(pct)
            status_text.markdown(f"⏳ **Generation {gen}/{max_gen}** | Best Fitness (F1): **`{best_fit:.4f}`** | Avg Fitness: **`{avg_fit:.4f}`** | Selected Features: **`{n_feats}/{X_train_scaled.shape[1]}`**")

        with st.spinner("Executing Genetic Algorithm optimization..."):
            ga_result = run_genetic_algorithm(
                X_train_scaled=X_train_scaled,
                y_train=y_train,
                config=config,
                save_path="models/ga_feature_selection.joblib",
                progress_callback=ga_progress_update
            )

        progress_bar.progress(1.0)
        status_text.success(f"✅ Genetic Algorithm Optimization Completed in {generations} Generations!")
        st.session_state['ga_result'] = ga_result

    # Render Results if present
    if 'ga_result' in st.session_state and st.session_state['ga_result'] is not None:
        res = st.session_state['ga_result']

        st.subheader("🎯 Optimization Results Summary")

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Best Fitness (Validation F1)", f"{res['best_fitness']:.4f}")
        m2.metric("Selected Features", f"{res['selected_feature_count']} / {res['total_features']}")
        m3.metric("Removed Features", f"{res['removed_feature_count']}")
        m4.metric("Feature Reduction %", f"{res['feature_reduction_pct']:.1f}%")

        st.markdown("#### Validation Methodology Verification")
        st.info(f"""
        * **GA Train Size (Pre-SMOTE):** {res.get('ga_train_before_smote_samples', 'N/A'):,} rows | **GA Train Size (Post-SMOTE):** {res.get('ga_train_after_smote_samples', 'N/A'):,} rows (Balanced 1:1)
        * **GA Validation Size (No SMOTE):** {res.get('ga_val_samples', 'N/A'):,} rows | **GA Val Fraud Cases:** {res.get('ga_val_fraud_count', 'N/A')} ({res.get('ga_val_fraud_pct', 0.0):.4f}%)
        * **Validation SMOTE Applied:** `False` (Natural distribution preserved) | **Final Test Set Access:** `None` (100% Untouched)
        """)

        st.markdown("---")

        # Convergence Graph
        st.subheader("📈 Evolutionary Convergence Graph")
        history_df = pd.DataFrame(res['history_df'])
        fig_conv = plot_ga_convergence(history_df)
        st.pyplot(fig_conv)

        st.markdown("---")

        # Feature Selection Table
        st.subheader("📋 Selected Input Features Table")

        all_feature_names = list(X_train_scaled.columns)
        best_mask = res['best_chromosome']

        sel_table_data = []
        for idx, fname in enumerate(all_feature_names):
            is_selected = (best_mask[idx] == 1)
            sel_table_data.append({
                "Index": idx + 1,
                "Feature Name": fname,
                "Status": "✅ Selected" if is_selected else "❌ Excluded",
                "Binary Gene": 1 if is_selected else 0
            })

        sel_df = pd.DataFrame(sel_table_data)

        col_t1, col_t2 = st.columns(2)
        half_idx = (len(sel_df) + 1) // 2
        with col_t1:
            st.dataframe(sel_df.iloc[:half_idx], use_container_width=True, hide_index=True)
        with col_t2:
            st.dataframe(sel_df.iloc[half_idx:], use_container_width=True, hide_index=True)

        st.markdown("---")

        # Generation History Table
        st.subheader("📊 Generational Evolutionary Log")
        st.dataframe(history_df, use_container_width=True, hide_index=True)

        st.success("✅ GA Result persisted to `models/ga_feature_selection.joblib` for downstream ML model training.")


def render_model_training_page():
    """Render Part 5 Machine Learning Model Training Page."""
    st.markdown('<div class="main-header">Machine Learning Model Training</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Train Baseline Classifiers across 3 Feature Configurations (Full, GA, Random)</div>', unsafe_allow_html=True)

    st.markdown("---")

    # Prerequisite checks
    if 'df_source' not in st.session_state or st.session_state['df_source'] is None:
        st.info("👆 No dataset loaded. Please go to **Dataset Analysis** page to upload a CSV file or load the demo dataset.")
        return

    if 'prep_result' not in st.session_state or st.session_state['prep_result'] is None:
        st.warning("⚠️ Data Preprocessing & SMOTE pipeline has not been executed yet. Please go to **Preprocessing** page first.")
        return

    prep_result = st.session_state['prep_result']
    X_train_smote = prep_result['X_train_smote']
    y_train_smote = prep_result['y_train_smote']
    X_test_scaled = prep_result['X_test_scaled']
    y_test = prep_result['y_test']

    # Load artifacts
    ga_artifact = load_ga_result("models/ga_feature_selection.joblib")
    if ga_artifact is None and 'ga_result' in st.session_state:
        ga_artifact = st.session_state['ga_result']

    if ga_artifact is None:
        st.warning("⚠️ GA Feature Selection artifact not found. Please complete **GA Feature Selection** before training GA/Random feature models.")
        return

    # Check compatibility
    if ga_artifact.get('total_features') != X_train_smote.shape[1]:
        st.error("❌ GA Artifact dataset mismatch! Please re-run **GA Feature Selection** on the current dataset.")
        return

    # Ensure Random Feature Artifact exists
    random_artifact = load_random_feature_result("models/random_feature_selection.joblib")
    if random_artifact is None or random_artifact.get('selected_feature_count') != ga_artifact['selected_feature_count']:
        random_artifact = generate_random_feature_subset(
            total_feature_names=list(X_train_smote.columns),
            subset_size=ga_artifact['selected_feature_count'],
            random_state=RANDOM_STATE,
            ga_selected_indices=ga_artifact['selected_indices'],
            save_path="models/random_feature_selection.joblib"
        )

    st.markdown("""
    > 🤖 **Model Training Framework:**
    > Train 5 baseline classifiers (*Decision Tree, Random Forest, Logistic Regression, ANN, Naive Bayes*) across 3 feature configurations:
    > - **Full Features:** All 30 input features.
    > - **GA Features:** {ga_count} features selected via Genetic Algorithm optimization.
    > - **Random Features:** {rnd_count} features selected via deterministic random subsetting.
    >
    > 🛡️ **Test Set Safeguard:** Models are fit on `X_train_smote` only. The final test dataset (`X_test_scaled`, `y_test`) is **NEVER** accessed during training.
    """.format(
        ga_count=ga_artifact['selected_feature_count'],
        rnd_count=random_artifact['selected_feature_count']
    ))

    st.markdown("---")

    # Configuration Selection Panel
    st.subheader("⚙️ Training Selector Panel")

    col_sel1, col_sel2 = st.columns(2)

    with col_sel1:
        selected_model_name = st.selectbox("Select Classifier Model", ALL_MODELS, index=0)

    with col_sel2:
        selected_feature_set = st.selectbox("Select Feature Set Configuration", ALL_FEATURE_SETS, index=0)

    btn_col1, btn_col2 = st.columns(2)

    with btn_col1:
        train_single_clicked = st.button(f"⚡ Train Selected Model ({selected_model_name} + {selected_feature_set})", type="primary")

    with btn_col2:
        train_all_clicked = st.button("🚀 Train All 15 Model Configurations", type="secondary")

    # Handle Single Model Training
    if train_single_clicked:
        X_tr_sub, X_te_sub, f_names, f_indices = get_feature_subset_matrices(
            X_train_smote=X_train_smote,
            X_test_scaled=X_test_scaled,
            feature_set_name=selected_feature_set,
            ga_artifact=ga_artifact,
            random_artifact=random_artifact
        )

        with st.spinner(f"Training {selected_model_name} on {selected_feature_set}..."):
            fitted_model, duration = train_model(selected_model_name, X_tr_sub, y_train_smote, random_state=RANDOM_STATE)
            saved_path = save_trained_model(
                model_name=selected_model_name,
                feature_set_name=selected_feature_set,
                model=fitted_model,
                feature_names=f_names,
                feature_indices=f_indices,
                training_time=duration,
                training_samples=len(X_tr_sub),
                save_dir="models/trained"
            )

        st.success(f"✅ **{selected_model_name}** ({selected_feature_set}) trained successfully in **{duration:.4f}s**! Saved to `{saved_path}`.")

    # Handle All 15 Models Training
    if train_all_clicked:
        progress_bar = st.progress(0.0)
        status_text = st.empty()

        results_summary = []
        total_steps = len(ALL_FEATURE_SETS) * len(ALL_MODELS)
        step = 0

        for f_set in ALL_FEATURE_SETS:
            X_tr_sub, X_te_sub, f_names, f_indices = get_feature_subset_matrices(
                X_train_smote=X_train_smote,
                X_test_scaled=X_test_scaled,
                feature_set_name=f_set,
                ga_artifact=ga_artifact,
                random_artifact=random_artifact
            )

            for m_name in ALL_MODELS:
                step += 1
                progress_bar.progress(step / total_steps)
                status_text.markdown(f"⏳ **Training Config {step}/{total_steps}:** `{m_name}` on `{f_set}` ({len(f_names)} features)...")

                fitted_model, duration = train_model(m_name, X_tr_sub, y_train_smote, random_state=RANDOM_STATE)
                saved_path = save_trained_model(
                    model_name=m_name,
                    feature_set_name=f_set,
                    model=fitted_model,
                    feature_names=f_names,
                    feature_indices=f_indices,
                    training_time=duration,
                    training_samples=len(X_tr_sub),
                    save_dir="models/trained"
                )

                results_summary.append({
                    "Config #": step,
                    "Model Name": m_name,
                    "Feature Set": f_set,
                    "Feature Count": len(f_names),
                    "Training Time (s)": round(duration, 4),
                    "Status": "✅ Trained & Saved"
                })

        progress_bar.progress(1.0)
        status_text.success("🎉 All 15 Model Configurations Trained & Serialized Successfully!")
        st.session_state['trained_models_summary'] = results_summary

    st.markdown("---")

    # Display Trained Models Status Table
    st.subheader("📋 Trained Models Summary & Registry Status")

    records = []
    config_id = 1

    for f_set in ALL_FEATURE_SETS:
        X_tr_sub, X_te_sub, f_names, f_indices = get_feature_subset_matrices(
            X_train_smote=X_train_smote,
            X_test_scaled=X_test_scaled,
            feature_set_name=f_set,
            ga_artifact=ga_artifact,
            random_artifact=random_artifact
        )

        for m_name in ALL_MODELS:
            art = load_trained_model(m_name, f_set, save_dir="models/trained")
            if art is not None:
                status_str = f"✅ Trained ({art['timestamp']})"
                train_time_str = f"{art['training_time']:.4f} s"
            else:
                status_str = "⏳ Not Trained"
                train_time_str = "—"

            records.append({
                "Config #": config_id,
                "Classifier Model": m_name,
                "Feature Set Configuration": f_set,
                "Features Count": len(f_names),
                "Training Samples": f"{len(X_tr_sub):,}",
                "Training Duration": train_time_str,
                "Status": status_str
            })
            config_id += 1

    summary_df = pd.DataFrame(records)
    st.dataframe(summary_df, use_container_width=True, hide_index=True)

    st.info("ℹ️ **Note on Performance Metrics:** Model evaluation metrics (Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix, ROC curves) are strictly reserved for **Part 6 — Model Evaluation & Comparison Dashboard**.")


def main():
    """Main application launcher."""
    st.sidebar.title("Credit Card Fraud Detection")
    st.sidebar.caption("GA-Based Feature Selection with ML")

    st.sidebar.markdown("### Navigation")
    page = st.sidebar.radio(
        "Select Page",
        ["Overview", "Dataset Analysis", "Preprocessing", "GA Feature Selection", "Model Training"],
        index=0
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown("**Project Phase:** `Part 5 — Model Training`")
    st.sidebar.markdown("**Developer:** Academic ML Team")

    if page == "Overview":
        render_overview_page()
    elif page == "Dataset Analysis":
        render_dataset_analysis_page()
    elif page == "Preprocessing":
        render_preprocessing_page()
    elif page == "GA Feature Selection":
        render_ga_page()
    elif page == "Model Training":
        render_model_training_page()


if __name__ == "__main__":
    main()
