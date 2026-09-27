import { MetricDefinition, ExperimentResult } from '../types/evaluation';
import { mock15ModelConfigurations } from './modelApi';

export const mockMetricDefinitions: MetricDefinition[] = [
  {
    name: 'Accuracy',
    shortFormula: '(TP + TN) / Total',
    description: 'Proportion of correctly classified transactions out of all tested samples.',
    importanceInFraud: 'Highly misleading in severe imbalance (a trivial dummy classifier achieves 99.828% accuracy by predicting all legitimate).',
  },
  {
    name: 'Precision',
    shortFormula: 'TP / (TP + FP)',
    description: 'Proportion of predicted fraud transactions that are actually fraudulent.',
    importanceInFraud: 'Measures false alarm rate. High precision avoids unnecessarily freezing legitimate customer cards.',
  },
  {
    name: 'Recall',
    shortFormula: 'TP / (TP + FN)',
    description: 'Proportion of actual fraud transactions detected by the classifier.',
    importanceInFraud: 'Critical security KPI. High recall ensures fraudulent activities are detected before settlement losses occur.',
  },
  {
    name: 'F1 Score',
    shortFormula: '2 × (Precision × Recall) / (Precision + Recall)',
    description: 'Harmonic mean of precision and recall providing a balanced assessment under imbalanced class distributions.',
    importanceInFraud: 'Serves as our primary optimization and comparison objective.',
  },
  {
    name: 'ROC-AUC',
    shortFormula: 'Area Under Receiver Operating Characteristic',
    description: 'Area under the receiver operating characteristic curve plotting True Positive Rate vs False Positive Rate.',
    importanceInFraud: 'Assesses ranking quality across varying discrimination thresholds.',
  },
  {
    name: 'PR-AUC',
    shortFormula: 'Area Under Precision-Recall Curve',
    description: 'Area under the precision-recall curve plotting Precision vs Recall across thresholds.',
    importanceInFraud: 'Specifically suited for highly skewed distributions (0.172% fraud) where true negatives dominate.',
  },
];

export const mockExperimentResults: ExperimentResult[] = mock15ModelConfigurations.map((cfg) => ({
  id: cfg.id,
  model: cfg,
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
  rocCurve: [],
  prCurve: [],
  trainingTime: '—',
  status: 'Artifact expected',
}));

export const evaluationApi = {
  getMetricDefinitions: async (): Promise<MetricDefinition[]> => {
    return Promise.resolve(mockMetricDefinitions);
  },
  getAllExperimentResults: async (): Promise<ExperimentResult[]> => {
    return Promise.resolve(mockExperimentResults);
  },
  getExperimentResultById: async (id: string): Promise<ExperimentResult | undefined> => {
    return Promise.resolve(mockExperimentResults.find((r) => r.id === id));
  },
};
