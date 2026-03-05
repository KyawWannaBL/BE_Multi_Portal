import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, QrCode, Phone, ChevronRight, Package } from 'lucide-react';

export default function CourierApp() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-zinc-100 p-6 font-sans">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif italic text-white tracking-tight">Active Dispatches</h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-1">Premium Logistics Unit</p>
        </div>
        <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
          <span className="text-[#D4AF37] font-bold text-sm tracking-tighter">BE</span>
        </div>
      </header>

      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="relative group">
            {/* The "Glow" behind luxury cards */}
            <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <Card className="relative bg-white/5 border-white/10 overflow-hidden backdrop-blur-sm rounded-[2rem]">
              <CardContent className="p-0">
                <div className="p-8 flex justify-between items-start">
                  <div className="space-y-4">
                    <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-[10px] tracking-widest uppercase px-3 py-1">
                      Priority Elite
                    </Badge>
                    <div>
                      <h3 className="text-xl font-medium text-white mb-1">Platinum Residence 4B</h3>
                      <p className="text-zinc-400 text-sm flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-[#D4AF37]" /> Downtown Central District
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest">ETA</p>
                    <p className="text-white font-light text-2xl tracking-tighter">12:45</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 border-t border-white/10">
                  <button className="py-5 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all">
                    <Navigation className="h-4 w-4 text-[#D4AF37]" /> Route
                  </button>
                  <button className="py-5 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest bg-white/[0.02] hover:bg-[#D4AF37] hover:text-black transition-all duration-500">
                    <QrCode className="h-4 w-4" /> Scan AWB
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Floating Action Button for Luxury Mobile Feel */}
      <div className="fixed bottom-8 right-8">
        <button className="h-16 w-16 bg-[#D4AF37] rounded-full shadow-[0_20px_40px_rgba(212,175,55,0.3)] flex items-center justify-center text-black active:scale-90 transition-transform">
          <Package className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}