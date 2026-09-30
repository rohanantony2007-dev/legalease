from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClauseBase(BaseModel):
    clause_type: str
    original_text: str
    simplified_text: Optional[str] = None
    risk_rating: str = "PASS"  # PASS, ATTENTION, HIGH_RISK
    recommendation: Optional[str] = None
    section_number: int = 1

class ClauseCreate(ClauseBase):
    pass

class ClauseUpdate(BaseModel):
    simplified_text: Optional[str] = None
    risk_rating: Optional[str] = None
    recommendation: Optional[str] = None

class ClauseOut(ClauseBase):
    id: str
    document_id: str
    created_at: datetime

    class Config:
        from_attributes = True
