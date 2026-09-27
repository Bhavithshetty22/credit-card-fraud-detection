import React, { useState } from 'react';
import {
  Download,
  FileText,
  BarChart3,
  Dna,
  Grid,
  LineChart,
  Image,
  Presentation,
  CheckSquare,
  Square,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  FilePieChart,
  Lock,
  Sparkles,
} from 'lucide-react';
import { PageId } from '../types';
import { ResearchCallout } from '../components/common/ResearchCallout';

interface ExportCenterPageProps {
  onNavigate: (page: PageId) => void;
}

type ExportCategory = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  formats: { id: string; label: string; icon: React.ReactNode }[];
};

const EXPORT_CATEGORIES: ExportCategory[] = [
  {
    id: 'predictions',
    label: 'Prediction Results',
    description: 'Single and batch transaction classification outputs',
    icon: <FileText className="w-5 h-5" />,
    formats: [
      { id: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { id: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
    ],
  },
  {
    id: 'metrics',
    label: 'Evaluation Metrics',
    description: 'Precision, Recall, F1, ROC-AUC across 15 model configurations',
    icon: <BarChart3 className="w-5 h-5" />,
    formats: [
      { id: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { id: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
    ],
  },
  {
    id: 'ga_features',
    label: 'GA Feature Selection',
    description: 'Evolved feature mask, convergence data, and chromosome history',
    icon: <Dna className="w-5 h-5" />,
    formats: [
      { id: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
      { id: 'csv', label: 'CSV Mask', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
  },
  {
    id: 'confusion_matrix',
    label: 'Confusion Matrices',
    description: 'TN, FP, FN, TP counts for all 15 experiments',
    icon: <Grid className="w-5 h-5" />,
    formats: [
      { id: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { id: 'png', label: 'PNG Chart', icon: <Image className="w-4 h-4" /> },
    ],
  },
  {
    id: 'roc_curves',
    label: 'ROC / PR Curves',
    description: 'Threshold sensitivity curves and area under ROC',
    icon: <LineChart className="w-5 h-5" />,
    formats: [
      { id: 'png', label: 'PNG', icon: <Image className="w-4 h-4" /> },
      { id: 'csv', label: 'Raw Points CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
  },
  {
    id: 'charts',
    label: 'Charts & Figures',
    description: 'Publication-ready comparative bar charts and visualizations',
    icon: <FilePieChart className="w-5 h-5" />,
    formats: [
      { id: 'png', label: 'PNG (Hi-Res)', icon: <Image className="w-4 h-4" /> },
    ],
  },
  {
    id: 'presentation_assets',
    label: 'Presentation Assets',
    description: 'Slide-ready figures and summary tables for viva presentation',
    icon: <Presentation className="w-5 h-5" />,
    formats: [
      { id: 'png', label: 'PNG', icon: <Image className="w-4 h-4" /> },
      { id: 'pdf', label: 'PDF Summary', icon: <FileText className="w-4 h-4" /> },
    ],
  },
];

const REPORT_SECTIONS = [
  { id: 'includeDatasetSummary', label: 'Dataset Summary & Distribution Analysis' },
  { id: 'includeGAResults', label: 'GA Feature Selection Results & Convergence' },
  { id: 'includeMetrics', label: 'Evaluation Metrics (All 15 Configurations)' },
  { id: 'includeROC', label: 'ROC Curves & Precision-Recall Analysis' },
  { id: 'includeConfusionMatrices', label: 'Confusion Matrices (15 Experiment Grid)' },
  { id: 'includeFeatureImportance', label: 'Feature Importance & Attribution Analysis' },
  { id: 'includePaperComparison', label: 'Reference Paper Comparison (Ileberi 2022)' },
];

export const ExportCenterPage: React.FC<ExportCenterPageProps> = ({ onNavigate }) => {
  const [checkedSections, setCheckedSections] = useState<Set<string>>(new Set(['includeDatasetSummary', 'includeMetrics']));
  const [reportFormat, setReportFormat] = useState<'pdf' | 'html' | 'markdown'>('pdf');

  const toggleSection = (id: string) => {
    setCheckedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.15)] shrink-0">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                RESEARCH ARTIFACTS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Export Center</h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              Download experiment outputs, predictions, metrics and visualizations. All exports are generated from verified backend results and will activate when the Python ML pipeline is connected.
            </p>
          </div>
        </div>
      </div>

      {/* Backend Availability Notice */}
      <ResearchCallout
        variant="future-backend"
        title="Backend Connection Required"
        badgeText="Awaiting Python API"
      >
        All export actions are connected to the Python FastAPI backend serving verified evaluation results. Export buttons are currently inactive. Once the backend is running and the ML pipeline has completed evaluation on the 20% holdout test set, all downloads will be available with a single click.
      </ResearchCallout>

      {/* Export Category Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Export Categories</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {EXPORT_CATEGORIES.map((category) => (
            <div key={category.id} className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col justify-between glass-panel-hover">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    {category.icon}
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{category.label}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{category.description}</p>
              </div>

              <div className="space-y-1.5">
                {category.formats.map((fmt) => (
                  <button
                    key={fmt.id}
                    disabled
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-500 cursor-not-allowed opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{fmt.icon}</span>
                      <span>{fmt.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px] font-mono">Pending</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full PDF/Report Export section */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Research Report Builder</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Consolidated Export
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Checkboxes */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs text-slate-400 mb-4">
              Select which sections to include in the consolidated research report.
            </p>
            <div className="space-y-2">
              {REPORT_SECTIONS.map((section) => {
                const checked = checkedSections.has(section.id);
                return (
                  <div
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      checked
                        ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="text-xs font-medium">{section.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Config & Generate */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Report Format</label>
              <div className="space-y-1.5">
                {(['pdf', 'html', 'markdown'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setReportFormat(fmt)}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-all border ${
                      reportFormat === fmt
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {fmt.toUpperCase()} {fmt === 'pdf' ? '(Recommended)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 mb-3 font-mono">
                <div className="flex justify-between mb-1">
                  <span>Sections Selected:</span>
                  <span className="text-cyan-400">{checkedSections.size} / {REPORT_SECTIONS.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-white uppercase">{reportFormat}</span>
                </div>
              </div>

              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-500 cursor-not-allowed opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>Generate Report</span>
                <span className="text-[10px] font-mono text-slate-600">(Pending Backend)</span>
              </button>

              <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
                Report generation requires backend ML results
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => onNavigate('research-results')}
                className="w-full text-xs text-cyan-400 hover:text-cyan-300 py-2 flex items-center justify-center gap-2 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>View Research Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Files Preview */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Expected Backend Artifacts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {[
            'predictions_all_15models.csv',
            'evaluation_metrics_15models.csv',
            'ga_selected_features.json',
            'confusion_matrices_15models.json',
            'roc_curves_5classifiers.json',
            'ga_convergence_history.json',
            'feature_importance_rf.csv',
            'research_report.pdf',
          ].map((artifact) => (
            <div key={artifact} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-slate-400">
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate text-[11px]">{artifact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
