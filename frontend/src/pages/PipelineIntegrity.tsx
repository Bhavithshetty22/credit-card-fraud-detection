import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Dna,
  GitBranch,
  Info,
  Terminal,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockIntegrityChecks, mockPipelineIntegrityStatus } from '../api/pipelineApi';
import { PageId } from '../types';

interface PipelineIntegrityProps {
  onNavigate?: (page: PageId) => void;
}

export const PipelineIntegrityPage: React.FC<PipelineIntegrityProps> = ({ onNavigate }) => {
  const [expandedCheck, setExpandedCheck] = useState<string | null>('CHECK 01');

  const toggleExpand = (checkNumber: string) => {
    setExpandedCheck(expandedCheck === checkNumber ? null : checkNumber);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                SECURITY & AUDIT ASSURANCE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Pipeline Integrity
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Verify that the experimental workflow preserves a strict separation between training and evaluation data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>7/7 Architecture Checks Passed</span>
            </span>
          </div>
        </div>
      </div>

      {/* CENTRAL INTEGRITY STATUS PANEL (No fabricated % score) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900/80 to-slate-900/80 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                PIPELINE STATUS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
                READY FOR EVALUATION
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                All structural data boundary safeguards are verified. Scaler, SMOTE, and GA feature selection operate within strict leak-free partitions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">✓ PASS</span>
                <span className="text-slate-500">|</span>
                <span>Architecture</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-bold">⚠ PENDING BACKEND</span>
                <span className="text-slate-500">|</span>
                <span>Runtime API</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKLIST: 7 AUDIT CARDS */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              Pipeline Isolation Checklist
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Methodological verification points guaranteeing statistical isolation across experimental partitions.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            7 Verified Checks
          </span>
        </div>

        <div className="space-y-3">
          {mockIntegrityChecks.map((chk) => {
            const isExpanded = expandedCheck === chk.checkNumber;
            return (
              <div
                key={chk.checkNumber}
                className="rounded-xl bg-slate-900/70 border border-white/5 hover:border-white/15 transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(chk.checkNumber)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {chk.checkNumber}
                        </span>
                        <span className="text-sm font-bold text-white font-sans">
                          {chk.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {chk.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                      {chk.statusText}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-slate-950/60 font-sans text-xs space-y-2">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <p><strong className="text-white">Methodology Detail:</strong> {chk.methodologyNote}</p>
                    </div>
                    {chk.verifiedArtifact && (
                      <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] pl-6">
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        <span>Verified Artifact: <code className="text-cyan-300">{chk.verifiedArtifact}</code></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ARCHITECTURE DIAGRAM (Colored Flows & Protected Boundary) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              Zero-Leakage Architecture Diagram
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visual dataflow mapping showing split isolation, training transformations, and holdout evaluation protection.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Training Flow</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span>Protected Test Flow</span>
            </span>
          </div>
        </div>

        {/* Structured Flow Chart */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-6">
          {/* Top Ingestion Flow */}
          <div className="text-center max-w-sm mx-auto">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 font-mono font-bold text-xs text-white">
              RAW DATA (creditcard.csv)
            </div>
            <div className="text-slate-500 my-2">↓</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 font-mono font-bold text-xs text-slate-200">
              DATA CLEANING & DEDUPLICATION
            </div>
            <div className="text-slate-500 my-2">↓</div>
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 font-mono font-bold text-xs text-indigo-300">
              STRATIFIED SPLIT (80% / 20%)
            </div>
          </div>

          {/* Split Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed border-white/10 relative">
            {/* Left: Training Flow */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-cyan-300 border-b border-cyan-500/20 pb-2">
                <span>TRAINING PARTITION (80%)</span>
                <span>227,845 records</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center text-slate-200">
                  MIN-MAX SCALER FIT
                </div>
                <div className="text-center text-cyan-400">↓</div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-center text-cyan-300 font-bold">
                  GA FEATURE SELECTION (Internal Sub-Split)
                </div>
                <div className="text-center text-cyan-400">↓</div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center text-slate-200">
                  SMOTE SYNTHETIC RESAMPLING
                </div>
                <div className="text-center text-cyan-400">↓</div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center text-slate-200">
                  MODEL TRAINING (5 CLASSIFIERS)
                </div>
                <div className="text-center text-cyan-400">↓</div>
                <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-center text-cyan-200 font-bold">
                  TRAINED MODEL ARTIFACTS (.joblib)
                </div>
              </div>
            </div>

            {/* Right: Testing Flow */}
            <div className="p-5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs font-bold text-rose-400 border-b border-rose-500/20 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>TESTING PARTITION (20%)</span>
                  </span>
                  <span className="text-rose-300/80">56,962 records</span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 space-y-2 leading-relaxed font-sans">
                  <p className="font-semibold text-rose-300">Protected Boundary Rules:</p>
                  <p>• Zero SMOTE synthetic records introduced</p>
                  <p>• Zero GA chromosome fitness feedback</p>
                  <p>• Transformed purely using pre-fitted X_train scaler</p>
                  <p>• Retains authentic 0.172% fraud incidence rate</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="text-center text-rose-400">↓</div>
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-center text-rose-200 font-bold">
                  FINAL HOLDOUT TEST EVALUATION
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METHODOLOGY RESEARCH NOTE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
            Reference Methodology
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            The reference study applies min-max normalization, GA-based feature selection and five machine learning classifiers. Our implementation additionally enforces a strict train-only preprocessing and GA workflow to prevent test-set leakage.
          </p>
        </div>
      </div>
    </div>
  );
};
