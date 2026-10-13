import React from 'react';
import { Sparkles, Cpu, Layers, Edit3, Info, TrendingUp, AlertCircle } from 'lucide-react';
import { OverviewAnalytics } from '../types';
import { Card, GradientPanel, Badge, Button } from '../components/ui';

interface AIInsightsViewProps {
  analytics: OverviewAnalytics | null;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  analytics,
  onRunAnalysis,
  isAnalyzing,
}) => {
  if (!analytics) return null;

  const {
    total_records,
    provenance_distribution,
    severity_distribution,
    category_distribution,
    sentiment_distribution,
    top_topics,
  } = analytics;

  const adaptedCount = provenance_distribution.adapted_dataset || 0;
  const baselineCount = provenance_distribution.transparent_baseline || 0;
  const overrideCount = provenance_distribution.manual_override || 0;
  const adaptedPercentage = total_records > 0 ? Math.round((adaptedCount / total_records) * 1000) / 10 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#25243A] tracking-tight">AI Insights & Methodology</h1>
            <Badge variant="violet">Adaption + Baseline</Badge>
          </div>
          <p className="text-sm text-[#77758F] mt-2 max-w-xl">
            Auditing inferred sentiment, severity levels, and provenance breakdown across customer reviews.
          </p>
        </div>

        <Button onClick={onRunAnalysis} loading={isAnalyzing}>
          <Sparkles className="w-4 h-4" />
          <span>{isAnalyzing ? 'Re-running pipeline...' : 'Re-run Analysis'}</span>
        </Button>
      </div>

      {/* Featured Insight Card */}
      <GradientPanel variant="hero" className="p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">Featured Insight</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Hybrid Analysis Approach</h2>
          <p className="text-white/90 text-sm max-w-2xl mb-4 leading-relaxed">
            InsightFlow combines {adaptedCount} Adaption-enriched records ({adaptedPercentage}% coverage) with 
            a transparent baseline heuristic for full operational coverage. This hybrid approach ensures 
            no customer signal is missed while maintaining full transparency about analysis provenance.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <span className="text-xs text-white/70">{adaptedCount} AI-enriched</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <span className="text-xs text-white/70">{baselineCount} baseline</span>
            </div>
          </div>
        </div>
      </GradientPanel>

      {/* Methodology Alert Banner */}
      <Card className="p-5 bg-[#F5F4FC] border-[rgba(115,87,246,0.12)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7357F6]/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-[#7357F6]" />
          </div>
          <div className="text-sm text-[#25243A] leading-relaxed space-y-2">
            <div className="font-semibold text-[#25243A]">Analysis Provenance Principles</div>
            <div className="space-y-1.5 text-[#77758F]">
              <div>
                <span className="font-medium text-[#25243A]">1. Adaption Enriched Dataset:</span> Used wherever available from completed test runs ({adaptedCount} records). Parses structured JSON outputs including severity and recommended actions.
              </div>
              <div>
                <span className="font-medium text-[#25243A]">2. Transparent Heuristic Baseline:</span> Transparent, documented keyword/polarity heuristic applied to remaining feedback ({baselineCount} records). No paid API key required.
              </div>
              <div>
                <span className="font-medium text-[#25243A]">3. Zero Ground-Truth Overclaim:</span> We do not treat AI-inferred sentiment or customer allegations as legally verified facts.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Provenance Card Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEE9FF] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#7357F6]" />
            </div>
            <Badge variant="violet">{adaptedPercentage}%</Badge>
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono">{adaptedCount}</div>
          <div className="text-sm text-[#77758F] mt-1 font-medium">Adaption Dataset</div>
          <p className="text-xs text-[#77758F] mt-3 leading-relaxed">
            Fine-tuned completions validated against original review context.
          </p>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5F4FC] flex items-center justify-center">
              <Layers className="w-6 h-6 text-[#77758F]" />
            </div>
            <Badge variant="default">{total_records > 0 ? (100 - adaptedPercentage).toFixed(1) : 0}%</Badge>
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono">{baselineCount}</div>
          <div className="text-sm text-[#77758F] mt-1 font-medium">Transparent Baseline</div>
          <p className="text-xs text-[#77758F] mt-3 leading-relaxed">
            Lightweight heuristic fallback preserving full operational coverage.
          </p>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-[#059669]" />
            </div>
            <Badge variant="mint">Manual</Badge>
          </div>
          <div className="text-3xl font-bold text-[#25243A] font-mono">{overrideCount}</div>
          <div className="text-sm text-[#77758F] mt-1 font-medium">Manual Overrides</div>
          <p className="text-xs text-[#77758F] mt-3 leading-relaxed">
            Adjusted directly by team leads in the Feedback Explorer.
          </p>
        </Card>
      </div>

      {/* Severity Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#25243A]">Inferred Severity Tiers</h2>
            <Badge variant="coral" size="sm">AI-Inferred</Badge>
          </div>
          <p className="text-xs text-[#77758F] mb-5">
            Severity classifications derived from sentiment indicators and risk keywords
          </p>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-[#E11D48]">High Severity (Critical / Fraud Allegations)</span>
                <span className="font-mono text-[#25243A]">{severity_distribution.high || 0} records</span>
              </div>
              <div className="w-full bg-[#F5F4FC] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#E11D48] to-[#F43F5E] h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, ((severity_distribution.high || 0) / Math.max(1, total_records)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-[#D97706]">Medium Severity (Operational Glitches, Delays)</span>
                <span className="font-mono text-[#25243A]">{severity_distribution.medium || 0} records</span>
              </div>
              <div className="w-full bg-[#F5F4FC] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, ((severity_distribution.medium || 0) / Math.max(1, total_records)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-[#059669]">Low Severity (Feature Praise, Routine Inquiries)</span>
                <span className="font-mono text-[#25243A]">{severity_distribution.low || 0} records</span>
              </div>
              <div className="w-full bg-[#F5F4FC] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#059669] to-[#10B981] h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, ((severity_distribution.low || 0) / Math.max(1, total_records)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Top Topic Signals */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[#25243A]">Extracted Key Topic Clusters</h2>
            <TrendingUp className="w-4 h-4 text-[#7357F6]" />
          </div>
          <p className="text-xs text-[#77758F] mb-5">
            Normalized topics extracted from validated Adaption JSON and baseline keywords
          </p>
          <div className="grid grid-cols-2 gap-3">
            {top_topics.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#F5F4FC] border border-[rgba(115,87,246,0.08)] hover:border-[rgba(115,87,246,0.24)] transition-colors">
                <div className="text-xs font-semibold text-[#25243A] truncate mb-2">{t.topic}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#77758F]">Frequency</span>
                  <span className="font-mono font-bold text-[#7357F6] text-sm">{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
