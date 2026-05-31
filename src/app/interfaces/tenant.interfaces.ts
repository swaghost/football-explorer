// Tenant-related interfaces for multi-tenant application

import { ITeam } from './team.interfaces';
import { Role } from './role.interfaces';
import { User } from './user.interfaces';
import { ILesson } from './lesson-builder.interfaces';
import { AssignedLesson } from '../services/mock-assigned-lesson.service';
import { ISubscriptionSelection } from './subscription.interfaces';

export interface ITenant {
  TenantID: number;
  TenantName: string;
  LogoUrl?: string; // URL to tenant logo image
  SignupCode: string; // Unique signup code for this tenant
  AllowSignup: boolean; // Whether signup is allowed for this tenant
  Roles: Role[]; // Array of roles for this user in this tenant
  Relatives: User[]; // Array of linked accounts (family members, etc.)
  Teams?: ITeam[]; // List of team objects in this organization
  StaffTeams?: ITeam[]; // List of staff team objects in this organization
  SubscriptionTierID: string;
  AddOnTierIDs?: string[]; // Array of add-on TierIDs
  Subscription?: ISubscriptionSelection;
  ContextSelectionRequired?: string; // R=Required, A=Allowed, N=Not needed, P=Prohibited (determined at runtime from roles)
  lessons?: ILesson[]; // Array of lessons available in this tenant
  assignedLessons?: AssignedLesson[]; // Array of lessons assigned to users/teams in this tenant
}
