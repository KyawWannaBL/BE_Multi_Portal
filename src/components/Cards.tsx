import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Calendar, 
  User, 
  Weight, 
  ArrowRight,
  Fuel,
  Wrench,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shipment, 
  FleetVehicle, 
  formatDate, 
  formatWeight, 
  ROUTE_PATHS 
} from '@/lib/index';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { springPresets, hoverLift } from '@/lib/motion';

/**
 * MetricsCard: High-density KPI display for dashboard analytics.
 */
interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function MetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  className 
}: MetricsCardProps) {
  return (    <motion.div 
      variants={hoverLift} 
      initial="rest" 
      whileHover="hover"
      className="h-full"
    >
      <Card className={cn("h-full border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight">{value}</div>
          {trend && (
            <div className="flex items-center mt-1 space-x-1">
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-500" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
          {description && (
            <p className="mt-2 text-xs text-muted-foreground leading-tight">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * ShipmentCard: Comprehensive shipment summary for lists and tracking views.
 */
interface ShipmentCardProps {
  shipment: Shipment;
  onClick?: (id: string) => void;
  className?: string;
}

export function ShipmentCard({ shipment, onClick, className }: ShipmentCardProps) {
  // Handle Supabase data structure with JSON fields
  const pickupAddress = typeof shipment.pickup_address === 'string' 
    ? JSON.parse(shipment.pickup_address) 
    : shipment.pickup_address;
  const deliveryAddress = typeof shipment.delivery_address === 'string' 
    ? JSON.parse(shipment.delivery_address) 
    : shipment.delivery_address;
  const packageDetails = typeof shipment.package_details === 'string' 
    ? JSON.parse(shipment.package_details) 
    : shipment.package_details;

  const isPriority = shipment.priority === 'urgent' || shipment.priority === 'express';
  const trackingNumber = shipment.awb_number || shipment.trackingNumber;
  const weight = packageDetails?.weight || shipment.weight || 0;
  const estimatedDelivery = shipment.estimated_delivery;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => onClick?.(shipment.id)}
    >
      <Card className={cn("overflow-hidden border-border bg-card shadow-sm", className)}>
        <div className="h-1 bg-primary/20">
          {isPriority && <div className="h-full bg-primary w-full" />}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-bold text-foreground">
                  {trackingNumber}
                </span>
                {isPriority && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase">
                    Priority
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created {formatDate(shipment.created_at)}
              </p>
            </div>
            <StatusBadge status={shipment.status} size="sm" />
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-px h-8 bg-border my-1" />
              <div className="w-2 h-2 rounded-full border-2 border-primary" />
            </div>
            <div className="flex flex-col space-y-3 flex-1">
              <div className="text-sm">
                <span className="font-medium text-foreground block leading-none">
                  {pickupAddress?.city || pickupAddress?.address || shipment.origin}
                </span>
                <span className="text-xs text-muted-foreground">
                  Sender: {pickupAddress?.name || shipment.senderName}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground block leading-none">
                  {deliveryAddress?.city || deliveryAddress?.address || shipment.destination}
                </span>
                <span className="text-xs text-muted-foreground">
                  Receiver: {deliveryAddress?.name || shipment.receiverName}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Weight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatWeight(weight)}</span>
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                ETA: {estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : 'TBD'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * FleetStatusCard: Real-time vehicle status and telemetrics display.
 */
interface FleetStatusCardProps {
  vehicle: FleetVehicle;
  className?: string;
}

export function FleetStatusCard({ vehicle, className }: FleetStatusCardProps) {
  const getStatusColor = (status: FleetVehicle['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-500';
      case 'MAINTENANCE': return 'text-amber-500';
      case 'IN_USE': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const VehicleIcon = () => {
    switch (vehicle.type) {
      case 'TRUCK': return <Truck className="w-5 h-5" />;
      case 'VAN': return <Package className="w-5 h-5" />;
      case 'MOTORCYCLE': return <Truck className="w-5 h-5 rotate-12" />; // Generic representation
      default: return <Truck className="w-5 h-5" />;
    }
  };

  return (
    <Card className={cn("border-border bg-card shadow-sm hover:shadow-md transition-all", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg bg-secondary", getStatusColor(vehicle.status))}>
              <VehicleIcon />
            </div>
            <div>
              <CardTitle className="text-sm font-mono font-bold">{vehicle.plateNumber}</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-wider">{vehicle.type}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px] font-bold", 
            vehicle.status === 'ACTIVE' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : 
            vehicle.status === 'MAINTENANCE' ? "border-amber-500/20 text-amber-500 bg-amber-500/5" : 
            "border-primary/20 text-primary bg-primary/5"
          )}>
            {vehicle.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                <Fuel className="w-3 h-3" />
                <span>Fuel Level</span>
              </div>
              <span className="text-xs font-medium">{vehicle.fuelLevel}%</span>
            </div>
            <Progress value={vehicle.fuelLevel} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-md bg-muted/50 border border-border/50">
              <div className="flex items-center space-x-1 mb-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">Location</span>
              </div>
              <p className="text-[11px] font-mono truncate">{vehicle.currentLocation.lat.toFixed(4)}, {vehicle.currentLocation.lng.toFixed(4)}</p>
            </div>
            <div className="p-2 rounded-md bg-muted/50 border border-border/50">
              <div className="flex items-center space-x-1 mb-1">
                <Wrench className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-medium text-muted-foreground">Last Svc</span>
              </div>
              <p className="text-[11px] font-mono truncate">{new Date(vehicle.lastService).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t border-border mt-2">
        <div className="flex items-center justify-between w-full pt-2">
          <div className="flex items-center space-x-2">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {vehicle.assignedRiderId ? `Rider: ${vehicle.assignedRiderId.slice(0, 6)}` : 'Unassigned'}
            </span>
          </div>
          <button className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
