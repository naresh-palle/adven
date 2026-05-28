import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: fetch role from profiles table
  const fetchProfile = async (supabaseUser) => {
    if (!supabaseUser) return null;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: data?.full_name || supabaseUser.email,
      role: data?.role || 'customer',
    };
  };

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    const profile = await fetchProfile(data.user);
    setUser(profile);
    return { success: true };
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { success: false, message: error.message };

    // Insert profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        email,
        role: 'customer',
      });
      const profile = await fetchProfile(data.user);
      setUser(profile);
    }
    return { success: true };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  // Expose a token-like accessor for legacy code (returns Supabase access token)
  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, isAdmin, getToken, token: null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
