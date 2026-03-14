import { useMemo } from "react";
import { Package, TrendingUp, Truck, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
  description: string;
  icon: React.ReactNode;
};

function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[1.5rem] overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">{icon}</div>
          {change && (
            <Badge
              variant="outline"
              className="border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37] font-mono"
            >
              {change}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-serif font-bold text-white">{value}</h3>
          <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">
            {title}
          </p>
          <p className="text-xs text-white/50">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MerchantPortal() {
  const navigate = useNavigate();

  // Placeholder metrics (replace with real queries)
  const metrics = useMemo(
    () => [
      {
        title: "Active Shipments",
        value: "128",
        change: "+6%",
        description: "Currently in transit or pending handoff.",
        icon: <Truck className="h-5 w-5" />,
      },
      {
        title: "Delivered Today",
        value: "42",
        change: "+3",
        description: "Completed last-mile deliveries.",
        icon: <Package className="h-5 w-5" />,
      },
      {
        title: "Conversion",
        value: "18.4%",
        change: "+0.7%",
        description: "Successful checkout to shipment creation.",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        title: "Customer Tickets",
        value: "7",
        description: "Open support requests.",
        icon: <Users className="h-5 w-5" />,
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Merchant Portal</h1>
          <p className="text-white/40 text-sm">Operational summary and quick actions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/reports")}>Analytics</Button>
          <Button onClick={() => navigate("/operations")}>New Shipment</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>
    </div>
  );
}
