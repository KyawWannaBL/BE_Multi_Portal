import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Shield, User as UserIcon, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "sonner";

/**
 * Settings (Enterprise)
 * Rewritten with Named Export to fix Vite/Rollup build errors.
 */
export function Settings() {
  const { user, role, branch_id } = useAuth();
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const t = (en: string, my: string) => (language === "my" ? my : en);

  const onSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(t("Saved", "သိမ်းဆည်းပြီးပါပြီ"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Settings", "ဆက်တင်များ")}</h1>
          <p className="text-sm text-muted-foreground">{t("Session & preferences", "Session နှင့် preference များ")}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> {t("Account", "အကောင့်")}
            </CardTitle>
            <CardDescription>{t("Current signed-in user", "လက်ရှိ ဝင်ထားသော အသုံးပြုသူ")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly className="bg-muted/50" />
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Role", "အခန်းကဏ္ဍ")}: <span className="font-semibold text-foreground uppercase">{String(role ?? "-")}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Branch", "ဘရားခ်")}: <span className="font-semibold text-foreground">{String(branch_id ?? "-")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> {t("Notifications", "အကြောင်းကြားချက်")}
            </CardTitle>
            <CardDescription>{t("Basic preferences", "အခြေခံ preference များ")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                {t("Email notifications", "အီးမေးလ် အကြောင်းကြားချက်")}
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <Button onClick={onSave} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? t("Saving...", "သိမ်းနေသည်...") : t("Save changes", "ပြောင်းလဲမှုများ သိမ်းရန်")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}