import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  avatar: { type: String, default: '' },
  googleId: { type: String },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  settings: {
    theme: { type: String, default: 'dark' },
    model: { type: String, default: 'gemini-pro' },
    temperature: { type: Number, default: 0.7 },
    language: { type: String, default: 'en' }
  },
  stats: {
    totalChats: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    totalFiles: { type: Number, default: 0 },
    totalImages: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
