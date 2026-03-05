import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Camera, 
  AlertTriangle, 
  History,
  PackageCheck,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTamperTags } from '@/hooks/useTamperTags';
import { TAG_STATUS, TagStatus } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

const TagBatchManagement: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const { 
    tags, 
    activeBatchId, 
    getRiderTags, 
    voidTag, 
    getReconciliation 
  } = useTamperTags();

  const [isVoiding, setIsVoiding] = useState(false);
  const [voidTagId, setVoidTagId] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [physicalCount, setPhysicalCount] = useState<number | ''>('');
  const [isReconciling, setIsReconciling] = useState(false);

  const riderTags = useMemo(() => {
    if (!user) return [];
    return getRiderTags(legacyUser?.id);
  }, [user, getRiderTags]);

  const activeBatch = useMemo(() => {
    return riderTags.filter(t => t.batchId === legacyUser?.batchId || t.batchId === activeBatchId);
  }, [riderTags, legacyUser?.batchId, activeBatchId]);

  const stats = useMemo(() => {
    const issued = activeBatch.length;
    const used = activeBatch.filter(t => t.status === TAG_STATUS.USED).length;
    const voided = activeBatch.filter(t => t.status === TAG_STATUS.VOID).length;
    const remaining = issued - used - voided;
    const progress = issued > 0 ? (used / issued) * 100 : 0;

    return { issued, used, voided, remaining, progress };
  }, [activeBatch]);

  const handleVoidSubmit = () => {
    if (!voidTagId || !voidReason) {
      toast({
        title: "Error",
        description: "Please provide both Tag ID and a reason.",
        variant: "destructive"
      });
      return;
    }

    voidTag(voidTagId, voidReason);
    toast({
      title: "Tag Voided",
      description: `Tag ${voidTagId} has been marked as VOID.`
    });
    setVoidTagId('');
    setVoidReason('');
    setIsVoiding(false);
  };

  const handleReconcile = () => {
    if (physicalCount === '') return;

    const recon = getReconciliation(legacyUser?.id || '', Number(physicalCount));
    
    if (recon.mismatch) {
      toast({
        title: "Discrepancy Detected",
        description: "Your physical count does not match the system. An incident report will be created.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reconciliation Complete",
        description: "All tags accounted for. Shift data synced successfully.",
      });
    }
    setIsReconciling(false);
  };

  const getStatusColor = (status: TagStatus) => {
    switch (status) {
      case TAG_STATUS.USED: return "bg-primary/10 text-primary border-primary/20";
      case TAG_STATUS.VOID: return "bg-destructive/10 text-destructive border-destructive/20";
      case TAG_STATUS.ISSUED_TO_RIDER: return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
        <p className="text-muted-foreground">Manage your tamper-evident security tags and daily reconciliation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-modern border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{legacyUser?.batchId || 'NO ACTIVE BATCH'}</div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <PackageCheck className="w-3 h-3 mr-1" />
              {stats.issued} Tags Issued
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.remaining}</div>
            <div className="mt-1">
              <Progress value={stats.progress} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Used Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.used}</div>
            <div className="flex items-center mt-1 text-xs text-destructive">
              <XCircle className="w-3 h-3 mr-1" />
              {stats.voided} Voided
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Quick Actions
            </CardTitle>
            <CardDescription>Report damaged tags or end your shift.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isVoiding} onOpenChange={setIsVoiding}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/5">
                  <XCircle className="w-4 h-4 mr-2" />
                  Void a Damaged Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Void Tamper Tag</DialogTitle>
                  <DialogDescription>
                    Use this if a tag is torn, adhesive failed, or print is unreadable.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tag ID (Scan or Type)</Label>
                    <Input 
                      placeholder="TT-000000"
                      value={voidTagId}
                      onChange={(e) => setVoidTagId(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Void</Label>
                    <Select onValueChange={setVoidReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TAG_TORN">Tag Torn</SelectItem>
                        <SelectItem value="PRINT_FADED">Print Faded/Unreadable</SelectItem>
                        <SelectItem value="ADHESIVE_FAILURE">Adhesive Failure</SelectItem>
                        <SelectItem value="MISPLACED_ATTACHMENT">Misplaced Attachment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Take Photo of Damaged Tag</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsVoiding(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleVoidSubmit}>Confirm Void</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isReconciling} onOpenChange={setIsReconciling}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  End-of-Day Reconcile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Batch Reconciliation</DialogTitle>
                  <DialogDescription>
                    Confirm your physical tag count matches the system records.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Records (Remaining):</span>
                      <span className="font-bold">{stats.remaining} Tags</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Used Records:</span>
                      <span>{stats.used} Tags</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Enter Physical Count Remaining</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={physicalCount}
                      onChange={(e) => setPhysicalCount(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  {physicalCount !== '' && Number(physicalCount) !== stats.remaining && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <p>Mismatch detected. You will be required to provide a reason for the discrepancy before submitting.</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsReconciling(false)}>Back</Button>
                  <Button onClick={handleReconcile}>Submit Reconciliation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Batch History
            </CardTitle>
            <CardDescription>Recent tags from your active batch.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto px-6">
              <div className="space-y-3 pb-4">
                {activeBatch.slice(0, 10).map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-medium">{tag.id}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(tag.issueDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(tag.status)}`}>
                      {tag.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
                {activeBatch.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No tags found in active batch.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-3">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View Full History
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex gap-4 md:hidden">
        <Button className="flex-1 btn-modern" size="lg">
          <PackageCheck className="w-5 h-5 mr-2" />
          Pickup
        </Button>
      </div>
    </div>
  );
};

export default TagBatchManagement;