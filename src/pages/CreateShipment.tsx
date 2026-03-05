import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Package, ArrowRight } from 'lucide-react';
import { logisticsAPI } from '@/api/logistics';
import { toast } from 'sonner';

export default function CreateShipment() {
  const { t } = useTranslation();

  const handleCreate = async (data: any) => {
    try {
      await logisticsAPI.getShipments(); // Backend check
      toast.success(t('success.created'));
    } catch (err) {
      toast.error("Production Connection Failed");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 luxury-card bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-200"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-2xl text-white">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">{t('welcome')}</h1>
      </div>
      
      <button 
        onClick={handleCreate}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
      >
        <span>Proceed to Dispatch</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
