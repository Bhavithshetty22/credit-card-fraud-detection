import {
  GAConfig,
  GACycleStage,
  ChromosomeGene,
  PopulationCandidate,
  ConvergencePoint,
  ReferenceFeatureVector,
  GAResult,
} from '../types/ga';

export const mockGAConfig: GAConfig = {
  populationSize: 20,
  totalFeatures: 30,
  generations: '30 [Configured Parameter]',
  crossoverType: '1-point crossover (Rate: 0.8)',
  mutationStatus: 'Enabled (Bit-flip probability: 0.05)',
  fitnessClassifier: 'Random Forest (100 estimators, random_state=42)',
  fitnessMetric: 'F1 Score (Validation sub-split)',
  selectionMethod: 'Tournament Selection (k=3)',
  elitismCount: 2,
};

export const mockGACycleStages: GACycleStage[] = [
  {
    step: '01',
    title: 'INITIAL POPULATION',
    subtitle: 'Candidate Subsets',
    description: 'Generate candidate feature subsets.',
    iconName: 'Users',
    details: 'Initializes 20 random 30-bit binary chromosomes representing stochastic feature permutations.',
  },
  {
    step: '02',
    title: 'FITNESS EVALUATION',
    subtitle: 'RF F1 Scoring',
    description: 'Evaluate each candidate using the selected fitness model.',
    iconName: 'Activity',
    details: 'Trains a Random Forest classifier on scaled training data and scores F1 on an isolated validation partition.',
  },
  {
    step: '03',
    title: 'SELECTION',
    subtitle: 'Tournament Mechanism',
    description: 'Retain stronger candidate solutions.',
    iconName: 'Trophy',
    details: 'Tournament selection filters candidates with higher F1 performance, preserving diversity while pruning weak subsets.',
  },
  {
    step: '04',
    title: 'CROSSOVER',
    subtitle: '1-Point Recombination',
    description: 'Combine candidate chromosomes.',
    iconName: 'GitMerge',
    details: 'Single crossover point selected randomly across the 30-gene sequence to produce child chromosomes.',
  },
  {
    step: '05',
    title: 'MUTATION',
    subtitle: 'Bit-Flip Stochasticity',
    description: 'Introduce feature-level variation.',
    iconName: 'Sparkles',
    details: 'Bit-level probabilistic flips (0 → 1 or 1 → 0) prevent premature convergence to local optima.',
  },
  {
    step: '06',
    title: 'CONVERGENCE',
    subtitle: 'Stabilization Check',
    description: 'Track improvement until the optimization stabilizes.',
    iconName: 'TrendingUp',
    details: 'Tracks generation fitness delta until generational limit is reached and best chromosome is extracted.',
  },
];

export const mockIllustrativeGenes: ChromosomeGene[] = [
  { index: 0, featureName: 'Time', bit: 0, role: 'Temporal', description: 'Seconds elapsed from first transaction' },
  { index: 1, featureName: 'V1', bit: 1, role: 'PCA Component', description: 'PCA component 1' },
  { index: 2, featureName: 'V2', bit: 0, role: 'PCA Component', description: 'PCA component 2' },
  { index: 3, featureName: 'V3', bit: 1, role: 'PCA Component', description: 'PCA component 3' },
  { index: 4, featureName: 'V4', bit: 1, role: 'PCA Component', description: 'PCA component 4' },
  { index: 5, featureName: 'V5', bit: 0, role: 'PCA Component', description: 'PCA component 5' },
  { index: 6, featureName: 'V6', bit: 0, role: 'PCA Component', description: 'PCA component 6' },
  { index: 7, featureName: 'V7', bit: 1, role: 'PCA Component', description: 'PCA component 7' },
  { index: 8, featureName: 'V8', bit: 0, role: 'PCA Component', description: 'PCA component 8' },
  { index: 9, featureName: 'V9', bit: 1, role: 'PCA Component', description: 'PCA component 9' },
  { index: 10, featureName: 'V10', bit: 0, role: 'PCA Component', description: 'PCA component 10' },
  { index: 11, featureName: 'V11', bit: 1, role: 'PCA Component', description: 'PCA component 11' },
  { index: 12, featureName: 'V12', bit: 1, role: 'PCA Component', description: 'PCA component 12' },
  { index: 13, featureName: 'V13', bit: 0, role: 'PCA Component', description: 'PCA component 13' },
  { index: 14, featureName: 'V14', bit: 1, role: 'PCA Component', description: 'PCA component 14' },
  { index: 15, featureName: 'V15', bit: 1, role: 'PCA Component', description: 'PCA component 15' },
  { index: 16, featureName: 'V16', bit: 0, role: 'PCA Component', description: 'PCA component 16' },
  { index: 17, featureName: 'V17', bit: 0, role: 'PCA Component', description: 'PCA component 17' },
  { index: 18, featureName: 'V18', bit: 1, role: 'PCA Component', description: 'PCA component 18' },
  { index: 19, featureName: 'V19', bit: 1, role: 'PCA Component', description: 'PCA component 19' },
  { index: 20, featureName: 'V20', bit: 0, role: 'PCA Component', description: 'PCA component 20' },
  { index: 21, featureName: 'V21', bit: 1, role: 'PCA Component', description: 'PCA component 21' },
  { index: 22, featureName: 'V22', bit: 0, role: 'PCA Component', description: 'PCA component 22' },
  { index: 23, featureName: 'V23', bit: 0, role: 'PCA Component', description: 'PCA component 23' },
  { index: 24, featureName: 'V24', bit: 1, role: 'PCA Component', description: 'PCA component 24' },
  { index: 25, featureName: 'V25', bit: 0, role: 'PCA Component', description: 'PCA component 25' },
  { index: 26, featureName: 'V26', bit: 1, role: 'PCA Component', description: 'PCA component 26' },
  { index: 27, featureName: 'V27', bit: 1, role: 'PCA Component', description: 'PCA component 27' },
  { index: 28, featureName: 'V28', bit: 0, role: 'PCA Component', description: 'PCA component 28' },
  { index: 29, featureName: 'Amount', bit: 1, role: 'Monetary', description: 'Transaction monetary amount' },
];

export const mockPopulationCandidates: PopulationCandidate[] = [
  { id: 'cand-01', label: 'Candidate 01', chromosomeBits: '010110010101101100110100101101', selectedCount: 16, fitnessScorePlaceholder: '0.842 [Illustrative]', status: 'Elite' },
  { id: 'cand-02', label: 'Candidate 02', chromosomeBits: '110001101010110011011001010110', selectedCount: 15, fitnessScorePlaceholder: '0.835 [Illustrative]', status: 'Selected' },
  { id: 'cand-03', label: 'Candidate 03', chromosomeBits: '100111001101001101001101101001', selectedCount: 15, fitnessScorePlaceholder: '0.828 [Illustrative]', status: 'Selected' },
  { id: 'cand-04', label: 'Candidate 04', chromosomeBits: '001101011011100010110011010110', selectedCount: 14, fitnessScorePlaceholder: '0.819 [Illustrative]', status: 'Candidate' },
  { id: 'cand-05', label: 'Candidate 05', chromosomeBits: '111010010010111001011010011001', selectedCount: 14, fitnessScorePlaceholder: '0.812 [Illustrative]', status: 'Candidate' },
  { id: 'cand-06', label: 'Candidate 06', chromosomeBits: '010110100110011100101101001110', selectedCount: 14, fitnessScorePlaceholder: '0.804 [Illustrative]', status: 'Candidate' },
  { id: 'cand-07', label: 'Candidate 07', chromosomeBits: '101001110101001011010011100101', selectedCount: 13, fitnessScorePlaceholder: '0.796 [Illustrative]', status: 'Candidate' },
  { id: 'cand-08', label: 'Candidate 08', chromosomeBits: '011100011010110100101100110100', selectedCount: 13, fitnessScorePlaceholder: '0.789 [Illustrative]', status: 'Candidate' },
];

