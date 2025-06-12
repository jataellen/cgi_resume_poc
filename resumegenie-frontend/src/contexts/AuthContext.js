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
  const [authMode, setAuthMode] = useState('checking'); // 'supabase', 'mock', 'checking'

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      if (isSupabaseConfigured() && supabase) {
        try {
          console.log('Attempting to initialize Supabase authentication...');
          
          // Test Supabase connection
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Supabase session error:', error);
            throw error;
          }
          
          console.log('Supabase connected successfully');
          setAuthMode('supabase');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Supabase auth state changed:', _event);
            setSession(session);
            setUser(session?.user ?? null);
          });

          return () => subscription.unsubscribe();
          
        } catch (error) {
          console.error('Supabase initialization failed:', error);
          console.log('Falling back to mock authentication...');
          
          // Fall back to mock authentication
          setAuthMode('mock');
          const mockUser = { 
            id: 'dev-user', 
            email: 'dev@example.com',
            name: 'Development User (Supabase Failed)'
          };
          const mockSession = {
            access_token: 'mock-token',
            user: mockUser
          };
          
          setUser(mockUser);
          setSession(mockSession);
          setLoading(false);
        }
      } else {
        console.log('Supabase not configured, using mock authentication');
        
        // Use mock authentication as fallback
        setAuthMode('mock');
        const mockUser = { 
          id: 'dev-user', 
          email: 'dev@example.com',
          name: 'Development User (No Supabase)'
        };
        const mockSession = {
          access_token: 'mock-token',
          user: mockUser
        };
        
        setUser(mockUser);
        setSession(mockSession);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email, password) => {
    if (authMode === 'supabase' && supabase) {
      try {
        console.log('Attempting Supabase sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        console.log('Supabase sign in successful');
        return data;
        
      } catch (error) {
        console.error('Supabase sign in failed:', error);
        throw error; // Let the error propagate for real Supabase errors
      }
    } else {
      // Mock authentication fallback
      console.log('Using mock authentication for sign in');
      
      // For development, require specific credentials or allow any for testing
      if (email === 'demo@cgi.com' && password === 'resumegenie') {
        const mockUser = { 
          id: 'dev-user', 
          email: email,
          name: 'Demo User'
        };
        const mockSession = {
          access_token: 'mock-token',
          user: mockUser
        };
        
        setUser(mockUser);
        setSession(mockSession);
        return { user: mockUser };
      } else {
        throw new Error('Invalid credentials. Use demo@cgi.com / resumegenie for development');
      }
    }
  };

  const signUp = async (email, password) => {
    if (authMode === 'supabase' && supabase) {
      try {
        console.log('Attempting Supabase sign up...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        console.log('Supabase sign up successful');
        return data;
        
      } catch (error) {
        console.error('Supabase sign up failed:', error);
        throw error;
      }
    } else {
      // Mock sign up - just redirect to sign in
      return await signIn(email, password);
    }
  };

  const signOut = async () => {
    if (authMode === 'supabase' && supabase) {
      try {
        console.log('Attempting Supabase sign out...');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Supabase sign out successful');
      } catch (error) {
        console.error('Supabase sign out failed:', error);
        // Even if Supabase sign out fails, clear local state
        setUser(null);
        setSession(null);
      }
    } else {
      // Mock sign out
      console.log('Mock sign out');
      setUser(null);
      setSession(null);
    }
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
    authMode, // Expose which auth mode we're using
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};