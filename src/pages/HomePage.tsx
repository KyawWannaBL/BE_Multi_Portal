import React from 'react';
import { 
  Truck, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  Star,
  Package,
  Globe,
  CheckCircle
} from 'lucide-react';
import { IMAGES } from '@/assets/images';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Global Glittering Networking 3D Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-brand-navy/95 via-navy-800/90 to-navy-900/95 overflow-hidden">
        {/* Network Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="globalNetworkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#ffb000" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.3"/>
            </linearGradient>
            <filter id="globalGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Global Express Network Lines */}
          <line x1="0%" y1="10%" x2="100%" y2="90%" stroke="url(#globalNetworkGradient)" strokeWidth="1" filter="url(#globalGlow)" className="animate-pulse" opacity="0.4">
            <animate attributeName="stroke-dasharray" values="0,200;100,100;200,0;0,200" dur="8s" repeatCount="indefinite"/>
          </line>
          <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="url(#globalNetworkGradient)" strokeWidth="1" filter="url(#globalGlow)" className="animate-pulse" opacity="0.3" style={{animationDelay: '2s'}}>
            <animate attributeName="stroke-dasharray" values="0,180;90,90;180,0;0,180" dur="6s" repeatCount="indefinite"/>
          </line>
          <line x1="0%" y1="50%" x2="100%" y2="20%" stroke="url(#globalNetworkGradient)" strokeWidth="0.8" filter="url(#globalGlow)" className="animate-pulse" opacity="0.3" style={{animationDelay: '4s'}}>
            <animate attributeName="stroke-dasharray" values="0,160;80,80;160,0;0,160" dur="10s" repeatCount="indefinite"/>
          </line>
          <line x1="20%" y1="0%" x2="80%" y2="100%" stroke="url(#globalNetworkGradient)" strokeWidth="1" filter="url(#globalGlow)" className="animate-pulse" opacity="0.4" style={{animationDelay: '1s'}}>
            <animate attributeName="stroke-dasharray" values="0,220;110,110;220,0;0,220" dur="7s" repeatCount="indefinite"/>
          </line>
          
          {/* Global Network Nodes */}
          <circle cx="20%" cy="20%" r="2" fill="#ffd700" filter="url(#globalGlow)" className="animate-pulse" opacity="0.6">
            <animate attributeName="r" values="1;3;1" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="80%" cy="80%" r="1.5" fill="#ffb000" filter="url(#globalGlow)" className="animate-pulse" opacity="0.5" style={{animationDelay: '2s'}}>
            <animate attributeName="r" values="1;2.5;1" dur="5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="60%" cy="30%" r="2.5" fill="#ffd700" filter="url(#globalGlow)" className="animate-pulse" opacity="0.7" style={{animationDelay: '1s'}}>
            <animate attributeName="r" values="2;4;2" dur="6s" repeatCount="indefinite"/>
          </circle>
        </svg>
        
        {/* Global Glittering Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/6 left-1/6 w-1 h-1 bg-brand-gold rounded-full animate-ping opacity-50" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-1/4 right-1/4 w-0.5 h-0.5 bg-brand-amber rounded-full animate-ping opacity-40" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping opacity-60" style={{animationDelay: '6s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-brand-amber rounded-full animate-ping opacity-45" style={{animationDelay: '9s'}}></div>
          
          {/* Global Speed Lines */}
          <div className="absolute top-1/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent animate-pulse opacity-30"></div>
          <div className="absolute top-2/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-amber/15 to-transparent animate-pulse opacity-25" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-1/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/18 to-transparent animate-pulse opacity-28" style={{animationDelay: '6s'}}></div>
        </div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-brand-navy/40 backdrop-blur-sm text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={IMAGES.BRITIUM_LOGO_55 || "/images/britium-logo.png"}
                alt="Britium Express" 
                className="w-10 h-10 rounded-lg bg-white/10 p-1"
              />
              <span className="nav-brand">Britium Express</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+95-9-897447744</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@britiumexpress.com</span>
              </div>
              <span>Mon-Sat: 9:00am - 5:30pm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/20 backdrop-blur-sm border-b border-brand-gold/30 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="nav-link-gold font-semibold active">Home</a>
              <a href="/track" className="nav-link-gold">Track & Trace</a>
              <a href="/services" className="nav-link-gold">Services</a>
              <a href="/quote" className="nav-link-gold">Get Quote</a>
              <a href="/about" className="nav-link-gold">About Us</a>
              <a href="/news" className="nav-link-gold">News</a>
              <a href="/contact" className="nav-link-gold">Contact</a>
            </div>
            <a href="/login" className="btn-gold">Login</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-brand-navy via-brand-royal to-navy-800 text-white overflow-hidden">
        {/* Dark Blue 3D Live Wallpaper */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-navy-800 to-brand-royal overflow-hidden">
          {/* Animated 3D Geometric Shapes */}
          <div className="absolute inset-0">
            {/* Floating Cubes */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-brand-gold/20 to-brand-amber/30 transform rotate-45 animate-pulse shadow-2xl"></div>
            <div className="absolute top-32 right-20 w-12 h-12 bg-gradient-to-br from-navy-600/40 to-brand-royal/50 transform rotate-12 animate-bounce shadow-xl"></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-brand-gold/15 to-brand-amber/25 transform -rotate-12 animate-pulse shadow-2xl"></div>
            
            {/* Floating Diamonds */}
            <div className="absolute top-1/4 right-1/3 w-8 h-8 bg-gradient-to-br from-brand-gold/30 to-brand-amber/40 transform rotate-45 animate-spin shadow-lg" style={{animationDuration: '8s'}}></div>
            <div className="absolute bottom-1/3 right-10 w-6 h-6 bg-gradient-to-br from-navy-500/50 to-brand-royal/60 transform rotate-45 animate-spin shadow-md" style={{animationDuration: '6s'}}></div>
            
            {/* Animated Gradient Orbs */}
            <div className="absolute top-1/2 left-1/5 w-32 h-32 bg-gradient-radial from-brand-gold/20 via-brand-amber/10 to-transparent rounded-full animate-pulse shadow-2xl blur-sm"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-radial from-navy-400/30 via-brand-royal/20 to-transparent rounded-full animate-pulse shadow-xl blur-sm" style={{animationDelay: '2s'}}></div>
            
            {/* 3D Grid Lines */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
                {Array.from({length: 96}).map((_, i) => (
                  <div key={i} className="border border-brand-gold/20 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                ))}
              </div>
            </div>
            
            {/* Floating Particles */}
            <div className="absolute top-16 left-1/3 w-2 h-2 bg-brand-gold rounded-full animate-ping"></div>
            <div className="absolute top-40 right-1/5 w-1 h-1 bg-brand-amber rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-32 left-1/2 w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
            <div className="absolute bottom-16 right-1/3 w-1 h-1 bg-brand-amber rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
            
            {/* Dynamic Wave Effect */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-navy/50 to-transparent">
              <div className="absolute bottom-0 w-full h-8 bg-gradient-to-r from-brand-gold/20 via-brand-amber/30 to-brand-gold/20 animate-pulse"></div>
            </div>
          </div>
          
          {/* 3D Depth Overlay */}
          {/* Glittering Networking 3D Background for Express Delivery */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/80 via-navy-800/60 to-navy-900/90 overflow-hidden">
            {/* Network Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Animated Network Lines representing delivery routes */}
              <defs>
                <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#ffb000" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#ffd700" stopOpacity="0.4"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Express Delivery Network Lines */}
              <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="url(#networkGradient)" strokeWidth="2" filter="url(#glow)" className="animate-pulse" opacity="0.7">
                <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="4s" repeatCount="indefinite"/>
              </line>
              <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="url(#networkGradient)" strokeWidth="1.5" filter="url(#glow)" className="animate-pulse" opacity="0.6" style={{animationDelay: '1s'}}>
                <animate attributeName="stroke-dasharray" values="0,80;40,40;80,0;0,80" dur="3s" repeatCount="indefinite"/>
              </line>
              <line x1="5%" y1="50%" x2="95%" y2="30%" stroke="url(#networkGradient)" strokeWidth="1" filter="url(#glow)" className="animate-pulse" opacity="0.5" style={{animationDelay: '2s'}}>
                <animate attributeName="stroke-dasharray" values="0,120;60,60;120,0;0,120" dur="5s" repeatCount="indefinite"/>
              </line>
              <line x1="30%" y1="10%" x2="70%" y2="90%" stroke="url(#networkGradient)" strokeWidth="1.5" filter="url(#glow)" className="animate-pulse" opacity="0.6" style={{animationDelay: '0.5s'}}>
                <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="3.5s" repeatCount="indefinite"/>
              </line>
              
              {/* Network Nodes (Delivery Hubs) */}
              <circle cx="15%" cy="25%" r="4" fill="#ffd700" filter="url(#glow)" className="animate-pulse" opacity="0.8">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="85%" cy="75%" r="3" fill="#ffb000" filter="url(#glow)" className="animate-pulse" opacity="0.7" style={{animationDelay: '1s'}}>
                <animate attributeName="r" values="2;5;2" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="50%" cy="40%" r="5" fill="#ffd700" filter="url(#glow)" className="animate-pulse" opacity="0.9" style={{animationDelay: '0.5s'}}>
                <animate attributeName="r" values="4;7;4" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="75%" cy="15%" r="3" fill="#ffb000" filter="url(#glow)" className="animate-pulse" opacity="0.6" style={{animationDelay: '2s'}}>
                <animate attributeName="r" values="2;4;2" dur="2.2s" repeatCount="indefinite"/>
              </circle>
            </svg>
            
            {/* Glittering Particles representing data packets */}
            <div className="absolute inset-0">
              {/* Moving Data Packets */}
              <div className="absolute top-1/4 left-0 w-2 h-2 bg-brand-gold rounded-full animate-ping opacity-80" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-brand-amber rounded-full animate-ping opacity-70" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-brand-gold rounded-full animate-ping opacity-90" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-2/3 left-3/4 w-1 h-1 bg-brand-amber rounded-full animate-ping opacity-60" style={{animationDelay: '3s'}}></div>
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-brand-gold rounded-full animate-ping opacity-75" style={{animationDelay: '1.5s'}}></div>
              
              {/* Glittering Stars */}
              <div className="absolute top-10 right-20 w-1 h-1 bg-brand-gold animate-pulse opacity-80" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
              <div className="absolute top-32 right-1/3 w-0.5 h-0.5 bg-brand-amber animate-pulse opacity-70" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', animationDelay: '1s'}}></div>
              <div className="absolute bottom-20 left-10 w-1.5 h-1.5 bg-brand-gold animate-pulse opacity-85" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', animationDelay: '2s'}}></div>
              
              {/* Express Speed Lines */}
              <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent animate-pulse opacity-60"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-amber/30 to-transparent animate-pulse opacity-50" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-gold/35 to-transparent animate-pulse opacity-55" style={{animationDelay: '2s'}}></div>
            </div>
            
            {/* 3D Depth and Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-navy/30 to-navy-900/50"></div>
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-brand-gold/5 to-transparent"></div>
          </div>
        </div>
        {/* Hero Movie (background video) */}
<div className="absolute inset-y-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
  <video
    className="w-full h-full object-cover"
    src="/hero.mp4"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    poster="/create_animated_video.gif"
  />
  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-brand-navy/30 to-brand-navy/80" />
</div>

<div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                Reliable Nationwide
                <span className="block text-gradient-gold">Logistics</span>
              </h1>
              <div className="text-2xl md:text-3xl font-semibold text-brand-gold mb-4">
                🚚 Domestic Express
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-brand-gold/30 rounded-full px-4 py-2 text-sm text-navy-50 mb-6">
                <span className="text-brand-gold font-bold">New</span>
                <span>Download the Britium Express Android app</span>
              </div>

              <p className="text-xl text-navy-100 mb-8 max-w-2xl">
                Connecting Yangon, Mandalay, and Nay Pyi Taw with speed and precision. 
                Premium logistics solutions with Myanmar's golden standard of excellence.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mb-12">
              <a href="/quote" className="btn-gold text-lg px-8 py-4">
                Calculate Rate
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a href="/track" className="btn-outline-gold text-lg px-8 py-4">
                Track Package
              </a>
            
              <a href="/app-debug.apk" download className="btn-outline-gold text-lg px-8 py-4">
                Download APK
              </a>
</div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-1">15K+</div>
                <div className="text-sm text-navy-200">Deliveries Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-1">98%</div>
                <div className="text-sm text-navy-200">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-1">24/7</div>
                <div className="text-sm text-navy-200">Customer Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-1">1000+</div>
                <div className="text-sm text-navy-200">Happy Merchants</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Priority Routes Section */}
      <section className="py-20 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-brand-navy mb-4">
                🎯 Priority Routes
              </h2>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                We specialize in the "Golden Triangle" of Myanmar's economy. Our dedicated fleet runs daily schedules 
                between the commercial capital, the administrative capital, and the cultural hub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Yangon Same Day */}
              <div className="surface-card p-8 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-gold to-brand-amber rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Truck className="w-10 h-10 text-brand-navy" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">
                  🏙️ Yangon City Same-Day
                </h3>
                <p className="text-navy-600 mb-4">Downtown & Major Townships</p>
                <div className="badge-gold text-lg font-bold mb-4">Same Day</div>
                <p className="text-sm text-navy-500">
                  Express delivery within Yangon city limits with real-time tracking
                </p>
              </div>

              {/* Yangon to Mandalay */}
              <div className="surface-card p-8 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-navy to-brand-royal rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">
                  🛣️ Yangon ↔ Mandalay
                </h3>
                <p className="text-navy-600 mb-4">Daily Highway Express</p>
                <div className="badge-navy text-lg font-bold mb-4">Next Day</div>
                <p className="text-sm text-navy-500">
                  Reliable overnight service between Myanmar's two largest cities
                </p>
              </div>

              {/* Yangon to Nay Pyi Taw */}
              <div className="surface-card p-8 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-info to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">
                  🏛️ Yangon ↔ Nay Pyi Taw
                </h3>
                <p className="text-navy-600 mb-4">Government & Commercial Cargo</p>
                <div className="badge-success text-lg font-bold mb-4">Next Day</div>
                <p className="text-sm text-navy-500">
                  Specialized service for official and business documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-display font-bold text-brand-navy mb-8">
                  Why Choose Our Premium Service?
                </h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-brand-amber rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-brand-navy" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">🚪 Door-to-Door</h3>
                      <p className="text-navy-600">
                        We pick up from your doorstep and deliver directly to the receiver. No need to visit a station.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-navy to-brand-royal rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">🛡️ Secure Handling</h3>
                      <p className="text-navy-600">
                        From documents to fragile parcels, our trained staff ensures your items arrive intact.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-info to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">📱 Real-Time Updates</h3>
                      <p className="text-navy-600">
                        Track your shipment status via our Website or Mobile App at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="surface-elevated p-8 bg-gradient-to-br from-white to-navy-50">
                  <img 
                    src={IMAGES.SCREENSHOT3252_118 || "/images/Screenshot3252.png"}
                    alt="Delivery Service" 
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-brand-gold fill-current" />
                      <Star className="w-5 h-5 text-brand-gold fill-current" />
                      <Star className="w-5 h-5 text-brand-gold fill-current" />
                      <Star className="w-5 h-5 text-brand-gold fill-current" />
                      <Star className="w-5 h-5 text-brand-gold fill-current" />
                    </div>
                    <p className="text-navy-600 italic">
                      "Britium Express has transformed our business logistics. Fast, reliable, and professional service every time."
                    </p>
                    <p className="text-sm text-navy-500 mt-2">- Golden Lotus Trading Co.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-navy/20 backdrop-blur-sm text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-display font-bold mb-6">
              Ready to Ship? 🚀
            </h2>
            <p className="text-xl text-navy-100 mb-8">
              Check our competitive rates for Domestic Shipping.
            </p>
            <a href="/quote" className="btn-gold text-xl px-12 py-4 inline-flex items-center gap-3">
              CALCULATE RATE
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy/30 backdrop-blur-sm text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-display font-bold text-brand-gold mb-4">Britium Express</h3>
              <p className="text-navy-200 mb-6">
                A dedicated delivery arm of Britium Ventures Company Limited. 
                Providing fast, secure, and compliant logistics solutions with Myanmar's golden standard.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-gold/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <div className="font-semibold text-brand-gold">Licensed & Insured</div>
                  <div className="text-sm text-navy-300">Fully compliant logistics provider</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-gold mb-6">Quick Links</h4>
              <div className="space-y-3">
                <a href="/track" className="block text-navy-200 hover:text-brand-gold transition-colors flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Track Package
                </a>
                <a href="/services" className="block text-navy-200 hover:text-brand-gold transition-colors flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Services
                </a>
                <a href="/contact" className="block text-navy-200 hover:text-brand-gold transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-gold mb-6">Contact Us</h4>
              <div className="space-y-4 text-navy-200">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-gold mt-0.5" />
                  <div>
                    <div className="font-medium">+95-9-897447744</div>
                    <div className="text-sm text-navy-300">Primary Hotline</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold mt-0.5" />
                  <div>
                    <div className="font-medium">No. 277, East Dagon Township</div>
                    <div className="text-sm text-navy-300">Yangon, Myanmar</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-gold mt-0.5" />
                  <div>
                    <div className="font-medium">info@britiumexpress.com</div>
                    <div className="text-sm text-navy-300">24/7 Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-navy-700 pt-8 text-center">
            <p className="text-navy-300">
              © 2026 Britium Ventures Company Limited. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}