import React, { useState } from 'react';
import {
  MessageSquare,
  LifeBuoy,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  Zap,
  BarChart3,
  Smile
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { SHIPMENT_STATUS } from '@/lib/index';
import {
  BUSINESS_ROLES,
  PERMISSIONS_MATRIX,
  CustomerService
} from '@/lib/admin-system';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CustomerServiceDashboard: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');

  // Mock data representing 2026 AI-augmented service metrics
  const serviceMetrics = {
    avgResponseTime: '1m 42s',
    resolvedToday: 142,
    activeChats: 8,
    satisfactionScore: 4.8,
    escalationRate: '2.4%'
  };

  const mockTickets = [
    {
      id: 'TCK-2026-8812',
      subject: 'Delayed Shipment - Electronics',
      customer: 'Sarah Jenkins',
      priority: 'High',
      status: 'Open',
      sentiment: 'Frustrated',
      time: '12m ago',
      assignedTo: 'Me'
    },
    {
      id: 'TCK-2026-8815',
      subject: 'Address Modification Request',
      customer: 'Global Tech Corp',
      priority: 'Medium',
      status: 'Pending',
      sentiment: 'Neutral',
      time: '45m ago',
      assignedTo: 'Unassigned'
    },
    {
      id: 'TCK-2026-8818',
      subject: 'Damaged Parcel Claim',
      customer: 'Mike Ross',
      priority: 'Critical',
      status: 'Escalated',
      sentiment: 'Angry',
      time: '2h ago',
      assignedTo: 'Senior Lead'
    },
    {
      id: 'TCK-2026-8820',
      subject: 'COD Refund Status',
      customer: 'Amanda Lee',
      priority: 'Low',
      status: 'Open',
      sentiment: 'Curious',
      time: '5m ago',
      assignedTo: 'Me'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'High': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'Medium': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Frustrated': return <Smile className="w-4 h-4 text-orange-500 rotate-180" />;
      case 'Angry': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'Neutral': return <Smile className="w-4 h-4 text-muted-foreground" />;
      default: return <Smile className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Service Command Center
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI-Assisted Support Intelligence Dashboard • Feb 11, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <MessageSquare className="w-4 h-4" />
            Go to Live Chat
          </Button>
        </div>
      </header>

      {/* Top Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg. Response Time</p>
                <p className="text-2xl font-bold font-mono">{serviceMetrics.avgResponseTime}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={85} className="h-1" />
              <p className="text-[10px] mt-2 text-primary">Top 5% of industry average</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold font-mono">{serviceMetrics.resolvedToday}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold font-mono">{serviceMetrics.activeChats}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={i} className="border-2 border-background w-6 h-6">
                    <AvatarFallback className="text-[10px]">U{i}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-background">
                  +4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Escalation Rate</p>
                <p className="text-2xl font-bold font-mono">{serviceMetrics.escalationRate}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
               <p className="text-xs text-muted-foreground">Target: &lt; 3.0%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Ticket Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="tickets" className="gap-2">
                  <LifeBuoy className="w-4 h-4" />
                  Tickets
                </TabsTrigger>
                <TabsTrigger value="escalations" className="gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Escalations
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Resolved
                </TabsTrigger>
              </TabsList>
              
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tickets or AWB..." className="pl-10 h-9 bg-muted/30 border-none" />
              </div>
            </div>

            <TabsContent value="tickets" className="m-0">
              <Card className="card-glass border-none shadow-none">
                <Table className="table-modern">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject & Sentiment</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="group cursor-pointer hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-semibold">
                          {ticket.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]">{ticket.subject}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {getSentimentIcon(ticket.sentiment)}
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                AI Sentiment: {ticket.sentiment}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticket.customer}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticket.time}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Side Intelligence Panel */}
        <div className="space-y-6">
          {/* Real-time Performance Card */}
          <Card className="card-modern overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Agent Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">SLA Adherence</span>
                  <span className="font-bold">98.2%</span>
                </div>
                <Progress value={98} className="h-1.5 bg-emerald-500/10">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.2%' }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Daily Resolution Target</span>
                  <span className="font-bold">142/200</span>
                </div>
                <Progress value={71} className="h-1.5 bg-blue-500/10">
                   <div className="h-full bg-blue-500 rounded-full" style={{ width: '71%' }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Knowledge Base Contribution</span>
                  <span className="font-bold">4 High Impact</span>
                </div>
                <Progress value={40} className="h-1.5 bg-orange-500/10">
                   <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%' }} />
                </Progress>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions / Knowledge Base */}
          <Card className="card-modern bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                AI Quick-Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Spike in <span className="text-primary font-medium">Address Modification</span> tickets detected from <span className="text-foreground font-semibold">North District</span>. Likely due to recent mapping updates in the delivery app.
              </p>
              <Button variant="secondary" size="sm" className="w-full text-xs">
                View Suggested FAQ Update
              </Button>
            </CardContent>
          </Card>

          {/* Recent Escalations List */}
          <Card className="card-modern">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Critical Escalations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-start gap-3 border-b border-border/50 last:border-none">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Payment Dispute #X{i}2</p>
                      <p className="text-xs text-muted-foreground">Waiting for Finance Admin approval for 4h</p>
                      <Button variant="link" className="p-0 h-auto text-[10px] text-primary">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;