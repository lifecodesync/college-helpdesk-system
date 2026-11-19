# AI-Based College Helpdesk and Student Assistance System

[![Tech Stack](https://img.shields.io/badge/Stack-React_|_FastAPI_|_Supabase_|_pgvector-6366f1.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Academic](https://img.shields.io/badge/CSE_Capstone-2026--2027-blue.svg)](docs/PROJECT_REPORT.md)

A complete, production-grade web application delivering intelligent student support through **Retrieval-Augmented Generation (RAG)**, **pgvector semantic search**, **support ticket lifecycle tracking**, and **role-based portals for Students, Faculty, and Administrators**.

---

##  System Highlights

- **Professional University Portal Theme (White & Collegiate Navy):** Designed specifically following institutional SaaS standards with a modern white canvas, university crest branding, official circular notices, and clear typography.
- **Interactive Supabase Cloud Integration:** Live status indicator in the navbar (`🟢 Supabase Connected` / `🟡 Local Mode`) with an in-app configuration modal to connect, test, and sync your Supabase PostgreSQL database in real-time.
- **Admin Notice & Circular Management:** Administrators and Faculty can publish official campus circulars, pin important notices to the top, edit existing announcements, and delete outdated entries.
- **Curated FAQ Management:** Admins can add, edit, and delete department FAQs to resolve student knowledge gaps identified in analytics.
- **AI Student Chatbot with Grounded RAG:** Answers questions regarding attendance rules, fees, hostel regulations, and exams strictly from official PDF/DOCX handbooks with **source citations (document name, page number, and similarity %)**.
- **pgvector Semantic Search:** High-performance vector embeddings stored and matched in PostgreSQL using cosine distance.
- **Full Support Ticket Workflow:** Create tickets with category and priority, assign to faculty/admin, status updates (Open → In Progress → Resolved → Closed), and threaded conversations with **internal staff notes**.
- **Admin & Analytics Portal:** Real-time dashboards with Recharts for ticket resolution rates, department workloads, and **Unanswered Student Queries** to detect institutional documentation gaps.
- **Department Hub & Notices:** Directory of academic departments (CSE, ECE, Mech, Admissions, Exam Cell, Accounts) and campus notice board with pinned announcements.
- **1-Click Demo Evaluation Switcher:** Instant role switching between **Student**, **Faculty**, and **Admin** modes in the top navbar—ideal for evaluators, presentations, and viva voce.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6 |
| **Backend** | Python 3, FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Passlib |
| **Database** | Supabase PostgreSQL + `pgvector` extension (with Row Level Security) |
| **Document Processing** | `pypdf` (PDF text extraction), `python-docx` (DOCX parsing) |
| **AI / RAG** | Google Gemini `text-embedding-004` & `gemini-1.5-flash` (with built-in fallback) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+

### 2. Launch with One Click (Windows)
Double-click `start_all.bat` in the project root:
```cmd
start_all.bat
```
This automatically boots:
- **FastAPI Backend:** [http://localhost:8000](http://localhost:8000) (Interactive Swagger Docs at [http://localhost:8000/docs](http://localhost:8000/docs))
- **React Frontend:** [http://localhost:5173](http://localhost:5173)

---

### 3. Manual Step-by-Step Setup

#### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `database/setup_all.sql` from this repository and run the script.
   - Enables `uuid-ossp` and `vector` extensions.
   - Creates all tables (`profiles`, `departments`, `documents`, `document_chunks`, `tickets`, `ticket_comments`, `notices`, `faqs`, `query_logs`).
   - Configures the `match_documents()` vector cosine search function.
   - Sets up Row Level Security (RLS) policies.
   - Inserts realistic seed data.
4. Copy your project credentials from **Project Settings → API** and paste them into `backend/.env`:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-or-service-key"
GEMINI_API_KEY="your-gemini-api-key"
```
*(Note: The system includes a zero-config local store with pre-indexed data so it works immediately even before connecting Supabase!)*

---

## 👥 Pre-Configured Test Accounts

| Role | Email | Password | Full Name | Access Scope |
|---|---|---|---|---|
| **Student** | `aarav.mehta@student.college.edu` | `password123` | Aarav Mehta | Student Dashboard, AI Chat, Submit Tickets, View Notices |
| **Faculty** | `faculty.verma@college.edu` | `password123` | Prof. Priya Verma | Manage Tickets, Add Internal Notes, Upload Docs, Publish Notices |
| **Admin** | `admin@college.edu` | `password123` | Dr. Ramesh Sharma | Full Access, Analytics, User Management, Document Deletion |

*Use the quick Role Switcher pills in the top navbar to switch between these profiles in 1 click!*

---

## 🧪 Automated Testing

To run the backend integration and RAG verification test suite:
```bash
cd backend
python test_api_endpoints.py
```
This tests:
- Health check
- Department directory
- Authentication demo token generation
- **RAG text retrieval and strict citation generation**
- Ticket creation and listing lifecycle
- Real-time Analytics calculation

---

## 📁 Repository Structure

```
college-helpdesk-system/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, chat, tickets, documents, analytics)
│   │   ├── core/            # Config, security, database layer
│   │   ├── models/          # Pydantic schemas
│   │   ├── rag/             # Document parser, chunker, embeddings, retriever, generator
│   │   └── main.py          # FastAPI application entry point
│   ├── uploads/             # Uploaded PDF and DOCX files
│   ├── requirements.txt     # Python dependencies
│   ├── test_api_endpoints.py# Backend integration test suite
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, StatCard, CitationDrawer, Modals
│   │   ├── context/         # AuthContext with 1-click role switcher
│   │   ├── pages/           # Dashboard, ChatBot, Tickets, Documents, Analytics, etc.
│   │   ├── services/        # Unified API communication client
│   │   ├── App.jsx          # Route management
│   │   └── index.css        # Tailwind styling & dark theme
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── 01_schema.sql        # Database tables & pgvector index
│   ├── 02_functions.sql     # match_documents() RPC function
│   ├── 03_rls_policies.sql  # Row Level Security policies
│   ├── 04_seed_data.sql     # Seed data for CSE capstone demo
│   └── setup_all.sql        # 1-click all-in-one Supabase setup script
├── sample_docs/             # Sample college regulations & fee policies for testing
├── docs/
│   └── PROJECT_REPORT.md    # Complete CSE Final-Year Project Report with Viva Q&A
├── start_all.bat            # Dual-service one-click launcher
├── start_backend.bat        # FastAPI launcher
└── start_frontend.bat       # React Vite launcher
```

---

## 🎓 Academic Contribution (CSE Final Year)

This project has been engineered specifically for a **5-member CSE Capstone Engineering Team**:
1. **Team Lead & Full-Stack Architect** (Architecture, Layout, API Integration)
2. **Backend & API Engineer** (FastAPI, RESTful routes, CORS, token auth)
3. **Database & Cloud Architect** (Supabase schema, `pgvector`, RLS policies)
4. **AI & RAG Pipeline Engineer** (Chunking, vector embeddings, citation generator)
5. **Frontend UI/UX & Analytics Specialist** (Tailwind UI, Recharts, test suite)

Detailed documentation, data flow diagrams, and viva defense questions are available in [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md).
