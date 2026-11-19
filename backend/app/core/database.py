import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.core.config import settings

# Attempt initializing live Supabase client if configured
supabase_client = None

def init_supabase(url: str = None, key: str = None, service_key: str = None):
    global supabase_client
    target_url = url or settings.SUPABASE_URL
    target_key = service_key or key or settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    if target_url and target_key and "your-project" not in target_url:
        try:
            from supabase import create_client, Client
            supabase_client = create_client(target_url, target_key)
            print(" Connected to Supabase PostgreSQL at:", target_url)
            return True, "Connected to Supabase PostgreSQL successfully"
        except Exception as e:
            print(f"⚠️ Supabase connection failed: {e}. Falling back to high-fidelity in-memory database.")
            supabase_client = None
            return False, str(e)
    else:
        supabase_client = None
        return False, "Supabase credentials not configured or placeholder detected."

init_supabase()

# ----------------- In-Memory High-Fidelity College Data Store -----------------
# Pre-seeded with CSE final year demo data

DEPARTMENTS: List[Dict[str, Any]] = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "code": "CSE",
        "name": "Computer Science & Engineering",
        "description": "Undergraduate and postgraduate degrees in computing, AI, and cybersecurity.",
        "hod_name": "Dr. S. K. Narayanan",
        "email": "hod.cse@college.edu",
        "phone": "+91 9876543210",
        "location": "Block A, 3rd Floor",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "code": "ECE",
        "name": "Electronics & Communication",
        "description": "VLSI, Embedded Systems, IoT, and Signal Processing research and labs.",
        "hod_name": "Dr. Sunita Rao",
        "email": "hod.ece@college.edu",
        "phone": "+91 9876543211",
        "location": "Block B, 2nd Floor",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "code": "MECH",
        "name": "Mechanical Engineering",
        "description": "Thermodynamics, Robotics, CAD/CAM, and Automobile engineering.",
        "hod_name": "Dr. Rajesh Gupta",
        "email": "hod.mech@college.edu",
        "phone": "+91 9876543212",
        "location": "Block C, Ground Floor",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "code": "ADM",
        "name": "Admissions & Scholarships",
        "description": "Central admissions counseling, merit scholarships, and verification.",
        "hod_name": "Prof. Anil Deshmukh",
        "email": "admissions@college.edu",
        "phone": "+91 9876543213",
        "location": "Admin Block, Room 101",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "55555555-5555-5555-5555-555555555555",
        "code": "EXAM",
        "name": "Examination Cell",
        "description": "Semester exams, re-evaluations, grade cards, and degree certificates.",
        "hod_name": "Dr. Meenakshi Sundaram",
        "email": "examcell@college.edu",
        "phone": "+91 9876543214",
        "location": "Admin Block, Room 204",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "66666666-6666-6666-6666-666666666666",
        "code": "ACC",
        "name": "Accounts & Finance",
        "description": "Tuition fees, hostel dues, bus pass payment, and fee clearance.",
        "hod_name": "Mr. K. V. Raman",
        "email": "accounts@college.edu",
        "phone": "+91 9876543215",
        "location": "Admin Block, Ground Floor",
        "created_at": datetime.now(timezone.utc)
    }
]

