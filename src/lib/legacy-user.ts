// Utility functions for backward compatibility with existing code
import { User as FirebaseUser } from 'firebase/auth';

// Legacy User interface for backward compatibility
export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
  batchId?: string;
}

// Convert Firebase User + UserData to Legacy User format
export const createLegacyUser = (firebaseUser: FirebaseUser | null, userData: any): LegacyUser | null => {
  if (!firebaseUser || !userData) return null;
  
  return {
    id: firebaseUser.uid,
    name: userData.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    role: userData.role || 'CUSTOMER',
    permissions: userData.permissions || [],
    isActive: userData.isActive || true,
    createdAt: userData.createdAt || new Date(),
    lastLogin: userData.lastLoginAt || new Date(),
    batchId: userData.batchId || undefined
  };
};

// Hook for backward compatibility
export const useLegacyUser = () => {
  // This would be imported from the actual auth hook
  // For now, return null to prevent errors
  return null;
};