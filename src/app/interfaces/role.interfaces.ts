// Role-related interface for multi-tenant application

export interface Role {
  RoleID: number;
  RoleName: string;
  RelatedMemberContext?: boolean;
  PlayerContext?: boolean;
  StaffContext?: boolean;
  TenantAdminContext?: boolean;
  SysAdminContext?: boolean;
}
