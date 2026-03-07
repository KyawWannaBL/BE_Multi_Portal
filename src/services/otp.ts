import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type OtpValidationResult = {
  valid: boolean;
  mode: "server" | "device";
  reason?: string;
};

function envStr(key: string, fallback = ""): string {
  try {
    const v = (import.meta as any)?.env?.[key];
    return v == null ? fallback : String(v);
  } catch {
    return fallback;
  }
}

function envBool(key: string, fallback: boolean): boolean {
  const v = envStr(key, "");
  if (!v) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

function parseRpcBoolean(data: any): boolean | null {
  if (typeof data === "boolean") return data;
  if (data && typeof data === "object") {
    if (typeof data.ok === "boolean") return data.ok;
    if (typeof data.valid === "boolean") return data.valid;
    if (typeof data.is_valid === "boolean") return data.is_valid;
    if (data.data && typeof data.data.valid === "boolean") return data.data.valid;
  }
  return null;
}

/**
 * EN: Server-side OTP verification (enterprise). Device mode is fallback only.
 * MM: OTP ကို server-side မှ verify လုပ်ခြင်း (enterprise). Device mode သည် fallback ဖြစ်သည်။
 *
 * Config:
 * - VITE_OTP_VALIDATE_MODE=server|device (default device)
 * - VITE_OTP_FAIL_OPEN=true|false (default true)
 */
export async function validateCodOtp(input: { shipmentId: string; otp: string }): Promise<OtpValidationResult> {
  const mode = (envStr("VITE_OTP_VALIDATE_MODE", "device").toLowerCase() === "server" ? "server" : "device") as
    | "server"
    | "device";

  if (mode === "device") {
    // Device mode = syntactic validation only
    const ok = /^\d{4,8}$/.test(String(input.otp || "").trim());
    return { valid: ok, mode, reason: ok ? "FORMAT_OK" : "FORMAT_INVALID" };
  }

  // Server mode
  const failOpen = envBool("VITE_OTP_FAIL_OPEN", true);

  if (!isSupabaseConfigured) {
    return { valid: failOpen, mode, reason: "SUPABASE_NOT_CONFIGURED_FAIL_OPEN" };
  }

  const otp = String(input.otp || "").trim();
  const shipmentId = String(input.shipmentId || "").trim();
  if (!shipmentId || !otp) return { valid: false, mode, reason: "MISSING_INPUT" };

  try {
    const { data, error } = await supabase.rpc("verify_cod_otp", { p_shipment_id: shipmentId, p_otp: otp } as any);
    if (error) {
      return { valid: failOpen, mode, reason: `RPC_ERROR_${error.code ?? "X"}_FAIL_${failOpen ? "OPEN" : "CLOSED"}` };
    }
    const parsed = parseRpcBoolean(data);
    if (parsed === null) return { valid: failOpen, mode, reason: `RPC_UNPARSEABLE_FAIL_${failOpen ? "OPEN" : "CLOSED"}` };
    return { valid: parsed, mode, reason: parsed ? "RPC_VALID" : "RPC_INVALID" };
  } catch (e: any) {
    return { valid: failOpen, mode, reason: `RPC_THROW_${String(e?.message || e)}_FAIL_${failOpen ? "OPEN" : "CLOSED"}` };
  }
}
