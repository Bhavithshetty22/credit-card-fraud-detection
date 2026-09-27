import React, { useState, useMemo } from 'react';
import {
  Scale,
  Cpu,
  Layers,
  Sliders,
  BarChart3,
  ShieldCheck,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Terminal,
  FileCode,
  LineChart as LineChartIcon,
  HelpCircle,
  Clock,
  ArrowRight,
  Database,
  Dna,
  GitBranch,
  BookOpen,
  Sparkles,
  AlertCircle,
  Trees,
  GitFork,
  TrendingUp,
  BrainCircuit,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  mockExperimentComparisons,
  mockFeatureSetComparisons,
  mockReferencePaperResults,
} from '../api/comparisonApi';
import { mockClassifierProfiles } from '../api/modelApi';
import {
  ComparisonMetric,
  ExperimentComparison,
  ReferencePaperResultRow,
} from '../types/comparison';
import { ClassifierName, FeatureSetType } from '../types/models';
import { PageId } from '../types';

interface ComparativeAnalysisProps {
  onNavigate?: (page: PageId) => void;
}

const classifierIcons: Record<string, React.ReactNode> = {
  Trees: <Trees className="w-4 h-4 text-emerald-400" />,
  GitFork: <GitFork className="w-4 h-4 text-cyan-400" />,
  TrendingUp: <TrendingUp className="w-4 h-4 text-blue-400" />,
  BrainCircuit: <BrainCircuit className="w-4 h-4 text-indigo-400" />,
  Compass: <Compass className="w-4 h-4 text-amber-400" />,
};

