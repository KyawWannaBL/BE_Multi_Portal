import React, { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

type ApiContextType = {
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
};

const ApiContext = createContext<ApiContextType | null>(null);

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
  // Centralized fetch wrapper to automatically attach tokens and intercept 401/403 errors
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers = new Headers(options.headers);
    if (session?.access_token) {
      headers.set('Authorization', \`Bearer \${session.access_token}\`);
    }

    const response = await fetch(endpoint, { ...options, headers });

    // Global Error Interceptor
    if (response.status === 401) {
      console.warn('[API FAULT] Unauthorized. Purging session...');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    
    if (response.status === 403) {
      console.warn('[API FAULT] Forbidden. Check Clearance Level.');
    }

    return response;
  };

  return (
    <ApiContext.Provider value={{ apiFetch }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error("useApi must be used within an ApiClientProvider");
  return context;
};
