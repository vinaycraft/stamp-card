import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              email: userData.user.email,
              name: userData.user.user_metadata?.name || 'User',
              phone: userData.user.user_metadata?.phone || '',
              unique_code: 'USR-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
              role: userData.user.user_metadata?.role || 'customer',
            });
          
          if (!insertError) {
            // Retry fetch after insert
            return fetchUserProfile(userId);
          }
        }
      }
      return;
    }

    if (data) {
      setUser({
        id: data.id,
        name: data.name || 'User',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'customer',
        uniqueCode: data.unique_code,
        createdAt: data.created_at,
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    if (data.user) {
      await fetchUserProfile(data.user.id);
      return true;
    }

    return false;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: 'customer',
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Registration error:', error.message);
      throw new Error(error.message);
    }

    if (data.user) {
      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchUserProfile(data.user.id);
      return true;
    }

    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
