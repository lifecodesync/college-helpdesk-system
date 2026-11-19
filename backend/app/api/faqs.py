from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import FAQCreate, FAQUpdate, FAQResponse, ProfileResponse
from app.api.auth import get_current_user
from app.core.database import Database

router = APIRouter(prefix="/faqs", tags=["Curated FAQs"])

@router.get("/", response_model=List[FAQResponse])
def get_faqs(department_id: Optional[str] = None):
    faqs = Database.get_faqs()
    if department_id:
        faqs = [f for f in faqs if f.get("department_id") == department_id or not f.get("department_id")]
    return [FAQResponse(**f) for f in faqs]

@router.post("/", response_model=FAQResponse)
def create_faq(
    req: FAQCreate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can create FAQs.")

    new_faq = Database.create_faq(req.model_dump())
    return FAQResponse(**new_faq)

@router.patch("/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: str,
    req: FAQUpdate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can edit FAQs.")

    updated = Database.update_faq(faq_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return FAQResponse(**updated)

@router.delete("/{faq_id}")
def delete_faq(faq_id: str, current_user: ProfileResponse = Depends(get_current_user)):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can delete FAQs.")

    Database.delete_faq(faq_id)
    return {"status": "success", "message": "FAQ deleted successfully"}
