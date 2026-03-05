import { USER_ROLES, PERMISSIONS, User, UserRole } from './index';

/**
 * @file admin-system.ts
 * @description Core system configuration for advanced multi-tenant and multi-role logistics ecosystem.
 * Reflects 2026 state-of-the-art administrative controls and business hierarchies.
 */

export const ADMIN_ROLES = {
  APP_OWNER: 'App Owner',
  SUPER_ADMIN: 'Super Admin',
  FINANCE_ADMIN: 'Finance Admin',
} as const;

export const BUSINESS_ROLES = {
  MERCHANT: 'Merchant',
  MARKETING: 'Marketing Specialist',
  CUSTOMER_SERVICE: 'Customer Service',
} as const;

export const CUSTOMER_ROLES = {
  INDIVIDUAL_CUSTOMER: 'Customer',
} as const;

export type AdminRole = keyof typeof ADMIN_ROLES;
export type BusinessRole = keyof typeof BUSINESS_ROLES;
export type PortalRole = AdminRole | BusinessRole | keyof typeof CUSTOMER_ROLES;

export const ROUTE_PATHS_ADMIN = {
  SUPER_ADMIN: {
    DASHBOARD: '/admin/super-dashboard',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    HEALTH: '/admin/health',
  },
  APP_OWNER: {
    CONTROL_PANEL: '/admin/owner-panel',
    HIERARCHY: '/admin/hierarchy',
  },
  FINANCE: {
    DASHBOARD: '/finance/dashboard',
    MERCHANTS: '/finance/merchants',
    PAYMENTS: '/finance/payments',
    SETTLEMENTS: '/finance/settlements',
  },
  MERCHANT: {
    PORTAL: '/merchant/portal',
    ANALYTICS: '/merchant/analytics',
    SHIPMENTS: '/merchant/shipments',
    API: '/merchant/api-access',
  },
  MARKETING: {
    DASHBOARD: '/marketing/dashboard',
    CAMPAIGNS: '/marketing/campaigns',
    SEGMENTS: '/marketing/segments',
  },
  SERVICE: {
    DASHBOARD: '/service/dashboard',
    LIVE_CHAT: '/service/chat',
    TICKETS: '/service/tickets',
  },
  CUSTOMER: {
    PORTAL: '/customer/portal',
    TRACKING: '/customer/tracking',
    SUPPORT: '/customer/support',
    LOYALTY: '/customer/loyalty',
  },
} as const;

export const PERMISSIONS_MATRIX = {
  APP_DELETE: 'APP-DELETE', // Only for App Owner
  ADMIN_APPOINT: 'ADMIN-APPOINT', // Authority to appoint other admins
  SYSTEM_HEALTH_VIEW: 'SYSTEM-HEALTH-VIEW',
  REVENUE_ANALYTICS: 'REVENUE-ANALYTICS',
  MERCHANT_VERIFY: 'MERCHANT-VERIFY',
  PAYMENT_DISPUTE: 'PAYMENT-DISPUTE',
  CAMPAIGN_EXECUTE: 'CAMPAIGN-EXECUTE',
  USER_SEGMENT_VIEW: 'USER-SEGMENT-VIEW',
  LIVE_SUPPORT_ACCESS: 'LIVE-SUPPORT-ACCESS',
  ESCALATION_MANAGE: 'ESCALATION-MANAGE',
  GLOBAL_SEARCH: 'GLOBAL-SEARCH',
  AUDIT_LOGS_VIEW: 'AUDIT-LOGS-VIEW',
} as const;

export interface AppOwner extends Omit<User, 'role'> {
  role: 'APP_OWNER';
  ownerSince: string;
  isUltimateAuthority: true;
  deletionAuthKey?: string; // For critical app deletion workflow
}

export interface SuperAdmin extends Omit<User, 'role'> {
  role: 'SUPER_ADMIN';
  accessLevel: 5;
  regionScope: 'GLOBAL';
}

export interface FinanceAdmin extends Omit<User, 'role'> {
  role: 'FINANCE_ADMIN';
  department: 'Accounts Payable' | 'Accounts Receivable' | 'Settlement' | 'Audit';
  approvalLimit: number;
}

export interface Merchant extends Omit<User, 'role'> {
  role: 'MERCHANT';
  businessName: string;
  merchantId: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  apiKeys: { key: string; label: string; createdAt: string }[];
  pricingTier: 'Standard' | 'Premium' | 'Enterprise';
}

export interface Customer extends Omit<User, 'role'> {
  role: 'INDIVIDUAL_CUSTOMER';
  loyaltyPoints: number;
  defaultAddressId?: string;
  memberSince: string;
}

export interface MarketingUser extends Omit<User, 'role'> {
  role: 'MARKETING';
  campaignsManaged: string[];
  specialization: 'SEO' | 'Retention' | 'Acquisition';
}

export interface CustomerService extends Omit<User, 'role'> {
  role: 'CUSTOMER_SERVICE';
  averageResponseTime: number;
  assignedQueues: string[];
  isSenior: boolean;
}

// Extension to the base permission set
export const ALL_SYSTEM_PERMISSIONS = {
  ...PERMISSIONS,
  ...PERMISSIONS_MATRIX,
};

/**
 * Default Permission Assignment logic for 2026 Logistics Engine
 */
export const getRolePermissions = (role: string): string[] => {
  const base = Object.values(PERMISSIONS);
  
  switch (role) {
    case 'APP_OWNER':
      return [...base, ...Object.values(PERMISSIONS_MATRIX)];
    case 'SUPER_ADMIN':
      return [...base, ...Object.values(PERMISSIONS_MATRIX)].filter(p => p !== PERMISSIONS_MATRIX.APP_DELETE);
    case 'FINANCE_ADMIN':
      return [
        PERMISSIONS.AUD_VIEW, 
        PERMISSIONS_MATRIX.REVENUE_ANALYTICS, 
        PERMISSIONS_MATRIX.MERCHANT_VERIFY, 
        PERMISSIONS_MATRIX.PAYMENT_DISPUTE,
        PERMISSIONS_MATRIX.AUDIT_LOGS_VIEW
      ];
    case 'MERCHANT':
      return [PERMISSIONS.TAG_VIEW, PERMISSIONS.NDR_CREATE];
    case 'MARKETING':
      return [PERMISSIONS_MATRIX.CAMPAIGN_EXECUTE, PERMISSIONS_MATRIX.USER_SEGMENT_VIEW];
    case 'CUSTOMER_SERVICE':
      return [
        PERMISSIONS_MATRIX.LIVE_SUPPORT_ACCESS, 
        PERMISSIONS_MATRIX.ESCALATION_MANAGE, 
        PERMISSIONS.AUD_VIEW
      ];
    default:
      return [];
  }
};
