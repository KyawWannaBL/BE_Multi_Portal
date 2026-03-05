import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  Scan, 
  CheckCircle, 
  Truck, 
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/SharedComponents';
import { useLanguageContext } from '@/lib/LanguageContext';

interface WarehouseStats {
  inbound: number;
  sorted: number;
  manifested: number;
  outForDelivery: number;
}

interface ScanLog {
  id: string;
  trackingNumber: string;
  action: 'received' | 'sorted' | 'manifested' | 'dispatched';
  location: string;
  timestamp: string;
  processedBy: string;
}

const mockStats: WarehouseStats = {
  inbound: 45,
  sorted: 32,
  manifested: 18,
  outForDelivery: 12
};

const mockRecentScans: ScanLog[] = [
  {
    id: '1',
    trackingNumber: 'BE-2024-001',
    action: 'received',
    location: 'Dock A-1',
    timestamp: '2024-01-17 09:15:23',
    processedBy: 'Warehouse Staff 1'
  },
  {
    id: '2',
    trackingNumber: 'BE-2024-002',
    action: 'sorted',
    location: 'Zone B-3',
    timestamp: '2024-01-17 09:12:45',
    processedBy: 'Warehouse Staff 2'
  },
  {
    id: '3',
    trackingNumber: 'BE-2024-003',
    action: 'manifested',
    location: 'Loading Bay 2',
    timestamp: '2024-01-17 09:08:12',
    processedBy: 'Warehouse Staff 1'
  }
];

export default function WarehouseDashboard() {
  const { t } = useLanguageContext();
  const [activeStage, setActiveStage] = useState('Scanning');
  const [barcode, setBarcode] = useState('');
  const [location, setLocation] = useState('');
  const [recentScans, setRecentScans] = useState<ScanLog[]>(mockRecentScans);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input for continuous scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeStage]);

  const handleScan = async () => {
    if (!barcode.trim()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newScan: ScanLog = {
        id: Date.now().toString(),
        trackingNumber: barcode,
        action: 'received',
        location: location || 'Default Location',
        timestamp: new Date().toLocaleString(),
        processedBy: 'Current User'
      };
      
      setRecentScans(prev => [newScan, ...prev.slice(0, 4)]);
      setBarcode('');
      setLocation('');
      setLoading(false);
      inputRef.current?.focus();
    }, 1000);
  };

  const getActionBadge = (action: ScanLog['action']) => {
    const actionConfig = {
      received: { label: t('warehouse.inbound'), variant: 'secondary' as const },
      sorted: { label: t('warehouse.sorted'), variant: 'default' as const },
      manifested: { label: t('warehouse.manifested'), variant: 'outline' as const },
      dispatched: { label: t('warehouse.outForDelivery'), variant: 'default' as const },
    };
    
    const config = actionConfig[action];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t('warehouse.dashboard')}</h1>
          <p className="text-sm text-gray-500">
            {t('Real-time warehouse operations and package tracking')}
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>{t('common.refresh')}</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={t('warehouse.inbound')} 
          value={mockStats.inbound.toString()} 
          hint={t('Packages received')} 
          tone="blue"
          icon={Package}
        />
        <StatCard 
          title={t('warehouse.sorted')} 
          value={mockStats.sorted.toString()} 
          hint={t('Ready for manifest')} 
          tone="orange"
          icon={CheckCircle}
        />
        <StatCard 
          title={t('warehouse.manifested')} 
          value={mockStats.manifested.toString()} 
          hint={t('Ready for dispatch')} 
          tone="purple"
          icon={BarChart3}
        />
        <StatCard 
          title={t('warehouse.outForDelivery')} 
          value={mockStats.outForDelivery.toString()} 
          hint={t('In transit')} 
          tone="green"
          icon={Truck}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanning Interface */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
            <CardTitle className="flex items-center">
              <Scan className="h-5 w-5 mr-2" />
              {t('warehouse.scanning')} {t('Interface')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeStage} onValueChange={setActiveStage}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="Scanning">{t('Scan')}</TabsTrigger>
                <TabsTrigger value="Sorting">{t('Sort')}</TabsTrigger>
                <TabsTrigger value="Manifest">{t('Manifest')}</TabsTrigger>
                <TabsTrigger value="Dispatch">{t('Dispatch')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="Scanning" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('Tracking Number')}
                    </label>
                    <Input
                      ref={inputRef}
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder={t('Scan or enter tracking number')}
                      onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                      className="font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('Location')}
                    </label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t('Enter location (optional)')}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleScan}
                    disabled={!barcode.trim() || loading}
                    className="w-full bg-navy-900 hover:bg-navy-800"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Scan className="h-4 w-4 mr-2" />
                    )}
                    {loading ? t('Processing...') : t('Process Package')}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="Sorting" className="mt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('Sorting interface coming soon')}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="Manifest" className="mt-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('Manifest interface coming soon')}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="Dispatch" className="mt-6">
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('Dispatch interface coming soon')}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('warehouse.recentScans')}</span>
              <Badge variant="outline">{recentScans.length} {t('Recent')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {recentScans.map((scan, index) => (
                <div 
                  key={scan.id} 
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === recentScans.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{scan.trackingNumber}</p>
                      <p className="text-xs text-gray-500">{scan.timestamp}</p>
                    </div>
                    {getActionBadge(scan.action)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{scan.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      <span>{t('warehouse.processedBy')}: {scan.processedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}