from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    TicketCreate, TicketResponse, TicketStatusUpdate,
    TicketAssignUpdate, TicketCommentCreate, TicketCommentResponse,
    ProfileResponse
)
from app.api.auth import get_current_user
from app.core.database import Database

router = APIRouter(prefix="/tickets", tags=["Support Tickets"])

@router.get("/", response_model=List[TicketResponse])
def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[str] = None,
    department_id: Optional[str] = None,
    current_user: ProfileResponse = Depends(get_current_user)
):
    tickets = Database.get_tickets(user_id=current_user.id, role=current_user.role)
    
    if status:
        tickets = [t for t in tickets if t["status"].lower() == status.lower()]
    if priority:
        tickets = [t for t in tickets if t["priority"].lower() == priority.lower()]
    if category:
        tickets = [t for t in tickets if t["category"].lower() == category.lower()]
    if assigned_to:
        tickets = [t for t in tickets if t.get("assigned_to") == assigned_to]
    if department_id:
        tickets = [t for t in tickets if t.get("department_id") == department_id]
        
    return [TicketResponse(**t) for t in tickets]

@router.post("/", response_model=TicketResponse)
def create_ticket(
    req: TicketCreate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    data = req.model_dump()
    data["student_id"] = current_user.id
    new_ticket = Database.create_ticket(data)
    return TicketResponse(**new_ticket)

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, current_user: ProfileResponse = Depends(get_current_user)):
    ticket = Database.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Check authorization
    if current_user.role == "student" and ticket["student_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view this ticket")
        
    return TicketResponse(**ticket)

@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_status(
    ticket_id: str,
    req: TicketStatusUpdate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    ticket = Database.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Students can only close their own tickets; Faculty/Admin can change to any status
    if current_user.role == "student":
        if ticket["student_id"] != current_user.id or req.status != "closed":
            raise HTTPException(status_code=403, detail="Students can only close their own tickets")

    updated = Database.update_ticket_status(ticket_id, req.status, req.resolution_notes)
    
    # Auto-add an internal or activity note
    Database.add_ticket_comment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=f"Status changed to {req.status.upper()}." + (f" Note: {req.resolution_notes}" if req.resolution_notes else ""),
        is_internal=False
    )
    
    return TicketResponse(**Database.get_ticket_by_id(ticket_id))

@router.patch("/{ticket_id}/assign", response_model=TicketResponse)
def assign_ticket(
    ticket_id: str,
    req: TicketAssignUpdate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty or admin can assign tickets")
        
    staff = Database.get_profile_by_id(req.assigned_to)
    if not staff:
        raise HTTPException(status_code=400, detail="Staff member not found")

    updated = Database.assign_ticket(ticket_id, req.assigned_to)
    Database.add_ticket_comment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=f"Ticket assigned to {staff['full_name']} ({staff['role'].capitalize()}).",
        is_internal=False
    )
    return TicketResponse(**updated)

@router.post("/{ticket_id}/comments", response_model=TicketCommentResponse)
def add_comment(
    ticket_id: str,
    req: TicketCommentCreate,
    current_user: ProfileResponse = Depends(get_current_user)
):
    ticket = Database.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Verify participant
    if current_user.role == "student" and ticket["student_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    is_internal = req.is_internal and current_user.role in ["faculty", "admin"]
    comment = Database.add_ticket_comment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=req.message,
        is_internal=is_internal
    )
    return TicketCommentResponse(**comment)
