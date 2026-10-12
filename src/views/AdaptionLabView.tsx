import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Layers,
  Code,
  RefreshCw,
  Tag,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DatasetMeta, FeedbackItem } from '../types';
import { api } from '../services/api';

interface AdaptionLabViewProps {
  datasets: DatasetMeta[];
  feedback: FeedbackItem[];
  onOpenUpload: () => void;
}

interface LabData {
  dataset: DatasetMeta | null;
  total_rows: number;
  valid_json_count: number;
  parsing_errors_count: number;
  missing_fields_count: number;
  valid_json_percentage: number;
  category_distribution: Array<{ category: string; count: number; percentage: number }>;
  parsing_errors: Array<{ review: string; category: string; error: string }>;
  warning_rows: Array<{ review: string; category: string; missing_fields: string[] }>;
  example_analyses: Array<{ review: string; category: string; analysis: any }>;
}

export const AdaptionLabView: React.FC<AdaptionLabViewProps> = ({
  datasets,
  feedback,
  onOpenUpload,
}) => {
  const [labData, setLabData] = useState<LabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'errors'>('overview');

  const originalDataset = datasets.find(d => d.type === 'original');

  const loadLabData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdaptionLab();
      setLabData(data);
      setSelectedExampleIndex(0);
    } catch (err: any) {
      setError(err.message || 'Failed to load Adaption Lab data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabData();
  }, []);

  const adaptedFeedbackCount = feedback.filter(f => f.provenance === 'adapted_dataset').length;
  const totalFeedbackCount = feedback.length;
  const coveragePercentage = totalFeedbackCount > 0
    ? Math.round((adaptedFeedbackCount / totalFeedbackCount) * 1000) / 10
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Adaption Integration Lab</h1>
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200/70 rounded px-2 py-0.5">
              Dataset Quality Inspector
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Live validation of Adaption-generated JSON completions against original customer feedback records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLabData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Adaption CSV</span>
          </button>
        </div>
      </div>

      {/* Workflow Explanation */}
      <div className="p-5 bg-gradient-to-r from-violet-50/60 to-indigo-50/40 border border-violet-200/70 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
          <FlaskConical className="w-4 h-4 text-violet-600" />
          <span>How Adaption Contributes to InsightFlow</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Adaption runs structured dataset-enhancement jobs that transform raw customer reviews into normalized JSON with sentiment, issue summaries, severity ratings, evidence quotes, and recommended actions.
          This lab inspects the actual generated outputs, validates schema adherence, tracks coverage, and pairs adapted analyses with source reviews.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-1">
          <span className="flex items-center gap-1 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            1. Raw Feedback ({originalDataset ? originalDataset.total_rows.toLocaleString() : '—'} rows from original dataset)
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            2. Adaption Analysis ({labData ? labData.total_rows : '—'} adapted rows)
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            3. Validated JSON Ingestion &amp; Match to Original Records
          </span>
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading Adaption Lab data...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && labData && (
        <>
          {/* 4 Computed Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Original Row Count */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Original Dataset Rows
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">
                {originalDataset ? originalDataset.total_rows.toLocaleString() : (
                  <span className="text-slate-400 text-lg">Not loaded</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {originalDataset?.filename || 'Upload an original dataset to enable full analytics'}
              </div>
            </div>

            {/* Adapted Row Count */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Adapted Output Rows
              </div>
              <div className="text-3xl font-extrabold text-violet-700 font-mono">
                {labData.total_rows > 0 ? labData.total_rows : (
                  <span className="text-slate-400 text-lg">None yet</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {labData.total_rows > 0
                  ? `${labData.valid_json_count} valid completions parsed`
                  : 'Upload an Adaption CSV to populate'}
              </div>
            </div>

            {/* Valid JSON Rate */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Valid JSON Rate
              </div>
              <div className={`text-3xl font-extrabold font-mono ${labData.total_rows > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                {labData.total_rows > 0 ? `${labData.valid_json_percentage}%` : 'N/A'}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <span className="text-rose-500">{labData.parsing_errors_count} parse errors</span>
                {labData.missing_fields_count > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-amber-600">{labData.missing_fields_count} missing fields</span>
                  </>
                )}
              </div>
            </div>

            {/* Dataset Coverage */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Dataset Coverage
              </div>
              <div className="text-3xl font-extrabold text-indigo-600 font-mono">
                {coveragePercentage > 0 ? `${coveragePercentage}%` : (
                  <span className="text-slate-300 text-lg">—</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {adaptedFeedbackCount.toLocaleString()} of {totalFeedbackCount.toLocaleString()} feedback records enriched
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="p-1 bg-slate-100 rounded-lg flex items-center gap-1 max-w-md">
            {(['overview', 'examples', 'errors'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'overview' ? 'Category Overview' : tab === 'examples' ? 'Example Analyses' : `Errors (${labData.parsing_errors_count})`}
              </button>
            ))}
          </div>

          {/* Tab: Category Overview */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Adapted Dataset Category Distribution</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual count of adapted rows per category — {labData.total_rows} total rows imported
                </p>
              </div>

              {labData.category_distribution.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No adapted data loaded. Import an Adaption CSV file to see category breakdown.
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={labData.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                                  <div className="font-semibold">{d.category}</div>
                                  <div className="text-slate-300 mt-1">{d.count} rows ({d.percentage}%)</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {labData.category_distribution.map((cat) => (
                      <div key={cat.category} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-violet-400" />
                          <span className="font-medium text-slate-800">{cat.category}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="font-mono">{cat.count} rows</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-violet-700">{cat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Coverage disclaimer */}
              {originalDataset && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Limited Coverage:</strong> The adapted dataset contains {labData.total_rows} rows out of {originalDataset.total_rows.toLocaleString()} original records
                    ({originalDataset.total_rows > 0 ? Math.round(labData.total_rows / originalDataset.total_rows * 1000) / 10 : 0}% coverage).
                    Sentiment, severity, and recommendations for the remaining {(originalDataset.total_rows - adaptedFeedbackCount).toLocaleString()} reviews
                    are generated by the transparent baseline heuristic, <em>not</em> Adaption. Do not treat overall analytics as Adaption-validated output.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Example Analyses */}
          {activeTab === 'examples' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Original Review vs. Adaption Enriched Output</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Side-by-side inspection of source text and AI-generated schema components. Labels are inferred, not verified ground truth.
                </p>
              </div>

              {labData.example_analyses.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No valid Adaption completions found. Import your Adaption CSV to see live side-by-side comparisons.
                </div>
              ) : (
                <>
                  {/* Example navigator buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {labData.example_analyses.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedExampleIndex(idx)}
                        className={`px-3 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
                          selectedExampleIndex === idx
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Source */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Source Review &amp; Category
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-xs text-slate-500">
                          Category: <span className="text-slate-800 font-medium">
                            {labData.example_analyses[selectedExampleIndex]?.category}
                          </span>
                        </div>
                        <div className="text-sm text-slate-900 leading-relaxed font-medium">
                          "{labData.example_analyses[selectedExampleIndex]?.review}"
                        </div>
                      </div>
                    </div>

                    {/* Right: Parsed JSON */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-violet-900 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-violet-600" />
                          Parsed Adaption Output
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200/60">
                          AI-Inferred · Not Ground Truth
                        </span>
                      </div>
                      <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                        {(() => {
                          const a = labData.example_analyses[selectedExampleIndex]?.analysis;
                          if (!a) return null;
                          return (
                            <>
                              <div>
                                <span className="text-violet-400">sentiment</span>: <span className="text-emerald-400">"{a.sentiment}"</span>
                              </div>
                              <div>
                                <span className="text-violet-400">severity</span>: <span className="text-amber-400">"{a.severity}"</span>
                              </div>
                              <div>
                                <span className="text-violet-400">issue_summary</span>: <span className="text-slate-300 break-words">"{a.issue_summary}"</span>
                              </div>
                              <div>
                                <span className="text-violet-400">key_topics</span>: [
                                {(a.key_topics || []).map((t: string, i: number) => (
                                  <span key={i} className="text-sky-300">"{t}"{i < a.key_topics.length - 1 ? ', ' : ''}</span>
                                ))}
                                ]
                              </div>
                              <div>
                                <span className="text-violet-400">evidence</span>: <span className="text-slate-300">"{a.evidence}"</span>
                              </div>
                              <div>
                                <span className="text-violet-400">recommended_action</span>: <span className="text-amber-300 break-words">"{a.recommended_action}"</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Evaluation Caution:</strong> Adaption outputs are AI-generated inferences, not verified ground truth. Sentiment, severity, and recommended actions represent algorithmic signals that require human review before acting on them operationally.
                  {labData.total_rows > 0 && originalDataset && (
                    <span> The {labData.total_rows}-row adapted sample covers approximately {Math.round(labData.total_rows / originalDataset.total_rows * 100)}% of the {originalDataset.total_rows.toLocaleString()}-row original dataset.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Errors */}
          {activeTab === 'errors' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Parsing Errors &amp; Validation Warnings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rows where <code className="bg-slate-100 px-1 rounded">enhanced_completion</code> could not be parsed or had missing required fields.
                </p>
              </div>

              {/* Summary row */}
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                  <span className="font-semibold text-rose-700">{labData.parsing_errors_count}</span>
                  <span className="text-rose-600 ml-1">parse errors</span>
                </div>
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <span className="font-semibold text-amber-700">{labData.missing_fields_count}</span>
                  <span className="text-amber-600 ml-1">rows with missing fields</span>
                </div>
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <span className="font-semibold text-emerald-700">{labData.valid_json_count}</span>
                  <span className="text-emerald-600 ml-1">valid completions ({labData.valid_json_percentage}%)</span>
                </div>
              </div>

              {/* Parse errors */}
              {labData.parsing_errors.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Rows with JSON Parse Errors:</div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {labData.parsing_errors.map((err, idx) => (
                      <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-start gap-2 text-xs bg-white">
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-500 mb-0.5">{err.category}</div>
                          <div className="text-slate-800 font-medium truncate">"{err.review}"</div>
                        </div>
                        <div className="flex items-start gap-1.5 text-rose-600 shrink-0">
                          <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="font-mono text-[11px]">{err.error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-700 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No JSON parse errors — all completions parsed successfully.</span>
                </div>
              )}

              {/* Missing field warnings */}
              {labData.warning_rows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Rows with Missing Required Fields:</div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {labData.warning_rows.map((row, idx) => (
                      <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-start gap-2 text-xs bg-white">
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-500 mb-0.5">{row.category}</div>
                          <div className="text-slate-800 font-medium truncate">"{row.review}"</div>
                        </div>
                        <div className="flex items-start gap-1.5 text-amber-600 shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="font-mono text-[11px]">missing: {row.missing_fields?.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {labData.parsing_errors.length === 0 && labData.warning_rows.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {labData.total_rows === 0
                    ? 'No adapted data loaded yet. Import an Adaption CSV to see quality stats.'
                    : 'All rows parsed successfully with no validation warnings.'}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
