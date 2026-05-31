import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-toolbar-rotation-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-rotation-control.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-rotation-control.component.scss',
  ],
})
export class ToolbarRotationControlComponent
  extends BaseToolbarComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  // Toolbar configuration
  override toolbarId = 'rotation-control-toolbar';
  override toolbarTitle = 'Navigation';
  override toolbarIcon = '🧭';

  @ViewChild('rotationWheel', { static: false })
  rotationWheelRef?: ElementRef<HTMLDivElement>;

  // Component-specific inputs
  @Input() zoomLevel = 1;
  @Input() panX = 0;
  @Input() panY = 0;
  @Input() panXMin = -500;
  @Input() panXMax = 500;
  @Input() panYMin = -500;
  @Input() panYMax = 500;
  @Input() rotationAngle = 0;

  // Component-specific outputs
  @Output() zoomUpdate = new EventEmitter<any>();
  @Output() panUpdate = new EventEmitter<any>();
  @Output() rotationUpdate = new EventEmitter<any>();
  @Output() resetRotation = new EventEmitter<void>();
  @Output() resetPan = new EventEmitter<void>();
  @Output() resetZoom = new EventEmitter<void>();
  @Output() resetAll = new EventEmitter<void>();

  // Properties for wheel functionality
  private wheelIndicator: any = null;
  private wheelCenterX = 0;
  private wheelCenterY = 0;
  private wheelRadius = 0;
  private currentRotation = 0;
  private wheelInitialized = false;

  ngAfterViewInit(): void {
    // Initialize rotation wheel when expanded - use longer timeout to ensure DOM is ready
    if (this.expanded) {
      setTimeout(() => {
        this.initializeRotationWheel();
      }, 200);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update wheel indicator when rotation angle changes externally
    if (changes['rotationAngle'] && this.wheelIndicator) {
      this.updateWheelIndicator(
        this.wheelIndicator,
        this.wheelCenterX,
        this.wheelCenterY,
        this.wheelRadius
      );
    }

    // Reinitialize wheel when toolbar becomes visible (after being closed)
    if (changes['visible']) {
      if (this.visible && this.expanded) {
        // Reset initialization flag when toolbar is reopened
        this.wheelInitialized = false;
        setTimeout(() => {
          this.initializeRotationWheel();
        }, 200);
      }
    }

    // Initialize wheel when expanded if not already initialized
    if (changes['expanded']) {
      if (this.expanded && !this.wheelInitialized) {
        setTimeout(() => {
          this.initializeRotationWheel();
        }, 200);
      }
    }

    // Reinitialize wheel if dark mode changes (inherited from BaseToolbarComponent)
    if (
      changes['isDarkMode'] &&
      !changes['isDarkMode'].firstChange &&
      this.wheelInitialized
    ) {
      setTimeout(() => this.initializeRotationWheel(), 100);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Override onToggleExpanded to reinitialize wheel when expanding
  override onToggleExpanded(): void {
    super.onToggleExpanded();
    if (this.expanded && !this.wheelInitialized) {
      setTimeout(() => this.initializeRotationWheel(), 200);
    }
  }

  onZoomUpdate(event: any): void {
    this.zoomUpdate.emit(event);
  }

  onPanXUpdate(event: any): void {
    this.panUpdate.emit({ event, axis: 'x' });
  }

  onPanYUpdate(event: any): void {
    this.panUpdate.emit({ event, axis: 'y' });
  }

  onRotationUpdate(event: any): void {
    this.rotationUpdate.emit(event);
  }

  onResetRotation(): void {
    this.resetRotation.emit();
  }

  onResetPan(): void {
    this.resetPan.emit();
  }

  onResetZoom(): void {
    this.resetZoom.emit();
  }

  onResetAll(): void {
    this.resetAll.emit();
  }

  private initializeRotationWheel() {
    if (!this.rotationWheelRef?.nativeElement) {
      // Element not ready yet, retry once after a longer delay
      if (!this.wheelInitialized) {
        setTimeout(() => this.initializeRotationWheel(), 300);
      }
      return;
    }

    const wheelElement = this.rotationWheelRef.nativeElement;
    const wheelSize = 200;
    const wheelRadius = wheelSize / 2 - 10;

    // Define exact center coordinates - use these consistently everywhere
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;

    // Clear any existing SVG
    d3.select(wheelElement).selectAll('*').remove();

    // Create SVG for the rotation wheel
    const wheelSvg = d3
      .select(wheelElement)
      .append('svg')
      .attr('width', wheelSize)
      .attr('height', wheelSize);

    // Create background circle using exact center coordinates
    wheelSvg
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', wheelRadius)
      .attr('fill', 'none')
      .attr('stroke', this.isDarkMode ? '#666' : '#ddd')
      .attr('stroke-width', 2);

    // Create minor degree marks (every 15 degrees)
    for (let degree = 0; degree < 360; degree += 15) {
      const radian = ((degree - 90) * Math.PI) / 180;
      const isMajor = degree % 45 === 0;
      const tickLength = isMajor ? 12 : 6;
      const strokeWidth = isMajor ? 2 : 1;

      const x1 = centerX + Math.cos(radian) * (wheelRadius - tickLength);
      const y1 = centerY + Math.sin(radian) * (wheelRadius - tickLength);
      const x2 = centerX + Math.cos(radian) * wheelRadius;
      const y2 = centerY + Math.sin(radian) * wheelRadius;

      wheelSvg
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.isDarkMode ? '#888' : '#666')
        .attr('stroke-width', strokeWidth);
    }

    // Create major degree labels and cardinal directions
    const majorLabels = [
      { degree: 0, label: 'N' },
      { degree: 45, label: '45°' },
      { degree: 90, label: 'E' },
      { degree: 135, label: '135°' },
      { degree: 180, label: 'S' },
      { degree: 225, label: '225°' },
      { degree: 270, label: 'W' },
      { degree: 315, label: '315°' },
    ];

    majorLabels.forEach(({ degree, label }) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const labelRadius = wheelRadius - 20;
      const x = centerX + Math.cos(radian) * labelRadius;
      const y = centerY + Math.sin(radian) * labelRadius;

      wheelSvg
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', this.isDarkMode ? '#ccc' : '#333')
        .text(label);
    });

    // Create ornate 8-pointed compass star in center
    const mainRadius = 22; // Large points for cardinal directions
    const smallRadius = 12; // Smaller points for intermediate directions
    const centerRadius = 8; // Inner connection point

    const starPoints: string[] = [];

    // Create 8 points with ornate design (alternating large/small with inner connections)
    for (let i = 0; i < 16; i++) {
      const angle = (i * 22.5 * Math.PI) / 180; // 22.5 degrees between each point/connection
      let radius: number;

      if (i % 4 === 0) {
        // Cardinal directions (N, E, S, W) - large points at 0°, 90°, 180°, 270°
        radius = mainRadius;
      } else if (i % 4 === 2) {
        // Intermediate directions (NE, SE, SW, NW) - smaller points at 45°, 135°, 225°, 315°
        radius = smallRadius;
      } else {
        // Inner connection points between star points
        radius = centerRadius;
      }

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        starPoints.push(`M${x},${y}`);
      } else {
        starPoints.push(`L${x},${y}`);
      }
    }
    starPoints.push('Z'); // Close the path

    const starPath = starPoints.join(' ');

    // Draw the ornate compass star
    wheelSvg
      .append('path')
      .attr('d', starPath)
      .attr('fill', this.isDarkMode ? '#64b5f6' : '#2196f3')
      .attr('stroke', this.isDarkMode ? '#90caf9' : '#1976d2')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)
      .attr('stroke-linejoin', 'round');

    // Add a small center circle for extra ornate detail
    wheelSvg
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 3)
      .attr('fill', this.isDarkMode ? '#90caf9' : '#1976d2')
      .attr('stroke', this.isDarkMode ? '#ffffff' : '#ffffff')
      .attr('stroke-width', 1);

    // Create indicator (smaller to match tick circle width)
    const indicator = wheelSvg
      .append('circle')
      .attr('class', 'rotation-wheel-indicator')
      .attr('r', 4)
      .attr('fill', '#ff6b35')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer');

    // Store wheel indicator and parameters for reset functionality
    this.wheelIndicator = indicator;
    this.wheelCenterX = centerX;
    this.wheelCenterY = centerY;
    this.wheelRadius = wheelRadius;
    this.wheelInitialized = true; // Mark as initialized

    // Update indicator position using exact center coordinates
    this.updateWheelIndicator(indicator, centerX, centerY, wheelRadius);

    // Add drag behavior
    const drag = d3.drag<SVGCircleElement, unknown>().on('drag', (event) => {
      const dx = event.x - centerX;
      const dy = event.y - centerY;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;

      const newRotationAngle = Math.round(angle);
      this.currentRotation = (newRotationAngle * Math.PI) / 180;
      this.updateWheelIndicator(indicator, centerX, centerY, wheelRadius);

      // Emit rotation update
      this.rotationUpdate.emit({ target: { value: newRotationAngle } });
    });

    indicator.call(drag as any);
  }

  private updateWheelIndicator(
    indicator: any,
    centerX: number,
    centerY: number,
    wheelRadius: number
  ) {
    if (!indicator) return;

    // Position indicator slightly inside the circle outline to account for indicator's own radius
    const indicatorRadius = 4; // This matches the indicator's r="4" attribute
    const indicatorPositionRadius = wheelRadius - indicatorRadius - 1; // 1px buffer for stroke

    const currentRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const indicatorX =
      centerX + Math.cos(currentRadian) * indicatorPositionRadius;
    const indicatorY =
      centerY + Math.sin(currentRadian) * indicatorPositionRadius;

    indicator.attr('cx', indicatorX).attr('cy', indicatorY);
  }
}
