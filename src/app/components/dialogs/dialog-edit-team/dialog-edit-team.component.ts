import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITeam, ITenant, Gender, AgeGroup } from '../../../interfaces';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

@Component({
  selector: 'app-dialog-edit-team',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './dialog-edit-team.component.html',
  styleUrls: ['./dialog-edit-team.component.scss'],
})
export class DialogEditTeamComponent {
  @Input() visible = false;
  @Input() editingTeam: ITeam | null = null;
  @Input() organizations: ITenant[] = [];
  @Input() genders: Gender[] = [];
  @Input() ageGroups: AgeGroup[] = [];

  // Form fields
  @Input() editTeamName = '';
  @Input() editTeamTenantId: number | null = null;
  @Input() editTeamGenderId: number | null = null;
  @Input() editTeamAgeGroupId: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() teamNameChange = new EventEmitter<string>();
  @Output() teamOrganizationChange = new EventEmitter<number>();
  @Output() teamGenderChange = new EventEmitter<number>();
  @Output() teamAgeGroupChange = new EventEmitter<number>();

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onTeamNameChange(teamName: string): void {
    this.teamNameChange.emit(teamName);
  }

  onTeamOrganizationChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const orgId = parseInt(target.value, 10);
    this.teamOrganizationChange.emit(orgId);
  }

  onTeamGenderChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const genderId = parseInt(target.value, 10);
    this.teamGenderChange.emit(genderId);
  }

  onTeamAgeGroupChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const ageGroupId = parseInt(target.value, 10);
    this.teamAgeGroupChange.emit(ageGroupId);
  }

  canSave(): boolean {
    return !!(
      this.editTeamName?.trim() &&
      this.editTeamTenantId &&
      this.editTeamGenderId &&
      this.editTeamAgeGroupId
    );
  }
}
