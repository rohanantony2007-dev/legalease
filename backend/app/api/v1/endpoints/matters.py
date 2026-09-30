from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.db.models import Matter, Document
from backend.app.schemas.matter import MatterCreate, MatterUpdate, MatterOut, MatterDetailOut

router = APIRouter()

@router.get("/", response_model=List[MatterOut])
def get_matters(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    practice_area: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Matter)
    if status and status != "ALL":
        query = query.filter(Matter.status == status)
    if practice_area and practice_area != "ALL":
        query = query.filter(Matter.practice_area == practice_area)
    if search:
        query = query.filter(
            (Matter.title.ilike(f"%{search}%")) | (Matter.client_name.ilike(f"%{search}%"))
        )
    
    matters = query.order_by(Matter.updated_at.desc()).offset(skip).limit(limit).all()
    
    # Enrich with document counts
    res = []
    for m in matters:
        doc_count = db.query(Document).filter(Document.matter_id == m.id).count()
        item = MatterOut.model_validate(m)
        item.document_count = doc_count
        res.append(item)
    return res

@router.post("/", response_model=MatterOut, status_code=201)
def create_matter(matter_in: MatterCreate, db: Session = Depends(get_db)):
    matter = Matter(**matter_in.model_dump())
    db.add(matter)
    db.commit()
    db.refresh(matter)
    out = MatterOut.model_validate(matter)
    out.document_count = 0
    return out

@router.get("/{matter_id}", response_model=MatterDetailOut)
def get_matter(matter_id: str, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")
    
    out = MatterDetailOut.model_validate(matter)
    out.document_count = len(matter.documents)
    return out

@router.patch("/{matter_id}", response_model=MatterOut)
def update_matter(matter_id: str, matter_update: MatterUpdate, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")
    
    update_data = matter_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(matter, field, value)
        
    db.commit()
    db.refresh(matter)
    out = MatterOut.model_validate(matter)
    out.document_count = db.query(Document).filter(Document.matter_id == matter.id).count()
    return out

@router.delete("/{matter_id}", status_code=204)
def delete_matter(matter_id: str, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")
    db.delete(matter)
    db.commit()
    return None
