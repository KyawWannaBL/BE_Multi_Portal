import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  QrCode, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

interface TagBatch {
  id: string;
  batch_number: string;
  total_tags: number;
  scanned_tags: number;
  status: 'assigned' | 'in_progress' | 'completed';
  assigned_date: string;
  tags: Tag[];
}

interface Tag {
  id: string;
  tag_number: string;
  status: 'pending' | 'scanned' | 'used';
  scanned_at?: string;
  associated_shipment?: string;
}

export default function RiderTags() {
  const { t, language } = useLanguage();
  const [tagBatches, setTagBatches] = useState<TagBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<TagBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadTagBatches();
  }, []);

  const loadTagBatches = async () => {
    try {
      setLoading(true);
      // Mock tag batches for demo
      const response: { success: boolean; data: TagBatch[] } = { success: true, data: [] };
      
      if (response.success) {
        setTagBatches(response.data || []);
      }
    } catch (error) {
      console.error('Error loading tag batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batch: TagBatch) => {
    setSelectedBatch(batch);
  };

  const handleTagScan = async (data: string) => {
    try {
      const tagData = JSON.parse(data);
      
      if (selectedBatch) {
        // Mock tag update for demo
        console.log('Tag updated:', tagData.tag_id);

        // Create scan event
        await advancedFeaturesAPI.createEvent({
          event_type: 'TAG_SCAN',
          event_category: 'rider_operation',
          reference_id: tagData.tag_id,
          reference_type: 'tag',
          event_data: { tag_data: tagData, batch_id: selectedBatch.id }
        });

        // Refresh batch data
        loadTagBatches();
        setScannerActive(false);
        
        alert(language === 'my' ? 'Tag စကင်န်ဖတ်ပြီး' : 'Tag scanned successfully');
      }
    } catch (error) {
      console.error('Tag scan error:', error);
      alert(language === 'my' ? 'Tag စကင်န်ဖတ်မှု မအောင်မြင်ပါ' : 'Failed to scan tag');
    }
  };

  const handleExportBatch = async (batch: TagBatch) => {
    try {
      const csvContent = [
        ['Tag Number', 'Status', 'Scanned At', 'Associated Shipment'],
        ...batch.tags.map(tag => [
          tag.tag_number,
          tag.status,
          tag.scanned_at || '',
          tag.associated_shipment || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tag_batch_${batch.batch_number}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const filteredBatches = tagBatches.filter(batch => {
    const matchesSearch = batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || batch.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (selectedBatch) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" onClick={() => setSelectedBatch(null)}>
            {language === 'my' ? 'နောက်သို့' : 'Back'}
          </Button>
          <h2 className="text-2xl font-bold">
            {language === 'my' ? 'Tag အစုအဖွဲ့အသေးစိတ်' : 'Tag Batch Details'}
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
                  <div className="text-2xl font-bold text-blue-600">{selectedBatch.total_tags}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'စုစုပေါင်း Tags' : 'Total Tags'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedBatch.scanned_tags}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'စကင်န်ဖတ်ပြီး' : 'Scanned'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedBatch.total_tags - selectedBatch.scanned_tags}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'my' ? 'ကျန်ရှိ' : 'Remaining'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((selectedBatch.scanned_tags / selectedBatch.total_tags) * 100)}%
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
                {language === 'my' ? 'Tag စကင်နာ' : 'Tag Scanner'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannerActive ? (
                <div className="space-y-4">
                  <QRCodeScanner
                    onScan={handleTagScan}
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
                  <QrCode className="w-4 h-4 mr-2" />
                  {language === 'my' ? 'Tag စကင်န်ဖတ်မည်' : 'Start Scanning Tags'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tag List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'my' ? 'Tag စာရင်း' : 'Tag List'}</span>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportBatch(selectedBatch)}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'my' ? 'ထုတ်ယူ' : 'Export'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedBatch.tags.map((tag) => (
                  <div 
                    key={tag.id}
                    className={`flex items-center justify-between p-3 rounded border ${
                      tag.status === 'scanned' ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        tag.status === 'scanned' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-mono">{tag.tag_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tag.status === 'scanned' ? 'default' : 'secondary'}>
                        {language === 'my' 
                          ? tag.status === 'scanned' ? 'စကင်န်ဖတ်ပြီး' : 'စောင့်ဆိုင်း'
                          : tag.status
                        }
                      </Badge>
                      {tag.scanned_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(tag.scanned_at).toLocaleString()}
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
          {language === 'my' ? 'Tag အစုအဖွဲ့များ' : 'Tag Batches'}
        </h2>
        <Button onClick={loadTagBatches} disabled={loading}>
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder={language === 'my' ? 'Batch နံပါတ် ရှာရန်...' : 'Search batch number...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">{language === 'my' ? 'အားလုံး' : 'All Status'}</option>
          <option value="assigned">{language === 'my' ? 'သတ်မှတ်ပြီး' : 'Assigned'}</option>
          <option value="in_progress">{language === 'my' ? 'လုပ်ဆောင်နေ' : 'In Progress'}</option>
          <option value="completed">{language === 'my' ? 'ပြီးစီး' : 'Completed'}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === 'my' ? 'Tag အစုအဖွဲ့ မရှိပါ' : 'No tag batches found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBatches.map((batch) => (
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
                        <span className="font-medium ml-1">{batch.total_tags}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'စကင်န်ဖတ်ပြီး:' : 'Scanned:'}
                        </span>
                        <span className="font-medium ml-1 text-green-600">{batch.scanned_tags}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {language === 'my' ? 'ပြီးစီးမှု:' : 'Progress:'}
                        </span>
                        <span className="font-medium ml-1">
                          {Math.round((batch.scanned_tags / batch.total_tags) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(batch.scanned_tags / batch.total_tags) * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {language === 'my' ? 'သတ်မှတ်ရက်:' : 'Assigned:'} {new Date(batch.assigned_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportBatch(batch)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleBatchSelect(batch)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {language === 'my' ? 'ကြည့်မည်' : 'View'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}