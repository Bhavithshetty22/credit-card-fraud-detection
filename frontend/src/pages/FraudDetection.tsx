import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, RotateCw, AlertTriangle, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { PageId } from '../types';
import { TransactionDetailModal, TransactionDetail } from '../components/TransactionDetailModal';

interface FraudDetectionProps {
  onNavigate?: (page: PageId) => void;
}

interface AlertRow {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  time_stamp: string;
  risk_level: 'danger' | 'caution';
  risk_score: number;
  reasons: string[];
  is_resolved: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const FraudDetectionPage: React.FC<FraudDetectionProps> = () => {
  const [openAlerts, setOpenAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [resolvedItems, setResolvedItems] = useState<
    { id: number; merchant: string; amount: number; actionTaken: string; resolvedAt: string }[]
  >([]);
  const [resolvingState, setResolvingState] = useState<Record<number, 'safe' | 'disputed'>>({});
  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);

  const handleRowClick = async (alertId: number, fallback: AlertRow) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${alertId}`, { cache: 'no-store' });
      if (res.ok) {
        const detail: TransactionDetail = await res.json();
        setSelectedTx(detail);
      } else {
        setSelectedTx({
          ...fallback,
          category: fallback.category || 'General',
          reasons: fallback.reasons || [],
        });
      }
    } catch {
      setSelectedTx({
        ...fallback,
        category: fallback.category || 'General',
        reasons: fallback.reasons || [],
      });
    }
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/alerts`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setOpenAlerts(data.alerts ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkSafe = async (alertId: number) => {
    setResolvingState((prev) => ({ ...prev, [alertId]: 'safe' }));
    try {
      await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: 'safe' }),
      });
    } catch {
      // optimistic UI
    }
    setTimeout(() => {
      const item = openAlerts.find((a) => a.id === alertId);
      setOpenAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setResolvingState((prev) => {
        const next = { ...prev };
        delete next[alertId];
        return next;
      });
      if (item) {
        setResolvedItems((prev) => [
          {
            id: item.id,
            merchant: item.merchant,
            amount: item.amount,
            actionTaken: 'Marked as safe by user',
            resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
      }
    }, 1000);
  };

  const handleLockAndDispute = async (alertId: number) => {
    setResolvingState((prev) => ({ ...prev, [alertId]: 'disputed' }));
    try {
      await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: 'disputed' }),
      });
    } catch {
      // optimistic UI
    }
    setTimeout(() => {
      const item = openAlerts.find((a) => a.id === alertId);
      setOpenAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setResolvingState((prev) => {
        const next = { ...prev };
        delete next[alertId];
        return next;
      });
      if (item) {
        setResolvedItems((prev) => [
          {
            id: item.id,
            merchant: item.merchant,
            amount: item.amount,
            actionTaken: 'Card locked & charge disputed',
            resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
      }
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans animate-fadeInUp pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">Alert Center</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review transactions flagged by risk algorithms requiring your decision.
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-blue-600 transition-all flex items-center gap-2 shadow-sm"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </button>
      </div>

      {/* Open Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Open Flags ({openAlerts.length})
          </h2>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs flex items-center justify-between gap-3 text-rose-700">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Could not fetch live alerts</p>
                <p className="text-rose-600 font-mono mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={fetchAlerts} className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-bold text-slate-800 shadow-sm">
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="card-formal p-5 animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded"></div>
                  <div className="h-3 w-64 bg-slate-100 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && !loading && openAlerts.length === 0 && (
          <div className="card-formal p-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-display">No Active Security Alerts</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your card is actively protected. Any transactions meeting danger parameters will appear here immediately.
            </p>
          </div>
        )}

        {/* Alert rows */}
        {!error && !loading && openAlerts.length > 0 && (
          <div className="space-y-3">
            {openAlerts.map((item) => (
              <div
                key={item.id}
                className={`card-formal p-5 space-y-4 ${
                  item.risk_level === 'danger'
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                {resolvingState[item.id] ? (
                  <div
                    className={`p-4 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                      resolvingState[item.id] === 'safe'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {resolvingState[item.id] === 'safe' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Marked as safe — updating alert queue…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-rose-600" /> Card locked & charge disputed — updating alert queue…
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                      onClick={() => handleRowClick(item.id, item)}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                            item.risk_level === 'danger' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                              {item.merchant}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {item.category}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                item.risk_level === 'danger' ? 'badge-danger' : 'badge-caution'
                              }`}
                            >
                              {(item.risk_score * 100).toFixed(0)}% Risk Score
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.reasons?.[0] ?? 'Flagged by fraud screening model'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        <span className="text-lg font-extrabold text-slate-900 block tabular-nums">
                          ${item.amount.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">{item.time_stamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-blue-600 font-mono hover:underline cursor-pointer" onClick={() => handleRowClick(item.id, item)}>
                        View signal breakdown →
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleMarkSafe(item.id)}
                          className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all"
                        >
                          Mark Safe
                        </button>
                        <button
                          onClick={() => handleLockAndDispute(item.id)}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" /> Lock & Dispute
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Resolved */}
      {resolvedItems.length > 0 && (
        <div className="space-y-3 pt-4">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="w-full flex items-center justify-between border-b border-slate-200 pb-3 text-left group"
          >
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Recently Resolved ({resolvedItems.length})
            </h2>
            <div className="flex items-center gap-1 text-xs font-mono text-blue-600">
              <span>{showResolved ? 'Hide' : 'Show'}</span>
              {showResolved ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showResolved && (
            <div className="card-formal divide-y divide-slate-100 overflow-hidden">
              {resolvedItems.map((item) => (
                <div key={`resolved-${item.id}`} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.merchant}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {item.actionTaken} · {item.resolvedAt}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
};
