import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

const POLICY_KEY = "INTL_DELIVERY_STANDARD";
const POLICY_VERSION = "v1.0";

export default function InternationalPolicyCheckbox({
  userId,
  onChange,
}: {
  userId: string;
  onChange: (accepted: boolean) => void;
}) {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setError(null);
    setAccepted(next);
    onChange(next);

    if (next) {
      const { error } = await supabase.from("policy_acceptance").insert({
        user_id: userId,
        policy_key: POLICY_KEY,
        policy_version: POLICY_VERSION,
        accepted: true,
      });
      if (error) setError(error.message);
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-1"
        />
        <span>{t("policy.accept")}</span>
      </label>

      <p className="text-xs text-white/60">{t("policy.statement")}</p>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}