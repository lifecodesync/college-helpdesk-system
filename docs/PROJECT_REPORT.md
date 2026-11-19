# Project Report: AI-Based College Helpdesk and Student Assistance System

**Academic Year:** 2026-2027  
**Degree:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)  
**Project Category:** Full-Stack Enterprise Web Application & Applied Artificial Intelligence (RAG)

---

## 1. Executive Summary & Abstract
Colleges and universities experience massive volumes of repetitive inquiries regarding semester exams, syllabus revisions, fee payments, hostel curfews, and attendance condonation. Traditional helpdesks struggle with staff availability, response lag, and lack of traceability. 

This project delivers **EduAssist**, a production-grade, full-stack, AI-based College Helpdesk and Student Assistance System built on a modern **React + FastAPI + Supabase PostgreSQL (pgvector)** stack. 

### Key Technical Innovations:
- **Retrieval-Augmented Generation (RAG):** AI chatbot strictly grounded on official university PDF/DOCX handbooks, delivering accurate answers with verified source citations (document title, page number, and similarity score) to eliminate hallucinations.
- **pgvector Semantic Search:** High-dimensional vector indexing using cosine similarity functions with metadata filtering.
- **Role-Based Helpdesk Workflow:** Tiered access control for **Students**, **Faculty Coordinators**, and **Administrators** featuring ticket creation, priority escalation, assignment, internal notes, and status lifecycle tracking.
- **Administrative Intelligence & Gap Detection:** Analytics identifying frequently asked and unanswered student questions to enable proactive institutional policy updates.

---

## 2. Five-Member Engineering Team Role Division

To fulfill university final-year capstone project requirements, the responsibilities are structured across five distinct engineering specializations:

| Member | Primary Role | Core Modules & Deliverables |
|---|---|---|
| **Member 1 (Team Lead)** | **System Architect & Full-Stack Lead** | Overall system architecture, React layout, authentication context, unified API client, and end-to-end integration. |
| **Member 2** | **Backend & API Engineer** | FastAPI core framework, RESTful endpoints (`/tickets`, `/departments`, `/notices`, `/faqs`), CORS security, and file streaming. |
| **Member 3** | **Database & Cloud Architect** | Supabase PostgreSQL schema, `pgvector` indexing, RPC semantic matching functions, Row Level Security (RLS) policies, and migrations. |
| **Member 4** | **AI & RAG Pipeline Engineer** | Document parser (PDF/DOCX/TXT), recursive text chunking with sliding window, vector embeddings generation, and prompt synthesizer with strict citations. |
| **Member 5** | **Frontend UI/UX & Analytics Specialist** | Tailwind CSS enterprise UI design, interactive dashboards, Recharts analytics, citation inspector drawer, and system test suite. |

---

