import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-screenshots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-screenshots.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-screenshots.component.scss',
  ],
})
export class ToolbarScreenshotsComponent extends BaseToolbarComponent {
  // Required base component properties
  readonly toolbarId = 'screenshots-toolbar';
  readonly toolbarTitle = 'Screenshots';
  readonly toolbarIcon = '📷';

  // Screenshot inputs
  @Input() screenshotFormat: 'png' | 'jpg' = 'png';
  @Input() screenshotTarget: 'clipboard' | 'download' = 'download';
  @Input() snagitMode = false;

  // Screenshot outputs
  @Output() takeScreenshot = new EventEmitter<{
    format: 'png' | 'jpg';
    target: 'clipboard' | 'download';
  }>();
  @Output() toggleSnagit = new EventEmitter<void>();
  @Output() updateScreenshotFormat = new EventEmitter<'png' | 'jpg'>();
  @Output() updateScreenshotTarget = new EventEmitter<
    'clipboard' | 'download'
  >();

  constructor() {
    super();
  }

  // Screenshot handlers
  onSetScreenshotFormat(format: 'png' | 'jpg'): void {
    this.updateScreenshotFormat.emit(format);
  }

  onSetScreenshotTarget(target: 'clipboard' | 'download'): void {
    this.updateScreenshotTarget.emit(target);
  }

  onTakeScreenshot(): void {
    this.takeScreenshot.emit({
      format: this.screenshotFormat,
      target: this.screenshotTarget,
    });
  }

  onToggleSnagit(): void {
    this.toggleSnagit.emit();
  }
}
