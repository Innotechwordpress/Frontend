# FILE: app/models/schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# -------------------------
# OAuth & Connection Models
# -------------------------
class ConnectResponse(BaseModel):
    success: bool
    message: str

# -------------------------
# Gmail Email Models
# -------------------------
class Email(BaseModel):
    id: str
    subject: str
    sender: str  # Matches Gmail 'From' header
    date: datetime
    snippet: Optional[str] = None  # Email preview, may be empty

class FetchEmailsResponse(BaseModel):
    emails: List[Email]

# -------------------------
# Company & Research Models
# -------------------------
class CompanyProfile(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    is_personal_email: Optional[bool] = False

class CredibilityScore(BaseModel):
    score: float
    raw_metrics: Dict[str, Any]
    score_breakdown: Dict[str, float]

class BusinessValue(BaseModel):
    relevant: bool
    category: Optional[str] = Field(None, example="sales")
    confidence: float = Field(..., ge=0.0, le=1.0)

class EmailClassification(BaseModel):
    intent: str = Field(..., example="business inquiry")
    intent_confidence: float = Field(..., ge=0.0, le=1.0)
    business_value: BusinessValue
    notes: Optional[str] = Field(None, example="Mentions pricing and quote details.")

class ResearchReport(BaseModel):
    report_id: str
    company_name: str
    research_date: datetime
    overall_status: str
    completion_percentage: float
    company_profile: CompanyProfile
    products_services: Optional[List[Any]] = None
    market_analysis: Optional[Any] = None
    financial_metrics: Optional[List[Any]] = None
    key_insights: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    credibility: Optional[CredibilityScore] = None
    email_classification: Optional[EmailClassification] = None

    # Dashboard display
    email_sender: Optional[str] = Field(None, description="Who sent the email")
    email_snippet: Optional[str] = Field(None, description="Preview of the email body")