## 3. System Architecture & High-Level Design

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 18 + Vite + Tailwind CSS + Lucide React + Recharts                          |
|  - Student Dashboard   - RAG Chatbot with Citations Drawer   - Support Helpdesk   |
|  - Knowledge Base      - Department Directory                - Analytics Portal   |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST
+------------------------------------------v----------------------------------------+
|                               BACKEND API TIER                                    |
|  Python 3 + FastAPI + Uvicorn + Pydantic v2                                       |
|  - Auth & RBAC Middleware          - Ticket Lifecycle Controller                  |
|  - Department & Notice Services    - Analytics & Query Logging Engine             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             RAG PIPELINE                                    |  |
|  |  [File Upload: PDF/DOCX] -> [Text Extractor] -> [Recursive Chunker (350w)] |  |
|  |  -> [768-dim Embeddings] -> [Vector Cosine Similarity & BM25 Overlap]       |  |
|  |  -> [Grounding Prompt Synthesizer] -> [Answer + Source Citations]           |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Supabase SDK / asyncpg
+------------------------------------------v----------------------------------------+
|                          DATABASE & STORAGE TIER                                  |
|  Supabase PostgreSQL + pgvector Extension                                         |
|  - Tables: profiles, departments, documents, document_chunks, tickets,           |
|            ticket_comments, notices, faqs, query_logs                             |
|  - pgvector HNSW/IVFFlat Indexing for cosine distance operations                  |
|  - match_documents() Stored Procedure (RPC)                                      |
|  - Row Level Security (RLS) Policies                                              |
+-----------------------------------------------------------------------------------+
```

---

## 4. Database Schema & Entity Relationships

The relational schema comprises 8 core entities:

1. **`departments`**: Code, name, HOD details, email, contact phone, and campus location.
2. **`profiles`**: Linked to authentication, storing full name, role (`student`, `faculty`, `admin`), roll/employee ID, and department foreign key.
3. **`documents`**: Metadata for uploaded regulatory handbooks, file type, file size, storage location, and chunk count.
4. **`document_chunks`**: Individual semantic blocks with page number, text content, and `vector(768)` embedding.
5. **`tickets`**: Auto-generated ticket number (`TICK-1001`), title, category, priority, status lifecycle (`open`, `in_progress`, `resolved`, `closed`), assigned staff, and resolution notes.
6. **`ticket_comments`**: Audit trail of updates and discussion with support for internal staff notes (`is_internal = true`).
7. **`notices`**: Pinned announcements and departmental circulars.
8. **`query_logs`**: Audit logs for AI interactions, confidence scores, sources utilized, and student feedback (`helpful`/`unhelpful`).

---

## 5. RAG Pipeline Implementation Details

### Step 1: Text Extraction & Normalization
Documents in PDF (via `pypdf`), DOCX (via `python-docx`), and plain text are ingested. Pages are cataloged with strict page indexing to ensure verified audit trails.

### Step 2: Recursive Sliding Window Chunking
Texts are broken down using a sliding window algorithm (target 350 words, 60 words overlap). This ensures semantic continuity across paragraph boundaries.

### Step 3: Vector Embeddings
Chunks are mapped into 768-dimensional vector space using Google Gemini `text-embedding-004` (or deterministic semantic hash vectors for offline mode).

### Step 4: Hybrid Similarity Retrieval
Queries are embedded and matched against stored vectors using cosine similarity combined with keyword frequency boosting:
$$\text{Similarity}(q, d) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}$$

### Step 5: Strict Grounding & Source Citation
The top-$k$ chunks are formatted into system instructions directing the LLM:
- *"Answer strictly using the provided context."*
- *"Explicitly cite document name and page number."*
- *"If context does not contain enough information, mark as unanswered and prompt the student to raise a ticket."*

---

## 6. Comprehensive Test Results

The backend test suite (`test_api_endpoints.py`) validates the entire pipeline:

```
--- Running AI College Helpdesk Backend API Tests ---
 test_health passed!
 test_departments passed! (6 departments retrieved)
 test_auth_demo_switch passed!
 test_chat_rag passed! RAG generated answer with sources:
   Answer snippet: Based on official college records:
   ACADEMIC REGULATIONS - SECTION 4: ATTENDANCE REQUIREMENTS
   Every candidate must secure a minimum of 75% overall attendance ...
   Citations count: 2 (Academic Regulations 2026, Page 1)
 test_tickets listing passed! (2 tickets)
 test_ticket creation passed! (Ticket Number: TICK-1004)
 test_analytics passed! Satisfaction: 66.7%

 ALL BACKEND TESTS PASSED CLEANLY!
```

---

## 7. Viva Voce & Technical Defense Q&A

**Q1: How does your system prevent LLM hallucinations?**  
*Answer:* By implementing a strict RAG grounding architecture with threshold verification. If the cosine similarity score of the top chunk falls below 0.15, or if the documents lack the answer, the engine flags the query as `unanswered` and directs the student to create a Helpdesk ticket instead of guessing.

**Q2: Why use `pgvector` inside PostgreSQL instead of a standalone vector database like Pinecone?**  
*Answer:* `pgvector` allows transactional consistency (ACID), unified backups, relational joins between document chunks and user/department tables, and avoids the latency and expense of syncing data across two separate database vendors.

**Q3: How do you handle sensitive faculty notes on tickets?**  
*Answer:* Using Row Level Security (RLS) and API authorization. In `ticket_comments`, rows with `is_internal = true` are filtered out whenever the requesting user has the role `student`.
