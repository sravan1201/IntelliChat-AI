import axios from 'axios';
import { API_BASE } from '../constants';
import { AuthResponse, User, Chat, Document, GeneratedImage, Memory, DashboardStats } from '../types';

const http = axios.create({ baseURL: API_BASE });

// Add token to all requests
http.interceptors.request.use(config => {
  const token = localStorage.getItem('intellichat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ─────────────────────────────────────────────────────────
export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await http.post('/auth/login', { email, password });
      return data;
    } catch {
      // Demo mode fallback
      return mockAuth(email, 'login');
    }
  },

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await http.post('/auth/signup', { name, email, password });
      return data;
    } catch {
      return mockAuth(email, 'signup', name);
    }
  },

  async getMe(token: string): Promise<User> {
    try {
      const { data } = await http.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      return data;
    } catch {
      const saved = localStorage.getItem('intellichat_demo_user');
      if (saved) return JSON.parse(saved);
      throw new Error('Not authenticated');
    }
  },

  // ─── CHATS ──────────────────────────────────────────────────────
  async getChats(): Promise<Chat[]> {
    try {
      const { data } = await http.get('/chats');
      return data;
    } catch {
      return JSON.parse(localStorage.getItem('intellichat_chats') || '[]');
    }
  },

  async createChat(persona: string = 'general'): Promise<Chat> {
    try {
      const { data } = await http.post('/chats', { persona });
      return data;
    } catch {
      const newChat: Chat = {
        _id: `demo-${Date.now()}`,
        title: 'New Chat',
        persona: persona as any,
        messages: [],
        isPinned: false,
        tags: [],
        totalTokens: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const chats = JSON.parse(localStorage.getItem('intellichat_chats') || '[]');
      chats.unshift(newChat);
      localStorage.setItem('intellichat_chats', JSON.stringify(chats));
      return newChat;
    }
  },

  async getChat(id: string): Promise<Chat> {
    try {
      const { data } = await http.get(`/chats/${id}`);
      return data;
    } catch {
      const chats: Chat[] = JSON.parse(localStorage.getItem('intellichat_chats') || '[]');
      return chats.find(c => c._id === id) as Chat;
    }
  },

  async deleteChat(id: string): Promise<void> {
    try {
      await http.delete(`/chats/${id}`);
    } catch {
      const chats: Chat[] = JSON.parse(localStorage.getItem('intellichat_chats') || '[]');
      localStorage.setItem('intellichat_chats', JSON.stringify(chats.filter(c => c._id !== id)));
    }
  },

  async updateChatTitle(id: string, title: string): Promise<void> {
    try {
      await http.patch(`/chats/${id}`, { title });
    } catch {
      const chats: Chat[] = JSON.parse(localStorage.getItem('intellichat_chats') || '[]');
      const updated = chats.map(c => c._id === id ? { ...c, title } : c);
      localStorage.setItem('intellichat_chats', JSON.stringify(updated));
    }
  },

  // ─── AI CHAT ────────────────────────────────────────────────────
  async sendMessage(chatId: string, message: string, persona: string, documentIds?: string[]): Promise<string> {
    try {
      const { data } = await http.post(`/chats/${chatId}/message`, { message, persona, documentIds });
      return data.response;
    } catch {
      return generateLocalResponse(message, persona);
    }
  },

  // ─── DOCUMENTS ──────────────────────────────────────────────────
  async getDocuments(): Promise<Document[]> {
    try {
      const { data } = await http.get('/documents');
      return data;
    } catch {
      return JSON.parse(localStorage.getItem('intellichat_docs') || '[]');
    }
  },

  async uploadDocument(file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await http.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch {
      const doc: Document = {
        _id: `doc-${Date.now()}`,
        name: file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
        originalName: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
        size: file.size,
        summary: `Uploaded "${file.name}". Ready for Q&A.`,
        status: 'ready',
        pageCount: Math.ceil(file.size / 3000),
        wordCount: Math.ceil(file.size / 5),
        createdAt: new Date().toISOString()
      };
      const docs: Document[] = JSON.parse(localStorage.getItem('intellichat_docs') || '[]');
      docs.unshift(doc);
      localStorage.setItem('intellichat_docs', JSON.stringify(docs));
      return doc;
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await http.delete(`/documents/${id}`);
    } catch {
      const docs: Document[] = JSON.parse(localStorage.getItem('intellichat_docs') || '[]');
      localStorage.setItem('intellichat_docs', JSON.stringify(docs.filter(d => d._id !== id)));
    }
  },

  // ─── IMAGES ─────────────────────────────────────────────────────
  async getImages(): Promise<GeneratedImage[]> {
    try {
      const { data } = await http.get('/images');
      return data;
    } catch {
      return JSON.parse(localStorage.getItem('intellichat_images') || '[]');
    }
  },

  async generateImage(prompt: string, style: string): Promise<GeneratedImage> {
    try {
      const { data } = await http.post('/images/generate', { prompt, style });
      return data;
    } catch {
      // Return a placeholder generated image
      const colors = ['4f46e5', '0ea5e9', '10b981', 'f59e0b', 'ec4899'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const img: GeneratedImage = {
        _id: `img-${Date.now()}`,
        prompt,
        url: `https://placehold.co/512x512/${color}/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`,
        width: 512,
        height: 512,
        style,
        createdAt: new Date().toISOString()
      };
      const images: GeneratedImage[] = JSON.parse(localStorage.getItem('intellichat_images') || '[]');
      images.unshift(img);
      localStorage.setItem('intellichat_images', JSON.stringify(images));
      return img;
    }
  },

  // ─── MEMORY ─────────────────────────────────────────────────────
  async getMemories(): Promise<Memory[]> {
    try {
      const { data } = await http.get('/memory');
      return data;
    } catch {
      return JSON.parse(localStorage.getItem('intellichat_memory') || '[]');
    }
  },

  async deleteMemory(id: string): Promise<void> {
    try {
      await http.delete(`/memory/${id}`);
    } catch {
      const memories: Memory[] = JSON.parse(localStorage.getItem('intellichat_memory') || '[]');
      localStorage.setItem('intellichat_memory', JSON.stringify(memories.filter(m => m._id !== id)));
    }
  },

  // ─── DASHBOARD ──────────────────────────────────────────────────
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data } = await http.get('/users/dashboard');
      return data;
    } catch {
      return generateDemoStats();
    }
  }
};

