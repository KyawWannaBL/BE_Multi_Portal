import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { postLoginPath } from "@/config/postLogin";

export default function ForcePasswordReset() {
  const navigate = useNavigate();
  const { user, role, changePassword, refresh } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const passwordError = useMemo(() => {
    if (!newPassword && !confirmPassword) return "";
    if (newPassword !== confirmPassword) return "Passwords don't match";
    if (newPassword.length < 8) return "Password must be at least 8 characters";
    return "";
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError("");

      try {
        const hasCode = window.location.search.includes("code=");
        if (hasCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) throw exchangeError;
          window.history.replaceState({}, document.title, "/reset-password");
        }
        await refresh();

        const { data } = await supabase.auth.getSession();
        const id = data.session?.user?.id ?? null;

        if (!id && !cancelled) {
          navigate("/login", { replace: true });
          return;
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, refresh]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      navigate(postLoginPath(role), { replace: true });
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = Boolean(user) && !loading && !passwordError && newPassword.length >= 8;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Set New Password</h2>

        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          {passwordError ? <div className="text-sm text-red-600">{passwordError}</div> : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
