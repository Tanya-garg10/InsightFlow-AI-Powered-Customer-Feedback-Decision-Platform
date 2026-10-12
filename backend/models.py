from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from .database import Base

# SQLAlchemy ORM Models
class FeedbackRecord(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    review = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    sentiment = Column(String(50), nullable=True) # positive, negative, neutral, mixed
    severity = Column(String(50), nullable=True)  # low, medium, high, unknown
    issue_summary = Column(Text, nullable=True)
    key_topics = Column(Text, nullable=True)     # comma-separated
    recommended_action = Column(Text, nullable=True)
    evidence = Column(Text, nullable=True)
    provenance = Column(String(50), default="transparent_baseline") # adapted_dataset, transparent_baseline, manual_override
    analysis_status = Column(String(50), default="analyzed")
    validation_warning = Column(Text, nullable=True)
    dataset_name = Column(String(100), default="BuildBattle_2026_Customer_Feedback_Dataset.csv")
    created_at = Column(DateTime, default=datetime.utcnow)

class IssueRecord(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    frequency = Column(Integer, default=1)
    severity = Column(String(50), default="medium")
    severity_weight = Column(Float, default=2.0)
    evidence_quality_score = Column(Float, default=1.0)
    priority_score = Column(Integer, default=50)
    suggested_action = Column(Text, nullable=True)
    supporting_evidence = Column(Text, nullable=True)
    status = Column(String(50), default="Open") # Open, In Progress, Resolved
    assigned_to = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Schemas
class FeedbackCreate(BaseModel):
    review: str
    category: str

class FeedbackResponse(BaseModel):
    id: int
    review: str
    category: str
    sentiment: Optional[str] = None
    severity: Optional[str] = None
    issue_summary: Optional[str] = None
    key_topics: Optional[str] = None
    recommended_action: Optional[str] = None
    evidence: Optional[str] = None
    provenance: str
    analysis_status: str
    validation_warning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class IssueCreate(BaseModel):
    title: str
    category: str
    severity: Optional[str] = "medium"
    suggested_action: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    priority_score: Optional[int] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    suggested_action: Optional[str] = None

class IssueResponse(BaseModel):
    id: int
    title: str
    category: str
    frequency: int
    severity: str
    priority_score: int
    suggested_action: Optional[str] = None
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
