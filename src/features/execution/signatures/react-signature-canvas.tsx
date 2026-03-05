import SignatureCanvas from "react-signature-canvas";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRef } from "react";

export default function SignaturePad({ deliveryId }: { deliveryId: string }) {
  const sigRef = useRef<SignatureCanvas>(null);

  const saveSignature = async () => {
    const canvas = sigRef.current?.getTrimmedCanvas();
    if (!canvas) return;

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    const path = `signatures/${deliveryId}.png`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob, { contentType: "image/png" });
    const url = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "deliveries", deliveryId), {
      signatureUrl: url,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{ width: 320, height: 140, style: { border: "1px solid #ccc" } }}
      />
      <button onClick={() => sigRef.current?.clear()}>Clear</button>
      <button onClick={saveSignature}>Save</button>
    </div>
  );
}
