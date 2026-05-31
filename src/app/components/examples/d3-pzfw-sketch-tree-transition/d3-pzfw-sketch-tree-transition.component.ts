import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { GlobalContextState } from '../../../state/user-context.state';
import {
  SetSelectedTenant,
  SetSelectedTeam,
  SetSelectedTeamGroup,
} from '../../../state/user-context.actions';
import {
  DrawingStroke,
  TreeNode,
  D3TreeNode,
  ITenant,
  ITeam,
  ITeamGroup,
  Player,
  Gender,
  AgeGroup,
} from '../../../interfaces';
import { MockDataService } from '../../../services/mock-data.service';

// Define types locally
export type DrawingMode =
  | 'pencil'
  | 'eraser'
  | 'pan'
  | 'select'
  | 'lasso'
  | 'selectChildren';

@Component({
  selector: 'app-d3-pzfw-sketch-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d3-pzfw-sketch-tree-transition.component.html',
  styleUrls: ['./d3-pzfw-sketch-tree-transition.component.scss'],
})
export class D3ExamplePZFWSketchTreeTransitionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private mockDataService = inject(MockDataService);
  private destroy$ = new Subject<void>();

  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('compassSvg', { static: false })
  compassSvgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('playerForm', { static: false }) playerForm?: NgForm;

  // SVG properties - dynamic sizing like PanZoomFullWindow
  public svg: any;
  public g: any;
  public compassSvg: any;
  public width = window.innerWidth;
  public height = window.innerHeight;
  public zoom: any;

  // Additional properties from working component
  private drawingLayer: any;
  private degreeGroup: any;
  private currentRotation = 0;
  private currentStroke: DrawingStroke | null = null;
  private strokeIdCounter = 0;
  private wheelIndicator: any = null;
  private wheelCenterX = 0;
  private wheelCenterY = 0;
  private wheelRadius = 0;

  // Tree layout properties from working component
  private treeLayout: any;
  private treeNodes: D3TreeNode[] = [];
  private treeLinks: any[] = [];
  private isDrawing = false;

  // Performance optimization flags
  private changeDetectionPending = false;
  private hasInitializedTree = false;

  // Drawing properties (basic stubs)
  public drawingMode: DrawingMode = 'pan';
  public selectedColor = '#000000';
  public brushSize = 3;
  public eraserSize = 10;
  public eraserMode: 'normal' | 'magic' = 'normal';
  public lassoMode: 'select' | 'deselect' = 'select';
  public allowNodeSelection = true;
  public isDarkMode = false;
  public selectedNodes: string[] = [];
  public strokes: any[] = [];
  public selectionMatchesLesson = false;
  public nodeCount = 100;
  public snapToolbarsOnResize = true;

  // Player sorting properties
  public playerSortBy: 'position' | 'lastName' | 'jerseyNumber' =
    'jerseyNumber';
  public playerSortOptions = [
    { value: 'jerseyNumber', label: 'Jersey Number' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'position', label: 'Position' },
  ];

  // Constants
  private readonly TOP_TOOLBAR_HEIGHT = 40; // Toolbar control height
  private readonly TOOLBAR_HEIGHT = 150; // Individual draggable toolbar height
  private readonly TOOLBAR_WIDTH = 200; // Individual draggable toolbar width

  // Colors for drawing
  public colors: string[] = [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
  ];

  // Toolbar management with typed interfaces
  public toolbarTypes: string[] = [
    'selectionTools',
    'drawingModifiers',
    'lessons',
    'selectedNodes',
    'teams',
    'zoomControls',
    'rotationControl',
    'visualPresentation',
    'viewportInfo',
  ];

  public toolbarVisibility: {
    selectionTools: boolean;
    drawingModifiers: boolean;
    lessons: boolean;
    selectedNodes: boolean;
    teams: boolean;
    zoomControls: boolean;
    rotationControl: boolean;
    visualPresentation: boolean;
    statusPanel: boolean;
    viewportInfo: boolean;
  } = {
    selectionTools: true,
    drawingModifiers: true,
    lessons: true,
    selectedNodes: true,
    teams: true,
    zoomControls: true,
    rotationControl: true,
    visualPresentation: true,
    statusPanel: true,
    viewportInfo: true,
  };

  public toolbarPositions: {
    selectionTools: { x: number; y: number };
    drawingModifiers: { x: number; y: number };
    lessons: { x: number; y: number };
    selectedNodes: { x: number; y: number };
    teams: { x: number; y: number };
    zoomControls: { x: number; y: number };
    rotationControl: { x: number; y: number };
    visualPresentation: { x: number; y: number };
    statusPanel: { x: number; y: number };
    viewportInfo: { x: number; y: number };
  } = this.loadToolbarPositions();

  public toolbarLocks: {
    selectionTools: boolean;
    drawingModifiers: boolean;
    lessons: boolean;
    selectedNodes: boolean;
    teams: boolean;
    zoomControls: boolean;
    rotationControl: boolean;
    visualPresentation: boolean;
    statusPanel: boolean;
    viewportInfo: boolean;
  } = {
    selectionTools: false,
    drawingModifiers: false,
    lessons: false,
    selectedNodes: false,
    teams: false,
    zoomControls: false,
    rotationControl: false,
    visualPresentation: false,
    statusPanel: false,
    viewportInfo: false,
  };

  // Observable stubs for lessons
  public hasLessons$ = new Observable<boolean>();
  public selectedLesson$ = new Observable<any>();
  public currentLessons$ = new Observable<any[]>();

  // Tree data
  public treeData: TreeNode = {
    id: 'root',
    name: 'Soccer Teams',
    children: [
      {
        id: '1',
        name: 'Premier League',
        children: [
          { id: '1.1', name: 'Manchester United' },
          { id: '1.2', name: 'Liverpool' },
          { id: '1.3', name: 'Arsenal' },
        ],
      },
      {
        id: '2',
        name: 'La Liga',
        children: [
          { id: '2.1', name: 'Real Madrid' },
          { id: '2.2', name: 'Barcelona' },
          { id: '2.3', name: 'Atletico Madrid' },
        ],
      },
      {
        id: '3',
        name: 'Bundesliga',
        children: [
          { id: '3.1', name: 'Bayern Munich' },
          { id: '3.2', name: 'Borussia Dortmund' },
        ],
      },
    ],
  };

  // Team properties with NGXS state selectors
  selectedOrganizationId$!: Observable<number | null>;
  selectedTeamId$!: Observable<number | null>;
  selectedTeamGroupId$!: Observable<number | null>;

  // Local state properties
  public selectedPlayerIds: number[] = []; // For checkbox selection
  public showEditTeamGroupDialog = false;
  public editingTeamGroup: ITeamGroup | null = null;
  public tempSelectedPlayerIds: number[] = [];

  // Player editing properties
  public isPlayerEditPopupOpen = false;
  public editingPlayer: Player | null = null;
  public originalPlayer: Player | null = null; // To track changes

  // Current values for synchronous access (populated from state subscriptions)
  private currentSelectedOrganizationId: number | null = null;
  private currentSelectedTeamId: number | null = null;
  private currentSelectedTeamGroupId: number | null = null;

  // Getter methods for selected objects
  public get selectedTeam(): ITeam | null {
    if (!this.currentSelectedTeamId || !this.currentSelectedOrganizationId) {
      return null;
    }
    const org = this.organizations.find(
      (o) => o.TenantID === this.currentSelectedOrganizationId
    );
    if (!org) return null;
    return (
      org.Teams.find((t) => t.TeamID === this.currentSelectedTeamId) || null
    );
  }

  public get selectedTeamGroup(): ITeamGroup | null {
    if (!this.currentSelectedTeamGroupId) {
      return null;
    }
    const team = this.selectedTeam;
    if (!team) return null;
    return (
      team.TeamGroups.find(
        (tg) => tg.TeamGroupID === this.currentSelectedTeamGroupId
      ) || null
    );
  }

  // Missing properties for template compilation
  public zoomLevel = 1.0;
  public panX = 0;
  public panY = 0;
  public rotationAngle = 0;
  public visualMode = 'radialcluster';
  public selectedNode: any = null;
  public tooltip = { visible: false, x: 0, y: 0, text: '' };

  // Flag to prevent D3 interference during slider interactions
  public isUsingSliders = false;

  public visualModeOptions = [
    { value: 'treevertical', label: 'Tree Vertical' },
    { value: 'treehorizontal', label: 'Tree Horizontal' },
    { value: 'clusterhorizontal', label: 'Cluster Horizontal' },
    { value: 'clustervertical', label: 'Cluster Vertical' },
    { value: 'radialtree', label: 'Radial Tree' },
    { value: 'radialcluster', label: 'Radial Cluster' },
  ];

  // Tree size control - Always fullscreen
  public treeSizeMode = 'fullscreen';

  // Confirmation dialog properties
  public isConfirmDialog = false;
  public showConfirmDialog = false;
  public confirmDialogTitle = '';
  public confirmDialogMessage = '';

  // Organization data with nested structure - generated by service
  public organizations: ITenant[] = [];

  constructor() {}

  ngOnInit(): void {
    // Initialize organizations using the mock data service
    this.organizations = this.mockDataService.generateMockOrganizations();

    // Initialize state selectors manually
    this.selectedOrganizationId$ = this.store.select(
      GlobalContextState.contextTenantId
    );
    this.selectedTeamId$ = this.store.select(GlobalContextState.contextTeamId);
    this.selectedTeamGroupId$ = this.store.select(
      GlobalContextState.contextTeamGroupId
    );

    // Set up state subscriptions
    this.selectedOrganizationId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.currentSelectedOrganizationId = id;
      });

    this.selectedTeamId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.currentSelectedTeamId = id;
    });

    this.selectedTeamGroupId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.currentSelectedTeamGroupId = id;
    });

    // Initialize with first organization selected (Personal)
    if (this.organizations.length > 0) {
      this.store.dispatch(
        new SetSelectedTenant(this.organizations[0].TenantID)
      );
    }

    // Ensure all toolbar positions respect the top toolbar height
    this.validateToolbarPositions();

    // Add document click listener to close dropdown when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    // Complete the destroy subject to clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up document click listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: Event): void {
    // No longer needed since we removed the dropdown
  }

  private validateToolbarPositions(): void {
    const windowHeight = window.innerHeight;
    const bottomMargin = 10; // Margin from bottom of screen

    Object.keys(this.toolbarPositions).forEach((toolbarType) => {
      const position = (this.toolbarPositions as any)[toolbarType];

      // Check top boundary
      if (position.y < this.TOP_TOOLBAR_HEIGHT) {
        position.y = this.TOP_TOOLBAR_HEIGHT + 10; // Add 10px margin from top
      }

      // Check bottom boundary
      const maxY = windowHeight - this.TOOLBAR_HEIGHT - bottomMargin;
      if (position.y > maxY) {
        position.y = maxY;
      }

      // Check left boundary
      if (position.x < 0) {
        position.x = 10; // Add 10px margin from left
      }

      // Check right boundary
      const windowWidth = window.innerWidth;
      const maxX = windowWidth - this.TOOLBAR_WIDTH - 10; // 10px margin from right
      if (position.x > maxX) {
        position.x = maxX;
      }
    });
  }

  // Toolbar position management methods
  private loadToolbarPositions(): any {
    const saved = localStorage.getItem('tree-transition-toolbar-positions');
    if (saved) {
      return JSON.parse(saved);
    }

    // Default edge positions with no overlap
    return this.getDefaultEdgePositions();
  }

  private getDefaultEdgePositions(): any {
    const margin = 20;
    const spacing = 20;

    // Calculate positions along edges with no overlap
    return {
      selectionTools: { x: margin, y: this.TOP_TOOLBAR_HEIGHT + margin },
      drawingModifiers: {
        x: margin,
        y: this.TOP_TOOLBAR_HEIGHT + margin + this.TOOLBAR_HEIGHT + spacing,
      },
      lessons: {
        x: margin,
        y:
          this.TOP_TOOLBAR_HEIGHT +
          margin +
          2 * (this.TOOLBAR_HEIGHT + spacing),
      },
      selectedNodes: {
        x: window.innerWidth - this.TOOLBAR_WIDTH - margin,
        y: this.TOP_TOOLBAR_HEIGHT + margin,
      },
      teams: {
        x: window.innerWidth - this.TOOLBAR_WIDTH - margin,
        y: this.TOP_TOOLBAR_HEIGHT + margin + this.TOOLBAR_HEIGHT + spacing,
      },
      zoomControls: {
        x: window.innerWidth - this.TOOLBAR_WIDTH - margin,
        y:
          this.TOP_TOOLBAR_HEIGHT +
          margin +
          2 * (this.TOOLBAR_HEIGHT + spacing),
      },
      rotationControl: {
        x: margin + this.TOOLBAR_WIDTH + spacing,
        y: this.TOP_TOOLBAR_HEIGHT + margin,
      },
      visualPresentation: {
        x: margin + this.TOOLBAR_WIDTH + spacing,
        y: this.TOP_TOOLBAR_HEIGHT + margin + this.TOOLBAR_HEIGHT + spacing,
      },
      statusPanel: {
        x: margin + 2 * (this.TOOLBAR_WIDTH + spacing),
        y: this.TOP_TOOLBAR_HEIGHT + margin,
      },
      viewportInfo: {
        x: margin + 2 * (this.TOOLBAR_WIDTH + spacing),
        y: this.TOP_TOOLBAR_HEIGHT + margin + this.TOOLBAR_HEIGHT + spacing,
      },
    };
  }

  private saveToolbarPositions(): void {
    localStorage.setItem(
      'tree-transition-toolbar-positions',
      JSON.stringify(this.toolbarPositions)
    );
  }

  private getActualToolbarDimensions(toolbarType: string): {
    width: number;
    height: number;
  } {
    const toolbarElement = document.querySelector(
      `[data-toolbar-type="${toolbarType}"]`
    ) as HTMLElement;
    if (toolbarElement) {
      const rect = toolbarElement.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    // Fallback to constants if element not found
    return { width: this.TOOLBAR_WIDTH, height: this.TOOLBAR_HEIGHT };
  }

  private wouldCollideWithOtherToolbars(
    newX: number,
    newY: number,
    movedToolbarType: string
  ): boolean {
    const movingDimensions = this.getActualToolbarDimensions(movedToolbarType);

    return Object.keys(this.toolbarPositions).some((otherType) => {
      if (otherType === movedToolbarType) return false;

      const otherToolbar = (this.toolbarPositions as any)[otherType];
      const otherDimensions = this.getActualToolbarDimensions(otherType);

      // Define boundaries using actual dimensions
      const movingLeft = newX;
      const movingRight = newX + movingDimensions.width;
      const movingTop = newY;
      const movingBottom = newY + movingDimensions.height;

      const otherLeft = otherToolbar.x;
      const otherRight = otherToolbar.x + otherDimensions.width;
      const otherTop = otherToolbar.y;
      const otherBottom = otherToolbar.y + otherDimensions.height;

      // Check for collision (any overlap)
      const horizontalCollision = !(
        movingRight <= otherLeft || movingLeft >= otherRight
      );
      const verticalCollision = !(
        movingBottom <= otherTop || movingTop >= otherBottom
      );

      return horizontalCollision && verticalCollision;
    });
  }

  private applyBoundaryConstraints(
    newX: number,
    newY: number,
    movedToolbarType: string
  ): { x: number; y: number } {
    // Get window dimensions for screen boundary checking
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const movingDimensions = this.getActualToolbarDimensions(movedToolbarType);
    const currentPosition = (this.toolbarPositions as any)[movedToolbarType];

    // Apply screen boundaries first
    let constrainedX = Math.max(
      0,
      Math.min(newX, windowWidth - movingDimensions.width)
    );
    let constrainedY = Math.max(
      this.TOP_TOOLBAR_HEIGHT,
      Math.min(newY, windowHeight - movingDimensions.height)
    );

    // Check collision with each other toolbar and apply individual constraints
    Object.keys(this.toolbarPositions).forEach((otherType) => {
      if (otherType === movedToolbarType) return;

      const otherToolbar = (this.toolbarPositions as any)[otherType];
      const otherDimensions = this.getActualToolbarDimensions(otherType);

      // Define boundaries of the other toolbar
      const otherLeft = otherToolbar.x;
      const otherRight = otherToolbar.x + otherDimensions.width;
      const otherTop = otherToolbar.y;
      const otherBottom = otherToolbar.y + otherDimensions.height;

      // Define boundaries of the moving toolbar at the potential new position
      const movingLeft = constrainedX;
      const movingRight = constrainedX + movingDimensions.width;
      const movingTop = constrainedY;
      const movingBottom = constrainedY + movingDimensions.height;

      // Check for horizontal overlap
      const horizontalOverlap = !(
        movingRight <= otherLeft || movingLeft >= otherRight
      );
      // Check for vertical overlap
      const verticalOverlap = !(
        movingBottom <= otherTop || movingTop >= otherBottom
      );

      // If there's both horizontal and vertical overlap, we have a collision
      if (horizontalOverlap && verticalOverlap) {
        // Determine which boundary to respect based on current position and movement direction
        const currentLeft = currentPosition.x;
        const currentRight = currentPosition.x + movingDimensions.width;
        const currentTop = currentPosition.y;
        const currentBottom = currentPosition.y + movingDimensions.height;

        // Check current relationship to other toolbar
        const currentlyToLeft = currentRight <= otherLeft;
        const currentlyToRight = currentLeft >= otherRight;
        const currentlyAbove = currentBottom <= otherTop;
        const currentlyBelow = currentTop >= otherBottom;

        // Apply constraints based on current position relative to other toolbar
        if (currentlyToLeft && movingRight > otherLeft) {
          // Moving from left, hitting left boundary of other toolbar
          constrainedX = otherLeft - movingDimensions.width;
        } else if (currentlyToRight && movingLeft < otherRight) {
          // Moving from right, hitting right boundary of other toolbar
          constrainedX = otherRight;
        }

        if (currentlyAbove && movingBottom > otherTop) {
          // Moving from above, hitting top boundary of other toolbar
          constrainedY = otherTop - movingDimensions.height;
        } else if (currentlyBelow && movingTop < otherBottom) {
          // Moving from below, hitting bottom boundary of other toolbar
          constrainedY = otherBottom;
        }

        // Re-apply screen boundaries after collision adjustments
        constrainedX = Math.max(
          0,
          Math.min(constrainedX, windowWidth - movingDimensions.width)
        );
        constrainedY = Math.max(
          this.TOP_TOOLBAR_HEIGHT,
          Math.min(constrainedY, windowHeight - movingDimensions.height)
        );
      }
    });

    return { x: constrainedX, y: constrainedY };
  }

  ngAfterViewInit(): void {
    this.updateDimensions();
    this.drawSvg();

    // Initialize toolbar positions if not already set
    if (!localStorage.getItem('tree-transition-toolbar-positions')) {
      this.toolbarPositions = this.getDefaultEdgePositions();
      this.saveToolbarPositions();
    }

    // Draw the compass in the rotation control panel after a short delay
    // to ensure the compass SVG element is available
    setTimeout(() => {
      this.drawRotationControlCompass();
    }, 100);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    this.updateDimensions();
    this.redrawSvg();

    if (this.snapToolbarsOnResize) {
      this.snapToolbarsToEdges();
    } else {
      // Even if not snapping, ensure toolbars stay within bounds
      this.validateToolbarPositions();
      this.saveToolbarPositions();
    }
  }

  private updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  private redrawSvg() {
    // Clear existing SVG content
    d3.select(this.svgRef.nativeElement).selectAll('*').remove();

    // Redraw everything
    this.drawSvg();
  } // Stub methods for template compatibility
  public confirmClearDrawing(): void {}
  public confirmClearSelection(): void {}
  public toggleAllowNodeSelection(): void {
    this.allowNodeSelection = !this.allowNodeSelection;
  }
  public getToolbarName(type: string): string {
    return type;
  }
  public getToolbarIcon(type: string): string {
    switch (type) {
      case 'selectionTools':
        return '✏️';
      case 'drawingModifiers':
        return '⚙️';
      case 'lessons':
        return '�';
      case 'selectedNodes':
        return '🎯';
      case 'teams':
        return '👥';
      case 'zoomControls':
        return '🔍';
      case 'rotationControl':
        return '🔄';
      case 'visualPresentation':
        return '👁️';
      case 'statusPanel':
        return '📊';
      case 'viewportInfo':
        return '📐';
      default:
        return '�🔧';
    }
  }
  public getToolbarVisibility(type: string): boolean {
    return (this.toolbarVisibility as any)[type] || false;
  }
  public toggleToolbarVisibility(type: string): void {
    (this.toolbarVisibility as any)[type] = !(this.toolbarVisibility as any)[
      type
    ];
  }

  public hideToolbar(type: string): void {
    (this.toolbarVisibility as any)[type] = false;
  }

  public showAllToolbars(): void {
    Object.keys(this.toolbarVisibility).forEach((key) => {
      (this.toolbarVisibility as any)[key] = true;
    });
  }

  public hideAllToolbars(): void {
    Object.keys(this.toolbarVisibility).forEach((key) => {
      (this.toolbarVisibility as any)[key] = false;
    });
  }

  public getToolbarDisplayName(key: string): string {
    const displayNames: Record<string, string> = {
      selectionTools: 'Drawing Tools',
      drawingModifiers: 'Drawing Modifiers',
      lessons: 'Lessons',
      selectedNodes: 'Selected Nodes',
      teams: 'Teams',
      zoomControls: 'Zoom Controls',
      rotationControl: 'Rotation Control',
      visualPresentation: 'Visual Presentation',
      statusPanel: 'Status Panel',
      viewportInfo: 'Viewport Info',
    };
    return displayNames[key] || key;
  }

  public getToolbarKeys(): string[] {
    return this.toolbarTypes;
  }

  public toggleToolbarLock(type: string): void {
    (this.toolbarLocks as any)[type] = !(this.toolbarLocks as any)[type];
  }
  public onToolbarDragStart(event: MouseEvent, type: string): void {
    if ((this.toolbarLocks as any)[type]) {
      return; // Don't allow dragging if locked
    }

    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...(this.toolbarPositions as any)[type] };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newX = startPos.x + deltaX;
      const newY = startPos.y + deltaY;

      // Apply boundary constraints and collision detection
      const constrainedPosition = this.applyBoundaryConstraints(
        newX,
        newY,
        type
      );

      (this.toolbarPositions as any)[type] = constrainedPosition;

      this.cdr.detectChanges();
    };

    const onMouseUp = () => {
      // Save positions when dragging ends
      this.saveToolbarPositions();

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  public setDrawingMode(mode: DrawingMode): void {
    this.drawingMode = mode;
  }
  public getCurrentDrawingMode(): DrawingMode {
    return this.drawingMode;
  }
  public selectColor(color: string): void {
    this.selectedColor = color;
  }
  public updateBrushSize(event: any): void {
    this.brushSize = event.target.value;
  }
  public updateEraserSize(event: any): void {
    this.eraserSize = event.target.value;
  }
  public setEraserMode(mode: 'normal' | 'magic'): void {
    this.eraserMode = mode;
  }
  public setLassoMode(mode: 'select' | 'deselect'): void {
    this.lassoMode = mode;
  }
  public onLessonChange(event: any): void {}
  public editLesson(): void {}
  public publishLesson(): void {}
  public deleteLesson(): void {}
  public applySelectionToLesson(): void {}
  public createLesson(): void {}
  public clearNodeSelection(): void {
    this.selectedNodes = [];
  }
  public removeNodeFromSelection(nodeId: string): void {
    this.selectedNodes = this.selectedNodes.filter((id) => id !== nodeId);
  }
  public onPublishToPlayers(): void {}
  public onCreateTeamGroup(): void {}
  public onEditTeamGroup(): void {}
  public toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }
  public updateNodeCount(event: any): void {
    this.nodeCount = parseInt(event.target.value, 10);
    console.log('Updating node count to:', this.nodeCount);
    // Regenerate tree data with the new node count
    this.treeData = this.generateRandomTree(this.nodeCount);
    const actualNodeCount = this.countTotalNodes(this.treeData);
    console.log(
      'Generated tree with',
      actualNodeCount,
      'nodes (target was',
      this.nodeCount,
      ')'
    );
    // Update the tree visualization with enter/update/exit pattern
    this.updateTree();
  }
  public toggleSnapToolbarsOnResize(): void {
    this.snapToolbarsOnResize = !this.snapToolbarsOnResize;

    // If enabling snap, immediately snap toolbars to edges
    if (this.snapToolbarsOnResize) {
      this.snapToolbarsToEdges();
    }
  }

  public snapToolbarsToEdges(): void {
    const margin = 20; // Distance from edge
    const toolbarWidth = 200; // Approximate toolbar width
    const toolbarHeight = 150; // Approximate toolbar height

    // Get current window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Snap each toolbar to nearest edge
    Object.keys(this.toolbarPositions).forEach((toolbarType) => {
      const position = (this.toolbarPositions as any)[toolbarType];

      // Calculate distances to each edge
      const distToLeft = position.x;
      const distToRight = windowWidth - (position.x + toolbarWidth);
      const distToTop = position.y;
      const distToBottom = windowHeight - (position.y + toolbarHeight);

      // Find minimum distance
      const minDist = Math.min(
        distToLeft,
        distToRight,
        distToTop,
        distToBottom
      );

      // Snap to the nearest edge
      if (minDist === distToLeft) {
        // Snap to left edge
        position.x = margin;
      } else if (minDist === distToRight) {
        // Snap to right edge
        position.x = windowWidth - toolbarWidth - margin;
      } else if (minDist === distToTop) {
        // Snap to top edge
        position.y = margin + this.TOP_TOOLBAR_HEIGHT; // Account for top toolbar
      } else {
        // Snap to bottom edge
        position.y = windowHeight - toolbarHeight - margin;
      }

      // Ensure toolbar stays within bounds
      position.x = Math.max(
        margin,
        Math.min(position.x, windowWidth - toolbarWidth - margin)
      );
      position.y = Math.max(
        margin + this.TOP_TOOLBAR_HEIGHT,
        Math.min(position.y, windowHeight - toolbarHeight - margin)
      );
    });

    // Save positions after snapping
    this.saveToolbarPositions();
  }

  public onConfirmDialogConfirm(): void {}
  public closeConfirmDialog(): void {
    this.isConfirmDialog = false;
    this.showConfirmDialog = false;
  }
  public closeEditTeamGroupDialog(): void {
    this.showEditTeamGroupDialog = false;
    this.editingTeamGroup = null;
    this.tempSelectedPlayerIds = [];
  }
  public isTempPlayerSelected(playerId: number): boolean {
    return this.tempSelectedPlayerIds.includes(playerId);
  }
  public onTempPlayerCheckboxChange(
    playerId: number,
    isChecked: boolean
  ): void {
    if (isChecked) {
      if (!this.tempSelectedPlayerIds.includes(playerId)) {
        this.tempSelectedPlayerIds.push(playerId);
      }
    } else {
      this.tempSelectedPlayerIds = this.tempSelectedPlayerIds.filter(
        (id) => id !== playerId
      );
    }
  }
  public saveTeamGroupChanges(): void {
    this.closeEditTeamGroupDialog();
  }

  // Organization selection methods
  public onOrganizationChangeEvent(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onOrganizationChange(target.value);
  }

  public onOrganizationChange(orgId: string): void {
    if (orgId) {
      this.store.dispatch(new SetSelectedTenant(parseInt(orgId)));
    } else {
      this.store.dispatch(new SetSelectedTenant(null));
    }
    // Clear team and team group selections when organization changes
    this.store.dispatch(new SetSelectedTeam(null));
    this.store.dispatch(new SetSelectedTeamGroup(null));
    this.selectedPlayerIds = [];
  }

  // Get teams for the currently selected organization
  public getTeamsForSelectedOrganization(): ITeam[] {
    if (this.currentSelectedOrganizationId === null) {
      return [];
    }

    const selectedOrg = this.organizations.find(
      (org) => org.TenantID === this.currentSelectedOrganizationId
    );
    if (!selectedOrg) {
      return [];
    }

    return selectedOrg.Teams;
  }

  // Team selection methods
  public onTeamChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const teamId = parseInt(target.value);

    if (teamId) {
      // Dispatch the team ID to state
      this.store.dispatch(new SetSelectedTeam(teamId));
    } else {
      this.store.dispatch(new SetSelectedTeam(null));
    }

    // Reset team group selection when team changes
    this.store.dispatch(new SetSelectedTeamGroup(null));
    this.selectedPlayerIds = [];
  }

  public onTeamGroupChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const teamGroupId = parseInt(target.value);

    if (teamGroupId) {
      this.store.dispatch(new SetSelectedTeamGroup(teamGroupId));
    } else {
      this.store.dispatch(new SetSelectedTeamGroup(null));
    }

    // Reset player selection when team group changes
    this.selectedPlayerIds = [];
  }

  // Get players for display based on selection
  public getSelectedTeamPlayers(): Player[] {
    if (!this.selectedTeam) {
      return [];
    }
    return this.sortPlayers(this.selectedTeam.Players);
  }

  public getSelectedTeamGroupPlayers(): Player[] {
    if (!this.selectedTeamGroup) {
      return [];
    }
    return this.sortPlayers(this.selectedTeamGroup.Players);
  }

  // Sort players based on current sort criteria
  private sortPlayers(players: Player[]): Player[] {
    return [...players].sort((a, b) => {
      switch (this.playerSortBy) {
        case 'jerseyNumber':
          return a.JerseyNumber - b.JerseyNumber;
        case 'lastName':
          return a.LastName.localeCompare(b.LastName);
        case 'position':
          // Custom position order: GK first, then others alphabetically
          if (a.PositionAbbrev === 'GK' && b.PositionAbbrev !== 'GK') return -1;
          if (b.PositionAbbrev === 'GK' && a.PositionAbbrev !== 'GK') return 1;
          return a.PositionAbbrev.localeCompare(b.PositionAbbrev);
        default:
          return 0;
      }
    });
  }

  // Handle sort option change
  public onPlayerSortChange(event: any): void {
    this.playerSortBy = event.target.value as
      | 'position'
      | 'lastName'
      | 'jerseyNumber';
  }

  // Player selection methods
  public onPlayerCheckboxChange(playerId: number, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedPlayerIds.includes(playerId)) {
        this.selectedPlayerIds.push(playerId);
      }
    } else {
      this.selectedPlayerIds = this.selectedPlayerIds.filter(
        (id) => id !== playerId
      );
    }
  }

  public isPlayerSelected(playerId: number): boolean {
    return this.selectedPlayerIds.includes(playerId);
  }

  public getPlayerFullName(player: Player): string {
    return `#${player.JerseyNumber} ${player.FirstName} ${player.LastName} (${player.PositionAbbrev})`;
  }

  public getAvailableTeamGroups(): ITeamGroup[] {
    if (!this.selectedTeam) {
      return [];
    }
    return this.selectedTeam.TeamGroups;
  }

  // Utility methods for trackBy
  public trackByTeamId(index: number, team: ITeam): number {
    return team.TeamID;
  }

  public trackByPlayerId(index: number, player: Player): number {
    return player.PlayerID;
  }

  // Complete working drawSvg implementation from D3ExamplePZFWSketchTreeComponent
  private drawSvg(): void {
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
          this.cdr.detectChanges();
          event.stopPropagation();
        }
      });

    // Use existing tree data and generation from this component
    // this.treeData = this.generateTreeData(this.nodeCount);
    // const treeLayout = this.generateTreeLayout(this.treeData);
    // this.treeNodes = treeLayout.nodes;
    // this.treeLinks = treeLayout.links;

    // Generate tree data and layout - use existing methods
    this.regenerateTree();

    // Draw tree structure - stub for now
    // this.drawTree(this.treeNodes, this.treeLinks);

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
        // Skip D3 zoom events when user is interacting with sliders
        if (this.isUsingSliders) {
          return;
        }

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
        this.cdr.detectChanges();
      });

    this.svg.call(this.zoom as any);

    // Add mouse event handlers to the entire SVG for drawing
    // Removed drawing functionality - use existing drawing methods in this component
    // this.svg
    //   .on('mousedown.drawing', (event: MouseEvent) => {
    //     if (this.drawingMode !== 'pan') {
    //       console.log('SVG mousedown for drawing mode:', this.drawingMode);
    //       this.startDrawing(event);
    //     }
    //   })
    //   .on('mousemove.drawing', (event: MouseEvent) => {
    //     if (this.isDrawing && this.drawingMode !== 'pan') {
    //       this.continueDrawing(event);
    //     }
    //   })
    //   .on('mouseup.drawing', (event: MouseEvent) => {
    //     if (this.isDrawing && this.drawingMode !== 'pan') {
    //       this.endDrawing();
    //     }
    //   });

    // Redraw existing strokes - use existing method
    // this.redrawStrokes();
    console.log('SVG setup complete, drawing layer ready');
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

  // Apply transform using the working implementation from D3ExamplePZFWSketchTreeComponent
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

  // Throttled change detection
  private triggerChangeDetection() {
    if (!this.changeDetectionPending) {
      this.changeDetectionPending = true;
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
        this.changeDetectionPending = false;
      });
    }
  }

  updatePan(event: Event, axis: 'x' | 'y') {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (axis === 'x') {
      this.panX = value;
    } else {
      this.panY = -value; // Keep the inversion for Y-axis to match slider expectation
    }

    // Apply the new transform with rotation using consistent logic
    this.applyTransform();

    // Update D3 zoom transform state to sync sliders with drag panning
    const transform = d3.zoomIdentity
      .translate(this.panX, this.panY)
      .scale(this.zoomLevel);
    this.svg.call(this.zoom.transform, transform);
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

  updateRotation(event: Event) {
    const target = event.target as HTMLInputElement;
    const rotationAngle = parseInt(target.value);
    this.rotationAngle = rotationAngle;

    // Apply rotation to main content using consistent transform logic
    this.applyTransform();

    // Update compass indicator
    if (this.compassSvg) {
      this.updateCompassRotationIndicator();
      this.updateCompassBallPosition();
    }
  }

  // Helper method to get the actual center of the tree content
  private getTreeCenter(): { x: number; y: number } {
    // If we don't have the SVG or group elements, fall back to viewport center
    if (!this.svg || !this.g) {
      return { x: this.width / 2, y: this.height / 2 };
    }

    try {
      // Temporarily remove any existing transform to get the original bounds
      const currentTransform = this.g.attr('transform');
      this.g.attr('transform', null);

      // Get bounds of the tree content in original coordinate space
      const bounds = this.g.node()?.getBBox();

      // Restore the transform
      this.g.attr('transform', currentTransform);

      if (!bounds || bounds.width === 0 || bounds.height === 0) {
        // If no tree content or empty bounds, use viewport center
        return { x: this.width / 2, y: this.height / 2 };
      }

      // Return the center in the original coordinate space
      // We'll handle the transforms properly in applyTransform
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };
    } catch (error) {
      // If getBBox fails, fall back to viewport center
      return { x: this.width / 2, y: this.height / 2 };
    }
  }

  public centerTree(): void {
    // Only center if we have SVG and group elements
    if (!this.svg || !this.g) return;

    try {
      // Get bounds of the tree content without waiting
      const bounds = this.g.node()?.getBBox();
      if (!bounds || bounds.width === 0 || bounds.height === 0) {
        console.log('No tree content found or empty bounds');
        return;
      }

      // Calculate the center of the tree content
      const contentCenterX = bounds.x + bounds.width / 2;
      const contentCenterY = bounds.y + bounds.height / 2;

      // Calculate the center of the viewport
      const viewportCenterX = this.width / 2;
      const viewportCenterY = this.height / 2;

      // Calculate the translation needed to center the content
      const translateX = viewportCenterX - contentCenterX;
      const translateY = viewportCenterY - contentCenterY;

      // Calculate appropriate scale to fit the tree nicely in view
      const scale = Math.min(
        (this.width * 0.6) / bounds.width, // Reduced from 0.8 for less aggressive scaling
        (this.height * 0.6) / bounds.height,
        1.2 // Reduced max scale from 1.5
      );

      // Apply the centering and scaling transform with shorter duration
      const centerTransform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale);

      // Apply the transform to the zoom behavior with reduced animation time
      this.svg
        .transition()
        .duration(500) // Reduced from 1000ms
        .call(this.zoom.transform, centerTransform);

      // Update component state
      this.panX = translateX;
      this.panY = translateY;
      this.zoomLevel = scale;

      console.log('Tree centered with bounds:', bounds, 'transform:', {
        translateX,
        translateY,
        scale,
      });
    } catch (error) {
      console.error('Error centering tree:', error);
    }
  }
  private drawCompass(): void {
    // Compass functionality is now integrated into the degree circle
    // This method is kept for compatibility but functionality moved to drawDegreeCircle
  }

  private drawRotationControlCompass(): void {
    if (!this.compassSvgRef?.nativeElement) {
      console.log('Compass SVG not available yet');
      return;
    }

    // Initialize compass SVG
    this.compassSvg = d3.select(this.compassSvgRef.nativeElement);
    this.compassSvg.selectAll('*').remove(); // Clear previous content

    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 135; // Main compass circle radius - balanced size for control and space

    // Create main compass group
    const compassGroup = this.compassSvg
      .append('g')
      .attr('class', 'compass-group');

    // Draw outer circle (tick circle)
    compassGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Draw inner gray circle - shrunk to match tick circle width
    compassGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius - 2) // Match the outer circle border width
      .attr('fill', 'rgba(135, 206, 235, 0.1)')
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6);

    // Draw degree ticks and labels
    const majorDegrees = [
      0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
    ];
    const minorDegrees = [15, 75, 105, 165, 195, 255, 285, 345];

    // Major degree ticks (longer lines)
    majorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180; // -90 to start from top (0°)
      const x1 = centerX + Math.cos(radian) * (radius - 12);
      const y1 = centerY + Math.sin(radian) * (radius - 12);
      const x2 = centerX + Math.cos(radian) * (radius - 2);
      const y2 = centerY + Math.sin(radian) * (radius - 2);

      // Tick mark
      compassGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);

      // Degree label
      const labelX = centerX + Math.cos(radian) * (radius - 20);
      const labelY = centerY + Math.sin(radian) * (radius - 20);

      compassGroup
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .attr('opacity', 0.8)
        .text(`${degree}°`);
    });

    // Minor degree ticks (shorter lines)
    minorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const x1 = centerX + Math.cos(radian) * (radius - 8);
      const y1 = centerY + Math.sin(radian) * (radius - 8);
      const x2 = centerX + Math.cos(radian) * (radius - 2);
      const y2 = centerY + Math.sin(radian) * (radius - 2);

      compassGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    });

    // Draw cardinal direction labels with 8-pointed compass star
    const cardinalDirections = [
      { degree: 0, label: 'N', color: '#e74c3c' },
      { degree: 45, label: 'NE', color: '#9b59b6' },
      { degree: 90, label: 'E', color: '#3498db' },
      { degree: 135, label: 'SE', color: '#1abc9c' },
      { degree: 180, label: 'S', color: '#2ecc71' },
      { degree: 225, label: 'SW', color: '#f1c40f' },
      { degree: 270, label: 'W', color: '#f39c12' },
      { degree: 315, label: 'NW', color: '#e67e22' },
    ];

    cardinalDirections.forEach(({ degree, label, color }) => {
      const radian = ((degree - 90) * Math.PI) / 180;

      // Draw 8-pointed compass star rays
      const innerRadius = 20;
      const outerRadius = 40;

      const x1 = centerX + Math.cos(radian) * innerRadius;
      const y1 = centerY + Math.sin(radian) * innerRadius;
      const x2 = centerX + Math.cos(radian) * outerRadius;
      const y2 = centerY + Math.sin(radian) * outerRadius;

      compassGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);

      // Draw cardinal direction labels
      const labelX = centerX + Math.cos(radian) * (radius + 15);
      const labelY = centerY + Math.sin(radian) * (radius + 15);

      compassGroup
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', color)
        .attr('opacity', 0.9)
        .text(label);
    });

    // Draw center crosshair
    compassGroup
      .append('line')
      .attr('x1', centerX - 8)
      .attr('y1', centerY)
      .attr('x2', centerX + 8)
      .attr('y2', centerY)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    compassGroup
      .append('line')
      .attr('x1', centerX)
      .attr('y1', centerY - 8)
      .attr('x2', centerX)
      .attr('y2', centerY + 8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Draw center dot
    compassGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 3)
      .attr('fill', '#333')
      .attr('opacity', 0.8);

    // Draw rotation indicator (current angle)
    this.updateCompassRotationIndicator();

    // Add draggable ball on the compass circle
    const ballRadius = 8;
    const ballRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const ballX = centerX + Math.cos(ballRadian) * radius;
    const ballY = centerY + Math.sin(ballRadian) * radius;

    const draggableBall = compassGroup
      .append('circle')
      .attr('class', 'rotation-ball')
      .attr('cx', ballX)
      .attr('cy', ballY)
      .attr('r', ballRadius)
      .attr('fill', '#e74c3c')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cursor', 'grab')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

    // Add drag behavior to the ball
    const drag = d3
      .drag()
      .on('start', () => {
        draggableBall.attr('cursor', 'grabbing');
      })
      .on('drag', (event) => {
        const rect = this.compassSvgRef.nativeElement.getBoundingClientRect();
        const x = event.x - centerX;
        const y = event.y - centerY;

        // Calculate angle from center to mouse position
        const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const finalAngle =
          normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;

        // Update rotation angle with maximum smoothness (no rounding)
        this.rotationAngle = finalAngle;

        // Update ball position on circle perimeter
        const newRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
        const newBallX = centerX + Math.cos(newRadian) * radius;
        const newBallY = centerY + Math.sin(newRadian) * radius;

        draggableBall.attr('cx', newBallX).attr('cy', newBallY);

        // Update rotation and indicators
        this.updateRotation({
          target: { value: this.rotationAngle.toString() },
        } as any);
        this.updateCompassRotationIndicator();
        this.cdr.detectChanges();
      })
      .on('end', () => {
        draggableBall.attr('cursor', 'grab');
      });

    draggableBall.call(drag);

    // Add click handler for rotation adjustment (for areas outside the ball)
    compassGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('click', (event: MouseEvent) => {
        const rect = this.compassSvgRef.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left - centerX;
        const y = event.clientY - rect.top - centerY;
        const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        const normalizedAngle = ((angle % 360) + 360) % 360;
        const finalAngle =
          normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;

        // Use smooth precision for click as well
        this.rotationAngle = parseFloat(finalAngle.toFixed(1));
        this.updateRotation({
          target: { value: this.rotationAngle.toString() },
        } as any);
        this.updateCompassRotationIndicator();
        this.updateCompassBallPosition();
        this.cdr.detectChanges();
      });

    console.log('Compass drawn successfully');
  }

  private updateCompassRotationIndicator(): void {
    if (!this.compassSvg) return;

    // Remove existing rotation indicator
    this.compassSvg.selectAll('.rotation-indicator').remove();

    // Red line removed per user request - only the draggable ball shows rotation
  }

  private updateCompassBallPosition(): void {
    if (!this.compassSvg) return;

    const centerX = 150;
    const centerY = 150;
    const radius = 135;

    // Calculate new ball position
    const ballRadian = ((this.rotationAngle - 90) * Math.PI) / 180;
    const ballX = centerX + Math.cos(ballRadian) * radius;
    const ballY = centerY + Math.sin(ballRadian) * radius;

    // Update ball position
    this.compassSvg
      .select('.rotation-ball')
      .attr('cx', ballX)
      .attr('cy', ballY);
  }

  // Get tree layout dimensions based on size mode
  private getTreeDimensions(): {
    width: number;
    height: number;
    margin: number;
  } {
    let margin: number;
    let usableWidth: number;
    let usableHeight: number;

    switch (this.treeSizeMode) {
      case 'compact':
        margin = 200;
        usableWidth = this.width - margin;
        usableHeight = this.height - margin;
        break;
      case 'fullscreen':
        margin = 20;
        usableWidth = this.width - margin;
        usableHeight = this.height - margin;
        break;
      default: // normal
        margin = 80;
        usableWidth = this.width - 160;
        usableHeight = this.height - 80;
        break;
    }

    return {
      width: Math.max(usableWidth, 200), // Minimum width
      height: Math.max(usableHeight, 200), // Minimum height
      margin: margin,
    };
  }

  public updateTree(): void {
    // Switch between different tree layout modes
    switch (this.visualMode) {
      case 'radialtree':
        this.transitionToRadialTree();
        break;
      case 'radialcluster':
        this.transitionToRadialCluster();
        break;
      case 'treehorizontal':
        this.transitionToTreeHorizontal();
        break;
      case 'treevertical':
        this.transitionToTreeVertical();
        break;
      case 'clusterhorizontal':
        this.transitionToHorizontalCluster();
        break;
      case 'clustervertical':
        this.transitionToClusterVertical();
        break;
      default:
        this.transitionToTreeVertical();
        break;
    }
  }

  // RADIAL TREE MODE
  private transitionToRadialTree(): void {
    const root = d3.hierarchy<TreeNode>(this.treeData);
    const dimensions = this.getTreeDimensions();
    const diameter = Math.min(dimensions.width, dimensions.height);

    const radialTreeLayout = d3
      .tree<TreeNode>()
      .size([360, diameter / 2 - diameter * 0.05])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const radialLinkPath = d3
      .linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);

    radialTreeLayout(root);
    const nodes = root.descendants();
    const links = root.links();

    const t = d3.transition().duration(2000).ease(d3.easeCubicInOut);

    // Center the radial tree
    this.g
      .transition(t)
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    // Update links
    this.g
      .selectAll('.link')
      .data(links, (d: any) => d.target.data.id)
      .join(
        (enter: any) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) => radialLinkPath(d)),
        (update: any) =>
          update
            .transition(t)
            .style('stroke', '#fc8d62')
            .attr('d', (d: any) => radialLinkPath(d)),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update nodes
    this.g
      .selectAll('.node')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            )
            .style('opacity', 0)
            .call((g: any) => {
              g.append('circle').attr('r', 4).attr('fill', '#66c2a5');
              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', (d: any) => (d.x < 180 ? 6 : -6))
                .attr('text-anchor', (d: any) => (d.x < 180 ? 'start' : 'end'))
                .attr('transform', (d: any) =>
                  d.x >= 180 ? 'rotate(180)' : null
                )
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),
        (update: any) =>
          update
            .transition(t)
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            ),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update labels
    this.g.selectAll('.label').remove(); // Remove old labels for radial mode
  }

  // RADIAL CLUSTER MODE
  private transitionToRadialCluster(): void {
    const root = d3.hierarchy<TreeNode>(this.treeData);
    const dimensions = this.getTreeDimensions();
    const diameter = Math.min(dimensions.width, dimensions.height);

    const radialClusterLayout = d3
      .cluster<TreeNode>()
      .size([360, diameter / 2 - diameter * 0.05])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const radialLinkPath = d3
      .linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);

    radialClusterLayout(root);
    const nodes = root.descendants();
    const links = root.links();

    const t = d3.transition().duration(2000).ease(d3.easeCubicInOut);

    // Center the radial cluster
    this.g
      .transition(t)
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    // Update links
    this.g
      .selectAll('.link')
      .data(links, (d: any) => d.target.data.id)
      .join(
        (enter: any) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) => radialLinkPath(d)),
        (update: any) =>
          update
            .transition(t)
            .style('stroke', '#66c2a5')
            .attr('d', (d: any) => radialLinkPath(d)),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update nodes
    this.g
      .selectAll('.node')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('circle')
            .attr('class', 'node')
            .attr('r', 4)
            .attr('fill', '#66c2a5')
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            )
            .style('opacity', 0),
        (update: any) =>
          update
            .transition(t)
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            ),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update labels
    this.g.selectAll('.label').remove(); // Remove old labels for radial mode
  }

  // HORIZONTAL TREE MODE
  private transitionToTreeHorizontal(): void {
    const root = d3.hierarchy<TreeNode>(this.treeData);
    const dimensions = this.getTreeDimensions();

    const treeLayout = d3
      .tree<TreeNode>()
      .size([dimensions.height, dimensions.width]);

    treeLayout(root);
    const nodes = root.descendants();
    const links = root.links();

    const t = d3.transition().duration(2000).ease(d3.easeCubicInOut);

    // Position for horizontal layout
    this.g
      .transition(t)
      .attr('transform', `translate(${dimensions.margin / 2},0)`);

    // Update links
    this.g
      .selectAll('.link')
      .data(links, (d: any) => d.target.data.id)
      .join(
        (enter: any) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) =>
              d3
                .linkHorizontal()
                .x((n: any) => n.y)
                .y((n: any) => n.x)(d)
            ),
        (update: any) =>
          update
            .transition(t)
            .attr('stroke', 'gray')
            .attr('d', (d: any) =>
              d3
                .linkHorizontal()
                .x((n: any) => n.y)
                .y((n: any) => n.x)(d)
            ),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update nodes
    this.g
      .selectAll('.node')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
            .style('opacity', 0)
            .call((g: any) => {
              g.append('circle').attr('r', 8).attr('fill', '#69b3a2');
              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', (d: any) => (d.children ? -12 : 12))
                .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),
        (update: any) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update labels (handled within nodes for this mode)
    this.g.selectAll('.label').remove();
  }

  // VERTICAL TREE MODE
  private transitionToTreeVertical(): void {
    const root = d3.hierarchy<TreeNode>(this.treeData);
    const dimensions = this.getTreeDimensions();

    const treeLayout = d3
      .tree<TreeNode>()
      .size([dimensions.width, dimensions.height]);

    treeLayout(root);
    const nodes = root.descendants();
    const links = root.links();

    const t = d3.transition().duration(2000).ease(d3.easeCubicInOut);

    // Position for vertical layout
    this.g
      .transition(t)
      .attr('transform', `translate(0,${dimensions.margin / 2})`);

    // Update links
    this.g
      .selectAll('.link')
      .data(links, (d: any) => d.target.data.id)
      .join(
        (enter: any) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2)
            .style('opacity', 0)
            .attr('d', (d: any) =>
              d3
                .linkVertical()
                .x((n: any) => n.x)
                .y((n: any) => n.y)(d)
            ),
        (update: any) =>
          update
            .transition(t)
            .attr('stroke', '#ccc')
            .attr('d', (d: any) =>
              d3
                .linkVertical()
                .x((n: any) => n.x)
                .y((n: any) => n.y)(d)
            ),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update nodes
    this.g
      .selectAll('.node')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('circle')
            .attr('class', 'node')
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y)
            .attr('r', 0)
            .style('fill', (d: any) => (d.children ? '#69b3a2' : '#ff6b6b'))
            .style('stroke', '#333')
            .style('stroke-width', '2px')
            .style('cursor', 'pointer')
            .style('opacity', 0),
        (update: any) =>
          update
            .transition(t)
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y),
        (exit: any) =>
          exit.transition(t).attr('r', 0).style('opacity', 0).remove()
      )
      .transition(t)
      .attr('r', 8)
      .style('opacity', 1);

    // Update labels
    this.g
      .selectAll('.label')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('text')
            .attr('class', 'label')
            .style('opacity', 0)
            .style('pointer-events', 'none'),
        (update: any) => update,
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1)
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 25)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.data.name)
      .style('font-size', '12px')
      .style('fill', '#333');
  }

  // HORIZONTAL CLUSTER MODE
  private transitionToHorizontalCluster(): void {
    const root = d3.hierarchy<TreeNode>(this.treeData);
    const dimensions = this.getTreeDimensions();

    const clusterLayout = d3
      .cluster<TreeNode>()
      .size([dimensions.height, dimensions.width]);

    clusterLayout(root);
    const nodes = root.descendants();
    const links = root.links();

    const t = d3.transition().duration(2000).ease(d3.easeCubicInOut);

    // Position for horizontal layout
    this.g
      .transition(t)
      .attr('transform', `translate(0,${dimensions.margin / 2})`);

    // Update links
    this.g
      .selectAll('.link')
      .data(links, (d: any) => d.target.data.id)
      .join(
        (enter: any) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) =>
              d3
                .linkHorizontal()
                .x((n: any) => n.y)
                .y((n: any) => n.x)(d)
            ),
        (update: any) =>
          update
            .transition(t)
            .style('stroke', '#8da0cb')
            .attr('d', (d: any) =>
              d3
                .linkHorizontal()
                .x((n: any) => n.y)
                .y((n: any) => n.x)(d)
            ),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update nodes
    this.g
      .selectAll('.node')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
            .style('opacity', 0)
            .call((g: any) => {
              g.append('circle').attr('r', 4).attr('fill', '#fc8d62');
              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', (d: any) => (d.children ? -8 : 8))
                .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),
        (update: any) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update labels (handled within nodes for this mode)
    this.g.selectAll('.label').remove();

    // Center the tree after transition completes
    setTimeout(() => {
      this.centerTree();
    }, 2100); // Wait for transition to complete (2000ms + 100ms buffer)
  }

  // VERTICAL CLUSTER MODE
  private transitionToClusterVertical(): void {
    const root = d3.hierarchy<TreeNode>(this.treeData);
    const dimensions = this.getTreeDimensions();

    const clusterLayout = d3
      .cluster<TreeNode>()
      .size([dimensions.width, dimensions.height]);

    clusterLayout(root);
    const nodes = root.descendants();
    const links = root.links();

    const t = d3.transition().duration(2000).ease(d3.easeCubicInOut);

    // Position for vertical layout
    this.g
      .transition(t)
      .attr('transform', `translate(0,${dimensions.margin / 2})`);

    // Update links
    this.g
      .selectAll('.link')
      .data(links, (d: any) => d.target.data.id)
      .join(
        (enter: any) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) =>
              d3
                .linkVertical()
                .x((n: any) => n.x)
                .y((n: any) => n.y)(d)
            ),
        (update: any) =>
          update
            .transition(t)
            .style('stroke', '#8da0cb')
            .attr('d', (d: any) =>
              d3
                .linkVertical()
                .x((n: any) => n.x)
                .y((n: any) => n.y)(d)
            ),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update nodes
    this.g
      .selectAll('.node')
      .data(nodes, (d: any) => d.data.id)
      .join(
        (enter: any) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
            .style('opacity', 0)
            .call((g: any) => {
              g.append('circle').attr('r', 4).attr('fill', '#fc8d62');
              g.append('text')
                .attr('dy', '0.31em')
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(90)')
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),
        (update: any) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`),
        (exit: any) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Update labels (handled within nodes for this mode)
    this.g.selectAll('.label').remove();
  }

  // Missing methods for template compilation
  getVisualModeLabel(mode: string): string {
    const option = this.visualModeOptions.find((o) => o.value === mode);
    return option ? option.label : 'Unknown';
  }

  getTreeSizeLabel(mode: string): string {
    return 'Full Screen'; // Always full screen now
  }

  resetRotation(): void {
    this.rotationAngle = 0;
    this.updateRotation({ target: { value: '0' } } as any);
    if (this.compassSvg) {
      this.updateCompassRotationIndicator();
    }
  }

  resetViewTransform(): void {
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.rotationAngle = 0;

    // Reset the main SVG transform
    if (this.svg && this.zoom) {
      const transform = d3.zoomIdentity;
      this.svg.call(this.zoom.transform, transform);
    }

    // Update compass indicator
    if (this.compassSvg) {
      this.updateCompassRotationIndicator();
    }

    this.cdr.detectChanges();
  }

  onVisualModeSelectChange(event: any): void {
    this.visualMode = event.target.value;
    // Update tree layout based on visual mode
    this.updateTree();
  }

  getCurrentVisualModeLabel(): string {
    const option = this.visualModeOptions.find(
      (opt) => opt.value === this.visualMode
    );
    return option ? option.label : 'Unknown';
  }

  getCurrentTreeSizeModeLabel(): string {
    return 'Full Screen'; // Always full screen now
  }

  regenerateTree(): void {
    console.log('Regenerate tree requested');
    // Randomly modify tree data to demonstrate enter/update/exit pattern
    this.randomizeTreeData();
    // Update only the tree portion using the enter/update/exit pattern
    this.updateTree();
  }

  private randomizeTreeData(): void {
    // Create a completely new random tree structure using the current node count
    this.treeData = this.generateRandomTree(this.nodeCount);
  }

  private countTotalNodes(node: TreeNode): number {
    let count = 1; // Count current node
    if (node.children) {
      node.children.forEach((child) => {
        count += this.countTotalNodes(child);
      });
    }
    return count;
  }

  private generateRandomTree(targetNodeCount: number): TreeNode {
    const categories = ['Sports', 'Technology', 'Science', 'Arts', 'Nature'];
    const rootName = categories[Math.floor(Math.random() * categories.length)];

    const root: TreeNode = {
      id: 'root',
      name: rootName,
      children: [],
    };

    let nodeCount = 1; // Start with root
    let nodeId = 1;

    // Create random branch structure, but ensure we try to reach target
    const branchCount = Math.min(
      Math.max(2, Math.floor(Math.random() * 5) + 1),
      targetNodeCount - 1
    );

    for (let i = 0; i < branchCount && nodeCount < targetNodeCount; i++) {
      const remainingNodes = targetNodeCount - nodeCount;
      const remainingBranches = branchCount - i;
      const nodesForThisBranch = Math.max(
        1,
        Math.floor(remainingNodes / remainingBranches)
      );

      const branch = this.createRandomBranch(
        `${nodeId}`,
        nodesForThisBranch,
        3 // Increased depth for better node distribution
      );
      if (branch) {
        root.children!.push(branch);
        nodeCount += this.countTotalNodes(branch);
        nodeId += 100; // Spread out IDs
      }
    }

    // If we still haven't reached the target, add more simple leaf nodes
    while (nodeCount < targetNodeCount && root.children) {
      const leafNames = [
        'Extra',
        'Additional',
        'Bonus',
        'Extended',
        'Supplemental',
      ];
      const leafName = leafNames[Math.floor(Math.random() * leafNames.length)];
      root.children.push({
        id: `extra-${nodeCount}`,
        name: `${leafName} ${nodeCount}`,
      });
      nodeCount++;
    }

    return root;
  }

  private createRandomBranch(
    idPrefix: string,
    maxNodes: number,
    depth: number
  ): TreeNode | null {
    if (maxNodes <= 0 || depth <= 0) return null;

    const branchNames = {
      Sports: ['Football', 'Basketball', 'Baseball', 'Tennis', 'Soccer'],
      Technology: ['AI', 'Web Dev', 'Mobile', 'Cloud', 'Blockchain'],
      Science: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Geology'],
      Arts: ['Painting', 'Music', 'Theater', 'Dance', 'Literature'],
      Nature: ['Forests', 'Oceans', 'Mountains', 'Rivers', 'Wildlife'],
    };

    const leafNames = {
      Sports: ['Champions', 'Rookies', 'Veterans', 'All-Stars', 'Legends'],
      Technology: [
        'Innovation',
        'Development',
        'Research',
        'Implementation',
        'Testing',
      ],
      Science: ['Discovery', 'Experiment', 'Theory', 'Analysis', 'Research'],
      Arts: ['Creative', 'Classical', 'Modern', 'Abstract', 'Traditional'],
      Nature: [
        'Ecosystem',
        'Habitat',
        'Species',
        'Environment',
        'Conservation',
      ],
    };

    const categoryKeys = Object.keys(branchNames);
    const category =
      categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const names = branchNames[category as keyof typeof branchNames];
    const leafs = leafNames[category as keyof typeof leafNames];

    const name = names[Math.floor(Math.random() * names.length)];
    const node: TreeNode = {
      id: idPrefix,
      name: name,
      children: [],
    };

    let usedNodes = 1;

    if (depth > 1 && maxNodes > 1) {
      // Create random number of children (1-4)
      const childCount = Math.min(
        Math.floor(Math.random() * 4) + 1,
        maxNodes - 1
      );

      for (let i = 0; i < childCount && usedNodes < maxNodes; i++) {
        const remainingNodes = maxNodes - usedNodes;
        const maxForThisChild = Math.max(
          1,
          Math.floor(remainingNodes / (childCount - i))
        );

        if (depth === 2) {
          // Create leaf nodes
          const leafName = leafs[Math.floor(Math.random() * leafs.length)];
          node.children!.push({
            id: `${idPrefix}.${i + 1}`,
            name: `${leafName} ${i + 1}`,
          });
          usedNodes++;
        } else {
          // Create branch nodes
          const child = this.createRandomBranch(
            `${idPrefix}.${i + 1}`,
            maxForThisChild,
            depth - 1
          );
          if (child) {
            node.children!.push(child);
            usedNodes += this.countTotalNodes(child);
          }
        }
      }
    }

    return node;
  }

  // Player editing methods
  public openPlayerEditPopup(player: Player): void {
    this.originalPlayer = { ...player }; // Create a copy to track changes
    this.editingPlayer = { ...player }; // Create an editable copy
    this.isPlayerEditPopupOpen = true;
  }

  public closePlayerEditPopup(): void {
    this.isPlayerEditPopupOpen = false;
    this.editingPlayer = null;
    this.originalPlayer = null;
  }

  public savePlayerChanges(): void {
    if (!this.editingPlayer || !this.originalPlayer) {
      return;
    }

    // Validate required fields
    if (
      !this.editingPlayer.FirstName.trim() ||
      !this.editingPlayer.LastName.trim() ||
      !this.editingPlayer.PositionName ||
      !this.editingPlayer.GenderName ||
      !this.editingPlayer.AgeGroupName ||
      this.editingPlayer.JerseyNumber < 0 ||
      this.editingPlayer.JerseyNumber > 99
    ) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    // Check for jersey number conflicts (within the same team)
    const teamPlayers = this.getSelectedTeamPlayers();
    const conflictingPlayer = teamPlayers.find(
      (p) =>
        p.PlayerID !== this.editingPlayer!.PlayerID &&
        p.JerseyNumber === this.editingPlayer!.JerseyNumber
    );

    if (conflictingPlayer) {
      alert(
        `Jersey number ${
          this.editingPlayer.JerseyNumber
        } is already taken by ${this.getPlayerFullName(conflictingPlayer)}`
      );
      return;
    }

    // Find and update the player in the data structure
    this.updatePlayerInDataStructure(this.editingPlayer);

    // Close the popup
    this.closePlayerEditPopup();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  private updatePlayerInDataStructure(updatedPlayer: Player): void {
    // Find the organization
    const org = this.organizations.find(
      (o) => o.TenantID === this.currentSelectedOrganizationId
    );
    if (!org) return;

    // Find the team
    const team = org.Teams.find((t) => t.TeamID === updatedPlayer.TeamID);
    if (!team) return;

    // Update player in team's player list
    const playerIndex = team.Players.findIndex(
      (p) => p.PlayerID === updatedPlayer.PlayerID
    );
    if (playerIndex !== -1) {
      team.Players[playerIndex] = { ...updatedPlayer };
    }

    // Update player in team groups if exists
    team.TeamGroups.forEach((teamGroup) => {
      const groupPlayerIndex = teamGroup.Players.findIndex(
        (p) => p.PlayerID === updatedPlayer.PlayerID
      );
      if (groupPlayerIndex !== -1) {
        teamGroup.Players[groupPlayerIndex] = { ...updatedPlayer };
      }
    });
  }

  public onPositionChange(): void {
    if (!this.editingPlayer) return;

    const selectedPosition = this.getAvailablePositions().find(
      (p) => p.name === this.editingPlayer!.PositionName
    );
    if (selectedPosition) {
      this.editingPlayer.PositionAbbrev = selectedPosition.abbreviation;
    }
  }

  public onGenderChange(): void {
    if (!this.editingPlayer) return;

    const selectedGender = this.getAvailableGenders().find(
      (g) => g.GenderName === this.editingPlayer!.GenderName
    );
    if (selectedGender) {
      this.editingPlayer.GenderID = selectedGender.GenderID;
      this.editingPlayer.GenderAbbrev = selectedGender.GenderAbbrev;
    }
  }

  public onAgeGroupChange(): void {
    if (!this.editingPlayer) return;

    const selectedAgeGroup = this.getAvailableAgeGroups().find(
      (ag) => ag.AgeGroupName === this.editingPlayer!.AgeGroupName
    );
    if (selectedAgeGroup) {
      this.editingPlayer.AgeGroupID = selectedAgeGroup.AgeGroupID;
    }
  }

  public getAvailablePositions(): { name: string; abbreviation: string }[] {
    return [
      { name: 'Goalkeeper', abbreviation: 'GK' },
      { name: 'Defender', abbreviation: 'DEF' },
      { name: 'Midfielder', abbreviation: 'MID' },
      { name: 'Forward', abbreviation: 'FWD' },
      { name: 'Left Back', abbreviation: 'LB' },
      { name: 'Right Back', abbreviation: 'RB' },
      { name: 'Center Back', abbreviation: 'CB' },
      { name: 'Defensive Midfielder', abbreviation: 'CDM' },
      { name: 'Central Midfielder', abbreviation: 'CM' },
      { name: 'Attacking Midfielder', abbreviation: 'CAM' },
      { name: 'Left Winger', abbreviation: 'LW' },
      { name: 'Right Winger', abbreviation: 'RW' },
      { name: 'Striker', abbreviation: 'ST' },
    ];
  }

  public getAvailableGenders(): Gender[] {
    return this.mockDataService.getGenders();
  }

  public getAvailableAgeGroups(): AgeGroup[] {
    return this.mockDataService.getAgeGroups();
  }
}
