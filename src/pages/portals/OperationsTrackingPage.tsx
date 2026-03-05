// @ts-nocheck
import React, { useMemo } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Navigation } from "lucide-react";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";
import { metersToKm, secondsToMin, fmtTime } from "@/lib/geo";

export default function OperationsTrackingPage() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);

  const { rows, error } = useLiveCourierLocations({ enabled: true });

  return (
    <PortalShell
      title={t === "en" ? "Live Tracking" : "Live Tracking"}
      links={[
        { to: "/portal/operations", label: t === "en" ? "Operations" : "Operations" },
        { to: "/portal/operations/manual", label: t === "en" ? "QR Manual" : "QR လမ်းညွှန်" },
      ]}
    >
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">{t === "en" ? "Couriers (Real-time)" : "Courier များ (Real-time)"}</div>
                <div className="text-xs opacity-70">
                  {t === "en" ? "Remaining distance/ETA updates from rider app" : "Rider app မှ remaining distance/ETA ပို့သည်"}
                </div>
              </div>
            </div>
            <Badge variant="outline">{rows?.length ?? 0}</Badge>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {(rows || []).slice(0, 12).map((r) => (
            <Card key={r.user_id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs opacity-80">{r.user_id}</div>
                  <div className="text-[10px] opacity-70">{new Date(r.updated_at).toLocaleString()}</div>
                </div>
                <div className="text-xs opacity-80">
                  {t === "en" ? "Remaining" : "ကျန်"}: <span className="font-semibold">{metersToKm(r.remaining_meters)}</span>
                  {" • "}
                  {t === "en" ? "ETA" : "ETA"}: <span className="font-semibold">{secondsToMin(r.eta_seconds)}</span>
                </div>
                <div className="text-xs opacity-70">
                  {t === "en" ? "Next stop" : "နောက်တစ်မှတ်"}: {r.next_stop_index ?? "-"}
                  {" • "}
                  {t === "en" ? "Arrive" : "ရောက်မည်"}: {fmtTime(r.next_stop_eta)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <MapboxNavigationWorkspace mode="ops" title={t === "en" ? "Map View" : "မြေပုံ"} />
      </div>
    </PortalShell>
  );
}
