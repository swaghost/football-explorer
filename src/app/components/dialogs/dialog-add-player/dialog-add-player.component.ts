import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Player,
  ITeam,
  ITeamGroup,
  Gender,
  AgeGroup,
} from '../../../interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface Position {
  name: string;
  abbreviation: string;
}

@Component({
  selector: 'app-dialog-add-player',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-add-player.component.html',

})
export class DialogAddPlayerComponent {
  @Input() visible = false;
  @Input() newPlayer: Partial<Player> = {
    FirstName: '',
    LastName: '',
    JerseyNumber: 0,
  };
  @Input() availablePositions: Position[] = [];
  @Input() availableGenders: Gender[] = [];
  @Input() availableAgeGroups: AgeGroup[] = [];
  @Input() availableTeamGroups: ITeamGroup[] = [];
  @Input() selectedTeam: ITeam | null = null;
  @Input() newPlayerPositions: string[] = [];
  @Input() newPlayerPrimaryPosition = '';
  @Input() selectedTeamGroupIds: number[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() genderChange = new EventEmitter<void>();
  @Output() ageGroupChange = new EventEmitter<void>();
  @Output() positionCheckboxChange = new EventEmitter<{
    position: string;
    event: Event;
  }>();
  @Output() teamGroupCheckboxChange = new EventEmitter<{
    teamGroupId: number;
    event: Event;
  }>();

  // Track functions for performance
  trackByAbbreviation(index: number, position: Position): string {
    return position.abbreviation;
  }

  trackByPositionName(index: number, position: string): string {
    return position;
  }

  trackByTeamGroupId(index: number, teamGroup: ITeamGroup): number {
    return teamGroup.TeamGroupID;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onGenderChange(): void {
    this.genderChange.emit();
  }

  onAgeGroupChange(): void {
    this.ageGroupChange.emit();
  }

  onPositionCheckboxChange(position: string, event: Event): void {
    this.positionCheckboxChange.emit({ position, event });
  }

  onTeamGroupCheckboxChange(teamGroupId: number, event: Event): void {
    this.teamGroupCheckboxChange.emit({ teamGroupId, event });
  }

  isFormValid(): boolean {
    return !!(
      this.newPlayer.FirstName &&
      this.newPlayer.LastName &&
      this.newPlayer.JerseyNumber !== null &&
      this.newPlayer.GenderName &&
      this.newPlayer.AgeGroupName &&
      this.newPlayerPositions.length > 0 &&
      this.newPlayerPrimaryPosition
    );
  }
}

