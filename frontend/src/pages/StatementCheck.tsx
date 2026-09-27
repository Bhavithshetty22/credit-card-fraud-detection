import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, RotateCw, AlertTriangle, RefreshCw, FileText, UserCheck, MapPin, Download, CheckCircle2, FileDown, Sparkles } from 'lucide-react';
import { PageId } from '../types';

interface UserProfile {
  age: number;
  gender: string;
  home_city: string;
  home_state: string;
}

interface BatchRowResult {
  row_index: number;
  status: 'scored' | 'insufficient_location_data';
  id?: number;
  merchant?: string;
  category?: string;
  amount?: number;
  risk?: 'safe' | 'caution' | 'danger';
  score_pct?: number;
  top_contributing_features?: string[];
  note?: string;
}

interface BatchApiResponse {
  total_processed: number;
  scored_count: number;
  unscored_count: number;
  flagged_count: number;
  results: BatchRowResult[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

type UploadState = 'idle' | 'processing' | 'done' | 'error';

interface StatementCheckProps {
  onNavigate?: (page: PageId) => void;
}

export const StatementCheckPage: React.FC<StatementCheckProps> = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [age, setAge] = useState<string>('34');
  const [gender, setGender] = useState<string>('M');
  const [homeCity, setHomeCity] = useState<string>('Columbia');
  const [homeState, setHomeState] = useState<string>('SC');
  const [savingProfile, setSavingProfile] = useState(false);

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [response, setResponse] = useState<BatchApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch(`${API_BASE}/profile`, { cache: 'no-store' });
      if (res.ok) {
        const data: UserProfile = await res.json();
        setProfile(data);
        setAge(data.age.toString());
        setGender(data.gender);
        setHomeCity(data.home_city);
        setHomeState(data.home_state);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } flex: {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setProfileError('Please enter a valid age (1-120).');
      return;
    }
    if (!homeCity.trim() || !homeState.trim()) {
      setProfileError('Home City and Home State are required.');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    try {
      const payload: UserProfile = {
        age: ageNum,
        gender,
        home_city: homeCity.trim(),
        home_state: homeState.trim(),
      };
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to save profile' }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const saved: UserProfile = await res.json();
      setProfile(saved);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save profile');
    } flex: {
      setSavingProfile(false);
    }
  };

  const submitFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid CSV file.');
      setUploadState('error');
      return;
    }

