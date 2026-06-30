import { useState } from 'react';
import { 
  Settings, User, Moon, Sun, Cpu, Download, 
  Trash2, Globe, Sparkles, Server, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MODELS } from '../constants';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Local state for optimistic UI updates before saving
  const [theme, setTheme] = useState(user?.settings?.theme || 'dark');
  const [model, setModel] = useState(user?.settings?.model || 'gemini-pro');
  const [temp, setTemp] = useState(user?.settings?.temperature || 0.7);
  const [language, setLanguage] = useState(user?.settings?.language || 'en');

  const handleSave = () => {
    // Optimistic update
    updateUser({
      settings: {
        theme: theme as any,
        model,
        temperature: temp,
        language
      }
    });
    // We would also call an API here in a real app: await api.updateSettings(...)
    toast.success('Settings saved successfully');
  };

  const exportData = () => {
    const chats = localStorage.getItem('intellichat_chats');
    if (!chats) return toast.error('No chat data to export');
    
    const blob = new Blob([chats], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intellichat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Chat history exported!');
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      localStorage.removeItem('intellichat_chats');
      toast.success('Chat history cleared');
    }
  };

  const clearAllData = () => {
    if (window.confirm('WARNING: This will delete ALL data including chats, memories, images, and documents from local storage. Continue?')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('intellichat_')) {
          localStorage.removeItem(key);
        }
      });
      toast.success('All local data cleared');
      // Give time for toast, then reload to reset app state completely
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto chat-scroll space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings className="text-primary-400" /> Settings
        </h1>
        <p className="text-gray-400">Customize your IntelliChat experience and manage your account.</p>
      </div>

      {/* Account Section */}
      <section className="glass rounded-xl overflow-hidden border border-white/5">
        <div className="bg-surface-800/80 px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <User size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Account Profile</h2>
        </div>
        
        <div className="p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative group">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0ea5e9&color=fff`} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full ring-4 ring-surface-700"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input type="text" className="input max-w-md" defaultValue={user?.name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input type="email" className="input max-w-md opacity-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <div className="px-3 py-1.5 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center gap-2">
                <Sparkles size={14} className="text-primary-400" />
                <span className="text-sm font-bold text-primary-300 uppercase tracking-wider">{user?.plan} PLAN</span>
              </div>
              <span className="text-sm text-gray-500">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Configuration */}
      <section className="glass rounded-xl overflow-hidden border border-white/5">
        <div className="bg-surface-800/80 px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Cpu size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">AI Configuration</h2>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Model Selection */}
          <div>
            <label className="block text-base font-medium text-gray-200 mb-3">Language Model</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MODELS.map(m => (
                <div 
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-1
                    ${model === m.id 
                      ? 'bg-primary-600/20 border-primary-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                      : 'bg-surface-800 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${model === m.id ? 'text-primary-300' : 'text-gray-200'}`}>
                      {m.label}
                    </span>
                    {model === m.id && <CheckCircle2 size={16} className="text-primary-400" />}
                  </div>
                  <span className="text-xs text-gray-500">{m.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-medium text-gray-200">Creativity (Temperature)</label>
              <span className="px-2 py-1 bg-surface-800 rounded text-sm text-primary-400 font-mono border border-white/5">
                {temp.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">Lower values produce focused answers. Higher values produce creative ones.</p>
            
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-800 accent-primary-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #0ea5e9 50%, #f97316 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance & Preferences */}
      <section className="glass rounded-xl overflow-hidden border border-white/5">
        <div className="bg-surface-800/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
            <div className="flex bg-surface-900 rounded-lg p-1 border border-white/5 w-fit">
              <button 
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${theme === 'dark' ? 'bg-surface-700 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <Moon size={16} /> Dark
              </button>
              <button 
                onClick={() => toast('Light mode coming soon!', { icon: '🌞' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${theme === 'light' ? 'bg-surface-700 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <Sun size={16} /> Light
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Language</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input pl-10 appearance-none"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="glass rounded-xl overflow-hidden border border-white/5">
        <div className="bg-surface-800/80 px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Server size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Data & Privacy</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-800/50 border border-white/5">
            <div>
              <h3 className="font-medium text-gray-200">Export Chat History</h3>
              <p className="text-sm text-gray-500">Download all your conversations as a JSON file.</p>
            </div>
            <button onClick={exportData} className="btn-secondary whitespace-nowrap">
              <Download size={16} /> Export JSON
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-800/50 border border-white/5">
            <div>
              <h3 className="font-medium text-gray-200">Clear Chat History</h3>
              <p className="text-sm text-gray-500">Delete all messages from your device.</p>
            </div>
            <button onClick={clearChatHistory} className="btn-secondary text-red-400 hover:bg-red-500/10 hover:border-red-500/20 whitespace-nowrap">
              <Trash2 size={16} /> Clear Chats
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <div>
              <h3 className="font-medium text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} /> Reset Application
              </h3>
              <p className="text-sm text-gray-500">Wipe all local data (chats, memories, images, docs) and reload.</p>
            </div>
            <button onClick={clearAllData} className="btn-danger whitespace-nowrap">
              Hard Reset
            </button>
          </div>
        </div>
      </section>

      {/* Save Button (Sticky Bottom) */}
      <div className="sticky bottom-0 pb-8 pt-4 bg-surface-900/80 backdrop-blur-md z-10 flex justify-end">
        <button onClick={handleSave} className="btn-primary shadow-lg shadow-primary-500/20 px-8 py-3 text-lg">
          Save Settings
        </button>
      </div>
      
      {/* Footer Info */}
      <div className="text-center pb-8 opacity-60">
        <p className="text-sm text-gray-400">IntelliChat AI v1.0.0</p>
        <p className="text-xs text-gray-500 mt-1">Built with React, Vite, Tailwind & Express</p>
      </div>
    </div>
  );
}
