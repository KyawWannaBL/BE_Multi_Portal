// Demo authentication hook for testing without Supabase constraints
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS, UserRole } from '@/lib/index';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin?: string;
  branch?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts database
const DEMO_ACCOUNTS = {
  'admin@britiumexpress.com': { name: 'System Administrator', role: 'SUPER_ADMIN' as UserRole },
  'ops@britiumexpress.com': { name: 'Operations Manager', role: 'OPERATIONS_ADMIN' as UserRole },
  'warehouse@britiumexpress.com': { name: 'Warehouse Manager', role: 'WAREHOUSE_MANAGER' as UserRole },
  'supervisor@britiumexpress.com': { name: 'Site Supervisor', role: 'SUPERVISOR' as UserRole },
  'rider@britiumexpress.com': { name: 'Delivery Rider', role: 'RIDER' as UserRole },
  'support@britiumexpress.com': { name: 'Customer Support', role: 'CUSTOMER_SERVICE' as UserRole },
  'finance@britiumexpress.com': { name: 'Finance Officer', role: 'FINANCE_STAFF' as UserRole },
  'hr@britiumexpress.com': { name: 'HR Manager', role: 'HR_ADMIN' as UserRole },
  'data@britiumexpress.com': { name: 'Data Entry Clerk', role: 'DATA_ENTRY' as UserRole },
  'merchant@britiumexpress.com': { name: 'Business Partner', role: 'MERCHANT' as UserRole },
  'customer@britiumexpress.com': { name: 'Regular Customer', role: 'CUSTOMER' as UserRole },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('demo-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setSession({ id: userData.id, email: userData.email });
      } catch (error) {
        localStorage.removeItem('demo-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if it's a demo account
      const demoUser = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
      
      if (!demoUser) {
        throw new Error('Account not found. Please use one of the demo accounts.');
      }

      if (password !== 'demo123') {
        throw new Error('Invalid password. Use "demo123" for all demo accounts.');
      }

      // Create user session
      const userData: User = {
        id: `demo-${email.split('@')[0]}`,
        email: email,
        name: demoUser.name,
        role: demoUser.role,
        lastLogin: new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      // Save to localStorage for persistence
      localStorage.setItem('demo-user', JSON.stringify(userData));
      
      setUser(userData);
      setSession({ id: userData.id, email: userData.email });
      
      // Navigate to dashboard
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear localStorage
      localStorage.removeItem('demo-user');
      
      setUser(null);
      setSession(null);
      
      // Navigate to login
      navigate(ROUTE_PATHS.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const isAuthenticated = !!user;

  const contextValue = {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}