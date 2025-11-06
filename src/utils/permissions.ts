/**
 * Permission Utility Functions
 * Provides helper functions for role and permission management
 */

import { RoleId, Permission, ROLES } from '../constants/roles';

/**
 * Get all permissions for a list of role IDs
 * Combines and deduplicates permissions from multiple roles
 */
export function getPermissionsFromRoles(roleIds: RoleId[]): Permission[] {
  const permissionSet = new Set<Permission>();

  roleIds.forEach((roleId) => {
    const role = ROLES[roleId];
    if (role) {
      role.permissions.forEach((permission) => {
        permissionSet.add(permission);
      });
    }
  });

  return Array.from(permissionSet);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has ANY of the required permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Check if user has ALL of the required permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((permission) => userPermissions.includes(permission));
}

/**
 * Check if user has any roles assigned
 */
export function hasAnyRole(userRoles: RoleId[]): boolean {
  return userRoles.length > 0;
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: RoleId[], roleId: RoleId): boolean {
  return userRoles.includes(roleId);
}

/**
 * Check if user is a Super Admin
 */
export function isSuperAdmin(userRoles: RoleId[]): boolean {
  return hasRole(userRoles, RoleId.SUPER_ADMIN);
}

/**
 * Check if user can manage other users
 * Super Admins and users with MANAGE_USERS permission
 */
export function canManageUsers(userPermissions: Permission[]): boolean {
  return hasPermission(userPermissions, Permission.MANAGE_USERS);
}

/**
 * Check if user can assign roles to other users
 */
export function canAssignRoles(userPermissions: Permission[]): boolean {
  return hasPermission(userPermissions, Permission.ASSIGN_ROLES);
}

/**
 * Check if user can manage Super Admins
 * Only Super Admins can manage other Super Admins
 */
export function canManageSuperAdmins(userPermissions: Permission[]): boolean {
  return hasPermission(userPermissions, Permission.MANAGE_SUPER_ADMINS);
}

/**
 * Validate if a user can assign specific roles to another user
 * Users cannot grant permissions they don't have
 */
export function canAssignTheseRoles(
  assignerPermissions: Permission[],
  rolesToAssign: RoleId[]
): boolean {
  // Super Admin check - if assigner has MANAGE_SUPER_ADMINS, they can assign anything
  if (hasPermission(assignerPermissions, Permission.MANAGE_SUPER_ADMINS)) {
    return true;
  }

  // Get all permissions that would be granted by the roles
  const permissionsToGrant = getPermissionsFromRoles(rolesToAssign);

  // Check if trying to assign Super Admin role without permission
  if (rolesToAssign.includes(RoleId.SUPER_ADMIN)) {
    return hasPermission(assignerPermissions, Permission.MANAGE_SUPER_ADMINS);
  }

  // For each permission to be granted, check if assigner has it
  return permissionsToGrant.every((permission) =>
    hasPermission(assignerPermissions, permission)
  );
}

/**
 * Get roles that contain a specific permission
 */
export function getRolesWithPermission(permission: Permission): RoleId[] {
  return Object.values(ROLES)
    .filter((role) => role.permissions.includes(permission))
    .map((role) => role.id);
}

/**
 * Calculate the difference between two permission sets
 * Returns permissions in newPermissions that are not in oldPermissions
 */
export function getPermissionDiff(
  oldPermissions: Permission[],
  newPermissions: Permission[]
): {
  added: Permission[];
  removed: Permission[];
} {
  const oldSet = new Set(oldPermissions);
  const newSet = new Set(newPermissions);

  const added = newPermissions.filter((p) => !oldSet.has(p));
  const removed = oldPermissions.filter((p) => !newSet.has(p));

  return { added, removed };
}

/**
 * Format permissions as a human-readable list
 */
export function formatPermissionsList(permissions: Permission[]): string {
  if (permissions.length === 0) return 'No permissions';
  if (permissions.length === 1) return permissions[0].replace(/_/g, ' ').toLowerCase();

  return `${permissions.length} permissions`;
}

/**
 * Group permissions by category for display
 */
export function groupPermissionsByCategory(
  permissions: Permission[]
): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {
    prayer: [],
    events: [],
    donations: [],
    campaigns: [],
    notifications: [],
    settings: [],
    users: [],
  };

  permissions.forEach((permission) => {
    const permStr = permission.toString();
    if (permStr.includes('PRAYER') || permStr.includes('JUMUAH')) {
      grouped.prayer.push(permission);
    } else if (permStr.includes('EVENT')) {
      grouped.events.push(permission);
    } else if (permStr.includes('DONATION')) {
      grouped.donations.push(permission);
    } else if (permStr.includes('CAMPAIGN')) {
      grouped.campaigns.push(permission);
    } else if (permStr.includes('NOTIFICATION')) {
      grouped.notifications.push(permission);
    } else if (permStr.includes('MOSQUE_SETTINGS')) {
      grouped.settings.push(permission);
    } else if (permStr.includes('USER') || permStr.includes('ADMIN') || permStr.includes('ROLE')) {
      grouped.users.push(permission);
    }
  });

  return grouped;
}

/**
 * Check if role combination is valid
 * Prevents conflicting roles (e.g., Manager and Viewer of same feature)
 */
export function isValidRoleCombination(roleIds: RoleId[]): {
  valid: boolean;
  conflicts?: string[];
} {
  const conflicts: string[] = [];

  // Super Admin cannot be combined with other roles (it includes everything)
  if (roleIds.includes(RoleId.SUPER_ADMIN) && roleIds.length > 1) {
    conflicts.push('Super Admin cannot be combined with other roles (it includes all permissions)');
  }

  // Check for Prayer conflicts
  const prayerRoles = roleIds.filter((r) =>
    [RoleId.PRAYER_MANAGER, RoleId.PRAYER_VIEWER].includes(r)
  );
  if (prayerRoles.length > 1) {
    conflicts.push('Cannot have multiple Prayer Time roles (Manager includes Viewer permissions)');
  }

  // Check for Events conflicts
  const eventRoles = roleIds.filter((r) =>
    [RoleId.EVENTS_MANAGER, RoleId.EVENTS_EDITOR, RoleId.EVENTS_VIEWER].includes(r)
  );
  if (eventRoles.length > 1) {
    conflicts.push('Cannot have multiple Event roles (Manager includes Editor and Viewer permissions)');
  }

  // Check for Donations conflicts
  const donationRoles = roleIds.filter((r) =>
    [RoleId.DONATIONS_MANAGER, RoleId.CAMPAIGN_MANAGER, RoleId.DONATIONS_VIEWER].includes(r)
  );
  if (
    donationRoles.includes(RoleId.DONATIONS_MANAGER) &&
    (donationRoles.includes(RoleId.CAMPAIGN_MANAGER) || donationRoles.includes(RoleId.DONATIONS_VIEWER))
  ) {
    conflicts.push('Donations Manager already includes Campaign and Viewer permissions');
  }

  // Check for Notifications conflicts
  const notificationRoles = roleIds.filter((r) =>
    [RoleId.NOTIFICATIONS_MANAGER, RoleId.NOTIFICATIONS_SENDER].includes(r)
  );
  if (notificationRoles.length > 1) {
    conflicts.push('Cannot have multiple Notification roles (Manager includes Sender permissions)');
  }

  return {
    valid: conflicts.length === 0,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
  };
}
