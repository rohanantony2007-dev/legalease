from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from backend.app.schemas.document import DocumentOut

class MatterBase(BaseModel):
    title: str
    client_name: str
    status: str = "OPEN"
    practice_area: str = "Corporate"
    assigned_to: Optional[str] = None

class MatterCreate(MatterBase):
    pass

class MatterUpdate(BaseModel):
    title: Optional[str] = None
    client_name: Optional[str] = None
    status: Optional[str] = None
    practice_area: Optional[str] = None
    assigned_to: Optional[str] = None

class MatterOut(MatterBase):
    id: str
    created_at: datetime
    updated_at: datetime
    document_count: Optional[int] = 0

    class Config:
        from_attributes = True

class MatterDetailOut(MatterOut):
    documents: List[DocumentOut] = []
