// TypeScript interfaces for IntelliChat AI

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: UserSettings;
  stats: UserStats;
  createdAt: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  model: string;
  temperature: number;
  language: string;
}

export interface UserStats {
  totalChats: number;
  totalMessages: number;
  totalTokens: number;
  totalFiles: number;
  totalImages: number;
}

export interface Message {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  attachments?: Attachment[];
  isEdited?: boolean;
  rating?: number;
  createdAt?: string;
  isStreaming?: boolean;
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
}

export interface Chat {
  _id: string;
  title: string;
  persona: Persona;
  messages: Message[];
  documents?: Document[];
  isPinned: boolean;
  tags: string[];
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
}

export type Persona = 'general' | 'teacher' | 'interviewer' | 'debugger' | 'mentor';

export interface PersonaConfig {
  id: Persona;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  systemPrompt: string;
}

export interface Document {
  _id: string;
  name: string;
  originalName: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;
  summary: string;
  status: 'processing' | 'ready' | 'error';
  pageCount: number;
  wordCount: number;
  createdAt: string;
}

export interface GeneratedImage {
  _id: string;
  prompt: string;
  url: string;
  width: number;
  height: number;
  style: string;
  createdAt: string;
}

export interface Memory {
  _id: string;
  content: string;
  category: string;
  importance: number;
  source: string;
  createdAt: string;
}

export interface DashboardStats {
  totalChats: number;
  totalMessages: number;
  totalTokens: number;
  totalFiles: number;
  totalImages: number;
  recentChats: Chat[];
  activityData: ActivityDataPoint[];
  personaBreakdown: PersonaUsage[];
}

export interface ActivityDataPoint {
  date: string;
  messages: number;
  tokens: number;
}

export interface PersonaUsage {
  persona: Persona;
  count: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}
