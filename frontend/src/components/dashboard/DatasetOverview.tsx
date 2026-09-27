import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Database, ShieldAlert, AlertTriangle, Info, FileSpreadsheet } from 'lucide-react';
import { DATASET_DISTRIBUTION, DATASET_PROFILE } from '../../data/mockData';
import { SectionHeader } from '../common/SectionHeader';

export const DatasetOverview: React.FC = () => {
  return (
    <div className="mb-8">
      <SectionHeader
        eyebrow="BENCHMARK DATASET"
        title="Dataset Overview & Imbalance Profile"
        subtitle="Distribution characteristics of the European Credit Card Fraud benchmark dataset (284,807 transactions)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Donut Chart Class Distribution */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white font-sans">
                  Class Distribution
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-white/5">
                Target: Class
              </span>
            </div>

            {/* Recharts Donut */}
            <div className="h-64 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-white/15 p-2.5 rounded-lg shadow-xl font-mono text-xs">
                            <p className="font-semibold text-white">{data.name}</p>
                            <p className="text-slate-300">{data.value.toLocaleString()} transactions</p>
                            <p className="text-cyan-400 font-bold">{data.percentage}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={DATASET_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#070B14"
                    strokeWidth={3}
                  >
                    {DATASET_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                  0.172%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold font-mono">
                  Fraud Rate
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-medium">Legitimate</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white font-mono">284,315</span>
                  <span className="text-[10px] text-slate-400 font-mono">99.828%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  <span className="font-medium">Fraudulent</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-rose-400 font-mono">492</span>
                  <span className="text-[10px] text-rose-300/80 font-mono">0.172%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Imbalance alert callout */}
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-200">
                Highly imbalanced classification problem
              </p>
              <p className="text-[11px] text-rose-300/70 mt-0.5 leading-relaxed">
                Standard accuracy is insufficient. Precision-Recall, F1-Score, and SMOTE resampling are critical for valid evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dataset Profile Panel */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-sans">
                  Dataset Profile & Schema
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono">creditcard.csv</span>
              </div>
            </div>

            {/* Profile specifications list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DATASET_PROFILE.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    {item.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-100 mt-1 block font-sans">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom context notice */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dataset specifications verified against raw benchmark records.</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              100% Validated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
