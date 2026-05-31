// Tenant utility functions

import { ITenant, Role } from '../interfaces';

/**
 * Determines the ContextSelectionRequired value for a tenant based on the user's roles
 * @param tenant The tenant to evaluate
 * @returns 'R' (Required), 'A' (Allowed), 'N' (Not needed), or 'P' (Prohibited)
 */
export function determineContextSelectionRequired(tenant: ITenant): string {
  if (!tenant.Roles || tenant.Roles.length === 0) {
    return 'N'; // Default to Not needed if no roles
  }

  let hasRelatedMemberContext = false;
  let hasPlayerContext = false;
  let hasStaffContext = false;
  let hasTenantAdminContext = false;
  let hasSysAdminContext = false;

  // Check which contexts the user has
  tenant.Roles.forEach((role: Role) => {
    if (role.RelatedMemberContext) hasRelatedMemberContext = true;
    if (role.PlayerContext) hasPlayerContext = true;
    if (role.StaffContext) hasStaffContext = true;
    if (role.TenantAdminContext) hasTenantAdminContext = true;
    if (role.SysAdminContext) hasSysAdminContext = true;
  });

  // Priority order for determining the value:
  // 1. If ONLY RelatedMemberContext (no other contexts) -> Required (R)
  // 2. If PlayerContext (with or without other contexts) -> Not needed (N)
  // 3. If Staff, TenantAdmin, or SysAdmin contexts -> Allowed (A)

  // Check if ONLY RelatedMemberContext
  if (
    hasRelatedMemberContext &&
    !hasPlayerContext &&
    !hasStaffContext &&
    !hasTenantAdminContext &&
    !hasSysAdminContext
  ) {
    return 'R'; // Required - must select a related player
  }

  // Check if has PlayerContext
  if (hasPlayerContext) {
    return 'N'; // Not needed - user is already a player
  }

  // Check if has Staff, TenantAdmin, or SysAdmin contexts
  if (hasStaffContext || hasTenantAdminContext || hasSysAdminContext) {
    return 'A'; // Allowed - can optionally select a related player
  }

  // Default fallback
  return 'N'; // Not needed
}

/**
 * Updates the tenant's ContextSelectionRequired field based on roles
 * @param tenant The tenant to update
 * @returns The updated tenant
 */
export function updateTenantContextSelectionRequired(tenant: ITenant): ITenant {
  return {
    ...tenant,
    ContextSelectionRequired: determineContextSelectionRequired(tenant),
  };
}
