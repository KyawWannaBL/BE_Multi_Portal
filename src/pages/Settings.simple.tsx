import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system preferences and account settings
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Account Settings</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Profile Information</span>
              <button className="text-primary text-sm hover:underline">Edit</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Change Password</span>
              <button className="text-primary text-sm hover:underline">Update</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Email Preferences</span>
              <button className="text-primary text-sm hover:underline">Configure</button>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Email Notifications</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">SMS Alerts</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Push Notifications</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Two-Factor Authentication</span>
              <button className="text-primary text-sm hover:underline">Enable</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Login History</span>
              <button className="text-primary text-sm hover:underline">View</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Keys</span>
              <button className="text-primary text-sm hover:underline">Manage</button>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">System Preferences</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Language</span>
              <select className="text-sm border rounded px-2 py-1">
                <option>English</option>
                <option>Myanmar</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Time Zone</span>
              <select className="text-sm border rounded px-2 py-1">
                <option>Asia/Yangon</option>
                <option>UTC</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Theme</span>
              <select className="text-sm border rounded px-2 py-1">
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium">v2.1.0</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">February 19, 2026</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Environment</p>
            <p className="font-medium">Production</p>
          </div>
        </div>
      </div>
    </div>
  );
}