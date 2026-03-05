import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Activity,
  FileSearch,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  Search,
  User,
  Clock,
  LayoutDashboard,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI } from '@/services/logistics-api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const SupervisorAudit: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setIsLoading(true);
        const { data } = await logisticsAPI.getAuditLogs({
          limit: 50,
          resource_type: filterAction === 'all' ? undefined : filterAction
        });
        if (data) {
          setAuditLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditData();
  }, [filterAction]);

  const stats = [
    {
      title: 'Compliance Rate',
      value: '98.4%',
      change: '+2.1%',
      icon: ShieldCheck,
      color: 'text-luxury-gold',
    },
    {
      title: 'System Health',
      value: 'Optimal',
      change: '100% Uptime',
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'Active Audits',
      value: '12',
      change: '4 Pending',
      icon: FileSearch,
      color: 'text-blue-500',
    },
    {
      title: 'Security Alerts',
      value: '0',
      change: 'Last 24h',
      icon: ShieldAlert,
      color: 'text-destructive',
    },
  ];

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Supervisor Audit System
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time compliance monitoring and operational oversight for 2026 Q1.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="luxury-card border-border hover:bg-accent">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="luxury-button">
            Generate Audit
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={staggerItem}>
            <Card className="luxury-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-background/50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Tabs System */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="luxury-glass p-1 h-12 inline-flex items-center justify-start bg-card/30 border border-white/5">
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-6">
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-6">
            Compliance Checks
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-6">
            Performance Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <Card className="luxury-card">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Activity Trail</CardTitle>
                  <CardDescription>Comprehensive log of all system interactions and data mutations.</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search actions or users..."
                      className="pl-10 w-[250px] bg-background/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[180px] bg-background/50">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Resource Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="shipment">Shipments</SelectItem>
                      <SelectItem value="finance">Financials</SelectItem>
                      <SelectItem value="user">User Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden bg-background/20">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[150px]">Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6} className="h-12 text-center animate-pulse bg-muted/10" />
                        </TableRow>
                      ))
                    ) : filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-accent/5 transition-colors">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {log.user?.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{log.user?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{log.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase text-[10px] tracking-widest">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{log.resource_type}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                              <span className="text-xs font-semibold">Success</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-luxury-gold hover:text-luxury-gold/80">
                              View Trace
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No audit logs found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="luxury-card col-span-2">
              <CardHeader>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>Verification status for regulatory and safety standards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { task: 'Bi-annual Vehicle Inspection', status: 'Completed', date: '2026-02-15' },
                  { task: 'Rider Background Verification', status: 'In Progress', date: '2026-02-18' },
                  { task: 'Data Privacy Compliance Audit', status: 'Completed', date: '2026-01-20' },
                  { task: 'Hazardous Materials Training', status: 'Pending', date: '2026-03-01' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30 hover:bg-background/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${item.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {item.status === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.task}</p>
                        <p className="text-xs text-muted-foreground">Next review: {item.date}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className={item.status === 'Completed' ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : ''}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Risk Overview</CardTitle>
                <CardDescription>AI-driven risk scoring based on recent anomalies.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-10">
                <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-primary/20">
                  <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin-slow" />
                  <div className="text-center">
                    <span className="text-4xl font-bold">12</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Risk Score</p>
                  </div>
                </div>
                <div className="mt-8 space-y-2 w-full">
                  <div className="flex justify-between text-sm">
                    <span>Safety Protocols</span>
                    <span className="text-green-500">94%</span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[94%]" />
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span>Data Integrity</span>
                    <span className="text-luxury-gold">88%</span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-luxury-gold w-[88%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle>Regional Performance Metrics</CardTitle>
              <CardDescription>Comparative analysis of substation and rider efficiency.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Advanced performance charts are loading from the Britium Analytics Engine...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-2 py-6 border-t border-border/50 opacity-50">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.2em] font-medium">
          Secure Audit Environment • Session Active • © 2026 Britium Express
        </span>
      </div>
    </div>
  );
};

export default SupervisorAudit;