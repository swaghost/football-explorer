import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import * as d3 from 'd3';
import {
  ILesson,
  ILessonElement,
} from '../../../interfaces/lesson-builder.interfaces';
import {
  LessonsState,
  AddLesson,
  SelectLesson,
  UpdateLesson,
  RemoveLesson,
} from '../../../state/lessons.state';

// Define interfaces locally
export interface DrawingStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  width: number;
  mode: 'pencil' | 'eraser';
}

@Component({
  selector: 'app-d3-pzfw-sketch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d3-example-pzfw-sketch-nodes.component.html',
  styleUrls: ['./d3-example-pzfw-sketch-nodes.component.scss'],
})
export class D3ExamplePZFWSketchNodesComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('rotationWheel', { static: false })
  rotationWheelRef?: ElementRef<HTMLDivElement>;

  // Inject Store
  private store = inject(Store);

  public width = window.innerWidth;
  public height = window.innerHeight;
  private previousWidth = window.innerWidth;
  private previousHeight = window.innerHeight;

  // Local state properties
  public selectedNode: string | null = null;
  public zoomLevel = 1;
  public panX = 0;
  public panY = 0;
  public nodeCount = 25;
  public rotationAngle = 0;
  public drawingMode: 'pencil' | 'eraser' | 'pan' | 'select' | 'lasso' = 'pan';
  public selectedColor = '#ff0000';
  public brushSize = 3;
  public eraserSize = 10;
  public eraserMode: 'normal' | 'magic' = 'magic';
  public isDarkMode = false;
  public snapToolbarsOnResize = true; // Default to checked
  public strokes: DrawingStroke[] = [];
  public selectedNodes: string[] = []; // List of selected node IDs

  // Lasso selection properties
  public lassoPath: { x: number; y: number }[] = [];
  public isLassoActive = false;
  public lassoMode: 'select' | 'deselect' = 'select';

  // Toolbar positions state
  public toolbarPositions: {
    selectionTools: { x: number; y: number };
    drawingModifiers: { x: number; y: number };
    lessons: { x: number; y: number };
    selectedNodes: { x: number; y: number };
    zoomControls: { x: number; y: number };
    rotationControl: { x: number; y: number };
    statusPanel: { x: number; y: number };
  } = {
    selectionTools: { x: 20, y: 20 },
    drawingModifiers: { x: 360, y: 20 },
    lessons: { x: 20, y: 400 },
    selectedNodes: { x: 20, y: 600 },
    zoomControls: { x: window.innerWidth - 320, y: 20 },
    rotationControl: { x: window.innerWidth - 300, y: 120 },
    statusPanel: { x: window.innerWidth / 2 - 160, y: window.innerHeight - 80 },
  };

  // Toolbar lock states
  public toolbarLocks: {
    selectionTools: boolean;
    drawingModifiers: boolean;
    lessons: boolean;
    selectedNodes: boolean;
    zoomControls: boolean;
    rotationControl: boolean;
    statusPanel: boolean;
  } = {
    selectionTools: false,
    drawingModifiers: false,
    lessons: false,
    selectedNodes: false,
    zoomControls: false,
    rotationControl: false,
    statusPanel: false,
  };

  // NGXS State Observables
  public currentLessons$: Observable<ILesson[]> = this.store.select(
    LessonsState.getLessons
  );
  public selectedLesson$: Observable<ILesson | null> = this.store.select(
    LessonsState.getSelectedLesson
  );
  public hasLessons$: Observable<boolean> = this.store.select(
    LessonsState.hasLessons
  );

  // Current values for template (updated via subscriptions)
  public currentLessons: ILesson[] = [];
  public selectedLesson: ILesson | null = null;

  public tooltip: { visible: boolean; x: number; y: number; text: string } = {
    visible: false,
    x: 0,
    y: 0,
    text: '',
  };

  // Local component properties
  public isDrawing = false;

  // Drawing colors palette
  public colors = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#000000', // Black
    '#ffffff', // White
    '#ff8000', // Orange
    '#8000ff', // Purple
    '#808080', // Gray
    '#964B00', // Brown
  ];

  private svg: any;
  private g: any;
  private drawingLayer: any;
  private zoom: any;
  private degreeGroup: any;
  private currentRotation = 0;
  private currentStroke: DrawingStroke | null = null;
  private strokeIdCounter = 0;
  private wheelIndicator: any = null;
  private wheelCenterX = 0;
  private wheelCenterY = 0;
  private wheelRadius = 0;

  constructor() {}

  ngOnInit(): void {
    // Load saved toolbar positions before template rendering
    this.loadToolbarPositions();
  }

  ngAfterViewInit(): void {
    this.updateDimensions();

    // Ensure all toolbars are within window bounds after loading positions
    this.constrainToolbarsToWindow();

    this.drawSvg();

    // Apply initial theme
    setTimeout(() => this.updateTheme(), 100);

    // Subscribe to NGXS state changes
    this.currentLessons$.subscribe((lessons) => {
      this.currentLessons = lessons;
      console.log('Current lessons updated:', lessons);
    });

    this.selectedLesson$.subscribe((lesson) => {
      this.selectedLesson = lesson;
      console.log('Selected lesson updated:', lesson);
    });

    this.hasLessons$.subscribe((hasLessons) => {
      console.log('Has lessons:', hasLessons);
    });

    // Initialize rotation wheel after a delay to ensure DOM is ready
    setTimeout(() => this.initializeRotationWheel(), 200);
  }

  ngOnDestroy(): void {
    // Save toolbar positions to localStorage
    this.saveToolbarPositions();
  }

  // Toolbar positioning methods
  private loadToolbarPositions(): void {
    const savedPositions = localStorage.getItem('d3-toolbar-positions');
    if (savedPositions) {
      try {
        this.toolbarPositions = {
          ...this.toolbarPositions,
          ...JSON.parse(savedPositions),
        };
      } catch (error) {
        console.warn('Failed to load toolbar positions:', error);
      }
    }

    const savedLocks = localStorage.getItem('d3-toolbar-locks');
    if (savedLocks) {
      try {
        this.toolbarLocks = { ...this.toolbarLocks, ...JSON.parse(savedLocks) };
      } catch (error) {
        console.warn('Failed to load toolbar locks:', error);
      }
    }
  }

  private saveToolbarPositions(): void {
    localStorage.setItem(
      'd3-toolbar-positions',
      JSON.stringify(this.toolbarPositions)
    );
    localStorage.setItem('d3-toolbar-locks', JSON.stringify(this.toolbarLocks));
  }

  public toggleToolbarLock(toolbarType: keyof typeof this.toolbarLocks): void {
    this.toolbarLocks[toolbarType] = !this.toolbarLocks[toolbarType];
    this.saveToolbarPositions();
  }

  public onToolbarDragStart(
    event: MouseEvent,
    toolbarType: keyof typeof this.toolbarPositions
  ): void {
    // Check if toolbar is locked
    if (this.toolbarLocks[toolbarType]) {
      return;
    }

    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...this.toolbarPositions[toolbarType] };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      this.toolbarPositions[toolbarType] = {
        x: Math.max(0, Math.min(window.innerWidth - 320, startPos.x + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - 100, startPos.y + deltaY)),
      };
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.saveToolbarPositions();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateDimensions();

    // Only constrain toolbars if snap on resize is enabled
    if (this.snapToolbarsOnResize) {
      this.constrainToolbarsToWindow();
    }

    this.redrawSvg();
  }

  private updateDimensions() {
    this.previousWidth = this.width;
    this.previousHeight = this.height;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  private constrainToolbarsToWindow() {
    const margin = 20; // Margin from window edges
    const snapThreshold = 50; // Distance from edge to consider "snapping"

    // Define approximate toolbar dimensions (width x height)
    const toolbarSizes: Record<string, { width: number; height: number }> = {
      selectionTools: { width: 320, height: 300 },
      drawingModifiers: { width: 320, height: 400 },
      lessons: { width: 320, height: 250 },
      selectedNodes: { width: 320, height: 300 },
      zoomControls: { width: 320, height: 200 },
      rotationControl: { width: 380, height: 280 },
      statusPanel: { width: 320, height: 60 },
    };

    console.log('Window resize - constraining toolbars.');
    console.log('Previous size:', this.previousWidth, 'x', this.previousHeight);
    console.log('Current size:', this.width, 'x', this.height);

    // Calculate previous window bounds for edge detection
    const prevMaxXBounds: Record<string, number> = {};
    const prevMaxYBounds: Record<string, number> = {};

    Object.keys(toolbarSizes).forEach((key) => {
      const size = toolbarSizes[key];
      prevMaxXBounds[key] = this.previousWidth - size.width - margin;
      prevMaxYBounds[key] = this.previousHeight - size.height - margin;
    });

    // Constrain each toolbar within window bounds and snap to edges
    Object.keys(this.toolbarPositions).forEach((toolbarKey) => {
      const toolbar = toolbarKey as keyof typeof this.toolbarPositions;
      const position = this.toolbarPositions[toolbar];
      const size = toolbarSizes[toolbar];

      if (!size) return; // Skip if size not defined

      // Calculate current window bounds
      const maxX = this.width - size.width - margin;
      const minX = margin;
      const maxY = this.height - size.height - margin;
      const minY = margin;

      // Calculate previous bounds for this toolbar
      const prevMaxX = prevMaxXBounds[toolbar];
      const prevMaxY = prevMaxYBounds[toolbar];

      console.log(`Toolbar ${toolbar}:`);
      console.log(`  Current position: (${position.x}, ${position.y})`);
      console.log(
        `  Previous right edge was: ${prevMaxX}, current right edge: ${maxX}`
      );
      console.log(
        `  Previous bottom edge was: ${prevMaxY}, current bottom edge: ${maxY}`
      );

      // X-axis snapping logic
      // Check if toolbar was at or very close to previous right edge
      if (Math.abs(position.x - prevMaxX) <= 5) {
        console.log(
          `  ${toolbar} was at previous right edge, snapping to new right edge`
        );
        position.x = maxX;
      }
      // Check if toolbar is beyond current bounds (window shrunk)
      else if (position.x > maxX) {
        console.log(
          `  ${toolbar} beyond current right boundary, constraining to maxX=${maxX}`
        );
        position.x = maxX;
      }
      // Check if toolbar is close to left edge
      else if (position.x <= minX + snapThreshold) {
        console.log(
          `  ${toolbar} close to left edge, snapping to minX=${minX}`
        );
        position.x = minX;
      }
      // Check if toolbar is close to current right edge
      else if (position.x >= maxX - snapThreshold) {
        console.log(
          `  ${toolbar} close to right edge, snapping to maxX=${maxX}`
        );
        position.x = maxX;
      } else {
        // Ensure within bounds but don't move unnecessarily
        position.x = Math.max(minX, Math.min(maxX, position.x));
      }

      // Y-axis snapping logic
      // Check if toolbar was at or very close to previous bottom edge
      if (Math.abs(position.y - prevMaxY) <= 5) {
        console.log(
          `  ${toolbar} was at previous bottom edge, snapping to new bottom edge`
        );
        position.y = maxY;
      }
      // Check if toolbar is beyond current bounds (window shrunk)
      else if (position.y > maxY) {
        console.log(
          `  ${toolbar} beyond current bottom boundary, constraining to maxY=${maxY}`
        );
        position.y = maxY;
      }
      // Check if toolbar is close to top edge
      else if (position.y <= minY + snapThreshold) {
        console.log(`  ${toolbar} close to top edge, snapping to minY=${minY}`);
        position.y = minY;
      }
      // Check if toolbar is close to current bottom edge
      else if (position.y >= maxY - snapThreshold) {
        console.log(
          `  ${toolbar} close to bottom edge, snapping to maxY=${maxY}`
        );
        position.y = maxY;
      } else {
        // Ensure within bounds but don't move unnecessarily
        position.y = Math.max(minY, Math.min(maxY, position.y));
      }

      console.log(`  Final position: (${position.x}, ${position.y})`);
    });

    // Save the adjusted positions
    this.saveToolbarPositions();
  }

  private redrawSvg() {
    console.log(`Redrawing SVG, preserving ${this.strokes.length} strokes`);

    // Safety check: ensure view is initialized
    if (!this.svgRef?.nativeElement) {
      console.log('SVG not ready yet, skipping redraw');
      return;
    }

    // Clear existing SVG content
    d3.select(this.svgRef.nativeElement).selectAll('*').remove();

    // Reset degreeGroup reference since we cleared everything
    this.degreeGroup = null;

    // Redraw everything (this will call redrawStrokes internally)
    this.drawSvg();
  }

  drawSvg() {
    // Add double-click event to the topmost 'g' element to reset pan and zoom
    this.svg = d3
      .select(this.svgRef.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', this.isDarkMode ? '#2a2a2a' : '#f8f8f8');

    // Create drawing layer that stays in screen coordinates (not transformed)
    this.drawingLayer = this.svg.append('g').attr('class', 'drawing-layer');
    console.log('Drawing layer created:', !!this.drawingLayer);

    // Create a group for pan/zoom (content will be transformed)
    this.g = this.svg.append('g');
    console.log('Transform group created:', !!this.g);

    // Add an aqua background circle to the 'g' group (content area, inside degree circle)
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    // Adjust content radius based on available space (account for UI elements)
    const availableWidth = this.width;
    const availableHeight = this.height - 120; // Account for control panels (top/bottom)
    const backgroundRadius = Math.min(availableWidth, availableHeight) * 0.35;

    this.g
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', backgroundRadius)
      .attr('fill', this.isDarkMode ? '#1e3a5f' : 'aqua')
      .attr('opacity', 0.25)
      .attr('pointer-events', 'all')
      .on('dblclick', (event: MouseEvent) => {
        if (this.drawingMode === 'pan') {
          console.log('g dblclick', event);
          const t = d3.transition().duration(2000);
          const center = [this.width / 2, this.height / 2];
          const scale = 1;
          const tx = center[0] - center[0] * scale;
          const ty = center[1] - center[1] * scale;
          this.g
            .transition(t)
            .duration(2000)
            .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
          this.selectedNode = null;
          (this as any).cdRef?.detectChanges?.();
          event.stopPropagation();
        }
      });

    // Generate initial node data
    const circles = this.generateNodeData(this.nodeCount);

    // Draw circles and labels
    this.drawCircles(circles);
    this.drawLabels(circles);

    // D3 zoom behavior (scroll wheel zoom + drag panning)
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .filter((event) => {
        // Allow zoom/pan only in pan mode, or wheel events always
        if (this.drawingMode === 'pan') {
          return event.type === 'wheel' || event.type === 'mousedown';
        } else {
          return event.type === 'wheel'; // Only allow scroll wheel zoom when drawing
        }
      })
      .on('zoom', (event) => {
        // Handle scroll wheel zoom vs drag panning correctly
        if (event.sourceEvent && event.sourceEvent.type === 'wheel') {
          // For scroll wheel: ONLY update zoom, preserve existing pan values
          this.zoomLevel = event.transform.k;
          // panX and panY stay unchanged - don't let scroll wheel affect pan

          // Update D3's internal transform to match our component state
          // This prevents the transform from getting out of sync
          const correctedTransform = d3.zoomIdentity
            .translate(this.panX, this.panY)
            .scale(this.zoomLevel);
          // Update D3's internal state without triggering another zoom event
          this.svg.property('__zoom', correctedTransform);
        } else {
          // For drag operations: update pan coordinates only, preserve current zoom level
          if (this.drawingMode === 'pan') {
            this.panX = event.transform.x;
            this.panY = event.transform.y;
          }
          // Keep the existing zoom level - don't let drag reset zoom
        }

        // Apply transform using consistent logic
        this.applyTransform();

        // Trigger change detection to update the UI sliders
        (this as any).cdRef?.detectChanges?.();
      });

    this.svg.call(this.zoom as any);

    // Add mouse event handlers to the entire SVG for drawing
    this.svg
      .on('mousedown.drawing', (event: MouseEvent) => {
        if (this.drawingMode !== 'pan') {
          console.log('SVG mousedown for drawing mode:', this.drawingMode);
          this.startDrawing(event);
        }
      })
      .on('mousemove.drawing', (event: MouseEvent) => {
        if (this.isDrawing && this.drawingMode !== 'pan') {
          this.continueDrawing(event);
        }
      })
      .on('mouseup.drawing', (event: MouseEvent) => {
        if (this.isDrawing && this.drawingMode !== 'pan') {
          this.endDrawing();
        }
      });

    // Redraw existing strokes
    this.redrawStrokes();
    console.log('SVG setup complete, drawing layer ready');

    // Remove double-click event on SVG. Only 'g' group will handle double-click reset.
  }

  // Drawing methods
  private startDrawing(event: MouseEvent) {
    console.log('startDrawing called, mode:', this.drawingMode);

    if (this.drawingMode === 'pan') return;

    this.isDrawing = true;
    const point = this.getDrawingPoint(event);
    console.log('Drawing point:', point);

    if (this.drawingMode === 'pencil') {
      // Start new stroke
      this.currentStroke = {
        id: `stroke-${this.strokeIdCounter++}`,
        points: [point],
        color: this.selectedColor,
        size: this.brushSize,
        width: this.brushSize,
        mode: 'pencil',
      };
      console.log('Started new stroke:', this.currentStroke.id);
    } else if (this.drawingMode === 'eraser') {
      // Erase strokes at this point
      console.log('Starting erase at point:', point);
      this.eraseAtPoint(point);
    } else if (this.drawingMode === 'lasso') {
      // Start lasso selection
      this.startLassoSelection(point);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private continueDrawing(event: MouseEvent) {
    if (!this.isDrawing || this.drawingMode === 'pan') return;

    const point = this.getDrawingPoint(event);

    if (this.drawingMode === 'pencil' && this.currentStroke) {
      // Add point to current stroke
      this.currentStroke.points.push(point);
      this.updateCurrentStrokePath();
    } else if (this.drawingMode === 'eraser') {
      // Continue erasing
      this.eraseAtPoint(point);
    } else if (this.drawingMode === 'lasso') {
      // Continue lasso selection
      this.continueLassoSelection(point);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private endDrawing() {
    if (!this.isDrawing) return;

    this.isDrawing = false;

    if (this.drawingMode === 'pencil' && this.currentStroke) {
      // Finalize the stroke
      this.strokes.push(this.currentStroke);
      this.currentStroke = null;
      this.redrawStrokes();
    } else if (this.drawingMode === 'lasso') {
      // Finalize lasso selection
      this.endLassoSelection();
    }
  }

  private getDrawingPoint(event: MouseEvent): { x: number; y: number } {
    // Get the mouse position relative to the SVG element
    const rect = this.svgRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // For drawing, we want to use the raw coordinates as they appear on screen
    // The drawings will be stored in screen coordinates and will transform with the view
    return { x, y };
  }

  private updateCurrentStrokePath() {
    if (!this.currentStroke) return;

    const pathData = this.createPathData(this.currentStroke.points);

    // Remove existing current stroke path
    this.drawingLayer.selectAll('.current-stroke').remove();

    // Draw current stroke
    this.drawingLayer
      .append('path')
      .attr('class', 'current-stroke')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', this.currentStroke.color)
      .attr('stroke-width', this.currentStroke.width)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
  }

  private createPathData(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';

    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCardinal.tension(0.5));

    return line(points) || '';
  }

  private eraseAtPoint(point: { x: number; y: number }) {
    const eraserRadius = this.eraserSize / 2;
    const initialStrokeCount = this.strokes.length;

    console.log(
      `${this.eraserMode} eraser at point (${point.x.toFixed(
        2
      )}, ${point.y.toFixed(
        2
      )}) with radius ${eraserRadius}, checking ${initialStrokeCount} strokes`
    );

    if (this.eraserMode === 'magic') {
      // Magic eraser: Remove entire strokes that intersect
      const filteredStrokes = this.strokes.filter((stroke) => {
        const intersects = this.strokeIntersectsCircle(
          stroke,
          point,
          eraserRadius
        );
        if (intersects) {
          console.log(
            `Magic erasing entire stroke ${stroke.id} with ${stroke.points.length} points`
          );
        }
        return !intersects;
      });
      this.strokes = filteredStrokes;
    } else {
      // Normal eraser: Partially erase strokes, splitting them if needed
      const newStrokes: DrawingStroke[] = [];

      this.strokes.forEach((stroke) => {
        const resultStrokes = this.partiallyEraseStroke(
          stroke,
          point,
          eraserRadius
        );
        newStrokes.push(...resultStrokes);
      });

      this.strokes = newStrokes;
    }

    const finalStrokeCount = this.strokes.length;
    if (finalStrokeCount !== initialStrokeCount) {
      console.log(
        `Erased operation changed stroke count from ${initialStrokeCount} to ${finalStrokeCount}`
      );
    } else {
      console.log(`No strokes modified`);
    }

    this.redrawStrokes();
  }

  private strokeIntersectsCircle(
    stroke: DrawingStroke,
    center: { x: number; y: number },
    radius: number
  ): boolean {
    // Check if any point in the stroke is within the eraser circle
    return stroke.points.some((point) => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  private partiallyEraseStroke(
    stroke: DrawingStroke,
    center: { x: number; y: number },
    radius: number
  ): DrawingStroke[] {
    // Split stroke into segments, keeping only points outside the eraser circle
    const segments: { x: number; y: number }[][] = [];
    let currentSegment: { x: number; y: number }[] = [];

    stroke.points.forEach((point, index) => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isInEraser = distance <= radius;

      if (!isInEraser) {
        // Point is outside eraser, add to current segment
        currentSegment.push(point);
      } else {
        // Point is inside eraser
        if (currentSegment.length > 0) {
          // Save current segment if it has points
          segments.push([...currentSegment]);
          currentSegment = [];
        }
      }
    });

    // Add final segment if it exists
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    // Convert segments back to strokes
    const resultStrokes: DrawingStroke[] = [];
    segments.forEach((segment, segmentIndex) => {
      if (segment.length >= 2) {
        // Only create strokes with at least 2 points
        const newStroke: DrawingStroke = {
          id: `${stroke.id}-segment-${segmentIndex}`,
          points: segment,
          color: stroke.color,
          size: stroke.size,
          width: stroke.width,
          mode: stroke.mode,
        };
        resultStrokes.push(newStroke);
        console.log(
          `Created segment ${newStroke.id} with ${segment.length} points`
        );
      }
    });

    if (resultStrokes.length === 0 && stroke.points.length > 0) {
      console.log(`Stroke ${stroke.id} completely erased`);
    } else if (resultStrokes.length > 1) {
      console.log(
        `Stroke ${stroke.id} split into ${resultStrokes.length} segments`
      );
    } else if (resultStrokes.length === 1) {
      console.log(
        `Stroke ${stroke.id} partially erased, keeping ${resultStrokes[0].points.length} points`
      );
    }

    return resultStrokes;
  }

  private redrawStrokes() {
    console.log(`=== REDRAW STROKES START ===`);
    console.log(`Strokes to draw: ${this.strokes.length}`);

    if (!this.svgRef?.nativeElement || !this.drawingLayer) {
      console.error('SVG or drawing layer not initialized!');
      return;
    }

    // Clear ALL drawing-related paths (both stroke-path and current-stroke)
    const existingStrokePaths = this.drawingLayer.selectAll('.stroke-path');
    const existingCurrentStrokes =
      this.drawingLayer.selectAll('.current-stroke');
    console.log(`Removing ${existingStrokePaths.size()} existing stroke paths`);
    console.log(
      `Removing ${existingCurrentStrokes.size()} existing current strokes`
    );

    existingStrokePaths.remove();
    existingCurrentStrokes.remove();

    // Also clear any other paths that might be in the drawing layer
    const allPaths = this.drawingLayer.selectAll('path');
    console.log(
      `Total paths in drawing layer before cleanup: ${allPaths.size()}`
    );
    allPaths.remove();

    // Draw all strokes
    let drawnCount = 0;
    this.strokes.forEach((stroke, index) => {
      console.log(
        `Processing stroke ${index}: ${stroke.id} with ${stroke.points.length} points`
      );
      const pathData = this.createPathData(stroke.points);
      if (pathData) {
        const newPath = this.drawingLayer
          .append('path')
          .attr('class', 'stroke-path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', stroke.color)
          .attr('stroke-width', stroke.width)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
        console.log(`Created path for stroke ${stroke.id}`);
        drawnCount++;
      } else {
        console.warn(`No path data generated for stroke ${stroke.id}`);
      }
    });

    // Final verification
    const finalPaths = this.drawingLayer.selectAll('path');
    console.log(`Final path count in drawing layer: ${finalPaths.size()}`);
    console.log(`Successfully drew ${drawnCount} stroke paths`);
    console.log(`=== REDRAW STROKES COMPLETE ===`);
  }

  // Lasso selection methods
  private startLassoSelection(point: { x: number; y: number }) {
    console.log('Starting lasso selection at:', point);
    this.isLassoActive = true;
    this.lassoPath = [point];
    this.drawLassoPath();
  }

  private continueLassoSelection(point: { x: number; y: number }) {
    if (!this.isLassoActive) return;

    this.lassoPath.push(point);
    this.drawLassoPath();
  }

  private endLassoSelection() {
    if (!this.isLassoActive) return;

    console.log('Ending lasso selection with', this.lassoPath.length, 'points');
    this.isLassoActive = false;

    // Close the lasso path
    if (this.lassoPath.length > 2) {
      this.lassoPath.push(this.lassoPath[0]);
    }

    // Select nodes inside the lasso
    this.selectNodesInLasso();

    // Clear the lasso path visual
    this.clearLassoPath();
    this.lassoPath = [];
  }

  private drawLassoPath() {
    if (!this.drawingLayer || this.lassoPath.length < 2) return;

    // Remove existing lasso path
    this.drawingLayer.selectAll('.lasso-path').remove();

    // Create path data
    const pathData = this.createPathData(this.lassoPath);
    if (!pathData) return;

    // Choose color based on lasso mode
    const strokeColor = this.lassoMode === 'select' ? '#ff6600' : '#ff0066';
    const strokeDash = this.lassoMode === 'select' ? '5,5' : '10,3';

    // Draw lasso path
    this.drawingLayer
      .append('path')
      .attr('class', 'lasso-path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', strokeDash)
      .attr('opacity', 0.8);
  }

  private clearLassoPath() {
    if (this.drawingLayer) {
      this.drawingLayer.selectAll('.lasso-path').remove();
    }
  }

  private selectNodesInLasso() {
    if (this.lassoPath.length < 3) {
      console.log('Lasso path too short:', this.lassoPath.length);
      return;
    }

    console.log('Starting lasso selection with path:', this.lassoPath);
    const nodesToSelect: string[] = [];

    // Get all circle nodes
    const nodes = this.svg.selectAll('circle');
    console.log('Found circles:', nodes.size());

    nodes.each((d: any, i: number, nodeArray: any) => {
      const node = nodeArray[i];
      const nodeId = node.id;

      // Get node position
      const cx = parseFloat(node.getAttribute('cx'));
      const cy = parseFloat(node.getAttribute('cy'));

      console.log(`Checking node ${nodeId} at position (${cx}, ${cy})`);

      // Check if node is inside lasso path
      if (this.isPointInPolygon({ x: cx, y: cy }, this.lassoPath)) {
        console.log(`Node ${nodeId} is inside lasso!`);
        nodesToSelect.push(nodeId);
      } else {
        console.log(`Node ${nodeId} is outside lasso`);
      }
    });

    console.log(`Found ${nodesToSelect.length} nodes in lasso:`, nodesToSelect);
    console.log('Current selectedNodes before lasso:', this.selectedNodes);
    console.log(`Lasso mode: ${this.lassoMode}`);

    // Process nodes based on lasso mode
    nodesToSelect.forEach((nodeId, index) => {
      console.log(
        `\n=== Processing node ${index + 1}/${
          nodesToSelect.length
        }: ${nodeId} (${this.lassoMode} mode) ===`
      );
      console.log('Current selectedNodes array:', this.selectedNodes);

      const isAlreadySelected = this.selectedNodes.includes(nodeId);
      console.log(`Node ${nodeId} already selected?`, isAlreadySelected);

      if (this.lassoMode === 'select') {
        // Select mode: only add nodes that aren't already selected
        if (!isAlreadySelected) {
          console.log(`Adding node ${nodeId} via toggleNodeSelection...`);
          this.toggleNodeSelection(nodeId);
          console.log(
            `After toggleNodeSelection, selectedNodes:`,
            this.selectedNodes
          );
        } else {
          console.log(`Node ${nodeId} already selected, skipping duplicate`);
        }
      } else if (this.lassoMode === 'deselect') {
        // Deselect mode: only remove nodes that are currently selected
        if (isAlreadySelected) {
          console.log(`Removing node ${nodeId} via toggleNodeSelection...`);
          this.toggleNodeSelection(nodeId);
          console.log(
            `After toggleNodeSelection, selectedNodes:`,
            this.selectedNodes
          );
        } else {
          console.log(`Node ${nodeId} not selected, nothing to remove`);
        }
      }
    });

    console.log('=== LASSO SELECTION COMPLETE ===');
    console.log('Selected nodes array:', this.selectedNodes);
    console.log('Selected nodes count:', this.selectedNodes.length);
    console.log('Selected nodes string:', this.selectedNodes.join(', '));
    console.log('====================================');
  }

  private isPointInPolygon(
    point: { x: number; y: number },
    polygon: { x: number; y: number }[]
  ): boolean {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].y > point.y !== polygon[j].y > point.y &&
        point.x <
          ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
            (polygon[j].y - polygon[i].y) +
            polygon[i].x
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  // Drawing mode and tool methods
  setDrawingMode(mode: 'pencil' | 'eraser' | 'pan' | 'select' | 'lasso') {
    console.log(`Setting drawing mode from ${this.drawingMode} to ${mode}`);
    this.drawingMode = mode;
    this.isDrawing = false;
    this.currentStroke = null;

    // Update cursor style based on mode
    const svgElement = this.svgRef.nativeElement;
    if (mode === 'pencil') {
      svgElement.style.cursor = 'crosshair';
    } else if (mode === 'eraser') {
      // Different cursor for different eraser modes
      svgElement.style.cursor =
        this.eraserMode === 'magic' ? 'cell' : 'pointer';
    } else if (mode === 'select') {
      svgElement.style.cursor = 'pointer';
    } else if (mode === 'lasso') {
      svgElement.style.cursor = 'crosshair';
    } else {
      svgElement.style.cursor = 'grab';
    }

    console.log(`Drawing mode set to ${this.drawingMode}, cursor updated`);
  }

  setLassoMode(mode: 'select' | 'deselect') {
    console.log(`Setting lasso mode from ${this.lassoMode} to ${mode}`);
    this.lassoMode = mode;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  clearDrawing() {
    console.log('=== CLEAR DRAWING CALLED ===');
    console.log(`Current strokes count: ${this.strokes.length}`);
    console.log(`Current stroke:`, this.currentStroke);
    console.log(`Is drawing:`, this.isDrawing);
    console.log(`Drawing layer exists:`, !!this.drawingLayer);

    if (this.drawingLayer) {
      const existingPaths = this.drawingLayer.selectAll('.stroke-path');
      console.log(`Existing paths in DOM: ${existingPaths.size()}`);
      const existingCurrentStrokes =
        this.drawingLayer.selectAll('.current-stroke');
      console.log(
        `Existing current strokes in DOM: ${existingCurrentStrokes.size()}`
      );
    }

    // Clear the data
    this.strokes = [];
    this.currentStroke = null;
    this.isDrawing = false;

    console.log('Data cleared, calling redrawStrokes...');
    this.redrawStrokes();

    // Double-check that DOM is cleared
    if (this.drawingLayer) {
      const remainingPaths = this.drawingLayer.selectAll('.stroke-path');
      const remainingCurrentStrokes =
        this.drawingLayer.selectAll('.current-stroke');
      console.log(`Remaining paths after clear: ${remainingPaths.size()}`);
      console.log(
        `Remaining current strokes after clear: ${remainingCurrentStrokes.size()}`
      );
    }

    console.log('=== CLEAR DRAWING COMPLETE ===');
  }

  // Node selection methods
  toggleNodeSelection(nodeId: string) {
    console.log(`\n--- toggleNodeSelection called for: ${nodeId} ---`);
    console.log('selectedNodes before toggle:', this.selectedNodes);

    const index = this.selectedNodes.indexOf(nodeId);
    console.log('Node index in selectedNodes:', index);

    if (index > -1) {
      // Remove from selection
      this.selectedNodes.splice(index, 1);
      console.log(`Deselected node: ${nodeId}`);

      // Remove from current lesson if exists
      if (this.selectedLesson) {
        const lessonNodeIndex = this.selectedLesson.LessonNodes.findIndex(
          (ln) => ln.NodeID === nodeId
        );
        if (lessonNodeIndex > -1) {
          const updatedLesson = {
            ...this.selectedLesson,
            LessonNodes: this.selectedLesson.LessonNodes.filter(
              (ln) => ln.NodeID !== nodeId
            ),
          };
          this.store.dispatch(new UpdateLesson(updatedLesson));
        }
      }
    } else {
      // Add to selection
      console.log(`Adding node ${nodeId} to selectedNodes...`);
      this.selectedNodes.push(nodeId);
      console.log(`Selected node: ${nodeId}`);

      // Add to current lesson if exists
      if (this.selectedLesson) {
        const existsInLesson = this.selectedLesson.LessonNodes.some(
          (ln) => ln.NodeID === nodeId
        );
        if (!existsInLesson) {
          const updatedLesson = {
            ...this.selectedLesson,
            LessonNodes: [
              ...this.selectedLesson.LessonNodes,
              {
                NodeName: nodeId,
                NodeID: nodeId,
              },
            ],
          };
          this.store.dispatch(new UpdateLesson(updatedLesson));
        }
      }
    }
    console.log(
      `selectedNodes after toggle: [${this.selectedNodes.join(', ')}]`
    );
    console.log('--- toggleNodeSelection complete ---\n');
    this.updateNodeSelectionVisuals();
  }

  clearNodeSelection() {
    console.log('Clearing all selected nodes');
    this.selectedNodes = [];
    this.updateNodeSelectionVisuals();
  }

  removeNodeFromSelection(nodeId: string) {
    const index = this.selectedNodes.indexOf(nodeId);
    if (index > -1) {
      this.selectedNodes.splice(index, 1);
      console.log(`Removed node ${nodeId} from selection`);
      this.updateNodeSelectionVisuals();
    }
  }

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodes.includes(nodeId);
  }

  updateNodeSelectionVisuals() {
    if (!this.svg) return;

    // Update all node circles
    this.svg
      .selectAll('.node-circle')
      .style('stroke', (d: any) =>
        this.isNodeSelected(d.id) ? '#ff6b6b' : '#333333'
      )
      .style('stroke-width', (d: any) =>
        this.isNodeSelected(d.id) ? '3px' : '2px'
      )
      .style('fill-opacity', (d: any) =>
        this.isNodeSelected(d.id) ? 0.8 : 0.3
      );

    // Update all node labels
    this.svg
      .selectAll('.node-label')
      .style('font-weight', (d: any) =>
        this.isNodeSelected(d.id) ? 'bold' : 'normal'
      )
      .style('fill', (d: any) =>
        this.isNodeSelected(d.id) ? '#ff6b6b' : '#333333'
      );
  }

  // Lesson management methods
  createLesson() {
    const lessonName = prompt('Enter lesson name:');
    if (!lessonName || lessonName.trim() === '') {
      return;
    }

    // Create lesson nodes from current selection
    const lessonNodes: ILessonElement[] = this.selectedNodes.map((nodeId) => ({
      NodeName: nodeId, // Using nodeId as name for now
      NodeID: nodeId,
    }));

    const newLesson: ILesson = {
      LessonName: lessonName.trim(),
      LessonNodes: lessonNodes,
    };

    // Dispatch action to add lesson to NGXS state
    this.store.dispatch(new AddLesson(newLesson));

    // Automatically select the newly created lesson
    this.store.dispatch(new SelectLesson(newLesson));

    console.log(
      `Created lesson: ${newLesson.LessonName} with ${lessonNodes.length} nodes`
    );
  }

  selectLesson(lesson: ILesson) {
    // Clear current selection
    this.clearNodeSelection();

    // Dispatch action to set selected lesson in NGXS state
    this.store.dispatch(new SelectLesson(lesson));

    // Select nodes from lesson
    lesson.LessonNodes.forEach((lessonNode) => {
      if (!this.selectedNodes.includes(lessonNode.NodeID)) {
        this.selectedNodes.push(lessonNode.NodeID);
      }
    });

    this.updateNodeSelectionVisuals();
    console.log(
      `Selected lesson: ${lesson.LessonName} with ${lesson.LessonNodes.length} nodes`
    );
  }

  onLessonChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lessonName = target.value;

    if (lessonName === '') {
      // Clear selected nodes when no lesson is selected
      this.clearNodeSelection();
      this.store.dispatch(new SelectLesson(null));
      return;
    }

    const lesson = this.currentLessons.find((l) => l.LessonName === lessonName);
    if (lesson) {
      this.selectLesson(lesson);
    }
  }

  publishLesson() {
    alert('Publish API call would go here!');
  }

  // Check if current selection matches the selected lesson's nodes
  get selectionMatchesLesson(): boolean {
    if (!this.selectedLesson || !this.selectedLesson.LessonNodes) {
      return true; // No lesson selected, so no mismatch
    }

    const lessonNodeIds = this.selectedLesson.LessonNodes.map(
      (node) => node.NodeID
    ).sort();
    const currentSelection = this.selectedNodes.slice().sort();

    const matches =
      lessonNodeIds.length === currentSelection.length &&
      lessonNodeIds.every(
        (nodeId, index) => nodeId === currentSelection[index]
      );

    return matches;
  }

  // Apply current selection to the selected lesson
  applySelectionToLesson() {
    if (!this.selectedLesson) {
      return;
    }

    // Create updated lesson nodes from current selection
    const updatedLessonNodes: ILessonElement[] = this.selectedNodes.map(
      (nodeId) => ({
        NodeName: nodeId,
        NodeID: nodeId,
      })
    );

    const updatedLesson: ILesson = {
      ...this.selectedLesson,
      LessonNodes: updatedLessonNodes,
    };

    // Update the lesson in NGXS state
    this.store.dispatch(new UpdateLesson(updatedLesson));

    console.log(
      `Applied selection to lesson: ${updatedLesson.LessonName} with ${updatedLessonNodes.length} nodes`
    );
  }

  // Edit the currently selected lesson name
  editLesson() {
    if (!this.selectedLesson) {
      return;
    }

    const currentName = this.selectedLesson.LessonName;
    const newName = prompt('Enter new lesson name:', currentName);

    if (!newName || newName.trim() === '' || newName.trim() === currentName) {
      return; // User cancelled or entered the same name
    }

    // Check if a lesson with this name already exists
    const existingLesson = this.currentLessons.find(
      (lesson) => lesson.LessonName === newName.trim()
    );

    if (existingLesson) {
      alert(
        `A lesson named "${newName.trim()}" already exists. Please choose a different name.`
      );
      return;
    }

    // Create updated lesson with new name
    const updatedLesson: ILesson = {
      ...this.selectedLesson,
      LessonName: newName.trim(),
    };

    // Remove the old lesson and add the updated one
    this.store.dispatch(new RemoveLesson(currentName));
    this.store.dispatch(new AddLesson(updatedLesson));
    this.store.dispatch(new SelectLesson(updatedLesson));

    console.log(`Renamed lesson from "${currentName}" to "${newName.trim()}"`);
  }

  // Delete the currently selected lesson
  deleteLesson() {
    if (!this.selectedLesson) {
      return;
    }

    const lessonName = this.selectedLesson.LessonName;
    const confirmDelete = confirm(
      `Are you sure you want to delete the lesson "${lessonName}"?`
    );

    if (confirmDelete) {
      // Dispatch action to remove lesson from NGXS state
      this.store.dispatch(new RemoveLesson(lessonName));

      console.log(`Deleted lesson: ${lessonName}`);
    }
  }

  updateBrushSize(event: Event) {
    const target = event.target as HTMLInputElement;
    const brushSize = parseFloat(target.value);
    this.brushSize = brushSize;
  }

  updateEraserSize(event: Event) {
    const target = event.target as HTMLInputElement;
    const eraserSize = parseFloat(target.value);
    this.eraserSize = eraserSize;
  }

  setEraserMode(mode: 'normal' | 'magic') {
    console.log(`Setting eraser mode from ${this.eraserMode} to ${mode}`);
    this.eraserMode = mode;

    // Update cursor if we're in eraser mode
    if (this.drawingMode === 'eraser') {
      const svgElement = this.svgRef.nativeElement;
      svgElement.style.cursor =
        this.eraserMode === 'magic' ? 'cell' : 'pointer';
    }
  }

  // Theme methods
  toggleTheme() {
    console.log('toggleTheme called, current isDarkMode:', this.isDarkMode);
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
    console.log('Theme toggled, new isDarkMode:', this.isDarkMode);
    //alert(`Theme toggled! Dark mode is now: ${this.isDarkMode}`);
  }

  toggleSnapToolbarsOnResize() {
    this.snapToolbarsOnResize = !this.snapToolbarsOnResize;
    console.log('Snap toolbars on resize toggled:', this.snapToolbarsOnResize);
  }

  private updateTheme() {
    console.log('updateTheme called with isDarkMode:', this.isDarkMode);

    // Update SVG background
    if (this.svg) {
      console.log(
        'Updating SVG background to:',
        this.isDarkMode ? '#2a2a2a' : '#f8f8f8'
      );
      this.svg.style('background', this.isDarkMode ? '#2a2a2a' : '#f8f8f8');
    } else {
      console.log('SVG not found!');
    }

    // Update background circle color if it exists
    if (this.g) {
      this.g
        .select('circle')
        .attr('fill', this.isDarkMode ? '#1e3a5f' : 'aqua');
    }

    // Update rotation control colors
    if (this.degreeGroup) {
      // Update background circle
      this.degreeGroup
        .select('circle:first-child')
        .attr(
          'fill',
          this.isDarkMode ? 'rgba(60, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)'
        )
        .attr('stroke', this.isDarkMode ? '#555' : '#ccc');

      // Update main control circle
      this.degreeGroup
        .select('circle:nth-child(2)')
        .attr('stroke', this.isDarkMode ? '#aaa' : '#666');

      // Update major ticks
      this.degreeGroup.selectAll('line').attr('stroke', (d: any, i: number) => {
        // First 8 lines are major ticks
        if (i < 8) {
          return this.isDarkMode ? '#ccc' : '#333';
        } else {
          return this.isDarkMode ? '#999' : '#666';
        }
      });

      // Update center dot
      this.degreeGroup
        .select('circle:last-child')
        .attr('fill', this.isDarkMode ? '#aaa' : '#666');
    }
  }

  // Original pan/zoom methods (unchanged)
  updatePan(event: Event, axis: 'x' | 'y') {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (axis === 'x') {
      this.panX = value;
    } else {
      this.panY = value;
    }

    // Apply the new transform with rotation using consistent logic
    this.applyTransform();

    // Update D3 zoom transform state to sync sliders with drag panning
    const transform = d3.zoomIdentity
      .translate(this.panX, this.panY)
      .scale(this.zoomLevel);
    this.svg.call(this.zoom.transform, transform);
  }

  // Helper methods for dynamic slider ranges
  get panXMin() {
    return -this.width / 2;
  }
  get panXMax() {
    return this.width / 2;
  }
  get panYMin() {
    return -this.height / 2;
  }
  get panYMax() {
    return this.height / 2;
  }

  updateZoom(event: Event) {
    const target = event.target as HTMLInputElement;
    const zoomLevel = parseFloat(target.value);

    // Update local variable
    this.zoomLevel = zoomLevel;

    // Apply the new transform with rotation using consistent logic
    this.applyTransform();

    // Update D3 zoom transform state to sync scroll wheel with slider
    const transform = d3.zoomIdentity.scale(zoomLevel);
    this.svg.call(this.zoom.transform, transform);
  }

  private applyTransform() {
    // Apply combined transform with rotation - same logic used by zoom handler and sliders
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const combinedTransform = `translate(${centerX + this.panX},${
      centerY + this.panY
    }) rotate(${this.rotationAngle}) scale(${
      this.zoomLevel
    }) translate(${-centerX},${-centerY})`;
    this.g.attr('transform', combinedTransform);
  }

  updateNodeCount(event: Event) {
    const target = event.target as HTMLInputElement;
    const nodeCount = parseInt(target.value);
    this.nodeCount = nodeCount;

    // Regenerate the visualization with new node count
    this.redrawNodes();
  }

  private redrawNodes() {
    // Generate new node data based on nodeCount
    const circles = this.generateNodeData(this.nodeCount);

    // Update circles and labels using enter-update-exit pattern
    this.updateCircles(circles);
    this.updateLabels(circles);
  }

  private generateNodeData(
    count: number
  ): { x: number; y: number; r: number; id: string }[] {
    const circles: { x: number; y: number; r: number; id: string }[] = [];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    // Calculate the content bounds (should be well inside the degree circle)
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    // Adjust content radius based on available space (account for UI elements)
    const availableWidth = this.width;
    const availableHeight = this.height - 120; // Account for control panels (top/bottom)
    const contentRadius = Math.min(availableWidth, availableHeight) * 0.35;

    // Create a grid that fits comfortably inside the content area
    const gridRadius = contentRadius * 0.75; // 75% of content radius for comfortable padding
    const gridWidth = gridRadius * 2;
    const gridHeight = gridRadius * 2;

    const spacingX = gridWidth / (cols + 1);
    const spacingY = gridHeight / (rows + 1);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Center the grid within the circle
      const gridStartX = centerX - gridWidth / 2;
      const gridStartY = centerY - gridHeight / 2;

      circles.push({
        x: gridStartX + (col + 1) * spacingX,
        y: gridStartY + (row + 1) * spacingY,
        r: Math.min(spacingX, spacingY) * 0.15,
        id: `${i}`,
      });
    }
    return circles;
  }

  private drawCircles(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    this.g
      .selectAll('circle.node-circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('class', 'node-circle')
      .attr('id', (d: any) => d.id)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r)
      .attr('fill', '#2196f3')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('circle click', d.id, event);
          // Simply select the node without any zoom/pan
          this.selectedNode = d.id;
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('circle select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        }
      });
  }

  private updateCircles(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    // Join new data with existing circles
    const circleSelection = this.g
      .selectAll('circle.node-circle')
      .data(circles, (d: any) => d.id);

    // EXIT: Remove old elements with smooth fade out
    circleSelection
      .exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    // ENTER: Add new elements with smooth fade in
    const enterCircles = circleSelection
      .enter()
      .append('circle')
      .attr('class', 'node-circle')
      .attr('id', (d: any) => d.id)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', 0) // Start with radius 0
      .attr('fill', '#2196f3')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .style('opacity', 0); // Start transparent

    // Add event handlers to new circles
    enterCircles
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('circle click', d.id, event);
          // Simply select the node without any zoom/pan
          this.selectedNode = d.id;
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('circle select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        }
      });

    // UPDATE: Merge enter and existing selections, then animate to new positions
    enterCircles
      .merge(circleSelection)
      .transition()
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r)
      .style('opacity', 1);
  }

  private drawLabels(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    this.g
      .selectAll('text.node-label')
      .data(circles)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => Math.min(12, d.r))
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .text((d: any) => d.id)
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('label click', d.id, event);
          // Simply select the node without any zoom/pan
          this.selectedNode = d.id;
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('label select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        }
      });
  }

  private updateLabels(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    // Join new data with existing text labels
    const labelSelection = this.g
      .selectAll('text.node-label')
      .data(circles, (d: any) => d.id);

    // EXIT: Remove old labels with smooth fade out
    labelSelection
      .exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .attr('font-size', 0)
      .remove();

    // ENTER: Add new labels with smooth fade in
    const enterLabels = labelSelection
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 0) // Start with font-size 0
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .style('opacity', 0) // Start transparent
      .text((d: any) => d.id);

    // Add event handlers to new labels
    enterLabels
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        if (this.drawingMode === 'pan') {
          console.log('label click', d.id, event);
          // Simply select the node without any zoom/pan
          this.selectedNode = d.id;
          event.stopPropagation();
        } else if (this.drawingMode === 'select') {
          console.log('label select click', d.id, event);
          // Toggle node selection
          this.toggleNodeSelection(d.id);
          event.stopPropagation();
        }
      });

    // UPDATE: Merge enter and existing selections, then animate to new positions
    enterLabels
      .merge(labelSelection)
      .transition()
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('font-size', (d: any) => Math.min(12, d.r))
      .style('opacity', 1);
  }

  private drawRotationControl() {
    // Position the rotation control in the upper-right corner below other controls
    const controlSize = 240;
    const controlX = this.width - controlSize - 20;
    const controlY = 120; // Below the existing controls
    const radius = controlSize / 2 - 30;

    // Create a group for the rotation control
    const rotationControl = this.svg
      .append('g')
      .attr('class', 'rotation-control');

    // Background circle for the control
    rotationControl
      .append('circle')
      .attr('cx', controlX + controlSize / 2)
      .attr('cy', controlY + controlSize / 2)
      .attr('r', radius + 5)
      .attr(
        'fill',
        this.isDarkMode ? 'rgba(60, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      )
      .attr('stroke', this.isDarkMode ? '#555' : '#ccc')
      .attr('stroke-width', 1);

    // Main control circle
    rotationControl
      .append('circle')
      .attr('cx', controlX + controlSize / 2)
      .attr('cy', controlY + controlSize / 2)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', this.isDarkMode ? '#aaa' : '#666')
      .attr('stroke-width', 1);

    // Major degree ticks (every 45 degrees)
    const majorDegrees = [0, 45, 90, 135, 180, 225, 270, 315];
    majorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180; // -90 to start from top
      const centerX = controlX + controlSize / 2;
      const centerY = controlY + controlSize / 2;
      const x1 = centerX + Math.cos(radian) * (radius - 6);
      const y1 = centerY + Math.sin(radian) * (radius - 6);
      const x2 = centerX + Math.cos(radian) * radius;
      const y2 = centerY + Math.sin(radian) * radius;

      rotationControl
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.isDarkMode ? '#ccc' : '#333')
        .attr('stroke-width', 1.5);
    });

    // Minor degree ticks (every 15 degrees, excluding majors)
    const minorDegrees = [
      15, 30, 60, 75, 105, 120, 150, 165, 195, 210, 240, 255, 285, 300, 330,
      345,
    ];
    minorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const centerX = controlX + controlSize / 2;
      const centerY = controlY + controlSize / 2;
      const x1 = centerX + Math.cos(radian) * (radius - 3);
      const y1 = centerY + Math.sin(radian) * (radius - 3);
      const x2 = centerX + Math.cos(radian) * radius;
      const y2 = centerY + Math.sin(radian) * radius;

      rotationControl
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', this.isDarkMode ? '#999' : '#666')
        .attr('stroke-width', 0.8);
    });

    // Cardinal direction labels
    const cardinalDirections = [
      { degree: 0, label: 'N' },
      { degree: 90, label: 'E' },
      { degree: 180, label: 'S' },
      { degree: 270, label: 'W' },
    ];

    cardinalDirections.forEach(({ degree, label }) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const centerX = controlX + controlSize / 2;
      const centerY = controlY + controlSize / 2;
      const labelX = centerX + Math.cos(radian) * (radius - 12);
      const labelY = centerY + Math.sin(radian) * (radius - 12);

      rotationControl
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 8)
        .attr('font-weight', 'bold')
        .attr('fill', '#2196f3')
        .text(label);
    });

    // Draggable indicator circle
    const indicatorRadius = 4;
    const currentRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const centerX = controlX + controlSize / 2;
    const centerY = controlY + controlSize / 2;
    const indicatorX = centerX + Math.cos(currentRadian) * (radius - 2);
    const indicatorY = centerY + Math.sin(currentRadian) * (radius - 2);

    const indicator = rotationControl
      .append('circle')
      .attr('class', 'rotation-indicator')
      .attr('cx', indicatorX)
      .attr('cy', indicatorY)
      .attr('r', indicatorRadius)
      .attr('fill', '#ff6b35')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer');

    // Center dot
    rotationControl
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 2)
      .attr('fill', this.isDarkMode ? '#aaa' : '#666');

    // Add drag behavior to the indicator
    const drag = d3.drag().on('drag', (event) => {
      const mouseX = event.x;
      const mouseY = event.y;

      // Calculate angle from center to mouse position
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Adjust angle to match our rotation system (0° at top)
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;

      const newAngle = Math.round(angle);

      // Update rotation angle locally
      this.rotationAngle = newAngle;
      this.currentRotation = (newAngle * Math.PI) / 180;

      // Update indicator position
      const newRadian = ((newAngle - 90) * Math.PI) / 180;
      const newX = centerX + Math.cos(newRadian) * (radius - 2);
      const newY = centerY + Math.sin(newRadian) * (radius - 2);

      indicator.attr('cx', newX).attr('cy', newY);

      // Apply rotation to main content
      this.applyTransform();
    });

    indicator.call(drag);

    // Store reference for updates
    this.degreeGroup = rotationControl;
  }

  updateRotation(event: Event) {
    const target = event.target as HTMLInputElement;
    const rotationAngle = parseInt(target.value);
    this.rotationAngle = rotationAngle;
    this.currentRotation = (rotationAngle * Math.PI) / 180;

    // Update the rotation control indicator position
    this.updateRotationControlIndicator();

    // Apply rotation to main content using consistent transform logic
    this.applyTransform();
  }

  resetRotation() {
    this.rotationAngle = 0;
    this.currentRotation = 0;
    this.updateRotationControlIndicator();

    // Update the wheel indicator position if it exists
    if (
      this.wheelIndicator &&
      this.wheelCenterX &&
      this.wheelCenterY &&
      this.wheelRadius
    ) {
      this.updateWheelIndicator(
        this.wheelIndicator,
        this.wheelCenterX,
        this.wheelCenterY,
        this.wheelRadius
      );
    }

    this.applyTransform();
  }

  private initializeRotationWheel() {
    if (!this.rotationWheelRef?.nativeElement) {
      return;
    }

    const wheelElement = this.rotationWheelRef.nativeElement;
    const wheelSize = 200;
    const wheelRadius = wheelSize / 2 - 10;

    // Define exact center coordinates - use these consistently everywhere
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;

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

    // Update indicator position using exact center coordinates
    this.updateWheelIndicator(indicator, centerX, centerY, wheelRadius);

    // Add drag behavior
    const drag = d3.drag<SVGCircleElement, unknown>().on('drag', (event) => {
      const dx = event.x - centerX;
      const dy = event.y - centerY;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      angle = (angle + 90) % 360;
      if (angle < 0) angle += 360;

      this.rotationAngle = Math.round(angle);
      this.currentRotation = (this.rotationAngle * Math.PI) / 180;
      this.updateWheelIndicator(indicator, centerX, centerY, wheelRadius);
      this.applyTransform();
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

  private updateRotationControlIndicator() {
    if (!this.degreeGroup) return;

    const controlSize = 240;
    const controlX = this.width - controlSize - 20;
    const controlY = 120; // Below the existing controls
    const radius = controlSize / 2 - 30;
    const centerX = controlX + controlSize / 2;
    const centerY = controlY + controlSize / 2;

    // Update indicator position
    const currentRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const indicatorX = centerX + Math.cos(currentRadian) * (radius - 2);
    const indicatorY = centerY + Math.sin(currentRadian) * (radius - 2);

    this.degreeGroup
      .select('.rotation-indicator')
      .attr('cx', indicatorX)
      .attr('cy', indicatorY);
  }
}
