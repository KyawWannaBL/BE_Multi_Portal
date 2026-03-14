import { Layout } from '@/components/Layout';
import { DataTable } from '@/components/DataTable';
import { StatsCard } from '@/components/Stats';
import { useDeliveryWays } from '@/hooks/useDeliveryData';
import type { DeliveryWay } from '@/lib/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Search, Filter, Download, Plus } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function DeliverWays() {
  const { bi } = useI18n();
  const { ways: deliveryWays } = useDeliveryWays();
  
  // Filter for delivery-related ways
  const deliverWays = deliveryWays.filter((way: DeliveryWay) => 
    way.status === 'on-way' || way.status === 'successful' || way.status === 'arrived-requesting'
  );

  const deliverStats = {
    total: deliverWays.length,
    onWay: deliverWays.filter((w: DeliveryWay) => w.status === 'on-way').length,
    successful: deliverWays.filter((w: DeliveryWay) => w.status === 'successful').length,
    arrived: deliverWays.filter((w: DeliveryWay) => w.status === 'arrived-requesting').length,
  };

  const columns = [
    { key: 'wayId', label: bi('Way ID', 'Way ID') },
    { key: 'merchantName', label: bi('Merchant', 'Merchant') },
    { key: 'customerName', label: bi('Customer', 'Customer') },
    { key: 'town', label: bi('Town', 'မြို့နယ်') },
    { key: 'deliverDate', label: bi('Delivery Date', 'Delivery ရက်စွဲ') },
    { key: 'status', label: bi('Status', 'အခြေအနေ') },
    { key: 'deliverBy', label: bi('Deliver By', 'ပို့ဆောင်သူ') },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bi("Deliver Ways", "Deliver Way များ")}</h1>
            <p className="text-muted-foreground">
{bi("Manage and track all delivery operations", "Delivery လုပ်ငန်းစဉ်များကို စီမံ၍ လိုက်လံကြည့်ရှုပါ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {bi("Schedule Delivery", "Delivery အချိန်စာရင်းသတ်မှတ်")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={bi("Total Deliveries", "Delivery စုစုပေါင်း")}
            value={deliverStats.total}
            icon={Truck as any}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title={bi("On Way", "လမ်းတွင်")}
            value={deliverStats.onWay}
            icon={Truck as any}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title={bi("Successful", "အောင်မြင်")}
            value={deliverStats.successful}
            icon={Truck as any}
            trend={{ value: 22, isPositive: true }}
          />
          <StatsCard
            title={bi("Arrived", "ရောက်ရှိ")}
            value={deliverStats.arrived}
            icon={Truck as any}
            trend={{ value: 4, isPositive: false }}
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>{bi("Delivery Ways Management", "Delivery Way စီမံခန့်ခွဲမှု")}</CardTitle>
            <CardDescription>
{bi("Filter and search through delivery operations", "Delivery အလုပ်များကို စစ်ထုတ်ပြီး ရှာဖွေပါ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={bi("Search by Way ID, Merchant, Customer...", "Way ID၊ Merchant၊ Customer ဖြင့် ရှာဖွေပါ...")}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Status", "အခြေအနေ")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Status", "အခြေအနေအားလုံး")}</SelectItem>
                    <SelectItem value="on-way">{bi("On Way", "လမ်းတွင်")}</SelectItem>
                    <SelectItem value="successful">{bi("Successful", "အောင်မြင်")}</SelectItem>
                    <SelectItem value="arrived-requesting">{bi("Arrived", "ရောက်ရှိ")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Deliveryman", "ပို့ဆောင်သူ")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Deliverymen", "ပို့ဆောင်သူအားလုံး")}</SelectItem>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="mike">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
{bi("More Filters", "စစ်ထုတ်မှုများ")}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
{bi("Export", "ထုတ်ယူ (Export)")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={deliverWays}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
