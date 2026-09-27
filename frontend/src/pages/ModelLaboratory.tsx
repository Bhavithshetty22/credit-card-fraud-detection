import React, { useState } from 'react';
import {
  Trees,
  GitFork,
  TrendingUp,
  BrainCircuit,
  Compass,
  Cpu,
  Layers,
  ArrowRight,
  Info,
  X,
  Sliders,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Terminal,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockClassifierProfiles, mock15ModelConfigurations } from '../api/modelApi';
import { ClassifierProfile, ModelConfiguration, FeatureSetType } from '../types/models';
import { PageId } from '../types';

interface ModelLaboratoryProps {
  onNavigate?: (page: PageId) => void;
}

const classifierIcons: Record<string, React.ReactNode> = {
  Trees: <Trees className="w-5 h-5 text-emerald-400" />,
  GitFork: <GitFork className="w-5 h-5 text-cyan-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-blue-400" />,
  BrainCircuit: <BrainCircuit className="w-5 h-5 text-indigo-400" />,
  Compass: <Compass className="w-5 h-5 text-amber-400" />,
};

export const ModelLaboratoryPage: React.FC<ModelLaboratoryProps> = ({ onNavigate }) => {
  const [selectedConfig, setSelectedConfig] = useState<ModelConfiguration | null>(null);

  const openDrawerForCell = (classifierName: string, featureSet: FeatureSetType) => {
    const found = mock15ModelConfigurations.find(
      (c) => c.classifier === classifierName && c.featureSet === featureSet
    );
    if (found) {
      setSelectedConfig(found);
    }
  };

  const openDrawerForProfile = (profile: ClassifierProfile) => {
    // Default to GA feature set for the selected profile
    const found = mock15ModelConfigurations.find(
      (c) => c.classifier === profile.name && c.featureSet === 'GA Features'
    );
    if (found) {
      setSelectedConfig(found);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 relative">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                MACHINE LEARNING FRAMEWORK
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                15 MODEL CONFIGURATIONS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Model Laboratory
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Train, inspect and evaluate the machine learning classifiers used in the fraud detection framework across Full, GA, and Random feature sets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>5 Classifiers × 3 Feature Subsets</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 LARGE MODEL CARDS */}
      <div>
        <SectionHeader
          eyebrow="CLASSIFIER ARCHITECTURES"
          title="Supervised Machine Learning Classifiers"
          subtitle="Five foundational model families trained on balanced representations to distinguish rare fraudulent transactions."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClassifierProfiles.map((profile) => (
            <div
              key={profile.id}
              className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgba(0,242,254,0.08)] transition-all duration-200 group"
            >
              <div>
                {/* Header: Icon & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                    {classifierIcons[profile.iconName] || <Cpu className="w-5 h-5 text-cyan-400" />}
                  </div>
                  <StatusBadge status={profile.status} variant="emerald" size="sm" />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white tracking-tight font-sans group-hover:text-cyan-300 transition-colors">
                  {profile.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {profile.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-white/10 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                {/* Configurations badge */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3 Feature Modes</span>
                  </span>
                  <span className="text-cyan-300">Full · GA · Random</span>
                </div>

                <button
                  onClick={() => openDrawerForProfile(profile)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all group/btn"
                >
                  <span>Inspect Model Configurations</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 × 3 MODEL CONFIGURATION MATRIX */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="EXPERIMENTAL TAXONOMY"
          title="Experiment Matrix"
          subtitle="Every classifier is evaluated using three feature configurations (Full Features, GA-Selected Features, and Random Features)."
          action={
            <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-white/5">
              Click any cell to open experiment details
            </span>
          }
        />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-bold">Classifier</th>
                <th className="py-3 px-4 text-center">Full Features (30)</th>
                <th className="py-3 px-4 text-center text-cyan-300 bg-cyan-950/20 border-x border-cyan-500/20">
                  GA Features (Optimal)
                </th>
                <th className="py-3 px-4 text-center">Random Features (Baseline)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockClassifierProfiles.map((clf) => (
                <tr key={clf.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                    {classifierIcons[clf.iconName]}
                    <span>{clf.name}</span>
                  </td>

                  {/* Cell: Full */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openDrawerForCell(clf.name, 'Full Features')}
                      title="Open experiment"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800 text-[11px] transition-all group"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                      <span className="text-slate-300 group-hover:text-cyan-300">Artifact expected</span>
                    </button>
                  </td>

                  {/* Cell: GA */}
                  <td className="py-4 px-4 text-center bg-cyan-950/20 border-x border-cyan-500/20">
                    <button
                      onClick={() => openDrawerForCell(clf.name, 'GA Features')}
                      title="Open experiment"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-400/40 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,242,254,0.2)] text-[11px] transition-all group"
                    >
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse group-hover:scale-125 transition-transform" />
                      <span className="text-cyan-200 font-bold group-hover:text-white">Artifact expected</span>
                    </button>
                  </td>

                  {/* Cell: Random */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openDrawerForCell(clf.name, 'Random Features')}
                      title="Open experiment"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-800 text-[11px] transition-all group"
                    >
                      <span className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                      <span className="text-slate-300 group-hover:text-cyan-300">Artifact expected</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPERIMENT DETAIL DRAWER */}
      {selectedConfig && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedConfig(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-[#0B1222] border-l border-white/15 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between">
              {/* Drawer Content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-5">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      Experiment Configuration Detail
                    </span>
                    <h2 className="text-2xl font-bold text-white font-sans mt-1">
                      {selectedConfig.classifier}
                    </h2>
                    <p className="text-sm font-mono text-cyan-300 mt-0.5">
                      {selectedConfig.featureSet}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedConfig(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Metadata Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Classifier</span>
                    <span className="font-bold text-white mt-1 block">{selectedConfig.classifier}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Feature Configuration</span>
                    <span className="font-bold text-cyan-300 mt-1 block">{selectedConfig.featureSet}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Input Features</span>
                    <span className="font-bold text-slate-200 mt-1 block">Dynamic / Backend ({selectedConfig.featureCount})</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Training Data</span>
                    <span className="font-bold text-slate-200 mt-1 block">{selectedConfig.trainingData}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Evaluation Data</span>
                    <span className="font-bold text-slate-200 mt-1 block">{selectedConfig.evaluationData}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Artifact ID</span>
                    <span className="font-bold text-cyan-400 mt-1 block truncate">{selectedConfig.artifactId}</span>
                  </div>
                </div>

                {/* Metric Placeholders (No invented numbers) */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Test Evaluation Metrics
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Un-resampled Test Partition (20%)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC', 'PR-AUC'].map((metric) => (
                      <div key={metric} className="p-3 rounded-xl bg-slate-900 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 block">{metric}</span>
                        <span className="text-xl font-bold font-mono text-white mt-1 block">—</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-mono text-slate-500 text-center">
                    Metrics will be populated from the evaluation service.
                  </p>
                </div>

                {/* Model Hyperparameter Details */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Current Project Configuration</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Read-Only</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {Object.entries(selectedConfig.hyperparameters).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-slate-400">{key}</span>
                        <span className="text-cyan-300 font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Pipeline Visualization */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/20 space-y-3">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase block">
                    Experiment Execution Pipeline
                  </span>

                  <div className="space-y-2 font-mono text-xs text-center">
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                      FEATURE INPUT (30 Features)
                    </div>
                    <div className="text-cyan-400 text-xs">↓</div>
                    <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 font-bold">
                      SELECT FEATURE SET ({selectedConfig.featureSet})
                    </div>
                    <div className="text-cyan-400 text-xs">↓</div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                      TRAINING DATA (80% Partition)
                    </div>
                    <div className="text-cyan-400 text-xs">↓</div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                      SMOTE RESAMPLING (Train Only)
                    </div>
                    <div className="text-cyan-400 text-xs">↓</div>
                    <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 font-bold">
                      MODEL TRAINING ({selectedConfig.classifier})
                    </div>
                    <div className="text-cyan-400 text-xs">↓</div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                      HELD-OUT TEST DATA (20% Pure)
                    </div>
                    <div className="text-cyan-400 text-xs">↓</div>
                    <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-bold">
                      EVALUATION METRICS
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer CTA */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Ready for backend linkage
                </span>
                <button
                  onClick={() => {
                    setSelectedConfig(null);
                    if (onNavigate) onNavigate('model-comparison');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition-all"
                >
                  Open Comparison View →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
