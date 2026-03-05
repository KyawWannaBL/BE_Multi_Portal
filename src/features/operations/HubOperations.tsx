import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Package, QrCode, Truck, ArrowRight, Clock } from 'lucide-react';

export default function HubOperations() {
  const mockInboundPackages = [
    { awb: 'HUB123456789', origin: 'Mumbai Hub', destination: 'Delhi Hub', status: 'arrived' },
    { awb: 'HUB987654321', origin: 'Chennai Hub', destination: 'Bangalore Hub', status: 'sorting' },
    { awb: 'HUB456789123', origin: 'Kolkata Hub', destination: 'Hyderabad Hub', status: 'pending' }
  ];

  const mockOutboundBags = [
    { bagId: 'BAG001', destination: 'Delhi Hub', packages: 25, status: 'sealed' },
    { bagId: 'BAG002', destination: 'Mumbai Hub', packages: 18, status: 'packing' },
    { bagId: 'BAG003', destination: 'Chennai Hub', packages: 32, status: 'ready' }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Building2 className="h-6 w-6" />
          Hub Operations Center
        </h1>
        <p className="text-muted-foreground">Inbound scanning and sorting operations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Inbound Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <QrCode className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">142</p>
            <p className="text-sm text-muted-foreground">Scanned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Bags Sealed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">14</p>
            <p className="text-sm text-muted-foreground">Pending Sort</p>
          </CardContent>
        </Card>
      </div>

      {/* Inbound Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inbound Packages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockInboundPackages.map((pkg) => (
            <div key={pkg.awb} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-mono font-medium">{pkg.awb}</p>
                  <p className="text-sm text-muted-foreground">
                    {pkg.origin} <ArrowRight className="h-3 w-3 inline mx-1" /> {pkg.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    pkg.status === 'arrived' ? 'default' : 
                    pkg.status === 'sorting' ? 'secondary' : 'outline'
                  }
                >
                  {pkg.status}
                </Badge>
                <Button size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outbound Bags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Outbound Bags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockOutboundBags.map((bag) => (
            <div key={bag.bagId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{bag.bagId}</p>
                  <p className="text-sm text-muted-foreground">
                    To: {bag.destination} • {bag.packages} packages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    bag.status === 'sealed' ? 'default' : 
                    bag.status === 'ready' ? 'secondary' : 'outline'
                  }
                >
                  {bag.status}
                </Badge>
                <Button size="sm" variant="outline">
                  {bag.status === 'sealed' ? 'Dispatch' : 'Seal Bag'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20">
          <div className="text-center">
            <QrCode className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Bulk Inbound Scan</p>
          </div>
        </Button>
        <Button variant="outline" className="h-20">
          <div className="text-center">
            <Package className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Sort Packages</p>
          </div>
        </Button>
        <Button variant="outline" className="h-20">
          <div className="text-center">
            <Truck className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Create Bag</p>
          </div>
        </Button>
        <Button variant="outline" className="h-20">
          <div className="text-center">
            <Building2 className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Hub Reports</p>
          </div>
        </Button>
      </div>
    </div>
  );
}