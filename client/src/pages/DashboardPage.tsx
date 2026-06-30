import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, MessagesSquare, Coins, FileText, Image,
  Plus, TrendingUp, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { PERSONAS } from '../constants';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
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

  if (isLoading || !stats) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card h-32 shimmer rounded-xl border-none"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 stat-card shimmer rounded-xl border-none"></div>
          <div className="h-80 stat-card shimmer rounded-xl border-none"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Chats', value: stats.totalChats, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Messages', value: stats.totalMessages, icon: MessagesSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Tokens Used', value: stats.totalTokens, icon: Coins, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Documents', value: stats.totalFiles, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Images', value: stats.totalImages, icon: Image, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' }
  ];

  const maxActivity = Math.max(...stats.activityData.map(d => d.messages), 1);

  return (
    <div className="p-8 h-full overflow-y-auto chat-scroll space-y-8 animate-fadeIn">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
          <p className="text-gray-400">Welcome back to IntelliChat AI.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleNewChat} className="btn-primary" id="dash-new-chat-btn">
            <Plus size={16} /> New Chat
          </button>
          <button onClick={() => navigate('/documents')} className="btn-secondary" id="dash-upload-doc-btn">
            <FileText size={16} /> Upload Doc
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card glass-hover transition-transform hover:-translate-y-1 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <TrendingUp size={12} />
                <span>+12%</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="glass rounded-xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Weekly Activity</h2>
            <span className="text-xs text-gray-400 bg-surface-700 px-2.5 py-1 rounded-md border border-white/5">Messages</span>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-4 pt-4 border-t border-white/5">
            {stats.activityData.map((data, i) => {
              const height = `${(data.messages / maxActivity) * 100}%`;
              return (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                  <div className="relative w-full flex justify-center h-full items-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-surface-900 border border-white/10 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                      {data.messages} msgs
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-primary-600 to-cyan-400 rounded-t-md opacity-70 group-hover:opacity-100 transition-all duration-300"
                      style={{ height: height === '0%' ? '4px' : height }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{data.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Persona Usage */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Persona Usage</h2>
          
          {stats.personaBreakdown.length > 0 ? (
            <div className="space-y-5">
              {stats.personaBreakdown.map((usage, i) => {
                const persona = PERSONAS.find(p => p.id === usage.persona) || PERSONAS[0];
                const total = stats.personaBreakdown.reduce((acc, curr) => acc + curr.count, 0);
                const percent = Math.round((usage.count / (total || 1)) * 100);
                
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{persona.icon}</span>
                        <span className="text-gray-200 font-medium">{persona.label}</span>
                      </div>
                      <span className="text-gray-400">{percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r from-${persona.color.split('-')[1]}-600 to-${persona.color.split('-')[1]}-400`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
              <Sparkles size={32} className="text-gray-500 mb-3" />
              <p className="text-sm text-gray-400">No persona data yet.<br/>Start chatting to see stats!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Conversations</h2>
          <button onClick={() => navigate('/chat')} className="text-sm text-primary-400 hover:text-primary-300">View All</button>
        </div>
        
        {stats.recentChats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-900/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Persona</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentChats.map((chat) => {
                  const persona = PERSONAS.find(p => p.id === chat.persona) || PERSONAS[0];
                  return (
                    <tr 
                      key={chat._id} 
                      onClick={() => navigate(`/chat/${chat._id}`)}
                      className="hover:bg-surface-700/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center border border-white/5 group-hover:border-primary-500/30 transition-colors">
                            <MessageSquare size={14} className="text-gray-400 group-hover:text-primary-400" />
                          </div>
                          <span className="font-medium text-gray-200">{chat.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${persona.bgColor} ${persona.color}`}>
                          <span>{persona.icon}</span> {persona.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(chat.updatedAt).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>No recent conversations found.</p>
            <button onClick={handleNewChat} className="btn-primary mx-auto mt-4">
              <Plus size={16} /> Start your first chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
