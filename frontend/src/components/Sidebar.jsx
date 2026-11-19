import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  TicketCheck, 
  FileText, 
  Building2, 
  Bell, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Sparkles, 
  ClipboardList, 
  BookOpen, 
  Briefcase,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-specific navigation items and nomenclature
  const getNavItems = () => {
    if (role === 'student') {
      return [
        { name: 'Student Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Ask AI Assistant', path: '/chat', icon: Bot, highlight: true },
        { name: 'My Grievances', path: '/tickets', icon: TicketCheck },
        { name: 'College Handbooks', path: '/documents', icon: FileText },
        { name: 'Departments & FAQs', path: '/departments', icon: Building2 },
        { name: 'Campus Circulars', path: '/notices', icon: Bell },
      ];
    } else if (role === 'faculty') {
      return [
        { name: 'Faculty Workspace', path: '/', icon: Briefcase },
        { name: 'AI Staff Assistant', path: '/chat', icon: Bot, highlight: true },
        { name: 'Assigned Grievances', path: '/tickets', icon: ClipboardList },
        { name: 'Course Handbooks', path: '/documents', icon: BookOpen },
        { name: 'Department FAQs', path: '/departments', icon: Building2 },
        { name: 'Class Circulars', path: '/notices', icon: Bell },
        { name: 'Department Analytics', path: '/analytics', icon: BarChart3 },
      ];
    } else {
      // Admin
      return [
        { name: 'Executive Command', path: '/', icon: LayoutDashboard },
        { name: 'AI Assistant (RAG)', path: '/chat', icon: Bot, highlight: true },
        { name: 'All Campus Tickets', path: '/tickets', icon: TicketCheck },
        { name: 'Knowledge Repository', path: '/documents', icon: FileText },
        { name: 'Departments & FAQs', path: '/departments', icon: Building2 },
        { name: 'Circulars Manager', path: '/notices', icon: Bell },
        { name: 'University Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'User & Role Directory', path: '/admin/users', icon: Users },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleHeader = () => {
    if (role === 'student') return 'Student Portal';
    if (role === 'faculty') return 'Faculty Desk';
    return 'Admin Console';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        
        {/* College Seal & Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 bg-slate-50/80">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20 font-bold flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 text-sm tracking-tight truncate flex items-center gap-1.5">
              DYPCET EduAssist
            </h1>
            <p className="text-[10px] text-blue-900 font-bold truncate uppercase tracking-wider">
              {getRoleHeader()}
            </p>
          </div>
        </div>

        {/* Institution Info Card */}
        <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-blue-950">Academic Year 2026-27</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="System Active" />
          </div>
          <p className="text-[10px] text-blue-800/80 mt-0.5 truncate">D. Y. Patil College of Eng. & Tech., Kolhapur</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {role === 'student' ? 'Student Services' : role === 'faculty' ? 'Faculty Tools' : 'Administrative Operations'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-900 font-bold border-l-4 border-blue-800 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${item.highlight ? 'text-blue-600 group-hover:scale-110' : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> RAG
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Active Identity Card in Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                alt={user?.full_name} 
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-blue-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'Loading...'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    role === 'admin' ? 'bg-rose-500' : role === 'faculty' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out to Login Screen"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
