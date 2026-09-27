export interface GARunResult {
  selectedFeatureCount: number | null;
  selectedFeatures: string[];
  generationsCompleted: number | null;
  bestFitness: number | null;
  runtimeSeconds: number | null;
  convergenceCurve: { generation: number; bestFitness: number; avgFitness: number }[];
}

export interface ModelMetricResult {
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  rocAuc: number | null;
  prAuc: number | null;
  trainingTimeSec: number | null;
  inferenceLatencyMs: number | null;
}

export interface ClassifierResultGroup {
  classifierId: string;
  name: string;
  fullFeatures: ModelMetricResult;
  gaFeatures: ModelMetricResult;
  randomFeatures: ModelMetricResult;
}

import { ConfusionMatrixData } from './evaluation';
export type { ConfusionMatrixData };

export interface ResearchResultsOverview {
  datasetValidated: boolean;
  gaOptimized: boolean;
  experimentsCompletedCount: number;
  totalExperiments: number;
  evaluationFinalized: boolean;
  backendConnected: boolean;
}
