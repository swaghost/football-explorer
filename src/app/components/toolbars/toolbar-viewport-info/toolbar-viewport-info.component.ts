import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-viewport-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-viewport-info.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-viewport-info.component.scss',
  ],
})
export class ToolbarViewportInfoComponent extends BaseToolbarComponent {
  // Required base component properties
  readonly toolbarId = 'viewport-info-toolbar';
  readonly toolbarTitle = 'Viewport';
  readonly toolbarIcon = '📐';
  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() width = 0;
  @Input() height = 0;
  @Input() visualModeLabel = '';
  @Input() treeSizeModeLabel = '';
  @Input() zoomLevel = 1;
  @Input() panX = 0;
  @Input() panY = 0;
  @Input() rotationAngle = 0;
  @Input() nodeCount = 0;
  @Input() selectedNodesCount = 0;
  @Input() drawingMode = '';
  @Input() strokesCount = 0;

  constructor() {
    super();
  }
}
