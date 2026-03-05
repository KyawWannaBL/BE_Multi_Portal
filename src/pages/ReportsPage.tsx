import React, { useState } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  Search,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';

interface ReportData {
  id: string;
  name: string;
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
}

const mockWaysCountData: ReportData[] = [
  { id: '1', name: 'Yangon North', value: 1245, percentage: 35.2, trend: 'up' },
  { id: '2', name: 'Yangon Central', value: 856, percentage: 24.1, trend: 'up' },
  { id: '3', name: 'Yangon South', value: 623, percentage: 17.6, trend: 'stable' },
  { id: '4', name: 'Mandalay', value: 445, percentage: 12.6, trend: 'down' },
  { id: '5', name: 'Naypyidaw', value: 367, percentage: 10.5, trend: 'up' }
];

const mockDeliverymenData: ReportData[] = [
  { id: '1', name: 'Ko Zaw Min', value: 156, percentage: 22.3, trend: 'up' },
  { id: '2', name: 'Ko Myint Swe', value: 134, percentage: 19.1, trend: 'up' },
  { id: '3', name: 'Ko Thura', value: 98, percentage: 14.0, trend: 'stable' },
  { id: '4', name: 'Ko Aung Aung', value: 87, percentage: 12.4, trend: 'down' },
  { id: '5', name: 'Ko Kyaw Kyaw', value: 76, percentage: 10.9, trend: 'up' }
];

const mockMerchantsData: ReportData[] = [
  { id: '1', name: 'Golden Shop', value: 245, percentage: 28.5, trend: 'up' },
  { id: '2', name: 'Tech Store Myanmar', value: 189, percentage: 22.0, trend: 'up' },
  { id: '3', name: 'Fashion Hub', value: 156, percentage: 18.1, trend: 'stable' },
  { id: '4', name: 'Book Corner', value: 134, percentage: 15.6, trend: 'down' },
  { id: '5', name: 'Mobile World', value: 98, percentage: 11.4, trend: 'up' }
];

const mockOverdueData: ReportData[] = [
  { id: '1', name: 'Ko Thura', value: 12, percentage: 35.3, trend: 'down' },
  { id: '2', name: 'Ko Aung Aung', value: 8, percentage: 23.5, trend: 'up' },
  { id: '3', name: 'Ko Kyaw Kyaw', value: 6, percentage: 17.6, trend: 'stable' },
  { id: '4', name: 'Ko Zaw Min', value: 4, percentage: 11.8, trend: 'down' },
  { id: '5', name: 'Ko Myint Swe', value: 4, percentage: 11.8, trend: 'down' }
];

export default function ReportsPage() {
  const { t } = useLanguageContext();
  const [activeTab, setActiveTab] = useState('ways_count');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const ReportTable = ({ data, title, description }: { data: ReportData[], title: string, description: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right font-mono">{item.value.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {item.percentage ? `${item.percentage}%` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendIcon(item.trend)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.reporting')}</h1>
          <p className="text-muted-foreground">
            Comprehensive reports and analytics for business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>
            Configure report period and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Branch/Zone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="yangon_north">Yangon North</SelectItem>
                  <SelectItem value="yangon_central">Yangon Central</SelectItem>
                  <SelectItem value="yangon_south">Yangon South</SelectItem>
                  <SelectItem value="mandalay">Mandalay</SelectItem>
                  <SelectItem value="naypyidaw">Naypyidaw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Format</Label>
              <Select defaultValue="table">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table View</SelectItem>
                  <SelectItem value="chart">Chart View</SelectItem>
                  <SelectItem value="both">Table & Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ways</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,536</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliverymen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Ways</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">34</div>
            <p className="text-xs text-muted-foreground">
              -15% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="ways_count" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.waysCount')}</span>
          </TabsTrigger>
          <TabsTrigger value="active_ways" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.activeWaysCount')}</span>
          </TabsTrigger>
          <TabsTrigger value="by_deliverymen" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.waysByDeliverymen')}</span>
          </TabsTrigger>
          <TabsTrigger value="by_merchants" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.waysByMerchants')}</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.overdueWaysCount')}</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.merchantsOrderCompare')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ways_count">
          <ReportTable 
            data={mockWaysCountData}
            title={t('reports.waysCount')}
            description="Total number of ways processed by location"
          />
        </TabsContent>

        <TabsContent value="active_ways">
          <ReportTable 
            data={mockWaysCountData}
            title={t('reports.activeWaysCount')}
            description="Currently active ways by town/region"
          />
        </TabsContent>

        <TabsContent value="by_deliverymen">
          <ReportTable 
            data={mockDeliverymenData}
            title={t('reports.waysByDeliverymen')}
            description="Ways handled by each deliveryman"
          />
        </TabsContent>

        <TabsContent value="by_merchants">
          <ReportTable 
            data={mockMerchantsData}
            title={t('reports.waysByMerchants')}
            description="Orders placed by each merchant"
          />
        </TabsContent>

        <TabsContent value="overdue">
          <div className="space-y-6">
            <ReportTable 
              data={mockOverdueData}
              title={t('reports.overdueWaysCount')}
              description="Overdue deliveries by deliveryman"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.overdueByDeliveryman')}</CardTitle>
                  <CardDescription>
                    Breakdown of overdue ways by individual deliveryman
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOverdueData.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-bold">{item.value}</span>
                          {getTrendIcon(item.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.overdueByMerchant')}</CardTitle>
                  <CardDescription>
                    Overdue ways by merchant origin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMerchantsData.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-bold">{Math.floor(item.value * 0.1)}</span>
                          {getTrendIcon(item.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.merchantsOrderCompare')}</CardTitle>
                <CardDescription>
                  Comparative analysis of merchant order volumes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMerchantsData.map((merchant, index) => (
                    <div key={merchant.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{merchant.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {merchant.value} orders ({merchant.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${merchant.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.totalWaysByTown')}</CardTitle>
                <CardDescription>
                  Geographic distribution of delivery ways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Town/City</TableHead>
                      <TableHead className="text-right">Total Ways</TableHead>
                      <TableHead className="text-right">Max Charges</TableHead>
                      <TableHead className="text-right">Avg Charges</TableHead>
                      <TableHead className="text-right">Min Charges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWaysCountData.map((town) => (
                      <TableRow key={town.id}>
                        <TableCell className="font-medium">{town.name}</TableCell>
                        <TableCell className="text-right font-mono">{town.value}</TableCell>
                        <TableCell className="text-right">25,000 MMK</TableCell>
                        <TableCell className="text-right">15,000 MMK</TableCell>
                        <TableCell className="text-right">8,000 MMK</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}