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
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { OverviewAnalytics, IssueItem, FeedbackItem } from '../types';
import { Card, GradientPanel, Badge, CategoryBadge, SentimentBadge, SeverityBadge } from '../components/ui';

interface OverviewViewProps {
  analytics: OverviewAnalytics | null;
  onNavigateToFeedback: () => void;
  onNavigateToIssues: () => void;
  onNavigateToRecommendations: () => void;
  onSelectFeedback: (item: FeedbackItem) => void;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10B981',
  negative: '#E11D48',
  neutral: '#77758F',
  mixed: '#D97706',
  unassigned: '#A8A6BF'
};

const CATEGORY_COLORS: Record<string, string> = {
  'Product Feedback': '#7357F6',
  'Customer Service': '#477DFF',
  'Operational Issues': '#059669',
  'Fraud and Scam': '#E11D48'
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7357F6]/10 to-[#477DFF]/10 border border-[rgba(115,87,246,0.12)] flex items-center justify-center text-[#7357F6] mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#25243A] mb-2">No Analyzed Records Available</h2>
        <p className="text-sm text-[#77758F] max-w-md mx-auto mb-6">
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 fade-up">
      {/* Page Title & Context */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#25243A] tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-[#77758F] mt-2 max-w-xl">
            Dynamic statistics computed from customer feedback records. Inferences marked transparently.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-[#77758F]">
          <CheckCircle className="w-4 h-4 text-[#059669]" />
          <span>Analysis complete</span>
        </div>
      </div>

      {/* Hero Insight Panel */}
      <GradientPanel variant="hero" className="p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">AI-Generated Insight</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Every customer signal has a story.</h2>
          <p className="text-white/90 text-sm max-w-2xl mb-4 leading-relaxed">
            {total_records} feedback records analyzed with {sentiment_distribution.find(s => s.sentiment === 'positive')?.percentage || 0}% positive sentiment. 
            Top recurring patterns indicate opportunities in product quality and customer service responsiveness.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToFeedback}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#7357F6] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Explore Feedback</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-white/50" />
              <span>Based on {unique_reviews} unique reviews</span>
            </div>
          </div>
        </div>
      </GradientPanel>

      {/* Asymmetrical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#7357F6]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono tracking-tight">{total_records}</div>
          <div className="text-xs text-[#77758F] mt-1 font-medium">Total Feedback Records</div>
          <div className="mt-3 pt-3 border-t border-[rgba(115,87,246,0.08)] text-xs text-[#77758F]">
            {unique_reviews} unique · {duplicate_records_count} duplicates
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
              <CopyCheck className="w-5 h-5 text-[#477DFF]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono tracking-tight">
            {unique_review_category_combos}
          </div>
          <div className="text-xs text-[#77758F] mt-1 font-medium">Unique Review-Category Pairs</div>
          <div className="mt-3 pt-3 border-t border-[rgba(115,87,246,0.08)] text-xs text-[#77758F]">
            Independent combinations
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono tracking-tight">
            {high_priority_issues.length}
          </div>
          <div className="text-xs text-[#77758F] mt-1 font-medium">Priority Issues</div>
          <div className="mt-3 pt-3 border-t border-[rgba(115,87,246,0.08)] flex items-center justify-between">
            <span className="text-xs text-[#77758F]">Heuristic ranked</span>
            <button
              onClick={onNavigateToIssues}
              className="text-xs text-[#7357F6] font-medium hover:underline"
            >
              View all
            </button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#D97706]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono tracking-tight">
            {recommendations_count}
          </div>
          <div className="text-xs text-[#77758F] mt-1 font-medium">Action Recommendations</div>
          <div className="mt-3 pt-3 border-t border-[rgba(115,87,246,0.08)] flex items-center justify-between">
            <span className="text-xs text-[#77758F]">Targeting root causes</span>
            <button
              onClick={onNavigateToRecommendations}
              className="text-xs text-[#7357F6] font-medium hover:underline"
            >
              Inspect
            </button>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#25243A]">Category Distribution</h2>
              <p className="text-xs text-[#77758F] mt-0.5">Observed source category volume</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(115,87,246,0.08)" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#77758F' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#77758F' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#25243A] text-white text-xs rounded-xl p-3 shadow-lg">
                          <div className="font-semibold">{data.category}</div>
                          <div className="text-white/70 mt-1">
                            {data.count} feedback records ({data.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#7357F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sentiment Distribution Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#25243A]">Sentiment Distribution</h2>
                <Badge variant="violet" size="sm">AI-Inferred</Badge>
              </div>
              <p className="text-xs text-[#77758F] mt-0.5">Based on Adaption completions and local baseline</p>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentiment_distribution}
                  dataKey="count"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={56}
                  paddingAngle={4}
                >
                  {sentiment_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment] || '#A8A6BF'} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#25243A] text-white text-xs rounded-xl p-3 shadow-lg">
                          <div className="font-semibold capitalize">{data.sentiment}</div>
                          <div className="text-white/70 mt-1">
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
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#77758F] mt-4">
            {sentiment_distribution.map((s) => (
              <div key={s.sentiment} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS[s.sentiment] || '#A8A6BF' }}
                />
                <span className="capitalize">{s.sentiment}:</span>
                <span className="font-mono text-[#25243A]">{s.count} ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Recurring Topics & Highest Priority Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Recurring Topics */}
        <Card className="p-6">
          <h2 className="text-base font-bold text-[#25243A] mb-1">Most Frequently Reported Topics</h2>
          <p className="text-xs text-[#77758F] mb-5">Extracted key topics across categories</p>
          <div className="space-y-3">
            {top_topics.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-[rgba(115,87,246,0.08)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#77758F] text-[11px] w-5">{idx + 1}.</span>
                  <span className="font-medium text-[#25243A]">{t.topic}</span>
                </div>
                <span className="font-mono text-[#77758F] bg-[#F5F4FC] px-2.5 py-1 rounded-lg border border-[rgba(115,87,246,0.12)]">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Highest Priority Issues (Heuristic Ranked) */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-[#25243A]">Highest-Priority Issues</h2>
            <button
              onClick={onNavigateToIssues}
              className="text-xs text-[#7357F6] font-medium hover:underline"
            >
              View all prioritization formula details
            </button>
          </div>
          <p className="text-xs text-[#77758F] mb-5">
            Ranked via formula: (Normalized Frequency × 40) + (Severity Weight × 40) + (Evidence Quality × 20)
          </p>

          <div className="space-y-3">
            {high_priority_issues.map((issue) => (
              <div key={issue.id} className="p-4 rounded-xl bg-[#F5F4FC] border border-[rgba(115,87,246,0.08)] hover:border-[rgba(115,87,246,0.24)] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="font-semibold text-[#25243A]">{issue.title}</span>
                      <CategoryBadge category={issue.category} />
                    </div>
                    <p className="text-xs text-[#77758F] line-clamp-1">
                      Action: {issue.suggested_action}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-bold text-[#7357F6]">
                      {issue.priority_score}/100
                    </div>
                    <SeverityBadge severity={issue.severity} className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(115,87,246,0.08)] flex items-center justify-between text-xs text-[#77758F]">
            <span>Heuristic score for operational triaging</span>
            <span>Unverified fraud allegations require safety review</span>
          </div>
        </Card>
      </div>

      {/* Recent Feedback Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#25243A]">Recent Customer Feedback</h2>
            <p className="text-xs text-[#77758F] mt-0.5">Click any review to inspect inferred attributes and evidence</p>
          </div>
          <button
            onClick={onNavigateToFeedback}
            className="text-xs text-[#7357F6] font-medium flex items-center gap-1 hover:underline"
          >
            <span>Open Feedback Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent_feedback.map((item) => (
            <Card
              key={item.id}
              hover
              onClick={() => onSelectFeedback(item)}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#77758F] mb-3 flex-wrap">
                  <CategoryBadge category={item.category} />
                  <SentimentBadge sentiment={item.sentiment || 'neutral'} />
                  <SeverityBadge severity={item.severity || 'low'} />
                </div>
                <p className="text-sm text-[#25243A] line-clamp-3 leading-relaxed">
                  "{item.review}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[rgba(115,87,246,0.08)] flex justify-between items-center text-[11px] text-[#77758F]">
                <Badge variant={item.provenance === 'adapted_dataset' ? 'violet' : 'default'} size="sm">
                  {item.provenance === 'adapted_dataset' ? 'Adaption' : 'Baseline'}
                </Badge>
                <span className="text-[#7357F6] font-medium">Inspect →</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
