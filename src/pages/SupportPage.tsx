import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Package, 
  Ban, 
  FileText, 
  Phone, 
  Mail,
  CheckCircle,
  AlertTriangle,
  Calculator,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IMAGES } from '@/assets/images';
import { useLanguageContext } from '@/lib/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

interface ProhibitedItem {
  id: string;
  item_name: string;
  description: string;
  icon: string;
  category: string;
}

interface ContentPage {
  id: string;
  page_key: string;
  title: string;
  content: string;
  meta_description: string;
}

export default function SupportPage() {
  const { t } = useLanguageContext();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prohibitedItems, setProhibitedItems] = useState<ProhibitedItem[]>([]);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const [faqsResult, prohibitedResult, contentResult] = await Promise.all([
        supabase
          .from('faqs_2026_02_03_21_00')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('prohibited_items_2026_02_03_21_00')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('content_pages_2026_02_03_21_00')
          .select('*')
          .eq('is_active', true)
      ]);

      if (faqsResult.error) throw faqsResult.error;
      if (prohibitedResult.error) throw prohibitedResult.error;
      if (contentResult.error) throw contentResult.error;

      setFaqs(faqsResult.data || []);
      setProhibitedItems(prohibitedResult.data || []);
      setContentPages(contentResult.data || []);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFAQsByCategory = (category: string) => {
    return faqs.filter(faq => faq.category === category);
  };

  const getContentByKey = (key: string) => {
    return contentPages.find(page => page.page_key === key);
  };

  const getProhibitedIcon = (iconClass: string) => {
    switch (iconClass) {
      case 'fas fa-bomb':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'fas fa-fire':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'fas fa-skull-crossbones':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'fas fa-paw':
        return <Package className="w-6 h-6 text-yellow-600" />;
      case 'fas fa-money-bill-wave':
        return <Ban className="w-6 h-6 text-red-600" />;
      case 'fas fa-battery-full':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      default:
        return <Ban className="w-6 h-6 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gold" />
          <p className="text-gray-600">Loading support information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/70" />
        <img 
          src={IMAGES.WAREHOUSE_OPS_4} 
          alt="Support Center" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Support <span className="text-gold">Center</span>
            </h1>
            <p className="text-xl lg:text-2xl text-navy-200 max-w-3xl mx-auto">
              Find answers to your questions, shipping guidelines, and get the help you need.
            </p>
          </div>
        </div>
      </section>

      {/* Support Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="packaging" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Packaging Guide
              </TabsTrigger>
              <TabsTrigger value="prohibited" className="flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Prohibited Items
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Trade Terms
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">Frequently Asked Questions</CardTitle>
                  <p className="text-gray-600">Find quick answers to common questions about our services.</p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-semibold">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Packaging Guide Tab */}
            <TabsContent value="packaging">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">Packaging Best Practices</CardTitle>
                  <p className="text-gray-600">Proper packaging ensures your shipment arrives safely.</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">Outer Box</h3>
                      <p className="text-gray-600">
                        Use a new, high-quality corrugated carton. For heavy items, wooden crates are recommended to prevent crushing.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">2</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">Cushioning</h3>
                      <p className="text-gray-600">
                        Fill all voids with bubble wrap, foam, or air pillows. The item should not move when the box is shaken.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-gold">3</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">H-Seal Method</h3>
                      <p className="text-gray-600">
                        Use strong packing tape. Apply tape to the center seam and both edge seams (making an 'H' shape) for maximum security.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-6 h-6" />
                      Calculating Chargeable Weight
                    </h4>
                    <p className="text-blue-800 mb-4">
                      Airlines charge based on the greater of Actual Weight or Volumetric Weight.
                    </p>
                    <div className="bg-white p-4 rounded border-2 border-dashed border-blue-300 text-center">
                      <div className="text-lg font-bold text-blue-900">
                        (Length × Width × Height in cm) ÷ 6000 = Volumetric Weight (kg)
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-3">
                      <em>Note: Some express carriers use 5000 as the divisor. Britium Express confirms the correct factor per shipment.</em>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prohibited Items Tab */}
            <TabsContent value="prohibited">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl text-red-600">Prohibited & Restricted Items</CardTitle>
                  <p className="text-gray-600">
                    For safety and legal compliance, the following items are strictly prohibited from air cargo.
                  </p>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> Hiding dangerous goods is illegal and compromises the safety of everyone in the transport chain.
                    </AlertDescription>
                  </Alert>

                  <div className="grid md:grid-cols-2 gap-6">
                    {prohibitedItems.map((item) => (
                      <div key={item.id} className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getProhibitedIcon(item.icon)}
                        </div>
                        <div>
                          <h4 className="font-bold text-red-900 mb-2">{item.item_name}</h4>
                          <p className="text-red-800 text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-bold text-yellow-900 mb-2">Not Sure About Your Item?</h4>
                    <p className="text-yellow-800 mb-4">
                      If you're unsure whether your item is allowed, please contact us before shipping. Our team will help you determine the best way to send your package safely and legally.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                        <a href="tel:+95989747744">
                          <Phone className="w-4 h-4 mr-2" />
                          Call: +95-9-89747744
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                        <a href="mailto:info@britiumexpress.com">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Us
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trade Terms Tab */}
            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">Understanding Trade Terms (Incoterms)</CardTitle>
                  <p className="text-gray-600">
                    Incoterms® define who is responsible for the shipping costs and risks.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-2xl font-bold text-blue-900 mb-3">EXW (Ex Works)</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Seller's responsibility is minimal. The buyer handles all transport and risk starting from the seller's warehouse pick-up. 
                        This means the buyer is responsible for loading the goods, all transportation costs, and assumes all risks from the point of collection.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-2xl font-bold text-green-900 mb-3">FOB (Free On Board)</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Seller is responsible until the goods are loaded onto the vessel/aircraft. Once on board, the risk transfers to the buyer. 
                        The seller handles export clearance, but the buyer is responsible for main carriage, insurance, and import clearance.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-2xl font-bold text-purple-900 mb-3">CIF (Cost, Insurance & Freight)</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Seller pays for the cost, freight, and insurance to the destination port. However, risk transfers to the buyer once goods are on board the vessel. 
                        The seller arranges and pays for main carriage and minimum insurance coverage.
                      </p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-2xl font-bold text-orange-900 mb-3">DDP (Delivered Duty Paid)</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Seller has maximum responsibility. The seller delivers goods to the buyer's premises, cleared for import and all duties paid. 
                        This is the most comprehensive service level where the seller handles everything including customs clearance at destination.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-3">Need Help Choosing the Right Terms?</h4>
                    <p className="text-gray-600 mb-4">
                      Our logistics experts can help you understand which Incoterms work best for your specific shipment and business needs.
                    </p>
                    <Button asChild className="bg-gold hover:bg-gold/90 text-navy-900">
                      <a href="mailto:info@britiumexpress.com">
                        Contact Our Experts
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our customer support team is ready to assist you with any questions or concerns.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Call Us</h3>
                <p className="text-gray-600 mb-6">Speak directly with our support team</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <a href="tel:+95989747744">Express: +95-9-89747744</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="tel:+95989747711">General: +95-9-89747711</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Email Us</h3>
                <p className="text-gray-600 mb-6">Send detailed inquiries and get comprehensive responses</p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <a href="mailto:info@britiumexpress.com">
                    Send Email
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
                <p className="text-gray-600 mb-6">We're here to help during business hours</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Monday - Saturday:</strong></p>
                  <p>9:00 AM - 5:30 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}