import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  tokens: { type: Number, default: 0 },
  attachments: [{ name: String, type: String, size: Number }],
  isEdited: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  persona: {
    type: String,
    enum: ['general', 'teacher', 'interviewer', 'debugger', 'mentor'],
    default: 'general'
  },
  messages: [messageSchema],
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  isPinned: { type: Boolean, default: false },
  tags: [String],
  totalTokens: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
