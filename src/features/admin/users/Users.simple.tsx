import React from 'react';
import { Users as UsersIcon, UserPlus, Shield, Activity } from 'lucide-react';

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <UsersIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">142</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New This Month</p>
              <p className="text-2xl font-bold">23</p>
            </div>
            <UserPlus className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Shield className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">JS</span>
              </div>
              <div>
                <h3 className="font-medium">John Smith</h3>
                <p className="text-sm text-muted-foreground">john.smith@britiumexpress.com</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Driver
              </span>
              <p className="text-sm text-muted-foreground mt-1">Active</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">MJ</span>
              </div>
              <div>
                <h3 className="font-medium">Mary Johnson</h3>
                <p className="text-sm text-muted-foreground">mary.johnson@britiumexpress.com</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Operations
              </span>
              <p className="text-sm text-muted-foreground mt-1">Active</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">DL</span>
              </div>
              <div>
                <h3 className="font-medium">David Lee</h3>
                <p className="text-sm text-muted-foreground">david.lee@britiumexpress.com</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Admin
              </span>
              <p className="text-sm text-muted-foreground mt-1">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Role Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <p className="text-2xl font-bold text-primary">45</p>
            <p className="text-sm text-muted-foreground">Drivers</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <p className="text-2xl font-bold text-blue-500">32</p>
            <p className="text-sm text-muted-foreground">Warehouse Staff</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <p className="text-2xl font-bold text-green-500">28</p>
            <p className="text-sm text-muted-foreground">Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}