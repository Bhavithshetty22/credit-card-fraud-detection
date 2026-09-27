import React from 'react';
import { History, ShieldCheck, Box, CheckCircle2, Clock } from 'lucide-react';
import { RECENT_ACTIVITY_ITEMS } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';

export const ActivityFeed: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Recent Activity & Pipeline Logs
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-white/5">
            Auto-Sync
          </span>
        </div>

        <div className="space-y-3">
          {RECENT_ACTIVITY_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start justify-between gap-3 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 mt-0.5 shrink-0">
                  {item.type === 'artifact' ? (
                    <Box className="w-3.5 h-3.5" />
                  ) : item.type === 'dataset' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200 leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.timestamp}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      [{item.type}]
                    </span>
                  </div>
                </div>
              </div>

              <StatusBadge
                status="Verified"
                variant={item.status === 'success' ? 'emerald' : 'cyan'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Logged Pipeline Events</span>
        <span className="text-slate-300">5 Events Total</span>
      </div>
    </div>
  );
};
