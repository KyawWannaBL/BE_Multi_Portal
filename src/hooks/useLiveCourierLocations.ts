import * as React from "react";
import { supabase } from "@/lib/supabase";
import { isMissingRelation } from "@/services/supabaseHelpers";

export type CourierLocation = {
  user_id: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  remaining_meters: number | null;
  eta_seconds: number | null;
  next_stop_index: number | null;
  next_stop_eta: string | null;
  route_id: string | null;
  updated_at: string;
};

export function useLiveCourierLocations(input?: { enabled?: boolean }) {
  const enabled = input?.enabled ?? true;

  const [rows, setRows] = React.useState<CourierLocation[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    let alive = true;

    async function load() {
      const res = await supabase.from("courier_locations").select("*").order("updated_at", { ascending: false });
      if (!alive) return;

      if (res.error) {
        if (isMissingRelation(res.error)) setError("Missing table: courier_locations (apply SQL migration).");
        else setError(res.error.message);
        return;
      }

      setError(null);
      setRows((res.data || []) as any);
    }

    void load();

    const ch = supabase
      .channel("courier-locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "courier_locations" }, () => load())
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [enabled]);

  return { rows, error };
}
