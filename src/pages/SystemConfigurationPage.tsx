import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Settings, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Phone,
  Hash,
  MapPin,
  Building,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguageContext } from '@/lib/LanguageContext';
import { SystemConfigAPI, SystemConfig, FormUtils } from '@/lib/forms-api';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

interface ConfigFormData {
  wayIdLength: string;
  promotionCodeLength: string;
  contactPhone: string;
  maxStationDistance: string;
  companyName: string;
  defaultCurrency: string;
  maxCashAdvance: string;
  autoApproveLimit: string;
}

const SystemConfigurationPage: React.FC = () => {
  const { language, t } = useLanguageContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ConfigFormData>({
    wayIdLength: '6',
    promotionCodeLength: '8',
    contactPhone: '+95 9 123 456789',
    maxStationDistance: '5000',
    companyName: 'Britium Express Logistics',
    defaultCurrency: 'MMK',
    maxCashAdvance: '500000',
    autoApproveLimit: '100000'
  });
  
  const [originalData, setOriginalData] = useState<ConfigFormData>({} as ConfigFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load configuration on mount and when needed
  const loadConfiguration = useCallback(async (showRefreshToast = false) => {
    try {
      setLoading(true);
      const configs = await SystemConfigAPI.getAll();
      
      const configMap: Record<string, string> = {};
      configs.forEach(config => {
        configMap[config.setting_key] = config.setting_value;
      });

      const loadedData: ConfigFormData = {
        wayIdLength: configMap.wayIdLength || '6',
        promotionCodeLength: configMap.promotionCodeLength || '8',
        contactPhone: configMap.contactPhone || '+95 9 123 456789',
        maxStationDistance: configMap.maxStationDistance || '5000',
        companyName: configMap.companyName || 'Britium Express Logistics',
        defaultCurrency: configMap.defaultCurrency || 'MMK',
        maxCashAdvance: configMap.maxCashAdvance || '500000',
        autoApproveLimit: configMap.autoApproveLimit || '100000'
      };

      setFormData(loadedData);
      setOriginalData(loadedData);
      setErrors({});
      
      if (showRefreshToast) {
        toast({
          title: "Success",
          description: "Configuration refreshed successfully",
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load system configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh data manually
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConfiguration(true);
    setRefreshing(false);
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      setRefreshing(true);
      
      // Test basic connection
      const data = await SystemConfigAPI.getAll();
      
      toast({
        title: "Database Connection Test",
        description: `✅ Connection successful! Found ${data.length} configuration settings.`,
      });
      
    } catch (error) {
      console.error('Database test error:', error);
      toast({
        title: "Database Connection Test",
        description: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleInputChange = (field: keyof ConfigFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      const validation = await SystemConfigAPI.validate(formData);
      setErrors(validation.errors);
      return validation.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const isValid = await validateForm();
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors before saving",
          variant: "destructive",
        });
        return;
      }

      const configs: SystemConfig[] = [
        {
          setting_key: 'wayIdLength',
          setting_value: formData.wayIdLength,
          setting_type: 'integer',
          description: 'Number of digits for Way ID generation (4-10)',
          min_value: 4,
          max_value: 10
        },
        {
          setting_key: 'promotionCodeLength',
          setting_value: formData.promotionCodeLength,
          setting_type: 'integer',
          description: 'Length of promotion codes (6-12 characters)',
          min_value: 6,
          max_value: 12
        },
        {
          setting_key: 'contactPhone',
          setting_value: formData.contactPhone,
          setting_type: 'string',
          description: 'Customer support contact number'
        },
        {
          setting_key: 'maxStationDistance',
          setting_value: formData.maxStationDistance,
          setting_type: 'integer',
          description: 'Maximum distance between stations in meters',
          min_value: 100,
          max_value: 50000
        },
        {
          setting_key: 'companyName',
          setting_value: formData.companyName,
          setting_type: 'string',
          description: 'Company name for documents and communications'
        },
        {
          setting_key: 'defaultCurrency',
          setting_value: formData.defaultCurrency,
          setting_type: 'string',
          description: 'Default currency for transactions'
        },
        {
          setting_key: 'maxCashAdvance',
          setting_value: formData.maxCashAdvance,
          setting_type: 'decimal',
          description: 'Maximum cash advance amount per deliveryman'
        },
        {
          setting_key: 'autoApproveLimit',
          setting_value: formData.autoApproveLimit,
          setting_type: 'decimal',
          description: 'Auto-approve vouchers below this amount'
        }
      ];

      await SystemConfigAPI.update(configs);
      
      // Update original data to reflect saved state
      setOriginalData(formData);
      setLastSaved(new Date());
      
      toast({
        title: "Success",
        description: "System configuration saved successfully",
      });

      // Refresh data to ensure consistency
      setTimeout(() => {
        loadConfiguration();
      }, 500);
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save system configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      await SystemConfigAPI.resetToDefaults();
      
      toast({
        title: "Success",
        description: "System configuration reset to defaults",
      });

      // Reload configuration after reset
      await loadConfiguration();
      
    } catch (error) {
      console.error('Error resetting configuration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset system configuration",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleDiscard = () => {
    setFormData(originalData);
    setErrors({});
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/10 rounded-lg">
            <Settings className="h-6 w-6 text-gold-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">System Configuration</h1>
            <p className="text-muted-foreground">
              Basic system settings and identifiers
              {lastSaved && (
                <span className="ml-2 text-xs text-success">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={testDatabaseConnection}
            disabled={refreshing}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <CheckCircle2 className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Test DB
          </Button>
          
          {hasChanges && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Configuration Form */}
      <motion.div variants={staggerItem}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>Operations</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Automation</span>
            </TabsTrigger>
            <TabsTrigger value="merchant" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Merchant</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gold-500" />
                  <span>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Way ID Length */}
                  <div className="space-y-2">
                    <Label htmlFor="wayIdLength" className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gold-500" />
                      <span>Way ID Length</span>
                    </Label>
                    <Input
                      id="wayIdLength"
                      type="number"
                      min="4"
                      max="10"
                      value={formData.wayIdLength}
                      onChange={(e) => handleInputChange('wayIdLength', e.target.value)}
                      className={errors.wayIdLength ? 'border-error' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of digits for Way ID generation (4-10)
                    </p>
                    {errors.wayIdLength && (
                      <p className="text-sm text-error">{errors.wayIdLength}</p>
                    )}
                  </div>

                  {/* Promotion Code Length */}
                  <div className="space-y-2">
                    <Label htmlFor="promotionCodeLength" className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gold-500" />
                      <span>Promotion Code Length</span>
                    </Label>
                    <Input
                      id="promotionCodeLength"
                      type="number"
                      min="6"
                      max="12"
                      value={formData.promotionCodeLength}
                      onChange={(e) => handleInputChange('promotionCodeLength', e.target.value)}
                      className={errors.promotionCodeLength ? 'border-error' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Length of promotion codes (6-12 characters)
                    </p>
                    {errors.promotionCodeLength && (
                      <p className="text-sm text-error">{errors.promotionCodeLength}</p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gold-500" />
                      <span>Contact Phone</span>
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className={errors.contactPhone ? 'border-error' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Customer support contact number
                    </p>
                    {errors.contactPhone && (
                      <p className="text-sm text-error">{errors.contactPhone}</p>
                    )}
                  </div>

                  {/* Max Station Distance */}
                  <div className="space-y-2">
                    <Label htmlFor="maxStationDistance" className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gold-500" />
                      <span>Max Station Distance</span>
                    </Label>
                    <Input
                      id="maxStationDistance"
                      type="number"
                      min="100"
                      max="50000"
                      value={formData.maxStationDistance}
                      onChange={(e) => handleInputChange('maxStationDistance', e.target.value)}
                      className={errors.maxStationDistance ? 'border-error' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum distance between stations in meters
                    </p>
                    {errors.maxStationDistance && (
                      <p className="text-sm text-error">{errors.maxStationDistance}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-gold-500" />
                  <span>Operations Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gold-500" />
                      <span>Company Name</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Company name for documents and communications
                    </p>
                  </div>

                  {/* Default Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Input
                      id="defaultCurrency"
                      value={formData.defaultCurrency}
                      onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Default currency for transactions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-gold-500" />
                  <span>Automation Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Max Cash Advance */}
                  <div className="space-y-2">
                    <Label htmlFor="maxCashAdvance">Max Cash Advance (MMK)</Label>
                    <Input
                      id="maxCashAdvance"
                      type="number"
                      value={formData.maxCashAdvance}
                      onChange={(e) => handleInputChange('maxCashAdvance', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum cash advance amount per deliveryman
                    </p>
                  </div>

                  {/* Auto Approve Limit */}
                  <div className="space-y-2">
                    <Label htmlFor="autoApproveLimit">Auto Approve Limit (MMK)</Label>
                    <Input
                      id="autoApproveLimit"
                      type="number"
                      value={formData.autoApproveLimit}
                      onChange={(e) => handleInputChange('autoApproveLimit', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Auto-approve vouchers below this amount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merchant" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-gold-500" />
                  <span>Merchant Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Merchant-specific settings will be available in future updates.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetting || saving}
            className="flex items-center space-x-2"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span>Reset to Default</span>
          </Button>

          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={saving}
              className="text-warning hover:text-warning"
            >
              Discard Changes
            </Button>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="btn-premium flex items-center space-x-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SystemConfigurationPage;