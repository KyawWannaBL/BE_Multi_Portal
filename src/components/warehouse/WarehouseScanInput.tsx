import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Keyboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  label: string;
  placeholder?: string;
  onValue: (value: string) => void;
  normalize?: (raw: string) => string;
};

export function WarehouseScanInput({ label, placeholder, onValue, normalize }: Props) {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState("");

  const Scanner = useMemo(async () => {
    try {
      const mod = await import("@/components/QRCodeScanner");
      return (mod as any).default || (mod as any).QRCodeScanner;
    } catch {
      return null;
    }
  }, []);

  const norm = (v: string) => (normalize ? normalize(v) : v.trim());

  return (
    <div className="flex items-center gap-2">
      <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => setOpen(true)}>
        <QrCode className="h-4 w-4 mr-2" />
        {t("Scan", "Scan")}
      </Button>

      <div className="flex-1">
        <Input
          className="bg-[#05080F] border-white/10"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder={placeholder ?? label}
        />
      </div>

      <Button
        variant="outline"
        className="border-white/10"
        onClick={() => {
          const v = norm(manual);
          if (v) onValue(v);
          setManual("");
        }}
      >
        <Keyboard className="h-4 w-4 mr-2" />
        {t("Use", "သုံးမည်")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-black tracking-widest uppercase">{label}</DialogTitle>
          </DialogHeader>

          <React.Suspense fallback={<div className="p-6 text-white/60">Loading scanner…</div>}>
            <ScannerGate onScan={(raw) => { onValue(norm(raw)); setOpen(false); }} />
          </React.Suspense>

          <DialogFooter>
            <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>
              {t("Close", "ပိတ်")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScannerGate({ onScan }: { onScan: (raw: string) => void }) {
  const [Comp, setComp] = useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@/components/QRCodeScanner");
        if (mounted) setComp(() => (mod as any).default || (mod as any).QRCodeScanner);
      } catch {
        if (mounted) setComp(() => null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!Comp) {
    return <div className="p-6 text-white/60">Scanner not available. Use manual input.</div>;
  }

  return <Comp continuous={false} onScan={onScan} />;
}

export default WarehouseScanInput;
