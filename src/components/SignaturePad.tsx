import React from "react";
import { Button } from "./ui/button";
export default function SignaturePad({ onSave }: any) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl h-32 flex items-center justify-center italic text-xs text-white/30">
      <Button variant="ghost" size="sm" onClick={() => onSave("mock_sig")}>Tap to sign (mock)</Button>
    </div>
  );
}
