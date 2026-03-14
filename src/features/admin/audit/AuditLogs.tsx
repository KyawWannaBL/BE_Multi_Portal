import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Database, 
  Building2,
  Clock,
  ArrowDownCircle 
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action: string; 
  table_name: string;
  branch_id?: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterUser, setFilterUser] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterUser) query = query.eq('user_id', filterUser);
      if (filterBranch) query = query.eq('branch_id', filterBranch);
      if (filterTable) query = query.ilike('table_name', `%${filterTable}%`);
      
      if (filterDate) {
        const start = new Date(filterDate).toISOString();
        const end = new Date(new Date(filterDate).setHours(23, 59, 59, 999)).toISOString();
        query = query.gte('created_at', start).lte('created_at', end);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            System Audit Logs
          </h1>
          <p className="text-white/40 text-sm">Track all modifications and security events.</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <ArrowDownCircle className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/80 p-4 rounded-xl border border-white/10 shrink-0">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input 
            type="text" 
            placeholder="User ID..." 
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white"
          />
        </div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Branch ID..." 
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white"
          />
        </div>
        <div className="relative">
          <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white appearance-none"
          >
            <option value="">All Tables</option>
            <option value="profiles">Profiles</option>
            <option value="shipments">Shipments</option>
            <option value="inventory">Inventory</option>
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto bg-black/20 rounded-xl border border-white/5 p-4 space-y-2">
        {loading ? (
          <div className="text-center py-20 text-white/30 animate-pulse">Scanning audit trails...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-white/30">No audit records found.</div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="group bg-slate-900/40 border border-white/5 p-3 rounded-lg hover:bg-white/5 transition-all text-sm font-mono"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.action === 'INSERT' ? 'bg-emerald-500/10 text-emerald-400' : 
                    log.action === 'DELETE' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-emerald-500 font-semibold">{log.table_name}</span>
                  <span className="text-white/30">#{log.record_id?.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.user_id?.slice(0, 8)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(log.created_at), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
              <div className="pl-2 border-l-2 border-white/10 text-xs text-white/60 truncate">
                <span className="text-white/30">DATA: </span> {JSON.stringify(log.new_data || log.old_data || {})}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}