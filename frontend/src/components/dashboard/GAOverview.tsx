import React from 'react';
import { Dna, ArrowRight, Binary, ArrowDown, Sparkles, Sliders } from 'lucide-react';
import { ALL_30_FEATURES } from '../../data/mockData';
import { SectionHeader } from '../common/SectionHeader';

interface GAOverviewProps {
  onOpenGAAnalysis: () => void;
}

export const GAOverview: React.FC<GAOverviewProps> = ({ onOpenGAAnalysis }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 mb-8 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <SectionHeader
        eyebrow="CORE CONTRIBUTION"
        title="Genetic Algorithm Feature Selection"
        subtitle="Evolutionary optimization isolating optimal feature representations to maximize minority class detection while discarding noisy dimensions."
        action={
          <button
            onClick={onOpenGAAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold text-xs hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all shrink-0"
          >
            <span>Open GA Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      {/* GA Pipeline Transformation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center my-6">
        {/* Step 1: Full Feature Space */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Initial Space
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sliders className="w-4 h-4" />
              </span>
            </div>
            <h4 className="text-base font-bold text-white font-sans">Full Feature Space</h4>
            <div className="text-2xl font-mono font-extrabold text-indigo-300 mt-2">
              30 <span className="text-xs font-normal text-slate-400 font-sans">Features</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 border-t border-white/5 pt-2">
            Time, V1 through V28 PCA components, and Amount.
          </p>
        </div>

        {/* Transition arrow / GA Optimization engine indicator */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-blue-950/40 border border-cyan-500/30 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dna className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              GA Evolutionary Optimization
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Fitness evaluated on zero-leakage training sub-splits via Random Forest F1-score optimization with crossover, mutation & elitism.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-mono text-cyan-400/80">
            <span>Binary Chromosome (30 Bits)</span>
            <span>•</span>
            <span>Tournament Selection</span>
          </div>
        </div>

        {/* Step 3: Optimized Feature Subset */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/25 flex flex-col justify-between h-full relative group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                Optimal Subset
              </span>
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <h4 className="text-base font-bold text-white font-sans">Optimized Feature Subset</h4>
            <div className="text-sm font-mono font-semibold text-cyan-300 mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Awaiting connected GA artifact</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 border-t border-white/5 pt-2">
            Mask loaded dynamically from <code className="text-cyan-400">models/ga_feature_selection.joblib</code>.
          </p>
        </div>
      </div>

      {/* 30 Features Neutral Slot Grid Preview */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Feature Dimension Matrix (30 Input Features)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Neutral preview — active mask will be illuminated upon backend sync
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {ALL_30_FEATURES.map((feat) => (
            <div
              key={feat}
              className="p-2 rounded-lg bg-slate-900/90 border border-white/5 hover:border-cyan-500/30 text-center transition-colors group cursor-default"
            >
              <span className="text-[11px] font-mono font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
                {feat}
              </span>
              <span className="block text-[9px] font-mono text-slate-600 mt-0.5">
                Bit slot
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
