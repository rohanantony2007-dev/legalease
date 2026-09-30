import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="ASSOCIATE")  # PARTNER, SENIOR_COUNSEL, ASSOCIATE, PARALEGAL
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assigned_matters = relationship("Matter", back_populates="assignee")
    audit_logs = relationship("AuditLog", back_populates="user")


class Matter(Base):
    __tablename__ = "matters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    client_name = Column(String(255), nullable=False)
    status = Column(String(50), default="OPEN", index=True)  # OPEN, IN_REVIEW, COMPLETED, ARCHIVED
    practice_area = Column(String(100), default="Corporate", index=True)  # Corporate, IP, Employment, Compliance, M&A
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignee = relationship("User", back_populates="assigned_matters")
    documents = relationship("Document", back_populates="matter", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    matter_id = Column(String(36), ForeignKey("matters.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_type = Column(String(20), default="PDF")  # PDF, DOCX, TXT
    file_size_bytes = Column(Integer, default=0)
    risk_level = Column(String(50), default="LOW", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=0.0)  # 0.0 - 100.0
    summary = Column(Text, nullable=True)
    status = Column(String(50), default="INGESTED", index=True)  # INGESTED, ANALYZED, FLAGGED, APPROVED
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    matter = relationship("Matter", back_populates="documents")
    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="document", cascade="all, delete-orphan")


class Clause(Base):
    __tablename__ = "clauses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    clause_type = Column(String(100), nullable=False)  # INDEMNITY, TERMINATION, CONFIDENTIALITY, LIABILITY_CAP, GOVERNING_LAW, NON_COMPETE
    original_text = Column(Text, nullable=False)
    simplified_text = Column(Text, nullable=True)
    risk_rating = Column(String(50), default="PASS", index=True)  # PASS, ATTENTION, HIGH_RISK
    recommendation = Column(Text, nullable=True)
    section_number = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("Document", back_populates="clauses")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # UPLOADED, RISK_EVALUATED, CLAUSE_MODIFIED, EXPORTED, STATUS_CHANGED
    details_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    document = relationship("Document", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")


# Compound Indexes for query performance
Index("idx_matter_status_practice", Matter.status, Matter.practice_area)
Index("idx_doc_risk_status", Document.risk_level, Document.status)
Index("idx_clause_doc_risk", Clause.document_id, Clause.risk_rating)
