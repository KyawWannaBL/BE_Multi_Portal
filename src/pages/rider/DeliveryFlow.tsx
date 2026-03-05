import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Package,
  PenTool,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  User,
  XCircle,
} from 'lucide-react';

import {
  NDR_REASONS,
  PODRecord,
  ROUTE_PATHS,
  SHIPMENT_STATUS,
  Shipment,
} from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import PhotoCapture from '@/components/PhotoCapture';
import QRScanner from '@/components/QRScanner';
import SignaturePad from '@/components/SignaturePad';

type GeoEvidence = {
  lat: number;
  lng: number;
  accuracyM: number;
  altitudeM: number | null;
  altitudeAccuracyM: number | null;
  heading: number | null;
  speedMps: number | null;
  capturedAtIso: string;
};

type NetworkTimeEvidence = {
  networkValidatedAtIso: string;
  source: 'api' | 'server-date-header' | 'local-fallback';
};

async function getHighPrecisionLocation(): Promise<GeoEvidence | null> {
  if (!('geolocation' in navigator)) return null;

  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = pos.coords;
        resolve({
          lat: c.latitude,
          lng: c.longitude,
          accuracyM: c.accuracy,
          altitudeM: c.altitude ?? null,
          altitudeAccuracyM: c.altitudeAccuracy ?? null,
          heading: c.heading ?? null,
          speedMps: c.speed ?? null,
          capturedAtIso: new Date().toISOString(),
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

/**
 * Network-validated timestamp:
 * - Preferred: /api/time -> { nowIso }
 * - Fallback: same-origin HEAD Date header
 * - Last resort: device time
 */
async function getNetworkValidatedTime(): Promise<NetworkTimeEvidence> {
  try {
    const res = await fetch('/api/time', { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json().catch(() => null);
      if (j?.nowIso) return { networkValidatedAtIso: String(j.nowIso), source: 'api' };
    }
  } catch {}

  try {
    const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
    const date = res.headers.get('date');
    if (date) return { networkValidatedAtIso: new Date(date).toISOString(), source: 'server-date-header' };
  } catch {}

  return { networkValidatedAtIso: new Date().toISOString(), source: 'local-fallback' };
}

const BRITIUM_BLUE_GUARD =
  'focus-visible:ring-4 focus-visible:ring-[rgba(0,102,255,0.75)] focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const BRITIUM_BIG_PRIMARY =
  'w-full h-14 text-lg font-semibold shadow-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 hover:opacity-95';

type Step = 'scan' | 'details' | 'pod' | 'ndr';

export default function DeliveryFlow() {
  const navigate = useNavigate();
  const { user, legacyUser } = useAuth();

  const [step, setStep] = useState<Step>('scan');
  const [shipment, setShipment] = useState<Shipment | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const [geoEvidence, setGeoEvidence] = useState<GeoEvidence | null>(null);
  const [netTime, setNetTime] = useState<NetworkTimeEvidence | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const otpRef = useRef<HTMLInputElement>(null);
  const recipientNameRef = useRef<HTMLInputElement>(null);

  const [podData, setPodData] = useState<PODRecord>({
    recipientName: '',
    relationship: '',
    signature: '',
    photo: '',
  });

  const [ndrData, setNdrData] = useState({
    reason: '',
    remarks: '',
  });

  const riderId = legacyUser?.id || user?.id || 'unknown';

  const shipmentRequiresOtp = useMemo(() => Boolean(shipment?.cod?.required), [shipment]);
  const canSubmitDelivery = useMemo(() => {
    if (!podData.recipientName || !podData.signature) return false;
    if (shipmentRequiresOtp && !otpVerified) return false;
    return true;
  }, [podData.recipientName, podData.signature, shipmentRequiresOtp, otpVerified]);

  // Prefetch GPS + network time once we reach POD step (bind to signature evidence)
  useEffect(() => {
    let cancelled = false;
    if (step !== 'pod') return;

    (async () => {
      const [gps, nt] = await Promise.all([getHighPrecisionLocation(), getNetworkValidatedTime()]);
      if (cancelled) return;
      setGeoEvidence(gps);
      setNetTime(nt);
    })();

    return () => { cancelled = true; };
  }, [step]);

  // Focus-forward: OTP after sending; Recipient name on POD
  useEffect(() => {
    if (otpSent && !otpVerified) {
      setTimeout(() => otpRef.current?.focus(), 50);
    }
  }, [otpSent, otpVerified]);

  useEffect(() => {
    if (step === 'pod') {
      setTimeout(() => recipientNameRef.current?.focus(), 50);
    }
  }, [step]);

  const notify = useCallback((type: 'success' | 'error' | 'warn', message: string) => {
    // Minimal, no dependency. Replace with sonner/toast if you want.
    if (type === 'error') {
      console.error(message);
      window.alert(message);
      return;
    }
    if (type === 'warn') console.warn(message);
    else console.log(message);
  }, []);

  const handleScan = useCallback((code: string) => {
    // Demo lookup: accept any AWB; in real app query Supabase/Firestore.
    // Keep existing UX: proceed to details view.
    const demoShipment: Shipment = {
      ...(shipment as any),
      id: (shipment as any)?.id || code,
      awb: code,
      status: (shipment as any)?.status || SHIPMENT_STATUS?.OUT_FOR_DELIVERY || 'OUT_FOR_DELIVERY',
      receiver: (shipment as any)?.receiver || { name: 'Customer', phone: '09xxxxxxxxx' },
      address: (shipment as any)?.address || 'Customer address',
      cod: (shipment as any)?.cod || { required: false, amount: 0, currency: 'MMK' },
    } as any;

    setShipment(demoShipment);
    setStep('details');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpValue('');
    setPodData({ recipientName: '', relationship: '', signature: '', photo: '' });
    setNdrData({ reason: '', remarks: '' });
  }, [shipment]);

  const handleSendOtp = useCallback(() => {
    if (!shipment) return;
    setOtpSent(true);
    notify('success', 'OTP sent (demo: use 1234).');
  }, [shipment, notify]);

  const handleVerifyOtp = useCallback(() => {
    if (otpValue.trim() === '1234') {
      setOtpVerified(true);
      notify('success', 'OTP verified.');
    } else {
      notify('error', 'Invalid OTP. Use 1234 for demo.');
    }
  }, [otpValue, notify]);

  const handleDeliver = useCallback(async () => {
    if (!shipment) return;
    if (!canSubmitDelivery) {
      notify('error', 'Recipient name and signature are required. COD shipments also require OTP verification.');
      return;
    }

    setSubmitting(true);
    try {
      const gps = geoEvidence ?? (await getHighPrecisionLocation());
      const nt = netTime ?? (await getNetworkValidatedTime());

      const signatureEvidence = {
        signaturePngBase64: podData.signature, // or store signatureUrl instead
        networkValidatedAtIso: nt.networkValidatedAtIso,
        networkTimeSource: nt.source,
        gps, // null if denied/unavailable
        device: { userAgent: navigator.userAgent },
      };

      const nonRepudiablePODPayload = {
        shipmentId: (shipment as any)?.id ?? shipment.awb,
        awb: shipment.awb,
        riderId,
        recipientName: podData.recipientName,
        relationship: podData.relationship,
        otpVerified,
        cod: shipment.cod ?? null,
        photo: podData.photo ?? null,
        signature: signatureEvidence,
        createdAtIso: new Date().toISOString(),
      };

      // TODO: Persist it (Supabase insert / API call).
      // await supabase.from('pod_records').insert(nonRepudiablePODPayload)
      console.log('POD_PAYLOAD', nonRepudiablePODPayload);

      notify('success', 'Delivery Completed Successfully');
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (e: any) {
      notify('error', e?.message ?? 'Failed to submit delivery');
    } finally {
      setSubmitting(false);
    }
  }, [shipment, canSubmitDelivery, notify, navigate, riderId, podData, otpVerified, geoEvidence, netTime]);

  const handleNDR = useCallback(() => {
    if (!ndrData.reason) {
      notify('error', 'Please select a reason for failed delivery');
      return;
    }
    console.log('NDR', { shipmentId: (shipment as any)?.id ?? shipment?.awb, ...ndrData });
    notify('warn', 'NDR recorded. Shipment will be returned to hub.');
    navigate(ROUTE_PATHS.DASHBOARD);
  }, [ndrData, notify, navigate, shipment]);

  // ===== UI =====

  if (step === 'scan') {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Last-Mile Delivery</h1>
          <p className="text-muted-foreground">Scan AWB QR code at the doorstep</p>
        </div>

        <QRScanner onScan={handleScan} expectedType="AWB" />

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => setStep('scan')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Rescan
        </Button>
        {shipment?.awb && (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {shipment.awb}
          </Badge>
        )}
      </div>

      {/* DETAILS */}
      {step === 'details' && shipment && (
        <div className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Recipient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Name</p>
                  <p className="font-medium">{(shipment as any)?.receiver?.name ?? '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {(shipment as any)?.receiver?.phone ?? '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Address</p>
                <p className="font-medium flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  {(shipment as any)?.address ?? '—'}
                </p>
              </div>

              {shipment?.cod?.required && (
                <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="font-semibold">COD Verification Required</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Amount:{' '}
                      <span className="font-semibold text-foreground">
                        {shipment.cod?.amount ?? 0} {shipment.cod?.currency ?? ''}
                      </span>
                    </p>

                    {!otpSent ? (
                      <Button className={BRITIUM_BIG_PRIMARY} onClick={handleSendOtp}>
                        <Send className="mr-2 h-4 w-4" /> Send OTP
                      </Button>
                    ) : (
                      <Badge className={otpVerified ? 'bg-emerald-600' : 'bg-yellow-500'}>
                        {otpVerified ? 'OTP Verified' : 'OTP Sent'}
                      </Badge>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2 space-y-2">
                        <Label className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" /> Enter OTP (demo: 1234)
                        </Label>
                        <Input
                          ref={otpRef}
                          className={BRITIUM_BLUE_GUARD}
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          placeholder="••••"
                        />
                      </div>
                      <Button className={BRITIUM_BIG_PRIMARY} onClick={handleVerifyOtp}>
                        Verify OTP
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-14"
                onClick={() => setStep('ndr')}
              >
                <XCircle className="mr-2 h-4 w-4" /> Failed Delivery
              </Button>

              <Button
                className={`flex-1 ${BRITIUM_BIG_PRIMARY}`}
                onClick={() => setStep('pod')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Proceed to POD
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* POD */}
      {step === 'pod' && shipment && (
        <div className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-primary" />
                Proof of Delivery (ePOD)
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Signature will be bound to GPS + altitude + network-validated timestamp.
                </p>
                <div className="text-xs text-muted-foreground">
                  Time source: <span className="font-semibold text-foreground">{netTime?.source ?? 'pending'}</span>
                  {' · '}
                  GPS: <span className="font-semibold text-foreground">{geoEvidence ? `±${Math.round(geoEvidence.accuracyM)}m` : 'pending/denied'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  ref={recipientNameRef}
                  className={BRITIUM_BLUE_GUARD}
                  value={podData.recipientName}
                  onChange={(e) => setPodData((p) => ({ ...p, recipientName: e.target.value }))}
                  placeholder="Receiver full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  className={BRITIUM_BLUE_GUARD}
                  value={podData.relationship}
                  onChange={(e) => setPodData((p) => ({ ...p, relationship: e.target.value }))}
                  placeholder="Self / Family / Office / Guard"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Doorstep Photo (optional)
                </Label>
                <PhotoCapture
                  onCapture={(photo) => setPodData((p) => ({ ...p, photo }))}
                  watermarkData={{
                    ttId: (shipment as any)?.tamperTagId,
                    userId: riderId,
                    timestamp: netTime?.networkValidatedAtIso ?? new Date().toISOString(),
                    gps: geoEvidence
                      ? `${geoEvidence.lat.toFixed(6)}, ${geoEvidence.lng.toFixed(6)} (±${Math.round(geoEvidence.accuracyM)}m)`
                      : 'GPS unavailable',
                  }}
                  required={false}
                />
              </div>

              <div className="space-y-2">
                <Label>Customer Signature</Label>
                <SignaturePad
                  onSave={(sig) => setPodData((p) => ({ ...p, signature: sig }))}
                />
                {!podData.signature && (
                  <p className="text-xs text-muted-foreground">Ask customer to sign on the pad.</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('details')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              <Button
                className={`flex-1 ${BRITIUM_BIG_PRIMARY}`}
                onClick={handleDeliver}
                disabled={!canSubmitDelivery || submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Delivery'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* NDR */}
      {step === 'ndr' && shipment && (
        <div className="space-y-6">
          <Card className="card-modern border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Non-Delivery Report (NDR)
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select
                  value={ndrData.reason}
                  onValueChange={(v) => setNdrData((p) => ({ ...p, reason: v }))}
                >
                  <SelectTrigger className={BRITIUM_BLUE_GUARD}>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {NDR_REASONS?.map((r: string) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  className={BRITIUM_BLUE_GUARD}
                  value={ndrData.remarks}
                  onChange={(e) => setNdrData((p) => ({ ...p, remarks: e.target.value }))}
                  placeholder="Any detail for return/reattempt"
                />
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('details')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button className={`flex-1 h-14 bg-destructive hover:opacity-95`} onClick={handleNDR}>
                Submit NDR
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
