import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FleetStatusProps {
  status: string
  className?: string
}

function FleetStatus({ status, className }: FleetStatusProps) {
  const getVariant = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'IN_USE':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'MAINTENANCE':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'INACTIVE':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-bold uppercase tracking-wide',
        getVariant(),
        className
      )}
    >
      {status.replace('_', ' ')}
    </Badge>
  )
}

export { FleetStatus }
export default FleetStatus