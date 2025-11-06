/**
 * usePermissions Hook
 * Provides permission checking functionality throughout the application
 */

import { useContext, createContext } from 'react';
import { Permission, RoleId } from '../constants/roles';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin as checkIsSuperAdmin,
  canManageUsers as checkCanManageUsers,
  canAssignRoles as checkCanAssignRoles,
} from '../utils/permissions';

export interface PermissionsContextValue {
  userRoles: RoleId[];
  permissions: Permission[];
  isSuperAdmin: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canManageUsers: boolean;
  canAssignRoles: boolean;
}

// Create context with default empty values
export const PermissionsContext = createContext<PermissionsContextValue>({
  userRoles: [],
  permissions: [],
  isSuperAdmin: false,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  canManageUsers: false,
  canAssignRoles: false,
});

/**
 * Hook to access user permissions
 * Must be used within a PermissionsProvider
 */
export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }

  return context;
}

/**
 * Helper to create permissions context value
 */
export function createPermissionsValue(
  userRoles: RoleId[],
  permissions: Permission[]
): PermissionsContextValue {
  return {
    userRoles,
    permissions,
    isSuperAdmin: checkIsSuperAdmin(userRoles),
    hasPermission: (permission: Permission) => hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: Permission[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: Permission[]) =>
      hasAllPermissions(permissions, requiredPermissions),
    canManageUsers: checkCanManageUsers(permissions),
    canAssignRoles: checkCanAssignRoles(permissions),
  };
}
