import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DataEntryFormProps {
  onSubmit?: (data: Record<string, any>) => void
  className?: string
}

function DataEntryForm({ onSubmit, className }: DataEntryFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    email: '',
  })

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Data Entry
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export { DataEntryForm }
export default DataEntryForm