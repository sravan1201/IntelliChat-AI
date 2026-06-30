import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import documentRoutes from './routes/documents.js';
import imageRoutes from './routes/images.js';
import memoryRoutes from './routes/memory.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellichat';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.log('⚠️  MongoDB not connected - running in demo mode');
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 IntelliChat server running on http://localhost:${PORT}`);
  });
});

export default app;
