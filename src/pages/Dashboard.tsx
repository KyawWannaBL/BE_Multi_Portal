import { Layout } from '@/components/Layout';
import { StatsCard, MetricCard, StatusGrid } from '@/components/Stats';
import { DeliveryChart, OverdueChart, StatusChart } from '@/components/Charts';
import { mockStats } from '@/data/index';
import { Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function Dashboard() {
  const { bi } = useI18n();
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {bi("Dashboard", "ဒတ်ရှ်ဘုတ်")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {bi(
                "Overview of delivery operations and performance metrics",
                "ပို့ဆောင်ရေး လုပ်ငန်းစဉ်များနှင့် စွမ်းဆောင်ရည် အညွှန်းကိန်းများ အနှစ်ချုပ်"
              )}
            </p>
          </div>

          <LanguageToggle />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={bi("Total Ways", "Way စုစုပေါင်း")}
            value={mockStats.totalWays}
            icon={<Package className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title={bi("Successful Deliveries", "အောင်မြင်ပြီးသော ပို့ဆောင်မှုများ")}
            value={mockStats.successful}
            icon={<CheckCircle className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title={bi("On Way", "လမ်းတွင်")}
            value={mockStats.onWay}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title={bi("To Assign", "သတ်မှတ်ရန်")}
            value={mockStats.toAssign}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{bi("Delivery Statistics", "ပို့ဆောင်မှု စာရင်းအင်း")}</h2>
            <DeliveryChart />
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{bi("Status Overview", "အခြေအနေ အနှစ်ချုပ်")}</h2>
            <StatusChart />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{bi("Delivery Status Breakdown", "ပို့ဆောင်မှု အခြေအနေ ခွဲခြမ်းချက်")}</h2>
              <StatusGrid stats={mockStats} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{bi("Overdue Ways", "သတ်မှတ်ချိန် ကျော်လွန် Way များ")}</h2>
            <OverdueChart />
            <div className="mt-6 space-y-3">
              <MetricCard
                label={bi("Overdue Pickup", "Pickup သတ်မှတ်ချိန် ကျော်")}
                value={mockStats.overduePickup}
                variant="warning"
              />
              <MetricCard
                label={bi("Overdue Delivery", "Delivery သတ်မှတ်ချိန် ကျော်")}
                value={mockStats.overdueDelivery}
                variant="destructive"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label={bi("Pickup Successful", "Pickup အောင်မြင်")}
            value={mockStats.pickupSuccessful}
            total={mockStats.totalWays}
            variant="success"
          />
          <MetricCard
            label={bi("Delivery Successful", "Delivery အောင်မြင်")}
            value={mockStats.deliverySuccessful}
            total={mockStats.totalWays}
            variant="success"
          />
          <MetricCard
            label={bi("Assigned", "သတ်မှတ်ပြီး")}
            value={mockStats.assigned}
            total={mockStats.totalWays}
            variant="accent"
          />
          <MetricCard
            label={bi("Retry", "ထပ်ကြိုးစား")}
            value={mockStats.retry}
            total={mockStats.totalWays}
            variant="warning"
          />
          <MetricCard
            label={bi("Failed", "မအောင်မြင်")}
            value={mockStats.failed}
            total={mockStats.totalWays}
            variant="destructive"
          />
          <MetricCard
            label={bi("Return", "ပြန်ပို့")}
            value={mockStats.return}
            total={mockStats.totalWays}
            variant="default"
          />
        </div>
      </div>
    </Layout>
  );
}
