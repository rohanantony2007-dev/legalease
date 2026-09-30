from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from backend.app.db.database import get_db
from backend.app.db.models import Clause, Document, AuditLog
from backend.app.schemas.clause import ClauseCreate, ClauseUpdate, ClauseOut

router = APIRouter()

@router.get("/document/{document_id}", response_model=List[ClauseOut])
def get_document_clauses(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return db.query(Clause).filter(Clause.document_id == document_id).order_by(Clause.section_number.asc()).all()

@router.post("/document/{document_id}", response_model=ClauseOut, status_code=201)
def add_clause(document_id: str, clause_in: ClauseCreate, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    clause = Clause(
        document_id=document_id,
        **clause_in.model_dump()
    )
    db.add(clause)
    db.commit()
    db.refresh(clause)

    audit = AuditLog(
        document_id=document_id,
        action="CLAUSE_ADDED",
        details_json=json.dumps({"clause_type": clause.clause_type, "risk": clause.risk_rating})
    )
    db.add(audit)
    db.commit()

    return clause

@router.patch("/{clause_id}", response_model=ClauseOut)
def update_clause(clause_id: str, clause_update: ClauseUpdate, db: Session = Depends(get_db)):
    clause = db.query(Clause).filter(Clause.id == clause_id).first()
    if not clause:
        raise HTTPException(status_code=404, detail="Clause not found")
        
    update_data = clause_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(clause, field, value)
        
    db.commit()
    db.refresh(clause)

    audit = AuditLog(
        document_id=clause.document_id,
        action="CLAUSE_MODIFIED",
        details_json=json.dumps(update_data)
    )
    db.add(audit)
    db.commit()

    return clause

@router.delete("/{clause_id}", status_code=204)
def delete_clause(clause_id: str, db: Session = Depends(get_db)):
    clause = db.query(Clause).filter(Clause.id == clause_id).first()
    if not clause:
        raise HTTPException(status_code=404, detail="Clause not found")
    db.delete(clause)
    db.commit()
    return None
