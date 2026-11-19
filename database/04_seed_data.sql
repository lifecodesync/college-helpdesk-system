-- ==============================================================================
-- AI-Based College Helpdesk and Student Assistance System
-- Comprehensive Seed Data for Testing & Evaluation
-- ==============================================================================

-- 1. Insert Departments
INSERT INTO departments (id, code, name, description, hod_name, email, phone, location)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'CSE', 'Computer Science & Engineering', 'Undergraduate and postgraduate degrees in computing, AI, and cybersecurity.', 'Dr. S. K. Narayanan', 'hod.cse@college.edu', '+91 9876543210', 'Block A, 3rd Floor'),
  ('22222222-2222-2222-2222-222222222222', 'ECE', 'Electronics & Communication', 'VLSI, Embedded Systems, IoT, and Signal Processing research and labs.', 'Dr. Sunita Rao', 'hod.ece@college.edu', '+91 9876543211', 'Block B, 2nd Floor'),
  ('33333333-3333-3333-3333-333333333333', 'MECH', 'Mechanical Engineering', 'Thermodynamics, Robotics, CAD/CAM, and Automobile engineering.', 'Dr. Rajesh Gupta', 'hod.mech@college.edu', '+91 9876543212', 'Block C, Ground Floor'),
  ('44444444-4444-4444-4444-444444444444', 'ADM', 'Admissions & Scholarships', 'Central admissions counseling, merit scholarships, and verification.', 'Prof. Anil Deshmukh', 'admissions@college.edu', '+91 9876543213', 'Admin Block, Room 101'),
  ('55555555-5555-5555-5555-555555555555', 'EXAM', 'Examination Cell', 'Semester exams, re-evaluations, grade cards, and degree certificates.', 'Dr. Meenakshi Sundaram', 'examcell@college.edu', '+91 9876543214', 'Admin Block, Room 204'),
  ('66666666-6666-6666-6666-666666666666', 'ACC', 'Accounts & Finance', 'Tuition fees, hostel dues, bus pass payment, and fee clearance.', 'Mr. K. V. Raman', 'accounts@college.edu', '+91 9876543215', 'Admin Block, Ground Floor')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Profiles (Admin, Faculty, Students)
INSERT INTO profiles (id, email, full_name, role, department_id, roll_no, phone, avatar_url)
VALUES
  -- Admin
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@college.edu', 'Dr. Ramesh Sharma (Admin)', 'admin', '11111111-1111-1111-1111-111111111111', 'EMP-ADM-01', '+91 9000000001', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  -- Faculty
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'faculty.verma@college.edu', 'Prof. Priya Verma', 'faculty', '11111111-1111-1111-1111-111111111111', 'EMP-CSE-104', '+91 9000000002', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'faculty.patel@college.edu', 'Prof. Amit Patel', 'faculty', '55555555-5555-5555-5555-555555555555', 'EMP-EXM-042', '+91 9000000003', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
  -- Students
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aarav.mehta@student.college.edu', 'Aarav Mehta', 'student', '11111111-1111-1111-1111-111111111111', '22CS0104', '+91 9000000004', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sneha.reddy@student.college.edu', 'Sneha Reddy', 'student', '22222222-2222-2222-2222-222222222222', '22EC0088', '+91 9000000005', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'rohan.das@student.college.edu', 'Rohan Das', 'student', '33333333-3333-3333-3333-333333333333', '23ME0052', '+91 9000000006', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Documents
INSERT INTO documents (id, title, filename, file_type, file_size, storage_path, department_id, uploaded_by, status, chunk_count, summary)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Academic Regulations & Attendance Policy 2026', 'Academic_Regulations_2026.pdf', 'pdf', 1425000, 'documents/Academic_Regulations_2026.pdf', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'indexed', 4, 'Rules regarding minimum attendance criteria, internal grading breakdown, condonation process, and credit requirements for graduation.'),
  ('d2222222-2222-2222-2222-222222222222', 'Tuition Fee Payment, Scholarship & Refund Rules', 'Fee_Payment_Guidelines.pdf', 'pdf', 845000, 'documents/Fee_Payment_Guidelines.pdf', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'indexed', 3, 'Semester fee deadlines, payment methods (Net Banking/UPI), late fine calculation, installment schemes, and refund percentages upon withdrawal.'),
  ('d3333333-3333-3333-3333-333333333333', 'Campus Hostel Rules, Curfew & Mess Regulations', 'Hostel_Rules_and_Mess_Policy.docx', 'docx', 620000, 'documents/Hostel_Rules_and_Mess_Policy.docx', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'indexed', 3, 'Curfew timings for boys and girls hostels, leave application procedures, mess menu rebate norms, visitors policy, and anti-ragging helpline contacts.'),
  ('d4444444-4444-4444-4444-444444444444', 'Examination Cell Rules, Malpractice and Re-evaluation', 'Exam_Cell_Guidelines.pdf', 'pdf', 910000, 'documents/Exam_Cell_Guidelines.pdf', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'indexed', 3, 'Procedure for end-semester re-evaluation, challenging evaluation, supplementary exam registration fees, and code of conduct in examination halls.')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Document Chunks (Ready for text matching and vector indexing)
