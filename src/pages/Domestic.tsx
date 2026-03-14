import React from "react";
import { Link } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";

export default function Domestic() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white py-2 text-sm text-center">
        <FaPhoneAlt className="inline mr-2" /> +95 9 897 4477 44
        <FaEnvelope className="inline ml-4 mr-2" /> info@britiumexpress.com
      </div>
      <header className="bg-blue-600 text-white text-center py-20">
        <h1 className="text-4xl font-bold">Domestic Express</h1>
        <p className="mt-4">Door-to-Door Delivery within Myanmar</p>
        <div className="mt-8">
          <Link to="/quote" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold">
            Get a Quote
          </Link>
        </div>
      </header>
    </div>
  );
}