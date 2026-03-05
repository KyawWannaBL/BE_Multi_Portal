import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Printer, Copy, Check } from "lucide-react";

export function QRCodeGenerator({
  data,
  size = 256,
  label,
  onGenerated,
}: {
  data: string;
  size?: number;
  label?: string;
  onGenerated?: (dataUrl: string) => void;
}) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const url = await QRCode.toDataURL(data, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "M",
      });
      setDataUrl(url);
      onGenerated?.(url);
    })().catch(() => {
      setDataUrl("");
      onGenerated?.("");
    });
  }, [data, size, onGenerated]);

  const copy = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `QR_${data}.png`;
    a.click();
  };

  const print = () => {
    if (!dataUrl) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Print QR</title>
      <style>@page{margin:0} body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh}</style>
      </head><body>
        <div style="text-align:center;font-family:Arial">
          ${label ? `<div style="font-weight:700;margin-bottom:8px">${label}</div>` : ""}
          <img src="${dataUrl}" style="width:${size}px;height:${size}px" />
          <div style="margin-top:8px;font-family:monospace">${data}</div>
        </div>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  return (
    <div className="space-y-3">
      {dataUrl ? (
        <div className="rounded-2xl border border-white/10 bg-white p-3 inline-block">
          <img src={dataUrl} alt="QR" style={{ width: size, height: size }} />
        </div>
      ) : (
        <div className="text-xs opacity-70">Generating QR...</div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" className="border-white/10 bg-black/30 hover:bg-white/5" onClick={copy}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" className="border-white/10 bg-black/30 hover:bg-white/5" onClick={download}>
          <Download className="h-4 w-4 mr-2" /> Download
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={print}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>
    </div>
  );
}
