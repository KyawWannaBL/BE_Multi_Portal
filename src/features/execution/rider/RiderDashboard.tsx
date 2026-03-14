// ... (imports remain the same)

export default function RiderDashboard() {
  const { language } = useLanguage();
  const [activeTask, setActiveTask] = useState<DeliveryTask | null>(MOCK_DELIVERIES[0]);
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>(MOCK_DELIVERIES);
  const [isOnline, setIsOnline] = useState(true);
  
  // Refined POD State
  const [podStep, setPodStep] = useState<'none' | 'scan' | 'signature' | 'photo' | 'complete'>('none');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);

  // Helper to reset POD
  const resetPOD = () => {
    setPodStep('none');
    setSignatureData(null);
    setPhotoData(null);
  };

  const handleSelectTask = (task: DeliveryTask) => {
    setActiveTask(task);
    resetPOD(); // Ensure clean slate for new task
  };

  const handleCompleteDelivery = () => {
    if (activeTask) {
      setDeliveries(prev => prev.filter(t => t.id !== activeTask.id));
      setActiveTask(null);
      resetPOD();
      toast.success('Delivery marked as complete!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ... Header & Performance cards (No changes needed) ... */}

      <main className="container max-w-lg mx-auto p-4 space-y-6">
        {/* Active Task Card */}
        {activeTask && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             {/* ... Card Content ... */}
             <Button 
                className="w-full h-12 rounded-xl luxury-button flex items-center gap-2"
                onClick={() => setPodStep('scan')}
              >
                <Scan className="w-4 h-4" /> Start Delivery
              </Button>
          </motion.div>
        )}

        {/* Task List */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsContent value="pending" className="mt-4 space-y-3">
            {deliveries.map((task) => (
              <motion.div 
                key={task.id} 
                onClick={() => handleSelectTask(task)} // Updated handler
                className={`p-4 luxury-card cursor-pointer border-l-4 transition-all ${
                  activeTask?.id === task.id ? 'border-l-primary bg-primary/5 shadow-md' : 'border-l-transparent'
                }`}
              >
                {/* ... Task Row Content ... */}
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Proof of Delivery Workflow Dialog */}
      <Dialog 
        open={podStep !== 'none'} 
        onOpenChange={(open) => {
          if (!open) resetPOD(); // Cleanup on close
        }}
      >
        <DialogContent className="max-w-md bg-background border-primary/20 rounded-[2rem] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold">
              {podStep === 'scan' && 'Scan Package'}
              {podStep === 'signature' && 'Customer Signature'}
              {podStep === 'photo' && 'Proof of Delivery'}
              {podStep === 'complete' && 'Summary'}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-8">
            {podStep === 'scan' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">Verify the parcel barcode.</p>
                <div className="rounded-2xl overflow-hidden aspect-square border-2 border-primary/20 bg-black">
                  <QRScanner onScan={(data) => { 
                    if(data) {
                      toast.success(`Package Verified`);
                      setPodStep('signature');
                    }
                  }} />
                </div>
                <Button variant="ghost" className="w-full text-xs" onClick={() => setPodStep('signature')}>
                  Manual Verification (Skip)
                </Button>
              </div>
            )}

            {podStep === 'signature' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">Sign to confirm receipt.</p>
                <div className="bg-muted/30 rounded-2xl h-60 border border-dashed border-primary/40 overflow-hidden">
                  <SignaturePad onSave={(data) => { 
                    setSignatureData(data);
                    setPodStep('photo');
                  }} />
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setPodStep('scan')}>Back</Button>
              </div>
            )}

            {podStep === 'photo' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">Photo of parcel at doorstep.</p>
                <div className="rounded-2xl overflow-hidden border-2 border-primary/20">
                  <PhotoCapture 
                    onCapture={(data) => {
                      setPhotoData(data);
                      setPodStep('complete');
                    }}
                  />
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setPodStep('signature')}>Back</Button>
              </div>
            )}

            {podStep === 'complete' && (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ready to Submit</h3>
                  <p className="text-sm text-muted-foreground">All proof captured successfully.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-left bg-secondary/20 p-4 rounded-2xl">
                   <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">Items</span>
                    <span className="text-sm font-bold">1 Parcel</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">COD</span>
                    <span className="text-sm font-bold text-emerald-500">{formatCurrency(activeTask?.codAmount || 0)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="w-full luxury-button py-6 text-lg" onClick={handleCompleteDelivery}>
                    Finish & Submit
                  </Button>
                  <Button variant="ghost" onClick={() => setPodStep('photo')}>Recapture Photo</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}