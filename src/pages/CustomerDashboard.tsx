import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  PlusCircle,
  Eye,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';

export default function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Shipments',
      value: '3',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Delivered (This Month)',
      value: '12',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending COD',
      value: '45,000 MMK',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentShipments = [
    {
      id: 'BE-89744',
      destination: 'Mandalay',
      date: 'Oct 24, 2026',
      status: 'In Transit',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'BE-11223',
      destination: 'Nay Pyi Taw',
      date: 'Oct 20, 2026',
      status: 'Delivered',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'BE-88901',
      destination: 'Yangon (North Dagon)',
      date: 'Oct 18, 2026',
      status: 'Delivered',
      statusColor: 'bg-green-100 text-green-800',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your shipments today.</p>
        </div>
        <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-navy-900">
          <Link to={ROUTE_PATHS.CUSTOMER_BOOKING}>
            <PlusCircle className="w-5 h-5 mr-2" />
            Book Pickup
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Shipments</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTE_PATHS.CUSTOMER_SHIPMENTS}>
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{shipment.id}</p>
                    <p className="text-sm text-gray-600">{shipment.destination}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge className={shipment.statusColor}>
                      {shipment.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{shipment.date}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to={ROUTE_PATHS.CUSTOMER_BOOKING}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New Shipment</h3>
              <p className="text-gray-600 text-sm">Book a new pickup and delivery service</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to={ROUTE_PATHS.PUBLIC_TRACKING}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Shipment</h3>
              <p className="text-gray-600 text-sm">Track your packages in real-time</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}