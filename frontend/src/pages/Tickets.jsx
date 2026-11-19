import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TicketCheck, 
  Plus, 
  Search, 
  Clock, 
  ChevronRight,
  Filter,
  UserCheck,
  Building2,
  ListFilter,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';

export default function Tickets() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [facultyTab, setFacultyTab] = useState('assigned_to_me'); // 'assigned_to_me', 'my_department', 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const [ticketsData, deptsData] = await Promise.all([
        api.getTickets({
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          department_id: deptFilter || undefined
        }),
        api.getDepartments()
      ]);
      setTickets(ticketsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error("Tickets fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, deptFilter, user]);

  // Apply Role Filtering
  const roleFilteredTickets = tickets.filter(t => {
    if (role === 'student') {
      return t.created_by === user?.id || t.student_email === user?.email;
    }
    if (role === 'faculty') {
      if (facultyTab === 'assigned_to_me') {
        return t.assigned_to === user?.id || t.assigned_to_name?.includes('Priya');
      }
      if (facultyTab === 'my_department') {
        return t.department_name?.includes('Computer') || t.department_id === user?.department_id;
      }
      return true; // all
    }
    return true; // admin sees all
  });

  const finalFilteredTickets = roleFilteredTickets.filter(t => {
    const q = search.toLowerCase();
    return (
      t.ticket_number.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.student_name && t.student_name.toLowerCase().includes(q))
    );
  });

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'high': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'medium': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'open': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TicketCheck className="w-5 h-5 text-blue-700" />
            {role === 'student' 
              ? 'My Grievances & Service Requests'
              : role === 'faculty'
              ? 'Faculty Grievance Resolution Desk'
              : 'Central University Ticket Operations'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'student' 
              ? `Logged in as ${user?.full_name} (Roll: ${user?.roll_no || '21CS0104'}) • Final Year B.Tech CSE`
              : role === 'faculty'
              ? 'Review assigned student grievances, submit official remarks, or escalate to admin'
              : 'University-wide ticketing console with departmental routing and coordinator assignments'}
          </p>
        </div>

        {/* Student or Admin can create tickets */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{role === 'student' ? '+ Raise Grievance' : '+ Create Ticket'}</span>
        </button>
      </div>

      {/* Faculty Work Tabs */}
      {role === 'faculty' && (
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setFacultyTab('assigned_to_me')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              facultyTab === 'assigned_to_me'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assigned to Me ({tickets.filter(t => t.assigned_to === user?.id || t.assigned_to_name?.includes('Priya')).length})
          </button>
          <button
            onClick={() => setFacultyTab('my_department')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              facultyTab === 'my_department'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CSE Department ({tickets.filter(t => t.department_name?.includes('Computer') || t.department_id === user?.department_id).length})
          </button>
          <button
            onClick={() => setFacultyTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              facultyTab === 'all'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All College Tickets ({tickets.length})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID, title, student name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="">All Categories</option>
            <option value="Academics">Academics</option>
            <option value="Examinations">Examinations</option>
            <option value="Fees">Fees & Accounts</option>
            <option value="Hostel">Hostel</option>
            <option value="Certificates">Certificates</option>
          </select>

          {role === 'admin' && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : finalFilteredTickets.length > 0 ? (
          finalFilteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="p-4 md:p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold">
                    {ticket.ticket_number}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 hover:text-blue-900 transition-colors">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-1">
                  <span className="font-semibold text-slate-700">{ticket.department_name}</span>
                  <span>•</span>
                  <span>Category: {ticket.category}</span>
                  <span>•</span>
                  <span>Student: <strong className="text-slate-700">{ticket.student_name}</strong></span>
                  {ticket.assigned_to_name && (
                    <>
                      <span>•</span>
                      <span className="text-blue-800 font-medium">Assigned: {ticket.assigned_to_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-blue-900 flex-shrink-0 self-end md:self-center">
                <span className="text-blue-900 font-bold hidden md:inline">
                  {role === 'student' ? 'View Status →' : 'Resolve Ticket →'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <p>No tickets match the selected criteria.</p>
            {role === 'student' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                + Raise a new ticket
              </button>
            )}
          </div>
        )}
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => fetchTickets()}
      />

    </div>
  );
}
