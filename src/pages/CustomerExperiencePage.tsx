import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  Filter,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Camera,
  Gift,
  Zap,
  Shield,
  Award,
  Sparkles,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  CreditCard,
  QrCode,
  Bell,
  Settings,
  User,
  Plus,
  Minus,
  X,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  PlayCircle,
  Headphones,
  HelpCircle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguageContext } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { IMAGES } from '@/assets/images';

// Customer experience data
const CUSTOMER_DATA = {
  profile: {
    name: "Daw Khin Myo",
    phone: "+95 9 123 456 789",
    email: "khinmyo@email.com",
    address: "Building 15, Apt 3B, Thanlyin Township, Yangon",
    memberSince: "2024",
    totalOrders: 47,
    loyaltyPoints: 2840,
    preferredPayment: "Mobile Banking"
  },
  activeOrders: [
    {
      id: "BR-2026-001",
      status: "in_transit",
      merchant: "Global Electronics",
      items: ["Samsung Galaxy S26", "Wireless Charger"],
      total: "1,245,000 MMK",
      estimatedDelivery: "15:30 Today",
      rider: "Ko Aung Myat",
      riderRating: 4.9,
      progress: 75,
      trackingSteps: [
        { step: "Order Confirmed", completed: true, time: "09:00" },
        { step: "Preparing", completed: true, time: "09:15" },
        { step: "Picked Up", completed: true, time: "10:30" },
        { step: "In Transit", completed: true, active: true, time: "11:00" },
        { step: "Delivered", completed: false, time: "Est. 15:30" }
      ]
    }
  ],
  recentOrders: [
    {
      id: "BR-2026-002",
      date: "2026-02-03",
      merchant: "Fashion Hub",
      items: 2,
      total: "280,000 MMK",
      status: "delivered",
      rating: 5
    },
    {
      id: "BR-2026-003", 
      date: "2026-02-01",
      merchant: "Tech Solutions",
      items: 1,
      total: "750,000 MMK",
      status: "delivered",
      rating: 4
    }
  ],
  recommendations: [
    {
      id: 1,
      title: "Premium Electronics",
      description: "Latest smartphones and accessories",
      image: IMAGES.DELIVERY_HERO_1,
      discount: "15% OFF",
      rating: 4.8,
      deliveryTime: "30-45 min"
    },
    {
      id: 2,
      title: "Fashion Boutique",
      description: "Trendy clothing and accessories",
      image: IMAGES.MOBILE_TRACKING_1,
      discount: "Buy 2 Get 1",
      rating: 4.6,
      deliveryTime: "45-60 min"
    }
  ],
  loyaltyProgram: {
    currentTier: "Gold",
    nextTier: "Platinum",
    pointsToNext: 1160,
    benefits: [
      "Free delivery on orders over 100,000 MMK",
      "Priority customer support",
      "Exclusive member discounts",
      "Early access to sales"
    ]
  }
};

