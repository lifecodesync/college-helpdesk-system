import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Layers, 
  Trash2, 
  CheckCircle2, 
  X,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UploadModal from '../components/UploadModal';

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocChunks, setSelectedDocChunks] = useState(null);
  const [chunkDocTitle, setChunkDocTitle] = useState('');
  const [loadingChunks, setLoadingChunks] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleViewChunks = async (doc) => {
    setChunkDocTitle(doc.title);
    setLoadingChunks(true);
    try {
      const chunks = await api.getDocumentChunks(doc.id);
      setSelectedDocChunks(chunks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document and purge its pgvector embeddings?")) return;
    try {
      await api.deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
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
            <FileText className="w-5 h-5 text-blue-700" />
            RAG Knowledge Base & Regulatory Handbooks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official regulations, handbook PDFs, and curriculum docs indexed for AI semantic search via pgvector
          </p>
        </div>

        {user?.role !== 'student' && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading document repository...</div>
        ) : documents.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase bg-blue-50 text-blue-800 border border-blue-200">
                  {doc.file_type}
                </span>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Indexed
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{doc.title}</h3>
                <p className="text-[11px] font-mono text-slate-400 truncate mt-1">{doc.filename}</p>
              </div>

              {doc.summary && (
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {doc.summary}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-blue-900 font-bold">{doc.chunk_count} chunks</span>
                <span>•</span>
                <span className="text-[11px]">{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleViewChunks(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                >
                  <Layers className="w-3 h-3 text-blue-700" />
                  <span>Chunks</span>
                </button>
                {user?.role !== 'student' && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chunks Inspector Modal */}
      {selectedDocChunks && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  pgvector Chunks & Embeddings Inspector
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-md">{chunkDocTitle}</p>
              </div>
              <button 
                onClick={() => setSelectedDocChunks(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedDocChunks.map((chunk, idx) => (
                <div key={chunk.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-blue-900 font-bold">Chunk #{chunk.chunk_index}</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                      Page {chunk.page_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{chunk.content}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(newDoc) => setDocuments([newDoc, ...documents])}
      />

    </div>
  );
}
