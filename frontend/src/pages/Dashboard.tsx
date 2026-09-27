import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, RotateCw, AlertTriangle, TrendingUp, PieChart, ShieldCheck, ArrowUpRight, Search, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, AreaChart, Area, CartesianGrid
} from 'recharts';
import { PageId } from '../types';
import { TransactionDetailModal, TransactionDetail } from '../components/TransactionDetailModal';

interface DashboardProps {
  onNavigate?: (page: PageId) => void;
}

interface ActivityRow {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  time_stamp: string;
  risk_level: 'safe' | 'caution' | 'danger';
  risk_score: number;
  reasons: string[];
}

interface TrendPoint {
  date: string;
  scanned: number;
  flagged: number;
}

interface CategoryPoint {
  category: string;
  flagged_count: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/** Custom Easing Hook for Count-Up Animation */
function useCountUp(targetValue: number, durationMs = 800): number {
  const [displayVal, setDisplayVal] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = timestamp - startRef.current;
      const fraction = Math.min(progress / durationMs, 1);
      const eased = 1 - Math.pow(1 - fraction, 3);
      setDisplayVal(targetValue * eased);

      if (fraction < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayVal(targetValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, durationMs]);

  return displayVal;
}

/** SVG Arc Risk Gauge Component */
const RiskGauge: React.FC<{ score: number; riskLevel: 'safe' | 'caution' | 'danger' }> = ({ score, riskLevel }) => {
  const radius = 36;
  const strokeWidth = 7;
  const circumference = Math.PI * radius;
  const targetPct = Math.min(Math.max(score, 0), 100) / 100;

  const strokeDashoffset = useCountUp(circumference * (1 - targetPct), 900);

  const arcColor =
    riskLevel === 'danger'
      ? '#EF4444'
      : riskLevel === 'caution'
      ? '#F59E0B'
      : '#10B981';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-24 h-14 overflow-visible" viewBox="0 0 90 50">
        <path
          d="M 9 45 A 36 36 0 0 1 81 45"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M 9 45 A 36 36 0 0 1 81 45"
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      <div className="text-center -mt-4">
        <span className="text-base font-extrabold font-mono text-slate-900 block leading-none">
          {score.toFixed(0)}%
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Risk Index</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);
  const [totalScanned, setTotalScanned] = useState<number>(0);
  const [flaggedTotalAmount, setFlaggedTotalAmount] = useState<number>(0);
  const [overallRiskLevel, setOverallRiskLevel] = useState<'safe' | 'caution' | 'danger'>('safe');
  const [overallRiskScore, setOverallRiskScore] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryPoint[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);

  const handleRowClick = async (txId: number, fallback: ActivityRow) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${txId}`, { cache: 'no-store' });
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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/transactions?page=1&limit=10`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const rows: ActivityRow[] = data.results ?? [];
      setActivityRows(rows);
      setTotalScanned(data.total ?? rows.length);

      const flaggedSum = rows
        .filter((r) => r.risk_level === 'danger' || r.risk_level === 'caution')
        .reduce((acc, r) => acc + (r.amount || 0), 0);
      setFlaggedTotalAmount(flaggedSum);