PROFILES: List[Dict[str, Any]] = [
    {
        "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "email": "admin@college.edu",
        "password": "password123",
        "full_name": "Dr. Ramesh Sharma (Admin)",
        "role": "admin",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "roll_no": "EMP-ADM-01",
        "phone": "+91 9000000001",
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "email": "faculty.verma@college.edu",
        "password": "password123",
        "full_name": "Prof. Priya Verma",
        "role": "faculty",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "roll_no": "EMP-CSE-104",
        "phone": "+91 9000000002",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "email": "faculty.patel@college.edu",
        "password": "password123",
        "full_name": "Prof. Amit Patel",
        "role": "faculty",
        "department_id": "55555555-5555-5555-5555-555555555555",
        "roll_no": "EMP-EXM-042",
        "phone": "+91 9000000003",
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "email": "aarav.mehta@student.college.edu",
        "password": "password123",
        "full_name": "Aarav Mehta",
        "role": "student",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "roll_no": "22CS0104",
        "phone": "+91 9000000004",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        "email": "sneha.reddy@student.college.edu",
        "password": "password123",
        "full_name": "Sneha Reddy",
        "role": "student",
        "department_id": "22222222-2222-2222-2222-222222222222",
        "roll_no": "22EC0088",
        "phone": "+91 9000000005",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
]

DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "d1111111-1111-1111-1111-111111111111",
        "title": "Academic Regulations & Attendance Policy 2026",
        "filename": "Academic_Regulations_2026.pdf",
        "file_type": "pdf",
        "file_size": 1425000,
        "storage_path": "uploads/Academic_Regulations_2026.pdf",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "uploaded_by": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "status": "indexed",
        "chunk_count": 2,
        "summary": "Rules regarding minimum attendance criteria (75%), grading scale, condonation process, and credit requirements for B.Tech graduation.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "d2222222-2222-2222-2222-222222222222",
        "title": "Tuition Fee Payment, Scholarship & Refund Rules",
        "filename": "Fee_Payment_Guidelines.pdf",
        "file_type": "pdf",
        "file_size": 845000,
        "storage_path": "uploads/Fee_Payment_Guidelines.pdf",
        "department_id": "66666666-6666-6666-6666-666666666666",
        "uploaded_by": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "status": "indexed",
        "chunk_count": 1,
        "summary": "Semester fee deadlines, payment methods (Net Banking/UPI), late fine calculation (Rs 100/day), installment schemes, and refund percentages.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "d3333333-3333-3333-3333-333333333333",
        "title": "Campus Hostel Rules, Curfew & Mess Regulations",
        "filename": "Hostel_Rules_and_Mess_Policy.docx",
        "file_type": "docx",
        "file_size": 620000,
        "storage_path": "uploads/Hostel_Rules_and_Mess_Policy.docx",
        "department_id": "44444444-4444-4444-4444-444444444444",
        "uploaded_by": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "status": "indexed",
        "chunk_count": 1,
        "summary": "Curfew timings (9:30 PM weekdays, 10:00 PM Sundays), leave application procedures, mess menu rebate norms, visitors policy, and helpline.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "d4444444-4444-4444-4444-444444444444",
        "title": "Examination Cell Rules, Malpractice and Re-evaluation",
        "filename": "Exam_Cell_Guidelines.pdf",
        "file_type": "pdf",
        "file_size": 910000,
        "storage_path": "uploads/Exam_Cell_Guidelines.pdf",
        "department_id": "55555555-5555-5555-5555-555555555555",
        "uploaded_by": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "status": "indexed",
        "chunk_count": 1,
        "summary": "Procedure for end-semester re-evaluation (Rs 1,000 fee), photocopy of answer booklet (Rs 400), supplementary exam registration, and hall conduct.",
        "created_at": datetime.now(timezone.utc)
    }
]

