import React, { useState } from 'react';
import {
  Layers,
  Database,
  Sparkles,
  Split,
  SlidersHorizontal,
  Lock,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Cpu,
  Info,
  GitCommit,
  GitBranch,
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { mockPreprocessingSteps, mockSplitMetrics, mockScalingConfig, mockSmoteConfig } from '../api/preprocessingApi';
import { PreprocessingStepId } from '../types/preprocessing';
import { PageId } from '../types';

interface PreprocessingProps {
  onNavigate?: (page: PageId) => void;
}

export const PreprocessingPage: React.FC<PreprocessingProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<PreprocessingStepId>('split');

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
                RESEARCH PIPELINE PREPARATION
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Data Preprocessing
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Transform raw transaction data into a clean, normalized training representation while strictly enforcing zero test-set data leakage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Leakage Protocol Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* PREPROCESSING PIPELINE STEPPER */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
            Preprocessing Pipeline Stepper
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Click any stage to inspect transformation details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {mockPreprocessingSteps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900/90 border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.15)] ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {step.stepNumber}
                    </span>
                    <StatusBadge status={step.status} variant={isActive ? 'cyan' : 'emerald'} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {step.title}
                  </h4>
                  <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 mt-3 line-clamp-2">
                  {step.shortDescription}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED ACTIVE STAGE PANEL */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        {/* STAGE 01 — DATA INGESTION */}
        {activeStep === 'ingestion' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Stage 01
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Data Ingestion</h3>
              </div>
              <StatusBadge status="Ready" variant="emerald" />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              The raw transaction dataset is loaded and its schema is inspected before model development.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Input File</span>
                <p className="text-sm font-bold text-white mt-1 font-mono">creditcard.csv</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Records</span>
                <p className="text-sm font-bold text-white mt-1 font-mono">284,807 rows</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Input Features</span>
                <p className="text-sm font-bold text-white mt-1 font-mono">30 continuous variables</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Target Variable</span>
                <p className="text-sm font-bold text-cyan-300 mt-1 font-mono">Class (0 = Legitimate, 1 = Fraud)</p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 02 — DATA CLEANING */}
        {activeStep === 'cleaning' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Stage 02
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Data Cleaning</h3>
              </div>
              <StatusBadge status="Ready" variant="emerald" />
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
              <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase">Cleaning Objective</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Ensure the dataset conforms to the expected transaction schema before downstream processing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/70 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">Duplicate Detection</h4>
                    <StatusBadge status="Ready" variant="emerald" size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Scans complete transaction rows for duplicate telemetry records.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-4 pt-2 border-t border-white/5">
                  Handled in src/data_preprocessing.py
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/70 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">Missing Value Check</h4>
                    <StatusBadge status="Ready" variant="emerald" size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Validates null/NaN absence across all 30 numerical dimensions.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-4 pt-2 border-t border-white/5">
                  0 Nulls expected
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/70 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">Schema Validation</h4>
                    <StatusBadge status="Ready" variant="emerald" size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Verifies 64-bit floating point precision on input features.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-4 pt-2 border-t border-white/5">
                  Strict schema mapping
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 03 — TRAIN / TEST SPLIT */}
        {activeStep === 'split' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Stage 03
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Train / Test Split</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-full">
                  Stratified Split
                </span>
                <StatusBadge status="Ready" variant="emerald" />
              </div>
            </div>

            {/* Visual Split Tree */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="text-center max-w-xs mx-auto mb-6">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Input Dataset</span>
                <div className="p-3 rounded-xl bg-slate-800 border border-white/10 text-white font-mono font-bold text-base mt-1">
                  TOTAL DATASET: 284,807
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <ArrowDown className="w-5 h-5 text-cyan-400 animate-bounce" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Training Set 80% */}
                <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-cyan-300">TRAINING SET (80%)</span>
                      <span className="text-[10px] font-mono text-slate-400">227,845 records</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Used for fitting the MinMaxScaler, running GA feature selection, and applying SMOTE resampling.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                    <span>Includes ~394 Fraud Instances</span>
                    <span>Resampling Permitted</span>
                  </div>
                </div>

                {/* Held-Out Test Set 20% (LOCKED) */}
                <div className="p-5 rounded-xl bg-slate-950 border border-rose-500/40 relative overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-mono font-bold text-rose-400">TEST SET LOCKED (20%)</span>
                    </div>
                    <p className="text-xs text-rose-200 leading-relaxed">
                      The held-out test set must remain untouched by SMOTE and feature-selection optimization.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] font-mono text-rose-300">
                    <span>56,962 records (98 Frauds)</span>
                    <span className="font-bold text-rose-400">100% UNTOUCHED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 04 — MIN-MAX SCALING */}
        {activeStep === 'scaling' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Stage 04
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Min-Max Scaling</h3>
              </div>
              <StatusBadge status="Ready" variant="emerald" />
            </div>

            {/* Formula Card */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Mathematical Formulation</span>
                <div className="text-base sm:text-lg font-mono font-bold text-cyan-300 mt-1">
                  x_scaled = (x - x_min) / (x_max - x_min)
                </div>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                <div>Fitted On: <strong className="text-white">Training data only</strong></div>
                <div>Applied To: <strong className="text-cyan-300">Training + Test data</strong></div>
              </div>
            </div>

            {/* Leakage Prevention Callout */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider font-mono">
                  Leakage Prevention
                </h4>
                <p className="text-xs text-emerald-300/80 mt-1 leading-relaxed">
                  The scaler is fitted only on the training partition. The test partition is transformed using the already-fitted scaler.
                </p>
              </div>
            </div>

            {/* Before / After Mock Visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">Before: Raw Feature Value Distribution</span>
                <div className="h-20 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs border border-white/5">
                  [Time: 0–172792s | Amount: €0.00–€25,691.16 | V1–V28: (-56.40, 2.13)]
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-2 block">Unbounded continuous scales</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-2">After: Normalized 0–1 Representation</span>
                <div className="h-20 rounded-lg bg-cyan-950/20 flex items-center justify-center text-cyan-300 font-mono text-xs border border-cyan-500/30">
                  Normalized bounds strictly bounded to [0.0, 1.0]
                </div>
                <span className="text-[9px] font-mono text-cyan-400/80 mt-2 block">Scaler persisted in models/scaler.joblib</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 05 — SMOTE BALANCING */}
        {activeStep === 'smote' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Stage 05
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Training Data Balancing</h3>
              </div>
              <StatusBadge status="Ready" variant="emerald" />
            </div>

            {/* Before vs After SMOTE Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900/70 border border-white/5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Before SMOTE</span>
                <span className="text-[10px] font-mono text-slate-500 block mb-3">(Example training distribution)</span>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300">Legitimate (Class 0)</span>
                      <span className="text-white font-bold">~227k (99.8%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-rose-400">Fraud (Class 1)</span>
                      <span className="text-rose-400 font-bold">~394 (0.17%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-400 w-[1%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/70 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,254,0.08)]">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">After SMOTE</span>
                <span className="text-[10px] font-mono text-slate-500 block mb-3">(Example training distribution)</span>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300">Legitimate (Class 0)</span>
                      <span className="text-white font-bold">~227k (50.0%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-rose-300">Fraud (Class 1 Balanced)</span>
                      <span className="text-cyan-400 font-bold">~227k (50.0%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-rose-400 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SMOTE Mechanism Explanatory Graphic */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10">
              <span className="text-xs font-mono font-bold text-white uppercase block mb-4">
                SMOTE Generation Mechanism
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-center">
                  <span className="text-xs font-mono font-bold text-rose-400">01. Minority Samples</span>
                  <p className="text-[10px] text-slate-400 mt-1">Identifies fraud instances in scaled feature space</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-center">
                  <span className="text-xs font-mono font-bold text-cyan-400">02. Nearest Neighbors</span>
                  <p className="text-[10px] text-slate-400 mt-1">Calculates k-nearest fraud neighbors (k=5)</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-center">
                  <span className="text-xs font-mono font-bold text-indigo-400">03. Synthetic Samples</span>
                  <p className="text-[10px] text-slate-400 mt-1">Interpolates along vector segments connecting points</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-center">
                  <span className="text-xs font-mono font-bold text-emerald-400">04. Balanced Training Set</span>
                  <p className="text-[10px] text-slate-400 mt-1">Yields 1:1 class ratio for un-biased ML updates</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                SMOTE generates synthetic minority-class observations in feature space to address severe class imbalance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LEAKAGE BOUNDARY - PROMINENT SECTION */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white font-sans">
                Data Leakage Boundary
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              The test set is isolated from feature selection, resampling and model fitting.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Zero Contamination Guarantee
          </span>
        </div>

        {/* Visual Boundary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          {/* Vertical dashed divider on large screens */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px border-r-2 border-dashed border-cyan-500/30 -ml-px z-10" />

          {/* LEFT: TRAINING FLOW */}
          <div className="space-y-4 p-5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span>TRAINING DATA (80%)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">227,845 records</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span>01. MinMaxScaler Fitting</span>
                <span className="text-emerald-400 font-bold">Fit on X_train ONLY</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span>02. GA Validation Partition</span>
                <span className="text-cyan-400 font-bold">Sub-split before SMOTE</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span>03. SMOTE Resampling</span>
                <span className="text-emerald-400 font-bold">Applied to X_train only</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span>04. 15 ML Models Training</span>
                <span className="text-cyan-400 font-bold">RF · DT · LR · ANN · NB</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-center font-mono font-bold text-cyan-300 text-xs mt-3">
              TRAINED MODEL ARTIFACTS (.joblib)
            </div>
          </div>

          {/* RIGHT: TEST FLOW (ISOLATED) */}
          <div className="space-y-4 p-5 rounded-xl bg-slate-950/80 border border-rose-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono font-bold text-rose-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>TEST DATA LOCKED (20%)</span>
              </span>
              <span className="text-[10px] font-mono text-rose-300/80">56,962 records</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/20 flex items-center justify-between text-slate-300">
                <span>01. Scaler Transformation</span>
                <span className="text-cyan-300 font-bold">Transform using X_train params</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/20 flex items-center justify-between text-slate-300">
                <span>02. SMOTE Applied?</span>
                <span className="text-rose-400 font-bold">NO SMOTE (Strictly Forbidden)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/20 flex items-center justify-between text-slate-300">
                <span>03. GA Feature Masking</span>
                <span className="text-rose-400 font-bold">NO GA FIT (Passive Mask Only)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/20 flex items-center justify-between text-slate-300">
                <span>04. Final Metric Scoring</span>
                <span className="text-emerald-400 font-bold">Pure Holdout Test Evaluation</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-center font-mono font-bold text-rose-300 text-xs mt-3">
              UNCONTAMINATED FINAL METRICS (F1, AUC, Recall)
            </div>
          </div>
        </div>
      </div>

      {/* RESEARCH PAPER ARCHITECTURE CONNECTION */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="mb-6">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            METHODOLOGY COMPARISON
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Connection to Reference Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Systematic contrast between the published reference paper pipeline and our extended zero-leakage research implementation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paper Architecture */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Reference Paper Pipeline</span>
            </h4>

            <div className="space-y-2 font-mono text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center">Normalize Inputs</div>
              <div className="text-center text-slate-500">↓</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center">GA Feature Selection</div>
              <div className="text-center text-slate-500">↓</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center">Training (5 Classifiers)</div>
              <div className="text-center text-slate-500">↓</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center">Trained Model</div>
              <div className="text-center text-slate-500">↓</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 text-center">Fraud Detection</div>
            </div>
          </div>

          {/* Our Extended Implementation */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-900/80 border border-cyan-500/30">
            <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Our Extended Implementation</span>
            </h4>

            <div className="space-y-2 font-mono text-xs text-slate-200">
              <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-center">Data Cleaning & Deduplication</div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-center">Stratified 80/20 Train/Test Split</div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-center">Train-Only Scaling (X_train fit)</div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/30 text-center font-bold text-cyan-300">
                Leak-Free GA Feature Selection (Sub-split validation)
              </div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-center">Train-Only SMOTE Resampling</div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-center">5 × 3 Model Matrix (15 Configurations)</div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-white/5 text-center">Holdout Test Evaluation & ROC-AUC</div>
              <div className="text-center text-cyan-400">↓</div>
              <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 text-center text-emerald-300 font-bold">
                Fraud Detection Engine
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
