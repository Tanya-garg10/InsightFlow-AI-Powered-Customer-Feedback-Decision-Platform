from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import List, Optional

from .database import engine, get_db, Base
from .models import FeedbackRecord, IssueRecord, FeedbackResponse, IssueCreate, IssueUpdate, IssueResponse
from .analysis import parse_adapted_completion, run_local_baseline, calculate_priority_score

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InsightFlow API",
    description="Intelligent Customer Feedback & Decision Platform Backend for Frontend Arena Build Battle 2026",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "InsightFlow FastAPI",
        "version": "1.0.0",
        "database": "SQLite (feedback.db)"
    }

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if "review" not in df.columns:
        raise HTTPException(status_code=400, detail="Missing required column 'review'")

    category_col = "category" if "category" in df.columns else None

    total_rows = len(df)
    unique_reviews = df["review"].nunique()
    
    # Ingest rows with transparent baseline
    imported_count = 0
    for _, row in df.iterrows():
        review_text = str(row["review"]).strip()
        cat = str(row[category_col]).strip() if category_col else "General"
        baseline = run_local_baseline(review_text, cat)

        fb = FeedbackRecord(
            review=review_text,
            category=cat,
            sentiment=baseline["sentiment"],
            severity=baseline["severity"],
            issue_summary=baseline["issue_summary"],
            key_topics=baseline["key_topics"],
            recommended_action=baseline["recommended_action"],
            evidence=baseline["evidence"],
            provenance="transparent_baseline",
            dataset_name=file.filename
        )
        db.add(fb)
        imported_count += 1

    db.commit()

    return {
        "filename": file.filename,
        "total_rows": total_rows,
        "unique_reviews": unique_reviews,
        "imported_count": imported_count
    }

@app.get("/api/feedback", response_model=List[FeedbackResponse])
def get_feedback(
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(FeedbackRecord)
    if category and category != "all":
        query = query.filter(FeedbackRecord.category == category)
    if sentiment and sentiment != "all":
        query = query.filter(FeedbackRecord.sentiment == sentiment)
    if severity and severity != "all":
        query = query.filter(FeedbackRecord.severity == severity)

    return query.offset(offset).limit(limit).all()

@app.get("/api/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    records = db.query(FeedbackRecord).all()
    total_records = len(records)
    if total_records == 0:
        return {
            "total_records": 0,
            "unique_reviews": 0,
            "category_distribution": [],
            "sentiment_distribution": [],
            "severity_distribution": {}
        }

    df = pd.DataFrame([{
        "review": r.review,
        "category": r.category,
        "sentiment": r.sentiment or "neutral",
        "severity": r.severity or "unknown"
    } for r in records])

    cat_counts = df["category"].value_counts().to_dict()
    sent_counts = df["sentiment"].value_counts().to_dict()
    sev_counts = df["severity"].value_counts().to_dict()

    return {
        "total_records": total_records,
        "unique_reviews": int(df["review"].nunique()),
        "category_distribution": [{"category": k, "count": int(v)} for k, v in cat_counts.items()],
        "sentiment_distribution": [{"sentiment": k, "count": int(v)} for k, v in sent_counts.items()],
        "severity_distribution": sev_counts
    }

@app.get("/api/issues", response_model=List[IssueResponse])
def get_issues(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(IssueRecord)
    if status and status != "all":
        query = query.filter(IssueRecord.status == status)
    return query.order_by(IssueRecord.priority_score.desc()).all()

@app.post("/api/issues", response_model=IssueResponse)
def create_issue(payload: IssueCreate, db: Session = Depends(get_db)):
    score = calculate_priority_score(1, payload.severity or "medium", 1.0)
    issue = IssueRecord(
        title=payload.title,
        category=payload.category,
        severity=payload.severity or "medium",
        priority_score=score,
        suggested_action=payload.suggested_action,
        notes=payload.notes,
        assigned_to=payload.assigned_to,
        status="Open"
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue

@app.patch("/api/issues/{issue_id}", response_model=IssueResponse)
def update_issue(issue_id: int, payload: IssueUpdate, db: Session = Depends(get_db)):
    issue = db.query(IssueRecord).filter(IssueRecord.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if payload.status:
        issue.status = payload.status
    if payload.notes is not None:
        issue.notes = payload.notes
    if payload.assigned_to is not None:
        issue.assigned_to = payload.assigned_to
    if payload.priority_score is not None:
        issue.priority_score = payload.priority_score
    if payload.suggested_action is not None:
        issue.suggested_action = payload.suggested_action

    db.commit()
    db.refresh(issue)
    return issue
