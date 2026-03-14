import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  UserPlus,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  ROUTE_PATHS, 
  TAG_STATUS, 
  TagStatus,
  USER_ROLES
} from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { useTamperTags } from '@/hooks/useTamperTags';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import StatusBadge from '@/components/StatusBadge';

const TagInventoryManagement: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const { tags, issueBatch, markLost, voidTag } = useTamperTags();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [issueData, setIssueData] = useState({
    riderId: '',
    fromId: 100001,
    toId: 100200,
  });
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  // Mock Riders List
  const mockRiders = [
    { id: 'usr_rdr_001', name: 'John Doe', batch: 'BATCH-2026-001' },
    { id: 'usr_rdr_002', name: 'Sarah Smith', batch: 'None' },
    { id: 'usr_rdr_003', name: 'Mike Johnson', batch: 'BATCH-2026-005' },
  ];

  const handleIssueBatch = () => {
    if (!issueData.riderId) {
      toast({ title: "Error", description: "Please select a rider", variant: "destructive" });
      return;
    }
    
    const batchId = issueBatch(issueData.riderId, issueData.fromId, issueData.toId);
    toast({
      title: "Batch Issued Successfully",
      description: `Batch ${batchId} issued to rider ${issueData.riderId}.`,
    });
    setIsIssueDialogOpen(false);
  };

  const filteredTags = tags.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.issuedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const voidRequests = tags.filter(t => t.status === TAG_STATUS.VOID && !t.voidReason?.includes('APPROVED'));

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tag Inventory Control</h1>
          <p className="text-muted-foreground">Manage sequential tamper tags, issue batches, and audit usage.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-modern">
                <Plus className="mr-2 h-4 w-4" />
                Issue New Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Issue Tamper Tag Batch</DialogTitle>
                <DialogDescription>
                  Assign a sequential range of tags to a specific rider.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rider">Assign to Rider</Label>
                  <Select 
                    onValueChange={(val) => setIssueData(prev => ({ ...prev, riderId: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRiders.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} ({r.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="from">Start ID (Numeric)</Label>
                    <Input 
                      id="from" 
                      type="number" 
                      value={issueData.fromId} 
                      onChange={(e) => setIssueData(prev => ({ ...prev, fromId: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="to">End ID (Numeric)</Label>
                    <Input 
                      id="to" 
                      type="number" 
                      value={issueData.toId} 
                      onChange={(e) => setIssueData(prev => ({ ...prev, toId: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-xs">
                  <p className="font-medium mb-1">Batch Preview:</p>
                  <p>Count: {issueData.toId - issueData.fromId + 1} tags</p>
                  <p>Range: TT-{issueData.fromId.toString().padStart(6, '0')} to TT-{issueData.toId.toString().padStart(6, '0')}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleIssueBatch}>Confirm Issuance</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-modern">
          <CardHeader className="pb-2">
            <CardDescription>Total Tags Issued</CardDescription>
            <CardTitle className="text-2xl">{tags.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="card-modern">
          <CardHeader className="pb-2">
            <CardDescription>Pending Voids</CardDescription>
            <CardTitle className="text-2xl text-destructive">{voidRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="card-modern">
          <CardHeader className="pb-2">
            <CardDescription>Active Batches</CardDescription>
            <CardTitle className="text-2xl">{Array.from(new Set(tags.map(t => t.batchId))).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="card-modern">
          <CardHeader className="pb-2">
            <CardDescription>Reported Lost</CardDescription>
            <CardTitle className="text-2xl text-warning">{tags.filter(t => t.status === TAG_STATUS.LOST_SUSPECT).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="approvals">Void Approvals</TabsTrigger>
          <TabsTrigger value="lost">Lost Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Tag Registry</CardTitle>
                  <CardDescription>Live tracking of all issued tamper-evident stickers.</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Tag ID or Rider..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="table-modern">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-mono font-medium">{tag.id}</TableCell>
                        <TableCell>
                          <StatusBadge status={tag.status} />
                        </TableCell>
                        <TableCell>{tag.issuedTo}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{tag.batchId}</TableCell>
                        <TableCell className="text-xs">{new Date(tag.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <History className="h-4 w-4 mr-2" />
                            Logs
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No tags found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card className="card-modern border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Pending Void Approvals
              </CardTitle>
              <CardDescription>Review and approve requests from riders to void damaged or unusable tags.</CardDescription>
            </CardHeader>
            <CardContent>
              {voidRequests.length > 0 ? (
                <div className="grid gap-4">
                  {voidRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          {req.voidPhoto ? (
                            <img src={req.voidPhoto} alt="Void Evidence" className="h-full w-full object-cover rounded" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-bold">{req.id}</p>
                          <p className="text-sm text-muted-foreground">Reason: {req.voidReason || 'Not specified'}</p>
                          <p className="text-xs text-muted-foreground">Requested by: {req.issuedTo}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => voidTag(req.id, 'DENIED_BY_SUPERVISOR')}>
                          Reject
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => voidTag(req.id, `APPROVED_VOID: ${req.voidReason}`)}>
                          Approve Void
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No pending void requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lost" className="mt-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Block Lost/Stolen Tags</CardTitle>
              <CardDescription>Immediately block ranges of tags reported as lost to prevent fraudulent use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rider Responsible</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRiders.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tag ID / Range</Label>
                  <Input placeholder="e.g. TT-000100 to TT-000120" />
                </div>
              </div>
              <Button variant="destructive" className="w-full md:w-auto">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Mark as LOST/SUSPECT
              </Button>

              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-4">Recently Blocked Tags</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag ID</TableHead>
                      <TableHead>Responsible</TableHead>
                      <TableHead>Blocked Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.filter(t => t.status === TAG_STATUS.LOST_SUSPECT).map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono">{t.id}</TableCell>
                        <TableCell>{t.issuedTo}</TableCell>
                        <TableCell className="text-xs">{new Date(t.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="animate-pulse">BLOCKED</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TagInventoryManagement;