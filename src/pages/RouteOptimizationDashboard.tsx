import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Navigation, 
  MapPin, 
  Route, 
  Zap, 
  Clock, 
  Fuel,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Calculator,
  TrendingUp,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RouteOptimizer } from '@/components/RouteOptimizer';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

interface RouteWaypoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type: 'PICKUP' | 'DELIVERY' | 'WAYPOINT' | 'DEPOT';
  priority: number;
  time_window_start?: string;
  time_window_end?: string;
  service_duration: number; // minutes
  shipment_id?: string;
  customer_name?: string;
  contact_phone?: string;
  special_instructions?: string;
  status: 'PENDING' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  actual_arrival_time?: string;
  actual_departure_time?: string;
  notes?: string;
}

interface OptimizedRoute {
  id: string;
  route_name: string;
  vehicle_id?: string;
  driver_id?: string;
  status: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  waypoints: RouteWaypoint[];
  optimization_settings: {
    optimize_for: 'DISTANCE' | 'TIME' | 'FUEL' | 'COST';
    avoid_tolls: boolean;
    avoid_highways: boolean;
    vehicle_type: 'CAR' | 'TRUCK' | 'MOTORCYCLE' | 'BICYCLE';
    max_working_hours: number;
    break_duration: number;
  };
  route_metrics: {
    total_distance: number; // km
    total_duration: number; // minutes
    estimated_fuel: number; // liters
    estimated_cost: number;
    carbon_footprint: number; // kg CO2
    efficiency_score: number; // 0-100
  };
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  optimization_history: Array<{
    timestamp: string;
    old_metrics: any;
    new_metrics: any;
    improvement_percentage: number;
  }>;
}

interface VehicleProfile {
  id: string;
  vehicle_type: string;
  fuel_consumption: number; // L/100km
  fuel_cost_per_liter: number;
  max_capacity: number; // kg
  max_volume: number; // m³
  operating_cost_per_km: number;
  co2_emission_factor: number; // kg CO2/L
}

