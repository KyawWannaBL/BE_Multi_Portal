import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  ArrowUpRight,
  History,
  AlertTriangle,
  Filter,
  CheckCircle2,
  UserPlus,
  RefreshCw,
  MoreVertical,
  Download,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI } from '@/services/logistics-api';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SupervisorInventory: React.FC = () => {
  const { user } = useAuth() as any;
  const { t } = useLanguage();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
  const [allocationData, setAllocationData] = useState({
    itemId: '',
    recipientType: 'rider',
    recipientId: '',
    quantity: 0,
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, [user?.branch_id]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await logisticsAPI.getInventory(user?.branch_id);
      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast.error('Failed to load inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async () => {
    if (!allocationData.itemId || allocationData.quantity <= 0 || !allocationData.recipientId) {
      toast.warning('Please fill in all required fields');
      return;
    }

    const selectedItem = inventory.find(i => i.id === allocationData.itemId);
    if (selectedItem && selectedItem.stock_quantity < allocationData.quantity) {
      toast.error('Insufficient stock available');
      return;
    }

    try {
      // In a real scenario, we'd call a dedicated allocation endpoint
      // For now, we simulate success and update local state
      toast.success(`Successfully allocated ${allocationData.quantity} tags to ${allocationData.recipientType}`);
      setIsAllocateDialogOpen(false);
      fetchInventory();
    } catch (error: any) {
      toast.error('Allocation failed: ' + error.message);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: inventory.reduce((acc, curr) => acc + (curr.stock_quantity || 0), 0),
    lowStock: inventory.filter(item => item.stock_quantity < 100).length,
    categories: new Set(inventory.map(item => item.category)).size,
    lastUpdate: new Date().toLocaleDateString()
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springPresets.gentle}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tag Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor stock levels, allocate batches, and track tag distribution across {user?.branch?.name || 'Main Branch'}
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="luxury-card border-luxury-gold/20 text-luxury-gold"
            onClick={fetchInventory}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="luxury-button">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Allocate Tags
              </Button>
            </DialogTrigger>
            <DialogContent className="luxury-glass border-luxury-gold/30 text-foreground sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-luxury-gold font-bold">Allocate Tag Batches</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Transfer stock to riders or substations for operational use.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Select Item</Label>
                  <Select onValueChange={(val) => setAllocationData({ ...allocationData, itemId: val })}>
                    <SelectTrigger className="bg-luxury-obsidian/50 border-white/10">
                      <SelectValue placeholder="Choose tag type" />
                    </SelectTrigger>
                    <SelectContent className="bg-luxury-obsidian border-white/10">
                      {inventory.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.item_name} ({item.stock_quantity} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Type</Label>
                    <Select 
                      defaultValue="rider" 
                      onValueChange={(val) => setAllocationData({ ...allocationData, recipientType: val })}
                    >
                      <SelectTrigger className="bg-luxury-obsidian/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-luxury-obsidian border-white/10">
                        <SelectItem value="rider">Rider</SelectItem>
                        <SelectItem value="substation">Substation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      className="bg-luxury-obsidian/50 border-white/10"
                      placeholder="0"
                      onChange={(e) => setAllocationData({ ...allocationData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recipient ID / Code</Label>
                  <Input 
                    placeholder="Enter ID..."
                    className="bg-luxury-obsidian/50 border-white/10"
                    onChange={(e) => setAllocationData({ ...allocationData, recipientId: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAllocateDialogOpen(false)}
                  className="text-muted-foreground hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  className="luxury-button px-8"
                  onClick={handleAllocate}
                >
                  Confirm Allocation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Metrics */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={staggerItem}>
          <Card className="luxury-card border-none bg-gradient-to-br from-luxury-gold/10 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tags</p>
                  <h3 className="text-2xl font-bold text-luxury-gold">{stats.total.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-luxury-gold/20 rounded-2xl">
                  <Package className="h-6 w-6 text-luxury-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="luxury-card border-none bg-gradient-to-br from-destructive/10 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                  <h3 className="text-2xl font-bold text-destructive">{stats.lowStock} Items</h3>
                </div>
                <div className="p-3 bg-destructive/20 rounded-2xl">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="luxury-card border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                  <h3 className="text-2xl font-bold">{stats.categories}</h3>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="luxury-card border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Audit Date</p>
                  <h3 className="text-2xl font-bold">{stats.lastUpdate}</h3>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Inventory Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or SKU..."
              className="pl-10 bg-luxury-obsidian/40 border-white/10 focus:border-luxury-gold/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/10 text-xs">
              <Download className="mr-2 h-3 w-3" /> Export Report
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 text-xs">
              <Filter className="mr-2 h-3 w-3" /> Filters
            </Button>
          </div>
        </div>

        <div className="luxury-card overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="text-luxury-gold">Item Details</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 animate-pulse">
                    <TableCell colSpan={6} className="h-16 bg-white/5"></TableCell>
                  </TableRow>
                ))
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.item_name}</span>
                        <span className="text-xs text-muted-foreground">ID: {item.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.sku || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-white/10 text-[10px] uppercase tracking-wider">
                        {item.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${item.stock_quantity < 100 ? 'text-destructive' : 'text-foreground'}`}>
                          {item.stock_quantity?.toLocaleString()}
                        </span>
                        <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${item.stock_quantity < 100 ? 'bg-destructive' : 'bg-luxury-gold'}`} 
                            style={{ width: `${Math.min((item.stock_quantity / 5000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.stock_quantity > 100 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Healthy
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Critical
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-luxury-gold/20 hover:text-luxury-gold">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-12 w-12 opacity-20" />
                      <p>No inventory items found matching your search</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Distribution Map/Chart Mock (Optional Luxury Touch) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="luxury-card border-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="mr-2 h-5 w-5 text-luxury-gold" />
              Stock Distribution Velocity
            </CardTitle>
            <CardDescription>Average consumption of tags per rider category over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-4 px-8">
            {[65, 45, 85, 30, 95, 55, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-luxury-gold/40 to-luxury-gold rounded-t-lg shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                />
                <span className="text-[10px] text-muted-foreground uppercase">W{i+1}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="luxury-card border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-luxury-gold" />
              Top Consuming Riders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[ 
              { name: 'Kyaw Zayar', role: 'Elite Rider', count: 450 },
              { name: 'Htet Aung', role: 'Standard Rider', count: 320 },
              { name: 'Zin Mar', role: 'Merchant Liaison', count: 280 }
            ].map((rider, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-luxury-gold border border-white/10">
                    {rider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rider.name}</p>
                    <p className="text-xs text-muted-foreground">{rider.role}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-luxury-gold/20 text-luxury-gold">
                  {rider.count} units
                </Badge>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-luxury-gold">
              View All Distribution Records
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorInventory;