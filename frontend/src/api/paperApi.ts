import { PaperMetadata } from '../types/paper';

export const PUBLISHED_REFERENCE_PAPER: PaperMetadata = {
  title: 'A Machine Learning Based Credit Card Fraud Detection Using the GA Algorithm for Feature Selection',
  authors: ['Matthew Olusegun Ileberi', 'Yanxia Sun', 'Zenghui Wang'],
  journal: 'IEEE Access / Peer-reviewed Research',
  year: 2022,
  doi: '10.1109/ACCESS.2022.3168285',
  researchGoal:
    'Evaluate Genetic Algorithm (GA) driven feature selection for optimizing credit card fraud detection across multiple supervised learning classifiers on highly imbalanced transaction streams.',
  dataset: 'European Credit Card Fraud (284,807 transactions, 492 frauds / 0.172%)',
  publishedVectors: [
    {
      id: 'v1',
      name: 'Feature Vector 1 (22 Features)',
      count: 22,
      features: ['Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V9', 'V10', 'V11', 'V12', 'V14', 'V16', 'V17', 'V18', 'V19', 'V20', 'V21', 'V26', 'V27', 'Amount'],
      description: 'Initial convergence chromosome retaining 22 principal components plus Time & Amount.',
      publishedAccuracy: '99.94%',
      publishedRecall: '88.78%',
      publishedPrecision: '86.14%',
    },
    {
      id: 'v2',
      name: 'Feature Vector 2 (20 Features)',
      count: 20,
      features: ['Time', 'V2', 'V3', 'V4', 'V7', 'V9', 'V10', 'V11', 'V12', 'V14', 'V16', 'V17', 'V18', 'V19', 'V20', 'V21', 'V22', 'V26', 'V27', 'Amount'],
      description: 'Pruned chromosome prioritizing high-variance PCA features with balanced accuracy.',
      publishedAccuracy: '99.95%',
      publishedRecall: '90.82%',
      publishedPrecision: '87.25%',
    },
    {
      id: 'v3',
      name: 'Feature Vector 3 (18 Features)',
      count: 18,
      features: ['Time', 'V3', 'V4', 'V7', 'V9', 'V10', 'V11', 'V12', 'V14', 'V16', 'V17', 'V18', 'V20', 'V21', 'V22', 'V26', 'V27', 'Amount'],
      description: 'Intermediate subset demonstrating high recall in published random forest tests.',
      publishedAccuracy: '99.96%',
      publishedRecall: '92.86%',
      publishedPrecision: '89.22%',
    },
    {
      id: 'v4',
      name: 'Feature Vector 4 (15 Features)',
      count: 15,
      features: ['Time', 'V4', 'V7', 'V10', 'V11', 'V12', 'V14', 'V16', 'V17', 'V18', 'V21', 'V22', 'V26', 'V27', 'Amount'],
      description: 'Compact chromosome yielding optimal cost-sensitive tradeoff in published tests.',
      publishedAccuracy: '99.97%',
      publishedRecall: '93.88%',
      publishedPrecision: '91.09%',
    },
    {
      id: 'v5',
      name: 'Feature Vector 5 (13 Features)',
      count: 13,
      features: ['Time', 'V4', 'V10', 'V11', 'V12', 'V14', 'V16', 'V17', 'V18', 'V21', 'V26', 'V27', 'Amount'],
      description: 'Highly compressed 13-feature subset achieving maximum published F1 score in the original study.',
      publishedAccuracy: '99.97%',
      publishedRecall: '94.90%',
      publishedPrecision: '92.08%',
    },
  ],
  publishedResults: [
    { vectorId: 'v1', vectorName: 'Vector 1 (22 Feats)', model: 'Random Forest', accuracy: '99.94%', recall: '88.78%', precision: '86.14%', f1: '87.44%', auc: '0.943' },
    { vectorId: 'v1', vectorName: 'Vector 1 (22 Feats)', model: 'Decision Tree', accuracy: '99.90%', recall: '81.63%', precision: '76.19%', f1: '78.82%', auc: '0.907' },
    { vectorId: 'v1', vectorName: 'Vector 1 (22 Feats)', model: 'Logistic Regression', accuracy: '99.91%', recall: '64.29%', precision: '84.00%', f1: '72.83%', auc: '0.821' },
    { vectorId: 'v1', vectorName: 'Vector 1 (22 Feats)', model: 'ANN / MLP', accuracy: '99.93%', recall: '82.65%', precision: '80.20%', f1: '81.41%', auc: '0.912' },
    { vectorId: 'v1', vectorName: 'Vector 1 (22 Feats)', model: 'Naive Bayes', accuracy: '97.80%', recall: '85.71%', precision: '06.27%', f1: '11.68%', auc: '0.918' },

    { vectorId: 'v5', vectorName: 'Vector 5 (13 Feats - Optimal)', model: 'Random Forest', accuracy: '99.97%', recall: '94.90%', precision: '92.08%', f1: '93.47%', auc: '0.974' },
    { vectorId: 'v5', vectorName: 'Vector 5 (13 Feats - Optimal)', model: 'Decision Tree', accuracy: '99.91%', recall: '83.67%', precision: '77.36%', f1: '80.39%', auc: '0.917' },
    { vectorId: 'v5', vectorName: 'Vector 5 (13 Feats - Optimal)', model: 'Logistic Regression', accuracy: '99.92%', recall: '67.35%', precision: '84.62%', f1: '75.00%', auc: '0.836' },
    { vectorId: 'v5', vectorName: 'Vector 5 (13 Feats - Optimal)', model: 'ANN / MLP', accuracy: '99.94%', recall: '85.71%', precision: '83.17%', f1: '84.42%', auc: '0.928' },
    { vectorId: 'v5', vectorName: 'Vector 5 (13 Feats - Optimal)', model: 'Naive Bayes', accuracy: '97.95%', recall: '86.73%', precision: '06.82%', f1: '12.65%', auc: '0.923' },
  ],
};

export async function getReferencePaperMetadata(): Promise<PaperMetadata> {
  return PUBLISHED_REFERENCE_PAPER;
}
