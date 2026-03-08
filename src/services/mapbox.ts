export type LngLat = [number, number];

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function isMapboxConfigured(): boolean {
  return Boolean(MAPBOX_TOKEN);
}

export async function geocodeForward(query: string): Promise<LngLat | null> {
  if (!MAPBOX_TOKEN) return null;
  try {
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].center as LngLat;
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}

export async function fetchDirections(coordinates: LngLat[]): Promise<any> {
  if (!MAPBOX_TOKEN || coordinates.length < 2) return null;
  const coords = coordinates.map(c => c.join(",")).join(";");
  try {
    const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
    return await res.json();
  } catch (e) {
    console.error("Directions error:", e);
    return null;
  }
}

export async function fetchOptimizedTripV1(coordinates: LngLat[]): Promise<any> {
  if (!MAPBOX_TOKEN || coordinates.length < 2) return null;
  const coords = coordinates.map(c => c.join(",")).join(";");
  try {
    const res = await fetch(`https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
    return await res.json();
  } catch (e) {
    console.error("Optimization error:", e);
    return null;
  }
}
