import React from 'react';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { SYSTEM_STATUS_LIST } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';

export const SystemStatus: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Live System Status
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
            All Subsystems Nominal
          </span>
        </div>

        <div className="space-y-2.5">
          {SYSTEM_STATUS_LIST.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white font-sans">
                    {item.name}
                  </span>
                </div>
                {item.detail && (
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {item.detail}
                  </p>
                )}
              </div>
              <StatusBadge
                status={item.status}
                variant={
                  item.status === 'Loaded' || item.status === 'Ready' || item.status === 'Available'
                    ? 'emerald'
                    : 'blue'
                }
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400 font-mono">
        <span className="text-cyan-400">Note:</span> Frontend dashboard preview active. Direct Python pipeline hooks ready for connection.
      </div>
    </div>
  );
};
