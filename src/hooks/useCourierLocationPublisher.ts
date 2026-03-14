import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { isMissingRelation } from "@/services/supabaseHelpers";

/**
 * EN: Publish the current courier location to Supabase in real-time.
 * MY: Courier ရဲ့ လက်ရှိတည်နေရာကို Supabase သို့ real-time အဖြစ် ပို့မည်။
 *
 * Requires a table:
 *   public.courier_locations(user_id uuid PK, lat float8, lng float8, heading float4, speed float4, accuracy float4, updated_at timestamptz)
 */
export function useCourierLocationPublisher(input: { enabled: boolean; minIntervalMs?: number; minMoveMeters?: number }) {
  const { user } = useAuth();
  const enabled = input.enabled;
  const minIntervalMs = input.minIntervalMs ?? 3000;
  const minMoveMeters = input.minMoveMeters ?? 10;

  const [error, setError] = React.useState<string | null>(null);
  const [last, setLast] = React.useState<{ lat: number; lng: number; updatedAt: string } | null>(null);

  const lastSentRef = React.useRef<{ t: number; lat: number; lng: number } | null>(null);
  const watchIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    if (!user?.id) {
      setError("Not authenticated.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported.");
      return;
    }

    const onPos = async (pos: GeolocationPosition) => {
      try {
        const now = Date.now();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const lastSent = lastSentRef.current;
        if (lastSent) {
          const dt = now - lastSent.t;
          const dist = haversineMeters(lastSent.lat, lastSent.lng, lat, lng);
          if (dt < minIntervalMs && dist < minMoveMeters) return;
        }

        lastSentRef.current = { t: now, lat, lng };

        const payload = {
          user_id: user.id,
          lat,
          lng,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
          accuracy: pos.coords.accuracy ?? null,
          updated_at: new Date().toISOString(),
        };

        const res = await supabase.from("courier_locations").upsert(payload, { onConflict: "user_id" });

        if (res.error) {
          if (isMissingRelation(res.error)) {
            setError("Missing table: courier_locations (apply SQL migration).");
          } else {
            setError(res.error.message);
          }
          return;
        }

        setError(null);
        setLast({ lat, lng, updatedAt: payload.updated_at });
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    };

    const onErr = (err: GeolocationPositionError) => setError(err.message);

    const id = navigator.geolocation.watchPosition(onPos, onErr, {
      enableHighAccuracy: true,
      maximumAge: 1500,
      timeout: 15000,
    });

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [enabled, user?.id, minIntervalMs, minMoveMeters]);

  return { error, last };
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
