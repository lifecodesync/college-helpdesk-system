-- ==============================================================================
-- AI-Based College Helpdesk and Student Assistance System
-- Supabase Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions to extract role from auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. DEPARTMENTS POLICIES
-- Everyone can read departments
CREATE POLICY "Departments are readable by all authenticated users"
  ON departments FOR SELECT TO authenticated USING (true);

-- Only admins can insert, update or delete departments
CREATE POLICY "Only admins can modify departments"
  ON departments FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

-- 2. PROFILES POLICIES
-- Users can view their own profile or faculty/admin directory
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL TO authenticated
  USING (get_current_user_role() = 'admin');

-- 3. DOCUMENTS & CHUNKS POLICIES
-- All authenticated users can view published documents and chunks
CREATE POLICY "Documents viewable by all authenticated users"
  ON documents FOR SELECT TO authenticated USING (status = 'indexed' OR uploaded_by = auth.uid());

CREATE POLICY "Faculty and Admins can upload and manage documents"
  ON documents FOR ALL TO authenticated
  USING (get_current_user_role() IN ('faculty', 'admin'));

CREATE POLICY "Document chunks viewable by all authenticated users"
  ON document_chunks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Faculty and Admins can manage document chunks"
  ON document_chunks FOR ALL TO authenticated
  USING (get_current_user_role() IN ('faculty', 'admin'));

-- 4. TICKETS POLICIES
-- Students see their own tickets; Faculty see department/assigned tickets; Admins see all
CREATE POLICY "Students can view their own tickets"
  ON tickets FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() 
    OR get_current_user_role() = 'admin' 
    OR (get_current_user_role() = 'faculty' AND (assigned_to = auth.uid() OR department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())))
  );

CREATE POLICY "Students can create tickets"
  ON tickets FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own tickets (e.g. close)"
  ON tickets FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR get_current_user_role() IN ('faculty', 'admin'));

-- 5. TICKET COMMENTS POLICIES
CREATE POLICY "Ticket participants can view comments"
  ON ticket_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = ticket_comments.ticket_id 
      AND (
        t.student_id = auth.uid() 
        OR t.assigned_to = auth.uid() 
        OR get_current_user_role() IN ('faculty', 'admin')
      )
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

-- 6. NOTICES POLICIES
CREATE POLICY "Notices are readable by all authenticated users"
  ON notices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Faculty and Admins can create and edit notices"
  ON notices FOR ALL TO authenticated
  USING (get_current_user_role() IN ('faculty', 'admin'));

-- 7. FAQS POLICIES
CREATE POLICY "FAQs readable by everyone"
  ON faqs FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL TO authenticated
  USING (get_current_user_role() IN ('faculty', 'admin'));

-- 8. QUERY LOGS POLICIES
CREATE POLICY "Users can view their own query logs"
  ON query_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can log queries"
  ON query_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update feedback on their queries"
  ON query_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR get_current_user_role() = 'admin');
