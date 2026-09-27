export type ExportFormat = 'csv' | 'excel' | 'json' | 'png' | 'pdf';

export type ExportCategory =
  | 'predictions'
  | 'metrics'
  | 'ga_features'
  | 'confusion_matrix'
  | 'roc_curves'
  | 'charts'
  | 'presentation_assets';

export interface ReportConfig {
  includeDatasetSummary: boolean;
  includeGAResults: boolean;
  includeMetrics: boolean;
  includeROC: boolean;
  includeConfusionMatrices: boolean;
  includeFeatureImportance: boolean;
  includePaperComparison: boolean;
  format: 'pdf' | 'html' | 'markdown';
}
