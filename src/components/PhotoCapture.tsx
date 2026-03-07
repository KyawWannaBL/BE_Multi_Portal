import React from "react";
import { Camera } from "lucide-react";
import { Button } from "./ui/button";
export default function PhotoCapture({ onCapture }: any) {
  return (
    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-white/5">
      <Camera className="h-10 w-10 text-slate-500" />
      <Button variant="outline" onClick={() => onCapture("data:image/png;base64,mock")}>Capture Photo</Button>
    </div>
  );
}
