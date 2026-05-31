import { Injectable } from '@angular/core';
import { IDefaultTeamGroup, OwnershipContext } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DefaultTeamGroupsService {
  private defaultGroups: IDefaultTeamGroup[] = [];

  constructor() {
    this.initializeDefaultTeamGroups();
  }

  /**
   * Get all default team groups
   */
  public getDefaultTeamGroups(): IDefaultTeamGroup[] {
    return [...this.defaultGroups]; // Return a copy to prevent external modifications
  }

  /**
   * Get default team groups filtered by ownership context
   */
  public getDefaultTeamGroupsByContext(
    context: 'USER' | 'TENANT' | 'TEAM',
    contextKey = 0
  ): IDefaultTeamGroup[] {
    return this.defaultGroups.filter(
      (group) =>
        group.OwnershipContext.ContextKey === contextKey &&
        group.OwnershipContext.Context === context
    );
  }

  /**
   * Get system-level default team groups (TENANT with Context -1)
   */
  public getSystemDefaultTeamGroups(): IDefaultTeamGroup[] {
    return this.getDefaultTeamGroupsByContext('TENANT', -1);
  }

  /**
   * Get organization-level default team groups
   */
  public getOrganizationDefaultTeamGroups(orgId = 0): IDefaultTeamGroup[] {
    return this.getDefaultTeamGroupsByContext('TENANT', orgId);
  }

  /**
   * Add a new default team group
   */
  public addDefaultTeamGroup(group: IDefaultTeamGroup): void {
    // Ensure unique ID
    const maxId = Math.max(
      ...this.defaultGroups.map((g) => g.TeamGroupID),
      9000
    );
    group.TeamGroupID = maxId + 1;
    this.defaultGroups.push(group);
  }

  /**
   * Update an existing default team group
   */
  public updateDefaultTeamGroup(
    groupId: number,
    updatedGroup: Partial<IDefaultTeamGroup>
  ): boolean {
    const index = this.defaultGroups.findIndex(
      (g) => g.TeamGroupID === groupId
    );
    if (index !== -1) {
      this.defaultGroups[index] = {
        ...this.defaultGroups[index],
        ...updatedGroup,
      };
      return true;
    }
    return false;
  }

  /**
   * Delete a default team group (only if not system default)
   */
  public deleteDefaultTeamGroup(groupId: number): boolean {
    const index = this.defaultGroups.findIndex(
      (g) => g.TeamGroupID === groupId
    );
    if (index !== -1 && !this.defaultGroups[index].IsSystemDefault) {
      this.defaultGroups.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Generate a new unique team group ID
   */
  public generateNewTeamGroupId(): number {
    const maxId = Math.max(
      ...this.defaultGroups.map((g) => g.TeamGroupID),
      9000
    );
    return maxId + 1;
  }

  /**
   * Get default team groups that match specific positions or position numbers
   */
  public getMatchingDefaultTeamGroups(
    positions: string[] = [],
    positionNumbers: number[] = []
  ): IDefaultTeamGroup[] {
    return this.defaultGroups.filter((group) => {
      const hasMatchingPosition =
        positions.length === 0 ||
        positions.some((pos) => group.MatchingPositions.includes(pos));
      const hasMatchingNumber =
        positionNumbers.length === 0 ||
        positionNumbers.some((num) =>
          group.MatchingPositionNumbers.includes(num)
        );

      return hasMatchingPosition || hasMatchingNumber;
    });
  }

  /**
   * Initialize the default team groups with system and organization defaults
   */
  private initializeDefaultTeamGroups(): void {
    this.defaultGroups = [
      {
        TeamGroupID: 9001,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Starting',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9002,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Reserves',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9003,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Defenders',
        Players: [],
        MatchingPositions: ['HM', 'CB', 'WB', 'GK'],
        MatchingPositionNumbers: [2, 3, 4, 5, 6],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9004,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Attackers',
        Players: [],
        MatchingPositions: ['WF', 'CM', 'CAM', 'HM', 'ST'],
        MatchingPositionNumbers: [6, 7, 9, 10, 11],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9005,
        OwnershipContext: { Context: 'TENANT', ContextKey: 0 },
        TeamGroupName: 'Midfielders',
        Players: [],
        MatchingPositions: ['CM', 'CAM', 'HM'],
        MatchingPositionNumbers: [6, 8, 10],
        IsSystemDefault: false,
      },
      {
        TeamGroupID: 9006,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Set-Piece Executors',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9007,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Set-Piece Blockers/Targets',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9008,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Goalkeeping',
        Players: [],
        MatchingPositions: ['GK'],
        MatchingPositionNumbers: [1],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9009,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Penalty Kick Takers',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9010,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Improvement - Match Skills',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9011,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Improvement - Precision Work',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9012,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Improvement - Movement Patterns',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
      {
        TeamGroupID: 9013,
        OwnershipContext: { Context: 'TENANT', ContextKey: -1 },
        TeamGroupName: 'Improvement - Tackling',
        Players: [],
        MatchingPositions: [],
        MatchingPositionNumbers: [],
        IsSystemDefault: true,
      },
    ];
  }
}
