# InsightFlow — Intelligent Customer Feedback & Decision Platform

> Built for **Frontend Arena Build Battle 2026**  
> AI-powered customer feedback intelligence platform that bridges raw reviews, Adaption dataset optimization, and decision-ready action tracking.

## 🌟 Overview & Architecture

InsightFlow is an end-to-end customer feedback analysis and decision platform. It takes raw feedback datasets and integrates structured fine-tuned analysis from **Adaption** generated completions.

### Actual Dataset Files (as inspected)

| File | Rows | Columns |
|------|------|---------|
| `data/ORIGINAL DATASET.csv` | 7,000 | `review`, `category` |
| `data/Adaption_Adapted_Feedback_Dataset.csv` | 113 | `review`, `enhanced_prompt`, `enhanced_completion`, `category`, `original_context` |
| `data/customer_feedback_prompts.csv` | 113 | Same as above (used as fallback) |

Original categories: `Product Feedback`, `Customer Service`, `Operational Issues`, `Fraud and Scam`

### How Adaption Integration Works

The `enhanced_completion` column contains JSON wrapped in markdown code fences (` ```json ... ``` `). InsightFlow:
1. Strips the markdown fences
2. Un-escapes `""` → `"` (CSV double-quote encoding)
3. Parses JSON and validates required fields: `sentiment`, `issue_summary`, `key_topics`, `severity`, `recommended_action`, `evidence`
4. Matches the 113 adapted rows against 7,000 original records via normalized review text
5. 2,478 original records matched to adapted analysis; remaining 4,522 receive transparent baseline heuristic

### Key Design Principles

1. **Dynamic Real Counts**: All row counts, unique reviews, and category distributions are computed dynamically from actual files — never hardcoded.
2. **Adaption Lab**: Dedicated page showing actual parsed stats: 113 adapted rows, 113 valid JSON (100%), 0 parsing errors, category distribution by count.
3. **Transparent Baseline**: Documented keyword-based heuristic for records without Adaption completions — labeled explicitly as heuristic, not AI model.
4. **Transparent Prioritization Formula**:
   ```
   Priority Score = (Normalized Frequency × 40) + (Severity Weight × 40) + (Evidence Quality × 20)
   ```
   Explained as an operational heuristic, not a verified business impact metric.
5. **Fraud Honesty**: Customer allegations of fraud are labeled as *unverified customer allegations*, never confirmed incidents.
6. **Adaption Coverage Disclosure**: The 113 adapted rows cover ~1.6% of the 7,000 original records. Dashboard clearly notes which records use adapted analysis vs. baseline heuristic.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Recharts, Lucide Icons, Motion
- **Full-Stack Runtime**: Node.js + Express serving Vite dev middleware on port 3000, with REST API and persistent JSON store
- **Data format**: In-memory store persisted to `data/insightflow_db.json` (gitignored)
- **Python Backend** (optional): FastAPI, Pandas, SQLAlchemy (SQLite), Pydantic, Pytest

## 🚀 Running the Project

### Option 1: Full-Stack Node.js Mode (Recommended)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run the full-stack server (Frontend + REST API on port 3000)
npm run dev

# 3. Open in browser:
http://localhost:3000
```

The server will automatically:
- Load `data/ORIGINAL DATASET.csv` (7,000 rows)
- Load `data/Adaption_Adapted_Feedback_Dataset.csv` (113 rows, 113 valid JSON)
- Match 2,478 original records to adapted analysis
- Apply transparent baseline to remaining 4,522 records
- Persist state to `data/insightflow_db.json`

### Option 2: Custom Port

```bash
PORT=3002 npm run dev
```

### Option 3: Python FastAPI Backend + React Frontend

```bash
# Terminal 1: Python FastAPI Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Terminal 2: React Frontend
npm install --legacy-peer-deps
npm run dev
```

### Option 4: Run Python Unit Tests

```bash
python3 -m pytest backend/test_main.py -v
```

### Option 5: TypeScript Type Check

```bash
npm run lint
```

## 📁 Dataset & Adaption Workflow

### CSV File Naming

The server supports the following filenames automatically, in priority order:

| Role | Primary filename | Fallback filename |
|------|-----------------|-------------------|
| Original dataset | `ORIGINAL DATASET.csv` | `BuildBattle_2026_Customer_Feedback_Dataset.csv` |
| Adapted dataset | `Adaption_Adapted_Feedback_Dataset.csv` | `customer_feedback_prompts.csv` |

### Adaption Lab Workflow

1. Place the original feedback CSV in `data/ORIGINAL DATASET.csv`.
2. When your Adaption job completes, download the adapted CSV and place it in `data/Adaption_Adapted_Feedback_Dataset.csv` — or upload it directly in the **Adaption Lab** tab.
3. In **Adaption Lab**:
   - See actual row counts and valid JSON rate
   - Category distribution bar chart (computed from real data)
   - Browse example original reviews side-by-side with Adaption outputs
   - Inspect parsing errors and missing-field warnings on the Errors tab
   - Coverage disclaimer shows exact % of original dataset covered

### CSV Column Requirements

**Original dataset** (upload via "Raw Feedback Dataset" tab):
```
review,category
"The product works great",Product Feedback
```

**Adaption adapted dataset** (upload via "Adaption Output" tab):
```
review,enhanced_prompt,enhanced_completion,category,original_context
"The product works great",,"```json\n{...}\n```",Product Feedback,Product Feedback
```

The `enhanced_completion` field may contain:
- Markdown-fenced JSON: ` ```json\n{...}\n``` `
- Plain JSON strings
- Empty values (counted as parse errors)
- CSV double-quote encoded JSON (e.g., `""sentiment""` → `"sentiment"`)

## 🔌 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/datasets` | List all ingested datasets with metadata |
| POST | `/api/datasets/upload` | Upload a raw feedback CSV (requires `review` column) |
| GET | `/api/feedback` | Paginated feedback with search, filter, sort |
| PATCH | `/api/feedback/:id` | Override sentiment/severity/action for a record |
| GET | `/api/analytics/overview` | Overview dashboard analytics |
| POST | `/api/analysis/run` | Re-run analysis pipeline |
| GET | `/api/issues` | Get grouped issues with filter |
| POST | `/api/issues` | Create a tracked team issue |
| PATCH | `/api/issues/:id` | Update issue status/notes/assignee |
| GET | `/api/recommendations` | Get actionable recommendations |
| PATCH | `/api/recommendations/:id/status` | Update recommendation status |
| POST | `/api/adaption/import` | Upload Adaption adapted CSV |
| GET | `/api/adaption/lab` | Detailed parsing stats for Adaption Lab |
| GET | `/api/reports/export` | Export data (format: csv / json / json_adapted) |
| POST | `/api/demo/reset` | Reset to initial default dataset state |

