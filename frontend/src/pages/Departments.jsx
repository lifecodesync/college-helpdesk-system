import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  HelpCircle, 
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FaqModal from '../components/FaqModal';

export default function Departments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // FAQ Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [depts, faqsData] = await Promise.all([
        api.getDepartments(),
        api.getFaqs()
      ]);
      setDepartments(depts);
      setFaqs(faqsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskDept = (deptId) => {
    navigate('/chat', { state: { departmentId: deptId } });
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ item?")) return;
    try {
      await api.deleteFaq(faqId);
      setFaqs(faqs.filter(f => f.id !== faqId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            Academic Departments & Administrative Cells
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional directory of engineering departments, examination division, and student advisory sections
          </p>
        </div>

        {user?.role !== 'student' && (
          <button
            onClick={() => {
              setFaqToEdit(null);
              setIsFaqModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading departments...</div>
        ) : departments.map((dept) => {
          const deptFaqs = faqs.filter(f => f.department_id === dept.id);

          return (
            <div
              key={dept.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                    {dept.code}
                  </span>
                  <button
                    onClick={() => handleAskDept(dept.id)}
                    className="flex items-center gap-1 text-xs text-blue-800 hover:text-blue-950 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ask AI</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dept.description}</p>
                </div>

                {/* Key Contacts */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <UserCheck className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                    <span className="font-bold truncate">HOD: {dept.hod_name || 'Academic Coordinator'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{dept.location || 'Main Campus'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-[11px] truncate">{dept.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-[11px] truncate">{dept.phone}</span>
                  </div>
                </div>

                {/* Department FAQs Accordion */}
                {deptFaqs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                      Department FAQs ({deptFaqs.length})
                    </h4>
                    {deptFaqs.map((faq) => {
                      const isExpanded = expandedFaq === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden"
                        >
                          <div className="flex items-center justify-between p-2.5">
                            <button
                              onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                              className="text-left text-xs font-semibold text-slate-800 hover:text-blue-900 flex-1 pr-2 line-clamp-1"
                            >
                              {faq.question}
                            </button>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {user?.role !== 'student' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setFaqToEdit(faq);
                                      setIsFaqModalOpen(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-blue-700"
                                    title="Edit FAQ"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFaq(faq.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600"
                                    title="Delete FAQ"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                                className="p-1 text-slate-400"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="p-3 bg-white text-xs text-slate-700 border-t border-slate-200 leading-relaxed">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAskDept(dept.id)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask Department AI Assistant</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ Edit/Create Modal */}
      <FaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        faqToEdit={faqToEdit}
        onSaved={fetchData}
      />

    </div>
  );
}
