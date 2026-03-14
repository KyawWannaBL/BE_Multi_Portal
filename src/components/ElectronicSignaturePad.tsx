import React, { useRef, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eraser, CheckCircle2, Camera, User, Package, Calendar } from 'lucide-react';
import { PhotoCapture } from '@/components/PhotoCapture';
import { formatDate } from '@/lib/index';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/motion';

interface ElectronicSignaturePadProps {
  parcelId: string;
  riderId: string;
  onSignatureComplete?: (data: { signature: string; photo: string | null; timestamp: string }) => void;
}

export function ElectronicSignaturePad({
  parcelId,
  riderId,
  onSignatureComplete,
}: ElectronicSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTimestamp = new Date().toISOString();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2.5;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleCapture = (photo: string) => {
    setCapturedPhoto(photo);
    setShowPhotoCapture(false);
  };

  const handleSave = async () => {
    if (!hasSignature) return;
    
    setIsSubmitting(true);
    const canvas = canvasRef.current;
    const signatureData = canvas?.toDataURL('image/png') || '';

    if (onSignatureComplete) {
      onSignatureComplete({
        signature: signatureData,
        photo: capturedPhoto,
        timestamp: currentTimestamp,
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="luxury-card w-full max-w-2xl overflow-hidden border-border bg-card">
      <CardHeader className="border-b border-border/50 bg-secondary/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-heading flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Proof of Delivery
          </CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[10px]">
            2026 Fleet Standard
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-3 w-3" /> Parcel ID
            </Label>
            <p className="font-mono text-sm font-medium">{parcelId}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3 w-3" /> Authorized Rider
            </Label>
            <p className="text-sm font-medium">{riderId}</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Completion Time
            </Label>
            <p className="text-sm font-medium">{formatDate(currentTimestamp)}</p>
          </div>
        </div>

        <Separator className="opacity-10" />

        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Receiver Signature
          </Label>
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 bg-luxury-light-obsidian rounded-xl border border-border/40 cursor-crosshair touch-none shadow-inner"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSignature}
                className="h-8 w-8 rounded-full bg-background/50 backdrop-blur hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <p className="text-sm font-light italic">Sign here to confirm receipt</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Delivery Evidence Photo
          </Label>
          <AnimatePresence mode="wait">
            {showPhotoCapture ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={springPresets.gentle}
                className="rounded-xl overflow-hidden"
              >
                <PhotoCapture
                  onCapture={handleCapture}
                />
                <Button
                  variant="link"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setShowPhotoCapture(false)}
                >
                  Cancel Photo
                </Button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/30 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors group">
                {capturedPhoto ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img src={capturedPhoto} alt="POD evidence" className="w-full h-full object-cover" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPhotoCapture(true)}
                      className="absolute bottom-2 right-2 luxury-glass"
                    >
                      Retake Photo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 mx-auto w-fit group-hover:scale-110 transition-transform">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Attach Visual Evidence</p>
                      <p className="text-xs text-muted-foreground">Take a photo of the delivered parcel at the location</p>
                    </div>
                    <Button
                      onClick={() => setShowPhotoCapture(true)}
                      variant="outline"
                      className="border-primary/20 hover:border-primary/50"
                    >
                      Capture Photo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="p-6 border-t border-border/50 bg-secondary/30 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-border/50"
          onClick={clearSignature}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          className="flex-1 luxury-button !py-0 h-11"
          onClick={handleSave}
          disabled={!hasSignature || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Complete Delivery'}
        </Button>
      </CardFooter>
    </Card>
  );
}
