import os
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import SupabaseConfigRequest, SupabaseStatusResponse, ProfileResponse
from app.api.auth import get_current_user
from app.core.config import settings
from app.core.database import Database, init_supabase, supabase_client

router = APIRouter(prefix="/system", tags=["System & Cloud Services"])

@router.get("/supabase-status", response_model=SupabaseStatusResponse)
def get_supabase_status():
    status = Database.get_supabase_health()
    return SupabaseStatusResponse(**status)

@router.post("/supabase-config", response_model=SupabaseStatusResponse)
def configure_supabase(req: SupabaseConfigRequest, current_user: ProfileResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can configure cloud database settings.")

    # Update runtime settings
    settings.SUPABASE_URL = req.supabase_url.strip()
    settings.SUPABASE_KEY = req.supabase_key.strip()
    if req.supabase_service_role_key:
        settings.SUPABASE_SERVICE_ROLE_KEY = req.supabase_service_role_key.strip()

    # Re-initialize client
    success, message = init_supabase(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
        service_key=settings.SUPABASE_SERVICE_ROLE_KEY
    )

    # Persist to .env file in backend root
    try:
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        env_content = f"""PROJECT_NAME="AI College Helpdesk API"
API_V1_PREFIX="/api/v1"
PORT=8000
HOST="0.0.0.0"

SUPABASE_URL="{settings.SUPABASE_URL}"
SUPABASE_KEY="{settings.SUPABASE_KEY}"
SUPABASE_SERVICE_ROLE_KEY="{settings.SUPABASE_SERVICE_ROLE_KEY}"

GEMINI_API_KEY="{settings.GEMINI_API_KEY}"
EMBEDDING_MODEL="{settings.EMBEDDING_MODEL}"
LLM_MODEL="{settings.LLM_MODEL}"

JWT_SECRET="{settings.JWT_SECRET}"
JWT_ALGORITHM="{settings.JWT_ALGORITHM}"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
"""
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
    except Exception as e:
        print(f"Warning: could not write .env file: {e}")

    status = Database.get_supabase_health()
    return SupabaseStatusResponse(**status)
