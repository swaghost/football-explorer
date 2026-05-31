import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import {
  MiniMatchFormationsService,
  IMiniMatchBaseFormat,
} from '../../../services/mini-match-formations.service';
import { MockPositionsService } from '../../../services/mock-positions.service';
import {
  IMiniMatchPlayer,
  IMiniMatchKeyframe,
  IMiniMatchAnimationSequence,
  IMiniFormationPreset,
} from '../../../interfaces/mini-match';
import { MiniMatchState } from '../../../state/mini-match.state';
import {
  SaveCustomFormationPreset,
  UpdateCustomFormationPreset,
  DeleteCustomFormationPreset,
  ImportCustomFormationPresets,
  SaveSequence,
  DeleteSequence,
} from '../../../state/mini-match.actions';

// Drawing tool interfaces
export interface IDrawingShape {
  id: string;
  type: 'text' | 'line' | 'oval' | 'rectangle' | 'triangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  opacity?: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textColor?: string;
}

// Path tool interfaces
export type PathType =
  | 'run'
  | 'attenuated-run'
  | 'late-arriving'
  | 'crash'
  | 'normal-pass'
  | 'short-pass'
  | 'chip'
  | 'clear'
  | 'drive'
  | 'outside-hook'
  | 'inside-hook'
  | 'knuckleball'
  | 'dip'
  | 'speed-dribble'
  | 'gliding'
  | 'contact-dribble';
export type PathDrawingStyle = 'curved' | 'straight' | 'hand-drawn';
export type PathDrawingMode = 'single' | 'connected';
export type PathVisibility = 'visible' | 'hidden';

// Path participant rules based on path type
export type PathParticipantType = 'ball' | 'player' | 'ball-and-players';
function getAllowedParticipants(pathType: PathType): PathParticipantType {
  // Runs allow attaching player
  if (
    pathType === 'run' ||
    pathType === 'attenuated-run' ||
    pathType === 'late-arriving'
  ) {
    return 'player';
  }
  // Crash allows multiple players
  if (pathType === 'crash') {
    return 'ball-and-players';
  }
  // Passes allow attaching the ball
  if (
    pathType === 'normal-pass' ||
    pathType === 'short-pass' ||
    pathType === 'chip' ||
    pathType === 'clear'
  ) {
    return 'ball';
  }
  // Shots allow attaching the ball
  if (
    pathType.includes('hook') ||
    pathType === 'drive' ||
    pathType === 'knuckleball' ||
    pathType === 'dip'
  ) {
    return 'ball';
  }
  // Dribbles allow ball and players
  if (
    pathType === 'speed-dribble' ||
    pathType === 'gliding' ||
    pathType === 'contact-dribble'
  ) {
    return 'ball-and-players';
  }
  return 'ball';
}

export interface IPathPoint {
  x: number;
  y: number;
}

export interface IPathControlPoint extends IPathPoint {
  // For curved paths - control points for bezier curves
}

export interface IPathParticipant {
  objectId: string; // ID of player, ball, or shape
  objectType: 'player' | 'ball' | 'shape';
}

export interface IPath {
  id: string;
  startPoint: IPathPoint;
  endPoint: IPathPoint;
  controlPoints?: IPathControlPoint[]; // For curved paths
  pathType: PathType;
  drawingStyle: PathDrawingStyle;
  duration: number; // in seconds
  startTime: number; // when path animation starts (in seconds from sequence start)
  color: string;
  visibility: PathVisibility;
  participants: IPathParticipant[];
  isSelected?: boolean;
}

// Register GSAP plugins
gsap.registerPlugin(Draggable);

