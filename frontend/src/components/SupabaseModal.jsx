import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function SupabaseModal({ isOpen, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getSupabaseStatus();
      setStatus(data);
      if (data.url && data.url !== 'Not Configured') {
        setSupabaseUrl(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setError("Please provide both Supabase Project URL and Anon/Service Key.");
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.saveSupabaseConfig({
        supabase_url: supabaseUrl.trim(),
        supabase_key: supabaseKey.trim(),
        supabase_service_role_key: serviceKey.trim() || undefined
      });
      setStatus(updated);
      setSuccess("Supabase connection configured and verified successfully!");
    } catch (err) {
      setError(err.message || "Failed to connect to Supabase.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database Integration</h3>
              <p className="text-xs text-slate-500">PostgreSQL + pgvector Semantic Knowledge Storage</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Connection Status Banner */}
          <div className={`p-4 rounded-xl border ${
            status?.connected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {status?.connected ? 'Live Supabase PostgreSQL Connected' : 'Local High-Fidelity Database Mode'}
                </span>
              </div>
              <button 
                onClick={fetchStatus} 
                className="text-xs flex items-center gap-1 font-medium hover:underline text-slate-600"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed text-slate-700">
              {status?.message || 'Connecting to database service...'}
            </p>

            {status?.tables && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Profiles</div>
                  <div className="text-sm font-bold text-slate-800">{status.tables.profiles || status.tables.profiles_count || 0}</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Notices</div>
                  <div className="text-sm font-bold text-slate-800">{status.tables.notices || status.tables.notices_count || 0}</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Tickets</div>
                  <div className="text-sm font-bold text-slate-800">{status.tables.tickets || status.tables.tickets_count || 0}</div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Project URL *
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">Found in your Supabase Dashboard → Settings → API</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Anon Key or Service Role Key *
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                required
              />
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Database Migration Script Ready:
              </span>
              <p className="text-slate-600">
                Before connecting, run <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono text-[11px]">database/setup_all.sql</code> in your Supabase SQL editor to create all tables and pgvector indexes in 1 click.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-900/20 disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{saving ? 'Testing & Saving...' : 'Connect to Supabase'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
