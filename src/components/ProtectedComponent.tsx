/**
 * Protected Component Wrapper
 * Conditionally renders children based on user permissions
 */

import React from 'react';
import { Permission } from '../constants/roles';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedProps {
  children: React.ReactNode;
  /** Single permission required */
  requires?: Permission;
  /** User must have ANY of these permissions */
  requiresAny?: Permission[];
  /** User must have ALL of these permissions */
  requiresAll?: Permission[];
  /** What to render if permission check fails */
  fallback?: React.ReactNode;
  /** If true, renders fallback even when permissions match (for testing) */
  inverted?: boolean;
}

/**
 * Component that conditionally renders children based on permissions
 * 
 * @example
 * // Require single permission
 * <Protected requires={Permission.EDIT_PRAYER_TIMES}>
 *   <SaveButton />
 * </Protected>
 * 
 * @example
 * // Require ANY of multiple permissions
 * <Protected requiresAny={[Permission.EDIT_EVENTS, Permission.DELETE_EVENTS]}>
 *   <EventActions />
 * </Protected>
 * 
 * @example
 * // Require ALL of multiple permissions
 * <Protected requiresAll={[Permission.VIEW_DONATIONS, Permission.EXPORT_DONATIONS]}>
 *   <ExportButton />
 * </Protected>
 * 
 * @example
 * // Show fallback for unauthorized users
 * <Protected requires={Permission.EDIT_PRAYER_TIMES} fallback={<ReadOnlyView />}>
 *   <EditableView />
 * </Protected>
 */
export default function Protected({
  children,
  requires,
  requiresAny,
  requiresAll,
  fallback = null,
  inverted = false,
}: ProtectedProps): React.JSX.Element | null {
  const permissions = usePermissions();

  let hasAccess = false;

  // Check single permission
  if (requires) {
    hasAccess = permissions.hasPermission(requires);
  }
  // Check ANY of permissions
  else if (requiresAny && requiresAny.length > 0) {
    hasAccess = permissions.hasAnyPermission(requiresAny);
  }
  // Check ALL permissions
  else if (requiresAll && requiresAll.length > 0) {
    hasAccess = permissions.hasAllPermissions(requiresAll);
  }
  // No permission specified - default to allow
  else {
    hasAccess = true;
  }

  // Invert logic if specified (useful for showing "no access" messages)
  if (inverted) {
    hasAccess = !hasAccess;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Higher-order component version for wrapping entire components
 */
export function withPermission(
  Component: React.ComponentType<any>,
  permission: Permission | Permission[],
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: any) {
    const isArray = Array.isArray(permission);
    
    return (
      <Protected
        requiresAny={isArray ? permission : undefined}
        requires={!isArray ? permission : undefined}
        fallback={fallback}
      >
        <Component {...props} />
      </Protected>
    );
  };
}
