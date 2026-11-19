import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  TicketCheck, 
  FileText, 
  Bell, 
  ArrowRight, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Bot, 
  PlusCircle, 
  Pin, 
  Calendar, 
  GraduationCap, 
  AlertCircle, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  HelpCircle,
  TrendingUp,
  Activity,
  Award,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import TicketModal from '../components/TicketModal';
import NoticeEditModal from '../components/NoticeEditModal';
import FaqModal from '../components/FaqModal';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [quickQuery, setQuickQuery] = useState('');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ticketsData, noticesData, deptsData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getTickets(),
          api.getNotices(),
          api.getDepartments()
        ]);
        setAnalytics(statsData);
        setTickets(ticketsData);
        setNotices(noticesData.slice(0, 5));
        setDepartments(deptsData.slice(0, 6));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate('/chat', { state: { initialQuery: quickQuery } });
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'urgent': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'high': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'medium': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'open': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // ----------------------------------------------------
  // 1. STUDENT VIEW
  // ----------------------------------------------------
  if (role === 'student') {
    const studentTickets = tickets.filter(t => t.created_by === user?.id || t.student_email === user?.email);
    const activeTickets = studentTickets.filter(t => t.status !== 'closed');

    return (
      <div className="space-y-6">
        {/* Student Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white p-7 md:p-8 shadow-lg border border-blue-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-700 text-blue-200 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Final Year B.Tech CSE (Semester 7) • Academic Year 2024–25
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome, {user?.full_name} 🎓
              </h2>
              <p className="text-xs text-blue-100 max-w-xl">
                Roll No: <span className="font-mono font-bold text-amber-300">{user?.roll_no || '21CS0104'}</span> • Final Year (Semester 7 - B.Tech CSE) • Academic Year 2024–25 • Advisor: <span className="font-semibold text-white">Prof. Priya Verma</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Raise Grievance</span>
              </button>
            </div>
          </div>

          {/* Quick AI Search Bar */}
          <form onSubmit={handleQuickAsk} className="relative z-10 mt-6 flex items-center gap-2.5 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask e.g. What is the attendance condonation criteria for semester exams?"
                className="w-full px-4 py-3 rounded-2xl bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all flex-shrink-0 border border-blue-600"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>

        {/* Academic Vitals Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" /> Overall Attendance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">84.5%</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Eligible (&gt;75%)
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Final-sem hall ticket unlocked</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" /> Cumulative CGPA
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">8.72</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                First Class Dist.
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Credits Earned: 132 / 160</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Current Semester
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">Sem 7</span>
              <span className="text-xs text-slate-500 font-medium">18 Credits</span>
            </div>
            <p className="text-[10px] text-slate-500">Capstone Project-I + Electives</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Final Year Fee
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-emerald-700">Paid & Cleared</span>
            </div>
            <p className="text-[10px] text-slate-500">Receipt: DYPCET-2024-8890</p>
          </div>
        </div>

        {/* Student Content Grid: My Tickets & Circulars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Tickets */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TicketCheck className="w-4 h-4 text-blue-700" />
                  My Grievance & Service Requests
                </h3>
                <p className="text-xs text-slate-500">Track resolution progress on your submitted queries</p>
              </div>
              <button
                onClick={() => navigate('/tickets')}
                className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View all ({studentTickets.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
              {studentTickets.length > 0 ? (
                studentTickets.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                          {ticket.ticket_number}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{ticket.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">{ticket.department_name}</span>
                        <span>•</span>
                        <span>Category: {ticket.category}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <p>You have no active grievance requests.</p>
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="text-xs text-blue-900 font-bold hover:underline"
                  >
                    + Click here to submit an academic or hostel issue
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student Notices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Student Circulars
              </h3>
              <button
                onClick={() => navigate('/notices')}
                className="text-xs text-blue-900 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
              {notices.map((n) => (
                <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 truncate pr-2">{n.title}</span>
                    {n.pinned && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.body}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span className="font-medium text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                      {n.department_code || 'College-wide'}
                    </span>
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} onCreated={() => api.getTickets().then(setTickets)} />
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. FACULTY VIEW
  // ----------------------------------------------------
  if (role === 'faculty') {
    const assignedToMe = tickets.filter(t => t.assigned_to === user?.id || t.assigned_to_name?.includes('Priya'));
    const deptTickets = tickets.filter(t => t.department_name?.includes('Computer') || t.department_id === user?.department_id);

    return (
      <div className="space-y-6">
        {/* Faculty Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-7 md:p-8 shadow-lg border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-700 text-blue-200 text-xs font-semibold">
                <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                Department Faculty Workspace • Computer Science & Engineering
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome, {user?.full_name} 👩‍🏫
              </h2>
              <p className="text-xs text-blue-100 max-w-xl">
                Staff ID: <span className="font-mono font-bold text-amber-300">FAC-CSE-012</span> • Office: Tech Block Room 304 • Department Helpdesk Coordinator
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold border border-blue-600 transition-all flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>+ Department Notice</span>
              </button>
              <button
                onClick={() => setIsFaqModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>+ Add FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Faculty Workload KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned to Me"
            value={assignedToMe.length}
            subtitle="Grievances awaiting your action"
            icon={ClipboardList}
            color="amber"
            trend={{ label: 'Urgent Action', value: 'Needs Review', positive: false }}
          />
          <StatCard
            title="CSE Department Tickets"
            value={deptTickets.length}
            subtitle="Total student requests in dept"
            icon={Building2}
            color="blue"
            trend={{ label: 'Scope', value: 'CSE Department', positive: true }}
          />
          <StatCard
            title="Course Syllabi / Docs"
            value={analytics ? analytics.total_documents : '--'}
            subtitle="Indexed in AI pgvector base"
            icon={FileText}
            color="emerald"
            trend={{ label: 'Status', value: 'Ready for RAG', positive: true }}
          />
          <StatCard
            title="Class Circulars Active"
            value={notices.length}
            subtitle="Department announcements"
            icon={Bell}
            color="violet"
            trend={{ label: 'Audience', value: 'Students & Faculty', positive: true }}
          />
        </div>

        {/* Action Required: Assigned Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TicketCheck className="w-4 h-4 text-amber-600" />
                Grievance Queue: Assigned Directly to You ({assignedToMe.length})
              </h3>
              <p className="text-xs text-slate-500">Students awaiting your evaluation, response, or resolution</p>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Go to Full Ticket Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
            {assignedToMe.length > 0 ? (
              assignedToMe.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                        {ticket.ticket_number}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{ticket.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        by {ticket.student_name} ({ticket.student_roll || ticket.student_email})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{ticket.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                      Resolve →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tickets currently assigned to you. All clear!
              </div>
            )}
          </div>
        </div>

        {/* Department Circulars & Quick RAG Test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-700" /> Test AI Knowledge on CSE Regulations
            </h4>
            <p className="text-xs text-slate-600">
              Verify how the student AI bot answers queries using departmental handbooks and syllabus files:
            </p>
            <form onSubmit={handleQuickAsk} className="flex items-center gap-2">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="e.g. What is the minimum passing grade for Data Structures?"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-all"
              >
                Test Query
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" /> Recent Department Circulars
              </h4>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                + New
              </button>
            </div>
            <div className="space-y-2">
              {notices.slice(0, 3).map(n => (
                <div key={n.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 truncate pr-2">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <NoticeEditModal isOpen={isNoticeModalOpen} onClose={() => setIsNoticeModalOpen(false)} onSaved={() => api.getNotices().then(setNotices)} />
        <FaqModal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} onSaved={() => {}} />
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. ADMIN VIEW (Executive Command Center)
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-7 md:p-8 shadow-lg border border-blue-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-700 text-blue-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Central Registrar & Director Executive Console
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Executive Command Center 🏛️
            </h2>
            <p className="text-xs text-blue-100 max-w-xl">
              Administrator: <span className="font-semibold text-white">Dr. Ramesh Sharma</span> • Overseeing 6 Academic Departments, AI RAG vector store, and student grievance resolution SLAs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold border border-blue-600 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Campus Circular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Campus Support Tickets"
          value={analytics ? analytics.open_tickets : '--'}
          subtitle={`Across ${analytics?.total_tickets || 0} total grievances`}
          icon={TicketCheck}
          color="amber"
          trend={{ label: 'Pending', value: `${analytics?.open_tickets || 0} Open`, positive: false }}
        />
        <StatCard
          title="pgvector Knowledge Base"
          value={analytics ? analytics.total_documents : '--'}
          subtitle={`${analytics?.total_chunks || 0} vectorized chunks (768-dim)`}
          icon={FileText}
          color="blue"
          trend={{ label: 'Status', value: '100% Vectorized', positive: true }}
        />
        <StatCard
          title="AI Resolution Accuracy"
          value={`${analytics?.satisfaction_rate || 95}%`}
          subtitle={`${analytics?.total_queries || 0} queries handled`}
          icon={Sparkles}
          color="emerald"
          trend={{ label: 'Satisfaction', value: 'High', positive: true }}
        />
        <StatCard
          title="Unanswered AI Gaps"
          value={analytics ? analytics.unanswered_queries : 0}
          subtitle="Flagged questions needing FAQs"
          icon={AlertCircle}
          color="rose"
          trend={{ label: 'Action', value: 'Convert to FAQ', positive: false }}
        />
      </div>

      {/* Admin Central Grid: All Tickets & AI Knowledge Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Operations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TicketCheck className="w-4 h-4 text-blue-700" />
                Central Campus Ticket Operations
              </h3>
              <p className="text-xs text-slate-500">Real-time status across all college departments</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm"
              >
                + Create Ticket
              </button>
              <button
                onClick={() => navigate('/tickets')}
                className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
            {tickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                      {ticket.ticket_number}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 truncate">{ticket.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({ticket.student_name})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{ticket.department_name}</span>
                    <span>•</span>
                    <span>Assigned: <strong className="text-slate-700">{ticket.assigned_to_name || 'Unassigned'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Gap & AI Loop Closing Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              AI Knowledge Gaps
            </h3>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-blue-900 font-semibold hover:underline"
            >
              Analytics
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs text-slate-600">
              Questions asked by students where similarity fell below threshold. Convert them into FAQs to close the loop:
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                <p className="text-xs font-bold text-rose-950">"Can I get a duplicate hall ticket on exam day?"</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-rose-700 font-medium">Asked 4 times</span>
                  <button
                    onClick={() => setIsFaqModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px]"
                  >
                    + Convert to FAQ
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-xs font-bold text-slate-800">"What are the hostel late entry fines for girls?"</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Asked 3 times</span>
                  <button
                    onClick={() => setIsFaqModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px]"
                  >
                    + Convert to FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} onCreated={() => api.getTickets().then(setTickets)} />
      <NoticeEditModal isOpen={isNoticeModalOpen} onClose={() => setIsNoticeModalOpen(false)} onSaved={() => api.getNotices().then(setNotices)} />
      <FaqModal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} onSaved={() => {}} />
    </div>
  );
}
