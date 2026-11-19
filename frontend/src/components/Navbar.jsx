import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  LogOut,
  ChevronDown,
  Database,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SupabaseModal from './SupabaseModal';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);

  useEffect(() => {
    api.getSupabaseStatus().then(setSupabaseStatus).catch(console.error);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'faculty':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Faculty Desk</span>
          </span>
        );
      case 'admin':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
            <span>Admin Console</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>Student Portal</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      
      {/* Mobile Toggle & Institutional Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg md:hidden hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-bold text-blue-900">DYPCET Kolhapur</span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-700 capitalize">{user?.role || 'Helpdesk'} Desk</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-mono text-[11px]">Academic Term 2026–27</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Supabase Connection Status Pill */}
        <button
          onClick={() => setSupabaseModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            supabaseStatus?.connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Click to view or configure Supabase Cloud Database"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {supabaseStatus?.connected ? 'Supabase Connected' : 'Supabase (Local Mode)'}
          </span>
          <span className={`w-2 h-2 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </button>

        {/* Current Role Static Badge (Role switching locked after sign in) */}
        <div>
          {getRoleBadge()}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <img 
              src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
              alt={user?.full_name} 
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
            />
            <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[120px] truncate">
              {user?.full_name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {user?.role} Tier
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Role locked
                  </span>
                </div>
              </div>

              <div className="px-4 py-2 text-[11px] text-slate-500 bg-slate-50 border-b border-slate-100">
                To switch role, please sign out to the login screen.
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 rounded-xl hover:bg-rose-50 font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Supabase Cloud Connection Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => {
          setSupabaseModalOpen(false);
          api.getSupabaseStatus().then(setSupabaseStatus).catch(console.error);
        }}
      />

    </header>
  );
}
