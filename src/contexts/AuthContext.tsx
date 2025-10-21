import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser } from '../utils/supabaseClient';
import type { SalesRep } from '../types';
import { fetchSalesRepById } from '../utils/api';

interface AuthContextType {
  user: SalesRep | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SalesRep | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    getCurrentUser().then(({ user: authUser }) => {
      if (authUser) {
        fetchSalesRepById(authUser.id).then(salesRep => {
          setUser(salesRep);
          setLoading(false);
        }).catch((err) => {
          console.error('Error fetching sales rep:', err);
          // User is authenticated but not in sales_reps table
          alert('Your account is not set up in the system. Please contact an administrator.');
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const salesRep = await fetchSalesRepById(session.user.id);
          setUser(salesRep);
        } catch (err) {
          console.error('Error fetching sales rep:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && !error) {
      const salesRep = await fetchSalesRepById(data.user.id);
      setUser(salesRep);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
