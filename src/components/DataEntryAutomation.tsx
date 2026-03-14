import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface DataEntryAutomationProps {
  onRun?: () => void
  className?: string
}

function DataEntryAutomation({
  onRun,
  className,
}: DataEntryAutomationProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Data Entry Automation
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Button onClick={onRun}>
          Run Automation
        </Button>
      </CardContent>
    </Card>
  )
}

export { DataEntryAutomation }
export default DataEntryAutomation