import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Battery,
  ChevronRight,
  Filter,
  History,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Package,
  Search,
  Signal,
  Target,
  Truck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Britium Express - Fleet Surveillance & Live Telemetry
 * ၇၀/၃၀ Contextual Split + Breadcrumb Overlays (last 5 minutes)
 * Zero Deduction: additive enhancements, no core removal
 */

type RiderStatus = 'active' | 'idle' | 'offline';

interface RiderLocation {
  id: string;
  name: string;
  status: RiderStatus;
  battery: number; // %
  signal: number; // 0-5
  lat: number; // 0-100 (map %)
  lng: number; // 0-100 (map %)
  lastUpdatedText: string; // for UI
  lastTelemetryAt: number; // epoch ms
  currentShipment?: string;
  speed: number; // km/h
  city?: 'YGN' | 'MDY' | 'NPT';
}

type TelemetryPoint = { x: number; y: number; ts: number };

type AtRiskType = 'OFF_ROUTE' | 'LOW_BATTERY' | 'OFFLINE' | 'STALE_TELEMETRY';

type AtRiskAlert = {
  type: AtRiskType;
  riderId: string;
  riderName: string;
  severity: 'high' | 'medium' | 'low';
  messageEn: string;
  messageMm: string;
};

const GOLD = '#D4AF37'; // luxury gold
const BRITIUM_BLUE_RING =
  'focus-visible:ring-4 focus-visible:ring-[rgba(0,102,255,0.75)] focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatRelative(msAgo: number) {
  const s = Math.floor(msAgo / 1000);
  if (s < 10) return 'Just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  return `${h} hour${h > 1 ? 's' : ''} ago`;
}

/** Distance from point P to line segment AB in 2D (map units 0-100). */
function distancePointToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLen2 = abx * abx + aby * aby;
  if (abLen2 === 0) return Math.hypot(px - ax, py - ay);
  let t = (apx * abx + apy * aby) / abLen2;
  t = clamp(t, 0, 1);
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  return Math.hypot(px - cx, py - cy);
}

