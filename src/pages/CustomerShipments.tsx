import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Download,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/lib/index';
import { useLanguageContext } from '@/lib/LanguageContext';

export default function CustomerShipments() {
  const { t } = useLanguageContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const shipments = [
    {
      id: 'BE-89744',
      date: 'Oct 24, 2026',
      receiver: 'Daw Hla',
      destination: 'Mandalay',
      codAmount: '35,000 MMK',
      status: 'In Transit',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'BE-11223',
      date: 'Oct 20, 2026',
      receiver: 'U Ba Maung',
      destination: 'Nay Pyi Taw',
      codAmount: '12,500 MMK',
      status: 'Delivered',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'BE-88901',
      date: 'Oct 18, 2026',
      receiver: 'Ma Mya',
      destination: 'Yangon (North Dagon)',
      codAmount: '--',
      status: 'Delivered',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'BE-77120',
      date: 'Oct 15, 2026',
      receiver: 'Ko Ko',
      destination: 'Mawlamyine',
      codAmount: '5,500 MMK',
      status: 'Cancelled',
      statusColor: 'bg-red-100 text-red-800',
    },
  ];

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('customer.shipments.title')}</h1>
          <p className="text-gray-600">{t('customer.shipments.subtitle')}</p>
        </div>
        <Button asChild className="bg-gold hover:bg-gold/90 text-navy-900">
          <Link to={ROUTE_PATHS.CUSTOMER_BOOKING}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search Tracking ID or Receiver Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="pending">Pending Pickup</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tracking ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Receiver</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">COD Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-primary">{shipment.id}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{shipment.date}</td>
                    <td className="py-4 px-4 font-medium">{shipment.receiver}</td>
                    <td className="py-4 px-4">{shipment.destination}</td>
                    <td className="py-4 px-4">{shipment.codAmount}</td>
                    <td className="py-4 px-4">
                      <Badge className={shipment.statusColor}>
                        {shipment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredShipments.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No shipments found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Showing 1-4 of 28 shipments</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-navy-900 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}