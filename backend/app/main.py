import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.database import engine, Base
from backend.app.api.v1.api_router import api_router
from backend.app.core.port_manager import record_runtime_port
import os

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Process timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

from fastapi.responses import FileResponse
from pathlib import Path

STATIC_INDEX = Path(__file__).resolve().parent / "static" / "index.html"

@app.get("/", response_class=FileResponse)
def root():
    if STATIC_INDEX.exists():
        return FileResponse(STATIC_INDEX)
    return {
        "message": "Welcome to LegalEase Contract Intelligence API",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/app", response_class=FileResponse)
def app_ui():
    return FileResponse(STATIC_INDEX)

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    from backend.app.core.port_manager import find_available_port, is_port_in_use

    preferred_port = int(os.getenv("PORT", 8000))
    port = preferred_port

    if is_port_in_use(port, host="127.0.0.1"):
        port = find_available_port(preferred_port)
        print(f"Port {preferred_port} is busy; starting server on available port {port} instead.")

    record_runtime_port("backend", port)
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=port, reload=True)
