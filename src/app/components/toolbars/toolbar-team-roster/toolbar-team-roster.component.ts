import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ITeam,
  Player,
  ITeamGroup,
  ToolbarPosition,
} from '../../../interfaces';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-toolbar-team-roster',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-team-roster.component.html',
  styleUrls: ['./toolbar-team-roster.component.scss'],
})
export class ToolbarTeamRosterComponent extends BaseToolbarComponent {
  // Implement required abstract properties from BaseToolbarComponent
  override toolbarId = 'team-roster-toolbar';
  override toolbarTitle = 'Team Roster';
  override toolbarIcon = '🏃';
  // Component-specific inputs
  @Input() selectedTeam: ITeam | null = null;
  @Input() teamPlayers: Player[] = [];
  @Input() selectedPlayerIds: number[] = [];
  @Input() playerFilterBy = 'all';
  @Input() playerSortBy = 'name';
  @Input() playerFilterOptions: FilterOption[] = [];
  @Input() playerSortOptions: SortOption[] = [];
  @Input() areAllVisiblePlayersSelected = false;
  @Input() areSomeVisiblePlayersSelected = false;

  // Component-specific outputs
  @Output() playerFilterChange = new EventEmitter<any>();
  @Output() playerSortChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() playerCheckboxChange = new EventEmitter<{
    playerId: number;
    checked: boolean;
  }>();
  @Output() playerEdit = new EventEmitter<Player>();
  @Output() addPlayer = new EventEmitter<void>();
  @Output() removePlayer = new EventEmitter<void>();
  @Output() createTeamGroup = new EventEmitter<void>();
  @Output() importTeamGroup = new EventEmitter<void>();

  constructor() {
    super();
    // Set default position
    this.position = { x: 0, y: 0 };
  }

  // Component-specific methods
  onPlayerFilterChange(event: any): void {
    this.playerFilterChange.emit(event);
  }

  onPlayerSortChange(event: any): void {
    this.playerSortChange.emit(event);
  }

  onSelectAllChange(areAllSelected: boolean): void {
    this.selectAllChange.emit(areAllSelected);
  }

  onPlayerCheckboxChange(playerId: number, event: any): void {
    this.playerCheckboxChange.emit({
      playerId,
      checked: event.target.checked,
    });
  }

  onPlayerEdit(player: Player): void {
    this.playerEdit.emit(player);
  }

  onAddPlayer(): void {
    this.addPlayer.emit();
  }

  onRemovePlayer(): void {
    this.removePlayer.emit();
  }

  onCreateTeamGroup(): void {
    this.createTeamGroup.emit();
  }

  onImportTeamGroup(): void {
    this.importTeamGroup.emit();
  }

  trackByPlayerId(index: number, player: Player): number {
    return player.PlayerID;
  }

  isPlayerSelected(playerId: number): boolean {
    return this.selectedPlayerIds.includes(playerId);
  }

  getPlayerFullName(player: Player): string {
    return `${player.FirstName} ${player.LastName}`;
  }
}
