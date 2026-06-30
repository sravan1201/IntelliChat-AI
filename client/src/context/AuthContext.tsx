import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('intellichat_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('intellichat_token');
      if (savedToken) {
        try {
          const userData = await api.getMe(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('intellichat_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { token: newToken, user: userData } = await api.login(email, password);
    localStorage.setItem('intellichat_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token: newToken, user: userData } = await api.signup(name, email, password);
    localStorage.setItem('intellichat_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('intellichat_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