DOCUMENT_CHUNKS: List[Dict[str, Any]] = [
    {
        "id": "c1111111-0001-0000-0000-000000000001",
        "document_id": "d1111111-1111-1111-1111-111111111111",
        "chunk_index": 1,
        "page_number": 1,
        "content": "ACADEMIC REGULATIONS - SECTION 4: ATTENDANCE REQUIREMENTS\nEvery candidate must secure a minimum of 75% overall attendance in aggregate across all registered theory and laboratory courses in a semester. Students having attendance between 65% and 74.9% due to medical reasons or officially sanctioned extracurricular participation may be granted condonation of attendance by the Academic Dean upon payment of a prescribed condonation fee of Rs. 1,000 per subject. Students with attendance below 65% will be detained and not permitted to write end-semester examinations.",
        "metadata": {"section": "4.1", "source": "Academic_Regulations_2026.pdf", "page": 1}
    },
    {
        "id": "c1111111-0002-0000-0000-000000000002",
        "document_id": "d1111111-1111-1111-1111-111111111111",
        "chunk_index": 2,
        "page_number": 2,
        "content": "ACADEMIC REGULATIONS - SECTION 7: GRADING SCHEME & CGPA\nThe evaluation is based on Continuous Internal Assessment (CIA: 40 marks) and End Semester Examination (ESE: 60 marks). Grades awarded:\nO (Outstanding): 10 grade points (90-100 marks)\nA+ (Excellent): 9 grade points (80-89 marks)\nA (Very Good): 8 grade points (70-79 marks)\nB+ (Good): 7 grade points (60-69 marks)\nB (Above Average): 6 grade points (50-59 marks)\nC (Average / Pass): 5 grade points (45-49 marks)\nF (Fail): 0 grade points (<45 marks).\nMinimum CGPA required to obtain B.Tech degree is 5.0 with zero active backlogs.",
        "metadata": {"section": "7.2", "source": "Academic_Regulations_2026.pdf", "page": 2}
    },
    {
        "id": "c2222222-0001-0000-0000-000000000001",
        "document_id": "d2222222-2222-2222-2222-222222222222",
        "chunk_index": 1,
        "page_number": 1,
        "content": "FEES & SCHOLARSHIP GUIDELINES - SECTION 2: TUITION FEE PAYMENT\nSemester tuition fees must be cleared on or before the 15th of the starting semester month. A grace period of 7 days is permitted with a late fine of Rs. 100 per day. Payments must strictly be processed through the official ERP student portal via Net Banking, Debit/Credit Card, or UPI. Cash payments are not accepted at the counter. For students applying for educational loans, bonafide estimation letters can be collected from Room 102 within 2 business days.",
        "metadata": {"section": "2.1", "source": "Fee_Payment_Guidelines.pdf", "page": 1}
    },
    {
        "id": "c3333333-0001-0000-0000-000000000001",
        "document_id": "d3333333-3333-3333-3333-333333333333",
        "chunk_index": 1,
        "page_number": 1,
        "content": "HOSTEL REGULATIONS - SECTION 3: ENTRY & CURFEW TIMINGS\nHostel gates will close promptly at 9:30 PM for all residents on weekdays (Monday to Saturday) and 10:00 PM on Sundays. Late entry requires prior written approval from the Chief Warden. Any student arriving after curfew without written permission will incur a fine of Rs. 500 on the first offense and disciplinary notice to parents on subsequent violations. Night-out passes must be submitted at least 24 hours in advance via the student portal.",
        "metadata": {"section": "3.1", "source": "Hostel_Rules_and_Mess_Policy.docx", "page": 1}
    },
    {
        "id": "c4444444-0001-0000-0000-000000000001",
        "document_id": "d4444444-4444-4444-4444-444444444444",
        "chunk_index": 1,
        "page_number": 1,
        "content": "EXAMINATION CELL - RE-EVALUATION AND SCRUTINY PROCEDURES\nStudents unsatisfied with their end-semester evaluation may apply for script photocopy or re-evaluation within 10 days of result declaration. Fees:\n1. Photocopy of answer booklet: Rs. 400 per course.\n2. Re-evaluation fee: Rs. 1,000 per course.\nIf re-evaluation results in an increase of 15% or more marks over the original score, 50% of the re-evaluation fee will be refunded to the student account.",
        "metadata": {"section": "5.3", "source": "Exam_Cell_Guidelines.pdf", "page": 1}
    }
]

