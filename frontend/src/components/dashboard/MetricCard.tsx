import React from 'react';
import { Database, ShieldAlert, Sliders, Network, ArrowUpRight } from 'lucide-react';
import { MetricData } from '../../types';

interface MetricCardProps {
  data: MetricData;
}

const iconMap: Record<string, React.ReactNode> = {
  Database: <Database className="w-5 h-5 text-cyan-400" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-rose-400" />,
  Sliders: <Sliders className="w-5 h-5 text-indigo-400" />,
  Network: <Network className="w-5 h-5 text-emerald-400" />,
};

const borderHoverStyles = {
  cyan: 'hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(0,242,254,0.12)]',
  rose: 'hover:border-rose-500/40 hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)]',
  indigo: 'hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)]',
  emerald: 'hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
};

const iconContainerBg = {
  cyan: 'bg-cyan-500/10 border-cyan-500/25',
  rose: 'bg-rose-500/10 border-rose-500/25',
  indigo: 'bg-indigo-500/10 border-indigo-500/25',
  emerald: 'bg-emerald-500/10 border-emerald-500/25',
};

export const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const accent = data.accent || 'cyan';

  return (
    <div
      className={`glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 transition-all duration-300 relative group overflow-hidden ${borderHoverStyles[accent]}`}
    >
      {/* Subtle background glow on hover */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

      {/* Top row: Icon & Status label */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-2.5 rounded-xl border ${iconContainerBg[accent]} flex items-center justify-center`}
        >
          {iconMap[data.icon] || <Database className="w-5 h-5 text-cyan-400" />}
        </div>
        <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300 flex items-center gap-1 transition-colors">
          <span>Verified</span>
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </div>

      {/* Metric Title & Large Value */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
          {data.title}
        </h3>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
          {data.value}
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          {data.label}
        </p>
      </div>

      {/* Footer Subtext */}
      {data.subtext && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>{data.subtext}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors" />
        </div>
      )}
    </div>
  );
};
