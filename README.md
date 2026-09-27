# A Machine Learning Based Credit Card Fraud Detection Using the GA Algorithm for Feature Selection

## Project Title
**A Machine Learning Based Credit Card Fraud Detection Using the GA Algorithm for Feature Selection**

## Current Stage
**Part 5 — Machine Learning Model Training Infrastructure**

---

## Dataset Overview
The application is designed to analyze and preprocess the **European Credit Card Fraud Detection Dataset** (`creditcard.csv`).

* **Total Transactions:** 284,807
* **Features:** 30 numerical input features (`Time`, `V1` through `V28`, `Amount`)
* **Target Variable:** `Class`
  * `0`: Legitimate Transaction
  * `1`: Fraudulent Transaction
* **Target Variations Supported:** `Class`, `class`, `target`, `Target`, `fraud`, `Fraud`

---

## Repository Structure

```text
credit-card-fraud-ga/
│
├── app.py                      # Main Streamlit UI & Navigation (Overview, EDA, Preprocessing/SMOTE, GA, Model Training)
├── requirements.txt            # Python dependencies (includes imbalanced-learn, pytest, scikit-learn)
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
│
├── data/                       # Directory for dataset storage
│   └── README.md
│
├── models/                     # Directory for trained models & persisted artifacts
│   ├── README.md
│   ├── scaler.joblib           # Fitted MinMaxScaler artifact
│   ├── ga_feature_selection.joblib # GA optimization results & selected feature subset
│   ├── random_feature_selection.joblib # Reproducibility random feature subset artifact
│   └── trained/                # Serialized trained baseline model artifacts (joblib)
│
├── src/                        # Core modular Python package
│   ├── __init__.py
│   ├── data_preprocessing.py   # Data cleaning, train/test split, Min-Max scaling, SMOTE resampling
│   ├── ga_feature_selection.py # Genetic Algorithm optimization module & Random Forest fitness evaluator
│   ├── models.py               # Classifier factory, training, random feature selection, & persistence
│   ├── visualization.py        # Matplotlib/Seaborn EDA, SMOTE comparison, & GA convergence plotting
│   └── utils.py                # Constants & target matching utilities
│
├── tests/                      # Automated unit test suite
│   ├── __init__.py
│   ├── test_preprocessing.py   # Preprocessing & scaling unit tests
│   ├── test_smote.py           # SMOTE & test set immutability unit tests
│   ├── test_ga.py              # GA feature selection & validation leakage unit tests
│   └── test_models.py          # Machine learning model training & serialization unit tests
│
├── scripts/                    # Standalone execution scripts
│   ├── e2e_pipeline.py         # End-to-end pipeline execution test script
│   └── train_all_models.py     # Full-dataset 15-model training integration script
│
└── results/                    # Exported outputs & charts
    ├── figures/
    └── metrics/
```

---

## Data Pipeline Flowchart

```text
Uploaded Dataset
       ↓
Data Validation & Cleaning (Duplicate Removal)
       ↓
Feature / Target Separation (X vs. y)
       ↓
Stratified Train/Test Split (80% Train / 20% Test)
       ↓
Min-Max Scaling (Fit on X_train ONLY)
       ↓
GA Validation Split (80/20 of X_train_scaled BEFORE SMOTE)
       ↓
SMOTE Applied ONLY to GA Training Data
       ↓
Leak-Free GA Feature Selection (Validation F1 Score)
       ↓
SMOTE Resampling on Entire Training Data (X_train_scaled ONLY)
       ↓
Balanced Training Dataset (X_train_smote, y_train_smote)
       ↓
Feature Subset Subsetting (Full Features, GA Features, Random Features)
       ↓
15 Model Configurations Training (5 Classifiers × 3 Feature Sets)
       ↓
Model Artifact Serialization (models/trained/*.joblib)
       ↓
Test Set (X_test_scaled, y_test) — 100% UNTOUCHED
```

---

## Machine Learning Models Infrastructure (Part 5)

The research evaluation framework establishes baseline training infrastructure across **5 Classifiers** and **3 Feature Configurations**, resulting in **15 experimental configurations**:

### 1. Classifiers
* **Decision Tree:** `DecisionTreeClassifier(random_state=42)`
* **Random Forest:** `RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)`
* **Logistic Regression:** `LogisticRegression(max_iter=1000, random_state=42)`
* **Artificial Neural Network (ANN):** `MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=100, random_state=42)`
* **Naive Bayes:** `GaussianNB()`

### 2. Feature Configurations
* **Full Features:** All 30 input features (`Time`, `V1`–`V28`, `Amount`).
* **GA Features:** Optimal feature subset selected via Genetic Algorithm optimization (`models/ga_feature_selection.joblib`).
* **Random Features:** Reproducible random feature subset matching the GA feature count (`models/random_feature_selection.joblib`).

---

## Installation & Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
```

Activate the environment:
- **Windows:**
  ```powershell
  .\venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Running the Application & Automated Tests

Launch the Streamlit web application:
```bash
streamlit run app.py
```

Run the complete automated test suite:
```bash
pytest -v
```

Run standalone 15-model training integration script:
```bash
python scripts/train_all_models.py
```
