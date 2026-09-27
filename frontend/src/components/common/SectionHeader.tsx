import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${className}`}>
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1 max-w-2xl font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
};
