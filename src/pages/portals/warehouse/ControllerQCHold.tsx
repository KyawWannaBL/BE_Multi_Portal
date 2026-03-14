import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import { controllerDecisionQcHold, listQCHoldTasks, type WhTask } from "@/services/warehousePlatform";
import { toast } from "@/components/ui/use-toast";

export default function ControllerQCHold() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<WhTask | null>(null);
  const [note, setNote] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await listQCHoldTasks("ALL"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tasks;
    return tasks.filter((x) => `${x.reference ?? ""} ${x.assigned_to_email ?? ""} ${(x.meta as any)?.qcResult ?? ""}`.toLowerCase().includes(qq));
  }, [tasks, q]);

  function openTask(x: WhTask) {
    setActive(x);
    setNote("");
    setOpen(true);
  }

  async function decide(decision: "RELEASE" | "REJECT") {
    if (!active) return;
    try {
      await controllerDecisionQcHold({ taskId: active.id, decision, note: note || null });
      setOpen(false);
      setActive(null);
      await refresh();
      toast({ title: t("Decision saved", "အတည်ပြုချက် သိမ်းပြီး"), description: decision });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("NO_BIN_CAPACITY")) {
        toast({
          title: t("No bin capacity available", "Bin capacity မလုံလောက်ပါ"),
          description: t("Increase capacity or adjust putaway rules.", "Capacity တိုးပါ သို့ Putaway rules ကို ပြင်ပါ။"),
          variant: "destructive" as any,
        });
      } else {
        toast({ title: t("Action failed", "မအောင်မြင်ပါ"), description: msg, variant: "destructive" as any });
      }
    }
  }

  return (
    <WarehouseShell title={t("QC Hold Approvals", "QC Hold Approvals")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("QC Hold Queue", "QC Hold Queue")}</div>
              <div className="text-xs text-white/60">{t("Release/Reject after QC submission.", "QC တင်ပြီးနောက် Release/Reject လုပ်ပါ။")}</div>
            </div>
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
          </CardContent>
        </Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-6 text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-white/60">{t("No QC holds.", "QC Hold မရှိပါ။")}</div>
              ) : (
                filtered.map((x) => (
                  <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-rose-500/30 text-rose-300 bg-rose-500/10">QC_HOLD</Badge>
                        <Badge variant="outline" className="border-white/10">REF: {x.reference ?? "—"}</Badge>
                        <Badge variant="outline" className="border-white/10">GRN: {(x.meta as any)?.grnId ?? "—"}</Badge>
                        <Badge variant="outline" className="border-white/10">{t("Status", "Status")}: {x.status}</Badge>
                      </div>
                      <div className="text-xs text-white/60 mt-2">
                        QC Result: {(x.meta as any)?.qcResult ?? "—"} • QC By: {(x.meta as any)?.qcBy ?? "—"} • TO: {(x.meta as any)?.suggestToLoc ?? "—"}
                      </div>
                    </div>
                    <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => openTask(x)}>{t("Review", "စစ်ဆေး")}</Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">
                {t("QC Decision", "QC Decision")} • {active?.reference ?? ""}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 text-sm text-white/70">
              <div>QC Result: <span className="text-white">{(active?.meta as any)?.qcResult ?? "—"}</span></div>
              <div>QC Note: <span className="text-white">{(active?.meta as any)?.qcNote ?? "—"}</span></div>
              <div>Suggested TO: <span className="text-white">{(active?.meta as any)?.suggestToLoc ?? "—"}</span></div>
              <div className="text-xs text-white/50">{t("Hard-stop will block Release if no bin fits.", "Bin မလုံလောက်လျှင် Release ကို ပိတ်ထားမည်။")}</div>
            </div>

            <Input className="bg-[#0B101B] border-white/10" placeholder={t("Decision note (optional)", "Decision note (optional)")} value={note} onChange={(e) => setNote(e.target.value)} />

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void decide("RELEASE")}>
                <ShieldCheck className="h-4 w-4 mr-2" /> {t("Release", "Release")}
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-500" onClick={() => void decide("REJECT")}>
                <ShieldX className="h-4 w-4 mr-2" /> {t("Reject", "Reject")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseShell>
  );
}
