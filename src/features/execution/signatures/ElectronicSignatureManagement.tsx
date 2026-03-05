import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  PenTool, 
  FileText, 
  CheckCircle, 
  Clock, 
  User, 
  Download,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Copy,
  Shield,
  AlertCircle,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ElectronicSignature } from '@/components/ElectronicSignature';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

interface SignatureRecord {
  id: string;
  signature_type: 'PICKUP' | 'DELIVERY' | 'RECEIPT' | 'AUTHORIZATION' | 'HANDOVER' | 'INSPECTION';
  signature_data: string; // Base64 encoded signature
  signer_name: string;
  signer_role?: string;
  signer_id?: string;
  reference_id: string;
  reference_type: 'shipment' | 'order' | 'receipt' | 'document';
  status: 'PENDING' | 'SIGNED' | 'VERIFIED' | 'REJECTED';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  device_info?: {
    device_id: string;
    user_agent: string;
    ip_address?: string;
  };
  verification_code?: string;
  verification_status?: 'PENDING' | 'VERIFIED' | 'FAILED';
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

interface SignatureTemplate {
  id: string;
  template_name: string;
  signature_type: string;
  required_fields: string[];
  approval_workflow: boolean;
  auto_verification: boolean;
  expiry_hours: number;
  created_at: string;
}

export default function ElectronicSignatureManagement() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'CAPTURE' | 'MANAGE' | 'VERIFY' | 'TEMPLATES'>('CAPTURE');
  const [signatures, setSignatures] = useState<SignatureRecord[]>([]);
  const [templates, setTemplates] = useState<SignatureTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<SignatureRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Capture form state
  const [captureForm, setCaptureForm] = useState({
    signature_type: 'PICKUP',
    signer_name: '',
    signer_role: '',
    reference_id: '',
    reference_type: 'shipment',
    notes: '',
    signature_data: ''
  });

  useEffect(() => {
    loadSignatureData();
  }, []);

  const loadSignatureData = async () => {
    try {
      setLoading(true);
      const [signaturesRes, templatesRes] = await Promise.all([
        advancedFeaturesAPI.getSignatures(),
        advancedFeaturesAPI.getSignatureTemplates()
      ]);

      if (signaturesRes.success) setSignatures(signaturesRes.data || []);
      if (templatesRes.success) setTemplates(templatesRes.data || []);
    } catch (error) {
      console.error('Error loading signature data:', error);
    } finally {
      setLoading(false);
    }
  };

