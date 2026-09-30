from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from backend.app.db.database import get_db
from backend.app.db.models import Document, Matter, Clause, AuditLog
from backend.app.schemas.document import DocumentCreate, DocumentUpdate, DocumentOut, DocumentDetailOut
from backend.app.schemas.clause import ClauseCreate

router = APIRouter()

@router.get("/", response_model=List[DocumentDetailOut])
def get_documents(
    matter_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if matter_id:
        query = query.filter(Document.matter_id == matter_id)
    if risk_level and risk_level != "ALL":
        query = query.filter(Document.risk_level == risk_level)
    if status and status != "ALL":
        query = query.filter(Document.status == status)
    if search:
        query = query.filter(Document.title.ilike(f"%{search}%"))
        
    docs = query.order_by(Document.uploaded_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for d in docs:
        item = DocumentDetailOut.model_validate(d)
        if d.matter:
            item.matter_title = d.matter.title
            item.matter_client = d.matter.client_name
        result.append(item)
    return result

@router.post("/", response_model=DocumentOut, status_code=201)
def create_document(doc_in: DocumentCreate, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == doc_in.matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Associated matter not found")
        
    doc = Document(**doc_in.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Audit log
    audit = AuditLog(
        document_id=doc.id,
        action="DOCUMENT_UPLOADED",
        details_json=json.dumps({"title": doc.title, "file_type": doc.file_type})
    )
    db.add(audit)
    db.commit()
    
    return DocumentOut.model_validate(doc)

@router.get("/{document_id}", response_model=DocumentDetailOut)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    out = DocumentDetailOut.model_validate(doc)
    if doc.matter:
        out.matter_title = doc.matter.title
        out.matter_client = doc.matter.client_name
    return out

@router.patch("/{document_id}", response_model=DocumentOut)
def update_document(document_id: str, doc_update: DocumentUpdate, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    update_data = doc_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)
        
    db.commit()
    db.refresh(doc)
    
    audit = AuditLog(
        document_id=doc.id,
        action="DOCUMENT_MODIFIED",
        details_json=json.dumps(update_data)
    )
    db.add(audit)
    db.commit()
    
    return DocumentOut.model_validate(doc)

@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return None

@router.post("/{document_id}/analyze", response_model=DocumentDetailOut)
def trigger_ai_analysis(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Analyze clauses or update risk score
    clauses = db.query(Clause).filter(Clause.document_id == document_id).all()
    if not clauses:
        # Generate default clauses if none exist
        sample_clauses = [
            Clause(
                document_id=doc.id,
                clause_type="INDEMNITY",
                original_text="The Vendor shall defend, indemnify and hold harmless Customer from any claims, suits, liabilities, damages or costs arising from breach of warranties.",
                simplified_text="Vendor fully covers the Customer against any 3rd party breach lawsuits and losses.",
                risk_rating="HIGH_RISK",
                recommendation="Recommend adding a reciprocal indemnity clause and liability cap carve-outs.",
                section_number=1
            ),
            Clause(
                document_id=doc.id,
                clause_type="LIABILITY_CAP",
                original_text="Neither party's aggregate liability shall exceed 12 months of service fees paid immediately preceding the event giving rise to liability.",
                simplified_text="Maximum damages either party can claim is capped at the past 12 months fees.",
                risk_rating="ATTENTION",
                recommendation="Ensure data privacy and gross negligence claims are excluded from the cap.",
                section_number=2
            ),
            Clause(
                document_id=doc.id,
                clause_type="GOVERNING_LAW",
                original_text="This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware without regard to conflict of laws principles.",
                simplified_text="Delaware state law controls any contract disputes.",
                risk_rating="PASS",
                recommendation="Standard Delaware choice of law. No revisions required.",
                section_number=3
            )
        ]
        db.add_all(sample_clauses)
        db.commit()
        clauses = db.query(Clause).filter(Clause.document_id == document_id).all()

    # Recalculate document risk metrics
    high_count = sum(1 for c in clauses if c.risk_rating == "HIGH_RISK")
    attention_count = sum(1 for c in clauses if c.risk_rating == "ATTENTION")
    
    if high_count > 0:
        doc.risk_level = "HIGH"
        doc.risk_score = min(95.0, 60.0 + (high_count * 15.0) + (attention_count * 5.0))
    elif attention_count > 0:
        doc.risk_level = "MEDIUM"
        doc.risk_score = 45.0 + (attention_count * 10.0)
    else:
        doc.risk_level = "LOW"
        doc.risk_score = 15.0

    doc.status = "ANALYZED"
    db.commit()
    db.refresh(doc)

    # Add audit log
    audit = AuditLog(
        document_id=doc.id,
        action="AI_RISK_EVALUATED",
        details_json=json.dumps({"risk_score": doc.risk_score, "risk_level": doc.risk_level, "clauses_evaluated": len(clauses)})
    )
    db.add(audit)
    db.commit()

    out = DocumentDetailOut.model_validate(doc)
    if doc.matter:
        out.matter_title = doc.matter.title
        out.matter_client = doc.matter.client_name
    return out
