import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

interface Team {
  TeamID: number;
  TeamName: string;
  TeamGroups?: any[];
  Players?: any[];
}

@Component({
  selector: 'app-dialog-delete-team',
  standalone: true,
  imports: [CommonModule, BaseDialogComponent],
  templateUrl: './dialog-delete-team.component.html',

})
export class DialogDeleteTeamComponent {
  @Input() visible = false;
  @Input() teamToDelete: Team | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}

