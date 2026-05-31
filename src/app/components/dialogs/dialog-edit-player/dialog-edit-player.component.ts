import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface Player {
  PlayerID: number;
  FirstName: string;
  LastName: string;
  JerseyNumber?: number;
  PositionName: string;
  PositionAbbrev: string;
  GenderName: string;
  AgeGroupName: string;
  PossiblePositionAbbreviations?: string[];
}

interface Position {
  name: string;
  abbreviation: string;
}

interface Gender {
  GenderName: string;
}

interface AgeGroup {
  AgeGroupName: string;
}

@Component({
  selector: 'app-dialog-edit-player',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-edit-player.component.html',
  styleUrls: ['../../main/dr-ui-vers6/d3-ui-vers6.scss'],
})
export class DialogEditPlayerComponent {
  @Input() visible = false;
  @Input() editingPlayer: Player | null = null;
  @Input() availablePositions: Position[] = [];
  @Input() availableGenders: Gender[] = [];
  @Input() availableAgeGroups: AgeGroup[] = [];
  @Input() availableTeamGroups: any[] = [];
  @Input() selectedTeamGroupIds: number[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() positionChange = new EventEmitter<void>();
  @Output() genderChange = new EventEmitter<void>();
  @Output() ageGroupChange = new EventEmitter<void>();
  @Output() teamGroupCheckboxChange = new EventEmitter<{
    teamGroupId: number;
    event: Event;
  }>();

  // Track positions for performance
  trackByAbbreviation(index: number, position: Position): string {
    return position.abbreviation;
  }

  trackByTeamGroupId(index: number, teamGroup: any): number {
    return teamGroup.TeamGroupID;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onPositionChange(): void {
    this.positionChange.emit();
  }

  onPositionCheckboxChange(abbreviation: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (!this.editingPlayer) return;

    if (!this.editingPlayer.PossiblePositionAbbreviations) {
      this.editingPlayer.PossiblePositionAbbreviations = [];
    }

    if (checkbox.checked) {
      if (
        !this.editingPlayer.PossiblePositionAbbreviations.includes(abbreviation)
      ) {
        this.editingPlayer.PossiblePositionAbbreviations.push(abbreviation);
      }
    } else {
      const index =
        this.editingPlayer.PossiblePositionAbbreviations.indexOf(abbreviation);
      if (index > -1) {
        this.editingPlayer.PossiblePositionAbbreviations.splice(index, 1);
      }
      // If this was the primary position, clear it
      if (this.editingPlayer.PositionAbbrev === abbreviation) {
        this.editingPlayer.PositionAbbrev = '';
      }
    }
  }

  onPrimaryPositionChange(): void {
    if (!this.editingPlayer) return;
    const position = this.availablePositions.find(
      (p) => p.abbreviation === this.editingPlayer!.PositionAbbrev
    );
    if (position) {
      this.editingPlayer.PositionName = position.name;
    }
    this.positionChange.emit();
  }

  getPositionName(abbrev: string): string {
    const position = this.availablePositions.find(
      (p) => p.abbreviation === abbrev
    );
    return position ? position.name : abbrev;
  }

  onGenderChange(): void {
    this.genderChange.emit();
  }

  onAgeGroupChange(): void {
    this.ageGroupChange.emit();
  }

  onTeamGroupCheckboxChange(teamGroupId: number, event: Event): void {
    this.teamGroupCheckboxChange.emit({ teamGroupId, event });
  }

  isFormValid(): boolean {
    return !!(
      this.editingPlayer?.FirstName?.trim() &&
      this.editingPlayer?.LastName?.trim()
    );
  }
}
