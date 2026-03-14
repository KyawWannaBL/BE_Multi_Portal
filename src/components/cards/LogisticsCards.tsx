import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  User,
  Weight,
  ArrowRight,
  Fuel,
  Wrench,
  LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shipment,
  FleetVehicle,
  formatDate,
  formatWeight,
} from "@/lib/index";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { springPresets, hoverLift } from "@/lib/motion";

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
  className,
}: MetricsCardProps) {
  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="h-full"
    >
      <Card
        className={cn(
          "h-full border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="font-mono text-2xl font-bold tracking-tight">{value}</div>

          {trend ? (
            <div className="mt-1 flex items-center space-x-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-500" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {trend.value}%
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          ) : null}

          {description ? (
            <p className="mt-2 text-xs leading-tight text-muted-foreground">
              {description}
            </p>
          ) : null}
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

export function ShipmentCard({
  shipment,
  onClick,
  className,
}: ShipmentCardProps) {
  const pickupAddress =
    typeof shipment.pickup_address === "string"
      ? JSON.parse(shipment.pickup_address)
      : shipment.pickup_address;

  const deliveryAddress =
    typeof shipment.delivery_address === "string"
      ? JSON.parse(shipment.delivery_address)
      : shipment.delivery_address;

  const packageDetails =
    typeof shipment.package_details === "string"
      ? JSON.parse(shipment.package_details)
      : shipment.package_details;

  const isPriority =
    shipment.priority === "urgent" || shipment.priority === "express";

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
          {isPriority ? <div className="h-full w-full bg-primary" /> : null}
        </div>

        <CardContent className="p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  {trackingNumber}
                </span>
                {isPriority ? (
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-[10px] uppercase text-primary"
                  >
                    Priority
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Created {formatDate(shipment.created_at)}
              </p>
            </div>

            <StatusBadge status={shipment.status} size="sm" />
          </div>

          <div className="mb-4 flex items-center space-x-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="my-1 h-8 w-px bg-border" />
              <div className="h-2 w-2 rounded-full border-2 border-primary" />
            </div>

            <div className="flex flex-1 flex-col space-y-3">
              <div className="text-sm">
                <span className="block leading-none font-medium text-foreground">
                  {pickupAddress?.city || pickupAddress?.address || shipment.origin}
                </span>
                <span className="text-xs text-muted-foreground">
                  Sender: {pickupAddress?.name || shipment.senderName}
                </span>
              </div>

              <div className="text-sm">
                <span className="block leading-none font-medium text-foreground">
                  {deliveryAddress?.city ||
                    deliveryAddress?.address ||
                    shipment.destination}
                </span>
                <span className="text-xs text-muted-foreground">
                  Receiver: {deliveryAddress?.name || shipment.receiverName}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div className="flex items-center space-x-2">
              <Weight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatWeight(weight)}
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                ETA:{" "}
                {estimatedDelivery
                  ? new Date(estimatedDelivery).toLocaleDateString()
                  : "TBD"}
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

export function FleetStatusCard({
  vehicle,
  className,
}: FleetStatusCardProps) {
  const getStatusColor = (status: FleetVehicle["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-500";
      case "MAINTENANCE":
        return "text-amber-500";
      case "IN_USE":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const VehicleIcon = () => {
    switch (vehicle.type) {
      case "TRUCK":
        return <Truck className="h-5 w-5" />;
      case "VAN":
        return <Package className="h-5 w-5" />;
      case "MOTORCYCLE":
        return <Truck className="h-5 w-5 rotate-12" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={cn(
        "border-border bg-card shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "rounded-lg bg-secondary p-2",
                getStatusColor(vehicle.status)
              )}
            >
              <VehicleIcon />
            </div>

            <div>
              <CardTitle className="font-mono text-sm font-bold">
                {vehicle.plateNumber}
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-wider">
                {vehicle.type}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold",
              vehicle.status === "ACTIVE"
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                : vehicle.status === "MAINTENANCE"
                ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                : "border-primary/20 bg-primary/5 text-primary"
            )}
          >
            {vehicle.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                <Fuel className="h-3 w-3" />
                <span>Fuel Level</span>
              </div>
              <span className="text-xs font-medium">{vehicle.fuelLevel}%</span>
            </div>
            <Progress value={vehicle.fuelLevel} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border/50 bg-muted/50 p-2">
              <div className="mb-1 flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  Location
                </span>
              </div>
              <p className="truncate font-mono text-[11px]">
                {vehicle.currentLocation.lat.toFixed(4)},{" "}
                {vehicle.currentLocation.lng.toFixed(4)}
              </p>
            </div>

            <div className="rounded-md border border-border/50 bg-muted/50 p-2">
              <div className="mb-1 flex items-center space-x-1">
                <Wrench className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  Last Svc
                </span>
              </div>
              <p className="truncate font-mono text-[11px]">
                {new Date(vehicle.lastService).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-2 border-t border-border p-4 pt-0">
        <div className="flex w-full items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {vehicle.assignedRiderId
                ? `Rider: ${vehicle.assignedRiderId.slice(0, 6)}`
                : "Unassigned"}
            </span>
          </div>

          <button className="flex items-center space-x-1 text-[10px] font-bold text-primary hover:underline">
            <span>Details</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}