import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Bell,
  Globe,
  Shield,
  Users,
  Settings as SettingsIcon,
  Save,
  Mail,
  Phone,
  Plus,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Smartphone,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  USER_ROLES, 
  User, 
  UserRole, 
  ROUTE_PATHS 
} from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

/**
 * System Settings Page
 * Handles user profile, security, notifications, and enterprise user management.
 * Current Year: 2026
 */
const Settings: React.FC = () => {
  const { language } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  // Mock user for demonstration since useAuth is not available in provided imports
  const currentUser: User = {
    id: 'ADMIN-001',
    name: 'Kyaw Zayar',
    email: 'k.zayar@britium.enterprise',
    role: USER_ROLES.SUPER_ADMIN as UserRole,
    branch: 'Yangon Central Hub',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
  };

  const isAdmin = currentUser.role === USER_ROLES.SUPER_ADMIN;

  // Mock team members for admin management view
  const [mockUsers, setMockUsers] = useState<User[]>([
    { id: '1', name: 'Alex Thompson', email: 'alex.t@britium.logistics', role: USER_ROLES.OPERATIONS_ADMIN as UserRole, branch: 'Yangon Hub' },
    { id: '2', name: 'Sarah Chen', email: 's.chen@britium.logistics', role: USER_ROLES.DISPATCHER as UserRole, branch: 'Mandalay Hub' },
    { id: '3', name: 'Mike Rodriguez', email: 'mike.r@britium.logistics', role: USER_ROLES.RIDER as UserRole, branch: 'Naypyidaw Station' },
    { id: '4', name: 'Elena Petrova', email: 'e.petrova@britium.logistics', role: USER_ROLES.WAREHOUSE_STAFF as UserRole, branch: 'Yangon Hub' },
  ]);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(language === 'en' ? 'Settings updated successfully' : 'ဆက်တင်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ', {
        description: language === 'en' ? 'Your changes have been synced across the platform.' : 'သင်၏ ပြောင်းလဲမှုများကို စနစ်အတွင်း ထည့်သွင်းပြီးပါပြီ။',
        icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-heading">
            {language === 'en' ? 'System Settings' : 'စနစ်ဆက်တင်များ'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage your personal account, security preferences, and enterprise-wide configurations.' 
              : 'ကိုယ်ပိုင်အကောင့်၊ လုံခြုံရေးနှင့် လုပ်ငန်းတစ်ခုလုံးဆိုင်ရာ ဆက်တင်များကို စီမံခန့်ခွဲပါ။'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="luxury-button h-11 px-8"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <SettingsIcon className="h-4 w-4" />
              </motion.div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving 
              ? (language === 'en' ? 'Saving...' : 'သိမ်းဆည်းနေဆဲ...') 
              : (language === 'en' ? 'Save All Changes' : 'အားလုံးသိမ်းဆည်းမည်')}
          </Button>
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full space-y-8">
        <TabsList className="w-full md:w-auto luxury-glass p-1 border-border/40">
          <TabsTrigger value="profile" className="flex items-center gap-2 px-6">
            <UserIcon className="h-4 w-4" /> {language === 'en' ? 'Profile' : 'ကိုယ်ရေးအကျဉ်း'}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 px-6">
            <Lock className="h-4 w-4" /> {language === 'en' ? 'Security' : 'လုံခြုံရေး'}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 px-6">
            <Bell className="h-4 w-4" /> {language === 'en' ? 'Notifications' : 'အသိပေးချက်များ'}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2 px-6">
              <Users className="h-4 w-4" /> {language === 'en' ? 'Team' : 'အဖွဲ့ဝင်များ'}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Section */}
        <TabsContent value="profile" className="animate-in fade-in-50 duration-500">
          <Card className="luxury-card overflow-hidden border-border/50 shadow-xl">
            <CardHeader className="bg-muted/30 pb-8">
              <CardTitle className="text-2xl">{language === 'en' ? 'Personal Information' : 'ကိုယ်ရေးအချက်အလက်'}</CardTitle>
              <CardDescription>{language === 'en' ? 'Update your public profile and contact details.' : 'သင်၏ အချက်အလက်များကို ဤနေရာတွင် ပြင်ဆင်နိုင်သည်။'}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                      {currentUser.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 shadow-lg border-2 border-background">
                    <Plus className="h-5 w-5 text-primary" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-semibold">{language === 'en' ? 'Profile Photo' : 'ကိုယ်ရေးပုံ'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'Recommended: PNG, JPG (Max 5MB). Square aspect ratio preferred.' : 'အကြံပြုချက် - PNG၊ JPG (အများဆုံး 5MB)။ စတုရန်းပုံစံ ပိုကောင်းသည်။'}</p>
                  <div className="flex justify-center md:justify-start gap-3 mt-4">
                    <Button variant="outline" size="sm">{language === 'en' ? 'Upload New' : 'ပုံအသစ်တင်မည်'}</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">{language === 'en' ? 'Remove' : 'ဖျက်မည်'}</Button>
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-medium">{language === 'en' ? 'Full Name' : 'အမည်အပြည့်အစုံ'}</Label>
                  <Input id="fullName" defaultValue={currentUser.name} className="bg-muted/20 border-border/40 focus:ring-primary h-11" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">{language === 'en' ? 'Email Address' : 'အီးမေးလ်လိပ်စာ'}</Label>
                  <Input id="email" type="email" defaultValue={currentUser.email} disabled className="bg-muted/10 border-border/20 text-muted-foreground h-11 cursor-not-allowed" />
                  <p className="text-[11px] text-muted-foreground italic">* {language === 'en' ? 'Email changes require administrative verification.' : 'အီးမေးလ် ပြောင်းလဲရန် စီမံခန့်ခွဲသူ၏ အတည်ပြုချက် လိုအပ်ပါသည်။'}</p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium">{language === 'en' ? 'Phone Number' : 'ဖုန်းနံပါတ်'}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-10 bg-muted/20 border-border/40 h-11" defaultValue="+95 9 794 60123" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="branch" className="text-sm font-medium">{language === 'en' ? 'Primary Branch' : 'အဓိက ဌာနခွဲ'}</Label>
                  <Select defaultValue={currentUser.branch}>
                    <SelectTrigger className="bg-muted/20 border-border/40 h-11">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yangon Central Hub">Yangon Central Hub (HQ)</SelectItem>
                      <SelectItem value="Mandalay Hub">Mandalay Hub</SelectItem>
                      <SelectItem value="Naypyidaw Station">Naypyidaw Station</SelectItem>
                      <SelectItem value="Taunggyi Substation">Taunggyi Substation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Section */}
        <TabsContent value="security" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 luxury-card">
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Password & Authentication' : 'စကားဝှက်နှင့် လုံခြုံရေး'}</CardTitle>
                <CardDescription>{language === 'en' ? 'Ensure your account remains secure with a strong password.' : 'ခိုင်မာသော စကားဝှက်ဖြင့် အကောင့်ကို လုံခြုံအောင် ပြုလုပ်ပါ။'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{language === 'en' ? 'Current Password' : 'လက်ရှိစကားဝှက်'}</Label>
                    <Input id="currentPassword" type="password" className="bg-muted/20" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{language === 'en' ? 'New Password' : 'စကားဝှက်အသစ်'}</Label>
                      <Input id="newPassword" type="password" className="bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{language === 'en' ? 'Confirm New Password' : 'စကားဝှက်အသစ်ကို အတည်ပြုပါ'}</Label>
                      <Input id="confirmPassword" type="password" className="bg-muted/20" />
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5">{language === 'en' ? 'Update Password' : 'စကားဝှက် ပြောင်းလဲမည်'}</Button>
              </CardContent>
            </Card>

            <Card className="luxury-card bg-muted/5">
              <CardHeader>
                <CardTitle className="text-lg">{language === 'en' ? 'Active Sessions' : 'လက်ရှိအသုံးပြုမှုများ'}</CardTitle>
                <CardDescription>{language === 'en' ? 'Devices currently logged into your account.' : 'လက်ရှိ အသုံးပြုနေသော စက်ပစ္စည်းများ။'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-4 p-3 rounded-lg bg-background/40 border border-border/20">
                  <div className="bg-primary/10 p-2.5 rounded-full">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Yangon, Myanmar (Current)</p>
                    <p className="text-xs text-muted-foreground">Chrome • macOS 16 • Feb 19, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-background/40 border border-border/20">
                  <div className="bg-muted p-2.5 rounded-full">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Mobile App - iPhone 17 Pro</p>
                    <p className="text-xs text-muted-foreground">iOS Britium App • Feb 17, 2026</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs text-destructive hover:bg-destructive/5">
                  {language === 'en' ? 'Terminate All Other Sessions' : 'အခြားစက်များအားလုံးမှ ထွက်မည်'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="luxury-card border-primary/20">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-semibold">{language === 'en' ? 'Two-Factor Authentication (2FA)' : 'အဆင့်နှစ်ဆင့် လုံခြုံရေး (2FA)'}</Label>
                    <Badge className="bg-primary/20 text-primary border-primary/30">{language === 'en' ? 'HIGHLY SECURE' : 'အလွန်လုံခြုံသည်'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'Add an extra layer of security by requiring a code from your mobile device.' : 'ဖုန်းမှ ကုဒ်တစ်ခု ထပ်မံတောင်းဆိုခြင်းဖြင့် အကောင့်ကို ပိုမိုလုံခြုံအောင် လုပ်ပါ။'}</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Section */}
        <TabsContent value="notifications" className="space-y-8 animate-in zoom-in-95 duration-500">
          <Card className="luxury-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Notification Preferences' : 'အသိပေးချက် ဆက်တင်များ'}</CardTitle>
              <CardDescription>{language === 'en' ? 'Control how and when you receive critical system updates.' : 'စနစ်အသိပေးချက်များကို မည်သို့လက်ခံရယူမည်ကို စိတ်ကြိုက်ရွေးချယ်ပါ။'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{language === 'en' ? 'Shipment Alerts' : 'ပို့ဆောင်မှု အသိပေးချက်များ'}</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">{language === 'en' ? 'Critical Exceptions' : 'အရေးကြီးသော အမှားအယွင်းများ'}</Label>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Immediate alerts for lost, damaged, or delayed high-priority cargo.' : 'ပျောက်ဆုံး၊ ပျက်စီး သို့မဟုတ် နောက်ကျနေသော ကုန်စည်များအတွက် ချက်ချင်းအသိပေးမည်။'}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">{language === 'en' ? 'Fleet Performance Reports' : 'ယာဉ်စုစွမ်းဆောင်ရည် အစီရင်ခံစာ'}</Label>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Daily summary of delivery metrics and rider efficiency.' : 'ပို့ဆောင်မှုနှုန်းနှင့် ဝန်ထမ်းစွမ်းဆောင်ရည် နေ့စဉ်အကျဉ်းချုပ်။'}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">{language === 'en' ? 'Warehouse Capacity Alerts' : 'ဂိုဒေါင်ပမာဏ အသိပေးချက်'}</Label>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Get notified when a hub reaches 85% storage capacity.' : 'ဂိုဒေါင် ၈၅% ပြည့်ပါက အသိပေးချက် လက်ခံရယူမည်။'}</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator className="my-8" />

                <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{language === 'en' ? 'Communication Channels' : 'ဆက်သွယ်ရေး လမ်းကြောင်းများ'}</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full"><Mail className="h-5 w-5 text-primary" /></div>
                      <div className="space-y-1">
                        <Label className="text-base">{language === 'en' ? 'Email Digest' : 'အီးမေးလ် အကျဉ်းချုပ်'}</Label>
                        <p className="text-xs text-muted-foreground">{language === 'en' ? 'Detailed weekly business intelligence reports.' : 'အပတ်စဉ် စီးပွားရေးဆိုင်ရာ အသေးစိတ် အစီရင်ခံစာများ။'}</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-3 rounded-full"><Phone className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="space-y-1">
                        <Label className="text-base">{language === 'en' ? 'Direct SMS' : 'တိုက်ရိုက် SMS'}</Label>
                        <p className="text-xs text-muted-foreground">{language === 'en' ? 'Urgent security and operational alerts via SMS.' : 'အရေးပေါ် လုံခြုံရေးနှင့် လုပ်ငန်းဆိုင်ရာ အချက်အလက်များကို SMS ဖြင့် ပို့မည်။'}</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management Section (Admin Only) */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <Card className="luxury-card">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{language === 'en' ? 'Enterprise Team Management' : 'လုပ်ငန်းသုံး အဖွဲ့စီမံခန့်ခွဲမှု'}</CardTitle>
                  <CardDescription>{language === 'en' ? 'Add, edit, or remove staff members and configure granular permissions.' : 'ဝန်ထမ်းများအား ပေါင်းထည့်ခြင်း၊ ပြင်ဆင်ခြင်းနှင့် ခွင့်ပြုချက်များ သတ်မှတ်ခြင်း။'}</CardDescription>
                </div>
                <Button className="luxury-button h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" /> {language === 'en' ? 'Invite Member' : 'အဖွဲ့ဝင်ဖိတ်ခေါ်မည်'}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-y border-border/30">
                        <th className="text-left p-5 font-bold text-xs uppercase tracking-wider">{language === 'en' ? 'Staff Member' : 'ဝန်ထမ်းအမည်'}</th>
                        <th className="text-left p-5 font-bold text-xs uppercase tracking-wider">{language === 'en' ? 'System Role' : 'ရာထူး'}</th>
                        <th className="text-left p-5 font-bold text-xs uppercase tracking-wider">{language === 'en' ? 'Primary Branch' : 'ဌာနခွဲ'}</th>
                        <th className="text-right p-5 font-bold text-xs uppercase tracking-wider">{language === 'en' ? 'Actions' : 'လုပ်ဆောင်ချက်'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {mockUsers.map((staff) => (
                        <tr key={staff.id} className="hover:bg-primary/5 transition-all duration-300">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border border-primary/10">
                                <AvatarFallback className="text-xs font-bold bg-primary/5 text-primary">{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-0.5">
                                <p className="font-semibold">{staff.name}</p>
                                <p className="text-xs text-muted-foreground">{staff.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-tighter py-1">
                              {staff.role}
                            </Badge>
                          </td>
                          <td className="p-5 text-muted-foreground font-medium">{staff.branch}</td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-lg">{language === 'en' ? 'Role Capabilities' : 'ရာထူးအလိုက် ခွင့်ပြုချက်များ'}</CardTitle>
                  <CardDescription>{language === 'en' ? 'Define global permissions for each system role.' : 'စနစ်ရာထူးတစ်ခုချင်းစီအတွက် ခွင့်ပြုချက်များကို သတ်မှတ်ပါ။'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(USER_ROLES).slice(0, 5).map((role) => (
                    <div key={role} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/5 hover:border-primary/30 transition-colors">
                      <span className="text-sm font-bold tracking-tight">{role.replace('_', ' ')}</span>
                      <Button variant="link" size="sm" className="text-primary font-bold uppercase text-[10px] tracking-widest">
                        {language === 'en' ? 'Manage' : 'စီမံမည်'}
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">
                    {language === 'en' ? 'View All Roles' : 'ရာထူးအားလုံးကြည့်မည်'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-lg">{language === 'en' ? 'Global Platform Preferences' : 'စနစ်တစ်ခုလုံးဆိုင်ရာ ဆက်တင်များ'}</CardTitle>
                  <CardDescription>{language === 'en' ? 'Enterprise-level configurations for all users.' : 'အသုံးပြုသူအားလုံးအတွက် စနစ်ဆိုင်ရာ ဆက်တင်များ။'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{language === 'en' ? 'Standard Weight Unit' : 'အလေးချိန် ယူနစ်'}</Label>
                    <Select defaultValue="kg">
                      <SelectTrigger className="h-11 bg-muted/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="metric_tons">Metric Tons (t)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{language === 'en' ? 'System Timezone' : 'စနစ်စံတော်ချိန်'}</Label>
                    <Select defaultValue="mmt">
                      <SelectTrigger className="h-11 bg-muted/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mmt">Myanmar Time (UTC +6:30)</SelectItem>
                        <SelectItem value="gmt">Greenwich Mean Time (UTC)</SelectItem>
                        <SelectItem value="est">Eastern Standard Time (New York)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">{language === 'en' ? 'Advanced Audit Logging' : 'အဆင့်မြင့် စစ်ဆေးမှုမှတ်တမ်း'}</Label>
                      <p className="text-xs text-muted-foreground">{language === 'en' ? 'Track every single data change across the system.' : 'စနစ်အတွင်း ပြောင်းလဲမှုအားလုံးကို မှတ်တမ်းတင်မည်။'}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <footer className="mt-16 pt-8 border-t border-border/20 text-center space-y-2">
        <p className="text-sm text-muted-foreground font-medium italic">
          © 2026 Britium Enterprise Fleet Logistics. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-muted-foreground/60">
          <span>CORE VERSION: 8.4.2-LTS</span>
          <span className="h-1 w-1 rounded-full bg-border/40" />
          <span>BUILD: 20260219-PROD</span>
          <span className="h-1 w-1 rounded-full bg-border/40" />
          <span>STATUS: SECURE</span>
        </div>
      </footer>
    </div>
  );
};

export default Settings;