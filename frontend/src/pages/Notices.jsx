import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Pin, 
  Plus, 
  Calendar, 
  Building2, 
  Edit3, 
  Trash2, 
  Filter,
  CheckCircle2,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoticeEditModal from '../components/NoticeEditModal';

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.getNotices();
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleTogglePin = async (noticeId) => {
    try {
      const updated = await api.togglePinNotice(noticeId);
      setNotices(notices.map(n => n.id === noticeId ? updated : n));
    } catch (err) {
      console.error("Toggle pin error:", err);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this official notice circular?")) return;
    try {
      await api.deleteNotice(noticeId);
      setNotices(notices.filter(n => n.id !== noticeId));
    } catch (err) {
      console.error("Delete notice error:", err);
    }
  };

  const filteredNotices = categoryFilter 
    ? notices.filter(n => n.category.toLowerCase() === categoryFilter.toLowerCase())
    : notices;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Campus Notice Board & Official Circulars
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official announcements from the Office of the Dean, Examination Controller, and Department Heads
          </p>
        </div>

        {user?.role !== 'student' && (
          <button
            onClick={() => {
              setNoticeToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Filter:</span>
          {['', 'Examinations', 'Academics', 'Events', 'Campus Life'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat || 'All Circulars'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredNotices.length}</strong> official circulars
        </span>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading notices...</div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-6 rounded-2xl border transition-all shadow-sm space-y-3 relative ${
                notice.is_pinned
                  ? 'bg-gradient-to-r from-amber-50/50 via-white to-white border-amber-300 ring-1 ring-amber-300/50'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Category, Department & Pin Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase bg-blue-50 text-blue-900 border border-blue-200">
                    {notice.category}
                  </span>
                  <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    {notice.department_name}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    For: {notice.target_audience}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {notice.is_pinned && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>

                  {/* Admin / Faculty Actions */}
                  {user?.role !== 'student' && (
                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
                      <button
                        onClick={() => handleTogglePin(notice.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          notice.is_pinned 
                            ? 'text-amber-700 hover:bg-amber-100' 
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={notice.is_pinned ? "Unpin notice" : "Pin notice"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setNoticeToEdit(notice);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-slate-100"
                        title="Edit notice"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="text-base font-bold text-slate-900">{notice.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{notice.content}</p>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                <span>Issued by: <strong className="text-slate-600">{notice.created_by_name || 'Academic Registry'}</strong></span>
                <span className="font-mono text-[10px]">Doc Ref: #{notice.id.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No circulars match the selected filter.
          </div>
        )}
      </div>

      {/* Publish / Edit Notice Modal */}
      <NoticeEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        noticeToEdit={noticeToEdit}
        onSaved={fetchNotices}
      />

    </div>
  );
}
