import type { PostgrestError } from "@supabase/supabase-js";

export function assertOk<T>(res: { data: T | null; error: PostgrestError | null }, msg: string): T {
  if (res.error) throw new Error(`${msg}: ${res.error.message}`);
  return res.data as T;
}

export function isMissingRelation(error: any): boolean {
  const code = (error as any)?.code;
  return code === "42P01";
}

export function isMissingColumn(error: any): boolean {
  const code = (error as any)?.code;
  return code === "42703";
}
