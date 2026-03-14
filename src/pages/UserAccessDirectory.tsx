import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Key, MapPin, Activity } from 'lucide-react';

export default function UserAccessDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('role', { ascending: true });
    
    if (data) setUsers(data);
    setIsLoading(false);
  }

  // Helper to visually map roles to L-Tiers
  const getAccessLevel = (role: string) => {
    if (role.includes('super_admin') || role.includes('SUPER_ADMIN')) return 'L5 (Global Command)';
    if (role.includes('admin') || role.includes('MANAGER') || role.includes('manager')) return 'L4 (Regional / Hub)';
    if (role.includes('merchant')) return 'L3 (External Partner)';
    if (role.includes('rider') || role.includes('warehouse') || role.includes('STAFF')) return 'L2 (Operations)';
    return 'L1 (Departmental)';
  };

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Users className="h-10 w-10 text-rose-500" /> User Access Directory
          </h1>
          <p className="text-rose-500 font-mono text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
            L5_SYS_ADMIN • IDENTITY & CREDENTIAL OVERSIGHT
          </p>
        </div>
        <Button onClick={fetchUsers} className="bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl">
          Refresh Directory
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 text-[10px] uppercase font-mono tracking-widest">
              <tr>
                <th className="p-6">Account Name & Email</th>
                <th className="p-6">Role & Access Level</th>
                <th className="p-6">Branch Assignment</th>
                <th className="p-6">Password Status</th>
                <th className="p-6">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading live accounts from Supabase...</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-white text-sm">{u.full_name}</p>
                      <p className="text-slate-500 text-xs">{u.email}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-sky-400 text-xs uppercase flex items-center gap-1">
                        <Shield className="h-3 w-3"/> {u.role}
                      </p>
                      <p className="text-slate-500 text-[10px] uppercase mt-1">{getAccessLevel(u.role)}</p>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-bold border border-white/10">
                        <MapPin className="inline h-3 w-3 mr-1"/> {u.hub_assignment || 'Global'}
                      </span>
                    </td>
                    <td className="p-6">
                      {u.must_change_password ? (
                        <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
                          <Key className="h-3 w-3"/> Default (britium2026)
                        </span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                          <Key className="h-3 w-3"/> Secured / Updated
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <Activity className="inline h-3 w-3 mr-1"/> {u.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
