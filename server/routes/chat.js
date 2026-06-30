import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { generateAIResponse } from '../services/ai.js';

const router = express.Router();
router.use(authenticate);

// GET /api/chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.userId }).sort({ updatedAt: -1 }).select('-messages');
    res.json(chats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chats
router.post('/', async (req, res) => {
  try {
    const chat = await Chat.create({ user: req.userId, persona: req.body.persona || 'general' });
    await User.findByIdAndUpdate(req.userId, { $inc: { 'stats.totalChats': 1 } });
    res.status(201).json(chat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/chats/:id
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/chats/:id
router.patch('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: req.body },
      { new: true }
    );
    res.json(chat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/chats/:id
router.delete('/:id', async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chats/:id/message
router.post('/:id/message', async (req, res) => {
  try {
    const { message, persona, documentIds } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Generate AI response
    const response = await generateAIResponse(message, persona || chat.persona, chat.messages.slice(-10));
    const tokens = Math.ceil((message.length + response.length) / 4);

    // Add assistant message
    chat.messages.push({ role: 'assistant', content: response, tokens });
    chat.totalTokens += tokens;

    // Auto-title chat from first message
    if (chat.messages.length === 2) {
      chat.title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
    }

    await chat.save();
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.totalMessages': 2, 'stats.totalTokens': tokens }
    });

    res.json({ response, tokens });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
