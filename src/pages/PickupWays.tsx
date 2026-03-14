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
import { MapPin, Search, Filter, Download, Plus } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function PickupWays() {
  const { bi } = useI18n();
  const { ways: deliveryWays } = useDeliveryWays();
  
  // Filter for pickup-related ways
  const pickupWays = deliveryWays.filter((way: DeliveryWay) => 
    way.status === 'to-assign' || way.status === 'assigned' || way.status === 'processing'
  );

  const pickupStats = {
    total: pickupWays.length,
    toAssign: pickupWays.filter((w: DeliveryWay) => w.status === 'to-assign').length,
    assigned: pickupWays.filter((w: DeliveryWay) => w.status === 'assigned').length,
    processing: pickupWays.filter((w: DeliveryWay) => w.status === 'processing').length,
  };

  const columns = [
    { key: 'wayId', label: bi('Way ID', 'Way ID') },
    { key: 'merchantName', label: bi('Merchant', 'Merchant') },
    { key: 'customerName', label: bi('Customer', 'Customer') },
    { key: 'town', label: bi('Town', 'မြို့နယ်') },
    { key: 'pickupDate', label: bi('Pickup Date', 'Pickup ရက်စွဲ') },
    { key: 'status', label: bi('Status', 'အခြေအနေ') },
    { key: 'pickupBy', label: bi('Pickup By', 'Pickup ပြုလုပ်သူ') },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bi("Pickup Ways", "Pickup Way များ")}</h1>
            <p className="text-muted-foreground">
{bi("Manage and track all pickup operations", "Pickup လုပ်ငန်းစဉ်များကို စီမံ၍ လိုက်လံကြည့်ရှုပါ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {bi("Create Pickup", "Pickup ဖန်တီး")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={bi("Total Pickups", "Pickup စုစုပေါင်း")}
            value={pickupStats.total}
            icon={MapPin as any}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title={bi("To Assign", "သတ်မှတ်ရန်")}
            value={pickupStats.toAssign}
            icon={MapPin as any}
            trend={{ value: 5, isPositive: false }}
          />
          <StatsCard
            title={bi("Assigned", "သတ်မှတ်ပြီး")}
            value={pickupStats.assigned}
            icon={MapPin as any}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title={bi("Processing", "ဆောင်ရွက်နေ")}
            value={pickupStats.processing}
            icon={MapPin as any}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>{bi("Pickup Ways Management", "Pickup Way စီမံခန့်ခွဲမှု")}</CardTitle>
            <CardDescription>
{bi("Filter and search through pickup operations", "Pickup အလုပ်များကို စစ်ထုတ်ပြီး ရှာဖွေပါ")}
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
                    <SelectItem value="to-assign">{bi("To Assign", "သတ်မှတ်ရန်")}</SelectItem>
                    <SelectItem value="assigned">{bi("Assigned", "သတ်မှတ်ပြီး")}</SelectItem>
                    <SelectItem value="processing">{bi("Processing", "ဆောင်ရွက်နေ")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Town", "မြို့နယ်")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Towns", "မြို့နယ်အားလုံး")}</SelectItem>
                    <SelectItem value="yangon">{bi("Yangon", "ရန်ကုန်")}</SelectItem>
                    <SelectItem value="mandalay">{bi("Mandalay", "မန္တလေး")}</SelectItem>
                    <SelectItem value="naypyidaw">{bi("Naypyidaw", "နေပြည်တော်")}</SelectItem>
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
              data={pickupWays}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
