import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Download,
  Truck,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ROUTE_PATHS,
  Shipment,
  ShipmentStatus,
  SHIPMENT_STATUSES
} from '@/lib/index';
import { useEnterpriseShipments } from '@/hooks/useEnterpriseShipments';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, TrackingTimeline } from '@/components/TrackingComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Shipments() {
  const navigate = useNavigate();
  const { data: shipments = [], isLoading: shipmentsLoading } = useEnterpriseShipments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesSearch = 
        shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.receiverName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailOpen(true);
  };

  const columns = [
    {
      header: 'Tracking Number',
      accessorKey: 'trackingNumber',
      cell: (item: Shipment) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-primary">{item.trackingNumber}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Sender',
      accessorKey: 'senderName',
      cell: (item: Shipment) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.senderName}</span>
          <span className="text-xs text-muted-foreground">{item.senderCity}</span>
        </div>
      ),
    },
    {
      header: 'Receiver',
      accessorKey: 'receiverName',
      cell: (item: Shipment) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.receiverName}</span>
          <span className="text-xs text-muted-foreground">{item.receiverCity}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: Shipment) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Price / COD',
      accessorKey: 'price',
      cell: (item: Shipment) => (
        <div className="flex flex-col">
          <span className="font-semibold">£{item.price.toFixed(2)}</span>
          {item.codAmount > 0 && (
            <Badge variant="outline" className="w-fit text-[10px] h-4 mt-1 border-accent/30 text-accent">
              COD: £{item.codAmount}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (item: Shipment) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(item)}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Shipment Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                View Full Timeline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.TRACKING + `?id=${item.trackingNumber}`)}>
                Public Tracking Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Cancel Shipment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipment Management</h1>
          <p className="text-muted-foreground mt-1">
            Track, manage, and dispatch all active deliveries across the network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button 
            onClick={() => navigate(ROUTE_PATHS.CREATE_SHIPMENT)}
            className="bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tracking ID, sender or receiver..."
              className="pl-10 bg-background border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Shipments</DropdownMenuItem>
                {Object.values(SHIPMENT_STATUSES).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="ml-auto text-sm text-muted-foreground font-medium">
            Showing {filteredShipments.length} shipments
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredShipments} 
          searchPlaceholder="Search in results..."
        />
      </div>

      {/* Shipment Details Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto bg-background">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary border-none text-sm px-3 py-1">
                <Truck className="w-3 h-3 mr-2" />
                Logistics Detail
              </Badge>
              <StatusBadge status={selectedShipment?.status || SHIPMENT_STATUSES.PENDING} />
            </div>
            <SheetTitle className="text-2xl font-bold font-mono">
              {selectedShipment?.trackingNumber}
            </SheetTitle>
            <SheetDescription>
              Created on {selectedShipment && new Date(selectedShipment.createdAt).toLocaleString()}
            </SheetDescription>
          </SheetHeader>

          {selectedShipment && (
            <div className="mt-8 space-y-8">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Sender</p>
                  <p className="font-semibold">{selectedShipment.senderName}</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.senderAddress}</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.senderCity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Receiver</p>
                  <p className="font-semibold">{selectedShipment.receiverName}</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.receiverAddress}</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.receiverCity}</p>
                </div>
              </div>

              <Separator />

              {/* Package Details */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Package Information
                </h3>
                <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Weight</p>
                    <p className="font-medium">{selectedShipment.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Service Fee</p>
                    <p className="font-medium">£{selectedShipment.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Payment</p>
                    <p className="font-medium capitalize text-primary">{selectedShipment.paymentStatus}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tracking Timeline */}
              <div className="space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  Tracking History
                </h3>
                <TrackingTimeline shipment={selectedShipment} />
              </div>

              <div className="flex gap-3 pt-6">
                <Button className="flex-1 bg-primary">Print Label</Button>
                <Button variant="outline" className="flex-1">Edit Shipment</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
        &copy; 2026 Britium Express. All shipments are monitored via GPS Real-Time Protocol.
      </footer>
    </div>
  );
}
