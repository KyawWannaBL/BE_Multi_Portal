import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  User, 
  Battery, 
  Signal, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Map
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GPSTracker } from '@/components/GPSTracker';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

interface GPSDevice {
  id: string;
  device_id: string;
  device_type: 'VEHICLE' | 'RIDER' | 'MOBILE';
  assigned_to: string;
  assigned_type: 'vehicle' | 'rider' | 'user';
  status: 'ONLINE' | 'OFFLINE' | 'INACTIVE';
  last_location: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
    address?: string;
  };
  battery_level?: number;
  signal_strength?: number;
  speed?: number;
  heading?: number;
  geofences: string[];
  created_at: string;
  updated_at: string;
}

interface GeofenceZone {
  id: string;
  name: string;
  type: 'WAREHOUSE' | 'DELIVERY_ZONE' | 'RESTRICTED' | 'PICKUP_ZONE';
  coordinates: {
    lat: number;
    lng: number;
    radius: number;
  };
  status: 'ACTIVE' | 'INACTIVE';
  alerts_enabled: boolean;
  entry_alerts: boolean;
  exit_alerts: boolean;
  created_at: string;
}

interface GeofenceAlert {
  id: string;
  device_id: string;
  geofence_id: string;
  alert_type: 'ENTRY' | 'EXIT' | 'VIOLATION';
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

interface RouteData {
  id: string;
  route_name: string;
  assigned_device: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  waypoints: Array<{
    id: string;
    lat: number;
    lng: number;
    address: string;
    type: 'PICKUP' | 'DELIVERY' | 'WAYPOINT';
    estimated_arrival: string;
    actual_arrival?: string;
    status: 'PENDING' | 'ARRIVED' | 'COMPLETED';
  }>;
  total_distance: number;
  estimated_duration: number;
  actual_duration?: number;
  fuel_estimation: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export default function GPSTrackingDashboard() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'LIVE' | 'DEVICES' | 'GEOFENCES' | 'ROUTES' | 'ALERTS'>('LIVE');
  const [devices, setDevices] = useState<GPSDevice[]>([]);
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<GPSDevice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [mapCenter, setMapCenter] = useState({ lat: 16.8661, lng: 96.1951 }); // Yangon, Myanmar

