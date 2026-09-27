import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, AlertTriangle, ShieldCheck, Lock, Sliders, Globe, AlertOctagon } from 'lucide-react';
import { PageId } from '../types';

interface CardShieldProps {
  onNavigate?: (page: PageId) => void;
}

interface BlockedRow {
  id: number;
  merchant: string;
  amount: number;
  risk_score: number;
  reasons: string[];
  time_stamp: string;
  risk_level: string;
}

interface CardSettings {
  frozen: boolean;
  single_purchase_limit: number;
  block_overseas: boolean;
  block_high_risk_merchants: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function patchSettings(patch: Partial<CardSettings>): Promise<void> {
  await fetch(`${API_BASE}/card-settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

export const CardShieldPage: React.FC<CardShieldProps> = () => {
  const [settings, setSettings] = useState<CardSettings>({
    frozen: false,
    single_purchase_limit: 1500,
    block_overseas: true,
    block_high_risk_merchants: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [blockedRows, setBlockedRows] = useState<BlockedRow[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch(`${API_BASE}/card-settings`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data: CardSettings = await res.json();
      setSettings(data);
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const fetchLog = useCallback(async () => {
    setLogLoading(true);
    setLogError(null);
    try {
      const res = await fetch(`${API_BASE}/transactions?page=1&limit=50`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const flagged = (data.results ?? []).filter(
        (r: BlockedRow) => r.risk_level === 'danger' || r.risk_level === 'caution'
      );
      setBlockedRows(flagged.slice(0, 10));
    } catch (err: unknown) {
      setLogError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchLog();
  }, [fetchSettings, fetchLog]);

  const setFrozen = async (val: boolean) => {
    setSettings((s) => ({ ...s, frozen: val }));
    await patchSettings({ frozen: val });
  };

  const setOverseas = async (val: boolean) => {
    setSettings((s) => ({ ...s, block_overseas: val }));
    await patchSettings({ block_overseas: val });
  };

  const setHighRisk = async (val: boolean) => {
    setSettings((s) => ({ ...s, block_high_risk_merchants: val }));
    await patchSettings({ block_high_risk_merchants: val });
  };

  const setLimit = (val: number) => {
    setSettings((s) => ({ ...s, single_purchase_limit: val }));
  };

  const saveLimit = async () => {
    await patchSettings({ single_purchase_limit: settings.single_purchase_limit });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fadeInUp font-sans">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">Card Controls</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Manage real-time security rules, spending thresholds, and inspect blocked authorizations.
        </p>
      </div>

      {/* Settings load error */}
      {settingsError && (
        <div className="flex items-center justify-between gap-3 p-4 border border-rose-200 rounded-xl bg-rose-50 text-xs text-rose-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Could not load card settings</p>
              <p className="text-rose-600 font-mono mt-0.5">{settingsError}</p>
            </div>
          </div>
          <button onClick={fetchSettings} className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-bold text-slate-800 shadow-sm">
            Retry
          </button>
        </div>
      )}

      {/* Hero Freeze Toggle Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
          settings.frozen
            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-600 shadow-lg shadow-rose-500/20'
            : 'card-blue-tint text-slate-900 shadow-sm'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${settings.frozen ? 'bg-white/20 text-white' : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'}`}>
              {settings.frozen ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-extrabold text-xl font-display ${settings.frozen ? 'text-white' : 'text-slate-900'}`}>
                  {settings.frozen ? 'Card is Frozen' : 'Card is Active & Protected'}
                </h2>
                <span className={`w-2.5 h-2.5 rounded-full ${settings.frozen ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
              </div>
              <p className={`text-xs mt-1 max-w-md ${settings.frozen ? 'text-rose-100' : 'text-slate-600'}`}>
                {settings.frozen
                  ? 'All new incoming purchases are automatically declined until unfrozen.'
                  : 'Screening algorithms are actively validating purchases.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setFrozen(!settings.frozen)}
          disabled={settingsLoading}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-mono font-bold text-xs shrink-0 transition-all ${
            settings.frozen
              ? 'bg-white text-rose-600 border-white hover:bg-rose-50 shadow-md'
              : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-md'
          }`}
        >
          <span>{settings.frozen ? 'UNFREEZE CARD' : 'FREEZE CARD'}</span>
        </button>
      </div>

      {/* Security Policies List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          Security Policy Thresholds
        </h2>

        <div className="card-formal divide-y divide-slate-100 overflow-hidden">
          {/* Purchase Limit */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 block">Single Transaction Threshold</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Decline individual purchases exceeding this dollar amount
                </span>
              </div>
              <span className="text-xl font-mono font-extrabold text-blue-600 tabular-nums">
                ${settings.single_purchase_limit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={settings.single_purchase_limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                onMouseUp={saveLimit}
                onTouchEnd={saveLimit}
                disabled={settingsLoading}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-400 shrink-0">$5,000 max</span>
            </div>
          </div>

          {/* Block Overseas */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Block Overseas Transactions</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Decline purchases originating outside your registered country
                </span>
              </div>
            </div>
            <button
              onClick={() => setOverseas(!settings.block_overseas)}
              disabled={settingsLoading}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 border ${
                settings.block_overseas ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                  settings.block_overseas ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Block High Risk */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 mt-0.5">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Restrict High-Risk Categories</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Decline crypto exchanges, unverified merchant codes, and gambling
                </span>
              </div>
            </div>
            <button
              onClick={() => setHighRisk(!settings.block_high_risk_merchants)}
              disabled={settingsLoading}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 border ${
                settings.block_high_risk_merchants ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                  settings.block_high_risk_merchants ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Log */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
          Blocked Attempts History
        </h2>

        {!logError && !logLoading && blockedRows.length === 0 && (
          <div className="card-formal p-8 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800">No Blocked Transactions Logged</p>
            <p className="mt-1">Charges declined by rules or algorithms will be listed here.</p>
          </div>
        )}

        {!logError && blockedRows.length > 0 && (
          <div className="card-formal divide-y divide-slate-100 overflow-hidden">
            {blockedRows.map((row) => (
              <div key={row.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{row.merchant}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                        row.risk_level === 'danger' ? 'badge-danger' : 'badge-caution'
                      }`}
                    >
                      {row.risk_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{row.reasons?.[0] ?? 'Blocked by policy'}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 text-sm block tabular-nums">
                      ${row.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{row.time_stamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