export const ComparativeAnalysisPage: React.FC<ComparativeAnalysisProps> = ({ onNavigate }) => {
  const [selectedMetric, setSelectedMetric] = useState<ComparisonMetric>('F1 Score');
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentComparison | null>(null);
  const [cmClassifier, setCmClassifier] = useState<ClassifierName>('Random Forest');
  const [cmFeatureSet, setCmFeatureSet] = useState<FeatureSetType>('GA Features');
  const [isPaperResultsOpen, setIsPaperResultsOpen] = useState<boolean>(false);

  // Recharts grouped bar chart mock structure
  const groupedChartData = useMemo(() => {
    return [
      { classifier: 'RF', fullName: 'Random Forest', full: 0, ga: 0, random: 0 },
      { classifier: 'DT', fullName: 'Decision Tree', full: 0, ga: 0, random: 0 },
      { classifier: 'LR', fullName: 'Logistic Regression', full: 0, ga: 0, random: 0 },
      { classifier: 'ANN', fullName: 'ANN / MLP', full: 0, ga: 0, random: 0 },
      { classifier: 'NB', fullName: 'GaussianNB', full: 0, ga: 0, random: 0 },
    ];
  }, []);

  const openDrawerForCell = (classifier: ClassifierName, featureSet: FeatureSetType) => {
    const found = mockExperimentComparisons.find(
      (e) => e.classifier === classifier && e.featureSet === featureSet
    );
    if (found) {
      setSelectedExperiment(found);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. RESEARCH FLOW PRESENTATION INDICATOR */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-3 min-w-[650px] font-mono text-xs">
          <span className="text-slate-400">01. Dataset</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">02. Preprocessing</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">03. GA Selection</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">04. Model Experiments</span>
          <span className="text-slate-600">→</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold shadow-[0_0_12px_rgba(0,242,254,0.2)]">
            05. Comparative Analysis
          </span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">06. Fraud Detection</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest hidden md:inline shrink-0 pl-4">
          Core Research Matrix
        </span>
      </div>

      {/* 2. PAGE HEADER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                RESEARCH EXPERIMENT WORKSPACE
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                15 Experiments
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Comparative Analysis
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Evaluate the effect of GA-based feature selection across multiple classifiers and feature strategies.
            </p>
            <p className="text-xs font-mono text-cyan-300/80 mt-2">
              5 classifiers × 3 feature sets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Full vs GA vs Random Matrix</span>
            </div>
          </div>
        </div>

        {/* 3 Compact Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Classifiers</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">5</div>
            <span className="text-xs text-slate-400 font-sans mt-0.5 block">RF · DT · LR · ANN · NB</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Feature Strategies</span>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-0.5">3</div>
            <span className="text-xs text-slate-400 font-sans mt-0.5 block">Full · GA · Random</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Experiments</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">15</div>
            <span className="text-xs text-slate-400 font-sans mt-0.5 block">Model × feature-set combinations</span>
          </div>
        </div>
      </div>

      {/* 3. EXPERIMENT DESIGN VISUAL */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="RESEARCH METHODOLOGY DESIGN"
          title="Experiment Design"
          subtitle="Hierarchical breakdown showing the multi-branch evaluation of feature selection techniques across classifier architectures."
        />

        <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
          <div className="text-center font-mono text-xs max-w-sm mx-auto">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white font-bold">
              DATASET (creditcard.csv)
            </div>
            <div className="text-cyan-400 my-1">↓</div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
              PREPROCESSING (Cleaning & Train-Only Scaling)
            </div>
            <div className="text-cyan-400 my-1">↓</div>
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
              FEATURE STRATEGY (3 Paradigms)
            </div>
          </div>

          {/* 3 Branches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/25 text-center">
              <span className="text-blue-300 font-bold">├── Full Features</span>
              <p className="text-[10px] text-slate-400 mt-1">30 Input dimensions</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-center">
              <span className="text-cyan-200 font-bold">├── GA Features</span>
              <p className="text-[10px] text-cyan-300/80 mt-1">Optimal evolutionary subset</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/25 text-center">
              <span className="text-indigo-300 font-bold">└── Random Features</span>
              <p className="text-[10px] text-slate-400 mt-1">Equal-size baseline control</p>
            </div>
          </div>

          <div className="text-center font-mono text-xs text-cyan-400">↓</div>

          {/* 5 Classifier Families */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 text-center font-mono text-xs">
            <span className="text-[10px] uppercase text-slate-400 block mb-2 font-bold">
              5 Classifier Families
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['Random Forest', 'Decision Tree', 'Logistic Regression', 'ANN / MLP', 'GaussianNB'].map((clf) => (
                <span key={clf} className="px-3 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-200">
                  {clf}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center font-mono text-xs text-cyan-400">↓</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs text-center max-w-lg mx-auto">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/25 text-rose-300">
              HELD-OUT TEST SET (20% Pure)
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/25 text-emerald-300 font-bold">
              EVALUATION METRICS (F1, AUC, PR-AUC)
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2.5 text-xs text-slate-400 font-mono">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>All three feature strategies are evaluated against the same classifier families and held-out test data.</span>
        </div>
      </div>

      {/* 4. FEATURE-SET COMPARISON CARDS */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="STRATEGY DEFINITIONS"
          title="Feature Strategy Comparison"
          subtitle="Theoretical attributes of the three dimensional configurations evaluated in our research pipeline."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          {/* Card 1: Full Features */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-blue-500/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Strategy 01</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">Baseline</span>
              </div>
              <h4 className="text-xl font-bold text-white font-sans">Full Features</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                All available input features are retained.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Dimensionality</span>
                <span className="text-lg font-bold text-blue-300 font-mono">30 input features</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-4 pt-3 border-t border-white/5">
              Includes Time, V1–V28 PCA components, and Amount.
            </p>
          </div>

          {/* Card 2: GA Features */}
          <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 flex flex-col justify-between shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Strategy 02 • Core GA</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">Research Core</span>
              </div>
              <h4 className="text-xl font-bold text-white font-sans">GA Features</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Features selected using the Genetic Algorithm feature-selection pipeline.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-cyan-500/25">
                <span className="text-[10px] font-mono text-cyan-400 block uppercase">Dimensionality</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">Pending backend</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-cyan-300/80 mt-4 pt-3 border-t border-cyan-500/20">
              Optimal evolutionary subset derived from ga_feature_selection.joblib.
            </p>
          </div>

          {/* Card 3: Random Features */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Strategy 03</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Control Group</span>
              </div>
              <h4 className="text-xl font-bold text-white font-sans">Random Features</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                A randomly selected feature subset matched to the GA feature count.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Dimensionality</span>
                <span className="text-lg font-bold text-indigo-300 font-mono">Matched to GA subset</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-4 pt-3 border-t border-white/5">
              Random subset size is designed to match the GA-selected feature count for controlled comparison.
            </p>
          </div>
        </div>
      </div>

      {/* 5. MAIN COMPARISON MATRIX (15-EXPERIMENT INTERACTIVE MATRIX) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="INTERACTIVE MATRIX"
          title="15-Experiment Comparison Matrix"
          subtitle="Click any model configuration cell to inspect architectural metadata, artifact filenames, and metric placeholders."
          action={
            <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-white/5">
              15 Serialized Models
            </span>
          }
        />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-bold">Model</th>
                <th className="py-3 px-4 text-center">Full Features</th>
                <th className="py-3 px-4 text-center text-cyan-300 bg-cyan-950/20 border-x border-cyan-500/20">
                  GA Features
                </th>
                <th className="py-3 px-4 text-center">Random Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockClassifierProfiles.map((clf) => (
                <tr key={clf.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                    {classifierIcons[clf.iconName]}
                    <span>{clf.name}</span>
                  </td>

                  {/* Cell: Full Features */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openDrawerForCell(clf.name, 'Full Features')}
                      title="Open experiment"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800 text-[11px] transition-all group"
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors" />
                      <span className="text-slate-300 group-hover:text-cyan-300">Awaiting results</span>
                    </button>
                  </td>

                  {/* Cell: GA Features */}
                  <td className="py-4 px-4 text-center bg-cyan-950/20 border-x border-cyan-500/20">
                    <button
                      onClick={() => openDrawerForCell(clf.name, 'GA Features')}
                      title="Open experiment"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-400/40 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,242,254,0.2)] text-[11px] transition-all group"
                    >
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-cyan-200 font-bold group-hover:text-white">Awaiting results</span>
                    </button>
                  </td>

                  {/* Cell: Random Features */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openDrawerForCell(clf.name, 'Random Features')}
                      title="Open experiment"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800 text-[11px] transition-all group"
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors" />
                      <span className="text-slate-300 group-hover:text-cyan-300">Awaiting results</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6 & 7. METRIC SELECTOR & RECHARTS COMPARISON CHART */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              DYNAMIC METRIC BENCHMARK
            </span>
            <h3 className="text-xl font-bold text-white font-sans mt-0.5">
              {selectedMetric} by Classifier and Feature Strategy
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
            <span className="text-[11px] text-slate-500 px-2">Compare Metric:</span>
            {(['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC', 'PR-AUC'] as ComparisonMetric[]).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  selectedMetric === m
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Bar Chart Area with Polished Empty State */}
        <div className="h-80 w-full relative mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedChartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="fullName" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Bar dataKey="full" name="Full Features" fill="#4FACFE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ga" name="GA Features" fill="#00F2FE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="random" name="Random Features" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Polished Empty State Overlay */}
          <div className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none rounded-xl border border-white/5">
            <BarChart3 className="w-8 h-8 text-cyan-400 animate-pulse mb-2" />
            <p className="text-sm font-bold font-mono text-white">
              No experiment results available
            </p>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-sm text-center">
              Connect the evaluation backend to populate this comparison.
            </p>
          </div>
        </div>
      </div>

      {/* 8. MULTI-METRIC OVERVIEW */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="METRIC TAXONOMY"
          title="Evaluation Metrics"
          subtitle="Key performance indicators used to rigorously evaluate fraud detection under severe class imbalance."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Accuracy', desc: 'Proportion of correctly classified transactions.' },
            { name: 'Precision', desc: 'Proportion of predicted fraud cases that are actually fraudulent.' },
            { name: 'Recall', desc: 'Proportion of actual fraud cases detected by the model.' },
            { name: 'F1 Score', desc: 'Harmonic mean of precision and recall.' },
            { name: 'ROC-AUC', desc: 'Area under the receiver operating characteristic curve.' },
            { name: 'PR-AUC', desc: 'Area under the precision-recall curve.' },
          ].map((item) => (
            <div key={item.name} className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300">{item.name}</span>
                <span className="text-sm font-bold font-mono text-white">—</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. CONFUSION MATRIX ANALYSIS */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              Confusion Matrix Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspect discrimination matrices on the held-out test partition.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-white/10 text-xs font-mono">
            <select
              value={cmClassifier}
              onChange={(e) => setCmClassifier(e.target.value as ClassifierName)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white focus:outline-none"
            >
              <option value="Random Forest">Random Forest</option>
              <option value="Decision Tree">Decision Tree</option>
              <option value="Logistic Regression">Logistic Regression</option>
              <option value="Artificial Neural Network">ANN / MLP</option>
              <option value="Naive Bayes">Gaussian Naive Bayes</option>
            </select>

            <select
              value={cmFeatureSet}
              onChange={(e) => setCmFeatureSet(e.target.value as FeatureSetType)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-cyan-300 font-bold focus:outline-none"
            >
              <option value="Full Features">Full Features</option>
              <option value="GA Features">GA Features</option>
              <option value="Random Features">Random Features</option>
            </select>
          </div>
        </div>

        {/* 2 × 2 Matrix */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 max-w-2xl mx-auto">
          <div className="text-center font-mono text-xs text-slate-400 uppercase mb-3 font-semibold">
            PREDICTED CLASS
          </div>

          <div className="grid grid-cols-12 gap-2 text-center font-mono text-xs">
            <div className="col-span-4 flex items-center justify-center font-bold text-slate-400 uppercase">
              ACTUAL CLASS
            </div>
            <div className="col-span-4 p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300 font-semibold">
              Predicted Legitimate
            </div>
            <div className="col-span-4 p-2 rounded-lg bg-slate-900 border border-white/5 text-rose-300 font-semibold">
              Predicted Fraud
            </div>

            {/* Actual Legitimate Row */}
            <div className="col-span-4 p-3 flex items-center justify-center bg-slate-900/60 rounded-lg text-slate-300 font-semibold">
              Actual Legitimate
            </div>
            <div className="col-span-4 p-4 rounded-xl bg-slate-900/80 border border-emerald-500/25 flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-400 uppercase">TN</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5">—</span>
            </div>
            <div className="col-span-4 p-4 rounded-xl bg-slate-900/80 border border-amber-500/25 flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-400 uppercase">FP</span>
              <span className="text-xl font-bold text-amber-400 mt-0.5">—</span>
            </div>

            {/* Actual Fraud Row */}
            <div className="col-span-4 p-3 flex items-center justify-center bg-rose-950/30 border border-rose-500/20 rounded-lg text-rose-300 font-semibold">
              Actual Fraud
            </div>
            <div className="col-span-4 p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-400 uppercase">FN</span>
              <span className="text-xl font-bold text-rose-400 mt-0.5">—</span>
            </div>
            <div className="col-span-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-400 uppercase">TP</span>
              <span className="text-xl font-bold text-cyan-300 mt-0.5">—</span>
            </div>
          </div>

          <p className="text-[11px] font-mono text-slate-500 text-center mt-4">
            Awaiting confusion-matrix data
          </p>
        </div>

        {/* Matrix Definitions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/5 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <strong className="text-cyan-300 block mb-0.5">True Positive (TP)</strong>
            <span>Fraud correctly identified as fraud.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <strong className="text-emerald-400 block mb-0.5">True Negative (TN)</strong>
            <span>Legitimate transaction correctly identified as legitimate.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <strong className="text-amber-400 block mb-0.5">False Positive (FP)</strong>
            <span>Legitimate transaction incorrectly flagged as fraud.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <strong className="text-rose-400 block mb-0.5">False Negative (FN)</strong>
            <span>Fraudulent transaction incorrectly classified as legitimate.</span>
          </div>
        </div>
      </div>

      {/* 10 & 11. ROC CURVE & PRECISION-RECALL CURVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve Analysis */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans">
                ROC Curve Analysis
              </h3>
              <span className="text-[10px] font-mono text-slate-400">TPR vs FPR</span>
            </div>

            <div className="h-64 relative bg-slate-950 rounded-xl border border-white/5 flex flex-col items-center justify-center p-4">
              <LineChartIcon className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-mono text-slate-400 text-center">
                ROC curve unavailable
              </p>
              <span className="text-[10px] font-mono text-slate-600 mt-1">
                Evaluation backend results are required.
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Diagonal: Random Classifier</span>
            <span>AUC: —</span>
          </div>
        </div>

        {/* Precision-Recall Curve */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans">
                Precision-Recall Curve
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Precision vs Recall</span>
            </div>

            <div className="h-64 relative bg-slate-950 rounded-xl border border-white/5 flex flex-col items-center justify-center p-4">
              <LineChartIcon className="w-8 h-8 text-cyan-600/60 mb-2" />
              <p className="text-xs font-mono text-slate-400 text-center">
                Precision-Recall curve unavailable
              </p>
              <span className="text-[10px] font-mono text-slate-600 mt-1">
                Evaluation backend results are required.
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
            Precision-recall analysis is particularly informative for highly imbalanced fraud-detection datasets.
          </div>
        </div>
      </div>

      {/* 12. GA IMPACT VIEW */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="FEATURE-SELECTION PARADIGM"
          title="GA Feature Selection Impact"
          subtitle="How does feature selection affect the resulting fraud-detection experiments?"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
            <span className="text-blue-300 font-bold uppercase block text-xs">Full Features</span>
            <div className="flex justify-between text-slate-300"><span>Feature Count:</span><strong className="text-white">30</strong></div>
            <div className="flex justify-between text-slate-300"><span>Selection Method:</span><span>None</span></div>
            <div className="flex justify-between text-slate-300"><span>Training Data:</span><span>SMOTE (80%)</span></div>
            <div className="flex justify-between text-slate-300"><span>Evaluation:</span><span>Test Set (20%)</span></div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/30 space-y-2">
            <span className="text-cyan-200 font-bold uppercase block text-xs">GA Features</span>
            <div className="flex justify-between text-slate-300"><span>Feature Count:</span><strong className="text-cyan-300">Backend-derived</strong></div>
            <div className="flex justify-between text-slate-300"><span>Selection Method:</span><span>Genetic Algorithm</span></div>
            <div className="flex justify-between text-slate-300"><span>Training Data:</span><span>SMOTE (80%)</span></div>
            <div className="flex justify-between text-slate-300"><span>Evaluation:</span><span>Test Set (20%)</span></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
            <span className="text-indigo-300 font-bold uppercase block text-xs">Random Features</span>
            <div className="flex justify-between text-slate-300"><span>Feature Count:</span><strong className="text-indigo-300">Matched to GA</strong></div>
            <div className="flex justify-between text-slate-300"><span>Selection Method:</span><span>Random subset</span></div>
            <div className="flex justify-between text-slate-300"><span>Training Data:</span><span>SMOTE (80%)</span></div>
            <div className="flex justify-between text-slate-300"><span>Evaluation:</span><span>Test Set (20%)</span></div>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400 mt-4 border-t border-white/5 pt-3 text-center">
          Performance impact is determined from experiment results.
        </p>
      </div>

      {/* 13. RESEARCH QUESTION PANEL */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="SCIENTIFIC OBJECTIVES"
          title="Research Questions"
          subtitle="Core investigative inquiries driving the 15-model comparative experimentation."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="text-xs font-mono font-bold text-cyan-300">Question 01</span>
            <h4 className="text-sm font-semibold text-white font-sans">
              Does GA reduce the number of input features?
            </h4>
            <p className="text-xs text-slate-400 font-mono pt-1">
              Answer state: Evaluated from the persisted GA feature mask.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="text-xs font-mono font-bold text-cyan-300">Question 02</span>
            <h4 className="text-sm font-semibold text-white font-sans">
              How does GA-selected feature selection compare with using all features?
            </h4>
            <p className="text-xs text-slate-400 font-mono pt-1">
              Answer state: Evaluated across five classifier families.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="text-xs font-mono font-bold text-cyan-300">Question 03</span>
            <h4 className="text-sm font-semibold text-white font-sans">
              Does GA selection behave differently from a random subset of equal size?
            </h4>
            <p className="text-xs text-slate-400 font-mono pt-1">
              Answer state: Evaluated through the GA vs Random comparison.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="text-xs font-mono font-bold text-cyan-300">Question 04</span>
            <h4 className="text-sm font-semibold text-white font-sans">
              How do classifier choice and feature strategy interact?
            </h4>
            <p className="text-xs text-slate-400 font-mono pt-1">
              Answer state: Evaluated through the 15-model experiment matrix.
            </p>
          </div>
        </div>
      </div>

      {/* 14. DATA INTEGRITY / EXPERIMENTAL CONTROLS */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="ZERO-LEAKAGE CONTROLS"
          title="Experimental Controls"
          subtitle="Strict statistical isolation protocols enforced to guarantee fair and unbiased benchmark comparisons."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Stratified Split</span>
            <strong className="text-xs font-sans text-white mt-1 block">80/20 train-test split</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Scaling</span>
            <strong className="text-xs font-sans text-white mt-1 block">Scaler fitted on training data only</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Class Balancing</span>
            <strong className="text-xs font-sans text-white mt-1 block">SMOTE applied to training data</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Evaluation</span>
            <strong className="text-xs font-sans text-white mt-1 block">Held-out test data</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-cyan-400 uppercase block">Random Baseline</span>
            <strong className="text-xs font-sans text-cyan-200 mt-1 block">Matched to GA feature count</strong>
          </div>
        </div>
      </div>

      {/* 15. PAPER VS OUR EXPERIMENT NOTICE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="mb-4">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            METHODOLOGY COMPARISON
          </span>
          <h3 className="text-xl font-bold text-white font-sans mt-1">
            Reference Paper vs Our Experiment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
              Reference Paper
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>• GA-based feature selection</li>
              <li>• RF used as GA fitness model</li>
              <li>• Five reported GA feature vectors</li>
              <li>• Paper evaluates DT, RF, ANN, NB and LR</li>
              <li>• Paper reports Accuracy, Recall, Precision, F1 and AUC</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase block">
              Our Experiment
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li>• GA-based feature selection</li>
              <li>• RF used for lightweight GA fitness evaluation</li>
              <li>• One persisted GA-selected feature mask</li>
              <li>• Full vs GA vs Random feature-set comparison</li>
              <li>• Five classifier families</li>
              <li>• F1 used as GA fitness in the current implementation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 16. REFERENCE PAPER RESULTS SECTION (COLLAPSIBLE) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-amber-500/20 bg-amber-950/10">
        <button
          onClick={() => setIsPaperResultsOpen(!isPaperResultsOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Published Reference Results
              </span>
              <h3 className="text-lg font-bold text-white font-sans">
                Reference Paper Results (Literature Benchmark)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Source: Ileberi, Sun & Wang, Journal of Big Data (2022), "A machine learning based credit card fraud detection using the GA algorithm for feature selection."
            </p>
          </div>

          {isPaperResultsOpen ? (
            <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-amber-400 shrink-0" />
          )}
        </button>

        {isPaperResultsOpen && (
          <div className="mt-6 pt-4 border-t border-amber-500/20 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-amber-500/20 text-[11px] uppercase tracking-wider text-amber-300">
                  <th className="py-2.5 px-3">Vector</th>
                  <th className="py-2.5 px-3">Features</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Recall</th>
                  <th className="py-2.5 px-3">Precision</th>
                  <th className="py-2.5 px-3">F1</th>
                  <th className="py-2.5 px-3">AUC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {mockReferencePaperResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-amber-950/20">
                    <td className="py-2 px-3 font-bold text-amber-400">{r.featureVector}</td>
                    <td className="py-2 px-3">{r.featureCount}</td>
                    <td className="py-2 px-3 font-sans text-white">{r.model}</td>
                    <td className="py-2 px-3">{r.accuracy}</td>
                    <td className="py-2 px-3">{r.recall}</td>
                    <td className="py-2 px-3">{r.precision}</td>
                    <td className="py-2 px-3 text-cyan-300 font-bold">{r.f1}</td>
                    <td className="py-2 px-3">{r.auc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EXPERIMENT DETAIL DRAWER */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedExperiment(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-[#0B1222] border-l border-white/15 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-white/10 pb-5">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      Experiment Details
                    </span>
                    <h2 className="text-2xl font-bold text-white font-sans mt-1">
                      {selectedExperiment.classifier}
                    </h2>
                    <p className="text-sm font-mono text-cyan-300 mt-0.5">
                      {selectedExperiment.featureSet}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedExperiment(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Classifier</span>
                    <span className="font-bold text-white mt-1 block">{selectedExperiment.classifier}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Feature Set</span>
                    <span className="font-bold text-cyan-300 mt-1 block">{selectedExperiment.featureSet}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Feature Count</span>
                    <span className="font-bold text-slate-200 mt-1 block">{selectedExperiment.featureCount}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">SMOTE Status</span>
                    <span className="font-bold text-emerald-400 mt-1 block">Train partition only</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Training Data</span>
                    <span className="font-bold text-slate-200 mt-1 block">{selectedExperiment.trainingData}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Evaluation Data</span>
                    <span className="font-bold text-slate-200 mt-1 block">{selectedExperiment.testData}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                  <span className="text-xs font-mono font-bold text-white uppercase block">
                    Experiment Performance Metrics
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    {['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC', 'PR-AUC'].map((metric) => (
                      <div key={metric} className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 block">{metric}</span>
                        <span className="text-xl font-bold font-mono text-white mt-1 block">—</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-mono text-slate-500 text-center">
                    Awaiting experiment results from connected Python evaluation backend.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Experiment ID: {selectedExperiment.id}
                </span>
                <button
                  onClick={() => setSelectedExperiment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700 transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
