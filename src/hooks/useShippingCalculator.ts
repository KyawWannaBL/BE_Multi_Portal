import { useState, useMemo } from 'react';

export interface Location {
  id: string;
  nameEn: string;
  nameMm: string;
}

export interface StateDivision extends Location {
  townships: Location[];
}

export interface ShippingRate {
  basePrice: number;
  pricePerKg: number;
  estimatedDays: string;
}

export interface InternationalDestination extends Location {
  code: string;
  ratePerKg: number;
  volumeFactor: number; // 5000 or 6000 typically
}

export const MYANMAR_DATA: StateDivision[] = [
  {
    id: 'ygn',
    nameEn: 'Yangon',
    nameMm: 'ရန်ကုန်',
    townships: [
      { id: 'lth', nameEn: 'Latha', nameMm: 'လသာ' },
      { id: 'pbd', nameEn: 'Pabedan', nameMm: 'ပန်းဘဲတန်း' },
      { id: 'tmw', nameEn: 'Tamwe', nameMm: 'တာမွေ' },
      { id: 'hln', nameEn: 'Hlaing', nameMm: 'လှိုင်' },
      { id: 'kmy', nameEn: 'Kamayut', nameMm: 'ကမာရွတ်' }
    ]
  },
  {
    id: 'mdy',
    nameEn: 'Mandalay',
    nameMm: 'မန္တလေး',
    townships: [
      { id: 'ama', nameEn: 'Amarapura', nameMm: 'အမရပူရ' },
      { id: 'aun', nameEn: 'Aungmyethazan', nameMm: 'အောင်မြေသာစံ' },
      { id: 'cha', nameEn: 'Chanayethazan', nameMm: 'ချမ်းအေးသာစံ' }
    ]
  },
  {
    id: 'npw',
    nameEn: 'Naypyidaw',
    nameMm: 'နေပြည်တော်',
    townships: [
      { id: 'zab', nameEn: 'Zabuthiri', nameMm: 'ဇမ္ဗူသီရိ' },
      { id: 'dek', nameEn: 'Dekkhinathiri', nameMm: 'ဒက္ခိဏသီရိ' }
    ]
  },
  {
    id: 'shn',
    nameEn: 'Shan State',
    nameMm: 'ရှမ်းပြည်နယ်',
    townships: [
      { id: 'tgy', nameEn: 'Taunggyi', nameMm: 'တောင်ကြီး' },
      { id: 'lsh', nameEn: 'Lashio', nameMm: 'လားရှိုး' }
    ]
  }
];

export const INTERNATIONAL_DESTINATIONS: InternationalDestination[] = [
  { id: 'sg', nameEn: 'Singapore', nameMm: 'စင်ကာပူ', code: 'SIN', ratePerKg: 15.5, volumeFactor: 6000 },
  { id: 'th', nameEn: 'Thailand', nameMm: 'ထိုင်း', code: 'BKK', ratePerKg: 12.0, volumeFactor: 6000 },
  { id: 'cn', nameEn: 'China', nameMm: 'တရုတ်', code: 'PVG', ratePerKg: 18.0, volumeFactor: 5000 },
  { id: 'us', nameEn: 'United States', nameMm: 'အမေရိကန်', code: 'LAX', ratePerKg: 45.0, volumeFactor: 5000 },
  { id: 'jp', nameEn: 'Japan', nameMm: 'ဂျပန်', code: 'NRT', ratePerKg: 32.0, volumeFactor: 6000 },
  { id: 'ae', nameEn: 'United Arab Emirates', nameMm: 'ယူအေအီး', code: 'DXB', ratePerKg: 28.5, volumeFactor: 6000 }
];

export function useShippingCalculator() {
  const [language, setLanguage] = useState<'en' | 'mm'>('en');

  const t = (en: string, mm: string) => (language === 'en' ? en : mm);

  const calculateDomestic = (weight: number, fromState: string, toState: string) => {
    const basePrice = fromState === toState ? 2500 : 4500;
    const weightPrice = weight > 1 ? (weight - 1) * 1500 : 0;
    return basePrice + weightPrice;
  };

  const calculateVolumeWeight = (length: number, width: number, height: number, factor: number = 6000) => {
    if (!length || !width || !height) return 0;
    return (length * width * height) / factor;
  };

  const calculateInternational = (
    actualWeight: number,
    length: number,
    width: number,
    height: number,
    destinationId: string
  ) => {
    const destination = INTERNATIONAL_DESTINATIONS.find((d) => d.id === destinationId);
    if (!destination) return null;

    const volWeight = calculateVolumeWeight(length, width, height, destination.volumeFactor);
    const chargeableWeight = Math.max(actualWeight, volWeight);
    const totalCost = chargeableWeight * destination.ratePerKg;

    return {
      chargeableWeight,
      volWeight,
      totalCost,
      ratePerKg: destination.ratePerKg
    };
  };

  const dictionary = {
    title: t('Shipping Calculator', 'ပို့ဆောင်ခ တွက်ချက်ရန်'),
    domestic: t('Domestic', 'ပြည်တွင်း'),
    international: t('International / Air Cargo', 'နိုင်ငံတကာ / လေကြောင်းလိုင်း'),
    from: t('From (State/Division)', 'မှ (ပြည်နယ်/တိုင်း)'),
    to: t('To (Township)', 'သို့ (မြို့နယ်)'),
    weight: t('Weight (kg)', 'အလေးချိန် (ကီလို)'),
    calculate: t('Calculate', 'တွက်ချက်မည်'),
    result: t('Estimated Shipping Cost', 'ခန့်မှန်းခြေ ပို့ဆောင်ခ'),
    dimensions: t('Dimensions (cm)', 'အရွယ်အစား (စင်တီမီတာ)'),
    length: t('Length', 'အလျား'),
    width: t('Width', 'အနံ'),
    height: t('Height', 'အမြင့်'),
    actualWeight: t('Actual Weight', 'အမှန်တကယ် အလေးချိန်'),
    volumeWeight: t('Volume Weight', 'ထုထည် အလေးချိန်'),
    chargeableWeight: t('Chargeable Weight', 'တွက်ချက်မည့် အလေးချိန်'),
    destination: t('Destination Country', 'သွားမည့် နိုင်ငံ'),
    currency: t('USD', 'ဒေါ်လာ'),
    localCurrency: t('MMK', 'ကျပ်'),
    selectState: t('Select State/Division', 'ပြည်နယ်/တိုင်း ရွေးချယ်ပါ'),
    selectTownship: t('Select Township', 'မြို့နယ် ရွေးချယ်ပါ'),
    selectCountry: t('Select Country', 'နိုင်ငံ ရွေးချယ်ပါ')
  };

  return {
    language,
    setLanguage,
    t,
    dictionary,
    myanmarData: MYANMAR_DATA,
    internationalDestinations: INTERNATIONAL_DESTINATIONS,
    calculateDomestic,
    calculateInternational,
    calculateVolumeWeight
  };
}
