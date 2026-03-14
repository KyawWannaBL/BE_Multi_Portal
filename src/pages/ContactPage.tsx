import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Building,
  Globe,
  MessageSquare,
  User,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IMAGES } from '@/assets/images';
import { useLanguageContext } from '@/lib/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguageContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/70" />
        <img 
          src={IMAGES.LOGISTICS_HERO_4} 
          alt="Contact Britium Ventures" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Get in <span className="text-gold">Touch</span>
            </h1>
            <p className="text-xl lg:text-2xl text-navy-200 max-w-3xl mx-auto">
              Ready to optimize your logistics? Contact our experts today for personalized solutions tailored to your business needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Reach out to us through any of the following channels. Our team is ready to assist you with all your logistics needs.
                </p>
              </div>

              {/* Main Office */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-navy-900" />
                    </div>
                    Main Office
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        No. 277, Corner of Anawrahta Road and Bo Moe Gyo St.,<br />
                        East Dagon Township, Yangon, Myanmar
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Phone Numbers</p>
                      <div className="space-y-1 text-gray-600">
                        <p>+95-9-89747744 (Express Delivery)</p>
                        <p>+95-9-89747711 (General Inquiries)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">info@britiumventures.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Business Hours</p>
                      <div className="space-y-1 text-gray-600">
                        <p>Monday - Saturday: 9:00 AM - 5:30 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Express Delivery Service */}
              <Card className="border-0 shadow-lg bg-navy-900 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <img 
                      src={IMAGES.BRITIUM_LOGO_55} 
                      alt="Britium Express" 
                      className="h-8 w-auto"
                    />
                    Britium Express
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-navy-200">
                    For express delivery services and package tracking inquiries.
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <p className="font-medium">Express Hotline</p>
                      <p className="text-navy-200">+95-9-89747744</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                    <div>
                      <p className="font-medium">Express Email</p>
                      <p className="text-navy-200">express@britiumventures.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Areas */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gold" />
                    </div>
                    Service Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Domestic</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Yangon Region</li>
                        <li>• Mandalay Region</li>
                        <li>• Nay Pyi Taw</li>
                        <li>• Major Townships</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">International</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 50+ Countries</li>
                        <li>• Asia-Pacific</li>
                        <li>• Europe</li>
                        <li>• Americas</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="border-gray-300 focus:border-gold focus:ring-gold"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="border-gray-300 focus:border-gold focus:ring-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+95 9 XXX XXX XXX"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="border-gray-300 focus:border-gold focus:ring-gold"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company" className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Company Name
                        </Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Your company name"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="border-gray-300 focus:border-gold focus:ring-gold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service">Service Interest</Label>
                      <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-gold focus:ring-gold">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="logistics">Logistics Service</SelectItem>
                          <SelectItem value="customs">Customs Brokerage</SelectItem>
                          <SelectItem value="trading">Trading Service</SelectItem>
                          <SelectItem value="sourcing">Product Sourcing</SelectItem>
                          <SelectItem value="consulting">Consulting Service</SelectItem>
                          <SelectItem value="engineering">Engineering Service</SelectItem>
                          <SelectItem value="express">Express Delivery</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your logistics needs or inquiry..."
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        rows={5}
                        className="border-gray-300 focus:border-gold focus:ring-gold resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-gold hover:bg-gold/90 text-navy-900 font-semibold"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Us</h2>
            <p className="text-xl text-gray-600">
              Visit our main office in Yangon for in-person consultations and services.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
                <p className="text-gray-500">
                  No. 277, Corner of Anawrahta Road and Bo Moe Gyo St.,<br />
                  East Dagon Township, Yangon, Myanmar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick Contact</h2>
            <p className="text-xl text-gray-600">
              Choose the best way to reach us based on your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Call Us</h3>
                <p className="text-gray-600 mb-6">
                  Speak directly with our logistics experts for immediate assistance.
                </p>
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

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Email Us</h3>
                <p className="text-gray-600 mb-6">
                  Send us detailed inquiries and receive comprehensive responses.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <a href="mailto:info@britiumventures.com">
                    Send Email
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Office</h3>
                <p className="text-gray-600 mb-6">
                  Schedule an in-person meeting at our Yangon headquarters.
                </p>
                <Button className="w-full bg-gold hover:bg-gold/90 text-navy-900">
                  Schedule Visit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}