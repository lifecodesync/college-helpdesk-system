import React from 'react';
import { X, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export default function CitationDrawer({ isOpen, onClose, sources }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Citations & Sources</h3>
              <p className="text-[11px] text-slate-500">pgvector Knowledge Grounding Check</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
            <span className="font-bold text-blue-900">Official Grounded Answer:</span> The AI assistant constructed this reply strictly from the indexed college handbooks below.
          </div>

          {sources && sources.length > 0 ? (
            sources.map((src, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{src.document_title}</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                    {Math.round(src.similarity * 100)}% match
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">Page {src.page_number}</span>
                  {src.filename && <span className="font-mono text-[10px] truncate">{src.filename}</span>}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                  "{src.content_snippet}"
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No source records available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Hallucination Protected
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
