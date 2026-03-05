import { useState, useEffect } from 'react';

// British Express L5 - Unified Auth Hook
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('btx_session');
    if (session) {
      setIsAuthenticated(true);
      setUser(JSON.parse(session));
    }
  }, []);

  const login = (email: string, role: string) => {
    const sessionData = { email, role, loginTime: new Date() };
    localStorage.setItem('btx_session', JSON.stringify(sessionData));
    setIsAuthenticated(true);
    setUser(sessionData);
  };

  const logout = () => {
    localStorage.removeItem('btx_session');
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
}
