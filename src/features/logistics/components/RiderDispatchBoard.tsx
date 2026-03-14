import { Button } from "@/components/ui/button";
import type { RiderRecord } from "../types";

export function RiderDispatchBoard({
  riders,
  selectedRiderId,
  onSelect,
}: {
  riders: RiderRecord[];
  selectedRiderId?: string;
  onSelect: (id: string) => void;
}) {
  if (!Array.isArray(riders) || riders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        No riders found.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {riders.map((rider) => {
        const selected = rider.id === selectedRiderId;
        const loadPct =
          rider.maxCapacity > 0
            ? Math.min(100, (rider.currentLoad / rider.maxCapacity) * 100)
            : 0;

        return (
          <div
            key={rider.id}
            className={`rounded-xl border p-4 ${
              selected ? "border-primary ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{rider.name}</div>
                <div className="text-sm text-muted-foreground">
                  {rider.phone || "-"}
                </div>
              </div>

              <div
                className={`rounded-full px-2 py-1 text-xs ${
                  rider.online
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {rider.online ? "Online" : "Offline"}
              </div>
            </div>

            <div className="mt-3 text-sm">
              Load: {rider.currentLoad} / {rider.maxCapacity}
            </div>

            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${loadPct}%` }}
              />
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              Route: {rider.activeRouteCode || "-"}
            </div>

            <Button type="button" className="mt-4 w-full" onClick={() => onSelect(rider.id)}>
              {selected ? "Selected" : "Assign Rider"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default RiderDispatchBoard;