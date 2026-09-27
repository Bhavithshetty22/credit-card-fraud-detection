import React, { useState, useMemo } from 'react';
import {
  Dna,
  Sliders,
  Users,
  Activity,
  Trophy,
  GitMerge,
  Sparkles,
  TrendingUp,
  Binary,
  Layers,
  Search,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock,
  ArrowDown,
  Clock,
  BookOpen,
  Scale,
  GitCompare,
  HelpCircle,
  BarChart2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  mockGAConfig,
  mockGACycleStages,
  mockIllustrativeGenes,
  mockPopulationCandidates,
  mockConvergenceHistory,
  mockReferenceVectors,
} from '../api/gaApi';
import { ChromosomeGene, ReferenceFeatureVector } from '../types/ga';
import { PageId } from '../types';

interface GeneticAlgorithmProps {
  onNavigate?: (page: PageId) => void;
}

const cycleIcons: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5 text-indigo-400" />,
  Activity: <Activity className="w-5 h-5 text-cyan-400" />,
  Trophy: <Trophy className="w-5 h-5 text-amber-400" />,
  GitMerge: <GitMerge className="w-5 h-5 text-emerald-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-rose-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-blue-400" />,
};

export const GeneticAlgorithmPage: React.FC<GeneticAlgorithmProps> = ({ onNavigate }) => {
  // Selected gene for interactive inspection
  const [selectedGeneIndex, setSelectedGeneIndex] = useState<number>(14); // Default V14
  const [populationFilter, setPopulationFilter] = useState<'All' | 'Selected' | 'Elite' | 'Candidate'>('All');
  const [selectedRefVectorId, setSelectedRefVectorId] = useState<string>('v1');
  const [featureSearchTerm, setFeatureSearchTerm] = useState<string>('');

  const selectedGene = useMemo(() => {
    return mockIllustrativeGenes.find((g) => g.index === selectedGeneIndex) || mockIllustrativeGenes[0];
  }, [selectedGeneIndex]);

  const filteredPopulation = useMemo(() => {
    if (populationFilter === 'All') return mockPopulationCandidates;
    return mockPopulationCandidates.filter((c) => c.status === populationFilter);
  }, [populationFilter]);

  const activeRefVector = useMemo(() => {
    return mockReferenceVectors.find((v) => v.id === selectedRefVectorId) || mockReferenceVectors[0];
  }, [selectedRefVectorId]);

  const filteredGenesTable = useMemo(() => {
    return mockIllustrativeGenes.filter((g) =>
      g.featureName.toLowerCase().includes(featureSearchTerm.toLowerCase()) ||
      g.role.toLowerCase().includes(featureSearchTerm.toLowerCase())
    );
  }, [featureSearchTerm]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                FEATURE SELECTION ENGINE
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                RESEARCH CORE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Genetic Algorithm Laboratory
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl font-normal">
              Explore how evolutionary optimization identifies a feature subset for credit card fraud detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Dna className="w-4 h-4 text-cyan-400" />
              <span>30-Bit Chromosome Space</span>
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-start gap-3 text-xs text-slate-300 leading-relaxed font-sans">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-cyan-300 font-semibold">Optimization Concept:</strong> Genetic Algorithm based feature selection is used to search the feature space for an optimized subset of transaction attributes through iterative population generation, fitness evaluation, selection, crossover, mutation, and convergence.
          </p>
        </div>
      </div>

      {/* SECTION 1 — GA CONFIGURATION */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="HYPERPARAMETER SPECIFICATION"
          title="Genetic Algorithm Configuration"
          subtitle="Structural parameters governing the evolutionary search and zero-leakage fitness evaluation."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Population Size</span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{mockGAConfig.populationSize}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Candidate chromosomes</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Number of Features</span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{mockGAConfig.totalFeatures}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Time + V1–V28 + Amount</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Generations</span>
            <p className="text-base font-bold text-cyan-300 mt-1 font-mono">{mockGAConfig.generations}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Evolutionary iteration cap</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Crossover</span>
            <p className="text-base font-bold text-white mt-1 font-mono">{mockGAConfig.crossoverType}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Recombination operator</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Mutation</span>
            <p className="text-base font-bold text-white mt-1 font-mono">{mockGAConfig.mutationStatus}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Stochastic variation</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Fitness Classifier</span>
            <p className="text-base font-bold text-white mt-1 font-mono">{mockGAConfig.fitnessClassifier}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Fitness evaluation engine</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/25 sm:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">Fitness Metric Objective</span>
            <p className="text-base font-bold text-cyan-300 mt-1 font-mono">{mockGAConfig.fitnessMetric}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Evaluated strictly on un-resampled validation sub-split</span>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-5 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-cyan-300">Implementation Note:</strong> This application uses <strong>F1-score</strong> as the optimization objective to better account for the severe class imbalance present in fraud detection. The reference paper uses accuracy for GA fitness evaluation.
          </div>
        </div>
      </div>

      {/* SECTION 2 — HOW THE GA WORKS */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <SectionHeader
          eyebrow="EVOLUTIONARY PIPELINE CYCLE"
          title="How the Genetic Algorithm Works"
          subtitle="The sequential life cycle of chromosomal variation, fitness evaluation, and generational convergence."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {mockGACycleStages.map((stage) => (
            <div
              key={stage.step}
              className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {stage.step}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                    {cycleIcons[stage.iconName] || <Activity className="w-4 h-4 text-cyan-400" />}
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white tracking-tight">
                  {stage.title}
                </h4>
                <p className="text-[10px] font-mono text-cyan-400/90 mt-0.5">
                  {stage.subtitle}
                </p>

                <p className="text-[11px] text-slate-300 mt-2.5 leading-snug">
                  {stage.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-white/5 text-[10px] text-slate-500 leading-tight">
                {stage.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3 — CHROMOSOME VISUALIZER */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white font-sans">
                Chromosome Representation
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Each chromosome represents a candidate feature subset. Click any bit to inspect the corresponding feature gene.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>1 = Selected</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span>0 = Excluded</span>
            </span>
          </div>
        </div>

        {/* 30-Bit Chromosome Bar */}
        <div className="p-4 rounded-xl bg-slate-950 border border-white/10 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">
            30-Bit Chromosome Sequence (Illustrative Example)
          </span>

          <div className="flex items-center gap-1.5 min-w-[700px]">
            {mockIllustrativeGenes.map((gene) => {
              const isSelected = gene.bit === 1;
              const isInspected = selectedGeneIndex === gene.index;

              return (
                <button
                  key={gene.index}
                  onClick={() => setSelectedGeneIndex(gene.index)}
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                    isInspected
                      ? 'ring-2 ring-cyan-400 scale-105 z-10'
                      : 'hover:scale-102'
                  } ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-400 mb-0.5 truncate max-w-[28px]">
                    {gene.featureName}
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {gene.bit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clicked Gene Detail Inspector Card */}
        <div className="mt-5 p-5 rounded-xl bg-slate-900/80 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              Gene Inspector (Position {selectedGene.index + 1} of 30)
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h4 className="text-lg font-bold text-white font-mono">
                Feature: {selectedGene.featureName}
              </h4>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-white/5">
                {selectedGene.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {selectedGene.description}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Gene Value</span>
              <span className="text-base font-bold text-cyan-300">{selectedGene.bit}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Status</span>
              <span
                className={`font-bold ${
                  selectedGene.bit === 1 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {selectedGene.bit === 1 ? 'Selected' : 'Excluded'}
              </span>
            </div>
          </div>
        </div>

        {/* Feature vs Gene vs State Grid */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              Gene-to-Feature Mapping Grid
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              30 Input Dimensions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {mockIllustrativeGenes.map((gene) => (
              <div
                key={gene.index}
                onClick={() => setSelectedGeneIndex(gene.index)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedGeneIndex === gene.index
                    ? 'border-cyan-400 bg-cyan-950/40'
                    : 'border-white/5 bg-slate-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    {gene.featureName}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      gene.bit === 1
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    Bit {gene.bit}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {gene.bit === 1 ? 'Selected' : 'Excluded'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4 — POPULATION VIEW */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              Population Explorer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Illustrative population of candidate chromosomes evolving across generations — awaiting live GA artifact connection.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {(['All', 'Elite', 'Selected', 'Candidate'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPopulationFilter(filter)}
                className={`px-3 py-1 rounded-lg transition-colors text-[11px] ${
                  populationFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Chromosomes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPopulation.map((candidate) => (
            <div
              key={candidate.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      {candidate.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                      {candidate.selectedCount} Features
                    </span>
                  </div>
                  <StatusBadge
                    status={candidate.status}
                    variant={
                      candidate.status === 'Elite'
                        ? 'amber'
                        : candidate.status === 'Selected'
                        ? 'cyan'
                        : 'neutral'
                    }
                    size="sm"
                  />
                </div>

                <div className="p-2 rounded bg-slate-950 font-mono text-[11px] tracking-widest text-slate-300 overflow-x-auto truncate">
                  {candidate.chromosomeBits}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px]">Fitness Score</span>
                <span className="text-cyan-300 font-semibold">{candidate.fitnessScorePlaceholder}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5 — GA CONVERGENCE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="EVOLUTIONARY TRAJECTORY"
          title="GA Fitness Convergence"
          subtitle="Generational fitness improvement curve tracking maximum and average population fitness."
        />

        {/* Metric Cards Above Chart (No invented final values) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Best Fitness</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">—</p>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Awaiting GA artifact</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Generation Reached</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">—</p>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Awaiting GA artifact</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Features Selected</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">—</p>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Awaiting GA artifact</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/25">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">Status</span>
            <p className="text-sm font-bold text-cyan-300 font-mono mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Awaiting Artifact</span>
            </p>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">models/ga_feature_selection.joblib</span>
          </div>
        </div>

        {/* Recharts Convergence LineChart */}
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockConvergenceHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="generation" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0.6, 0.9]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900/95 border border-white/15 p-3 rounded-xl shadow-2xl font-mono text-xs">
                        <p className="font-bold text-white">Generation {label}</p>
                        <p className="text-cyan-400 mt-1">Best Fitness: {payload[0]?.value}</p>
                        <p className="text-indigo-400 mt-0.5">Avg Fitness: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="bestFitness" name="Best Fitness (F1)" stroke="#00F2FE" strokeWidth={2.5} dot={{ r: 3, fill: '#00F2FE' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="averageFitness" name="Average Fitness (F1)" stroke="#6366F1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Preview trajectory — live GA results will be loaded from backend artifact.</span>
          <span className="text-cyan-400">Optimization Goal: Maximize Validation F1</span>
        </div>
      </div>

      {/* SECTION 6 — FEATURE SELECTION RESULT & 30-FEATURE MATRIX */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="OPTIMIZATION OUTCOME"
          title="Optimized Feature Subset"
          subtitle="Transformation from full dimensional space to GA-selected subset."
        />

        {/* Transformation Pipeline Header */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 my-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 w-full md:w-auto flex-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Input Dimension</span>
            <div className="text-xl font-bold text-white font-mono mt-1">30 FEATURES</div>
            <span className="text-[11px] text-slate-500">Full continuous space</span>
          </div>

          <div className="text-cyan-400 font-mono text-sm flex items-center gap-2">
            <span>→</span>
            <span className="text-xs bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25">
              Genetic Algorithm
            </span>
            <span>→</span>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 w-full md:w-auto flex-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Optimized Subset</span>
            <div className="text-xl font-bold text-cyan-300 font-mono mt-1">-- / 30 FEATURES</div>
            <span className="text-[11px] text-cyan-400/80">Awaiting GA artifact</span>
          </div>
        </div>

        {/* 30-Feature Matrix Table with Search */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white font-sans">
                Feature Dimension Matrix
              </h4>
              <span className="text-xs font-mono text-slate-400">
                (30 Features)
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={featureSearchTerm}
                onChange={(e) => setFeatureSearchTerm(e.target.value)}
                placeholder="Search feature dimensions..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[360px] overflow-y-auto border border-white/10 rounded-xl bg-slate-950/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#0B1222] border-b border-white/10 z-10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-4">Feature</th>
                  <th className="py-2.5 px-4">Selected</th>
                  <th className="py-2.5 px-4">Gene</th>
                  <th className="py-2.5 px-4 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredGenesTable.map((g) => (
                  <tr key={g.featureName} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-white">
                      {g.featureName}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">
                      <span className="text-cyan-300/80">Awaiting artifact</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      —
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                      {g.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 7 — FEATURE IMPORTANCE PREVIEW */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">
              Selected Feature Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Relative importance of the GA-isolated attributes.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('explainability')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-semibold font-mono transition-all self-start sm:self-auto"
          >
            <span>View Model Explainability</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Empty Research-State Placeholder */}
        <div className="p-8 rounded-xl bg-slate-950 border border-white/5 text-center flex flex-col items-center justify-center min-h-[140px]">
          <BarChart2 className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs font-mono text-slate-400 max-w-md">
            Feature importance visualization will appear after the trained model artifact is connected.
          </p>
        </div>
      </div>

      {/* SECTION 8 — REFERENCE PAPER — GA FEATURE VECTORS (v1 to v5) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xl font-bold text-white font-sans">
                Reference Paper — GA Feature Vectors
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Published feature subsets (v1 through v5) documented in the reference research paper.
            </p>
          </div>

          <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full">
            Published Reference Result
          </span>
        </div>

        {/* 5 Selectable Vector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {mockReferenceVectors.map((v) => {
            const isSelected = selectedRefVectorId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedRefVectorId(v.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400/60 shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {v.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {v.featureCount} feats
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                  Acc: {v.paperReportedAccuracy}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Vector Feature List Display */}
        <div className="p-5 rounded-xl bg-slate-950 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-mono font-bold text-white">
                {activeRefVector.name} — Feature Subspace ({activeRefVector.featureCount} Features)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{activeRefVector.description}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              Reference paper data — not our experiment.
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {activeRefVector.features.map((feat) => (
              <span
                key={feat}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/25 text-cyan-300 font-mono text-xs font-semibold"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 9 — REFERENCE STUDY VS OUR IMPLEMENTATION */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
        <SectionHeader
          eyebrow="METHODOLOGICAL COMPARISON"
          title="Reference Study vs Our Implementation"
          subtitle="Systematic contrast between published literature parameters and our zero-leakage execution."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Paper */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Reference Paper</span>
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">GA Fitness:</span>
                <span className="text-white font-bold">Accuracy</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Feature Vectors:</span>
                <span className="text-white font-bold">5 (v1 through v5)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">GA Classifier:</span>
                <span className="text-white font-bold">Random Forest</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Feature Selection:</span>
                <span className="text-white font-bold">GA</span>
              </div>
            </div>
          </div>

          {/* Our Implementation */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-900/80 border border-cyan-500/30">
            <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Our Implementation</span>
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/20 flex items-center justify-between">
                <span className="text-slate-400">GA Fitness:</span>
                <span className="text-cyan-300 font-bold">F1 Score</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/20 flex items-center justify-between">
                <span className="text-slate-400">Feature Result:</span>
                <span className="text-cyan-300 font-bold">One persisted optimal feature mask</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/20 flex items-center justify-between">
                <span className="text-slate-400">GA Fitness Model:</span>
                <span className="text-cyan-300 font-bold">Random Forest</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/20 flex items-center justify-between">
                <span className="text-slate-400">Feature Selection:</span>
                <span className="text-cyan-300 font-bold">GA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why F1? Callout */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Why F1?
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Fraud detection involves severe class imbalance. F1 balances precision and recall and provides a more informative optimization objective than accuracy alone for the minority fraud class.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 10 — GA PIPELINE ANIMATION */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="mb-6">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            EVOLUTIONARY SEARCH FLOW
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Genetic Algorithm Pipeline Flow
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end execution path from the 30 continuous feature dimensions to the final persisted feature mask.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2 items-center text-center font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-white font-bold">
              30 FEATURES
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              Generate Population
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              Evaluate Fitness
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              Selection
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              1-Point Crossover
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 items-center text-center font-mono text-xs mt-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              Mutation
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              Evaluate Again
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
              Convergence
            </div>
            <div className="text-cyan-400 text-xs hidden lg:block">→</div>
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 font-bold">
              SELECTED FEATURE MASK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
