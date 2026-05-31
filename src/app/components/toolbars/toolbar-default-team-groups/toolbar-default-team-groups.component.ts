import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { IDefaultTeamGroup, ITenant, ITeam } from '../../../interfaces';

@Component({
  selector: 'app-toolbar-default-team-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-default-team-groups.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-default-team-groups.component.scss',
  ],
})
export class ToolbarDefaultTeamGroupsComponent extends BaseToolbarComponent {
  // Required BaseToolbarComponent properties
  readonly toolbarId = 'default-team-groups-toolbar';
  readonly toolbarTitle = 'Default Team Groups';
  readonly toolbarIcon = '👥';
  // Component-specific inputs
  @Input() editing = false;
  @Input() isViewingSystemDefault = false;
  @Input() defaultTeamGroups: IDefaultTeamGroup[] = [];
  @Input() selectedDefaultTeamGroup: IDefaultTeamGroup | null = null;
  @Input() selectedTeam: ITeam | null = null;
  @Input() organizations: ITenant[] = [];
  @Input() formName = '';
  @Input() formOwnership = '';
  @Input() formOrganizationId: number | null = null;
  @Input() formMatchingPositions = '';
  @Input() formMatchingNumbers = '';
  @Input() systemGroupsCount = 0;
  @Input() organizationalGroupsCount = 0;

  // Component-specific outputs
  @Output() selectDefaultTeamGroup = new EventEmitter<IDefaultTeamGroup>();
  @Output() editDefaultTeamGroup = new EventEmitter<IDefaultTeamGroup>();
  @Output() deleteDefaultTeamGroup = new EventEmitter<IDefaultTeamGroup>();
  @Output() createDefaultTeamGroup = new EventEmitter<void>();
  @Output() applyDefaultGroupToTeam = new EventEmitter<void>();
  @Output() ownershipChange = new EventEmitter<void>();
  @Output() saveDefaultTeamGroup = new EventEmitter<void>();
  @Output() copySystemDefaultAsTemplate = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  constructor() {
    super();
  }

  onSelectDefaultTeamGroup(group: IDefaultTeamGroup): void {
    this.selectDefaultTeamGroup.emit(group);
  }

  onEditDefaultTeamGroup(group: IDefaultTeamGroup): void {
    this.editDefaultTeamGroup.emit(group);
  }

  onDeleteDefaultTeamGroup(group: IDefaultTeamGroup): void {
    this.deleteDefaultTeamGroup.emit(group);
  }

  onCreateDefaultTeamGroup(): void {
    this.createDefaultTeamGroup.emit();
  }

  onApplyDefaultGroupToTeam(): void {
    this.applyDefaultGroupToTeam.emit();
  }

  onOwnershipChange(): void {
    this.ownershipChange.emit();
  }

  onSaveDefaultTeamGroup(): void {
    this.saveDefaultTeamGroup.emit();
  }

  onCopySystemDefaultAsTemplate(): void {
    this.copySystemDefaultAsTemplate.emit();
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }

  trackByGroupId(index: number, group: IDefaultTeamGroup): number {
    return group.TeamGroupID;
  }

  getOwnershipLabel(ownershipContext: any): string {
    // Check if it's a system context (TENANT with ContextKey -1)
    if (
      ownershipContext.Context === 'TENANT' &&
      ownershipContext.ContextKey === -1
    ) {
      return 'System';
    }

    switch (ownershipContext.Context?.toLowerCase()) {
      case 'tenant':
        return 'Org';
      case 'team':
        return 'Team';
      case 'user':
        return 'User';
      default:
        return ownershipContext.Context || 'Unknown';
    }
  }
}
