-- ==============================================================================
-- AI-BASED COLLEGE HELPDESK AND STUDENT ASSISTANCE SYSTEM
-- ALL-IN-ONE SUPABASE DATABASE INITIALIZATION SCRIPT
-- Run this single file in your Supabase SQL Editor to initialize tables,
-- pgvector indexes, semantic search function, RLS policies, and seed data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. TABLES
DROP TABLE IF EXISTS query_logs CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    hod_name VARCHAR(128),
    email VARCHAR(128),
    phone VARCHAR(32),
    location VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    roll_no VARCHAR(64),
    phone VARCHAR(32),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(32) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'processing' CHECK (status IN ('uploaded', 'processing', 'indexed', 'failed')),
    chunk_count INT DEFAULT 0,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    page_number INT DEFAULT 1,
    content TEXT NOT NULL,
    token_count INT DEFAULT 0,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON document_chunks(document_id);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'General',
    priority VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_student ON tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(64) DEFAULT 'General',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    target_audience VARCHAR(32) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'faculty')),
    attachment_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(64) DEFAULT 'General',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    view_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    sources_used JSONB DEFAULT '[]'::jsonb,
    confidence_score FLOAT DEFAULT 0.0,
    is_answered BOOLEAN DEFAULT TRUE,
    unanswered_reason VARCHAR(64),
    feedback VARCHAR(16) CHECK (feedback IN ('helpful', 'unhelpful')),
    feedback_comment TEXT,
    response_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_logs_created ON query_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_query_logs_answered ON query_logs(is_answered);

-- 3. SEMANTIC VECTOR MATCH FUNCTION
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 5,
  filter_department_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  chunk_index int,
  page_number int,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    d.title AS document_title,
    dc.chunk_index,
    dc.page_number,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE (filter_department_id IS NULL OR d.department_id = filter_department_id)
    AND d.status = 'indexed'
    AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 4. ROW LEVEL SECURITY POLICIES
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Departments are readable by all authenticated users"
  ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify departments"
  ON departments FOR ALL TO authenticated USING (get_current_user_role() = 'admin');

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL TO authenticated USING (get_current_user_role() = 'admin');

CREATE POLICY "Documents viewable by all authenticated users"
  ON documents FOR SELECT TO authenticated USING (status = 'indexed' OR uploaded_by = auth.uid());
CREATE POLICY "Faculty and Admins can upload and manage documents"
  ON documents FOR ALL TO authenticated USING (get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "Document chunks viewable by all authenticated users"
  ON document_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty and Admins can manage document chunks"
  ON document_chunks FOR ALL TO authenticated USING (get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "Students can view their own tickets"
  ON tickets FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() 
    OR get_current_user_role() = 'admin' 
    OR (get_current_user_role() = 'faculty' AND (assigned_to = auth.uid() OR department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())))
  );
CREATE POLICY "Students can create tickets"
  ON tickets FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own tickets"
  ON tickets FOR UPDATE TO authenticated USING (student_id = auth.uid() OR get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "Ticket participants can view comments"
  ON ticket_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = ticket_comments.ticket_id 
      AND (t.student_id = auth.uid() OR t.assigned_to = auth.uid() OR get_current_user_role() IN ('faculty', 'admin'))
    )
    AND (is_internal = false OR get_current_user_role() IN ('faculty', 'admin'))
  );
CREATE POLICY "Authenticated users can add comments to their tickets"
  ON ticket_comments FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = ticket_comments.ticket_id 
      AND (t.student_id = auth.uid() OR t.assigned_to = auth.uid() OR get_current_user_role() IN ('faculty', 'admin'))
    )
  );

