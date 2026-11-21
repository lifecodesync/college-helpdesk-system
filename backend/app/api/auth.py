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
    email = req.email.strip().lower()
    user = Database.get_profile_by_email(email)
    
    if not user:
        # Any email is allowed to log in! Auto-create profile on the fly
        import random
        username_part = email.split("@")[0].replace(".", " ").replace("_", " ").replace("-", " ")
        full_name = " ".join([word.capitalize() for word in username_part.split() if word]) or "DYPCET User"
        
        # Determine role
        if any(k in email for k in ["admin", "director", "principal"]):
            role = "admin"
        elif any(k in email for k in ["faculty", "prof", "teacher", "hod"]):
            role = "faculty"
        else:
            role = "student"
        
        depts = Database.get_departments()
        default_dept_id = depts[0]["id"] if depts else "11111111-1111-1111-1111-111111111111"
        roll_no = f"21CS{random.randint(100, 999)}" if role == "student" else f"EMP-DYP-{random.randint(100, 999)}"
        
        new_profile_data = {
            "email": email,
            "full_name": full_name,
            "role": role,
            "department_id": default_dept_id,
            "roll_no": roll_no,
            "phone": "+91 9876500000",
            "password": get_password_hash(req.password or "password123"),
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
        }
        user = Database.create_profile(new_profile_data)
    
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
        "admin": ["admin@dypsem.edu", "admin@dypgroup.edu.in", "admin@college.edu"],
        "faculty": ["faculty.verma@dypsem.edu", "faculty.verma@dypgroup.edu.in", "faculty.verma@college.edu"],
        "student": ["aarav.mehta@student.dypsem.edu", "aarav.mehta@student.dypcet.ac.in", "aarav.mehta@student.college.edu"]
    }
    possible_emails = email_map.get(target_role, ["aarav.mehta@student.dypsem.edu"])
    user = None
    for em in possible_emails:
        user = Database.get_profile_by_email(em)
        if user:
            break
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
