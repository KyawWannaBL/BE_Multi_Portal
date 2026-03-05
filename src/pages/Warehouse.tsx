import React, { useState } from 'react';
import { 
  Package, 
  Scan, 
  Truck, 
  LayoutGrid, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Barcode,
  ClipboardList,
  MapPin
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { ROUTE_PATHS, SHIPMENT_STATUSES, Shipment } from '@/lib/index';
import {  } from '@/data/index';
import { useEnterpriseBranches } from '@/hooks/useEnterpriseBranches';
import { useEnterpriseShipments, fetchShipmentByTracking, fetchShipmentTracking } from '@/hooks/useEnterpriseShipments';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Warehouse() {
  const { data: branches = [] } = useEnterpriseBranches();
  const { data: shipments = [], isLoading: shipmentsLoading } = useEnterpriseShipments();
  const { data: shipments = [], isLoading: shipmentsLoading } = useEnterpriseShipments();
  const [scanValue, setScanValue] = useState('');
  const [lastScanned, setLastScanned] = useState<Shipment | null>(null);

  const warehouseShipments = shipments.filter(s => 
    s.status === SHIPMENT_STATUSES.ARRIVED_AT_WAREHOUSE || 
    s.status === SHIPMENT_STATUSES.PICKED_UP
  );

  const inventoryColumns = [
    {
      header: 'Tracking ID',
      accessorKey: 'trackingNumber',
      cell: (row: Shipment) => (
        <span className="font-mono font-medium text-primary">{row.trackingNumber}</span>
      ),
    },
    {
      header: 'Destination',
      accessorKey: 'receiverCity',
      cell: (row: Shipment) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{row.receiverCity}</span>
        </div>
      ),
    },
    {
      header: 'Weight',
      accessorKey: 'weight',
      cell: (row: Shipment) => `${row.weight} kg`,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: Shipment) => (
        <Badge variant={row.status === SHIPMENT_STATUSES.ARRIVED_AT_WAREHOUSE ? 'default' : 'secondary'}>
          {row.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: Shipment) => (
        <Button variant="ghost" size="sm">Process</Button>
      ),
    },
  ];

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const found = shipments.find(s => s.trackingNumber === scanValue);
    if (found) {
      setLastScanned(found);
    }
    setScanValue('');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Operations</h1>
          <p className="text-muted-foreground">Manage inbound packages, sorting, and dispatch manifests.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Last Sync: 2026-02-03 18:15:59
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Incoming Today</p>
                <h3 className="text-2xl font-bold">142</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Sorting</p>
                <h3 className="text-2xl font-bold">86</h3>
              </div>
              <div className="bg-accent/10 p-2 rounded-lg">
                <LayoutGrid className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready for Dispatch</p>
                <h3 className="text-2xl font-bold">54</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Scans</p>
                <h3 className="text-2xl font-bold text-destructive">3</h3>
              </div>
              <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbound" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="inbound" className="flex items-center gap-2">
            <Scan className="h-4 w-4" /> Inbound
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="sorting" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Sorting
          </TabsTrigger>
          <TabsTrigger value="manifest" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Manifest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbound" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
                 <img src={IMAGES.WAREHOUSE_OPS_3} alt="Warehouse" className="object-cover h-full" />
              </div>
              <CardHeader>
                <CardTitle>Inbound Scanner</CardTitle>
                <CardDescription>Scan tracking numbers to confirm arrival at hub.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScan} className="flex gap-2 mb-8">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Scan or enter tracking number..."
                      className="pl-10 h-12 text-lg font-mono"
                      value={scanValue}
                      onChange={(e) => setScanValue(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-8">Confirm</Button>
                </form>

                {lastScanned ? (
                  <div className="p-4 border rounded-xl bg-muted/30 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-lg">{lastScanned.trackingNumber}</p>
                        <Badge>Successfully Scanned</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {lastScanned.senderName} • Destination: {lastScanned.receiverCity}
                      </p>
                      <div className="flex gap-4 mt-3">
                        <div className="text-xs bg-white border px-2 py-1 rounded">Weight: {lastScanned.weight}kg</div>
                        <div className="text-xs bg-white border px-2 py-1 rounded">Zone: Northern-A</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                    <Scan className="h-10 w-10 mb-2 opacity-20" />
                    <p>Waiting for scanner input...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">BRX-2026-000{i}</p>
                      <p className="text-xs text-muted-foreground">Arrived from London Hub • 2m ago</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">View Full Log</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hub Inventory</CardTitle>
                <CardDescription>Current packages waiting for processing or dispatch.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex gap-2">
                <Search className="h-4 w-4" /> Filter by City
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={inventoryColumns} 
                data={warehouseShipments} 
                searchPlaceholder="Search inventory..." 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sorting">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['London', 'Manchester', 'Southampton', 'Liverpool', 'Birmingham', 'Bristol'].map((city) => (
              <Card key={city} className="group hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{city}</CardTitle>
                    <Badge variant="outline">{Math.floor(Math.random() * 25)} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Priority: High</span>
                    <Button variant="link" className="h-auto p-0 text-xs">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manifest">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Load Dispatch Manifest</CardTitle>
                <CardDescription>Assign packages to a vehicle or rider for final delivery or hub transfer.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Vehicle / Rider</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Truck BR-22 (Manchester Route)</option>
                        <option>Van LV-55 (Southampton Route)</option>
                        <option>Rider: Mike Thompson (Local Delivery)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destination Hub</label>
                      <select className="w-full p-2 border rounded-md">
                        {branches.map(b => (
                          <option key={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="border rounded-xl p-8 text-center text-muted-foreground bg-muted/10">
                    <img src={IMAGES.WAREHOUSE_OPS_6} alt="Manifest" className="w-32 h-32 mx-auto mb-4 object-cover rounded-lg opacity-40" />
                    <p>Select shipments from the inventory tab or scan them here to build your manifest.</p>
                    <Button variant="outline" className="mt-4">Add Shipments to List</Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost">Cancel</Button>
                    <Button className="px-10">Generate & Lock Manifest</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Load Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Weight</span>
                    <span className="font-medium">0.00 kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Volumetric</span>
                    <span className="font-medium">0.00 m³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items Count</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Load Capacity</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full w-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
