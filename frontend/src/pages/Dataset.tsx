import React, { useState, useMemo } from 'react';
import {
  Database,
  ShieldAlert,
  Sliders,
  Percent,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  Info,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { datasetApi, mockDatasetSummary, mockFeatureSchema, mockDatasetCharacteristics, mockValidationChecks } from '../api/datasetApi';
import { FeatureSchemaItem } from '../types/dataset';
import { PageId } from '../types';

import { PreprocessingPage } from './Preprocessing';

interface DatasetProps {
  onNavigate?: (page: PageId) => void;
  initialSubTab?: 'overview' | 'preprocessing';
}

export const DatasetPage: React.FC<DatasetProps> = ({ onNavigate, initialSubTab = 'overview' }) => {
  const [subTab, setSubTab] = useState<'overview' | 'preprocessing'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Input Feature' | 'Target'>('All');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Filter features based on search & role filter
  const filteredFeatures = useMemo(() => {
    return mockFeatureSchema.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || f.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

  const handleRunValidation = async () => {
    setIsValidating(true);
    setValidationMessage(null);
    try {
      const res = await datasetApi.triggerValidation();
      setValidationMessage(res.message);
    } catch (err) {
      setValidationMessage('Validation service unreachable.');
    } finally {
      setIsValidating(false);
    }
  };

  const donutData = [
    { name: 'Legitimate (Class 0)', value: mockDatasetSummary.legitimateRecords, color: '#10B981', percentage: '99.828%' },
    { name: 'Fraudulent (Class 1)', value: mockDatasetSummary.fraudRecords, color: '#F43F5E', percentage: '0.172%' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                RESEARCH DATASET INTELLIGENCE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Dataset Intelligence
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Inspect the European Credit Card Fraud benchmark dataset (<code className="text-cyan-300 font-mono text-xs">creditcard.csv</code>) used by the detection pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Format: 284,807 × 31 Tabular</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB SELECTOR BAR */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 w-fit">
        <button
          onClick={() => setSubTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            subTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1A. Dataset Overview & Schema</span>
        </button>
        <button
          onClick={() => setSubTab('preprocessing')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            subTab === 'preprocessing'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1B. Preprocessing & SMOTE Pipeline</span>
        </button>
      </div>

      {subTab === 'preprocessing' ? (
        <PreprocessingPage onNavigate={onNavigate} />
      ) : (
        <>
          {/* DATASET SUMMARY - 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Transactions */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Dataset Fact</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Transactions</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-sans mt-1">284,807</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Complete record volume</p>
        </div>

        {/* Card 2: Input Features */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Dataset Fact</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Input Features</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-sans mt-1">30</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Time + V1–V28 + Amount</p>
        </div>

        {/* Card 3: Fraudulent Transactions */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 group hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-rose-400/80 uppercase">Target 1</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Fraudulent Transactions</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-sans mt-1">492</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Positive class instances</p>
        </div>

        {/* Card 4: Fraud Rate */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 uppercase">Ratio</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Fraud Rate</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-sans mt-1">0.172%</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Severe class imbalance</p>
        </div>
      </div>

      {/* CLASS DISTRIBUTION & IMBALANCE ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart Visualizer */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Transaction Class Distribution
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/5">
                Target: Class (0 / 1)
              </span>
            </div>

            <div className="h-64 relative flex items-center justify-center my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-white/15 p-3 rounded-xl shadow-2xl font-mono text-xs">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="text-slate-300 mt-1">{data.value.toLocaleString()} records</p>
                            <p className="text-cyan-400 font-bold mt-0.5">{data.percentage}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#070B14"
                    strokeWidth={3}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  0.172%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold font-mono">
                  Fraud
                </span>
              </div>
            </div>

            {/* Side legend breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-semibold">Legitimate</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-bold text-white font-mono">284,315</span>
                  <span className="text-xs font-mono text-slate-400">99.828%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  <span className="font-semibold">Fraudulent</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-bold text-rose-400 font-mono">492</span>
                  <span className="text-xs font-mono text-rose-300/80">0.172%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Imbalance Callout */}
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-200">
                Severe class imbalance
              </p>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                Fraudulent transactions represent only a very small fraction of the complete dataset, motivating the use of imbalance-handling techniques during training.
              </p>
            </div>
          </div>
        </div>

        {/* Dataset Characteristics Cards */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Dataset Characteristics
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Metadata Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockDatasetCharacteristics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 transition-colors"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    {item.title}
                  </span>
                  <span className="text-sm font-bold text-slate-100 mt-1 block font-sans">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block leading-tight">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-500 font-mono flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>*Populate this dynamically once the backend dataset validation endpoint is connected. Do not imply a validation result if the dataset has not actually been checked.</span>
          </div>
        </div>
      </div>

      {/* DATASET SCHEMA TABLE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-sans">
                Feature Schema
              </h3>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                30 Input Features + 1 Target
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete specification of input features and ground-truth target variable conforming to the reference paper.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search features..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
              {(['All', 'Input Feature', 'Target'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-mono text-[11px] ${
                    roleFilter === role
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Schema Table */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-white/10 rounded-xl bg-slate-950/60">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0B1222] border-b border-white/10 z-10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-sans">
              {filteredFeatures.map((feat) => {
                const isTarget = feat.role === 'Target';
                return (
                  <tr
                    key={feat.name}
                    className={`hover:bg-slate-900/80 transition-colors ${
                      isTarget ? 'bg-rose-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span className={isTarget ? 'text-rose-400' : 'text-cyan-300'}>
                        {feat.name}
                      </span>
                      {feat.isPCA && (
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                          PCA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {feat.type}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      {feat.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isTarget
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        }`}
                      >
                        {feat.role}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DATASET VALIDATION CHECKLIST */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xl font-bold text-white font-sans">
                Dataset Validation
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Integrity checklist inspecting schema presence, data types, and target distribution parameters.
            </p>
          </div>

          <button
            onClick={handleRunValidation}
            disabled={isValidating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold font-mono transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            {isValidating ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Running Validation...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>Run Validation</span>
              </>
            )}
          </button>
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockValidationChecks.map((check) => {
            const isPassed = check.status === 'passed';
            return (
              <div
                key={check.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white font-sans">
                      {check.label}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        isPassed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isPassed ? 'Passed' : 'Pending API'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {check.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation message feedback alert */}
        {validationMessage && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-3 font-mono">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cyan-300">Validation Notice:</p>
              <p className="mt-0.5">{validationMessage}</p>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
