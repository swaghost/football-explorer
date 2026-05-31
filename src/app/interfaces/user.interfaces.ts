// User interface for application users

import { ITenant } from './tenant.interfaces';

export interface IContextRelative {
  UserID: number;
  IsAssumable: boolean;
}

export interface TenantConfig {
  tenantId: number; // -1 represents global/system level
  tenantRoles: number[]; // Array of RoleIDs for this tenant
  tenantRelatives: IContextRelative[]; // Array of relatives with assumability flags
  TierID?: string; // Subscription tier ID for this tenant
  AddOns?: string[]; // Array of add-on tier IDs for this tenant
}

export interface User {
  UserId: number;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  ZipCode: string;
  NationCode: string;
  EmailAddress: string;
  PhoneNumber: string;
  BirthDate: Date;
  Tenants?: ITenant[] | null;
  LastSelectedContextTenant?: number | null; // TenantID of last selected tenant
  LastSelectedContextUser?: number | null; // UserId of last selected context user within that tenant
  mockTenantConfig?: TenantConfig[]; // Configuration for mock data - which tenants, roles, and relatives
  IsAssumable?: boolean; // Whether this user can be assumed by an admin
  GenderID: number;
  GenderName: string;
  GenderAbbrev: string;
}