TICKETS: List[Dict[str, Any]] = [
    {
        "id": "t1111111-1111-1111-1111-111111111111",
        "ticket_number": "TICK-1001",
        "title": "Attendance discrepancy in Machine Learning Lab",
        "description": "My attendance for the 3rd week ML lab shows absent despite having submitted the lab manual and signature on sheet.",
        "category": "Academics",
        "priority": "medium",
        "status": "in_progress",
        "student_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "assigned_to": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "resolution_notes": None,
        "resolved_at": None,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "t2222222-2222-2222-2222-222222222222",
        "ticket_number": "TICK-1002",
        "title": "Duplicate fee deduction during UPI transaction",
        "description": "Amount of Rs. 45,000 was deducted twice from my SBI account while paying the 5th semester hostel fee.",
        "category": "Fees",
        "priority": "high",
        "status": "open",
        "student_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        "assigned_to": None,
        "department_id": "66666666-6666-6666-6666-666666666666",
        "resolution_notes": None,
        "resolved_at": None,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "t3333333-3333-3333-3333-333333333333",
        "ticket_number": "TICK-1003",
        "title": "Request for Bonafide certificate for Passport renewal",
        "description": "I need a stamped bonafide letter addressed to the Regional Passport Office before this Friday.",
        "category": "Certificates",
        "priority": "low",
        "status": "resolved",
        "student_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "assigned_to": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "department_id": "44444444-4444-4444-4444-444444444444",
        "resolution_notes": "Certificate issued and kept at counter 3 for collection.",
        "resolved_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    }
]

TICKET_COMMENTS: List[Dict[str, Any]] = [
    {
        "id": "tc111111-1111-1111-1111-111111111111",
        "ticket_id": "t1111111-1111-1111-1111-111111111111",
        "user_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "message": "Hello ma'am, I checked with the lab assistant and he confirmed my attendance register entry is present.",
        "is_internal": False,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "tc222222-2222-2222-2222-222222222222",
        "ticket_id": "t1111111-1111-1111-1111-111111111111",
        "user_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "message": "Checked the physical register. The assistant missed entering it into the portal. Rectifying it by today evening.",
        "is_internal": False,
        "created_at": datetime.now(timezone.utc)
    }
]

NOTICES: List[Dict[str, Any]] = [
    {
        "id": "n1111111-1111-1111-1111-111111111111",
        "title": "Notice: End Semester Examination Timetable - Nov/Dec 2026",
        "content": "The detailed date sheet for B.Tech regular and backlog end-semester examinations has been published on the notice board and portal. Hall tickets can be downloaded starting next Monday.",
        "category": "Examinations",
        "department_id": "55555555-5555-5555-5555-555555555555",
        "is_pinned": True,
        "target_audience": "students",
        "attachment_url": None,
        "created_by": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "n2222222-2222-2222-2222-222222222222",
        "title": "Annual Inter-College Hackathon 'CodeStorm 2026' Registrations Open",
        "content": "CSE department is hosting the 36-hour National Hackathon with prizes worth Rs. 2,00,000. Form teams of 3 to 4 members. Registration deadline: Nov 28, 2026.",
        "category": "Events",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "is_pinned": True,
        "target_audience": "all",
        "attachment_url": None,
        "created_by": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "n3333333-3333-3333-3333-333333333333",
        "title": "Hostel Wi-Fi Maintenance Window Notice",
        "content": "Campus IT will carry out high-speed optic fiber backbone maintenance on Saturday from 2:00 AM to 6:00 AM. Internet services in Hostels A, B and C will remain intermittent.",
        "category": "Campus Life",
        "department_id": "44444444-4444-4444-4444-444444444444",
        "is_pinned": False,
        "target_audience": "all",
        "attachment_url": None,
        "created_by": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "created_at": datetime.now(timezone.utc)
    }
]

FAQS: List[Dict[str, Any]] = [
    {
        "id": "f1111111-1111-1111-1111-111111111111",
        "question": "What is the minimum attendance required to appear for semester exams?",
        "answer": "A minimum of 75% overall attendance is mandatory. Condonation up to 65% is permissible on medical grounds or university representation upon paying Rs. 1,000 condonation fee with Dean approval.",
        "category": "Academics",
        "department_id": "11111111-1111-1111-1111-111111111111",
        "view_count": 142,
        "is_published": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "f2222222-2222-2222-2222-222222222222",
        "question": "How do I apply for re-evaluation of my exam papers?",
        "answer": "Apply through the student ERP portal within 10 days of result announcement. The fee is Rs. 1,000 per subject. You can also request a photocopy of your evaluated answer script for Rs. 400.",
        "category": "Examinations",
        "department_id": "55555555-5555-5555-5555-555555555555",
        "view_count": 98,
        "is_published": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "f3333333-3333-3333-3333-333333333333",
        "question": "What is the hostel gate curfew timing for students?",
        "answer": "Hostel entry closes at 9:30 PM on weekdays and 10:00 PM on Sundays. Night-outs require an approved portal request 24 hours in advance.",
        "category": "Hostel",
        "department_id": "44444444-4444-4444-4444-444444444444",
        "view_count": 184,
        "is_published": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "f4444444-4444-4444-4444-444444444444",
        "question": "Where can I get a bonafide certificate for an educational bank loan?",
        "answer": "Bonafide letters and fee estimation certificates can be requested from the Admissions/Academic Section (Admin Block Room 102) or requested via the Helpdesk ticket system under Category: Documents.",
        "category": "Accounts",
        "department_id": "66666666-6666-6666-6666-666666666666",
        "view_count": 75,
        "is_published": True,
        "created_at": datetime.now(timezone.utc)
    }
]

QUERY_LOGS: List[Dict[str, Any]] = [
    {
        "id": "ql111111-1111-1111-1111-111111111111",
        "user_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "query_text": "What is the minimum attendance requirement?",
        "response_text": "According to the Academic Regulations 2026 (Section 4.1), you need a minimum of 75% overall attendance. Condonation up to 65% is possible on medical grounds with Dean approval.",
        "confidence_score": 0.94,
        "is_answered": True,
        "unanswered_reason": None,
        "feedback": "helpful",
        "response_time_ms": 410,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "ql222222-2222-2222-2222-222222222222",
        "user_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        "query_text": "When is the last date to pay the semester fee?",
        "response_text": "As per the Fee Guidelines (Section 2.1), semester tuition fees must be cleared by the 15th of the starting semester month. A 7-day grace period is allowed with Rs. 100/day fine.",
        "confidence_score": 0.91,
        "is_answered": True,
        "unanswered_reason": None,
        "feedback": "helpful",
        "response_time_ms": 380,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "ql333333-3333-3333-3333-333333333333",
        "user_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "query_text": "What are the swimming pool timings on weekend?",
        "response_text": "The provided college documents do not contain information about swimming pool operating hours. Please contact the Sports Complex or submit a Helpdesk ticket.",
        "confidence_score": 0.32,
        "is_answered": False,
        "unanswered_reason": "no_documents",
        "feedback": "unhelpful",
        "response_time_ms": 320,
        "created_at": datetime.now(timezone.utc)
    }
]

# ----------------- Database Access Helpers -----------------

class Database:
    @staticmethod
    def get_departments() -> List[Dict[str, Any]]:
        return DEPARTMENTS

    @staticmethod
    def get_department_by_id(dept_id: str) -> Optional[Dict[str, Any]]:
        return next((d for d in DEPARTMENTS if d["id"] == dept_id), None)

    @staticmethod
    def get_profiles() -> List[Dict[str, Any]]:
        return PROFILES

    @staticmethod
    def get_profile_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        return next((u for u in PROFILES if u["id"] == user_id), None)

    @staticmethod
    def get_profile_by_email(email: str) -> Optional[Dict[str, Any]]:
        return next((u for u in PROFILES if u["email"].lower() == email.lower()), None)

    @staticmethod
    def create_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
        profile = {
            "id": profile_data.get("id") or str(uuid.uuid4()),
            "email": profile_data["email"],
            "password": profile_data.get("password", "password123"),
            "full_name": profile_data["full_name"],
            "role": profile_data.get("role", "student"),
            "department_id": profile_data.get("department_id"),
            "roll_no": profile_data.get("roll_no"),
            "phone": profile_data.get("phone"),
            "avatar_url": profile_data.get("avatar_url", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        PROFILES.append(profile)
        return profile

    @staticmethod
    def get_documents() -> List[Dict[str, Any]]:
        return DOCUMENTS

    @staticmethod
    def get_document_by_id(doc_id: str) -> Optional[Dict[str, Any]]:
        return next((d for d in DOCUMENTS if d["id"] == doc_id), None)

    @staticmethod
    def add_document(doc_data: Dict[str, Any]) -> Dict[str, Any]:
        doc = {
            "id": doc_data.get("id") or str(uuid.uuid4()),
            "title": doc_data["title"],
            "filename": doc_data["filename"],
            "file_type": doc_data["file_type"],
            "file_size": doc_data["file_size"],
            "storage_path": doc_data.get("storage_path"),
            "department_id": doc_data.get("department_id"),
            "uploaded_by": doc_data.get("uploaded_by"),
            "status": doc_data.get("status", "processing"),
            "chunk_count": doc_data.get("chunk_count", 0),
            "summary": doc_data.get("summary", ""),
            "created_at": datetime.now(timezone.utc)
        }
        DOCUMENTS.insert(0, doc)
        return doc

    @staticmethod
    def update_document_status(doc_id: str, status: str, chunk_count: int = None, summary: str = None):
        for doc in DOCUMENTS:
            if doc["id"] == doc_id:
                doc["status"] = status
                if chunk_count is not None:
                    doc["chunk_count"] = chunk_count
                if summary is not None:
                    doc["summary"] = summary
                break

    @staticmethod
    def get_chunks(document_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if document_id:
            return [c for c in DOCUMENT_CHUNKS if c["document_id"] == document_id]
        return DOCUMENT_CHUNKS

    @staticmethod
    def add_chunk(chunk_data: Dict[str, Any]) -> Dict[str, Any]:
        chunk = {
            "id": chunk_data.get("id") or str(uuid.uuid4()),
            "document_id": chunk_data["document_id"],
            "chunk_index": chunk_data["chunk_index"],
            "page_number": chunk_data.get("page_number", 1),
            "content": chunk_data["content"],
            "metadata": chunk_data.get("metadata", {}),
            "created_at": datetime.now(timezone.utc)
        }
        DOCUMENT_CHUNKS.append(chunk)
        return chunk

    @staticmethod
    def get_tickets(user_id: Optional[str] = None, role: Optional[str] = None) -> List[Dict[str, Any]]:
        tickets = []
        for t in TICKETS:
            # Filter based on role
            if role == "student" and user_id and t["student_id"] != user_id:
                continue
            
            # Enrich with names
            student = Database.get_profile_by_id(t["student_id"])
            assigned = Database.get_profile_by_id(t["assigned_to"]) if t.get("assigned_to") else None
            dept = Database.get_department_by_id(t.get("department_id")) if t.get("department_id") else None
            comments = [c for c in TICKET_COMMENTS if c["ticket_id"] == t["id"]]
            if role == "student":
                comments = [c for c in comments if not c.get("is_internal", False)]

            enriched_comments = []
            for c in comments:
                author = Database.get_profile_by_id(c["user_id"])
                enriched_comments.append({
                    **c,
                    "user_name": author["full_name"] if author else "User",
                    "user_role": author["role"] if author else "student"
                })

            tickets.append({
                **t,
                "student_name": student["full_name"] if student else "Student",
                "student_email": student["email"] if student else "",
                "student_roll": student.get("roll_no") if student else "",
                "assigned_name": assigned["full_name"] if assigned else "Unassigned",
                "department_name": dept["name"] if dept else "General",
                "comments": enriched_comments
            })
        return tickets

    @staticmethod
    def get_ticket_by_id(ticket_id: str) -> Optional[Dict[str, Any]]:
        tickets = Database.get_tickets()
        return next((t for t in tickets if t["id"] == ticket_id), None)

    @staticmethod
    def create_ticket(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        count = len(TICKETS) + 1001
        ticket = {
            "id": ticket_data.get("id") or str(uuid.uuid4()),
            "ticket_number": f"TICK-{count}",
            "title": ticket_data["title"],
            "description": ticket_data["description"],
            "category": ticket_data.get("category", "General"),
            "priority": ticket_data.get("priority", "medium"),
            "status": "open",
            "student_id": ticket_data["student_id"],
            "assigned_to": None,
            "department_id": ticket_data.get("department_id"),
            "resolution_notes": None,
            "resolved_at": None,
            "created_at": datetime.now(timezone.utc)
        }
        TICKETS.insert(0, ticket)
        return Database.get_ticket_by_id(ticket["id"])

    @staticmethod
    def update_ticket_status(ticket_id: str, new_status: str, notes: Optional[str] = None):
        for t in TICKETS:
            if t["id"] == ticket_id:
                t["status"] = new_status
                if notes:
                    t["resolution_notes"] = notes
                if new_status in ["resolved", "closed"]:
                    t["resolved_at"] = datetime.now(timezone.utc)
                break
        return Database.get_ticket_by_id(ticket_id)

    @staticmethod
    def assign_ticket(ticket_id: str, assigned_to: str):
        for t in TICKETS:
            if t["id"] == ticket_id:
                t["assigned_to"] = assigned_to
                if t["status"] == "open":
                    t["status"] = "in_progress"
                break
        return Database.get_ticket_by_id(ticket_id)

    @staticmethod
    def add_ticket_comment(ticket_id: str, user_id: str, message: str, is_internal: bool = False):
        comment = {
            "id": str(uuid.uuid4()),
            "ticket_id": ticket_id,
            "user_id": user_id,
            "message": message,
            "is_internal": is_internal,
            "created_at": datetime.now(timezone.utc)
        }
        TICKET_COMMENTS.append(comment)
        author = Database.get_profile_by_id(user_id)
        return {
            **comment,
            "user_name": author["full_name"] if author else "User",
            "user_role": author["role"] if author else "student"
        }

    @staticmethod
    def get_notices() -> List[Dict[str, Any]]:
        # If Supabase is connected, attempt fetching live notices
        if supabase_client:
            try:
                res = supabase_client.table("notices").select("*").order("is_pinned", desc=True).order("created_at", desc=True).execute()
                if res.data:
                    enriched = []
                    for n in res.data:
                        dept = Database.get_department_by_id(n.get("department_id"))
                        creator = Database.get_profile_by_id(n.get("created_by"))
                        enriched.append({
                            **n,
                            "created_by_name": creator["full_name"] if creator else "College Administration",
                            "department_name": dept["name"] if dept else "Campus Wide"
                        })
                    return enriched
            except Exception as e:
                print(f"Supabase fetch notices fallback: {e}")

        results = []
        # Sort in-memory: pinned first, then newest
        sorted_notices = sorted(NOTICES, key=lambda x: (not x.get("is_pinned", False), -x["created_at"].timestamp() if isinstance(x["created_at"], datetime) else 0))
        for n in sorted_notices:
            creator = Database.get_profile_by_id(n.get("created_by"))
            dept = Database.get_department_by_id(n.get("department_id"))
            results.append({
                **n,
                "created_by_name": creator["full_name"] if creator else "Admin",
                "department_name": dept["name"] if dept else "Campus Wide"
            })
        return results

    @staticmethod
    def create_notice(data: Dict[str, Any]) -> Dict[str, Any]:
        notice_id = str(uuid.uuid4())
        notice = {
            "id": notice_id,
            "title": data["title"],
            "content": data["content"],
            "category": data.get("category", "General"),
            "department_id": data.get("department_id"),
            "is_pinned": bool(data.get("is_pinned", False)),
            "target_audience": data.get("target_audience", "all"),
            "attachment_url": data.get("attachment_url"),
            "created_by": data.get("created_by"),
            "created_at": datetime.now(timezone.utc)
        }
        NOTICES.insert(0, notice)

        if supabase_client:
            try:
                supabase_client.table("notices").insert({
                    "id": notice["id"],
                    "title": notice["title"],
                    "content": notice["content"],
                    "category": notice["category"],
                    "department_id": notice["department_id"],
                    "is_pinned": notice["is_pinned"],
                    "target_audience": notice["target_audience"],
                    "attachment_url": notice["attachment_url"],
                    "created_by": notice["created_by"]
                }).execute()
            except Exception as e:
                print(f"Supabase insert notice sync warning: {e}")

        return notice

    @staticmethod
    def delete_notice(notice_id: str) -> bool:
        global NOTICES
        NOTICES = [n for n in NOTICES if n["id"] != notice_id]
        if supabase_client:
            try:
                supabase_client.table("notices").delete().eq("id", notice_id).execute()
            except Exception as e:
                print(f"Supabase delete notice warning: {e}")
        return True

    @staticmethod
    def update_notice(notice_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for n in NOTICES:
            if n["id"] == notice_id:
                for k, v in updates.items():
                    if v is not None:
                        n[k] = v
                if supabase_client:
                    try:
                        clean_updates = {k: v for k, v in updates.items() if v is not None}
                        supabase_client.table("notices").update(clean_updates).eq("id", notice_id).execute()
                    except Exception as e:
                        print(f"Supabase update notice warning: {e}")
                return n
        return None

    @staticmethod
    def toggle_pin_notice(notice_id: str) -> Optional[Dict[str, Any]]:
        for n in NOTICES:
            if n["id"] == notice_id:
                n["is_pinned"] = not n.get("is_pinned", False)
                if supabase_client:
                    try:
                        supabase_client.table("notices").update({"is_pinned": n["is_pinned"]}).eq("id", notice_id).execute()
                    except Exception as e:
                        print(f"Supabase pin toggle warning: {e}")
                return n
        return None

    @staticmethod
    def get_faqs() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("faqs").select("*").order("view_count", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"Supabase fetch faqs fallback: {e}")
        return FAQS

    @staticmethod
    def create_faq(data: Dict[str, Any]) -> Dict[str, Any]:
        faq = {
            "id": str(uuid.uuid4()),
            "question": data["question"],
            "answer": data["answer"],
            "category": data.get("category", "General"),
            "department_id": data.get("department_id"),
            "view_count": 0,
            "is_published": data.get("is_published", True),
            "created_at": datetime.now(timezone.utc)
        }
        FAQS.insert(0, faq)
        if supabase_client:
            try:
                supabase_client.table("faqs").insert({
                    "id": faq["id"],
                    "question": faq["question"],
                    "answer": faq["answer"],
                    "category": faq["category"],
                    "department_id": faq["department_id"],
                    "view_count": 0,
                    "is_published": faq["is_published"]
                }).execute()
            except Exception as e:
                print(f"Supabase insert faq sync warning: {e}")
        return faq

    @staticmethod
    def delete_faq(faq_id: str) -> bool:
        global FAQS
        FAQS = [f for f in FAQS if f["id"] != faq_id]
        if supabase_client:
            try:
                supabase_client.table("faqs").delete().eq("id", faq_id).execute()
            except Exception as e:
                print(f"Supabase delete faq warning: {e}")
        return True

    @staticmethod
    def update_faq(faq_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for f in FAQS:
            if f["id"] == faq_id:
                for k, v in updates.items():
                    if v is not None:
                        f[k] = v
                if supabase_client:
                    try:
                        clean_updates = {k: v for k, v in updates.items() if v is not None}
                        supabase_client.table("faqs").update(clean_updates).eq("id", faq_id).execute()
                    except Exception as e:
                        print(f"Supabase update faq warning: {e}")
                return f
        return None

    @staticmethod
    def update_user_profile(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for p in PROFILES:
            if p["id"] == user_id:
                for k, v in updates.items():
                    if v is not None:
                        p[k] = v
                if supabase_client:
                    try:
                        clean_updates = {k: v for k, v in updates.items() if v is not None}
                        supabase_client.table("profiles").update(clean_updates).eq("id", user_id).execute()
                    except Exception as e:
                        print(f"Supabase update user warning: {e}")
                return p
        return None

    @staticmethod
    def get_supabase_health() -> Dict[str, Any]:
        global supabase_client
        if not supabase_client:
            return {
                "connected": False,
                "url": settings.SUPABASE_URL or "Not Configured",
                "mode": "in_memory_local",
                "message": "Running on high-performance local college database. Connect Supabase to sync to the cloud.",
                "tables": {
                    "profiles": len(PROFILES),
                    "departments": len(DEPARTMENTS),
                    "documents": len(DOCUMENTS),
                    "document_chunks": len(DOCUMENT_CHUNKS),
                    "tickets": len(TICKETS),
                    "notices": len(NOTICES),
                    "faqs": len(FAQS)
                }
            }

        try:
            # Test live query
            p_res = supabase_client.table("profiles").select("id", count="exact").limit(1).execute()
            d_res = supabase_client.table("departments").select("id", count="exact").limit(1).execute()
            n_res = supabase_client.table("notices").select("id", count="exact").limit(1).execute()
            t_res = supabase_client.table("tickets").select("id", count="exact").limit(1).execute()

            return {
                "connected": True,
                "url": settings.SUPABASE_URL,
                "mode": "live_supabase_postgresql",
                "message": "Connected to Supabase PostgreSQL with pgvector semantic vector search enabled.",
                "tables": {
                    "profiles_count": p_res.count if p_res.count is not None else len(PROFILES),
                    "departments_count": d_res.count if d_res.count is not None else len(DEPARTMENTS),
                    "notices_count": n_res.count if n_res.count is not None else len(NOTICES),
                    "tickets_count": t_res.count if t_res.count is not None else len(TICKETS)
                }
            }
        except Exception as e:
            return {
                "connected": False,
                "url": settings.SUPABASE_URL,
                "mode": "connection_error",
                "message": f"Supabase reached but query failed: {str(e)}. Run database/setup_all.sql in Supabase SQL editor.",
                "tables": {}
            }

    @staticmethod
    def log_query(query_data: Dict[str, Any]) -> Dict[str, Any]:
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": query_data.get("user_id"),
            "query_text": query_data["query_text"],
            "response_text": query_data["response_text"],
            "sources_used": query_data.get("sources_used", []),
            "confidence_score": query_data.get("confidence_score", 0.0),
            "is_answered": query_data.get("is_answered", True),
            "unanswered_reason": query_data.get("unanswered_reason"),
            "feedback": None,
            "response_time_ms": query_data.get("response_time_ms", 350),
            "created_at": datetime.now(timezone.utc)
        }
        QUERY_LOGS.insert(0, log_entry)
        return log_entry

    @staticmethod
    def update_feedback(query_id: str, feedback: str, comment: Optional[str] = None):
        for q in QUERY_LOGS:
            if q["id"] == query_id:
                q["feedback"] = feedback
                if comment:
                    q["feedback_comment"] = comment
                return True
        return False

    @staticmethod
    def get_query_logs() -> List[Dict[str, Any]]:
        return QUERY_LOGS
