import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { strongPassword } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import LanguageToggle from "@/components/LanguageToggle";

export default function SignUpCustomer() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);

    if (pw !== pw2) return setError(t("auth.passwordMismatch"));
    if (!strongPassword.test(pw)) return setError(t("auth.weakPassword"));

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        data: { name, phone, role: "CUSTOMER" },
      },
    });

    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        role: "CUSTOMER",
        must_change_password: false,
      });
    }

    setLoading(false);
    nav("/kyc");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 text-white">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{t("auth.signupCustomer")}</h1>
            <LanguageToggle />
          </div>

          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth.name")} className="bg-black/40 border-white/15" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("auth.phone")} className="bg-black/40 border-white/15" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email")} className="bg-black/40 border-white/15" />

          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t("auth.password")} className="bg-black/40 border-white/15" />
          <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder={t("auth.confirmPassword")} className="bg-black/40 border-white/15" />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button disabled={loading} onClick={submit} className="w-full bg-blue-600 hover:bg-blue-700">
            {t("auth.createAccount")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}