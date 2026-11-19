from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import NoticeCreate, NoticeUpdate, NoticeResponse, ProfileResponse
from app.api.auth import get_current_user
from app.core.database import Database

router = APIRouter(prefix="/notices", tags=["Campus Notices"])

@router.get("/", response_model=List[NoticeResponse])
def get_notices(department_id: Optional[str] = None):
    notices = Database.get_notices()
    if department_id:
        notices = [n for n in notices if n.get("department_id") == department_id or not n.get("department_id")]
    return [NoticeResponse(**n) for n in notices]

@router.post("/", response_model=NoticeResponse)
def create_notice(
    req: NoticeCreate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can publish campus notices.")

    data = req.model_dump()
    data["created_by"] = current_user.id
    new_notice = Database.create_notice(data)
    
    dept = Database.get_department_by_id(data.get("department_id"))
    return NoticeResponse(
        **new_notice,
        created_by_name=current_user.full_name,
        department_name=dept["name"] if dept else "Campus Wide"
    )

@router.patch("/{notice_id}", response_model=NoticeResponse)
def update_notice(
    notice_id: str,
    req: NoticeUpdate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can edit notices.")

    updated = Database.update_notice(notice_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Notice not found")

    dept = Database.get_department_by_id(updated.get("department_id"))
    creator = Database.get_profile_by_id(updated.get("created_by"))
    return NoticeResponse(
        **updated,
        created_by_name=creator["full_name"] if creator else "Admin",
        department_name=dept["name"] if dept else "Campus Wide"
    )

@router.post("/{notice_id}/toggle-pin", response_model=NoticeResponse)
def toggle_pin(notice_id: str, current_user: ProfileResponse = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can pin notices.")

    updated = Database.toggle_pin_notice(notice_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Notice not found")

    dept = Database.get_department_by_id(updated.get("department_id"))
    creator = Database.get_profile_by_id(updated.get("created_by"))
    return NoticeResponse(
        **updated,
        created_by_name=creator["full_name"] if creator else "Admin",
        department_name=dept["name"] if dept else "Campus Wide"
    )

@router.delete("/{notice_id}")
def delete_notice(notice_id: str, current_user: ProfileResponse = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can delete notices.")

    Database.delete_notice(notice_id)
    return {"status": "success", "message": "Notice deleted successfully"}
