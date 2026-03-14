import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: string;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  // 🚨 CRITICAL FIX: Start loading as TRUE so the app waits for Supabase
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfileAndSetUser = async (sessionUser: any) => {
    try {
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();
      
      if (error) throw error;
      
      setUser({ ...sessionUser, ...prof });
    } catch (error) {
      // Fallback so the user isn't stuck if profile fetch fails
      setUser({ ...sessionUser, role: "GUEST" });
    } finally {
      setLoading(false); // Only open the gates when data is fully loaded
    }
  };

  const refresh = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfileAndSetUser(session.user);
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mounted) {
        fetchProfileAndSetUser(session.user);
      } else if (mounted) {
        setUser(null);
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes (e.g., MFA verification success)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && mounted) {
        fetchProfileAndSetUser(session.user);
      } else if (mounted) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || user?.app_role || "GUEST",
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};