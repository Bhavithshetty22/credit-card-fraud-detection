export type PreprocessingStepId =
  | 'ingestion'
  | 'cleaning'
  | 'split'
  | 'scaling'
  | 'smote';

export interface PreprocessingStep {
  id: PreprocessingStepId;
  stepNumber: string;
  title: string;
  subtitle: string;
  status: 'Ready' | 'Configured' | 'Pending';
  shortDescription: string;
}

export interface SplitMetrics {
  totalRecords: number;
  trainRatio: number;
  testRatio: number;
  trainCount: number;
  testCount: number;
  isStratified: boolean;
  isTestLocked: boolean;
}

export interface ScalingConfig {
  method: string;
  formula: string;
  inputRange: string;
  outputRange: string;
  fittedOn: string;
  appliedTo: string;
  leakagePreventionNote: string;
}

export interface SmoteConfig {
  strategy: string;
  minorityLabel: string;
  majorityLabel: string;
  beforeDistribution: {
    legitimate: string;
    fraud: string;
  };
  afterDistribution: {
    legitimate: string;
    fraud: string;
  };
  mechanismSteps: string[];
}
