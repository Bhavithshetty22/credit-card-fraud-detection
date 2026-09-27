import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'emerald' | 'cyan' | 'rose' | 'amber' | 'blue' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'cyan',
  size = 'md',
  dot = true,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    neutral: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.6)]',
    rose: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    amber: 'bg-amber-400',
    blue: 'bg-blue-400',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      <span>{status}</span>
    </span>
  );
};
