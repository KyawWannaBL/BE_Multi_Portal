import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  MessageCircle,
  Navigation,
  Package,
  User,
  Star,
  Share2,
  Bell,
  Zap,
  Route,
  Timer,
  Shield,
  Heart
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguageContext } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { IMAGES } from '@/assets/images';

// Advanced tracking data with real-time simulation
const TRACKING_DATA = {
  id: "BR-2026-001",
  status: "in_transit",
  progress: 75,
  estimatedDelivery: "2026-02-04 15:30",
  currentLocation: "Yangon - Thanlyin Bridge",
  rider: {
    name: "Ko Aung Myat",
    phone: "+95 9 111 222 333",
    rating: 4.9,
    avatar: "/api/placeholder/40/40",
    vehicle: "Motorcycle - YGN-1234"
  },
  timeline: [
    {
      id: 1,
      status: "Order Confirmed",
      time: "09:00 AM",
      completed: true,
      icon: CheckCircle2,
      description: "Your order has been confirmed and is being prepared"
    },
    {
      id: 2,
      status: "Preparing",
      time: "09:15 AM", 
      completed: true,
      icon: Package,
      description: "Package is being prepared for pickup"
    },
    {
      id: 3,
      status: "Picked Up",
      time: "10:30 AM",
      completed: true,
      icon: Truck,
      description: "Package picked up by delivery rider"
    },
    {
      id: 4,
      status: "In Transit",
      time: "11:00 AM",
      completed: true,
      active: true,
      icon: Navigation,
      description: "On the way to your location"
    },
    {
      id: 5,
      status: "Out for Delivery",
      time: "Est. 15:00",
      completed: false,
      icon: MapPin,
      description: "Rider is near your delivery location"
    },
    {
      id: 6,
      status: "Delivered",
      time: "Est. 15:30",
      completed: false,
      icon: CheckCircle2,
      description: "Package delivered successfully"
    }
  ],
  package: {
    items: [
      { name: "Samsung Galaxy S26", quantity: 1, price: "1,200,000 MMK" },
      { name: "Wireless Charger", quantity: 1, price: "45,000 MMK" }
    ],
    total: "1,245,000 MMK",
    weight: "1.2 kg",
    dimensions: "25x15x8 cm"
  },
  addresses: {
    pickup: "Global Electronics Store, Downtown Plaza, Yangon",
    delivery: "Building 15, Apt 3B, Thanlyin Township, Yangon"
  }
};

const RealTimeTrackingPage: React.FC = () => {
  const { language } = useLanguageContext();
  const { t } = useTranslation(language);
  const [trackingData, setTrackingData] = useState(TRACKING_DATA);
  const [isLive, setIsLive] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTrackingData(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 2, 100),
        currentLocation: `${prev.currentLocation} - Updated ${new Date().toLocaleTimeString()}`
      }));

      // Simulate notifications
      if (Math.random() > 0.8) {
        const messages = [
          "Rider is 5 minutes away",
          "Package is on the fastest route",
          "Delivery will arrive on time"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setNotifications(prev => [randomMessage, ...prev.slice(0, 2)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'in_transit': return 'status-transit';
      case 'preparing': return 'status-preparing';
      case 'confirmed': return 'status-confirmed';
      default: return 'status-pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50/30">
      {/* Hero Section with Live Map */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative h-96 overflow-hidden"
      >
        <div className="hero-background">
          <img 
            src={IMAGES.MOBILE_TRACKING_1} 
            alt="Delivery Tracking"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hero-overlay" />
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div 
            variants={fadeInUp}
            className="text-center text-white space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse-gold"></div>
              <span className="text-sm font-medium">LIVE TRACKING</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display">
              Track Your Order
            </h1>
            <p className="text-xl opacity-90">
              Real-time updates • Estimated delivery in 4 hours
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                {trackingData.id}
              </Badge>
              <Badge className={`${getStatusColor(trackingData.status)} px-4 py-2`}>
                In Transit
              </Badge>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="mobile-padding py-8 space-y-8">
        {/* Live Progress Section */}
        <motion.div variants={staggerItem}>
          <Card className="delivery-card border-none shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gradient-navy">
                  Delivery Progress
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-success font-medium">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{Math.round(trackingData.progress)}%</span>
                </div>
                <Progress value={trackingData.progress} className="h-3 bg-navy-100">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-1000"
                    style={{ width: `${trackingData.progress}%` }}
                  />
                </Progress>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-info/10 rounded-xl">
                      <MapPin className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Location</p>
                      <p className="font-semibold">{trackingData.currentLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-success/10 rounded-xl">
                      <Clock className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-semibold">{trackingData.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-warning/10 rounded-xl">
                      <Route className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distance Remaining</p>
                      <p className="font-semibold">8.5 km</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-error/10 rounded-xl">
                      <Timer className="h-5 w-5 text-error" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Remaining</p>
                      <p className="font-semibold">~25 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rider Information */}
        <motion.div variants={staggerItem}>
          <Card className="delivery-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Your Delivery Rider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-gold-500">
                  <AvatarImage src={trackingData.rider.avatar} />
                  <AvatarFallback className="bg-gold-100 text-gold-700 font-bold">
                    {trackingData.rider.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{trackingData.rider.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-gold-500 fill-current" />
                      <span className="font-semibold">{trackingData.rider.rating}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{trackingData.rider.vehicle}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={staggerItem}>
          <Card className="delivery-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Delivery Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trackingData.timeline.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`timeline-item ${item.completed ? 'completed' : ''} ${item.active ? 'active' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        item.completed 
                          ? 'bg-success/10' 
                          : item.active 
                            ? 'bg-gold-500/10' 
                            : 'bg-navy-100'
                      }`}>
                        <item.icon className={`h-5 w-5 ${
                          item.completed 
                            ? 'text-success' 
                            : item.active 
                              ? 'text-gold-500' 
                              : 'text-navy-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${
                            item.completed || item.active ? 'text-navy-900' : 'text-navy-400'
                          }`}>
                            {item.status}
                          </h4>
                          <span className={`text-sm ${
                            item.completed || item.active ? 'text-navy-600' : 'text-navy-400'
                          }`}>
                            {item.time}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          item.completed || item.active ? 'text-muted-foreground' : 'text-navy-300'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Package Details */}
        <motion.div variants={staggerItem}>
          <Card className="delivery-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {trackingData.package.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-navy-100 last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.price}</p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-navy-100">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-lg">{trackingData.package.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{trackingData.package.weight}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Dimensions</p>
                  <p className="font-semibold">{trackingData.package.dimensions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Notifications */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed bottom-4 left-4 right-4 z-50"
            >
              <Card className="notification notification-success">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-success" />
                  <p className="font-medium">{notifications[0]}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div variants={staggerItem} className="flex space-x-4">
          <Button className="btn-premium flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share Tracking
          </Button>
          <Button variant="outline" className="flex-1">
            <Heart className="mr-2 h-4 w-4" />
            Rate Experience
          </Button>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <Button className="fab">
        <Navigation className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default RealTimeTrackingPage;