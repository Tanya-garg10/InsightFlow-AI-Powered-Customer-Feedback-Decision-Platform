import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { OverviewAnalytics, IssueItem, RecommendationItem } from '../types';
import { api } from '../services/api';

interface ReportsViewProps {
  analytics: OverviewAnalytics | null;
  issues: IssueItem[];
  recommendations: RecommendationItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  analytics,
  issues,
  recommendations,
}) => {
  if (!analytics) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    api.getReportExport('csv');
  };

  const handleExportJSON = async () => {
    const data = await api.getReportExport('json');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insightflow_decision_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAdaptedJSON = async () => {
    const data = await api.getReportExport('json_adapted');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insightflow_adapted_analysis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Action Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Intelligence Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Downloadable audit reports and formatted printable briefs for leadership decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Full JSON</span>
          </button>
          <button
            onClick={handleExportAdaptedJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-violet-600" />
            <span>Export Adapted JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report View</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-indigo-600">
              InsightFlow Executive Intelligence Summary
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Customer Feedback & Operational Decision Audit
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Generated: {new Date().toLocaleDateString()} · Platform Version 2026.1 · Frontend Arena Build Battle
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-700">CONFIDENTIAL</div>
            <div className="text-[11px] text-slate-400">Internal Decision Brief</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            1. Dataset Volume & Composition
          </h3>
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400">Total Feedback Ingested</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {analytics.total_records}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Unique Reviews</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {analytics.unique_reviews}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Unique Review-Category Pairs</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {analytics.unique_review_category_combos}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Recorded Duplicates</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {analytics.duplicate_records_count}
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            2. Category Volume Breakdown
          </h3>
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">Volume</th>
                <th className="p-2.5 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.category_distribution.map((cat) => (
                <tr key={cat.category}>
                  <td className="p-2.5 font-medium text-slate-800">{cat.category}</td>
                  <td className="p-2.5 text-right font-mono text-slate-700">{cat.count}</td>
                  <td className="p-2.5 text-right font-mono text-slate-700">{cat.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sentiment Summary with Inference Caveat */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
            3. AI-Inferred Sentiment Distribution
          </h3>
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 mb-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Caveat:</strong> Sentiment classifications are algorithmic inferences derived via Adaption fine-tuning and transparent local polarity heuristics. They represent indicative distributions rather than audited human ratings.
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {analytics.sentiment_distribution.map((s) => (
              <div key={s.sentiment} className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="capitalize font-semibold text-slate-700">{s.sentiment}</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">{s.count}</div>
                <div className="text-[11px] text-slate-400">{s.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recurring Issues */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            4. Top Urgent Issues (Heuristic Ranked)
          </h3>
          <div className="space-y-3">
            {issues.slice(0, 5).map((iss, idx) => (
              <div key={iss.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{idx + 1}. {iss.title} ({iss.category})</span>
                  <span className="font-mono text-indigo-700">Priority Score: {iss.priority_score}/100</span>
                </div>
                <p className="text-slate-600 mt-1">
                  <strong>Suggested Action:</strong> {iss.suggested_action}
                </p>
                {iss.example_reviews.length > 0 && (
                  <p className="text-slate-500 mt-1 italic">
                    Example: "{iss.example_reviews[0]}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
            5. Recommended Strategic Next Steps
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3.5 bg-indigo-50/30 rounded-lg border border-indigo-100 text-xs space-y-1">
                <div className="font-bold text-indigo-950">
                  {rec.category}: {rec.suggested_action}
                </div>
                <div className="text-slate-700">
                  <strong>Rationale:</strong> {rec.why_suggested}
                </div>
                <div className="text-emerald-700">
                  <strong>Expected Impact:</strong> {rec.expected_impact_direction}
                </div>
                <div className="text-slate-500 text-[11px]">
                  <strong>Team Status:</strong> {rec.status.replace('_', ' ')} · <strong>Limitations:</strong> {rec.limitations}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 leading-relaxed">
          <strong>InsightFlow Ethical & Methodology Assurance:</strong> All values presented in this report originate directly from uploaded customer feedback datasets. No data or customer identities have been fabricated. Fraud allegations reflect customer reports and require formal financial investigation prior to legal attribution.
        </div>
      </div>
    </div>
  );
};
