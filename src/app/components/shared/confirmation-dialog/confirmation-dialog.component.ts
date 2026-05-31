import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onOverlayClick()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="dialog-content">
          <p>{{ message }}</p>
        </div>
        <div class="dialog-actions">
          <button
            class="btn btn-secondary"
            (click)="onCancel()"
            *ngIf="cancelText"
          >
            {{ cancelText }}
          </button>
          <button class="btn btn-primary" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit(true);
    this.closed.emit();
  }

  onCancel(): void {
    this.confirmed.emit(false);
    this.closed.emit();
  }

  onOverlayClick(): void {
    this.onCancel();
  }
}
