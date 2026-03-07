export async function geocodeForward(query: string) {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  if (!t) throw new Error("Mapbox token missing");
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${t}&limit=1&country=MM`;
  const res = await fetch(url);
  const json = await res.json();
  return json.features?.[0]?.center || null;
}
