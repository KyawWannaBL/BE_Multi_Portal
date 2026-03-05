import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Lock, ArrowRight, Truck } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl flex justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <Truck className="h-5 w-5" />
            <p className="font-semibold">Britium Express</p>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/tracking" className="text-white/70">Track & Trace</Link>
            <Link to="/services" className="text-white/70">Services</Link>
            <Link to="/login" className="bg-white/10 px-4 py-2 rounded-lg">Login</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-5xl font-bold">Reliable Nationwide Logistics</h1>
        <div className="mt-8 flex gap-3">
          <Button asChild className="bg-blue-600">
            <Link to="/quote">Calculate Rate <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/domestic">Domestic Express</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}