import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

type LiveStop = {
  parcelId: string;
  waybillNo: string;
  customerName: string;
  township: string;
  status: string;
  lat: number;
  lng: number;
  sequence?: number;
};

type LiveRoute = {
  routeCode: string;
  riderId: string;
  riderName?: string;
  riderPhone?: string;
  riderLat?: number;
  riderLng?: number;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  completedStops?: number;
  totalStops?: number;
  stops: LiveStop[];
};

export default function TrackingMap() {
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState<LiveRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLiveRoute(search?: string) {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/v1/routes/live-track", {
        params: search ? { q: search } : {},
      });

      setRoute(res.data || null);
    } catch (err: any) {
      setRoute(null);
      setError(err?.response?.data?.message || err?.message || "Failed to load live route.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLiveRoute();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (route?.riderLat && route?.riderLng) {
      return [route.riderLat, route.riderLng];
    }

    if (route?.stops?.length) {
      return [route.stops[0].lat, route.stops[0].lng];
    }

    return [16.8661, 96.1951];
  }, [route]);

  const path = useMemo<[number, number][]>(() => {
    if (!route?.stops?.length) return [];
    return route.stops.map((stop) => [stop.lat, stop.lng]);
  }, [route]);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Live Tracking Map</h1>
          <p className="text-muted-foreground">
            Monitor active routes, rider position, stops, and delivery progress in real time.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Route / Rider / Waybill</CardTitle>
            <CardDescription>
              Search by route code, rider name, rider phone, or waybill number.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search route / rider / waybill"
            />
            <Button onClick={() => void loadLiveRoute(query)} disabled={loading}>
              {loading ? "Loading..." : "Track"}
            </Button>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
              <CardDescription>
                Rider location, planned stop sequence, and route progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border">
                <MapContainer center={center} zoom={12} style={{ height: 560, width: "100%" }}>
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {path.length > 1 ? <Polyline positions={path} /> : null}

                  {route?.stops?.map((stop, idx) => (
                    <Marker key={stop.parcelId} position={[stop.lat, stop.lng]}>
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold">
                            #{stop.sequence || idx + 1} - {stop.customerName}
                          </div>
                          <div>Waybill: {stop.waybillNo}</div>
                          <div>Township: {stop.township}</div>
                          <div>Status: {stop.status}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {route?.riderLat && route?.riderLng ? (
                    <CircleMarker
                      center={[route.riderLat, route.riderLng]}
                      radius={10}
                      pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{route.riderName || "Rider"}</div>
                          <div>{route.riderPhone || "-"}</div>
                          <div>Route: {route.routeCode}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ) : null}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route Summary</CardTitle>
              <CardDescription>
                Operational monitoring for the current live route.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!route ? (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                  No route loaded yet.
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-muted p-4 text-sm">
                    <div className="grid grid-cols-[130px_1fr] gap-2 py-1">
                      <div className="text-muted-foreground">Route Code</div>
                      <div className="font-medium">{route.routeCode}</div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-2 py-1">
                      <div className="text-muted-foreground">Rider</div>
                      <div className="font-medium">{route.riderName || "-"}</div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-2 py-1">
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-medium">{route.riderPhone || "-"}</div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-2 py-1">
                      <div className="text-muted-foreground">Distance</div>
                      <div className="font-medium">{route.estimatedDistanceKm ?? 0} km</div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-2 py-1">
                      <div className="text-muted-foreground">ETA</div>
                      <div className="font-medium">{route.estimatedDurationMin ?? 0} min</div>
                    </div>
                    <div className="grid grid-cols-[130px_1fr] gap-2 py-1">
                      <div className="text-muted-foreground">Progress</div>
                      <div className="font-medium">
                        {route.completedStops ?? 0} / {route.totalStops ?? route.stops.length}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {route.stops.map((stop, index) => (
                      <div
                        key={stop.parcelId}
                        className="rounded-xl border p-3 text-sm"
                      >
                        <div className="font-semibold">
                          #{stop.sequence || index + 1} {stop.customerName}
                        </div>
                        <div className="text-muted-foreground">{stop.waybillNo}</div>
                        <div className="mt-1">{stop.township}</div>
                        <div className="mt-1 text-xs uppercase text-primary">
                          {stop.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}