import type { RackCell } from "../types";

function getHeatClass(ratio: number) {
  if (ratio >= 0.9) return "bg-rose-500 text-white";
  if (ratio >= 0.7) return "bg-orange-500 text-white";
  if (ratio >= 0.4) return "bg-yellow-400 text-black";
  return "bg-emerald-500 text-white";
}

export function WarehouseRackHeatmap({ racks }: { racks: RackCell[] }) {
  if (!Array.isArray(racks) || racks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        No rack data found.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {racks.map((rack) => {
        const ratio =
          rack.capacity > 0 ? rack.occupiedCount / rack.capacity : 0;

        return (
          <div
            key={rack.rackCode}
            className={`rounded-xl p-4 ${getHeatClass(ratio)}`}
          >
            <div className="text-sm font-semibold">{rack.rackCode}</div>
            <div className="text-xs opacity-90">{rack.zone}</div>
            <div className="mt-2 text-2xl font-bold">
              {rack.occupiedCount} / {rack.capacity}
            </div>
            <div className="mt-1 text-xs">
              Utilization: {(ratio * 100).toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WarehouseRackHeatmap;