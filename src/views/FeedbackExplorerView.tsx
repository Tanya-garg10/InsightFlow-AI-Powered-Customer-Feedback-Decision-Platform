import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Eye
} from 'lucide-react';
import { FeedbackItem, SentimentType, SeverityType, ProvenanceType } from '../types';
import { api } from '../services/api';

interface FeedbackExplorerViewProps {
  onSelectFeedback: (item: FeedbackItem) => void;
  onOpenUpload: () => void;
  searchFilter: string;
}

export const FeedbackExplorerView: React.FC<FeedbackExplorerViewProps> = ({
  onSelectFeedback,
  onOpenUpload,
  searchFilter,
}) => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [localSearch, setLocalSearch] = useState(searchFilter);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedProvenance, setSelectedProvenance] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sync global search filter if changed in header
  useEffect(() => {
    if (searchFilter !== localSearch) {
      setLocalSearch(searchFilter);
      setPage(1);
    }
  }, [searchFilter]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.getFeedback({
        search: localSearch,
        category: selectedCategory,
        sentiment: selectedSentiment,
        severity: selectedSeverity,
        provenance: selectedProvenance,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [page, limit, selectedCategory, selectedSentiment, selectedSeverity, selectedProvenance, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadFeedback();
  };

  const getSentimentDot = (s?: string) => {
    switch (s) {
      case 'positive':
        return 'bg-emerald-500 text-emerald-700';
      case 'negative':
        return 'bg-rose-500 text-rose-700';
      case 'mixed':
        return 'bg-amber-500 text-amber-700';
      default:
        return 'bg-slate-400 text-slate-600';
    }
  };

  const getSeverityStyle = (sev?: string) => {
    switch (sev) {
      case 'high':
        return 'text-rose-700 font-semibold';
      case 'medium':
        return 'text-amber-700 font-medium';
      case 'low':
        return 'text-emerald-700 font-medium';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and audit all customer feedback records ({total} matching records).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => api.getReportExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search in review text, evidence, or summary..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sentiment */}
          <select
            value={selectedSentiment}
            onChange={(e) => { setSelectedSentiment(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="mixed">Mixed</option>
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={(e) => { setSelectedSeverity(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
            <option value="unknown">Unknown</option>
          </select>

          {/* Provenance */}
          <select
            value={selectedProvenance}
            onChange={(e) => { setSelectedProvenance(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="all">All Provenance</option>
            <option value="adapted_dataset">Adaption Dataset</option>
            <option value="transparent_baseline">Transparent Baseline</option>
            <option value="manual_override">Manual Override</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4 min-w-[320px]">Customer Review</th>
                <th className="py-3 px-4 min-w-[140px]">Category</th>
                <th className="py-3 px-4 w-28">Sentiment</th>
                <th className="py-3 px-4 w-24">Severity</th>
                <th className="py-3 px-4 min-w-[140px]">Provenance</th>
                <th className="py-3 px-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading customer feedback records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No feedback matching current filters. Try resetting search or category filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectFeedback(item)}
                    className="hover:bg-indigo-50/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="line-clamp-2 text-slate-900 leading-relaxed font-sans">
                        "{item.review}"
                      </p>
                      {item.issue_summary && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          Summary: {item.issue_summary}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getSentimentDot(item.sentiment).split(' ')[0]}`} />
                        <span className={getSentimentDot(item.sentiment).split(' ')[1]}>
                          {item.sentiment || 'neutral'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={getSeverityStyle(item.severity)}>
                        {item.severity || 'low'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {item.provenance === 'adapted_dataset' ? (
                        <span className="text-violet-700 font-medium">Adaption Test</span>
                      ) : item.provenance === 'manual_override' ? (
                        <span className="text-emerald-700 font-medium">User Override</span>
                      ) : (
                        <span className="text-slate-500">Local Baseline</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectFeedback(item); }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="View Full Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-medium text-slate-800">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-mono font-medium text-slate-800">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-mono font-medium text-slate-800">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`p-1.5 rounded-md border border-slate-200 transition-colors ${
                page <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600 font-mono">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`p-1.5 rounded-md border border-slate-200 transition-colors ${
                page >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