// ─── MOCK/DEMO HELPERS ──────────────────────────────────────────────
function mockAuth(email: string, _type: string, name?: string): AuthResponse {
  const user: User = {
    _id: `demo-${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0ea5e9&color=fff`,
    plan: 'pro',
    settings: { theme: 'dark', model: 'gemini-pro', temperature: 0.7, language: 'en' },
    stats: { totalChats: 24, totalMessages: 186, totalTokens: 48200, totalFiles: 7, totalImages: 12 },
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('intellichat_demo_user', JSON.stringify(user));
  return { token: `demo-token-${Date.now()}`, user };
}

function generateLocalResponse(message: string, persona: string): string {
  const lower = message.toLowerCase();
  
  // Code-related
  if (lower.includes('code') || lower.includes('function') || lower.includes('bug') || lower.includes('error')) {
    return `I'll help you with this code issue!\n\n\`\`\`javascript\n// Here's an optimized solution:\nfunction solution(input) {\n  // Step 1: Validate input\n  if (!input) throw new Error('Invalid input');\n  \n  // Step 2: Process\n  const result = input\n    .filter(Boolean)\n    .map(item => item.toString().trim());\n  \n  return result;\n}\n\`\`\`\n\n**Key improvements:**\n- ✅ Input validation added\n- ✅ Used functional programming patterns\n- ✅ Better error handling\n- ✅ Cleaner code structure\n\nWould you like me to explain any part in detail?`;
  }
  
  // Greetings
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    const greetings: Record<string, string> = {
      general: "Hello! I'm IntelliChat AI. I can help with coding, writing, analysis, and more. What can I do for you today?",
      teacher: "Hello, student! 📚 I'm your AI teacher today. What concept would you like to learn? I'll break it down step by step!",
      interviewer: "Welcome to your mock interview! 💼 I'm your technical interviewer today. Let's start with: **Tell me about yourself and your experience.**",
      debugger: "Hey! 🔍 Ready to squash some bugs! Paste your code and describe the issue — I'll analyze it thoroughly.",
      mentor: "Hi there! 🎯 Great to meet you. I'm here to guide your career journey. What are your current goals or challenges?"
    };
    return greetings[persona] || greetings.general;
  }

  // Interview-related
  if (persona === 'interviewer' || lower.includes('interview')) {
    const questions = [
      "**DSA Question:** Implement a function to find the two numbers in an array that sum to a target value. What's the time complexity of your approach?\n\n*Take your time to think through the solution before answering.*",
      "**System Design:** Design a URL shortener like bit.ly. Walk me through your architecture decisions, database schema, and how you'd handle 1 million requests per day.",
      "**Behavioral:** Tell me about a time when you had to debug a critical production issue under time pressure. What was your approach?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // Teaching
  if (persona === 'teacher') {
    return `Great question! Let me explain this step by step:\n\n## Understanding the Concept\n\nThink of it like this: **${message.slice(0, 30)}...** is similar to how we organize things in real life.\n\n### Step 1: The Foundation\nEvery concept builds on basics. Here's what you need to know first...\n\n### Step 2: Core Mechanism\nThe way this works is:\n1. First, we initialize the state\n2. Then, we apply the transformation\n3. Finally, we validate the output\n\n### Quick Exercise\nTry this: Can you apply this concept to a real-world scenario?\n\n**Does this explanation make sense? Would you like me to go deeper on any part?**`;
  }

  // General response
  const responses = [
    `That's a great question! Here's what I know about **${message.slice(0, 20)}...**:\n\n${message} is an important topic. Let me break it down:\n\n1. **Overview**: This concept is fundamental to understanding modern systems\n2. **Key Points**: The main considerations are efficiency, scalability, and maintainability\n3. **Best Practices**: Always consider edge cases and write tests\n\nWould you like me to elaborate on any specific aspect?`,
    `I can help with that! Here's a comprehensive answer:\n\n## ${message.slice(0, 40)}\n\nBased on your question, here are the key insights:\n\n- **First**: Consider the broader context and requirements\n- **Second**: Apply industry best practices\n- **Third**: Validate your approach with examples\n\nLet me know if you'd like more details!`,
    `Excellent! Let me address this thoroughly.\n\nRegarding your question about "${message.slice(0, 30)}...":\n\n> The most important thing to understand is that every problem has multiple valid solutions.\n\nHere's my recommended approach:\n\n1. Analyze the requirements\n2. Design a solution\n3. Implement iteratively\n4. Test thoroughly\n\nWant me to dive deeper into any of these steps?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateDemoStats(): DashboardStats {
  const now = new Date();
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString('en', { weekday: 'short' }),
      messages: Math.floor(Math.random() * 40) + 5,
      tokens: Math.floor(Math.random() * 8000) + 1000
    };
  });

  return {
    totalChats: 24,
    totalMessages: 186,
    totalTokens: 48200,
    totalFiles: 7,
    totalImages: 12,
    recentChats: [],
    activityData,
    personaBreakdown: [
      { persona: 'general', count: 12 },
      { persona: 'debugger', count: 7 },
      { persona: 'interviewer', count: 3 },
      { persona: 'teacher', count: 2 }
    ]
  };
}
