import React, { useState } from 'react';
import {
  Shield,
  Info,
  Database,
  Layers,
  Dna,
  FlaskConical,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  Cpu,
  Code2,
  Zap,
  BrainCircuit,
  CheckCircle2,
} from 'lucide-react';
import { PageId } from '../types';
import { ResearchCallout } from '../components/common/ResearchCallout';

interface AboutProjectPageProps {
  onNavigate: (page: PageId) => void;
}

const PROBLEM_SECTIONS = [
  {
    id: 'problem',
    icon: <Shield className="w-5 h-5" />,
    title: 'Problem Statement',
    color: 'text-rose-400',
    bg: 'bg-rose-950/20',
    border: 'border-rose-500/20',
    content: 'Credit card fraud causes billions in annual losses globally. The extreme class imbalance (0.172% fraud events) in transactional data makes traditional detection approaches unreliable — a naive classifier that always predicts "legitimate" achieves 99.828% accuracy while detecting zero frauds. The challenge is developing a high-Recall, high-Precision detection system that generalizes to real-world imbalanced test conditions.',
  },
  {
    id: 'dataset',
    icon: <Database className="w-5 h-5" />,
    title: 'Dataset',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-500/20',
    content: 'The European Credit Card Fraud Dataset contains 284,807 real transactions: 284,315 legitimate and 492 fraudulent (0.172%). Features V1–V28 are PCA-anonymized components. Time represents seconds elapsed from the first transaction. Amount is the monetary value. The target Class variable (0 = Legitimate, 1 = Fraud) is never used as a model input.',
  },
  {
    id: 'ga',
    icon: <Dna className="w-5 h-5" />,
    title: 'Genetic Algorithm Feature Selection',
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/20',
    border: 'border-indigo-500/20',
    content: 'A Genetic Algorithm (GA) evolves a population of 30-bit binary chromosomes representing feature inclusion masks. Each chromosome is evaluated via 5-Fold Cross-Validation F1-Score on the training subset. Operators include tournament selection, two-point crossover (0.8 rate) and bit-flip mutation (0.05 rate). The fittest chromosome discovered after 30 generations defines the final GA feature set.',
  },
  {
    id: 'classifiers',
    icon: <FlaskConical className="w-5 h-5" />,
    title: 'Five Classifiers',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/20',
    content: 'Five complementary classification architectures are evaluated: Random Forest (100 estimators, bootstrap bagging), Decision Tree (CART, Gini impurity), Logistic Regression (L2 regularization), Artificial Neural Network (MLP: 64×32 hidden units, ReLU), and Gaussian Naive Bayes (independent Gaussian likelihood per class). Each is trained across Full (30), GA-selected, and Random baseline feature subsets.',
  },
  {
    id: 'smote',
    icon: <Layers className="w-5 h-5" />,
    title: 'SMOTE Balancing',
    color: 'text-amber-400',
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/20',
    content: 'Synthetic Minority Over-sampling Technique (SMOTE) synthesizes new fraudulent training instances along k-nearest neighbor interpolation paths in feature space. Critically, SMOTE is applied exclusively to the 80% training partition after the stratified split — never to the test partition — preserving the natural 0.172% fraud rate in evaluation data.',
  },
  {
    id: 'metrics',
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Evaluation Metrics',
    color: 'text-purple-400',
    bg: 'bg-purple-950/20',
    border: 'border-purple-500/20',
    content: 'Primary evaluation uses F1-Score (harmonic mean of Precision and Recall) as the dominant metric for imbalanced classification. Supporting metrics include: Precision (reduces false alerts), Recall (detects actual frauds), Accuracy (overall correctness), ROC-AUC (discriminative power across thresholds), and PR-AUC (particularly sensitive to minority class performance).',
  },
];

const PIPELINE_FLOW = [
  { label: 'Raw Dataset', sub: '284,807 Transactions', color: 'bg-slate-800 border-slate-700' },
  { label: 'Cleaning', sub: 'Deduplication & Validation', color: 'bg-slate-800 border-slate-700' },
  { label: 'Split', sub: '80% Train / 20% Test', color: 'bg-cyan-950/40 border-cyan-500/30' },
  { label: 'Scaling', sub: 'MinMax on Train Only', color: 'bg-cyan-950/40 border-cyan-500/30' },
  { label: 'GA Selection', sub: '30-Bit Chromosome Evolution', color: 'bg-indigo-950/40 border-indigo-500/30' },
  { label: 'SMOTE', sub: 'Train Partition Only', color: 'bg-amber-950/30 border-amber-500/30' },
  { label: 'Training', sub: '15 Model Configurations', color: 'bg-emerald-950/30 border-emerald-500/30' },
  { label: 'Evaluation', sub: 'Untouched Test Set', color: 'bg-emerald-950/30 border-emerald-500/30' },
  { label: 'Detection', sub: 'Real-Time Inference', color: 'bg-cyan-950/40 border-cyan-500/30' },
];

