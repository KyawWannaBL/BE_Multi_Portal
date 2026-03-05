import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("id") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber) setSearchParams({ id: trackingNumber });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Package /> Track Your Shipment
            </h1>
            <p className="opacity-80 mt-2">Enter your tracking number below to see real-time status updates.</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input 
                placeholder="BRX-XXXX-XXXX" 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-14 text-lg font-mono"
              />
              <Button type="submit" size="lg" className="h-14 px-8 bg-blue-600">Track</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}