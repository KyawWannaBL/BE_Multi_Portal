import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route, Search, Filter, Download, MapPin, Clock, Truck } from 'lucide-react';
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function TransitRoute() {
  const { bi } = useI18n();
  // Mock transit route data
  const routes = [
    {
      id: 'RT001',
      name: 'Yangon - Mandalay Express',
      origin: 'Yangon Hub',
      destination: 'Mandalay Hub',
      distance: '628 km',
      duration: '8 hours',
      status: 'active',
      vehicles: 3,
      parcels: 45,
      lastUpdate: '2026-01-24 14:30',
    },
    {
      id: 'RT002',
      name: 'Mandalay - Naypyidaw Route',
      origin: 'Mandalay Hub',
      destination: 'Naypyidaw Hub',
      distance: '312 km',
      duration: '4 hours',
      status: 'active',
      vehicles: 2,
      parcels: 28,
      lastUpdate: '2026-01-24 13:45',
    },
    {
      id: 'RT003',
      name: 'Yangon Local Circuit',
      origin: 'Yangon Hub',
      destination: 'Yangon Districts',
      distance: '150 km',
      duration: '6 hours',
      status: 'maintenance',
      vehicles: 5,
      parcels: 67,
      lastUpdate: '2026-01-24 12:00',
    },
  ];

  const routeStats = {
    total: routes.length,
    active: routes.filter(r => r.status === 'active').length,
    maintenance: routes.filter(r => r.status === 'maintenance').length,
    totalVehicles: routes.reduce((sum, r) => sum + r.vehicles, 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bi("Transit Route", "ခရီးသွား လမ်းကြောင်း")}</h1>
            <p className="text-muted-foreground">
{bi("Manage and monitor delivery routes and transportation", "ပို့ဆောင်ရေး လမ်းကြောင်းများနှင့် သယ်ယူပို့ဆောင်ရေးကို စီမံ၍ စောင့်ကြည့်ပါ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button>
              <Route className="mr-2 h-4 w-4" />
              {bi("Create Route", "လမ်းကြောင်း ဖန်တီး")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{bi("Total Routes", "လမ်းကြောင်း စုစုပေါင်း")}</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {bi("+2 from last month", "လွန်ခဲ့သောလထက် +2")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{bi("Active Routes", "အသုံးပြုနေသော လမ်းကြောင်း")}</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeStats.active}</div>
              <p className="text-xs text-muted-foreground">
                {bi("Currently operational", "လက်ရှိ လည်ပတ်နေ")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{bi("Total Vehicles", "ယာဉ် စုစုပေါင်း")}</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeStats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {bi("Across all routes", "လမ်းကြောင်းအားလုံးတွင်")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{bi("In Maintenance", "ပြုပြင်ထိန်းသိမ်းနေ")}</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeStats.maintenance}</div>
              <p className="text-xs text-muted-foreground">
                {bi("Under maintenance", "ပြုပြင်ထိန်းသိမ်းနေ")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Route Management */}
        <Card>
          <CardHeader>
            <CardTitle>{bi("Route Management", "လမ်းကြောင်း စီမံခန့်ခွဲမှု")}</CardTitle>
            <CardDescription>
{bi("Filter and search through transit routes", "ခရီးသွား လမ်းကြောင်းများကို စစ်ထုတ်ပြီး ရှာဖွေပါ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={bi("Search routes...", "လမ်းကြောင်း ရှာဖွေပါ...")}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={bi("Status", "အခြေအနေ")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{bi("All Status", "အခြေအနေအားလုံး")}</SelectItem>
                    <SelectItem value="active">{bi("Active", "အသုံးပြုနေ")}</SelectItem>
                    <SelectItem value="maintenance">{bi("Maintenance", "ပြုပြင်ထိန်းသိမ်း")}</SelectItem>
                    <SelectItem value="inactive">{bi("Inactive", "မလည်ပတ်")}</SelectItem>
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

            <div className="space-y-4">
              {routes.map((route) => (
                <Card key={route.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{route.name}</h3>
                        <p className="text-sm text-muted-foreground">{bi("Route ID", "Route ID")}: {route.id}</p>
                      </div>
                      <Badge 
                        variant={route.status === 'active' ? 'default' : 'secondary'}
                      >
                        {route.status === 'active'
                          ? bi('active', 'အသုံးပြုနေ')
                          : bi('maintenance', 'ပြုပြင်ထိန်းသိမ်း')}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{route.origin}</p>
                          <p className="text-xs text-muted-foreground">{bi("Origin", "ထွက်ခွာရာ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{route.destination}</p>
                          <p className="text-xs text-muted-foreground">{bi("Destination", "ဦးတည်ရာ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{route.distance}</p>
                          <p className="text-xs text-muted-foreground">{bi("Distance", "အကွာအဝေး")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{route.duration}</p>
                          <p className="text-xs text-muted-foreground">{bi("Duration", "ကြာချိန်")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{bi(`${route.vehicles} vehicles`, `${route.vehicles} စီး`)}</span>
                        <span>{bi(`${route.parcels} parcels`, `${route.parcels} ခု`)}</span>
                        <span>{bi("Updated:", "နောက်ဆုံးပြင်ဆင်ချိန်:")} {route.lastUpdate}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
{bi("View Details", "အသေးစိတ် ကြည့်")}
                        </Button>
                        <Button variant="outline" size="sm">
{bi("Edit Route", "လမ်းကြောင်း ပြင်")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
