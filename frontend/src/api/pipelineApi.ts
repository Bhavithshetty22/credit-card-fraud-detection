import { PipelineIntegrityStatus, IntegrityCheckItem } from '../types/pipeline';

export const mockIntegrityChecks: IntegrityCheckItem[] = [
  {
    checkNumber: 'CHECK 01',
    title: 'Stratified Train/Test Split',
    statusText: 'PASS — Configuration',
    statusType: 'PASS',
    category: 'Configuration',
    details: '80/20 split with stratification.',
    methodologyNote: 'Guarantees the identical 0.172% fraud class ratio in both training (227,845) and testing (56,962) partitions.',
    verifiedArtifact: 'src/data_preprocessing.py (stratify=y)',
  },
  {
    checkNumber: 'CHECK 02',
    title: 'Test Set Isolation',
    statusText: 'PASS — Architecture',
    statusType: 'PASS',
    category: 'Architecture',
    details: 'Test data is not included in SMOTE or GA optimization.',
    methodologyNote: 'Held-out test partition is strictly locked until final model evaluation, preventing all forms of data contamination.',
    verifiedArtifact: 'tests/test_smote.py & tests/test_ga.py',
  },
  {
    checkNumber: 'CHECK 03',
    title: 'Scaler Leakage Prevention',
    statusText: 'PASS — Architecture',
    statusType: 'PASS',
    category: 'Architecture',
    details: 'MinMaxScaler is fitted on X_train only.',
    methodologyNote: 'Min and max parameters are computed strictly from training samples; test samples are merely transformed.',
    verifiedArtifact: 'models/scaler.joblib & tests/test_preprocessing.py',
  },
  {
    checkNumber: 'CHECK 04',
    title: 'GA Validation Isolation',
    statusText: 'PASS — Architecture',
    statusType: 'PASS',
    category: 'Architecture',
    details: 'GA fitness evaluation uses an internal validation subset from the training partition.',
    methodologyNote: 'Internal 80/20 sub-split created before SMOTE. Fitness is measured against un-resampled validation subsets.',
    verifiedArtifact: 'src/ga_feature_selection.py & tests/test_ga.py',
  },
  {
    checkNumber: 'CHECK 05',
    title: 'SMOTE Placement',
    statusText: 'PASS — Architecture',
    statusType: 'PASS',
    category: 'Architecture',
    details: 'SMOTE is applied only to training data.',
    methodologyNote: 'Synthetic instances are never introduced into validation or test partitions to avoid artificial performance inflation.',
    verifiedArtifact: 'src/data_preprocessing.py',
  },
  {
    checkNumber: 'CHECK 06',
    title: 'Test Resampling',
    statusText: 'PASS',
    statusType: 'PASS',
    category: 'Validation',
    details: 'Test data remains un-resampled.',
    methodologyNote: 'Test set preserves the authentic natural fraud distribution (492 fraud vs 284,315 legitimate overall).',
    verifiedArtifact: 'tests/test_smote.py',
  },
  {
    checkNumber: 'CHECK 07',
    title: 'Feature Selection Leakage',
    statusText: 'PASS — Architecture',
    statusType: 'PASS',
    category: 'Architecture',
    details: 'GA feature selection is performed without accessing the held-out test set.',
    methodologyNote: 'Evolutionary algorithm operates exclusively on training feature space without test distribution knowledge.',
    verifiedArtifact: 'models/ga_feature_selection.joblib',
  },
];

export const mockPipelineIntegrityStatus: PipelineIntegrityStatus = {
  overallStatus: 'READY FOR EVALUATION',
  stateCategory: 'PASS',
  totalChecks: 7,
  passedChecks: 7,
  pendingChecks: 0,
  checks: mockIntegrityChecks,
};

export const pipelineApi = {
  getIntegrityStatus: async (): Promise<PipelineIntegrityStatus> => {
    return Promise.resolve(mockPipelineIntegrityStatus);
  },
};