    setFileName(file.name);
    setUploadState('processing');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/predict/batch/realistic`, {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data: BatchApiResponse = await res.json();
      setResponse(data);
      setUploadState('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch scan failed';
      setErrorMsg(msg);
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) submitFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) submitFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleReset = () => {
    setUploadState('idle');
    setResponse(null);
    setErrorMsg(null);
    setFileName(null);
  };

  const handleExportReport = async () => {
    if (!response) return;
    setExporting(true);
    try {
      const payload = {
        ...response,
        file_name: fileName || 'statement.csv',
        scanned_at: new Date().toLocaleString(),
      };
      const res = await fetch(`${API_BASE}/report/scan-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const baseName = (fileName || 'statement').replace(/\.csv$/i, '');
      a.href = url;
      a.download = `fraud_report_${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      alert(`Export failed: ${msg}`);
    } flex: {
      setExporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleCsv = `Date,Merchant,Category,Amount,City,State
2026-09-27 14:30:00,fraud_Kirlin and Sons,personal_care,2.86,Columbia,SC
2026-09-27 15:00:00,fraud_Sporer-Keebler,health_fitness,29.84,Altonah,UT
2026-09-27 16:15:00,unknown_merchant_store,arcade_games,450.00,Columbia,SC
`;
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statement_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">Statement Scanner</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Batch process CSV bank statements to evaluate risk using spatial, temporal, and demographic models.
          </p>
        </div>
        <button
          onClick={downloadSampleTemplate}
          className="self-start sm:self-auto flex items-center gap-2 text-xs font-mono font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download Sample CSV
        </button>
      </div>

      {/* Profile Bar / Setup */}
      {profileLoading ? (
        <div className="card-formal p-5 text-xs text-slate-500 flex items-center gap-3 animate-pulse">
          <RotateCw className="w-4 h-4 animate-spin text-blue-600" />
          Checking cardholder profile setup…
        </div>
      ) : !profile ? (
        <div className="card-formal border-amber-200 bg-amber-50/30 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Cardholder Profile Required</h2>
              <p className="text-xs text-slate-600 mt-1">
                The realistic ML pipeline uses your age, gender, and home location to calculate spatial distance anomalies.
              </p>
            </div>
          </div>

          {profileError && (
            <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="34"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">Home City</label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder="Columbia"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">Home State</label>
              <input
                type="text"
                value={homeState}
                onChange={(e) => setHomeState(e.target.value)}
                placeholder="SC"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="sm:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {savingProfile ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                Save Profile & Unlock Upload
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card-formal p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Active Cardholder Profile:</span>
            <span className="text-slate-600 font-mono">
              {profile.age} yrs · {profile.gender.toUpperCase()} · <MapPin className="w-3 h-3 inline text-blue-600" /> {profile.home_city}, {profile.home_state}
            </span>
          </div>
          <button onClick={() => setProfile(null)} className="text-[11px] text-blue-600 font-mono hover:underline">
            Edit Profile
          </button>
        </div>
      )}

      {/* Upload Box */}
      {uploadState === 'idle' && (
        <div
          onDrop={profile ? handleDrop : undefined}
          onDragOver={profile ? handleDragOver : undefined}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => {
            if (profile) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center gap-4 text-center transition-all ${
            !profile
              ? 'border-slate-200 bg-slate-50/50 opacity-50 cursor-not-allowed'
              : isDragging
              ? 'border-blue-600 bg-blue-50/50 cursor-pointer shadow-md'
              : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 bg-white cursor-pointer shadow-sm'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-base text-slate-900 font-display">
              {!profile
                ? 'Complete profile setup above to unlock CSV upload'
                : isDragging
                ? 'Drop statement CSV here'
                : 'Drag & drop bank statement CSV'}
            </p>
            {profile && (
              <p className="text-xs text-slate-500 mt-1">
                or <span className="text-blue-600 font-semibold underline">click to browse</span>
              </p>
            )}
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            CSV columns: Date · Merchant · Category · Amount · City · State
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            disabled={!profile}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Processing */}
      {uploadState === 'processing' && (
        <div className="card-formal p-12 flex flex-col items-center gap-5 text-center">
          <RotateCw className="w-10 h-10 text-blue-600 animate-spin" />
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-display">Scanning Statement Rows</h3>
            <p className="text-xs text-blue-600 font-mono mt-1">{fileName}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {uploadState === 'error' && (
        <div className="card-formal border-rose-200 bg-rose-50/30 p-10 flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-600" />
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-display">Scan Failed</h3>
            <p className="text-xs text-rose-700 font-mono mt-1 max-w-md">{errorMsg}</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      )}

      {/* Results */}
      {uploadState === 'done' && response && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-formal p-4 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Processed</span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block tabular-nums">
                {response.total_processed}
              </span>
            </div>
            <div className="card-formal p-4 text-center bg-emerald-50/30 border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-mono block">Scored Safe</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 block tabular-nums">
                {response.scored_count - response.flagged_count}
              </span>
            </div>
            <div className="card-formal p-4 text-center bg-rose-50/30 border-rose-200">
              <span className="text-[10px] text-rose-700 uppercase font-mono block">Flagged Risk</span>
              <span className="text-2xl font-extrabold font-mono text-rose-700 mt-1 block tabular-nums">
                {response.flagged_count}
              </span>
            </div>
            <div className="card-formal p-4 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Unverified Location</span>
              <span className="text-2xl font-extrabold font-mono text-slate-700 mt-1 block tabular-nums">
                {response.unscored_count}
              </span>
            </div>
          </div>

          <div className="card-blue-tint p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Scan Summary Ready
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Generate an official PDF report summarizing this scan's findings and risk distribution.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                Scan Another
              </button>
              <button
                onClick={handleExportReport}
                disabled={exporting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {exporting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Export PDF Report
              </button>
            </div>
          </div>

          <div className="card-formal overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase font-mono">Row Results</h3>
              <span className="text-xs font-mono text-blue-600 font-semibold">{response.results.length} Rows</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {response.results.map((row) => (
                <div key={row.row_index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#{row.row_index + 1}</span>
                      <span className="font-bold text-slate-900">{row.merchant || 'Unknown Merchant'}</span>
                      {row.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {row.category}
                        </span>
                      )}
                      {row.risk && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            row.risk === 'danger' ? 'badge-danger' : row.risk === 'caution' ? 'badge-caution' : 'badge-safe'
                          }`}
                        >
                          {row.risk}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono">
                    {row.amount !== undefined && (
                      <span className="font-bold text-slate-900 text-sm tabular-nums">
                        ${row.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
