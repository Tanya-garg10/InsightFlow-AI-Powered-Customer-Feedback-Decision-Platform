import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { Sparkles, ShieldAlert, Cpu, AlertTriangle, Layers, Info } from 'lucide-react';
import { OverviewAnalytics } from '../types';

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Insights & Methodology</h1>
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200/70 rounded px-2 py-0.5">
              Adaption + Transparent Baseline
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Auditing inferred sentiment, severity levels, and provenance breakdown across customer reviews.
          </p>
        </div>

        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'Re-running pipeline...' : 'Re-run Analysis Pipeline'}</span>
        </button>
      </div>

      {/* Methodology Alert Banner */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-200/60 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed space-y-1">
          <div className="font-semibold text-slate-900">Analysis Provenance Principles:</div>
          <div>
            1. <strong>Adaption Enriched Dataset:</strong> Used wherever available from completed test runs ({adaptedCount} records). Parses structured JSON outputs including severity and recommended actions.
          </div>
          <div>
            2. <strong>Transparent Heuristic Baseline:</strong> Transparent, documented keyword/polarity heuristic applied to remaining feedback ({baselineCount} records). No paid API key required.
          </div>
          <div>
            3. <strong>Zero Ground-Truth Overclaim:</strong> We do not treat AI-inferred sentiment or customer allegations as legally verified facts.
          </div>
        </div>
      </div>

      {/* Provenance Card Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase">
            <span>Adaption Dataset</span>
            <Cpu className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{adaptedCount} records</div>
          <div className="text-xs text-violet-700 font-medium mt-1">
            {adaptedPercentage}% of total feedback
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fine-tuned completions validated against original review context.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase">
            <span>Transparent Baseline</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{baselineCount} records</div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            {total_records > 0 ? (100 - adaptedPercentage).toFixed(1) : 0}% of total feedback
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Lightweight heuristic fallback preserving full operational coverage.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 uppercase">
            <span>Manual Overrides</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{overrideCount} records</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            Human-in-the-loop review
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Adjusted directly by team leads in the Feedback Explorer.
          </p>
        </div>
      </div>

      {/* Severity Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Inferred Severity Tiers</h2>
          <p className="text-xs text-slate-400 mb-4">
            Severity classifications derived from sentiment indicators and risk keywords
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700">High Severity (Critical / Fraud Allegations)</span>
                <span className="font-mono text-slate-700">{severity_distribution.high || 0} records</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((severity_distribution.high || 0) / Math.max(1, total_records)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700">Medium Severity (Operational Glitches, Delays)</span>
                <span className="font-mono text-slate-700">{severity_distribution.medium || 0} records</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((severity_distribution.medium || 0) / Math.max(1, total_records)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700">Low Severity (Feature Praise, Routine Inquiries)</span>
                <span className="font-mono text-slate-700">{severity_distribution.low || 0} records</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((severity_distribution.low || 0) / Math.max(1, total_records)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Topic Signals */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Extracted Key Topic Clusters</h2>
          <p className="text-xs text-slate-400 mb-4">
            Normalized topics extracted from validated Adaption JSON and baseline keywords
          </p>
          <div className="grid grid-cols-2 gap-3">
            {top_topics.map((t, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="text-xs font-semibold text-slate-800 truncate">{t.topic}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Frequency</span>
                  <span className="font-mono font-bold text-indigo-600">{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
