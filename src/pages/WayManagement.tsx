import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { DeliveryTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Truck,
  Package,
  Warehouse,
  AlertTriangle,
  MapPinned,
  Route,
  ScanLine,
  ClipboardCheck,
  TimerReset,
  ShieldAlert,
} from "lucide-react";
import { useDeliveryWays, type DeliveryWay } from "@/hooks/useDeliveryWays";

const VALID_TABS = [
  "pickup",
  "delivery",
  "failed",
  "return",
  "parcel",
  "transit",
  "tracking",
] as const;

type WayTab = (typeof VALID_TABS)[number];

type OpsSummary = {
  activeRiders: number;
  pickupQueue: number;
  deliveryQueue: number;
  warehouseQueue: number;
  failedQueue: number;
  returnQueue: number;
  transitCount: number;
  slaWarning: number;
  slaBreached: number;
  anomalyCount: number;
};

type RiderLiveBoard = {
  id: string;
  name: string;
  phone?: string;
  online: boolean;
  currentLoad: number;
  maxCapacity: number;
  activeRouteCode?: string;
  zone?: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function getWayStatus(way: DeliveryWay): string {
  return normalize(way.status || way.way_status || way.delivery_status);
}

function getWayCode(way: DeliveryWay): string {
  return String(way.way_id || way.code || way.id || "");
}

function exportWaysToCsv(filename: string, rows: DeliveryWay[]) {
  if (!rows.length) return;

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const escaped = String((row as any)[header] ?? "").replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function KpiCard({
  icon,
  title,
  value,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
      disabled={!onClick}
    >
      <Card className={onClick ? "transition hover:border-primary hover:shadow-sm" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription>{title}</CardDescription>
            <div className="text-muted-foreground">{icon}</div>
          </div>
          <CardTitle className="text-3xl">{value}</CardTitle>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </CardHeader>
      </Card>
    </button>
  );
}

function RiderBoard({
  riders,
  bi,
}: {
  riders: RiderLiveBoard[];
  bi: (en: string, my: string) => string;
}) {
  if (!riders.length) {
    return (
      <EmptyState
        message={bi("No rider activity found.", "Rider လှုပ်ရှားမှု မတွေ့ပါ။")}
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {riders.map((rider) => {
        const loadPct =
          rider.maxCapacity > 0
            ? Math.min(100, (rider.currentLoad / rider.maxCapacity) * 100)
            : 0;

        return (
          <div key={rider.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{rider.name}</div>
                <div className="text-sm text-muted-foreground">
                  {rider.phone || "-"}
                </div>
              </div>
              <Badge variant={rider.online ? "default" : "secondary"}>
                {rider.online
                  ? bi("Online", "အွန်လိုင်း")
                  : bi("Offline", "အော့ဖ်လိုင်း")}
              </Badge>
            </div>

            <div className="mt-3 text-sm">
              {bi("Route", "လမ်းကြောင်း")} : {rider.activeRouteCode || "-"}
            </div>
            <div className="mt-1 text-sm">
              {bi("Zone", "နယ်မြေ")} : {rider.zone || "-"}
            </div>
            <div className="mt-3 text-sm">
              {bi("Load", "လက်ရှိဝန်")} : {rider.currentLoad} / {rider.maxCapacity}
            </div>

            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${loadPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WayManagement() {
  const { bi } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = params.get("tab");
    return VALID_TABS.includes(value as WayTab) ? (value as WayTab) : "pickup";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<WayTab>(initialTab);
  const [opsSummary, setOpsSummary] = useState<OpsSummary>({
    activeRiders: 0,
    pickupQueue: 0,
    deliveryQueue: 0,
    warehouseQueue: 0,
    failedQueue: 0,
    returnQueue: 0,
    transitCount: 0,
    slaWarning: 0,
    slaBreached: 0,
    anomalyCount: 0,
  });
  const [riders, setRiders] = useState<RiderLiveBoard[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const {
    ways,
    pickupWays,
    deliveryWays,
    failedWays,
    returnWays,
    parcelWays,
    transitWays,
    trackingWays,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshWays,
  } = useDeliveryWays();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  async function loadCommandCenter() {
    try {
      setSummaryLoading(true);
      setSummaryError("");

      const [summaryRes, ridersRes] = await Promise.all([
        axios.get("/api/v1/ops/way-management-summary"),
        axios.get("/api/v1/dispatch/riders/live-board"),
      ]);

      setOpsSummary({
        activeRiders: Number(summaryRes.data?.activeRiders || 0),
        pickupQueue: Number(summaryRes.data?.pickupQueue || 0),
        deliveryQueue: Number(summaryRes.data?.deliveryQueue || 0),
        warehouseQueue: Number(summaryRes.data?.warehouseQueue || 0),
        failedQueue: Number(summaryRes.data?.failedQueue || 0),
        returnQueue: Number(summaryRes.data?.returnQueue || 0),
        transitCount: Number(summaryRes.data?.transitCount || 0),
        slaWarning: Number(summaryRes.data?.slaWarning || 0),
        slaBreached: Number(summaryRes.data?.slaBreached || 0),
        anomalyCount: Number(summaryRes.data?.anomalyCount || 0),
      });

      setRiders(Array.isArray(ridersRes.data?.items) ? ridersRes.data.items : []);
    } catch (err: any) {
      setSummaryError(
        err?.response?.data?.message ||
          err?.message ||
          bi("Failed to load command center.", "Command center ကို မရယူနိုင်ပါ။")
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    void loadCommandCenter();
  }, []);

  const activeWays = useMemo(() => {
    switch (activeTab) {
      case "pickup":
        return pickupWays;
      case "delivery":
        return deliveryWays;
      case "failed":
        return failedWays;
      case "return":
        return returnWays;
      case "parcel":
        return parcelWays;
      case "transit":
        return transitWays;
      case "tracking":
        return trackingWays;
      default:
        return [];
    }
  }, [
    activeTab,
    pickupWays,
    deliveryWays,
    failedWays,
    returnWays,
    parcelWays,
    transitWays,
    trackingWays,
  ]);

  const getStatusCounts = (waysList: DeliveryWay[]) => {
    return {
      total: waysList.length,
      toAssign: waysList.filter((w) => getWayStatus(w) === "to-assign").length,
      assigned: waysList.filter((w) => getWayStatus(w) === "assigned").length,
      onWay: waysList.filter((w) => {
        const status = getWayStatus(w);
        return status === "on-way" || status === "in-transit" || status === "transit";
      }).length,
      successful: waysList.filter((w) => getWayStatus(w) === "successful").length,
      canceled: waysList.filter((w) => getWayStatus(w) === "canceled").length,
    };
  };

  const handleTabChange = (value: string) => {
    const nextTab = VALID_TABS.includes(value as WayTab)
      ? (value as WayTab)
      : "pickup";

    setActiveTab(nextTab);

    const params = new URLSearchParams(location.search);
    params.set("tab", nextTab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleRowClick = (way: DeliveryWay) => {
    const code = getWayCode(way);
    if (!code) return;

    switch (activeTab) {
      case "pickup":
        navigate(`/pickup-execution?way=${encodeURIComponent(code)}`);
        break;
      case "parcel":
        navigate(`/warehouse-receiving?way=${encodeURIComponent(code)}`);
        break;
      case "delivery":
      case "failed":
      case "return":
        navigate(`/delivery-flow?way=${encodeURIComponent(code)}`);
        break;
      case "tracking":
      case "transit":
        navigate(`/tracking-map?way=${encodeURIComponent(code)}`);
        break;
      default:
        navigate(`/execution/way/${encodeURIComponent(code)}`);
    }
  };

  const handleExport = () => {
    exportWaysToCsv(`way-management-${activeTab}.csv`, activeWays);
  };

  const handleRefreshAll = async () => {
    await Promise.all([refreshWays(), loadCommandCenter()]);
  };

  const renderStatusCards = (waysList: DeliveryWay[]) => {
    const counts = getStatusCounts(waysList);

    return (
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{bi("Total Ways", "Way စုစုပေါင်း")}</CardDescription>
            <CardTitle className="text-3xl">{counts.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{bi("To Assign", "သတ်မှတ်ရန်")}</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {counts.toAssign}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{bi("Assigned", "သတ်မှတ်ပြီး")}</CardDescription>
            <CardTitle className="text-3xl text-accent">{counts.assigned}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{bi("On Way", "လမ်းတွင်")}</CardDescription>
            <CardTitle className="text-3xl text-primary">{counts.onWay}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{bi("Successful", "အောင်မြင်")}</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{counts.successful}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{bi("Canceled", "ပယ်ဖျက်")}</CardDescription>
            <CardTitle className="text-3xl text-destructive">{counts.canceled}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {bi("Way Management Command Center", "Way စီမံခန့်ခွဲမှု Command Center")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {bi(
                "Control pickup, warehouse, dispatch, transit, delivery proof, SLA, and exceptions from one bilingual enterprise console.",
                "Pickup၊ Warehouse၊ Dispatch၊ Transit၊ Delivery Proof၊ SLA နှင့် Exception များကို bilingual enterprise console တစ်ခုမှ စီမံပါ။"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={loading || summaryLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  loading || summaryLoading ? "animate-spin" : ""
                }`}
              />
              {bi("Refresh", "Refresh")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!activeWays.length}
            >
              <Download className="mr-2 h-4 w-4" />
              {bi("Export", "Export")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            icon={<Truck className="h-5 w-5" />}
            title={bi("Active Riders", "အလုပ်လုပ်နေသော Rider များ")}
            value={opsSummary.activeRiders}
            hint={bi("Live rider activity", "Live rider လှုပ်ရှားမှု")}
            onClick={() => navigate("/tracking-map")}
          />

          <KpiCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            title={bi("Pickup Queue", "Pickup Queue")}
            value={opsSummary.pickupQueue}
            hint={bi("Go to pickup execution", "Pickup execution သို့ သွားရန်")}
            onClick={() => navigate("/pickup-execution")}
          />

          <KpiCard
            icon={<Warehouse className="h-5 w-5" />}
            title={bi("Warehouse Queue", "Warehouse Queue")}
            value={opsSummary.warehouseQueue}
            hint={bi("Go to warehouse receiving", "Warehouse receiving သို့ သွားရန်")}
            onClick={() => navigate("/warehouse-receiving")}
          />

          <KpiCard
            icon={<Route className="h-5 w-5" />}
            title={bi("Transit / Delivery", "Transit / Delivery")}
            value={`${opsSummary.transitCount} / ${opsSummary.deliveryQueue}`}
            hint={bi("Go to dispatch and tracking", "Dispatch နှင့် tracking သို့ သွားရန်")}
            onClick={() => navigate("/warehouse-dispatch")}
          />

          <KpiCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title={bi("Failed / Return", "Failed / Return")}
            value={`${opsSummary.failedQueue} / ${opsSummary.returnQueue}`}
            hint={bi("Delivery exceptions", "Delivery exception များ")}
            onClick={() => navigate("/delivery-flow")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{bi("SLA Warning", "SLA Warning")}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl text-amber-600">
                <TimerReset className="h-6 w-6" />
                {opsSummary.slaWarning}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{bi("SLA Breached", "SLA Breached")}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl text-destructive">
                <ShieldAlert className="h-6 w-6" />
                {opsSummary.slaBreached}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{bi("Parcel Anomalies", "Parcel Anomaly များ")}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl text-orange-600">
                <ScanLine className="h-6 w-6" />
                {opsSummary.anomalyCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {summaryError ? (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-sm text-destructive">
              {summaryError}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{bi("Rider Dispatch Board", "Rider Dispatch Board")}</CardTitle>
            <CardDescription>
              {bi(
                "Live rider load, route assignment, and operational status.",
                "Rider load၊ route assignment နှင့် operational status များကို live ပြပါသည်။"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiderBoard riders={riders} bi={bi} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={bi(
                "Search by Way ID, Customer, Phone, Merchant, or Township...",
                "Way ID၊ Customer၊ ဖုန်း၊ Merchant သို့မဟုတ် မြို့နယ် ဖြင့် ရှာဖွေပါ..."
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {bi("Filters", "စစ်ထုတ်မှုများ")}
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate("/tracking-map")}>
            <MapPinned className="mr-2 h-4 w-4" />
            {bi("Live Map", "Live Map")}
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {bi("Error:", "အမှား:")} {error}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-grid min-w-max grid-cols-7">
              <TabsTrigger value="pickup">
                {bi("Pickup Ways", "Pickup Way များ")}
                <Badge variant="secondary" className="ml-2">
                  {pickupWays.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="delivery">
                {bi("Delivery Ways", "Delivery Way များ")}
                <Badge variant="secondary" className="ml-2">
                  {deliveryWays.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="failed">
                {bi("Failed Ways", "မအောင်မြင် Way များ")}
                <Badge variant="destructive" className="ml-2">
                  {failedWays.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="return">
                {bi("Return Ways", "ပြန်ပို့ Way များ")}
                <Badge variant="secondary" className="ml-2">
                  {returnWays.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="parcel">
                {bi("Parcel In/Out", "Parcel ဝင်/ထွက်")}
                <Badge variant="secondary" className="ml-2">
                  {parcelWays.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="transit">
                {bi("Transit Route", "Transit Route")}
                <Badge variant="secondary" className="ml-2">
                  {transitWays.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="tracking">
                {bi("Tracking Map", "Tracking Map")}
                <Badge variant="secondary" className="ml-2">
                  {trackingWays.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pickup" className="space-y-6">
            {renderStatusCards(pickupWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Pickup Chain of Custody", "Pickup Chain of Custody")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Scan, verify, collect evidence, and hand over pickup jobs.",
                    "Pickup job များကို scan၊ verify၊ evidence ရယူပြီး handover လုပ်ပါ။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pickupWays.length ? (
                  <DeliveryTable data={pickupWays} type="pickup" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No pickup ways found.", "Pickup Way မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            {renderStatusCards(deliveryWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Delivery Execution", "Delivery Execution")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Open proof-of-delivery, OTP, signature, and failed-attempt processing.",
                    "Proof-of-delivery၊ OTP၊ signature နှင့် failed-attempt processing များကို ဖွင့်ပါ။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliveryWays.length ? (
                  <DeliveryTable data={deliveryWays} type="delivery" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No delivery ways found.", "Delivery Way မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failed" className="space-y-6">
            {renderStatusCards(failedWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Failed / Exception Queue", "Failed / Exception Queue")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Review failed attempts, reschedule, or transfer to return flow.",
                    "Failed attempt များကို စစ်ဆေးပြီး reschedule လုပ်ရန် သို့မဟုတ် return flow သို့ ပြောင်းရန်။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {failedWays.length ? (
                  <DeliveryTable data={failedWays} type="failed" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No failed ways found.", "မအောင်မြင် Way မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="return" className="space-y-6">
            {renderStatusCards(returnWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Return Flow Queue", "Return Flow Queue")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Manage merchant return and warehouse return processing.",
                    "Merchant return နှင့် warehouse return processing ကို စီမံပါ။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {returnWays.length ? (
                  <DeliveryTable data={returnWays} type="return" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No return ways found.", "ပြန်ပို့ Way မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parcel" className="space-y-6">
            {renderStatusCards(parcelWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Warehouse Parcel Queue", "Warehouse Parcel Queue")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Drill into warehouse receiving, rack movement, and dispatch preparation.",
                    "Warehouse receiving၊ rack movement နှင့် dispatch preparation သို့ drill-in လုပ်ပါ။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parcelWays.length ? (
                  <DeliveryTable data={parcelWays} type="parcel" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No parcel records found.", "Parcel မှတ်တမ်း မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transit" className="space-y-6">
            {renderStatusCards(transitWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Transit Route Queue", "Transit Route Queue")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Open route optimization, rider assignment, and transit route control.",
                    "Route optimization၊ rider assignment နှင့် transit route control ကို ဖွင့်ပါ။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transitWays.length ? (
                  <DeliveryTable data={transitWays} type="delivery" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No transit ways found.", "Transit Way မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            {renderStatusCards(trackingWays)}
            <Card>
              <CardHeader>
                <CardTitle>{bi("Tracking Map Queue", "Tracking Map Queue")}</CardTitle>
                <CardDescription>
                  {bi(
                    "Open live rider and parcel tracking with map drilldown.",
                    "Live rider နှင့် parcel tracking ကို map drilldown ဖြင့် ဖွင့်ပါ။"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trackingWays.length ? (
                  <DeliveryTable data={trackingWays} type="delivery" onRowClick={handleRowClick} />
                ) : (
                  <EmptyState
                    message={bi("No live tracking items found.", "Live tracking item မတွေ့ပါ။")}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}