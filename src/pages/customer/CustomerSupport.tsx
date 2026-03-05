import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Ticket,
  Package as ShipmentIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  Plus,
  Star,
  ThumbsUp,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  useToast 
} from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  lastUpdate: string;
  priority: 'Low' | 'Medium' | 'High';
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TK-8821',
    subject: 'Delayed shipment from North District',
    category: 'Logistics',
    status: 'In Progress',
    lastUpdate: '2026-02-11 14:20',
    priority: 'High',
  },
  {
    id: 'TK-8744',
    subject: 'Address update for AWB-99021',
    category: 'Shipment Modification',
    status: 'Resolved',
    lastUpdate: '2026-02-10 09:15',
    priority: 'Medium',
  },
];

const FAQ_ITEMS = [
  {
    question: "How do I track my shipment in real-time?",
    answer: "You can use our Live Tracking feature in the Customer Portal. Simply enter your AWB number to see the current GPS location of the courier."
  },
  {
    question: "What happens if I miss a delivery?",
    answer: "Our courier will attempt 3 deliveries. After the first miss, you can reschedule the time via the app or contact support to hold it at a substation."
  },
  {
    question: "How is COD handled?",
    answer: "Cash on Delivery payments are verified via OTP. Please ensure you have the exact amount ready to speed up the process."
  }
];

export default function CustomerSupport() {
  const { user, legacyUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isSurveyVisible, setIsSurveyVisible] = useState(false);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    toast({
      title: "Message Sent",
      description: "A support agent will be with you shortly.",
    });
    setChatMessage('');
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {legacyUser?.name}. How can we assist your logistics needs today?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="btn-modern">
            <Phone className="w-4 h-4 mr-2 text-primary" />
            Call Support
          </Button>
          <Button className="btn-modern bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </motion.div>

      {/* Search Bar - Advanced Interface */}
      <motion.div 
        variants={fadeInUp}
        className="relative max-w-2xl mx-auto"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input 
          placeholder="Search for AWB numbers, help topics, or active tickets..."
          className="pl-12 h-14 bg-card-modern border-border/50 shadow-lg rounded-2xl text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Main Support Grid - Bento Box Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Actions & FAQs */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            variants={fadeInUp}
            className="card-modern p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Assistance</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
                <ShipmentIcon className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Track Package</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors group">
                <AlertCircle className="w-8 h-8 text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Report Issue</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors group">
                <HelpCircle className="w-8 h-8 text-secondary-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Help Guides</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors group">
                <Clock className="w-8 h-8 text-destructive mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Reschedule</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="card-modern p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Knowledge Base</h3>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button variant="link" className="w-full mt-4 text-primary">
              View all 200+ articles <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>

        {/* Center Column: Ticket Management */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="card-modern overflow-hidden border-none">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Tickets</CardTitle>
                  <CardDescription>Recent support requests and updates</CardDescription>
                </div>
                <Badge variant="outline">{MOCK_TICKETS.length} Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border/50">
                  {MOCK_TICKETS.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                        <Badge 
                          variant={ticket.status === 'Resolved' ? 'default' : 'secondary'} 
                          className="rounded-full"
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors mb-1">
                        {ticket.subject}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {ticket.lastUpdate}
                        </span>
                        <span className="flex items-center">
                          <Ticket className="w-3 h-3 mr-1" /> {ticket.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="bg-muted/10 p-4 border-t border-border/50">
              <Button variant="ghost" className="w-full">Load Older Tickets</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Chat Preview */}
        <div className="lg:col-span-3">
          <Card className="card-modern h-full flex flex-col border-none">
            <CardHeader className="bg-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    AI
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full" />
                </div>
                <div>
                  <CardTitle className="text-sm">Logistics Assistant</CardTitle>
                  <CardDescription className="text-white/70 text-xs">Always online</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 bg-muted/5">
              <div className="space-y-4">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="p-3 rounded-2xl rounded-tl-none bg-card shadow-sm text-sm">
                    Hi {legacyUser?.name}! I can help you track orders or answer shipping questions. What's on your mind?
                  </div>
                </div>
                {/* Empty space for interaction */}
                <div className="h-40 flex items-center justify-center opacity-20">
                  <MessageSquare className="w-12 h-12" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-border/50">
              <div className="relative w-full">
                <Input 
                  placeholder="Type a message..."
                  className="pr-12"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  size="icon" 
                  className="absolute right-1 top-1 w-8 h-8 rounded-lg"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Satisfaction Survey Section */}
      <AnimatePresence>
        {!isSurveyVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-40"
          >
            <Button 
              onClick={() => setIsSurveyVisible(true)}
              className="rounded-full h-14 px-6 shadow-2xl bg-accent text-accent-foreground hover:scale-105"
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Rate Our Service
            </Button>
          </motion.div>
        )}

        {isSurveyVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="fixed bottom-8 right-8 w-80 z-50"
          >
            <Card className="card-modern shadow-2xl border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">How was your experience?</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setIsSurveyVisible(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className="w-6 h-6 cursor-pointer text-muted-foreground hover:text-yellow-400 transition-colors"
                    />
                  ))}
                </div>
                <Textarea 
                  placeholder="Tell us more... (optional)"
                  className="text-xs h-20 resize-none"
                />
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Feedback Received",
                      description: "Thank you for helping us improve!",
                    });
                    setIsSurveyVisible(false);
                  }}
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Info Footer */}
      <motion.div 
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-border/50"
      >
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24/7 Hotline</p>
            <p className="font-bold">+1 (800) LOGI-2026</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email Support</p>
            <p className="font-bold">support@nextlogistics.ai</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">System Status</p>
            <p className="font-bold text-green-500">All Services Operational</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
