import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data folder exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Multer upload setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Types & Interfaces
export interface FeedbackItem {
  id: string;
  review: string;
  category: string;
  // Analysis fields
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed' | 'unassigned';
  issue_summary?: string;
  key_topics?: string[];
  severity?: 'low' | 'medium' | 'high' | 'unknown';
  recommended_action?: string;
  evidence?: string;
  provenance: 'adapted_dataset' | 'transparent_baseline' | 'manual_override' | 'unassigned';
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
  severity: 'low' | 'medium' | 'high' | 'unknown';
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

// In-Memory store backed by SQLite/JSON file for persistence
interface DBStore {
  datasets: DatasetMeta[];
  feedback: FeedbackItem[];
  issues: IssueItem[];
  recommendations: RecommendationItem[];
  settings: {
    analysis_mode: 'prefer_adapted' | 'local_heuristic';
    confidence_threshold: number;
  };
}

const DB_FILE = path.join(DATA_DIR, 'insightflow_db.json');

// Helper to parse standard CSV line respecting quotes
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(current.trim());
      current = '';
      if (row.length > 0 && row.some(col => col.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some(col => col.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

// Clean markdown code blocks from JSON string
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown ```json ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  // If quotes are doubled like ""sentiment""
  if (cleaned.includes('""')) {
    cleaned = cleaned.replace(/""/g, '"');
  }
  return cleaned.trim();
}

// Transparent baseline heuristic for records without adapted analysis
function runTransparentBaseline(review: string, category: string): {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  issue_summary: string;
  key_topics: string[];
  severity: 'low' | 'medium' | 'high' | 'unknown';
  recommended_action: string;
  evidence: string;
} {
  const text = review.toLowerCase();

  const positiveWords = ['great', 'excellent', 'love', 'helpful', 'promptly', 'exceeded', 'perfect', 'exceptional', 'satisfied', 'innovative', 'smooth', 'durable', 'valuable', 'best', 'good', 'faster', 'useful', 'responsive', 'worth'];
  const negativeWords = ['scam', 'fraud', 'defective', 'unresponsive', 'unhelpful', 'unresolved', 'delayed', 'damaged', 'crashing', 'glitches', 'counterfeit', 'disappointed', 'terrible', 'failed', 'missing', 'fake', 'stolen', 'charged'];
  const highSeverityWords = ['fraud', 'scam', 'counterfeit', 'charged multiple times', 'never received', 'stolen', 'unauthorized', 'legal'];
  const mediumSeverityWords = ['delayed', 'damaged', 'defects', 'wrong items', 'glitches', 'crashing', 'unresponsive', 'unresolved'];

  let posCount = 0;
  let negCount = 0;

  for (const w of positiveWords) {
    if (text.includes(w)) posCount++;
  }
  for (const w of negativeWords) {
    if (text.includes(w)) negCount++;
  }

  let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
  if (posCount > 0 && negCount > 0) {
    sentiment = 'mixed';
  } else if (posCount > negCount) {
    sentiment = 'positive';
  } else if (negCount > posCount) {
    sentiment = 'negative';
  }

  let severity: 'low' | 'medium' | 'high' | 'unknown' = 'low';
  if (highSeverityWords.some(w => text.includes(w))) {
    severity = 'high';
  } else if (mediumSeverityWords.some(w => text.includes(w))) {
    severity = 'medium';
  } else if (sentiment === 'positive') {
    severity = 'low';
  } else {
    severity = 'unknown';
  }

  // Key topics heuristic
  const key_topics: string[] = [];
  if (category === 'Fraud and Scam' || text.includes('scam') || text.includes('fraud') || text.includes('counterfeit')) {
    key_topics.push('Fraud Allegation', 'Seller Integrity');
  }
  if (category === 'Operational Issues' || text.includes('delivery') || text.includes('delayed') || text.includes('website') || text.includes('crashing')) {
    key_topics.push('Order Logistics', 'Website Reliability');
  }
  if (category === 'Customer Service' || text.includes('support') || text.includes('representative') || text.includes('agent')) {
    key_topics.push('Support Response', 'Resolution Speed');
  }
  if (category === 'Product Feedback' || text.includes('quality') || text.includes('design') || text.includes('features')) {
    key_topics.push('Product Quality', 'Feature Utility');
  }
  if (key_topics.length === 0) {
    key_topics.push('General Feedback');
  }

  // Recommended Action
  let recommended_action = 'Monitor feedback pattern for recurring indicators.';
  if (severity === 'high') {
    recommended_action = 'Escalate to Trust & Safety team for manual transaction and seller log review.';
  } else if (severity === 'medium') {
    recommended_action = 'Log with logistics or engineering team to investigate operational bottlenecks.';
  } else if (sentiment === 'positive') {
    recommended_action = 'Share positive customer feedback with product team and document as operational benchmark.';
  }

  return {
    sentiment,
    issue_summary: `Customer feedback regarding ${category.toLowerCase()}: ${review.slice(0, 80)}${review.length > 80 ? '...' : ''}`,
    key_topics: key_topics.slice(0, 3),
    severity,
    recommended_action,
    evidence: review.slice(0, 120),
  };
}

// In-Memory Database holder
let db: DBStore = {
  datasets: [],
  feedback: [],
  issues: [],
  recommendations: [],
  settings: {
    analysis_mode: 'prefer_adapted',
    confidence_threshold: 0.75,
  },
};

// Persistence functions
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      console.log(`Loaded persisted DB with ${db.feedback.length} feedback items, ${db.datasets.length} datasets.`);
      return;
    }
  } catch (err) {
    console.warn('Could not read existing db file, initializing fresh:', err);
  }
  initializeDefaultDatasets();
}

// Initialize from default datasets in /data
// Detailed store for Adaption Lab inspection
interface AdaptionLabEntry {
  review: string;
  category: string;
  isValid: boolean;
  json?: {
    sentiment: string;
    issue_summary: string;
    key_topics: string[];
    severity: string;
    recommended_action: string;
    evidence: string;
  };
  error?: string;
  missing_fields?: string[];
}

let adaptionLabStore: AdaptionLabEntry[] = [];

function initializeDefaultDatasets() {
  // Try canonical name first, then friendly name
  const originalPath = fs.existsSync(path.join(DATA_DIR, 'ORIGINAL DATASET.csv'))
    ? path.join(DATA_DIR, 'ORIGINAL DATASET.csv')
    : path.join(DATA_DIR, 'BuildBattle_2026_Customer_Feedback_Dataset.csv');

  // Use the Adaption_Adapted file
  const adaptedPath = path.join(DATA_DIR, 'Adaption_Adapted_Feedback_Dataset.csv');

  let adaptedMap = new Map<string, any>();
  let adaptedValidJsonCount = 0;
  let adaptedParsingErrors = 0;

  // 1. Ingest adapted dataset first if available
  adaptionLabStore = [];

  if (fs.existsSync(adaptedPath)) {
    try {
      const content = fs.readFileSync(adaptedPath, 'utf-8');
      const rows = parseCSV(content);
      if (rows.length > 1) {
        const header = rows[0].map(h => h.toLowerCase());
        const reviewIdx = header.indexOf('review');
        const completionIdx = header.indexOf('enhanced_completion');
        const categoryIdx = header.indexOf('category');

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length <= reviewIdx) continue;
          const reviewText = row[reviewIdx];
          if (!reviewText.trim()) continue;
          const rawCompletion = completionIdx !== -1 ? row[completionIdx] : '';
          const category = categoryIdx !== -1 ? row[categoryIdx] : 'Product Feedback';

          if (!rawCompletion) {
            adaptedParsingErrors++;
            adaptionLabStore.push({ review: reviewText, category, isValid: false, error: 'empty enhanced_completion' });
            adaptedMap.set(reviewText.trim().toLowerCase(), { isValid: false, error: 'empty enhanced_completion' });
            continue;
          }

          try {
            const cleaned = cleanJsonString(rawCompletion);
            const parsed = JSON.parse(cleaned);

            // Validate required fields
            const missingFields: string[] = [];
            const REQUIRED = ['sentiment', 'issue_summary', 'key_topics', 'severity', 'recommended_action', 'evidence'];
            for (const f of REQUIRED) {
              if (!parsed[f]) missingFields.push(f);
            }

            const validSentiment = ['positive', 'negative', 'neutral', 'mixed'].includes(parsed.sentiment)
              ? parsed.sentiment
              : 'neutral';
            const validSeverity = ['low', 'medium', 'high', 'unknown'].includes(parsed.severity)
              ? parsed.severity
              : 'unknown';

            const entry = {
              sentiment: validSentiment,
              issue_summary: parsed.issue_summary || 'Analysis summary from Adaption',
              key_topics: Array.isArray(parsed.key_topics) ? parsed.key_topics : ['General'],
              severity: validSeverity,
              recommended_action: parsed.recommended_action || 'Review feedback against standards',
              evidence: parsed.evidence || reviewText,
              isValid: true,
            };

            adaptedMap.set(reviewText.trim().toLowerCase(), entry);
            adaptedValidJsonCount++;

            adaptionLabStore.push({
              review: reviewText,
              category,
              isValid: true,
              json: entry,
              missing_fields: missingFields.length > 0 ? missingFields : undefined,
            });
          } catch (jsonErr) {
            adaptedParsingErrors++;
            const errMsg = (jsonErr as Error).message;
            adaptedMap.set(reviewText.trim().toLowerCase(), { isValid: false, error: errMsg });
            adaptionLabStore.push({ review: reviewText, category, isValid: false, error: errMsg });
          }
        }

        const adaptedFilename = path.basename(adaptedPath);
        db.datasets.push({
          id: 'ds-adapted-test',
          name: `Adaption Adapted Dataset (${adaptedFilename})`,
          type: 'adapted',
          filename: adaptedFilename,
          total_rows: rows.length - 1,
          unique_reviews: new Set(rows.slice(1).map(r => r[reviewIdx])).size,
          unique_review_category_combos: new Set(rows.slice(1).map(r => `${r[reviewIdx]}||${r[categoryIdx] || ''}`)).size,
          has_adapted_analysis: true,
          adapted_valid_json_count: adaptedValidJsonCount,
          adapted_parsing_errors: adaptedParsingErrors,
          uploaded_at: new Date().toISOString(),
        });

        console.log(`Loaded adapted dataset: ${rows.length - 1} rows, ${adaptedValidJsonCount} valid JSON, ${adaptedParsingErrors} errors`);
      }
    } catch (err) {
      console.error('Error loading adapted dataset:', err);
    }
  }

  // 2. Ingest original dataset
  if (fs.existsSync(originalPath)) {
    try {
      const content = fs.readFileSync(originalPath, 'utf-8');
      const rows = parseCSV(content);
      if (rows.length > 1) {
        const header = rows[0].map(h => h.toLowerCase());
        const reviewIdx = header.indexOf('review');
        const categoryIdx = header.indexOf('category');

        const uniqueReviewsSet = new Set<string>();
        const uniqueCombosSet = new Set<string>();
        const feedbackItems: FeedbackItem[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length <= reviewIdx) continue;
          const reviewText = row[reviewIdx];
          const categoryText = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Product Feedback';

          uniqueReviewsSet.add(reviewText);
          uniqueCombosSet.add(`${reviewText}||${categoryText}`);

          const normalizedReview = reviewText.trim().toLowerCase();
          const adaptedMatch = adaptedMap.get(normalizedReview);

          let item: FeedbackItem;
          if (adaptedMatch && adaptedMatch.isValid) {
            item = {
              id: `fb-${i}`,
              review: reviewText,
              category: categoryText,
              sentiment: adaptedMatch.sentiment,
              issue_summary: adaptedMatch.issue_summary,
              key_topics: adaptedMatch.key_topics,
              severity: adaptedMatch.severity,
              recommended_action: adaptedMatch.recommended_action,
              evidence: adaptedMatch.evidence,
              provenance: 'adapted_dataset',
              analysis_status: 'analyzed',
              dataset_id: 'ds-original',
              created_at: new Date(Date.now() - (rows.length - i) * 60000).toISOString(),
            };
          } else {
            // Apply transparent baseline
            const baseline = runTransparentBaseline(reviewText, categoryText);
            item = {
              id: `fb-${i}`,
              review: reviewText,
              category: categoryText,
              sentiment: baseline.sentiment,
              issue_summary: baseline.issue_summary,
              key_topics: baseline.key_topics,
              severity: baseline.severity,
              recommended_action: baseline.recommended_action,
              evidence: baseline.evidence,
              provenance: 'transparent_baseline',
              analysis_status: 'analyzed',
              validation_warning: adaptedMatch && !adaptedMatch.isValid ? 'Malformed JSON in adapted run; baseline applied' : undefined,
              dataset_id: 'ds-original',
              created_at: new Date(Date.now() - (rows.length - i) * 60000).toISOString(),
            };
          }

          feedbackItems.push(item);
        }

        const originalFilename = path.basename(originalPath);
        const adaptedMatchCount = feedbackItems.filter(f => f.provenance === 'adapted_dataset').length;

        db.datasets.push({
          id: 'ds-original',
          name: 'BuildBattle 2026 Customer Feedback Dataset',
          type: 'original',
          filename: originalFilename,
          total_rows: feedbackItems.length,
          unique_reviews: uniqueReviewsSet.size,
          unique_review_category_combos: uniqueCombosSet.size,
          has_adapted_analysis: adaptedMatchCount > 0,
          adapted_valid_json_count: adaptedMatchCount,
          uploaded_at: new Date().toISOString(),
        });

        db.feedback = feedbackItems;
        generateDerivedIssuesAndRecommendations();
        console.log(`Loaded original dataset: ${feedbackItems.length} rows, ${adaptedMatchCount} matched to adapted analysis`);
      }
    } catch (err) {
      console.error('Error loading original dataset:', err);
    }
  } else if (adaptionLabStore.length > 0) {
    // No original dataset but adapted dataset available — use adapted rows as feedback items
    console.log('No original dataset found — building feedback from adapted dataset entries only');
    const feedbackItems: FeedbackItem[] = [];
    for (let i = 0; i < adaptionLabStore.length; i++) {
      const entry = adaptionLabStore[i];
      if (entry.isValid && entry.json) {
        feedbackItems.push({
          id: `fb-adapted-${i + 1}`,
          review: entry.review,
          category: entry.category,
          sentiment: entry.json.sentiment as any,
          issue_summary: entry.json.issue_summary,
          key_topics: entry.json.key_topics,
          severity: entry.json.severity as any,
          recommended_action: entry.json.recommended_action,
          evidence: entry.json.evidence,
          provenance: 'adapted_dataset',
          analysis_status: 'analyzed',
          dataset_id: 'ds-adapted-test',
          created_at: new Date(Date.now() - (adaptionLabStore.length - i) * 60000).toISOString(),
        });
      } else {
        const baseline = runTransparentBaseline(entry.review, entry.category);
        feedbackItems.push({
          id: `fb-adapted-${i + 1}`,
          review: entry.review,
          category: entry.category,
          sentiment: baseline.sentiment,
          issue_summary: baseline.issue_summary,
          key_topics: baseline.key_topics,
          severity: baseline.severity,
          recommended_action: baseline.recommended_action,
          evidence: baseline.evidence,
          provenance: 'transparent_baseline',
          analysis_status: entry.error ? 'warning' : 'analyzed',
          validation_warning: entry.error ? `JSON parse error: ${entry.error}` : undefined,
          dataset_id: 'ds-adapted-test',
          created_at: new Date(Date.now() - (adaptionLabStore.length - i) * 60000).toISOString(),
        });
      }
    }
    db.feedback = feedbackItems;
    generateDerivedIssuesAndRecommendations();
  }

  saveDB();
}

// Generate heuristic grouped issues & recommendations
function generateDerivedIssuesAndRecommendations() {
  const issuesMap = new Map<string, {
    category: string;
    reviews: string[];
    severities: ('low' | 'medium' | 'high' | 'unknown')[];
    evidenceList: string[];
    actions: string[];
  }>();

  for (const item of db.feedback) {
    const topics = item.key_topics || [item.category];
    const mainTopic = topics[0] || item.category;
    const groupKey = `${item.category}:::${mainTopic}`;

    if (!issuesMap.has(groupKey)) {
      issuesMap.set(groupKey, {
        category: item.category,
        reviews: [],
        severities: [],
        evidenceList: [],
        actions: [],
      });
    }

    const group = issuesMap.get(groupKey)!;
    group.reviews.push(item.review);
    if (item.severity) group.severities.push(item.severity);
    if (item.evidence) group.evidenceList.push(item.evidence);
    if (item.recommended_action) group.actions.push(item.recommended_action);
  }

  const generatedIssues: IssueItem[] = [];
  let issueCounter = 1;

  for (const [key, data] of issuesMap.entries()) {
    const [category, topic] = key.split(':::');
    const frequency = data.reviews.length;

    // Severity weighting
    const highCount = data.severities.filter(s => s === 'high').length;
    const medCount = data.severities.filter(s => s === 'medium').length;
    let dominantSeverity: 'low' | 'medium' | 'high' | 'unknown' = 'low';
    let severityWeight = 1.0;

    if (highCount > 0 && highCount / frequency >= 0.2) {
      dominantSeverity = 'high';
      severityWeight = 3.0;
    } else if (medCount > 0 && medCount / frequency >= 0.25) {
      dominantSeverity = 'medium';
      severityWeight = 2.0;
    }

    // Evidence Quality Score: ratio of reviews with non-empty evidence
    const evidenceQualityScore = Math.min(1.0, data.evidenceList.length / Math.max(1, frequency));

    // Transparent formula: Priority = (Frequency * 0.4) + (SeverityWeight * 0.4) + (EvidenceQuality * 0.2)
    // Normalized for 0-100 scale:
    const normFreq = Math.min(10, frequency) / 10; // 0..1
    const normSev = severityWeight / 3.0; // 0..1
    const normQuality = evidenceQualityScore; // 0..1
    const priorityScore = Math.round((normFreq * 40) + (normSev * 40) + (normQuality * 20));

    // Cautious title: never claim confirmed fraud purely based on allegation
    let title = `${category}: ${topic}`;
    if (category === 'Fraud and Scam') {
      title = `Customer Allegations: ${topic} Reports`;
    }

    generatedIssues.push({
      id: `iss-${issueCounter++}`,
      title,
      category,
      frequency,
      severity: dominantSeverity,
      severity_weight: severityWeight,
      evidence_quality_score: Math.round(evidenceQualityScore * 100) / 100,
      priority_score: priorityScore,
      suggested_action: data.actions[0] || 'Investigate feedback patterns and review root causes with team.',
      supporting_evidence: Array.from(new Set(data.evidenceList)).slice(0, 3),
      example_reviews: Array.from(new Set(data.reviews)).slice(0, 3),
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Sort by priority score descending
  db.issues = generatedIssues.sort((a, b) => b.priority_score - a.priority_score);

  // Generate actionable recommendations linked directly to feedback
  const recCategories = ['Fraud and Scam', 'Customer Service', 'Operational Issues', 'Product Feedback'];
  const generatedRecs: RecommendationItem[] = [];
  let recCounter = 1;

  for (const cat of recCategories) {
    const matchingFeedback = db.feedback.filter(f => f.category === cat);
    if (matchingFeedback.length === 0) continue;

    if (cat === 'Fraud and Scam') {
      generatedRecs.push({
        id: `rec-${recCounter++}`,
        problem_addressed: 'Customer allegations of seller fraud, duplicate card charges, and counterfeit products',
        category: cat,
        suggested_action: 'Deploy automated duplicate billing detection and require multi-step merchant verification',
        why_suggested: 'Multiple customers report repeated credit card charges and alleged counterfeit items across transactions.',
        expected_impact_direction: 'Reduction in billing dispute chargebacks and faster triage of suspicious merchant accounts',
        suggested_next_step: 'Conduct manual audit of top 10 disputed merchant accounts and enforce payment gateway idempotency keys.',
        limitations: 'Allegations require payment gateway confirmation before classifying as verified fraud incidents.',
        priority: 'high',
        status: 'under_review',
        supporting_review_examples: matchingFeedback.slice(0, 3).map(f => f.review),
        confidence_indicator: 'medium',
      });
    } else if (cat === 'Operational Issues') {
      generatedRecs.push({
        id: `rec-${recCounter++}`,
        problem_addressed: 'Checkout website crashes and 2-week carrier delivery delays',
        category: cat,
        suggested_action: 'Audit frontend checkout error telemetry and establish automated carrier delay notification system',
        why_suggested: 'Feedback indicates significant customer frustration during cart checkout failures and uncommunicated dispatch delays.',
        expected_impact_direction: 'Decreased cart abandonment rate and higher customer satisfaction via proactive delivery updates',
        suggested_next_step: 'Profile browser crash logs during peak checkout volume; configure carrier webhook tracking.',
        limitations: 'Delivery delays depend partially on external third-party courier capacity.',
        priority: 'high',
        status: 'under_review',
        supporting_review_examples: matchingFeedback.slice(0, 3).map(f => f.review),
        confidence_indicator: 'high',
      });
    } else if (cat === 'Customer Service') {
      generatedRecs.push({
        id: `rec-${recCounter++}`,
        problem_addressed: 'Inconsistent agent response times and unresolved secondary inquiries',
        category: cat,
        suggested_action: 'Introduce tiered SLA escalation workflows and celebrate top-performing knowledgeable agents',
        why_suggested: 'Reviews show polarized sentiment: while responsive agents receive high praise, unanswered inquiries cause severe dissatisfaction.',
        expected_impact_direction: 'Improved first-contact resolution rate and lower average ticket backlog time',
        suggested_next_step: 'Audit tickets open >48 hours and conduct peer-shadowing using recorded positive interactions.',
        limitations: 'Requires staffing adjustments and training ramp-up period.',
        priority: 'medium',
        status: 'accepted',
        supporting_review_examples: matchingFeedback.slice(0, 3).map(f => f.review),
        confidence_indicator: 'high',
      });
    } else if (cat === 'Product Feedback') {
      generatedRecs.push({
        id: `rec-${recCounter++}`,
        problem_addressed: 'Customer praise for minimalist ergonomic design vs. early hardware/defect reports',
        category: cat,
        suggested_action: 'Leverage verified positive design highlights in marketing while tightening batch inspection QA',
        why_suggested: 'Customers repeatedly praise product aesthetic, functionality, and daily task improvements, but replacement requests highlight defect risk.',
        expected_impact_direction: 'Higher product conversion with reduced return merchandise authorization (RMA) rate',
        suggested_next_step: 'Review QA checklist for initial manufacturing batch and extract customer quotes for product landing pages.',
        limitations: 'Long-term durability requires monitoring beyond early 30-day feedback window.',
        priority: 'medium',
        status: 'under_review',
        supporting_review_examples: matchingFeedback.slice(0, 3).map(f => f.review),
        confidence_indicator: 'high',
      });
    }
  }

  db.recommendations = generatedRecs;
}

// Load DB on startup
loadDB();

// ---------------- REST API ROUTES ----------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'InsightFlow',
    version: '2026.1',
    database: 'persistent_sqlite_json',
    total_records: db.feedback.length,
    datasets_count: db.datasets.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Datasets list
app.get('/api/datasets', (req, res) => {
  res.json({
    datasets: db.datasets,
    total_feedback_count: db.feedback.length,
  });
});

// 3. Upload dataset (Original CSV or General Customer Feedback)
app.post('/api/datasets/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const rows = parseCSV(csvContent);

    if (rows.length < 2) {
      return res.status(400).json({ error: 'CSV file is empty or missing data rows' });
    }

    const header = rows[0].map(h => h.trim().toLowerCase());
    const reviewIdx = header.indexOf('review');
    const categoryIdx = header.indexOf('category');

    if (reviewIdx === -1) {
      return res.status(400).json({
        error: `Required column 'review' missing. Found columns: ${rows[0].join(', ')}`
      });
    }

    const datasetId = `ds-upload-${Date.now()}`;
    const filename = req.file.originalname || 'uploaded_dataset.csv';
    const newFeedbackItems: FeedbackItem[] = [];
    const uniqueReviews = new Set<string>();
    const uniqueCombos = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length <= reviewIdx) continue;
      const reviewText = row[reviewIdx];
      const categoryText = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Uncategorized';

      uniqueReviews.add(reviewText);
      uniqueCombos.add(`${reviewText}||${categoryText}`);

      const baseline = runTransparentBaseline(reviewText, categoryText);
      newFeedbackItems.push({
        id: `fb-up-${Date.now()}-${i}`,
        review: reviewText,
        category: categoryText,
        sentiment: baseline.sentiment,
        issue_summary: baseline.issue_summary,
        key_topics: baseline.key_topics,
        severity: baseline.severity,
        recommended_action: baseline.recommended_action,
        evidence: baseline.evidence,
        provenance: 'transparent_baseline',
        analysis_status: 'analyzed',
        dataset_id: datasetId,
        created_at: new Date().toISOString(),
      });
    }

    const newDataset: DatasetMeta = {
      id: datasetId,
      name: filename.replace(/\.csv$/i, ''),
      type: 'custom',
      filename,
      total_rows: newFeedbackItems.length,
      unique_reviews: uniqueReviews.size,
      unique_review_category_combos: uniqueCombos.size,
      has_adapted_analysis: false,
      uploaded_at: new Date().toISOString(),
    };

    db.datasets.unshift(newDataset);
    db.feedback = [...newFeedbackItems, ...db.feedback];
    generateDerivedIssuesAndRecommendations();
    saveDB();

    res.json({
      message: 'Dataset uploaded and processed successfully',
      dataset: newDataset,
      imported_rows: newFeedbackItems.length,
      unique_reviews: uniqueReviews.size,
      unique_combos: uniqueCombos.size,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process CSV upload: ' + err.message });
  }
});

// 4. Import Adaption dataset
app.post('/api/adaption/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Adaption file provided' });
    }

    const content = req.file.buffer.toString('utf-8');
    const rows = parseCSV(content);

    if (rows.length < 2) {
      return res.status(400).json({ error: 'Adapted CSV is empty' });
    }

    const header = rows[0].map(h => h.trim().toLowerCase());
    const reviewIdx = header.indexOf('review');
    const completionIdx = header.indexOf('enhanced_completion');
    const categoryIdx = header.indexOf('category');

    if (reviewIdx === -1 || completionIdx === -1) {
      return res.status(400).json({
        error: `Adaption file must contain 'review' and 'enhanced_completion' columns. Found: ${rows[0].join(', ')}`
      });
    }

    let validJsonCount = 0;
    let parsingErrors = 0;
    let missingFields = 0;
    let matchedFeedbackCount = 0;

    const adaptedResults: Array<{
      review: string;
      category: string;
      json: any;
      isValid: boolean;
      error?: string;
    }> = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length <= reviewIdx) continue;
      const reviewText = row[reviewIdx];
      const rawComp = row[completionIdx];
      const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Product Feedback';

      if (!rawComp) {
        parsingErrors++;
        continue;
      }

      try {
        const cleaned = cleanJsonString(rawComp);
        const parsed = JSON.parse(cleaned);

        if (!parsed.sentiment || !parsed.issue_summary) {
          missingFields++;
        }

        const validSentiment = ['positive', 'negative', 'neutral', 'mixed'].includes(parsed.sentiment)
          ? parsed.sentiment
          : 'neutral';
        const validSeverity = ['low', 'medium', 'high', 'unknown'].includes(parsed.severity)
          ? parsed.severity
          : 'unknown';

        adaptedResults.push({
          review: reviewText,
          category,
          json: {
            ...parsed,
            sentiment: validSentiment,
            severity: validSeverity,
          },
          isValid: true,
        });
        validJsonCount++;

        // Update in-memory feedback if matching
        const norm = reviewText.trim().toLowerCase();
        for (const item of db.feedback) {
          if (item.review.trim().toLowerCase() === norm) {
            item.sentiment = validSentiment;
            item.issue_summary = parsed.issue_summary;
            item.key_topics = Array.isArray(parsed.key_topics) ? parsed.key_topics : ['General'];
            item.severity = validSeverity;
            item.recommended_action = parsed.recommended_action;
            item.evidence = parsed.evidence;
            item.provenance = 'adapted_dataset';
            item.analysis_status = 'analyzed';
            matchedFeedbackCount++;
          }
        }
      } catch (jsonErr: any) {
        parsingErrors++;
        adaptedResults.push({
          review: reviewText,
          category,
          json: null,
          isValid: false,
          error: jsonErr.message,
        });
      }
    }

    const datasetId = `ds-adapted-${Date.now()}`;
    const filename = req.file.originalname || 'adaption_dataset.csv';

    const newDataset: DatasetMeta = {
      id: datasetId,
      name: 'Adaption Import (' + filename + ')',
      type: 'adapted',
      filename,
      total_rows: rows.length - 1,
      unique_reviews: new Set(rows.slice(1).map(r => r[reviewIdx])).size,
      unique_review_category_combos: new Set(rows.slice(1).map(r => `${r[reviewIdx]}||${r[categoryIdx] || ''}`)).size,
      has_adapted_analysis: true,
      adapted_valid_json_count: validJsonCount,
      adapted_parsing_errors: parsingErrors,
      uploaded_at: new Date().toISOString(),
    };

    db.datasets.unshift(newDataset);

    // Refresh adaptionLabStore with the uploaded file entries
    adaptionLabStore = adaptedResults.map(r => ({
      review: r.review,
      category: r.category,
      isValid: r.isValid,
      json: r.isValid ? r.json : undefined,
      error: r.error,
    }));

    generateDerivedIssuesAndRecommendations();
    saveDB();

    res.json({
      message: 'Adaption dataset imported successfully',
      dataset: newDataset,
      total_rows: rows.length - 1,
      valid_json_count: validJsonCount,
      parsing_errors: parsingErrors,
      missing_fields: missingFields,
      valid_json_percentage: Math.round((validJsonCount / Math.max(1, rows.length - 1)) * 1000) / 10,
      matched_feedback_count: matchedFeedbackCount,
      examples: adaptedResults.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to import Adaption file: ' + err.message });
  }
});

// 4b. Adaption Lab — detailed parsing stats endpoint
app.get('/api/adaption/lab', (req, res) => {
  const adaptedDataset = db.datasets.find(d => d.type === 'adapted');
  const totalRows = adaptionLabStore.length;
  const validCount = adaptionLabStore.filter(e => e.isValid).length;
  const errorCount = adaptionLabStore.filter(e => !e.isValid).length;
  const missingFieldsCount = adaptionLabStore.filter(e => e.missing_fields && e.missing_fields.length > 0).length;

  // Category distribution for the adapted dataset
  const catCounts: Record<string, number> = {};
  for (const e of adaptionLabStore) {
    catCounts[e.category] = (catCounts[e.category] || 0) + 1;
  }
  const categoryDistribution = Object.entries(catCounts)
    .map(([category, count]) => ({ category, count, percentage: totalRows > 0 ? Math.round(count / totalRows * 1000) / 10 : 0 }))
    .sort((a, b) => b.count - a.count);

  // Parsing errors list
  const parsingErrors = adaptionLabStore
    .filter(e => !e.isValid)
    .map(e => ({ review: e.review.slice(0, 80), category: e.category, error: e.error || 'Unknown error' }));

  // Warning rows (valid JSON but missing fields)
  const warningRows = adaptionLabStore
    .filter(e => e.isValid && e.missing_fields && e.missing_fields.length > 0)
    .map(e => ({ review: e.review.slice(0, 80), category: e.category, missing_fields: e.missing_fields }));

  // Example analyses (first 10 valid)
  const exampleAnalyses = adaptionLabStore
    .filter(e => e.isValid && e.json)
    .slice(0, 10)
    .map(e => ({ review: e.review, category: e.category, analysis: e.json }));

  res.json({
    dataset: adaptedDataset || null,
    total_rows: totalRows,
    valid_json_count: validCount,
    parsing_errors_count: errorCount,
    missing_fields_count: missingFieldsCount,
    valid_json_percentage: totalRows > 0 ? Math.round(validCount / totalRows * 1000) / 10 : 0,
    category_distribution: categoryDistribution,
    parsing_errors: parsingErrors,
    warning_rows: warningRows,
    example_analyses: exampleAnalyses,
  });
});

// 5. Feedback explorer listing with filter, search, sort, pagination
app.get('/api/feedback', (req, res) => {
  try {
    const {
      search = '',
      category = 'all',
      sentiment = 'all',
      severity = 'all',
      provenance = 'all',
      dataset_id = 'all',
      page = '1',
      limit = '25',
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query as Record<string, string>;

    let list = [...db.feedback];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item =>
        item.review.toLowerCase().includes(q) ||
        (item.issue_summary && item.issue_summary.toLowerCase().includes(q)) ||
        (item.evidence && item.evidence.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') {
      list = list.filter(item => item.category === category);
    }

    if (sentiment !== 'all') {
      list = list.filter(item => item.sentiment === sentiment);
    }

    if (severity !== 'all') {
      list = list.filter(item => item.severity === severity);
    }

    if (provenance !== 'all') {
      list = list.filter(item => item.provenance === provenance);
    }

    if (dataset_id !== 'all') {
      list = list.filter(item => item.dataset_id === dataset_id);
    }

    // Sort
    list.sort((a: any, b: any) => {
      const valA = a[sort_by] || '';
      const valB = b[sort_by] || '';
      if (valA < valB) return sort_order === 'asc' ? -1 : 1;
      if (valA > valB) return sort_order === 'asc' ? 1 : -1;
      return 0;
    });

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 25));
    const total = list.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Compute distinct categories for filter UI
    const distinctCategories = Array.from(new Set(db.feedback.map(f => f.category))).sort();

    res.json({
      items: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      categories: distinctCategories,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update single feedback item (e.g. user correction of inferred labels)
app.patch('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  const item = db.feedback.find(f => f.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Feedback item not found' });
  }

  const { sentiment, severity, recommended_action, category } = req.body;
  if (sentiment) item.sentiment = sentiment;
  if (severity) item.severity = severity;
  if (recommended_action) item.recommended_action = recommended_action;
  if (category) item.category = category;
  item.provenance = 'manual_override';

  generateDerivedIssuesAndRecommendations();
  saveDB();

  res.json({ message: 'Feedback updated successfully', item });
});

// 7. Overview analytics
app.get('/api/analytics/overview', (req, res) => {
  try {
    const totalRecords = db.feedback.length;
    const uniqueReviews = new Set(db.feedback.map(f => f.review)).size;
    const uniqueCombos = new Set(db.feedback.map(f => `${f.review}||${f.category}`)).size;
    const duplicateCount = totalRecords - uniqueReviews;

    // Category breakdown
    const catCounts: Record<string, number> = {};
    for (const f of db.feedback) {
      catCounts[f.category] = (catCounts[f.category] || 0) + 1;
    }
    const categoryDistribution = Object.entries(catCounts).map(([category, count]) => ({
      category,
      count,
      percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 1000) / 10 : 0,
    })).sort((a, b) => b.count - a.count);

    // Sentiment breakdown (AI inferred)
    const sentCounts: Record<string, number> = { positive: 0, negative: 0, neutral: 0, mixed: 0, unassigned: 0 };
    for (const f of db.feedback) {
      const s = f.sentiment || 'unassigned';
      sentCounts[s] = (sentCounts[s] || 0) + 1;
    }
    const sentimentDistribution = Object.entries(sentCounts)
      .filter(([_, count]) => count > 0)
      .map(([sentiment, count]) => ({
        sentiment,
        count,
        percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 1000) / 10 : 0,
      }));

    // Severity breakdown
    const sevCounts: Record<string, number> = { low: 0, medium: 0, high: 0, unknown: 0 };
    for (const f of db.feedback) {
      const s = f.severity || 'unknown';
      sevCounts[s] = (sevCounts[s] || 0) + 1;
    }

    // Top topics
    const topicMap: Record<string, number> = {};
    for (const f of db.feedback) {
      if (f.key_topics) {
        for (const t of f.key_topics) {
          topicMap[t] = (topicMap[t] || 0) + 1;
        }
      }
    }
    const topTopics = Object.entries(topicMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Provenance breakdown
    const provCounts: Record<string, number> = { adapted_dataset: 0, transparent_baseline: 0, manual_override: 0, unassigned: 0 };
    for (const f of db.feedback) {
      provCounts[f.provenance] = (provCounts[f.provenance] || 0) + 1;
    }

    res.json({
      total_records: totalRecords,
      unique_reviews: uniqueReviews,
      unique_review_category_combos: uniqueCombos,
      duplicate_records_count: duplicateCount,
      category_distribution: categoryDistribution,
      sentiment_distribution: sentimentDistribution,
      severity_distribution: sevCounts,
      top_topics: topTopics,
      provenance_distribution: provCounts,
      high_priority_issues: db.issues.slice(0, 5),
      recent_feedback: db.feedback.slice(0, 6),
      recommendations_count: db.recommendations.length,
      datasets_count: db.datasets.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Trigger batch analysis run
app.post('/api/analysis/run', (req, res) => {
  try {
    const { mode = 'prefer_adapted' } = req.body;
    db.settings.analysis_mode = mode;

    let updatedCount = 0;
    for (const item of db.feedback) {
      if (mode === 'local_heuristic' || item.provenance !== 'adapted_dataset') {
        const baseline = runTransparentBaseline(item.review, item.category);
        item.sentiment = baseline.sentiment;
        item.issue_summary = baseline.issue_summary;
        item.key_topics = baseline.key_topics;
        item.severity = baseline.severity;
        item.recommended_action = baseline.recommended_action;
        item.evidence = baseline.evidence;
        item.provenance = 'transparent_baseline';
        item.analysis_status = 'analyzed';
        updatedCount++;
      }
    }

    generateDerivedIssuesAndRecommendations();
    saveDB();

    res.json({
      message: 'Analysis pipeline completed successfully',
      updated_records: updatedCount,
      total_records: db.feedback.length,
      mode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Issues endpoints
app.get('/api/issues', (req, res) => {
  const { status, category, search } = req.query as Record<string, string>;
  let list = [...db.issues];

  if (status && status !== 'all') {
    list = list.filter(i => i.status === status);
  }
  if (category && category !== 'all') {
    list = list.filter(i => i.category === category);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.suggested_action.toLowerCase().includes(q)
    );
  }

  res.json({ issues: list });
});

app.post('/api/issues', (req, res) => {
  const { title, category, severity = 'medium', suggested_action, notes, assigned_to } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const newIssue: IssueItem = {
    id: `iss-user-${Date.now()}`,
    title,
    category,
    frequency: 1,
    severity: severity || 'medium',
    severity_weight: severity === 'high' ? 3 : severity === 'medium' ? 2 : 1,
    evidence_quality_score: 1.0,
    priority_score: severity === 'high' ? 75 : severity === 'medium' ? 50 : 30,
    suggested_action: suggested_action || 'Review and take team corrective action.',
    supporting_evidence: [],
    example_reviews: [],
    status: 'Open',
    assigned_to,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.issues.unshift(newIssue);
  saveDB();
  res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
});

app.patch('/api/issues/:id', (req, res) => {
  const { id } = req.params;
  const issue = db.issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const { status, priority_score, notes, assigned_to, suggested_action } = req.body;
  if (status) issue.status = status;
  if (priority_score !== undefined) issue.priority_score = priority_score;
  if (notes !== undefined) issue.notes = notes;
  if (assigned_to !== undefined) issue.assigned_to = assigned_to;
  if (suggested_action) issue.suggested_action = suggested_action;
  issue.updated_at = new Date().toISOString();

  saveDB();
  res.json({ message: 'Issue updated successfully', issue });
});

// 10. Recommendations endpoints
app.get('/api/recommendations', (req, res) => {
  const { category, priority, status } = req.query as Record<string, string>;
  let list = [...db.recommendations];

  if (category && category !== 'all') {
    list = list.filter(r => r.category === category);
  }
  if (priority && priority !== 'all') {
    list = list.filter(r => r.priority === priority);
  }
  if (status && status !== 'all') {
    list = list.filter(r => r.status === status);
  }

  res.json({ recommendations: list });
});

app.patch('/api/recommendations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const rec = db.recommendations.find(r => r.id === id);
  if (!rec) {
    return res.status(404).json({ error: 'Recommendation not found' });
  }

  if (!['under_review', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  rec.status = status;
  saveDB();
  res.json({ message: 'Status updated', recommendation: rec });
});

// 11. Reports & Export
app.get('/api/reports/export', (req, res) => {
  const { format = 'json' } = req.query;

  if (format === 'csv') {
    // Generate CSV of current feedback
    const header = ['ID', 'Review', 'Category', 'Inferred_Sentiment', 'Inferred_Severity', 'Key_Topics', 'Provenance', 'Analysis_Status'];
    const rows = db.feedback.map(f => [
      `"${f.id}"`,
      `"${f.review.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      `"${f.sentiment || ''}"`,
      `"${f.severity || ''}"`,
      `"${(f.key_topics || []).join('; ')}"`,
      `"${f.provenance}"`,
      `"${f.analysis_status}"`
    ]);

    const csvOutput = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="insightflow_feedback_export.csv"');
    return res.send(csvOutput);
  }

