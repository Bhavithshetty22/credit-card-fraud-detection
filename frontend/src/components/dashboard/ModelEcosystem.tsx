import React from 'react';
import {
  Trees,
  GitFork,
  TrendingUp,
  BrainCircuit,
  Compass,
  ArrowRight,
  Cpu,
  Layers,
} from 'lucide-react';
import { CLASSIFIERS_ECOSYSTEM } from '../../data/mockData';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface ModelEcosystemProps {
  onViewModel: (modelId: string) => void;
}

const classifierIcons: Record<string, React.ReactNode> = {
  Trees: <Trees className="w-5 h-5 text-emerald-400" />,
  GitFork: <GitFork className="w-5 h-5 text-cyan-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-blue-400" />,
  BrainCircuit: <BrainCircuit className="w-5 h-5 text-indigo-400" />,
  Compass: <Compass className="w-5 h-5 text-amber-400" />,
};

export const ModelEcosystem: React.FC<ModelEcosystemProps> = ({ onViewModel }) => {
  return (
    <div className="mb-8">
      <SectionHeader
        eyebrow="MULTI-CLASSIFIER BENCHMARK"
        title="Model Ecosystem"
        subtitle="Five distinct machine learning classifier architectures trained across Full, GA-selected, and Random baseline feature sets."
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>5 Classifiers</span>
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-full">
              15 Serialized Artifacts (.joblib)
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {CLASSIFIERS_ECOSYSTEM.map((model) => (
          <div
            key={model.id}
            className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between group hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgba(0,242,254,0.08)] transition-all duration-200"
          >
            <div>
              {/* Card Header: Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                  {classifierIcons[model.icon] || <Cpu className="w-5 h-5 text-cyan-400" />}
                </div>
                <StatusBadge status={model.status} variant="emerald" size="sm" />
              </div>

              {/* Title & Classification Type */}
              <h3 className="text-base font-bold text-white tracking-tight font-sans group-hover:text-cyan-300 transition-colors">
                {model.name}
              </h3>
              <p className="text-[11px] font-mono text-cyan-400/90 mt-0.5">
                {model.type}
              </p>

              {/* One line description */}
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {model.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
              {/* Feature Subsets tags */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <Layers className="w-3 h-3 text-slate-500" />
                <span>3 Feature Subsets Ready</span>
              </div>

              {/* View Analysis CTA button */}
              <button
                onClick={() => onViewModel(model.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all group/btn"
              >
                <span>View Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
