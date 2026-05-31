import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

@Component({
  selector: 'app-dialog-message',
  standalone: true,
  imports: [CommonModule, BaseDialogComponent],
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.scss'],
})
export class DialogMessageComponent {
  @Input() visible = false;
  @Input() title = 'Message';
  @Input() message = '';
  @Input() icon = 'ℹ️';

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
