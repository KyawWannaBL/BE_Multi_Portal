import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  HelpCircle,
  Ticket,
  Phone,
  Mail,
  Plus,
  Search,
  ChevronRight,
  Send,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI } from '@/services/logistics-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const CustomerSupport: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');

  // Mock Tickets (In production, these would fetch via logisticsAPI or direct Supabase call)
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-2026-001',
      subject: 'Delayed Shipment #AWB123456789',
      status: 'Open',
      priority: 'High',
      createdAt: '2026-02-18 09:30:00',
      lastUpdate: '2026-02-19 10:15:00',
      category: 'Shipping'
    },
    {
      id: 'TKT-2026-002',
      subject: 'Billing Error - Invoice INV-9901',
      status: 'Resolved',
      priority: 'Medium',
      createdAt: '2026-02-15 14:20:00',
      lastUpdate: '2026-02-17 11:00:00',
      category: 'Finance'
    }
  ]);

  const faqs = [
    {
      q: language === 'en' ? "How can I track my parcel?" : "ကျွန်ုပ်၏ပါဆယ်ထုပ်ကို မည်သို့ခြေရာခံနိုင်သနည်း။",
      a: language === 'en' ? "You can track your parcel by entering the AWB number on our home page or the Tracking Map section in your dashboard." : "ကျွန်ုပ်တို့၏ပင်မစာမျက်နှာ သို့မဟုတ် ဒက်ရှ်ဘုတ်ရှိ Tracking Map ကဏ္ဍတွင် AWB နံပါတ်ကို ထည့်သွင်းခြင်းဖြင့် သင်၏ပါဆယ်ထုပ်ကို ခြေရာခံနိုင်ပါသည်။",
      category: 'Tracking'
    },
    {
      q: language === 'en' ? "What is Britium Express's delivery time?" : "Britium Express ၏ ပို့ဆောင်ချိန်က ဘယ်လောက်လဲ။",
      a: language === 'en' ? "Standard delivery takes 1-3 business days within Yangon/Mandalay and 3-7 days for other regions." : "ရန်ကုန်/မန္တလေးအတွင်း ပုံမှန်ပို့ဆောင်မှုသည် ၁-၃ ရက်ကြာပြီး အခြားဒေသများအတွက် ၃-၇ ရက်ကြာပါသည်။",
      category: 'Shipping'
    },
    {
      q: language === 'en' ? "How do I calculate shipping rates?" : "ပို့ဆောင်ခကို ဘယ်လိုတွက်ရမလဲ။",
      a: language === 'en' ? "Use our Shipping Calculator tool in the side menu. Enter origin, destination, and weight for an instant quote." : "ဘေးထွက်မီနူးရှိ Shipping Calculator ကို အသုံးပြုပါ။ ဈေးနှုန်းချက်ချင်းသိရန် မူရင်း၊ ပန်းတိုင်နှင့် အလေးချိန်ကို ထည့်သွင်းပါ။",
      category: 'Billing'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation of API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(language === 'en' ? "Support ticket created successfully!" : "အကူအညီတောင်းခံလွှာကို အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။");
      setActiveTab('tickets');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 space-y-12">
      {/* Hero Header */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative overflow-hidden luxury-card p-12 text-center space-y-6"
      >
        <div className="absolute top-0 left-0 w-full h-1 opacity-50 bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />
        <h1 className="text-4xl lg:text-6xl font-bold font-heading tracking-tighter">
          {language === 'en' ? "How can we help you today?" : "ယနေ့ လူကြီးမင်းကို မည်သို့ကူညီပေးရမလဲ။"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {language === 'en' 
            ? "Britium Express Support is available 24/7 for all your logistics needs, tracking inquiries, and business partnerships." 
            : "Britium Express Support သည် သင်၏ ပို့ဆောင်ရေးလိုအပ်ချက်များ၊ ခြေရာခံခြင်းဆိုင်ရာ မေးမြန်းချက်များနှင့် စီးပွားရေးပူးပေါင်းဆောင်ရွက်မှုများအတွက် ၂၄/၇ ရှိနေပါသည်။"}
        </p>
        
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            className="pl-12 py-6 bg-secondary/50 border-luxury-gold/20 focus:border-luxury-gold transition-all rounded-full"
            placeholder={language === 'en' ? "Search for topics, AWB numbers, or keywords..." : "ခေါင်းစဉ်များ၊ AWB နံပါတ်များ သို့မဟုတ် သော့ချက်စာလုံးများကို ရှာဖွေပါ..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.section>

      <Tabs defaultValue="faq" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-12 bg-secondary/30 p-1 rounded-full border border-white/5">
          <TabsTrigger value="faq" className="rounded-full">FAQ</TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-full">{language === 'en' ? "My Tickets" : "ကျွန်ုပ်၏လွှာများ"}</TabsTrigger>
          <TabsTrigger value="new" className="rounded-full">{language === 'en' ? "New Request" : "အသစ်တောင်းဆိုရန်"}</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-full">{language === 'en' ? "Contact" : "ဆက်သွယ်ရန်"}</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="faq" className="mt-0 focus-visible:outline-none">
            <motion.div 
              variants={staggerContainer} 
              initial="hidden" 
              animate="visible" 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-2xl font-semibold">{language === 'en' ? "Frequently Asked Questions" : "အမေးများသောမေးခွန်းများ"}</h3>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {filteredFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="luxury-card border-none px-6">
                      <AccordionTrigger className="hover:no-underline font-medium text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="space-y-6">
                <Card className="luxury-card border-luxury-gold/20 bg-luxury-gold/5">
                  <CardHeader>
                    <CardTitle className="text-xl">{language === 'en' ? "Can't find an answer?" : "အဖြေမတွေ့ဘူးလား။"}</CardTitle>
                    <CardDescription>
                      {language === 'en' ? "Our support team is ready to assist you personally." : "ကျွန်ုပ်တို့၏ အကူအညီပေးရေးအဖွဲ့မှ လူကြီးမင်းကို ကိုယ်တိုင်ကူညီရန် အဆင်သင့်ရှိပါသည်။"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={() => setActiveTab('new')}
                      className="w-full luxury-button"
                    >
                      {language === 'en' ? "OPEN A TICKET" : "အကူအညီတောင်းခံလွှာဖွင့်ပါ"}
                    </Button>
                  </CardFooter>
                </Card>

                <div className="space-y-4">
                  <h4 className="font-semibold">{language === 'en' ? "Quick Contacts" : "အမြန်ဆက်သွယ်ရန်"}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-luxury-gold">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">+95 9 123 456 789</p>
                        <p className="text-xs text-muted-foreground">24/7 Hotline</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-luxury-gold">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">support@britiumexpress.com</p>
                        <p className="text-xs text-muted-foreground">Email Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-0 focus-visible:outline-none">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">{language === 'en' ? "Your Recent Support Tickets" : "သင်၏ လတ်တလော အကူအညီတောင်းခံလွှာများ"}</h3>
                <Button variant="outline" size="sm" className="rounded-full border-luxury-gold/30 text-luxury-gold">
                  <Clock className="w-4 h-4 mr-2" /> {language === 'en' ? "History" : "မှတ်တမ်း"}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="luxury-card hover:border-luxury-gold/40 transition-all cursor-pointer group">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : 'bg-luxury-gold/10 text-luxury-gold'}`}>
                          <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold group-hover:text-luxury-gold transition-colors">{ticket.subject}</h4>
                            <Badge variant={ticket.status === 'Open' ? 'destructive' : 'secondary'} className="text-[10px] py-0">
                              {ticket.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">ID: {ticket.id} • Category: {ticket.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div className="hidden md:block">
                          <p className="text-xs text-muted-foreground">Last Update</p>
                          <p className="text-sm font-medium">{ticket.lastUpdate}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-luxury-gold transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="new" className="mt-0 focus-visible:outline-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle>{language === 'en' ? "Submit a New Support Request" : "အကူအညီတောင်းခံလွှာအသစ် ပေးပို့ရန်"}</CardTitle>
                  <CardDescription>
                    {language === 'en' 
                      ? "Provide details about your issue and our team will get back to you within 24 hours."
                      : "သင်၏ပြဿနာအသေးစိတ်ကို ဖော်ပြပေးပါ၊ ကျွန်ုပ်တို့အဖွဲ့မှ ၂၄ နာရီအတွင်း ဆက်သွယ်ပါမည်။"}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleNewTicket}>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'en' ? "Full Name" : "အမည်အပြည့်အစုံ"}</label>
                        <Input placeholder={user?.full_name || "Enter your name"} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'en' ? "Email Address" : "အီးမေးလ်လိပ်စာ"}</label>
                        <Input placeholder={user?.email || "Enter your email"} type="email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{language === 'en' ? "Subject" : "ခေါင်းစဉ်"}</label>
                      <Input placeholder={language === 'en' ? "e.g. Parcel Tracking Issue" : "ဥပမာ- ပါဆယ်ခြေရာခံခြင်းဆိုင်ရာပြဿနာ"} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{language === 'en' ? "Category" : "အမျိုးအစား"}</label>
                      <select className="w-full bg-secondary/50 border border-luxury-gold/20 rounded-md p-2 outline-none">
                        <option value="tracking">Tracking & Delivery</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="account">Account & Technical</option>
                        <option value="partnership">Business Partnership</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{language === 'en' ? "Message" : "သတင်းစကား"}</label>
                      <Textarea 
                        className="min-h-[150px] bg-secondary/50"
                        placeholder={language === 'en' ? "Describe your issue in detail..." : "လူကြီးမင်း၏ ပြဿနာကို အသေးစိတ်ဖော်ပြပါ..."} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{language === 'en' ? "Attachments (Optional)" : "နောက်ဆက်တွဲများ (ရွေးချယ်နိုင်သည်)"}</label>
                      <div className="border-2 border-dashed border-luxury-gold/20 rounded-xl p-8 text-center hover:border-luxury-gold/40 transition-colors cursor-pointer">
                        <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">{language === 'en' ? "Click or drag images/PDFs here" : "ပုံများ သို့မဟုတ် PDF များကို ဤနေရာတွင် ဆွဲထည့်ပါ"}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => setActiveTab('faq')}>
                      {language === 'en' ? "Cancel" : "ပယ်ဖျက်မည်"}
                    </Button>
                    <Button type="submit" className="luxury-button" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" /> {language === 'en' ? "SENDING..." : "ပို့နေပါသည်..."}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> {language === 'en' ? "SUBMIT REQUEST" : "တောင်းဆိုချက်ပေးပို့ပါ"}
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="contact" className="mt-0 focus-visible:outline-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold font-heading">{language === 'en' ? "Get in Touch" : "ဆက်သွယ်ရန်" }</h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? "Have a complex inquiry? Visit our flagship offices or reach out via our dedicated channels."
                      : "ရှုပ်ထွေးသော မေးမြန်းမှုများ ရှိပါသလား။ ကျွန်ုပ်တို့၏ ရုံးချုပ်သို့ လာရောက်ပါ သို့မဟုတ် သတ်မှတ်ထားသော ချန်နယ်များမှတစ်ဆင့် ဆက်သွယ်ပါ။"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex gap-4 p-6 luxury-card">
                    <MapPin className="w-6 h-6 text-luxury-gold shrink-0" />
                    <div>
                      <h4 className="font-semibold">{language === 'en' ? "Yangon Headquarters" : "ရန်ကုန်ရုံးချုပ်"}</h4>
                      <p className="text-sm text-muted-foreground">No. 123, Kabar Aye Pagoda Road, Bahan Township, Yangon, Myanmar.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-6 luxury-card">
                    <Phone className="w-6 h-6 text-luxury-gold shrink-0" />
                    <div>
                      <h4 className="font-semibold">{language === 'en' ? "Direct Line" : "တိုက်ရိုက်ဖုန်း"}</h4>
                      <p className="text-sm text-muted-foreground">+95 1 234 5678, +95 9 777 888 999</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-6 luxury-card">
                    <Clock className="w-6 h-6 text-luxury-gold shrink-0" />
                    <div>
                      <h4 className="font-semibold">{language === 'en' ? "Operating Hours" : "ရုံးဖွင့်ချိန်"}</h4>
                      <p className="text-sm text-muted-foreground">Mon - Sat: 9:00 AM - 6:00 PM<br/>Sun: Emergency Support Only</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-full min-h-[400px] luxury-card relative overflow-hidden">
                {/* Placeholder for Interactive Map */}
                <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center flex-col p-12 text-center space-y-4">
                  <MapPin className="w-12 h-12 text-luxury-gold animate-bounce" />
                  <h4 className="text-xl font-semibold">Britium Map Integration</h4>
                  <p className="text-sm text-muted-foreground">Interactive branch locator and live fleet map would render here in production using MapBox/Google Maps API.</p>
                  <Button variant="outline" className="rounded-full border-luxury-gold/40">
                    {language === 'en' ? "Open in Maps" : "မြေပုံတွင်ကြည့်ရန်"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Live Chat Floating Button Mockup */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-luxury-gold text-background rounded-full shadow-2xl flex items-center justify-center z-50 cursor-pointer"
        onClick={() => toast.info("Live Chat connecting...", { description: "Our agents are preparing to assist you." })}
      >
        <MessageSquare className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse" />
      </motion.button>

      {/* Support Status Ticker */}
      <div className="pt-12 border-t border-white/5 flex flex-wrap justify-center gap-8 opacity-60">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>{language === 'en' ? "Systems Operational" : "စနစ်များ ပုံမှန်အလုပ်လုပ်နေပါသည်"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <Clock className="w-4 h-4 text-luxury-gold" />
          <span>{language === 'en' ? "Avg. Response: 14m" : "ပျမ်းမျှတုံ့ပြန်ချိန်- ၁၄ မိနစ်"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span>{language === 'en' ? "Holiday Service: Normal" : "အားလပ်ရက်ဝန်ဆောင်မှု- ပုံမှန်"}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;