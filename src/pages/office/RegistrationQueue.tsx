import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ROUTE_PATHS,
  Shipment,
  SHIPMENT_STATUS,
  MOCK_TOWNSHIPS
} from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronRight, 
  Image as ImageIcon, 
  User, 
  Clock, 
  MapPin,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Mock data for the registration queue
const MOCK_QUEUE_DATA: Shipment[] = [
  {
    id: 'SHP-001',
    tamperTagId: 'TT-998001',
    status: SHIPMENT_STATUS.PICKED_UP_PENDING_REGISTRATION,
    pieces: 2,
    type: 'box',
    condition: 'OK',
    cod: { required: true, amount: 150 },
    destinationTownship: 'Downtown',
    photos: [
      'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400',
      'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400',
      'https://images.unsplash.com/photo-1559941727-6fb446e7e8ae?w=400'
    ],
    riderId: 'RDR-442',
    createdAt: '2026-02-11T14:30:00Z',
    labelPrintedCount: 0
  },
  {
    id: 'SHP-002',
    tamperTagId: 'TT-998005',
    status: SHIPMENT_STATUS.PICKED_UP_PENDING_REGISTRATION,
    pieces: 1,
    type: 'document',
    condition: 'OK',
    cod: { required: false },
    destinationTownship: 'Airport Zone',
    photos: [
      'https://images.unsplash.com/photo-1595054225874-7d2315262e73?w=400',
      'https://images.unsplash.com/photo-1554620158-d8d5c2f3a27b?w=400',
      'https://images.unsplash.com/photo-1595116971898-300194333127?w=400'
    ],
    riderId: 'RDR-442',
    createdAt: '2026-02-11T15:15:00Z',
    labelPrintedCount: 0
  },
  {
    id: 'SHP-003',
    tamperTagId: 'TT-997021',
    status: SHIPMENT_STATUS.PICKED_UP_PENDING_REGISTRATION,
    pieces: 5,
    type: 'other',
    condition: 'Damaged',
    cod: { required: true, amount: 2450 },
    destinationTownship: 'East Industrial',
    photos: [
      'https://images.unsplash.com/photo-1600083691960-1a52d9945594?w=400',
      'https://images.unsplash.com/photo-1646143542229-8f8b9ad26747?w=400',
      'https://images.unsplash.com/photo-1693974833425-361a83a3fcf3?w=400'
    ],
    riderId: 'RDR-109',
    createdAt: '2026-02-11T16:00:00Z',
    labelPrintedCount: 0
  }
];

const RegistrationQueue: React.FC = () => {
  const navigate = useNavigate();
  const { user, legacyUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [townshipFilter, setTownshipFilter] = useState<string>('all');

  const filteredQueue = useMemo(() => {
    return MOCK_QUEUE_DATA.filter((item) => {
      const matchesSearch = 
        item.tamperTagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.riderId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTownship = townshipFilter === 'all' || item.destinationTownship === townshipFilter;
      
      return matchesSearch && matchesTownship;
    });
  }, [searchQuery, townshipFilter]);

  const handleRegister = (ttId: string) => {
    navigate(ROUTE_PATHS.OFFICE.REGISTRATION.replace(':ttId', ttId));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registration Queue</h1>
          <p className="text-muted-foreground">
            Review and register shipments from provisional rider pickups.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border-none shadow-lg bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="TT ID or Rider ID"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Township</label>
              <Select value={townshipFilter} onValueChange={setTownshipFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Township" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Townships</SelectItem>
                  {MOCK_TOWNSHIPS.map((township) => (
                    <SelectItem key={township} value={township}>
                      {township}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">Queue Summary</div>
              <div className="flex justify-between items-center">
                <span>Total Pending</span>
                <Badge variant="secondary">{MOCK_QUEUE_DATA.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          {filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
              <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
              <p>No shipments matching your criteria.</p>
            </div>
          ) : (
            filteredQueue.map((shipment) => (
              <Card 
                key={shipment.id} 
                className="card-modern hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                onClick={() => handleRegister(shipment.tamperTagId)}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-muted">
                    <img 
                      src={shipment.photos[0]} 
                      alt="Parcel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/60 backdrop-blur-md border-none">
                        {shipment.photos.length} Photos
                      </Badge>
                    </div>
                    {shipment.condition === 'Damaged' && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="destructive" className="animate-pulse">
                          Damaged
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-primary border-primary/30">
                            {shipment.tamperTagId}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{new Date(shipment.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {shipment.type.toUpperCase()} - {shipment.pieces} PCS
                          {shipment.cod.required && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                              COD: ${shipment.cod.amount}
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4 text-primary/60" />
                        <span>Rider: <span className="font-medium text-foreground">{shipment.riderId}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary/60" />
                        <span>Township: <span className="font-medium text-foreground">{shipment.destinationTownship || 'Not Set'}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {shipment.photos.length >= 3 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="text-muted-foreground">Evidence: <span className="font-medium text-foreground">{shipment.photos.length}/3</span></span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        className="gap-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          // View full details modal would go here
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button 
                        className="btn-modern bg-primary gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegister(shipment.tamperTagId);
                        }}
                      >
                        Register Shipment
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationQueue;