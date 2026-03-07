/**
 * Mapbox integration helpers (Directions, Optimization, Geocoding).
 *
 * EN: Uses public Mapbox token (VITE_MAPBOX_ACCESS_TOKEN) from Vite env.
 * MY: Vite env ထဲက public Mapbox token (VITE_MAPBOX_ACCESS_TOKEN) ကိုအသုံးပြုသည်။
 *
 * Docs:
 * - Directions API: https://docs.mapbox.com/api/navigation/directions/
 * - Optimization API v1: https://docs.mapbox.com/api/navigation/optimization-v1/
 */

export type LngLat = [number, number];

const TOKEN = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "") as string;
const BASE = "https://api.mapbox.com";

export function isMapboxConfigured(): boolean {
  return Boolean(TOKEN);
}

function assertToken() {
  if (!TOKEN) throw new Error("Mapbox token missing: VITE_MAPBOX_ACCESS_TOKEN");
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    u.set(k, String(v));
  }
  u.set("access_token", TOKEN);
  return u.toString();
}

function coordString(coords: LngLat[]) {
  return coords.map(([lng, lat]) => `${lng},${lat}`).join(";");
}

export type DirectionsProfile = "driving" | "driving-traffic" | "walking" | "cycling";

export type DirectionsStep = {
  distance: number;
  duration: number;
  name: string;
  maneuver: { instruction: string; type: string; modifier?: string };
};

export type DirectionsLeg = {
  distance: number;
  duration: number;
  steps?: DirectionsStep[];
};

export type DirectionsRoute = {
  distance: number;
  duration: number;
  geometry: { type: "LineString"; coordinates: LngLat[] };
  legs?: DirectionsLeg[];
};

export async function fetchDirections(input: {
  profile?: DirectionsProfile;
  coordinates: LngLat[];
  steps?: boolean;
  overview?: "simplified" | "full";
  geometries?: "geojson";
  language?: string;
}): Promise<DirectionsRoute> {
  assertToken();

  const profile = input.profile ?? "driving";
  const coordinates = input.coordinates;
  if (coordinates.length < 2) throw new Error("Directions requires at least 2 coordinates.");
  if (coordinates.length > 25) throw new Error("Directions supports up to 25 coordinates.");

  const url = `${BASE}/directions/v5/mapbox/${profile}/${coordString(coordinates)}?${qs({
    alternatives: false,
    geometries: input.geometries ?? "geojson",
    overview: input.overview ?? "full",
    steps: input.steps ?? true,
    language: input.language,
  })}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API failed: ${res.status}`);
  const json = await res.json();

  const route = json?.routes?.[0];
  if (!route) throw new Error("No route returned from Directions API.");

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry,
    legs: route.legs,
  };
}

export type OptimizedWaypoint = {
  waypoint_index: number;
  trips_index: number;
  location: LngLat;
  name: string;
};

export type OptimizedTrip = {
  distance: number;
  duration: number;
  geometry: { type: "LineString"; coordinates: LngLat[] };
  legs?: DirectionsLeg[];
};

export async function fetchOptimizedTripV1(input: {
  profile?: DirectionsProfile;
  coordinates: LngLat[];
  roundtrip?: boolean;
  source?: "first" | "any";
  destination?: "last" | "any";
  steps?: boolean;
}): Promise<{ trip: OptimizedTrip; waypoints: OptimizedWaypoint[] }> {
  assertToken();

  const profile = input.profile ?? "driving";
  const coordinates = input.coordinates;
  if (coordinates.length < 2) throw new Error("Optimization requires at least 2 coordinates.");
  if (coordinates.length > 12) throw new Error("Optimization v1 supports up to 12 coordinates.");

  const url = `${BASE}/optimized-trips/v1/mapbox/${profile}/${coordString(coordinates)}?${qs({
    roundtrip: input.roundtrip ?? false,
    source: input.source ?? "first",
    destination: input.destination ?? "last",
    geometries: "geojson",
    overview: "full",
    steps: input.steps ?? false,
  })}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Optimization API failed: ${res.status}`);
  const json = await res.json();

  const trip = json?.trips?.[0];
  if (!trip) throw new Error("No trip returned from Optimization API.");

  return {
    trip: {
      distance: trip.distance,
      duration: trip.duration,
      geometry: trip.geometry,
      legs: trip.legs,
    },
    waypoints: (json?.waypoints || []).map((w: any) => ({
      waypoint_index: w.waypoint_index,
      trips_index: w.trips_index,
      location: w.location,
      name: w.name,
    })),
  };
}

export type GeocodeFeature = {
  id: string;
  place_name: string;
  center: LngLat;
};

export async function geocodeForward(query: string, input?: { limit?: number; proximity?: LngLat }): Promise<GeocodeFeature[]> {
  assertToken();
  const q = query.trim();
  if (!q) return [];

  const url = `${BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${qs({
    limit: input?.limit ?? 5,
    autocomplete: true,
    proximity: input?.proximity ? `${input.proximity[0]},${input.proximity[1]}` : undefined,
  })}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding API failed: ${res.status}`);
  const json = await res.json();

  const features = (json?.features || []) as any[];
  return features.map((f) => ({
    id: f.id,
    place_name: f.place_name,
    center: f.center,
  }));
}
