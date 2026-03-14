import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Camera, MapPin, Clock, FileText, RotateCcw } from 'lucide-react';

export type ExceptionType = 
  | 'customer_not_available'
  | 'address_incorrect'
  | 'refused_delivery'
  | 'damaged_package'
  | 'security_issue'
  | 'weather_delay'
  | 'vehicle_breakdown'
  | 'other';

export interface DeliveryException {
  id: string;
  awb: string;
  exceptionType: ExceptionType;
  reason: string;
  evidencePhoto?: string;
  notes?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  attemptNumber: number;
  nextAction: 'retry' | 'rto' | 'hold' | 'escalate';
  reportedBy: string;
}

interface ExceptionConfig {
  label: string;
  description: string;
  requiresPhoto: boolean;
  maxAttempts: number;
  nextAction: 'retry' | 'rto' | 'hold' | 'escalate';
}

const EXCEPTION_CONFIGS: Record<ExceptionType, ExceptionConfig> = {
  customer_not_available: {
    label: 'Customer Not Available',
    description: 'Customer not present at delivery address',
    requiresPhoto: false,
    maxAttempts: 3,
    nextAction: 'retry'
  },
  address_incorrect: {
    label: 'Incorrect Address',
    description: 'Address details are wrong or incomplete',
    requiresPhoto: true,
    maxAttempts: 2,
    nextAction: 'hold'
  },
  refused_delivery: {
    label: 'Delivery Refused',
    description: 'Customer refused to accept the package',
    requiresPhoto: false,
    maxAttempts: 1,
    nextAction: 'rto'
  },
  damaged_package: {
    label: 'Package Damaged',
    description: 'Package is visibly damaged',
    requiresPhoto: true,
    maxAttempts: 1,
    nextAction: 'escalate'
  },
  security_issue: {
    label: 'Security Concern',
    description: 'Safety or security issue at delivery location',
    requiresPhoto: true,
    maxAttempts: 1,
    nextAction: 'escalate'
  },
  weather_delay: {
    label: 'Weather Delay',
    description: 'Delivery delayed due to weather conditions',
    requiresPhoto: false,
    maxAttempts: 3,
    nextAction: 'retry'
  },
  vehicle_breakdown: {
    label: 'Vehicle Breakdown',
    description: 'Delivery vehicle breakdown or technical issue',
    requiresPhoto: false,
    maxAttempts: 1,
    nextAction: 'escalate'
  },
  other: {
    label: 'Other',
    description: 'Other delivery exception not listed above',
    requiresPhoto: true,
    maxAttempts: 2,
    nextAction: 'hold'
  }
};

interface DeliveryExceptionHandlerProps {
  awb: string;
  receiverName: string;
  deliveryAddress: string;
  attemptNumber: number;
  onSubmit: (exception: Omit<DeliveryException, 'id' | 'timestamp' | 'reportedBy'>) => void;
  onCancel: () => void;
}

export function DeliveryExceptionHandler({
  awb,
  receiverName,
  deliveryAddress,
  attemptNumber,
  onSubmit,
  onCancel
}: DeliveryExceptionHandlerProps) {
  const [exceptionType, setExceptionType] = useState<ExceptionType | ''>('');
  const [reason, setReason] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Get GPS coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('GPS not available:', error);
        }
      );
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCapturingPhoto(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access failed. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturingPhoto(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setEvidencePhoto(photoData);
        stopCamera();
      }
    }
  };

  const handleSubmit = () => {
    if (!exceptionType || !reason.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedConfig = EXCEPTION_CONFIGS[exceptionType as ExceptionType];
    if (selectedConfig.requiresPhoto && !evidencePhoto) {
      alert('Photo evidence is required for this exception type');
      return;
    }

    const exception: Omit<DeliveryException, 'id' | 'timestamp' | 'reportedBy'> = {
      awb,
      exceptionType: exceptionType as ExceptionType,
      reason,
      evidencePhoto: evidencePhoto || undefined,
      notes: notes || undefined,
      gpsCoordinates: gpsCoordinates || undefined,
      attemptNumber,
      nextAction: selectedConfig.nextAction
    };

    onSubmit(exception);
  };

  const getNextActionDescription = (action: string) => {
    switch (action) {
      case 'retry': return 'Schedule retry delivery';
      case 'rto': return 'Return to origin';
      case 'hold': return 'Hold for customer contact';
      case 'escalate': return 'Escalate to supervisor';
      default: return 'Review required';
    }
  };

  const selectedConfig = exceptionType ? EXCEPTION_CONFIGS[exceptionType as ExceptionType] : null;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delivery Exception
          </CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              AWB: <span className="font-mono font-medium">{awb}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Receiver: {receiverName}
            </p>
            <p className="text-sm text-muted-foreground">
              Address: {deliveryAddress}
            </p>
            <Badge variant="outline" className="text-orange-600">
              Attempt #{attemptNumber}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exception Type Selection */}
          <div className="space-y-2">
            <Label>Exception Type *</Label>
            <Select value={exceptionType} onValueChange={(value: ExceptionType) => setExceptionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select exception type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXCEPTION_CONFIGS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedConfig && (
              <p className="text-xs text-muted-foreground">
                {selectedConfig.description}
              </p>
            )}
          </div>

          {/* Exception Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide specific details about the exception..."
              rows={3}
            />
          </div>

          {/* Photo Evidence */}
          {selectedConfig?.requiresPhoto && (
            <div className="space-y-2">
              <Label>Photo Evidence * <Badge variant="outline" className="ml-2">Required</Badge></Label>
              {!evidencePhoto ? (
                <div className="space-y-2">
                  {!isCapturingPhoto ? (
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Evidence Photo
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <video
                        ref={videoRef}
                        className="w-full aspect-video bg-black rounded-lg"
                        playsInline
                        muted
                      />
                      <div className="flex gap-2">
                        <Button onClick={capturePhoto} className="flex-1">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                        <Button variant="outline" onClick={stopCamera}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <img
                    src={evidencePhoto}
                    alt="Exception evidence"
                    className="w-full aspect-video object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEvidencePhoto(null);
                      startCamera();
                    }}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Photo
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Optional Photo for Non-Required Cases */}
          {selectedConfig && !selectedConfig.requiresPhoto && (
            <div className="space-y-2">
              <Label>Photo Evidence (Optional)</Label>
              {!evidencePhoto ? (
                <Button variant="outline" onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo Evidence
                </Button>
              ) : (
                <div className="space-y-2">
                  <img
                    src={evidencePhoto}
                    alt="Exception evidence"
                    className="w-full aspect-video object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setEvidencePhoto(null)}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Remove Photo
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information that might be helpful..."
              rows={2}
            />
          </div>

          {/* Next Action Info */}
          {selectedConfig && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Action:</strong> {getNextActionDescription(selectedConfig.nextAction)}
                {attemptNumber >= selectedConfig.maxAttempts && (
                  <div className="mt-2 text-red-600 font-medium">
                    ⚠️ Maximum attempts reached. This will trigger RTO process.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Location and Time Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {gpsCoordinates ? (
                <span>GPS: {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}</span>
              ) : (
                <span className="text-red-500">GPS: Not available</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!exceptionType || !reason.trim() || (selectedConfig?.requiresPhoto && !evidencePhoto)}
            >
              Submit Exception
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}