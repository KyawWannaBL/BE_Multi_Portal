import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileWarning, 
  Printer, 
  ScanFace, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  ChevronRight,
  Eye,
  Lock
} from 'lucide-react';
import { 
  SHIPMENT_STATUS, 
  TAG_STATUS 
} from '@/lib/index';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const AuditDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Security Alerts', value: '12', icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Reprint Requests', value: '45', icon: Printer, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Missing TTs', value: '08', icon: FileWarning, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Compliance Score', value: '98.4%', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
  ];

  const alerts = [
    {
      id: 'AL-1092',
      type: 'FRAUD_SUSPECT',
      severity: 'high',
      message: 'Tamper Tag used out of sequence in Batch-2026-041',
      timestamp: '2026-02-11 14:22:10',
      entityId: 'TT-009281',
      user: 'Rider: J. Doe'
    },
    {
      id: 'AL-1088',
      type: 'GEODEFENCE_VIOLATION',
      severity: 'medium',
      message: 'Warehouse drop-off scan 1.2km outside perimeter',
      timestamp: '2026-02-11 12:15:45',
      entityId: 'AWB-8827110',
      user: 'Rider: K. Smith'
    },
    {
      id: 'AL-1085',
      type: 'EXCESSIVE_REPRINTS',
      severity: 'low',
      message: 'Label printed 4 times for single shipment',
      timestamp: '2026-02-11 10:05:12',
      entityId: 'AWB-9912003',
      user: 'DES: M. Chen'
    }
  ];

  const exceptions = [
    {
      id: 'EXC-221',
      category: 'Condition',
      description: 'Major damage found at WH receiving vs Pickup photo',
      ttId: 'TT-88122',
      status: 'Investigation',
      date: '2026-02-11'
    },
    {
      id: 'EXC-219',
      category: 'TT Missing',
      description: 'Arrived at WH without physical Tamper Tag',
      ttId: 'TT-77192',
      status: 'Supervisor Review',
      date: '2026-02-11'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Security Dashboard</h1>
          <p className="text-muted-foreground">Real-time oversight of operations and fraud detection metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="btn-modern">
            <FileWarning className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="btn-modern bg-primary">
            <ScanFace className="mr-2 h-4 w-4" />
            Run Manual Audit
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="card-modern overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 card-modern">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>Suspicious activity flagged by system logic</CardDescription>
              </div>
              <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20">
                <AlertTriangle className="mr-1 h-3 w-3" /> 
                {alerts.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className={`mt-1 p-2 rounded-lg ${alert.severity === 'high' ? 'bg-destructive/10 text-destructive' : alert.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{alert.type}</span>
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] font-mono">{alert.entityId}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium">User:</span> {alert.user}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary text-sm font-medium">
              View All Security Alerts
            </Button>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Operational Health</CardTitle>
            <CardDescription>Live station & route metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TT Registration Lag</span>
                <span className="font-medium">12 min avg</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success w-[85%]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Label Activation Rate</span>
                <span className="font-medium">99.2%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[99%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">WH Scan Accuracy</span>
                <span className="font-medium">94.5%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[94%]" />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-3">Station Load</h4>
              <div className="space-y-3">
                {['North Hub', 'Central WH', 'East Substation'].map((station) => (
                  <div key={station} className="flex items-center justify-between">
                    <span className="text-xs">{station}</span>
                    <Badge variant="secondary" className="text-[10px]">OPTIMAL</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-modern">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Exception Logs</CardTitle>
              <CardDescription>Discrepancies found during node reconciliation</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search logs..." 
                  className="pl-9 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px] bg-muted/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="missing">Missing TT</SelectItem>
                  <SelectItem value="shortage">Shortage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tamper Tag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.map((exc) => (
                <TableRow key={exc.id}>
                  <TableCell className="font-mono font-medium text-xs">{exc.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/50">{exc.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {exc.description}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{exc.ttId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                      <span className="text-xs">{exc.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{exc.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive">
                      <Lock className="h-4 w-4 mr-1" /> Block
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Showing 2 of 12 active exceptions</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-modern border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Fraud Score Summary</h4>
              <p className="text-sm text-muted-foreground">
                Overall risk index is <span className="text-success font-semibold">LOW (1.2)</span> based on current cycle analysis.
              </p>
            </div>
            <Button variant="link" className="ml-auto text-primary">Detailed Analytics</Button>
          </CardContent>
        </Card>

        <Card className="card-modern border-warning/20 bg-warning/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning text-warning-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">SLA Compliance Watch</h4>
              <p className="text-sm text-muted-foreground">
                Substation reconciliation lagging in <span className="text-destructive font-semibold">3 nodes</span>.
              </p>
            </div>
            <Button variant="link" className="ml-auto text-warning">Investigate</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditDashboard;