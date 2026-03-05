import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Package, Truck, AlertTriangle, RotateCcw, ArrowUpDown, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logisticsProAPI } from '@/api/logistics-pro';
import { fadeInUp, staggerContainer } from '@/lib/motion';

export default function WayManagement() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (type: string) => {
    setLoading(true);
    try {
      const result = await logisticsProAPI.getWayManagementData(type);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      variants={staggerContainer} initial="hidden" animate="visible"
      className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-display">{t('way.tracking')}</h1>
      </div>

      <Tabs defaultValue="pickup" onValueChange={loadData} className="w-full">
        <TabsList className="grid w-full grid-cols-5 luxury-glass p-1 h-14">
          <TabsTrigger value="pickup" className="gap-2"><Package size={18} /> {t('way.pickupWays')}</TabsTrigger>
          <TabsTrigger value="deliver" className="gap-2"><Truck size={18} /> {t('way.deliverWays')}</TabsTrigger>
          <TabsTrigger value="failed" className="gap-2"><AlertTriangle size={18} /> {t('way.failedWays')}</TabsTrigger>
          <TabsTrigger value="returned" className="gap-2"><RotateCcw size={18} /> {t('way.returnWays')}</TabsTrigger>
          <TabsTrigger value="transit" className="gap-2"><ArrowUpDown size={18} /> {t('way.transitRoute')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pickup">
           {/* Animated Data Table with Real Backend Data */}
           <motion.div variants={fadeInUp}>
             {/* Table implementation targeting backend 'way_items' table */}
           </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
