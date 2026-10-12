import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Filter,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { api } from '../services/api';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Actionable Recommendations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Operational suggestions linked directly to raw customer review evidence with qualitative expected impact.
        </p>
      </div>

      {/* Guidelines Alert */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Impact Forecast Policy:</strong> Recommendations present anticipated directions of impact (e.g. reduction in checkout drop-offs, improved support resolution) rather than fabricated numerical percentages. Statuses can be triaged by your team below.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="text-slate-400">Filters:</div>
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
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none"
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
          <div
            key={rec.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              {/* Category, Priority, and Status Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{rec.category}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className={`capitalize font-medium ${
                    rec.priority === 'high' ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${getStatusColor(rec.status)}`}>
                  {rec.status.replace('_', ' ')}
                </span>
              </div>

              {/* Problem Addressed */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {rec.problem_addressed}
                </h3>
              </div>

              {/* Recommended Action */}
              <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100">
                <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide mb-1">
                  Proposed Action
                </div>
                <div className="text-xs text-indigo-950 font-medium leading-relaxed">
                  {rec.suggested_action}
                </div>
              </div>

              {/* Why Suggested & Impact */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Rationale: </span>
                  <span className="text-slate-600 leading-relaxed">{rec.why_suggested}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Expected Direction of Impact: </span>
                  <span className="text-emerald-700 leading-relaxed">{rec.expected_impact_direction}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Immediate Next Step: </span>
                  <span className="text-slate-600 leading-relaxed">{rec.suggested_next_step}</span>
                </div>
              </div>

              {/* Supporting Reviews */}
              {rec.supporting_review_examples.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Supporting Review Examples
                  </div>
                  <div className="space-y-1">
                    {rec.supporting_review_examples.map((ex, i) => (
                      <div key={i} className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/50 italic">
                        "{ex}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Limitations */}
              <div className="p-2.5 bg-amber-50/50 border border-amber-200/50 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Limitations: </strong> {rec.limitations}
                </span>
              </div>
            </div>

            {/* Decision Status Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Team Status Decision:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdate(rec.id, 'accepted')}
                  disabled={updatingId === rec.id || rec.status === 'accepted'}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    rec.status === 'accepted'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Accept</span>
                </button>

                <button
                  onClick={() => handleUpdate(rec.id, 'under_review')}
                  disabled={updatingId === rec.id || rec.status === 'under_review'}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    rec.status === 'under_review'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Under Review</span>
                </button>

                <button
                  onClick={() => handleUpdate(rec.id, 'rejected')}
                  disabled={updatingId === rec.id || rec.status === 'rejected'}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    rec.status === 'rejected'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
