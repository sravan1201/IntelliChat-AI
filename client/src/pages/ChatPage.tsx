import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send, Mic, MicOff, Paperclip, RefreshCw, Edit2, ThumbsUp, ThumbsDown,
  Copy, ChevronDown, Bot, User, Sparkles, Globe, Code
} from 'lucide-react';
import { Chat, Message, Persona } from '../types';
import { PERSONAS } from '../constants';
import { api } from '../services/api';
import toast from 'react-hot-toast';

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [persona, setPersona] = useState<Persona>('general');
  const [isListening, setIsListening] = useState(false);
  const [showPersonas, setShowPersonas] = useState(false);
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (chatId) loadChat(chatId);
    else initNewChat();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText]);

  const initNewChat = async () => {
    try {
      const newChat = await api.createChat(persona);
      navigate(`/chat/${newChat._id}`, { replace: true });
    } catch { setMessages([]); }
  };

  const loadChat = async (id: string) => {
    try {
      const data = await api.getChat(id);
      if (data) {
        setChat(data);
        setMessages(data.messages || []);
        setPersona(data.persona || 'general');
      }
    } catch { setMessages([]); }
  };

  const simulateStreaming = async (text: string) => {
    setIsStreaming(true);
    setStreamedText('');
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
      setStreamedText(prev => prev + (i === 0 ? '' : ' ') + words[i]);
    }
    setIsStreaming(false);
    return text;
  };

  const sendMessage = async (content: string = input) => {
    if (!content.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: content.trim(), createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const currentChatId = chatId || `demo-${Date.now()}`;
      const response = await api.sendMessage(currentChatId, content, persona);
      const finalText = await simulateStreaming(response);
      const aiMsg: Message = { role: 'assistant', content: finalText, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);

      // Update chat in localStorage
      const allChats: Chat[] = JSON.parse(localStorage.getItem('intellichat_chats') || '[]');
      const idx = allChats.findIndex(c => c._id === currentChatId);
      if (idx >= 0) {
        allChats[idx].messages = [...(allChats[idx].messages || []), userMsg, aiMsg];
        if (allChats[idx].messages.length === 2) {
          allChats[idx].title = content.slice(0, 50);
        }
        localStorage.setItem('intellichat_chats', JSON.stringify(allChats));
      }

      // TTS
      speakText(finalText);
    } catch (err: any) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
      setStreamedText('');
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    const clean = text.replace(/```[\s\S]*?```/g, 'code block').replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean.slice(0, 300));
    utterance.rate = 1.1;
    utterance.pitch = 1;
    synthRef.current = utterance;
    // Don't auto-speak unless voice mode is on
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error('Voice not supported in this browser');

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
      toast.success('Voice captured!');
    };
    recognition.onerror = () => { setIsListening(false); toast.error('Voice error'); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.success('Listening...');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied!');
  };

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    setMessages(prev => prev.filter((_, i) => i < prev.length - (prev[prev.length - 1].role === 'assistant' ? 1 : 0)));
    await sendMessage(lastUser.content);
  };

  const currentPersona = PERSONAS.find(p => p.id === persona) || PERSONAS[0];

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentPersona.icon}</span>
            <div>
              <h2 className="font-semibold text-gray-200">
                {chat?.title || 'New Conversation'}
              </h2>
              <span className={`persona-badge ${currentPersona.bgColor} ${currentPersona.color} border`}>
                {currentPersona.label}
              </span>
            </div>
          </div>

          {/* Persona Selector */}
          <div className="relative">
            <button
              id="persona-selector-btn"
              onClick={() => setShowPersonas(!showPersonas)}
              className="btn-secondary gap-2 text-sm"
            >
              <Sparkles size={14} />
              Switch Persona
              <ChevronDown size={14} className={`transition-transform ${showPersonas ? 'rotate-180' : ''}`} />
            </button>
            {showPersonas && (
              <div className="absolute right-0 top-12 z-50 glass rounded-xl p-2 w-64 shadow-xl border border-white/10 animate-fadeIn">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setPersona(p.id); setShowPersonas(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${persona === p.id ? p.bgColor + ' ' + p.color + ' border' : 'hover:bg-surface-700/60 text-gray-300'}`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{p.label}</p>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-6 py-6 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center text-4xl border border-primary-500/20">
                {currentPersona.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  Chat with {currentPersona.label}
                </h3>
                <p className="text-gray-400 max-w-sm">{currentPersona.description}</p>
              </div>
              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {persona === 'general' && ['Explain quantum computing', 'Write a Python script', 'Help me write an email'].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="btn-secondary text-sm py-1.5 px-3">{s}</button>
                ))}
                {persona === 'interviewer' && ['Start mock interview', 'DSA question please', 'System design challenge'].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="btn-secondary text-sm py-1.5 px-3">{s}</button>
                ))}
                {persona === 'debugger' && ['Review my code', 'Find the bug', 'Optimize this function'].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="btn-secondary text-sm py-1.5 px-3">{s}</button>
                ))}
                {persona === 'teacher' && ['Explain recursion', 'Teach me React hooks', 'What is Big O notation?'].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="btn-secondary text-sm py-1.5 px-3">{s}</button>
                ))}
                {persona === 'mentor' && ['Review my resume', 'Career advice for SWE', 'How to get into FAANG'].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="btn-secondary text-sm py-1.5 px-3">{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 animate-fadeIn ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium
                ${msg.role === 'user' ? 'bg-primary-600/30 text-primary-300' : 'bg-surface-600/50 text-gray-300'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`group flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {editingMsgId === `${i}` ? (
                  <div className="w-full">
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="input resize-none w-full"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button className="btn-primary text-xs py-1" onClick={() => { sendMessage(editContent); setEditingMsgId(null); }}>Send</button>
                      <button className="btn-secondary text-xs py-1" onClick={() => setEditingMsgId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={msg.role === 'user' ? 'message-user' : 'message-assistant'}>
                    {msg.role === 'assistant' ? (
                      <div className="prose-chat">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const inline = !match;
                              return !inline ? (
                                <div className="relative my-3">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-surface-900/80 border border-white/5 rounded-t-lg">
                                    <span className="text-xs text-gray-500 font-mono">{match[1]}</span>
                                    <button onClick={() => copyMessage(String(children))} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                                      <Copy size={10} /> Copy
                                    </button>
                                  </div>
                                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                                    customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }}>
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className="bg-surface-800 text-primary-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                )}

                {/* Message actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyMessage(msg.content)} className="btn-ghost text-xs p-1 gap-1">
                    <Copy size={11} />
                  </button>
                  {msg.role === 'user' && (
                    <button onClick={() => { setEditingMsgId(`${i}`); setEditContent(msg.content); }} className="btn-ghost text-xs p-1">
                      <Edit2 size={11} />
                    </button>
                  )}
                  {msg.role === 'assistant' && i === messages.length - 1 && (
                    <>
                      <button onClick={regenerate} className="btn-ghost text-xs p-1"><RefreshCw size={11} /></button>
                      <button className="btn-ghost text-xs p-1 text-emerald-400"><ThumbsUp size={11} /></button>
                      <button className="btn-ghost text-xs p-1 text-red-400"><ThumbsDown size={11} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming */}
          {isStreaming && streamedText && (
            <div className="flex gap-4 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-surface-600/50 flex items-center justify-center">
                <Bot size={14} className="text-gray-300" />
              </div>
              <div className="message-assistant">
                <div className="prose-chat">
                  <span>{streamedText}</span>
                  <span className="cursor-blink" />
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isLoading && !isStreaming && (
            <div className="flex gap-4 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-surface-600/50 flex items-center justify-center">
                <Bot size={14} className="text-gray-300" />
              </div>
              <div className="message-assistant flex items-center gap-1.5 py-4">
                <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                <div className="typing-dot" style={{ animationDelay: '150ms' }} />
                <div className="typing-dot" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-white/5 glass">
          <div className="flex items-end gap-3 glass rounded-2xl px-4 py-3 border border-white/10 focus-within:border-primary-500/40 transition-colors">
            <button
              id="attach-file-btn"
              className="btn-ghost p-1.5 text-gray-500 hover:text-gray-300 flex-shrink-0"
              onClick={() => toast.success('Go to Documents page to upload files!')}
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentPersona.label}...`}
              className="flex-1 bg-transparent resize-none text-gray-200 placeholder:text-gray-600 focus:outline-none text-sm leading-relaxed max-h-40 overflow-y-auto"
              style={{ minHeight: '24px' }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 160) + 'px';
              }}
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="web-search-btn"
                onClick={() => setIsWebSearch(!isWebSearch)}
                className={`btn-ghost p-1.5 ${isWebSearch ? 'text-primary-400 bg-primary-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                title={isWebSearch ? "Web Search Enabled" : "Enable Web Search"}
              >
                <Globe size={18} />
              </button>
              <button
                id="voice-btn"
                onClick={toggleVoice}
                className={`btn-ghost p-1.5 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-500 hover:text-gray-300'}`}
                title="Voice input"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                id="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="btn-primary p-2 rounded-xl disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          {input.length > 20 && (input.includes('function') || input.includes('class') || input.includes('const') || input.includes('import')) && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 chat-scroll">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Code size={12}/> Code Tools:</span>
              {['Explain Code', 'Find Bugs', 'Optimize', 'Generate Tests'].map(action => (
                <button 
                  key={action}
                  onClick={() => {
                    setInput(`${action}:\n\n${input}`);
                    setTimeout(() => inputRef.current?.focus(), 10);
                  }}
                  className="text-xs bg-surface-700 hover:bg-surface-600 text-gray-300 px-2 py-1 rounded border border-white/5 whitespace-nowrap transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          <p className="text-center text-xs text-gray-600 mt-2">
            Press Enter to send · Shift+Enter for new line · Click 🎙️ for voice
          </p>
        </div>
      </div>
    </div>
  );
}
