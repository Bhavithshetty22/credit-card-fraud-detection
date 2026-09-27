import { PresentationStep, DemoChecklistItem } from '../types/presentation';

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: 1,
    slug: 'introduction',
    title: 'Research Introduction & Problem Formulation',
    subtitle: 'Extreme class imbalance and curse of dimensionality in continuous credit card streams',
    category: 'Context & Foundation',
    keyPoints: [
      'Credit card fraud represents massive financial loss globally with subtle adversarial transaction patterns.',
      'European Credit Card dataset contains 284,807 transactions with extreme imbalance (only 492 frauds = 0.172%).',
      'The 30 continuous numerical features (Time, V1–V28 PCA, Amount) present dimensionality redundancy and noise.',
      'Project objective: Apply Genetic Algorithm (GA) evolutionary optimization to isolate high-discriminative feature subsets.',
    ],
    vivaChecklist: [
      'Explain why Accuracy is a misleading metric for 99.828% non-fraud distribution.',
      'Clarify why 28 PCA features are already anonymized and continuous.',
      'State the primary goal: maximize fraud Recall and F1-score without excessive false alarms.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Introduce the core problem: 0.172% extreme class imbalance where a naive "predict legitimate" classifier achieves 99.828% accuracy but 0% fraud detection utility.',
      researchContribution: 'Demonstrating that evolutionary GA feature selection discovers compact feature subsets that equal or outperform the full 30-feature baseline.',
      vivaDefenseTips: 'Highlight that standard loss functions fail on extreme imbalance; emphasizing the need for F1-based GA fitness and SMOTE resampling on train only.',
      backendIntegrationNote: 'Frontend is decoupled and ready to bind with serialized .joblib artifacts via REST API.',
    },
  },
  {
    id: 2,
    slug: 'dataset',
    title: 'Dataset Intelligence & Dimensionality',
    subtitle: '284,807 transactions with 30 continuous numerical inputs and binary ground-truth',
    category: 'Data Engineering',
    keyPoints: [
      '284,807 total records; 284,315 legitimate transactions vs 492 confirmed fraudulent events.',
      'Features V1–V28 are PCA-transformed components provided by original cardholders/institutions.',
      'Time: seconds elapsed from dataset origin; Amount: transaction monetary value.',
      'Target variable: Class (0 = Legitimate, 1 = Fraud). Class is never used as model input.',
    ],
    vivaChecklist: [
      'Confirm dataset origin: Kaggle/ULB European credit card dataset benchmark.',
      'Demonstrate why class distribution visualization shows extreme disproportion.',
      'State data cleanliness: no missing values, all continuous numerical types.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Walk through the dataset summary table and feature distributions. Highlight that PCA features have zero mean and unit variance initially, while Time and Amount need MinMax scaling.',
      researchContribution: 'Rigorous dataset integrity validation before downstream transformations.',
      vivaDefenseTips: 'Address why synthetic data is not used for evaluation: raw real-world distribution is strictly preserved in the 20% holdout test partition.',
      backendIntegrationNote: 'Dataset preview and stats pulled dynamically from datasetApi.',
    },
  },
  {
    id: 3,
    slug: 'preprocessing',
    title: 'Zero-Leakage Preprocessing Protocol',
    subtitle: 'Stratified train/test partition, train-only MinMax fitting, and isolated SMOTE balancing',
    category: 'Pipeline Rigor',
    keyPoints: [
      'Strict 80% Train (227,845 records) / 20% Test (56,962 records) stratified split.',
      'MinMaxScaler fit exclusively on X_train, then applied to transform X_train and X_test.',
      'SMOTE (Synthetic Minority Over-sampling Technique) applied strictly to training partitions.',
      'Test partition is permanently isolated from synthetic generation and parameter fitting.',
    ],
    vivaChecklist: [
      'Explain data leakage risk: fitting scalers or SMOTE on the entire dataset leads to artificially inflated test metrics.',
      'Clarify that SMOTE synthesizes fraudulent instances along k-NN feature vectors in training space only.',
      'Confirm the test set retains the natural 0.172% fraud imbalance for realistic evaluation.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Emphasize the zero-leakage boundary diagram. Walk through the 5-step stepper: cleaning -> stratified split -> train-fitted scaling -> GA selection -> train-only SMOTE.',
      researchContribution: 'Addressing a critical methodological gap where many published papers inadvertently leak test information via whole-dataset scaling or whole-dataset SMOTE.',
      vivaDefenseTips: 'Be ready to draw or point to the separation between X_train and X_test at the split line.',
      backendIntegrationNote: 'Scaler serialized at models/scaler.joblib.',
    },
  },
  {
    id: 4,
    slug: 'ga-lab',
    title: 'Genetic Algorithm Feature Selection',
    subtitle: 'Evolutionary 30-bit chromosome search optimizing cross-validated F1 fitness',
    category: 'Evolutionary Computing',
    keyPoints: [
      'Each chromosome is a 30-bit binary vector (1 = feature included, 0 = excluded).',
      'Population: 50 chromosomes evolved across 30 generations.',
      'Genetic operators: Tournament selection (size 3), Two-point crossover (rate 0.8), Bit-flip mutation (rate 0.05).',
      'Fitness function: Stratified 5-Fold Cross-Validation F1-score evaluated on training subset.',
    ],
    vivaChecklist: [
      'Explain why GA was chosen: exhaustive search of 2^30 = 1,073,741,824 feature combinations is intractable.',
      'Defend F1 fitness over accuracy: accuracy would reward selecting zero features or all non-fraud classifications.',
      'Explain how the best chromosome mask is preserved via elitism.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Show the 30-bit chromosome visualizer and evolutionary convergence curve. Explain how the population migrates from random distributions toward high-fitness feature combinations.',
      researchContribution: 'Formulation of an evolutionary optimization framework specifically tuned for fraud detection cost trade-offs.',
      vivaDefenseTips: 'If asked why GA instead of LASSO or PCA: GA is model-agnostic, non-linear, and directly optimizes non-differentiable objectives like F1-score.',
      backendIntegrationNote: 'GA mask saved to models/ga_feature_selection.joblib.',
    },
  },
  {
    id: 5,
    slug: 'models',
    title: 'Model Laboratory & 15-Experiment Matrix',
    subtitle: '5 diverse classifier families tested across Full, GA-Selected, and Random Feature baselines',
    category: 'Machine Learning',
    keyPoints: [
      '5 Classifiers: Random Forest (ensemble), Decision Tree (rule-based), Logistic Regression (linear), ANN/MLP (deep neural net), Gaussian Naive Bayes (probabilistic).',
      '3 Feature Strategies: Full Features (30), GA Features (evolved subset), Random Features (matched-size baseline control).',
      'Total: 15 distinct model configurations trained under identical data conditions.',
      'Random feature subset acts as an experimental control to prove GA gains are evolutionary, not random chance.',
    ],
    vivaChecklist: [
      'Explain why Random Features control is necessary in academic methodology.',
      'Describe hyperparameters used (e.g. 100 trees for RF, 64x32 MLP, L2 logistic regression).',
      'Show how 15 serialized .joblib files correspond to the 5x3 matrix.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Navigate the 5x3 experiment grid. Point out how classifier architectures span from simple linear models to complex neural networks and tree ensembles.',
      researchContribution: 'Comprehensive multi-model benchmarking under controlled, leak-free conditions.',
      vivaDefenseTips: 'Explain why Random Forest and ANN typically achieve higher recall on non-linear fraud manifolds compared to Naive Bayes.',
      backendIntegrationNote: '15 models persisted in models/trained/*.joblib.',
    },
  },
  {
    id: 6,
    slug: 'comparative-analysis',
    title: 'Comparative Analysis & Research Benchmark',
    subtitle: 'Empirical verification of GA feature reduction vs Full Features and Random Baselines',
    category: 'Empirical Analysis',
    keyPoints: [
      'Side-by-side comparison across Precision, Recall, F1-Score, ROC-AUC, and PR-AUC.',
      'Analysis of feature dimension reduction percentage and inference latency benefits.',
      'Evaluation of false positive reduction in practical banking operational workflows.',
      'Validation that GA features consistently outperform matched random feature baselines.',
    ],
    vivaChecklist: [
      'Demonstrate how GA features achieve comparable or higher F1 with >40% fewer input dimensions.',
      'Explain the trade-off between Recall (catching frauds) and Precision (customer friction).',
      'Clarify that test set evaluation is conducted on raw unbalanced test data.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Walk through the comparative bar charts and grouped metrics. Emphasize that GA feature selection reduces inference computational overhead without sacrificing fraud capture rate.',
      researchContribution: 'Proving that evolutionary feature pruning filters out uninformative noise in high-dimensional fraud streams.',
      vivaDefenseTips: 'Highlight PR-AUC (Precision-Recall Area) as the most sensitive metric for extreme class imbalance.',
      backendIntegrationNote: 'Comparison data structured for dynamic backend evaluation metrics ingestion.',
    },
  },
  {
    id: 7,
    slug: 'fraud-detection',
    title: 'Live Fraud Detection Inference Engine',
    subtitle: 'Real-time single transaction evaluation and high-throughput batch CSV scoring interface',
    category: 'Deployment & Inference',
    keyPoints: [
      'Single transaction entry: 30 continuous feature inputs grouped into Metadata and PCA components.',
      'Strict client-side validation rejecting non-numeric values; Target Class is strictly omitted from user input.',
      'Batch CSV detection with automated schema validation, missing column detection, and optional ground-truth evaluation.',
      'Clean API abstraction ready for Python FastAPI backend execution.',
    ],
    vivaChecklist: [
      'Demonstrate that Class column is excluded from prediction input payload.',
      'Show CSV drag-and-drop parser detecting schema adherence (Time, V1-V28, Amount).',
      'Explain how backend disconnected state is gracefully displayed without fake data.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Show the Single Transaction form and Batch CSV uploader. Demonstrate the intuitive UX designed for bank fraud analysts.',
      researchContribution: 'Bridging experimental research into a deployable, cyber-resilient operational interface.',
      vivaDefenseTips: 'Explain data privacy: no PII (card number, CVV, names) is accepted, only mathematical features.',
      backendIntegrationNote: 'Connected via src/api/fraudDetectionApi.ts.',
    },
  },
  {
    id: 8,
    slug: 'explainability',
    title: 'Interpretable AI & Model Explainability',
    subtitle: 'Local and global feature attribution ensuring transparent, auditable fraud decisions',
    category: 'Explainable AI (XAI)',
    keyPoints: [
      'Black-box ML models require transparent rationale for compliance and human-in-the-loop analyst review.',
      'Local feature attribution explains which specific features pushed an individual transaction towards fraud.',
      'Global feature importance highlights dominant PCA components (e.g., V14, V12, V10, V17) across the trained forest.',
      'Prepared architecture for TreeExplainer SHAP and LIME integration.',
    ],
    vivaChecklist: [
      'Explain why explainability is required by financial regulations (e.g., GDPR Right to Explanation).',
      'Distinguish between local attribution (single instance) and global importance (entire dataset).',
      'Point out how GA-selected features simplify explainability by removing confusing noise features.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Discuss the Explainability Engine panel. Explain how fraud investigators use feature contribution bars to understand why a transaction was flagged.',
      researchContribution: 'Integrating XAI principles into evolutionary fraud detection workflows.',
      vivaDefenseTips: 'Emphasize that reducing from 30 to 13-15 features makes SHAP computation significantly faster and more human-interpretable.',
      backendIntegrationNote: 'API abstraction ready at src/api/explainabilityApi.ts.',
    },
  },
  {
    id: 9,
    slug: 'results-export',
    title: 'Research Findings & Export Center',
    subtitle: 'Comprehensive metric aggregation, confusion matrices, and publication-ready report exports',
    category: 'Research Output',
    keyPoints: [
      'Consolidated experimental outputs across all 15 models with confusion matrix breakdowns.',
      'Multi-format export capabilities: CSV, Excel, JSON, PNG charts, and consolidated PDF reports.',
      'Full alignment with scientific benchmarking standards for academic publication.',
      'Direct comparison against published reference paper (Ileberi et al., 2022).',
    ],
    vivaChecklist: [
      'Show the Research Results tabs (GA, Classifiers, Evaluation, ROC, Confusion Matrices).',
      'Explain how the Export Center allows researchers to download raw experimental logs.',
      'Verify that all export actions wait for verified backend outputs rather than generating fake rows.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Showcase the Research Results and Export Center. Explain how this interface accelerates research dissemination and reproducible science.',
      researchContribution: 'Complete transparency, auditability, and exportability of research artifacts.',
      vivaDefenseTips: 'Note how our methodology uses strict zero-leakage SMOTE compared to paper benchmarks.',
      backendIntegrationNote: 'Export triggers handled via src/api/exportApi.ts.',
    },
  },
  {
    id: 10,
    slug: 'conclusion',
    title: 'Research Summary & Viva Conclusion',
    subtitle: 'Key contributions, methodological takeaways, and future research directions',
    category: 'Summary & Conclusion',
    keyPoints: [
      'Successfully demonstrated an end-to-end GA-optimized credit card fraud detection framework.',
      'Enforced zero data leakage with train-only scaling, train-only SMOTE, and isolated 20% holdout test partition.',
      'Validated 5 classifiers across Full, GA, and Random feature configurations (15 total experiments).',
      'Engineered a complete enterprise-grade React + TypeScript platform with modular Python backend abstraction.',
    ],
    vivaChecklist: [
      'Summarize the core answer: GA feature selection effectively reduces dimensionality while preserving fraud recall.',
      'Reiterate adherence to ethical and reproducible ML standards without fabricated metrics.',
      'State future extensions: online streaming GA adaptation, graph neural networks for transaction networks, and real-time Kafka integration.',
    ],
    defaultSpeakerNotes: {
      whatToExplain: 'Conclude the presentation by summarizing the research journey from raw data to evolutionary optimization, model benchmarking, live detection, and explainability.',
      researchContribution: 'A rigorously validated, leak-free, GA-optimized fraud detection system with publication-grade interface.',
      vivaDefenseTips: 'Thank the committee and open the floor for questions with confidence.',
      backendIntegrationNote: 'All frontend components are fully architected and ready for live demonstration.',
    },
  },
];

