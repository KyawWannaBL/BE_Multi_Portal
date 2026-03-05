import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  Package,
  FileText,
  Printer,
  MapPin,
  UserCheck,
  XCircle,
  ShieldAlert,
  Archive,
  PackageCheck
} from 'lucide-react'

import {
  SHIPMENT_STATUS,
  TAG_STATUS,
  type ShipmentStatus,
  type TagStatus
} from '@/lib'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface StatusBadgeProps {
  status: ShipmentStatus | TagStatus
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<
  ShipmentStatus | TagStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  [SHIPMENT_STATUS.TT_ASSIGNED_AT_PICKUP]: {
    label: 'Tag Assigned',
    icon: ShieldAlert,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  [TAG_STATUS.IN_STOCK]: {
    label: 'In Stock',
    icon: Package,
    color: 'text-muted-foreground bg-muted border-border',
  },
}

function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  if (!config) return null

  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        config.color,
        sizeClasses[size]
      )}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span className="whitespace-nowrap">{config.label}</span>
    </div>
  )
}

export default StatusBadge
export { StatusBadge }