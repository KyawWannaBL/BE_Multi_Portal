import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  DollarSign,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  CreditCard,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLanguageContext } from '@/lib/LanguageContext';
import { CashAdvancesAPI, CashAdvance, FormUtils } from '@/lib/forms-api';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

interface CashAdvanceFormData {
  deliveryman_id: string;
  deliveryman_name: string;
  amount: string;
  purpose: string;
  advance_date: string;
  due_date: string;
}

const CashAdvanceManagementPage: React.FC = () => {
  const { language, t } = useLanguageContext();
  const { toast } = useToast();
  
  const [advances, setAdvances] = useState<CashAdvance[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<CashAdvance | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [formData, setFormData] = useState<CashAdvanceFormData>({
    deliveryman_id: '',
    deliveryman_name: '',
    amount: '',
    purpose: '',
    advance_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Mock deliverymen data - in real app, this would come from API
  const mockDeliverymen = [
    { id: '1', name: 'Ko Aung Myat' },
    { id: '2', name: 'Ma Thida' },
    { id: '3', name: 'U Kyaw Win' },
    { id: '4', name: 'Daw Mya Mya' },
    { id: '5', name: 'Ko Zaw Zaw' }
  ];

  // Load cash advances with real-time updates
  const loadCashAdvances = useCallback(async (showRefreshToast = false) => {
    try {
      setLoading(true);
      const result = await CashAdvancesAPI.getAll({
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      
      setAdvances(result.data);
      setSummary(result.summary);
      
      if (showRefreshToast) {
        toast({
          title: "Success",
          description: "Cash advances refreshed successfully",
        });
      }
    } catch (error) {
      console.error('Error loading cash advances:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load cash advances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, toast]);

  // Refresh data manually
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCashAdvances(true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadCashAdvances();
  }, [loadCashAdvances]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadCashAdvances();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadCashAdvances]);

  const filteredAdvances = advances.filter(advance => {
    const matchesSearch = advance.advance_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advance.deliveryman_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advance.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleInputChange = (field: keyof CashAdvanceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill deliveryman name when ID is selected
    if (field === 'deliveryman_id') {
      const deliveryman = mockDeliverymen.find(d => d.id === value);
      if (deliveryman) {
        setFormData(prev => ({ ...prev, deliveryman_name: deliveryman.name }));
      }
    }
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      const validation = await CashAdvancesAPI.validate(formData);
      setFormErrors(validation.errors);
      return validation.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleCreateAdvance = async () => {
    try {
      setSubmitting(true);
      
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      const advanceData = {
        deliveryman_id: formData.deliveryman_id,
        deliveryman_name: formData.deliveryman_name,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        advance_date: formData.advance_date,
        due_date: formData.due_date,
        status: 'active' as const
      };

      await CashAdvancesAPI.create(advanceData);
      
      toast({
        title: "Success",
        description: "Cash advance created successfully",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Reload data to show new advance
      await loadCashAdvances();
    } catch (error) {
      console.error('Error creating cash advance:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cash advance",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepayAdvance = async () => {
    if (!selectedAdvance || !repayAmount) return;

    try {
      setSubmitting(true);
      
      const amount = parseFloat(repayAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid repayment amount",
          variant: "destructive",
        });
        return;
      }

      const outstanding = getOutstandingAmount(selectedAdvance);
      if (amount > outstanding) {
        toast({
          title: "Error",
          description: "Repayment amount cannot exceed outstanding balance",
          variant: "destructive",
        });
        return;
      }

      await CashAdvancesAPI.repay(selectedAdvance.id!, amount);
      
      toast({
        title: "Success",
        description: `Repayment of ${FormUtils.formatCurrency(amount)} recorded successfully`,
      });
      
      setIsRepayDialogOpen(false);
      setSelectedAdvance(null);
      setRepayAmount('');
      
      // Reload data to show updated advance
      await loadCashAdvances();
    } catch (error) {
      console.error('Error recording repayment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record repayment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportAdvances = async () => {
    try {
      const csvContent = await CashAdvancesAPI.export({
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      
      FormUtils.downloadFile(csvContent, `cash_advances_export_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Cash advances exported successfully",
      });
    } catch (error) {
      console.error('Error exporting cash advances:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export cash advances",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryman_id: '',
      deliveryman_name: '',
      amount: '',
      purpose: '',
      advance_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setFormErrors({});
  };

  const openRepayDialog = (advance: CashAdvance) => {
    setSelectedAdvance(advance);
    setRepayAmount('');
    setIsRepayDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-transit"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
      case 'repaid':
        return <Badge className="status-delivered"><CheckCircle2 className="w-3 h-3 mr-1" />Repaid</Badge>;
      case 'written_off':
        return <Badge className="status-failed"><AlertTriangle className="w-3 h-3 mr-1" />Written Off</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOutstandingAmount = (advance: CashAdvance) => {
    return advance.amount - (advance.repaid_amount || 0);
  };

  if (loading && advances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cash advances...</p>
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
            <CreditCard className="h-6 w-6 text-gold-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Cash Advance Management</h1>
            <p className="text-muted-foreground">Manage cash advances for deliverymen</p>
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
          
          <Button variant="outline" onClick={handleExportAdvances}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-premium">
                <Plus className="w-4 h-4 mr-2" />
                New Cash Advance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Cash Advance</DialogTitle>
              </DialogHeader>
              <CashAdvanceForm
                formData={formData}
                formErrors={formErrors}
                deliverymen={mockDeliverymen}
                onInputChange={handleInputChange}
                onSubmit={handleCreateAdvance}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Advanced</p>
                <p className="text-2xl font-bold text-navy-900">
                  {FormUtils.formatCurrency(summary.totalAdvanced || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gold-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Repaid</p>
                <p className="text-2xl font-bold text-success">
                  {FormUtils.formatCurrency(summary.totalRepaid || 0)}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-warning">
                  {FormUtils.formatCurrency(summary.outstanding || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Advances</p>
                <p className="text-2xl font-bold text-info">
                  {summary.activeAdvances || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cash advances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="repaid">Repaid</SelectItem>
            <SelectItem value="written_off">Written Off</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Cash Advances Table */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advance #</TableHead>
                  <TableHead>Deliveryman</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Repaid</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAdvances.map((advance) => (
                    <motion.tr
                      key={advance.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{advance.advance_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{advance.deliveryman_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {FormUtils.formatCurrency(advance.amount)}
                      </TableCell>
                      <TableCell className="text-success">
                        {FormUtils.formatCurrency(advance.repaid_amount || 0)}
                      </TableCell>
                      <TableCell className="font-semibold text-warning">
                        {FormUtils.formatCurrency(getOutstandingAmount(advance))}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {advance.purpose}
                      </TableCell>
                      <TableCell>{FormUtils.formatDate(advance.advance_date)}</TableCell>
                      <TableCell>{getStatusBadge(advance.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {advance.status === 'active' && getOutstandingAmount(advance) > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRepayDialog(advance)}
                              className="text-success hover:text-success"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
            
            {filteredAdvances.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'No cash advances found matching your criteria' 
                    : 'No cash advances created yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Repayment Dialog */}
      <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Repayment</DialogTitle>
          </DialogHeader>
          {selectedAdvance && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Advance Details</p>
                <p className="font-semibold">{selectedAdvance.advance_number}</p>
                <p className="text-sm">{selectedAdvance.deliveryman_name}</p>
                <p className="text-sm">Outstanding: {FormUtils.formatCurrency(getOutstandingAmount(selectedAdvance))}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repayAmount">Repayment Amount (MMK)</Label>
                <Input
                  id="repayAmount"
                  type="number"
                  step="0.01"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  max={getOutstandingAmount(selectedAdvance)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRepayDialogOpen(false);
                    setSelectedAdvance(null);
                    setRepayAmount('');
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleRepayAdvance} disabled={submitting} className="btn-premium">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Recording...
                    </>
                  ) : (
                    'Record Repayment'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Cash Advance Form Component
interface CashAdvanceFormProps {
  formData: CashAdvanceFormData;
  formErrors: Record<string, string>;
  deliverymen: { id: string; name: string }[];
  onInputChange: (field: keyof CashAdvanceFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const CashAdvanceForm: React.FC<CashAdvanceFormProps> = ({
  formData,
  formErrors,
  deliverymen,
  onInputChange,
  onSubmit,
  onCancel,
  submitting
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deliveryman_id">Deliveryman</Label>
        <Select value={formData.deliveryman_id} onValueChange={(value) => onInputChange('deliveryman_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select deliveryman" />
          </SelectTrigger>
          <SelectContent>
            {deliverymen.map((deliveryman) => (
              <SelectItem key={deliveryman.id} value={deliveryman.id}>
                {deliveryman.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.deliveryman_id && (
          <p className="text-sm text-error">{formErrors.deliveryman_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (MMK)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => onInputChange('amount', e.target.value)}
          className={formErrors.amount ? 'border-error' : ''}
        />
        {formErrors.amount && (
          <p className="text-sm text-error">{formErrors.amount}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => onInputChange('purpose', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="advance_date">Advance Date</Label>
          <Input
            id="advance_date"
            type="date"
            value={formData.advance_date}
            onChange={(e) => onInputChange('advance_date', e.target.value)}
            className={formErrors.advance_date ? 'border-error' : ''}
          />
          {formErrors.advance_date && (
            <p className="text-sm text-error">{formErrors.advance_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => onInputChange('due_date', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={submitting} className="btn-premium">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Advance'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CashAdvanceManagementPage;