  useEffect(() => {
    loadGPSData();
    const interval = setInterval(loadGPSData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadGPSData = async () => {
    try {
      setLoading(true);
      const [devicesRes, geofencesRes, alertsRes, routesRes] = await Promise.all([
        advancedFeaturesAPI.getGPSDevices(),
        advancedFeaturesAPI.getGeofences(),
        advancedFeaturesAPI.getGeofenceAlerts(),
        advancedFeaturesAPI.getRoutes()
      ]);

      if (devicesRes.success) setDevices(devicesRes.data || []);
      if (geofencesRes.success) setGeofences(geofencesRes.data || []);
      if (alertsRes.success) setAlerts(alertsRes.data || []);
      if (routesRes.success) setRoutes(routesRes.data || []);
    } catch (error) {
      console.error('Error loading GPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceLocation = async (deviceId: string, location: any) => {
    try {
      await advancedFeaturesAPI.updateGPSLocation(deviceId, location);
      await loadGPSData();
    } catch (error) {
      console.error('Error updating device location:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await advancedFeaturesAPI.acknowledgeAlert(alertId, 'current_user');
      await loadGPSData();
      alert(language === 'my' 
        ? 'သတိပေးချက်ကို အသိအမှတ်ပြုပြီးပါပြီ' 
        : 'Alert acknowledged successfully'
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const createGeofence = async (geofenceData: Partial<GeofenceZone>) => {
    try {
      const response = await advancedFeaturesAPI.createGeofence(geofenceData);
      if (response.success) {
        await loadGPSData();
        alert(language === 'my' 
          ? 'ဂျီယိုဖန်စ်ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ' 
          : 'Geofence created successfully'
        );
      }
    } catch (error) {
      console.error('Error creating geofence:', error);
    }
  };

  const optimizeRoute = async (routeId: string) => {
    try {
      setLoading(true);
      const response = await advancedFeaturesAPI.updateRouteStatus(routeId, 'OPTIMIZED');
      if (response.success) {
        await loadGPSData();
        alert(language === 'my' 
          ? 'လမ်းကြောင်းကို အကောင်းဆုံးပြုလုပ်ပြီးပါပြီ' 
          : 'Route optimized successfully'
        );
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': case 'ACTIVE': case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'OFFLINE': case 'INACTIVE': case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PLANNED': case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'VEHICLE': return <Truck className="w-4 h-4" />;
      case 'RIDER': return <User className="w-4 h-4" />;
      case 'MOBILE': return <MapPin className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getBatteryIcon = (level?: number) => {
    if (!level) return <Battery className="w-4 h-4 text-gray-400" />;
    if (level > 50) return <Battery className="w-4 h-4 text-green-500" />;
    if (level > 20) return <Battery className="w-4 h-4 text-yellow-500" />;
    return <Battery className="w-4 h-4 text-red-500" />;
  };

  const getSignalIcon = (strength?: number) => {
    if (!strength) return <Signal className="w-4 h-4 text-gray-400" />;
    if (strength > 70) return <Signal className="w-4 h-4 text-green-500" />;
    if (strength > 40) return <Signal className="w-4 h-4 text-yellow-500" />;
    return <Signal className="w-4 h-4 text-red-500" />;
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderLiveTrackingTab = () => (
    <div className="space-y-6">
      {/* Live Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            {language === 'my' ? 'တိုက်ရိုက်ခြေရာခံမြေပုံ' : 'Live Tracking Map'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {language === 'my' 
                  ? 'မြေပုံ ဒေတာ လုဒ်လုပ်နေသည်...' 
                  : 'Loading map data...'
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {language === 'my' 
                  ? `${devices.filter(d => d.status === 'ONLINE').length} ကိရိယာ အွန်လိုင်းရှိ` 
                  : `${devices.filter(d => d.status === 'ONLINE').length} devices online`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {devices.filter(d => d.status === 'ONLINE').length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'အွန်လိုင်း' : 'Online'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {devices.filter(d => d.status === 'OFFLINE').length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'အော့ဖ်လိုင်း' : 'Offline'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routes.filter(r => r.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'လုပ်ဆောင်နေသော လမ်းကြောင်း' : 'Active Routes'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {alerts.filter(a => !a.acknowledged).length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'my' ? 'သတိပေးချက်များ' : 'Alerts'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDevicesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={language === 'my' ? 'ကိရိယာ ID ရှာရန်...' : 'Search device ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">{language === 'my' ? 'အခြေအနေအားလုံး' : 'All Status'}</option>
              <option value="ONLINE">{language === 'my' ? 'အွန်လိုင်း' : 'Online'}</option>
              <option value="OFFLINE">{language === 'my' ? 'အော့ဖ်လိုင်း' : 'Offline'}</option>
              <option value="INACTIVE">{language === 'my' ? 'မလုပ်ဆောင်' : 'Inactive'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'my' ? 'GPS ကိရိယာ မရှိပါ' : 'No GPS devices found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDevices.map((device) => (
            <Card key={device.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getDeviceIcon(device.device_type)}
                      <span className="font-medium">{device.device_id}</span>
                      <Badge className={getStatusColor(device.status)}>
                        {language === 'my' 
                          ? device.status === 'ONLINE' ? 'အွန်လိုင်း'
                            : device.status === 'OFFLINE' ? 'အော့ဖ်လိုင်း'
                            : 'မလုပ်ဆောင်'
                          : device.status
                        }
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'သတ်မှတ်ထား:' : 'Assigned:'}
                        </span>
                        <span className="ml-1 font-medium">{device.assigned_to}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'အမျိုးအစား:' : 'Type:'}
                        </span>
                        <span className="ml-1">{device.device_type}</span>
                      </div>
                      {device.speed !== undefined && (
                        <div>
                          <span className="text-gray-600">
                            {language === 'my' ? 'အမြန်နှုန်း:' : 'Speed:'}
                          </span>
                          <span className="ml-1">{device.speed} km/h</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'နောက်ဆုံးအပ်ဒိတ်:' : 'Last Update:'}
                        </span>
                        <span className="ml-1">
                          {new Date(device.last_location.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Device Status Indicators */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        {getBatteryIcon(device.battery_level)}
                        <span className="text-xs">
                          {device.battery_level ? `${device.battery_level}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getSignalIcon(device.signal_strength)}
                        <span className="text-xs">
                          {device.signal_strength ? `${device.signal_strength}%` : 'N/A'}
                        </span>
                      </div>
                      {device.last_location.accuracy && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span className="text-xs">±{device.last_location.accuracy}m</span>
                        </div>
                      )}
                    </div>

                    {device.last_location.address && (
                      <div className="mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {device.last_location.address}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {device.status === 'ONLINE' && (
                      <GPSTracker
                        deviceId={device.device_id}
                        onLocationUpdate={(location) => updateDeviceLocation(device.id, location)}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderGeofencesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === 'my' ? 'ဂျီယိုဖန်စ် ဇုန်များ' : 'Geofence Zones'}
            </span>
            <Button>
              {language === 'my' ? 'ဇုန်အသစ်ဖန်တီး' : 'Create Zone'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geofences.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'ဂျီယိုဖန်စ် ဇုန် မရှိပါ' : 'No geofence zones found'}
                </p>
              </div>
            ) : (
              geofences.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{zone.name}</span>
                      <Badge className={getStatusColor(zone.status)}>
                        {language === 'my' 
                          ? zone.status === 'ACTIVE' ? 'အသက်ဝင်နေ' : 'မလုပ်ဆောင်'
                          : zone.status
                        }
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>{language === 'my' ? 'အမျိုးအစား:' : 'Type:'} {zone.type}</span>
                      <span className="ml-4">
                        {language === 'my' ? 'အချင်းဝက်:' : 'Radius:'} {zone.coordinates.radius}m
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs">
                      {zone.entry_alerts && (
                        <span className="text-green-600">
                          {language === 'my' ? 'ဝင်ရောက်သတိပေးချက်' : 'Entry Alerts'}
                        </span>
                      )}
                      {zone.exit_alerts && (
                        <span className="text-red-600">
                          {language === 'my' ? 'ထွက်ခွာသတိပေးချက်' : 'Exit Alerts'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRoutesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            {language === 'my' ? 'လမ်းကြောင်း စီမံခန့်ခွဲမှု' : 'Route Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.length === 0 ? (
              <div className="text-center py-8">
                <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'လမ်းကြောင်း မရှိပါ' : 'No routes found'}
                </p>
              </div>
            ) : (
              routes.map((route) => (
                <Card key={route.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{route.route_name}</span>
                          <Badge className={getStatusColor(route.status)}>
                            {language === 'my' 
                              ? route.status === 'PLANNED' ? 'စီစဉ်ထား'
                                : route.status === 'IN_PROGRESS' ? 'လုပ်ဆောင်နေ'
                                : route.status === 'COMPLETED' ? 'ပြီးစီး'
                                : 'ပယ်ဖျက်'
                              : route.status
                            }
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">
                              {language === 'my' ? 'ကိရိယာ:' : 'Device:'}
                            </span>
                            <span className="ml-1 font-medium">{route.assigned_device}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {language === 'my' ? 'ခရီးအကွာအဝေး:' : 'Distance:'}
                            </span>
                            <span className="ml-1">{route.total_distance} km</span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {language === 'my' ? 'ခန့်မှန်းချိန်:' : 'Est. Duration:'}
                            </span>
                            <span className="ml-1">{Math.round(route.estimated_duration / 60)} min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {language === 'my' ? 'လောင်စာဆီ:' : 'Fuel Est:'}
                            </span>
                            <span className="ml-1">{route.fuel_estimation}L</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-sm text-gray-600">
                            {language === 'my' ? 'ဝေးပွိုင့်များ:' : 'Waypoints:'} {route.waypoints.length}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {route.waypoints.map((waypoint, index) => (
                              <div
                                key={waypoint.id}
                                className={`w-3 h-3 rounded-full ${
                                  waypoint.status === 'COMPLETED' ? 'bg-green-500' :
                                  waypoint.status === 'ARRIVED' ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                                title={waypoint.address}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => optimizeRoute(route.id)}
                          disabled={loading || route.status !== 'PLANNED'}
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {language === 'my' ? 'ဂျီယိုဖန်စ် သတိပေးချက်များ' : 'Geofence Alerts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'သတိပေးချက် မရှိပါ' : 'No alerts found'}
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 border rounded ${
                    alert.acknowledged ? 'bg-gray-50' : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.alert_type === 'VIOLATION' ? 'text-red-500' :
                          alert.alert_type === 'ENTRY' ? 'text-green-500' : 'text-blue-500'
                        }`} />
                        <span className="font-medium">
                          {language === 'my' 
                            ? alert.alert_type === 'ENTRY' ? 'ဝင်ရောက်မှု'
                              : alert.alert_type === 'EXIT' ? 'ထွက်ခွာမှု'
                              : 'ချိုးဖောက်မှု'
                            : alert.alert_type
                          }
                        </span>
                        {alert.acknowledged && (
                          <Badge variant="secondary">
                            {language === 'my' ? 'အသိအမှတ်ပြုပြီး' : 'Acknowledged'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div>
                          <span>{language === 'my' ? 'ကိရိယာ:' : 'Device:'} {alert.device_id}</span>
                        </div>
                        <div>
                          <span>{language === 'my' ? 'အချိန်:' : 'Time:'} {new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        {alert.acknowledged_by && (
                          <div className="text-xs text-gray-500 mt-1">
                            {language === 'my' ? 'အသိအမှတ်ပြုသူ:' : 'Acknowledged by:'} {alert.acknowledged_by} 
                            {alert.acknowledged_at && ` at ${new Date(alert.acknowledged_at).toLocaleString()}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {language === 'my' ? 'အသိအမှတ်ပြု' : 'Acknowledge'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {language === 'my' ? 'GPS ခြေရာခံစနစ်' : 'GPS Tracking System'}
        </h1>
        <Button onClick={loadGPSData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'LIVE', label: language === 'my' ? 'တိုက်ရိုက်' : 'Live', icon: Activity },
          { key: 'DEVICES', label: language === 'my' ? 'ကိရိယာများ' : 'Devices', icon: MapPin },
          { key: 'GEOFENCES', label: language === 'my' ? 'ဂျီယိုဖန်စ်' : 'Geofences', icon: Shield },
          { key: 'ROUTES', label: language === 'my' ? 'လမ်းကြောင်း' : 'Routes', icon: Navigation },
          { key: 'ALERTS', label: language === 'my' ? 'သတိပေးချက်' : 'Alerts', icon: AlertTriangle }
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
            {key === 'ALERTS' && alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'LIVE' && renderLiveTrackingTab()}
      {activeTab === 'DEVICES' && renderDevicesTab()}
      {activeTab === 'GEOFENCES' && renderGeofencesTab()}
      {activeTab === 'ROUTES' && renderRoutesTab()}
      {activeTab === 'ALERTS' && renderAlertsTab()}
    </div>
  );
}