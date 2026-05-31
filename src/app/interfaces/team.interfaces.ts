// Team-related interfaces

import { Player } from './player.interfaces';
import { ITeamGroup } from './team-group.interfaces';

export interface ITeam {
  TeamID: number;
  TeamName: string;
  TenantID: number; // Tenant this team belongs to
  SignupCode: string; // Unique signup code for this team
  AllowSignup: boolean; // Whether signup is allowed for this team
  RosterLimit: number; // Maximum number of players allowed on this team (default: 18)
  GenderID: number; // Gender this team is for
  GenderName: string;
  GenderAbbrev: string;
  AgeGroupID: number; // Age group this team is for
  AgeGroupName: string;
  Level: number; // Skill/competition level within age group
  Players: Player[]; // List of player objects in this team
  TeamGroups: ITeamGroup[]; // List of team group objects in this team
}
