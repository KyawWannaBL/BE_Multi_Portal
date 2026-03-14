import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Lock, 
  MapPin, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';

export default function CustomerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shopName: user?.full_name || 'Kyaw Wannanna',
    ownerName: 'Kyaw Wannanna',
    phone: user?.phone || '09897447744',
    email: user?.email || '',
    address: 'No. 277, Corner of Anawrahta Road and Bo Moe Gyo St.',
    township: 'East Dagon',
    city: 'Yangon',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    alert('Profile Updated Successfully!');
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Here you would typically send the data to your backend
    alert('Password Updated Successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(ROUTE_PATHS.CUSTOMER_DASHBOARD)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and account preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Picture & Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-32 h-32 border-4 border-gray-200">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {formData.shopName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full bg-gold hover:bg-gold/90 text-navy-900"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{formData.shopName}</h3>
              <p className="text-gray-600 text-sm">Online Shop Member</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload New Photo
              </Button>
              <input 
                id="imageUpload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
              />
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shop Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Shop Information
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shopName">Shop Name / Full Name</Label>
                    <Input 
                      id="shopName" 
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerName">Owner Name (Contact)</Label>
                    <Input 
                      id="ownerName" 
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number is your Login ID (Contact Admin to change).
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="shop@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-gold hover:bg-gold/90 text-navy-900">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Default Pickup Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Default Pickup Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                This address will be auto-filled when you book a new shipment.
              </p>
              
              <form className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Textarea 
                    id="address" 
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="township">Township</Label>
                    <Select value={formData.township} onValueChange={(value) => handleInputChange('township', value)} disabled={!isEditing}>
                      <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="East Dagon">East Dagon</SelectItem>
                        <SelectItem value="North Dagon">North Dagon</SelectItem>
                        <SelectItem value="South Dagon">South Dagon</SelectItem>
                        <SelectItem value="Thingangyun">Thingangyun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)} disabled={!isEditing}>
                      <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yangon">Yangon</SelectItem>
                        <SelectItem value="Mandalay">Mandalay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button variant="outline">
                      Update Address Only
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}