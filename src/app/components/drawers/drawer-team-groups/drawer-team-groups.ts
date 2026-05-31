import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';
import { ITeamGroup } from '../../../interfaces/team-group.interfaces';

@Component({
  selector: 'app-drawer-team-groups',
  standalone: true,
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './drawer-team-groups.html',
  styleUrls: ['./drawer-team-groups.scss'],
})
export class DrawerTeamGroups {
  @Input() isOpen = false;
  @Input() teamGroups: ITeamGroup[] = [];
  @Input() selectedTeamGroup: ITeamGroup | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() selectTeamGroup = new EventEmitter<ITeamGroup | null>();
  @Output() createTeamGroup = new EventEmitter<void>();
  @Output() editTeamGroup = new EventEmitter<void>();
  @Output() deleteTeamGroup = new EventEmitter<void>();
  @Output() importDefaultTeamGroups = new EventEmitter<void>();

  expandedGroups = new Set<number>(); // Track which team groups have expanded player lists

  drawerHelp = `
    <strong>Team Groups Drawer</strong><br><br>
    Select and manage team groups for the selected team.<br><br>
    <strong>Features:</strong><br>
    • View all team groups for the current team<br>
    • Select a team group by clicking on it<br>
    • Expand to see player details and positions<br>
    • Deselect by clicking the selected group again<br>
    • Create new team groups<br>
    • Edit existing team groups<br>
    • Delete team groups<br>
    • Import default team groups<br><br>
    <strong>Note:</strong> A team must be selected to view team groups.
  `;

  get canEdit(): boolean {
    return this.selectedTeamGroup !== null;
  }

  get canDelete(): boolean {
    return this.selectedTeamGroup !== null;
  }

  onClose(): void {
    this.close.emit();
  }

  onSelectTeamGroup(teamGroup: ITeamGroup): void {
    // If clicking the same team group, deselect it
    if (this.selectedTeamGroup?.TeamGroupID === teamGroup.TeamGroupID) {
      this.selectTeamGroup.emit(null);
    } else {
      this.selectTeamGroup.emit(teamGroup);
    }
  }

  isSelected(teamGroup: ITeamGroup): boolean {
    return this.selectedTeamGroup?.TeamGroupID === teamGroup.TeamGroupID;
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

  getPlayerCount(teamGroup: ITeamGroup): number {
    return teamGroup.Players?.length || 0;
  }

  getPositionsDisplay(teamGroup: ITeamGroup): string {
    if (teamGroup.MatchingPositions && teamGroup.MatchingPositions.length > 0) {
      return teamGroup.MatchingPositions.join(', ');
    }
    if (
      teamGroup.MatchingPositionNumbers &&
      teamGroup.MatchingPositionNumbers.length > 0
    ) {
      return teamGroup.MatchingPositionNumbers.join(', ');
    }
    return 'No positions assigned';
  }

  onImportDefaultTeamGroups(): void {
    this.importDefaultTeamGroups.emit();
  }

  /**
   * Toggle expanded state for a team group
   */
  toggleExpanded(teamGroupId: number, event: Event): void {
    event.stopPropagation(); // Prevent team group selection
    if (this.expandedGroups.has(teamGroupId)) {
      this.expandedGroups.delete(teamGroupId);
    } else {
      this.expandedGroups.add(teamGroupId);
    }
  }

  /**
   * Check if a team group is expanded
   */
  isExpanded(teamGroupId: number): boolean {
    return this.expandedGroups.has(teamGroupId);
  }
}
