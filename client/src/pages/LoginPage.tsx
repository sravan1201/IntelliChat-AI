import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/chat');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@intellichat.ai', 'demo1234');
      toast.success('Logged in as demo user!');
      navigate('/chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-900">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-surface-800 to-surface-900" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">IntelliChat AI</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Your AI assistant<br />
            <span className="gradient-text">that actually remembers</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🧠', title: 'Long-Term Memory', desc: 'Remembers your preferences and past conversations' },
              { icon: '📄', title: 'Document Understanding', desc: 'Upload PDFs and ask questions about them' },
              { icon: '🎙️', title: 'Voice Assistant', desc: 'Speak naturally, get spoken responses' },
              { icon: '🤖', title: 'AI Personas', desc: 'Teacher, Debugger, Interviewer, Mentor' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm">{f.title}</p>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-gray-500 text-sm">
          Trusted by 10,000+ developers worldwide
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center gap-3 lg:hidden mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">IntelliChat AI</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to continue your conversations</p>
          </div>

          <div className="glass rounded-2xl p-8 shadow-2xl animate-fadeIn">
            <button
              id="google-login-btn"
              className="btn-secondary w-full justify-center mb-6 py-3"
              onClick={() => toast.success('Connect Google OAuth to your backend!')}
            >
              Continue with Google
            </button>

            <button
              id="demo-login-btn"
              className="btn-secondary w-full justify-center mb-6 py-2.5 border-primary-500/30 text-primary-300"
              onClick={demoLogin}
            >
              ⚡ Try Demo Account
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="email-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="password-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Your password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="input pl-10 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
