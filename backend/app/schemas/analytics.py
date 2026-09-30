from pydantic import BaseModel
from typing import List, Dict

class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int

class PracticeAreaStat(BaseModel):
    area: str
    count: int

class AnalyticsOverview(BaseModel):
    total_matters: int
    active_matters: int
    total_documents: int
    analyzed_documents: int
    high_risk_clauses: int
    compliance_score: float
    risk_distribution: RiskDistribution
    practice_areas: List[PracticeAreaStat]
    recent_activity: List[Dict]
