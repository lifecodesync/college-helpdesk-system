import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  BookOpen, 
  RotateCcw,
  Building2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CitationDrawer from '../components/CitationDrawer';

export default function ChatBot() {
  const { user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const initialAskedRef = useRef(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'Student'}! I am the official AI Student Assistant for D. Y. Patil School of Engineering & Management (DYPSEM), Kolhapur — Constituent Unit of D. Y. Patil Education Society (Deemed to be University). Ask me anything about university exam rules, syllabus, MahaDBT scholarship schemes, fee installments, attendance policies, or campus regulations. Every response is strictly grounded in official college documents with source citations.`,
      sources: [],
      confidence: 1.0,
      timestamp: new Date()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState(null);
  const [isCitationDrawerOpen, setIsCitationDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const suggestedPrompts = [
    "What is the minimum attendance requirement for semester exams?",
    "What are the hostel curfew timings on weekdays?",
    "How do I apply for re-evaluation and what is the fee?",
    "Where can I get a bonafide certificate for an educational bank loan?",
    "What is the late fine calculation for tuition fee payment?"
  ];

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(console.error);

    if (location.state?.initialQuery && !initialAskedRef.current) {
      initialAskedRef.current = true;
      handleAsk(location.state.initialQuery);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askChat(q.trim(), selectedDept || null);
      const botMsg = {
        id: res.query_id,
        sender: 'bot',
        text: res.answer,
        sources: res.sources || [],
        confidence: res.confidence_score,
        is_answered: res.is_answered,
        unanswered_reason: res.unanswered_reason,
        response_time_ms: res.response_time_ms,
        timestamp: new Date(),
        feedback: null
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: "I encountered an issue processing your query. Please check that backend service is active or create a Helpdesk support ticket.",
          sources: [],
          isError: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (queryId, type) => {
    try {
      await api.sendFeedback(queryId, type);
      setMessages(prev =>
        prev.map(m => m.id === queryId ? { ...m, feedback: type } : m)
      );
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCitations = (sources) => {
    setSelectedSources(sources);
    setIsCitationDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              DYPCET AI Student Assistant
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> RAG Grounded
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">pgvector Semantic Knowledge Search & Audit Trail</p>
          </div>
        </div>

        {/* Department Filter & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50/50">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                isBot ? 'bg-blue-900 shadow-sm' : 'bg-slate-700'
              }`}>
                {isBot ? <Sparkles className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-2xl">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isBot 
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' 
                    : 'bg-blue-900 text-white shadow-md'
                }`}>
                  {msg.text}
                </div>

                {/* Bot Metadata & Citations */}
                {isBot && msg.id !== 'welcome' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      {/* Citations Button */}
                      {msg.sources && msg.sources.length > 0 && (
                        <button
                          onClick={() => openCitations(msg.sources)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <BookOpen className="w-3 h-3 text-blue-700" />
                          <span>{msg.sources.length} Verified Sources</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      )}

                      {/* Confidence Pill */}
                      {msg.confidence !== undefined && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {Math.round(msg.confidence * 100)}% Match
                        </span>
                      )}

                      {msg.response_time_ms && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.response_time_ms}ms
                        </span>
                      )}
                    </div>

                    {/* Actions: Copy & Feedback */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        className={`p-1 rounded hover:bg-slate-100 ${msg.feedback === 'helpful' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-700'}`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'unhelpful')}
                        className={`p-1 rounded hover:bg-slate-100 ${msg.feedback === 'unhelpful' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'}`}
                        title="Not Helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 shadow-sm flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce"></div>
              </div>
              <span className="font-medium">Searching pgvector knowledge base & synthesizing cited answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 whitespace-nowrap font-medium transition-colors shadow-2xl"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your academic or administrative question..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-40 transition-all shadow-md shadow-blue-900/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Grounded with Retrieval-Augmented Generation (RAG) strictly using official university regulations.
        </p>
      </div>

      {/* Citations Drawer */}
      <CitationDrawer
        isOpen={isCitationDrawerOpen}
        onClose={() => setIsCitationDrawerOpen(false)}
        sources={selectedSources}
      />

    </div>
  );
}
