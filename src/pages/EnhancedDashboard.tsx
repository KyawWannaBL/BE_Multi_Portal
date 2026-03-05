import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  Settings,
  Bell,
  Plus,
  Eye,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalShipments: number;
  pendingShipments: number;
  deliveredShipments: number;
  inTransitShipments: number;
  totalRevenue: number;
  activeRiders: number;
  activeMerchants: number;
  overdueShipments: number;
}

interface RecentActivity {
  id: string;
  type: 'shipment_created' | 'shipment_delivered' | 'merchant_registered' | 'rider_assigned';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguageContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    pendingShipments: 0,
    deliveredShipments: 0,
    inTransitShipments: 0,
    totalRevenue: 0,
    activeRiders: 0,
    activeMerchants: 0,
    overdueShipments: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load shipment statistics
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('status, total_amount, created_at');

      if (shipmentsError) throw shipmentsError;

      // Load user statistics
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role, status');

      if (usersError) throw usersError;

      // Load merchant statistics
      const { data: merchants, error: merchantsError } = await supabase
        .from('merchants')
        .select('is_active, current_balance');

      if (merchantsError) throw merchantsError;

      // Calculate statistics
      const totalShipments = shipments?.length || 0;
      const pendingShipments = shipments?.filter(s => s.status === 'pending').length || 0;
      const deliveredShipments = shipments?.filter(s => s.status === 'delivered').length || 0;
      const inTransitShipments = shipments?.filter(s => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length || 0;
      const totalRevenue = shipments?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const activeRiders = users?.filter(u => u.role === 'rider' && u.status === 'active').length || 0;
      const activeMerchants = merchants?.filter(m => m.is_active).length || 0;
      const overdueShipments = 0; // Calculate based on delivery dates

      setStats({
        totalShipments,
        pendingShipments,
        deliveredShipments,
        inTransitShipments,
        totalRevenue,
        activeRiders,
        activeMerchants,
        overdueShipments
      });

      // Generate recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'shipment_created',
          title: 'New shipment created',
          description: 'Way ID: BE001234 from Golden Shop',
          timestamp: '2 minutes ago',
          status: 'info'
        },
        {
          id: '2',
          type: 'shipment_delivered',
          title: 'Shipment delivered',
          description: 'Way ID: BE001230 delivered successfully',
          timestamp: '15 minutes ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'merchant_registered',
          title: 'New merchant registered',
          description: 'Tech Store Myanmar joined the platform',
          timestamp: '1 hour ago',
          status: 'info'
        }
      ]);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Dashboard",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'en' ? 'Good Morning' : 'မင်္ဂလာပါ';
    } else if (hour < 18) {
      return language === 'en' ? 'Good Afternoon' : 'နေ့လည်ပိုင်း မင်္ဂလာပါ';
    } else {
      return language === 'en' ? 'Good Evening' : 'ညနေပိုင်း မင်္ဂလာပါ';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment_created':
        return <Plus className="w-4 h-4" />;
      case 'shipment_delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'merchant_registered':
        return <Users className="w-4 h-4" />;
      case 'rider_assigned':
        return <Truck className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.full_name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'en' 
              ? `Welcome to your ${user?.role.replace('_', ' ')} dashboard` 
              : `သင့်${user?.role} ဒက်ရှ်ဘုတ်သို့ ကြိုဆိုပါသည်`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Notifications' : 'အကြောင်းကြားချက်များ'}
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Quick Action' : 'လျင်မြန်သော လုပ်ဆောင်ချက်'}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Total Shipments' : 'စုစုပေါင်း ပို့ဆောင်မှုများ'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'In Transit' : 'သယ်ယူနေဆဲ'}
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransitShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <Activity className="inline w-3 h-3 mr-1 text-blue-600" />
              Active deliveries
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Revenue' : 'ဝင်ငွေ'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} MMK</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1 text-green-600" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Active Riders' : 'လက်ရှိ ပို့ဆောင်သူများ'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRiders}</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="inline w-3 h-3 mr-1 text-green-600" />
              All online
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {language === 'en' ? 'Recent Activity' : 'လတ်တလော လုပ်ဆောင်ချက်များ'}
              </CardTitle>
              <CardDescription>
                {language === 'en' ? 'Latest updates from your system' : 'သင့်စနစ်မှ နောက်ဆုံး အပ်ဒိတ်များ'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'en' ? 'Quick Actions' : 'လျင်မြန်သော လုပ်ဆောင်ချက်များ'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Create Shipment' : 'ပို့ဆောင်မှု ဖန်တီးရန်'}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Track Package' : 'ပါဆယ် ခြေရာခံရန်'}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                {language === 'en' ? 'View Reports' : 'အစီရင်ခံစာများ ကြည့်ရန်'}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                {language === 'en' ? 'System Settings' : 'စနစ် ဆက်တင်များ'}
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'en' ? 'System Status' : 'စနစ် အခြေအနေ'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'en' ? 'Database' : 'ဒေတာဘေ့စ်'}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Online' : 'အွန်လိုင်း'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'en' ? 'Payment Gateway' : 'ငွေပေးချေမှု စနစ်'}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Active' : 'လုပ်ဆောင်နေဆဲ'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'en' ? 'SMS Service' : 'SMS ဝန်ဆောင်မှု'}
                </span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Maintenance' : 'ပြုပြင်နေဆဲ'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'en' ? 'Tracking API' : 'ခြေရာခံ API'}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Operational' : 'လုပ်ဆောင်နေဆဲ'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {stats.overdueShipments > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {language === 'en' ? 'Attention Required' : 'အာရုံစိုက်ရန် လိုအပ်သည်'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  {language === 'en' 
                    ? `${stats.overdueShipments} shipments are overdue for delivery`
                    : `ပို့ဆောင်မှု ${stats.overdueShipments} ခု သတ်မှတ်ချိန်ကျော်လွန်နေပါသည်`
                  }
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'View Details' : 'အသေးစိတ် ကြည့်ရန်'}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}