export default function RouteOptimizationDashboard() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'OPTIMIZE' | 'ANALYTICS' | 'SETTINGS'>('ROUTES');
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [vehicleProfiles, setVehicleProfiles] = useState<VehicleProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Route creation/editing state
  const [routeForm, setRouteForm] = useState<Partial<OptimizedRoute>>({
    route_name: '',
    waypoints: [],
    optimization_settings: {
      optimize_for: 'DISTANCE',
      avoid_tolls: false,
      avoid_highways: false,
      vehicle_type: 'CAR',
      max_working_hours: 8,
      break_duration: 30
    }
  });

  // Waypoint form state
  const [waypointForm, setWaypointForm] = useState<Partial<RouteWaypoint>>({
    address: '',
    lat: 0,
    lng: 0,
    type: 'DELIVERY',
    priority: 1,
    service_duration: 15
  });

  useEffect(() => {
    loadRouteData();
  }, []);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      const [routesRes, vehiclesRes] = await Promise.all([
        advancedFeaturesAPI.getOptimizedRoutes(),
        advancedFeaturesAPI.getVehicleProfiles()
      ]);

      if (routesRes.success) setRoutes(routesRes.data || []);
      if (vehiclesRes.success) setVehicleProfiles(vehiclesRes.data || []);
    } catch (error) {
      console.error('Error loading route data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async () => {
    if (!routeForm.route_name || !routeForm.waypoints || routeForm.waypoints.length < 2) {
      alert(language === 'my' 
        ? 'လမ်းကြောင်း အမည်နှင့် အနည်းဆုံး ဝေးပွိုင့် ၂ ခု လိုအပ်ပါသည်' 
        : 'Route name and at least 2 waypoints are required'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await advancedFeaturesAPI.createRoute(routeForm);
      
      if (response.success) {
        await loadRouteData();
        setRouteForm({
          route_name: '',
          waypoints: [],
          optimization_settings: {
            optimize_for: 'DISTANCE',
            avoid_tolls: false,
            avoid_highways: false,
            vehicle_type: 'CAR',
            max_working_hours: 8,
            break_duration: 30
          }
        });
        
        alert(language === 'my' 
          ? 'လမ်းကြောင်းကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ' 
          : 'Route created successfully'
        );
      }
    } catch (error) {
      console.error('Error creating route:', error);
      alert(language === 'my' 
        ? 'လမ်းကြောင်း ဖန်တီးမှု မအောင်မြင်ပါ' 
        : 'Failed to create route'
      );
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoute = async (routeId: string) => {
    try {
      setLoading(true);
      const response = await advancedFeaturesAPI.updateRouteStatus(routeId, 'OPTIMIZED');
      
      if (response.success) {
        await loadRouteData();
        alert(language === 'my' 
          ? 'လမ်းကြောင်းကို အကောင်းဆုံးပြုလုပ်ပြီးပါပြီ' 
          : 'Route optimized successfully'
        );
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
      alert(language === 'my' 
        ? 'လမ်းကြောင်း အကောင်းဆုံးပြုလုပ်မှု မအောင်မြင်ပါ' 
        : 'Route optimization failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const startRoute = async (routeId: string) => {
    try {
      const response = await advancedFeaturesAPI.startRoute(routeId);
      if (response.success) {
        await loadRouteData();
        alert(language === 'my' 
          ? 'လမ်းကြောင်းကို စတင်ပြီးပါပြီ' 
          : 'Route started successfully'
        );
      }
    } catch (error) {
      console.error('Error starting route:', error);
    }
  };

  const completeRoute = async (routeId: string) => {
    try {
      const response = await advancedFeaturesAPI.completeRoute(routeId);
      if (response.success) {
        await loadRouteData();
        alert(language === 'my' 
          ? 'လမ်းကြောင်းကို ပြီးစီးပြီးပါပြီ' 
          : 'Route completed successfully'
        );
      }
    } catch (error) {
      console.error('Error completing route:', error);
    }
  };

  const addWaypoint = () => {
    if (!waypointForm.address) {
      alert(language === 'my' ? 'လိပ်စာ လိုအပ်ပါသည်' : 'Address is required');
      return;
    }

    const newWaypoint: RouteWaypoint = {
      id: Date.now().toString(),
      address: waypointForm.address!,
      lat: waypointForm.lat || 0,
      lng: waypointForm.lng || 0,
      type: waypointForm.type || 'DELIVERY',
      priority: waypointForm.priority || 1,
      service_duration: waypointForm.service_duration || 15,
      status: 'PENDING'
    };

    setRouteForm({
      ...routeForm,
      waypoints: [...(routeForm.waypoints || []), newWaypoint]
    });

    setWaypointForm({
      address: '',
      lat: 0,
      lng: 0,
      type: 'DELIVERY',
      priority: 1,
      service_duration: 15
    });
  };

  const removeWaypoint = (waypointId: string) => {
    setRouteForm({
      ...routeForm,
      waypoints: routeForm.waypoints?.filter(w => w.id !== waypointId) || []
    });
  };

  const calculateRouteMetrics = (route: OptimizedRoute) => {
    const metrics = route.route_metrics;
    const vehicle = vehicleProfiles.find(v => v.vehicle_type === route.optimization_settings.vehicle_type);
    
    return {
      distance: `${metrics.total_distance.toFixed(1)} km`,
      duration: `${Math.floor(metrics.total_duration / 60)}h ${metrics.total_duration % 60}m`,
      fuel: `${metrics.estimated_fuel.toFixed(1)} L`,
      cost: `$${metrics.estimated_cost.toFixed(2)}`,
      co2: `${metrics.carbon_footprint.toFixed(1)} kg CO₂`,
      efficiency: `${metrics.efficiency_score}%`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'PICKUP': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'DELIVERY': return <Download className="w-4 h-4 text-green-500" />;
      case 'DEPOT': return <MapPin className="w-4 h-4 text-purple-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.route_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || route.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderRoutesTab = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Input
                placeholder={language === 'my' ? 'လမ်းကြောင်း ရှာရန်...' : 'Search routes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="ALL">{language === 'my' ? 'အခြေအနေအားလုံး' : 'All Status'}</option>
                <option value="DRAFT">{language === 'my' ? 'မူကြမ်း' : 'Draft'}</option>
                <option value="PLANNED">{language === 'my' ? 'စီစဉ်ထား' : 'Planned'}</option>
                <option value="IN_PROGRESS">{language === 'my' ? 'လုပ်ဆောင်နေ' : 'In Progress'}</option>
                <option value="COMPLETED">{language === 'my' ? 'ပြီးစီး' : 'Completed'}</option>
                <option value="CANCELLED">{language === 'my' ? 'ပယ်ဖျက်' : 'Cancelled'}</option>
              </select>
            </div>
            <Button onClick={() => setActiveTab('OPTIMIZE')}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'my' ? 'လမ်းကြောင်းအသစ်' : 'New Route'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'my' ? 'လမ်းကြောင်း မရှိပါ' : 'No routes found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRoutes.map((route) => {
            const metrics = calculateRouteMetrics(route);
            return (
              <Card key={route.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-lg">{route.route_name}</span>
                        <Badge className={getStatusColor(route.status)}>
                          {language === 'my' 
                            ? route.status === 'DRAFT' ? 'မူကြမ်း'
                              : route.status === 'PLANNED' ? 'စီစဉ်ထား'
                              : route.status === 'IN_PROGRESS' ? 'လုပ်ဆောင်နေ'
                              : route.status === 'COMPLETED' ? 'ပြီးစီး'
                              : 'ပယ်ဖျက်'
                            : route.status
                          }
                        </Badge>
                      </div>
                      
                      {/* Route Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {language === 'my' ? 'ခရီးအကွာအဝေး' : 'Distance'}
                          </div>
                          <div className="font-medium text-blue-600">{metrics.distance}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {language === 'my' ? 'ကြာချိန်' : 'Duration'}
                          </div>
                          <div className="font-medium text-green-600">{metrics.duration}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {language === 'my' ? 'လောင်စာဆီ' : 'Fuel'}
                          </div>
                          <div className="font-medium text-orange-600">{metrics.fuel}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {language === 'my' ? 'ကုန်ကျစရိတ်' : 'Cost'}
                          </div>
                          <div className="font-medium text-purple-600">{metrics.cost}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {language === 'my' ? 'CO₂ ထုတ်လွှတ်မှု' : 'CO₂'}
                          </div>
                          <div className="font-medium text-red-600">{metrics.co2}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {language === 'my' ? 'ထိရောက်မှု' : 'Efficiency'}
                          </div>
                          <div className="font-medium text-indigo-600">{metrics.efficiency}</div>
                        </div>
                      </div>

                      {/* Waypoints Summary */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {route.waypoints.length} {language === 'my' ? 'ဝေးပွိုင့်' : 'waypoints'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>
                            {route.waypoints.filter(w => w.status === 'COMPLETED').length} {language === 'my' ? 'ပြီးစီး' : 'completed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>
                            {route.waypoints.filter(w => w.status === 'PENDING').length} {language === 'my' ? 'စောင့်ဆိုင်း' : 'pending'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{language === 'my' ? 'တိုးတက်မှု' : 'Progress'}</span>
                          <span>
                            {Math.round((route.waypoints.filter(w => w.status === 'COMPLETED').length / route.waypoints.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(route.waypoints.filter(w => w.status === 'COMPLETED').length / route.waypoints.length) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {route.status === 'DRAFT' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => optimizeRoute(route.id)}
                          disabled={loading}
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}
                      {route.status === 'PLANNED' && (
                        <Button 
                          size="sm"
                          onClick={() => startRoute(route.id)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {route.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completeRoute(route.id)}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const renderOptimizeTab = () => (
    <div className="space-y-6">
      {/* Route Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {language === 'my' ? 'လမ်းကြောင်းအသစ် ဖန်တီးရန်' : 'Create New Route'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'လမ်းကြောင်း အမည်' : 'Route Name'} *
              </label>
              <Input
                value={routeForm.route_name}
                onChange={(e) => setRouteForm({...routeForm, route_name: e.target.value})}
                placeholder={language === 'my' ? 'အမည် ထည့်ပါ' : 'Enter route name'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ယာဉ် အမျိုးအစား' : 'Vehicle Type'}
              </label>
              <select
                value={routeForm.optimization_settings?.vehicle_type}
                onChange={(e) => setRouteForm({
                  ...routeForm,
                  optimization_settings: {
                    ...routeForm.optimization_settings!,
                    vehicle_type: e.target.value as any
                  }
                })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="CAR">{language === 'my' ? 'ကား' : 'Car'}</option>
                <option value="TRUCK">{language === 'my' ? 'ထရပ်ကား' : 'Truck'}</option>
                <option value="MOTORCYCLE">{language === 'my' ? 'မော်တော်ဆိုင်ကယ်' : 'Motorcycle'}</option>
                <option value="BICYCLE">{language === 'my' ? 'စက်ဘီး' : 'Bicycle'}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {language === 'my' ? 'အကောင်းဆုံးပြုလုပ်မှု ဆက်တင်များ' : 'Optimization Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'အကောင်းဆုံးပြုလုပ်ရန်' : 'Optimize For'}
              </label>
              <select
                value={routeForm.optimization_settings?.optimize_for}
                onChange={(e) => setRouteForm({
                  ...routeForm,
                  optimization_settings: {
                    ...routeForm.optimization_settings!,
                    optimize_for: e.target.value as any
                  }
                })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="DISTANCE">{language === 'my' ? 'ခရီးအကွာအဝေး' : 'Distance'}</option>
                <option value="TIME">{language === 'my' ? 'အချိန်' : 'Time'}</option>
                <option value="FUEL">{language === 'my' ? 'လောင်စာဆီ' : 'Fuel'}</option>
                <option value="COST">{language === 'my' ? 'ကုန်ကျစရိတ်' : 'Cost'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'အများဆုံး အလုပ်ချိန် (နာရီ)' : 'Max Working Hours'}
              </label>
              <Input
                type="number"
                value={routeForm.optimization_settings?.max_working_hours}
                onChange={(e) => setRouteForm({
                  ...routeForm,
                  optimization_settings: {
                    ...routeForm.optimization_settings!,
                    max_working_hours: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="24"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={routeForm.optimization_settings?.avoid_tolls}
                onChange={(e) => setRouteForm({
                  ...routeForm,
                  optimization_settings: {
                    ...routeForm.optimization_settings!,
                    avoid_tolls: e.target.checked
                  }
                })}
              />
              <span className="text-sm">
                {language === 'my' ? 'အခကြေးငွေ လမ်းများ ရှောင်ရန်' : 'Avoid Tolls'}
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={routeForm.optimization_settings?.avoid_highways}
                onChange={(e) => setRouteForm({
                  ...routeForm,
                  optimization_settings: {
                    ...routeForm.optimization_settings!,
                    avoid_highways: e.target.checked
                  }
                })}
              />
              <span className="text-sm">
                {language === 'my' ? 'အဝေးပြေး လမ်းများ ရှောင်ရန်' : 'Avoid Highways'}
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Add Waypoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {language === 'my' ? 'ဝေးပွိုင့်များ ထည့်ရန်' : 'Add Waypoints'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'လိပ်စာ' : 'Address'} *
              </label>
              <Input
                value={waypointForm.address}
                onChange={(e) => setWaypointForm({...waypointForm, address: e.target.value})}
                placeholder={language === 'my' ? 'လိပ်စာ ထည့်ပါ' : 'Enter address'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'အမျိုးအစား' : 'Type'}
              </label>
              <select
                value={waypointForm.type}
                onChange={(e) => setWaypointForm({...waypointForm, type: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="PICKUP">{language === 'my' ? 'ပစ္စည်းယူ' : 'Pickup'}</option>
                <option value="DELIVERY">{language === 'my' ? 'ပို့ဆောင်' : 'Delivery'}</option>
                <option value="WAYPOINT">{language === 'my' ? 'ဝေးပွိုင့်' : 'Waypoint'}</option>
                <option value="DEPOT">{language === 'my' ? 'ဂိုဒေါင်' : 'Depot'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ဝန်ဆောင်မှုချိန် (မိနစ်)' : 'Service Time (min)'}
              </label>
              <Input
                type="number"
                value={waypointForm.service_duration}
                onChange={(e) => setWaypointForm({...waypointForm, service_duration: parseInt(e.target.value)})}
                min="0"
              />
            </div>
          </div>
          
          <Button onClick={addWaypoint} disabled={!waypointForm.address}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'my' ? 'ဝေးပွိုင့် ထည့်မည်' : 'Add Waypoint'}
          </Button>
        </CardContent>
      </Card>

      {/* Waypoints List */}
      {routeForm.waypoints && routeForm.waypoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'my' ? 'ဝေးပွိုင့်များ' : 'Waypoints'} ({routeForm.waypoints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {routeForm.waypoints.map((waypoint, index) => (
                <div key={waypoint.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    {getWaypointIcon(waypoint.type)}
                    <div>
                      <div className="font-medium">{waypoint.address}</div>
                      <div className="text-sm text-gray-600">
                        {waypoint.type} • {waypoint.service_duration} min
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeWaypoint(waypoint.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Route Button */}
      <div className="flex justify-end">
        <Button 
          onClick={createRoute} 
          disabled={loading || !routeForm.route_name || !routeForm.waypoints || routeForm.waypoints.length < 2}
          size="lg"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Route className="w-4 h-4 mr-2" />
          )}
          {language === 'my' ? 'လမ်းကြောင်း ဖန်တီးမည်' : 'Create Route'}
        </Button>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routes.length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'စုစုပေါင်း လမ်းကြောင်း' : 'Total Routes'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {routes.filter(r => r.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'ပြီးစီးပြီး' : 'Completed'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {routes.reduce((sum, r) => sum + r.route_metrics.total_distance, 0).toFixed(0)} km
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'စုစုပေါင်း ခရီးအကွာအဝေး' : 'Total Distance'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {routes.reduce((sum, r) => sum + r.route_metrics.estimated_fuel, 0).toFixed(0)} L
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'စုစုပေါင်း လောင်စာဆီ' : 'Total Fuel'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {language === 'my' ? 'စွမ်းဆောင်ရည် ခွဲခြမ်းစိတ်ဖြာမှု' : 'Performance Analytics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'my' 
                ? 'ခွဲခြမ်းစိတ်ဖြာမှု ဒေတာ လုဒ်လုပ်နေသည်...' 
                : 'Loading analytics data...'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Vehicle Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Fuel className="w-5 h-5" />
              {language === 'my' ? 'ယာဉ် ပရိုဖိုင်များ' : 'Vehicle Profiles'}
            </span>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'my' ? 'ပရိုဖိုင်အသစ်' : 'Add Profile'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicleProfiles.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'ယာဉ် ပရိုဖိုင် မရှိပါ' : 'No vehicle profiles found'}
                </p>
              </div>
            ) : (
              vehicleProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{profile.vehicle_type}</div>
                    <div className="text-sm text-gray-600">
                      <span>{language === 'my' ? 'လောင်စာဆီ သုံးစွဲမှု:' : 'Fuel consumption:'} {profile.fuel_consumption} L/100km</span>
                      <span className="ml-4">
                        {language === 'my' ? 'အများဆုံး ဝန်:' : 'Max capacity:'} {profile.max_capacity} kg
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {language === 'my' ? 'မူလ ဆက်တင်များ' : 'Default Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'မူလ လောင်စာဆီ စျေးနှုန်း (လီတာ)' : 'Default Fuel Price (per liter)'}
              </label>
              <Input type="number" step="0.01" placeholder="1.50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'မူလ လုပ်ခ (နာရီ)' : 'Default Labor Cost (per hour)'}
              </label>
              <Input type="number" step="0.01" placeholder="15.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'မူလ ဝန်ဆောင်မှုချိန် (မိနစ်)' : 'Default Service Time (minutes)'}
              </label>
              <Input type="number" placeholder="15" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'မူလ အလုပ်ချိန် (နာရီ)' : 'Default Working Hours'}
              </label>
              <Input type="number" placeholder="8" />
            </div>
          </div>
          
          <Button>
            {language === 'my' ? 'ဆက်တင်များ သိမ်းဆည်းမည်' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {language === 'my' ? 'လမ်းကြောင်း အကောင်းဆုံးပြုလုပ်မှု' : 'Route Optimization'}
        </h1>
        <Button onClick={loadRouteData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'ROUTES', label: language === 'my' ? 'လမ်းကြောင်းများ' : 'Routes', icon: Route },
          { key: 'OPTIMIZE', label: language === 'my' ? 'အကောင်းဆုံးပြုလုပ်ရန်' : 'Optimize', icon: Zap },
          { key: 'ANALYTICS', label: language === 'my' ? 'ခွဲခြမ်းစိတ်ဖြာမှု' : 'Analytics', icon: TrendingUp },
          { key: 'SETTINGS', label: language === 'my' ? 'ဆက်တင်များ' : 'Settings', icon: Calculator }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === key
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'ROUTES' && renderRoutesTab()}
      {activeTab === 'OPTIMIZE' && renderOptimizeTab()}
      {activeTab === 'ANALYTICS' && renderAnalyticsTab()}
      {activeTab === 'SETTINGS' && renderSettingsTab()}

      {/* Route Detail Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedRoute.route_name}</span>
                <Button variant="ghost" onClick={() => setSelectedRoute(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(calculateRouteMetrics(selectedRoute)).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-medium">{value}</div>
                    <div className="text-xs text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>
              
              {/* Waypoints */}
              <div>
                <h3 className="font-medium mb-3">
                  {language === 'my' ? 'ဝေးပွိုင့်များ' : 'Waypoints'}
                </h3>
                <div className="space-y-2">
                  {selectedRoute.waypoints.map((waypoint, index) => (
                    <div key={waypoint.id} className="flex items-center gap-3 p-3 border rounded">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      {getWaypointIcon(waypoint.type)}
                      <div className="flex-1">
                        <div className="font-medium">{waypoint.address}</div>
                        <div className="text-sm text-gray-600">
                          {waypoint.type} • {waypoint.service_duration} min
                        </div>
                      </div>
                      <Badge className={getStatusColor(waypoint.status)}>
                        {language === 'my' 
                          ? waypoint.status === 'PENDING' ? 'စောင့်ဆိုင်း'
                            : waypoint.status === 'ARRIVED' ? 'ရောက်ရှိ'
                            : waypoint.status === 'IN_PROGRESS' ? 'လုပ်ဆောင်နေ'
                            : waypoint.status === 'COMPLETED' ? 'ပြီးစီး'
                            : 'မအောင်မြင်'
                          : waypoint.status
                        }
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}