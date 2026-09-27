import React, { useState } from 'react';
import {
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  BarChart2,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Binary,
} from 'lucide-react';
import { PageId } from '../types';
import { ResearchCallout } from '../components/common/ResearchCallout';

interface ExplainabilityPageProps {
  onNavigate: (page: PageId) => void;
}

const CLASSIFIERS = [
  'Random Forest',
  'Decision Tree',
  'Logistic Regression',
  'ANN / MLP',
  'Gaussian Naive Bayes',
];

const FEATURE_STRATEGIES = [
  { id: 'ga', name: 'GA Features (Evolutionary)', desc: 'Optimal predictive subset discovered by Genetic Algorithm' },
  { id: 'full', name: 'Full Features (All 30)', desc: 'Complete set of 30 continuous numerical features' },
  { id: 'random', name: 'Random Features (Baseline)', desc: 'Matched-size random feature subset baseline' },
];

const PLACEHOLDER_CONTRIBUTION_FEATURES = [
  { name: 'V14', role: 'Strong Negative Component', defaultCategory: 'Strong Contributor' },
  { name: 'V12', role: 'PCA Correlation Component', defaultCategory: 'Strong Contributor' },
  { name: 'V10', role: 'PCA Component', defaultCategory: 'Moderate Contributor' },
  { name: 'V17', role: 'Extreme Value Component', defaultCategory: 'Moderate Contributor' },
  { name: 'V11', role: 'Variance Separator', defaultCategory: 'Weak Contributor' },
  { name: 'Amount', role: 'Transaction Monetary Amount', defaultCategory: 'Weak Contributor' },
];

