import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Users,
  Target,
  Database,
  Dna,
  FlaskConical,
  ArrowRight,
  Info,
  Layers,
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { PageId } from '../types';
import { ResearchCallout } from '../components/common/ResearchCallout';
import { PUBLISHED_REFERENCE_PAPER } from '../api/paperApi';

interface PaperReferencePageProps {
  onNavigate: (page: PageId) => void;
}

const PAPER_ARCHITECTURE_STEPS = [
  { label: 'Normalize Inputs', desc: 'Standard scaling of transaction features' },
  { label: 'GA Feature Selection', desc: 'Evolutionary chromosome optimization (5 vectors)' },
  { label: 'Training', desc: 'Classifier training on GA-reduced feature space' },
  { label: 'Testing', desc: 'Evaluation on withheld test partition' },
  { label: 'Evaluation', desc: 'Precision, Recall, F1, AUC metric computation' },
  { label: 'Fraud Detection', desc: 'Live inference application' },
];

const OUR_VS_PAPER = [
  {
    aspect: 'GA Fitness Objective',
    paper: 'Not explicitly stated as F1; evolutionary optimization yielded 5 published vectors',
    ours: 'Explicit F1-Score maximization via stratified 5-Fold Cross-Validation on training subset only',
    ourBetter: true,
  },
  {
    aspect: 'Data Leakage Prevention',
    paper: 'Methodology note does not explicitly specify train-only scaler fitting',
    ours: 'Strict train-only MinMax fitting; test set never used in any preprocessing parameter computation',
    ourBetter: true,
  },
  {
    aspect: 'SMOTE Placement',
    paper: 'SMOTE application partition strategy not explicitly documented in published text',
    ours: 'SMOTE applied exclusively to training split after stratified 80/20 partition',
    ourBetter: true,
  },
  {
    aspect: 'GA Output Structure',
    paper: '5 published distinct feature vectors (v1–v5) produced from multiple GA runs',
    ours: 'Single evolutionary GA run producing one optimal feature mask artifact',
    ourBetter: null,
  },
  {
    aspect: 'Feature Count Range',
    paper: '13–22 features across 5 published vectors',
    ours: 'Backend-determined count from evolutionary run (typically 10–20)',
    ourBetter: null,
  },
  {
    aspect: 'Random Feature Baseline',
    paper: 'No explicit matched-size random feature control group in original study',
    ours: 'Dedicated random feature subset baseline of identical cardinality to GA selection',
    ourBetter: true,
  },
  {
    aspect: 'Experiment Count',
    paper: '5 vectors × 5 classifiers = 25 experiments (all under GA-selected features)',
    ours: '5 classifiers × 3 feature strategies = 15 experiments (Full + GA + Random)',
    ourBetter: null,
  },
];

