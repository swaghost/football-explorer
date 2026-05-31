import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface TeamGroup {
  TeamGroupID: number;
  TeamGroupName: string;
  Players?: any[];
}

@Component({
  selector: 'app-dialog-delete-team-group',
  standalone: true,
  imports: [CommonModule, BaseDialogComponent],
  templateUrl: './dialog-delete-team-group.component.html',

})
export class DialogDeleteTeamGroupComponent {
  @Input() visible = false;
  @Input() teamGroupToDelete: TeamGroup | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}

