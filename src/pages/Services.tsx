import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, Clock, Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Services() {
  const services = [
    { icon: Truck, title: "Domestic Express", path: "/domestic", desc: "Door-to-door network across all Myanmar regions." },
    { icon: Package, title: "E-commerce", path: "/ecommerce", desc: "Fulfillment and COD services for sellers." },
    { icon: Clock, title: "Next Day", path: "/quote", desc: "Urgent delivery for time-sensitive documents." }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-16">Our Logistics Services</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <Card key={i} className="hover:shadow-2xl transition-shadow group">
              <CardHeader>
                <s.icon className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">{s.desc}</p>
                <Link to={s.path} className="text-blue-600 font-bold flex items-center group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}