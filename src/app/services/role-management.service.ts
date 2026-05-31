import { Injectable } from '@angular/core';
import {
  RolePermissions,
  UserRole,
} from '../interfaces/role-permissions.interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoleManagementService {
  private rolePermissions: RolePermissions[] = [
    {
      RoleID: 0,
      RoleName: 'Personal Space',
      AccessLevel: 1,
      CanManageTenant: false,
      CanManageUsers: false,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false,
      CanDemoteDatasets: false,
      CanDeleteDatasets: false,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 1,
      RoleName: 'Administrator',
      AccessLevel: 8,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: true,
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: true,
      IsSystemRole: true,
    },
    {
      RoleID: 2,
      RoleName: 'Coach',
      AccessLevel: 4,
      CanManageTenant: false,
      CanManageUsers: false,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false,
      CanDemoteDatasets: false,
      CanDeleteDatasets: false,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 3,
      RoleName: 'Player',
      AccessLevel: 2,
      CanManageTenant: false,
      CanManageUsers: false,
      CanManageTeams: false,
      CanManageDatasets: false,
      CanPromoteDatasets: false,
      CanDemoteDatasets: false,
      CanDeleteDatasets: false,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 4,
      RoleName: 'Parent',
      AccessLevel: 2,
      CanManageTenant: false,
      CanManageUsers: false,
      CanManageTeams: false,
      CanManageDatasets: false,
      CanPromoteDatasets: false,
      CanDemoteDatasets: false,
      CanDeleteDatasets: false,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 5,
      RoleName: 'Member',
      AccessLevel: 3,
      CanManageTenant: false,
      CanManageUsers: false,
      CanManageTeams: false,
      CanManageDatasets: true,
      CanPromoteDatasets: false,
      CanDemoteDatasets: false,
      CanDeleteDatasets: false,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 6,
      RoleName: 'Tenant Admin',
      AccessLevel: 6,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false, // Cannot promote to system level
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: false, // No system admin functions
      IsSystemRole: false,
    },
    {
      RoleID: 7,
      RoleName: 'Team Manager',
      AccessLevel: 5,
      CanManageTenant: false,
      CanManageUsers: true, // Can manage team users
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false,
      CanDemoteDatasets: false,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 8,
      RoleName: 'Tenant Registrar',
      AccessLevel: 7,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: true, // Can promote to tenant level
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: true, // Limited system functions for tenant registration
      IsSystemRole: true,
    },
    {
      RoleID: 9,
      RoleName: 'Sporting Architect',
      AccessLevel: 6,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false, // Cannot promote to system level
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 10,
      RoleName: 'Director of Coaching (DOC)',
      AccessLevel: 6,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false, // Cannot promote to system level
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 11,
      RoleName: 'Club Director',
      AccessLevel: 6,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: false, // Cannot promote to system level
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: false,
      IsSystemRole: false,
    },
    {
      RoleID: 99,
      RoleName: 'Developer',
      AccessLevel: 10,
      CanManageTenant: true,
      CanManageUsers: true,
      CanManageTeams: true,
      CanManageDatasets: true,
      CanPromoteDatasets: true,
      CanDemoteDatasets: true,
      CanDeleteDatasets: true,
      CanAccessSystemFunctions: true,
      IsSystemRole: true,
    },
  ];

  constructor() {}

  /**
   * Get role permissions for a specific role
   */
  getRolePermissions(roleID: number): RolePermissions | null {
    return this.rolePermissions.find((role) => role.RoleID === roleID) || null;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(roleID: number, permission: keyof RolePermissions): boolean {
    const role = this.getRolePermissions(roleID);
    if (!role) return false;

    const value = role[permission];
    return typeof value === 'boolean' ? value : false;
  }

  /**
   * Check if role can perform dataset operations
   */
  canPromoteDataset(roleID: number): boolean {
    return this.hasPermission(roleID, 'CanPromoteDatasets');
  }

  canDemoteDataset(roleID: number): boolean {
    return this.hasPermission(roleID, 'CanDemoteDatasets');
  }

  canDeleteDataset(roleID: number): boolean {
    return this.hasPermission(roleID, 'CanDeleteDatasets');
  }

  /**
   * Check if role can manage tenant
   */
  canManageTenant(roleID: number): boolean {
    return this.hasPermission(roleID, 'CanManageTenant');
  }

  /**
   * Check if role can manage users
   */
  canManageUsers(roleID: number): boolean {
    return this.hasPermission(roleID, 'CanManageUsers');
  }

  /**
   * Check if role has system-level access
   */
  hasSystemAccess(roleID: number): boolean {
    return this.hasPermission(roleID, 'CanAccessSystemFunctions');
  }

  /**
   * Get all available roles
   */
  getAllRoles(): RolePermissions[] {
    return [...this.rolePermissions];
  }

  /**
   * Get roles available for tenant assignment (non-system roles)
   */
  getTenantRoles(): RolePermissions[] {
    return this.rolePermissions.filter(
      (role) => !role.IsSystemRole || [6, 9, 10, 11].includes(role.RoleID)
    ); // Include Tenant Admin and new tenant management roles (Sporting Architect, DOC, Club Director)
  }

  /**
   * Check if a role is higher than another role
   */
  isHigherRole(roleID1: number, roleID2: number): boolean {
    const role1 = this.getRolePermissions(roleID1);
    const role2 = this.getRolePermissions(roleID2);

    if (!role1 || !role2) return false;

    return role1.AccessLevel > role2.AccessLevel;
  }

  /**
   * Get the highest role for a user (if they have multiple roles)
   */
  getHighestRole(roleIDs: number[]): RolePermissions | null {
    let highestRole: RolePermissions | null = null;
    let highestAccessLevel = 0;

    for (const roleID of roleIDs) {
      const role = this.getRolePermissions(roleID);
      if (role && role.AccessLevel > highestAccessLevel) {
        highestRole = role;
        highestAccessLevel = role.AccessLevel;
      }
    }

    return highestRole;
  }
}
