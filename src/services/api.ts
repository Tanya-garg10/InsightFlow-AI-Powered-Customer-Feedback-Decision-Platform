import { FeedbackItem, IssueItem, RecommendationItem, DatasetMeta, OverviewAnalytics } from '../types';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getDatasets(): Promise<{ datasets: DatasetMeta[]; total_feedback_count: number }> {
    const res = await fetch('/api/datasets');
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return res.json();
  },

  async getFeedback(params: {
    search?: string;
    category?: string;
    sentiment?: string;
    severity?: string;
    provenance?: string;
    dataset_id?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{
    items: FeedbackItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    categories: string[];
  }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.sentiment) query.set('sentiment', params.sentiment);
    if (params.severity) query.set('severity', params.severity);
    if (params.provenance) query.set('provenance', params.provenance);
    if (params.dataset_id) query.set('dataset_id', params.dataset_id);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);

    const res = await fetch(`/api/feedback?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch feedback records');
    return res.json();
  },

  async updateFeedback(id: string, updates: Partial<FeedbackItem>): Promise<{ item: FeedbackItem }> {
    const res = await fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update feedback item');
    return res.json();
  },

  async getOverviewAnalytics(): Promise<OverviewAnalytics> {
    const res = await fetch('/api/analytics/overview');
    if (!res.ok) throw new Error('Failed to fetch overview analytics');
    return res.json();
  },

  async runAnalysis(mode: 'prefer_adapted' | 'local_heuristic' = 'prefer_adapted') {
    const res = await fetch('/api/analysis/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error('Failed to run analysis');
    return res.json();
  },

  async uploadDataset(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/datasets/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload dataset');
    }
    return res.json();
  },

  async importAdaption(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/adaption/import', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Import failed' }));
      throw new Error(err.error || 'Failed to import Adaption file');
    }
    return res.json();
  },

  async getIssues(params?: { status?: string; category?: string; search?: string }): Promise<{ issues: IssueItem[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/issues?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

  async createIssue(issue: Partial<IssueItem>): Promise<{ issue: IssueItem }> {
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    });
    if (!res.ok) throw new Error('Failed to create issue');
    return res.json();
  },

  async updateIssue(id: string, updates: Partial<IssueItem>): Promise<{ issue: IssueItem }> {
    const res = await fetch(`/api/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update issue');
    return res.json();
  },

  async getRecommendations(params?: { category?: string; priority?: string; status?: string }): Promise<{ recommendations: RecommendationItem[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/recommendations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async updateRecommendationStatus(id: string, status: 'under_review' | 'accepted' | 'rejected') {
    const res = await fetch(`/api/recommendations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update recommendation status');
    return res.json();
  },

  async getReportExport(format: 'json' | 'csv' | 'json_adapted' = 'json') {
    if (format === 'csv') {
      window.open('/api/reports/export?format=csv', '_blank');
      return;
    }
    const res = await fetch(`/api/reports/export?format=${format}`);
    if (!res.ok) throw new Error('Failed to export report');
    return res.json();
  },

  async getAdaptionLab(): Promise<{
    dataset: any;
    total_rows: number;
    valid_json_count: number;
    parsing_errors_count: number;
    missing_fields_count: number;
    valid_json_percentage: number;
    category_distribution: Array<{ category: string; count: number; percentage: number }>;
    parsing_errors: Array<{ review: string; category: string; error: string }>;
    warning_rows: Array<{ review: string; category: string; missing_fields: string[] }>;
    example_analyses: Array<{ review: string; category: string; analysis: any }>;
  }> {
    const res = await fetch('/api/adaption/lab');
    if (!res.ok) throw new Error('Failed to fetch Adaption Lab data');
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },
};
