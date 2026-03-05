import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import PermissionGate from "@/components/PermissionGate";

type ProfileRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  is_demo?: boolean | null;
  branch_id?: string | null;
};

export default function AdminUsers() {
  const { user, role, branch_id } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);

  const canManage = role === "APP_OWNER" || role === "SUPER_ADMIN";

  const loadProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase.from("profiles").select("id,email,role,is_active,is_demo,branch_id").order("created_at", { ascending: false });

      // Branch isolation (SUPER_ADMIN limited to own branch)
      if (role !== "APP_OWNER" && branch_id) {
        query = query.eq("branch_id", branch_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProfiles((data as any) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, role, branch_id]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ is_active: !current }).eq("id", id);

    // Best-effort audit log (ignore errors)
    try {
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: "USER_STATUS_CHANGE",
        table_name: "profiles",
        record_id: id,
        new_data: { is_active: !current },
      });
    } catch {
      // no-op
    }

    loadProfiles();
  };

  if (!canManage) {
    return <div className="p-10 text-red-400 font-bold">Enterprise Access Only</div>;
  }

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Enterprise User Control</h1>
        <Button variant="outline" onClick={loadProfiles}>
          Refresh
        </Button>
      </div>

      <div className="luxury-card p-6 overflow-x-auto">
        <table className="w-full text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Environment</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-2">{p.email}</td>
                <td className="py-2">{p.role}</td>
                <td className="py-2">{p.is_active ? "Active" : "Inactive"}</td>
                <td className="py-2">{p.is_demo ? "Demo" : "Production"}</td>
                <td className="py-2 text-right">
                  <PermissionGate permission="users.manage">
                    <Button size="sm" variant="secondary" onClick={() => toggleActive(p.id, Boolean(p.is_active))}>
                      Toggle
                    </Button>
                  </PermissionGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
