import React, { useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { setRoleClaim, upsertStaffAssignment } from "@/services/hrAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HrAdminOpsPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [authUserId, setAuthUserId] = useState("");
  const [role, setRole] = useState("WAREHOUSE_MANAGER");

  const [publicUserId, setPublicUserId] = useState("");
  const [locType, setLocType] = useState<"BRANCH" | "WAREHOUSE" | "HQ">("BRANCH");
  const [locId, setLocId] = useState("");
  const [title, setTitle] = useState("Staff");

  async function doRoleClaim() {
    setErr(null); setMsg(null); setBusy(true);
    try {
      await setRoleClaim({ user_id: authUserId.trim(), role: role.trim() });
      setMsg("✅ EN: Role claim updated. User must re-login to refresh token. | MY: Role claim ပြောင်းပြီးပါပြီ။ ပြန် login လုပ်ပါ။");
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally { setBusy(false); }
  }

  async function doAssign() {
    setErr(null); setMsg(null); setBusy(true);
    try {
      const id = await upsertStaffAssignment({
        user_id: publicUserId.trim(),
        location_type: locType,
        location_id: locId.trim(),
        title: title || null,
        is_active: true,
      });
      setMsg(`✅ EN: Assignment created: ${id.slice(0,8)}… | MY: Assignment ဖန်တီးပြီးပါပြီ`);
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally { setBusy(false); }
  }

  return (
    <PortalShell
      title="HR Admin • Enterprise Ops"
      links={[{ to: "/portal/hr", label: "HR Portal" }]}
    >
      <div className="space-y-5">
        {err ? <div className="text-xs text-red-300">Error: {err}</div> : null}
        {msg ? <div className="text-xs text-emerald-300">{msg}</div> : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">1) Set Role Claim (Auth) / Role Claim ပြောင်းခြင်း</div>
          <div className="text-xs opacity-70 mt-1">
            EN: Uses edge function set-role-claim to update JWT app_metadata.role. <br/>
            MY: set-role-claim edge function ဖြင့် JWT app_metadata.role ကိုပြောင်းမည်။
          </div>

          <div className="mt-4 grid gap-3">
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="auth.user id (UUID)" value={authUserId} onChange={(e)=>setAuthUserId(e.target.value)} />
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="role (e.g. WAREHOUSE_MANAGER)" value={role} onChange={(e)=>setRole(e.target.value)} />
            <Button disabled={busy} onClick={() => void doRoleClaim()} className="h-11 rounded-xl bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black">
              Apply Role
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">2) Staff Assignment / အလုပ်တာဝန်ချမှတ်ခြင်း</div>
          <div className="text-xs opacity-70 mt-1">
            EN: Assign public.users.id to a BRANCH/WAREHOUSE so QR ops auto-fills location. <br/>
            MY: public.users.id ကို BRANCH/WAREHOUSE နဲ့ချိတ်ပြီး QR ops မှာ location auto-fill ဖြစ်စေမယ်။
          </div>

          <div className="mt-4 grid gap-3">
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="public.users id (UUID)" value={publicUserId} onChange={(e)=>setPublicUserId(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm" value={locType} onChange={(e)=>setLocType(e.target.value as any)}>
                <option value="BRANCH">BRANCH</option>
                <option value="WAREHOUSE">WAREHOUSE</option>
                <option value="HQ">HQ</option>
              </select>
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="location_id (UUID)" value={locId} onChange={(e)=>setLocId(e.target.value)} />
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>
            <Button disabled={busy} onClick={() => void doAssign()} className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black">
              Create Assignment
            </Button>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
