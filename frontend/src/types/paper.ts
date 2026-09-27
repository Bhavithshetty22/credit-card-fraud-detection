export interface PaperFeatureVector {
  id: string;
  name: string;
  count: number;
  features: string[];
  description: string;
  publishedAccuracy?: string;
  publishedRecall?: string;
  publishedPrecision?: string;
}

export interface PaperExperimentRow {
  vectorId: string;
  vectorName: string;
  model: string;
  accuracy: string;
  recall: string;
  precision: string;
  f1: string;
  auc: string;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  researchGoal: string;
  dataset: string;
  publishedVectors: PaperFeatureVector[];
  publishedResults: PaperExperimentRow[];
}
