// Role permissions and hierarchy definitions

export interface RolePermissions {
  RoleID: number;
  RoleName: string;
  AccessLevel: number; // Higher numbers = more permissions
  CanManageTenant: boolean;
  CanManageUsers: boolean;
  CanManageTeams: boolean;
  CanManageDatasets: boolean;
  CanPromoteDatasets: boolean;
  CanDemoteDatasets: boolean;
  CanDeleteDatasets: boolean;
  CanAccessSystemFunctions: boolean;
  IsSystemRole: boolean;
}

export interface UserRole {
  UserID: number;
  RoleID: number;
  TenantID?: number; // null for system-wide roles
  EffectiveDate: Date;
  ExpirationDate: Date;
  IsActive: boolean;
}
