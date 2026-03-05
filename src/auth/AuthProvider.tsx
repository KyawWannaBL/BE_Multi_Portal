import * as React from "react";
import { supabase } from "@/supabaseClient";

type AuthUser = {
  id: string;
  email?: string;
};

type AuthState = {
  user: AuthUser | null;
  role: string | null;
  mustChangePassword: boolean;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signInWithOAuth: (provider: string, redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  refresh: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function extractRole(session: any): string | null {
  const u = session?.user;
  return (
    u?.app_metadata?.role ??
    u?.user_metadata?.role ??
    null
  );
}

function extractMustChangePassword(session: any): boolean {
  const u = session?.user;
  return Boolean(
    u?.app_metadata?.must_change_password ??
    u?.user_metadata?.must_change_password ??
    false
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    role: null,
    mustChangePassword: false,
    loading: true,
  });

  const applySession = React.useCallback((session: any) => {
    if (!session?.user) {
      setState({ user: null, role: null, mustChangePassword: false, loading: false });
      return;
    }
    setState({
      user: { id: session.user.id, email: session.user.email },
      role: extractRole(session),
      mustChangePassword: extractMustChangePassword(session),
      loading: false,
    });
  }, []);

  const refresh = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const { data } = await supabase.auth.getSession();
    applySession(data?.session);
  }, [applySession]);

  React.useEffect(() => {
    // initial load
    void refresh();

    // subscribe to changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [applySession, refresh]);

  const signInWithOAuth = React.useCallback(async (provider: string, redirectTo?: string) => {
    // For enterprise SSO, configure provider in Supabase (OIDC/SAML/OAuth) and call this.
    await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: redirectTo ? { redirectTo } : undefined,
    });
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updatePassword = React.useCallback(async (newPassword: string) => {
    // NOTE: App metadata must_change_password should be cleared server-side (Edge Function / Admin API).
    // Client can clear user_metadata as a UI hint:
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });

    if (error) return { ok: false, message: error.message };

    // refresh state
    await refresh();
    return { ok: true };
  }, [refresh]);

  const value: AuthContextValue = {
    ...state,
    signInWithOAuth,
    signOut,
    updatePassword,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
