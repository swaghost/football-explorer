import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent } from '../../shared/base-dialog/base-dialog.component';

export interface AutoFadeOptions {
  showLogo: boolean;
  logoZoomEffect: boolean;
  backgroundColor: string;
  foregroundColor: string;
  displayStageSeconds: number;
  waitDelaySeconds: number;
  textMessage: string;
  textZoomEffect: boolean;
  fontFamily: string;
  closeToolbarAfterStart: boolean;
}

@Component({
  selector: 'app-auto-fade-options-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: './auto-fade-options-dialog.component.html',
  styleUrls: ['./auto-fade-options-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AutoFadeOptionsDialogComponent {
  @Input() visible = false;

  // Available font options
  availableFonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { name: 'Impact', value: 'Impact, fantasy' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Eurostile', value: 'Eurostile, sans-serif' },
    { name: 'Eurostile Demi', value: 'Eurostile Demi, sans-serif' },
    { name: 'Eurostile Oblique', value: 'Eurostile Oblique, sans-serif' },
  ];

  private _options: AutoFadeOptions = {
    showLogo: true,
    logoZoomEffect: true,
    backgroundColor: '#000000',
    foregroundColor: '#ffffff',
    displayStageSeconds: 2,
    waitDelaySeconds: 1,
    textMessage: '',
    textZoomEffect: true,
    fontFamily: 'Arial, sans-serif',
    closeToolbarAfterStart: false,
  };

  @Input()
  get options(): AutoFadeOptions {
    return this._options;
  }
  set options(value: AutoFadeOptions | undefined) {
    // Create a deep copy to avoid NGXS read-only errors
    this._options = value
      ? { ...value }
      : {
          showLogo: true,
          logoZoomEffect: true,
          backgroundColor: '#000000',
          foregroundColor: '#ffffff',
          displayStageSeconds: 2,
          waitDelaySeconds: 1,
          textMessage: '',
          textZoomEffect: true,
          fontFamily: 'Arial, sans-serif',
          closeToolbarAfterStart: false,
        };
  }

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<AutoFadeOptions>();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit(this.options);
  }

  clearTextMessage(): void {
    this.options.textMessage = '';
  }
}
