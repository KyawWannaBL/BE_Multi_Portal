import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  ScanLine,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  Truck,
  User,
  Star,
  Route,
  Zap,
  Shield,
  Heart,
  Share2,
  MoreVertical,
  Plus,
  Minus,
  X,
  ChevronRight,
  ChevronDown,
  Smartphone,
  Headphones,
  Settings,
  Bell,
  Menu
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguageContext } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { IMAGES } from '@/assets/images';

// Mobile-optimized delivery data
const MOBILE_DELIVERIES = [
  {
    id: "BR-2026-001",
    status: "pickup_ready",
    priority: "high",
    customer: "Daw Khin Myo",
    phone: "+95 9 123 456 789",
    address: "Building 15, Apt 3B, Thanlyin Township",
    items: ["Samsung Galaxy S26", "Wireless Charger"],
    value: "1,245,000 MMK",
    distance: "2.3 km",
    estimatedTime: "15 min",
    specialInstructions: "Call before arrival",
    coordinates: { lat: 16.7967, lng: 96.1610 }
  },
  {
    id: "BR-2026-002", 
    status: "in_transit",
    priority: "medium",
    customer: "U Thant Zin",
    phone: "+95 9 987 654 321",
    address: "Chanayethazan Township, Street 84, House 25",
    items: ["Fashion Items", "Accessories"],
    value: "280,000 MMK",
    distance: "5.7 km",
    estimatedTime: "25 min",
    specialInstructions: "Fragile items - handle with care",
    coordinates: { lat: 21.9588, lng: 96.0891 }
  },
  {
    id: "BR-2026-003",
    status: "delivered",
    priority: "low",
    customer: "Ma Aye Aye",
    phone: "+95 9 555 123 456",
    address: "Insein Township, Industrial Zone B",
    items: ["Office Equipment"],
    value: "750,000 MMK",
    distance: "8.2 km",
    estimatedTime: "Completed",
    specialInstructions: "Business delivery - signature required",
    coordinates: { lat: 16.8661, lng: 96.0951 }
  }
];

const MobileDeliveryInterface: React.FC = () => {
  const { language } = useLanguageContext();
  const { t } = useTranslation(language);
  const [deliveries, setDeliveries] = useState(MOBILE_DELIVERIES);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Yangon Downtown");

  // Filter deliveries based on tab and search
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'active' 
      ? ['pickup_ready', 'in_transit'].includes(delivery.status)
      : activeTab === 'completed'
        ? delivery.status === 'delivered'
        : true;
    
    return matchesSearch && matchesTab;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pickup_ready':
        return { label: 'Ready for Pickup', color: 'status-pickup', icon: Package };
      case 'in_transit':
        return { label: 'In Transit', color: 'status-transit', icon: Truck };
      case 'delivered':
        return { label: 'Delivered', color: 'status-delivered', icon: CheckCircle2 };
      default:
        return { label: 'Unknown', color: 'status-pending', icon: Clock };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error/10 text-error border-error/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-navy-100 text-navy-600 border-navy-200';
    }
  };

  const DeliveryCard = ({ delivery }: { delivery: any }) => {
    const statusInfo = getStatusInfo(delivery.status);
    const StatusIcon = statusInfo.icon;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileTap={{ scale: 0.98 }}
        className="delivery-card cursor-pointer hover-lift"
        onClick={() => setSelectedDelivery(delivery)}
      >
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl ${statusInfo.color.replace('status-', 'bg-status-').replace(' ', '/10 text-status-')}`}>
            <StatusIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-navy-900 truncate">{delivery.customer}</h3>
              <Badge className={`${getPriorityColor(delivery.priority)} text-xs`}>
                {delivery.priority.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {delivery.address}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {delivery.distance}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {delivery.estimatedTime}
                </span>
              </div>
              <span className="font-semibold text-navy-900">{delivery.value}</span>
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </motion.div>
    );
  };

  const DeliveryDetails = ({ delivery }: { delivery: any }) => {
    const statusInfo = getStatusInfo(delivery.status);
    const StatusIcon = statusInfo.icon;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${statusInfo.color.replace('status-', 'bg-status-').replace(' ', '/10 text-status-')}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">{delivery.id}</h2>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDelivery(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Customer Info */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Customer Details</h3>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gold-100 text-gold-700 font-bold">
                    {delivery.customer.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-navy-900">{delivery.customer}</p>
                  <p className="text-sm text-muted-foreground">{delivery.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 pt-2 border-t border-navy-100">
                <MapPin className="h-4 w-4 text-gold-500 mt-0.5" />
                <p className="text-sm text-navy-700">{delivery.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Info */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="font-semibold text-navy-900 mb-3">Package Details</h3>
            <div className="space-y-3">
              {delivery.items.map((item: string, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-navy-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-navy-600" />
                    </div>
                    <span className="text-sm font-medium text-navy-900">{item}</span>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-3 border-t border-navy-100">
                <span className="font-semibold text-navy-900">Total Value</span>
                <span className="font-bold text-lg text-navy-900">{delivery.value}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {delivery.specialInstructions && (
          <Card className="glass-card border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">Special Instructions</h4>
                  <p className="text-sm text-navy-700">{delivery.specialInstructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {delivery.status === 'pickup_ready' && (
            <Button className="btn-premium w-full">
              <Navigation className="mr-2 h-4 w-4" />
              Start Navigation
            </Button>
          )}
          
          {delivery.status === 'in_transit' && (
            <div className="grid grid-cols-2 gap-3">
              <Button className="btn-delivery">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Delivered
              </Button>
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Location
            </Button>
            <Button variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50/20">
      {/* Mobile Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-navy-100"
      >
        <div className="mobile-padding py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-gold-500">
                <AvatarFallback className="bg-gold-100 text-gold-700 font-bold">
                  KA
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-navy-900">Ko Aung Myat</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-error'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {isOnline ? 'Online' : 'Offline'} • {currentLocation}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deliveries..."
              className="input-premium pl-10 pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mobile-padding py-4 border-b border-navy-100">
        <div className="flex space-x-1 bg-navy-100 rounded-xl p-1">
          {[
            { id: 'active', label: 'Active', count: deliveries.filter(d => ['pickup_ready', 'in_transit'].includes(d.status)).length },
            { id: 'completed', label: 'Completed', count: deliveries.filter(d => d.status === 'delivered').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Delivery List */}
      <div className="mobile-padding py-4 space-y-4">
        <AnimatePresence mode="wait">
          {filteredDeliveries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No deliveries found' : 'No active deliveries'}
              </p>
            </motion.div>
          ) : (
            filteredDeliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delivery Details Sheet */}
      <Sheet open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <div className="py-4">
            {selectedDelivery && <DeliveryDetails delivery={selectedDelivery} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick Actions FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <Button size="sm" className="rounded-full w-12 h-12 bg-white/90 text-navy-900 shadow-xl hover:shadow-2xl">
          <Headphones className="h-5 w-5" />
        </Button>
        <Button className="fab">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-navy-100 safe-area-pb">
        <div className="grid grid-cols-4 py-2">
          {[
            { icon: Truck, label: 'Deliveries', active: true },
            { icon: Route, label: 'Routes', active: false },
            { icon: Star, label: 'Earnings', active: false },
            { icon: User, label: 'Profile', active: false }
          ].map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center py-2 px-1 ${
                item.active ? 'text-gold-500' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileDeliveryInterface;