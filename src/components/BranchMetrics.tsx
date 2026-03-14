import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface BranchMetric {
  label: string
  value: string | number
}

export interface BranchMetricsProps {
  branchName: string
  metrics: BranchMetric[]
  className?: string
}

function BranchMetrics({
  branchName,
  metrics,
  className,
}: BranchMetricsProps) {
  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          {branchName}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-3 bg-muted/40 rounded-md">
            <p className="text-xs text-muted-foreground">
              {metric.label}
            </p>
            <p className="text-lg font-bold font-mono">
              {metric.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { BranchMetrics }
export default BranchMetrics