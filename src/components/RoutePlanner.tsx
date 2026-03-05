import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

const RoutePlanner = () => {
  const [loading, setLoading] = useState(false);

  const optimizeRoutes = async (city: string) => {
    setLoading(true);
    
    try {
      // 1. Fetch pending orders for the selected city
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('id, township, address')
        .eq('city', city)
        .eq('status', 'pending');

      if (fetchError || !orders || orders.length === 0) {
        toast.error(fetchError ? "Database fetch error" : `No pending orders in ${city}`);
        return;
      }

      // 2. Optimization Logic: Sequence by Township
      const sortedOrders = [...orders].sort((a, b) => 
        (a.township || "").localeCompare(b.township || "")
      );

      // 3. Prepare sequence updates
      const updates = sortedOrders.map((order, index) => ({
        id: order.id,
        route_sequence: index + 1,
      }));

      // 4. Batch update sequences in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .upsert(updates);

      if (updateError) throw updateError;

      // 5. Enterprise Audit Logging
      await createAuditLog(
        'ROUTE_OPTIMIZE', 
        `System-wide route optimization executed for ${city}`,
        { orderCount: orders.length, city }
      );

      // 6. Conditional Messaging to RIDERS
      if (import.meta.env.VITE_ENABLE_ROUTE_MESSAGING === 'true') {
        await supabase.from('notifications').insert({
          title: "New Delivery Sequence",
          message: `The delivery route for ${city} has been optimized. Check your app for updates.`,
          target_role: "RIDER",
          city: city
        });
        toast.success(`Success: ${orders.length} orders planned and riders notified.`);
      } else {
        toast.success(`Planned ${orders.length} orders for ${city}.`);
      }

    } catch (err: any) {
      console.error("Route Planning Error:", err);
      toast.error(`System Error: ${err.message || "Failed to optimize routes"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-card p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-luxury-gold/10 rounded-lg">
          <MapPin className="h-5 w-5 text-luxury-gold" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-luxury-cream">Route Optimization</h3>
          <p className="text-sm text-white/40">Enterprise Sequencing Engine</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Yangon', 'Mandalay', 'Naypyidaw'].map((city) => (
          <Button
            key={city}
            disabled={loading}
            onClick={() => optimizeRoutes(city)}
            className="h-14 bg-white/5 border border-white/10 hover:bg-luxury-gold hover:text-luxury-obsidian transition-all group"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-white/40 group-hover:text-luxury-obsidian/60">Execute</span>
                <span className="font-bold">{city}</span>
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RoutePlanner;