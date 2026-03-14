import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  QrCode, 
  Search, 
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  Scan
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { QRCodeLabel } from '@/components/QRCodeLabel';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

interface LabelBatch {
  id: string;
  batch_number: string;
  total_labels: number;
  activated_labels: number;
  status: 'assigned' | 'in_progress' | 'completed';
  assigned_date: string;
  labels: Label[];
}

interface Label {
  id: string;
  label_number: string;
  awb_number?: string;
  status: 'inactive' | 'activated' | 'used';
  activated_at?: string;
  shipment_data?: any;
}

export default function RiderLabel() {
  const { t, language } = useLanguage();
  const [labelBatches, setLabelBatches] = useState<LabelBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<LabelBatch | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLabelPreview, setShowLabelPreview] = useState(false);

  useEffect(() => {
    loadLabelBatches();
  }, []);

  const loadLabelBatches = async () => {
    try {
      setLoading(true);
      // Mock label batches for demo
      const response: { success: boolean; data: LabelBatch[] } = { success: true, data: [] };
      
      if (response.success) {
        setLabelBatches(response.data || []);
      }
    } catch (error) {
      console.error('Error loading label batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batch: LabelBatch) => {
    setSelectedBatch(batch);
  };

  const handleLabelScan = async (data: string) => {
    try {
      const labelData = JSON.parse(data);
      
      if (selectedBatch) {
        // Mock label activation for demo
        const response = { success: true };

        if (response.success) {
          // Create activation event
          await advancedFeaturesAPI.createEvent({
            event_type: 'LABEL_ACTIVATION',
            event_category: 'rider_operation',
            reference_id: labelData.label_id,
            reference_type: 'label',
            event_data: { label_data: labelData, batch_id: selectedBatch.id }
          });

          // Refresh batch data
          loadLabelBatches();
          setScannerActive(false);
          
          alert(language === 'my' ? 'Label အသက်ဝင်ပြီး' : 'Label activated successfully');
        }
      }
    } catch (error) {
      console.error('Label activation error:', error);
      alert(language === 'my' ? 'Label အသက်ဝင်မှု မအောင်မြင်ပါ' : 'Failed to activate label');
    }
  };

  const handlePrintLabel = (label: Label) => {
    if (label.shipment_data) {
      setSelectedLabel(label);
      setShowLabelPreview(true);
    } else {
      alert(language === 'my' ? 'ပုံနှိပ်ရန် အချက်အလက် မရှိပါ' : 'No shipment data available for printing');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'activated': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Tag className="w-4 h-4" />;
      case 'activated': return <CheckCircle className="w-4 h-4" />;
      case 'used': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (showLabelPreview && selectedLabel) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" onClick={() => setShowLabelPreview(false)}>
            {language === 'my' ? 'နောက်သို့' : 'Back'}
          </Button>
          <h2 className="text-2xl font-bold">
            {language === 'my' ? 'Label ပုံနှိပ်ခြင်း' : 'Label Printing'}
          </h2>
        </div>

        <QRCodeLabel
          shipmentData={selectedLabel.shipment_data}
          onPrint={() => {
        // Mock label status update
        console.log('Label marked as used:', selectedLabel.id);
          }}
        />
      </div>
    );
  }

  if (selectedBatch) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" onClick={() => setSelectedBatch(null)}>
            {language === 'my' ? 'နောက်သို့' : 'Back'}
          </Button>
          <h2 className="text-2xl font-bold">
            {language === 'my' ? 'Label အစုအဖွဲ့အသေးစိတ်' : 'Label Batch Details'}
          </h2>
        </div>

        <div className="space-y-6">
          {/* Batch Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedBatch.batch_number}</span>
                <Badge className={getStatusColor(selectedBatch.status)}>
                  {getStatusIcon(selectedBatch.status)}
                  <span className="ml-1">
                    {language === 'my' 
                      ? selectedBatch.status === 'assigned' ? 'သတ်မှတ်ပြီး'
                        : selectedBatch.status === 'in_progress' ? 'လုပ်ဆောင်နေ'
                        : 'ပြီးစီး'
                      : selectedBatch.status.replace('_', ' ').toUpperCase()
                    }
                  </span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedBatch.total_labels}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'စုစုပေါင်း Labels' : 'Total Labels'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedBatch.activated_labels}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'အသက်ဝင်ပြီး' : 'Activated'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedBatch.total_labels - selectedBatch.activated_labels}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'ကျန်ရှိ' : 'Remaining'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((selectedBatch.activated_labels / selectedBatch.total_labels) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'ပြီးစီးမှု' : 'Progress'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                {language === 'my' ? 'Label အသက်ဝင်စေခြင်း' : 'Label Activation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannerActive ? (
                <div className="space-y-4">
                  <QRCodeScanner
                    onScan={handleLabelScan}
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
                  {language === 'my' ? 'Label အသက်ဝင်စေမည်' : 'Activate Labels'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Label List */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'my' ? 'Label စာရင်း' : 'Label List'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedBatch.labels.map((label) => (
                  <div 
                    key={label.id}
                    className={`flex items-center justify-between p-3 rounded border ${
                      label.status === 'activated' ? 'bg-green-50 border-green-200' 
                      : label.status === 'used' ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        label.status === 'activated' ? 'bg-green-500' 
                        : label.status === 'used' ? 'bg-purple-500'
                        : 'bg-gray-300'
                      }`} />
                      <div>
                        <span className="font-mono">{label.label_number}</span>
                        {label.awb_number && (
                          <div className="text-xs text-gray-600">AWB: {label.awb_number}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(label.status)}>
                        {getStatusIcon(label.status)}
                        <span className="ml-1">
                          {language === 'my' 
                            ? label.status === 'inactive' ? 'မအသက်ဝင်'
                              : label.status === 'activated' ? 'အသက်ဝင်ပြီး'
                              : 'အသုံးပြုပြီး'
                            : label.status.toUpperCase()
                          }
                        </span>
                      </Badge>
                      {label.status === 'activated' && label.shipment_data && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePrintLabel(label)}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          {language === 'my' ? 'ပုံနှိပ်' : 'Print'}
                        </Button>
                      )}
                      {label.activated_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(label.activated_at).toLocaleString()}
                        </span>
                      )}
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {language === 'my' ? 'Label အစုအဖွဲ့များ' : 'Label Batches'}
        </h2>
        <Button onClick={loadLabelBatches} disabled={loading}>
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder={language === 'my' ? 'Batch နံပါတ် ရှာရန်...' : 'Search batch number...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
        </div>
      ) : labelBatches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === 'my' ? 'Label အစုအဖွဲ့ မရှိပါ' : 'No label batches found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {labelBatches
            .filter(batch => batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((batch) => (
            <Card key={batch.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{batch.batch_number}</h3>
                      <Badge className={getStatusColor(batch.status)}>
                        {getStatusIcon(batch.status)}
                        <span className="ml-1">
                          {language === 'my' 
                            ? batch.status === 'assigned' ? 'သတ်မှတ်ပြီး'
                              : batch.status === 'in_progress' ? 'လုပ်ဆောင်နေ'
                              : 'ပြီးစီး'
                            : batch.status.replace('_', ' ').toUpperCase()
                          }
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'စုစုပေါင်း:' : 'Total:'}
                        </span>
                        <span className="font-medium ml-1">{batch.total_labels}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'အသက်ဝင်ပြီး:' : 'Activated:'}
                        </span>
                        <span className="font-medium ml-1 text-green-600">{batch.activated_labels}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'ပြီးစီးမှု:' : 'Progress:'}
                        </span>
                        <span className="font-medium ml-1">
                          {Math.round((batch.activated_labels / batch.total_labels) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(batch.activated_labels / batch.total_labels) * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {language === 'my' ? 'သတ်မှတ်ရက်:' : 'Assigned:'} {new Date(batch.assigned_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button onClick={() => handleBatchSelect(batch)}>
                    <Tag className="w-4 h-4 mr-2" />
                    {language === 'my' ? 'ကြည့်မည်' : 'Manage'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}