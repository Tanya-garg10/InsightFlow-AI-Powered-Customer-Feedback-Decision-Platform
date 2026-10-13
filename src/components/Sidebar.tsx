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
  Database,
  ArrowRight,
  TrendingUp
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
    <aside className="w-64 bg-white border-r border-[rgba(115,87,246,0.12)] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-[rgba(115,87,246,0.08)]">
        <div className="flex items-center gap-3">
          {/* Custom Logo */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7357F6] to-[#477DFF] flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 12C8 10.3431 9.34315 9 11 9H13C14.6569 9 16 10.3431 16 12C16 13.6569 14.6569 15 13 15H11C9.34315 15 8 13.6569 8 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-[#25243A] tracking-tight text-base leading-tight">InsightFlow</div>
            <div className="text-[10px] text-[#77758F] font-medium tracking-wide uppercase">AI-Powered Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#77758F] uppercase tracking-wider">
          Platform Workspace
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#EEE9FF] text-[#7357F6] shadow-sm'
                  : 'text-[#77758F] hover:text-[#25243A] hover:bg-[#F5F4FC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#7357F6]' : 'text-[#A8A6BF]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-[#7357F6] text-white' : 'bg-[#F5F4FC] text-[#77758F]'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-[#7357F6]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Adaption Status Footer */}
      <div className="p-4 border-t border-[rgba(115,87,246,0.08)] bg-gradient-to-br from-[#F5F4FC] to-white">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-[#7357F6]" />
          <span className="text-xs font-semibold text-[#25243A]">Adaption Integration</span>
        </div>
        <p className="text-[11px] text-[#77758F] leading-relaxed mb-2.5">
          Validation mode active. Enriched analysis validated against source reviews.
        </p>
        <div className="w-full bg-[#E2E0EF] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7357F6] to-[#477DFF] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(12, adaptedCoverage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#77758F] mt-1.5">
          <span>Adapted Sample</span>
          <span className="font-medium text-[#7357F6]">{adaptedCoverage}% coverage</span>
        </div>
      </div>
    </aside>
  );
};
