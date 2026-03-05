import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Phone, ArrowRight, Shield, Globe, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';

export const ServicesPage = () => {
  const categories = [
    { 
      title: "Logistics", 
      icon: <Truck className="w-6 h-6" />,
      desc: "Comprehensive distribution network across the region."
    },
    { 
      title: "Warehousing", 
      icon: <Package className="w-6 h-6" />,
      desc: "Secure storage solutions with inventory management."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">World Class Logistics</h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Streamlining your supply chain with advanced technology and expert handling.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8">
            <Link to={ROUTE_PATHS.CONTACT}>Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((item, idx) => (
              <div key={idx} className="p-8 bg-slate-50 rounded-3xl hover:shadow-xl transition-shadow">
                <div className="mb-6 text-blue-600">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Ready to Optimize Your Operations?</h2>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <a href="tel:+95989747744"><Phone className="mr-2 w-4 h-4" /> Call Experts</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;