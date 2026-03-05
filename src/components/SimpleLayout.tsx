import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  Warehouse as WarehouseIcon,
  MapPin,
  BarChart3,
  Settings,
  Menu,
  X,
  Users,
  CreditCard,
  QrCode,
  Zap,
  Calculator,
  Briefcase
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';

const navigationItems = [
  { label: 'Dashboard', href: ROUTE_PATHS.DASHBOARD, icon: LayoutDashboard },
  { label: 'Operations', href: ROUTE_PATHS.OPERATIONS, icon: Briefcase },
  { label: 'Shipments', href: ROUTE_PATHS.SHIPMENTS, icon: Package },
  { label: 'Fleet', href: ROUTE_PATHS.FLEET, icon: Truck },
  { label: 'Warehouse', href: ROUTE_PATHS.WAREHOUSE, icon: WarehouseIcon },
  { label: 'Delivery', href: ROUTE_PATHS.DELIVERY, icon: MapPin },
  { label: 'Analytics', href: ROUTE_PATHS.ANALYTICS, icon: BarChart3 },
  { label: 'Users', href: ROUTE_PATHS.USERS, icon: Users },
  { label: 'Finance', href: ROUTE_PATHS.FINANCE, icon: CreditCard },
  { label: 'Parcel Pickup', href: ROUTE_PATHS.PARCEL_PICKUP, icon: QrCode },
  { label: 'Advanced Logistics', href: ROUTE_PATHS.ADVANCED_LOGISTICS, icon: Zap },
  { label: 'Shipping Calculator', href: ROUTE_PATHS.SHIPPING_CALCULATOR, icon: Calculator },
  { label: 'Settings', href: ROUTE_PATHS.SETTINGS, icon: Settings },
];

export function SimpleLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-card border-r border-border overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6">
            <Link to={ROUTE_PATHS.DASHBOARD} className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary">Britium Express</span>
                <span className="text-xs text-muted-foreground">Enterprise Logistics</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between flex-shrink-0 px-6 py-6">
            <Link to={ROUTE_PATHS.DASHBOARD} className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">B</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary">Britium Express</span>
                <span className="text-xs text-muted-foreground">Enterprise Logistics</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="flex items-center justify-between flex-shrink-0 px-6 py-4 bg-card border-b border-border">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Britium Express</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">System Administrator</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}