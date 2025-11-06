/**
 * Role-Based Access Control (RBAC) System
 * Defines all permissions, role templates, and role metadata
 */

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * All available permissions in the system
 * These are the atomic units of access control
 */
export enum Permission {
  // Prayer Times & Jumuah
  VIEW_PRAYER_TIMES = 'VIEW_PRAYER_TIMES',
  EDIT_PRAYER_TIMES = 'EDIT_PRAYER_TIMES',
  VIEW_JUMUAH_TIMES = 'VIEW_JUMUAH_TIMES',
  EDIT_JUMUAH_TIMES = 'EDIT_JUMUAH_TIMES',

  // Events
  VIEW_EVENTS = 'VIEW_EVENTS',
  CREATE_EVENTS = 'CREATE_EVENTS',
  EDIT_EVENTS = 'EDIT_EVENTS',
  DELETE_EVENTS = 'DELETE_EVENTS',

  // Donations
  VIEW_DONATIONS = 'VIEW_DONATIONS',
  VIEW_DONATION_ANALYTICS = 'VIEW_DONATION_ANALYTICS',
  EDIT_DONATION_SETTINGS = 'EDIT_DONATION_SETTINGS',
  EXPORT_DONATIONS = 'EXPORT_DONATIONS',

  // Campaigns
  VIEW_CAMPAIGNS = 'VIEW_CAMPAIGNS',
  CREATE_CAMPAIGNS = 'CREATE_CAMPAIGNS',
  EDIT_CAMPAIGNS = 'EDIT_CAMPAIGNS',
  DELETE_CAMPAIGNS = 'DELETE_CAMPAIGNS',

  // Notifications
  VIEW_NOTIFICATIONS = 'VIEW_NOTIFICATIONS',
  SEND_NOTIFICATIONS = 'SEND_NOTIFICATIONS',
  VIEW_NOTIFICATION_HISTORY = 'VIEW_NOTIFICATION_HISTORY',

  // Mosque Settings
  VIEW_MOSQUE_SETTINGS = 'VIEW_MOSQUE_SETTINGS',
  EDIT_MOSQUE_SETTINGS = 'EDIT_MOSQUE_SETTINGS',

