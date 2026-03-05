import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Edit,
  Shield,
  Phone,
  Activity,
  Mail,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { USER_ROLES, type UserRole, type User, formatDate } from '@/lib/index';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@britium2026.com',
    role: 'SUPER_ADMIN',
    branch: 'Yangon HQ',
    phone: '+95 912345678',
    lastLogin: '2026-02-19T10:30:00Z',
  },
  {
    id: 'u2',
    name: 'Aye Aye',
    email: 'aye.aye@britium2026.com',
    role: 'OPERATIONS_ADMIN',
    branch: 'Mandalay Hub',
    phone: '+95 923456789',
    lastLogin: '2026-02-19T08:15:00Z',
  },
  {
    id: 'u3',
    name: 'Min Thu',
    email: 'min.thu@britium2026.com',
    role: 'RIDER',
    branch: 'Yangon South',
    phone: '+95 934567890',
    lastLogin: '2026-02-18T17:45:00Z',
  },
  {
    id: 'u4',
    name: 'Khin Khin',
    email: 'khin.khin@britium2026.com',
    role: 'WAREHOUSE_STAFF',
    branch: 'Yangon Central',
    phone: '+95 945678901',
    lastLogin: '2026-02-19T09:00:00Z',
  },
  {
    id: 'u5',
    name: 'Zarni',
    email: 'zarni@britium2026.com',
    role: 'DISPATCHER',
    branch: 'Naypyidaw',
    phone: '+95 956789012',
    lastLogin: '2026-02-19T11:20:00Z',
  },
];

export default function Users() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'WAREHOUSE_STAFF' as UserRole,
    branch: '',
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleCreateUser = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      branch: formData.branch,
      phone: formData.phone,
      lastLogin: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast({
      title: "User Created",
      description: `${formData.name} has been successfully added.`,
    });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, ...formData, id: selectedUser.id }
          : u
      )
    );
    setIsEditDialogOpen(false);
    resetForm();
    toast({
      title: "User Updated",
      description: "User permissions and info have been updated.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'WAREHOUSE_STAFF',
      branch: '',
    });
    setSelectedUser(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      branch: user.branch || '',
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage staff roles, access permissions, and branch assignments for 2026 operations.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="luxury-button h-12">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="luxury-glass border-border sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Create System User</DialogTitle>
              <DialogDescription>
                Onboard new personnel to the Britium Logistics network.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-xs font-bold uppercase tracking-widest">Name</Label>
                <Input
                  id="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="col-span-3 bg-background/50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-xs font-bold uppercase tracking-widest">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@britium.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="col-span-3 bg-background/50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right text-xs font-bold uppercase tracking-widest">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, role: val as UserRole }))}
                >
                  <SelectTrigger className="col-span-3 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(USER_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right text-xs font-bold uppercase tracking-widest">Branch</Label>
                <Input
                  id="branch"
                  placeholder="Hub Location"
                  value={formData.branch}
                  onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                  className="col-span-3 bg-background/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser}>Provision User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Total Personnel</CardTitle>
            <UsersIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active across 12 branches</p>
          </CardContent>
        </Card>
        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Admins</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {users.filter((u) => u.role.includes('ADMIN')).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">System controllers</p>
          </CardContent>
        </Card>
        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Online Now</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {Math.floor(users.length * 0.8)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Real-time activity</p>
          </CardContent>
        </Card>
        <Card className="luxury-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">System Health</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">99.9%</div>
            <p className="text-xs text-muted-foreground mt-1">Access stability</p>
          </CardContent>
        </Card>
      </div>

      <Card className="luxury-card overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-heading text-xl">Staff Directory</CardTitle>
              <CardDescription>Filter and manage access for the entire workforce.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-background/50">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.values(USER_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px] text-xs font-bold uppercase tracking-widest">User Identity</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest">Authorization</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest">Assignment</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest">Status / Last Activity</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-widest">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 border border-border group-hover:border-primary/50 transition-colors">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.role} type="user" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1.5 h-3.5 w-3.5" />
                          {user.branch || 'Global'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-foreground font-medium">Active</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            Last: {formatDate(user.lastLogin || '')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No staff members match the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="luxury-glass border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Modify User Authorization</DialogTitle>
            <DialogDescription>
              Update role, contact details, or branch for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold uppercase tracking-widest">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3 bg-background/50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold uppercase tracking-widest">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, role: val as UserRole }))}
              >
                <SelectTrigger className="col-span-3 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(USER_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold uppercase tracking-widest">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="col-span-3 bg-background/50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold uppercase tracking-widest">Branch</Label>
              <Input
                value={formData.branch}
                onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                className="col-span-3 bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Commit Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
