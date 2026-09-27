export type ClassifierName =
  | 'Random Forest'
  | 'Decision Tree'
  | 'Logistic Regression'
  | 'Artificial Neural Network'
  | 'Naive Bayes';

export type FeatureSetType = 'Full Features' | 'GA Features' | 'Random Features';

export interface ModelHyperparameters {
  [key: string]: string | number;
}

export interface ClassifierProfile {
  id: string;
  name: ClassifierName;
  shortName: string;
  description: string;
  tags: string[];
  iconName: string;
  status: 'Ready' | 'Configured' | 'Training';
  hyperparameters: ModelHyperparameters;
  featureConfigurations: FeatureSetType[];
}

export interface ModelConfiguration {
  id: string;
  classifier: ClassifierName;
  shortClassifier: string;
  featureSet: FeatureSetType;
  shortFeatureSet: 'Full' | 'GA' | 'Random';
  featureCount: number | string;
  artifactId: string;
  scalerArtifact: string;
  featureMaskArtifact: string;
  status: 'Available' | 'Pending evaluation' | 'Artifact expected';
  trainingData: string;
  evaluationData: string;
  hyperparameters: ModelHyperparameters;
}
