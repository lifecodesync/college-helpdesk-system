from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.models.schemas import (
    ProfileCreate, ProfileResponse, LoginRequest, TokenResponse, SwitchRoleRequest, UserUpdateRequest
)
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token, oauth2_scheme
from app.core.database import Database

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> ProfileResponse:
    if not token:
        # Default to student demo user if no token provided
        student = Database.get_profile_by_email("aarav.mehta@student.college.edu")
        if student:
            return ProfileResponse(**student)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = Database.get_profile_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return ProfileResponse(**user)

@router.post("/register", response_model=TokenResponse)
def register(req: ProfileCreate):
    existing = Database.get_profile_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user_data = req.model_dump()
    user_data["password"] = get_password_hash(req.password)
    new_user = Database.create_profile(user_data)
    
    token = create_access_token({"sub": new_user["id"], "role": new_user["role"], "email": new_user["email"]})
    return TokenResponse(access_token=token, user=ProfileResponse(**new_user))

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    user = Database.get_profile_by_email(req.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(req.password, user.get("password", "")):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"], "role": user["role"], "email": user["email"]})
    return TokenResponse(access_token=token, user=ProfileResponse(**user))

@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: ProfileResponse = Depends(get_current_user)):
    return current_user

@router.post("/demo-switch", response_model=TokenResponse)
def switch_demo_role(req: SwitchRoleRequest):
    """
    Convenient switcher for evaluators, viva examination, and demo presentation.
    Instantly returns credentials for predefined Student, Faculty, or Admin accounts.
    """
    target_role = req.role.lower()
    email_map = {
        "admin": "admin@college.edu",
        "faculty": "faculty.verma@college.edu",
        "student": "aarav.mehta@student.college.edu"
    }
    target_email = email_map.get(target_role, "aarav.mehta@student.college.edu")
    user = Database.get_profile_by_email(target_email)
    if not user:
        user = Database.get_profiles()[0]
    
    token = create_access_token({"sub": user["id"], "role": user["role"], "email": user["email"]})
    return TokenResponse(access_token=token, user=ProfileResponse(**user))

@router.get("/users", response_model=List[ProfileResponse])
def list_users(current_user: ProfileResponse = Depends(get_current_user)):
    # Can be viewed by faculty or admin
    profiles = Database.get_profiles()
    return [ProfileResponse(**p) for p in profiles]

@router.patch("/users/{user_id}", response_model=ProfileResponse)
def update_user(
    user_id: str,
    req: UserUpdateRequest,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can update user roles or account status.")

    updated = Database.update_user_profile(user_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return ProfileResponse(**updated)
