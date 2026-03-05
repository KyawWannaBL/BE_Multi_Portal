// Simplified Shipments component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Shipments() {
  const mockShipments = [
    {
      id: '1',
      awb: 'EDS20241201001',
      status: 'BOOKED',
      senderName: 'John Doe',
      receiverName: 'Jane Smith',
      weight: 2.5,
      serviceType: 'express'
    },
    {
      id: '2', 
      awb: 'EDS20241201002',
      status: 'DELIVERED',
      senderName: 'Alice Johnson',
      receiverName: 'Bob Wilson',
      weight: 1.8,
      serviceType: 'standard'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">Manage and track all shipments</p>
        </div>
        <Button className="btn-modern">
          <Package className="mr-2 h-4 w-4" />
          Create Shipment
        </Button>
      </div>

      <div className="grid gap-4">
        {mockShipments.map((shipment) => (
          <Card key={shipment.id} className="card-modern">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-mono">{shipment.awb}</CardTitle>
                    <p className="text-sm text-muted-foreground">Express Delivery</p>
                  </div>
                </div>
                <Badge variant={shipment.status === 'DELIVERED' ? 'default' : 'secondary'}>
                  {shipment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">FROM</p>
                  <p className="font-medium">{shipment.senderName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">TO</p>
                  <p className="font-medium">{shipment.receiverName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {shipment.weight}kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {shipment.serviceType}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Track</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}