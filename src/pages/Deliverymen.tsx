import React, { useState } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Bike, 
  Plus, 
  DollarSign, 
  Package, 
  Truck, 
  RotateCcw, 
  ArrowUpDown, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Deliveryman {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  cashOnHand: number;
  activePickup: number;
  activeDeliver: number;
  activeReturn: number;
  activeTransit: number;
  totalDeliveries: number;
  rating: number;
  joinDate: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'van' | 'truck';
  zone: string;
}

const mockDeliverymen: Deliveryman[] = [
  {
    id: '1',
    employeeId: 'D001',
    name: 'Ko Zaw Min',
    phone: '+95 9 123 456 789',
    email: 'zawmin@britium.com',
    address: 'Yangon, Kamayut Township',
    status: 'active',
    cashOnHand: 150000,
    activePickup: 3,
    activeDeliver: 5,
    activeReturn: 1,
    activeTransit: 2,
    totalDeliveries: 1245,
    rating: 4.8,
    joinDate: '2025-01-15',
    vehicleType: 'motorcycle',
    zone: 'Yangon North'
  },
  {
    id: '2',
    employeeId: 'D002',
    name: 'Ko Myint Swe',
    phone: '+95 9 987 654 321',
    email: 'myintswe@britium.com',
    address: 'Mandalay, Chan Aye Thar Zan',
    status: 'active',
    cashOnHand: 89000,
    activePickup: 2,
    activeDeliver: 3,
    activeReturn: 0,
    activeTransit: 1,
    totalDeliveries: 856,
    rating: 4.6,
    joinDate: '2025-03-20',
    vehicleType: 'motorcycle',
    zone: 'Mandalay Central'
  },
  {
    id: '3',
    employeeId: 'D003',
    name: 'Ko Thura',
    phone: '+95 9 555 666 777',
    email: 'thura@britium.com',
    address: 'Yangon, Bahan Township',
    status: 'on_leave',
    cashOnHand: 45000,
    activePickup: 0,
    activeDeliver: 0,
    activeReturn: 0,
    activeTransit: 0,
    totalDeliveries: 623,
    rating: 4.3,
    joinDate: '2025-06-10',
    vehicleType: 'bicycle',
    zone: 'Yangon Central'
  }
];

export default function Deliverymen() {
  const { t, language } = useLanguageContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCashAdvanceDialogOpen, setIsCashAdvanceDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      inactive: { variant: 'secondary' as const, label: 'Inactive', icon: Clock },
      on_leave: { variant: 'outline' as const, label: 'On Leave', icon: Clock },
      suspended: { variant: 'destructive' as const, label: 'Suspended', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getVehicleIcon = (vehicleType: string) => {
    const icons = {
      motorcycle: Bike,
      bicycle: Bike,
      van: Truck,
      truck: Truck
    };
    return icons[vehicleType as keyof typeof icons] || Bike;
  };

  const filteredDeliverymen = mockDeliverymen.filter(deliveryman => 
    deliveryman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deliveryman.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deliveryman.phone.includes(searchTerm) ||
    deliveryman.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AddDeliverymanDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('delivery.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('delivery.addNew')}</DialogTitle>
          <DialogDescription>
            Add a new deliveryman to the system
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+95 9 xxx xxx xxx" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="deliveryman@britium.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter full address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yangon_north">Yangon North</SelectItem>
                  <SelectItem value="yangon_central">Yangon Central</SelectItem>
                  <SelectItem value="yangon_south">Yangon South</SelectItem>
                  <SelectItem value="mandalay_central">Mandalay Central</SelectItem>
                  <SelectItem value="naypyidaw">Naypyidaw</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            {t('form.cancel')}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(false)}>
            {t('form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const CashAdvanceDialog = () => (
    <Dialog open={isCashAdvanceDialogOpen} onOpenChange={setIsCashAdvanceDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign className="w-4 h-4 mr-2" />
          Cash Advance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cash Advance Management</DialogTitle>
          <DialogDescription>
            Manage cash advances for deliverymen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryman">Select Deliveryman</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose deliveryman" />
              </SelectTrigger>
              <SelectContent>
                {mockDeliverymen.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (MMK)</Label>
            <Input id="amount" type="number" placeholder="Enter amount" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" placeholder="Enter reason for cash advance" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCashAdvanceDialogOpen(false)}>
            {t('form.cancel')}
          </Button>
          <Button onClick={() => setIsCashAdvanceDialogOpen(false)}>
            Process Advance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.deliverymen')}</h1>
          <p className="text-muted-foreground">
            Manage deliverymen, cash advances, and performance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <CashAdvanceDialog />
          <AddDeliverymanDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliverymen</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDeliverymen.length}</div>
            <p className="text-xs text-muted-foreground">
              +1 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliverymen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDeliverymen.filter(d => d.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockDeliverymen.filter(d => d.status === 'active').length / mockDeliverymen.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('delivery.cashOnHand')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDeliverymen.reduce((sum, d) => sum + d.cashOnHand, 0).toLocaleString()} MMK
            </div>
            <p className="text-xs text-muted-foreground">
              Total cash with deliverymen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDeliverymen.reduce((sum, d) => sum + d.activeDeliver, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Bike className="w-4 h-4" />
            <span className="hidden sm:inline">{t('delivery.list')}</span>
          </TabsTrigger>
          <TabsTrigger value="cash_advance" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Cash Advance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('form.search') + ' deliverymen...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name & Contact</TableHead>
                    <TableHead>{t('delivery.status')}</TableHead>
                    <TableHead>{t('delivery.cashOnHand')}</TableHead>
                    <TableHead>{t('delivery.activePickup')}</TableHead>
                    <TableHead>{t('delivery.activeDeliver')}</TableHead>
                    <TableHead>{t('delivery.activeReturn')}</TableHead>
                    <TableHead>{t('delivery.activeTransit')}</TableHead>
                    <TableHead>Vehicle & Zone</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliverymen.map((deliveryman) => {
                    const VehicleIcon = getVehicleIcon(deliveryman.vehicleType);
                    return (
                      <TableRow key={deliveryman.id}>
                        <TableCell className="font-medium">{deliveryman.employeeId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deliveryman.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {deliveryman.phone}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {deliveryman.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(deliveryman.status)}</TableCell>
                        <TableCell className="font-medium">
                          {deliveryman.cashOnHand.toLocaleString()} MMK
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{deliveryman.activePickup}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{deliveryman.activeDeliver}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{deliveryman.activeReturn}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{deliveryman.activeTransit}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <VehicleIcon className="w-4 h-4" />
                            <div>
                              <div className="text-sm font-medium capitalize">{deliveryman.vehicleType}</div>
                              <div className="text-xs text-muted-foreground">{deliveryman.zone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{deliveryman.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                {t('form.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Cash Advance
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="w-4 h-4 mr-2" />
                                View Assignments
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash_advance">
          <Card>
            <CardHeader>
              <CardTitle>Cash Advance Management</CardTitle>
              <CardDescription>
                Track and manage cash advances for deliverymen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cash advance management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}