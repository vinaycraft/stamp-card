import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getUserByEmail, saveUser, generateId } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('stampcard_current_user');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.phone === password) {
      localStorage.setItem('stampcard_current_user', JSON.stringify(existingUser));
      setUser(existingUser);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, _phone: string, password: string): Promise<boolean> => {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: generateId(),
      name,
      email,
      phone: password,
      role: 'customer',
      uniqueCode: 'USR-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);
    localStorage.setItem('stampcard_current_user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('stampcard_current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