INSERT INTO document_chunks (id, document_id, chunk_index, page_number, content, metadata)
VALUES
  ('c1111111-0001-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 1, 1, 
   'ACADEMIC REGULATIONS - SECTION 4: ATTENDANCE REQUIREMENTS
Every candidate must secure a minimum of 75% overall attendance in aggregate across all registered theory and laboratory courses in a semester. Students having attendance between 65% and 74.9% due to medical reasons or officially sanctioned extracurricular participation may be granted condonation of attendance by the Academic Dean upon payment of a prescribed condonation fee of Rs. 1,000 per subject. Students with attendance below 65% will be detained and not permitted to write end-semester examinations.',
   '{"section": "4.1", "source": "Academic_Regulations_2026.pdf", "page": 1}'),

  ('c1111111-0002-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 2, 2, 
   'ACADEMIC REGULATIONS - SECTION 7: GRADING SCHEME & CGPA
The evaluation is based on Continuous Internal Assessment (CIA: 40 marks) and End Semester Examination (ESE: 60 marks). Grades awarded:
O (Outstanding): 10 grade points (90-100 marks)
A+ (Excellent): 9 grade points (80-89 marks)
A (Very Good): 8 grade points (70-79 marks)
B+ (Good): 7 grade points (60-69 marks)
B (Above Average): 6 grade points (50-59 marks)
C (Average / Pass): 5 grade points (45-49 marks)
F (Fail): 0 grade points (<45 marks).
Minimum CGPA required to obtain B.Tech degree is 5.0 with zero active backlogs.',
   '{"section": "7.2", "source": "Academic_Regulations_2026.pdf", "page": 2}'),

  ('c2222222-0001-0000-0000-000000000001', 'd2222222-2222-2222-2222-222222222222', 1, 1, 
   'FEES & SCHOLARSHIP GUIDELINES - SECTION 2: TUITION FEE PAYMENT
Semester tuition fees must be cleared on or before the 15th of the starting semester month. A grace period of 7 days is permitted with a late fine of Rs. 100 per day. Payments must strictly be processed through the official ERP student portal via Net Banking, Debit/Credit Card, or UPI. Cash payments are not accepted at the counter. For students applying for educational loans, bonafide estimation letters can be collected from Room 102 within 2 business days.',
   '{"section": "2.1", "source": "Fee_Payment_Guidelines.pdf", "page": 1}'),

  ('c3333333-0001-0000-0000-000000000001', 'd3333333-3333-3333-3333-333333333333', 1, 1, 
   'HOSTEL REGULATIONS - SECTION 3: ENTRY & CURFEW TIMINGS
Hostel gates will close promptly at 9:30 PM for all residents on weekdays (Monday to Saturday) and 10:00 PM on Sundays. Late entry requires prior written approval from the Chief Warden. Any student arriving after curfew without written permission will incur a fine of Rs. 500 on the first offense and disciplinary notice to parents on subsequent violations. Night-out passes must be submitted at least 24 hours in advance via the student portal.',
   '{"section": "3.1", "source": "Hostel_Rules_and_Mess_Policy.docx", "page": 1}'),

  ('c4444444-0001-0000-0000-000000000001', 'd4444444-4444-4444-4444-444444444444', 1, 1, 
   'EXAMINATION CELL - RE-EVALUATION AND SCRUTINY PROCEDURES
Students unsatisfied with their end-semester evaluation may apply for script photocopy or re-evaluation within 10 days of result declaration. Fees:
1. Photocopy of answer booklet: Rs. 400 per course.
2. Re-evaluation fee: Rs. 1,000 per course.
If re-evaluation results in an increase of 15% or more marks over the original score, 50% of the re-evaluation fee will be refunded to the student account.',
   '{"section": "5.3", "source": "Exam_Cell_Guidelines.pdf", "page": 1}')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Curated FAQs
