import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Check, AlertCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Assuming you have a toast library, or use console.log

// Define system roles (Modify as needed for your app)
const SYSTEM_ROLES = ['APP_OWNER', 'MANAGER', 'DRIVER', 'USER'];

interface Permission {
  id: string;
  code: string;
  description: string;
}

export default function PermissionAssignment() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('MANAGER');
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // 1. Fetch all available system permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('code');
      
      if (error) console.error('Error fetching permissions:', error);
      else setPermissions(data || []);
    };

    fetchPermissions();
  }, []);

  // 2. Fetch assigned permissions whenever the selected role changes
  useEffect(() => {
    const fetchRolePermissions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role', selectedRole);

        if (error) throw error;

        // Create a Set of IDs for O(1) lookups
        const ids = new Set((data || []).map((rp: any) => rp.permission_id));
        setAssignedPermissionIds(ids);
      } catch (error) {
        console.error('Error fetching role permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRole) {
      fetchRolePermissions();
    }
  }, [selectedRole]);

  // 3. Toggle Logic (Insert or Delete)
  const handleToggle = async (permissionId: string) => {
    const isAssigned = assignedPermissionIds.has(permissionId);
    setUpdating(permissionId); // Show loading state for specific item

    try {
      if (isAssigned) {
        // DELETE logic
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', selectedRole)
          .eq('permission_id', permissionId);

        if (error) throw error;
        
        // Update local state
        const next = new Set(assignedPermissionIds);
        next.delete(permissionId);
        setAssignedPermissionIds(next);
        toast.success(`Removed permission from ${selectedRole}`);

      } else {
        // INSERT logic
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role: selectedRole,
            permission_id: permissionId
          });

        if (error) throw error;

        // Update local state
        const next = new Set(assignedPermissionIds);
        next.add(permissionId);
        setAssignedPermissionIds(next);
        toast.success(`Added permission to ${selectedRole}`);
      }
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error('Failed to update permission');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Access Control</h1>
        <p className="text-white/40 text-sm">Configure permission sets for system roles.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Left Column: Role Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
              Select Role
            </h3>
            <div className="space-y-2">
              {SYSTEM_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    selectedRole === role
                      ? "bg-luxury-gold text-luxury-obsidian shadow-lg shadow-luxury-gold/20"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>{role}</span>
                  {selectedRole === role && <Shield className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
          
          {selectedRole === 'APP_OWNER' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/80">
                <strong>Note:</strong> The 'APP_OWNER' role typically bypasses checks in code, but you can still document permissions here for clarity.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Permissions for <span className="text-luxury-gold">{selectedRole}</span>
              </h2>
              <div className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                {assignedPermissionIds.size} Active Permissions
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {permissions.map((perm) => {
                  const isActive = assignedPermissionIds.has(perm.id);
                  const isUpdating = updating === perm.id;

                  return (
                    <div 
                      key={perm.id}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
                        isActive 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                          isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20"
                        )}>
                          <Lock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={cn(
                            "font-mono text-sm font-medium",
                            isActive ? "text-emerald-400" : "text-white/70"
                          )}>
                            {perm.code}
                          </p>
                          <p className="text-xs text-white/40">{perm.description}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={isActive}
                          onChange={() => handleToggle(perm.id)}
                          disabled={isUpdating}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}