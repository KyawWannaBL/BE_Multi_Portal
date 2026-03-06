import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function EnterprisePortal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="relative h-screen w-full overflow-hidden text-white bg-black">
      {mounted && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-8 px-4">
        <div className="mx-auto w-24 h-24 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center mb-4 animate-in fade-in zoom-in duration-1000 shadow-2xl">
          <img src="/logo.png" alt="Britium Logo" className="w-16 h-16 object-contain" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
            BRITIUM <span className="text-emerald-500">EXPRESS</span>
          </h1>
          <p className="text-sm md:text-lg text-white/60 uppercase tracking-[0.3em] font-light">
            Enterprise Logistics Intelligence Platform
          </p>
        </div>

        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-7 text-xl font-bold rounded-2xl transition-all shadow-xl tracking-widest"
          onClick={() => navigate("/login")}
        >
          Enter Enterprise Portal
        </Button>
      </div>
    </div>
  );
}
