import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Quote() {
  const [region, setRegion] = useState('yangon');
  const [weight, setWeight] = useState(1);
  const [totalPrice, setTotalPrice] = useState('--');

  useEffect(() => {
    let baseRate = region === 'yangon' ? 3000 : 5000;
    const total = baseRate + (weight > 1 ? Math.ceil(weight - 1) * 500 : 0);
    setTotalPrice(`${total.toLocaleString()} MMK`);
  }, [region, weight]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Link to="/" className="text-blue-600 mb-6 inline-block">← Back Home</Link>
      <div className="bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">Shipping Calculator</h2>
        <select className="w-full p-3 border rounded-lg mb-4" onChange={(e) => setRegion(e.target.value)}>
          <option value="yangon">Yangon</option>
          <option value="mandalay">Mandalay</option>
        </select>
        <input type="number" className="w-full p-3 border rounded-lg" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        <div className="mt-6 bg-blue-50 p-6 text-center rounded-xl">
          <p className="text-4xl font-bold text-blue-900">{totalPrice}</p>
        </div>
      </div>
    </div>
  );
}