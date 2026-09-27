import { ClassifierProfile, ModelConfiguration, ClassifierName, FeatureSetType } from '../types/models';

export const mockClassifierProfiles: ClassifierProfile[] = [
  {
    id: 'random_forest',
    name: 'Random Forest',
    shortName: 'RF',
    description: 'Ensemble of decision trees used as the primary GA fitness classifier and fraud detection model.',
    tags: ['ENSEMBLE', 'TREE-BASED'],
    iconName: 'Trees',
    status: 'Ready',
    hyperparameters: {
      n_estimators: 100,
      random_state: 42,
      n_jobs: -1,
    },
    featureConfigurations: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'decision_tree',
    name: 'Decision Tree',
    shortName: 'DT',
    description: 'Tree-based supervised classifier that recursively partitions the feature space.',
    tags: ['TREE', 'CLASSIFICATION'],
    iconName: 'GitFork',
    status: 'Ready',
    hyperparameters: {
      random_state: 42,
      criterion: 'gini',
    },
    featureConfigurations: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    shortName: 'LR',
    description: 'Binary classification model that estimates the probability of fraudulent transactions.',
    tags: ['LINEAR', 'PROBABILISTIC'],
    iconName: 'TrendingUp',
    status: 'Ready',
    hyperparameters: {
      max_iter: 1000,
      random_state: 42,
      solver: 'lbfgs',
    },
    featureConfigurations: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'ann',
    name: 'Artificial Neural Network',
    shortName: 'ANN',
    description: 'Feed-forward multilayer neural network used for binary fraud classification.',
    tags: ['NEURAL NETWORK', 'MLP'],
    iconName: 'BrainCircuit',
    status: 'Ready',
    hyperparameters: {
      hidden_layer_sizes: '(64, 32)',
      max_iter: 100,
      random_state: 42,
    },
    featureConfigurations: ['Full Features', 'GA Features', 'Random Features'],
  },
  {
    id: 'naive_bayes',
    name: 'Naive Bayes',
    shortName: 'NB',
    description: "Probabilistic classifier based on Bayes' theorem with Gaussian feature assumptions.",
    tags: ['PROBABILISTIC', 'GAUSSIAN'],
    iconName: 'Compass',
    status: 'Ready',
    hyperparameters: {
      model_type: 'GaussianNB',
      configuration: 'Default parameters',
    },
    featureConfigurations: ['Full Features', 'GA Features', 'Random Features'],
  },
];

const classifiersList: { name: ClassifierName; short: string; hp: any }[] = [
  { name: 'Random Forest', short: 'RF', hp: { n_estimators: 100, random_state: 42 } },
  { name: 'Decision Tree', short: 'DT', hp: { random_state: 42 } },
  { name: 'Logistic Regression', short: 'LR', hp: { max_iter: 1000, random_state: 42 } },
  { name: 'Artificial Neural Network', short: 'ANN', hp: { hidden_layer_sizes: '(64, 32)', max_iter: 100, random_state: 42 } },
  { name: 'Naive Bayes', short: 'NB', hp: { model_type: 'GaussianNB' } },
];

const featureSetsList: { set: FeatureSetType; short: 'Full' | 'GA' | 'Random'; count: string }[] = [
  { set: 'Full Features', short: 'Full', count: '30' },
  { set: 'GA Features', short: 'GA', count: '—' },
  { set: 'Random Features', short: 'Random', count: '—' },
];

export const mock15ModelConfigurations: ModelConfiguration[] = classifiersList.flatMap((clf) =>
  featureSetsList.map((fSet) => {
    const slug = `${clf.short.toLowerCase()}_${fSet.short.toLowerCase()}`;
    return {
      id: slug,
      classifier: clf.name,
      shortClassifier: clf.short,
      featureSet: fSet.set,
      shortFeatureSet: fSet.short,
      featureCount: fSet.count,
      artifactId: `models/trained/${slug}.joblib`,
      scalerArtifact: 'models/scaler.joblib',
      featureMaskArtifact: fSet.short === 'GA' ? 'models/ga_feature_selection.joblib' : fSet.short === 'Random' ? 'models/random_feature_selection.joblib' : 'All 30 Features',
      status: 'Artifact expected',
      trainingData: 'SMOTE-balanced training partition (80%)',
      evaluationData: 'Held-out test partition (20% un-resampled)',
      hyperparameters: clf.hp,
    };
  })
);

export const modelApi = {
  getProfiles: async (): Promise<ClassifierProfile[]> => {
    return Promise.resolve(mockClassifierProfiles);
  },
  get15Configurations: async (): Promise<ModelConfiguration[]> => {
    return Promise.resolve(mock15ModelConfigurations);
  },
  getConfigurationById: async (id: string): Promise<ModelConfiguration | undefined> => {
    return Promise.resolve(mock15ModelConfigurations.find((c) => c.id === id));
  },
};
