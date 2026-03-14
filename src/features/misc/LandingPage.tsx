import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, ShieldCheck, Truck, QrCode } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Put your real APK URL in .env: VITE_APK_URL="https://..."
  const apkUrl =
    (import.meta as any).env?.VITE_APK_URL ||
    '/app/britium-express.apk'; // fallback (serve from /public/app/)

  const onDownload = () => {
    window.location.href = apkUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/britium-logo.png"
            onError={(e) => ((e.currentTarget.style.display = 'none'))}
            alt="Britium Express"
            className="h-10 w-10 rounded-lg bg-white/10 p-1"
          />
          <div>
            <div className="text-lg font-semibold tracking-tight">Britium Express</div>
            <div className="text-xs text-white/60">Luxury Logistics Protocol</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 hover:bg-white/10"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-semibold" onClick={onDownload}>
            <Smartphone className="h-4 w-4 mr-2" />
            Download App
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 grid gap-10 lg:grid-cols-2 items-center">
        <div className="space-y-5">
          <Badge className="bg-amber-400/15 text-amber-200 border border-amber-300/20">
            High-Trust Delivery • Anti-Fraud QR • ePOD
          </Badge>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Operate Deliveries with <span className="text-amber-300">Verified</span> Protocols.
          </h1>

          <p className="text-white/70 text-lg">
            Riders scan, deliver, and capture signature with GPS+timestamp binding.
            Finance exports daily cash vs transaction totals and KPI summary.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="h-12 bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-semibold"
              onClick={() => navigate('/login')}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Open Portal
            </Button>

            <Button
              variant="outline"
              className="h-12 border-white/15 bg-white/5 hover:bg-white/10"
              onClick={onDownload}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Get Android APK
            </Button>
          </div>

          <div className="text-xs text-white/50">
            Note: Default passwords are not shown on screen. Staff must change password on first login.
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-5 flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <div className="font-semibold">Fraud-Resistant QR</div>
                <div className="text-sm text-white/70">
                  Daily GroupShipmentId QR payload. Visible details only when scanned.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-5 flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <div className="font-semibold">Rider Navigation Mode</div>
                <div className="text-sm text-white/70">
                  70/30 map split with “Next Task” dock and KPI strip.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-5 flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-sky-400/15 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-sky-200" />
              </div>
              <div>
                <div className="font-semibold">Non‑Repudiable ePOD</div>
                <div className="text-sm text-white/70">
                  Signature image binds to GPS + altitude + network timestamp.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-white/50 flex items-center justify-between">
          <div>© 2026 Britium Express</div>
          <div className="flex gap-4">
            <button className="hover:text-white" onClick={() => navigate('/manual')}>Manual</button>
            <button className="hover:text-white" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
