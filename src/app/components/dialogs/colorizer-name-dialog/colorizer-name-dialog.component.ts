import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  sanitizeColorizerName,
  isValidColorizerName,
} from '../../../utils/colorizer-export.utils';

export interface ColorizerNameDialogResult {
  originalName: string;
  sanitizedName: string;
}

@Component({
  selector: 'app-colorizer-name-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ title }}</h2>
          <button class="close-button" (click)="onCancel()" aria-label="Close">
            ✕
          </button>
        </div>

        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>

          <div class="form-group">
            <label for="colorizer-name">Colorizer Name</label>
            <input
              id="colorizer-name"
              type="text"
              [(ngModel)]="colorizerName"
              (keyup.enter)="onSave()"
              (input)="onNameChange()"
              placeholder="Enter colorizer name"
              class="input-field"
              #nameInput
            />
          </div>

          <div class="preview-section" *ngIf="colorizerName">
            <p class="preview-label">Export Filename:</p>
            <p class="preview-text">{{ exportFilename }}</p>
            <p class="sanitized-label" *ngIf="sanitizedName !== colorizerName">
              <em>Name will be sanitized to: "{{ sanitizedName }}"</em>
            </p>
          </div>

          <p class="validation-error" *ngIf="validationError">
            {{ validationError }}
          </p>
        </div>

        <div class="dialog-actions">
          <button class="button button-secondary" (click)="onCancel()">
            Cancel
          </button>
          <button
            class="button button-primary"
            (click)="onSave()"
            [disabled]="!isValid()"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-content {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        min-width: 400px;
        max-width: 500px;
        overflow: hidden;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .close-button:hover {
        background: #f0f0f0;
        color: #333;
      }

      .dialog-body {
        padding: 20px;
      }

      .dialog-message {
        color: #666;
        margin: 0 0 20px 0;
        font-size: 14px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
        font-size: 14px;
      }

      .input-field {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
        transition: all 0.2s ease;
      }

      .input-field:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
      }

      .preview-section {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 6px;
        margin: 15px 0;
      }

      .preview-label {
        font-weight: 500;
        font-size: 12px;
        color: #666;
        margin: 0 0 5px 0;
      }

      .preview-text {
        font-family: monospace;
        background: white;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ddd;
        margin: 0;
        word-break: break-all;
        font-size: 13px;
      }

      .sanitized-label {
        font-size: 12px;
        color: #ff9800;
        margin: 8px 0 0 0;
      }

      .validation-error {
        color: #d32f2f;
        font-size: 12px;
        margin: 10px 0 0 0;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 20px;
        border-top: 1px solid #eee;
        background: #fafafa;
      }

      .button {
        padding: 10px 20px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;
        color: #333;
      }

      .button:hover:not(:disabled) {
        border-color: #bbb;
        background: #f9f9f9;
      }

      .button:active:not(:disabled) {
        background: #f0f0f0;
      }

      .button-primary {
        background: #4a90e2;
        color: white;
        border-color: #4a90e2;
      }

      .button-primary:hover:not(:disabled) {
        background: #357ad1;
        border-color: #357ad1;
      }

      .button-secondary {
        background: white;
        color: #333;
        border-color: #ddd;
      }

      .button-secondary:hover:not(:disabled) {
        background: #f9f9f9;
        border-color: #999;
      }

      .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class ColorizerNameDialogComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Save Colorizer';
  @Input() message = 'Enter a name for your colorizer:';
  @Input() defaultName = '';
  @Output() result = new EventEmitter<ColorizerNameDialogResult | null>();

  colorizerName: string = '';
  sanitizedName: string = '';
  exportFilename: string = '';
  validationError: string = '';

  ngOnInit(): void {
    if (this.defaultName) {
      this.colorizerName = this.defaultName;
      this.onNameChange();
    }
  }

  onNameChange(): void {
    this.sanitizedName = sanitizeColorizerName(this.colorizerName);
    this.exportFilename = `COLORIZER.${this.sanitizedName}.json`;
    this.validateName();
  }

  validateName(): void {
    this.validationError = '';

    if (!this.colorizerName.trim()) {
      this.validationError = 'Colorizer name is required';
      return;
    }

    if (!isValidColorizerName(this.colorizerName)) {
      this.validationError =
        'Invalid colorizer name. Name is too long or invalid.';
      return;
    }
  }

  isValid(): boolean {
    return (
      this.colorizerName.trim().length > 0 &&
      isValidColorizerName(this.colorizerName)
    );
  }

  onSave(): void {
    if (!this.isValid()) {
      return;
    }

    // Return the sanitized name
    this.result.emit({
      originalName: this.colorizerName,
      sanitizedName: this.sanitizedName,
    });

    this.resetForm();
  }

  onCancel(): void {
    this.result.emit(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.colorizerName = '';
    this.sanitizedName = '';
    this.exportFilename = '';
    this.validationError = '';
  }
}
