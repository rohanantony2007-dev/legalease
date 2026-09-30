from fastapi import APIRouter
from backend.app.api.v1.endpoints import matters, documents, clauses, analytics

api_router = APIRouter()

api_router.include_router(matters.router, prefix="/matters", tags=["Matters"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(clauses.router, prefix="/clauses", tags=["Clauses"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
