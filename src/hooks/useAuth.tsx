import * as React from "react";

export type AuthSnapshot = {
  userId: string | null;
  role: string | null;
  permissions: string[];
  mustChangePassword: boolean;
  isAuthenticated: boolean;
};

export type AuthContextValue = AuthSnapshot & {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function defaultValue(): AuthContextValue {
  const permissions: string[] = [];
  return {
    userId: null,
    role: null,
    permissions,
    mustChangePassword: false,
    isAuthenticated: false,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
  };
}

export function useAuth(): AuthContextValue {
  return React.useContext(AuthContext) ?? defaultValue();
}

export default useAuth;