export const mockConvergenceHistory: ConvergencePoint[] = [
  { generation: 1, bestFitness: 0.762, averageFitness: 0.698 },
  { generation: 3, bestFitness: 0.785, averageFitness: 0.721 },
  { generation: 6, bestFitness: 0.804, averageFitness: 0.748 },
  { generation: 9, bestFitness: 0.819, averageFitness: 0.769 },
  { generation: 12, bestFitness: 0.828, averageFitness: 0.784 },
  { generation: 15, bestFitness: 0.835, averageFitness: 0.796 },
  { generation: 18, bestFitness: 0.840, averageFitness: 0.809 },
  { generation: 21, bestFitness: 0.842, averageFitness: 0.816 },
  { generation: 24, bestFitness: 0.842, averageFitness: 0.821 },
  { generation: 27, bestFitness: 0.842, averageFitness: 0.824 },
  { generation: 30, bestFitness: 0.842, averageFitness: 0.826 },
];

export const mockReferenceVectors: ReferenceFeatureVector[] = [
  {
    id: 'v1',
    name: 'Vector v1',
    featureCount: 18,
    features: ['V1', 'V5', 'V7', 'V8', 'V11', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20', 'V21', 'V22', 'V23', 'V24', 'Amount'],
    paperReportedAccuracy: '99.93%',
    description: 'Broad PCA subspace combining high and mid-index features along with transaction Amount.',
  },
  {
    id: 'v2',
    name: 'Vector v2',
    featureCount: 9,
    features: ['V1', 'V6', 'V13', 'V16', 'V17', 'V22', 'V23', 'V28', 'Amount'],
    paperReportedAccuracy: '99.91%',
    description: 'Compact 9-feature subset focused on extreme PCA components and Amount.',
  },
  {
    id: 'v3',
    name: 'Vector v3',
    featureCount: 13,
    features: ['V2', 'V11', 'V12', 'V13', 'V15', 'V16', 'V17', 'V18', 'V20', 'V21', 'V24', 'V26', 'Amount'],
    paperReportedAccuracy: '99.94%',
    description: 'Intermediate feature cluster emphasizing components between V11 and V26.',
  },
  {
    id: 'v4',
    name: 'Vector v4',
    featureCount: 9,
    features: ['V2', 'V7', 'V10', 'V13', 'V15', 'V17', 'V19', 'V28', 'Amount'],
    paperReportedAccuracy: '99.92%',
    description: 'Targeted subset capturing lower and upper PCA variance indicators.',
  },
  {
    id: 'v5',
    name: 'Vector v5',
    featureCount: 13,
    features: ['Time', 'V1', 'V7', 'V8', 'V9', 'V11', 'V12', 'V14', 'V15', 'V22', 'V27', 'V28', 'Amount'],
    paperReportedAccuracy: '99.95%',
    description: 'Combined subset integrating the temporal dimension (Time), early PCA, and Amount.',
  },
];

export const gaApi = {
  getConfig: async (): Promise<GAConfig> => {
    return Promise.resolve(mockGAConfig);
  },
  getCycleStages: async (): Promise<GACycleStage[]> => {
    return Promise.resolve(mockGACycleStages);
  },
  getIllustrativeChromosome: async (): Promise<ChromosomeGene[]> => {
    return Promise.resolve(mockIllustrativeGenes);
  },
  getPopulation: async (): Promise<PopulationCandidate[]> => {
    return Promise.resolve(mockPopulationCandidates);
  },
  getConvergenceHistory: async (): Promise<ConvergencePoint[]> => {
    return Promise.resolve(mockConvergenceHistory);
  },
  getReferenceVectors: async (): Promise<ReferenceFeatureVector[]> => {
    return Promise.resolve(mockReferenceVectors);
  },
  getArtifactResult: async (): Promise<GAResult> => {
    return Promise.resolve({
      selectedFeatures: [],
      selectedMask: [],
      featureCount: null,
      bestFitness: null,
      bestGeneration: null,
      status: 'Awaiting GA Artifact',
      artifactPath: 'models/ga_feature_selection.joblib',
    });
  },
};
