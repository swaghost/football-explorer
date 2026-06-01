import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarPosition } from '../../../interfaces';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

@Component({
  selector: 'app-toolbar-selected-node-state',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-selected-node-state.component.html',
  styleUrls: ['./toolbar-selected-node-state.component.scss'],
})
export class ToolbarSelectedNodeStateComponent extends BaseToolbarComponent {
  // Implement required abstract properties from BaseToolbarComponent
  override toolbarId = 'selected-node-state-toolbar';
  override toolbarTitle = 'Selected Node';
  override toolbarIcon = '📍';
  // Component-specific inputs
  @Input() selectedNode: string | null = null;
  @Input() textX: number | null = null;
  @Input() textY: number | null = null;
  @Input() textRotation: number | null = null;
  @Input() textAnchor: string | null = null;
  @Input() has180Added: boolean = false;

  // Transform state inputs
  @Input() currentZoom: number = 1;
  @Input() currentPanX: number = 0;
  @Input() currentPanY: number = 0;
  @Input() currentRotation: number = 0;

  // Debug: Intermediate angle calculations
  @Input() angleFromCenter: number | null = null;
  @Input() effectiveAngle: number | null = null;
  @Input() normalizedAngle: number | null = null;
  @Input() baseRotationDeg: number | null = null;
  @Input() finalRotationDeg: number | null = null;
  @Input() viewerAngle: number | null = null;

  constructor() {
    super();
    // Set default position - can be overridden by parent
    this.position = { x: 0, y: 0 };
  }
}
