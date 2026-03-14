import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  Building2, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  branch_id: string | null;
  is_active: boolean;
  is_demo: boolean;
  branches: {
    name: string;
  } | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Logic
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles') // or 'user_profiles' depending on your exact table name
        .select(`
          id,
          full_name,
          role,
          branch_id,
          is_active,
          is_demo,
          branches(name)
        `)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Filter Logic
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-white/40 text-sm">Manage access, roles, and branch assignments.</p>
        </div>
        
        {/* Permission-Gated Action Button */}
        <div className="flex items-center gap-3">
           <Button 
             className="bg-emerald-600 hover:bg-emerald-500 text-white"
             requiredPermission="users.create"
           >
             <Plus className="mr-2 h-4 w-4" />
             Add User
           </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-white/40 uppercase text-xs font-medium tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    Loading directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-medium border border-white/10">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.full_name}</p>
                          <p className="text-xs text-white/40">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-luxury-gold" />
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded text-xs font-medium border
                          ${user.role === 'APP_OWNER' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            user.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-slate-700/50 text-slate-300 border-slate-600/50'}
                        `}>
                          {user.role}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <Building2 className="h-3 w-3" />
                        {user.branches?.name || <span className="text-white/30 italic">Global</span>}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {/* Active Status */}
                        <div className="flex items-center gap-1.5">
                          {user.is_active ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={user.is_active ? "text-emerald-400" : "text-red-400"}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {/* Demo Flag */}
                        {user.is_demo && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded w-fit border border-purple-500/30">
                            DEMO MODE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* Permission-Gated Edit Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        requiredPermission="users.manage"
                      >
                        <MoreHorizontal className="h-4 w-4 text-white/60" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}