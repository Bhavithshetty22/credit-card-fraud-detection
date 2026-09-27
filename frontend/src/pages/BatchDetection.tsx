import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Info,
  Layers,
  Cpu,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { fraudDetectionApi } from '../api/fraudDetectionApi';
import {
  CsvValidationResult,
  BatchDetectionResponse,
  BatchPredictionItem,
} from '../types/fraudDetection';
import { ClassifierName, FeatureSetType } from '../types/models';
import { PageId } from '../types';

interface BatchDetectionProps {
  onNavigate?: (page: PageId) => void;
}

const REQUIRED_30_COLUMNS = [
  'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
  'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
  'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
];

export const BatchDetectionPage: React.FC<BatchDetectionProps> = ({ onNavigate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedClassifier, setSelectedClassifier] = useState<ClassifierName>('Random Forest');
  const [selectedFeatureSet, setSelectedFeatureSet] = useState<FeatureSetType>('GA Features');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, number>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [batchResponse, setBatchResponse] = useState<BatchDetectionResponse | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Fraud' | 'Legitimate'>('All');
  const [searchRow, setSearchRow] = useState<string>('');

  // Handle CSV file selection and parsing
  const handleFileChange = (file: File) => {
    setApiError(null);
    setBatchResponse(null);

    if (!file.name.endsWith('.csv')) {
      setValidationResult({
        isValid: false,
        fileName: file.name,
        rowCount: 0,
        columns: [],
        missingRequiredColumns: [],
        hasGroundTruth: false,
        previewRows: [],
        errorMessage: 'Invalid file format. Please upload a .csv file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || !text.trim()) {
        setValidationResult({
          isValid: false,
          fileName: file.name,
          rowCount: 0,
          columns: [],
          missingRequiredColumns: REQUIRED_30_COLUMNS,
          hasGroundTruth: false,
          previewRows: [],
          errorMessage: 'The uploaded CSV file is empty.',
        });
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setValidationResult({
          isValid: false,
          fileName: file.name,
          rowCount: 0,
          columns: [],
          missingRequiredColumns: REQUIRED_30_COLUMNS,
          hasGroundTruth: false,
          previewRows: [],
          errorMessage: 'CSV must contain a header row and at least one transaction row.',
        });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const missing = REQUIRED_30_COLUMNS.filter(
        (col) => !headers.some((h) => h.toLowerCase() === col.toLowerCase())
      );
      const hasGroundTruth = headers.some(
        (h) => h.toLowerCase() === 'class' || h.toLowerCase() === 'target' || h.toLowerCase() === 'fraud'
      );

      const previewRowsData: Record<string, string>[] = [];
      const parsedFullRows: Record<string, number>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length < headers.length) continue;

        const rowObj: Record<string, string> = {};
        const numericRow: Record<string, number> = {};

        headers.forEach((h, idx) => {
          rowObj[h] = values[idx];
          if (REQUIRED_30_COLUMNS.some((req) => req.toLowerCase() === h.toLowerCase())) {
            numericRow[h] = parseFloat(values[idx]) || 0;
          }
        });

        if (i <= 6) previewRowsData.push(rowObj);
        parsedFullRows.push(numericRow);
      }

      setParsedRows(parsedFullRows);
      setValidationResult({
        isValid: missing.length === 0,
        fileName: file.name,
        rowCount: parsedFullRows.length,
        columns: headers,
        missingRequiredColumns: missing,
        hasGroundTruth,
        previewRows: previewRowsData,
        errorMessage:
          missing.length > 0
            ? `Missing required columns: ${missing.slice(0, 5).join(', ')}${
                missing.length > 5 ? ` and ${missing.length - 5} more` : ''
              }`
            : undefined,
      });
    };

    reader.readAsText(file);
  };

  // Download a clean CSV template containing the 30 required columns
  const handleDownloadTemplate = () => {
    const header = REQUIRED_30_COLUMNS.join(',');
    const sampleRow = [
      '0.0', '-1.3598', '-0.0728', '2.5363', '1.3782', '-0.3383', '0.4624', '0.2396',
      '0.0987', '0.3638', '0.0908', '-0.5516', '-0.6178', '-0.9914', '-0.3112', '1.4682',
      '-0.4704', '0.2080', '0.0258', '0.4040', '0.2514', '-0.0183', '0.2778', '-0.1105',
      '0.0669', '0.1285', '-0.1891', '0.1336', '-0.0211', '149.62'
    ].join(',');

    const csvContent = 'data:text/csv;charset=utf-8,' + [header, sampleRow].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'creditguard_batch_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunBatchDetection = async () => {
    if (!validationResult || !validationResult.isValid) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fraudDetectionApi.predictBatch({
        classifier: selectedClassifier,
        featureSet: selectedFeatureSet,
        transactions: parsedRows,
      });
      setBatchResponse(response);
    } catch (err: any) {
      setApiError(
        err?.message ||
          'Batch detection service unavailable. Make sure the Python ML backend is running and accessible.'
      );
      setBatchResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                HIGH-THROUGHPUT PROCESSING
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Batch Fraud Detection
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Upload a transaction CSV and evaluate multiple records through the selected fraud-detection pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Bulk Dataset Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODEL CONFIGURATION SELECTOR */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
              Batch Inference Model Configuration
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Classifier
                </label>
                <select
                  value={selectedClassifier}
                  onChange={(e) => setSelectedClassifier(e.target.value as ClassifierName)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Random Forest">Random Forest</option>
                  <option value="Decision Tree">Decision Tree</option>
                  <option value="Logistic Regression">Logistic Regression</option>
                  <option value="Artificial Neural Network">Artificial Neural Network</option>
                  <option value="Naive Bayes">Gaussian Naive Bayes</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Feature Strategy
                </label>
                <select
                  value={selectedFeatureSet}
                  onChange={(e) => setSelectedFeatureSet(e.target.value as FeatureSetType)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Full Features">Full Features (30)</option>
                  <option value="GA Features">GA Features (Core)</option>
                  <option value="Random Features">Random Features (Baseline)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs space-y-2">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Selected Configuration</span>
            <div className="flex justify-between text-slate-300"><span>Model:</span><strong className="text-white">{selectedClassifier}</strong></div>
            <div className="flex justify-between text-slate-300"><span>Feature Set:</span><strong className="text-cyan-300">{selectedFeatureSet}</strong></div>
            <div className="flex justify-between text-slate-300"><span>Expected Features:</span><span>30 dimensions (Time, V1–V28, Amount)</span></div>
            <div className="flex justify-between text-slate-300"><span>Status:</span><span className="text-amber-400">Backend configuration required</span></div>
          </div>
        </div>
      </div>

      {/* CSV UPLOAD AREA */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              Dataset Upload & Validation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload a CSV file containing transactions. Class column is optional and treated as ground truth if present.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-cyan-500/40 rounded-2xl p-8 text-center bg-slate-950/60 hover:bg-slate-900/40 transition-all cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".csv"
            className="hidden"
          />

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h4 className="text-base font-bold text-white font-sans">
            Drop transaction CSV here
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            CSV files containing the required transaction features (Time, V1–V28, Amount).
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-500/15 border border-white/10 text-xs font-mono text-cyan-300 transition-all"
          >
            Choose CSV
          </button>
        </div>

        {/* Validation Status & Details */}
        {validationResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-950 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-sm font-bold font-mono text-white">
                  {validationResult.fileName}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({validationResult.rowCount.toLocaleString()} rows parsed)
                </span>
              </div>

              <StatusBadge
                status={validationResult.isValid ? 'Ready for Analysis' : 'Invalid Schema'}
                variant={validationResult.isValid ? 'emerald' : 'rose'}
                size="sm"
              />
            </div>

            {validationResult.errorMessage && (
              <p className="text-xs font-mono text-rose-400">
                {validationResult.errorMessage}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-2 border-t border-white/5">
              <div className="text-slate-300">
                <span className="text-slate-500 block text-[10px]">Required Features:</span>
                <strong className={validationResult.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                  {validationResult.isValid ? '30 / 30 Detected' : 'Missing required columns'}
                </strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500 block text-[10px]">Optional Ground Truth:</span>
                <strong className={validationResult.hasGroundTruth ? 'text-cyan-300' : 'text-slate-400'}>
                  {validationResult.hasGroundTruth ? 'Class column detected' : 'Not provided'}
                </strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500 block text-[10px]">Model Input Status:</span>
                <strong className="text-slate-200">
                  Class excluded from model input
                </strong>
              </div>
            </div>

            {/* Preview Table of first rows */}
            {validationResult.previewRows.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-slate-400 uppercase block mb-2 font-semibold">
                  Dataset Preview (First {validationResult.previewRows.length} Rows)
                </span>
                <div className="overflow-x-auto max-h-48 overflow-y-auto border border-white/10 rounded-lg">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 sticky top-0">
                      <tr>
                        {Object.keys(validationResult.previewRows[0]).map((h) => (
                          <th key={h} className="py-2 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {validationResult.previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 truncate max-w-[120px]">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Run Batch Detection Button */}
            {validationResult.isValid && (
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleRunBatchDetection}
                  disabled={isLoading}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processing transactions...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                      <span>Run Batch Detection</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BACKEND DISCONNECTED NOTICE */}
      {apiError && (
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 bg-amber-950/20 flex items-start gap-4 font-sans text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-300 font-mono uppercase">
              Batch Detection Service Unavailable
            </h4>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {apiError}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Endpoint: <code className="text-amber-300">POST http://localhost:8000/api/predict/batch</code>
            </p>
          </div>
        </div>
      )}

      {/* BATCH RESULTS SUMMARY & DATA TABLE (UNFABRICATED) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
        <SectionHeader
          eyebrow="DETECTION METRICS"
          title="Detection Results"
          subtitle="Aggregate fraud scoring breakdown and annotated transaction records."
          action={
            <button
              disabled={!batchResponse}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 text-xs font-mono transition-all disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Results</span>
            </button>
          }
        />

        {/* 4 Summary Cards (Populated from backend only) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Transactions</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {batchResponse ? batchResponse.total.toLocaleString() : '—'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-500/20 text-center">
            <span className="text-[10px] font-mono text-rose-400 uppercase block">Fraud Detected</span>
            <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
              {batchResponse ? batchResponse.fraudCount.toLocaleString() : '—'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/20 text-center">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">Legitimate</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {batchResponse ? batchResponse.legitimateCount.toLocaleString() : '—'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 text-center">
            <span className="text-[10px] font-mono text-cyan-400 uppercase block">Fraud Rate</span>
            <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
              {batchResponse && batchResponse.fraudRate !== null
                ? `${(batchResponse.fraudRate * 100).toFixed(3)}%`
                : '—'}
            </span>
          </div>
        </div>

        {/* Results Table Area */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 p-6 text-center">
          {!batchResponse ? (
            <div className="py-8 space-y-2 font-mono text-xs text-slate-400">
              <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-300">No batch evaluation data yet</p>
              <p className="text-slate-500 text-[11px]">
                Upload a CSV and run batch detection once the backend service is connected.
              </p>
            </div>
          ) : (
            <div className="text-left font-mono text-xs">
              <div className="flex items-center justify-between mb-4">
                <span>Scored {batchResponse.predictions.length} records</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECURITY NOTICE */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="font-sans text-xs">
          <h4 className="font-mono font-bold text-white uppercase text-xs">
            Data Handling & Schema Scope
          </h4>
          <p className="text-slate-300 mt-1 leading-relaxed">
            Transaction data is processed for fraud-detection analysis. Avoid uploading sensitive cardholder information that is not required by the model.
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            <strong>Required features:</strong> Time, V1–V28 PCA features, Amount. Cardholder names, CVVs, PINs, and full card numbers are never accepted.
          </p>
        </div>
      </div>
    </div>
  );
};
