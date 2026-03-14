import React, { useState } from 'react';
import { Calculator, MapPin, Package, Clock, Truck, Phone, Mail } from 'lucide-react';
import { IMAGES } from '@/assets/images';

// Language context - using simple state for now
const useLanguageContext = () => ({ language: 'en' as 'en' | 'my' });

export default function ShippingCalculator() {
  const { language } = useLanguageContext();

  const [formData, setFormData] = useState({
    pickupCity: 'Yangon',
    dropCity: 'Yangon',
    weightKg: '',
    serviceType: 'standard',
    merchantName: '',
    phone: '',
  });

  const [result, setResult] = useState<null | {
    fee: number;
    etaText: string;
  }>(null);

  const calc = () => {
    const weight = Number(formData.weightKg || 0);

    // Basic rule-set (replace with your actual fee table)
    let base = 2000;
    if (formData.pickupCity !== formData.dropCity) base += 1500;

    if (formData.serviceType === 'express') base += 1500;
    if (weight > 1) base += Math.ceil(weight - 1) * 500;

    const etaText =
      formData.serviceType === 'express'
        ? language === 'my'
          ? '၁ ရက်အတွင်း'
          : 'Within 1 day'
        : language === 'my'
          ? '၁-၂ ရက်'
          : '1–2 days';

    setResult({ fee: base, etaText });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <h2 className="text-xl font-bold">Shipping Calculator</h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Pickup City</label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={formData.pickupCity}
              onChange={(e) => setFormData((p) => ({ ...p, pickupCity: e.target.value }))}
            >
              <option>Yangon</option>
              <option>Mandalay</option>
              <option>Naypyidaw</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Drop City</label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={formData.dropCity}
              onChange={(e) => setFormData((p) => ({ ...p, dropCity: e.target.value }))}
            >
              <option>Yangon</option>
              <option>Mandalay</option>
              <option>Naypyidaw</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Weight (kg)</label>
            <input
              className="mt-1 w-full rounded-lg border p-2"
              value={formData.weightKg}
              onChange={(e) => setFormData((p) => ({ ...p, weightKg: e.target.value }))}
              placeholder="e.g. 1.5"
              inputMode="decimal"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Service</label>
            <select
              className="mt-1 w-full rounded-lg border p-2"
              value={formData.serviceType}
              onChange={(e) => setFormData((p) => ({ ...p, serviceType: e.target.value }))}
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Merchant Name</label>
            <input
              className="mt-1 w-full rounded-lg border p-2"
              value={formData.merchantName}
              onChange={(e) => setFormData((p) => ({ ...p, merchantName: e.target.value }))}
              placeholder="Merchant / Shop name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Phone</label>
            <input
              className="mt-1 w-full rounded-lg border p-2"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+95..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={calc}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="rounded-lg border px-5 py-3 font-medium hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        {result && (
          <div className="mt-6 rounded-xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <p className="font-semibold">Estimated Fee: {result.fee.toLocaleString()} MMK</p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4" />
              ETA: {result.etaText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
