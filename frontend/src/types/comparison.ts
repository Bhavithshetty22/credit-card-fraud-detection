import { ClassifierName, FeatureSetType } from './models';
import { EvaluationMetrics, ConfusionMatrixData, CurvePoint } from './evaluation';

export type ComparisonMetric =
  | 'Accuracy'
  | 'Precision'
  | 'Recall'
  | 'F1 Score'
  | 'ROC-AUC'
  | 'PR-AUC';

export interface ClassifierComparison {
  classifier: ClassifierName;
  shortName: string;
  fullFeaturesMetric: number | null | string;
  gaFeaturesMetric: number | null | string;
  randomFeaturesMetric: number | null | string;
}

export interface FeatureSetComparison {
  name: FeatureSetType;
  description: string;
  featureCount: string | number;
  selectionMethod: string;
  trainingData: string;
  evaluationData: string;
  status: string;
}

export interface ExperimentComparison {
  id: string;
  classifier: ClassifierName;
  shortClassifier: string;
  featureSet: FeatureSetType;
  shortFeatureSet: 'Full' | 'GA' | 'Random';
  featureCount: string | number;
  status: 'Artifact expected' | 'Pending evaluation' | 'Available';
  metrics: EvaluationMetrics;
  confusionMatrix: ConfusionMatrixData;
  rocPoints: CurvePoint[];
  prPoints: CurvePoint[];
  trainingData: string;
  testData: string;
  smoteStatus: string;
  modelArtifact: string;
}

export interface GaImpactData {
  featureReductionRatio: string | null;
  performanceDelta: string | null;
  trainingTimeDelta: string | null;
  status: string;
}

export interface ResearchExperimentSummary {
  totalClassifiers: number;
  totalFeatureSets: number;
  totalExperiments: number;
  heldOutTestSamples: number;
  isBackendConnected: boolean;
}

export interface ReferencePaperResultRow {
  featureVector: string;
  featureCount: number;
  model: string;
  accuracy: string;
  recall: string;
  precision: string;
  f1: string;
  auc: string;
}
