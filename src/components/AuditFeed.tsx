import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib'
import { cn } from '@/lib/utils'

export interface AuditItem {
  id: string
  action: string
  user: string
  timestamp: string
}

export interface AuditFeedProps {
  items: AuditItem[]
  className?: string
}

function AuditFeed({ items, className }: AuditFeedProps) {
  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Audit Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No activity recorded.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-md bg-muted/40 border border-border"
          >
            <p className="text-sm font-medium">{item.action}</p>
            <p className="text-xs text-muted-foreground">
              {item.user} • {formatDate(item.timestamp)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { AuditFeed }
export default AuditFeed