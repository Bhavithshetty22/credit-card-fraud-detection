import {
  ComparisonMetric,
  ClassifierComparison,
  FeatureSetComparison,
  ExperimentComparison,
  GaImpactData,
  ResearchExperimentSummary,
  ReferencePaperResultRow,
} from '../types/comparison';
import { ClassifierName, FeatureSetType } from '../types/models';
import { mock15ModelConfigurations } from './modelApi';

export const mockExperimentComparisons: ExperimentComparison[] = mock15ModelConfigurations.map((cfg) => ({
  id: cfg.id,
  classifier: cfg.classifier,
  shortClassifier: cfg.shortClassifier,
  featureSet: cfg.featureSet,
  shortFeatureSet: cfg.shortFeatureSet,
  featureCount: cfg.featureCount,
  status: 'Artifact expected',
  metrics: {
    accuracy: '—',
    precision: '—',
    recall: '—',
    f1: '—',
    roc_auc: '—',
    pr_auc: '—',
  },
  confusionMatrix: {
    tn: '—',
    fp: '—',
    fn: '—',
    tp: '—',
    totalTested: '56,962',
  },
  rocPoints: [],
  prPoints: [],
  trainingData: cfg.trainingData,
  testData: cfg.evaluationData,
  smoteStatus: 'SMOTE applied strictly on training partition (80%)',
  modelArtifact: cfg.artifactId,
}));

export const mockFeatureSetComparisons: FeatureSetComparison[] = [
  {
    name: 'Full Features',
    description: 'All available input features are retained.',
    featureCount: '30 input features',
    selectionMethod: 'None (Full 30-dimensional continuous space)',
    trainingData: 'SMOTE-balanced training partition (80%)',
    evaluationData: 'Un-resampled held-out test partition (20%)',
    status: '100% Dimensions Retained',
  },
  {
    name: 'GA Features',
    description: 'Features selected using the Genetic Algorithm feature-selection pipeline.',
    featureCount: 'Pending backend',
    selectionMethod: 'Genetic Algorithm (Evolutionary F1 optimization)',
    trainingData: 'SMOTE-balanced training partition (80%)',
    evaluationData: 'Un-resampled held-out test partition (20%)',
    status: 'Pending backend artifact',
  },
  {
    name: 'Random Features',
    description: 'A randomly selected feature subset matched to the GA feature count.',
    featureCount: 'Matched to GA subset',
    selectionMethod: 'Uniform random sampling (Reproducible seed 42)',
    trainingData: 'SMOTE-balanced training partition (80%)',
    evaluationData: 'Un-resampled held-out test partition (20%)',
    status: 'Controlled Baseline',
  },
];

export const mockReferencePaperResults: ReferencePaperResultRow[] = [
  { featureVector: 'v1', featureCount: 18, model: 'Random Forest', accuracy: '99.93%', recall: '81.63%', precision: '85.11%', f1: '83.33%', auc: '90.79%' },
  { featureVector: 'v1', featureCount: 18, model: 'Decision Tree', accuracy: '99.91%', recall: '78.57%', precision: '74.76%', f1: '76.62%', auc: '89.26%' },
  { featureVector: 'v2', featureCount: 9, model: 'Random Forest', accuracy: '99.91%', recall: '79.59%', precision: '81.25%', f1: '80.41%', auc: '89.77%' },
  { featureVector: 'v3', featureCount: 13, model: 'Random Forest', accuracy: '99.94%', recall: '82.65%', precision: '86.17%', f1: '84.38%', auc: '91.31%' },
  { featureVector: 'v4', featureCount: 9, model: 'Random Forest', accuracy: '99.92%', recall: '80.61%', precision: '83.16%', f1: '81.86%', auc: '90.28%' },
  { featureVector: 'v5', featureCount: 13, model: 'Random Forest', accuracy: '99.95%', recall: '84.69%', precision: '88.30%', f1: '86.46%', auc: '92.33%' },
];

export const comparisonApi = {
  getExperimentMatrix: async (): Promise<ExperimentComparison[]> => {
    return Promise.resolve(mockExperimentComparisons);
  },
  getFeatureSetComparisons: async (): Promise<FeatureSetComparison[]> => {
    return Promise.resolve(mockFeatureSetComparisons);
  },
  getSummary: async (): Promise<ResearchExperimentSummary> => {
    return Promise.resolve({
      totalClassifiers: 5,
      totalFeatureSets: 3,
      totalExperiments: 15,
      heldOutTestSamples: 56962,
      isBackendConnected: false,
    });
  },
  getReferencePaperResults: async (): Promise<ReferencePaperResultRow[]> => {
    return Promise.resolve(mockReferencePaperResults);
  },
};
