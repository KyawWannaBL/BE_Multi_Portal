import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

export function SignaturePad({
  onChange,
}: {
  onChange: (dataUrl: string) => void;
}) {
  const ref = useRef<SignatureCanvas | null>(null);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="black"
          canvasProps={{
            width: 520,
            height: 180,
            className: "h-[180px] w-full",
          }}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => ref.current?.clear()}
        >
          Clear
        </Button>

        <Button
          type="button"
          onClick={() => {
            const data = ref.current
              ?.getTrimmedCanvas()
              .toDataURL("image/png");
            if (data) onChange(data);
          }}
        >
          Save Signature
        </Button>
      </div>
    </div>
  );
}

export default SignaturePad;