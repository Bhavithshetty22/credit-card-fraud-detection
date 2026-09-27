import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  Maximize2,
  Minimize2,
  StickyNote,
  ListChecks,
  ArrowRight,
  Sparkles,
  Dna,
  BookOpen,
  X,
  ChevronDown,
} from 'lucide-react';
import { PageId } from '../types';
import { PRESENTATION_STEPS, DEMO_CHECKLIST_ITEMS } from '../api/presentationApi';
import { ResearchCallout } from '../components/common/ResearchCallout';

interface PresentationModePageProps {
  onNavigate: (page: PageId) => void;
}

const STEP_PAGE_MAP: Record<string, PageId> = {
  introduction: 'dashboard',
  dataset: 'dataset',
  preprocessing: 'preprocessing',
  'ga-lab': 'genetic-algorithm',
  models: 'model-laboratory',
  'comparative-analysis': 'comparative-analysis',
  'fraud-detection': 'fraud-detection',
  explainability: 'explainability',
  'results-export': 'research-results',
  conclusion: 'about-project',
};

const TIMELINE_NODES = [
  { label: 'Problem', icon: <Shield className="w-3 h-3" /> },
  { label: 'Dataset', icon: <Dna className="w-3 h-3" /> },
  { label: 'GA', icon: <Dna className="w-3 h-3" /> },
  { label: 'Models', icon: <Sparkles className="w-3 h-3" /> },
  { label: 'Eval', icon: <Sparkles className="w-3 h-3" /> },
  { label: 'Detection', icon: <Shield className="w-3 h-3" /> },
  { label: 'XAI', icon: <BookOpen className="w-3 h-3" /> },
  { label: 'Results', icon: <BookOpen className="w-3 h-3" /> },
  { label: 'Future', icon: <ArrowRight className="w-3 h-3" /> },
];

