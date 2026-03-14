import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle,
  Globe,
  Zap,
  Users,
  Award,
  Target,
  Building,
  Calendar,
  TrendingUp,
  Heart,
  Eye,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import { useLanguageContext } from '@/lib/LanguageContext';
import { IMAGES } from '@/assets/images';

export default function AboutPage() {
  const { t } = useLanguageContext();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/70" />
        <img 
          src={IMAGES.WAREHOUSE_OPS_2} 
          alt="About Britium Ventures" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <img 
                src={IMAGES.BRITIUM_LOGO_55} 
                alt="Britium Ventures Logo" 
                className="h-20 w-auto"
              />
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gold">BRITIUM VENTURES</h1>
                <p className="text-navy-200 text-lg">Co., Ltd.</p>
              </div>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Delivering <span className="text-gold">Confidence</span> in Motion
            </h2>
            <p className="text-xl lg:text-2xl text-navy-200 max-w-3xl mx-auto">
              Myanmar's most trusted logistics partner, committed to delivering seamless, reliable, and cost-effective solutions across the entire logistics spectrum.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">{t('about.hero.title')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Britium Ventures Co., Ltd. is a leading Myanmar-based logistics provider, established with a vision to transform the logistics landscape in Myanmar and beyond. We are committed to delivering seamless, reliable, and cost-effective solutions across the entire logistics spectrum.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our comprehensive service portfolio spans logistics services, customs brokerage, trading facilitation, product sourcing, consulting, and engineering solutions. We bring structure and clarity to the complexity of global trade, ensuring our clients can focus on their core business while we handle their logistics needs.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy-900">15+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy-900">50+</div>
                  <div className="text-sm text-gray-600">Countries Served</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={IMAGES.LOGISTICS_HERO_3} 
                alt="Britium Ventures Operations" 
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl text-gray-900">{t('about.vision.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To be Myanmar's most trusted and forward-moving logistics partner—delivering reliability, compliance, and customer-first solutions that drive progress across industries.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-500 rounded-2xl flex items-center justify-center mb-4">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl text-gray-900">{t('about.mission.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-gold mt-1 flex-shrink-0" />
                    <p className="text-gray-600">Deliver tailored logistics services that meet evolving client needs with precision and care</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-gold mt-1 flex-shrink-0" />
                    <p className="text-gray-600">Uphold trust, transparency, and compliance in every transaction</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-gold mt-1 flex-shrink-0" />
                    <p className="text-gray-600">Continuously enhance efficiency through smart coordination</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-gold mt-1 flex-shrink-0" />
                    <p className="text-gray-600">Promote sustainable practices in supply chain movement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide every decision we make and every service we deliver.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trust</h3>
              <p className="text-gray-600 leading-relaxed">
                We operate with full accountability in every service we provide. Trust is maintained through discipline and consistency in our operations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reliability</h3>
              <p className="text-gray-600 leading-relaxed">
                Our proven track record in handling time-sensitive and complex shipments makes us a benchmark for reliability in the industry.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer-Centric</h3>
              <p className="text-gray-600 leading-relaxed">
                Every package and project is handled with care. Our team provides professional, friendly, and proactive service to exceed expectations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Compliance</h3>
              <p className="text-gray-600 leading-relaxed">
                We uphold the highest standards of compliance with all local and international trade regulations and industry best practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Milestones */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-navy-200 max-w-3xl mx-auto">
              Key milestones that have shaped Britium Ventures into Myanmar's leading logistics provider.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Company Founded</h3>
              <p className="text-navy-200">
                Established with a vision to transform Myanmar's logistics landscape.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">International Expansion</h3>
              <p className="text-navy-200">
                Extended our network to serve over 50 countries worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Recognition</h3>
              <p className="text-navy-200">
                Received multiple awards for excellence in logistics and customer service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Continuous Growth</h3>
              <p className="text-navy-200">
                Expanding services and capabilities to meet evolving market demands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced leadership team brings decades of combined expertise in logistics, trade, and business development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-navy-900 to-navy-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Executive Leadership</h3>
                <p className="text-gray-600">
                  Visionary leaders with deep industry knowledge and strategic expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Operations Team</h3>
                <p className="text-gray-600">
                  Experienced professionals ensuring smooth and efficient logistics operations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Success</h3>
                <p className="text-gray-600">
                  Dedicated team focused on delivering exceptional customer experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Company Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-navy-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Legal Name</h3>
                    <p className="text-gray-600">Britium Ventures Co., Ltd.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-navy-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Headquarters</h3>
                    <p className="text-gray-600">
                      No. 277, Corner of Anawrahta Road and Bo Moe Gyo St.,<br />
                      East Dagon Township, Yangon, Myanmar
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-navy-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Service Areas</h3>
                    <p className="text-gray-600">Myanmar and 50+ countries worldwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-navy-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Team Size</h3>
                    <p className="text-gray-600">100+ dedicated professionals</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <img 
                src={IMAGES.WAREHOUSE_OPS_3} 
                alt="Britium Ventures Facility" 
                className="rounded-2xl shadow-lg mb-8"
              />
              
              <div className="bg-navy-900 text-white p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4">Ready to Partner with Us?</h3>
                <p className="text-navy-200 mb-6">
                  Discover how Britium Ventures can optimize your supply chain and drive your business forward.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-navy-900">
                    <Link to={ROUTE_PATHS.CONTACT}>
                      Contact Us
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-navy-900">
                    <Link to={ROUTE_PATHS.SERVICES}>
                      Our Services
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}