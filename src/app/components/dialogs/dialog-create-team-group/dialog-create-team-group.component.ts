import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';
import { MockDataService } from '../../../services/mock-data.service';
import { Player } from '../../../interfaces/player.interfaces';

interface Team {
  TeamID: number;
  TeamName: string;
  Players: Player[];
}

interface PlayerSortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dialog-create-team-group',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-create-team-group.component.html',
  styleUrls: [
    '../../main/dr-ui-vers6/d3-ui-vers6.scss',
    './dialog-create-team-group.component.scss',
  ],
})
export class DialogCreateTeamGroupComponent implements OnInit {
  @Input() visible = false;
  @Input() newTeamGroupName = '';
  @Input() selectedTeam: Team | null = null;
  @Input() playerSortBy = '';
  @Input() playerSortOptions: PlayerSortOption[] = [];
  @Input() newTeamGroupPlayerIds: number[] = [];
  @Input() matchingPositionAbbreviations: string[] = [];
  @Input() matchingPositionNumbers: number[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() playerSortChange = new EventEmitter<Event>();
  @Output() playerCheckboxChange = new EventEmitter<{
    playerId: number;
    checked: boolean;
  }>();
  @Output() matchingPositionsChange = new EventEmitter<string[]>();
  @Output() matchingNumbersChange = new EventEmitter<number[]>();

  // Available positions from mock data service
  availablePositionAbbreviations: string[] = [];
  availablePositionNumbers: number[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    // Load available positions from mock data service
    this.availablePositionAbbreviations =
      this.mockDataService.getPositionAbbreviations();
    this.availablePositionNumbers = this.mockDataService.getPositionNumbers();
  }

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onPlayerSortChange(event: Event): void {
    this.playerSortChange.emit(event);
  }

  onPlayerCheckboxChange(playerId: number, checked: boolean): void {
    this.playerCheckboxChange.emit({ playerId, checked });
  }

  getSelectedTeamPlayers(): Player[] {
    return this.selectedTeam?.Players || [];
  }

  getPlayerFullName(player: Player): string {
    return `${player.FirstName} ${player.LastName}`;
  }

  isPlayerSelected(playerId: number): boolean {
    return this.newTeamGroupPlayerIds.includes(playerId);
  }

  trackByPlayerId(index: number, player: Player): number {
    return player.PlayerID;
  }

  // Position abbreviation selection
  isPositionAbbrevSelected(abbrev: string): boolean {
    return this.matchingPositionAbbreviations.includes(abbrev);
  }

  togglePositionAbbrev(abbrev: string): void {
    const index = this.matchingPositionAbbreviations.indexOf(abbrev);
    if (index > -1) {
      this.matchingPositionAbbreviations.splice(index, 1);
    } else {
      this.matchingPositionAbbreviations.push(abbrev);
    }
    this.matchingPositionsChange.emit(this.matchingPositionAbbreviations);
  }

  // Position number selection
  isPositionNumberSelected(num: number): boolean {
    return this.matchingPositionNumbers.includes(num);
  }

  togglePositionNumber(num: number): void {
    const index = this.matchingPositionNumbers.indexOf(num);
    if (index > -1) {
      this.matchingPositionNumbers.splice(index, 1);
    } else {
      this.matchingPositionNumbers.push(num);
    }
    this.matchingNumbersChange.emit(this.matchingPositionNumbers);
  }

  // Auto-match players based on positions
  autoMatchPlayers(): void {
    if (!this.selectedTeam) return;

    const matchedPlayerIds: number[] = [];

    for (const player of this.selectedTeam.Players) {
      let isMatch = false;

      // Check if player's possible position abbreviations match
      if (
        player.PossiblePositionAbbreviations &&
        this.matchingPositionAbbreviations.length > 0
      ) {
        const hasMatchingAbbrev = player.PossiblePositionAbbreviations.some(
          (abbrev) => this.matchingPositionAbbreviations.includes(abbrev)
        );
        if (hasMatchingAbbrev) {
          isMatch = true;
        }
      }

      // Check if player's possible position numbers match
      if (
        player.PossiblePositionNumbers &&
        this.matchingPositionNumbers.length > 0
      ) {
        const hasMatchingNumber = player.PossiblePositionNumbers.some((num) =>
          this.matchingPositionNumbers.includes(num)
        );
        if (hasMatchingNumber) {
          isMatch = true;
        }
      }

      if (isMatch && !this.newTeamGroupPlayerIds.includes(player.PlayerID)) {
        matchedPlayerIds.push(player.PlayerID);
      }
    }

    // Add matched players to selection
    matchedPlayerIds.forEach((playerId) => {
      this.onPlayerCheckboxChange(playerId, true);
    });
  }

  // Get count of matched players (for button display)
  getAutoMatchCount(): number {
    if (!this.selectedTeam) return 0;

    let count = 0;
    for (const player of this.selectedTeam.Players) {
      let isMatch = false;

      if (
        player.PossiblePositionAbbreviations &&
        this.matchingPositionAbbreviations.length > 0
      ) {
        const hasMatchingAbbrev = player.PossiblePositionAbbreviations.some(
          (abbrev) => this.matchingPositionAbbreviations.includes(abbrev)
        );
        if (hasMatchingAbbrev) {
          isMatch = true;
        }
      }

      if (
        player.PossiblePositionNumbers &&
        this.matchingPositionNumbers.length > 0
      ) {
        const hasMatchingNumber = player.PossiblePositionNumbers.some((num) =>
          this.matchingPositionNumbers.includes(num)
        );
        if (hasMatchingNumber) {
          isMatch = true;
        }
      }

      if (isMatch && !this.newTeamGroupPlayerIds.includes(player.PlayerID)) {
        count++;
      }
    }

    return count;
  }

  // Check if player matches current position criteria
  isPlayerMatched(player: Player): boolean {
    if (
      this.matchingPositionAbbreviations.length === 0 &&
      this.matchingPositionNumbers.length === 0
    ) {
      return false;
    }

    if (
      player.PossiblePositionAbbreviations &&
      this.matchingPositionAbbreviations.length > 0
    ) {
      const hasMatchingAbbrev = player.PossiblePositionAbbreviations.some(
        (abbrev) => this.matchingPositionAbbreviations.includes(abbrev)
      );
      if (hasMatchingAbbrev) {
        return true;
      }
    }

    if (
      player.PossiblePositionNumbers &&
      this.matchingPositionNumbers.length > 0
    ) {
      const hasMatchingNumber = player.PossiblePositionNumbers.some((num) =>
        this.matchingPositionNumbers.includes(num)
      );
      if (hasMatchingNumber) {
        return true;
      }
    }

    return false;
  }
}
