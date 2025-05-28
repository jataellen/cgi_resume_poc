import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // If Supabase is not configured, use mock user for development
      setUser({ id: 'dev-user', email: 'dev@example.com' });
      setLoading(false);
      return;
    }

    // This code will only run if Supabase is properly configured
    // For now, it won't run since we're mocking Supabase
    if (supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    
    // Mock authentication for demo - you can replace this with real auth
    if (email === 'demo@cgi.com' && password === 'demo123') {
      const mockUser = { id: 'demo-user', email: 'demo@cgi.com' };
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'mock-token' });
      return { user: mockUser };
    } else {
      throw new Error('Invalid email or password. Try demo@cgi.com / demo123');
    }
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setSession(null);
      return;
    }
    
    // Handle both mock and real sign out
    if (user?.id === 'demo-user' || user?.id === 'dev-user') {
      setUser(null);
      setSession(null);
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getAuthToken = () => {
    return session?.access_token || null;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthToken,
    isAuthenticated: !!user,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};