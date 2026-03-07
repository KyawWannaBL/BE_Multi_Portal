import React, { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";
import { ExecutionShell } from "@/components/layout/ExecutionShell";

export default function ExecutionNavigationPage() {
  const { lang } = useLanguage();
  const { role } = useAuth();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const normalizedRole = (role ?? "").trim().toUpperCase();
  const canShare = ["RIDER", "DRIVER", "HELPER"].includes(normalizedRole);
  const [share, setShare] = useState(true);

  return (
    <ExecutionShell title={t("Navigation", "လမ်းညွှန်")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">
                  {t("Live Navigation & Way Planning", "Live လမ်းညွှန် + လမ်းကြောင်းစီမံ")}
                </div>
                <div className="text-xs opacity-70">
                  {t("ETA + Remaining + Geofence arrival events", "ETA + Remaining + Geofence arrival events")}
                </div>
              </div>
            </div>

            {canShare ? (
              <div className="flex items-center gap-3">
                <div className="text-xs opacity-80">{t("Share location", "တည်နေရာ ပို့မည်")}</div>
                <Switch checked={share} onCheckedChange={setShare} />
                <Badge variant="outline">{share ? t("ON", "ဖွင့်") : t("OFF", "ပိတ်")}</Badge>
              </div>
            ) : (
              <Badge variant="outline">{t("Read-only", "Read-only")}</Badge>
            )}
          </CardContent>
        </Card>

        <MapboxNavigationWorkspace mode="rider" title={t("Rider Navigation", "Rider Navigation")} shareLocation={share && canShare} />
      </div>
    </ExecutionShell>
  );
}
