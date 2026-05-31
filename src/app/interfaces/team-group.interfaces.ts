// Team Group-related interfaces

import { Player } from './player.interfaces';
import { OwnershipContext } from './ownership-context.interface';

export interface ITeamGroup {
  TeamGroupID: number;
  OwnershipContext: OwnershipContext; // Replaces TeamID
  TeamGroupName: string;
  Players: Player[]; // List of player objects in this team group
  MatchingPositions: string[]; // Array of position abbreviation strings (e.g., ['HM', 'CB', 'WB', 'GK'])
  MatchingPositionNumbers: number[]; // Array of position numbers 1-11 (e.g., [7, 9, 10, 11])
}

// Default Team Group - extends TeamGroup for the default templates
export interface IDefaultTeamGroup extends ITeamGroup {
  IsSystemDefault: boolean; // True if it's a system-level default that can't be edited
  Description?: string; // Optional description of the team group purpose
}
