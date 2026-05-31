// Player-related interfaces

import { User } from './user.interfaces';

export interface Player extends User {
  PlayerID: number;
  TeamID: number;
  PositionName: string;
  PositionAbbrev: string;
  JerseyNumber: number; // Jersey number (1 for goalkeeper, 2-18 for others)
  AgeGroupID: number; // Default open
  AgeGroupName: string;
  // Position capabilities - multiple positions a player can play
  PossiblePositionAbbreviations?: string[]; // e.g., ['GK', 'CB', 'WB']
  PossiblePositionNumbers?: number[]; // e.g., [1, 2, 3] for positions 1-11
}
