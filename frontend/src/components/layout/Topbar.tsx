import React from 'react';
import { ShieldCheck, CreditCard, Menu, Search, Bell } from 'lucide-react';
import { PageId } from '../../types';

interface TopbarProps {
  currentPage: PageId;
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
  onSelectPage?: (page: PageId) => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Security Dashboard', subtitle: 'Overview of transaction monitoring and fraud prevention metrics' },
  'statement-check': { title: 'Statement Scanner', subtitle: 'Batch analysis of CSV bank statements using ensemble AI' },
  alerts: { title: 'Alert Center', subtitle: 'Review and decide on high-risk transaction flags' },
  'card-controls': { title: 'Card Controls', subtitle: 'Manage security policies and spending limits' },
  'single-transaction': { title: 'Verify Charge', subtitle: 'Instant real-time evaluation for individual charges' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  onOpenMobileMenu,
}) => {
  const current = PAGE_TITLES[currentPage] || { title: 'CardShield Security', subtitle: 'Intelligent Fraud Intelligence' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Card Number Chip */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span>•••• 4242</span>
          <span className="text-[10px] text-blue-600 font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
            VISA
          </span>
        </div>

        {/* Live Protection Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline font-mono">Protected</span>
        </div>
      </div>
    </header>
  );
};