  const captureSignature = async () => {
    if (!captureForm.signature_data || !captureForm.signer_name || !captureForm.reference_id) {
      alert(language === 'my' 
        ? 'လိုအပ်သော အချက်အလက်များ ဖြည့်စွက်ပါ' 
        : 'Please fill in all required fields'
      );
      return;
    }

    try {
      setLoading(true);
      
      const signatureData = {
        ...captureForm,
        location: await getCurrentLocation(),
        device_info: {
          device_id: 'web_device',
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        verification_code: generateVerificationCode()
      };

      const response = await advancedFeaturesAPI.saveSignature(signatureData);
      
      if (response.success) {
        await loadSignatureData();
        setCaptureForm({
          signature_type: 'PICKUP',
          signer_name: '',
          signer_role: '',
          reference_id: '',
          reference_type: 'shipment',
          notes: '',
          signature_data: ''
        });
        
        alert(language === 'my' 
          ? 'လက်မှတ်ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ' 
          : 'Signature captured successfully'
        );
      }
    } catch (error) {
      console.error('Error capturing signature:', error);
      alert(language === 'my' 
        ? 'လက်မှတ် သိမ်းဆည်းမှု မအောင်မြင်ပါ' 
        : 'Failed to capture signature'
      );
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async (signatureId: string, verificationCode: string) => {
    try {
      setLoading(true);
      
      const response = await advancedFeaturesAPI.verifySignature(signatureId, 'VERIFIED', 'current_user');
      
      if (response.success) {
        await loadSignatureData();
        alert(language === 'my' 
          ? 'လက်မှတ်ကို အတည်ပြုပြီးပါပြီ' 
          : 'Signature verified successfully'
        );
      } else {
        alert(language === 'my' 
          ? 'လက်မှတ် အတည်ပြုမှု မအောင်မြင်ပါ' 
          : 'Signature verification failed'
        );
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSignature = (signature: SignatureRecord) => {
    try {
      // Create a canvas to render the signature
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = 400;
        canvas.height = 200;
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Load and draw signature
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Add signature info
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.fillText(`Signed by: ${signature.signer_name}`, 10, canvas.height - 40);
          ctx.fillText(`Date: ${new Date(signature.created_at).toLocaleString()}`, 10, canvas.height - 25);
          ctx.fillText(`Type: ${signature.signature_type}`, 10, canvas.height - 10);
          
          // Download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `signature_${signature.reference_id}_${signature.id}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          });
        };
        img.src = signature.signature_data;
      }
    } catch (error) {
      console.error('Error downloading signature:', error);
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

  const generateVerificationCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED': case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PICKUP': return <User className="w-4 h-4" />;
      case 'DELIVERY': return <CheckCircle className="w-4 h-4" />;
      case 'RECEIPT': return <FileText className="w-4 h-4" />;
      case 'AUTHORIZATION': return <Shield className="w-4 h-4" />;
      case 'HANDOVER': return <Copy className="w-4 h-4" />;
      case 'INSPECTION': return <Eye className="w-4 h-4" />;
      default: return <PenTool className="w-4 h-4" />;
    }
  };

  const filteredSignatures = signatures.filter(sig => {
    const matchesSearch = sig.signer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sig.reference_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || sig.signature_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || sig.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderCaptureTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            {language === 'my' ? 'လက်မှတ် ရယူရန်' : 'Capture Signature'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'လက်မှတ် အမျိုးအစား' : 'Signature Type'}
              </label>
              <select
                value={captureForm.signature_type}
                onChange={(e) => setCaptureForm({...captureForm, signature_type: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="PICKUP">{language === 'my' ? 'ပစ္စည်းယူ' : 'Pickup'}</option>
                <option value="DELIVERY">{language === 'my' ? 'ပို့ဆောင်' : 'Delivery'}</option>
                <option value="RECEIPT">{language === 'my' ? 'ရရှိမှုအထောက်အထား' : 'Receipt'}</option>
                <option value="AUTHORIZATION">{language === 'my' ? 'ခွင့်ပြုချက်' : 'Authorization'}</option>
                <option value="HANDOVER">{language === 'my' ? 'လွှဲပြောင်း' : 'Handover'}</option>
                <option value="INSPECTION">{language === 'my' ? 'စစ်ဆေး' : 'Inspection'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'လက်မှတ်ထိုးသူ အမည်' : 'Signer Name'} *
              </label>
              <Input
                value={captureForm.signer_name}
                onChange={(e) => setCaptureForm({...captureForm, signer_name: e.target.value})}
                placeholder={language === 'my' ? 'အမည် ထည့်ပါ' : 'Enter name'}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ရာထူး/အခန်းကဏ္ဍ' : 'Role/Position'}
              </label>
              <Input
                value={captureForm.signer_role}
                onChange={(e) => setCaptureForm({...captureForm, signer_role: e.target.value})}
                placeholder={language === 'my' ? 'ရာထူး ထည့်ပါ' : 'Enter role'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ရည်ညွှန်း ID' : 'Reference ID'} *
              </label>
              <Input
                value={captureForm.reference_id}
                onChange={(e) => setCaptureForm({...captureForm, reference_id: e.target.value})}
                placeholder={language === 'my' ? 'ID ထည့်ပါ' : 'Enter ID'}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ရည်ညွှန်း အမျိုးအစား' : 'Reference Type'}
              </label>
              <select
                value={captureForm.reference_type}
                onChange={(e) => setCaptureForm({...captureForm, reference_type: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="shipment">{language === 'my' ? 'ပို့ဆောင်မှု' : 'Shipment'}</option>
                <option value="order">{language === 'my' ? 'အမှာစာ' : 'Order'}</option>
                <option value="receipt">{language === 'my' ? 'ရရှိမှုအထောက်အထား' : 'Receipt'}</option>
                <option value="document">{language === 'my' ? 'စာရွက်စာတမ်း' : 'Document'}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'my' ? 'မှတ်ချက်များ' : 'Notes'}
            </label>
            <Textarea
              value={captureForm.notes}
              onChange={(e) => setCaptureForm({...captureForm, notes: e.target.value})}
              placeholder={language === 'my' ? 'မှတ်ချက်များ ထည့်ပါ...' : 'Enter notes...'}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'my' ? 'လက်မှတ်' : 'Signature'} *
            </label>
            <div className="border rounded-lg p-4">
              <ElectronicSignature
                onSignature={(signature) => setCaptureForm({...captureForm, signature_data: signature})}
                onClear={() => setCaptureForm({...captureForm, signature_data: ''})}
              />
            </div>
          </div>
          
          <Button 
            onClick={captureSignature} 
            disabled={loading || !captureForm.signature_data || !captureForm.signer_name || !captureForm.reference_id}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PenTool className="w-4 h-4 mr-2" />
            )}
            {language === 'my' ? 'လက်မှတ် သိမ်းဆည်းမည်' : 'Capture Signature'}
          </Button>
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
              <option value="PICKUP">{language === 'my' ? 'ပစ္စည်းယူ' : 'Pickup'}</option>
              <option value="DELIVERY">{language === 'my' ? 'ပို့ဆောင်' : 'Delivery'}</option>
              <option value="RECEIPT">{language === 'my' ? 'ရရှိမှုအထောက်အထား' : 'Receipt'}</option>
              <option value="AUTHORIZATION">{language === 'my' ? 'ခွင့်ပြုချက်' : 'Authorization'}</option>
              <option value="HANDOVER">{language === 'my' ? 'လွှဲပြောင်း' : 'Handover'}</option>
              <option value="INSPECTION">{language === 'my' ? 'စစ်ဆေး' : 'Inspection'}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">{language === 'my' ? 'အခြေအနေအားလုံး' : 'All Status'}</option>
              <option value="PENDING">{language === 'my' ? 'စောင့်ဆိုင်း' : 'Pending'}</option>
              <option value="SIGNED">{language === 'my' ? 'လက်မှတ်ထိုးပြီး' : 'Signed'}</option>
              <option value="VERIFIED">{language === 'my' ? 'အတည်ပြုပြီး' : 'Verified'}</option>
              <option value="REJECTED">{language === 'my' ? 'ပယ်ချပြီး' : 'Rejected'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Signatures List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
          </div>
        ) : filteredSignatures.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'my' ? 'လက်မှတ် မရှိပါ' : 'No signatures found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSignatures.map((signature) => (
            <Card key={signature.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(signature.signature_type)}
                      <span className="font-medium">{signature.signer_name}</span>
                      <Badge className={getStatusColor(signature.status)}>
                        {language === 'my' 
                          ? signature.status === 'PENDING' ? 'စောင့်ဆိုင်း'
                            : signature.status === 'SIGNED' ? 'လက်မှတ်ထိုးပြီး'
                            : signature.status === 'VERIFIED' ? 'အတည်ပြုပြီး'
                            : 'ပယ်ချပြီး'
                          : signature.status
                        }
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">
                          {language === 'my' ? 'အမျိုးအစား:' : 'Type:'}
                        </span>
                        <span className="ml-1">{signature.signature_type}</span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {language === 'my' ? 'ရည်ညွှန်း:' : 'Reference:'}
                        </span>
                        <span className="ml-1">{signature.reference_id}</span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {language === 'my' ? 'ရက်စွဲ:' : 'Date:'}
                        </span>
                        <span className="ml-1">{new Date(signature.created_at).toLocaleDateString()}</span>
                      </div>
                      {signature.verification_code && (
                        <div>
                          <span className="font-medium">
                            {language === 'my' ? 'အတည်ပြုကုဒ်:' : 'Verification:'}
                          </span>
                          <span className="ml-1 font-mono">{signature.verification_code}</span>
                        </div>
                      )}
                    </div>
                    
                    {signature.signer_role && (
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">
                          {language === 'my' ? 'ရာထူး:' : 'Role:'}
                        </span>
                        <span className="ml-1">{signature.signer_role}</span>
                      </div>
                    )}
                    
                    {signature.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {signature.notes}
                      </div>
                    )}
                    
                    {signature.verified_by && (
                      <div className="mt-2 text-xs text-green-600">
                        {language === 'my' ? 'အတည်ပြုသူ:' : 'Verified by:'} {signature.verified_by}
                        {signature.verified_at && ` on ${new Date(signature.verified_at).toLocaleString()}`}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadSignature(signature)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedSignature(signature)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderVerifyTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {language === 'my' ? 'လက်မှတ် အတည်ပြုရန်' : 'Signature Verification'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'my' ? 'လက်မှတ် အတည်ပြုမှု' : 'Signature Verification'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'my' 
                  ? 'လက်မှတ်ကို အတည်ပြုရန် အတည်ပြုကုဒ် ထည့်ပါ' 
                  : 'Enter verification code to verify signature'
                }
              </p>
              
              <div className="max-w-md mx-auto space-y-4">
                <Input
                  placeholder={language === 'my' ? 'အတည်ပြုကုဒ် ထည့်ပါ' : 'Enter verification code'}
                  className="text-center font-mono text-lg"
                />
                <Button className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'my' ? 'အတည်ပြုမည်' : 'Verify Signature'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'my' ? 'အတည်ပြုရန် စောင့်ဆိုင်းနေသော လက်မှတ်များ' : 'Pending Verifications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signatures.filter(s => s.status === 'SIGNED' && s.verification_status === 'PENDING').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'အတည်ပြုရန် စောင့်ဆိုင်းနေသော လက်မှတ် မရှိပါ' : 'No pending verifications'}
                </p>
              </div>
            ) : (
              signatures
                .filter(s => s.status === 'SIGNED' && s.verification_status === 'PENDING')
                .map((signature) => (
                  <div key={signature.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(signature.signature_type)}
                        <span className="font-medium">{signature.signer_name}</span>
                        <Badge variant="secondary">{signature.signature_type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>{language === 'my' ? 'ရည်ညွှန်း:' : 'Reference:'} {signature.reference_id}</span>
                        <span className="ml-4">
                          {language === 'my' ? 'ရက်စွဲ:' : 'Date:'} {new Date(signature.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {signature.verification_code && (
                        <div className="text-xs text-gray-500 mt-1">
                          {language === 'my' ? 'အတည်ပြုကုဒ်:' : 'Code:'} 
                          <span className="font-mono ml-1">{signature.verification_code}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => signature.verification_code && verifySignature(signature.id, signature.verification_code)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {language === 'my' ? 'အတည်ပြု' : 'Verify'}
                    </Button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'my' ? 'လက်မှတ် ပုံစံများ' : 'Signature Templates'}
            </span>
            <Button>
              {language === 'my' ? 'ပုံစံအသစ် ဖန်တီး' : 'Create Template'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'my' ? 'လက်မှတ် ပုံစံ မရှိပါ' : 'No signature templates found'}
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{template.template_name}</span>
                      <Badge variant="outline">{template.signature_type}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>{language === 'my' ? 'လိုအပ်သော အချက်အလက်:' : 'Required fields:'} {template.required_fields.length}</span>
                      <span className="ml-4">
                        {language === 'my' ? 'သက်တမ်း:' : 'Expires:'} {template.expiry_hours}h
                      </span>
                      {template.approval_workflow && (
                        <span className="ml-4 text-blue-600">
                          {language === 'my' ? 'အတည်ပြုမှု လိုအပ်' : 'Approval Required'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {language === 'my' ? 'လက်မှတ် စီမံခန့်ခွဲမှု' : 'Electronic Signature Management'}
        </h1>
        <Button onClick={loadSignatureData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'CAPTURE', label: language === 'my' ? 'ရယူရန်' : 'Capture', icon: PenTool },
          { key: 'MANAGE', label: language === 'my' ? 'စီမံခန့်ခွဲရန်' : 'Manage', icon: FileText },
          { key: 'VERIFY', label: language === 'my' ? 'အတည်ပြုရန်' : 'Verify', icon: Shield },
          { key: 'TEMPLATES', label: language === 'my' ? 'ပုံစံများ' : 'Templates', icon: Copy }
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
            {key === 'VERIFY' && signatures.filter(s => s.verification_status === 'PENDING').length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {signatures.filter(s => s.verification_status === 'PENDING').length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'CAPTURE' && renderCaptureTab()}
      {activeTab === 'MANAGE' && renderManageTab()}
      {activeTab === 'VERIFY' && renderVerifyTab()}
      {activeTab === 'TEMPLATES' && renderTemplatesTab()}

      {/* Signature Detail Modal */}
      {selectedSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'my' ? 'လက်မှတ် အသေးစিတ်' : 'Signature Details'}</span>
                <Button variant="ghost" onClick={() => setSelectedSignature(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Signature Image */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <img 
                  src={selectedSignature.signature_data} 
                  alt="Signature" 
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: '200px' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'လက်မှတ်ထိုးသူ' : 'Signer'}
                  </label>
                  <p className="font-medium">{selectedSignature.signer_name}</p>
                  {selectedSignature.signer_role && (
                    <p className="text-sm text-gray-600">{selectedSignature.signer_role}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'အမျိုးအစား' : 'Type'}
                  </label>
                  <p>{selectedSignature.signature_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'အခြေအနေ' : 'Status'}
                  </label>
                  <Badge className={getStatusColor(selectedSignature.status)}>
                    {language === 'my' 
                      ? selectedSignature.status === 'PENDING' ? 'စောင့်ဆိုင်း'
                        : selectedSignature.status === 'SIGNED' ? 'လက်မှတ်ထိုးပြီး'
                        : selectedSignature.status === 'VERIFIED' ? 'အတည်ပြုပြီး'
                        : 'ပယ်ချပြီး'
                      : selectedSignature.status
                    }
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'ရက်စွဲ' : 'Date'}
                  </label>
                  <p>{new Date(selectedSignature.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedSignature.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'my' ? 'မှတ်ချက်များ' : 'Notes'}
                  </label>
                  <p className="bg-gray-50 p-3 rounded">{selectedSignature.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => downloadSignature(selectedSignature)}>
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'my' ? 'ဒေါင်းလုဒ်' : 'Download'}
                </Button>
                {selectedSignature.status === 'SIGNED' && selectedSignature.verification_code && (
                  <Button 
                    variant="outline"
                    onClick={() => verifySignature(selectedSignature.id, selectedSignature.verification_code!)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {language === 'my' ? 'အတည်ပြု' : 'Verify'}
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