import React, { useState, useEffect } from 'react';
import { X, Send, Pin, Building2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function NoticeEditModal({ isOpen, onClose, noticeToEdit, onSaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Examinations');
  const [departmentId, setDepartmentId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [targetAudience, setTargetAudience] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getDepartments().then(setDepartments).catch(console.error);
      if (noticeToEdit) {
        setTitle(noticeToEdit.title || '');
        setContent(noticeToEdit.content || '');
        setCategory(noticeToEdit.category || 'General');
        setDepartmentId(noticeToEdit.department_id || '');
        setIsPinned(Boolean(noticeToEdit.is_pinned));
        setTargetAudience(noticeToEdit.target_audience || 'all');
      } else {
        setTitle('');
        setContent('');
        setCategory('Examinations');
        setDepartmentId('');
        setIsPinned(false);
        setTargetAudience('all');
      }
      setError('');
    }
  }, [isOpen, noticeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both title and notice circular details.");
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let saved;
      if (noticeToEdit) {
        saved = await api.updateNotice(noticeToEdit.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          department_id: departmentId || null,
          is_pinned: isPinned,
          target_audience: targetAudience
        });
      } else {
        saved = await api.createNotice({
          title: title.trim(),
          content: content.trim(),
          category,
          department_id: departmentId || null,
          is_pinned: isPinned,
          target_audience: targetAudience
        });
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save notice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {noticeToEdit ? 'Edit Campus Notice' : 'Publish New Campus Notice'}
            </h3>
            <p className="text-xs text-slate-500">Official College Circular & Announcement Desk</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notice Headline / Subject *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule for End Semester Examinations - Winter 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Examinations">Examinations & Hall Tickets</option>
                <option value="Academics">Academic Regulations</option>
                <option value="Events">Events & Hackathons</option>
                <option value="Fees">Tuition & Accounts</option>
                <option value="Campus Life">Campus Life & Hostel</option>
                <option value="General">General Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="">Campus Wide (All)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="all">All (Students & Faculty)</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty & Staff Only</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Pin to top of Notice Board</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notice Content & Detailed Circular *
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter official circular text, timetable links, dates, and instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-900/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : noticeToEdit ? 'Update Notice' : 'Publish Notice'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
