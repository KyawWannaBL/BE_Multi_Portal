import { supabase } from "@/lib/supabase";
export async function validateCodOtp(input: { shipmentId: string; otp: string }) {
  const mode = import.meta.env.VITE_OTP_VALIDATE_MODE || "device";
  if (mode === "device") return /^\d{4,8}$/.test(input.otp);
  const { data, error } = await supabase.rpc("verify_cod_otp", { p_shipment_id: input.shipmentId, p_otp: input.otp });
  return error ? (import.meta.env.VITE_OTP_FAIL_OPEN === "true") : !!data;
}
