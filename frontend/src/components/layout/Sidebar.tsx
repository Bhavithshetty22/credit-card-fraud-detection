import React from 'react';
import { Home, FileText, Bell, Lock, ShieldCheck, Zap, Sliders, CheckSquare, Sparkles } from 'lucide-react';
import { CARDHOLDER_NAV_ITEMS } from '../../data/mockData';
import { PageId } from '../../types';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />,
  dashboard: <Home className="w-4 h-4" />,
  'file-text': <FileText className="w-4 h-4" />,
  'batch-detection': <FileText className="w-4 h-4" />,
  bell: <Bell className="w-4 h-4" />,
  'fraud-detection': <Bell className="w-4 h-4" />,
  lock: <Lock className="w-4 h-4" />,
  'card-shield': <Sliders className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  'single-transaction': <CheckSquare className="w-4 h-4" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display block leading-none">
                CardShield
              </span>
              <span className="text-[11px] font-mono text-blue-600 font-semibold uppercase tracking-wider block mt-1">
                Enterprise Fraud AI
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider block mb-2">
              Main Navigation
            </span>
            {CARDHOLDER_NAV_ITEMS.map((item: any) => {
              const isActive = currentPage === item.id;
              const iconKey = item.iconName || item.icon || item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as PageId)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {ICON_MAP[iconKey] || ICON_MAP[item.id] || <Home className="w-4 h-4" />}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Card Status */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-blue-50 to-slate-50 border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Protection Status</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot-ring inline-block" />
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Ensemble AI models active for cardholder screening.
          </p>
        </div>
      </aside>
    </>
  );
};