export const DEMO_CHECKLIST_ITEMS: DemoChecklistItem[] = [
  { id: 'chk-1', label: 'Platform Dashboard Shell', stage: 'UI Framework', isReady: true, statusText: '100% Operational' },
  { id: 'chk-2', label: 'Dataset Intelligence (284,807 Rows)', stage: 'Data Exploration', isReady: true, statusText: 'Validated Schema' },
  { id: 'chk-3', label: 'Zero-Leakage Preprocessing & Split', stage: 'Pipeline Rigor', isReady: true, statusText: 'Verified Isolated' },
  { id: 'chk-4', label: 'GA Feature Selection Laboratory', stage: 'Evolutionary ML', isReady: true, statusText: '30-Bit Chromosomes' },
  { id: 'chk-5', label: '15-Model Experiment Matrix', stage: 'Model Lab', isReady: true, statusText: '5 Classifiers × 3 Sets' },
  { id: 'chk-6', label: 'Single & Batch Fraud Detection', stage: 'Inference Engine', isReady: true, statusText: 'Frontend Ready' },
  { id: 'chk-7', label: 'Interpretable AI & SHAP Panel', stage: 'Explainability', isReady: true, statusText: 'Structured & Decoupled' },
  { id: 'chk-8', label: 'Research Results & Paper Benchmark', stage: 'Scientific Output', isReady: true, statusText: 'Aligned with Ileberi 2022' },
  { id: 'chk-9', label: 'Export Center & Report Builder', stage: 'Data Export', isReady: true, statusText: 'Multi-Format UI' },
  { id: 'chk-10', label: 'Presentation Mode & Speaker Notes', stage: 'Viva Mode', isReady: true, statusText: 'Interactive 10-Step Guide' },
];

export async function getPresentationSteps(): Promise<PresentationStep[]> {
  return PRESENTATION_STEPS;
}

export async function getDemoChecklist(): Promise<DemoChecklistItem[]> {
  return DEMO_CHECKLIST_ITEMS;
}
