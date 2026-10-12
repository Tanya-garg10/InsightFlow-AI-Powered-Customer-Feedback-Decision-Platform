import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  FileText,
  CopyCheck,
  Tag,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { OverviewAnalytics, IssueItem, FeedbackItem } from '../types';

interface OverviewViewProps {
  analytics: OverviewAnalytics | null;
  onNavigateToFeedback: () => void;
  onNavigateToIssues: () => void;
  onNavigateToRecommendations: () => void;
  onSelectFeedback: (item: FeedbackItem) => void;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10B981', // emerald-500
  negative: '#F43F5E', // rose-500
  neutral: '#64748B',  // slate-500
  mixed: '#F59E0B',    // amber-500
  unassigned: '#94A3B8'
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  onNavigateToFeedback,
  onNavigateToIssues,
  onNavigateToRecommendations,
  onSelectFeedback,
}) => {
  if (!analytics || analytics.total_records === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Analyzed Records Available</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Upload customer feedback CSV or run the baseline analysis pipeline to view real metric distributions.
        </p>
      </div>
    );
  }

  const {
    total_records,
    unique_reviews,
    unique_review_category_combos,
    duplicate_records_count,
    category_distribution,
    sentiment_distribution,
    top_topics,
    high_priority_issues,
    recent_feedback,
    recommendations_count,
  } = analytics;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Dynamic statistics computed from customer feedback records. Inferences marked transparently.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Feedback</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{total_records}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span>{unique_reviews} distinct reviews</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{duplicate_records_count} duplicates</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unique Combos</span>
            <CopyCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {unique_review_category_combos}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Independent review-category pairs
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {high_priority_issues.length}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Ranked by heuristic urgency</span>
            <button
              onClick={onNavigateToIssues}
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-0.5"
            >
              View <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Action Recommendations</span>
            <Lightbulb className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {recommendations_count}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Targeting root problem clusters</span>
            <button
              onClick={onNavigateToRecommendations}
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-0.5"
            >
              Inspect <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Category Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Observed source category volume</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold">{data.category}</div>
                          <div className="text-slate-300 mt-1">
                            {data.count} feedback records ({data.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Sentiment Distribution</h2>
                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 font-medium">
                  AI-Inferred
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Based on Adaption completions and local baseline</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentiment_distribution}
                  dataKey="count"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={52}
                  paddingAngle={3}
                >
                  {sentiment_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold capitalize">{data.sentiment}</div>
                          <div className="text-slate-300 mt-1">
                            {data.count} records ({data.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 mt-2">
            {sentiment_distribution.map((s) => (
              <div key={s.sentiment} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS[s.sentiment] || '#94A3B8' }}
                />
                <span className="capitalize">{s.sentiment}:</span>
                <span className="font-mono text-slate-800">{s.count} ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Recurring Topics & Highest Priority Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Recurring Topics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Most Frequently Reported Topics</h2>
          <p className="text-xs text-slate-400 mb-4">Extracted key topics across categories</p>
          <div className="space-y-3">
            {top_topics.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px] w-4">{idx + 1}.</span>
                  <span className="font-medium text-slate-800">{t.topic}</span>
                </div>
                <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                  {t.count} mentions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Priority Issues (Heuristic Ranked) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">Highest-Priority Issues</h2>
              <button
                onClick={onNavigateToIssues}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all prioritization formula details
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Ranked via formula: (Normalized Frequency × 40) + (Severity Weight × 40) + (Evidence Quality × 20)
            </p>

            <div className="divide-y divide-slate-100">
              {high_priority_issues.map((issue) => (
                <div key={issue.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-800">{issue.title}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500">{issue.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      Action: {issue.suggested_action}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-indigo-600">
                      Score: {issue.priority_score}/100
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                      Severity: {issue.severity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Heuristic score for operational triaging</span>
            <span>Unverified fraud allegations require safety review</span>
          </div>
        </div>
      </div>

      {/* Recent Feedback Feed */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Feedback</h2>
            <p className="text-xs text-slate-400 mt-0.5">Click any review to inspect inferred attributes and evidence</p>
          </div>
          <button
            onClick={onNavigateToFeedback}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <span>Open Feedback Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent_feedback.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectFeedback(item)}
              className="p-4 rounded-lg border border-slate-200/70 hover:border-indigo-300 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{item.sentiment || 'neutral'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{item.severity || 'low'} sev</span>
                </div>
                <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">
                  "{item.review}"
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                <span className="truncate max-w-[140px]">
                  {item.provenance === 'adapted_dataset' ? 'Adaption' : 'Baseline'}
                </span>
                <span className="text-indigo-600 font-medium hover:underline">Inspect</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
