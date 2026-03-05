import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QRScannerProps {
  onScan?: (value: string) => void
  className?: string
}

function QRScanner({ onScan, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsActive(true)
        setError(null)
      }
    } catch (err) {
      console.error(err)
      setError('Unable to access camera.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }

  const simulateScan = () => {
    // Replace with real QR logic if needed
    const fakeCode = 'QR-' + Date.now()
    onScan?.(fakeCode)
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          QR Scanner
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {isActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-md bg-black"
          />
        )}

        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startCamera}>Start Camera</Button>
          ) : (
            <Button variant="secondary" onClick={stopCamera}>
              Stop Camera
            </Button>
          )}

          <Button onClick={simulateScan}>
            Simulate Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { QRScanner }
export default QRScanner