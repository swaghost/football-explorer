import { Injectable } from '@angular/core';
import { ITeam, ITeamGroup } from '../interfaces';
import { MockGenderService } from './mock-gender.service';
import { MockAgeGroupService } from './mock-age-group.service';
import { MockTeamGroupService } from './mock-team-group.service';

@Injectable({
  providedIn: 'root',
})
export class MockTeamService {
  constructor(
    private mockGenderService: MockGenderService,
    private mockAgeGroupService: MockAgeGroupService,
    private mockTeamGroupService: MockTeamGroupService
  ) {}

  /**
   * Generate a team with players following gender and age group rules
   */
  generateTeam(
    teamID: number,
    tenantID: number,
    teamName: string,
    genderID: number,
    ageGroupID: number,
    level: number,
    startingPlayerID: number,
    rosterLimit = 18
  ): ITeam {
    const gender = this.mockGenderService.getGenderById(genderID)!;
    const ageGroup = this.mockAgeGroupService.getAgeGroupById(ageGroupID)!;

    // Generate players
    const players = this.mockTeamGroupService.generateRoster(
      teamID,
      genderID,
      ageGroupID,
      startingPlayerID,
      rosterLimit
    );

    // Create team groups
    const startingEleven = players.slice(0, 11).map((p) => ({ ...p }));
    const substitutes = players.slice(11).map((p) => ({ ...p }));

    const teamGroups: ITeamGroup[] = [
      {
        TeamGroupID: teamID * 10 + 1,
        OwnershipContext: {
          Context: 'TEAM',
          ContextKey: teamID,
        },
        TeamGroupName: 'Starting Eleven',
        Players: startingEleven,
        MatchingPositions: [], // Initialize empty
        MatchingPositionNumbers: [], // Initialize empty
      },
      {
        TeamGroupID: teamID * 10 + 2,
        OwnershipContext: {
          Context: 'TEAM',
          ContextKey: teamID,
        },
        TeamGroupName: 'Substitutes',
        Players: substitutes,
        MatchingPositions: [], // Initialize empty
        MatchingPositionNumbers: [], // Initialize empty
      },
    ];

    return {
      TeamID: teamID,
      TeamName: teamName,
      TenantID: tenantID,
      SignupCode: `TEAM-${teamID}-${teamName
        .replace(/\s+/g, '')
        .toUpperCase()
        .slice(0, 8)}`,
      AllowSignup: true,
      RosterLimit: rosterLimit,
      GenderID: genderID,
      GenderName: gender.GenderName,
      GenderAbbrev: gender.GenderAbbrev,
      AgeGroupID: ageGroupID,
      AgeGroupName: ageGroup.AgeGroupName,
      Level: level,
      Players: players,
      TeamGroups: teamGroups,
    };
  }
}