export const ExplainabilityPage: React.FC<ExplainabilityPageProps> = ({ onNavigate }) => {
  const [selectedClassifier, setSelectedClassifier] = useState('Random Forest');
  const [selectedStrategy, setSelectedStrategy] = useState('ga');
  const [selectedSample, setSelectedSample] = useState<'demo_sample' | 'custom'>('demo_sample');
  const [globalModel, setGlobalModel] = useState('Random Forest');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.15)] shrink-0">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  INTERPRETABLE AI
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  SHAP / TreeExplainer Architecture
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Model Explainability
              </h1>
              <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
                Understand why the selected classifier produced a fraud prediction. Inspect local feature attributions and global feature importance rankings across GA-optimized models.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => onNavigate('fraud-detection')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fraud Detection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model & Feature Selector Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector Form Card */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Explainability Target Configuration</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Interactive Inspector
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Classifier
              </label>
              <select
                value={selectedClassifier}
                onChange={(e) => setSelectedClassifier(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {CLASSIFIERS.map((clf) => (
                  <option key={clf} value={clf}>
                    {clf}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Feature Strategy
              </label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {FEATURE_STRATEGIES.map((strat) => (
                  <option key={strat.id} value={strat.id}>
                    {strat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Evaluation Transaction Sample
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedSample('demo_sample')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedSample === 'demo_sample'
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">Demo High-Risk Sample #492</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">V14=-4.22, V12=-3.81, Amount=149.62</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSample('custom')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedSample === 'custom'
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">Latest Evaluated Transaction</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Single Transaction form payload</div>
              </button>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Explainability Status</h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Model:</span>
                <span className="text-white font-medium">{selectedClassifier}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Feature Set:</span>
                <span className="text-cyan-400 font-medium">
                  {selectedStrategy === 'ga' ? 'GA Features' : selectedStrategy === 'full' ? 'Full 30' : 'Random Set'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Prediction Status:</span>
                <span className="text-amber-400 font-medium">Sample Loaded</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Explainability:</span>
                <span className="text-slate-400 font-medium">Awaiting Backend</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Ready for Python SHAP TreeExplainer
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Breakdown Panel */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Prediction Breakdown Panel</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Inference Attribution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Model Prediction</span>
            <div className="text-lg font-bold text-slate-300 mt-1 flex items-center gap-2">
              <span>—</span>
              <span className="text-xs font-normal text-slate-400">(Awaiting inference)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Confidence Score</span>
            <div className="text-lg font-bold text-slate-300 mt-1">
              <span>Backend value only</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Model Used</span>
            <div className="text-sm font-semibold text-white mt-1.5">{selectedClassifier}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Inference Latency</span>
            <div className="text-sm font-semibold text-slate-400 mt-1.5">Backend only</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center font-mono">
          Prediction explanation unavailable until backend returns inference metadata.
        </div>
      </div>

      {/* Feature Contribution Visualization & Local Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Contribution Chart */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Feature Contribution (Local Attribution)</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SHAP Attributions</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Visual breakdown of how individual feature values shift the decision boundary toward or away from fraud detection.
            </p>

            <div className="space-y-3">
              {PLACEHOLDER_CONTRIBUTION_FEATURES.map((feat) => (
                <div key={feat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold">{feat.name}</span>
                    <span className="text-slate-500">{feat.role}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 flex items-center px-1">
                    {/* Neutral placeholder bar */}
                    <div className="w-1/3 h-1.5 bg-slate-700/60 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 font-mono">
            Awaiting explainability output.
          </div>
        </div>

        {/* Local Explanation Card */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Why this prediction?</h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Decision Decomposition
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
                <span className="font-semibold text-rose-300 block mb-1">Strong Positive Contributors</span>
                <p className="text-slate-400 text-[11px]">
                  [Backend required]: Features shifting log-odds significantly toward fraud class (e.g., extreme negative V14, V12 values).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <span className="font-semibold text-amber-300 block mb-1">Moderate Contributors</span>
                <p className="text-slate-400 text-[11px]">
                  [Backend required]: Supporting features reinforcing anomalous transaction profile (e.g., V10, V17).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1">Weak Contributors</span>
                <p className="text-slate-400 text-[11px]">
                  [Backend required]: Minor variance features with minimal marginal influence (e.g., Amount, V11).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="font-semibold text-slate-400 block mb-1">Unknown / Neutral Contributors</span>
                <p className="text-slate-500 text-[11px]">
                  [Backend required]: Excluded features or zero SHAP contributions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400">
            Local explanation automatically adjusts based on the selected feature strategy (GA vs Full).
          </div>
        </div>
      </div>

      {/* Global Feature Importance Section */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Model Feature Importance (Global Architecture)</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Classifier:</span>
            <div className="flex items-center gap-1">
              {CLASSIFIERS.map((clf) => (
                <button
                  key={clf}
                  onClick={() => setGlobalModel(clf)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    globalModel === clf
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
                  }`}
                >
                  {clf.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
          <Binary className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">
            Global Feature Importance for {globalModel}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Feature-importance rankings will be calculated from the trained <code className="text-cyan-400">{globalModel}</code> model artifact once the Python backend is connected.
          </p>
          <div className="inline-block px-3 py-1 rounded bg-slate-900 text-slate-400 text-[11px] font-mono border border-slate-800">
            Backend will populate.
          </div>
        </div>
      </div>

      {/* SHAP / Explainability Ready Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ResearchCallout
            variant="methodology"
            title="Explainability Engine Architecture"
            badgeText="Interpretable AI"
          >
            CREDITGUARD decouples the inference pipeline from the explainability engine. In production, tree models (Random Forest, Decision Tree) utilize exact <code>TreeExplainer</code> algorithms, while non-linear neural networks use <code>KernelExplainer</code> or Permutation Importance to guarantee auditable, compliant fraud investigations without compromising speed.
          </ResearchCallout>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">Supported Methods</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Backend Pending
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Tree Feature Importance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Permutation Importance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>SHAP (future)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>LIME (future)</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-mono">
            Ready for Python ML binding
          </div>
        </div>
      </div>
    </div>
  );
};