const TrackingMapPage: React.FC = () => {
  // Lightweight bilingual labels (you can later swap to your real i18n)
  const [lang, setLang] = useState<'en' | 'mm'>('en');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'risk' | 'riders' | 'details'>('risk');

  // ===== Initial mock fleet (replace with real telemetry stream later) =====
  const initialFleet: RiderLocation[] = useMemo(() => {
    const now = Date.now();
    return [
      { id: 'R-1024', name: 'Aung Kyaw', status: 'active', battery: 85, signal: 4, lat: 40, lng: 30, lastUpdatedText: '2 mins ago', lastTelemetryAt: now - 2 * 60_000, currentShipment: 'BRT-99283', speed: 35, city: 'YGN' },
      { id: 'R-2051', name: 'Kyaw Zeya', status: 'active', battery: 42, signal: 5, lat: 60, lng: 70, lastUpdatedText: 'Just now', lastTelemetryAt: now - 5_000, currentShipment: 'BRT-88120', speed: 42, city: 'YGN' },
      { id: 'R-3092', name: 'Min Thu', status: 'idle', battery: 98, signal: 3, lat: 25, lng: 85, lastUpdatedText: '15 mins ago', lastTelemetryAt: now - 15 * 60_000, speed: 0, city: 'MDY' },
      { id: 'R-4011', name: 'Htet Lin', status: 'active', battery: 67, signal: 5, lat: 75, lng: 45, lastUpdatedText: '1 min ago', lastTelemetryAt: now - 60_000, currentShipment: 'BRT-77451', speed: 28, city: 'NPT' },
      { id: 'R-5520', name: 'Zarni', status: 'offline', battery: 12, signal: 0, lat: 10, lng: 10, lastUpdatedText: '2 hours ago', lastTelemetryAt: now - 2 * 60 * 60_000, speed: 0, city: 'YGN' },
    ];
  }, []);

  // Live-ish state (simulated)
  const [fleet, setFleet] = useState<RiderLocation[]>(initialFleet);

  // Route corridors (stable per rider): from initial point → destination point
  const plannedRoutes = useMemo(() => {
    const map = new Map<string, { ax: number; ay: number; bx: number; by: number }>();
    for (const r of initialFleet) {
      // simple deterministic-ish destinations
      const bx = clamp((r.lat * 0.35 + (r.id.charCodeAt(2) % 40) + 20), 5, 95);
      const by = clamp((r.lng * 0.4 + (r.id.charCodeAt(3) % 35) + 15), 5, 95);
      map.set(r.id, { ax: r.lat, ay: r.lng, bx, by });
    }
    return map;
  }, [initialFleet]);

  // Breadcrumb history store
  const historyRef = useRef<Map<string, TelemetryPoint[]>>(new Map());

  // Keep breadcrumbs to last 5 minutes
  const pruneHistory = (points: TelemetryPoint[], now: number) => points.filter(p => now - p.ts <= 5 * 60_000);

  // Map init loading
  useEffect(() => {
    const timer = setTimeout(() => setIsMapLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Simulate telemetry (every 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setFleet(prev => {
        const now = Date.now();
        const next = prev.map(r => {
          if (r.status !== 'active') {
            // still update relative label
            return { ...r, lastUpdatedText: formatRelative(now - r.lastTelemetryAt) };
          }

          const route = plannedRoutes.get(r.id);
          // random walk biased toward route direction
          const dx = route ? (route.bx - r.lat) * 0.02 : 0;
          const dy = route ? (route.by - r.lng) * 0.02 : 0;

          const jitterX = (Math.random() - 0.5) * 1.2;
          const jitterY = (Math.random() - 0.5) * 1.2;

          const newLat = clamp(r.lat + dx + jitterX, 2, 98);
          const newLng = clamp(r.lng + dy + jitterY, 2, 98);

          const newBattery = clamp(r.battery - (Math.random() * 0.6), 0, 100);
          const newSignal = clamp(Math.round(r.signal + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)), 0, 5);
          const newSpeed = clamp(Math.round(r.speed + (Math.random() - 0.5) * 8), 8, 55);

          // push breadcrumb
          const existing = historyRef.current.get(r.id) ?? [];
          const pushed = pruneHistory([...existing, { x: newLat, y: newLng, ts: now }], now);
          historyRef.current.set(r.id, pushed);

          return {
            ...r,
            lat: newLat,
            lng: newLng,
            battery: newBattery,
            signal: newSignal,
            speed: newSpeed,
            lastTelemetryAt: now,
            lastUpdatedText: formatRelative(0),
          };
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [plannedRoutes]);

  const filteredFleet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fleet;
    return fleet.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.currentShipment && r.currentShipment.toLowerCase().includes(q))
    );
  }, [fleet, searchQuery]);

  const selectedRider = useMemo(() => fleet.find(r => r.id === selectedRiderId) ?? null, [fleet, selectedRiderId]);

  // ===== At-risk detection =====
  const atRiskAlerts: AtRiskAlert[] = useMemo(() => {
    const now = Date.now();
    const alerts: AtRiskAlert[] = [];

    for (const r of fleet) {
      // OFFLINE
      if (r.status === 'offline') {
        alerts.push({
          type: 'OFFLINE',
          riderId: r.id,
          riderName: r.name,
          severity: 'high',
          messageEn: 'Rider is offline (no telemetry).',
          messageMm: 'Rider သည် Offline ဖြစ်နေသည် (တည်နေရာအချက်အလက်မရပါ)။',
        });
      }

      // STALE telemetry
      const ageMs = now - r.lastTelemetryAt;
      if (r.status !== 'offline' && ageMs > 10 * 60_000) {
        alerts.push({
          type: 'STALE_TELEMETRY',
          riderId: r.id,
          riderName: r.name,
          severity: 'medium',
          messageEn: `Telemetry stale (${Math.floor(ageMs / 60_000)} min).`,
          messageMm: `တည်နေရာအချက်အလက်နောက်ကျနေသည် (${Math.floor(ageMs / 60_000)} မိနစ်)။`,
        });
      }

      // LOW battery
      if (r.battery <= 20) {
        alerts.push({
          type: 'LOW_BATTERY',
          riderId: r.id,
          riderName: r.name,
          severity: r.battery <= 10 ? 'high' : 'medium',
          messageEn: `Low battery (${Math.round(r.battery)}%).`,
          messageMm: `ဘက်ထရီအားနည်း (${Math.round(r.battery)}%)။`,
        });
      }

      // OFF route (for active riders only)
      if (r.status === 'active') {
        const route = plannedRoutes.get(r.id);
        if (route) {
          const d = distancePointToSegment(r.lat, r.lng, route.ax, route.ay, route.bx, route.by);
          if (d >= 8.5) {
            alerts.push({
              type: 'OFF_ROUTE',
              riderId: r.id,
              riderName: r.name,
              severity: d >= 14 ? 'high' : 'medium',
              messageEn: `Possible off-route (deviation ${d.toFixed(1)} units).`,
              messageMm: `လမ်းကြောင်းလွဲနိုင်ခြေရှိ (လွဲသွားမှု ${d.toFixed(1)})။`,
            });
          }
        }
      }
    }

    // sort by severity
    const sevRank = { high: 0, medium: 1, low: 2 } as const;
    alerts.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
    return alerts;
  }, [fleet, plannedRoutes]);

  // ===== Breadcrumb polyline for each rider (last 5 minutes) =====
  const breadcrumbPolylines = useMemo(() => {
    const out: { riderId: string; points: string }[] = [];
    for (const r of fleet) {
      const pts = historyRef.current.get(r.id);
      if (!pts || pts.length < 2) continue;
      out.push({
        riderId: r.id,
        points: pts.map(p => `${p.x},${p.y}`).join(' '),
      });
    }
    return out;
  }, [fleet]);

  const mapTitle = lang === 'en' ? 'Fleet Surveillance' : 'ယာဉ်စုဖွဲ့မှု စောင့်ကြည့်ခြင်း';
  const riskTitle = lang === 'en' ? 'At-Risk Alerts' : 'အန္တရာယ်ရှိနိုင်ခြေ သတိပေးချက်များ';

  return (
    <div className="h-screen flex flex-col bg-navy-900">
      {/* Top Controls Bar */}
      <div className="flex-shrink-0 bg-navy-800/50 backdrop-blur-sm border-b border-gold-500/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">{mapTitle}</h1>
            <div className="hidden md:flex items-center gap-3 text-sm">
              <Badge variant="outline" className="border-success text-success">
                {fleet.filter(r => r.status !== 'offline').length} Online
              </Badge>
              <Badge variant="outline" className="border-warning text-warning">
                {fleet.filter(r => r.status === 'idle').length} Idle
              </Badge>
              <Badge variant="outline" className="border-destructive text-destructive">
                {fleet.filter(r => r.status === 'offline').length} Offline
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Input
                placeholder={lang === 'en' ? 'Search riders, shipments…' : 'Rider/Shipment ရှာရန်…'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-72 bg-navy-900/40 ${BRITIUM_BLUE_RING}`}
              />
            </div>

            <Button variant="outline" size="sm" className="bg-navy-900/40" onClick={() => setLang(l => (l === 'en' ? 'mm' : 'en'))}>
              {lang === 'en' ? 'EN/MM' : 'MM/EN'}
            </Button>

            <Button variant="outline" size="sm" className="bg-navy-900/40">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-navy-900/40">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* mobile search */}
        <div className="mt-3 md:hidden">
          <Input
            placeholder={lang === 'en' ? 'Search riders, shipments…' : 'Rider/Shipment ရှာရန်…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-navy-900/40 ${BRITIUM_BLUE_RING}`}
          />
        </div>
      </div>

      {/* 70/30 Split: Map (70) + Context Sidebar (30) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Map Area (70%) */}
        <div className="relative flex-[7] min-w-0 border-r border-gold-500/15">
          {/* Stylized Simulated Map */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
            {isMapLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4" />
                  <p className="text-white">{lang === 'en' ? 'Initializing Live Map…' : 'Live Map စတင်နေသည်…'}</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                {/* Grid Background Overlay */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke={GOLD} strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Telemetry Overlays */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  {/* planned routes (faint) */}
                  {Array.from(plannedRoutes.entries()).map(([id, r]) => (
                    <line
                      key={`route-${id}`}
                      x1={r.ax}
                      y1={r.ay}
                      x2={r.bx}
                      y2={r.by}
                      stroke={GOLD}
                      strokeOpacity={0.12}
                      strokeWidth={0.6}
                      strokeDasharray="2 2"
                    />
                  ))}

                  {/* Breadcrumb paths: last 5 minutes (gold polyline) */}
                  {breadcrumbPolylines.map(p => (
                    <polyline
                      key={`crumb-${p.riderId}`}
                      points={p.points}
                      fill="none"
                      stroke={GOLD}
                      strokeOpacity={selectedRiderId === p.riderId ? 0.9 : 0.45}
                      strokeWidth={selectedRiderId === p.riderId ? 0.9 : 0.6}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>

                {/* Markers */}
                <div className="absolute inset-0">
                  {fleet.map((rider) => (
                    <div
                      key={rider.id}
                      style={{ left: `${rider.lat}%`, top: `${rider.lng}%` }}
                      onClick={() => {
                        setSelectedRiderId(rider.id);
                        setActiveTab('details');
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                      title={`${rider.name} (${rider.id})`}
                    >
                      <div className="relative">
                        {rider.status === 'active' && (
                          <div className="absolute inset-0 w-10 h-10 bg-gold-500/20 rounded-full animate-ping" />
                        )}
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                            rider.status === 'active' ? 'bg-success border-white' :
                            rider.status === 'idle' ? 'bg-warning border-white' :
                            'bg-destructive border-white'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5 text-white" />
                        </div>

                        {/* Tooltip */}
                        {(selectedRiderId === rider.id || rider.status === 'active') && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-navy-800/90 backdrop-blur-sm border border-gold-500/20 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rider.name}</span>
                              <span className="opacity-60">|</span>
                              <span>{rider.speed} km/h</span>
                              {rider.currentShipment && (
                                <>
                                  <span className="opacity-60">|</span>
                                  <span className="text-gold-400">{rider.currentShipment}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Floating UI */}
                <div className="absolute top-4 left-4 space-y-2">
                  <Button variant="outline" size="sm" className="bg-navy-800/50 backdrop-blur-sm border-gold-500/20 text-white">
                    <Layers className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'Layers' : 'အလွှာ'}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-navy-800/50 backdrop-blur-sm border-gold-500/20 text-white">
                    <Target className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'Center' : 'အလယ်ပြန်'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context Sidebar (30%) */}
        <div className="flex-[3] min-w-[320px] max-w-[520px] bg-navy-800/25 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-gold-500/15">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gold-400" />
                {lang === 'en' ? 'Operational Context' : 'လုပ်ငန်းခွင် အခြေအနေ'}
              </h2>
              <Badge variant="outline" className="border-gold-500/30 text-gold-300">
                {lang === 'en' ? 'LIVE' : 'တိုက်ရိုက်'}
              </Badge>
            </div>

            <div className="mt-3">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-navy-900/40">
                  <TabsTrigger value="risk">{lang === 'en' ? 'At-Risk' : 'အန္တရာယ်'}</TabsTrigger>
                  <TabsTrigger value="riders">{lang === 'en' ? 'Riders' : 'Rider'}</TabsTrigger>
                  <TabsTrigger value="details">{lang === 'en' ? 'Details' : 'အသေးစိတ်'}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {/* At-Risk alerts */}
            {activeTab === 'risk' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white font-medium">{riskTitle}</div>
                  <Badge variant="outline" className="border-destructive/30 text-destructive">
                    {atRiskAlerts.length}
                  </Badge>
                </div>

                {atRiskAlerts.length === 0 ? (
                  <div className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/30 text-sm text-muted-foreground">
                    {lang === 'en' ? 'No alerts. Fleet looks healthy.' : 'သတိပေးချက်မရှိပါ။ ယာဉ်စုအခြေအနေကောင်းပါသည်။'}
                  </div>
                ) : (
                  atRiskAlerts.map((a, idx) => (
                    <button
                      key={`${a.riderId}-${a.type}-${idx}`}
                      onClick={() => {
                        setSelectedRiderId(a.riderId);
                        setActiveTab('details');
                      }}
                      className="w-full text-left p-3 rounded-xl border border-gold-500/15 hover:border-gold-500/35 bg-navy-900/35 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white font-medium text-sm">{a.riderName}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {lang === 'en' ? a.messageEn : a.messageMm}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            a.severity === 'high'
                              ? 'border-destructive/40 text-destructive'
                              : a.severity === 'medium'
                              ? 'border-warning/40 text-warning'
                              : 'border-primary/40 text-primary'
                          }
                        >
                          {a.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Rider list */}
            {activeTab === 'riders' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === 'en' ? 'Search riders…' : 'Rider ရှာရန်…'}
                    className={`pl-9 bg-navy-900/40 ${BRITIUM_BLUE_RING}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  {filteredFleet.map((rider) => (
                    <button
                      key={rider.id}
                      onClick={() => {
                        setSelectedRiderId(rider.id);
                        setActiveTab('details');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedRiderId === rider.id
                          ? 'border-gold-500 bg-gold-500/5 shadow-lg shadow-gold-500/10'
                          : 'border-border/40 hover:border-gold-400/40 hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            rider.status === 'active' ? 'bg-success animate-pulse' :
                            rider.status === 'idle' ? 'bg-warning' : 'bg-destructive'
                          }`} />
                          <div>
                            <div className="font-medium text-white">{rider.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {rider.id}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <div className="flex items-center gap-1">
                            <Battery className="w-3 h-3" />
                            <span>{Math.round(rider.battery)}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Signal className="w-3 h-3" />
                            <span>{rider.signal}/5</span>
                          </div>
                        </div>
                      </div>

                      {rider.currentShipment && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-gold-400" />
                            <span className="text-gold-400">{rider.currentShipment}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Activity className="w-3 h-3" />
                            <span>{rider.speed} km/h</span>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">{rider.lastUpdatedText}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected rider details */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {!selectedRider ? (
                  <div className="p-4 rounded-xl border border-gold-500/15 bg-navy-900/30 text-sm text-muted-foreground">
                    {lang === 'en' ? 'Select a rider from alerts or list.' : 'သတိပေးချက်/စာရင်းမှ Rider ကိုရွေးပါ။'}
                  </div>
                ) : (
                  <Card className="border-gold-500/20 bg-navy-900/35">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gold-400" />
                            {selectedRider.name}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground mt-1">
                            {selectedRider.id} • {selectedRider.city ?? '—'}
                          </div>
                        </div>
                        <button
                          className="text-white/60 hover:text-white"
                          onClick={() => setSelectedRiderId(null)}
                          aria-label="Clear selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-gold-500/10 bg-navy-800/30">
                          <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Battery' : 'ဘက်ထရီ'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Battery className="w-4 h-4 text-white/80" />
                            <div className="text-white font-semibold">{Math.round(selectedRider.battery)}%</div>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border border-gold-500/10 bg-navy-800/30">
                          <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Signal' : 'လိုင်း'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Signal className="w-4 h-4 text-white/80" />
                            <div className="text-white font-semibold">{selectedRider.signal}/5</div>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border border-gold-500/10 bg-navy-800/30">
                          <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Speed' : 'မြန်နှုန်း'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Navigation className="w-4 h-4 text-white/80" />
                            <div className="text-white font-semibold">{selectedRider.speed} km/h</div>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border border-gold-500/10 bg-navy-800/30">
                          <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Updated' : 'အသစ်ပြောင်း'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <History className="w-4 h-4 text-white/80" />
                            <div className="text-white font-semibold">{selectedRider.lastUpdatedText}</div>
                          </div>
                        </div>
                      </div>

                      {selectedRider.currentShipment ? (
                        <div className="p-3 rounded-xl border border-gold-500/15 bg-gold-500/5">
                          <div className="text-xs text-muted-foreground">{lang === 'en' ? 'Active Shipment' : 'လုပ်ဆောင်နေသော ပို့ဆောင်မှု'}</div>
                          <div className="text-white font-semibold mt-1">{selectedRider.currentShipment}</div>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" className="bg-gold-500/20 hover:bg-gold-500/30 text-white border border-gold-500/30">
                              {lang === 'en' ? 'Investigate' : 'စုံစမ်းရန်'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            <Button size="sm" variant="outline" className="bg-navy-900/40 border-gold-500/20 text-white">
                              {lang === 'en' ? 'Call' : 'ဖုန်းခေါ်'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-gold-500/10 bg-navy-800/20 text-sm text-muted-foreground">
                          {lang === 'en' ? 'No active shipment assigned.' : 'လက်ရှိတာဝန်မရှိပါ။'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-gold-500/15 text-xs text-muted-foreground">
            {lang === 'en'
              ? 'Telemetry breadcrumbs show the last 5 minutes of movement.'
              : 'Breadcrumb မျဉ်းများမှာ လွန်ခဲ့သော ၅ မိနစ်အတွင်း သွားလာမှုကို ပြသပါသည်။'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingMapPage;
