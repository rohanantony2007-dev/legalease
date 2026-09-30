import sys
import os
import json
from datetime import datetime, timedelta

# Ensure root path is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models import User, Matter, Document, Clause, AuditLog

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Cleaning existing data for fresh seed...")
            db.query(AuditLog).delete()
            db.query(Clause).delete()
            db.query(Document).delete()
            db.query(Matter).delete()
            db.query(User).delete()
            db.commit()

        print("Seeding Users...")
        u1 = User(id="usr_01", full_name="Eleanor Vance", email="e.vance@legalease.law", role="PARTNER")
        u2 = User(id="usr_02", full_name="Marcus Sterling", email="m.sterling@legalease.law", role="SENIOR_COUNSEL")
        u3 = User(id="usr_03", full_name="Sarah Jenkins", email="s.jenkins@legalease.law", role="ASSOCIATE")
        u4 = User(id="usr_04", full_name="David Thorne", email="d.thorne@legalease.law", role="PARALEGAL")
        db.add_all([u1, u2, u3, u4])
        db.commit()

        print("Seeding Matters...")
        now = datetime.utcnow()
        matters = [
            Matter(
                id="mat_01",
                title="Acquisition of CloudPeak Technologies",
                client_name="Apex Global Holdings",
                status="IN_REVIEW",
                practice_area="M&A",
                assigned_to=u1.id,
                created_at=now - timedelta(days=12),
                updated_at=now - timedelta(hours=2)
            ),
            Matter(
                id="mat_02",
                title="Cross-Border AI Licensing & Cloud Terms",
                client_name="NexaCore AI Inc",
                status="OPEN",
                practice_area="IP & Tech",
                assigned_to=u3.id,
                created_at=now - timedelta(days=8),
                updated_at=now - timedelta(hours=5)
            ),
            Matter(
                id="mat_03",
                title="Series B Preferred Stock Financing",
                client_name="Lumina BioSystems",
                status="OPEN",
                practice_area="Corporate",
                assigned_to=u2.id,
                created_at=now - timedelta(days=20),
                updated_at=now - timedelta(days=1)
            ),
            Matter(
                id="mat_04",
                title="Enterprise Master Services Agreement (MSA)",
                client_name="Quantum Dynamics",
                status="IN_REVIEW",
                practice_area="Commercial",
                assigned_to=u3.id,
                created_at=now - timedelta(days=5),
                updated_at=now - timedelta(minutes=40)
            ),
            Matter(
                id="mat_05",
                title="EU AI Act & Data Protection Audit",
                client_name="DataSphere Europe",
                status="COMPLETED",
                practice_area="Compliance",
                assigned_to=u4.id,
                created_at=now - timedelta(days=35),
                updated_at=now - timedelta(days=3)
            ),
            Matter(
                id="mat_06",
                title="Executive Severance & Non-Compete Review",
                client_name="Veloce Mobility",
                status="OPEN",
                practice_area="Employment",
                assigned_to=u2.id,
                created_at=now - timedelta(days=3),
                updated_at=now - timedelta(hours=8)
            )
        ]
        db.add_all(matters)
        db.commit()

        print("Seeding Documents & Clauses...")
        # Document 1 (CloudPeak)
        doc1 = Document(
            id="doc_01",
            matter_id="mat_01",
            title="CloudPeak - Asset Purchase Agreement (v4.2)",
            file_type="PDF",
            file_size_bytes=3420000,
            risk_level="HIGH",
            risk_score=78.5,
            summary="Comprehensive asset purchase agreement. Contains broad uncapped indemnification provisions and non-standard IP assignment definitions.",
            status="ANALYZED",
            uploaded_at=now - timedelta(days=4)
        )
        # Document 2 (CloudPeak)
        doc2 = Document(
            id="doc_02",
            matter_id="mat_01",
            title="Key Personnel Non-Compete & Escrow Schedule",
            file_type="PDF",
            file_size_bytes=890000,
            risk_level="MEDIUM",
            risk_score=52.0,
            summary="Restrictive covenant covenants across 3-year term. Territorial scope exceeds market standards.",
            status="ANALYZED",
            uploaded_at=now - timedelta(days=2)
        )
        # Document 3 (NexaCore)
        doc3 = Document(
            id="doc_03",
            matter_id="mat_02",
            title="NexaCore SaaS Master Agreement & SLA",
            file_type="PDF",
            file_size_bytes=1450000,
            risk_level="CRITICAL",
            risk_score=91.0,
            summary="SaaS licensing terms with 99.99% uptime commitment and consequential damage waivers favoring customer.",
            status="FLAGGED",
            uploaded_at=now - timedelta(days=1)
        )
        # Document 4 (Quantum Dynamics)
        doc4 = Document(
            id="doc_04",
            matter_id="mat_04",
            title="Quantum Dynamics - Master Services Agreement",
            file_type="PDF",
            file_size_bytes=2100000,
            risk_level="LOW",
            risk_score=22.0,
            summary="Standard corporate MSA using market mutual indemnity and 1x annual fee limitation of liability.",
            status="APPROVED",
            uploaded_at=now - timedelta(days=3)
        )
        # Document 5 (Lumina BioSystems)
        doc5 = Document(
            id="doc_05",
            matter_id="mat_03",
            title="Lumina - Series B Investor Rights Agreement",
            file_type="PDF",
            file_size_bytes=4200000,
            risk_level="MEDIUM",
            risk_score=48.0,
            summary="Covers information rights, registration rights, and board observer appointments. Standard NVCA framework.",
            status="ANALYZED",
            uploaded_at=now - timedelta(days=6)
        )
        # Document 6 (DataSphere)
        doc6 = Document(
            id="doc_06",
            matter_id="mat_05",
            title="EU Standard Contractual Clauses (SCCs) Addendum",
            file_type="PDF",
            file_size_bytes=950000,
            risk_level="LOW",
            risk_score=15.0,
            summary="Module 2 controller-to-processor standard clauses verbatim with complete technical Annex II.",
            status="APPROVED",
            uploaded_at=now - timedelta(days=10)
        )
        db.add_all([doc1, doc2, doc3, doc4, doc5, doc6])
        db.commit()

        # Clauses for doc_01
        clauses_doc1 = [
            Clause(
                id="cls_01",
                document_id="doc_01",
                clause_type="INDEMNIFICATION",
                original_text="Seller agrees to defend, indemnify, and hold harmless Buyer and its affiliates from and against any and all losses, claims, damages, liabilities, costs, or expenses (including unlimited legal fees) resulting from any breach of representation, without financial limitation or time bar.",
                simplified_text="Seller pays for all buyer lawsuits and damages forever without any maximum dollar limit.",
                risk_rating="HIGH_RISK",
                recommendation="Replace with mutual indemnity, cap aggregate liability at 100% of purchase price, and establish a 24-month survival sunset.",
                section_number=1
            ),
            Clause(
                id="cls_02",
                document_id="doc_01",
                clause_type="LIABILITY_CAP",
                original_text="Neither Party shall be subject to any cap or limitation of liability in respect of claims arising under Section 8 (Intellectual Property Warranties) or Section 12 (Data Privacy Breaches).",
                simplified_text="Liability for IP claims and data leaks is completely uncapped.",
                risk_rating="HIGH_RISK",
                recommendation="Introduce a super-cap of 2x total transaction value for IP and data privacy rather than leaving exposure completely uncapped.",
                section_number=2
            ),
            Clause(
                id="cls_03",
                document_id="doc_01",
                clause_type="GOVERNING_LAW",
                original_text="This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to any choice of law principles.",
                simplified_text="Delaware law governs any disputes arising from this contract.",
                risk_rating="PASS",
                recommendation="Standard Delaware choice of law. Clean and acceptable.",
                section_number=3
            ),
            Clause(
                id="cls_04",
                document_id="doc_01",
                clause_type="TERMINATION",
                original_text="Buyer may terminate this Agreement without penalty at any time prior to Closing upon three (3) business days' written notice to Seller for any reason whatsoever.",
                simplified_text="Buyer can cancel the whole deal on 3 days notice with zero penalty.",
                risk_rating="ATTENTION",
                recommendation="Require termination fees (break fee) or limit right of termination to specific defined Material Adverse Effects.",
                section_number=4
            )
        ]

        # Clauses for doc_03 (Critical SaaS)
        clauses_doc3 = [
            Clause(
                id="cls_05",
                document_id="doc_03",
                clause_type="DATA_BREACH_NOTIFICATION",
                original_text="Vendor shall notify Customer of any confirmed or suspected security incident within four (4) hours of discovery, and shall grant Customer full access to Vendor's internal forensic logs and physical server nodes.",
                simplified_text="Vendor must report suspected hacks within 4 hours and let the customer inspect physical server rooms.",
                risk_rating="HIGH_RISK",
                recommendation="Extend notification timeline to standard 48 hours for confirmed incidents; replace physical server access with third-party SOC2 Type II audit report access.",
                section_number=1
            ),
            Clause(
                id="cls_06",
                document_id="doc_03",
                clause_type="UPTIME_SLA",
                original_text="Vendor warrants a monthly service availability of 99.99%. In the event availability dips below 99.9%, Customer shall be entitled to an immediate 50% refund of annual enterprise licensing fees.",
                simplified_text="If service uptime drops below 99.9%, customer gets half their entire yearly fee refunded.",
                risk_rating="HIGH_RISK",
                recommendation="Restructure remedy to service credits applied against future renewal invoices rather than direct cash refunds.",
                section_number=2
            ),
            Clause(
                id="cls_07",
                document_id="doc_03",
                clause_type="INTELLECTUAL_PROPERTY",
                original_text="All modifications, enhancements, or derivatives of the software developed during the term shall automatically vest in and become the sole property of Customer.",
                simplified_text="Any improvements or custom features made during the contract become the customer's property.",
                risk_rating="HIGH_RISK",
                recommendation="Strike clause. Maintain Vendor sole ownership of core platform and generic improvements; grant Customer license to use.",
                section_number=3
            )
        ]

        # Clauses for doc_04 (Standard MSA)
        clauses_doc4 = [
            Clause(
                id="cls_08",
                document_id="doc_04",
                clause_type="CONFIDENTIALITY",
                original_text="Each party agrees to hold the other party's Confidential Information in strict confidence using at least the same degree of care it uses for its own confidential materials of like nature, but not less than reasonable care.",
                simplified_text="Both parties must guard each other's secrets with standard reasonable care.",
                risk_rating="PASS",
                recommendation="Standard mutual non-disclosure language. Verified compliant.",
                section_number=1
            ),
            Clause(
                id="cls_09",
                document_id="doc_04",
                clause_type="LIABILITY_CAP",
                original_text="Each party's maximum aggregate liability shall be limited to the total fees actually paid or payable by Customer in the twelve (12) months preceding the claim.",
                simplified_text="Liability is capped at the past 12 months fees paid.",
                risk_rating="PASS",
                recommendation="Market standard 1x 12-month trailing fee cap.",
                section_number=2
            )
        ]

        db.add_all(clauses_doc1 + clauses_doc3 + clauses_doc4)
        db.commit()

        print("Seeding Audit Trail Logs...")
        audits = [
            AuditLog(
                id="aud_01",
                document_id="doc_01",
                user_id=u1.id,
                action="DOCUMENT_UPLOADED",
                details_json=json.dumps({"source": "M&A Data Room VDR-3", "file_name": "CloudPeak_APA_v4.2.pdf"}),
                timestamp=now - timedelta(days=4, hours=2)
            ),
            AuditLog(
                id="aud_02",
                document_id="doc_01",
                user_id=u3.id,
                action="AI_RISK_EVALUATED",
                details_json=json.dumps({"risk_score": 78.5, "flagged_clauses": 2, "model": "LegalEase-Claude-Analysis"}),
                timestamp=now - timedelta(days=3, hours=22)
            ),
            AuditLog(
                id="aud_03",
                document_id="doc_03",
                user_id=u3.id,
                action="CLAUSE_MODIFIED",
                details_json=json.dumps({"clause": "DATA_BREACH_NOTIFICATION", "change": "Proposed 48hr revision"}),
                timestamp=now - timedelta(days=1, hours=3)
            ),
            AuditLog(
                id="aud_04",
                document_id="doc_04",
                user_id=u2.id,
                action="STATUS_CHANGED",
                details_json=json.dumps({"previous": "ANALYZED", "new": "APPROVED"}),
                timestamp=now - timedelta(hours=14)
            )
        ]
        db.add_all(audits)
        db.commit()

        print("Successfully seeded LegalEase database with realistic legal datasets!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
