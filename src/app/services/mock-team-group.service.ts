import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Player } from '../interfaces';
import { MockGenderService } from './mock-gender.service';
import { MockAgeGroupService } from './mock-age-group.service';
import { MockPositionsService } from './mock-positions.service';
import { MockRosterService } from './mock-roster.service';
import { GlobalContextState } from '../state/user-context.state';

@Injectable({
  providedIn: 'root',
})
export class MockTeamGroupService {
  constructor(
    private store: Store,
    private mockGenderService: MockGenderService,
    private mockAgeGroupService: MockAgeGroupService,
    private mockPositionsService: MockPositionsService,
    private mockRosterService: MockRosterService
  ) {}

  /**
   * Generate a random player with proper gender and age group constraints
   */
  generatePlayer(
    playerID: number,
    teamID: number,
    teamGenderID: number,
    teamAgeGroupID: number,
    jerseyNumber: number,
    allowCrossGender = false,
    userID = 0
  ): Player {
    // Determine player gender - usually matches team, but girls can be on boys teams
    let playerGenderID = teamGenderID;
    if (allowCrossGender && teamGenderID === 1 && Math.random() < 0.1) {
      // 10% chance for a girl to be on a boys team
      playerGenderID = 2;
    }

    const gender = this.mockGenderService.getGenderById(playerGenderID)!;
    const ageGroup = this.mockAgeGroupService.getAgeGroupById(teamAgeGroupID)!;

    const firstName = this.mockRosterService.getRandomFirstName(playerGenderID);
    const lastName = this.mockRosterService.getRandomLastName();

    // Assign position based on jersey number
    const position =
      this.mockPositionsService.getPositionForJerseyNumber(jerseyNumber)!;

    return {
      PlayerID: playerID,
      UserId: userID,
      FirstName: firstName,
      LastName: lastName,
      TeamID: teamID,
      PositionName: position.name,
      PositionAbbrev: position.abbrev,
      JerseyNumber: jerseyNumber,
      GenderID: playerGenderID,
      GenderName: gender.GenderName,
      GenderAbbrev: gender.GenderAbbrev,
      AgeGroupID: teamAgeGroupID,
      AgeGroupName: ageGroup.AgeGroupName,
      MiddleName: '',
      Address1: '',
      Address2: '',
      City: '',
      State: '',
      ZipCode: '',
      NationCode: '',
      EmailAddress: '',
      PhoneNumber: '',
      BirthDate: undefined,
    };
  }

  /**
   * Generate a roster of players for a team
   */
  generateRoster(
    teamID: number,
    teamGenderID: number,
    teamAgeGroupID: number,
    startingPlayerID: number,
    rosterSize = 18
  ): Player[] {
    // Get the context user (the "acting as" user, not the logged-in user)
    const contextUser = this.store.selectSnapshot(
      GlobalContextState.selectedContextUser
    );

    // Generate players with jersey numbers 1-rosterSize
    // Jersey 1 for goalkeeper, 2-rosterSize for other players
    const players: Player[] = [];
    for (let i = 0; i < rosterSize; i++) {
      // Allow cross-gender only for boys teams (girls can join boys teams)
      const allowCrossGender = teamGenderID === 1; // Only for boys teams
      const jerseyNumber = i + 1; // Jersey numbers starting at 1

      // If this is the first player and we have a context user, make them a player on the team
      const userID = i === 0 && contextUser ? contextUser.UserId : 0;

      const player = this.generatePlayer(
        startingPlayerID + i,
        teamID,
        teamGenderID,
        teamAgeGroupID,
        jerseyNumber,
        allowCrossGender,
        userID
      );

      // If this is the context user's player, use their name
      if (i === 0 && contextUser) {
        player.FirstName = contextUser.FirstName;
        player.LastName = contextUser.LastName;
      }

      players.push(player);
    }

    return players;
  }
}
