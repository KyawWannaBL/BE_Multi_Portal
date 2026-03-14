// @ts-nocheck
import React, { useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";

export default function ExecutionNavigationPage() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);
  const { role } = useAuth();

  const normalizedRole = (role ?? "").trim().toUpperCase();
  const canShare = ["RIDER", "DRIVER", "HELPER"].includes(normalizedRole);

  const [share, setShare] = useState(true);

  return (
    <PortalShell
      title={t === "en" ? "Navigation" : "လမ်းညွှန်"}
      links={[
        { to: "/portal/execution", label: t === "en" ? "Execution" : "Execution" },
        { to: "/portal/execution/manual", label: t === "en" ? "QR Manual" : "QR လမ်းညွှန်" },
      ]}
    >
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">{t === "en" ? "Live Navigation & Route Planning" : "Live လမ်းညွှန် + လမ်းကြောင်းစီမံ"}</div>
                <div className="text-xs opacity-70">{t === "en" ? "ETA + Remaining + Geofence arrival events" : "ETA + Remaining + Geofence arrival events"}</div>
              </div>
            </div>

            {canShare ? (
              <div className="flex items-center gap-3">
                <div className="text-xs opacity-80">{t === "en" ? "Share location" : "တည်နေရာ ပို့မည်"}</div>
                <Switch checked={share} onCheckedChange={setShare} />
                <Badge variant="outline">{share ? (t === "en" ? "ON" : "ဖွင့်") : (t === "en" ? "OFF" : "ပိတ်")}</Badge>
              </div>
            ) : (
              <Badge variant="outline">{t === "en" ? "Read-only" : "ကြည့်ရန်သာ"}</Badge>
            )}
          </CardContent>
        </Card>

        <MapboxNavigationWorkspace mode="rider" shareLocation={canShare && share} />
      </div>
    </PortalShell>
  );
}
