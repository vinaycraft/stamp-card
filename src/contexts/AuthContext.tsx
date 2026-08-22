import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getCurrentUser, setCurrentUser, saveUser, getUserByEmail, generateId } from '../lib/storage';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple password check (in production, use proper hashing)
    const existingUser = getUserByEmail(email);
    if (existingUser && existingUser.phone === password) { // Using phone as password for simplicity
      setCurrentUser(existingUser);
      setUser(existingUser);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, _phone: string, password: string): Promise<boolean> => {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: generateId(),
      name,
      email,
      phone: password, // Storing password in phone field for simplicity
      role: 'customer',
      uniqueCode: generateId(), // Unique code for QR
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setCurrentUser(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

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
