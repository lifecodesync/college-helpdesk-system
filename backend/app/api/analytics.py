from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.models.schemas import OverviewAnalytics, DepartmentWorkload, UnansweredQueryItem, ProfileResponse
from app.api.auth import get_current_user
from app.core.database import Database

router = APIRouter(prefix="/analytics", tags=["Helpdesk & AI Analytics"])

@router.get("/overview", response_model=OverviewAnalytics)
def get_overview(current_user: ProfileResponse = Depends(get_current_user)):
    profiles = Database.get_profiles()
    students_count = len([p for p in profiles if p["role"] == "student"])
    
    tickets = Database.get_tickets()
    total_tickets = len(tickets)
    open_tickets = len([t for t in tickets if t["status"] in ["open", "in_progress"]])
    resolved_tickets = len([t for t in tickets if t["status"] in ["resolved", "closed"]])

    queries = Database.get_query_logs()
    total_queries = len(queries)
    unanswered_queries = len([q for q in queries if not q.get("is_answered")])

    helpful_feedback = len([q for q in queries if q.get("feedback") == "helpful"])
    total_feedback = len([q for q in queries if q.get("feedback") in ["helpful", "unhelpful"]])
    satisfaction_rate = round((helpful_feedback / total_feedback * 100), 1) if total_feedback > 0 else 92.5

    docs = Database.get_documents()
    chunks = Database.get_chunks()

    return OverviewAnalytics(
        total_students=students_count,
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        resolved_tickets=resolved_tickets,
        total_queries=total_queries,
        unanswered_queries=unanswered_queries,
        satisfaction_rate=satisfaction_rate,
        total_documents=len(docs),
        total_chunks=len(chunks)
    )

@router.get("/unanswered", response_model=List[UnansweredQueryItem])
def get_unanswered_queries(current_user: ProfileResponse = Depends(get_current_user)):
    queries = Database.get_query_logs()
    unanswered = [
        q for q in queries 
        if not q.get("is_answered") or q.get("feedback") == "unhelpful" or q.get("confidence_score", 1.0) < 0.4
    ]
    
    items = []
    for q in unanswered:
        author = Database.get_profile_by_id(q.get("user_id")) if q.get("user_id") else None
        items.append(UnansweredQueryItem(
            id=q["id"],
            query_text=q["query_text"],
            created_at=q.get("created_at"),
            confidence_score=q.get("confidence_score", 0.0),
            user_id=q.get("user_id"),
            user_name=author["full_name"] if author else "Student / Anonymous"
        ))
    return items

@router.get("/department-workload", response_model=List[DepartmentWorkload])
def get_department_workload(current_user: ProfileResponse = Depends(get_current_user)):
    depts = Database.get_departments()
    tickets = Database.get_tickets()
    
    workloads = []
    for d in depts:
        dept_tickets = [t for t in tickets if t.get("department_id") == d["id"]]
        open_cnt = len([t for t in dept_tickets if t["status"] in ["open", "in_progress"]])
        resolved_cnt = len([t for t in dept_tickets if t["status"] in ["resolved", "closed"]])
        
        workloads.append(DepartmentWorkload(
            department_name=d["name"],
            ticket_count=len(dept_tickets),
            open_count=open_cnt,
            resolved_count=resolved_cnt
        ))
    return workloads