@Component({
  selector: 'app-gsap-soccer-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gsap-soccer-field.component.html',
  styleUrls: ['./gsap-soccer-field.component.scss'],
})
export class GsapSoccerFieldComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('svgContainer', { static: false })
  svgContainer!: ElementRef<SVGSVGElement>;

  // Field dimensions (in SVG units) - vertical orientation to match field grid SVGs
  fieldWidth = 660;
  fieldHeight = 1000;
  fieldPadding = 0;

  // Players
  players: IMiniMatchPlayer[] = [];
  selectedPlayer: IMiniMatchPlayer | null = null;

  // Multi-node selection and connections
  selectedPlayers: Set<string> = new Set(); // Store player IDs
  playerConnections: Array<{
    id: string;
    playerIds: string[];
    color: string;
    strokeWidth: number;
    strokeDasharray?: string; // solid, 5,5 (long dash), 2,2 (short dash)
    opacity?: number; // 0-1, default 1
    fillEnabled?: boolean; // default true
    fillColor?: string; // default rgba(0, 0, 0, 0.3)
    fillOpacity?: number; // 0-1, default 1
    fillType?: 'solid' | 'striped'; // default 'solid'
    stripeColor?: string; // stripe color for striped fill
    isOpenConnection?: boolean; // true for open connections (no closing line), false for closed
    highlightColor?: string; // optional highlight color for the connection line
    glowEnabled?: boolean; // true to add glow effect
    glowColor?: string; // glow color, default rgba(255, 255, 255, 0.5)
  }> = [];
  selectedConnection: { id: string; playerIds: string[] } | null = null;
  showConnectionTools = false;

  // Context menu state
  contextMenuPosition: { x: number; y: number } | null = null;
  contextMenuConnection: { id: string; playerIds: string[] } | null = null;
  lastContextMenuTime = 0; // Track last context menu to prevent duplicates

  // Player selection state
  showPlayerSelectionDialog = false;
  playerSelectionTeam: 'home' | 'away' | null = null;
  allPlayerNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  selectedHomePlayerNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  selectedAwayPlayerNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  playerPositions: Map<number, string> = new Map();

  // Ball
  ball = { x: 330, y: 500 };

  // Animation
  currentSequence: IMiniMatchAnimationSequence = {
    name: 'Untitled Sequence',
    keyframes: [],
    duration: 10,
  };
  currentSequenceId: string | null = null;
  currentTime = 0;
  isPlaying = false;
  isRecording = false;
  timeline: gsap.core.Timeline | null = null;
  savedSequences: IMiniMatchAnimationSequence[] = [];

  // Undo/Redo History
  undoStack: string[] = [];
  redoStack: string[] = [];
  private maxHistorySize = 50;

  // Playback options
  repeatMode = false; // Default: repeat is OFF

  // Draggable tracking
  draggables: any[] = [];

  // UI State
  showGrid = true;
  snapToGrid = false;
  gridSize = 50;
  selectedFieldGrid = 'field.standard.svg';

  // Team colors
  homeTeamColor = '#4A90E2'; // Default blue
  awayTeamColor = '#E74C3C'; // Default red

  // Player number colors
  homeNumberColor = '#FFFFFF'; // Default white
  awayNumberColor = '#FFFFFF'; // Default white

  // Make Math available to template
  Math = Math;

  // Base formation options from service
  baseFormations: IMiniMatchBaseFormat[] = [];
  selectedBaseFormation: IMiniMatchBaseFormat | null = null;

  // Custom formation presets
  customFormationPresets: IMiniFormationPreset[] = [];
  selectedCustomPreset: IMiniFormationPreset | null = null;

  // Combined formation preset selection
  selectedFormationPreset: {
    type: 'system' | 'custom';
    value: IMiniMatchBaseFormat | IMiniFormationPreset;
  } | null = null;

  // Team-specific preset selection for toolbars
  selectedHomePreset: {
    type: 'system' | 'custom';
    value: IMiniMatchBaseFormat | IMiniFormationPreset;
  } | null = null;

  selectedAwayPreset: {
    type: 'system' | 'custom';
    value: IMiniMatchBaseFormat | IMiniFormationPreset;
  } | null = null;

  // Save formation preset dialog
  showSaveFormationPresetDialog = false;
  formationPresetName = '';
  formationPresetDescription = '';

  // Overwrite formation preset dialog
  showOverwritePresetDialog = false;

  // Rename sequence dialog
  showRenameSequenceDialog = false;
  renameSequenceName = '';
  renameSequenceIndex: number | null = null;

  // Rename preset dialog
  showRenamePresetDialog = false;
  renamePresetName = '';
  renamePresetDescription = '';

  // Export keyframe dialog
  showExportKeyframeDialog = false;
  exportKeyframeIndex: number | null = null;
  exportKeyframeName = '';
  exportKeyframeDescription = '';

  // Export formation presets dialog
  showExportPresetsDialog = false;
  exportPresetsFileName = '';

  // Drawing tools
  drawingMode: 'none' | 'text' | 'line' | 'oval' | 'rectangle' | 'triangle' =
    'none';
  activeTool:
    | 'none'
    | 'select'
    | 'text'
    | 'line'
    | 'shape'
    | 'path'
    | 'connect'
    | 'training' = 'none';
  selectedShapeType: 'triangle' | 'rectangle' | 'oval' | 'circle' = 'rectangle';

  // UI state for collapsible sections
  expandedToolModifiers: 'text' | 'line' | 'shape' | 'path' | null = null;

  isDrawing = false;
  shiftKeyPressed = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  drawingShapes: IDrawingShape[] = [];
  previewShape: IDrawingShape | null = null;
  selectedShape: IDrawingShape | null = null;
  showDrawingToolsPanel = false;
  showTextPropertiesDialog = false;
  showShapePropertiesDialog = false;

  // Shape handle interaction
  isResizing = false;
  isRotating = false;
  isMoving = false;
  resizeHandle: string | null = null;
  resizeStartX = 0;
  resizeStartY = 0;
  rotateStartX = 0;
  rotateStartY = 0;
  moveStartX = 0;
  moveStartY = 0;
  originalShapeState: Partial<IDrawingShape> | null = null;
  private boundResizeMove: ((event: MouseEvent) => void) | null = null;
  private boundResizeUp: ((event: MouseEvent) => void) | null = null;
  private boundRotateMove: ((event: MouseEvent) => void) | null = null;
  private boundRotateUp: ((event: MouseEvent) => void) | null = null;
  private boundMoveMove: ((event: MouseEvent) => void) | null = null;
  private boundMoveUp: ((event: MouseEvent) => void) | null = null;

  // Text tool properties
  textContent = '';
  textFontFamily = 'Arial';
  textFontSize = 16;
  textFontWeight = 'normal';
  textFontStyle = 'normal';
  textDecoration = 'none';
  textColor = '#ffffff';

  // Line tool properties
  lineThickness = 2;
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'tiny-dashed' = 'solid';
  lineColor = '#ffffff';
  lineHeadStyle: 'none' | 'arrow' | 'dot' = 'none';
  lineTailStyle: 'none' | 'arrow' | 'dot' | 'fletching' = 'none';

  // Shape tool properties (shared with current shape properties)
  shapeStrokeColor = '#ffffff'; // Default to white for connection lines
  shapeStrokeWidth = 3; // Slightly wider for better visibility
  shapeStrokeDasharray = 'solid'; // solid, dashed, dotted
  shapeFillColor = 'transparent';
  shapeOpacity = 1;
  shapeRotation = 0; // Rotation in degrees

  // Shape-specific properties
  shapeWidth = 100;
  shapeHeight = 100;
  shapeRadius = 50; // for circle

  // Path tool properties
  paths: IPath[] = [];
  selectedPath: IPath | null = null;
  isDrawingPath = false;
  pathStartPoint: IPathPoint | null = null;
  pathPreviewEnd: IPathPoint | null = null;
  pathDrawingMode: PathDrawingMode = 'single';
  pathType: PathType = 'run';
  pathDrawingStyle: PathDrawingStyle = 'straight';
  pathDuration = 3; // Default 3 seconds
  pathColor = '#ffffff';
  pathVisibility: PathVisibility = 'visible';
  pathControlPoints: IPathControlPoint[] = [];
  handDrawnPoints: Array<{ x: number; y: number }> = []; // For hand-drawn path pen mode
  showPathTypeDialog = false;
  showPathParticipantsDialog = false;

  // Block Density Tool - Separate for Home and Away
  homeBlockDensityDimension: 'vertical' | 'horizontal' | 'both' = 'vertical';
  homeBlockDensityValue = 0; // 0-100, where 100 = maximum compression to middle
  awayBlockDensityDimension: 'vertical' | 'horizontal' | 'both' = 'vertical';
  awayBlockDensityValue = 0; // 0-100, where 100 = maximum compression to middle
  showBlockDensityPanel = false;
  homeBlockDensityOriginalPositions: Map<string, { x: number; y: number }> =
    new Map();
  awayBlockDensityOriginalPositions: Map<string, { x: number; y: number }> =
    new Map();

  // Block Movement Tool
  blockMovementActive: 'home' | 'away' = 'home';
  blockMovementEnabled = false;
  blockMovementIsDown = false;
  blockMovementStartX = 0;
  blockMovementStartY = 0;
  blockMovementOffsets: Map<string, { x: number; y: number }> = new Map();

  // Block Height Tool
  blockHeightActive: 'home' | 'away' = 'home';
  blockHeightType: 'high' | 'mid' | 'low' | 'bus' = 'mid';
  showBlockHeightPanel = false;
  enforceBlockStrictness = false;

  // Position labels for toolbars
  homePositionLabel = '';
  awayPositionLabel = '';
  lastMovedTeam: 'home' | 'away' | null = null;

  fieldGridOptions = [
    { value: 'field.standard.svg', label: 'Standard Field' },
    { value: 'field.standard.green.svg', label: 'Standard Green' },
    { value: 'field.futsal.svg', label: 'Futsal Field' },
    {
      value: 'field.futsal.color.blue-orange.svg',
      label: 'Futsal Blue-Orange',
    },
    { value: 'field.guardiola.svg', label: 'Guardiola Field' },
    { value: 'field.guardiola.green.svg', label: 'Guardiola Green' },
    { value: 'field.nagalsmann.svg', label: 'Nagelsmann Field' },
    { value: 'field.nagalsmann.green.svg', label: 'Nagelsmann Green' },
  ];

  constructor(
    private miniMatchFormationsService: MiniMatchFormationsService,
    private mockPositionsService: MockPositionsService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize position map for easy lookup
    this.mockPositionsService.getPositions().forEach((pos) => {
      this.playerPositions.set(pos.number, pos.abbrev);
    });
  }

  getFieldGridPath(): string {
    return `assets/field-grids/${this.selectedFieldGrid}`;
  }

  ngOnInit(): void {
    // Load base formations from service
    this.baseFormations = this.miniMatchFormationsService.getBaseFormations();
    if (this.baseFormations.length > 0) {
      this.selectedBaseFormation = this.baseFormations[0];
    }

    // Load custom formation presets from state
    this.customFormationPresets = this.store.selectSnapshot(
      MiniMatchState.getCustomFormationPresets
    );

    // Load saved sequences from state
    this.savedSequences = this.store.selectSnapshot(
      MiniMatchState.getSavedSequences
    );

    this.initializePlayers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDraggable();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timeline) {
      this.timeline.kill();
    }
  }

  initializePlayers(): void {
    // Full formations for all 11 players - vertical orientation
    const allHomePositions = [
      { x: 330, y: 100, number: 1 }, // GK
      { x: 180, y: 200, number: 2 }, // RB
      { x: 280, y: 200, number: 5 }, // CB
      { x: 380, y: 200, number: 4 }, // CB
      { x: 480, y: 200, number: 3 }, // LB
      { x: 200, y: 350, number: 6 }, // CM
      { x: 330, y: 350, number: 8 }, // CM
      { x: 460, y: 350, number: 10 }, // CM
      { x: 180, y: 500, number: 7 }, // RW
      { x: 330, y: 500, number: 9 }, // ST
      { x: 480, y: 500, number: 11 }, // LW
    ];

    // Full formations for all 11 players - vertical orientation (mirrored)
    const allAwayPositions = [
      { x: 330, y: 900, number: 1 }, // GK
      { x: 480, y: 800, number: 2 }, // LB
      { x: 380, y: 800, number: 5 }, // CB
      { x: 280, y: 800, number: 4 }, // CB
      { x: 180, y: 800, number: 3 }, // RB
      { x: 460, y: 650, number: 6 }, // CM
      { x: 330, y: 650, number: 8 }, // CM
      { x: 200, y: 650, number: 10 }, // CM
      { x: 480, y: 500, number: 7 }, // LW
      { x: 330, y: 500, number: 9 }, // ST
      { x: 180, y: 500, number: 11 }, // RW
    ];

    // Build players array based on selected player numbers
    this.players = [
      ...allHomePositions
        .filter((p) => this.selectedHomePlayerNumbers.includes(p.number))
        .map((p, i) => ({
          id: `home-${i}`,
          x: p.x,
          y: p.y,
          team: 'home' as const,
          number: p.number,
          color: this.homeTeamColor,
          numberColor: this.homeNumberColor,
        })),
      ...allAwayPositions
        .filter((p) => this.selectedAwayPlayerNumbers.includes(p.number))
        .map((p, i) => ({
          id: `away-${i}`,
          x: p.x,
          y: p.y,
          team: 'away' as const,
          number: p.number,
          color: this.awayTeamColor,
          numberColor: this.awayNumberColor,
        })),
    ];
    // Center ball
    this.ball = { x: 330, y: 500 };
  }

  initializeDraggable(): void {
    // Kill existing draggables to prevent memory leaks
    this.draggables.forEach((draggable) => {
      draggable.kill();
    });
    this.draggables = [];

    this.players.forEach((player) => {
      const element = document.getElementById(player.id);
      if (element) {
        const draggable = Draggable.create(element, {
          type: 'x,y',
          bounds: this.svgContainer.nativeElement,
          onDrag: () => {
            const currentDraggable = Draggable.get(element);
            if (currentDraggable) {
              player.x = currentDraggable.x;
              player.y = currentDraggable.y;
              if (this.snapToGrid) {
                player.x = Math.round(player.x / this.gridSize) * this.gridSize;
                player.y = Math.round(player.y / this.gridSize) * this.gridSize;
              }
              // Update position label while dragging
              this.updateDraggablePositionLabel(player);
              // Trigger change detection for connection updates
              this.cdr.markForCheck();
            }
          },
          onDragEnd: () => {
            if (this.isRecording) {
              this.captureKeyframe();
            }
          },
        });
        this.draggables.push(...draggable);
      }
    });
    // Ball
    const ballEl = document.getElementById('soccer-ball');
    if (ballEl) {
      const ballDraggable = Draggable.create(ballEl, {
        type: 'x,y',
        bounds: this.svgContainer.nativeElement,
        onDrag: () => {
          const currentDraggable = Draggable.get(ballEl);
          if (currentDraggable) {
            this.ball.x = currentDraggable.x;
            this.ball.y = currentDraggable.y;
            if (this.snapToGrid) {
              this.ball.x =
                Math.round(this.ball.x / this.gridSize) * this.gridSize;
              this.ball.y =
                Math.round(this.ball.y / this.gridSize) * this.gridSize;
            }
            // Update position label for ball
            const x = Math.round(this.ball.x);
            const y = Math.round(this.ball.y);
            const label = `Ball: (${x}, ${y})`;
            this.homePositionLabel = label;
            this.awayPositionLabel = label;
            // Trigger change detection for connection updates
            this.cdr.markForCheck();
          }
        },
        onDragEnd: () => {
          if (this.isRecording) {
            this.captureKeyframe();
          }
        },
      });
      this.draggables.push(...ballDraggable);
    }
  }

  updateDraggablePositionLabel(player: IMiniMatchPlayer): void {
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const label = `${player.number}: (${x}, ${y})`;

    if (player.team === 'home') {
      this.homePositionLabel = label;
      this.lastMovedTeam = 'home';
    } else {
      this.awayPositionLabel = label;
      this.lastMovedTeam = 'away';
    }
  }

  // Keyframe Management
  captureKeyframe(): void {
    const keyframe: IMiniMatchKeyframe = {
      time: this.currentTime,
      players: this.players.map((p) => ({ id: p.id, x: p.x, y: p.y })),
      ball: { x: this.ball.x, y: this.ball.y },
      // Save drawing shapes to keyframe
      drawingShapes: this.drawingShapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        strokeDasharray: shape.strokeDasharray,
        fill: shape.fill,
        opacity: shape.opacity,
        text: shape.text,
        fontSize: shape.fontSize,
        fontFamily: shape.fontFamily,
        fontWeight: shape.fontWeight,
        fontStyle: shape.fontStyle,
        textDecoration: shape.textDecoration,
        textColor: shape.textColor,
      })),
      // Save paths to keyframe
      paths: this.paths.map((path) => ({
        id: path.id,
        startPoint: path.startPoint,
        endPoint: path.endPoint,
        controlPoints: path.controlPoints,
        pathType: path.pathType,
        drawingStyle: path.drawingStyle,
        duration: path.duration,
        startTime: path.startTime,
        color: path.color,
        visibility: path.visibility,
        participants: path.participants,
      })),
    };

    // Check if keyframe at this time already exists
    const existingIndex = this.currentSequence.keyframes.findIndex(
      (kf) => Math.abs(kf.time - this.currentTime) < 0.1
    );

    if (existingIndex >= 0) {
      this.currentSequence.keyframes[existingIndex] = keyframe;
    } else {
      this.currentSequence.keyframes.push(keyframe);
      this.currentSequence.keyframes.sort((a, b) => a.time - b.time);
    }
  }

  // Base Formation Management
  applyBaseFormation(team?: 'home' | 'away'): void {
    if (!this.selectedBaseFormation) return;

    const formation = this.selectedBaseFormation;

    // Update player positions based on formation
    formation.baseFormatPositions.forEach((pos) => {
      // Find player by number - apply only to specified team, or both if no team specified
      const targetTeam = team || 'home';
      const player = this.players.find(
        (p) => p.team === targetTeam && p.number === pos.playerNumber
      );

      if (player) {
        player.x = pos.playerX;
        player.y = pos.playerY;
        // Update SVG element position
        gsap.set(`#${player.id}`, { x: pos.playerX, y: pos.playerY });
      }
    });

    // If recording, capture the keyframe
    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Team Color Management
  updateTeamColors(): void {
    this.players.forEach((player) => {
      if (player.team === 'home') {
        player.color = this.homeTeamColor;
        player.numberColor = this.homeNumberColor;
      } else if (player.team === 'away') {
        player.color = this.awayTeamColor;
        player.numberColor = this.awayNumberColor;
      }
    });
  }

  deleteKeyframe(index: number): void {
    this.currentSequence.keyframes.splice(index, 1);
  }

  goToKeyframe(keyframe: IMiniMatchKeyframe): void {
    this.currentTime = keyframe.time;
    keyframe.players.forEach((kfPlayer) => {
      const player = this.players.find((p) => p.id === kfPlayer.id);
      if (player) {
        player.x = kfPlayer.x;
        player.y = kfPlayer.y;
        gsap.set(`#${player.id}`, { x: kfPlayer.x, y: kfPlayer.y });
      }
    });
    if (keyframe.ball) {
      this.ball.x = keyframe.ball.x;
      this.ball.y = keyframe.ball.y;
      gsap.set(`#soccer-ball`, { x: this.ball.x, y: this.ball.y });
    }

    // Restore drawing shapes from keyframe
    if (keyframe.drawingShapes && keyframe.drawingShapes.length > 0) {
      this.drawingShapes = keyframe.drawingShapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        width: shape.width || 0,
        height: shape.height || 0,
        rotation: shape.rotation || 0,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        strokeDasharray: shape.strokeDasharray,
        fill: shape.fill,
        opacity: shape.opacity,
        text: shape.text,
        fontSize: shape.fontSize,
        fontFamily: shape.fontFamily,
        fontWeight: shape.fontWeight,
        fontStyle: shape.fontStyle,
        textDecoration: shape.textDecoration,
        textColor: shape.textColor,
      }));
      this.selectedShape = null; // Deselect when loading keyframe
    } else {
      // If no shapes in this keyframe, clear drawing shapes
      this.drawingShapes = [];
      this.selectedShape = null;
    }

    // Restore paths from keyframe
    if (keyframe.paths && keyframe.paths.length > 0) {
      this.paths = keyframe.paths.map((path: any) => ({
        id: path.id,
        startPoint: path.startPoint,
        endPoint: path.endPoint,
        controlPoints: path.controlPoints,
        pathType: path.pathType as PathType,
        drawingStyle: path.drawingStyle as PathDrawingStyle,
        duration: path.duration,
        startTime: path.startTime || 0,
        color: path.color,
        visibility: path.visibility as PathVisibility,
        participants: path.participants,
      }));
      this.selectedPath = null; // Deselect when loading keyframe
    } else {
      // If no paths in this keyframe, clear paths
      this.paths = [];
      this.selectedPath = null;
    }
    this.cdr.markForCheck();
  }

  openExportKeyframeDialog(index: number): void {
    this.exportKeyframeIndex = index;
    this.exportKeyframeName = `Keyframe ${this.formatTime(
      this.currentSequence.keyframes[index].time
    )}`;
    this.exportKeyframeDescription = '';
    this.showExportKeyframeDialog = true;
  }

  closeExportKeyframeDialog(): void {
    this.showExportKeyframeDialog = false;
    this.exportKeyframeIndex = null;
    this.exportKeyframeName = '';
    this.exportKeyframeDescription = '';
  }

  exportKeyframe(): void {
    if (this.exportKeyframeIndex === null) return;

    const keyframe = this.currentSequence.keyframes[this.exportKeyframeIndex];
    const keyframeData = {
      name: this.exportKeyframeName,
      description: this.exportKeyframeDescription,
      time: keyframe.time,
      players: keyframe.players,
      ball: keyframe.ball,
      fieldGrid: this.selectedFieldGrid,
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
    };

    const json = JSON.stringify(keyframeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.exportKeyframeName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.closeExportKeyframeDialog();
  }

  // Animation Playback
  play(): void {
    if (this.currentSequence.keyframes.length < 2) {
      alert('You need at least 2 keyframes to play an animation');
      return;
    }

    this.isPlaying = true;

    // Disable draggables during playback
    this.draggables.forEach((draggable) => {
      draggable.disable();
    });

    this.timeline = gsap.timeline({
      onComplete: () => {
        if (this.repeatMode) {
          // Restart the animation
          this.stop();
          this.play();
        } else {
          this.isPlaying = false;
          // Re-enable draggables after playback
          this.draggables.forEach((draggable) => {
            draggable.enable();
          });
        }
      },
      onUpdate: () => {
        if (this.timeline) {
          this.currentTime = this.timeline.time();
        }
        // Sync animated positions back to data model for connection tracking
        this.syncAnimatedPositions();
        // Update connections during animation
        this.cdr.markForCheck();
      },
    });

    // Sort keyframes by time
    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    // Set initial positions at first keyframe
    const firstKf = sortedKeyframes[0];
    firstKf.players.forEach((player) => {
      gsap.set(`#${player.id}`, { x: player.x, y: player.y });
    });
    if (firstKf.ball) {
      gsap.set(`#soccer-ball`, { x: firstKf.ball.x, y: firstKf.ball.y });
    }
    // Set initial drawing shapes
    if (firstKf.drawingShapes && firstKf.drawingShapes.length > 0) {
      this.drawingShapes = firstKf.drawingShapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation || 0,
        stroke: shape.stroke || 'black',
        strokeWidth: shape.strokeWidth || 2,
        strokeDasharray: shape.strokeDasharray,
        fill: shape.fill,
        opacity: shape.opacity || 1,
        fontSize: shape.fontSize,
        fontFamily: shape.fontFamily,
        fontWeight: shape.fontWeight,
        fontStyle: shape.fontStyle,
        textDecoration: shape.textDecoration,
        textColor: shape.textColor,
        text: shape.text,
      }));
    }
    // Set initial paths
    if (firstKf.paths && firstKf.paths.length > 0) {
      this.paths = firstKf.paths.map((path: any) => ({
        id: path.id,
        startPoint: path.startPoint,
        endPoint: path.endPoint,
        controlPoints: path.controlPoints,
        pathType: path.pathType as PathType,
        drawingStyle: path.drawingStyle as PathDrawingStyle,
        duration: path.duration,
        startTime: path.startTime || 0,
        color: path.color,
        visibility: path.visibility as PathVisibility,
        participants: path.participants,
      }));
    }

    // Create animations between keyframes
    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      const currentKf = sortedKeyframes[i];
      const nextKf = sortedKeyframes[i + 1];
      const duration = nextKf.time - currentKf.time;

      currentKf.players.forEach((kfPlayer) => {
        const nextKfPlayer = nextKf.players.find((p) => p.id === kfPlayer.id);
        if (nextKfPlayer) {
          this.timeline!.to(
            `#${kfPlayer.id}`,
            {
              x: nextKfPlayer.x,
              y: nextKfPlayer.y,
              duration: duration,
              ease: 'power1.inOut',
              onUpdate: () => {
                // Update connections in real-time as each player animates
                this.cdr.markForCheck();
              },
            },
            currentKf.time
          );
        }
      });
      // Animate ball
      if (currentKf.ball && nextKf.ball) {
        this.timeline!.to(
          `#soccer-ball`,
          {
            x: nextKf.ball.x,
            y: nextKf.ball.y,
            duration: duration,
            ease: 'power1.inOut',
            onUpdate: () => {
              // Update connections in real-time as ball animates
              this.cdr.markForCheck();
            },
          },
          currentKf.time
        );
      }

      // Animate drawing shapes between keyframes
      if (currentKf.drawingShapes && nextKf.drawingShapes) {
        // Animate each shape that appears in both keyframes
        currentKf.drawingShapes.forEach((currentShape) => {
          const nextShape = nextKf.drawingShapes!.find(
            (s) => s.id === currentShape.id
          );
          if (nextShape) {
            // Store references for closure
            const self = this;
            const shapeId = currentShape.id;

            // Animate the shape using GSAP with interpolation
            this.timeline!.to(
              { progress: 0 },
              {
                progress: 1,
                duration: duration,
                ease: 'power1.inOut',
                onUpdate: function () {
                  const progress = this.targets()[0].progress;

                  // Find the shape index
                  const idx = self.drawingShapes.findIndex(
                    (s) => s.id === shapeId
                  );
                  if (idx !== -1) {
                    const shape = self.drawingShapes[idx];

                    // Interpolate each property
                    shape.x =
                      currentShape.x +
                      (nextShape.x - currentShape.x) * progress;
                    shape.y =
                      currentShape.y +
                      (nextShape.y - currentShape.y) * progress;
                    shape.width =
                      currentShape.width +
                      (nextShape.width - currentShape.width) * progress;
                    shape.height =
                      currentShape.height +
                      (nextShape.height - currentShape.height) * progress;
                    shape.rotation =
                      (currentShape.rotation || 0) +
                      ((nextShape.rotation || 0) -
                        (currentShape.rotation || 0)) *
                        progress;
                    shape.opacity =
                      (currentShape.opacity || 1) +
                      ((nextShape.opacity || 1) - (currentShape.opacity || 1)) *
                        progress;

                    self.cdr.markForCheck();
                  }
                },
              },
              currentKf.time
            );
          }
        });

        // Handle shapes that appear only in next keyframe (fade in)
        nextKf.drawingShapes.forEach((nextShape) => {
          const exists = currentKf.drawingShapes!.find(
            (s) => s.id === nextShape.id
          );
          if (!exists) {
            // Shape is new in this keyframe - add it at the start of the keyframe
            this.timeline!.call(
              () => {
                this.drawingShapes.push({
                  id: nextShape.id,
                  type: nextShape.type,
                  x: nextShape.x,
                  y: nextShape.y,
                  width: nextShape.width,
                  height: nextShape.height,
                  rotation: nextShape.rotation || 0,
                  stroke: nextShape.stroke || 'black',
                  strokeWidth: nextShape.strokeWidth || 2,
                  strokeDasharray: nextShape.strokeDasharray,
                  fill: nextShape.fill,
                  opacity: nextShape.opacity || 1,
                  fontSize: nextShape.fontSize,
                  fontFamily: nextShape.fontFamily,
                  fontWeight: nextShape.fontWeight,
                  fontStyle: nextShape.fontStyle,
                  textDecoration: nextShape.textDecoration,
                  textColor: nextShape.textColor,
                  text: nextShape.text,
                });
                this.cdr.markForCheck();
              },
              [],
              currentKf.time
            );
          }
        });

        // Handle shapes that disappear in next keyframe (fade out)
        currentKf.drawingShapes.forEach((currentShape) => {
          const exists = nextKf.drawingShapes!.find(
            (s) => s.id === currentShape.id
          );
          if (!exists) {
            // Shape is removed in next keyframe
            this.timeline!.call(
              () => {
                this.drawingShapes = this.drawingShapes.filter(
                  (s) => s.id !== currentShape.id
                );
                this.cdr.markForCheck();
              },
              [],
              currentKf.time + duration
            );
          }
        });
      }

      // Animate paths between keyframes
      if (
        currentKf.paths &&
        nextKf.paths &&
        currentKf.paths.length > 0 &&
        nextKf.paths.length > 0
      ) {
        // Animate each path that appears in both keyframes
        currentKf.paths.forEach((currentPath) => {
          const nextPath = nextKf.paths!.find((p) => p.id === currentPath.id);
          if (nextPath) {
            // Store references for closure
            const self = this;
            const pathId = currentPath.id;
            const pathDuration = (nextPath as any).duration || 3; // Path animation duration
            const pathStartTime = (nextPath as any).startTime || 0;
            const pathEndTime = pathStartTime + pathDuration;

            // Only animate participants if the path is currently playing (within its time window)
            // A path should only animate during its own duration, not when it's just persisting
            const isPathPlaying =
              currentKf.time >= pathStartTime && currentKf.time < pathEndTime;

            // Animate the path using GSAP with interpolation
            this.timeline!.to(
              { progress: 0 },
              {
                progress: 1,
                duration: duration,
                ease: 'power1.inOut',
                onUpdate: function () {
                  const progress = this.targets()[0].progress;

                  // Find the path index
                  const idx = self.paths.findIndex((p) => p.id === pathId);
                  if (idx !== -1) {
                    const path = self.paths[idx];

                    // Interpolate each property
                    path.startPoint.x =
                      currentPath.startPoint.x +
                      (nextPath.startPoint.x - currentPath.startPoint.x) *
                        progress;
                    path.startPoint.y =
                      currentPath.startPoint.y +
                      (nextPath.startPoint.y - currentPath.startPoint.y) *
                        progress;
                    path.endPoint.x =
                      currentPath.endPoint.x +
                      (nextPath.endPoint.x - currentPath.endPoint.x) * progress;
                    path.endPoint.y =
                      currentPath.endPoint.y +
                      (nextPath.endPoint.y - currentPath.endPoint.y) * progress;

                    self.cdr.markForCheck();
                  }
                },
              },
              currentKf.time
            );

            // Only animate participants if path is within its animation window
            if (
              isPathPlaying &&
              (nextPath as any).participants &&
              (nextPath as any).participants.length > 0
            ) {
              (nextPath as any).participants.forEach((participant: any) => {
                const pathObj = self.paths.find((p) => p.id === pathId);
                if (pathObj) {
                  // Animate participant along the path for pathDuration seconds
                  self.timeline!.to(
                    { pathProgress: 0 },
                    {
                      pathProgress: 1,
                      duration: pathDuration,
                      ease: 'linear',
                      onUpdate: function () {
                        const pathProg = this.targets()[0].pathProgress;
                        const pathPoint = self.getPointAlongPath(
                          pathObj,
                          pathProg
                        );
                        // Move the participant element to the calculated position
                        gsap.set(`#${participant.objectId}`, {
                          x: pathPoint.x,
                          y: pathPoint.y,
                        });
                        self.cdr.markForCheck();
                      },
                    },
                    currentKf.time + pathStartTime // Start at the path's startTime offset
                  );
                }
              });
            }
          }
        });

        // Handle paths that appear only in next keyframe
        nextKf.paths.forEach((nextPath) => {
          const exists = currentKf.paths!.find((p) => p.id === nextPath.id);
          if (!exists) {
            // Path is new in this keyframe - add it at the start of the keyframe
            const self = this;
            this.timeline!.call(
              () => {
                this.paths.push({
                  id: (nextPath as any).id,
                  startPoint: (nextPath as any).startPoint,
                  endPoint: (nextPath as any).endPoint,
                  controlPoints: (nextPath as any).controlPoints,
                  pathType: (nextPath as any).pathType as PathType,
                  drawingStyle: (nextPath as any)
                    .drawingStyle as PathDrawingStyle,
                  duration: (nextPath as any).duration,
                  startTime: (nextPath as any).startTime || 0,
                  color: (nextPath as any).color,
                  visibility: (nextPath as any).visibility as PathVisibility,
                  participants: (nextPath as any).participants,
                });
                this.cdr.markForCheck();

                // Animate participants along this newly visible path
                if (
                  (nextPath as any).participants &&
                  (nextPath as any).participants.length > 0
                ) {
                  const pathDuration = (nextPath as any).duration || 3;
                  const pathObj = this.paths.find(
                    (p) => p.id === (nextPath as any).id
                  );
                  if (pathObj) {
                    (nextPath as any).participants.forEach(
                      (participant: any) => {
                        self.timeline!.to(
                          { pathProgress: 0 },
                          {
                            pathProgress: 1,
                            duration: pathDuration,
                            ease: 'linear',
                            onUpdate: function () {
                              const pathProg = this.targets()[0].pathProgress;
                              const pathPoint = self.getPointAlongPath(
                                pathObj,
                                pathProg
                              );
                              gsap.set(`#${participant.objectId}`, {
                                x: pathPoint.x,
                                y: pathPoint.y,
                              });
                            },
                          },
                          currentKf.time + (nextPath as any).startTime
                        );
                      }
                    );
                  }
                }
              },
              [],
              currentKf.time
            );
          }
        });

        // Handle paths that disappear in next keyframe
        currentKf.paths.forEach((currentPath) => {
          const exists = nextKf.paths!.find((p) => p.id === currentPath.id);
          if (!exists) {
            // Path is removed in next keyframe
            this.timeline!.call(
              () => {
                this.paths = this.paths.filter((p) => p.id !== currentPath.id);
                this.cdr.markForCheck();
              },
              [],
              currentKf.time + duration
            );
          }
        });
      } else if (
        currentKf.paths &&
        currentKf.paths.length > 0 &&
        (!nextKf.paths || nextKf.paths.length === 0)
      ) {
        // All paths disappear in next keyframe
        currentKf.paths.forEach((currentPath) => {
          this.timeline!.call(
            () => {
              this.paths = this.paths.filter((p) => p.id !== currentPath.id);
              this.cdr.markForCheck();
            },
            [],
            currentKf.time + duration
          );
        });
      } else if (
        (!currentKf.paths || currentKf.paths.length === 0) &&
        nextKf.paths &&
        nextKf.paths.length > 0
      ) {
        // New paths appear in next keyframe
        nextKf.paths.forEach((nextPath) => {
          this.timeline!.call(
            () => {
              this.paths.push({
                id: (nextPath as any).id,
                startPoint: (nextPath as any).startPoint,
                endPoint: (nextPath as any).endPoint,
                controlPoints: (nextPath as any).controlPoints,
                pathType: (nextPath as any).pathType as PathType,
                drawingStyle: (nextPath as any)
                  .drawingStyle as PathDrawingStyle,
                duration: (nextPath as any).duration,
                startTime: (nextPath as any).startTime || 0,
                color: (nextPath as any).color,
                visibility: (nextPath as any).visibility as PathVisibility,
                participants: (nextPath as any).participants,
              });
              this.cdr.markForCheck();
            },
            [],
            currentKf.time
          );
        });
      }
    }
  }

  pause(): void {
    if (this.timeline) {
      this.timeline.pause();
      this.isPlaying = false;
      // Re-enable draggables when paused
      this.draggables.forEach((draggable) => {
        draggable.enable();
      });
    }
  }

  stop(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.isPlaying = false;
    this.currentTime = 0;

    // Re-enable draggables when stopped
    this.draggables.forEach((draggable) => {
      draggable.enable();
    });

    // Reset to first keyframe or initial positions
    if (this.currentSequence.keyframes.length > 0) {
      this.goToKeyframe(this.currentSequence.keyframes[0]);
    }
  }

  rewind(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.isPlaying = false;
    this.currentTime = 0;

    // Reset to first keyframe or initial positions
    if (this.currentSequence.keyframes.length > 0) {
      this.goToKeyframe(this.currentSequence.keyframes[0]);
    } else {
      // Reset all players and ball to origin
      this.players.forEach((player) => {
        player.x = 0;
        player.y = 0;
        gsap.set(`#${player.id}`, { x: 0, y: 0 });
      });
      this.ball.x = 0;
      this.ball.y = 0;
      gsap.set(`#soccer-ball`, { x: 0, y: 0 });
    }
  }

  previousKeyframe(): void {
    if (this.currentSequence.keyframes.length === 0) return;

    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    // Find the keyframe just before current time
    let prevKeyframe = sortedKeyframes[0];
    for (const kf of sortedKeyframes) {
      if (kf.time < this.currentTime - 0.01) {
        prevKeyframe = kf;
      } else {
        break;
      }
    }

    this.goToKeyframe(prevKeyframe);
  }

  nextKeyframe(): void {
    if (this.currentSequence.keyframes.length === 0) return;

    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    // Find the keyframe just after current time
    for (const kf of sortedKeyframes) {
      if (kf.time > this.currentTime + 0.01) {
        this.goToKeyframe(kf);
        return;
      }
    }

    // If no next keyframe, stay at the last one
    this.goToKeyframe(sortedKeyframes[sortedKeyframes.length - 1]);
  }

  end(): void {
    if (this.currentSequence.keyframes.length === 0) return;

    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    this.goToKeyframe(sortedKeyframes[sortedKeyframes.length - 1]);
  }

  toggleRecording(): void {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Sequence Management
  saveSequence(): void {
    const name = prompt(
      'Enter a name for this sequence:',
      this.currentSequence.name
    );
    if (name) {
      const sequence: IMiniMatchAnimationSequence = {
        name,
        keyframes: JSON.parse(JSON.stringify(this.currentSequence.keyframes)),
        duration: this.currentSequence.duration,
        fieldGrid: this.selectedFieldGrid,
        homeTeamColor: this.homeTeamColor,
        awayTeamColor: this.awayTeamColor,
      };
      // Dispatch action to save sequence to state
      this.store.dispatch(new SaveSequence(sequence));
      this.savedSequences.push(sequence);
      this.currentSequenceId = null; // Reset ID when saving new
      alert('Sequence saved!');
    }
  }

  saveCurrentSequence(): void {
    if (this.currentSequenceId !== null) {
      // Overwrite existing sequence
      const index = this.savedSequences.findIndex(
        (seq) => seq.name === this.currentSequenceId
      );
      if (index !== -1) {
        const updated: IMiniMatchAnimationSequence = {
          name: this.currentSequence.name,
          keyframes: JSON.parse(JSON.stringify(this.currentSequence.keyframes)),
          duration: this.currentSequence.duration,
          fieldGrid: this.selectedFieldGrid,
          homeTeamColor: this.homeTeamColor,
          awayTeamColor: this.awayTeamColor,
        };
        this.savedSequences[index] = updated;
        this.store.dispatch(new UpdateCustomFormationPreset(updated as any));
        alert('Sequence updated!');
      }
    } else {
      // Save as new
      this.saveSequence();
    }
  }

  loadSequence(sequence: IMiniMatchAnimationSequence): void {
    this.currentSequence = JSON.parse(JSON.stringify(sequence));
    this.currentSequenceId = sequence.name; // Track which sequence is loaded

    // Restore field grid
    if (sequence.fieldGrid) {
      this.selectedFieldGrid = sequence.fieldGrid;
    }

    // Restore team colors
    if (sequence.homeTeamColor) {
      this.homeTeamColor = sequence.homeTeamColor;
    }
    if (sequence.awayTeamColor) {
      this.awayTeamColor = sequence.awayTeamColor;
    }

    // Update player colors with restored colors
    this.updateTeamColors();

    if (this.currentSequence.keyframes.length > 0) {
      this.goToKeyframe(this.currentSequence.keyframes[0]);
    }
  }

  deleteSequence(index: number): void {
    if (confirm('Are you sure you want to delete this sequence?')) {
      // Dispatch action to delete sequence from state
      this.store.dispatch(new DeleteSequence({ index }));
      this.savedSequences.splice(index, 1);
    }
  }

  newSequence(): void {
    if (
      this.currentSequence.keyframes.length > 0 &&
      !confirm('Start a new sequence? Unsaved changes will be lost.')
    ) {
      return;
    }

    this.currentSequence = {
      name: 'Untitled Sequence',
      keyframes: [],
      duration: 10,
      fieldGrid: this.selectedFieldGrid,
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
    };
    this.currentSequenceId = null; // Reset ID for new sequence
    this.currentTime = 0;
  }

  // Undo/Redo Helper Methods
  private saveState(): void {
    const currentState = JSON.stringify({
      currentSequence: this.currentSequence,
      players: this.players,
      paths: this.paths,
      drawingShapes: this.drawingShapes,
      playerConnections: this.playerConnections,
    });

    this.undoStack.push(currentState);
    this.redoStack = []; // Clear redo stack when a new action is taken

    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    this.cdr.markForCheck();
  }

  undo(): void {
    if (this.undoStack.length === 0) {
      return;
    }

    // Save current state to redo stack
    const currentState = JSON.stringify({
      currentSequence: this.currentSequence,
      players: this.players,
      paths: this.paths,
      drawingShapes: this.drawingShapes,
      playerConnections: this.playerConnections,
    });
    this.redoStack.push(currentState);

    // Restore previous state
    const previousState = this.undoStack.pop();
    if (previousState) {
      const state = JSON.parse(previousState);
      this.currentSequence = state.currentSequence;
      this.players = state.players;
      this.paths = state.paths;
      this.drawingShapes = state.drawingShapes;
      this.playerConnections = state.playerConnections;
      this.selectedPath = null;
      this.selectedShape = null;
      this.selectedConnection = null;
      this.cdr.markForCheck();
    }
  }

  redo(): void {
    if (this.redoStack.length === 0) {
      return;
    }

    // Save current state to undo stack
    const currentState = JSON.stringify({
      currentSequence: this.currentSequence,
      players: this.players,
      paths: this.paths,
      drawingShapes: this.drawingShapes,
      playerConnections: this.playerConnections,
    });
    this.undoStack.push(currentState);

    // Restore next state
    const nextState = this.redoStack.pop();
    if (nextState) {
      const state = JSON.parse(nextState);
      this.currentSequence = state.currentSequence;
      this.players = state.players;
      this.paths = state.paths;
      this.drawingShapes = state.drawingShapes;
      this.playerConnections = state.playerConnections;
      this.selectedPath = null;
      this.selectedShape = null;
      this.selectedConnection = null;
      this.cdr.markForCheck();
    }
  }

  resetSequence(): void {
    if (
      this.currentSequence.keyframes.length === 0 ||
      confirm(
        'Are you sure you want to delete all keyframes in this sequence? This cannot be undone.'
      )
    ) {
      this.currentSequence.keyframes = [];
      this.currentTime = 0;
      if (this.timeline) {
        this.timeline.kill();
        this.timeline = null;
      }
      this.isPlaying = false;
      // Reset to first frame
      this.initializePlayers();
      this.players.forEach((player) => {
        gsap.set(`#${player.id}`, { x: player.x, y: player.y });
      });
      gsap.set(`#soccer-ball`, { x: this.ball.x, y: this.ball.y });
    }
  }

  openRenameSequenceDialog(index: number): void {
    this.renameSequenceIndex = index;
    this.renameSequenceName = this.savedSequences[index].name;
    this.showRenameSequenceDialog = true;
  }

  closeRenameSequenceDialog(): void {
    this.showRenameSequenceDialog = false;
    this.renameSequenceIndex = null;
    this.renameSequenceName = '';
  }

  renameSequence(): void {
    if (this.renameSequenceIndex === null || !this.renameSequenceName.trim()) {
      return;
    }

    this.savedSequences[this.renameSequenceIndex].name =
      this.renameSequenceName.trim();
    this.closeRenameSequenceDialog();
  }

  exportSequence(): void {
    const sequence = {
      ...this.currentSequence,
      fieldGrid: this.selectedFieldGrid,
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
    };
    const json = JSON.stringify(sequence, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentSequence.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importSequence(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sequence = JSON.parse(e.target?.result as string);
          this.currentSequence = sequence;

          // Restore field grid
          if (sequence.fieldGrid) {
            this.selectedFieldGrid = sequence.fieldGrid;
          }

          // Restore team colors
          if (sequence.homeTeamColor) {
            this.homeTeamColor = sequence.homeTeamColor;
          }
          if (sequence.awayTeamColor) {
            this.awayTeamColor = sequence.awayTeamColor;
          }

          // Update player colors with restored colors
          this.updateTeamColors();

          if (this.currentSequence.keyframes.length > 0) {
            this.goToKeyframe(this.currentSequence.keyframes[0]);
          }
        } catch (error) {
          alert('Error importing sequence: Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }

  // Utility
  resetPositions(): void {
    if (confirm('Reset all players and the ball to their initial positions?')) {
      this.initializePlayers();
      this.players.forEach((player) => {
        gsap.set(`#${player.id}`, { x: player.x, y: player.y });
      });
      gsap.set(`#soccer-ball`, { x: this.ball.x, y: this.ball.y });
    }
  }

  // Player Selection Dialog Methods
  openPlayerSelectionDialog(team: 'home' | 'away' = 'home'): void {
    this.playerSelectionTeam = team;
    this.showPlayerSelectionDialog = true;
  }

  closePlayerSelectionDialog(): void {
    this.showPlayerSelectionDialog = false;
    this.playerSelectionTeam = null;
  }

  applyPlayerSelection(): void {
    this.initializePlayers();
    this.initializeDraggable();
    this.showPlayerSelectionDialog = false;
  }

  toggleHomePlayer(playerNumber: number): void {
    const index = this.selectedHomePlayerNumbers.indexOf(playerNumber);
    if (index > -1) {
      this.selectedHomePlayerNumbers.splice(index, 1);
    } else {
      this.selectedHomePlayerNumbers.push(playerNumber);
      this.selectedHomePlayerNumbers.sort((a, b) => a - b);
    }
  }

  toggleAwayPlayer(playerNumber: number): void {
    const index = this.selectedAwayPlayerNumbers.indexOf(playerNumber);
    if (index > -1) {
      this.selectedAwayPlayerNumbers.splice(index, 1);
    } else {
      this.selectedAwayPlayerNumbers.push(playerNumber);
      this.selectedAwayPlayerNumbers.sort((a, b) => a - b);
    }
  }

  selectAllHomePlayers(): void {
    this.selectedHomePlayerNumbers = [...this.allPlayerNumbers];
  }

  deselectAllHomePlayers(): void {
    this.selectedHomePlayerNumbers = [];
  }

  selectAllAwayPlayers(): void {
    this.selectedAwayPlayerNumbers = [...this.allPlayerNumbers];
  }

  deselectAllAwayPlayers(): void {
    this.selectedAwayPlayerNumbers = [];
  }

  getPositionAbbrev(playerNumber: number): string {
    return this.playerPositions.get(playerNumber) || '?';
  }

  compareFormations(
    f1: IMiniMatchBaseFormat,
    f2: IMiniMatchBaseFormat
  ): boolean {
    return f1 && f2 ? f1.baseFormatName === f2.baseFormatName : f1 === f2;
  }

  getPlayerTransform(player: IMiniMatchPlayer): string {
    return `translate(${player.x}, ${player.y})`;
  }

  getBallTransform(): string {
    return `translate(${this.ball.x}, ${this.ball.y})`;
  }

  formatTime(seconds: number): string {
    if (seconds == null || isNaN(seconds)) {
      return '0.00s';
    }
    return seconds.toFixed(2) + 's';
  }

  // Formation Preset Dialog Methods
  openSaveFormationPresetDialog(): void {
    this.showSaveFormationPresetDialog = true;
    this.formationPresetName = '';
    this.formationPresetDescription = '';
  }

  closeSaveFormationPresetDialog(): void {
    this.showSaveFormationPresetDialog = false;
  }

  saveCurrentAsFormationPreset(): void {
    if (!this.formationPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const preset: IMiniFormationPreset = {
      name: this.formationPresetName.trim(),
      description: this.formationPresetDescription.trim(),
      playerPositions: this.players.map((p) => ({
        id: p.id,
        number: p.number,
        team: p.team,
        x: p.x,
        y: p.y,
      })),
      ballPosition: { x: this.ball.x, y: this.ball.y },
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
      selectedHomePlayerNumbers: [...this.selectedHomePlayerNumbers],
      selectedAwayPlayerNumbers: [...this.selectedAwayPlayerNumbers],
    };

    // Dispatch action to save preset to state
    this.store.dispatch(new SaveCustomFormationPreset(preset));
    this.customFormationPresets.push(preset);
    this.closeSaveFormationPresetDialog();
    alert(`Formation preset "${preset.name}" saved successfully!`);
  }

  applyCustomFormationPreset(team?: 'home' | 'away'): void {
    if (!this.selectedCustomPreset) return;

    const preset = this.selectedCustomPreset;

    if (team) {
      // Apply preset to only one team
      // Apply only the player positions for the specified team
      preset.playerPositions.forEach((savedPos) => {
        const player = this.players.find((p) => p.id === savedPos.id);
        if (player && player.team === team) {
          player.x = savedPos.x;
          player.y = savedPos.y;
          gsap.set(`#${player.id}`, { x: savedPos.x, y: savedPos.y });
        }
      });
    } else {
      // Apply full preset (both teams)
      // Restore player numbers
      this.selectedHomePlayerNumbers = [...preset.selectedHomePlayerNumbers];
      this.selectedAwayPlayerNumbers = [...preset.selectedAwayPlayerNumbers];

      // Restore colors
      this.homeTeamColor = preset.homeTeamColor;
      this.awayTeamColor = preset.awayTeamColor;

      // Reinitialize players with restored selections
      this.initializePlayers();

      // Apply saved positions
      preset.playerPositions.forEach((savedPos) => {
        const player = this.players.find((p) => p.id === savedPos.id);
        if (player) {
          player.x = savedPos.x;
          player.y = savedPos.y;
          gsap.set(`#${player.id}`, { x: savedPos.x, y: savedPos.y });
        }
      });

      // Restore ball position
      this.ball.x = preset.ballPosition.x;
      this.ball.y = preset.ballPosition.y;
      gsap.set(`#soccer-ball`, {
        x: preset.ballPosition.x,
        y: preset.ballPosition.y,
      });
    }

    // Reinitialize draggables after applying preset
    setTimeout(() => {
      this.initializeDraggable();
    }, 100);
  }

  deleteCustomFormationPreset(): void {
    if (!this.selectedCustomPreset) return;

    const index = this.customFormationPresets.indexOf(
      this.selectedCustomPreset
    );
    if (index > -1) {
      const name = this.selectedCustomPreset.name;
      // Dispatch action to delete preset from state
      this.store.dispatch(new DeleteCustomFormationPreset({ index }));
      this.customFormationPresets.splice(index, 1);
      this.selectedCustomPreset = null;
      alert(`Formation preset "${name}" deleted.`);
    }
  }

  // Combined formation preset methods
  applySelectedFormationPreset(): void {
    if (!this.selectedFormationPreset) return;

    if (this.selectedFormationPreset.type === 'system') {
      this.selectedBaseFormation = this.selectedFormationPreset
        .value as IMiniMatchBaseFormat;
      this.applyBaseFormation();
    } else {
      this.selectedCustomPreset = this.selectedFormationPreset
        .value as IMiniFormationPreset;
      this.applyCustomFormationPreset();
    }
  }

  deleteSelectedFormationPreset(): void {
    if (
      !this.selectedFormationPreset ||
      this.selectedFormationPreset.type === 'system'
    )
      return;

    this.selectedCustomPreset = this.selectedFormationPreset
      .value as IMiniFormationPreset;
    this.deleteCustomFormationPreset();
    this.selectedFormationPreset = null;
  }

  // Team-specific preset methods for toolbars
  applyHomePreset(): void {
    if (!this.selectedHomePreset) return;

    if (this.selectedHomePreset.type === 'system') {
      this.selectedBaseFormation = this.selectedHomePreset
        .value as IMiniMatchBaseFormat;
      this.applyBaseFormation('home');
    } else {
      this.selectedCustomPreset = this.selectedHomePreset
        .value as IMiniFormationPreset;
      this.applyCustomFormationPreset('home');
    }
  }

  applyAwayPreset(): void {
    if (!this.selectedAwayPreset) return;

    if (this.selectedAwayPreset.type === 'system') {
      this.selectedBaseFormation = this.selectedAwayPreset
        .value as IMiniMatchBaseFormat;
      this.applyBaseFormation('away');
    } else {
      this.selectedCustomPreset = this.selectedAwayPreset
        .value as IMiniFormationPreset;
      this.applyCustomFormationPreset('away');
    }
  }

  openSaveHomePresetDialog(): void {
    this.showSaveFormationPresetDialog = true;
    this.formationPresetName = `Home Formation - ${new Date().toLocaleTimeString()}`;
    this.formationPresetDescription = 'Home team formation preset';
  }

  openSaveAwayPresetDialog(): void {
    this.showSaveFormationPresetDialog = true;
    this.formationPresetName = `Away Formation - ${new Date().toLocaleTimeString()}`;
    this.formationPresetDescription = 'Away team formation preset';
  }

  saveCurrentAsHomePreset(): void {
    if (!this.formationPresetName.trim()) return;
    this.saveCurrentAsFormationPreset();
  }

  saveCurrentAsAwayPreset(): void {
    if (!this.formationPresetName.trim()) return;
    this.saveCurrentAsFormationPreset();
  }

  openOverwritePresetDialog(): void {
    this.showOverwritePresetDialog = true;
  }

  closeOverwritePresetDialog(): void {
    this.showOverwritePresetDialog = false;
  }

  openRenamePresetDialog(): void {
    if (!this.selectedCustomPreset) return;
    this.renamePresetName = this.selectedCustomPreset.name;
    this.renamePresetDescription = this.selectedCustomPreset.description || '';
    this.showRenamePresetDialog = true;
  }

  closeRenamePresetDialog(): void {
    this.showRenamePresetDialog = false;
    this.renamePresetName = '';
    this.renamePresetDescription = '';
  }

  renamePreset(): void {
    if (!this.selectedCustomPreset || !this.renamePresetName.trim()) {
      return;
    }

    const index = this.customFormationPresets.indexOf(
      this.selectedCustomPreset
    );
    if (index > -1) {
      this.customFormationPresets[index].name = this.renamePresetName.trim();
      this.customFormationPresets[index].description =
        this.renamePresetDescription.trim();
      this.selectedCustomPreset = this.customFormationPresets[index];
    }

    this.closeRenamePresetDialog();
  }

  overwriteCustomFormationPreset(): void {
    if (!this.selectedCustomPreset) return;

    // Find the index of the selected preset
    const index = this.customFormationPresets.indexOf(
      this.selectedCustomPreset
    );

    if (index === -1) return;

    // Update the preset with current state
    const updatedPreset: IMiniFormationPreset = {
      name: this.selectedCustomPreset.name,
      description: this.selectedCustomPreset.description,
      playerPositions: this.players.map((p) => ({
        id: p.id,
        number: p.number,
        team: p.team,
        x: p.x,
        y: p.y,
      })),
      ballPosition: { x: this.ball.x, y: this.ball.y },
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
      selectedHomePlayerNumbers: [...this.selectedHomePlayerNumbers],
      selectedAwayPlayerNumbers: [...this.selectedAwayPlayerNumbers],
    };

    // Dispatch action to update preset in state
    this.store.dispatch(
      new UpdateCustomFormationPreset({
        index,
        preset: updatedPreset,
      })
    );
    // Replace the preset at the same index
    this.customFormationPresets[index] = updatedPreset;
    this.selectedCustomPreset = updatedPreset;
    this.closeOverwritePresetDialog();
    alert(
      `Formation preset "${updatedPreset.name}" has been updated successfully!`
    );
  }

  exportFormationPresets(): void {
    if (this.customFormationPresets.length === 0) {
      alert('No custom presets to export.');
      return;
    }

    // Set default filename
    this.exportPresetsFileName = `formation-presets`;
    this.showExportPresetsDialog = true;
  }

  closeExportPresetsDialog(): void {
    this.showExportPresetsDialog = false;
    this.exportPresetsFileName = '';
  }

  sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9-_]/gi, '-');
  }

  confirmExportPresets(): void {
    if (!this.exportPresetsFileName.trim()) {
      alert('Please enter a filename.');
      return;
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      presets: this.customFormationPresets,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Use the provided filename, sanitize it
    const sanitizedName = this.sanitizeFilename(this.exportPresetsFileName);
    a.download = `${sanitizedName}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.closeExportPresetsDialog();
  }

  importFormationPresets(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);

          // Validate the imported data structure
          if (!Array.isArray(importedData.presets)) {
            throw new Error('Invalid presets format');
          }

          // Check for duplicates and add with warnings
          let duplicateCount = 0;
          importedData.presets.forEach((preset: IMiniFormationPreset) => {
            const isDuplicate = this.customFormationPresets.some(
              (p) => p.name === preset.name
            );
            if (isDuplicate) {
              duplicateCount++;
              // Add with timestamp to avoid overwriting
              preset.name = `${
                preset.name
              } (Imported ${new Date().toLocaleTimeString()})`;
            }
            this.customFormationPresets.push(preset);
          });

          // Dispatch action to import presets to state
          this.store.dispatch(
            new ImportCustomFormationPresets(importedData.presets)
          );

          const importedCount = importedData.presets.length;
          let message = `Successfully imported ${importedCount} preset(s)`;
          if (duplicateCount > 0) {
            message += `. Note: ${duplicateCount} duplicate name(s) were renamed to avoid conflicts.`;
          }
          alert(message);
        } catch (error) {
          alert('Error importing presets: Invalid JSON file or corrupted data');
        }
      };
      reader.readAsText(file);
      // Reset the input so the same file can be imported again
      input.value = '';
    }
  }

  // Drawing Tools Methods
  activateDrawingTool(
    tool: 'text' | 'line' | 'oval' | 'rectangle' | 'triangle'
  ): void {
    this.drawingMode = this.drawingMode === tool ? 'none' : tool;
    console.log('🎨 Drawing mode changed to:', this.drawingMode);
    if (this.drawingMode === 'text') {
      this.showTextPropertiesDialog = true;
    }
  }

  activateMainTool(
    tool: 'select' | 'text' | 'line' | 'shape' | 'path' | 'connect' | 'training'
  ): void {
    // Check if Path tool is being activated without selected items
    if (tool === 'path' && this.selectedPlayers.size === 0) {
      console.log('⚠️ Path tool requires selected player(s) or ball');
      return;
    }

    if (this.activeTool === tool) {
      this.activeTool = 'none';
      this.drawingMode = 'none';
      this.expandedToolModifiers = null;
    } else {
      this.activeTool = tool;
      // Only set expandedToolModifiers for tools that have modifiers
      if (
        tool === 'text' ||
        tool === 'line' ||
        tool === 'shape' ||
        tool === 'path'
      ) {
        this.expandedToolModifiers = tool;
      }

      // Auto-select appropriate drawing mode
      if (tool === 'connect') {
        this.drawingMode = 'none';
        this.expandedToolModifiers = null;
      } else if (tool === 'text') {
        this.drawingMode = 'text';
        this.showTextPropertiesDialog = true;
      } else if (tool === 'line') {
        this.drawingMode = 'line';
      } else if (tool === 'shape') {
        // Set drawing mode based on selected shape type
        this.setShapeType(this.selectedShapeType);
      } else if (tool === 'path') {
        // Path tool - switch to path drawing mode
        this.drawingMode = 'path' as any;
      }
    }
    console.log(
      '🎨 Active tool changed to:',
      this.activeTool,
      'Drawing mode:',
      this.drawingMode
    );
  }

  setShapeType(type: 'triangle' | 'rectangle' | 'oval' | 'circle'): void {
    this.selectedShapeType = type;
    if (type === 'circle') {
      // For circles, we still use oval mode internally but constrain with shift key
      this.drawingMode = 'oval';
    } else {
      this.drawingMode = type as any;
    }
    console.log(
      '🎨 Shape type changed to:',
      type,
      'Drawing mode:',
      this.drawingMode
    );
  }

  toggleToolModifiers(tool: 'text' | 'line' | 'shape' | 'path'): void {
    if (this.expandedToolModifiers === tool) {
      this.expandedToolModifiers = null;
    } else {
      this.expandedToolModifiers = tool;
    }
  }

  onFieldMouseDown(event: MouseEvent): void {
    if (this.isRecording) return;

    // Handle path drawing
    if (this.activeTool === 'path') {
      if (this.pathDrawingStyle === 'hand-drawn') {
        this.startHandDrawnPath(event);
      } else {
        this.startPathDrawing(event);
      }
      return;
    }

    if (this.drawingMode === 'none') return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    this.shiftKeyPressed = event.shiftKey;
    this.isDrawing = true;
  }

  onFieldMouseMove(event: MouseEvent): void {
    if (
      !this.isDrawing &&
      !this.isDrawingPath &&
      this.handDrawnPoints.length === 0
    )
      return;
    if (
      this.drawingMode === 'none' &&
      !this.isDrawingPath &&
      this.handDrawnPoints.length === 0
    )
      return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();
    this.currentX = event.clientX - rect.left;
    this.currentY = event.clientY - rect.top;
    this.shiftKeyPressed = event.shiftKey;

    // Create preview shape for regular drawing modes
    if (this.isDrawing) {
      this.updatePreviewShape();
    }

    // Update path preview or hand-drawn path
    if (this.isDrawingPath && this.pathDrawingStyle !== 'hand-drawn') {
      this.cdr.markForCheck();
    }
    if (this.handDrawnPoints.length > 0) {
      // Convert mouse coordinates to SVG coordinates for hand-drawn paths
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgCoords = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      this.handDrawnPoints.push({ x: svgCoords.x, y: svgCoords.y });
      this.cdr.markForCheck();
    }
  }

  updatePreviewShape(): void {
    if (this.drawingMode === 'text' || this.drawingMode === 'none') {
      this.previewShape = null;
      return;
    }

    let x = Math.min(this.startX, this.currentX);
    let y = Math.min(this.startY, this.currentY);
    let width = Math.abs(this.currentX - this.startX);
    let height = Math.abs(this.currentY - this.startY);

    // Minimum preview size
    if (width < 2 || height < 2) {
      this.previewShape = null;
      return;
    }

    // For ovals: only constrain to circle if Shift is pressed
    if (this.drawingMode === 'oval' && this.shiftKeyPressed) {
      const minDim = Math.min(width, height);
      width = minDim;
      height = minDim;
    }

    this.previewShape = {
      id: 'preview-shape',
      type: this.drawingMode as any,
      x,
      y,
      width,
      height,
      rotation: 0,
      stroke: this.shapeStrokeColor,
      strokeWidth: this.shapeStrokeWidth,
      strokeDasharray: this.getStrokeDasharray(),
      fill: this.shapeFillColor,
      opacity: this.shapeOpacity,
    };
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isDrawingPath) {
        this.cancelPathDrawing();
      } else {
        this.selectedShape = null;
        this.selectedPath = null;
      }
    } else if (event.key === 'Delete') {
      if (this.selectedShape) {
        this.deleteSelectedShape();
      } else if (this.selectedPath) {
        this.deleteSelectedPath();
      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  handleMouseUp(event: MouseEvent): void {
    // Finish hand-drawn path when mouse is released
    if (
      this.handDrawnPoints.length > 1 &&
      this.activeTool === 'path' &&
      this.pathDrawingStyle === 'hand-drawn'
    ) {
      this.finishHandDrawnPath();
    }
  }

  onSvgClick(event: MouseEvent): void {
    console.log('🔵 onSvgClick started');

    // Only deselect if clicking on SVG background, not on shapes or other elements
    const path = (event as any).composedPath?.() || [];

    console.log(
      '🖱️ SVG Click event fired, selectedShape:',
      this.selectedShape?.id
    );
    console.log(
      '🖱️ Event path tags:',
      path.map((el: any) => el?.tagName?.toLowerCase?.())
    );

    // Check if any DRAWING SHAPE element is in the event path
    let isClickOnDrawingShape = false;
    try {
      isClickOnDrawingShape = path.some((el: any) => {
        const tag = el?.tagName?.toLowerCase?.();
        const id = el?.id || '';
        const classValue = el?.className?.baseVal || el?.className || '';

        // Convert to string if DOMTokenList
        const classesStr =
          typeof classValue === 'string' ? classValue : classValue.toString();

        // Only prevent deselection if clicking on a drawing shape (has drawing-shape class or shape- id)
        const isDrawingShape =
          classesStr.includes('drawing-shape') || id.includes('shape-');

        const matches =
          (isDrawingShape &&
            (tag === 'rect' ||
              tag === 'circle' ||
              tag === 'line' ||
              tag === 'polygon' ||
              tag === 'text')) ||
          id.includes('player-') ||
          classesStr.includes('player-connections');

        if (matches) {
          console.log(
            `  📍 Matched: tag=${tag}, isDrawingShape=${isDrawingShape}, id=${id}, classes=${classesStr}`
          );
        }
        return matches;
      });
    } catch (e) {
      console.error('❌ Error in path checking:', e);
    }

    console.log('🖱️ isClickOnDrawingShape:', isClickOnDrawingShape);
    if (!isClickOnDrawingShape) {
      console.log('🔴 Deselecting...');
      this.selectedShape = null;
      this.selectedPath = null;
      this.cdr.markForCheck();
      console.log('✅ Shape deselected');
    } else {
      console.log('🟡 Not deselecting - clicked on element');
    }
    console.log('🔵 onSvgClick ended');
  }

  onFieldMouseUp(event: MouseEvent): void {
    if (!this.isDrawing) return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();
    const endX = event.clientX - rect.left;
    const endY = event.clientY - rect.top;

    console.log(
      `🖱️ Mouse up - drawing ${this.drawingMode} from (${this.startX}, ${this.startY}) to (${endX}, ${endY})`
    );

    this.isDrawing = false;
    this.previewShape = null;

    // Check if this is just a click (no actual drawing)
    const width = Math.abs(endX - this.startX);
    const height = Math.abs(endY - this.startY);
    const isJustAClick = width < 5 && height < 5;

    if (isJustAClick) {
      // Small click while drawing - deselect but don't create shape
      this.selectedShape = null;
      this.cdr.markForCheck();
      console.log('✅ Deselected (small click)');
      return;
    }

    if (this.drawingMode === 'text') {
      this.showTextPropertiesDialog = true;
    } else if (!isJustAClick) {
      this.createShape(this.startX, this.startY, endX, endY);
    }
  }

  createShape(x1: number, y1: number, x2: number, y2: number): void {
    if (this.drawingMode === 'none') return;

    let x = Math.min(x1, x2);
    let y = Math.min(y1, y2);
    let width = Math.abs(x2 - x1);
    let height = Math.abs(y2 - y1);

    if (width < 5 && height < 5) {
      console.log('⚠️ Shape too small, ignoring');
      return; // Ignore tiny shapes
    }

    // For ovals: only constrain to circle if Shift was pressed
    if (this.drawingMode === 'oval' && this.shiftKeyPressed) {
      const minDim = Math.min(width, height);
      width = minDim;
      height = minDim;
    }

    const shape: IDrawingShape = {
      id: `shape-${Date.now()}`,
      type: this.drawingMode as any,
      x,
      y,
      width,
      height,
      rotation: 0,
      stroke: this.shapeStrokeColor,
      strokeWidth: this.shapeStrokeWidth,
      strokeDasharray: this.getStrokeDasharray(),
      fill: this.shapeFillColor,
      opacity: this.shapeOpacity,
    };

    console.log('✅ Creating shape:', shape);
    this.drawingShapes.push(shape);
    this.saveState();
    console.log('📊 Total shapes:', this.drawingShapes.length);
    this.selectedShape = shape;
    this.cdr.markForCheck();
  }

  addTextShape(): void {
    if (!this.textContent.trim()) return;

    const shape: IDrawingShape = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: this.startX || 100,
      y: this.startY || 100,
      text: this.textContent,
      fontSize: this.textFontSize,
      fontFamily: this.textFontFamily,
      fontWeight: this.textFontWeight,
      fontStyle: this.textFontStyle,
      textDecoration: this.textDecoration,
      textColor: this.textColor,
    };

    this.drawingShapes.push(shape);
    this.saveState();
    this.selectedShape = shape;
    this.closeTextPropertiesDialog();
  }

  selectShape(shape: IDrawingShape): void {
    this.selectedShape = shape;
    if (shape.type === 'text') {
      this.textContent = shape.text || '';
      this.textFontSize = shape.fontSize || 16;
      this.textFontFamily = shape.fontFamily || 'Arial';
      this.textFontWeight = shape.fontWeight || 'normal';
      this.textFontStyle = shape.fontStyle || 'normal';
      this.textDecoration = shape.textDecoration || 'none';
      this.textColor = shape.textColor || '#ffffff';
    } else {
      this.shapeStrokeColor = shape.stroke || '#000000';
      this.shapeStrokeWidth = shape.strokeWidth || 2;
      this.shapeFillColor = shape.fill || 'transparent';
      this.shapeOpacity = shape.opacity || 1;
      this.shapeRotation = shape.rotation || 0;
    }
  }

  updateSelectedShape(): void {
    if (!this.selectedShape) return;

    if (this.selectedShape.type === 'text') {
      this.selectedShape.text = this.textContent;
      this.selectedShape.fontSize = this.textFontSize;
      this.selectedShape.fontFamily = this.textFontFamily;
      this.selectedShape.fontWeight = this.textFontWeight;
      this.selectedShape.fontStyle = this.textFontStyle;
      this.selectedShape.textDecoration = this.textDecoration;
      this.selectedShape.textColor = this.textColor;
    } else {
      this.selectedShape.stroke = this.shapeStrokeColor;
      this.selectedShape.strokeWidth = this.shapeStrokeWidth;
      this.selectedShape.strokeDasharray = this.getStrokeDasharray();
      this.selectedShape.fill = this.shapeFillColor;
      this.selectedShape.opacity = this.shapeOpacity;
      this.selectedShape.rotation = this.shapeRotation;
    }
  }

  deleteSelectedShape(): void {
    if (!this.selectedShape) return;

    const index = this.drawingShapes.indexOf(this.selectedShape);
    if (index > -1) {
      this.drawingShapes.splice(index, 1);
      this.selectedShape = null;
      this.saveState();
      this.cdr.markForCheck();
    }
  }

  // Path Tool Methods
  startPathDrawing(event: MouseEvent): void {
    if (this.activeTool !== 'path') return;

    // Guard against invalid state
    if (this.isDrawingPath && !this.pathStartPoint) {
      console.warn('⚠️ Invalid path drawing state - resetting');
      this.isDrawingPath = false;
      this.pathStartPoint = null;
      this.pathControlPoints = [];
    }

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.preventDefault();
    event.stopPropagation();

    if (!this.isDrawingPath) {
      // Start new path
      console.log(`🛤️ Starting new path at (${x}, ${y})`);
      this.pathStartPoint = { x, y };
      this.isDrawingPath = true;
    } else if (this.isDrawingPath && this.pathStartPoint) {
      // End path - create the path object
      console.log(`🛤️ Ending path at (${x}, ${y})`);
      const newPath: IPath = {
        id: `path-${Date.now()}`,
        startPoint: this.pathStartPoint,
        endPoint: { x, y },
        pathType: this.pathType,
        drawingStyle: this.pathDrawingStyle,
        duration: this.pathDuration,
        startTime: this.currentTime, // Start from current timeline position
        color: this.pathColor,
        visibility: this.pathVisibility,
        participants: [],
        controlPoints: [...this.pathControlPoints],
      };

      // Auto-attach all selected players and ball
      this.selectedPlayers.forEach((playerId) => {
        if (playerId === 'soccer-ball') {
          newPath.participants.push({ objectId: playerId, objectType: 'ball' });
        } else {
          newPath.participants.push({
            objectId: playerId,
            objectType: 'player',
          });
        }
      });

      this.paths.push(newPath);
      this.selectedPath = newPath;
      console.log(
        `✅ Path created with ${newPath.participants.length} participants`
      );

      // Capture keyframes at start and end of path
      const originalTime = this.currentTime;

      // Capture keyframe at path start time
      this.currentTime = newPath.startTime;
      this.captureKeyframe();

      // Capture keyframe at path end time
      this.currentTime = newPath.startTime + newPath.duration;
      this.captureKeyframe();

      // Restore original time
      this.currentTime = originalTime;

      console.log(
        `📍 Keyframes created at times ${newPath.startTime} and ${
          newPath.startTime + newPath.duration
        }`
      );

      // Save state for undo/redo
      this.saveState();

      // Check if we should continue in connected mode
      if (this.pathDrawingMode === 'connected') {
        console.log(`🔗 Connected mode - starting next path from (${x}, ${y})`);
        this.pathStartPoint = { x, y }; // Start next path from end of this one
        this.pathControlPoints = [];
        this.isDrawingPath = true;
      } else {
        // Single mode - return to select tool
        console.log(`✅ Single mode - returning to select tool`);
        this.isDrawingPath = false;
        this.pathStartPoint = null;
        this.pathControlPoints = [];
        this.activateMainTool('select');
      }
    }
  }

  selectPath(path: IPath): void {
    this.selectedPath = path;
    this.pathType = path.pathType;
    this.pathDrawingStyle = path.drawingStyle;
    this.pathDuration = path.duration;
    this.pathColor = path.color;
    this.pathVisibility = path.visibility;
    this.pathControlPoints = [...(path.controlPoints || [])];

    // Stop drawing if currently drawing a path
    if (this.isDrawingPath) {
      this.isDrawingPath = false;
      this.pathStartPoint = null;
      this.handDrawnPoints = [];
      console.log('🛑 Stopped drawing - path selected');
    }

    // Initialize control points for curved paths if they don't exist
    if (
      this.pathDrawingStyle === 'curved' &&
      (!path.controlPoints || path.controlPoints.length === 0)
    ) {
      this.initializeControlPoints(path);
    }
  }

  togglePathSelection(path: IPath, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Toggle selection - if already selected, deselect; otherwise select
    if (this.selectedPath?.id === path.id) {
      this.selectedPath = null;
      console.log('🔄 Path deselected:', path.id);
    } else {
      this.selectPath(path);
      console.log('✅ Path selected:', path.id);
    }
    this.cdr.markForCheck();
  }

  initializeControlPoints(path: IPath): void {
    // Create default control points for curved paths
    const { startPoint, endPoint } = path;
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;

    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Create one control point perpendicular to the line
    const perpX = (-dy / distance) * (distance * 0.3);
    const perpY = (dx / distance) * (distance * 0.3);

    const controlPoint: IPathControlPoint = {
      x: midX + perpX,
      y: midY + perpY,
    };

    path.controlPoints = [controlPoint];
    this.pathControlPoints = [...path.controlPoints];
  }

  // Get allowed participant types for current path
  getAllowedParticipantTypesForPath(): PathParticipantType {
    if (!this.selectedPath) return 'ball';
    return getAllowedParticipants(this.selectedPath.pathType);
  }

  // Check if a participant is already attached
  isParticipantAttached(objectId: string): boolean {
    if (!this.selectedPath) return false;
    return this.selectedPath.participants.some((p) => p.objectId === objectId);
  }

  // Toggle participant attachment
  toggleParticipantAttachment(
    objectId: string,
    objectType: 'player' | 'ball'
  ): void {
    if (!this.selectedPath) return;

    const allowedTypes = this.getAllowedParticipantTypesForPath();

    // Check if this object type is allowed
    if (allowedTypes === 'player' && objectType !== 'player') return;
    if (allowedTypes === 'ball' && objectType !== 'ball') return;
    // ball-and-players allows both

    // Check if already attached
    const existingIndex = this.selectedPath.participants.findIndex(
      (p) => p.objectId === objectId
    );

    if (existingIndex > -1) {
      // Remove it
      this.selectedPath.participants.splice(existingIndex, 1);
    } else {
      // Add it
      // For crash paths with multiple players, allow multiple
      // For other types, prevent multiple unless it's ball-and-players
      if (
        allowedTypes === 'player' &&
        this.selectedPath.participants.length > 0
      ) {
        if (this.selectedPath.pathType !== 'crash') {
          return; // Only one player allowed for regular runs
        }
      }
      if (
        allowedTypes === 'ball' &&
        this.selectedPath.participants.length > 0
      ) {
        return; // Only one ball allowed for passes/shots
      }

      this.selectedPath.participants.push({ objectId, objectType });
    }

    // Trigger update
    this.updateSelectedPath();
  }

  getParticipantDisplayName(participant: IPathParticipant): string {
    if (participant.objectType === 'ball') {
      return 'Ball';
    }
    const player = this.players.find((p) => p.id === participant.objectId);
    if (player) {
      return `Player ${player.number}`;
    }
    return participant.objectId;
  }

  deleteSelectedPath(): void {
    if (!this.selectedPath) return;

    const index = this.paths.indexOf(this.selectedPath);
    if (index > -1) {
      this.paths.splice(index, 1);
      this.selectedPath = null;
      this.saveState();
      this.cdr.markForCheck();
    }
  }

  updateSelectedPath(): void {
    if (!this.selectedPath) return;

    this.selectedPath.pathType = this.pathType;
    this.selectedPath.drawingStyle = this.pathDrawingStyle;
    this.selectedPath.duration = this.pathDuration;
    this.selectedPath.color = this.pathColor;
    this.selectedPath.visibility = this.pathVisibility;
    this.selectedPath.controlPoints = [...this.pathControlPoints];

    this.cdr.markForCheck();
  }

  cancelPathDrawing(): void {
    this.isDrawingPath = false;
    this.pathStartPoint = null;
    this.pathControlPoints = [];
    this.handDrawnPoints = [];
  }

  startHandDrawnPath(event: MouseEvent): void {
    if (this.activeTool !== 'path') return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();

    // Convert mouse coordinates to SVG coordinates
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgCoords = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    event.preventDefault();
    event.stopPropagation();

    // Start collecting points for hand-drawn path
    this.handDrawnPoints = [{ x: svgCoords.x, y: svgCoords.y }];
    this.isDrawingPath = true;
  }

  finishHandDrawnPath(): void {
    if (this.handDrawnPoints.length < 2) {
      this.handDrawnPoints = [];
      this.isDrawingPath = false;
      return;
    }

    // Create path from hand-drawn points
    const newPath: IPath = {
      id: `path-${Date.now()}`,
      startPoint: this.handDrawnPoints[0],
      endPoint: this.handDrawnPoints[this.handDrawnPoints.length - 1],
      pathType: this.pathType,
      drawingStyle: this.pathDrawingStyle,
      duration: this.pathDuration,
      startTime: this.currentTime, // Start from current timeline position
      color: this.pathColor,
      visibility: this.pathVisibility,
      participants: [],
      controlPoints: this.handDrawnPoints
        .slice(1, -1)
        .map((p) => ({ x: p.x, y: p.y })),
    };

    // Auto-attach all selected players and ball
    this.selectedPlayers.forEach((playerId) => {
      if (playerId === 'soccer-ball') {
        newPath.participants.push({ objectId: playerId, objectType: 'ball' });
      } else {
        newPath.participants.push({
          objectId: playerId,
          objectType: 'player',
        });
      }
    });

    this.paths.push(newPath);
    this.selectedPath = newPath;

    // Capture keyframes at start and end of path
    const originalTime = this.currentTime;
    this.currentTime = newPath.startTime;
    this.captureKeyframe();
    this.currentTime = newPath.startTime + newPath.duration;
    this.captureKeyframe();
    this.currentTime = originalTime;

    this.saveState();

    this.handDrawnPoints = [];
    this.isDrawingPath = false;
  }

  generateHandDrawnPathPreview(): string {
    if (this.handDrawnPoints.length < 2) return '';

    let pathData = `M ${this.handDrawnPoints[0].x} ${this.handDrawnPoints[0].y}`;
    for (let i = 1; i < this.handDrawnPoints.length; i++) {
      pathData += ` L ${this.handDrawnPoints[i].x} ${this.handDrawnPoints[i].y}`;
    }
    return pathData;
  }

  generateHandDrawnPathFromControlPoints(path: IPath): string {
    // For hand-drawn paths, reconstruct the line from control points
    // controlPoints contains all intermediate points drawn by the user
    if (!path.controlPoints || path.controlPoints.length === 0) {
      // Fallback to straight line if no control points
      return `M ${path.startPoint.x} ${path.startPoint.y} L ${path.endPoint.x} ${path.endPoint.y}`;
    }

    // Start at the starting point
    let pathData = `M ${path.startPoint.x} ${path.startPoint.y}`;

    // Add line segments through all control points
    for (const cp of path.controlPoints) {
      pathData += ` L ${cp.x} ${cp.y}`;
    }

    // End at the ending point
    pathData += ` L ${path.endPoint.x} ${path.endPoint.y}`;

    return pathData;
  }

  getPathStrokeWidth(path: IPath): number {
    // Clear/punts get thicker lines for impact
    if (path.pathType === 'clear') return 3.5;
    // Crash paths are bold (group movement)
    if (path.pathType === 'crash') return 3;
    // Dribbles and runs are standard weight
    if (
      path.pathType.includes('dribble') ||
      path.pathType === 'run' ||
      path.pathType === 'attenuated-run' ||
      path.pathType === 'late-arriving'
    ) {
      return 2;
    }
    // Passes and shots are standard weight
    return 2;
  }

  getPathStrokeColor(path: IPath): string {
    // Runs are typically light blue/cyan
    if (path.pathType === 'run') return '#00BCD4';
    // Attenuated runs are faded (gradient handled in SVG)
    if (path.pathType === 'attenuated-run') return '#00BCD4';
    // Late-arriving runs (gray to color gradient)
    if (path.pathType === 'late-arriving') return '#00BCD4';
    // Crash paths are black to color gradient
    if (path.pathType === 'crash') return '#FF6B6B';

    // Passes are green
    if (path.pathType === 'normal-pass') return '#4CAF50';
    if (path.pathType === 'short-pass') return '#66BB6A';
    if (path.pathType === 'chip') return '#81C784';
    if (path.pathType === 'clear') return '#9CCC65';

    // Shots are red/orange
    if (path.pathType === 'drive') return '#FF5252';
    if (path.pathType === 'outside-hook') return '#FF7043';
    if (path.pathType === 'inside-hook') return '#FF8A65';
    if (path.pathType === 'knuckleball') return '#FFA726';
    if (path.pathType === 'dip') return '#FF6E40';

    // Dribbles are yellow/gold
    if (path.pathType === 'speed-dribble') return '#FFD700';
    if (path.pathType === 'gliding') return '#FFC107';
    if (path.pathType === 'contact-dribble') return '#FFCA28';

    return '#999999'; // default
  }

  isPathWithGradient(path: IPath): boolean {
    // These path types use SVG gradients for visual effect
    return (
      path.pathType === 'attenuated-run' ||
      path.pathType === 'late-arriving' ||
      path.pathType === 'crash'
    );
  }

  getGradientId(path: IPath): string {
    return `gradient-${path.id}`;
  }

  getPathStrokeAttribute(path: IPath): string {
    // Return URL to gradient if this path uses gradients, otherwise return color
    if (this.isPathWithGradient(path)) {
      return `url(#${this.getGradientId(path)})`;
    }
    return this.getPathStrokeColor(path);
  }

  getPathDasharray(path: IPath): string {
    // Short passes are short dashes
    if (path.pathType === 'short-pass') return '3,3';
    // Normal passes are longer dashes
    if (path.pathType === 'normal-pass') return '8,4';
    // Everything else is solid
    return 'none';
  }

  generateCurvedPath(path: IPath): string {
    // Generate a smooth quadratic bezier curve between start and end points
    // If control points are defined, use them; otherwise, create a default curve

    const { startPoint, endPoint } = path;
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (path.controlPoints && path.controlPoints.length > 0) {
      // Use existing control points
      let pathData = `M ${startPoint.x} ${startPoint.y}`;

      for (let i = 0; i < path.controlPoints.length; i++) {
        const cp = path.controlPoints[i];
        const nextPoint =
          i === path.controlPoints.length - 1
            ? endPoint
            : path.controlPoints[i + 1];
        pathData += ` Q ${cp.x} ${cp.y} ${nextPoint.x} ${nextPoint.y}`;
      }

      return pathData;
    } else {
      // Shots with curves
      if (path.pathType === 'outside-hook') {
        // Outside hook curves inward (right foot hook)
        const perpX = (dy / distance) * (distance * 0.4);
        const perpY = (-dx / distance) * (distance * 0.4);
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const controlX = midX + perpX;
        const controlY = midY + perpY;
        return `M ${startPoint.x} ${startPoint.y} Q ${controlX} ${controlY} ${endPoint.x} ${endPoint.y}`;
      } else if (path.pathType === 'inside-hook') {
        // Inside hook curves outward (left foot hook)
        const perpX = (-dy / distance) * (distance * 0.4);
        const perpY = (dx / distance) * (distance * 0.4);
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const controlX = midX + perpX;
        const controlY = midY + perpY;
        return `M ${startPoint.x} ${startPoint.y} Q ${controlX} ${controlY} ${endPoint.x} ${endPoint.y}`;
      } else if (path.pathType === 'dip') {
        // Dip shot: initial straight angle, then dips down at end
        const cp1X = startPoint.x + dx * 0.3;
        const cp1Y = startPoint.y + dy * 0.3;
        const cp2X = startPoint.x + dx * 0.7;
        const cp2Y = startPoint.y + dy * 0.7 + distance * 0.35; // Dips down
        return `M ${startPoint.x} ${startPoint.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endPoint.x} ${endPoint.y}`;
      } else if (path.pathType === 'knuckleball') {
        // Knuckleball: squiggly/wavy trajectory
        return this.generateSquigglyPath(startPoint, endPoint, 4, 0.15);
      } else if (path.pathType === 'gliding') {
        // Gliding/taking space: long winding curves
        return this.generateWindingPath(startPoint, endPoint, 6, 0.35);
      } else if (path.pathType === 'contact-dribble') {
        // Contact dribble: short squiggly/lightning-like pattern
        return this.generateSquigglyPath(startPoint, endPoint, 7, 0.08);
      } else if (path.pathType === 'speed-dribble') {
        // Speed dribble: relatively straight
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const perpX = (-dy / distance) * (distance * 0.15);
        const perpY = (dx / distance) * (distance * 0.15);
        const controlX = midX + perpX;
        const controlY = midY + perpY;
        return `M ${startPoint.x} ${startPoint.y} Q ${controlX} ${controlY} ${endPoint.x} ${endPoint.y}`;
      } else {
        // Default curve with moderate perpendicular offset
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const perpX = (-dy / distance) * (distance * 0.3);
        const perpY = (dx / distance) * (distance * 0.3);
        const controlX = midX + perpX;
        const controlY = midY + perpY;
        return `M ${startPoint.x} ${startPoint.y} Q ${controlX} ${controlY} ${endPoint.x} ${endPoint.y}`;
      }
    }
  }

  generateSquigglyPath(
    start: IPathPoint,
    end: IPathPoint,
    segments: number,
    amplitude: number
  ): string {
    // Create a squiggly/wavy line by generating multiple control points
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular direction
    const perpX = -dy / distance;
    const perpY = dx / distance;

    let pathData = `M ${start.x} ${start.y}`;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const baseX = start.x + dx * t;
      const baseY = start.y + dy * t;

      // Oscillate perpendicular to the main path
      const offset =
        amplitude * distance * Math.sin((i / segments) * Math.PI * 3);
      const cpX = baseX + perpX * offset;
      const cpY = baseY + perpY * offset;

      // Create segment to next point
      const nextT = (i + 1) / segments;
      const nextBaseX = start.x + dx * nextT;
      const nextBaseY = start.y + dy * nextT;
      const nextOffset =
        amplitude * distance * Math.sin(((i + 1) / segments) * Math.PI * 3);
      const nextCpX = nextBaseX + perpX * nextOffset;
      const nextCpY = nextBaseY + perpY * nextOffset;

      pathData += ` Q ${cpX} ${cpY} ${nextCpX} ${nextCpY}`;
    }

    return pathData;
  }

  generateWindingPath(
    start: IPathPoint,
    end: IPathPoint,
    segments: number,
    amplitude: number
  ): string {
    // Create a winding/curving line with smooth curves
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular direction
    const perpX = -dy / distance;
    const perpY = dx / distance;

    let pathData = `M ${start.x} ${start.y}`;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const baseX = start.x + dx * t;
      const baseY = start.y + dy * t;

      // Create smoother sine wave for winding effect
      const offset =
        amplitude * distance * Math.sin((i / segments) * Math.PI * 2);
      const cpX = baseX + perpX * offset;
      const cpY = baseY + perpY * offset;

      // Curve to this control point
      pathData += ` Q ${cpX} ${cpY} ${cpX} ${cpY}`;
    }

    pathData += ` L ${end.x} ${end.y}`;
    return pathData;
  }

  generateArcPath(path: IPath): string {
    // Generate an arc path for chip/clear passes to show lofted trajectory
    const { startPoint, endPoint } = path;
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Clear passes get higher arc (0.8) vs chip (0.5)
    const arcRadius =
      path.pathType === 'clear' ? distance * 0.8 : distance * 0.5;
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;

    // Create arc path using cubic bezier
    const cpX1 = startPoint.x + dx * 0.25;
    const cpY1 = startPoint.y + dy * 0.25 - arcRadius;
    const cpX2 = startPoint.x + dx * 0.75;
    const cpY2 = startPoint.y + dy * 0.75 - arcRadius;

    return `M ${startPoint.x} ${startPoint.y} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endPoint.x} ${endPoint.y}`;
  }

  getPathColor(path: IPath): string {
    // Shots are red
    if (path.pathType.includes('shot')) return '#FF0000';
    // Return the path's own color
    return path.color;
  }

  // Calculate a point along a path at a given progress (0 to 1)
  getPointAlongPath(path: IPath, progress: number): IPathPoint {
    // Clamp progress to 0-1
    const t = Math.max(0, Math.min(1, progress));

    const { startPoint, endPoint } = path;
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // For straight paths, simple linear interpolation
    if (
      path.drawingStyle === 'straight' &&
      (!path.controlPoints || path.controlPoints.length === 0)
    ) {
      return {
        x: startPoint.x + dx * t,
        y: startPoint.y + dy * t,
      };
    }

    // For hand-drawn paths, interpolate through all waypoints (control points)
    if (
      path.drawingStyle === 'hand-drawn' &&
      path.controlPoints &&
      path.controlPoints.length > 0
    ) {
      // Build complete waypoint list: start + all control points + end
      const waypoints = [startPoint, ...path.controlPoints, endPoint];

      // Find which segment we're in
      const segmentCount = waypoints.length - 1;
      const segmentProgress = t * segmentCount;
      const segmentIndex = Math.floor(segmentProgress);
      const localProgress = segmentProgress - segmentIndex;

      // Clamp segment index
      const safeSegmentIndex = Math.min(segmentIndex, segmentCount - 1);
      const p1 = waypoints[safeSegmentIndex];
      const p2 = waypoints[safeSegmentIndex + 1];

      // Linear interpolation between the two waypoints
      return {
        x: p1.x + (p2.x - p1.x) * localProgress,
        y: p1.y + (p2.y - p1.y) * localProgress,
      };
    }

    // For curved paths, use quadratic bezier interpolation
    // Get control points
    let controlPoints = path.controlPoints || [];

    // If no control points defined, create default ones based on path type
    if (controlPoints.length === 0) {
      const perpX = (-dy / distance) * (distance * 0.3);
      const perpY = (dx / distance) * (distance * 0.3);
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;
      controlPoints = [
        {
          x: midX + perpX,
          y: midY + perpY,
        },
      ];
    }

    // Simple quadratic bezier with first control point
    if (controlPoints.length === 1) {
      const cp = controlPoints[0];
      // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)t CP + t²P1
      const mt = 1 - t;
      const x = mt * mt * startPoint.x + 2 * mt * t * cp.x + t * t * endPoint.x;
      const y = mt * mt * startPoint.y + 2 * mt * t * cp.y + t * t * endPoint.y;
      return { x, y };
    }

    // For multiple control points, use piecewise bezier interpolation
    // Divide the progress across multiple segments
    const segments = controlPoints.length;
    const segmentProgress = t * segments;
    const segmentIndex = Math.floor(segmentProgress);
    const localProgress = segmentProgress - segmentIndex;

    const segStart =
      segmentIndex === 0 ? startPoint : controlPoints[segmentIndex - 1];
    const segEnd =
      segmentIndex < controlPoints.length
        ? controlPoints[segmentIndex]
        : endPoint;
    const segCP = controlPoints[segmentIndex] || endPoint;

    // Quadratic bezier for this segment
    const mt = 1 - localProgress;
    const x =
      mt * mt * segStart.x +
      2 * mt * localProgress * segCP.x +
      localProgress * localProgress * segEnd.x;
    const y =
      mt * mt * segStart.y +
      2 * mt * localProgress * segCP.y +
      localProgress * localProgress * segEnd.y;

    return { x, y };
  }

  startEditingControlPoint(
    event: MouseEvent,
    path: IPath,
    cpIndex: number
  ): void {
    if (!this.selectedPath || this.selectedPath.id !== path.id) return;

    event.preventDefault();
    event.stopPropagation();

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (path.controlPoints && path.controlPoints[cpIndex]) {
        path.controlPoints[cpIndex].x = x;
        path.controlPoints[cpIndex].y = y;
        this.cdr.markForCheck();
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.updateSelectedPath();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  startEditingEndpoint(
    event: MouseEvent,
    path: IPath,
    endpoint: 'start' | 'end'
  ): void {
    if (!this.selectedPath || this.selectedPath.id !== path.id) return;

    event.preventDefault();
    event.stopPropagation();

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (endpoint === 'start') {
        path.startPoint.x = x;
        path.startPoint.y = y;
      } else {
        path.endPoint.x = x;
        path.endPoint.y = y;
      }
      this.cdr.markForCheck();
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.updateSelectedPath();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  getStrokeDasharray(): string {
    switch (this.shapeStrokeDasharray) {
      case 'dotted':
        return '2,2';
      case 'dashed':
        return '5,5';
      case 'tiny-dashed':
        return '3,3';
      default:
        return '';
    }
  }

  getTextStyle(shape: IDrawingShape): string {
    if (shape.type !== 'text') return '';

    let style = `font-family: ${shape.fontFamily || 'Arial'}; font-size: ${
      shape.fontSize || 16
    }px; color: ${shape.textColor || '#ffffff'}; `;
    if (shape.fontWeight) style += `font-weight: ${shape.fontWeight}; `;
    if (shape.fontStyle) style += `font-style: ${shape.fontStyle}; `;
    if (shape.textDecoration)
      style += `text-decoration: ${shape.textDecoration};`;

    return style;
  }

  getShapeTransform(shape: IDrawingShape): string {
    const originX = shape.x + (shape.width || 0) / 2;
    const originY = shape.y + (shape.height || 0) / 2;
    return `translate(${originX}, ${originY}) rotate(${
      shape.rotation || 0
    }) translate(${-(shape.width || 0) / 2}, ${-(shape.height || 0) / 2})`;
  }

  rotateShape(degrees: number): void {
    if (!this.selectedShape) return;
    this.selectedShape.rotation =
      ((this.selectedShape.rotation || 0) + degrees) % 360;
  }

  resizeShape(widthDelta: number, heightDelta: number): void {
    if (
      !this.selectedShape ||
      !this.selectedShape.width ||
      !this.selectedShape.height
    )
      return;
    this.selectedShape.width = Math.max(
      10,
      this.selectedShape.width + widthDelta
    );
    this.selectedShape.height = Math.max(
      10,
      this.selectedShape.height + heightDelta
    );
  }

  // Shape Handle Methods
  startMoveShape(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.selectedShape) return;

    this.isMoving = true;
    this.moveStartX = event.clientX;
    this.moveStartY = event.clientY;

    // Store original position
    this.originalShapeState = {
      x: this.selectedShape.x,
      y: this.selectedShape.y,
    };

    // Create and store bound functions for proper cleanup
    this.boundMoveMove = this.onMoveShapeMove.bind(this);
    this.boundMoveUp = this.onMoveShapeUp.bind(this);

    document.addEventListener('mousemove', this.boundMoveMove);
    document.addEventListener('mouseup', this.boundMoveUp);
  }

  onMoveShapeMove(event: MouseEvent): void {
    if (!this.isMoving || !this.selectedShape || !this.originalShapeState)
      return;

    const deltaX = event.clientX - this.moveStartX;
    const deltaY = event.clientY - this.moveStartY;

    this.selectedShape.x = (this.originalShapeState.x as number) + deltaX;
    this.selectedShape.y = (this.originalShapeState.y as number) + deltaY;

    // Update position label
    this.updatePositionLabels();
  }

  updatePositionLabels(): void {
    // Check if dragging a single player or ball (during move operation)
    if (this.isMoving && this.selectedShape) {
      // Single shape (player or ball)
      const x = Math.round(this.selectedShape.x);
      const y = Math.round(this.selectedShape.y);

      // Determine if this is a player and which team
      const player = this.players.find((p) => p.id === this.selectedShape?.id);
      if (player) {
        if (player.team === 'home') {
          this.homePositionLabel = `${player.number}: (${x}, ${y})`;
          this.lastMovedTeam = 'home';
        } else {
          this.awayPositionLabel = `${player.number}: (${x}, ${y})`;
          this.lastMovedTeam = 'away';
        }
      } else {
        // Ball
        const label = `Ball: (${x}, ${y})`;
        this.homePositionLabel = label;
        this.awayPositionLabel = label;
      }
    } else if (this.blockMovementEnabled && this.blockMovementIsDown) {
      // Block of players being moved
      const blockPlayers = this.getBlockPlayersExcludeGK(
        this.blockMovementActive
      );
      const gk = this.players.find(
        (p) => p.team === this.blockMovementActive && p.number === 1
      );

      // Include GK in bounds
      const allPlayers = [...blockPlayers, ...(gk ? [gk] : [])];

      if (allPlayers.length > 0) {
        const minX = Math.min(...allPlayers.map((p) => p.x));
        const minY = Math.min(...allPlayers.map((p) => p.y));
        const maxX = Math.max(...allPlayers.map((p) => p.x));
        const maxY = Math.max(...allPlayers.map((p) => p.y));
        const width = Math.round(maxX - minX);
        const height = Math.round(maxY - minY);

        const label = `[${Math.round(minX)}, ${Math.round(
          minY
        )}] to [${Math.round(maxX)}, ${Math.round(maxY)}] = ${width}x${height}`;

        if (this.blockMovementActive === 'home') {
          this.homePositionLabel = label;
          this.lastMovedTeam = 'home';
        } else {
          this.awayPositionLabel = label;
          this.lastMovedTeam = 'away';
        }
      }
    }
  }

  onMoveShapeUp(event: MouseEvent): void {
    if (this.isMoving) {
      this.isMoving = false;
      this.originalShapeState = null;

      // Remove document-level listeners
      if (this.boundMoveMove) {
        document.removeEventListener('mousemove', this.boundMoveMove);
        this.boundMoveMove = null;
      }
      if (this.boundMoveUp) {
        document.removeEventListener('mouseup', this.boundMoveUp);
        this.boundMoveUp = null;
      }

      if (this.isRecording && this.selectedShape) {
        this.captureKeyframe();
      }
    }
  }

  startResizeHandle(handle: string, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.selectedShape) return;

    // Text shapes can only rotate, not resize
    if (this.selectedShape.type === 'text') return;

    // Check if Shift key is held to activate rotation mode
    const rotationMode = event.shiftKey;

    if (rotationMode) {
      // Rotation mode
      this.isRotating = true;
      const svg = this.svgContainer.nativeElement;
      const rect = svg.getBoundingClientRect();

      this.rotateStartX = event.clientX - rect.left;
      this.rotateStartY = event.clientY - rect.top;

      // Store original rotation
      this.originalShapeState = {
        rotation: this.selectedShape.rotation || 0,
      };

      // Create and store bound functions for proper cleanup
      this.boundRotateMove = this.onRotateHandleMove.bind(this);
      this.boundRotateUp = this.onRotateHandleUp.bind(this);

      document.addEventListener('mousemove', this.boundRotateMove);
      document.addEventListener('mouseup', this.boundRotateUp);
    } else {
      // Resize mode
      this.isResizing = true;
      this.resizeHandle = handle;
      this.resizeStartX = event.clientX;
      this.resizeStartY = event.clientY;

      // Store original shape state
      this.originalShapeState = {
        x: this.selectedShape.x,
        y: this.selectedShape.y,
        width: this.selectedShape.width,
        height: this.selectedShape.height,
      };

      // Create and store bound functions for proper cleanup
      this.boundResizeMove = this.onResizeHandleMove.bind(this);
      this.boundResizeUp = this.onResizeHandleUp.bind(this);

      // Add document-level mouse move and up listeners
      document.addEventListener('mousemove', this.boundResizeMove);
      document.addEventListener('mouseup', this.boundResizeUp);
    }
  }

  onResizeHandleMove(event: MouseEvent): void {
    if (!this.isResizing || !this.selectedShape || !this.originalShapeState)
      return;

    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;

    const origX = this.originalShapeState.x || 0;
    const origY = this.originalShapeState.y || 0;
    const origW = this.originalShapeState.width || 0;
    const origH = this.originalShapeState.height || 0;

    // Apply resize based on which handle is being dragged
    switch (this.resizeHandle) {
      case 'top-left':
        this.selectedShape.x = origX + deltaX;
        this.selectedShape.y = origY + deltaY;
        this.selectedShape.width = Math.max(10, origW - deltaX);
        this.selectedShape.height = Math.max(10, origH - deltaY);
        break;
      case 'top-center':
        this.selectedShape.y = origY + deltaY;
        this.selectedShape.height = Math.max(10, origH - deltaY);
        break;
      case 'top-right':
        this.selectedShape.y = origY + deltaY;
        this.selectedShape.width = Math.max(10, origW + deltaX);
        this.selectedShape.height = Math.max(10, origH - deltaY);
        break;
      case 'middle-right':
        this.selectedShape.width = Math.max(10, origW + deltaX);
        break;
      case 'bottom-right':
        this.selectedShape.width = Math.max(10, origW + deltaX);
        this.selectedShape.height = Math.max(10, origH + deltaY);
        break;
      case 'bottom-center':
        this.selectedShape.height = Math.max(10, origH + deltaY);
        break;
      case 'bottom-left':
        this.selectedShape.x = origX + deltaX;
        this.selectedShape.width = Math.max(10, origW - deltaX);
        this.selectedShape.height = Math.max(10, origH + deltaY);
        break;
      case 'middle-left':
        this.selectedShape.x = origX + deltaX;
        this.selectedShape.width = Math.max(10, origW - deltaX);
        break;
    }
  }

  onResizeHandleUp(event: MouseEvent): void {
    if (this.isResizing) {
      this.isResizing = false;
      this.resizeHandle = null;
      this.originalShapeState = null;

      // Remove document-level listeners
      if (this.boundResizeMove) {
        document.removeEventListener('mousemove', this.boundResizeMove);
        this.boundResizeMove = null;
      }
      if (this.boundResizeUp) {
        document.removeEventListener('mouseup', this.boundResizeUp);
        this.boundResizeUp = null;
      }

      if (this.isRecording && this.selectedShape) {
        this.captureKeyframe();
      }
    }
  }

  onRotateHandleMove(event: MouseEvent): void {
    if (!this.isRotating || !this.selectedShape || !this.originalShapeState)
      return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();

    // Center of shape
    const centerX = this.selectedShape.x + (this.selectedShape.width || 0) / 2;
    const centerY = this.selectedShape.y + (this.selectedShape.height || 0) / 2;

    // Vector from center to current mouse position
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    const currentAngle =
      Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);

    // Vector from center to initial mouse position (rotateStartX/Y are already rect-relative)
    const initialAngle =
      Math.atan2(this.rotateStartY - centerY, this.rotateStartX - centerX) *
      (180 / Math.PI);

    // Calculate rotation delta
    const angleDelta = currentAngle - initialAngle;
    const originalRotation = (this.originalShapeState.rotation as number) || 0;

    this.selectedShape.rotation = (originalRotation + angleDelta) % 360;
  }

  rotateStart(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.selectedShape) return;

    this.isRotating = true;
    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();

    this.rotateStartX = event.clientX - rect.left;
    this.rotateStartY = event.clientY - rect.top;

    // Store original rotation
    this.originalShapeState = {
      rotation: this.selectedShape.rotation || 0,
    };

    // Create and store bound functions for proper cleanup
    this.boundRotateMove = this.onRotateHandleMove.bind(this);
    this.boundRotateUp = this.onRotateHandleUp.bind(this);

    document.addEventListener('mousemove', this.boundRotateMove);
    document.addEventListener('mouseup', this.boundRotateUp);
  }

  onRotateHandleUp(event: MouseEvent): void {
    if (this.isRotating) {
      this.isRotating = false;
      this.originalShapeState = null;

      // Remove document-level listeners
      if (this.boundRotateMove) {
        document.removeEventListener('mousemove', this.boundRotateMove);
        this.boundRotateMove = null;
      }
      if (this.boundRotateUp) {
        document.removeEventListener('mouseup', this.boundRotateUp);
        this.boundRotateUp = null;
      }

      if (this.isRecording && this.selectedShape) {
        this.captureKeyframe();
      }
    }
  }

  openTextPropertiesDialog(): void {
    this.showTextPropertiesDialog = true;
  }

  closeTextPropertiesDialog(): void {
    this.showTextPropertiesDialog = false;
    this.textContent = '';
    this.textFontFamily = 'Arial';
    this.textFontSize = 16;
    this.textFontWeight = 'normal';
    this.textFontStyle = 'normal';
    this.textDecoration = 'none';
    this.textColor = '#ffffff';
  }

  openShapePropertiesDialog(): void {
    if (this.selectedShape && this.selectedShape.type !== 'text') {
      this.showShapePropertiesDialog = true;
    }
  }

  closeShapePropertiesDialog(): void {
    this.showShapePropertiesDialog = false;
  }

  // Block Density Tool Methods
  getBlockPlayersExcludeGK(team: 'home' | 'away'): IMiniMatchPlayer[] {
    return this.players.filter((p) => p.team === team && p.number !== 1);
  }

  applyBlockDensity(team: 'home' | 'away'): void {
    const blockPlayers = this.getBlockPlayersExcludeGK(team);
    if (blockPlayers.length === 0) return;

    const densityValue =
      team === 'home' ? this.homeBlockDensityValue : this.awayBlockDensityValue;
    const densityDimension =
      team === 'home'
        ? this.homeBlockDensityDimension
        : this.awayBlockDensityDimension;
    const originalPositionsMap =
      team === 'home'
        ? this.homeBlockDensityOriginalPositions
        : this.awayBlockDensityOriginalPositions;

    // Store original positions if not already stored (first time)
    if (originalPositionsMap.size === 0) {
      blockPlayers.forEach((player) => {
        originalPositionsMap.set(player.id, {
          x: player.x,
          y: player.y,
        });
      });
    }

    // Get original positions for calculation
    const originalPositions = Array.from(originalPositionsMap.entries())
      .filter(([id]) => blockPlayers.some((p) => p.id === id))
      .map(([, pos]) => pos);

    // Calculate center of original positions
    const avgX =
      originalPositions.reduce((sum, p) => sum + p.x, 0) /
      originalPositions.length;
    const avgY =
      originalPositions.reduce((sum, p) => sum + p.y, 0) /
      originalPositions.length;

    // Apply compression based on selected dimension and density value
    const compressionFactor = densityValue / 100; // 0 to 1

    blockPlayers.forEach((player) => {
      const originalPos = originalPositionsMap.get(player.id);
      if (!originalPos) return;

      const originalX = originalPos.x;
      const originalY = originalPos.y;

      if (densityDimension === 'vertical' || densityDimension === 'both') {
        // Move toward center Y
        player.y = originalY + (avgY - originalY) * compressionFactor;
      }

      if (densityDimension === 'horizontal' || densityDimension === 'both') {
        // Move toward center X
        player.x = originalX + (avgX - originalX) * compressionFactor;
      }

      gsap.set(`#${player.id}`, { x: player.x, y: player.y });
    });

    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Block Movement Tool Methods
  toggleBlockMovement(): void {
    this.blockMovementEnabled = !this.blockMovementEnabled;
    this.blockMovementOffsets.clear();
    this.blockMovementIsDown = false;
  }

  onBlockMovementMouseDown(event: MouseEvent): void {
    if (!this.blockMovementEnabled) return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();
    this.blockMovementStartX = event.clientX - rect.left;
    this.blockMovementStartY = event.clientY - rect.top;
    this.blockMovementIsDown = true;

    // Capture initial positions on mousedown
    if (this.blockMovementOffsets.size === 0) {
      this.getBlockPlayersExcludeGK(this.blockMovementActive).forEach(
        (player) => {
          this.blockMovementOffsets.set(player.id, {
            x: player.x,
            y: player.y,
          });
        }
      );
    }
  }

  onBlockMovementMouseMove(event: MouseEvent): void {
    if (!this.blockMovementEnabled || !this.blockMovementIsDown) return;

    const svg = this.svgContainer.nativeElement;
    const rect = svg.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const deltaX = currentX - this.blockMovementStartX;
    const deltaY = currentY - this.blockMovementStartY;

    // Move all block players (except GK) by the delta
    this.getBlockPlayersExcludeGK(this.blockMovementActive).forEach(
      (player) => {
        const originalPos = this.blockMovementOffsets.get(player.id);
        if (originalPos) {
          player.x = originalPos.x + deltaX;
          player.y = originalPos.y + deltaY;
          gsap.set(`#${player.id}`, { x: player.x, y: player.y });
        }
      }
    );

    // Update position labels for the block
    this.updatePositionLabels();
  }

  onBlockMovementMouseUp(event: MouseEvent): void {
    if (!this.blockMovementEnabled || !this.blockMovementIsDown) return;

    this.blockMovementIsDown = false;

    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Block Height Tool Methods

  // Field is 1000 pixels tall, divided into 12 rows of ~83.33 pixels each
  getRowYPosition(rowNumber: number): number {
    const rowHeight = this.fieldHeight / 12;
    return (rowNumber - 1) * rowHeight;
  }

  getRowEndYPosition(rowNumber: number): number {
    const rowHeight = this.fieldHeight / 12;
    return rowNumber * rowHeight;
  }

  setBlockHeight(): void {
    const blockPlayers = this.getBlockPlayersExcludeGK(this.blockHeightActive);
    const gk = this.players.find(
      (p) => p.team === this.blockHeightActive && p.number === 1
    );
    if (blockPlayers.length === 0) return;

    // Define rows for each block type and team
    let blockRows: { start: number; end: number };
    let gkRow: number;

    if (this.blockHeightType === 'bus') {
      // Parking the bus formation - special handling with 2 rows of 5 players
      if (this.blockHeightActive === 'home') {
        blockRows = { start: 2, end: 4 };
        gkRow = 1;
      } else {
        // Away team: defending the bottom, goal line is section 12
        blockRows = { start: 9, end: 11 };
        gkRow = 12;
      }

      // Two-row formation for parking the bus: 5 players in each row
      // Middle 3/5ths of field horizontally
      const fieldWidth = 660;
      const middleThirdWidth = (fieldWidth * 3) / 5; // 396 pixels
      const leftEdge = (fieldWidth - middleThirdWidth) / 2; // 132 pixels
      const rightEdge = leftEdge + middleThirdWidth; // 528 pixels

      // 5 players distributed evenly across the width (6 segments, 5 players)
      const segmentWidth = middleThirdWidth / 6;
      const xPositions = [
        leftEdge + segmentWidth * 1,
        leftEdge + segmentWidth * 2,
        leftEdge + segmentWidth * 3,
        leftEdge + segmentWidth * 4,
        leftEdge + segmentWidth * 5,
      ];

      // Vertical positioning: 2 rows within the block height
      const blockStartY = this.getRowYPosition(blockRows.start);
      const blockEndY = this.getRowEndYPosition(blockRows.end);
      const row1Y = blockStartY + (blockEndY - blockStartY) / 4;
      const row2Y = blockStartY + (3 * (blockEndY - blockStartY)) / 4;

      // First 5 players go to row 1, next 5 to row 2
      blockPlayers.slice(0, 5).forEach((player, index) => {
        player.x = xPositions[index];
        player.y = row1Y;
        gsap.set(`#${player.id}`, { x: player.x, y: player.y });
      });

      blockPlayers.slice(5).forEach((player, index) => {
        player.x = xPositions[index];
        player.y = row2Y;
        gsap.set(`#${player.id}`, { x: player.x, y: player.y });
      });

      // Move goalkeeper to GK row (goal line)
      if (gk) {
        gk.y = this.getRowYPosition(gkRow);
        gsap.set(`#${gk.id}`, { x: gk.x, y: gk.y });
      }
    } else if (this.blockHeightType === 'high') {
      if (this.blockHeightActive === 'home') {
        // Home high block: defending top, push toward opponent (sections 7-10)
        blockRows = { start: 7, end: 10 };
        gkRow = 1;
      } else {
        // Away high block: defending bottom, push toward opponent (sections 3-6)
        blockRows = { start: 3, end: 6 };
        gkRow = 10;
      }

      if (this.enforceBlockStrictness) {
        // Compress players vertically to fit within block rows
        const blockStartY = this.getRowYPosition(blockRows.start);
        const blockEndY = this.getRowEndYPosition(blockRows.end);
        const blockHeight = blockEndY - blockStartY;

        // Calculate current block bounds (excluding GK)
        let minY = Math.min(...blockPlayers.map((p) => p.y));
        let maxY = Math.max(...blockPlayers.map((p) => p.y));
        const currentBlockHeight = maxY - minY;

        if (currentBlockHeight > 0) {
          // Scale factor to fit into new block height
          const scaleFactor = blockHeight / currentBlockHeight;

          // Move players to new block area with compression
          blockPlayers.forEach((player) => {
            const relativeY = player.y - minY;
            player.y = blockStartY + relativeY * scaleFactor;
            gsap.set(`#${player.id}`, { x: player.x, y: player.y });
          });
        }
      } else {
        // Without strictness, just move formation so furthest player ends at block boundary
        let targetY = this.getRowYPosition(blockRows.start);
        let referencePlayer: IMiniMatchPlayer | null = null;

        if (this.blockHeightActive === 'home') {
          // Home: find lowest y (highest on field)
          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y < prev.y ? current : prev
          );
        } else {
          // Away: find highest y (lowest on field)
          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y < prev.y ? current : prev
          );
        }

        if (referencePlayer) {
          const yOffset = targetY - referencePlayer.y;
          blockPlayers.forEach((player) => {
            player.y += yOffset;
            gsap.set(`#${player.id}`, { x: player.x, y: player.y });
          });
        }
      }

      // Move goalkeeper to GK row
      if (gk) {
        gk.y = this.getRowYPosition(gkRow);
        gsap.set(`#${gk.id}`, { x: gk.x, y: gk.y });
      }
    } else if (this.blockHeightType === 'mid') {
      if (this.blockHeightActive === 'home') {
        // Home mid block: sections 5-8
        blockRows = { start: 5, end: 8 };
        gkRow = 1;
      } else {
        // Away mid block: sections 5-8
        blockRows = { start: 5, end: 8 };
        gkRow = 10;
      }

      if (this.enforceBlockStrictness) {
        // Compress players vertically to fit within block rows
        const blockStartY = this.getRowYPosition(blockRows.start);
        const blockEndY = this.getRowEndYPosition(blockRows.end);
        const blockHeight = blockEndY - blockStartY;

        // Calculate current block bounds (excluding GK)
        let minY = Math.min(...blockPlayers.map((p) => p.y));
        let maxY = Math.max(...blockPlayers.map((p) => p.y));
        const currentBlockHeight = maxY - minY;

        if (currentBlockHeight > 0) {
          // Scale factor to fit into new block height
          const scaleFactor = blockHeight / currentBlockHeight;

          // Move players to new block area with compression
          blockPlayers.forEach((player) => {
            const relativeY = player.y - minY;
            player.y = blockStartY + relativeY * scaleFactor;
            gsap.set(`#${player.id}`, { x: player.x, y: player.y });
          });
        }
      } else {
        // Without strictness, just move formation so furthest player ends at block boundary
        let targetY = this.getRowYPosition(blockRows.start);
        let referencePlayer: IMiniMatchPlayer | null = null;

        if (this.blockHeightActive === 'home') {
          // Home: find lowest y (highest on field)
          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y < prev.y ? current : prev
          );
        } else {
          // Away: find highest y (lowest on field)
          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y < prev.y ? current : prev
          );
        }

        if (referencePlayer) {
          const yOffset = targetY - referencePlayer.y;
          blockPlayers.forEach((player) => {
            player.y += yOffset;
            gsap.set(`#${player.id}`, { x: player.x, y: player.y });
          });
        }
      }

      // Move goalkeeper to GK row
      if (gk) {
        gk.y = this.getRowYPosition(gkRow);
        gsap.set(`#${gk.id}`, { x: gk.x, y: gk.y });
      }
    } else if (this.blockHeightType === 'low') {
      if (this.blockHeightActive === 'home') {
        // Home low block: GK at Y=40, players 2-11 between Y=200-350
        // Set GK position
        if (gk) {
          gk.y = 40;
          gsap.set(`#${gk.id}`, { x: gk.x, y: gk.y });
        }

        // Position block players (2-11) between Y=200-350
        const blockMinY = 200;
        const blockMaxY = 350;
        const blockHeight = blockMaxY - blockMinY;

        if (this.enforceBlockStrictness) {
          // Compress players vertically to fit within Y=200-350
          let minY = Math.min(...blockPlayers.map((p) => p.y));
          let maxY = Math.max(...blockPlayers.map((p) => p.y));
          const currentBlockHeight = maxY - minY;

          if (currentBlockHeight > 0) {
            const scaleFactor = blockHeight / currentBlockHeight;
            blockPlayers.forEach((player) => {
              const relativeY = player.y - minY;
              player.y = blockMinY + relativeY * scaleFactor;
              gsap.set(`#${player.id}`, { x: player.x, y: player.y });
            });
          }
        } else {
          // Without strictness, scale formation to fit Y=200-350
          let minY = Math.min(...blockPlayers.map((p) => p.y));
          let maxY = Math.max(...blockPlayers.map((p) => p.y));
          const currentBlockHeight = maxY - minY;

          if (currentBlockHeight > 0) {
            const scaleFactor = blockHeight / currentBlockHeight;
            blockPlayers.forEach((player) => {
              const relativeY = player.y - minY;
              player.y = blockMinY + relativeY * scaleFactor;
              gsap.set(`#${player.id}`, { x: player.x, y: player.y });
            });
          }
        }
      } else {
        // Away low block: GK at Y=960, players 7-11 + 2-6 between Y=650-800
        blockRows = { start: 8, end: 9 };
        gkRow = 12;

        if (this.enforceBlockStrictness) {
          const blockStartY = this.getRowYPosition(blockRows.start);
          const blockEndY = this.getRowEndYPosition(blockRows.end);
          const blockHeight = blockEndY - blockStartY;

          let minY = Math.min(...blockPlayers.map((p) => p.y));
          let maxY = Math.max(...blockPlayers.map((p) => p.y));
          const currentBlockHeight = maxY - minY;

          if (currentBlockHeight > 0) {
            const scaleFactor = blockHeight / currentBlockHeight;
            blockPlayers.forEach((player) => {
              const relativeY = player.y - minY;
              player.y = blockStartY + relativeY * scaleFactor;
              gsap.set(`#${player.id}`, { x: player.x, y: player.y });
            });
          }
        } else {
          let targetY = this.getRowYPosition(blockRows.start);
          let referencePlayer: IMiniMatchPlayer | null = null;

          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y < prev.y ? current : prev
          );

          if (referencePlayer) {
            const yOffset = targetY - referencePlayer.y;
            blockPlayers.forEach((player) => {
              player.y += yOffset;
              gsap.set(`#${player.id}`, { x: player.x, y: player.y });
            });
          }
        }

        if (gk) {
          gk.y = this.getRowYPosition(gkRow);
          gsap.set(`#${gk.id}`, { x: gk.x, y: gk.y });
        }
      }
    } else {
      // Mid block
      blockRows = { start: 5, end: 8 };
      gkRow = this.blockHeightActive === 'home' ? 2 : 10;

      if (this.enforceBlockStrictness) {
        // Compress players vertically to fit within block rows
        const blockStartY = this.getRowYPosition(blockRows.start);
        const blockEndY = this.getRowEndYPosition(blockRows.end);
        const blockHeight = blockEndY - blockStartY;

        // Calculate current block bounds (excluding GK)
        let minY = Math.min(...blockPlayers.map((p) => p.y));
        let maxY = Math.max(...blockPlayers.map((p) => p.y));
        const currentBlockHeight = maxY - minY;

        if (currentBlockHeight > 0) {
          // Scale factor to fit into new block height
          const scaleFactor = blockHeight / currentBlockHeight;

          // Move players to new block area with compression
          blockPlayers.forEach((player) => {
            const relativeY = player.y - minY;
            player.y = blockStartY + relativeY * scaleFactor;
            gsap.set(`#${player.id}`, { x: player.x, y: player.y });
          });
        }
      } else {
        // Without strictness, just move formation so furthest player ends at block boundary
        const targetY = this.getRowYPosition(blockRows.start);
        let referencePlayer: IMiniMatchPlayer | null = null;

        if (this.blockHeightActive === 'home') {
          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y < prev.y ? current : prev
          );
        } else {
          referencePlayer = blockPlayers.reduce((prev, current) =>
            current.y > prev.y ? current : prev
          );
        }

        if (referencePlayer) {
          const yOffset = targetY - referencePlayer.y;
          blockPlayers.forEach((player) => {
            player.y += yOffset;
            gsap.set(`#${player.id}`, { x: player.x, y: player.y });
          });
        }
      }

      // Move goalkeeper to GK row
      if (gk) {
        gk.y = this.getRowYPosition(gkRow);
        gsap.set(`#${gk.id}`, { x: gk.x, y: gk.y });
      }
    }

    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Multi-node selection and connection methods
  togglePlayerSelection(player: IMiniMatchPlayer, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedPlayers.has(player.id)) {
      this.selectedPlayers.delete(player.id);
    } else {
      this.selectedPlayers.add(player.id);
    }

    // If no selections remain, close modifiers and disable path/connect tools
    if (this.selectedPlayers.size === 0) {
      if (this.activeTool === 'path' || this.activeTool === 'connect') {
        this.activateMainTool('select');
      }
      this.showConnectionTools = false;
    }
  }

  isPlayerSelected(player: IMiniMatchPlayer): boolean {
    return this.selectedPlayers.has(player.id);
  }

  toggleBallSelection(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedPlayers.has('soccer-ball')) {
      this.selectedPlayers.delete('soccer-ball');
    } else {
      this.selectedPlayers.add('soccer-ball');
    }

    // If no selections remain, close modifiers and disable path/connect tools
    if (this.selectedPlayers.size === 0) {
      if (this.activeTool === 'path' || this.activeTool === 'connect') {
        this.activateMainTool('select');
      }
      this.showConnectionTools = false;
    }
  }

  clearPlayerSelection(): void {
    this.selectedPlayers.clear();
    this.selectedConnection = null;
    this.showConnectionTools = false;
  }

  clearAllConnections(): void {
    this.playerConnections = [];
    this.selectedConnection = null;
    this.selectedPlayers.clear();
    this.cdr.markForCheck();
  }

  connectSelectedPlayers(): void {
    if (this.selectedPlayers.size < 2) {
      alert('Please select at least 2 players to connect');
      return;
    }

    const playerIds = Array.from(this.selectedPlayers);
    const connectionId = `connection-${Date.now()}`;

    this.playerConnections.push({
      id: connectionId,
      playerIds,
      color: this.shapeStrokeColor,
      strokeWidth: this.shapeStrokeWidth,
      fillOpacity: 1, // Default to 100% fill opacity
    });

    this.clearPlayerSelection();
  }

  connectSelectedPlayersOpen(): void {
    if (this.selectedPlayers.size < 2) {
      alert('Please select at least 2 players to connect');
      return;
    }

    const playerIds = Array.from(this.selectedPlayers);
    const connectionId = `connection-${Date.now()}`;

    this.playerConnections.push({
      id: connectionId,
      playerIds,
      color: this.shapeStrokeColor,
      strokeWidth: this.shapeStrokeWidth,
      isOpenConnection: true, // Mark this as an open connection
      fillOpacity: 1, // Default to 100% fill opacity
    });

    this.clearPlayerSelection();
  }

  disconnectPlayers(connectionId: string): void {
    const index = this.playerConnections.findIndex(
      (c) => c.id === connectionId
    );
    if (index > -1) {
      this.playerConnections.splice(index, 1);
      this.selectedConnection = null;
      this.cdr.markForCheck();
    }
  }

  selectConnection(connection: { id: string; playerIds: string[] }): void {
    this.selectedConnection = connection;
  }

  getConnectionPoints(playerIds: string[]): Array<{ x: number; y: number }> {
    return playerIds
      .map((id) => this.players.find((p) => p.id === id))
      .filter((p) => p !== undefined)
      .map((p) => ({ x: p!.x, y: p!.y })) as Array<{ x: number; y: number }>;
  }

  getConnectionPolygonPoints(playerIds: string[]): string {
    const points = this.getConnectionPoints(playerIds);
    return points.map((p) => `${p.x},${p.y}`).join(' ');
  }

  shouldFillConnection(connection: { playerIds: string[] }): boolean {
    return connection.playerIds.length >= 3;
  }

  syncAnimatedPositions(): void {
    // Read current animated positions directly from GSAP
    this.players.forEach((player) => {
      const x = gsap.getProperty(`#${player.id}`, 'x');
      const y = gsap.getProperty(`#${player.id}`, 'y');
      if (x !== undefined && y !== undefined) {
        player.x = x as number;
        player.y = y as number;
      }
    });
    // Sync ball position
    const ballX = gsap.getProperty(`#soccer-ball`, 'x');
    const ballY = gsap.getProperty(`#soccer-ball`, 'y');
    if (ballX !== undefined && ballY !== undefined) {
      this.ball.x = ballX as number;
      this.ball.y = ballY as number;
    }
  }

  getConnectionLineCoordinates(connection: {
    playerIds: string[];
    isOpenConnection?: boolean;
  }): Array<{ x1: number; y1: number; x2: number; y2: number }> {
    const points = this.getConnectionPoints(connection.playerIds);
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    // Connect consecutive points
    for (let i = 0; i < points.length - 1; i++) {
      lines.push({
        x1: points[i].x,
        y1: points[i].y,
        x2: points[i + 1].x,
        y2: points[i + 1].y,
      });
    }

    // Close the loop if 3+ points AND not an open connection
    if (points.length >= 3 && !connection.isOpenConnection) {
      lines.push({
        x1: points[points.length - 1].x,
        y1: points[points.length - 1].y,
        x2: points[0].x,
        y2: points[0].y,
      });
    }

    return lines;
  }

  // Context Menu Handlers
  preventBrowserContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  openConnectionContextMenu(
    event: MouseEvent,
    connection: { id: string; playerIds: string[] }
  ): void {
    // Prevent duplicate context menu from firing on multiple line elements
    const now = Date.now();
    if (now - this.lastContextMenuTime < 50) {
      // Less than 50ms since last context menu - ignore this click
      console.log('⏱️ Debounced - too soon after last menu');
      return;
    }
    this.lastContextMenuTime = now;

    // Using mousedown (button 2) instead of contextmenu to avoid Chrome issues
    this.contextMenuConnection = connection;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.selectedConnection = connection;
    console.log('✅ Selected connection:', connection.id);
    console.log('✅ Context menu position:', this.contextMenuPosition);
    this.cdr.markForCheck(); // Ensure change detection runs
  }

  onConnectionLineClick(
    event: any,
    connection: { id: string; playerIds: string[] }
  ): void {
    // Left-click opens the context menu
    console.log('🏌️ Connection line clicked:', connection.id);
    event.stopPropagation();
    this.openConnectionContextMenu(event, connection);
    console.log('📍 Menu position set to:', this.contextMenuPosition);
  }

  onConnectionFillClick(
    event: any,
    connection: { id: string; playerIds: string[] }
  ): void {
    // Left-click on fill opens the context menu (same as lines)
    console.log('🎨 Connection fill clicked:', connection.id);
    event.stopPropagation();
    this.openConnectionContextMenu(event, connection);
    console.log(
      '📍 Fill context menu position set to:',
      this.contextMenuPosition
    );
  }

  closeContextMenu(): void {
    this.contextMenuPosition = null;
    this.contextMenuConnection = null;
  }

  // Connection Styling
  setConnectionStrokeDasharray(
    connection: { id: string; playerIds: string[] },
    dasharray: string
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.strokeDasharray = dasharray;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionColor(
    connection: { id: string; playerIds: string[] },
    color: string
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.color = color;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionOpacity(
    connection: { id: string; playerIds: string[] },
    opacity: number
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.opacity = opacity;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  toggleConnectionFill(connection: { id: string; playerIds: string[] }): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.fillEnabled = !conn.fillEnabled;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionFillColor(
    connection: { id: string; playerIds: string[] },
    color: string
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.fillColor = color;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionFillOpacity(
    connection: { id: string; playerIds: string[] },
    opacity: number
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.fillOpacity = opacity;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionHighlightColor(
    connection: { id: string; playerIds: string[] },
    color: string | null
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.highlightColor = color === null ? undefined : color;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  toggleConnectionGlow(connection: { id: string; playerIds: string[] }): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.glowEnabled = !conn.glowEnabled;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionGlowColor(
    connection: { id: string; playerIds: string[] },
    color: string
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.glowColor = color;
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  setConnectionFillType(
    connection: { id: string; playerIds: string[] },
    fillType: 'solid' | 'striped'
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.fillType = fillType;
      // Initialize stripe color if not set
      if (fillType === 'striped' && !conn.stripeColor) {
        conn.stripeColor = '#ffffff'; // Default stripe color
      }
      this.cdr.markForCheck();
    }
  }

  setConnectionStripeColor(
    connection: { id: string; playerIds: string[] },
    color: string
  ): void {
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn) {
      conn.stripeColor = color;
      this.cdr.markForCheck();
    }
  }

  rgbFromHex(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(
        result[2],
        16
      )}, ${parseInt(result[3], 16)}`;
    }
    return '255, 255, 255';
  }

  // Disconnect operations
  disconnectLinkAtThisFrame(connection: {
    id: string;
    playerIds: string[];
  }): void {
    // Remove only the last player from the connection (removes one link)
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn && conn.playerIds && conn.playerIds.length > 0) {
      conn.playerIds.pop(); // Remove last player
      if (conn.playerIds.length === 0) {
        // If no players left, remove the entire connection
        const index = this.playerConnections.findIndex(
          (c) => c.id === connection.id
        );
        if (index > -1) {
          this.playerConnections.splice(index, 1);
        }
      }
      this.cdr.markForCheck();
    }
    this.closeContextMenu();
  }

  disconnectLinkInAllKeyframes(connection: {
    id: string;
    playerIds: string[];
  }): void {
    // Remove last player from connection in all keyframes
    this.currentSequence.keyframes.forEach((kf) => {
      if (!kf.connections) kf.connections = [];
      const conn = kf.connections.find((c) => c.id === connection.id);
      if (conn && conn.playerIds && conn.playerIds.length > 0) {
        conn.playerIds.pop(); // Remove last player
      }
    });
    // Also update in current state
    const conn = this.playerConnections.find((c) => c.id === connection.id);
    if (conn && conn.playerIds && conn.playerIds.length > 0) {
      conn.playerIds.pop();
    }
    // Remove empty connections
    this.currentSequence.keyframes.forEach((kf) => {
      if (!kf.connections) return;
      kf.connections = kf.connections.filter(
        (c) => c.playerIds && c.playerIds.length > 0
      );
    });
    this.playerConnections = this.playerConnections.filter(
      (c) => c.playerIds && c.playerIds.length > 0
    );
    this.cdr.markForCheck();
    this.closeContextMenu();
  }

  disconnectConnectionAtThisFrame(connection: {
    id: string;
    playerIds: string[];
  }): void {
    // Remove connection from current display only
    const index = this.playerConnections.findIndex(
      (c) => c.id === connection.id
    );
    if (index > -1) {
      this.playerConnections.splice(index, 1);
    }
    this.selectedConnection = null;
    this.cdr.markForCheck();
    this.closeContextMenu();
  }

  disconnectConnectionInAllKeyframes(connection: {
    id: string;
    playerIds: string[];
  }): void {
    // Remove connection from all keyframes and current state
    this.currentSequence.keyframes.forEach((kf) => {
      if (!kf.connections) kf.connections = [];
      const connIndex = kf.connections.findIndex((c) => c.id === connection.id);
      if (connIndex > -1) {
        kf.connections.splice(connIndex, 1);
      }
    });
    const index = this.playerConnections.findIndex(
      (c) => c.id === connection.id
    );
    if (index > -1) {
      this.playerConnections.splice(index, 1);
    }
    this.selectedConnection = null;
    this.cdr.markForCheck();
    this.closeContextMenu();
  }
}
