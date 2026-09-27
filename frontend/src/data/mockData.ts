import { NavGroup, MetricData, PipelineStage, ClassifierInfo, SystemStatusItem, ActivityItem } from '../types';

export const CARDHOLDER_NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Home', iconName: 'Home' },
  { id: 'batch-detection' as const, label: 'Check a Statement', iconName: 'FileText' },
  { id: 'fraud-detection' as const, label: 'Alerts', iconName: 'Bell' },
  { id: 'card-shield' as const, label: 'Card Controls', iconName: 'Lock' },
];

export const TOP_KPIS: MetricData[] = [
  {
    title: 'Total Transactions',
    value: '284,807',
    label: 'Dataset records',
    icon: 'Database',
    subtext: 'European Credit Card Dataset',
    accent: 'cyan',
  },
  {
    title: 'Fraudulent Transactions',
    value: '492',
    label: '0.172% of dataset',
    icon: 'ShieldAlert',
    subtext: 'Extreme Class Imbalance',
    accent: 'rose',
  },
  {
    title: 'Input Features',
    value: '30',
    label: 'Time + V1–V28 + Amount',
    icon: 'Sliders',
    subtext: 'Continuous numerical variables',
    accent: 'indigo',
  },
  {
    title: 'Model Configurations',
    value: '15',
    label: '5 classifiers × 3 feature sets',
    icon: 'Network',
    subtext: 'Full · GA · Random Baselines',
    accent: 'emerald',
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    step: '01',
    title: 'DATASET',
    subtitle: 'European Credit Card',
    description: '284,807 raw transactions with 30 features & binary Class target',
    icon: 'Database',
    status: 'completed',
  },
  {
    step: '02',
    title: 'DATA CLEANING',
    subtitle: 'Deduplication & Validation',
    description: 'Duplicate identification, null removal & data type integrity',
    icon: 'Sparkles',
    status: 'completed',
  },
  {
    step: '03',
    title: 'TRAIN / TEST SPLIT',
    subtitle: '80% Train / 20% Test',
    description: 'Stratified split preserving 0.172% minority fraud class ratio',
    icon: 'Split',
    status: 'completed',
  },
  {
    step: '04',
    title: 'MIN-MAX SCALING',
    subtitle: 'Fit on Train Only',
    description: 'Zero data leakage normalization across [0, 1] range',
    icon: 'SlidersHorizontal',
    status: 'completed',
  },
  {
    step: '05',
    title: 'GA FEATURE SELECTION',
    subtitle: 'Evolutionary Optimization',
    description: 'Stochastic search for optimal predictive feature subset',
    icon: 'Dna',
    status: 'completed',
    highlight: true,
  },
  {
    step: '06',
    title: 'SMOTE RESAMPLING',
    subtitle: 'Synthetic Minority Balancing',
    description: 'Applied strictly to training partitions to balance class ratio',
    icon: 'Layers',
    status: 'completed',
  },
  {
    step: '07',
    title: '5 ML CLASSIFIERS',
    subtitle: 'RF · DT · LR · ANN · NB',
    description: '15 experimental model combinations trained across feature modes',
    icon: 'Cpu',
    status: 'completed',
  },
  {
    step: '08',
    title: 'EVALUATION',
    subtitle: 'Strict Holdout Testing',
    description: 'Precision, Recall, F1-Score, ROC-AUC on 100% untouched test set',
    icon: 'BarChart2',
    status: 'active',
  },
  {
    step: '09',
    title: 'FRAUD DETECTION',
    subtitle: 'Real-time Inference',
    description: 'Single & batch transaction classification engine',
    icon: 'ShieldCheck',
    status: 'pending',
  },
];

export const DATASET_DISTRIBUTION = [
  { name: 'Legitimate', value: 284315, color: '#10B981', percentage: '99.828%' },
  { name: 'Fraudulent', value: 492, color: '#F43F5E', percentage: '0.172%' },
];

