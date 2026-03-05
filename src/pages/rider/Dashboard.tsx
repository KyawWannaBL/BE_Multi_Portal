import { mockShipments } from '@/data/mockData';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Package, Route, ShieldCheck } from 'lucide-react';

// FIX: Pointing to specific files to avoid Vite "Could not load src/data/index" error
import { mockShipments } from '@/data/mockData'; 
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const GOLD = 'text-[rgba(212,175,55,0.95)]';
const BRITIUM_BIG_PRIMARY =
  'w-full h-14 text-lg font-semibold shadow-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 hover:opacity-95';

type Gps = { lat: number; lng: number; accuracyM: number };

/**
 * Custom hook for real-time GPS tracking
 */
function useLiveGps() {
  const [gps, setGps] = useState<Gps | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const w = navigator.geolocation.watchPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyM: pos.coords.accuracy }),
      () => setGps(null),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(w);
  }, []);

  return gps;
}

/**
 * OpenStreetMap Embed Component
 */
function OSMMap({ gps }: { gps: Gps | null }) {
  const fallback = { lat: 16.8409, lng: 96.1735 }; // Yangon center
  const p = gps ?? { ...fallback, accuracyM: 0 };

  const delta = 0.02;
  const left = p.lng - delta;
  const right = p.lng + delta;
  const top = p.lat + delta;
  const bottom = p.lat - delta;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    `${left},${bottom},${right},${top}`
  )}&layer=mapnik&marker=${encodeURIComponent(`${p.lat},${p.lng}`)}`;

  return (
    <div className="h-full w-full relative">
      <iframe title="map" className="h-full w-full border-0" src={src} />
      <div className="absolute top-3 left-3">
        <Badge className="bg-black/60 text-white border border-white/10 backdrop-blur">
          <MapPin className="w-3 h-3 mr-1" />
          {p.lat.toFixed(5)}, {p.lng.toFixed(5)} {gps ? `(±${Math.round(p.accuracyM)}m)` : '(demo)'}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Top KPI Strip for Rider performance
 */
function LuxuryKpiStrip(props: { remaining: number; etdText: string; successRatePct: number }) {
  return (
    <div className="w-full rounded-xl border bg-black/60 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-white">
        <div className="text-sm">
          <div className={`${GOLD} font-semibold`}>Remaining Parcels</div>
          <div className="text-lg font-bold">{props.remaining}</div>
        </div>
        <div className="text-sm text-center">
          <div className={`${GOLD} font-semibold`}>ETD to Next</div>
          <div className="text-lg font-bold">{props.etdText}</div>
        </div>
        <div className="text-sm text-right">
          <div className={`${GOLD} font-semibold`}>Shift Success</div>
          <div className="text-lg font-bold">{Math.round(props.successRatePct)}%</div>
        </div>
      </div>
    </div>
  );
}

function guessStatusKind(status: any) {
  const s = String(status ?? '').toLowerCase();
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('return') || s.includes('reject') || s.includes('fail')) return 'reject';
  return 'other';
}

/**
 * The internal Rider view with Navigation & List modes
 */
function RiderDashboard() {
  const navigate = useNavigate();
  const gps = useLiveGps();
  const [activeId, setActiveId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const all = (mockShipments as any[]) || [];
    let delivered = 0, failed = 0, remaining = 0;

    all.forEach((sh) => {
      const k = guessStatusKind(sh.status);
      if (k === 'delivered') delivered++;
      else if (k === 'reject') failed++;
      else remaining++;
    });

    const active = activeId ? all.find((s) => String(s.id ?? s.trackingNumber) === activeId) : null;
    return { remaining, delivered, failed, activeShipment: active };
  }, [activeId]);

  const successRatePct = useMemo(() => {
    const totalDone = stats.delivered + stats.failed;
    return totalDone === 0 ? 100 : (stats.delivered / totalDone) * 100;
  }, [stats.delivered, stats.failed]);

  const etdText = `${Math.min(45, Math.max(5, stats.remaining * 6))} min`;

  return (
    <div className="h-[100dvh] w-full flex flex-col gap-3 p-3 bg-slate-50">
      <LuxuryKpiStrip remaining={stats.remaining} etdText={etdText} successRatePct={successRatePct} />

      {stats.activeShipment ? (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-[7] min-h-0 rounded-xl overflow-hidden border shadow-sm">
            <OSMMap gps={gps} />
          </div>
          <Card className="flex-[3] min-h-0 border shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-sm font-mono font-bold text-emerald-600">
                  {stats.activeShipment.trackingNumber}
                </div>
                <Badge variant="outline">Navigating</Badge>
              </div>
              <div>
                <div className={`${GOLD} text-xs font-semibold`}>Receiver</div>
                <div className="font-bold text-lg leading-tight">{stats.activeShipment.receiverName}</div>
                <div className="text-xs text-muted-foreground">{stats.activeShipment.receiverAddress}</div>
              </div>
              <div className="flex gap-2">
                <Button className={BRITIUM_BIG_PRIMARY} onClick={() => navigate('/delivery-flow')}>
                  Start Delivery
                </Button>
                <Button variant="outline" className="h-14 px-6" onClick={() => setActiveId(null)}>
                  Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-xl border bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Delivery Queue</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/shipments/new')}>+ New</Button>
          </div>
          <div className="space-y-3">
            {(mockShipments as any[]).map((s) => {
              const id = String(s.id ?? s.trackingNumber);
              return (
                <Card key={id} className="border-slate-100">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-mono font-bold">{s.trackingNumber}</span>
                      <Badge variant="secondary">{s.status}</Badge>
                    </div>
                    <div>
                      <div className={`${GOLD} text-xs font-semibold`}>Customer</div>
                      <div className="font-medium">{s.receiverName}</div>
                    </div>
                    <Button className="w-full" onClick={() => setActiveId(id)}>
                      Enter Navigation Mode
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main Export with Role Protection
 */
export default function Dashboard() {
  const { user, legacyUser } = useAuth();
  const role = (legacyUser as any)?.role ?? (user as any)?.role ?? '';
  const isRider = String(role).toUpperCase().includes('RIDER');

  // If rider, show dashboard. If not, show fallback (instead of missing EnhancedDashboard).
  if (isRider) return <RiderDashboard />;

  return (
    <div className="flex h-screen items-center justify-center p-6 bg-slate-50 text-center">
      <Card className="max-w-md">
        <CardContent className="pt-10 pb-10">
          <ShieldCheck className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unauthorized Access</h2>
          <p className="text-muted-foreground">
            This panel is reserved for Riders. Your current role is: <strong>{String(role)}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}