import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';
import { IDefaultTeamGroup } from '../../../interfaces/team-group.interfaces';

interface Organization {
  OrgID: number;
  OrgName: string;
}

interface NewTeamPlayer {
  FirstName: string;
  LastName: string;
  PositionAbbrev: string;
  JerseyNumber: number;
}

@Component({
  selector: 'app-dialog-create-team',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-create-team.component.html',

})
export class DialogCreateTeamComponent {
  @Input() visible = false;
  @Input() newTeamName = '';
  @Input() selectedTenantIdForNewTeam: number | null = null;
  @Input() organizations: Organization[] = [];
  @Input() availableDefaultTeamGroups: IDefaultTeamGroup[] = [];
  @Input() areAllDefaultTeamGroupsSelected = false;
  @Input() selectedDefaultTeamGroups: number[] = [];
  @Input() selectedDefaultTeamGroupsForNewTeam = new Set<number>();
  @Input() newPlayerFirstName = '';
  @Input() newPlayerLastName = '';
  @Input() newPlayerPosition = '';
  @Input() newPlayerJerseyNumber: number | null = null;
  @Input() newTeamPlayers: NewTeamPlayer[] = [];
  @Input() isCreatingTeam = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() toggleSelectAllDefaultTeamGroups = new EventEmitter<void>();
  @Output() toggleDefaultTeamGroupSelection = new EventEmitter<number>();
  @Output() addPlayerToNewTeam = new EventEmitter<void>();
  @Output() removePlayerFromNewTeam = new EventEmitter<number>();

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onToggleSelectAllDefaultTeamGroups(): void {
    this.toggleSelectAllDefaultTeamGroups.emit();
  }

  onToggleDefaultTeamGroupSelection(teamGroupId: number): void {
    this.toggleDefaultTeamGroupSelection.emit(teamGroupId);
  }

  onAddPlayerToNewTeam(): void {
    this.addPlayerToNewTeam.emit();
  }

  onRemovePlayerFromNewTeam(index: number): void {
    this.removePlayerFromNewTeam.emit(index);
  }

  isDefaultTeamGroupSelected(teamGroupId: number): boolean {
    return this.selectedDefaultTeamGroups.includes(teamGroupId);
  }

  getOwnershipLabel(ownershipContext: { Context: string }): string {
    return ownershipContext.Context;
  }
}

