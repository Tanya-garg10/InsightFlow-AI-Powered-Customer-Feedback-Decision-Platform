import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { Card, Badge, CategoryBadge, Button } from '../components/ui';

interface RecommendationsViewProps {
  recommendations: RecommendationItem[];
  onStatusChange: (id: string, status: 'under_review' | 'accepted' | 'rejected') => Promise<void>;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onStatusChange,
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const categories = Array.from(new Set(recommendations.map(r => r.category))).sort();

  let filtered = recommendations;
  if (filterCategory !== 'all') {
    filtered = filtered.filter(r => r.category === filterCategory);
  }
  if (filterPriority !== 'all') {
    filtered = filtered.filter(r => r.priority === filterPriority);
  }
  if (filterStatus !== 'all') {
    filtered = filtered.filter(r => r.status === filterStatus);
  }

  const handleUpdate = async (id: string, status: 'under_review' | 'accepted' | 'rejected') => {
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="mint">{status.replace('_', ' ')}</Badge>;
      case 'rejected':
        return <Badge variant="coral">{status.replace('_', ' ')}</Badge>;
      default:
        return <Badge variant="mixed">{status.replace('_', ' ')}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="coral">{priority} Priority</Badge>;
      case 'medium':
        return <Badge variant="mixed">{priority} Priority</Badge>;
      default:
        return <Badge variant="default">{priority} Priority</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#25243A] tracking-tight">Actionable Recommendations</h1>
        <p className="text-sm text-[#77758F] mt-2 max-w-xl">
          Operational suggestions linked directly to raw customer review evidence with qualitative expected impact.
        </p>
      </div>

      {/* Guidelines Alert */}
      <Card className="p-5 bg-[#F5F4FC] border-[rgba(115,87,246,0.12)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7357F6]/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#7357F6]" />
          </div>
          <div className="text-sm text-[#25243A] leading-relaxed">
            <strong className="text-[#25243A]">Impact Forecast Policy:</strong> Recommendations present anticipated directions of impact (e.g. reduction in checkout drop-offs, improved support resolution) rather than fabricated numerical percentages. Statuses can be triaged by your team below.
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="text-[#77758F]">Filters:</div>
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
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
        >
          <option value="all">All Statuses</option>
          <option value="under_review">Under Review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((rec) => (
          <Card
            key={rec.id}
            hover
            className="p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              {/* Category, Priority, and Status Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <CategoryBadge category={rec.category} />
                  {getPriorityBadge(rec.priority)}
                </div>
                {getStatusBadge(rec.status)}
              </div>

              {/* Problem Addressed */}
              <div>
                <h3 className="font-bold text-[#25243A] text-base leading-snug">
                  {rec.problem_addressed}
                </h3>
              </div>

              {/* Recommended Action */}
              <div className="p-4 bg-[#EEE9FF] rounded-xl border border-[rgba(115,87,246,0.12)]">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#7357F6] uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Proposed Action
                </div>
                <div className="text-sm text-[#25243A] font-medium leading-relaxed">
                  {rec.suggested_action}
                </div>
              </div>

              {/* Why Suggested & Impact */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-[#7357F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#25243A]">Rationale: </span>
                    <span className="text-[#77758F] leading-relaxed">{rec.why_suggested}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#25243A]">Expected Impact: </span>
                    <span className="text-[#059669] leading-relaxed">{rec.expected_impact_direction}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#7357F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#25243A]">Next Step: </span>
                    <span className="text-[#77758F] leading-relaxed">{rec.suggested_next_step}</span>
                  </div>
                </div>
              </div>

              {/* Supporting Reviews */}
              {rec.supporting_review_examples.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#77758F] uppercase tracking-wider mb-2">
                    Supporting Review Examples
                  </div>
                  <div className="space-y-2">
                    {rec.supporting_review_examples.map((ex, i) => (
                      <div key={i} className="text-sm text-[#77758F] bg-[#F5F4FC] p-3 rounded-lg border border-[rgba(115,87,246,0.08)] italic">
                        "{ex}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Limitations */}
              <div className="p-3 bg-[#FFFBEB] border border-[rgba(217,119,6,0.2)] rounded-xl text-xs text-[#D97706] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#25243A]">Limitations: </strong> {rec.limitations}
                </span>
              </div>
            </div>

            {/* Decision Status Controls */}
            <div className="pt-4 border-t border-[rgba(115,87,246,0.08)] flex items-center justify-between">
              <span className="text-sm text-[#77758F]">Team Status Decision:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdate(rec.id, 'accepted')}
                  disabled={updatingId === rec.id || rec.status === 'accepted'}
                  className={rec.status === 'accepted' ? 'bg-[#059669] text-white border-[#059669]' : ''}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdate(rec.id, 'under_review')}
                  disabled={updatingId === rec.id || rec.status === 'under_review'}
                  className={rec.status === 'under_review' ? 'bg-[#D97706] text-white border-[#D97706]' : ''}
                >
                  <Clock className="w-4 h-4" />
                  <span>Review</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdate(rec.id, 'rejected')}
                  disabled={updatingId === rec.id || rec.status === 'rejected'}
                  className={rec.status === 'rejected' ? 'bg-[#E11D48] text-white border-[#E11D48]' : ''}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