export const DATASET_PROFILE = [
  { label: 'Dataset Name', value: 'European Credit Card Fraud (Kaggle/ULB)' },
  { label: 'Total Transactions', value: '284,807 records' },
  { label: 'Input Features', value: '30 numerical features' },
  { label: 'Target Variable', value: 'Class (0 = Legitimate, 1 = Fraudulent)' },
  { label: 'Target 0 (Legitimate)', value: '284,315 (99.828%)' },
  { label: 'Target 1 (Fraudulent)', value: '492 (0.172%)' },
  { label: 'Feature Types', value: 'Continuous Numerical' },
  { label: 'Temporal Feature', value: 'Time (Seconds elapsed from first transaction)' },
  { label: 'Monetary Feature', value: 'Amount (Transaction monetary amount)' },
  { label: 'Anonymized Features', value: 'V1 through V28 (PCA-transformed components)' },
];

export const CLASSIFIERS_ECOSYSTEM: ClassifierInfo[] = [
  {
    id: 'random_forest',
    name: 'Random Forest',
    type: 'Ensemble Bagging Classifier',
    description: '100 randomized decision trees with bootstrap aggregation for non-linear boundary estimation',
    icon: 'Trees',
    status: 'Ready',
    featureModes: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'decision_tree',
    name: 'Decision Tree',
    type: 'Hierarchical Rule Classifier',
    description: 'Optimized CART decision tree mapping interpretable orthogonal decision boundaries',
    icon: 'GitFork',
    status: 'Ready',
    featureModes: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    type: 'Linear Probabilistic Classifier',
    description: 'L2-regularized logistic regression estimating log-odds of fraudulent transaction probability',
    icon: 'TrendingUp',
    status: 'Ready',
    featureModes: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'ann',
    name: 'Artificial Neural Network',
    type: 'Multi-Layer Perceptron (MLP)',
    description: 'Feed-forward deep architecture (64 × 32 hidden units) with non-linear activation functions',
    icon: 'BrainCircuit',
    status: 'Ready',
    featureModes: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'naive_bayes',
    name: 'Naive Bayes',
    type: 'Gaussian Probabilistic Classifier',
    description: 'Bayesian posterior estimator assuming independent Gaussian feature distributions per class',
    icon: 'Compass',
    status: 'Ready',
    featureModes: ['Full Features', 'GA Features', 'Random Features'],
  },
];

export const ALL_30_FEATURES = [
  'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
  'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
  'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
];

export const SYSTEM_STATUS_LIST: SystemStatusItem[] = [
  { name: 'Dataset (creditcard.csv)', status: 'Loaded', color: 'emerald', detail: '284,807 transactions validated' },
  { name: 'Preprocessing Pipeline', status: 'Ready', color: 'emerald', detail: 'Stratified 80/20 train/test split' },
  { name: 'MinMaxScaler Artifact', status: 'Ready', color: 'emerald', detail: 'Fitted strictly on X_train (models/scaler.joblib)' },
  { name: 'GA Feature Mask', status: 'Ready', color: 'cyan', detail: 'Evolutionary mask loaded (models/ga_feature_selection.joblib)' },
  { name: 'Random Feature Mask', status: 'Ready', color: 'cyan', detail: 'Baseline mask loaded (models/random_feature_selection.joblib)' },
  { name: 'Trained Models', status: 'Available', color: 'emerald', detail: '15 .joblib models ready in models/trained/' },
  { name: 'Inference Engine', status: 'Pending', color: 'blue', detail: 'Frontend UI ready · Python API connection in next module' },
];

export const RECENT_ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'act-1',
    title: '15 model artifacts detected in models/trained/',
    timestamp: 'Just now',
    type: 'artifact',
    status: 'ready',
  },
  {
    id: 'act-2',
    title: 'GA feature selection artifact loaded (ga_feature_selection.joblib)',
    timestamp: '2 mins ago',
    type: 'artifact',
    status: 'ready',
  },
  {
    id: 'act-3',
    title: 'Random feature baseline artifact verified',
    timestamp: '5 mins ago',
    type: 'artifact',
    status: 'ready',
  },
  {
    id: 'act-4',
    title: 'Dataset schema validated (30 input features + Class)',
    timestamp: '12 mins ago',
    type: 'dataset',
    status: 'success',
  },
  {
    id: 'act-5',
    title: 'Zero-leakage SMOTE resampling protocol enforced',
    timestamp: '25 mins ago',
    type: 'system',
    status: 'success',
  },
];
