import React, { useState } from 'react';
import {
  ListOrdered,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  CheckCircle2,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { IssueItem } from '../types';
import { api } from '../services/api';

interface PrioritizationViewProps {
  issues: IssueItem[];
  onIssueTrackerCreated?: () => void;
  onNavigateToTracker: () => void;
}

export const PrioritizationView: React.FC<PrioritizationViewProps> = ({
  issues,
  onNavigateToTracker,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(issues[0]?.id || null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const categories = Array.from(new Set(issues.map(i => i.category))).sort();

  let filtered = issues;
  if (filterCategory !== 'all') {
    filtered = filtered.filter(i => i.category === filterCategory);
  }
  if (filterSeverity !== 'all') {
    filtered = filtered.filter(i => i.severity === filterSeverity);
  }

  const handleSendToTracker = async (issue: IssueItem) => {
    setTransferringId(issue.id);
    try {
      await api.createIssue({
        title: issue.title,
        category: issue.category,
        severity: issue.severity,
        suggested_action: issue.suggested_action,
        notes: `Transferred from Prioritization Engine. Based on ${issue.frequency} supporting reviews.`,
        assigned_to: 'Unassigned',
      });
      setSuccessNote(`Issue "${issue.title}" recorded in Team Issue Tracker!`);
      setTimeout(() => setSuccessNote(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to create issue in tracker');
    } finally {
      setTransferringId(null);
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'high':
        return 'text-rose-700 bg-rose-50 border border-rose-200/60 font-semibold';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border border-amber-200/60 font-medium';
      case 'low':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200/60 font-medium';
      default:
        return 'text-slate-600 bg-slate-50 border border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Prioritization</h1>
          <p className="text-sm text-slate-500 mt-1">
            Algorithmic grouping and transparent heuristic scoring of recurring feedback patterns.
          </p>
        </div>

        <button
          onClick={onNavigateToTracker}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          <span>Open Issue Tracker</span>
        </button>
      </div>

      {/* Formula Transparency Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Documented Prioritization Formula
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Heuristic Urgency Index</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-indigo-950 border border-slate-200/70 overflow-x-auto">
          Priority Score = (Normalized Frequency × 40) + (Severity Weight × 40) + (Evidence Quality × 20)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500 pt-1">
          <div>
            <strong className="text-slate-800">Frequency (40%):</strong> Volume of matching customer review records relative to baseline.
          </div>
          <div>
            <strong className="text-slate-800">Severity Weight (40%):</strong> High = 3.0, Medium = 2.0, Low/Unknown = 1.0.
          </div>
          <div>
            <strong className="text-slate-800">Evidence Quality (20%):</strong> Ratio of matching reviews with extractable text quotes.
          </div>
        </div>

        <div className="text-[11px] text-amber-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> This score is a heuristic decision-support index, not an objectively verified monetary or business impact metric. Allegations of fraud reflect customer statements and are not confirmed incidents.
          </span>
        </div>
      </div>

      {successNote && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="text-slate-400">Filter clusters:</div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>
      </div>

      {/* Issues Accordion List */}
      <div className="space-y-3">
        {filtered.map((issue) => {
          const isExpanded = expandedId === issue.id;
          return (
            <div
              key={issue.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-mono font-bold text-indigo-700 text-sm shrink-0">
                    {issue.priority_score}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 text-sm truncate">{issue.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getSeverityStyle(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{issue.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{issue.frequency} feedback records</span>
                      <span aria-hidden="true">·</span>
                      <span>Evidence Quality: {(issue.evidence_quality_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendToTracker(issue);
                    }}
                    disabled={transferringId === issue.id}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-700 bg-white border border-slate-200 hover:bg-indigo-50/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Track Issue</span>
                  </button>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30 space-y-4 text-xs">
                  {/* Action recommendation */}
                  <div>
                    <div className="font-semibold text-slate-700 uppercase text-[11px] tracking-wider mb-1">
                      Suggested Action
                    </div>
                    <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed">
                      {issue.suggested_action}
                    </p>
                  </div>

                  {/* Supporting Evidence Snippets */}
                  {issue.supporting_evidence.length > 0 && (
                    <div>
                      <div className="font-semibold text-slate-700 uppercase text-[11px] tracking-wider mb-1">
                        Supporting Evidence Quotes
                      </div>
                      <div className="space-y-1.5">
                        {issue.supporting_evidence.map((ev, i) => (
                          <div key={i} className="p-2.5 bg-white rounded border border-slate-200/60 font-mono text-[11px] text-slate-700">
                            "{ev}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Reviews */}
                  {issue.example_reviews.length > 0 && (
                    <div>
                      <div className="font-semibold text-slate-700 uppercase text-[11px] tracking-wider mb-1">
                        Verbatim Customer Reviews
                      </div>
                      <div className="space-y-1.5">
                        {issue.example_reviews.map((rev, i) => (
                          <div key={i} className="p-2.5 bg-white rounded border border-slate-200/60 text-slate-800">
                            "{rev}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Track button */}
                  <div className="pt-2 sm:hidden">
                    <button
                      onClick={() => handleSendToTracker(issue)}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Send to Issue Tracker</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
