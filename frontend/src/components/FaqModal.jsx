import React, { useState, useEffect } from 'react';
import { X, Send, HelpCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FaqModal({ isOpen, onClose, faqToEdit, onSaved }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Academics');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getDepartments().then(setDepartments).catch(console.error);
      if (faqToEdit) {
        setQuestion(faqToEdit.question || '');
        setAnswer(faqToEdit.answer || '');
        setCategory(faqToEdit.category || 'General');
        setDepartmentId(faqToEdit.department_id || '');
      } else {
        setQuestion('');
        setAnswer('');
        setCategory('Academics');
        setDepartmentId('');
      }
      setError('');
    }
  }, [isOpen, faqToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError("Please fill in both question and answer.");
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let saved;
      if (faqToEdit) {
        saved = await api.updateFaq(faqToEdit.id, {
          question: question.trim(),
          answer: answer.trim(),
          category,
          department_id: departmentId || null
        });
      } else {
        saved = await api.createFaq({
          question: question.trim(),
          answer: answer.trim(),
          category,
          department_id: departmentId || null,
          is_published: true
        });
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save FAQ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {faqToEdit ? 'Edit FAQ Item' : 'Add New Curated FAQ'}
              </h3>
              <p className="text-xs text-slate-500">Frequently Asked Questions Directory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-4 h-4" />
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Question *</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the procedure for obtaining a duplicate ID card?"
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
                <option value="Academics">Academics</option>
                <option value="Examinations">Examinations</option>
                <option value="Fees">Fees & Accounts</option>
                <option value="Hostel">Hostel & Mess</option>
                <option value="Certificates">Certificates</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="">General / All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Answer *</label>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Official institutional guidance, steps, fees, contact desks..."
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
              <span>{submitting ? 'Saving...' : faqToEdit ? 'Update FAQ' : 'Save FAQ'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
