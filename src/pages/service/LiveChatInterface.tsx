import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Monitor,
  User,
  Package,
  Clock,
  ShieldCheck,
  Search,
  MoreVertical,
  Phone,
  Video,
  Circle,
  FileText,
  Image as ImageIcon,
  X,
  ChevronRight,
  MessageSquare,
  Star
} from 'lucide-react';
import { ROUTE_PATHS, SHIPMENT_STATUS } from '@/lib/index';
import { ROUTE_PATHS_ADMIN } from '@/lib/admin-system';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
  attachment?: { name: string; size: string; type: string };
  isStaff: boolean;
}

interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: 'online' | 'away' | 'offline';
  shipmentId?: string;
  priority: 'High' | 'Medium' | 'Low';
}

const MOCK_CHATS: ChatSession[] = [
  {
    id: 'chat_1',
    customerId: 'cust_101',
    customerName: 'Alex Thompson',
    lastMessage: 'Where is my package? It was supposed to arrive today.',
    timestamp: '17:05',
    unreadCount: 2,
    status: 'online',
    shipmentId: 'AWB-2026-X991',
    priority: 'High',
  },
  {
    id: 'chat_2',
    customerId: 'cust_102',
    customerName: 'Sarah Jenkins',
    lastMessage: 'The delivery rider was very professional. Thank you!',
    timestamp: '16:45',
    unreadCount: 0,
    status: 'away',
    shipmentId: 'AWB-2026-M442',
    priority: 'Low',
  },
  {
    id: 'chat_3',
    customerId: 'cust_103',
    customerName: 'Marcus Chen',
    lastMessage: 'Can I change my delivery address to the office?',
    timestamp: '16:12',
    unreadCount: 0,
    status: 'online',
    shipmentId: 'AWB-2026-K110',
    priority: 'Medium',
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    senderId: 'cust_101',
    senderName: 'Alex Thompson',
    text: 'Hello, I need help with my shipment AWB-2026-X991.',
    timestamp: '2026-02-11T17:00:00Z',
    type: 'text',
    isStaff: false,
  },
  {
    id: 'msg_2',
    senderId: 'agent_01',
    senderName: 'Support Agent',
    text: 'Hello Alex! I can certainly help you with that. Let me pull up the details.',
    timestamp: '2026-02-11T17:01:30Z',
    type: 'text',
    isStaff: true,
  },
  {
    id: 'msg_3',
    senderId: 'cust_101',
    senderName: 'Alex Thompson',
    text: 'It says "In Transit" but it has been stuck in the Hub for 2 days.',
    timestamp: '2026-02-11T17:03:10Z',
    type: 'text',
    isStaff: false,
  },
];

export default function LiveChatInterface() {
  const { user, legacyUser } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatSession | null>(MOCK_CHATS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: legacyUser?.id || 'agent_01',
      senderName: legacyUser?.name || 'Support Agent',
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      isStaff: true,
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    if (!isScreenSharing) {
      const systemMsg: Message = {
        id: `sys_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: 'Agent started a screen sharing session.',
        timestamp: new Date().toISOString(),
        type: 'system',
        isStaff: true,
      };
      setMessages([...messages, systemMsg]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Left Sidebar: Active Chats */}
      <div className="w-80 border-r border-border flex flex-col bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Active Chats
            </h2>
            <Badge variant="secondary">{MOCK_CHATS.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-9 bg-background/50" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-border/50">
            {MOCK_CHATS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-4 flex gap-3 text-left transition-colors hover:bg-accent/50 ${
                  activeChat?.id === chat.id ? 'bg-accent border-l-4 border-primary' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.customerAvatar} />
                    <AvatarFallback>{chat.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                    chat.status === 'online' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold truncate">{chat.customerName}</span>
                    <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={chat.priority === 'High' ? 'destructive' : 'secondary'} className="text-[10px] h-4">
                      {chat.priority}
                    </Badge>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{activeChat.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm">{activeChat.customerName}</h3>
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Customer ID: {activeChat.customerId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice Call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Video Call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isScreenSharing ? "destructive" : "ghost"} 
                        size="icon" 
                        onClick={toggleScreenShare}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </header>

            {/* Messages Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'system' ? (
                      <div className="w-full flex justify-center">
                        <span className="bg-muted text-muted-foreground text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-border/50">
                          {msg.text}
                        </span>
                      </div>
                    ) : (
                      <div className={`max-w-[70%] flex flex-col ${msg.isStaff ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          {!msg.isStaff && <span className="text-[10px] font-bold text-muted-foreground">{msg.senderName}</span>}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.isStaff && <ShieldCheck className="w-3 h-3 text-primary" />}
                        </div>
                        <div className={`p-3 rounded-2xl shadow-sm ${
                          msg.isStaff 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-card border border-border/50 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-md">
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </div>
                <Input 
                  placeholder="Type your message..." 
                  className="flex-1 h-11 bg-background/50 border-border/50 focus:ring-primary/20"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="icon" className="h-11 w-11 rounded-full shadow-lg shadow-primary/20" onClick={handleSendMessage}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-lg">Select a chat to start assisting</p>
          </div>
        )}

        {/* Screen Share Overlay Indicator */}
        <AnimatePresence>
          {isScreenSharing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-md border border-white/20 z-50"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">Live Screen Share Active</span>
              <Button variant="secondary" size="sm" className="h-7 text-xs bg-white text-destructive hover:bg-white/90" onClick={toggleScreenShare}>
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar: Customer Context */}
      <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8">
            {/* Customer Profile */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto border-4 border-background shadow-xl mb-4">
                <AvatarFallback className="text-2xl font-bold">{activeChat?.customerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h4 className="font-bold text-lg">{activeChat?.customerName}</h4>
              <p className="text-sm text-muted-foreground">Premium Member Since 2024</p>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs py-5 flex flex-col gap-1">
                <Package className="w-4 h-4" />
                Re-route
              </Button>
              <Button variant="outline" size="sm" className="text-xs py-5 flex flex-col gap-1">
                <Clock className="w-4 h-4" />
                Schedule
              </Button>
            </div>

            {/* Active Shipment */}
            <Card className="border-border/50 bg-background/30 shadow-none">
              <CardHeader className="p-4">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  Current Shipment
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                    Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{activeChat?.shipmentId || 'N/A'}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="w-4 h-4" /></Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-0.5 h-6 bg-border" />
                      <div className="w-2 h-2 rounded-full bg-muted" />
                    </div>
                    <div className="space-y-3">
                      <div className="-mt-1">
                        <p className="text-xs font-bold">In Transit</p>
                        <p className="text-[10px] text-muted-foreground">Central Distribution Hub</p>
                      </div>
                      <div className="pt-1">
                        <p className="text-xs font-bold text-muted-foreground">Destination</p>
                        <p className="text-[10px] text-muted-foreground">North District Office</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/30" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-primary">{SHIPMENT_STATUS.WAREHOUSE_RECEIVED_VERIFIED}</span>
                </div>
              </CardContent>
            </Card>

            {/* History Tags */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interaction Tags</h5>
              <div className="flex flex-wrap gap-2">
                {['Delivery Delay', 'Refund Req', 'Address Correction', 'COD Issue'].map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] bg-muted/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Escalation */}
            <Button variant="destructive" className="w-full text-xs font-bold uppercase tracking-widest">
              Escalate to Supervisor
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
