import React from 'react';
import {
  Database,
  Sparkles,
  Split,
  SlidersHorizontal,
  Dna,
  Layers,
  Cpu,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PIPELINE_STAGES } from '../../data/mockData';
import { SectionHeader } from '../common/SectionHeader';

const stageIcons: Record<string, React.ReactNode> = {
  Database: <Database className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Split: <Split className="w-5 h-5" />,
  SlidersHorizontal: <SlidersHorizontal className="w-5 h-5" />,
  Dna: <Dna className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  BarChart2: <BarChart2 className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
};

interface ResearchPipelineProps {
  onStageClick?: (stageStep: string) => void;
}

export const ResearchPipeline: React.FC<ResearchPipelineProps> = ({ onStageClick }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 mb-8 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      <SectionHeader
        eyebrow="SYSTEM ARCHITECTURE"
        title="Research Pipeline"
        subtitle="End-to-end architecture of the proposed fraud detection system, enforcing zero-leakage training and GA feature selection."
        action={
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-white/5">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Step 05 Core GA</span>
            </span>
            <span>•</span>
            <span>9 Stages Total</span>
          </div>
        }
      />

      {/* Horizontal Pipeline Grid */}
      <div className="relative mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 relative z-10">
          {PIPELINE_STAGES.map((stage) => {
            const isGA = stage.highlight;

            return (
              <div
                key={stage.step}
                onClick={() => onStageClick && onStageClick(stage.step)}
                className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer group relative ${
                  isGA
                    ? 'bg-gradient-to-b from-cyan-950/50 to-slate-900/90 border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.15)] ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Header of Stage */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isGA ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {stage.step}
                  </span>
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : stage.status === 'active' ? (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                {/* Icon & Title */}
                <div className="mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${
                      isGA
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'bg-slate-800 text-slate-300 border border-white/5 group-hover:text-cyan-400'
                    }`}
                  >
                    {stageIcons[stage.icon] || <Database className="w-5 h-5" />}
                  </div>
                  <h4 className="text-[11px] font-bold tracking-tight text-white line-clamp-1">
                    {stage.title}
                  </h4>
                  <p className="text-[10px] text-cyan-400/90 font-mono mt-0.5 line-clamp-1">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Short description */}
                <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                  {stage.description}
                </p>

                {/* Central Contribution Tag for GA */}
                {isGA && (
                  <div className="mt-3 pt-2 border-t border-cyan-500/30">
                    <span className="text-[9px] font-mono tracking-wider font-semibold text-cyan-300 uppercase block text-center">
                      ★ Core Contribution
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
