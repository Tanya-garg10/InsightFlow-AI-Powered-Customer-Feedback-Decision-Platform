import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { FeedbackItem } from '../types';
import { api } from '../services/api';
import { Card, Badge, CategoryBadge, SentimentBadge, SeverityBadge, Button, Loading } from '../components/ui';

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

  const clearFilters = () => {
    setLocalSearch('');
    setSelectedCategory('all');
    setSelectedSentiment('all');
    setSelectedSeverity('all');
    setSelectedProvenance('all');
    setPage(1);
  };

  const hasActiveFilters = localSearch || selectedCategory !== 'all' || selectedSentiment !== 'all' || selectedSeverity !== 'all' || selectedProvenance !== 'all';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 fade-up">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#25243A] tracking-tight">Feedback Explorer</h1>
          <p className="text-sm text-[#77758F] mt-2 max-w-xl">
            Browse, search, and audit all customer feedback records ({total} matching records).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => api.getReportExport('csv')}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button onClick={onOpenUpload}>
            <Upload className="w-4 h-4" />
            <span>Upload New CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8A6BF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search in review text, evidence, or summary..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 focus:border-[#7357F6] transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A6BF] hover:text-[#25243A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[rgba(115,87,246,0.08)]">
          <div className="flex items-center gap-2 text-xs text-[#77758F]">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
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
            className="px-3 py-2 text-sm bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
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
            className="px-3 py-2 text-sm bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
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
            className="px-3 py-2 text-sm bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 text-[#25243A]"
          >
            <option value="all">All Provenance</option>
            <option value="adapted_dataset">Adaption Dataset</option>
            <option value="transparent_baseline">Transparent Baseline</option>
            <option value="manual_override">Manual Override</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-[#E11D48] hover:bg-[#FFF1F2] rounded-xl transition-colors"
            >
              Clear all
            </button>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-[#77758F]">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
              className="px-2 py-1.5 bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-lg focus:outline-none text-[#25243A]"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Feedback Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F4FC] border-b border-[rgba(115,87,246,0.08)] text-[11px] font-semibold text-[#77758F] uppercase tracking-wider">
                <th className="py-4 px-5 w-20">ID</th>
                <th className="py-4 px-5 min-w-[340px]">Customer Review</th>
                <th className="py-4 px-5 min-w-[140px]">Category</th>
                <th className="py-4 px-5 w-28">Sentiment</th>
                <th className="py-4 px-5 w-24">Severity</th>
                <th className="py-4 px-5 min-w-[140px]">Provenance</th>
                <th className="py-4 px-5 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(115,87,246,0.08)] text-sm text-[#25243A]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loading message="Loading customer feedback records..." />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#77758F]">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-8 h-8 text-[#A8A6BF]" />
                      <p>No feedback matching current filters.</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-[#7357F6] font-medium hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectFeedback(item)}
                    className="hover:bg-[#F5F4FC] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono text-[11px] text-[#77758F]">
                      {item.id}
                    </td>
                    <td className="py-4 px-5 max-w-md">
                      <p className="line-clamp-2 text-[#25243A] leading-relaxed font-medium">
                        "{item.review}"
                      </p>
                      {item.issue_summary && (
                        <p className="text-xs text-[#77758F] mt-1.5 line-clamp-1">
                          {item.issue_summary}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="py-4 px-5">
                      <SentimentBadge sentiment={item.sentiment || 'neutral'} />
                    </td>
                    <td className="py-4 px-5">
                      <SeverityBadge severity={item.severity || 'low'} />
                    </td>
                    <td className="py-4 px-5 text-xs">
                      <Badge variant={item.provenance === 'adapted_dataset' ? 'violet' : item.provenance === 'manual_override' ? 'mint' : 'default'} size="sm">
                        {item.provenance === 'adapted_dataset' ? 'Adaption' : item.provenance === 'manual_override' ? 'Override' : 'Baseline'}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectFeedback(item); }}
                        className="p-2 text-[#77758F] hover:text-[#7357F6] hover:bg-[#EEE9FF] rounded-lg transition-colors"
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
        <div className="p-4 border-t border-[rgba(115,87,246,0.08)] flex items-center justify-between text-xs text-[#77758F]">
          <div>
            Showing <span className="font-mono font-medium text-[#25243A]">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-mono font-medium text-[#25243A]">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-mono font-medium text-[#25243A]">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[#25243A] font-mono px-2">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
