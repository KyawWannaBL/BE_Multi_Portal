import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Signal,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Maximize2,
  ShieldAlert,
  Activity,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI } from '@/services/logistics-api';
import { cn } from '@/lib/utils';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
}

interface GPSTrackerProps {
  vehicleId?: string;
  deviceId?: string;
  routeId?: string;
  shipmentId?: string;
  onLocationUpdate?: (location: any) => void;
  className?: string;
}

export function GPSTracker({ 
  vehicleId = 'VEH-2026-X9', 
  onLocationUpdate, 
  className 
}: GPSTrackerProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [history, setHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [signalStrength, setSignalStrength] = useState(94);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isGeofenceViolated, setIsGeofenceViolated] = useState(false);
  const [routeProgress, setRouteProgress] = useState(32);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const watchId = useRef<number | null>(null);

  // Mock geofence center (e.g., Central Distribution Hub)
  const GEOFENCE_CENTER = { lat: 16.8661, lng: 96.1951 }; // Yangon coords
  const GEOFENCE_RADIUS = 10000; // 10km in meters

  const dict = {
    en: {
      liveTracking: "Live Tracking",
      idle: "Idle",
      geofenceBreach: "Geofence Breach",
      activateSensor: "Activate Tracking",
      terminateTrack: "Terminate Track",
      telemetry: "Device Telemetry",
      signal: "Signal",
      battery: "Battery",
      speed: "Speed",
      activityLog: "Activity Log",
      waitingSignal: "Waiting for Signal...",
      compliance: "Operational Compliance",
      status: "Status",
      breachDesc: "Vehicle has exited the designated operation zone."
    },
    mm: {
      liveTracking: "တိုက်ရိုက်ခြေရာခံခြင်း",
      idle: "ရပ်နားထားသည်",
      geofenceBreach: "သတ်မှတ်နယ်မြေကျော်လွန်မှု",
      activateSensor: "ခြေရာခံခြင်း စတင်မည်",
      terminateTrack: "ခြေရာခံခြင်း ရပ်ဆိုင်းမည်",
      telemetry: "စက်ပစ္စည်း အခြေအနေ",
      signal: "လှိုင်းအချက်ပြ",
      battery: "ဘက်ထရီ",
      speed: "အမြန်နှုန်း",
      activityLog: "လုပ်ဆောင်မှု မှတ်တမ်း",
      waitingSignal: "အချက်ပြလှိုင်း စောင့်ဆိုင်းနေသည်...",
      compliance: "လုပ်ငန်းဆောင်ရွက်မှု စည်းကမ်းလိုက်နာမှု",
      status: "အခြေအနေ",
      breachDesc: "ယာဉ်သည် သတ်မှတ်ထားသော နယ်မြေပြင်ပသို့ ရောက်ရှိနေပါသည်။"
    }
  };

  const t = language === 'my' ? dict.mm : dict.en;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleNewLocation = useCallback(async (position: GeolocationPosition) => {
    const newData: LocationData = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: new Date().toISOString(),
    };

    setLocation(newData);
    setHistory((prev) => [...prev.slice(-24), newData]);
    setLastUpdateTime(new Date());

    // Geofence Check
    const distance = calculateDistance(
      newData.lat,
      newData.lng,
      GEOFENCE_CENTER.lat,
      GEOFENCE_CENTER.lng
    );

    if (distance > GEOFENCE_RADIUS && !isGeofenceViolated) {
      setIsGeofenceViolated(true);
      toast({
        title: t.geofenceBreach,
        description: t.breachDesc,
        variant: "destructive",
      });
    } else if (distance <= GEOFENCE_RADIUS && isGeofenceViolated) {
      setIsGeofenceViolated(false);
    }

    // Update Backend
    try {
      await logisticsAPI.updateVehicleTracking({
        vehicle_id: vehicleId,
        latitude: newData.lat,
        longitude: newData.lng,
        speed: newData.speed || 0,
        heading: newData.heading || 0,
        accuracy: newData.accuracy,
        battery_level: batteryLevel,
        engine_status: 'RUNNING'
      });
    } catch (err) {
      console.error('Failed to sync tracking data', err);
    }

    if (onLocationUpdate) onLocationUpdate(newData);
    
    // Telemetry Simulation
    setSignalStrength(Math.floor(80 + Math.random() * 20));
    setBatteryLevel((prev) => Math.max(5, prev - 0.005));
  }, [vehicleId, isGeofenceViolated, onLocationUpdate, toast, t, batteryLevel]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Restricted",
        description: "Hardware access denied or unsupported.",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      handleNewLocation,
      (error) => {
        toast({
          title: "Signal Lost",
          description: error.message,
          variant: "destructive",
        });
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map Visualization */}
        <Card className="lg:col-span-3 luxury-card overflow-hidden relative min-h-[500px] border-primary/20">
          <div className="absolute inset-0 bg-luxury-obsidian/40 backdrop-blur-[2px] z-0">
            {/* Cyber Grid Background */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }} 
            />
          </div>

          {/* Status Overlays */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
            <Badge 
              variant={isTracking ? "default" : "secondary"} 
              className="luxury-glass border-primary/30 py-1.5 px-4 font-bold tracking-widest text-[10px]"
            >
              <Signal className={cn("w-3 h-3 mr-2", isTracking && "animate-pulse text-green-400")} />
              {isTracking ? t.liveTracking.toUpperCase() : t.idle.toUpperCase()}
            </Badge>
            
            <AnimatePresence>
              {isGeofenceViolated && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex items-center gap-2 bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {t.geofenceBreach.toUpperCase()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interaction Controls */}
          <div className="absolute top-6 right-6 z-10 flex gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="luxury-glass rounded-xl border-white/10 hover:border-primary/50 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fullscreen View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="luxury-glass rounded-xl border-white/10 hover:border-primary/50 transition-colors">
                    <Layers className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Satellite Layers</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center Visual Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {location ? (
                <motion.div
                  key="active-marker"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  {/* Signal Ripple Effect */}
                  <div className="absolute -inset-12 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -inset-4 border border-primary/30 rounded-full animate-ping opacity-20" />
                  
                  <div className="relative p-5 bg-primary rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] border-4 border-luxury-obsidian">
                    <Navigation 
                      className="w-8 h-8 text-luxury-obsidian transition-transform duration-700 ease-out"
                      style={{ transform: `rotate(${(location.heading || 0) - 45}deg)` }}
                    />
                  </div>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-6 luxury-glass px-4 py-2 rounded-xl text-[11px] font-mono whitespace-nowrap border-primary/30"
                  >
                    <span className="text-primary font-bold">LAT:</span> {location.lat.toFixed(5)} <span className="mx-2 opacity-30">|</span> <span className="text-primary font-bold">LNG:</span> {location.lng.toFixed(5)}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground flex flex-col items-center gap-6"
                >
                  <div className="p-8 rounded-full bg-white/5 border border-white/10">
                    <Compass className="w-16 h-16 opacity-10 animate-spin-slow" />
                  </div>
                  <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-40">{t.waitingSignal}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dashboard Bar */}
          <div className="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end bg-luxury-obsidian/60 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="flex flex-col gap-3 flex-1 max-w-xs">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Progress</p>
                <span className="text-[10px] font-mono">{routeProgress}%</span>
              </div>
              <Progress value={routeProgress} className="h-1.5 bg-white/5" />
            </div>

            <div className="flex gap-4">
              {!isTracking ? (
                <Button 
                  onClick={startTracking} 
                  className="luxury-button h-12 px-8 rounded-xl"
                >
                  {t.activateSensor}
                </Button>
              ) : (
                <Button 
                  onClick={stopTracking} 
                  variant="destructive"
                  className="h-12 px-8 rounded-xl font-bold tracking-widest text-[10px] uppercase"
                >
                  {t.terminateTrack}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Right Telemetry Column */}
        <div className="space-y-6">
          {/* Live Stats */}
          <Card className="luxury-card p-6 border-white/5">
            <h3 className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
              <Activity className="w-3 h-3" /> {t.telemetry}
            </h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">ID</span>
                <span className="text-xs font-mono font-bold">{vehicleId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.signal}</span>
                <span className="text-xs font-mono font-bold flex items-center gap-2">
                  {signalStrength}% 
                  <div className="flex gap-0.5 items-end h-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={cn("w-1 rounded-full", 
                          i * 25 <= signalStrength ? "bg-green-500" : "bg-white/10")
                        }
                        style={{ height: `${i * 25}%` }}
                      />
                    ))}
                  </div>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.battery}</span>
                <span className="text-xs font-mono font-bold flex items-center gap-2">
                  {batteryLevel.toFixed(1)}% 
                  <Battery className={cn("w-4 h-4", batteryLevel < 20 ? "text-destructive" : "text-primary")} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.speed}</span>
                <span className="text-xs font-mono font-bold">
                  {location?.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : '0.0 km/h'}
                </span>
              </div>
            </div>
          </Card>

          {/* Log Timeline */}
          <Card className="luxury-card p-6 border-white/5 flex flex-col min-h-[250px]">
            <h3 className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
              <Clock className="w-3 h-3" /> {t.activityLog}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length > 0 ? history.slice().reverse().map((point, idx) => (
                <div key={idx} className="relative pl-6 pb-4 last:pb-0 border-l border-white/10">
                  <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-primary/10" />
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-[10px] font-mono tracking-tight opacity-70">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </p>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-20">
                  <Zap className="w-8 h-8" />
                  <p className="text-[10px] text-center font-bold uppercase tracking-widest">Empty Log</p>
                </div>
              )}
            </div>
          </Card>

          {/* Footer Card */}
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] flex items-center gap-4">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-luxury-obsidian" />
            </div>
            <div>
              <p className="text-[9px] text-primary/70 font-black uppercase tracking-[0.2em]">{t.status}</p>
              <p className="text-[11px] font-bold tracking-tight">{t.compliance}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
