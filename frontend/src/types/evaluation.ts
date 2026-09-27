import { ClassifierName, FeatureSetType, ModelConfiguration } from './models';

export interface EvaluationMetrics {
  accuracy: number | null | string;
  precision: number | null | string;
  recall: number | null | string;
  f1: number | null | string;
  roc_auc: number | null | string;
  pr_auc: number | null | string;
}

export interface ConfusionMatrixData {
  tn: number | null | string;
  fp: number | null | string;
  fn: number | null | string;
  tp: number | null | string;
  totalTested?: number | null | string;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface ExperimentResult {
  id: string;
  model: ModelConfiguration;
  metrics: EvaluationMetrics;
  confusionMatrix: ConfusionMatrixData;
  rocCurve: CurvePoint[];
  prCurve: CurvePoint[];
  trainingTime: string | null;
  status: 'Pending' | 'Evaluated' | 'Artifact expected';
}

export interface MetricDefinition {
  name: string;
  shortFormula?: string;
  description: string;
  importanceInFraud: string;
}