  // User Management
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  ASSIGN_ROLES = 'ASSIGN_ROLES',
  MANAGE_SUPER_ADMINS = 'MANAGE_SUPER_ADMINS',
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Available role identifiers
 */
export enum RoleId {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PRAYER_MANAGER = 'PRAYER_MANAGER',
  PRAYER_VIEWER = 'PRAYER_VIEWER',
  EVENTS_MANAGER = 'EVENTS_MANAGER',
  EVENTS_EDITOR = 'EVENTS_EDITOR',
  EVENTS_VIEWER = 'EVENTS_VIEWER',
  DONATIONS_MANAGER = 'DONATIONS_MANAGER',
  CAMPAIGN_MANAGER = 'CAMPAIGN_MANAGER',
  DONATIONS_VIEWER = 'DONATIONS_VIEWER',
  NOTIFICATIONS_MANAGER = 'NOTIFICATIONS_MANAGER',
  NOTIFICATIONS_SENDER = 'NOTIFICATIONS_SENDER',
  REPORT_VIEWER = 'REPORT_VIEWER',
}

/**
 * Role metadata and configuration
 */
export interface RoleDefinition {
  id: RoleId;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  icon: string;
  category: 'system' | 'prayer' | 'events' | 'donations' | 'notifications' | 'reports';
  isProtected?: boolean; // Cannot be modified or removed
}

/**
 * Complete role definitions with permissions
 */
export const ROLES: Record<RoleId, RoleDefinition> = {
  // ============================================================================
  // SYSTEM ROLES
  // ============================================================================

  [RoleId.SUPER_ADMIN]: {
    id: RoleId.SUPER_ADMIN,
    name: 'Super Admin',
    description: 'Full system access with protected status. Cannot be removed.',
    permissions: Object.values(Permission), // ALL permissions
    color: '#dc2626',
    icon: '🔰',
    category: 'system',
    isProtected: true,
  },

  [RoleId.ADMIN]: {
    id: RoleId.ADMIN,
    name: 'Admin',
    description: 'Full access to all features and user management (except Super Admin management).',
    permissions: [
      // Prayer Times
      Permission.VIEW_PRAYER_TIMES,
      Permission.EDIT_PRAYER_TIMES,
      Permission.VIEW_JUMUAH_TIMES,
      Permission.EDIT_JUMUAH_TIMES,
      // Events
      Permission.VIEW_EVENTS,
      Permission.CREATE_EVENTS,
      Permission.EDIT_EVENTS,
      Permission.DELETE_EVENTS,
      // Donations
      Permission.VIEW_DONATIONS,
      Permission.VIEW_DONATION_ANALYTICS,
      Permission.EDIT_DONATION_SETTINGS,
      Permission.EXPORT_DONATIONS,
      // Campaigns
      Permission.VIEW_CAMPAIGNS,
      Permission.CREATE_CAMPAIGNS,
      Permission.EDIT_CAMPAIGNS,
      Permission.DELETE_CAMPAIGNS,
      // Notifications
      Permission.VIEW_NOTIFICATIONS,
      Permission.SEND_NOTIFICATIONS,
      Permission.VIEW_NOTIFICATION_HISTORY,
      // Mosque Settings
      Permission.VIEW_MOSQUE_SETTINGS,
      Permission.EDIT_MOSQUE_SETTINGS,
      // User Management (but not Super Admin management)
      Permission.VIEW_USERS,
      Permission.MANAGE_USERS,
      Permission.ASSIGN_ROLES,
    ],
    color: '#0f172a',
    icon: '👑',
    category: 'system',
  },

  // ============================================================================
  // PRAYER MANAGEMENT ROLES
  // ============================================================================

  [RoleId.PRAYER_MANAGER]: {
    id: RoleId.PRAYER_MANAGER,
    name: 'Prayer Manager',
    description: 'Full access to prayer times and Jumuah times management.',
    permissions: [
      Permission.VIEW_PRAYER_TIMES,
      Permission.EDIT_PRAYER_TIMES,
      Permission.VIEW_JUMUAH_TIMES,
      Permission.EDIT_JUMUAH_TIMES,
    ],
    color: '#059669',
    icon: '🕌',
    category: 'prayer',
  },

  [RoleId.PRAYER_VIEWER]: {
    id: RoleId.PRAYER_VIEWER,
    name: 'Prayer Viewer',
    description: 'Read-only access to prayer times and Jumuah times.',
    permissions: [Permission.VIEW_PRAYER_TIMES, Permission.VIEW_JUMUAH_TIMES],
    color: '#10b981',
    icon: '👁️',
    category: 'prayer',
  },

  // ============================================================================
  // EVENTS MANAGEMENT ROLES
  // ============================================================================

  [RoleId.EVENTS_MANAGER]: {
    id: RoleId.EVENTS_MANAGER,
    name: 'Events Manager',
    description: 'Full access to create, edit, and delete events.',
    permissions: [
      Permission.VIEW_EVENTS,
      Permission.CREATE_EVENTS,
      Permission.EDIT_EVENTS,
      Permission.DELETE_EVENTS,
    ],
    color: '#7c3aed',
    icon: '📅',
    category: 'events',
  },

  [RoleId.EVENTS_EDITOR]: {
    id: RoleId.EVENTS_EDITOR,
    name: 'Events Editor',
    description: 'Can create and edit events, but cannot delete them.',
    permissions: [Permission.VIEW_EVENTS, Permission.CREATE_EVENTS, Permission.EDIT_EVENTS],
    color: '#8b5cf6',
    icon: '✏️',
    category: 'events',
  },

  [RoleId.EVENTS_VIEWER]: {
    id: RoleId.EVENTS_VIEWER,
    name: 'Events Viewer',
    description: 'Read-only access to view events.',
    permissions: [Permission.VIEW_EVENTS],
    color: '#a78bfa',
    icon: '👁️',
    category: 'events',
  },

  // ============================================================================
  // DONATIONS & CAMPAIGNS ROLES
  // ============================================================================

  [RoleId.DONATIONS_MANAGER]: {
    id: RoleId.DONATIONS_MANAGER,
    name: 'Donations Manager',
    description: 'Full access to donations, campaigns, and donation settings.',
    permissions: [
      Permission.VIEW_DONATIONS,
      Permission.VIEW_DONATION_ANALYTICS,
      Permission.EDIT_DONATION_SETTINGS,
      Permission.EXPORT_DONATIONS,
      Permission.VIEW_CAMPAIGNS,
      Permission.CREATE_CAMPAIGNS,
      Permission.EDIT_CAMPAIGNS,
      Permission.DELETE_CAMPAIGNS,
    ],
    color: '#0891b2',
    icon: '💰',
    category: 'donations',
  },

  [RoleId.CAMPAIGN_MANAGER]: {
    id: RoleId.CAMPAIGN_MANAGER,
    name: 'Campaign Manager',
    description: 'Manage campaigns only (no access to donation settings).',
    permissions: [
      Permission.VIEW_CAMPAIGNS,
      Permission.CREATE_CAMPAIGNS,
      Permission.EDIT_CAMPAIGNS,
      Permission.DELETE_CAMPAIGNS,
    ],
    color: '#06b6d4',
    icon: '🎯',
    category: 'donations',
  },

  [RoleId.DONATIONS_VIEWER]: {
    id: RoleId.DONATIONS_VIEWER,
    name: 'Donations Viewer',
    description: 'Read-only access to donations and analytics.',
    permissions: [Permission.VIEW_DONATIONS, Permission.VIEW_DONATION_ANALYTICS],
    color: '#22d3ee',
    icon: '👁️',
    category: 'donations',
  },

  // ============================================================================
  // NOTIFICATIONS ROLES
  // ============================================================================

  [RoleId.NOTIFICATIONS_MANAGER]: {
    id: RoleId.NOTIFICATIONS_MANAGER,
    name: 'Notifications Manager',
    description: 'Full access to send notifications and view history.',
    permissions: [
      Permission.VIEW_NOTIFICATIONS,
      Permission.SEND_NOTIFICATIONS,
      Permission.VIEW_NOTIFICATION_HISTORY,
    ],
    color: '#ea580c',
    icon: '📢',
    category: 'notifications',
  },

  [RoleId.NOTIFICATIONS_SENDER]: {
    id: RoleId.NOTIFICATIONS_SENDER,
    name: 'Notifications Sender',
    description: 'Can send notifications only (no history access).',
    permissions: [Permission.SEND_NOTIFICATIONS],
    color: '#f97316',
    icon: '📤',
    category: 'notifications',
  },

  // ============================================================================
  // REPORTING ROLES
  // ============================================================================

  [RoleId.REPORT_VIEWER]: {
    id: RoleId.REPORT_VIEWER,
    name: 'Report Viewer',
    description: 'Read-only access to analytics and reports across features.',
    permissions: [
      Permission.VIEW_DONATIONS,
      Permission.VIEW_DONATION_ANALYTICS,
      Permission.VIEW_NOTIFICATION_HISTORY,
      Permission.VIEW_EVENTS,
    ],
    color: '#64748b',
    icon: '📊',
    category: 'reports',
  },
};

// ============================================================================
// PERMISSION METADATA
// ============================================================================

/**
 * Human-readable permission descriptions
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  // Prayer Times
  [Permission.VIEW_PRAYER_TIMES]: 'View Prayer Times',
  [Permission.EDIT_PRAYER_TIMES]: 'Edit Prayer Times',
  [Permission.VIEW_JUMUAH_TIMES]: 'View Jumuah Times',
  [Permission.EDIT_JUMUAH_TIMES]: 'Edit Jumuah Times',

  // Events
  [Permission.VIEW_EVENTS]: 'View Events',
  [Permission.CREATE_EVENTS]: 'Create Events',
  [Permission.EDIT_EVENTS]: 'Edit Events',
  [Permission.DELETE_EVENTS]: 'Delete Events',

  // Donations
  [Permission.VIEW_DONATIONS]: 'View Donations',
  [Permission.VIEW_DONATION_ANALYTICS]: 'View Donation Analytics',
  [Permission.EDIT_DONATION_SETTINGS]: 'Edit Donation Settings',
  [Permission.EXPORT_DONATIONS]: 'Export Donations',

  // Campaigns
  [Permission.VIEW_CAMPAIGNS]: 'View Campaigns',
  [Permission.CREATE_CAMPAIGNS]: 'Create Campaigns',
  [Permission.EDIT_CAMPAIGNS]: 'Edit Campaigns',
  [Permission.DELETE_CAMPAIGNS]: 'Delete Campaigns',

  // Notifications
  [Permission.VIEW_NOTIFICATIONS]: 'View Notifications',
  [Permission.SEND_NOTIFICATIONS]: 'Send Notifications',
  [Permission.VIEW_NOTIFICATION_HISTORY]: 'View Notification History',

  // Mosque Settings
  [Permission.VIEW_MOSQUE_SETTINGS]: 'View Mosque Settings',
  [Permission.EDIT_MOSQUE_SETTINGS]: 'Edit Mosque Settings',

  // User Management
  [Permission.VIEW_USERS]: 'View Users',
  [Permission.MANAGE_USERS]: 'Manage Users',
  [Permission.ASSIGN_ROLES]: 'Assign Roles',
  [Permission.MANAGE_SUPER_ADMINS]: 'Manage Super Admins',
};

/**
 * Permission categories for grouping in UI
 */
export interface PermissionCategory {
  id: string;
  label: string;
  permissions: Permission[];
  icon: string;
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'prayer',
    label: 'Prayer Times',
    icon: '🕌',
    permissions: [
      Permission.VIEW_PRAYER_TIMES,
      Permission.EDIT_PRAYER_TIMES,
      Permission.VIEW_JUMUAH_TIMES,
      Permission.EDIT_JUMUAH_TIMES,
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: '📅',
    permissions: [
      Permission.VIEW_EVENTS,
      Permission.CREATE_EVENTS,
      Permission.EDIT_EVENTS,
      Permission.DELETE_EVENTS,
    ],
  },
  {
    id: 'donations',
    label: 'Donations',
    icon: '💰',
    permissions: [
      Permission.VIEW_DONATIONS,
      Permission.VIEW_DONATION_ANALYTICS,
      Permission.EDIT_DONATION_SETTINGS,
      Permission.EXPORT_DONATIONS,
    ],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: '🎯',
    permissions: [
      Permission.VIEW_CAMPAIGNS,
      Permission.CREATE_CAMPAIGNS,
      Permission.EDIT_CAMPAIGNS,
      Permission.DELETE_CAMPAIGNS,
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '📢',
    permissions: [
      Permission.VIEW_NOTIFICATIONS,
      Permission.SEND_NOTIFICATIONS,
      Permission.VIEW_NOTIFICATION_HISTORY,
    ],
  },
  {
    id: 'settings',
    label: 'Mosque Settings',
    icon: '⚙️',
    permissions: [Permission.VIEW_MOSQUE_SETTINGS, Permission.EDIT_MOSQUE_SETTINGS],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: '👥',
    permissions: [
      Permission.VIEW_USERS,
      Permission.MANAGE_USERS,
      Permission.ASSIGN_ROLES,
      Permission.MANAGE_SUPER_ADMINS,
    ],
  },
];

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Get all roles grouped by category
 */
export function getRolesByCategory(): Record<string, RoleDefinition[]> {
  const grouped: Record<string, RoleDefinition[]> = {
    system: [],
    prayer: [],
    events: [],
    donations: [],
    notifications: [],
    reports: [],
  };

  Object.values(ROLES).forEach((role) => {
    grouped[role.category].push(role);
  });

  return grouped;
}

/**
 * Get role definition by ID
 */
export function getRole(roleId: RoleId): RoleDefinition | undefined {
  return ROLES[roleId];
}

/**
 * Check if a role is protected (cannot be modified)
 */
export function isProtectedRole(roleId: RoleId): boolean {
  return ROLES[roleId]?.isProtected === true;
}

/**
 * Get all available role IDs
 */
export function getAllRoleIds(): RoleId[] {
  return Object.values(RoleId);
}

/**
 * Get all available permissions
 */
export function getAllPermissions(): Permission[] {
  return Object.values(Permission);
}
