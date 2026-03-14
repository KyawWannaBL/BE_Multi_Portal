import { useCallback, useEffect, useState } from "react";
import { getDelivery } from "../api/deliveryApi";
import { getWorkflowHistory } from "../api/workflowApi";

export function useWorkflowCase(deliveryId?: string) {
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!deliveryId) return;
    try {
      setLoading(true);
      setError("");
      const [deliveryRes, eventsRes] = await Promise.all([
        getDelivery(deliveryId),
        getWorkflowHistory(deliveryId),
      ]);
      setDelivery(deliveryRes);
      setEvents(eventsRes?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow case.");
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    loading,
    delivery,
    events,
    error,
    refresh,
  };
}
