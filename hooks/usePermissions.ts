"use client";

import { useSession } from "next-auth/react";
import { 
  hasPermission, 
  hasAnyPermission, 
  canAccessModule, 
  isSuperAdmin as checkSuperAdmin 
} from "@/lib/permissions";
import { PermissionModule, PermissionAction, Permissions, AdminRole } from "@/types/permissions";

/**
 * Hook for checking user permissions throughout the application
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  
  const permissions: Permissions = session?.user?.permissions || {};
  const role: AdminRole | undefined = session?.user?.role;
  
  /**
   * Check if user has a specific permission
   */
  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    // Super-admin has all permissions
    if (checkSuperAdmin(role)) return true;
    return hasPermission(permissions, module, action);
  };
  
  /**
   * Check if user has any of the specified permissions
   */
  const canAny = (module: PermissionModule, actions: PermissionAction[]): boolean => {
    if (checkSuperAdmin(role)) return true;
    return hasAnyPermission(permissions, module, actions);
  };
  
  /**
   * Check if user can access a module (has read permission)
   */
  const canAccess = (module: PermissionModule): boolean => {
    if (checkSuperAdmin(role)) return true;
    return canAccessModule(permissions, module);
  };
  
  /**
   * Check if user is super-admin
   */
  const isSuperAdmin = (): boolean => {
    return checkSuperAdmin(role);
  };
  
  return {
    can,
    canAny,
    canAccess,
    isSuperAdmin,
    permissions,
    role,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
