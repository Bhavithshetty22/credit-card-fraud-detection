import React, { useState, useMemo } from 'react';
import {
  Scale,
  BarChart3,
  Search,
  Filter,
  Sliders,
  Layers,
  ArrowUpDown,
  Cpu,
  Info,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mock15ModelConfigurations, mockClassifierProfiles } from '../api/modelApi';
import { ClassifierName, FeatureSetType } from '../types/models';
import { PageId } from '../types';
import { FraudDetectionPage } from './FraudDetection';
import { Zap } from 'lucide-react';

interface ModelComparisonProps {
  onNavigate?: (page: PageId) => void;
  initialTab?: 'benchmark' | 'detection';
}

type SelectedMetric = 'Accuracy' | 'Precision' | 'Recall' | 'F1 Score' | 'ROC-AUC' | 'PR-AUC';

export const ModelComparisonPage: React.FC<ModelComparisonProps> = ({ onNavigate, initialTab = 'benchmark' }) => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'detection'>(initialTab);
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>('F1 Score');
  const [selectedFamily, setSelectedFamily] = useState<ClassifierName>('Random Forest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classifierFilter, setClassifierFilter] = useState<string>('All');
  const [featureSetFilter, setFeatureSetFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'classifier' | 'featureSet'>('classifier');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // 15 configuration bar chart mock structure
  const barChartData = useMemo(() => {
    return [
      { name: 'RF — Full', featureSet: 'Full', score: 0 },
      { name: 'RF — GA', featureSet: 'GA', score: 0 },
      { name: 'RF — Random', featureSet: 'Random', score: 0 },
      { name: 'DT — Full', featureSet: 'Full', score: 0 },
      { name: 'DT — GA', featureSet: 'GA', score: 0 },
      { name: 'DT — Random', featureSet: 'Random', score: 0 },
      { name: 'LR — Full', featureSet: 'Full', score: 0 },
      { name: 'LR — GA', featureSet: 'GA', score: 0 },
      { name: 'LR — Random', featureSet: 'Random', score: 0 },
      { name: 'ANN — Full', featureSet: 'Full', score: 0 },
      { name: 'ANN — GA', featureSet: 'GA', score: 0 },
      { name: 'ANN — Random', featureSet: 'Random', score: 0 },
      { name: 'NB — Full', featureSet: 'Full', score: 0 },
      { name: 'NB — GA', featureSet: 'GA', score: 0 },
      { name: 'NB — Random', featureSet: 'Random', score: 0 },
    ];
  }, []);

  // Filtered and sorted 15-model table rows
  const filteredTableRows = useMemo(() => {
    let rows = mock15ModelConfigurations.filter((item) => {
      const matchesSearch =
        item.classifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.featureSet.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClassifier = classifierFilter === 'All' || item.classifier === classifierFilter;
      const matchesFeatureSet = featureSetFilter === 'All' || item.featureSet === featureSetFilter;
      return matchesSearch && matchesClassifier && matchesFeatureSet;
    });

    rows.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return rows;
  }, [searchQuery, classifierFilter, featureSetFilter, sortField, sortAsc]);

  const toggleSort = (field: 'classifier' | 'featureSet') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                CROSS-MODEL BENCHMARK
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Model Comparison
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Compare the complete 15-configuration experimental matrix across classification metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Comparative Analytical Matrix</span>
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TAB SELECTOR BAR */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'benchmark'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>3A. 15-Model Comparative Results</span>
        </button>
        <button
          onClick={() => setActiveTab('detection')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'detection'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>3B. Interactive Fraud Detection Engine</span>
        </button>
      </div>

      {activeTab === 'detection' ? (
        <FraudDetectionPage onNavigate={onNavigate} />
      ) : (
        <>
          {/* METRIC SELECTOR SEGMENTED CONTROL */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Evaluation Metric Focus
            </span>
            <h3 className="text-lg font-bold text-white font-sans mt-0.5">
              Select Primary Comparison Metric
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active metric: <strong className="text-cyan-300">{selectedMetric}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC', 'PR-AUC'] as SelectedMetric[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all text-center ${
                selectedMetric === metric
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                  : 'bg-slate-900/70 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* 15-CONFIGURATION BAR CHART */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="15 CONFIGURATION COMPARISON"
          title={`15-Model Comparison: ${selectedMetric}`}
          subtitle="Experimental performance comparison across all 5 classifiers and 3 feature configurations."
          action={
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-400" />
                <span>Full (30)</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
                <span>GA Selected</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-400" />
                <span>Random Baseline</span>
              </span>
            </div>
          }
        />

        {/* Recharts Bar Chart Area with Awaiting State Overlay */}
        <div className="h-80 w-full relative mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8', angle: -45, textAnchor: 'end' }}
                interval={0}
              />
              <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="score" fill="#00F2FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Polished Empty State Badge */}
          <div className="absolute inset-0 bg-[#070B14]/75 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none rounded-xl border border-white/5">
            <BarChart3 className="w-8 h-8 text-cyan-400 animate-pulse mb-2" />
            <p className="text-sm font-bold font-mono text-white">
              Awaiting evaluation results
            </p>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-sm text-center">
              Metrics will render across all 15 configurations once the Python evaluation artifact is loaded.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURE-SET COMPARISON (3 COLUMNS) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="FEATURE-SELECTION STRATEGY"
          title="Feature Configuration Comparison"
          subtitle="Impact of dimensionality reduction across Full Features, GA-Selected Features, and Random Baseline Subsets."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          {/* Column 1: Full */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/25 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Configuration 01</span>
              <h4 className="text-lg font-bold text-white font-sans mt-1">FULL FEATURES</h4>
              <div className="text-3xl font-extrabold text-blue-300 font-mono mt-3">30</div>
              <p className="text-xs text-slate-300 mt-2">
                All continuous input features (Time, V1–V28 PCA, Amount).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Dimensionality: 100% Retained
            </div>
          </div>

          {/* Column 2: GA */}
          <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 flex flex-col justify-between shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Configuration 02 • Core GA</span>
              <h4 className="text-lg font-bold text-white font-sans mt-1">GA FEATURES</h4>
              <div className="text-3xl font-extrabold text-cyan-300 font-mono mt-3">—</div>
              <p className="text-xs text-slate-300 mt-2">
                Optimal feature subset discovered via evolutionary F1-score optimization.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-cyan-500/20 text-[11px] font-mono text-cyan-300">
              Status: Awaiting GA Artifact Count
            </div>
          </div>

          {/* Column 3: Random */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/25 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Configuration 03 • Baseline Control</span>
              <h4 className="text-lg font-bold text-white font-sans mt-1">RANDOM FEATURES</h4>
              <div className="text-3xl font-extrabold text-indigo-300 font-mono mt-3">—</div>
              <p className="text-xs text-slate-300 mt-2">
                Reproducible random feature subset matching the GA feature count for benchmark control.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Status: Linked to GA Cardinality
            </div>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400 mt-4 border-t border-white/5 pt-3 text-center">
          Once evaluation results are connected, this view will compare how feature-selection strategy affects model performance.
        </p>
      </div>

      {/* MODEL FAMILY COMPARISON */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="FAMILY BENCHMARK"
          title="Model Family Comparison"
          subtitle="Inspect single classifier architectures across the three feature selection regimes."
        />

        {/* Family Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['Random Forest', 'Decision Tree', 'Logistic Regression', 'Artificial Neural Network', 'Naive Bayes'] as ClassifierName[]).map((name) => (
            <button
              key={name}
              onClick={() => setSelectedFamily(name)}
              className={`py-2 px-3.5 rounded-xl border text-xs font-sans font-semibold transition-all ${
                selectedFamily === name
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* 3 Metric Panels for Selected Family */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Full Features', 'GA Features', 'Random Features'] as FeatureSetType[]).map((fSet) => (
            <div
              key={fSet}
              className={`p-5 rounded-2xl border ${
                fSet === 'GA Features'
                  ? 'bg-cyan-950/30 border-cyan-500/30'
                  : 'bg-slate-900/60 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-white uppercase">{fSet}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {fSet === 'Full Features' ? '30 Features' : 'Dynamic Subset'}
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {['Accuracy', 'Precision', 'Recall', 'F1', 'ROC-AUC'].map((metricName) => (
                  <div key={metricName} className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">{metricName}</span>
                    <span className="text-white font-bold">—</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 15-MODEL RESULTS TABLE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              15-Model Experiment Results Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive results matrix for all 15 classifier and feature set combinations.
            </p>
          </div>

          {/* Table Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-48"
              />
            </div>

            <select
              value={classifierFilter}
              onChange={(e) => setClassifierFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 font-mono"
            >
              <option value="All">All Classifiers</option>
              <option value="Random Forest">Random Forest</option>
              <option value="Decision Tree">Decision Tree</option>
              <option value="Logistic Regression">Logistic Regression</option>
              <option value="Artificial Neural Network">ANN / MLP</option>
              <option value="Naive Bayes">Naive Bayes</option>
            </select>

            <select
              value={featureSetFilter}
              onChange={(e) => setFeatureSetFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 font-mono"
            >
              <option value="All">All Feature Sets</option>
              <option value="Full Features">Full Features</option>
              <option value="GA Features">GA Features</option>
              <option value="Random Features">Random Features</option>
            </select>
          </div>
        </div>

        {/* Scrollable Results Table */}
        <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-950/60 max-h-[440px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="sticky top-0 bg-[#0B1222] border-b border-white/10 z-10 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort('classifier')}
                  className="py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Model</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('featureSet')}
                  className="py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Feature Set</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Features</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Precision</th>
                <th className="py-3 px-4 text-center">Recall</th>
                <th className="py-3 px-4 text-center">F1</th>
                <th className="py-3 px-4 text-center">ROC-AUC</th>
                <th className="py-3 px-4 text-center">Training Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredTableRows.map((row) => {
                const isGA = row.shortFeatureSet === 'GA';
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-900/70 transition-colors ${
                      isGA ? 'bg-cyan-950/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      {row.classifier}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isGA
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : row.shortFeatureSet === 'Full'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                        }`}
                      >
                        {row.featureSet}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {row.featureCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">—</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">—</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">—</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">—</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">—</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">—</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <StatusBadge status="Pending" variant="neutral" size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Displaying 15 model configurations across 5 classifiers.</span>
          <span>Analysis matrix • No recommendation bias</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