INSERT INTO faqs (question, answer, category, department_id, view_count, is_published)
VALUES
  ('What is the minimum attendance required to appear for semester exams?', 'A minimum of 75% overall attendance is mandatory. Condonation up to 65% is permissible on medical grounds or university representation upon paying Rs. 1,000 condonation fee with Dean approval.', 'Academics', '11111111-1111-1111-1111-111111111111', 142, TRUE),
  ('How do I apply for re-evaluation of my exam papers?', 'Apply through the student ERP portal within 10 days of result announcement. The fee is Rs. 1,000 per subject. You can also request a photocopy of your evaluated answer script for Rs. 400.', 'Examinations', '55555555-5555-5555-5555-555555555555', 98, TRUE),
  ('What is the hostel gate curfew timing for students?', 'Hostel entry closes at 9:30 PM on weekdays and 10:00 PM on Sundays. Night-outs require an approved portal request 24 hours in advance.', 'Hostel', '44444444-4444-4444-4444-444444444444', 184, TRUE),
  ('Where can I get a bonafide certificate for an educational bank loan?', 'Bonafide letters and fee estimation certificates can be requested from the Admissions/Academic Section (Admin Block Room 102) or requested via the Helpdesk ticket system under Category: Documents.', 'Accounts', '66666666-6666-6666-6666-666666666666', 75, TRUE),
  ('What is the pass mark criteria in semester exams?', 'Students must secure at least 45% total marks (Continuous Internal Assessment + End Semester Exam combined) to obtain passing grade C.', 'Academics', '11111111-1111-1111-1111-111111111111', 110, TRUE);

-- 6. Insert Campus Notices
INSERT INTO notices (title, content, category, department_id, is_pinned, target_audience, created_by)
VALUES
  ('Notice: End Semester Examination Timetable - Nov/Dec 2026', 'The detailed date sheet for B.Tech regular and backlog end-semester examinations has been published on the notice board and portal. Hall tickets can be downloaded starting next Monday.', 'Examinations', '55555555-5555-5555-5555-555555555555', TRUE, 'students', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('Annual Inter-College Hackathon "CodeStorm 2026" Registrations Open', 'CSE department is hosting the 36-hour National Hackathon with prizes worth Rs. 2,00,000. Form teams of 3 to 4 members. Registration deadline: Nov 28, 2026.', 'Events', '11111111-1111-1111-1111-111111111111', TRUE, 'all', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('Hostel Wi-Fi Maintenance Window Notice', 'Campus IT will carry out high-speed optic fiber backbone maintenance on Saturday from 2:00 AM to 6:00 AM. Internet services in Hostels A, B and C will remain intermittent.', 'Campus Life', '44444444-4444-4444-4444-444444444444', FALSE, 'all', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- 7. Insert Sample Tickets
INSERT INTO tickets (id, ticket_number, title, description, category, priority, status, student_id, assigned_to, department_id, created_at)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'TICK-1001', 'Attendance discrepancy in Machine Learning Lab', 'My attendance for the 3rd week ML lab shows absent despite having submitted the lab manual and signature on sheet.', 'Academics', 'medium', 'in_progress', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days'),
  ('t2222222-2222-2222-2222-222222222222', 'TICK-1002', 'Duplicate fee deduction during UPI transaction', 'Amount of Rs. 45,000 was deducted twice from my SBI account while paying the 5th semester hostel fee.', 'Fees', 'high', 'open', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 day'),
  ('t3333333-3333-3333-3333-333333333333', 'TICK-1003', 'Request for Bonafide certificate for Passport renewal', 'I need a stamped bonafide letter addressed to the Regional Passport Office before this Friday.', 'Certificates', 'low', 'resolved', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Ticket Comments
INSERT INTO ticket_comments (ticket_id, user_id, message, is_internal, created_at)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hello ma''am, I checked with the lab assistant and he confirmed my attendance register entry is present.', FALSE, NOW() - INTERVAL '1 day 18 hours'),
  ('t1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Checked the physical register. The assistant missed entering it into the portal. Rectifying it by today evening.', FALSE, NOW() - INTERVAL '6 hours'),
  ('t3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Your bonafide certificate has been signed and dispatched to the Admin Dispatch counter. Please collect it with ID proof.', FALSE, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 9. Insert Sample Query Logs for Analytics
INSERT INTO query_logs (user_id, query_text, response_text, confidence_score, is_answered, feedback, response_time_ms, created_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'What is the minimum attendance requirement?', 'According to the Academic Regulations 2026 (Section 4.1), you need a minimum of 75% overall attendance. Condonation up to 65% is possible on medical grounds with Dean approval.', 0.94, TRUE, 'helpful', 410, NOW() - INTERVAL '3 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'When is the last date to pay the semester fee?', 'As per the Fee Guidelines (Section 2.1), semester tuition fees must be cleared by the 15th of the starting semester month. A 7-day grace period is allowed with Rs. 100/day fine.', 0.91, TRUE, 'helpful', 380, NOW() - INTERVAL '5 hours'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'What are the swimming pool timings on weekend?', 'The provided college documents do not contain information about swimming pool operating hours. Please contact the Sports Complex or submit a Helpdesk ticket.', 0.32, FALSE, 'unhelpful', 320, NOW() - INTERVAL '8 hours'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'How much is the re-evaluation fee per paper?', 'According to Exam Cell Guidelines (Section 5.3), the re-evaluation fee is Rs. 1,000 per course. You can also request a photocopy for Rs. 400.', 0.96, TRUE, 'helpful', 390, NOW() - INTERVAL '12 hours');
