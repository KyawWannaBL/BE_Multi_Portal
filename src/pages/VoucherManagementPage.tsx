import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  FileText,
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
import { VouchersAPI, Voucher, FormUtils } from '@/lib/forms-api';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

interface VoucherFormData {
  voucher_type: 'income' | 'expense' | 'transfer';
  amount: string;
  description: string;
  reference_number: string;
  transaction_date: string;
}

const VoucherManagementPage: React.FC = () => {
  const { language, t } = useLanguageContext();
  const { toast } = useToast();
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherFormData>({
    voucher_type: 'income',
    amount: '',
    description: '',
    reference_number: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load vouchers with real-time updates
  const loadVouchers = useCallback(async (showRefreshToast = false) => {
    try {
      setLoading(true);
      const result = await VouchersAPI.getAll({
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      
      setVouchers(result.data);
      setSummary(result.summary);
      
      if (showRefreshToast) {
        toast({
          title: "Success",
          description: "Vouchers refreshed successfully",
        });
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load vouchers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, toast]);

  // Refresh data manually
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVouchers(true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadVouchers();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadVouchers]);

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voucher.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voucher.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleInputChange = (field: keyof VoucherFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
      const validation = await VouchersAPI.validate(formData);
      setFormErrors(validation.errors);
      return validation.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleCreateVoucher = async () => {
    try {
      setSubmitting(true);
      
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      const voucherData = {
        voucher_type: formData.voucher_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference_number: formData.reference_number,
        transaction_date: formData.transaction_date,
        status: 'pending' as const
      };

      await VouchersAPI.create(voucherData);
      
      toast({
        title: "Success",
        description: "Voucher created successfully",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Reload data to show new voucher
      await loadVouchers();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create voucher",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVoucher = async () => {
    if (!selectedVoucher) return;

    try {
      setSubmitting(true);
      
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      const updates = {
        voucher_type: formData.voucher_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference_number: formData.reference_number,
        transaction_date: formData.transaction_date
      };

      await VouchersAPI.update(selectedVoucher.id!, updates);
      
      toast({
        title: "Success",
        description: "Voucher updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedVoucher(null);
      resetForm();
      
      // Reload data to show updated voucher
      await loadVouchers();
    } catch (error) {
      console.error('Error updating voucher:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update voucher",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVoucher = async (voucher: Voucher) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;

    try {
      await VouchersAPI.delete(voucher.id!);
      
      toast({
        title: "Success",
        description: "Voucher deleted successfully",
      });
      
      // Reload data to reflect deletion
      await loadVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete voucher",
        variant: "destructive",
      });
    }
  };

  const handleApproveVoucher = async (voucher: Voucher) => {
    try {
      await VouchersAPI.update(voucher.id!, { status: 'approved' });
      
      toast({
        title: "Success",
        description: "Voucher approved successfully",
      });
      
      // Reload data to show updated status
      await loadVouchers();
    } catch (error) {
      console.error('Error approving voucher:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve voucher",
        variant: "destructive",
      });
    }
  };

  const handleExportVouchers = async () => {
    try {
      const csvContent = await VouchersAPI.export({
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      
      FormUtils.downloadFile(csvContent, `vouchers_export_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Vouchers exported successfully",
      });
    } catch (error) {
      console.error('Error exporting vouchers:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export vouchers",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      voucher_type: 'income',
      amount: '',
      description: '',
      reference_number: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
  };

  const openEditDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      voucher_type: voucher.voucher_type,
      amount: voucher.amount.toString(),
      description: voucher.description || '',
      reference_number: voucher.reference_number || '',
      transaction_date: voucher.transaction_date
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="status-delivered"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="status-pending"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="status-failed"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-error" />;
      case 'transfer':
        return <DollarSign className="w-4 h-4 text-info" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading && vouchers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vouchers...</p>
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
            <FileText className="h-6 w-6 text-gold-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Voucher Management</h1>
            <p className="text-muted-foreground">Manage income, expense, and transfer vouchers</p>
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
          
          <Button variant="outline" onClick={handleExportVouchers}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-premium">
                <Plus className="w-4 h-4 mr-2" />
                New Voucher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Voucher</DialogTitle>
              </DialogHeader>
              <VoucherForm
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
                onSubmit={handleCreateVoucher}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                submitting={submitting}
                submitLabel="Create Voucher"
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">
                  {FormUtils.formatCurrency(summary.totalIncome || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-error">
                  {FormUtils.formatCurrency(summary.totalExpense || 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-navy-900">
                  {FormUtils.formatCurrency(summary.netProfit || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gold-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Collections</p>
                <p className="text-2xl font-bold text-warning">
                  {FormUtils.formatCurrency(summary.pendingAmount || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vouchers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Vouchers Table */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredVouchers.map((voucher) => (
                    <motion.tr
                      key={voucher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(voucher.voucher_type)}
                          <span className="capitalize">{voucher.voucher_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {FormUtils.formatCurrency(voucher.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {voucher.description}
                      </TableCell>
                      <TableCell>{FormUtils.formatDate(voucher.transaction_date)}</TableCell>
                      <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(voucher)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          {voucher.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveVoucher(voucher)}
                              className="text-success hover:text-success"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVoucher(voucher)}
                            className="text-error hover:text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
            
            {filteredVouchers.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'No vouchers found matching your criteria' 
                    : 'No vouchers created yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Voucher</DialogTitle>
          </DialogHeader>
          <VoucherForm
            formData={formData}
            formErrors={formErrors}
            onInputChange={handleInputChange}
            onSubmit={handleEditVoucher}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedVoucher(null);
              resetForm();
            }}
            submitting={submitting}
            submitLabel="Update Voucher"
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Voucher Form Component
interface VoucherFormProps {
  formData: VoucherFormData;
  formErrors: Record<string, string>;
  onInputChange: (field: keyof VoucherFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
}

const VoucherForm: React.FC<VoucherFormProps> = ({
  formData,
  formErrors,
  onInputChange,
  onSubmit,
  onCancel,
  submitting,
  submitLabel
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voucher_type">Voucher Type</Label>
        <Select value={formData.voucher_type} onValueChange={(value) => onInputChange('voucher_type', value as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.voucher_type && (
          <p className="text-sm text-error">{formErrors.voucher_type}</p>
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          className={formErrors.description ? 'border-error' : ''}
          rows={3}
        />
        {formErrors.description && (
          <p className="text-sm text-error">{formErrors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference_number">Reference Number (Optional)</Label>
        <Input
          id="reference_number"
          value={formData.reference_number}
          onChange={(e) => onInputChange('reference_number', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction_date">Transaction Date</Label>
        <Input
          id="transaction_date"
          type="date"
          value={formData.transaction_date}
          onChange={(e) => onInputChange('transaction_date', e.target.value)}
          className={formErrors.transaction_date ? 'border-error' : ''}
        />
        {formErrors.transaction_date && (
          <p className="text-sm text-error">{formErrors.transaction_date}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={submitting} className="btn-premium">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
};

export default VoucherManagementPage;