export const PaperReferencePage: React.FC<PaperReferencePageProps> = ({ onNavigate }) => {
  const [expandedVector, setExpandedVector] = useState<string | null>('v1');
  const paper = PUBLISHED_REFERENCE_PAPER;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)] shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                  REFERENCE STUDY
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Published 2022
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Reference Paper
              </h1>
              <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
                Research methodology and published experimental findings. This page documents the original study and distinguishes it from our implementation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publication Card */}
      <div className="glass-panel rounded-xl p-6 border border-indigo-500/20 bg-indigo-950/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Publication Record</h3>
            </div>

            <h2 className="text-base font-bold text-white leading-snug">
              {paper.title}
            </h2>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="font-mono">{paper.authors.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-indigo-300 font-medium">{paper.journal} · {paper.year}</span>
              </div>
              {paper.doi && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">DOI:</span>
                  <code className="text-cyan-400 text-[11px]">{paper.doi}</code>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Dataset Used</span>
              <p className="text-xs font-semibold text-white mt-1">{paper.dataset}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Research Goal</span>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{paper.researchGoal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Research Objective */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 w-fit">
            <Target className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">GA Feature Selection</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Apply Genetic Algorithm evolutionary search to identify the most predictive feature subsets from the 30-dimensional transaction space, reducing dimensionality while preserving detection performance.
          </p>
        </div>
        <div className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 w-fit">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Five Classifiers</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluate Random Forest, Decision Tree, Logistic Regression, Artificial Neural Network, and Naive Bayes classifiers across the GA-selected feature vectors to identify best-performing architectures.
          </p>
        </div>
        <div className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 w-fit">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Imbalanced Dataset</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The European Credit Card Fraud dataset presents extreme class imbalance (0.172% fraudulent), requiring specialized handling and evaluation metrics beyond simple accuracy.
          </p>
        </div>
      </div>

      {/* Paper Architecture */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Published Methodology Architecture</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 ml-auto">
            Reference Paper Flow
          </span>
        </div>

        <div className="flex flex-col items-center gap-0">
          {PAPER_ARCHITECTURE_STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center w-full max-w-xl mx-auto">
              <div className="w-full p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-mono text-indigo-300 flex items-center justify-center font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-semibold text-white">{step.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block">{step.desc}</span>
              </div>
              {idx < PAPER_ARCHITECTURE_STEPS.length - 1 && (
                <div className="flex flex-col items-center py-1">
                  <div className="w-px h-3 bg-indigo-500/30" />
                  <ChevronDown className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Published Feature Vectors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Published Feature Vectors (v1–v5)</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            Reference Study Results
          </span>
        </div>

        <div className="space-y-3">
          {paper.publishedVectors.map((vec) => {
            const isExpanded = expandedVector === vec.id;
            return (
              <div key={vec.id} className="glass-panel rounded-xl border border-white/10 overflow-hidden">
                <div
                  onClick={() => setExpandedVector(isExpanded ? null : vec.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-mono text-indigo-300 flex items-center justify-center font-bold">
                      {vec.id.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{vec.name}</div>
                      <div className="text-[11px] text-slate-400">{vec.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {vec.publishedAccuracy && (
                      <span className="hidden sm:block text-[11px] font-mono text-emerald-400">{vec.publishedAccuracy} Acc</span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {vec.count} feats
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-white/5 bg-slate-950/40 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {vec.features.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs font-mono text-center">
                      {vec.publishedAccuracy && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Accuracy</span>
                          <span className="text-emerald-400 font-bold">{vec.publishedAccuracy}</span>
                        </div>
                      )}
                      {vec.publishedRecall && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Recall</span>
                          <span className="text-cyan-400 font-bold">{vec.publishedRecall}</span>
                        </div>
                      )}
                      {vec.publishedPrecision && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Precision</span>
                          <span className="text-indigo-400 font-bold">{vec.publishedPrecision}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Published Reference · Ileberi et al., {paper.year}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Paper Experiment Table */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Published Experiment Results (Selected)</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            Reference Paper Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-slate-400 font-medium">Feature Vector</th>
                <th className="text-left px-3 py-2 text-slate-400 font-medium">Classifier</th>
                <th className="text-right px-3 py-2 text-slate-400 font-medium">Accuracy</th>
                <th className="text-right px-3 py-2 text-slate-400 font-medium">Recall</th>
                <th className="text-right px-3 py-2 text-slate-400 font-medium">Precision</th>
                <th className="text-right px-3 py-2 text-slate-400 font-medium">F1</th>
                <th className="text-right px-3 py-2 text-slate-400 font-medium">AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paper.publishedResults.map((row, idx) => (
                <tr key={idx} className={`hover:bg-slate-800/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                  <td className="px-3 py-2 text-indigo-300">{row.vectorName}</td>
                  <td className="px-3 py-2 text-white font-medium">{row.model}</td>
                  <td className="px-3 py-2 text-right text-emerald-400">{row.accuracy}</td>
                  <td className="px-3 py-2 text-right text-cyan-400">{row.recall}</td>
                  <td className="px-3 py-2 text-right text-white">{row.precision}</td>
                  <td className="px-3 py-2 text-right text-white font-bold">{row.f1}</td>
                  <td className="px-3 py-2 text-right text-indigo-300">{row.auc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[10px] text-slate-500 font-mono text-center">
          Source: Ileberi et al., 2022 · Published Experimental Results · Reference Only
        </div>
      </div>

      {/* Our Implementation vs Paper */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Our Implementation vs Reference Paper</h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Enhancement</div>
            <div className="flex items-center gap-1 text-slate-400"><AlertTriangle className="w-3 h-3 text-amber-400" /> Difference</div>
          </div>
        </div>

        <div className="space-y-3">
          {OUR_VS_PAPER.map((row, idx) => (
            <div key={idx} className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${
              row.ourBetter === true
                ? 'bg-emerald-950/15 border-emerald-500/20'
                : row.ourBetter === false
                ? 'bg-rose-950/15 border-rose-500/20'
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Aspect</span>
                <div className="text-xs font-bold text-white mt-0.5">{row.aspect}</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase">Reference Paper</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{row.paper}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Our Implementation</span>
                  {row.ourBetter === true && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {row.ourBetter === null && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{row.ours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ResearchCallout
        variant="reference-paper"
        title="Methodological Context"
        badgeText="Academic Positioning"
      >
        The comparison above is presented for transparent academic positioning, not as criticism of the original authors. Ileberi et al. (2022) provided a foundational framework demonstrating the practical effectiveness of Genetic Algorithm feature selection for credit card fraud detection. Our implementation extends their work with explicit zero-leakage protocols and randomized baseline controls.
      </ResearchCallout>
    </div>
  );
};
