import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITeam, ITeamGroup, ITenant } from '../../../interfaces';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-teams.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-teams.component.scss',
  ],
})
export class ToolbarTeamsComponent extends BaseToolbarComponent {
  // Required base component properties
  readonly toolbarId = 'teams-toolbar';
  readonly toolbarTitle = 'Teams';
  readonly toolbarIcon = '👥';
  // Removed duplicate inputs - now inherited from BaseToolbarComponent
  @Input() availableTeams: ITeam[] = [];
  @Input() availableTeamGroups: ITeamGroup[] = [];
  @Input() selectedTeamId: number | null = null;
  @Input() selectedTeamGroupId: number | null = null;
  @Input() selectedTeam: ITeam | null = null;
  @Input() selectedTeamGroup: ITeamGroup | null = null;
  @Input() currentUserRoleId = 99; // Default to Developer role for testing

  // Removed duplicate outputs - now inherited from BaseToolbarComponent
  @Output() teamChange = new EventEmitter<Event>();
  @Output() teamGroupChange = new EventEmitter<Event>();
  @Output() createTeam = new EventEmitter<void>();
  @Output() editTeam = new EventEmitter<void>();
  @Output() deleteTeam = new EventEmitter<void>();
  @Output() createTeamGroup = new EventEmitter<void>();
  @Output() editTeamGroup = new EventEmitter<void>();
  @Output() deleteTeamGroup = new EventEmitter<void>();
  @Output() autoBuildTeamGroup = new EventEmitter<void>();
  @Output() importTeamGroup = new EventEmitter<void>();

  // Removed duplicate event handlers - now provided by BaseToolbarComponent

  onTeamChange(event: Event): void {
    this.teamChange.emit(event);
  }

  onTeamGroupChange(event: Event): void {
    this.teamGroupChange.emit(event);
  }

  onCreateTeam(): void {
    this.createTeam.emit();
  }

  onEditTeam(): void {
    this.editTeam.emit();
  }

  onDeleteTeam(): void {
    this.deleteTeam.emit();
  }

  onCreateTeamGroup(): void {
    this.createTeamGroup.emit();
  }

  onEditTeamGroup(): void {
    this.editTeamGroup.emit();
  }

  onDeleteTeamGroup(): void {
    this.deleteTeamGroup.emit();
  }

  onImportTeamGroup(): void {
    console.log(
      'Import Team Group button clicked - emitting importTeamGroup event'
    );
    console.log('Selected Team:', this.selectedTeam);
    this.importTeamGroup.emit();
  }

  /**
   * Check if team group edit button should be enabled based on ownership context and user role
   */
  canEditTeamGroup(): boolean {
    if (!this.selectedTeamGroup || !this.currentUserRoleId) {
      return false;
    }

    const context = this.selectedTeamGroup.OwnershipContext;
    const roleId = this.currentUserRoleId;

    // SYSTEM team groups (TENANT/-1): Only Developer (99) or Administrator (1)
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return roleId === 99 || roleId === 1;
    }

    // TENANT team groups (TENANT/orgId): Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)
    if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11
      );
    }

    // TEAM team groups (TEAM/teamId): Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11), Team Manager (7), Coach (2)
    if (context.Context === 'TEAM') {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11 ||
        roleId === 7 ||
        roleId === 2
      );
    }

    return false;
  }

  /**
   * Check if team group delete button should be enabled based on ownership context and user role
   */
  canDeleteTeamGroup(): boolean {
    if (!this.selectedTeamGroup || !this.currentUserRoleId) {
      return false;
    }

    const context = this.selectedTeamGroup.OwnershipContext;
    const roleId = this.currentUserRoleId;

    // SYSTEM team groups (TENANT/-1): Only Developer (99) or Administrator (1)
    if (context.Context === 'TENANT' && context.ContextKey === -1) {
      return roleId === 99 || roleId === 1;
    }

    // TENANT team groups (TENANT/orgId): Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11)
    if (context.Context === 'TENANT' && context.ContextKey !== -1) {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11
      );
    }

    // TEAM team groups (TEAM/teamId): Developer (99), Administrator (1), Tenant Admin (6), Sporting Architect (9), DOC (10), Club Director (11), Team Manager (7), Coach (2)
    if (context.Context === 'TEAM') {
      return (
        roleId === 99 ||
        roleId === 1 ||
        roleId === 6 ||
        roleId === 9 ||
        roleId === 10 ||
        roleId === 11 ||
        roleId === 7 ||
        roleId === 2
      );
    }

    return false;
  }

  /**
   * Check if a team group is currently selected
   */
  isTeamGroupSelected(groupId: number): boolean {
    return this.selectedTeamGroupId === groupId;
  }

  /**
   * Handle team group selection from the list
   */
  onTeamGroupSelect(groupId: number): void {
    this.selectedTeamGroupId = groupId;
    // Create a synthetic event object to maintain compatibility with existing handlers
    const syntheticEvent = {
      target: { value: groupId.toString() },
    } as unknown as Event;
    this.teamGroupChange.emit(syntheticEvent);
  }

  /**
   * Handle Auto-Build team group functionality
   */
  onAutoBuildTeamGroup(): void {
    if (!this.selectedTeamGroup) {
      return;
    }

    // Check if the team group has position requirements
    const hasPositions =
      this.selectedTeamGroup.MatchingPositions &&
      this.selectedTeamGroup.MatchingPositions.length > 0;
    const hasPositionNumbers =
      this.selectedTeamGroup.MatchingPositionNumbers &&
      this.selectedTeamGroup.MatchingPositionNumbers.length > 0;

    if (!hasPositions && !hasPositionNumbers) {
      // Show alert dialog for missing position requirements
      alert(
        'To create Team Groups using the Auto-Build functionality, please assign positions abbreviations (CB, CAM, HM, etc.) or position numbers (1-11) to players'
      );
      return;
    }

    // Emit the auto-build event for the parent component to handle
    this.autoBuildTeamGroup.emit();
  }
}