## 📊 Application Features

### Overview Dashboard
Real computed statistics: total records, unique reviews, category distribution bar chart, AI-inferred sentiment pie chart (labeled), top topics, priority issues, recent feedback.

### Feedback Explorer
Full-text search, filter by category/sentiment/severity/provenance, sort, paginate (25/50/100 per page), click-through detail modal with inline label override capability.

### AI Insights
Provenance breakdown (Adaption: 2,478 records / Baseline: 4,522 records), severity tier distribution, topic cluster grid.

### Issue Prioritization
Heuristic-scored issue groups with documented formula, expandable accordion with evidence quotes, one-click transfer to Issue Tracker.

### Recommendations
Category/priority/status filters, accept/reject/review status controls, limitations callout, supporting review examples.

### Issue Tracker
Create/edit issues, status transitions (Open → In Progress → Resolved), assignee field, notes, persistent storage.

### Reports
CSV export (full feedback), JSON export (full report), adapted-only JSON export, printable report view.

### Adaption Lab
Three tabs — **Category Overview** (chart + distribution table + coverage disclaimer), **Example Analyses** (side-by-side inspector), **Errors** (parse errors + missing fields).

## 🔒 Known Limitations & Ethical Guidelines

- **Fraud Allegations vs. Fact**: All fraud/scam allegations are labeled *unverified customer allegations*. They require formal investigation before legal attribution.
- **Inference Caveat**: Sentiment, severity, and recommendations are algorithmic inferences, not audited human ratings.
- **Adaption Coverage**: The 113-row adapted dataset covers ~1.6% of 7,000 original records. The majority of analytics are powered by the transparent baseline heuristic.
- **Baseline Heuristic Transparency**: The local sentiment heuristic uses keyword matching — documented in `server.ts → runTransparentBaseline()`. It is not a trained ML model.
- **Status Clarification**: Marking an issue "Resolved" reflects team action taken — not verified customer sentiment resolution.
- **No Fabricated Metrics**: No accuracy percentages, revenue figures, or model improvement claims are made. All statistics are directly computed from uploaded data.

## 🏗️ Project Structure

```
InsightFlow/
├── data/
│   ├── ORIGINAL DATASET.csv           # 7,000 original feedback rows
│   ├── Adaption_Adapted_Feedback_Dataset.csv  # 113 adapted rows (JSON completions)
│   ├── customer_feedback_prompts.csv  # Identical to above (fallback)
│   └── insightflow_db.json            # Persisted runtime DB (gitignored)
├── src/
│   ├── App.tsx                        # Root app state, routing, data loading
│   ├── components/
│   │   ├── FeedbackDetailModal.tsx    # Full detail modal with label override
│   │   ├── Header.tsx                 # Global search, dataset selector, actions
│   │   ├── Sidebar.tsx                # Navigation
│   │   └── UploadModal.tsx            # Tabbed upload (raw CSV + Adaption CSV)
│   ├── services/api.ts                # Typed REST API client
│   ├── types/index.ts                 # TypeScript interfaces
│   └── views/
│       ├── OverviewView.tsx           # Dashboard with charts
│       ├── FeedbackExplorerView.tsx   # Table with filters/search/pagination
│       ├── AIInsightsView.tsx         # Methodology + provenance breakdown
│       ├── PrioritizationView.tsx     # Issue scoring accordion
│       ├── RecommendationsView.tsx    # Recommendation cards with status control
│       ├── IssueTrackerView.tsx       # CRUD issue board
│       ├── ReportsView.tsx            # Printable + downloadable report
│       ├── AdaptionLabView.tsx        # Dataset quality inspector
│       └── SettingsView.tsx           # Pipeline config + dataset info
├── backend/                           # Python FastAPI (optional)
│   ├── main.py
│   ├── analysis.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── test_main.py
├── server.ts                          # Node.js Express + Vite full-stack server
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── .gitignore
```

## 🚀 Deployment

### Quick deploy to any Node.js host (Render, Railway, Fly.io)

```bash
# Build production bundle
npm run build

# Set environment variable
PORT=8080

# Run production server
NODE_ENV=production npx tsx server.ts
```

### Dockerfile (minimal)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
```

The `data/` directory with CSV files must be present in the container for automatic initialization.

*InsightFlow — Frontend Arena Build Battle 2026. Built with transparency, honesty, and real data.*
