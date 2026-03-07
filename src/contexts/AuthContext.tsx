import React, { createContext, useContext, useState } from "react";
const AuthContext = createContext<any>(null);
export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const refresh = async () => {};
  const logout = async () => { setUser(null); };
  return <AuthContext.Provider value={{ user, loading, refresh, logout, isAuthenticated: !!user, role: user?.role || "GUEST" }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
