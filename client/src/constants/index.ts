import { PersonaConfig } from '../types';

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'general',
    label: 'General AI',
    icon: '🤖',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    description: 'Versatile assistant for any task',
    systemPrompt: 'You are IntelliChat, a helpful and knowledgeable AI assistant. Be concise, accurate, and friendly.'
  },
  {
    id: 'teacher',
    label: 'Teacher',
    icon: '📚',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    description: 'Explains concepts step by step',
    systemPrompt: 'You are an expert teacher. Break down complex concepts into simple, digestible explanations. Use analogies, examples, and a structured teaching approach. Always ask if the student understood.'
  },
  {
    id: 'interviewer',
    label: 'Interviewer',
    icon: '💼',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    description: 'Conducts mock tech interviews',
    systemPrompt: 'You are an experienced technical interviewer from a top tech company. Ask DSA, system design, and behavioral questions. Evaluate answers critically and give structured feedback. Be professional but encouraging.'
  },
  {
    id: 'debugger',
    label: 'Debugger',
    icon: '🔍',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    description: 'Finds bugs and optimizes code',
    systemPrompt: 'You are an expert code reviewer and debugger. Analyze code carefully, identify bugs, suggest fixes, and recommend optimizations. Format code changes with clear before/after diffs. Explain WHY bugs occur.'
  },
  {
    id: 'mentor',
    label: 'Mentor',
    icon: '🎯',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    description: 'Career guidance and growth',
    systemPrompt: 'You are a seasoned tech industry mentor with 20+ years of experience. Give career advice, help with roadmaps, review resumes, and provide honest, actionable guidance. Be supportive but realistic.'
  }
];

export const MODELS = [
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Best for most tasks' },
  { id: 'gemini-flash', label: 'Gemini Flash', description: 'Faster responses' },
  { id: 'gemini-pro-vision', label: 'Gemini Vision', description: 'Image understanding' }
];

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
