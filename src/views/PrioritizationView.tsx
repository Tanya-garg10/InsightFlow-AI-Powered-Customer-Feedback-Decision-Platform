import React, { useState } from 'react';
import {
  ListOrdered,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { IssueItem } from '../types';
import { api } from '../services/api';
import { Card, Badge, SeverityBadge, CategoryBadge, Button } from '../components/ui';

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#25243A] tracking-tight">Issue Prioritization</h1>
          <p className="text-sm text-[#77758F] mt-2 max-w-xl">
            Algorithmic grouping and transparent heuristic scoring of recurring feedback patterns.
          </p>
        </div>

        <Button variant="secondary" onClick={onNavigateToTracker}>
          <span>Open Issue Tracker</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Formula Transparency Card */}
      <Card className="p-6 bg-[#F5F4FC] border-[rgba(115,87,246,0.12)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-[#7357F6]" />
            <h2 className="text-sm font-bold text-[#25243A] uppercase tracking-wide">
              Documented Prioritization Formula
            </h2>
          </div>
          <Badge variant="violet" size="sm">Heuristic Urgency Index</Badge>
        </div>

        <div className="p-4 bg-white rounded-xl font-mono text-sm text-[#7357F6] border border-[rgba(115,87,246,0.12)] overflow-x-auto mb-4">
          Priority Score = (Normalized Frequency × 40) + (Severity Weight × 40) + (Evidence Quality × 20)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#77758F] pt-2">
          <div className="bg-white p-3 rounded-lg border border-[rgba(115,87,246,0.08)]">
            <strong className="text-[#25243A] block mb-1">Frequency (40%)</strong>
            Volume of matching customer review records relative to baseline.
          </div>
          <div className="bg-white p-3 rounded-lg border border-[rgba(115,87,246,0.08)]">
            <strong className="text-[#25243A] block mb-1">Severity Weight (40%)</strong>
            High = 3.0, Medium = 2.0, Low/Unknown = 1.0.
          </div>
          <div className="bg-white p-3 rounded-lg border border-[rgba(115,87,246,0.08)]">
            <strong className="text-[#25243A] block mb-1">Evidence Quality (20%)</strong>
            Ratio of matching reviews with extractable text quotes.
          </div>
        </div>

        <div className="text-xs text-[#D97706] bg-[#FFFBEB] p-3 rounded-xl border border-[rgba(217,119,6,0.2)] flex items-start gap-2 mt-4">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#25243A]">Disclaimer:</strong> This score is a heuristic decision-support index, not an objectively verified monetary or business impact metric. Allegations of fraud reflect customer statements and are not confirmed incidents.
          </span>
        </div>
      </Card>

      {successNote && (
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-sm rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#059669]" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="text-[#77758F]">Filter clusters:</div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>
      </div>

      {/* Issues Accordion List */}
      <div className="space-y-4">
        {filtered.map((issue) => {
          const isExpanded = expandedId === issue.id;
          return (
            <Card
              key={issue.id}
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F5F4FC]/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7357F6] to-[#477DFF] flex items-center justify-center font-mono font-bold text-white text-lg shrink-0 shadow-sm">
                    {issue.priority_score}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-[#25243A] text-base truncate">{issue.title}</span>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#77758F]">
                      <CategoryBadge category={issue.category} />
                      <span className="text-[#77758F]">·</span>
                      <span>{issue.frequency} records</span>
                      <span className="text-[#77758F]">·</span>
                      <span>Evidence: {(issue.evidence_quality_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendToTracker(issue);
                    }}
                    disabled={transferringId === issue.id}
                    className="hidden sm:flex"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Track Issue</span>
                  </Button>

                  <div className="text-[#77758F]">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[rgba(115,87,246,0.08)] bg-[#F5F4FC]/30 space-y-4 text-sm">
                  {/* Action recommendation */}
                  <div>
                    <div className="font-semibold text-[#25243A] uppercase text-[11px] tracking-wider mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Suggested Action
                    </div>
                    <p className="text-[#25243A] bg-white p-4 rounded-xl border border-[rgba(115,87,246,0.08)] leading-relaxed">
                      {issue.suggested_action}
                    </p>
                  </div>

                  {/* Supporting Evidence Snippets */}
                  {issue.supporting_evidence.length > 0 && (
                    <div>
                      <div className="font-semibold text-[#25243A] uppercase text-[11px] tracking-wider mb-2">
                        Supporting Evidence Quotes
                      </div>
                      <div className="space-y-2">
                        {issue.supporting_evidence.map((ev, i) => (
                          <div key={i} className="p-3 bg-white rounded-lg border border-[rgba(115,87,246,0.08)] font-mono text-xs text-[#77758F]">
                            "{ev}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Reviews */}
                  {issue.example_reviews.length > 0 && (
                    <div>
                      <div className="font-semibold text-[#25243A] uppercase text-[11px] tracking-wider mb-2">
                        Verbatim Customer Reviews
                      </div>
                      <div className="space-y-2">
                        {issue.example_reviews.map((rev, i) => (
                          <div key={i} className="p-3 bg-white rounded-lg border border-[rgba(115,87,246,0.08)] text-[#25243A]">
                            "{rev}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Track button */}
                  <div className="pt-2 sm:hidden">
                    <Button
                      onClick={() => handleSendToTracker(issue)}
                      disabled={transferringId === issue.id}
                      className="w-full"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Send to Issue Tracker</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
