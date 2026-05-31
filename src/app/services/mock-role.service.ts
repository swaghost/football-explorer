import { Injectable } from '@angular/core';
import { Role } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockRoleService {
  // Role definitions for multi-tenant application
  private roles: Role[] = [
    { RoleID: 0, RoleName: 'Personal Space', PlayerContext: true },
    { RoleID: 1, RoleName: 'Administrator', SysAdminContext: true },
    { RoleID: 2, RoleName: 'Coach', StaffContext: true },
    { RoleID: 3, RoleName: 'Player', PlayerContext: true },
    { RoleID: 4, RoleName: 'Related Member', RelatedMemberContext: true },
    { RoleID: 5, RoleName: 'Member', RelatedMemberContext: true },
    { RoleID: 6, RoleName: 'Tenant Admin', TenantAdminContext: true },
    { RoleID: 7, RoleName: 'Team Manager', StaffContext: true },
    { RoleID: 8, RoleName: 'Tenant Registrar', TenantAdminContext: true },
    { RoleID: 9, RoleName: 'Sporting Architect', TenantAdminContext: true },
    {
      RoleID: 10,
      RoleName: 'Director of Coaching (DOC)',
      TenantAdminContext: true,
    },
    { RoleID: 11, RoleName: 'Club Director', TenantAdminContext: true },
    { RoleID: 99, RoleName: 'Developer', SysAdminContext: true },
  ];

  /**
   * Get all available roles for multi-tenant application
   */
  getRoles(): Role[] {
    return [...this.roles];
  }

  /**
   * Get a role by ID
   */
  getRoleById(roleID: number): Role | undefined {
    return this.roles.find((r) => r.RoleID === roleID);
  }
}
