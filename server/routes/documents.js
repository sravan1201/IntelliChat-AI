import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  try {
    const docs = await Document.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
    const allowed = ['pdf', 'docx', 'txt'];
    if (!allowed.includes(ext)) return res.status(400).json({ error: 'File type not supported' });

    const doc = await Document.create({
      user: req.userId,
      name: req.file.filename,
      originalName: req.file.originalname,
      type: ext,
      size: req.file.size,
      path: req.file.path,
      status: 'ready',
      wordCount: Math.ceil(req.file.size / 5),
      pageCount: Math.ceil(req.file.size / 3000),
      summary: `Document "${req.file.originalname}" uploaded and ready for Q&A.`
    });

    await User.findByIdAndUpdate(req.userId, { $inc: { 'stats.totalFiles': 1 } });
    res.status(201).json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (doc?.path && fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
