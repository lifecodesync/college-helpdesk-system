import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api import auth, chat, documents, tickets, departments, notices, faqs, analytics, system

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI-powered College Helpdesk and Student Assistance System with RAG, pgvector search, and role-based ticket management.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all; in production restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for previewing uploaded documents/attachments
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)
app.include_router(documents.router, prefix=settings.API_V1_PREFIX)
app.include_router(tickets.router, prefix=settings.API_V1_PREFIX)
app.include_router(departments.router, prefix=settings.API_V1_PREFIX)
app.include_router(notices.router, prefix=settings.API_V1_PREFIX)
app.include_router(faqs.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(system.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": f"{settings.API_V1_PREFIX}/auth",
            "chat_rag": f"{settings.API_V1_PREFIX}/chat",
            "documents": f"{settings.API_V1_PREFIX}/documents",
            "tickets": f"{settings.API_V1_PREFIX}/tickets",
            "departments": f"{settings.API_V1_PREFIX}/departments",
            "notices": f"{settings.API_V1_PREFIX}/notices",
            "faqs": f"{settings.API_V1_PREFIX}/faqs",
            "analytics": f"{settings.API_V1_PREFIX}/analytics"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "College Helpdesk API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
