import React from 'react';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  ListOrdered,
  Lightbulb,
  CheckSquare,
  FileText,
  FlaskConical,
  Settings,
  ChevronRight,
  Database
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'feedback'
  | 'insights'
  | 'prioritization'
  | 'recommendations'
  | 'tracker'
  | 'reports'
  | 'adaption'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  feedbackCount: number;
  adaptedCoverage: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  feedbackCount,
  adaptedCoverage,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'feedback', label: 'Feedback Explorer', icon: <Search className="w-4 h-4" />, badge: feedbackCount > 0 ? `${feedbackCount}` : undefined },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'prioritization', label: 'Issue Prioritization', icon: <ListOrdered className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'tracker', label: 'Issue Tracker', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-4 h-4" /> },
    { id: 'adaption', label: 'Adaption Lab', icon: <FlaskConical className="w-4 h-4" />, badge: adaptedCoverage > 0 ? `${adaptedCoverage}%` : undefined },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            IF
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-base leading-tight">InsightFlow</div>
            <div className="text-[11px] text-slate-400 font-medium">Build Battle 2026</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform Workspace
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Adaption Status Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-semibold text-slate-800">Adaption Integration</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
          Validation mode active. Enriched analysis validated against source reviews.
        </p>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(12, adaptedCoverage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
          <span>Adapted Sample</span>
          <span>{adaptedCoverage}% coverage</span>
        </div>
      </div>
    </aside>
  );
};
