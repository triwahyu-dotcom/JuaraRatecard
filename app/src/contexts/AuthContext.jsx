import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Initial Session
    auth.getSession().then(({ data: { session } }) => {
      handleUser(session?.user ?? null);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      handleUser(session?.user ?? null);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleUser = async (currUser) => {
    setUser(currUser);
    if (currUser) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currUser.id)
          .single();
        
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('[AuthContext] Profile fetch error:', err.message);
        setProfile({ role: 'viewer' }); // Fallback
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  const isAdmin = profile?.role === 'admin';
  const isEditor = ['admin', 'editor'].includes(profile?.role);
  const isViewer = profile?.role === 'viewer';

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isEditor,
    isViewer,
    signOut: () => auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
