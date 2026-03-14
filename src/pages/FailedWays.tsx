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
import { AlertTriangle, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function FailedWays() {
  const { bi } = useI18n();
  const { ways: deliveryWays } = useDeliveryWays();
  
  // Filter for failed ways
  const failedWays = deliveryWays.filter((way: DeliveryWay) => 
    way.status === 'failed' || way.status === 'canceled'
  );

  const failedStats = {
    total: failedWays.length,
    failed: failedWays.filter((w: DeliveryWay) => w.status === 'failed').length,
    canceled: failedWays.filter((w: DeliveryWay) => w.status === 'canceled').length,
    pending: failedWays.filter((w: DeliveryWay) => w.retryCount && w.retryCount > 0).length,
  };

  const columns = [
    { key: 'wayId', label: bi('Way ID', 'Way ID') },
    { key: 'merchantName', label: bi('Merchant', 'Merchant') },
    { key: 'customerName', label: bi('Customer', 'Customer') },
    { key: 'town', label: bi('Town', 'မြို့နယ်') },
    { key: 'failedCount', label: bi('Failed Count', 'မအောင်မြင် အကြိမ်') },
    { key: 'status', label: bi('Status', 'အခြေအနေ') },
    { key: 'remark', label: bi('Reason', 'အကြောင်းရင်း') },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bi("Failed Ways", "မအောင်မြင် Way များ")}</h1>
            <p className="text-muted-foreground">
{bi("Manage and resolve failed delivery operations", "မအောင်မြင်သော Delivery လုပ်ငန်းစဉ်များကို စီမံ၍ ဖြေရှင်းပါ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              {bi("Retry Selected", "ရွေးထားသောအရာများကို ပြန်ကြိုးစား")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={bi("Total Failed", "မအောင်မြင် စုစုပေါင်း")}
            value={failedStats.total}
            icon={AlertTriangle as any}
            trend={{ value: 5, isPositive: false }}
          />
          <StatsCard
            title={bi("Failed", "မအောင်မြင်")}
            value={failedStats.failed}
            icon={AlertTriangle as any}
            trend={{ value: 3, isPositive: false }}
          />
          <StatsCard
            title={bi("Canceled", "ပယ်ဖျက်")}
            value={failedStats.canceled}
            icon={AlertTriangle as any}
            trend={{ value: 2, isPositive: false }}
          />
          <StatsCard
            title={bi("Pending Retry", "ပြန်ကြိုးစားရန် ကျန်")}
            value={failedStats.pending}
            icon={AlertTriangle as any}
            trend={{ value: 1, isPositive: true }}
          />
        </div>

        {/* Failure Analysis */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{bi("Failure Reasons", "မအောင်မြင်ရသော အကြောင်းရင်းများ")}</CardTitle>
              <CardDescription>
{bi("Common reasons for delivery failures", "Delivery မအောင်မြင်ရသော အများဆုံးအကြောင်းရင်းများ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Customer not available", "Customer မရှိ/မရနိုင်")}</span>
                  <Badge variant="destructive">45%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Wrong address", "လိပ်စာမှား")}</span>
                  <Badge variant="destructive">25%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Payment issues", "ငွေပေးချေမှု ပြဿနာ")}</span>
                  <Badge variant="destructive">20%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Other reasons", "အခြားအကြောင်းရင်းများ")}</span>
                  <Badge variant="destructive">10%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{bi("Recovery Actions", "ပြန်လည်ဖြေရှင်း လုပ်ဆောင်ချက်များ")}</CardTitle>
              <CardDescription>
{bi("Actions to resolve failed deliveries", "မအောင်မြင် Delivery များကို ဖြေရှင်းရန် လုပ်ဆောင်ချက်များ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {bi("Schedule Retry", "Retry သတ်မှတ်")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {bi("Contact Customer", "Customer ကို ဆက်သွယ်")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {bi("Update Address", "လိပ်စာ ပြင်ဆင်")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {bi("Cancel Order", "အော်ဒါ ပယ်ဖျက်")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>{bi("Failed Ways Management", "မအောင်မြင် Way စီမံခန့်ခွဲမှု")}</CardTitle>
            <CardDescription>
{bi("Filter and search through failed operations", "မအောင်မြင် လုပ်ငန်းစဉ်များကို စစ်ထုတ်ပြီး ရှာဖွေပါ")}
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
                    <SelectItem value="failed">{bi("Failed", "မအောင်မြင်")}</SelectItem>
                    <SelectItem value="canceled">{bi("Canceled", "ပယ်ဖျက်")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Reason", "အကြောင်းရင်း")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Reasons", "အကြောင်းရင်းအားလုံး")}</SelectItem>
                    <SelectItem value="customer">{bi("Customer Issue", "Customer ပြဿနာ")}</SelectItem>
                    <SelectItem value="address">{bi("Address Issue", "လိပ်စာ ပြဿနာ")}</SelectItem>
                    <SelectItem value="payment">{bi("Payment Issue", "ငွေပေးချေမှု ပြဿနာ")}</SelectItem>
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
              data={failedWays}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
