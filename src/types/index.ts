export type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed' | 'unassigned';
export type SeverityType = 'low' | 'medium' | 'high' | 'unknown';
export type ProvenanceType = 'adapted_dataset' | 'transparent_baseline' | 'manual_override' | 'unassigned';

export interface FeedbackItem {
  id: string;
  review: string;
  category: string;
  sentiment?: SentimentType;
  issue_summary?: string;
  key_topics?: string[];
  severity?: SeverityType;
  recommended_action?: string;
  evidence?: string;
  provenance: ProvenanceType;
  analysis_status: 'analyzed' | 'pending' | 'warning';
  validation_warning?: string;
  dataset_id: string;
  created_at: string;
}

export interface IssueItem {
  id: string;
  title: string;
  category: string;
  frequency: number;
  severity: SeverityType;
  severity_weight: number;
  evidence_quality_score: number;
  priority_score: number;
  suggested_action: string;
  supporting_evidence: string[];
  example_reviews: string[];
  status: 'Open' | 'In Progress' | 'Resolved';
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationItem {
  id: string;
  problem_addressed: string;
  category: string;
  suggested_action: string;
  why_suggested: string;
  expected_impact_direction: string;
  suggested_next_step: string;
  limitations: string;
  priority: 'low' | 'medium' | 'high';
  status: 'under_review' | 'accepted' | 'rejected';
  supporting_review_examples: string[];
  confidence_indicator: 'high' | 'medium' | 'low';
}

export interface DatasetMeta {
  id: string;
  name: string;
  type: 'original' | 'adapted' | 'custom';
  filename: string;
  total_rows: number;
  unique_reviews: number;
  unique_review_category_combos: number;
  has_adapted_analysis: boolean;
  adapted_valid_json_count?: number;
  adapted_parsing_errors?: number;
  uploaded_at: string;
}

export interface OverviewAnalytics {
  total_records: number;
  unique_reviews: number;
  unique_review_category_combos: number;
  duplicate_records_count: number;
  category_distribution: Array<{ category: string; count: number; percentage: number }>;
  sentiment_distribution: Array<{ sentiment: string; count: number; percentage: number }>;
  severity_distribution: Record<string, number>;
  top_topics: Array<{ topic: string; count: number }>;
  provenance_distribution: Record<string, number>;
  high_priority_issues: IssueItem[];
  recent_feedback: FeedbackItem[];
  recommendations_count: number;
  datasets_count: number;
}
