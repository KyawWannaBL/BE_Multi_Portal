import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { postLoginPath } from "@/config/postLogin";
import LanguageSelect from "@/components/LanguageSelect";

export default function Login() {
  const { login, user, role, mustChangePassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    navigate(mustChangePassword ? "/force-password-reset" : postLoginPath(role), { replace: true });
  }, [user, mustChangePassword, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      navigate(res.mustChangePassword ? "/force-password-reset" : postLoginPath(res.role), { replace: true });
    } catch (err: any) {
      const msg = err?.message ?? "Access Denied. Please check credentials.";
      // Supabase common failure: invalid API key / auth config
      if (/invalid api key/i.test(msg)) {
        setError(
          "Invalid API key. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY if legacy keys are enabled)."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-obsidian p-6">
      <div className="w-full max-w-md p-10 luxury-glass rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-luxury-cream text-center flex-1">Secure Terminal</h2>
          <LanguageSelect />
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Identity (Email)"
            className="w-full p-4 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-luxury-gold/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Security Key"
            className="w-full p-4 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-luxury-gold/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-luxury-gold hover:bg-amber-500 text-luxury-obsidian font-bold rounded-2xl"
          >
            {loading ? "Verifying..." : "Initiate Session"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-white/70">
          <Link to="/forgot-password" className="hover:text-white">
            Forgot password?
          </Link>
          <Link to="/signup" className="hover:text-white">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
