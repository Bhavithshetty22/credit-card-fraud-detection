export interface GAConfig {
  populationSize: number;
  totalFeatures: number;
  generations: string;
  crossoverType: string;
  mutationStatus: string;
  fitnessClassifier: string;
  fitnessMetric: string;
  selectionMethod: string;
  elitismCount: number;
}

export interface GACycleStage {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  details: string;
}

export interface ChromosomeGene {
  index: number;
  featureName: string;
  bit: 0 | 1;
  role: 'PCA Component' | 'Temporal' | 'Monetary';
  description: string;
}

export interface PopulationCandidate {
  id: string;
  label: string;
  chromosomeBits: string;
  selectedCount: number;
  fitnessScorePlaceholder: string;
  status: 'Elite' | 'Selected' | 'Candidate';
}

export interface ConvergencePoint {
  generation: number;
  bestFitness: number;
  averageFitness: number;
}

export interface ReferenceFeatureVector {
  id: string;
  name: string;
  featureCount: number;
  features: string[];
  paperReportedAccuracy?: string;
  description: string;
}

export interface GAResult {
  selectedFeatures: string[];
  selectedMask: number[];
  featureCount: number | null;
  bestFitness: number | null;
  bestGeneration: number | null;
  status: 'Awaiting GA Artifact' | 'Loaded' | 'Running';
  artifactPath: string;
}
