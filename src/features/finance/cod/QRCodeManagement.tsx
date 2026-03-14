import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  QrCode, 
  Package, 
  Truck, 
  User, 
  Warehouse, 
  Scan,
  History,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  Eye,
  Search,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { QRCodeLabel } from '@/components/QRCodeLabel';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

interface QRCodeData {
  id: string;
  qr_code: string;
  qr_type: 'SHIPMENT' | 'PARCEL' | 'VEHICLE' | 'RIDER' | 'WAREHOUSE';
  reference_id: string;
  reference_type: string;
  status: 'ACTIVE' | 'SCANNED' | 'EXPIRED';
  data: any;
  created_at: string;
  expires_at?: string;
  scan_count: number;
  last_scanned_at?: string;
  last_scanned_by?: string;
  last_scan_location?: any;
}

interface ScanHistory {
  id: string;
  qr_code_id: string;
  scanned_by: string;
  scanned_at: string;
  scan_location?: any;
  device_info?: any;
  scan_result: 'SUCCESS' | 'FAILED' | 'EXPIRED';
  notes?: string;
}

export default function QRCodeManagement() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'SCAN' | 'MANAGE' | 'HISTORY'>('GENERATE');
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Generation form state
  const [generateForm, setGenerateForm] = useState({
    type: 'SHIPMENT',
    reference_id: '',
    reference_type: '',
    expires_in_hours: 24,
    data: {}
  });

  useEffect(() => {
    loadQRCodes();
    loadScanHistory();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const response = await advancedFeaturesAPI.getQRCodes();
      if (response.success) {
        setQrCodes(response.data || []);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScanHistory = async () => {
    try {
      const response = await advancedFeaturesAPI.getScanHistory();
      if (response.success) {
        setScanHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      const qrData = {
        type: generateForm.type,
        reference_id: generateForm.reference_id,
        reference_type: generateForm.reference_type,
        data: generateForm.data,
        expires_at: new Date(Date.now() + generateForm.expires_in_hours * 60 * 60 * 1000).toISOString()
      };

      const response = await advancedFeaturesAPI.generateQRCode(
        generateForm.type,
        generateForm.reference_id,
        generateForm.reference_type,
        qrData
      );
      
      if (response.success) {
        await loadQRCodes();
        setGenerateForm({
          type: 'SHIPMENT',
          reference_id: '',
          reference_type: '',
          expires_in_hours: 24,
          data: {}
        });
        
        alert(language === 'my' 
          ? 'QR ကုဒ်ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ' 
          : 'QR Code generated successfully'
        );
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert(language === 'my' 
        ? 'QR ကုဒ် ဖန်တီးမှု မအောင်မြင်ပါ' 
        : 'Failed to generate QR code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (scanResult: string) => {
    try {
      setLoading(true);
      
      const scanData = {
        qr_data: scanResult,
        scanned_by: 'current_user',
        scan_location: await getCurrentLocation(),
        device_info: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const response = await advancedFeaturesAPI.processScan(scanData);
      
      if (response.success) {
        await loadQRCodes();
        await loadScanHistory();
        setScannerActive(false);
        
        alert(language === 'my' 
          ? 'QR ကုဒ်ကို အောင်မြင်စွာ စကင်န်ဖတ်ပြီးပါပြီ' 
          : 'QR Code scanned successfully'
        );
      } else {
        alert(language === 'my' 
          ? 'QR ကုဒ် စကင်န်ဖတ်မှု မအောင်မြင်ပါ' 
          : 'Failed to scan QR code'
        );
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      alert(language === 'my' 
        ? 'စကင်န်ဖတ်မှု အမှားအယွင်း' 
        : 'Scan processing error'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            resolve({ lat: 0, lng: 0 });
          }
        );
      } else {
        resolve({ lat: 0, lng: 0 });
      }
    });
  };

  const updateQRStatus = async (qrId: string, status: string) => {
    try {
      const response = await advancedFeaturesAPI.updateQRStatus(qrId, status);
      if (response.success) {
        await loadQRCodes();
        alert(language === 'my' 
          ? 'QR ကုဒ် အခြေအနေကို အပ်ဒိတ်လုပ်ပြီးပါပြီ' 
          : 'QR Code status updated'
        );
      }
    } catch (error) {
      console.error('Error updating QR status:', error);
    }
  };

  const exportQRCode = (qrCode: QRCodeData) => {
    // Create downloadable QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText('QR Code', 80, 100);
      ctx.fillText(qrCode.reference_id, 60, 120);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr_${qrCode.reference_id}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SCANNED': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SHIPMENT': return <Package className="w-4 h-4" />;
      case 'PARCEL': return <Package className="w-4 h-4" />;
      case 'VEHICLE': return <Truck className="w-4 h-4" />;
      case 'RIDER': return <User className="w-4 h-4" />;
      case 'WAREHOUSE': return <Warehouse className="w-4 h-4" />;
      default: return <QrCode className="w-4 h-4" />;
    }
  };

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = qr.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qr.qr_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || qr.qr_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || qr.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {language === 'my' ? 'QR ကုဒ် ဖန်တီးရန်' : 'Generate QR Code'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'အမျိုးအစား' : 'Type'}
              </label>
              <select
                value={generateForm.type}
                onChange={(e) => setGenerateForm({...generateForm, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="SHIPMENT">{language === 'my' ? 'ပို့ဆောင်မှု' : 'Shipment'}</option>
                <option value="PARCEL">{language === 'my' ? 'ပစ္စည်း' : 'Parcel'}</option>
                <option value="VEHICLE">{language === 'my' ? 'ယာဉ်' : 'Vehicle'}</option>
                <option value="RIDER">{language === 'my' ? 'ပို့ဆောင်သူ' : 'Rider'}</option>
                <option value="WAREHOUSE">{language === 'my' ? 'ဂိုဒေါင်' : 'Warehouse'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ရည်ညွှန်း ID' : 'Reference ID'}
              </label>
              <Input
                value={generateForm.reference_id}
                onChange={(e) => setGenerateForm({...generateForm, reference_id: e.target.value})}
                placeholder={language === 'my' ? 'ID ထည့်ပါ' : 'Enter ID'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ရည်ညွှန်း အမျိုးအစား' : 'Reference Type'}
              </label>
              <Input
                value={generateForm.reference_type}
                onChange={(e) => setGenerateForm({...generateForm, reference_type: e.target.value})}
                placeholder={language === 'my' ? 'အမျိုးအစား ထည့်ပါ' : 'Enter type'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'သက်တမ်း (နာရီ)' : 'Expires In (Hours)'}
              </label>
              <Input
                type="number"
                value={generateForm.expires_in_hours}
                onChange={(e) => setGenerateForm({...generateForm, expires_in_hours: parseInt(e.target.value)})}
                min="1"
                max="8760"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'my' ? 'အပိုအချက်အလက် (JSON)' : 'Additional Data (JSON)'}
            </label>
            <Textarea
              value={JSON.stringify(generateForm.data, null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  setGenerateForm({...generateForm, data});
                } catch (error) {
                  // Invalid JSON, keep current data
                }
              }}
              placeholder='{"key": "value"}'
              rows={4}
            />
          </div>
          
          <Button 
            onClick={generateQRCode} 
            disabled={loading || !generateForm.reference_id}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            {language === 'my' ? 'QR ကုဒ် ဖန်တီးမည်' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderScanTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            {language === 'my' ? 'QR ကုဒ် စကင်န်ဖတ်ရန်' : 'Scan QR Code'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scannerActive ? (
            <div className="space-y-4">
              <QRCodeScanner
                onScan={handleQRScan}
                onError={(error) => {
                  console.error('Scanner error:', error);
                  alert(language === 'my' ? 'စကင်နာ အမှား' : 'Scanner error');
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => setScannerActive(false)}
                className="w-full"
              >
                {language === 'my' ? 'စကင်နာ ပိတ်မည်' : 'Close Scanner'}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setScannerActive(true)}
              className="w-full"
              size="lg"
            >
              <Scan className="w-4 h-4 mr-2" />
              {language === 'my' ? 'စကင်န်ဖတ်ရန် စတင်မည်' : 'Start Scanning'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder={language === 'my' ? 'ရှာဖွေရန်...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">{language === 'my' ? 'အမျိုးအစားအားလုံး' : 'All Types'}</option>
              <option value="SHIPMENT">{language === 'my' ? 'ပို့ဆောင်မှု' : 'Shipment'}</option>
              <option value="PARCEL">{language === 'my' ? 'ပစ္စည်း' : 'Parcel'}</option>
              <option value="VEHICLE">{language === 'my' ? 'ယာဉ်' : 'Vehicle'}</option>
              <option value="RIDER">{language === 'my' ? 'ပို့ဆောင်သူ' : 'Rider'}</option>
              <option value="WAREHOUSE">{language === 'my' ? 'ဂိုဒေါင်' : 'Warehouse'}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">{language === 'my' ? 'အခြေအနေအားလုံး' : 'All Status'}</option>
              <option value="ACTIVE">{language === 'my' ? 'အသက်ဝင်နေ' : 'Active'}</option>
              <option value="SCANNED">{language === 'my' ? 'စကင်န်ဖတ်ပြီး' : 'Scanned'}</option>
              <option value="EXPIRED">{language === 'my' ? 'သက်တမ်းကုန်' : 'Expired'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
          </div>
        ) : filteredQRCodes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'my' ? 'QR ကုဒ် မရှိပါ' : 'No QR codes found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQRCodes.map((qr) => (
            <Card key={qr.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(qr.qr_type)}
                      <span className="font-medium">{qr.reference_id}</span>
                      <Badge className={getStatusColor(qr.status)}>
                        {language === 'my' 
                          ? qr.status === 'ACTIVE' ? 'အသက်ဝင်နေ'
                            : qr.status === 'SCANNED' ? 'စကင်န်ဖတ်ပြီး'
                            : 'သက်တမ်းကုန်'
                          : qr.status
                        }
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">
                          {language === 'my' ? 'အမျိုးအစား:' : 'Type:'}
                        </span>
                        <span className="ml-1">{qr.qr_type}</span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {language === 'my' ? 'စကင်န်အကြိမ်:' : 'Scans:'}
                        </span>
                        <span className="ml-1">{qr.scan_count}</span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {language === 'my' ? 'ဖန်တီးရက်:' : 'Created:'}
                        </span>
                        <span className="ml-1">{new Date(qr.created_at).toLocaleDateString()}</span>
                      </div>
                      {qr.expires_at && (
                        <div>
                          <span className="font-medium">
                            {language === 'my' ? 'သက်တမ်း:' : 'Expires:'}
                          </span>
                          <span className="ml-1">{new Date(qr.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {qr.last_scanned_at && (
                      <div className="mt-2 text-xs text-gray-500">
                        {language === 'my' ? 'နောက်ဆုံးစကင်န်:' : 'Last scanned:'} {new Date(qr.last_scanned_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportQRCode(qr)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedQR(qr)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {qr.status === 'ACTIVE' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQRStatus(qr.id, 'EXPIRED')}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
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

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {language === 'my' ? 'စကင်န်မှတ်တမ်း' : 'Scan History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'စကင်န်မှတ်တမ်း မရှိပါ' : 'No scan history found'}
                </p>
              </div>
            ) : (
              scanHistory.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={scan.scan_result === 'SUCCESS' ? 'default' : 'destructive'}>
                        {language === 'my' 
                          ? scan.scan_result === 'SUCCESS' ? 'အောင်မြင်' : 'မအောင်မြင်'
                          : scan.scan_result
                        }
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(scan.scanned_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {language === 'my' ? 'စကင်န်လုပ်သူ:' : 'Scanned by:'}
                      </span>
                      <span className="ml-1">{scan.scanned_by}</span>
                    </div>
                    {scan.notes && (
                      <div className="text-xs text-gray-500 mt-1">{scan.notes}</div>
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
          {language === 'my' ? 'QR ကုဒ် စီမံခန့်ခွဲမှု' : 'QR Code Management'}
        </h1>
        <Button onClick={() => { loadQRCodes(); loadScanHistory(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'GENERATE', label: language === 'my' ? 'ဖန်တီးရန်' : 'Generate', icon: QrCode },
          { key: 'SCAN', label: language === 'my' ? 'စကင်န်ဖတ်ရန်' : 'Scan', icon: Scan },
          { key: 'MANAGE', label: language === 'my' ? 'စီမံခန့်ခွဲရန်' : 'Manage', icon: Package },
          { key: 'HISTORY', label: language === 'my' ? 'မှတ်တမ်း' : 'History', icon: History }
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
      {activeTab === 'GENERATE' && renderGenerateTab()}
      {activeTab === 'SCAN' && renderScanTab()}
      {activeTab === 'MANAGE' && renderManageTab()}
      {activeTab === 'HISTORY' && renderHistoryTab()}

      {/* QR Detail Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'my' ? 'QR ကုဒ် အသေးစိတ်' : 'QR Code Details'}</span>
                <Button variant="ghost" onClick={() => setSelectedQR(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'ရည်ညွှန်း ID' : 'Reference ID'}
                  </label>
                  <p className="font-mono">{selectedQR.reference_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'အမျိုးအစား' : 'Type'}
                  </label>
                  <p>{selectedQR.qr_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'အခြေအနေ' : 'Status'}
                  </label>
                  <Badge className={getStatusColor(selectedQR.status)}>
                    {language === 'my' 
                      ? selectedQR.status === 'ACTIVE' ? 'အသက်ဝင်နေ'
                        : selectedQR.status === 'SCANNED' ? 'စကင်န်ဖတ်ပြီး'
                        : 'သက်တမ်းကုန်'
                      : selectedQR.status
                    }
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'စကင်န်အကြိမ်' : 'Scan Count'}
                  </label>
                  <p>{selectedQR.scan_count}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">
                  {language === 'my' ? 'QR ကုဒ်ဒေတာ' : 'QR Code Data'}
                </label>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedQR.data, null, 2)}
                </pre>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => exportQRCode(selectedQR)}>
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'my' ? 'ဒေါင်းလုဒ်' : 'Download'}
                </Button>
                {selectedQR.qr_type === 'SHIPMENT' && (
                  <Button variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    {language === 'my' ? 'လေဘယ်ပုံနှိပ်' : 'Print Label'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}