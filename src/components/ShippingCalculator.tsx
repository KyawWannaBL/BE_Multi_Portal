import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ShippingCalculatorProps {
  className?: string
}

function ShippingCalculator({ className }: ShippingCalculatorProps) {
  const [weight, setWeight] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0)
  const [cost, setCost] = useState<number | null>(null)

  const calculate = () => {
    // Simple pricing logic (replace with real business logic)
    const baseRate = 5
    const weightRate = weight * 0.5
    const distanceRate = distance * 0.2
    setCost(baseRate + weightRate + distanceRate)
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Shipping Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />

        <Input
          type="number"
          placeholder="Distance (km)"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
        />

        <Button onClick={calculate}>Calculate</Button>

        {cost !== null && (
          <p className="text-sm font-mono">
            Estimated Cost: ${cost.toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { ShippingCalculator }
export default ShippingCalculator