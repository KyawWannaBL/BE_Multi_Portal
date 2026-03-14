import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import LanguageSelect from "@/components/LanguageSelect";

export default function SignUp() {
  const { SignUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await SignUp(email, password, fullName);
      setSuccess("Account created. Please login.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "SignUp failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-obsidian p-6">
      <div className="w-full max-w-md p-10 luxury-glass rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-luxury-cream text-center flex-1">Create Account</h2>
          <LanguageSelect />
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 text-emerald-300 text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Full name"
            className="w-full p-4 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-luxury-gold/50"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-luxury-gold/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            className="w-full p-4 rounded-2xl bg-white/5 text-white border border-white/10 outline-none focus:border-luxury-gold/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-luxury-gold hover:bg-amber-500 text-luxury-obsidian font-bold rounded-2xl"
          >
            {loading ? "Creating..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 text-xs text-white/70 text-center">
          <Link to="/login" className="hover:text-white">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
