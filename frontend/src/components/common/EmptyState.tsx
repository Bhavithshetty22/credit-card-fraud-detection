import React from 'react';
import { LucideIcon, ArrowLeft, Clock, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface EmptyStateProps {
  icon: LucideIcon;
  moduleName: string;
  moduleCode: string;
  description: string;
  plannedFeatures: string[];
  paperReference?: string;
  onNavigateHome?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  moduleName,
  moduleCode,
  description,
  plannedFeatures,
  paperReference,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-8 border border-white/10 relative overflow-hidden mb-8">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
          <StatusBadge status="Next Module" variant="cyan" size="sm" />
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            {moduleCode}
          </span>
        </div>

        <div className="flex items-start gap-5">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.15)] shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                Research Pipeline Stage
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {moduleName}
            </h1>
            <p className="text-slate-300 mt-2 text-sm max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Planned Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Architecture Plan */}
        <div className="glass-panel rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-white font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Planned Research Capabilities</span>
          </div>
          <ul className="space-y-3">
            {plannedFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Backend & Research Status */}
        <div className="glass-panel rounded-xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white font-semibold text-sm">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Backend ML Pipeline Status</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Python ML Modules</span>
                <span className="text-emerald-400 font-medium">Ready (Part 5 Complete)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Model Artifacts (.joblib)</span>
                <span className="text-emerald-400 font-medium">15 Saved in models/</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">API Endpoint Link</span>
                <span className="text-cyan-400 font-medium">Scheduled for Next Step</span>
              </div>
            </div>
          </div>

          {paperReference && (
            <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <span><strong>Methodology Context:</strong> {paperReference}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>This UI component is structured for seamless backend integration.</span>
        </div>
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/20 text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
};