const TECH_STACK = [
  { name: 'React 19', type: 'Frontend Framework', icon: <Code2 className="w-4 h-4 text-cyan-400" />, badge: 'UI' },
  { name: 'TypeScript', type: 'Type-Safe Language', icon: <Code2 className="w-4 h-4 text-blue-400" />, badge: 'Language' },
  { name: 'Tailwind CSS', type: 'Utility-First Styling', icon: <Code2 className="w-4 h-4 text-cyan-300" />, badge: 'Design' },
  { name: 'Recharts', type: 'D3-based Charting', icon: <BarChart3 className="w-4 h-4 text-indigo-400" />, badge: 'Charts' },
  { name: 'Vite 8', type: 'Build Toolchain', icon: <Zap className="w-4 h-4 text-amber-400" />, badge: 'Build' },
  { name: 'Python 3.x', type: 'ML Backend Language', icon: <Code2 className="w-4 h-4 text-emerald-400" />, badge: 'Backend' },
  { name: 'Scikit-learn', type: 'ML Library', icon: <BrainCircuit className="w-4 h-4 text-emerald-400" />, badge: 'ML' },
  { name: 'SMOTE (imbalanced-learn)', type: 'Class Balancing', icon: <Layers className="w-4 h-4 text-amber-400" />, badge: 'ML' },
  { name: 'Joblib', type: 'Artifact Serialization', icon: <Cpu className="w-4 h-4 text-slate-400" />, badge: 'Storage' },
  { name: 'Genetic Algorithm (custom)', type: 'Feature Optimization', icon: <Dna className="w-4 h-4 text-indigo-400" />, badge: 'Core GA' },
  { name: 'Lucide Icons', type: 'Icon System', icon: <Shield className="w-4 h-4 text-cyan-400" />, badge: 'Design' },
  { name: 'FastAPI (planned)', type: 'REST API Framework', icon: <Zap className="w-4 h-4 text-cyan-300" />, badge: 'API' },
];

const MODEL_ARTIFACTS = [
  { name: 'scaler.joblib', description: 'MinMaxScaler fitted on X_train (80% partition)', status: 'Ready' },
  { name: 'ga_feature_selection.joblib', description: 'Evolved binary feature mask from GA optimization', status: 'Ready' },
  { name: 'random_feature_selection.joblib', description: 'Matched-size random feature baseline mask', status: 'Ready' },
  { name: 'rf_full.joblib / rf_ga.joblib / rf_random.joblib', description: 'Random Forest trained models (3 feature configurations)', status: 'Ready' },
  { name: 'dt_full.joblib / dt_ga.joblib / dt_random.joblib', description: 'Decision Tree trained models (3 feature configurations)', status: 'Ready' },
  { name: 'lr_full.joblib / lr_ga.joblib / lr_random.joblib', description: 'Logistic Regression trained models', status: 'Ready' },
  { name: 'ann_full.joblib / ann_ga.joblib / ann_random.joblib', description: 'ANN/MLP trained models', status: 'Ready' },
  { name: 'nb_full.joblib / nb_ga.joblib / nb_random.joblib', description: 'Gaussian Naive Bayes trained models', status: 'Ready' },
];

export const AboutProjectPage: React.FC<AboutProjectPageProps> = ({ onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('problem');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.15)] shrink-0">
            <Shield className="w-7 h-7 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                RESEARCH PLATFORM
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Academic ML Study
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              About <span className="text-cyan-400">CREDITGUARD</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              Machine Learning based Credit Card Fraud Detection using Genetic Algorithm Feature Selection — an end-to-end academic research implementation from raw dataset to deployable inference engine.
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview Sections */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Project Overview</h3>
        </div>

        {PROBLEM_SECTIONS.map((section) => {
          const isExpanded = expandedSection === section.id;
          return (
            <div key={section.id} className={`rounded-xl border overflow-hidden transition-all ${section.bg} ${section.border}`}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-900/60 ${section.color}`}>
                    {section.icon}
                  </div>
                  <span className="text-sm font-bold text-white">{section.title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 border-t border-white/5 pt-4 animate-in fade-in duration-200">
                  <p className="text-sm text-slate-300 leading-relaxed">{section.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Pipeline Infographic */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Research Pipeline Architecture</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 ml-auto">
            9-Stage Workflow
          </span>
        </div>

        <div className="flex flex-col items-center max-w-lg mx-auto">
          {PIPELINE_FLOW.map((step, idx) => (
            <div key={idx} className="w-full flex flex-col items-center">
              <div className={`w-full p-3 rounded-xl border text-center transition-all ${step.color}`}>
                <div className="text-xs font-bold text-white">{step.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{step.sub}</div>
              </div>
              {idx < PIPELINE_FLOW.length - 1 && (
                <ArrowDown className="w-4 h-4 text-cyan-400/60 my-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Technology Stack</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TECH_STACK.map((tech) => (
            <div key={tech.name} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 hover:bg-slate-900/80 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                {tech.icon}
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {tech.badge}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">{tech.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{tech.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Artifacts Panel */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Model Artifact Registry</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 ml-auto">
            18 Files · models/ directory
          </span>
        </div>

        <div className="space-y-2">
          {MODEL_ARTIFACTS.map((artifact) => (
            <div key={artifact.name} className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <code className="text-[11px] font-mono text-cyan-400 block truncate">{artifact.name}</code>
                  <p className="text-[11px] text-slate-400 mt-0.5">{artifact.description}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 shrink-0">{artifact.status}</span>
            </div>
          ))}
        </div>
      </div>

      <ResearchCallout
        variant="implementation-note"
        title="Implementation Notice"
        badgeText="Frontend-Only Stage"
      >
        CREDITGUARD is currently deployed as a complete, fully-functional React TypeScript frontend. The Python ML backend with trained .joblib artifacts is ready for API integration. The next step is creating a lightweight FastAPI server that exposes the serialized models via REST endpoints, enabling live inference, real SHAP explanations, and verified evaluation metric exports.
      </ResearchCallout>
    </div>
  );
};
