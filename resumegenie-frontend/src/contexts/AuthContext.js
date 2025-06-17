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
  const [authMode, setAuthMode] = useState('supabase'); // Always use Supabase

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      if (!isSupabaseConfigured() || !supabase) {
        console.error('Supabase is not configured!');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Attempting to initialize Supabase authentication...');
        
        // Test Supabase connection
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
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
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }
    
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
      throw error;
    }
  };

  const signUp = async (email, password) => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }
    
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
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }
    
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
    authMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};