  if (format === 'json_adapted') {
    const adaptedOnly = db.feedback.filter(f => f.provenance === 'adapted_dataset');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="insightflow_adapted_analysis.json"');
    return res.json({
      export_timestamp: new Date().toISOString(),
      platform: 'InsightFlow',
      record_count: adaptedOnly.length,
      records: adaptedOnly,
    });
  }

  // Full summary JSON report
  res.json({
    generated_at: new Date().toISOString(),
    dataset_summary: {
      total_records: db.feedback.length,
      unique_reviews: new Set(db.feedback.map(f => f.review)).size,
      datasets: db.datasets,
    },
    top_issues: db.issues.slice(0, 10),
    recommendations: db.recommendations,
    heuristic_formula: 'Priority = (NormalizedFrequency * 40) + (SeverityWeight * 40) + (EvidenceQuality * 20)',
    inference_caveats: 'Sentiment, severity, and recommendations are AI-inferred or transparent baseline heuristics. They represent algorithmic signals, not verified ground truth.',
  });
});

// 12. Reset to initial demo data
app.post('/api/demo/reset', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    db = {
      datasets: [],
      feedback: [],
      issues: [],
      recommendations: [],
      settings: {
        analysis_mode: 'prefer_adapted',
        confidence_threshold: 0.75,
      },
    };
    initializeDefaultDatasets();
    res.json({ message: 'Database reset to initial demo state', records: db.feedback.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- VITE & STATIC SERVING ----------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Vite middleware in dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InsightFlow full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