export const PresentationModePage: React.FC<PresentationModePageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showChecklist, setShowChecklist] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [speakerNotes, setSpeakerNotes] = useState<Record<number, string>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const step = PRESENTATION_STEPS[currentStep];

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Keyboard navigation
  const goNext = useCallback(() => {
    setCurrentStep((p) => Math.min(p + 1, PRESENTATION_STEPS.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStep((p) => Math.max(p - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape' && focusMode) setFocusMode(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, focusMode]);

  const progress = ((currentStep + 1) / PRESENTATION_STEPS.length) * 100;
  const currentNotes = speakerNotes[currentStep] ?? step.defaultSpeakerNotes.whatToExplain;

  return (
    <div className={`space-y-6 animate-in fade-in duration-300 ${focusMode ? 'fixed inset-0 z-50 bg-[#070B14] p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className={`glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden ${focusMode ? 'mb-4' : ''}`}>
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)] shrink-0">
              <Presentation className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                  VIVA MODE
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Slide {currentStep + 1} / {PRESENTATION_STEPS.length}
                </span>
              </div>
              <h1 className={`font-bold text-white tracking-tight ${focusMode ? 'text-3xl' : 'text-2xl'}`}>
                Presentation Mode
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
                Guided demonstration experience for academic presentation. Use ← → arrow keys to navigate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-sm text-white">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <button
              onClick={() => setTimerRunning((p) => !p)}
              className={`p-2 rounded-lg border text-xs transition-all ${timerRunning ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'}`}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setFocusMode((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                focusMode
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
              }`}
            >
              {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{focusMode ? 'Exit Focus' : 'Enter Presentation Mode'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Presentation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Steps Sidebar */}
        <div className={`${focusMode ? 'hidden' : 'lg:col-span-1'} glass-panel rounded-xl p-4 border border-white/10 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase mb-3 px-1">Slide Navigator</div>
          {PRESENTATION_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                currentStep === idx
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                  currentStep === idx
                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                    : idx < currentStep
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </span>
                <span className="truncate">{s.title.split(' ').slice(0, 3).join(' ')}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 ml-7 font-mono">{s.category}</div>
            </button>
          ))}
        </div>

        {/* Main Slide Area */}
        <div className={`${focusMode ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-4`}>
          {/* Slide Content Card */}
          <div className={`glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/20 bg-indigo-950/10 relative overflow-hidden ${focusMode ? 'min-h-[50vh]' : ''}`}>
            <div className="absolute -right-12 -bottom-12 w-52 h-52 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                      {step.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Slide {currentStep + 1} of {PRESENTATION_STEPS.length}</span>
                  </div>
                  <h2 className={`font-bold text-white tracking-tight leading-snug ${focusMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                    {step.title}
                  </h2>
                  <p className={`text-slate-300 mt-1.5 leading-relaxed ${focusMode ? 'text-base' : 'text-sm'}`}>
                    {step.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Research Points */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Key Research Points</span>
                  </div>
                  {step.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <p className={`text-slate-300 leading-relaxed ${focusMode ? 'text-sm' : 'text-xs'}`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Viva Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs mb-3">
                    <ListChecks className="w-3.5 h-3.5 text-amber-400" />
                    <span>Viva Defense Checklist</span>
                  </div>
                  {step.vivaChecklist.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <p className={`text-slate-300 leading-relaxed ${focusMode ? 'text-sm' : 'text-xs'}`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigate to Module */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <button
                  onClick={() => onNavigate(STEP_PAGE_MAP[step.slug] ?? 'dashboard')}
                  className="text-xs text-indigo-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Open this module live in the platform →
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {PRESENTATION_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`transition-all duration-200 rounded-full ${
                    currentStep === idx
                      ? 'w-6 h-2 bg-indigo-400'
                      : idx < currentStep
                      ? 'w-2 h-2 bg-emerald-500/60'
                      : 'w-2 h-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={currentStep === PRESENTATION_STEPS.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-xs font-medium text-indigo-200 hover:bg-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Speaker Notes Panel */}
          <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowNotes((p) => !p)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <StickyNote className="w-4 h-4 text-amber-400" />
                <span>Speaker Notes</span>
                <span className="text-[10px] font-mono text-slate-400 ml-1">— Slide {currentStep + 1}: {step.title.split(' ').slice(0, 3).join(' ')}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showNotes ? 'rotate-180' : ''}`} />
            </button>

            {showNotes && (
              <div className="p-4 border-t border-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase mb-2">What to Explain</div>
                    <p className="leading-relaxed">{step.defaultSpeakerNotes.whatToExplain}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase mb-2">Research Contribution</div>
                    <p className="leading-relaxed">{step.defaultSpeakerNotes.researchContribution}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-rose-400 uppercase mb-2">Viva Defense Tips</div>
                    <p className="leading-relaxed">{step.defaultSpeakerNotes.vivaDefenseTips}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-indigo-400 uppercase mb-2">Backend Integration Note</div>
                    <p className="leading-relaxed">{step.defaultSpeakerNotes.backendIntegrationNote}</p>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Custom Notes</div>
                  <textarea
                    value={speakerNotes[currentStep] ?? ''}
                    onChange={(e) =>
                      setSpeakerNotes((prev) => ({ ...prev, [currentStep]: e.target.value }))
                    }
                    placeholder="Add your own notes for this slide..."
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none h-20 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Demo Checklist */}
          <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowChecklist((p) => !p)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                <span>Live Demo Readiness Checklist</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showChecklist ? 'rotate-180' : ''}`} />
            </button>

            {showChecklist && (
              <div className="p-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_CHECKLIST_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.stage}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 text-right shrink-0">
                      {item.statusText}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animated Timeline */}
      <div className="glass-panel rounded-xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400 uppercase">
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Research Journey Timeline</span>
        </div>
        <div className="flex items-center overflow-x-auto gap-0 pb-2">
          {TIMELINE_NODES.map((node, idx) => (
            <div key={idx} className="flex items-center shrink-0">
              <div
                onClick={() => setCurrentStep(Math.min(idx, PRESENTATION_STEPS.length - 1))}
                className={`flex flex-col items-center gap-1 cursor-pointer group px-2`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  idx < currentStep
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                    : idx === currentStep
                    ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110'
                    : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-slate-500'
                }`}>
                  {node.icon}
                </div>
                <span className={`text-[9px] font-mono text-center whitespace-nowrap ${
                  idx === currentStep ? 'text-indigo-300 font-bold' : 'text-slate-500'
                }`}>
                  {node.label}
                </span>
              </div>
              {idx < TIMELINE_NODES.length - 1 && (
                <div className={`w-8 h-px transition-colors duration-500 ${idx < currentStep ? 'bg-emerald-500/60' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion Card (only on last step) */}
      {currentStep === PRESENTATION_STEPS.length - 1 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/30 bg-indigo-950/15 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative text-center space-y-4">
            <Shield className="w-12 h-12 text-cyan-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Research Summary</h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto">
              CREDITGUARD demonstrates a complete, zero-leakage Genetic Algorithm optimized credit card fraud detection framework with comprehensive experimental benchmarking across 15 model configurations.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-4">
              {[
                { title: 'Research Objective', desc: 'GA-powered dimensionality reduction for fraud detection' },
                { title: 'GA Contribution', desc: 'Evolutionary feature selection outperforms random baselines' },
                { title: 'Experimental Framework', desc: '15 configurations across 5 classifiers × 3 feature sets' },
                { title: 'Detection Pipeline', desc: 'Single & batch inference engine, API-ready' },
                { title: 'XAI Integration', desc: 'SHAP/TreeExplainer architecture prepared' },
                { title: 'Future Directions', desc: 'FastAPI backend integration, streaming GA, graph neural networks' },
              ].map((card) => (
                <div key={card.title} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-left">
                  <div className="text-xs font-bold text-white mb-1">{card.title}</div>
                  <div className="text-[11px] text-slate-400">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
