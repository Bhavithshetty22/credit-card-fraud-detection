export interface DatasetSummary {
  totalRecords: number;
  inputFeaturesCount: number;
  fraudRecords: number;
  legitimateRecords: number;
  fraudPercentage: number;
  legitimatePercentage: number;
  timeSpanDays: number;
  dataSource: string;
  targetColumn: string;
  featureTypes: string;
}

export interface FeatureSchemaItem {
  name: string;
  type: string;
  description: string;
  role: 'Input Feature' | 'Target';
  isPCA?: boolean;
}

export interface DatasetCharacteristic {
  title: string;
  value: string | number;
  description: string;
  isDynamic?: boolean;
}

export interface ValidationCheckItem {
  id: string;
  label: string;
  status: 'passed' | 'pending' | 'warning' | 'failed';
  detail: string;
  isBackendRequired?: boolean;
}

export interface DatasetValidationResponse {
  isValid: boolean;
  message: string;
  timestamp: string;
  checks: ValidationCheckItem[];
}
