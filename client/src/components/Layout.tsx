import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare, LayoutDashboard, FileText, Image, Brain,
  Settings, LogOut, Plus, Menu, X, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Chat } from '../types';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/images', icon: Image, label: 'Image Gen' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadRecentChats();
  }, [location.pathname]);

  const loadRecentChats = async () => {
    try {
      const chats = await api.getChats();
      setRecentChats(chats.slice(0, 5));
    } catch {
      // Ignore
    }
  };

  const handleNewChat = async () => {
    try {
      const chat = await api.createChat('general');
      navigate(`/chat/${chat._id}`);
    } catch {
      toast.error('Failed to create chat');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300 flex flex-col border-r border-white/5 bg-surface-800/50 backdrop-blur-md`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-white text-sm tracking-wide">IntelliChat AI</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto btn-ghost p-1.5 rounded-lg"
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-white/5">
          <button
            onClick={handleNewChat}
            id="new-chat-btn"
            className={`btn-primary w-full justify-center ${!sidebarOpen ? 'px-2' : ''}`}
          >
            <Plus size={16} />
            {sidebarOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Recent Chats */}
        {sidebarOpen && recentChats.length > 0 && (
          <div className="px-4 py-2 border-t border-white/5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Chats</h3>
            <div className="space-y-1">
              {recentChats.map(chat => (
                <div 
                  key={chat._id}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  className="text-sm text-gray-400 hover:text-gray-200 truncate cursor-pointer py-1 hover:bg-surface-700/30 px-2 rounded transition-colors"
                >
                  {chat.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-white/5">
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0ea5e9&color=fff`}
              alt={user?.name}
              className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-primary-500/30"
            />
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
                  <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/20">
                    {user?.plan}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                  title="Logout"
                  id="logout-btn"
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
