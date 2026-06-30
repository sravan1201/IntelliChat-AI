import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, UploadCloud, Trash2, File as FileIcon, 
  MessageSquare, FileText as FileText2, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Document } from '../types';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    const file = acceptedFiles[0];
    
    try {
      const newDoc = await api.uploadDocument(file);
      setDocuments(prev => [newDoc, ...prev]);
      toast.success(`${file.name} uploaded successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleAskAI = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Context ready for ${doc.originalName}`);
    navigate('/chat');
    // In a full implementation, we'd pass the document ID to the chat via state or context
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileIcon size={24} className="text-red-400" />;
      case 'docx': return <FileText size={24} className="text-blue-400" />;
      default: return <FileText2 size={24} className="text-gray-400" />;
    }
  };

  const totalPages = documents.reduce((acc, doc) => acc + (doc.pageCount || 0), 0);
  const totalWords = documents.reduce((acc, doc) => acc + (doc.wordCount || 0), 0);

  return (
    <div className="p-8 h-full overflow-y-auto chat-scroll space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-400">Upload files to chat with them using AI.</p>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center gap-6 glass px-6 py-3 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-lg font-bold text-white">{documents.length}</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pages</p>
            <p className="text-lg font-bold text-white">{totalPages}</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Words</p>
            <p className="text-lg font-bold text-white">{(totalWords / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`glass rounded-2xl p-10 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-primary-500/50 hover:bg-surface-700/60'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} id="document-upload-input" />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-primary-500 animate-spin" />
            <p className="text-lg font-medium text-white">Uploading & Processing...</p>
            <p className="text-sm text-gray-400">Extracting text and generating embeddings</p>
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-primary-500 text-white' : 'bg-surface-900 text-primary-400'}`}>
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">Supports PDF, DOCX, and TXT up to 20MB</p>
            <button className="btn-primary" type="button">
              Select File
            </button>
          </>
        )}
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 stat-card shimmer rounded-xl border-none"></div>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="glass rounded-xl p-5 group flex flex-col hover:-translate-y-1 transition-transform duration-200 border-white/5 hover:border-primary-500/30 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-surface-900 border border-white/5">
                  {getFileIcon(doc.type)}
                </div>
                
                {doc.status === 'ready' ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Ready
                  </span>
                ) : doc.status === 'error' ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                    <AlertCircle size={12} /> Error
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                    <Loader2 size={12} className="animate-spin" /> Processing
                  </span>
                )}
              </div>
              
              <h3 className="text-white font-medium mb-1 truncate" title={doc.originalName}>
                {doc.originalName}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 mt-auto">
                <span>{formatSize(doc.size)}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span>{doc.pageCount} pages</span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-surface-800/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                <button 
                  onClick={(e) => handleAskAI(doc, e)}
                  className="btn-primary flex-1 justify-center py-2 text-sm"
                  title="Chat with document"
                >
                  <MessageSquare size={16} /> Ask AI
                </button>
                <button 
                  onClick={(e) => handleDelete(doc._id, e)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/20"
                  title="Delete document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-surface-900 rounded-full flex items-center justify-center mb-6">
            <FileText2 size={40} className="text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No documents yet</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Upload PDFs, Word documents, or text files to use Retrieval-Augmented Generation (RAG). The AI will answer questions based on your documents.
          </p>
        </div>
      )}
    </div>
  );
}
