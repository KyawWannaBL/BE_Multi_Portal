// @ts-nocheck
export const safeSelect = async (query: any) => {
  const { data, error } = await query;
  if (error) console.error("[Supabase Error]", error);
  return data;
};

export const isMissingRelation = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  return (
    msg.includes("not found") || 
    msg.includes("does not exist") || 
    error.code === "PGRST204" ||
    error.code === "42P01"
  );
};
