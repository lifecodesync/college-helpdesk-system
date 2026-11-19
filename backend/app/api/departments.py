from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import DepartmentResponse
from app.core.database import Database

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=List[DepartmentResponse])
def get_departments():
    depts = Database.get_departments()
    return [DepartmentResponse(**d) for d in depts]

@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(department_id: str):
    dept = Database.get_department_by_id(department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return DepartmentResponse(**dept)
