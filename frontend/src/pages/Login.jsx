import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Building2,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const roleOptions = [
    {
      id: 'student',
      title: 'Student',
      badge: 'Undergraduate Portal',
      icon: GraduationCap,
      desc: 'Attendance (82.5%) & CGPA tracking, Ask College AI, Course handbooks, and Submit grievance tickets.',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      btnColor: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20',
      iconColor: 'text-emerald-700 bg-emerald-100/80',
      ringFocus: 'hover:border-emerald-300 hover:ring-2 hover:ring-emerald-100'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      badge: 'Department Coordinator',
      icon: UserCheck,
      desc: 'Assigned grievance queue, Internal staff notes, Department circulars, and Course syllabus management.',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
      iconColor: 'text-amber-700 bg-amber-100/80',
      ringFocus: 'hover:border-amber-300 hover:ring-2 hover:ring-amber-100'
    },
    {
      id: 'admin',
      title: 'Admin',
      badge: 'Central Administrator',
      icon: ShieldCheck,
      desc: 'Executive command center, All campus tickets, User & role directory, and Supabase cloud settings.',
      badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      btnColor: 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-900/20',
      iconColor: 'text-blue-900 bg-blue-100/80',
      ringFocus: 'hover:border-blue-400 hover:ring-2 hover:ring-blue-100'
    }
  ];

  const handleRoleSignIn = async (roleId) => {
    setError('');
    setSelectedRole(roleId);
    setLoading(true);
    try {
      await switchDemoRole(roleId);
      navigate('/');
    } catch (err) {
      setError("Authentication failed. Please check backend connection.");
    } finally {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. You may select Student, Faculty, or Admin above.');
    } finally {
      setLoading(false);
    }
  };

  const prefillEmail = (pEmail) => {
    setEmail(pEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      
      {/* Background subtle radial blurs */}
      <div className="absolute w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[140px] pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none -bottom-32 -right-32" />

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        
        {/* College Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-900 items-center justify-center text-white shadow-xl shadow-blue-900/20 ring-4 ring-blue-100 mb-1">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              D. Y. Patil College of Engineering & Technology, Kolhapur
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-900 mt-1">
              DYPCET AI-Powered Student Helpdesk & Academic Assistance System
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose your role below to sign in. Once signed in, your role is locked until you sign out.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* 1. CHOOSE ROLE TO SIGN IN: Student, Faculty, Admin */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              Select Your Role to Sign In
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isBusy = loading && selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 ${role.ringFocus}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${role.iconColor} shadow-inner`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${role.badgeColor}`}>
                        {role.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {role.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRoleSignIn(role.id)}
                    disabled={loading}
                    className={`w-full py-3 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 ${role.btnColor}`}
                  >
                    <span>{isBusy ? 'Signing In...' : `Sign In as ${role.title}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. STANDARD CREDENTIALS FORM */}
        <div className="max-w-md mx-auto w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="text-center pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Or Sign In with Any Email Address
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Any email can sign in instantly (no pre-registration required)
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.patil@dypcet.edu.in or your.name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Quick fill email:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => prefillEmail('aarav.mehta@student.college.edu')}
                  className="text-blue-900 hover:underline font-bold"
                >
                  Student
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => prefillEmail('faculty.verma@college.edu')}
                  className="text-blue-900 hover:underline font-bold"
                >
                  Faculty
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => prefillEmail('admin@college.edu')}
                  className="text-blue-900 hover:underline font-bold"
                >
                  Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-mono">
            D. Y. Patil College of Engineering & Technology, Kolhapur (DYPCET) • CSE Final Year Capstone 2026-27
          </p>
          <p className="text-[10px] text-slate-400">
            FastAPI + Supabase PostgreSQL & pgvector + Google Gemini RAG Architecture
          </p>
        </div>

      </div>
    </div>
  );
}
