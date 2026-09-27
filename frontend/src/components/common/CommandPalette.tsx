import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  Dna,
  FlaskConical,
  Database,
  Layers,
  BarChart3,
  ShieldCheck,
  Zap,
  BookOpen,
  HelpCircle,
  Download,
  Presentation,
  Info,
  ArrowRight,
} from 'lucide-react';
import { PageId } from '../../types';

interface SearchItem {
  id: string;
  title: string;
  category: 'Page' | 'Model' | 'Feature' | 'Vector' | 'Metric';
  description: string;
  pageId: PageId;
  icon: React.ReactNode;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Pages
  { id: 'p-dashboard', title: 'Dashboard', category: 'Page', description: 'Platform overview, KPIs & system pipeline', pageId: 'dashboard', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-dataset', title: 'Dataset Intelligence', category: 'Page', description: '284,807 transactions & 30 feature schema', pageId: 'dataset', icon: <Database className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-preprocessing', title: 'Data Preprocessing', category: 'Page', description: '80/20 stratified split, MinMax & SMOTE', pageId: 'preprocessing', icon: <Layers className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-ga', title: 'Genetic Algorithm Lab', category: 'Page', description: '30-bit chromosome evolution & fitness', pageId: 'genetic-algorithm', icon: <Dna className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-integrity', title: 'Pipeline Integrity', category: 'Page', description: 'Zero test-leakage compliance audits', pageId: 'pipeline-integrity', icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-models', title: 'Model Laboratory', category: 'Page', description: '5 classifiers × 3 feature subsets matrix', pageId: 'model-laboratory', icon: <FlaskConical className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-comparison', title: 'Comparative Analysis', category: 'Page', description: 'Full vs GA vs Random features benchmark', pageId: 'comparative-analysis', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-fraud-hub', title: 'Fraud Detection Hub', category: 'Page', description: 'Single and batch inference landing page', pageId: 'fraud-detection', icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-single', title: 'Single Transaction Detection', category: 'Page', description: 'Evaluate continuous 30-feature vector', pageId: 'single-transaction', icon: <Zap className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-batch', title: 'Batch CSV Detection', category: 'Page', description: 'Drag-and-drop CSV dataset scoring', pageId: 'batch-detection', icon: <FileText className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-explainability', title: 'Model Explainability (XAI)', category: 'Page', description: 'Local and global feature attribution & SHAP', pageId: 'explainability', icon: <HelpCircle className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-results', title: 'Research Results', category: 'Page', description: 'Experimental findings, ROC & matrices', pageId: 'research-results', icon: <FileText className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-paper-ref', title: 'Reference Paper (Ileberi 2022)', category: 'Page', description: 'Published methodology and reference tables', pageId: 'paper-reference', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-export', title: 'Export Center', category: 'Page', description: 'Download predictions, metrics, PDF report', pageId: 'export-center', icon: <Download className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-about', title: 'About CREDITGUARD', category: 'Page', description: 'Project overview, architecture & stack', pageId: 'about-project', icon: <Info className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-presentation', title: 'Presentation Mode', category: 'Page', description: 'Guided 10-step slides & viva speaker notes', pageId: 'presentation-mode', icon: <Presentation className="w-4 h-4 text-cyan-400" /> },

  // Models
  { id: 'm-rf', title: 'Random Forest Classifier', category: 'Model', description: '100 ensemble trees with bootstrap bagging', pageId: 'model-laboratory', icon: <FlaskConical className="w-4 h-4 text-emerald-400" /> },
  { id: 'm-dt', title: 'Decision Tree Classifier', category: 'Model', description: 'CART rule-based orthogonal partitioner', pageId: 'model-laboratory', icon: <FlaskConical className="w-4 h-4 text-emerald-400" /> },
  { id: 'm-lr', title: 'Logistic Regression', category: 'Model', description: 'L2 regularized log-odds estimator', pageId: 'model-laboratory', icon: <FlaskConical className="w-4 h-4 text-emerald-400" /> },
  { id: 'm-ann', title: 'Artificial Neural Network (MLP)', category: 'Model', description: '64x32 feed-forward neural architecture', pageId: 'model-laboratory', icon: <FlaskConical className="w-4 h-4 text-emerald-400" /> },
  { id: 'm-nb', title: 'Gaussian Naive Bayes', category: 'Model', description: 'Bayesian posterior with Gaussian assumptions', pageId: 'model-laboratory', icon: <FlaskConical className="w-4 h-4 text-emerald-400" /> },

  // GA Vectors & Features
  { id: 'v-v1', title: 'Vector 1 (22 Features)', category: 'Vector', description: 'Published reference chromosome 1', pageId: 'paper-reference', icon: <Dna className="w-4 h-4 text-indigo-400" /> },
  { id: 'v-v5', title: 'Vector 5 (13 Features - Optimal)', category: 'Vector', description: 'Published reference best chromosome (93.47% F1)', pageId: 'paper-reference', icon: <Dna className="w-4 h-4 text-indigo-400" /> },
  { id: 'f-v14', title: 'Feature V14 (High Discriminative)', category: 'Feature', description: 'Top negative correlation PCA component with fraud', pageId: 'dataset', icon: <Database className="w-4 h-4 text-amber-400" /> },
  { id: 'f-amount', title: 'Feature Amount', category: 'Feature', description: 'Continuous monetary value scaled with MinMax', pageId: 'preprocessing', icon: <Database className="w-4 h-4 text-amber-400" /> },

  // Metrics
  { id: 'met-f1', title: 'F1-Score Metric', category: 'Metric', description: 'Harmonic mean of Precision and Recall for imbalanced data', pageId: 'evaluation', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
  { id: 'met-roc', title: 'ROC-AUC & PR-AUC', category: 'Metric', description: 'Area under Receiver Operating Characteristic curve', pageId: 'roc-auc', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: PageId) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = SEARCH_DATABASE.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: SearchItem) => {
    onNavigate(item.pageId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0A0F1E] border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-slate-900/80">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, models, features, GA vectors, metrics... (Ctrl+K)"
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching modules or research concepts found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-white shadow-[0_0_12px_rgba(0,242,254,0.1)]'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-opacity ${
                      isSelected ? 'text-cyan-400 opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-white/10 bg-[#070B14] flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd> Close
            </span>
          </div>
          <span className="text-cyan-400">CREDITGUARD Research Navigator</span>
        </div>
      </div>
    </div>
  );
};
