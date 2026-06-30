import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'docx', 'txt'], required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  content: { type: String, default: '' }, // extracted text for RAG
  summary: { type: String, default: '' },
  chunks: [String], // text chunks for vector search
  status: { type: String, enum: ['processing', 'ready', 'error'], default: 'processing' },
  pageCount: { type: Number, default: 1 },
  wordCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
