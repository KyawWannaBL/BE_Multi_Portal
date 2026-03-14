import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogisticsApi } from "@/features/logistics/api";
import type { ParcelRecord, RiderRecord, RoutePlan, SlaSummary } from "@/features/logistics/types";
import { RiderDispatchBoard } from "@/features/logistics/components/RiderDispatchBoard";
import { LeafletRoutePanel } from "@/features/logistics/components/LeafletRoutePanel";
import { SlaMonitoringPanel } from "@/features/logistics/components/SlaMonitoringPanel";

export default function WarehouseDispatch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ParcelRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [riders, setRiders] = useState<RiderRecord[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [sla, setSla] = useState<SlaSummary>({
    total: 0,
    healthy: 0,
    warning: 0,
    breached: 0,
  });
  const [mode, setMode] = useState<"balanced" | "fastest" | "lowest_cost">("balanced");
  const [optimizing, setOptimizing] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  async function load() {
    const [parcels, riderList, slaSummary] = await Promise.all([
      LogisticsApi.getDispatchReadyParcels(query),
      LogisticsApi.getRiders(),
      LogisticsApi.getSlaSummary(),
    ]);
    setItems(parcels);
    setRiders(riderList);
    setSla(slaSummary);
  }

  useEffect(() => {
    void load();
  }, [query]);

  const selectedParcels = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  async function handleOptimize() {
    if (!selectedIds.length) return;
    try {
      setOptimizing(true);
      const result = await LogisticsApi.optimizeRoute({
        parcelIds: selectedIds,
        riderId: selectedRiderId || undefined,
        mode,
      });
      setRoutePlan(result);
    } finally {
      setOptimizing(false);
    }
  }

  async function handleDispatch() {
    if (!selectedIds.length || !selectedRiderId) return;
    try {
      setDispatching(true);
      await LogisticsApi.dispatchRoute({
        parcelIds: selectedIds,
        riderId: selectedRiderId,
        routeCode: routePlan?.routeCode,
        optimized: Boolean(routePlan),
      });
      setSelectedIds([]);
      setSelectedRiderId("");
      setRoutePlan(null);
      await load();
    } finally {
      setDispatching(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Dispatch</h1>
          <p className="text-muted-foreground">
            Select ready parcels, optimize route, assign riders, and dispatch.
          </p>
        </div>

        <SlaMonitoringPanel summary={sla} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Queue</CardTitle>
              <CardDescription>
                Choose parcels for route creation and rider assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dispatch-ready parcels"
              />

              <div className="max-h-[520px] space-y-2 overflow-auto">
                {items.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                        checked ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedIds((prev) =>
                            e.target.checked
                              ? [...prev, item.id]
                              : prev.filter((id) => id !== item.id)
                          );
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{item.waybillNo}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.customerName} • {item.township}
                        </div>
                        <div className="mt-1 text-sm">
                          SLA: {item.slaDeadlineAt || "-"}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Route Optimization</CardTitle>
              <CardDescription>
                Optimize sequence, assign rider, and create dispatch route
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-muted p-4 text-sm">
                Selected Parcels: <span className="font-semibold">{selectedParcels.length}</span>
              </div>

              <div className="grid gap-3">
                <select
                  className="rounded-md border bg-background px-3 py-2"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="balanced">Balanced</option>
                  <option value="fastest">Fastest</option>
                  <option value="lowest_cost">Lowest Cost</option>
                </select>
              </div>

              <RiderDispatchBoard
                riders={riders}
                selectedRiderId={selectedRiderId}
                onSelect={setSelectedRiderId}
              />

              <div className="flex gap-3">
                <Button onClick={handleOptimize} disabled={!selectedIds.length || optimizing}>
                  {optimizing ? "Optimizing..." : "Run Optimization"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDispatch}
                  disabled={!selectedIds.length || !selectedRiderId || dispatching}
                >
                  {dispatching ? "Dispatching..." : "Dispatch Route"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Route Panel</CardTitle>
            <CardDescription>
              Optimized stop sequence and dispatch route visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeafletRoutePanel plan={routePlan} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}