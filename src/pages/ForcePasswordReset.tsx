import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { strongPassword } from "@/lib/password";
import { getMyProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import LanguageToggle from "@/components/LanguageToggle";

export default function ForcePasswordReset() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function update() {
    setError(null);
    setOk(null);

    if (pw !== pw2) return setError(t("auth.passwordMismatch"));
    if (!strongPassword.test(pw)) return setError(t("auth.weakPassword"));

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    const { userId } = await getMyProfile();
    if (userId) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);
    }

    setLoading(false);
    setOk(t("password.updated"));
    nav("/"); // or nav to role default route
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 text-white">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{t("password.forceTitle")}</h1>
            <LanguageToggle />
          </div>

          <p className="text-sm text-white/70">{t("password.forceDesc")}</p>

          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t("password.newPassword")} className="bg-black/40 border-white/15" />
          <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder={t("password.confirmNewPassword")} className="bg-black/40 border-white/15" />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {ok && <p className="text-sm text-green-400">{ok}</p>}

          <Button disabled={loading} onClick={update} className="w-full bg-blue-600 hover:bg-blue-700">
            {t("password.update")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}