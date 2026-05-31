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

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-toolbar-team-group-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-team-group-members.component.html',
  styleUrls: ['./toolbar-team-group-members.component.scss'],
})
export class ToolbarTeamGroupMembersComponent extends BaseToolbarComponent {
  // Implement required abstract properties from BaseToolbarComponent
  override toolbarId = 'team-group-members-toolbar';
  override toolbarTitle = 'Team Group Members';
  override toolbarIcon = '🏁';
  // Component-specific inputs
  @Input() selectedTeam: ITeam | null = null;
  @Input() selectedTeamGroup: ITeamGroup | null = null;
  @Input() teamGroupPlayers: Player[] = [];
  @Input() playerSortBy = 'name';
  @Input() playerSortOptions: SortOption[] = [];

  // Component-specific outputs
  @Output() playerSortChange = new EventEmitter<any>();
  @Output() playerEdit = new EventEmitter<Player>();
  @Output() editTeamGroup = new EventEmitter<void>();

  constructor() {
    super();
    // Set default position
    this.position = { x: 1320, y: 200 };
  }

  // Component-specific methods
  onPlayerSortChange(event: any): void {
    this.playerSortChange.emit(event);
  }

  onPlayerEdit(player: Player): void {
    this.playerEdit.emit(player);
  }

  onEditTeamGroup(): void {
    this.editTeamGroup.emit();
  }
}
