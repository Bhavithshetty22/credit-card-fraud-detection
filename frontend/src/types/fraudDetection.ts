import { ClassifierName, FeatureSetType } from './models';

export interface SingleTransactionInput {
  Time: string;
  Amount: string;
  V1: string;
  V2: string;
  V3: string;
  V4: string;
  V5: string;
  V6: string;
  V7: string;
  V8: string;
  V9: string;
  V10: string;
  V11: string;
  V12: string;
  V13: string;
  V14: string;
  V15: string;
  V16: string;
  V17: string;
  V18: string;
  V19: string;
  V20: string;
  V21: string;
  V22: string;
  V23: string;
  V24: string;
  V25: string;
  V26: string;
  V27: string;
  V28: string;
}

export interface FraudDetectionRequest {
  classifier: ClassifierName;
  featureSet: FeatureSetType;
  features: Record<string, number>;
}

export interface FraudDetectionResponse {
  prediction: 0 | 1;
  label: 'Legitimate' | 'Fraud';
  probability: number | null;
  model: string;
  featureSet: string;
  featureCount: number | null;
  processingTimeMs: number | null;
  timestamp: string;
}

export interface BatchDetectionRequest {
  classifier: ClassifierName;
  featureSet: FeatureSetType;
  transactions: Record<string, number>[];
}

export interface BatchPredictionItem {
  rowIndex: number;
  prediction: 'Legitimate' | 'Fraud';
  probability: number | null;
  groundTruth?: 'Legitimate' | 'Fraud' | null;
  isCorrect?: boolean | null;
  rawFeatures: Record<string, number>;
}

export interface BatchDetectionResponse {
  total: number;
  fraudCount: number;
  legitimateCount: number;
  fraudRate: number | null;
  processingTimeMs: number | null;
  predictions: BatchPredictionItem[];
  model: string;
  featureSet: string;
}

export interface PredictionHistoryItem {
  id: string;
  timestamp: string;
  model: string;
  featureSet: string;
  prediction: 'Legitimate' | 'Fraud';
  probability: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  fileName: string;
  rowCount: number;
  columns: string[];
  missingRequiredColumns: string[];
  hasGroundTruth: boolean;
  previewRows: Record<string, string>[];
  errorMessage?: string;
}

export interface BackendStatusInfo {
  status: 'Connected' | 'Disconnected' | 'Checking';
  apiEndpoint: string;
  modelArtifactsDetected: number;
  latencyMs: number | null;
}
