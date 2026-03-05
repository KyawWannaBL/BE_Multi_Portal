import { useState } from 'react';
import { Package, Calculator as CalcIcon } from 'lucide-react';

type Result = {
  price: string;
  time: string;
  note: string;
};

export default function Calculator() {
  const [weight, setWeight] = useState(1);
  const [destination, setDestination] = useState('yangon');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    let baseRate = 0;
    let time = '';
    let note = '';

    if (destination === 'yangon') {
      baseRate = 2500;
      time = 'Same Day';
      note = 'Yangon City Express';
    } else if (destination === 'mandalay') {
      baseRate = 4500;
      time = 'Next Day';
      note = 'Intercity Express';
    } else {
      baseRate = 5500;
      time = '2–3 Days';
      note = 'Other Regions';
    }

    if (weight > 1) baseRate += (weight - 1) * 500;

    setResult({
      price: `${baseRate.toLocaleString()} MMK`,
      time,
      note: `${note}. Base rate includes 1kg (+500 MMK/kg after).`,
    });
  };

  return (
    <section className="py-16 max-w-3xl mx-auto px-6">
      <div className="bg-navy-800/60 border border-gold-500/20 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <CalcIcon className="text-gold-400" />
          <h2 className="text-2xl font-bold">Shipping Rate Calculator</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Destination
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-navy-700 border border-gold-500/20 rounded-lg px-4 py-2"
            >
              <option value="yangon">Yangon</option>
              <option value="mandalay">Mandalay</option>
              <option value="other">Other Regions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              min={1}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-navy-700 border border-gold-500/20 rounded-lg px-4 py-2"
            />
          </div>

          <button
            onClick={calculate}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold py-3 rounded-xl transition"
          >
            Calculate
          </button>

          {result && (
            <div className="mt-6 bg-navy-900/60 border border-gold-500/20 rounded-xl p-4">
              <p><strong>Price:</strong> {result.price}</p>
              <p><strong>Delivery Time:</strong> {result.time}</p>
              <p className="text-sm text-gray-300">{result.note}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}