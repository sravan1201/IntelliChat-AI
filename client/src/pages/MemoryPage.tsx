import { useState, useEffect, useMemo } from 'react';
import { 
  Brain, Trash2, Search, Filter, ShieldAlert, Heart, Target, Star, AlertTriangle, MessageSquare, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Memory } from '../types';
import toast from 'react-hot-toast';

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (error) {
      toast.error('Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories(prev => prev.filter(m => m._id !== id));
      toast.success('Memory deleted');
    } catch (error) {
      toast.error('Failed to delete memory');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL AI memories? This cannot be undone and will reset the AI\'s personalization.')) return;
    
    try {
      // Assuming api.clearMemories exists or we map delete over all
      for (const m of memories) {
        await api.deleteMemory(m._id);
      }
      setMemories([]);
      toast.success('All memories cleared');
    } catch (error) {
      toast.error('Failed to clear memories');
    }
  };

  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || memory.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [memories, searchQuery, activeFilter]);

  const getCategoryStyles = (category: string) => {
    switch(category) {
      case 'preference': return { icon: Heart, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
      case 'goal': return { icon: Target, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' };
      case 'skill': return { icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'weakness': return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
      default: return { icon: MessageSquare, color: 'text-gray-400', bg: 'bg-surface-600 border-white/10' };
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto chat-scroll space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center">
            <Brain size={24} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              AI Memory 
              <span className="badge bg-surface-800 text-gray-300 border border-white/10 px-3 py-1 text-sm">
                {memories.length} memories
              </span>
            </h1>
            <p className="text-gray-400">What the AI remembers about you to personalize responses.</p>
          </div>
        </div>
        
        {memories.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="btn-danger whitespace-nowrap"
          >
            <ShieldAlert size={16} /> Clear All Data
          </button>
        )}
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between glass p-4 rounded-xl">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2 text-sm font-medium text-gray-400">
            <Filter size={16} /> Filter:
          </div>
          {['all', 'preference', 'goal', 'skill', 'weakness'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeFilter === filter 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700 border border-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 stat-card shimmer rounded-xl border-none"></div>
          ))}
        </div>
      ) : filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMemories.map(memory => {
            const styles = getCategoryStyles(memory.category);
            const Icon = styles.icon;
            
            return (
              <div key={memory._id} className="glass rounded-xl p-6 group flex flex-col border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${styles.bg} ${styles.color}`}>
                    <Icon size={12} /> {memory.category}
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(memory._id)}
                    className="p-1.5 rounded-md text-gray-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete memory"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <p className="text-gray-100 font-medium text-lg mb-6 flex-1 leading-snug">
                  "{memory.content}"
                </p>
                
                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Importance</span>
                    <span>{memory.importance}/10</span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-surface-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r from-gray-600 via-primary-500 to-pink-500`}
                      style={{ width: `${(memory.importance / 10) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {memory.source}</span>
                    <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-surface-900 rounded-full flex items-center justify-center mb-6">
            <Brain size={48} className="text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No memories found</h2>
          <p className="text-gray-400 max-w-md">
            {searchQuery || activeFilter !== 'all' 
              ? "Try adjusting your search or filter criteria to find what you're looking for." 
              : "As you chat, the AI will learn about you and remember important details to provide highly personalized responses."}
          </p>
        </div>
      )}

      {/* How it works info */}
      <div className="glass rounded-xl p-6 mt-12 bg-gradient-to-r from-surface-800 to-primary-900/10 border-primary-500/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-primary-400" /> How AI Memory Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <p className="font-medium text-gray-200 mb-1">Natural Conversation</p>
              <p className="text-sm text-gray-400">Just chat normally. The AI automatically identifies important facts, preferences, and goals.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <p className="font-medium text-gray-200 mb-1">Vector Storage</p>
              <p className="text-sm text-gray-400">Memories are securely stored and categorized based on importance and relevance.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <p className="font-medium text-gray-200 mb-1">Personalized Answers</p>
              <p className="text-sm text-gray-400">Future chats automatically retrieve relevant memories for highly customized responses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
