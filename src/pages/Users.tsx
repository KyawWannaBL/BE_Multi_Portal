import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  ShieldCheck,
  Users as UsersIcon,
  UserCheck,
  Truck,
  Building2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Power
} from 'lucide-react';
import { 
  User, 
  USER_ROLES, 
  UserRole 
} from '@/lib/index';
import { useEnterpriseUsers } from '@/hooks/useEnterpriseUsers';
import { useEnterpriseBranches } from '@/hooks/useEnterpriseBranches';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function Users() {
  const { data: users = [], isLoading: usersLoading } = useEnterpriseUsers();
  const { data: branches = [] } = useEnterpriseBranches();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
      case USER_ROLES.ADMIN:
        return 'destructive';
      case USER_ROLES.MERCHANT:
        return 'outline';
      case USER_ROLES.RIDER:
        return 'secondary';
      case USER_ROLES.WAREHOUSE:
        return 'default';
      default:
        return 'outline';
    }
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'N/A';
    return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
  };

  const columns = [
    {
      header: 'User',
      accessorKey: 'fullName',
      cell: (row: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={row.avatarUrl} alt={row.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{row.fullName}</span>
            <span className="text-xs text-muted-foreground">ID: {row.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Information',
      accessorKey: 'email',
      cell: (row: User) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.email}</span>
          </div>
          {row.phoneNumber && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{row.phoneNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Role & Permissions',
      accessorKey: 'role',
      cell: (row: User) => (
        <Badge 
          variant={getRoleBadgeVariant(row.role)} 
          className="capitalize font-medium"
        >
          {row.role.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Assigned Branch',
      accessorKey: 'branchId',
      cell: (row: User) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{getBranchName(row.branchId)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: User) => (
        <Badge 
          className={row.status === 'active' 
            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' 
            : 'bg-muted text-muted-foreground'}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" /> Permissions
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Power className="mr-2 h-4 w-4" /> {row.status === 'active' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <UsersIcon className="h-5 w-5" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Accounts',
      value: users.filter(u => u.status === 'active').length,
      icon: <UserCheck className="h-5 w-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Riders',
      value: users.filter(u => u.role === USER_ROLES.RIDER).length,
      icon: <Truck className="h-5 w-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Administrators',
      value: users.filter(u => u.role === USER_ROLES.SUPER_ADMIN || u.role === USER_ROLES.ADMIN).length,
      icon: <ShieldCheck className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system access, roles, and branch assignments for Britium Express employees and partners.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={staggerItem}>
            <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors group shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Table Section */}
      <Card className="border-border/50 shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">System Users</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..."
                  className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-background/50 border border-border/50 rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {Object.values(USER_ROLES).map(role => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DataTable 
              columns={columns} 
              data={filteredUsers} 
              searchPlaceholder="Filter users..."
            />
          </motion.div>
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="mt-auto pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>© 2026 Britium Express Logistics System. All rights reserved.</p>
      </div>
    </div>
  );
}
