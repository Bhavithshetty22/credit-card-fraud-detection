import {
  DatasetSummary,
  FeatureSchemaItem,
  DatasetCharacteristic,
  ValidationCheckItem,
  DatasetValidationResponse,
} from '../types/dataset';

export const mockDatasetSummary: DatasetSummary = {
  totalRecords: 284807,
  inputFeaturesCount: 30,
  fraudRecords: 492,
  legitimateRecords: 284315,
  fraudPercentage: 0.172,
  legitimatePercentage: 99.828,
  timeSpanDays: 2,
  dataSource: 'European Cardholders (Sept 2013)',
  targetColumn: 'Class',
  featureTypes: 'Continuous Numerical (PCA + Time + Amount)',
};

export const mockFeatureSchema: FeatureSchemaItem[] = [
  {
    name: 'Time',
    type: 'Numerical (Float)',
    description: 'Seconds elapsed between this transaction and the first transaction in the dataset',
    role: 'Input Feature',
  },
  ...Array.from({ length: 28 }, (_, i) => ({
    name: `V${i + 1}`,
    type: 'Numerical (Float)',
    description: `Principal component ${i + 1} obtained via PCA dimensionality reduction (anonymized)`,
    role: 'Input Feature' as const,
    isPCA: true,
  })),
  {
    name: 'Amount',
    type: 'Numerical (Float)',
    description: 'Transaction monetary amount in Euros (€)',
    role: 'Input Feature',
  },
  {
    name: 'Class',
    type: 'Integer (Binary)',
    description: 'Ground-truth classification label: 0 = Legitimate, 1 = Fraudulent',
    role: 'Target',
  },
];

export const mockDatasetCharacteristics: DatasetCharacteristic[] = [
  {
    title: 'Numerical Features',
    value: '30',
    description: 'Time + V1–V28 PCA components + Amount',
  },
  {
    title: 'Missing Values',
    value: '0*',
    description: 'No null values found in raw benchmark dataset',
    isDynamic: true,
  },
  {
    title: 'Duplicates',
    value: 'Loaded from dataset',
    description: '1,081 duplicate transactions identified in raw creditcard.csv',
  },
  {
    title: 'Target Type',
    value: 'Binary Classification',
    description: 'Discrete Class variable (0: Legitimate, 1: Fraudulent)',
  },
  {
    title: 'Time Span',
    value: '2 Days (48 Hours)',
    description: 'Temporal transactions logged across 172,792 seconds',
  },
  {
    title: 'Data Source',
    value: 'European Cardholders',
    description: 'ULB Machine Learning Group / Worldline benchmark',
  },
];

export const mockValidationChecks: ValidationCheckItem[] = [
  {
    id: 'chk-1',
    label: 'File detected',
    status: 'passed',
    detail: 'data/creditcard.csv located in project repository',
  },
  {
    id: 'chk-2',
    label: 'Target column detected',
    status: 'passed',
    detail: 'Column "Class" verified (supported aliases: Class, class, target, fraud)',
  },
  {
    id: 'chk-3',
    label: '30 input features detected',
    status: 'passed',
    detail: 'Time, V1 through V28, and Amount mapped with zero missing columns',
  },
  {
    id: 'chk-4',
    label: 'Numerical feature schema',
    status: 'passed',
    detail: 'All 30 feature series conform to 64-bit continuous floating-point format',
  },
  {
    id: 'chk-5',
    label: 'Binary target',
    status: 'passed',
    detail: 'Target classes strictly contain {0, 1} with no extraneous labels',
  },
  {
    id: 'chk-6',
    label: 'Runtime validation',
    status: 'pending',
    detail: 'Direct backend Python schema & memory check pending API connection',
    isBackendRequired: true,
  },
];

export const datasetApi = {
  getSummary: async (): Promise<DatasetSummary> => {
    return Promise.resolve(mockDatasetSummary);
  },
  getSchema: async (): Promise<FeatureSchemaItem[]> => {
    return Promise.resolve(mockFeatureSchema);
  },
  getCharacteristics: async (): Promise<DatasetCharacteristic[]> => {
    return Promise.resolve(mockDatasetCharacteristics);
  },
  getValidationChecks: async (): Promise<ValidationCheckItem[]> => {
    return Promise.resolve(mockValidationChecks);
  },
  triggerValidation: async (): Promise<DatasetValidationResponse> => {
    // Simulated async execution
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      isValid: true,
      message: 'Backend validation endpoint will be connected in the next integration phase.',
      timestamp: new Date().toISOString(),
      checks: mockValidationChecks,
    };
  },
};
