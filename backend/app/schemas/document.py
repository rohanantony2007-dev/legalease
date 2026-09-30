from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from backend.app.schemas.clause import ClauseOut

class DocumentBase(BaseModel):
    matter_id: str
    title: str
    file_type: str = "PDF"
    file_size_bytes: int = 0
    risk_level: str = "LOW"
    risk_score: float = 0.0
    summary: Optional[str] = None
    status: str = "INGESTED"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    summary: Optional[str] = None
    status: Optional[str] = None

class DocumentOut(DocumentBase):
    id: str
    uploaded_at: datetime
    clauses: Optional[List[ClauseOut]] = []

    class Config:
        from_attributes = True

class DocumentDetailOut(DocumentOut):
    matter_title: Optional[str] = None
    matter_client: Optional[str] = None
