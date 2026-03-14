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
import { RotateCcw, Search, Filter, Download, Package } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function ReturnWays() {
  const { bi } = useI18n();
  const { ways: deliveryWays } = useDeliveryWays();
  
  // Filter for return ways
  const returnWays = deliveryWays.filter((way: DeliveryWay) => 
    way.status === 'return' || way.status === 'retry'
  );

  const returnStats = {
    total: returnWays.length,
    returns: returnWays.filter((w: DeliveryWay) => w.status === 'return').length,
    retries: returnWays.filter((w: DeliveryWay) => w.status === 'retry').length,
    processing: returnWays.filter((w: DeliveryWay) => w.retryCount && w.retryCount > 0).length,
  };

  const columns = [
    { key: 'wayId', label: bi('Way ID', 'Way ID') },
    { key: 'merchantName', label: bi('Merchant', 'Merchant') },
    { key: 'customerName', label: bi('Customer', 'Customer') },
    { key: 'town', label: bi('Town', 'မြို့နယ်') },
    { key: 'retryCount', label: bi('Retry Count', 'Retry အကြိမ်') },
    { key: 'status', label: bi('Status', 'အခြေအနေ') },
    { key: 'remark', label: bi('Return Reason', 'ပြန်ပို့ အကြောင်းရင်း') },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bi("Return Ways", "ပြန်ပို့ Way များ")}</h1>
            <p className="text-muted-foreground">
{bi("Manage returned packages and retry operations", "ပြန်ပို့ Package များနှင့် Retry လုပ်ငန်းစဉ်များကို စီမံပါ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button>
              <Package className="mr-2 h-4 w-4" />
              {bi("Process Returns", "ပြန်ပို့မှု ဆောင်ရွက်")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={bi("Total Returns", "ပြန်ပို့ စုစုပေါင်း")}
            value={returnStats.total}
            icon={RotateCcw as any}
            trend={{ value: 8, isPositive: false }}
          />
          <StatsCard
            title={bi("Returns", "ပြန်ပို့")}
            value={returnStats.returns}
            icon={RotateCcw as any}
            trend={{ value: 5, isPositive: false }}
          />
          <StatsCard
            title={bi("Retries", "Retry")}
            value={returnStats.retries}
            icon={RotateCcw as any}
            trend={{ value: 3, isPositive: true }}
          />
          <StatsCard
            title={bi("Processing", "ဆောင်ရွက်နေ")}
            value={returnStats.processing}
            icon={RotateCcw as any}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        {/* Return Process Flow */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{bi("Return Reasons", "ပြန်ပို့ရသော အကြောင်းရင်းများ")}</CardTitle>
              <CardDescription>
{bi("Common reasons for package returns", "Package ပြန်ပို့ရသော အများဆုံးအကြောင်းရင်းများ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Customer refused", "Customer ငြင်းဆို")}</span>
                  <Badge variant="secondary">35%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Damaged package", "ပျက်စီးသော Package")}</span>
                  <Badge variant="secondary">25%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Wrong item", "ပစ္စည်းမှား")}</span>
                  <Badge variant="secondary">20%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Address issues", "လိပ်စာ ပြဿနာ")}</span>
                  <Badge variant="secondary">20%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{bi("Return Actions", "ပြန်ပို့ လုပ်ဆောင်ချက်များ")}</CardTitle>
              <CardDescription>
{bi("Available actions for returned packages", "ပြန်ပို့ Package များအတွက် လုပ်ဆောင်နိုင်သော လုပ်ဆောင်ချက်များ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {bi("Schedule Retry", "Retry သတ်မှတ်")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  {bi("Return to Merchant", "Merchant သို့ ပြန်ပို့")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  {bi("Refund Process", "Refund ဆောင်ရွက်")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  {bi("Exchange Item", "အစားထိုး ပစ္စည်း")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>{bi("Return Ways Management", "ပြန်ပို့ Way စီမံခန့်ခွဲမှု")}</CardTitle>
            <CardDescription>
{bi("Filter and search through return operations", "ပြန်ပို့ လုပ်ငန်းစဉ်များကို စစ်ထုတ်ပြီး ရှာဖွေပါ")}
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
                    <SelectItem value="return">{bi("Return", "ပြန်ပို့")}</SelectItem>
                    <SelectItem value="retry">{bi("Retry", "Retry")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Reason", "အကြောင်းရင်း")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Reasons", "အကြောင်းရင်းအားလုံး")}</SelectItem>
                    <SelectItem value="refused">{bi("Customer Refused", "Customer ငြင်းဆို")}</SelectItem>
                    <SelectItem value="damaged">{bi("Damaged", "ပျက်စီး")}</SelectItem>
                    <SelectItem value="wrong">{bi("Wrong Item", "ပစ္စည်းမှား")}</SelectItem>
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
              data={returnWays}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
