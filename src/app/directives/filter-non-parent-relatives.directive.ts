import { Directive } from '@angular/core';
import { User, ITenant } from '../interfaces';

/**
 * Directive/Utility to filter relatives to exclude those who only have parent/guardian roles.
 * We only want to show relatives who have player, coach, manager, tenant admin, sys admin, or developer roles.
 * Parent/Guardian role is RoleID 4 (RelatedMemberContext: true)
 */
@Directive({
  selector: '[appFilterNonParentRelatives]',
  standalone: true,
})
export class FilterNonParentRelativesDirective {
  /**
   * Filter relatives to exclude those who only have parent/guardian roles.
   * @param relatives Array of User objects to filter
   * @param tenant The tenant context to check roles against
   * @returns Filtered array of User objects with non-parent roles
   */
  public static filterNonParentRelatives(
    relatives: User[],
    tenant: ITenant
  ): User[] {
    console.log(
      `Filtering ${relatives.length} relatives for tenant ${tenant.TenantID}`
    );

    const filtered = relatives.filter((relative) => {
      // Check if the relative user has tenant entries with non-parent roles
      if (relative.Tenants && relative.Tenants.length > 0) {
        const relativeTenant = relative.Tenants.find(
          (t) => t.TenantID === tenant.TenantID
        );

        if (relativeTenant && relativeTenant.Roles) {
          // Check if they have any non-parent roles in this tenant
          const hasNonParentRole = relativeTenant.Roles.some(
            (role) =>
              role.PlayerContext ||
              role.StaffContext ||
              role.TenantAdminContext ||
              role.SysAdminContext
          );

          console.log(
            `Relative ${relative.UserId} (${relative.FirstName} ${relative.LastName}) ` +
              `has non-parent role: ${hasNonParentRole}. Roles:`,
            relativeTenant.Roles.map((r) => r.RoleName).join(', ')
          );

          return hasNonParentRole;
        }
      }

      // If we can't find tenant data for this relative, check the logged-in user's perspective
      // The relative is in the tenant.Relatives array, so they have some relationship
      // We need to determine if they have a non-parent role
      // Since the relative was added to the tenant.Relatives by the MockUserService,
      // we should check the original tenant.Roles to see what roles are available

      console.log(
        `Relative ${relative.UserId} (${relative.FirstName} ${relative.LastName}) ` +
          `has no Tenants data, checking if tenant has non-parent roles`
      );

      // Get all roles for this tenant that are NOT RelatedMemberContext (parent role)
      const nonParentRoles = tenant.Roles?.filter(
        (role) =>
          role.PlayerContext ||
          role.StaffContext ||
          role.TenantAdminContext ||
          role.SysAdminContext
      );

      // If the tenant has non-parent roles, include this relative
      return nonParentRoles && nonParentRoles.length > 0;
    });

    console.log(`Filtered to ${filtered.length} non-parent relatives`);
    return filtered;
  }

  /**
   * Check if a user has any non-parent roles in a specific tenant
   * @param user User to check
   * @param tenant Tenant to check roles against
   * @returns true if user has non-parent roles, false otherwise
   */
  public static hasNonParentRole(user: User, tenant: ITenant): boolean {
    if (user.Tenants && user.Tenants.length > 0) {
      const userTenant = user.Tenants.find(
        (t) => t.TenantID === tenant.TenantID
      );

      if (userTenant && userTenant.Roles) {
        return userTenant.Roles.some(
          (role) =>
            role.PlayerContext ||
            role.StaffContext ||
            role.TenantAdminContext ||
            role.SysAdminContext
        );
      }
    }

    return false;
  }

  /**
   * Check if a user only has parent/guardian roles in a specific tenant
   * @param user User to check
   * @param tenant Tenant to check roles against
   * @returns true if user only has parent roles, false otherwise
   */
  public static isParentOnly(user: User, tenant: ITenant): boolean {
    if (user.Tenants && user.Tenants.length > 0) {
      const userTenant = user.Tenants.find(
        (t) => t.TenantID === tenant.TenantID
      );

      if (userTenant && userTenant.Roles) {
        const hasOnlyParentRoles = userTenant.Roles.every(
          (role) => role.RelatedMemberContext === true
        );
        const hasAtLeastOneRole = userTenant.Roles.length > 0;

        return hasOnlyParentRoles && hasAtLeastOneRole;
      }
    }

    return false;
  }
}
