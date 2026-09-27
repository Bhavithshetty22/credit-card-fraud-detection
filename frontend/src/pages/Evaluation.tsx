import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Sliders,
  Layers,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Terminal,
  FileCode,
  LineChart as LineChartIcon,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mock15ModelConfigurations } from '../api/modelApi';
import { mockMetricDefinitions } from '../api/evaluationApi';
import { ClassifierName, FeatureSetType } from '../types/models';
import { PageId } from '../types';

interface EvaluationProps {
  onNavigate?: (page: PageId) => void;
}

export const EvaluationPage: React.FC<EvaluationProps> = ({ onNavigate }) => {
  const [selectedClassifier, setSelectedClassifier] = useState<ClassifierName>('Random Forest');
  const [selectedFeatureSet, setSelectedFeatureSet] = useState<FeatureSetType>('GA Features');
  const [expandedMetric, setExpandedMetric] = useState<string | null>('F1 Score');

  const currentConfig = useMemo(() => {
    return (
      mock15ModelConfigurations.find(
        (c) => c.classifier === selectedClassifier && c.featureSet === selectedFeatureSet
      ) || mock15ModelConfigurations[0]
    );
  }, [selectedClassifier, selectedFeatureSet]);

  const toggleExpandMetric = (name: string) => {
    setExpandedMetric(expandedMetric === name ? null : name);
  };

  // Diagonal reference line data for ROC (0,0 to 1,1)
  const rocDiagonal = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                PERFORMANCE DIAGNOSTICS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Model Evaluation
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Inspect classification performance using the evaluation metrics defined by the research framework on the un-resampled holdout test set (56,962 transactions).
            </p>
          </div>

          {/* Model & Feature Configuration Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-white/10">
            <select
              value={selectedClassifier}
              onChange={(e) => setSelectedClassifier(e.target.value as ClassifierName)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Random Forest">Random Forest</option>
              <option value="Decision Tree">Decision Tree</option>
              <option value="Logistic Regression">Logistic Regression</option>
              <option value="Artificial Neural Network">Artificial Neural Network</option>
              <option value="Naive Bayes">Naive Bayes</option>
            </select>

            <select
              value={selectedFeatureSet}
              onChange={(e) => setSelectedFeatureSet(e.target.value as FeatureSetType)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50 font-bold"
            >
              <option value="Full Features">Full Features</option>
              <option value="GA Features">GA Features (Core)</option>
              <option value="Random Features">Random Features</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6 TOP METRIC CARDS (Loaded from backend later) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Accuracy', desc: 'Overall classification accuracy' },
          { label: 'Precision', desc: 'True fraud / predicted fraud' },
          { label: 'Recall', desc: 'True fraud / actual fraud' },
          { label: 'F1 Score', desc: 'Harmonic mean of P & R' },
          { label: 'ROC-AUC', desc: 'Area under ROC curve' },
          { label: 'PR-AUC', desc: 'Precision-Recall area' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="glass-panel rounded-2xl p-4 border border-white/10 text-center hover:border-cyan-500/30 transition-all"
          >
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              {metric.label}
            </span>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              —
            </div>
            <span className="text-[9px] font-mono text-slate-500 block mt-1">
              Awaiting artifact
            </span>
          </div>
        ))}
      </div>

      {/* TWO COLUMN SECTION: CONFUSION MATRIX & MODEL ARTIFACT STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: CONFUSION MATRIX */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white font-sans">
                  Confusion Matrix
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-white/5">
                Holdout Test Partition (N = 56,962)
              </span>
            </div>

            {/* Confusion Matrix Table */}
            <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-white/10">
              <div className="text-center font-mono text-xs text-slate-400 uppercase mb-3 font-semibold">
                PREDICTED CLASS
              </div>

              <div className="grid grid-cols-12 gap-2 text-center font-mono text-xs">
                {/* Left Header */}
                <div className="col-span-3 flex items-center justify-center font-bold text-slate-400 uppercase">
                  ACTUAL CLASS
                </div>

                <div className="col-span-4 p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300 font-semibold">
                  Predicted Legitimate (0)
                </div>

                <div className="col-span-5 p-2 rounded-lg bg-slate-900 border border-white/5 text-rose-300 font-semibold">
                  Predicted Fraud (1)
                </div>

                {/* Actual Legitimate Row */}
                <div className="col-span-3 p-3 flex items-center justify-center bg-slate-900/60 rounded-lg text-slate-300 font-semibold">
                  Actual Legitimate (0)
                </div>

                <div className="col-span-4 p-5 rounded-xl bg-slate-900/80 border border-emerald-500/25 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-slate-400 uppercase">True Negative (TN)</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1">—</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Legitimate as Legitimate</span>
                </div>

                <div className="col-span-5 p-5 rounded-xl bg-slate-900/80 border border-amber-500/25 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-slate-400 uppercase">False Positive (FP)</span>
                  <span className="text-2xl font-bold text-amber-400 mt-1">—</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">False Alarm</span>
                </div>

                {/* Actual Fraud Row */}
                <div className="col-span-3 p-3 flex items-center justify-center bg-rose-950/30 border border-rose-500/20 rounded-lg text-rose-300 font-semibold">
                  Actual Fraud (1)
                </div>

                <div className="col-span-4 p-5 rounded-xl bg-slate-900/80 border border-rose-500/30 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-slate-400 uppercase">False Negative (FN)</span>
                  <span className="text-2xl font-bold text-rose-400 mt-1">—</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Missed Fraud (Critical)</span>
                </div>

                <div className="col-span-5 p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-center items-center">
                  <span className="text-[10px] text-slate-400 uppercase">True Positive (TP)</span>
                  <span className="text-2xl font-bold text-cyan-300 mt-1">—</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Detected Fraud</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Definitions Callouts */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-3 border-t border-white/5">
            <div><strong className="text-cyan-300">TP:</strong> Fraud correctly classified as fraud.</div>
            <div><strong className="text-emerald-400">TN:</strong> Legitimate correctly classified as legitimate.</div>
            <div><strong className="text-amber-400">FP:</strong> Legitimate incorrectly classified as fraud.</div>
            <div><strong className="text-rose-400">FN:</strong> Fraud incorrectly classified as legitimate.</div>
          </div>
        </div>

        {/* RIGHT 5 COLS: MODEL ARTIFACT STATUS */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white font-sans">
                  Model Artifact Status
                </h3>
              </div>
              <StatusBadge status="Pending Link" variant="neutral" size="sm" />
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/25 mb-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Inspected Target</span>
              <p className="text-base font-bold text-white font-sans mt-0.5">
                {currentConfig.classifier} + {currentConfig.featureSet}
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Serialized Model File</span>
                <span className="text-cyan-300 font-semibold mt-0.5 block truncate">
                  {currentConfig.artifactId}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Associated Scaler Artifact</span>
                <span className="text-slate-300 mt-0.5 block truncate">
                  {currentConfig.scalerArtifact}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">Feature Mask Artifact</span>
                <span className="text-slate-300 mt-0.5 block truncate">
                  {currentConfig.featureMaskArtifact}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Backend Status</span>
                <span className="text-amber-400 font-semibold">Pending integration</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500">
            Typed metadata interfaces ready for direct Python `.joblib` evaluation hooks.
          </div>
        </div>
      </div>

      {/* METRIC DEFINITIONS (EXPANDABLE CARDS) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="FORMAL DEFINITIONS"
          title="Metric Definitions & Mathematical Formulation"
          subtitle="Evaluation criteria used to benchmark fraud classifiers under extreme 0.172% class imbalance."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockMetricDefinitions.map((def) => {
            const isExpanded = expandedMetric === def.name;
            return (
              <div
                key={def.name}
                className="rounded-xl bg-slate-900/70 border border-white/5 hover:border-white/15 transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleExpandMetric(def.name)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-300 block">
                      {def.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {def.shortFormula}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/5 text-xs text-slate-300 space-y-2 bg-slate-950/60">
                    <p>{def.description}</p>
                    <p className="text-[11px] text-slate-400 border-l-2 border-cyan-500/40 pl-2">
                      <strong className="text-slate-300">Fraud Context:</strong> {def.importanceInFraud}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ROC CURVE & PRECISION-RECALL CURVE (UNFABRICATED / POLISHED EMPTY STATES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans">
                Receiver Operating Characteristic (ROC)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">TPR vs FPR</span>
            </div>

            <div className="h-64 relative bg-slate-950 rounded-xl border border-white/5 flex flex-col items-center justify-center p-4">
              <LineChartIcon className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-mono text-slate-400 text-center">
                ROC data unavailable — connect evaluation artifact.
              </p>
              <span className="text-[10px] font-mono text-slate-600 mt-1">
                Threshold curve will render True Positive Rate vs False Positive Rate
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>X-Axis: False Positive Rate</span>
            <span>Y-Axis: True Positive Rate</span>
          </div>
        </div>

        {/* Precision-Recall Curve */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans">
                Precision-Recall Analysis
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Precision vs Recall</span>
            </div>

            <div className="h-64 relative bg-slate-950 rounded-xl border border-white/5 flex flex-col items-center justify-center p-4">
              <LineChartIcon className="w-8 h-8 text-cyan-600/60 mb-2" />
              <p className="text-xs font-mono text-slate-400 text-center">
                Precision-Recall data unavailable — connect evaluation artifact.
              </p>
              <span className="text-[10px] font-mono text-slate-600 mt-1">
                Vital diagnostic for 0.172% extreme class skew
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>X-Axis: Recall (Sensitivity)</span>
            <span>Y-Axis: Precision (PPV)</span>
          </div>
        </div>
      </div>

      {/* RESEARCH PAPER CONNECTION & MODEL EXPERIMENT FLOW */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            METHODOLOGY ALIGNMENT
          </span>
          <h3 className="text-xl font-bold text-white mt-1 font-sans">
            Evaluation Framework & Experiment Flow
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Research Paper Connection */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 space-y-3 font-sans text-xs">
            <h4 className="font-mono font-bold text-white uppercase text-xs">
              Evaluation Framework
            </h4>
            <p className="text-slate-300 leading-relaxed">
              The reference study evaluates the five classifiers using accuracy, recall, precision, F1-score and AUC.
            </p>

            <h4 className="font-mono font-bold text-cyan-300 uppercase text-xs pt-2">
              Our Evaluation Extension
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Because this implementation focuses on highly imbalanced fraud detection, the application additionally exposes PR-AUC and uses F1-score for GA fitness.
            </p>
          </div>

          {/* Model Experiment Flow Diagram */}
          <div className="p-5 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-center space-y-2">
            <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">
              3-Feature Configuration to 5-Classifier Matrix
            </span>

            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-200">
              30 CONTINUOUS FEATURES
            </div>
            <div className="text-cyan-400 text-xs">↓</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-1.5 rounded bg-blue-950/60 border border-blue-500/30 text-[10px] text-blue-300">FULL (30)</div>
              <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300">GA SUBSET</div>
              <div className="p-1.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-300">RANDOM</div>
            </div>
            <div className="text-cyan-400 text-xs">↓</div>
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-200">
              TRAINING DATA (80% Train-Only Scaling)
            </div>
            <div className="text-cyan-400 text-xs">↓</div>
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-200">
              SMOTE RESAMPLING
            </div>
            <div className="text-cyan-400 text-xs">↓</div>
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 font-bold">
              CLASSIFIER MODEL (RF, DT, LR, ANN, NB)
            </div>
            <div className="text-cyan-400 text-xs">↓</div>
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-200">
              HELD-OUT TEST EVALUATION
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
