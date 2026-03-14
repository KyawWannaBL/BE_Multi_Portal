import { motion } from 'framer-motion';
import { Package, Users, Star, TrendingUp } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/motion';

export default function AdminDashboard() {
  return (
    <motion.div 
      variants={staggerContainer} initial="hidden" animate="visible"
      className="p-8 space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Total Revenue KPI Card */}
        <motion.div variants={fadeInUp} className="dashboard-card bg-navy-900 text-white p-6 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gold-500/20 rounded-xl"><Package className="text-gold-500" /></div>
            <TrendingUp className="text-emerald-400 h-5 w-5" />
          </div>
          <div className="text-3xl font-bold font-display">MMK 45.6M</div>
          <p className="text-navy-300 text-sm mt-2">Total Monthly Revenue</p>
        </motion.div>

        {/* Active Users KPI Card */}
        <motion.div variants={fadeInUp} className="dashboard-card bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Users className="text-blue-600" /></div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">+12%</span>
          </div>
          <div className="text-3xl font-bold">1,248</div>
          <p className="text-slate-500 text-sm mt-2">Active Logistics Riders</p>
        </motion.div>

        {/* Customer Satisfaction KPI Card */}
        <motion.div variants={fadeInUp} className="dashboard-card bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><Star className="text-amber-600" /></div>
          </div>
          <div className="text-3xl font-bold">4.9 / 5.0</div>
          <p className="text-slate-500 text-sm mt-2">Merchant Satisfaction Rating</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