const CustomerExperiencePage: React.FC = () => {
  const { language } = useLanguageContext();
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Simulate real-time order updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          "Your order is 5 minutes away!",
          "Rider has picked up your order",
          "Order is being prepared"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setNotifications(prev => [randomMessage, ...prev.slice(0, 2)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'in_transit': return 'status-transit';
      case 'preparing': return 'status-preparing';
      default: return 'status-pending';
    }
  };

  const OrderTrackingCard = ({ order }: { order: any }) => (
    <Card className="delivery-card border-none shadow-xl hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-navy-900">{order.id}</h3>
            <p className="text-sm text-muted-foreground">{order.merchant}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            In Transit
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-semibold">{order.progress}%</span>
          </div>
          <Progress value={order.progress} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-gold-500" />
              <span className="text-sm font-medium">{order.rider}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-gold-500 fill-current" />
                <span className="text-xs">{order.riderRating}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="rounded-full">
                <Phone className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-full">
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-navy-100">
            <span className="font-semibold text-navy-900">{order.total}</span>
            <span className="text-sm text-success font-medium">
              Arriving {order.estimatedDelivery}
            </span>
          </div>
        </div>
        
        <Button className="w-full mt-4 btn-premium" onClick={() => setSelectedOrder(order)}>
          <MapPin className="mr-2 h-4 w-4" />
          Track Live
        </Button>
      </CardContent>
    </Card>
  );

  const RecommendationCard = ({ item }: { item: any }) => (
    <Card className="delivery-card border-none shadow-lg hover-lift cursor-pointer">
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-32 object-cover rounded-t-2xl"
        />
        <Badge className="absolute top-2 right-2 bg-error text-white">
          {item.discount}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-navy-900 mb-1">{item.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-gold-500 fill-current" />
              <span className="text-xs font-medium">{item.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{item.deliveryTime}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const LoyaltyCard = () => (
    <Card className="lotus-card text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Loyalty Program</h3>
            <p className="text-gold-200">{CUSTOMER_DATA.loyaltyProgram.currentTier} Member</p>
          </div>
          <Award className="h-8 w-8 text-gold-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gold-200">Points to {CUSTOMER_DATA.loyaltyProgram.nextTier}</span>
              <span className="text-white font-semibold">
                {CUSTOMER_DATA.loyaltyProgram.pointsToNext} points
              </span>
            </div>
            <Progress 
              value={(CUSTOMER_DATA.profile.loyaltyPoints / (CUSTOMER_DATA.profile.loyaltyPoints + CUSTOMER_DATA.loyaltyProgram.pointsToNext)) * 100} 
              className="h-2 bg-navy-800"
            />
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gold-400">{CUSTOMER_DATA.profile.loyaltyPoints}</p>
            <p className="text-gold-200 text-sm">Available Points</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50/20">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-navy-100"
      >
        <div className="mobile-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-gold-500">
                <AvatarFallback className="bg-gold-100 text-gold-700 font-bold">
                  {CUSTOMER_DATA.profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-bold text-lg text-navy-900">
                  Welcome back, {CUSTOMER_DATA.profile.name.split(' ')[1]}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  {CUSTOMER_DATA.loyaltyProgram.currentTier} Member • {CUSTOMER_DATA.profile.loyaltyPoints} points
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></div>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mobile-padding py-2 bg-transparent">
          <TabsTrigger value="home" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="flex flex-col items-center space-y-1">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="flex flex-col items-center space-y-1">
              <Package className="h-4 w-4" />
              <span className="text-xs">Orders</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="explore" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="flex flex-col items-center space-y-1">
              <Search className="h-4 w-4" />
              <span className="text-xs">Explore</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <div className="flex flex-col items-center space-y-1">
              <User className="h-4 w-4" />
              <span className="text-xs">Profile</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mobile-padding py-6 space-y-6">
          {/* Active Orders */}
          {CUSTOMER_DATA.activeOrders.length > 0 && (
            <motion.div variants={staggerItem}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy-900">Active Orders</h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              {CUSTOMER_DATA.activeOrders.map((order) => (
                <OrderTrackingCard key={order.id} order={order} />
              ))}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={staggerItem}>
            <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="delivery-card border-none shadow-lg hover-lift cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <QrCode className="h-6 w-6 text-gold-500" />
                  </div>
                  <h3 className="font-semibold text-navy-900">Scan QR</h3>
                  <p className="text-sm text-muted-foreground">Quick order</p>
                </CardContent>
              </Card>
              
              <Card className="delivery-card border-none shadow-lg hover-lift cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Headphones className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-navy-900">Support</h3>
                  <p className="text-sm text-muted-foreground">Get help</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Loyalty Program */}
          <motion.div variants={staggerItem}>
            <LoyaltyCard />
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900">Recommended for You</h2>
              <Button variant="ghost" size="sm">
                See All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CUSTOMER_DATA.recommendations.map((item) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="orders" className="mobile-padding py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy-900">My Orders</h2>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Recent Orders */}
          <div className="space-y-4">
            {CUSTOMER_DATA.recentOrders.map((order) => (
              <Card key={order.id} className="delivery-card border-none shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-navy-900">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      Delivered
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy-900">{order.merchant}</p>
                      <p className="text-sm text-muted-foreground">{order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy-900">{order.total}</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < order.rating ? 'text-gold-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Reorder
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Rate & Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="explore" className="mobile-padding py-6 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants, shops, items..."
              className="input-premium pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-4">Categories</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Smartphone, label: 'Electronics', color: 'bg-blue-500/10 text-blue-500' },
                { icon: Gift, label: 'Fashion', color: 'bg-pink-500/10 text-pink-500' },
                { icon: Package, label: 'Home', color: 'bg-green-500/10 text-green-500' },
                { icon: Sparkles, label: 'Beauty', color: 'bg-purple-500/10 text-purple-500' }
              ].map((category, index) => (
                <Card key={index} className="delivery-card border-none shadow-lg hover-lift cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-navy-900">{category.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mobile-padding py-6 space-y-6">
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-gold-500">
              <AvatarFallback className="bg-gold-100 text-gold-700 font-bold text-xl">
                {CUSTOMER_DATA.profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-navy-900">{CUSTOMER_DATA.profile.name}</h2>
            <p className="text-muted-foreground">{CUSTOMER_DATA.loyaltyProgram.currentTier} Member since {CUSTOMER_DATA.profile.memberSince}</p>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="delivery-card border-none shadow-lg text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-navy-900">{CUSTOMER_DATA.profile.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card className="delivery-card border-none shadow-lg text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gold-500">{CUSTOMER_DATA.profile.loyaltyPoints}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </CardContent>
            </Card>
            <Card className="delivery-card border-none shadow-lg text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-success">4.9</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Options */}
          <div className="space-y-2">
            {[
              { icon: User, label: 'Edit Profile', color: 'text-navy-500' },
              { icon: MapPin, label: 'Manage Addresses', color: 'text-navy-500' },
              { icon: CreditCard, label: 'Payment Methods', color: 'text-navy-500' },
              { icon: Bell, label: 'Notifications', color: 'text-navy-500' },
              { icon: HelpCircle, label: 'Help & Support', color: 'text-navy-500' },
              { icon: Settings, label: 'Settings', color: 'text-navy-500' }
            ].map((option, index) => (
              <Card key={index} className="delivery-card border-none shadow-sm hover-lift cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <option.icon className={`h-5 w-5 ${option.color}`} />
                      <span className="font-medium text-navy-900">{option.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Live Notifications */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <Card className="notification notification-success">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-success" />
                <p className="font-medium">{notifications[0]}</p>
                <Button variant="ghost" size="sm" onClick={() => setNotifications([])}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <Button className="fab">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CustomerExperiencePage;