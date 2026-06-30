import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.use(authenticate);

// In-memory store for demo (use MongoDB in production)
const imageStore = new Map();

router.get('/', (req, res) => {
  const userImages = imageStore.get(req.userId) || [];
  res.json(userImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'realistic' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    // In production: call Gemini Imagen or DALL-E API
    const colors = ['4f46e5', '0ea5e9', '10b981', 'f59e0b', 'ec4899', '8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const img = {
      _id: `img-${Date.now()}`,
      prompt,
      url: `https://placehold.co/512x512/${color}/ffffff?text=${encodeURIComponent(prompt.slice(0, 15))}`,
      width: 512, height: 512, style,
      createdAt: new Date().toISOString()
    };

    const userImages = imageStore.get(req.userId) || [];
    userImages.unshift(img);
    imageStore.set(req.userId, userImages);
    await User.findByIdAndUpdate(req.userId, { $inc: { 'stats.totalImages': 1 } });
    res.status(201).json(img);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  const userImages = imageStore.get(req.userId) || [];
  imageStore.set(req.userId, userImages.filter(img => img._id !== req.params.id));
  res.json({ success: true });
});

export default router;
