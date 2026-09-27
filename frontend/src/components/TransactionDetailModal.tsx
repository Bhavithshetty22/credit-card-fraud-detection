import React, { useEffect } from 'react';
import { X, MapPin, Calendar, Tag, DollarSign, ShieldAlert, BarChart2 } from 'lucide-react';

export interface TransactionDetail {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  time_stamp: string;
  location?: string;
  risk_level?: 'safe' | 'caution' | 'danger';
  risk_score?: number;
  reasons?: string[];
  top_contributing_features?: string[];
}

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (transaction) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const rawScore = transaction.risk_score ?? 0;
  const scorePct = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

  const riskLevel =
    transaction.risk_level ??
    (scorePct >= 70 ? 'danger' : scorePct >= 35 ? 'caution' : 'safe');

  const riskBadgeClass =
    riskLevel === 'danger'
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : riskLevel === 'caution'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const hasFeatures =
    transaction.top_contributing_features &&
    transaction.top_contributing_features.length > 0;

  const reasonsList =
    hasFeatures
      ? transaction.top_contributing_features!
      : transaction.reasons && transaction.reasons.length > 0
      ? transaction.reasons
      : ['No specific risk flags detected — transaction within normal bounds.'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeInUp"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
              Transaction Details
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
              {transaction.merchant}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              ID #{transaction.id} · {transaction.time_stamp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Screening Risk Score</span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {scorePct}%
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${riskBadgeClass}`}>
              {riskLevel} Risk
            </span>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block">Amount</span>
              <span className="font-extrabold text-slate-900 text-sm font-mono block mt-0.5">
                ${transaction.amount.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block">Category</span>
              <span className="font-semibold text-slate-800 block mt-0.5">
                {transaction.category}
              </span>
            </div>

            {transaction.location && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-[10px] font-mono text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {transaction.location}
                </span>
              </div>
            )}
          </div>

          {/* Contributing Reasons / Signals */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">
              Risk Signal Drivers
            </h3>
            <div className="space-y-1.5 border-t border-slate-100 pt-2">
              {reasonsList.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 flex items-start gap-2.5">
                  <span className="font-mono text-blue-600 font-bold mt-0.5">•</span>
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
