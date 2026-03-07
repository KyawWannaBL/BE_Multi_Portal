// @ts-nocheck
export const isMapboxConfigured = Boolean(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
export const geocodeForward = async (query: string) => null;
export const fetchDirections = async (coordinates: [number, number][]) => ({ routes: [] });
export const fetchOptimizedTripV1 = async (coordinates: [number, number][]) => ({ trips: [] });
export type LngLat = { lng: number; lat: number };
