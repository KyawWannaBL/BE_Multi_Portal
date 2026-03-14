import { useEffect, useMemo, useState } from "react";
import type { LiveRouteSnapshot } from "../types/domain";

type UseRealtimeRouteOptions = {
  endpoint?: string;
  pollingMs?: number;
};

const sampleSnapshot: LiveRouteSnapshot = {
  rider: { label: "Rider Live Position", lat: 16.82, lng: 96.15 },
  stops: [
    { id: "s1", label: "Merchant pickup", lat: 16.81, lng: 96.14, status: "Completed", eta: "Done" },
    { id: "s2", label: "Yangon Main Hub", lat: 16.87, lng: 96.18, status: "Processed", eta: "Done" },
    { id: "s3", label: "Customer destination", lat: 16.84, lng: 96.16, status: "En route", eta: "14:20" },
  ],
  updatedAt: new Date().toISOString(),
};

export function useRealtimeRoute(batchId?: string, options: UseRealtimeRouteOptions = {}) {
  const [snapshot, setSnapshot] = useState<LiveRouteSnapshot>(sampleSnapshot);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!batchId) return;

    let active = true;
    const pollingMs = options.pollingMs || 8000;
    let timer: any;

    const tick = async () => {
      try {
        setLoading(true);
        if (!options.endpoint) {
          const jitter = Math.random() * 0.002;
          if (!active) return;
          setSnapshot((prev) => ({
            ...prev,
            rider: {
              ...prev.rider,
              lat: prev.rider.lat + jitter / 10,
              lng: prev.rider.lng + jitter / 10,
            },
            updatedAt: new Date().toISOString(),
          }));
        } else {
          const response = await fetch(`${options.endpoint}/${batchId}/live`);
          const json = await response.json();
          if (active) setSnapshot(json);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void tick();
    timer = setInterval(() => {
      void tick();
    }, pollingMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [batchId, options.endpoint, options.pollingMs]);

  return useMemo(() => ({ snapshot, loading }), [snapshot, loading]);
}
