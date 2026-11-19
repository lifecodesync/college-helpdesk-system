import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  FileQuestion,
  Database,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import FaqModal from '../components/FaqModal';
import SupabaseModal from '../components/SupabaseModal';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [workloads, setWorkloads] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [faqSeedQuestion, setFaqSeedQuestion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, wl, ua, sb] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getDepartmentWorkload(),
          api.getUnansweredQueries(),
          api.getSupabaseStatus()
        ]);
        setOverview(ov);
        setWorkloads(wl);
        setUnanswered(ua);
        setSupabaseStatus(sb);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ticketStatusData = overview ? [
    { name: 'Resolved', value: overview.resolved_tickets, color: '#10b981' },
    { name: 'Open / In Progress', value: overview.open_tickets, color: '#f59e0b' },
  ] : [];

  const handleResolveGap = (queryText) => {
    setFaqSeedQuestion({
      question: queryText,
      answer: '',
      category: 'General'
    });
    setIsFaqModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            Institutional Performance & AI Knowledge Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry on AI queries, department ticket workloads, resolution turnaround, and knowledge gaps
          </p>
        </div>

        {/* Supabase Status Trigger */}
        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 shadow-sm self-start sm:self-auto"
        >
          <Database className="w-4 h-4 text-blue-700" />
          <span>Supabase Status: <strong>{supabaseStatus?.connected ? 'Live Cloud' : 'Local DB'}</strong></span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total AI Inquiries"
          value={overview?.total_queries || 0}
          subtitle="Processed through RAG pipeline"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Student Satisfaction"
          value={`${overview?.satisfaction_rate || 95}%`}
          subtitle="Helpful query feedback ratio"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Unanswered / Low-Confidence"
          value={overview?.unanswered_queries || 0}
          subtitle="Requires documentation update"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Helpdesk Tickets"
          value={overview?.total_tickets || 0}
          subtitle={`${overview?.resolved_tickets || 0} closed / resolved`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Workload Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-700" />
            Support Ticket Load by Academic & Administrative Cell
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloads} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="department_name" 
                  tick={{ fill: '#64748b', fontSize: 10 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ticket_count" name="Total Tickets" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved_count" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Resolution Status Pie Chart (1 Col) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Ticket Resolution Ratio
          </h3>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {ticketStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900">{item.value} tickets</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Unanswered & Low-Confidence Queries Log (Knowledge Gap Discovery) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-rose-600" />
              Unanswered & Low-Confidence Student Inquiries (Knowledge Gap Detection)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These student queries lacked documentation in the RAG knowledge base. Use the quick action button to draft an official FAQ or upload a reference PDF.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
            {unanswered.length} Policy Gaps Detected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Student Inquiry</th>
                <th className="py-3 px-4">Asked By</th>
                <th className="py-3 px-4">Confidence Match</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {unanswered.length > 0 ? (
                unanswered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-sm">
                      "{item.query_text}"
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.user_name || 'Anonymous Student'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {Math.round(item.confidence_score * 100)}% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleResolveGap(item.query_text)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold transition-colors"
                      >
                        + Create FAQ to Resolve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No unanswered queries recorded. Knowledge base coverage is optimal!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <FaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        faqToEdit={faqSeedQuestion}
        onSaved={() => {
          setIsFaqModalOpen(false);
          alert("FAQ published successfully to fill the student knowledge gap!");
        }}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </div>
  );
}
