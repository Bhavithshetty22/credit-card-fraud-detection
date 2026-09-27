import {
  PreprocessingStep,
  SplitMetrics,
  ScalingConfig,
  SmoteConfig,
} from '../types/preprocessing';

export const mockPreprocessingSteps: PreprocessingStep[] = [
  {
    id: 'ingestion',
    stepNumber: '01',
    title: 'DATA INGESTION',
    subtitle: 'Raw Dataset Parsing',
    status: 'Ready',
    shortDescription: 'creditcard.csv loaded with 284,807 transactions & 30 numerical features',
  },
  {
    id: 'cleaning',
    stepNumber: '02',
    title: 'DATA CLEANING',
    subtitle: 'Audit & Deduplication',
    status: 'Ready',
    shortDescription: 'Validation of missing values, duplicates, and column typing consistency',
  },
  {
    id: 'split',
    stepNumber: '03',
    title: 'TRAIN / TEST SPLIT',
    subtitle: 'Stratified 80/20 Partition',
    status: 'Ready',
    shortDescription: 'Rigid isolation of 20% test partition with test set immutability lock',
  },
  {
    id: 'scaling',
    stepNumber: '04',
    title: 'MIN-MAX SCALING',
    subtitle: 'Train-Only Normalization',
    status: 'Ready',
    shortDescription: 'Min-Max scaling to [0, 1] range fitted strictly on X_train to prevent leakage',
  },
  {
    id: 'smote',
    stepNumber: '05',
    title: 'SMOTE BALANCING',
    subtitle: 'Synthetic Minority Resampling',
    status: 'Ready',
    shortDescription: 'k-NN interpolation applied only to training data to balance 0.172% fraud class',
  },
];

export const mockSplitMetrics: SplitMetrics = {
  totalRecords: 284807,
  trainRatio: 0.8,
  testRatio: 0.2,
  trainCount: 227845,
  testCount: 56962,
  isStratified: true,
  isTestLocked: true,
};

export const mockScalingConfig: ScalingConfig = {
  method: 'Min-Max Normalization',
  formula: 'x_scaled = (x - x_min) / (x_max - x_min)',
  inputRange: 'Raw feature values [-56.40, 25691.16]',
  outputRange: 'Normalized range [0.0, 1.0]',
  fittedOn: 'Training data only (X_train)',
  appliedTo: 'Training data (X_train) + Held-out test data (X_test)',
  leakagePreventionNote: 'The scaler is fitted only on the training partition. The test partition is transformed using the already-fitted scaler parameters to guarantee zero data leakage.',
};

export const mockSmoteConfig: SmoteConfig = {
  strategy: 'Synthetic Minority Over-sampling Technique (SMOTE)',
  minorityLabel: 'Class 1 (Fraudulent)',
  majorityLabel: 'Class 0 (Legitimate)',
  beforeDistribution: {
    legitimate: '~227,451',
    fraud: '~394',
  },
  afterDistribution: {
    legitimate: '~227,451',
    fraud: '~227,451',
  },
  mechanismSteps: [
    'Minority Class Identification (Fraud instances isolated in feature space)',
    'k-Nearest Neighbors Graph (Euclidean distance search with k=5)',
    'Feature Difference Interpolation (Random weight factor λ ∈ [0, 1])',
    'Synthetic Minority Samples Injected (Equalizing Class 1 to Class 0 count)',
    'Balanced Training Matrix (1:1 Ratio for robust classifier gradient updates)',
  ],
};

export const preprocessingApi = {
  getSteps: async (): Promise<PreprocessingStep[]> => {
    return Promise.resolve(mockPreprocessingSteps);
  },
  getSplitMetrics: async (): Promise<SplitMetrics> => {
    return Promise.resolve(mockSplitMetrics);
  },
  getScalingConfig: async (): Promise<ScalingConfig> => {
    return Promise.resolve(mockScalingConfig);
  },
  getSmoteConfig: async (): Promise<SmoteConfig> => {
    return Promise.resolve(mockSmoteConfig);
  },
};
