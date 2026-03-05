import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Lock, ArrowRight, ShieldCheck, Truck, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState("");

  function handleTracking() {
    if (!trackingId.trim()) return;
    navigate(`/tracking/${trackingId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
      {/* ================= HEADER ================= */}
      <header className="w-full border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-wide">
                Britium Express
              </p>
              <p className="text-xs text-white/50">
                Enterprise Delivery Operations Platform
              </p>
            </div>
          </div>

          {/* Actions */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <button
              onClick={() => navigate("/tracking")}
              className="hover:text-white transition"
            >
              Public Tracking
            </button>

            <button
              onClick={() => navigate("/merchant")}
              className="hover:text-white transition"
            >
              Merchant Portal
            </button>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-white font-medium"
            >
              <Lock className="h-4 w-4" />
              Secure Login
            </button>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              The Gateway to Myanmar’s <br />
              Enterprise Express Delivery Network
            </h1>

            <p className="mt-5 text-lg text-white/70 max-w-xl">
              Track shipments publicly, while all operational workflows remain
              protected under enterprise-grade RBAC, audit enforcement, and
              approval controls.
            </p>

            {/* Tracking Box */}
            <Card className="mt-10 bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-medium text-white/80">
                  Track a Shipment (Public Access)
                </p>

                <div className="flex gap-3">
                  <Input
                    placeholder="Enter AWB / Tracking ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="bg-black/40 border-white/15 text-white"
                  />
                  <Button
                    onClick={handleTracking}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>

                <p className="text-xs text-white/40">
                  Customers may track shipments without authentication.
                </p>
              </CardContent>
            </Card>

            {/* Portal Access */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enter Operations Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate("/merchant")}
              >
                Merchant Access
              </Button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <EnterpriseCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Enterprise RBAC Enforcement"
              desc="Screen-level + API-level permissions with segregation of duties, approvals, and audit trails."
            />

            <EnterpriseCard
              icon={<Building2 className="h-6 w-6" />}
              title="Branch, Hub & Region Scoping"
              desc="Scope-based access (S1–S5) ensures staff only operate within assigned operational boundaries."
            />

            <EnterpriseCard
              icon={<Truck className="h-6 w-6" />}
              title="Real-Time Logistics Execution"
              desc="Pickup → Hub Scan → Dispatch → Delivery lifecycle with immutable scan events and compliance logging."
            />
          </div>
        </div>
      </section>

      {/* ================= MODULE OVERVIEW ================= */}
      <section className="border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-semibold">
            Operational Modules (Secure Access Required)
          </h2>

          <p className="mt-2 text-white/60 max-w-2xl">
            All workflows below require authenticated access and are governed by
            RBAC policies, approvals, and audit enforcement.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ModuleTile title="Shipment Booking & Control" tag="OPS-01 → OPS-07" />
            <ModuleTile title="Pickup & Dispatch Workflows" tag="PUP-01 → PUP-06" />
            <ModuleTile title="Hub Scanning & Sorting" tag="HUB-01 → HUB-07" />
            <ModuleTile title="Finance & COD Settlement" tag="FIN/BILL Modules" />
            <ModuleTile title="Claims & Dispute Resolution" tag="CLM-01 → CLM-04" />
            <ModuleTile title="Administration & RBAC Control" tag="SYS Only" />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row justify-between text-sm text-white/50">
          <p>© {new Date().getFullYear()} Britium Express. Enterprise Logistics Platform.</p>
          <p className="mt-2 md:mt-0">
            Secure Access • Audit Logging • RBAC Enforcement
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function EnterpriseCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-6 flex gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-white/60">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleTile({ title, tag }: { title: string; tag: string }) {
  return (
    <Card className="bg-black/40 border-white/10 hover:border-white/25 transition">
      <CardContent className="p-5">
        <p className="font-medium">{title}</p>
        <p className="mt-2 text-xs text-white/50">{tag}</p>
      </CardContent>
    </Card>
  );
}