      const hasDanger = rows.some((r) => r.risk_level === 'danger');
      const hasCaution = rows.some((r) => r.risk_level === 'caution');
      if (hasDanger) {
        setOverallRiskLevel('danger');
        setOverallRiskScore(78);
      } else if (hasCaution) {
        setOverallRiskLevel('caution');
        setOverallRiskScore(36);
      } else {
        setOverallRiskLevel('safe');
        setOverallRiskScore(4);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    setTrendLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/trend`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTrendData(data.trend ?? []);
      }
    } catch {
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }

    setCategoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/by-category`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCategoryData(data.categories ?? []);
      }
    } catch {
      setCategoryData([]);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, [fetchDashboardData, fetchAnalyticsData]);

  const animatedScanned = useCountUp(totalScanned);
  const animatedFlaggedAmt = useCountUp(flaggedTotalAmount);

  return (
    <div className="space-y-8 animate-fadeInUp font-sans pb-12">
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div className="hero-gradient-blue rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-mono font-semibold text-blue-100 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Protection Active · Real-Time Screening
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
            Security & Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal opacity-90">
            Ensemble machine learning models monitoring cardholder authorizations to block fraud instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onNavigate?.('batch-detection')}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Scan Statement
          </button>
          <button
            onClick={() => onNavigate?.('single-transaction')}
            className="px-4 py-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Verify Charge
          </button>
        </div>
      </div>

      {/* ── METRIC CARDS ROW ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Scanned */}
        <div className="card-formal p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Transactions Scanned</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {loading ? '—' : Math.round(animatedScanned).toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>100% Verified by ML</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Flagged Fraud Amount */}
        <div className="card-formal p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Flagged Risk Amount</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {loading ? '—' : `$${animatedFlaggedAmt.toFixed(2)}`}
            </span>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              {activityRows.filter((r) => r.risk_level !== 'safe').length} transactions flagged
            </div>
          </div>
        </div>

        {/* Metric 3: Risk Score Radial Arc Gauge */}
        <div className="card-formal p-5 flex flex-col justify-between items-center text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase font-mono self-start">Card Risk Index</span>
          <div className="my-1">
            <RiskGauge score={overallRiskScore} riskLevel={overallRiskLevel} />
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              overallRiskLevel === 'danger'
                ? 'badge-danger'
                : overallRiskLevel === 'caution'
                ? 'badge-caution'
                : 'badge-safe'
            }`}
          >
            {overallRiskLevel === 'danger' ? 'Action Needed' : overallRiskLevel === 'caution' ? 'Under Review' : 'Low Risk'}
          </span>
        </div>

        {/* Metric 4: Protection Status */}
        <div className="card-formal p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Card Protection</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 live-dot-ring inline-block" />
              <span className="text-xl font-bold font-display text-slate-900">Card Protected</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-tight">
              Real-time rule engine & neural networks active.
            </p>
          </div>
        </div>
      </div>

      {/* ── CHARTS SECTION ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (8 Columns) */}
        <div className="lg:col-span-8 card-formal p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Fraud Trend Analysis</h2>
              <p className="text-xs text-slate-500">Historical transaction scans vs flagged risk volume</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-semibold">
              <div className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Scanned
              </div>
              <div className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Flagged
              </div>
            </div>
          </div>

          {trendLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-mono">
              <RotateCw className="w-5 h-5 animate-spin text-blue-600 mr-2" /> Loading trend data...
            </div>
          ) : trendData.length < 3 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <TrendingUp className="w-8 h-8 text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 text-sm">Trend builds up as more statements are scanned</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Minimum 3 days of transaction data required to plot smooth timeline trends.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scannedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="flaggedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="scanned" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#scannedGrad)" name="Scanned Total" />
                  <Area type="monotone" dataKey="flagged" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#flaggedGrad)" name="Flagged Risk" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Bar Chart (4 Columns) */}
        <div className="lg:col-span-4 card-formal p-6 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 font-display">Risk by Category</h2>
            <p className="text-xs text-slate-500">Flagged transactions grouped by category</p>
          </div>

          {categoryLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-mono">
              <RotateCw className="w-5 h-5 animate-spin text-blue-600 mr-2" /> Loading breakdown...
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <PieChart className="w-8 h-8 text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No Flagged Categories</p>
              <p className="text-xs text-slate-500 mt-1">Zero high-risk charges recorded across categories.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} width={85} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  />
                  <Bar dataKey="flagged_count" fill="#2563EB" radius={[0, 6, 6, 0]} name="Flagged Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY TABLE ──────────────────────────────────── */}
      <div className="card-formal p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">Recent Activity</h2>
            <p className="text-xs text-slate-500">Live authorizations processed by the screening engine</p>
          </div>
          <button
            onClick={() => onNavigate?.('fraud-detection')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto font-mono"
          >
            View All Alerts <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-blue-600" /> Loading activity log...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        ) : activityRows.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No transactions scanned yet. Upload a statement to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {activityRows.map((row) => (
              <div
                key={row.id}
                onClick={() => handleRowClick(row.id, row)}
                className="py-3.5 px-2 flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      row.risk_level === 'danger'
                        ? 'bg-rose-100 text-rose-700'
                        : row.risk_level === 'caution'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {row.risk_level === 'danger' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : row.risk_level === 'caution' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {row.merchant}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {row.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {row.reasons?.[0] ?? 'Verified by screening model'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-right">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block tabular-nums">
                      ${row.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{row.time_stamp}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      row.risk_level === 'danger'
                        ? 'badge-danger'
                        : row.risk_level === 'caution'
                        ? 'badge-caution'
                        : 'badge-safe'
                    }`}
                  >
                    {row.risk_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TRANSACTION DETAIL MODAL ────────────────────────────────── */}
      <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
};

export const DashboardPage = Dashboard;
