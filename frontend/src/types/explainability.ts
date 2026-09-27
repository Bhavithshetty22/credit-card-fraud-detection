export interface FeatureImportanceItem {
  feature: string;
  importance: number | null;
  contributionType?: 'positive' | 'negative' | 'neutral';
  rank?: number;
}

export interface LocalExplanationData {
  transactionId?: string;
  prediction: number | null;
  label: 'Legitimate' | 'Fraud' | null;
  confidence: number | null;
  classifier: string;
  featureStrategy: string;
  inferenceTimeMs: number | null;
  strongPositive: string[];
  moderatePositive: string[];
  weakContributors: string[];
  neutralUnknown: string[];
  contributions: FeatureImportanceItem[];
}

export interface ExplainabilityStatus {
  isAvailable: boolean;
  engine: string;
  supportedMethods: string[];
  statusMessage: string;
}
