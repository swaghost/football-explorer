import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-selection-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-selection-tools.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-selection-tools.component.scss',
  ],
})
export class ToolbarSelectionToolsComponent extends BaseToolbarComponent {
  // Required base component properties
  readonly toolbarId = 'selection-tools-toolbar';
  readonly toolbarTitle = 'Selection';
  readonly toolbarIcon = '🛠️';
  readonly toolbarHelp =
    'Selection tools for navigating and selecting nodes. Use pan to move the canvas, select to click nodes, lasso to draw a selection area, zoom drag to click for quick zoom in/out or draw a rectangle to center and zoom by 0.30 (hold CTRL to zoom out instead), and related nodes to select connected nodes.';

  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() drawingMode = 'pan';
  @Input() lassoMode = 'select';
  @Input() relatedNodeDirection = 'descendants';
  @Input() relatedNodeMode = 'selection';

  // Component-specific outputs
  @Output() setDrawingMode = new EventEmitter<any>();
  @Output() setLassoMode = new EventEmitter<any>();
  @Output() toggleRelatedNodeDirection = new EventEmitter<void>();
  @Output() toggleRelatedNodeMode = new EventEmitter<void>();

  constructor() {
    super();
  }

  onSetDrawingMode(mode: string): void {
    // Toggle: if clicking the currently active mode, switch to pan
    if (this.drawingMode === mode) {
      this.setDrawingMode.emit('pan');
    } else {
      this.setDrawingMode.emit(mode);
    }
  }

  onSetLassoMode(mode: string): void {
    this.setLassoMode.emit(mode);
  }

  onToggleRelatedNodeDirection(): void {
    this.toggleRelatedNodeDirection.emit();
  }

  onToggleRelatedNodeMode(): void {
    this.toggleRelatedNodeMode.emit();
  }
}
