import { supabase } from "@/lib/supabase";

export async function setRoleClaim(input: { user_id: string; role: string }) {
  const res = await supabase.functions.invoke("set-role-claim", { body: input });
  if ((res as any).error) throw new Error((res as any).error.message);
  return (res as any).data;
}

export async function upsertStaffAssignment(input: {
  user_id: string;
  location_type: "BRANCH" | "WAREHOUSE" | "HQ";
  location_id: string;
  title?: string | null;
  is_active?: boolean;
}) {
  const { data, error } = await supabase
    .from("staff_assignments")
    .insert({
      user_id: input.user_id,
      location_type: input.location_type,
      location_id: input.location_id,
      title: input.title ?? null,
      is_active: input.is_active ?? true,
    })
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as any)?.id as string;
}
