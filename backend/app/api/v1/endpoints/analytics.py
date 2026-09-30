from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import json

from backend.app.db.database import get_db
from backend.app.db.models import Matter, Document, Clause, AuditLog, User
from backend.app.schemas.analytics import AnalyticsOverview, RiskDistribution, PracticeAreaStat

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    total_matters = db.query(Matter).count()
    active_matters = db.query(Matter).filter(Matter.status.in_(["OPEN", "IN_REVIEW"])).count()
    total_docs = db.query(Document).count()
    analyzed_docs = db.query(Document).filter(Document.status.in_(["ANALYZED", "APPROVED"])).count()
    high_risk_clauses = db.query(Clause).filter(Clause.risk_rating == "HIGH_RISK").count()
    
    # Risk distribution
    low_risk = db.query(Document).filter(Document.risk_level == "LOW").count()
    med_risk = db.query(Document).filter(Document.risk_level == "MEDIUM").count()
    high_risk = db.query(Document).filter(Document.risk_level == "HIGH").count()
    crit_risk = db.query(Document).filter(Document.risk_level == "CRITICAL").count()
    
    # Compliance score computation
    if total_docs > 0:
        base_score = 100.0 - (high_risk * 12.0) - (crit_risk * 25.0) - (med_risk * 4.0)
        compliance_score = max(20.0, min(100.0, round(base_score, 1)))
    else:
        compliance_score = 94.5

    # Practice areas
    pa_counts = (
        db.query(Matter.practice_area, func.count(Matter.id))
        .group_by(Matter.practice_area)
        .all()
    )
    practice_areas = [PracticeAreaStat(area=pa[0] or "General", count=pa[1]) for pa in pa_counts]

    # Recent activity
    audits = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(10)
        .all()
    )
    
    recent_activity = []
    for a in audits:
        doc_title = a.document.title if a.document else "System"
        user_name = a.user.full_name if a.user else "AI Compliance Engine"
        recent_activity.append({
            "id": a.id,
            "action": a.action,
            "document_title": doc_title,
            "user_name": user_name,
            "details": json.loads(a.details_json) if a.details_json else {},
            "timestamp": a.timestamp.isoformat()
        })

    return AnalyticsOverview(
        total_matters=total_matters,
        active_matters=active_matters,
        total_documents=total_docs,
        analyzed_documents=analyzed_docs,
        high_risk_clauses=high_risk_clauses,
        compliance_score=compliance_score,
        risk_distribution=RiskDistribution(
            low=low_risk,
            medium=med_risk,
            high=high_risk,
            critical=crit_risk
        ),
        practice_areas=practice_areas,
        recent_activity=recent_activity
    )

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    audits = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    results = []
    for a in audits:
        results.append({
            "id": a.id,
            "action": a.action,
            "document_id": a.document_id,
            "document_title": a.document.title if a.document else None,
            "user_id": a.user_id,
            "user_name": a.user.full_name if a.user else "LegalEase System",
            "details": json.loads(a.details_json) if a.details_json else {},
            "timestamp": a.timestamp.isoformat()
        })
    return results
