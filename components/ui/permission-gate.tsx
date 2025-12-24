"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionModule, PermissionAction } from "@/types/permissions";

interface PermissionGateProps {
  /** The module to check permission for */
  module: PermissionModule;
  /** The action to check permission for */
  action: PermissionAction;
  /** Children to render if user has permission */
  children: ReactNode;
  /** Optional fallback to render if user doesn't have permission */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions.
 * Use this to wrap action buttons like Create, Edit, Delete.
 *
 * @example
 * <PermissionGate module="products" action="delete">
 *   <Button onClick={handleDelete}>Delete</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, isLoading } = usePermissions();

  // Don't render anything while loading to prevent flash
  if (isLoading) {
    return null;
  }

  // Render children if user has permission, otherwise render fallback
  if (can(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface PermissionGateAnyProps {
  /** The module to check permission for */
  module: PermissionModule;
  /** The actions to check - user needs at least one */
  actions: PermissionAction[];
  /** Children to render if user has any of the permissions */
  children: ReactNode;
  /** Optional fallback to render if user doesn't have any permission */
  fallback?: ReactNode;
}

/**
 * Component that renders children if user has ANY of the specified permissions.
 *
 * @example
 * <PermissionGateAny module="products" actions={["update", "delete"]}>
 *   <ActionMenu />
 * </PermissionGateAny>
 */
export function PermissionGateAny({
  module,
  actions,
  children,
  fallback = null,
}: PermissionGateAnyProps) {
  const { canAny, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (canAny(module, actions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