CREATE POLICY "Notices are readable by all authenticated users"
  ON notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty and Admins can create and edit notices"
  ON notices FOR ALL TO authenticated USING (get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "FAQs readable by everyone"
  ON faqs FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL TO authenticated USING (get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "Users can view their own query logs"
  ON query_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR get_current_user_role() = 'admin');
CREATE POLICY "Authenticated users can log queries"
  ON query_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can update feedback on their queries"
  ON query_logs FOR UPDATE TO authenticated USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

-- 5. SEED DATA
INSERT INTO departments (id, code, name, description, hod_name, email, phone, location)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'CSE', 'Computer Science & Engineering', 'Undergraduate and postgraduate degrees in computing, AI, and cybersecurity.', 'Dr. S. K. Narayanan', 'hod.cse@college.edu', '+91 9876543210', 'Block A, 3rd Floor'),
  ('22222222-2222-2222-2222-222222222222', 'ECE', 'Electronics & Communication', 'VLSI, Embedded Systems, IoT, and Signal Processing research and labs.', 'Dr. Sunita Rao', 'hod.ece@college.edu', '+91 9876543211', 'Block B, 2nd Floor'),
  ('33333333-3333-3333-3333-333333333333', 'MECH', 'Mechanical Engineering', 'Thermodynamics, Robotics, CAD/CAM, and Automobile engineering.', 'Dr. Rajesh Gupta', 'hod.mech@college.edu', '+91 9876543212', 'Block C, Ground Floor'),
  ('44444444-4444-4444-4444-444444444444', 'ADM', 'Admissions & Scholarships', 'Central admissions counseling, merit scholarships, and verification.', 'Prof. Anil Deshmukh', 'admissions@college.edu', '+91 9876543213', 'Admin Block, Room 101'),
  ('55555555-5555-5555-5555-555555555555', 'EXAM', 'Examination Cell', 'Semester exams, re-evaluations, grade cards, and degree certificates.', 'Dr. Meenakshi Sundaram', 'examcell@college.edu', '+91 9876543214', 'Admin Block, Room 204'),
  ('66666666-6666-6666-6666-666666666666', 'ACC', 'Accounts & Finance', 'Tuition fees, hostel dues, bus pass payment, and fee clearance.', 'Mr. K. V. Raman', 'accounts@college.edu', '+91 9876543215', 'Admin Block, Ground Floor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role, department_id, roll_no, phone, avatar_url)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@college.edu', 'Dr. Ramesh Sharma (Admin)', 'admin', '11111111-1111-1111-1111-111111111111', 'EMP-ADM-01', '+91 9000000001', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'faculty.verma@college.edu', 'Prof. Priya Verma', 'faculty', '11111111-1111-1111-1111-111111111111', 'EMP-CSE-104', '+91 9000000002', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'faculty.patel@college.edu', 'Prof. Amit Patel', 'faculty', '55555555-5555-5555-5555-555555555555', 'EMP-EXM-042', '+91 9000000003', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aarav.mehta@student.college.edu', 'Aarav Mehta', 'student', '11111111-1111-1111-1111-111111111111', '22CS0104', '+91 9000000004', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sneha.reddy@student.college.edu', 'Sneha Reddy', 'student', '22222222-2222-2222-2222-222222222222', '22EC0088', '+91 9000000005', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'rohan.das@student.college.edu', 'Rohan Das', 'student', '33333333-3333-3333-3333-333333333333', '23ME0052', '+91 9000000006', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
ON CONFLICT (id) DO NOTHING;

INSERT INTO documents (id, title, filename, file_type, file_size, storage_path, department_id, uploaded_by, status, chunk_count, summary)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Academic Regulations & Attendance Policy 2026', 'Academic_Regulations_2026.pdf', 'pdf', 1425000, 'documents/Academic_Regulations_2026.pdf', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'indexed', 4, 'Rules regarding minimum attendance criteria, internal grading breakdown, condonation process, and credit requirements for graduation.'),
  ('d2222222-2222-2222-2222-222222222222', 'Tuition Fee Payment, Scholarship & Refund Rules', 'Fee_Payment_Guidelines.pdf', 'pdf', 845000, 'documents/Fee_Payment_Guidelines.pdf', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'indexed', 3, 'Semester fee deadlines, payment methods (Net Banking/UPI), late fine calculation, installment schemes, and refund percentages upon withdrawal.'),
  ('d3333333-3333-3333-3333-333333333333', 'Campus Hostel Rules, Curfew & Mess Regulations', 'Hostel_Rules_and_Mess_Policy.docx', 'docx', 620000, 'documents/Hostel_Rules_and_Mess_Policy.docx', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'indexed', 3, 'Curfew timings for boys and girls hostels, leave application procedures, mess menu rebate norms, visitors policy, and anti-ragging helpline contacts.'),
  ('d4444444-4444-4444-4444-444444444444', 'Examination Cell Rules, Malpractice and Re-evaluation', 'Exam_Cell_Guidelines.pdf', 'pdf', 910000, 'documents/Exam_Cell_Guidelines.pdf', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'indexed', 3, 'Procedure for end-semester re-evaluation, challenging evaluation, supplementary exam registration fees, and code of conduct in examination halls.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO document_chunks (id, document_id, chunk_index, page_number, content, metadata)
VALUES
  ('c1111111-0001-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 1, 1, 
   'ACADEMIC REGULATIONS - SECTION 4: ATTENDANCE REQUIREMENTS
Every candidate must secure a minimum of 75% overall attendance in aggregate across all registered theory and laboratory courses in a semester. Students having attendance between 65% and 74.9% due to medical reasons or officially sanctioned extracurricular participation may be granted condonation of attendance by the Academic Dean upon payment of a prescribed condonation fee of Rs. 1,000 per subject. Students with attendance below 65% will be detained and not permitted to write end-semester examinations.',
   '{"section": "4.1", "source": "Academic_Regulations_2026.pdf", "page": 1}'),
  ('c1111111-0002-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 2, 2, 
   'ACADEMIC REGULATIONS - SECTION 7: GRADING SCHEME & CGPA
The evaluation is based on Continuous Internal Assessment (CIA: 40 marks) and End Semester Examination (ESE: 60 marks). Grades: O (10, 90-100), A+ (9, 80-89), A (8, 70-79), B+ (7, 60-69), B (6, 50-59), C (5, 45-49), F (0, <45). Minimum CGPA required to obtain B.Tech degree is 5.0 with zero active backlogs.',
   '{"section": "7.2", "source": "Academic_Regulations_2026.pdf", "page": 2}'),
  ('c2222222-0001-0000-0000-000000000001', 'd2222222-2222-2222-2222-222222222222', 1, 1, 
   'FEES & SCHOLARSHIP GUIDELINES - SECTION 2: TUITION FEE PAYMENT
Semester tuition fees must be cleared on or before the 15th of the starting semester month. A grace period of 7 days is permitted with a late fine of Rs. 100 per day. Payments must strictly be processed through the official ERP student portal via Net Banking, Debit/Credit Card, or UPI. Cash payments are not accepted at the counter.',
   '{"section": "2.1", "source": "Fee_Payment_Guidelines.pdf", "page": 1}'),
  ('c3333333-0001-0000-0000-000000000001', 'd3333333-3333-3333-3333-333333333333', 1, 1, 
   'HOSTEL REGULATIONS - SECTION 3: ENTRY & CURFEW TIMINGS
Hostel gates will close promptly at 9:30 PM for all residents on weekdays (Monday to Saturday) and 10:00 PM on Sundays. Late entry requires prior written approval from the Chief Warden. Any student arriving after curfew without written permission will incur a fine of Rs. 500 on the first offense.',
   '{"section": "3.1", "source": "Hostel_Rules_and_Mess_Policy.docx", "page": 1}'),
  ('c4444444-0001-0000-0000-000000000001', 'd4444444-4444-4444-4444-444444444444', 1, 1, 
   'EXAMINATION CELL - RE-EVALUATION AND SCRUTINY PROCEDURES
Students unsatisfied with their end-semester evaluation may apply for script photocopy or re-evaluation within 10 days of result declaration. Fees: Photocopy of answer booklet: Rs. 400 per course; Re-evaluation fee: Rs. 1,000 per course. If re-evaluation results in an increase of 15% or more marks, 50% of the re-evaluation fee is refunded.',
   '{"section": "5.3", "source": "Exam_Cell_Guidelines.pdf", "page": 1}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO faqs (question, answer, category, department_id, view_count, is_published)
VALUES
  ('What is the minimum attendance required to appear for semester exams?', 'A minimum of 75% overall attendance is mandatory. Condonation up to 65% is permissible on medical grounds or university representation upon paying Rs. 1,000 condonation fee with Dean approval.', 'Academics', '11111111-1111-1111-1111-111111111111', 142, TRUE),
  ('How do I apply for re-evaluation of my exam papers?', 'Apply through the student ERP portal within 10 days of result announcement. The fee is Rs. 1,000 per subject. You can also request a photocopy of your evaluated answer script for Rs. 400.', 'Examinations', '55555555-5555-5555-5555-555555555555', 98, TRUE),
  ('What is the hostel gate curfew timing for students?', 'Hostel entry closes at 9:30 PM on weekdays and 10:00 PM on Sundays. Night-outs require an approved portal request 24 hours in advance.', 'Hostel', '44444444-4444-4444-4444-444444444444', 184, TRUE),
  ('Where can I get a bonafide certificate for an educational bank loan?', 'Bonafide letters and fee estimation certificates can be requested from the Admissions/Academic Section (Admin Block Room 102) or requested via the Helpdesk ticket system under Category: Documents.', 'Accounts', '66666666-6666-6666-6666-666666666666', 75, TRUE);

INSERT INTO notices (title, content, category, department_id, is_pinned, target_audience, created_by)
VALUES
  ('Notice: End Semester Examination Timetable - Nov/Dec 2026', 'The detailed date sheet for B.Tech regular and backlog end-semester examinations has been published on the notice board and portal. Hall tickets can be downloaded starting next Monday.', 'Examinations', '55555555-5555-5555-5555-555555555555', TRUE, 'students', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('Annual Inter-College Hackathon "CodeStorm 2026" Registrations Open', 'CSE department is hosting the 36-hour National Hackathon with prizes worth Rs. 2,00,000. Form teams of 3 to 4 members. Registration deadline: Nov 28, 2026.', 'Events', '11111111-1111-1111-1111-111111111111', TRUE, 'all', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

INSERT INTO tickets (id, ticket_number, title, description, category, priority, status, student_id, assigned_to, department_id, created_at)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'TICK-1001', 'Attendance discrepancy in Machine Learning Lab', 'My attendance for the 3rd week ML lab shows absent despite having submitted the lab manual and signature on sheet.', 'Academics', 'medium', 'in_progress', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days'),
  ('t2222222-2222-2222-2222-222222222222', 'TICK-1002', 'Duplicate fee deduction during UPI transaction', 'Amount of Rs. 45,000 was deducted twice from my SBI account while paying the 5th semester hostel fee.', 'Fees', 'high', 'open', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 day'),
  ('t3333333-3333-3333-3333-333333333333', 'TICK-1003', 'Request for Bonafide certificate for Passport renewal', 'I need a stamped bonafide letter addressed to the Regional Passport Office before this Friday.', 'Certificates', 'low', 'resolved', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ticket_comments (ticket_id, user_id, message, is_internal, created_at)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hello ma''am, I checked with the lab assistant and he confirmed my attendance register entry is present.', FALSE, NOW() - INTERVAL '1 day 18 hours'),
  ('t1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Checked the physical register. The assistant missed entering it into the portal. Rectifying it by today evening.', FALSE, NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

INSERT INTO query_logs (user_id, query_text, response_text, confidence_score, is_answered, feedback, response_time_ms, created_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'What is the minimum attendance requirement?', 'According to the Academic Regulations 2026 (Section 4.1), you need a minimum of 75% overall attendance. Condonation up to 65% is possible on medical grounds with Dean approval.', 0.94, TRUE, 'helpful', 410, NOW() - INTERVAL '3 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'When is the last date to pay the semester fee?', 'As per the Fee Guidelines (Section 2.1), semester tuition fees must be cleared by the 15th of the starting semester month. A 7-day grace period is allowed with Rs. 100/day fine.', 0.91, TRUE, 'helpful', 380, NOW() - INTERVAL '5 hours'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'What are the swimming pool timings on weekend?', 'The provided college documents do not contain information about swimming pool operating hours. Please contact the Sports Complex or submit a Helpdesk ticket.', 0.32, FALSE, 'unhelpful', 320, NOW() - INTERVAL '8 hours')
ON CONFLICT DO NOTHING;
