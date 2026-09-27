import React from 'react';
import {
  BookOpen,
  AlertTriangle,
  FileCode2,
  Cpu,
  Info,
  Sparkles,
} from 'lucide-react';

export type CalloutVariant =
  | 'methodology'
  | 'important'
  | 'reference-paper'
  | 'implementation-note'
  | 'future-backend';

interface ResearchCalloutProps {
  variant: CalloutVariant;
  title: string;
  children: React.ReactNode;
  className?: string;
  badgeText?: string;
}

const variantStyles: Record<
  CalloutVariant,
  {
    border: string;
    bg: string;
    iconColor: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    icon: React.ReactNode;
  }
> = {
  methodology: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-950/20',
    iconColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-300',
    icon: <Sparkles className="w-4 h-4" />,
  },
  important: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/20',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-300',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  'reference-paper': {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-950/20',
    iconColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/15',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-300',
    icon: <BookOpen className="w-4 h-4" />,
  },
  'implementation-note': {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-300',
    icon: <FileCode2 className="w-4 h-4" />,
  },
  'future-backend': {
    border: 'border-blue-500/30',
    bg: 'bg-blue-950/20',
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-300',
    icon: <Cpu className="w-4 h-4" />,
  },
};

export const ResearchCallout: React.FC<ResearchCalloutProps> = ({
  variant,
  title,
  children,
  className = '',
  badgeText,
}) => {
  const config = variantStyles[variant] || variantStyles.methodology;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 backdrop-blur-md relative overflow-hidden transition-all ${config.border} ${config.bg} ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-lg bg-slate-900/60 shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              {title}
            </h4>
            {badgeText && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
              >
                {badgeText}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
