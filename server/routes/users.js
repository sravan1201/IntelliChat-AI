import express from 'express';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const recentChats = await Chat.find({ user: req.userId }).sort({ updatedAt: -1 }).limit(5).select('-messages');
    const now = new Date();
    const activityData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      return { date: d.toLocaleDateString('en', { weekday: 'short' }), messages: Math.floor(Math.random() * 30) + 2, tokens: Math.floor(Math.random() * 6000) + 500 };
    });
    res.json({ ...user.stats, recentChats, activityData, personaBreakdown: [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/settings', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { $set: { settings: req.body } }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
