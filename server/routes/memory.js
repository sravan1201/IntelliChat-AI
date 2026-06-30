import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Demo in-memory store
const memoryStore = new Map();

function seedMemories(userId) {
  return [
    { _id: `mem-1`, content: 'User prefers Python for backend development', category: 'preference', importance: 8, source: 'chat', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { _id: `mem-2`, content: 'User is preparing for Google SWE interviews', category: 'goal', importance: 10, source: 'chat', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { _id: `mem-3`, content: 'User has 2 years of React experience', category: 'skill', importance: 7, source: 'conversation', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: `mem-4`, content: 'User struggles with dynamic programming problems', category: 'weakness', importance: 9, source: 'chat', createdAt: new Date().toISOString() }
  ];
}

router.get('/', (req, res) => {
  if (!memoryStore.has(req.userId)) {
    memoryStore.set(req.userId, seedMemories(req.userId));
  }
  res.json(memoryStore.get(req.userId));
});

router.delete('/:id', (req, res) => {
  const memories = memoryStore.get(req.userId) || [];
  memoryStore.set(req.userId, memories.filter(m => m._id !== req.params.id));
  res.json({ success: true });
});

export default router;
