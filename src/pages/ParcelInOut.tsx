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
import { Archive, Search, Filter, Download, Package, ArrowUpDown } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function ParcelInOut() {
  const { bi } = useI18n();
  const { ways: deliveryWays } = useDeliveryWays();
  
  // Mock parcel in/out data
  const parcelData = deliveryWays.map((way: DeliveryWay) => ({
    ...way,
    parcelType: Math.random() > 0.5 ? 'in' : 'out',
    location: way.parcelLocation || 'Main Warehouse',
    weight: Math.floor(Math.random() * 10) + 1,
    dimensions: `${Math.floor(Math.random() * 30) + 10}x${Math.floor(Math.random() * 30) + 10}x${Math.floor(Math.random() * 30) + 10}`,
  }));

  const parcelStats = {
    total: parcelData.length,
    parcelIn: parcelData.filter((p: any) => p.parcelType === 'in').length,
    parcelOut: parcelData.filter((p: any) => p.parcelType === 'out').length,
    warehouse: parcelData.filter((p: any) => p.location === 'Main Warehouse').length,
  };

  const columns = [
    { key: 'wayId', label: bi('Way ID', 'Way ID') },
    { key: 'parcelType', label: bi('Type', 'အမျိုးအစား') },
    { key: 'merchantName', label: bi('Merchant', 'Merchant') },
    { key: 'location', label: bi('Location', 'နေရာ') },
    { key: 'weight', label: bi('Weight (kg)', 'အလေးချိန် (kg)') },
    { key: 'dimensions', label: bi('Dimensions (cm)', 'အတိုင်းအတာ (cm)') },
    { key: 'status', label: bi('Status', 'အခြေအနေ') },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bi("Parcel In/Out", "Parcel ဝင်/ထွက်")}</h1>
            <p className="text-muted-foreground">
{bi("Track parcel movements in and out of warehouses", "ဂိုဒေါင်ထဲသို့/ထဲမှ Parcel လှုပ်ရှားမှုကို လိုက်လံကြည့်ရှုပါ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button>
              <Package className="mr-2 h-4 w-4" />
              {bi("Register Parcel", "Parcel မှတ်ပုံတင်")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={bi("Total Parcels", "Parcel စုစုပေါင်း")}
            value={parcelStats.total}
            icon={Archive as any}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title={bi("Parcel In", "Parcel ဝင်")}
            value={parcelStats.parcelIn}
            icon={Archive as any}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title={bi("Parcel Out", "Parcel ထွက်")}
            value={parcelStats.parcelOut}
            icon={Archive as any}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title={bi("In Warehouse", "ဂိုဒေါင်တွင်")}
            value={parcelStats.warehouse}
            icon={Archive as any}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Warehouse Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{bi("Warehouse Locations", "ဂိုဒေါင်နေရာများ")}</CardTitle>
              <CardDescription>
{bi("Parcel distribution across locations", "နေရာလိုက် Parcel ဖြန့်ဝေမှု")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Main Warehouse", "အဓိက ဂိုဒေါင်")}</span>
                  <Badge variant="secondary">45 parcels</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Yangon Hub", "ရန်ကုန် Hub")}</span>
                  <Badge variant="secondary">32 parcels</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Mandalay Hub", "မန္တလေး Hub")}</span>
                  <Badge variant="secondary">18 parcels</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{bi("Transit", "ခရီးလမ်း")}</span>
                  <Badge variant="secondary">12 parcels</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{bi("Parcel Operations", "Parcel လုပ်ဆောင်ချက်များ")}</CardTitle>
              <CardDescription>
{bi("Quick actions for parcel management", "Parcel စီမံရန် အမြန်လုပ်ဆောင်ချက်များ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {bi("Transfer Parcels", "Parcel လွှဲပြောင်း")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="mr-2 h-4 w-4" />
                  {bi("Inventory Check", "စတော့ စစ်ဆေး")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  {bi("Bulk Operations", "အစုလိုက် လုပ်ဆောင်မှု")}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="mr-2 h-4 w-4" />
                  {bi("Generate Report", "အစီရင်ခံစာ ထုတ်ရန်")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>{bi("Parcel In/Out Management", "Parcel ဝင်/ထွက် စီမံခန့်ခွဲမှု")}</CardTitle>
            <CardDescription>
{bi("Filter and search through parcel operations", "Parcel လုပ်ဆောင်ချက်များကို စစ်ထုတ်ပြီး ရှာဖွေပါ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={bi("Search by Way ID, Merchant...", "Way ID၊ Merchant ဖြင့် ရှာဖွေပါ...")}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Type", "အမျိုးအစား")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Types", "အမျိုးအစားအားလုံး")}</SelectItem>
                    <SelectItem value="in">{bi("Parcel In", "Parcel ဝင်")}</SelectItem>
                    <SelectItem value="out">{bi("Parcel Out", "Parcel ထွက်")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Location", "နေရာ")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Locations", "နေရာအားလုံး")}</SelectItem>
                    <SelectItem value="main">{bi("Main Warehouse", "အဓိက ဂိုဒေါင်")}</SelectItem>
                    <SelectItem value="yangon">{bi("Yangon Hub", "ရန်ကုန် Hub")}</SelectItem>
                    <SelectItem value="mandalay">{bi("Mandalay Hub", "မန္တလေး Hub")}</SelectItem>
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
              data={parcelData}
              columns={columns}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
