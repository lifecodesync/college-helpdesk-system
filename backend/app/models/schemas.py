from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- User & Profile -----------------
class UserRole:
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

class ProfileBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student"
    department_id: Optional[str] = None
    roll_no: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    password: str

class ProfileResponse(ProfileBase):
    id: str
    is_active: bool = True
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: ProfileResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SwitchRoleRequest(BaseModel):
    role: str
    user_id: Optional[str] = None

class UserUpdateRequest(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
    department_id: Optional[str] = None
    phone: Optional[str] = None

# ----------------- Departments -----------------
class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    hod_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: str
    created_at: Optional[datetime] = None

# ----------------- Documents & Chunks -----------------
class DocumentChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    page_number: int
    content: str
    metadata: Dict[str, Any] = {}
    similarity: Optional[float] = None

class DocumentResponse(BaseModel):
    id: str
    title: str
    filename: str
    file_type: str
    file_size: int
    storage_path: Optional[str] = None
    department_id: Optional[str] = None
    uploaded_by: Optional[str] = None
    status: str
    chunk_count: int
    summary: Optional[str] = None
    created_at: Optional[datetime] = None

# ----------------- Support Tickets -----------------
class TicketPriority:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketStatus:
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketCommentCreate(BaseModel):
    message: str
    is_internal: bool = False

class TicketCommentResponse(BaseModel):
    id: str
    ticket_id: str
    user_id: str
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    message: str
    is_internal: bool = False
    created_at: Optional[datetime] = None

class TicketCreate(BaseModel):
    title: str
    description: str
    category: str = "General"
    priority: str = "medium"
    department_id: Optional[str] = None

class TicketStatusUpdate(BaseModel):
    status: str
    resolution_notes: Optional[str] = None

class TicketAssignUpdate(BaseModel):
    assigned_to: str

class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_roll: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_name: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    comments: List[TicketCommentResponse] = []

# ----------------- Notices -----------------
class NoticeCreate(BaseModel):
    title: str
    content: str
    category: str = "General"
    department_id: Optional[str] = None
    is_pinned: bool = False
    target_audience: str = "all"
    attachment_url: Optional[str] = None

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    department_id: Optional[str] = None
    is_pinned: Optional[bool] = None
    target_audience: Optional[str] = None
    attachment_url: Optional[str] = None

class NoticeResponse(NoticeCreate):
    id: str
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    department_name: Optional[str] = None
    created_at: Optional[datetime] = None

# ----------------- FAQs -----------------
class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str = "General"
    department_id: Optional[str] = None
    is_published: bool = True

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    department_id: Optional[str] = None
    is_published: Optional[bool] = None

class FAQResponse(FAQCreate):
    id: str
    view_count: int = 0
    created_at: Optional[datetime] = None

# ----------------- System & Supabase -----------------
class SupabaseConfigRequest(BaseModel):
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: Optional[str] = None

class SupabaseStatusResponse(BaseModel):
    connected: bool
    url: Optional[str] = None
    mode: str
    message: str
    tables: Dict[str, Any] = {}

# ----------------- RAG & Chatbot -----------------
class SourceCitation(BaseModel):
    document_id: str
    document_title: str
    filename: Optional[str] = None
    page_number: int
    chunk_index: int
    content_snippet: str
    similarity: float

class ChatQueryRequest(BaseModel):
    query: str
    department_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ChatQueryResponse(BaseModel):
    query_id: str
    answer: str
    sources: List[SourceCitation]
    confidence_score: float
    is_answered: bool
    unanswered_reason: Optional[str] = None
    response_time_ms: int

class ChatFeedbackRequest(BaseModel):
    query_id: str
    feedback: str # 'helpful' | 'unhelpful'
    comment: Optional[str] = None

# ----------------- Analytics -----------------
class OverviewAnalytics(BaseModel):
    total_students: int
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    total_queries: int
    unanswered_queries: int
    satisfaction_rate: float
    total_documents: int
    total_chunks: int

class DepartmentWorkload(BaseModel):
    department_name: str
    ticket_count: int
    open_count: int
    resolved_count: int

class UnansweredQueryItem(BaseModel):
    id: str
    query_text: str
    created_at: Optional[datetime] = None
    confidence_score: float
    user_id: Optional[str] = None
    user_name: Optional[str] = None
