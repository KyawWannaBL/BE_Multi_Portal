import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  Store, 
  Package, 
  MoreHorizontal, 
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, Shipment, Customer, Merchant } from '@/services/logistics-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const RegistrationQueue: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('shipments');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'shipments') {
        const response = await logisticsAPI.getShipments({ status: 'PENDING' });
        if (response.success) setShipments(response.shipments);
      } else if (activeTab === 'customers') {
        const { data } = await logisticsAPI.getProfiles({ role: 'CUSTOMER', status: 'PENDING' });
        // Cast to Customer type for demonstration - in production would use specific endpoint
        if (data) setCustomers(data as any);
      } else if (activeTab === 'merchants') {
        const { data } = await logisticsAPI.getProfiles({ role: 'MERCHANT', status: 'PENDING' });
        if (data) setMerchants(data as any);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      toast({
        title: "Error",
        description: "Failed to load registration queue items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAction = async (id: string, action: 'approve' | 'reject', type: string) => {
    try {
      // Mock API call for demo purposes
      toast({
        title: "Success",
        description: `${type} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} ${type}.`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-heading">Registration Queue</h1>
          <p className="text-muted-foreground">Manage and process new shipment, customer, and merchant applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search records..." 
              className="pl-10 bg-secondary/50 border-border focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="luxury-card border-none shadow-luxury overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Package className="h-4 w-4 mr-2 text-primary" />
              Pending Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring verification</p>
          </CardContent>
        </Card>
        <Card className="luxury-card border-none shadow-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <UserPlus className="h-4 w-4 mr-2 text-primary" />
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">KYC pending approval</p>
          </CardContent>
        </Card>
        <Card className="luxury-card border-none shadow-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Store className="h-4 w-4 mr-2 text-primary" />
              Merchant Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{merchants.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Contract review required</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="shipments" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/30 p-1 mb-6 border border-border/50 rounded-xl">
          <TabsTrigger value="shipments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Shipment Verification
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Customer Onboarding
          </TabsTrigger>
          <TabsTrigger value="merchants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Merchant Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-0">
          <Card className="luxury-card border-none">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-muted-foreground">AWB Number</TableHead>
                  <TableHead className="text-muted-foreground">Sender</TableHead>
                  <TableHead className="text-muted-foreground">Receiver</TableHead>
                  <TableHead className="text-muted-foreground">Weight/Value</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading queue...</TableCell></TableRow>
                ) : shipments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No pending shipments found.</TableCell></TableRow>
                ) : (
                  shipments.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-secondary/20 transition-colors border-border/30">
                      <TableCell className="font-mono font-medium">{shipment.awb_number}</TableCell>
                      <TableCell>{shipment.sender_name}</TableCell>
                      <TableCell>{shipment.receiver_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{shipment.weight}kg</div>
                        <div className="text-xs text-muted-foreground">{shipment.total_cost.toLocaleString()} MMK</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => handleAction(shipment.id, 'approve', 'Shipment')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                            onClick={() => handleAction(shipment.id, 'reject', 'Shipment')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                              <DropdownMenuItem><ArrowRight className="h-4 w-4 mr-2" /> Re-assign Rider</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-0">
          <Card className="luxury-card border-none">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-muted-foreground">Full Name</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">Location</TableHead>
                  <TableHead className="text-muted-foreground">KYC Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">Loading queue...</TableCell></TableRow>
                ) : customers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No pending customer applications.</TableCell></TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-secondary/20 transition-colors border-border/30">
                      <TableCell className="font-medium">{customer.full_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{customer.phone}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{customer.city}, {customer.state}</TableCell>
                      <TableCell>{getStatusBadge(customer.kyc_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => handleAction(customer.id, 'approve', 'Customer')}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-500 hover:bg-rose-500/10"
                            onClick={() => handleAction(customer.id, 'reject', 'Customer')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="merchants" className="mt-0">
          <Card className="luxury-card border-none">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-muted-foreground">Business Name</TableHead>
                  <TableHead className="text-muted-foreground">Contact Person</TableHead>
                  <TableHead className="text-muted-foreground">Vol. Target</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">Loading queue...</TableCell></TableRow>
                ) : merchants.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No pending merchant applications.</TableCell></TableRow>
                ) : (
                  merchants.map((merchant) => (
                    <TableRow key={merchant.id} className="hover:bg-secondary/20 transition-colors border-border/30">
                      <TableCell>
                        <div className="font-medium">{merchant.business_name}</div>
                        <div className="text-xs text-muted-foreground">ID: {merchant.merchant_code}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{merchant.contact_person}</div>
                        <div className="text-xs text-muted-foreground">{merchant.phone}</div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{merchant.monthly_volume.toLocaleString()} units</TableCell>
                      <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="default" 
                            className="luxury-button py-2 px-4 h-auto"
                            onClick={() => handleAction(merchant.id, 'approve', 'Merchant')}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Footer */}
      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold flex items-center">
          <Clock className="h-5 w-4 mr-2 text-primary" />
          Recent Queue Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-secondary/20 border border-border/40 flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Shipment Approved</p>
                <p className="text-xs text-muted-foreground">AWB-2026-00{i} was verified by {user?.full_name || 'System'}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">2 hours ago</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RegistrationQueue;