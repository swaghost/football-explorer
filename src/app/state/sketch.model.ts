import {
  DecisionFlow,
  ToolbarPosition,
  DrawingStroke,
  DrawingShape,
  DrawingHistoryEntry,
} from '../interfaces';
import { AutoFadeOptions } from '../components/dialogs/auto-fade-options-dialog/auto-fade-options-dialog.component';

// Favorites and Bookmarks interfaces
export interface FavoriteNode {
  nodeId: string;
  category: 'Movements' | 'Match Skills' | 'Technique';
  addedAt: Date;
  nodeTitle?: string;
  datasetId?: string;
}

export interface BookmarkedNode {
  nodeId: string;
  addedAt: Date;
  nodeTitle?: string;
  datasetId?: string;
}

export interface PersonalCollections {
  favoriteNodes: FavoriteNode[];
  bookmarkedNodes: BookmarkedNode[];
}

// Node visit tracking
export interface NodeVisitRecord {
  nodeId: string;
  lastVisitedAt: string; // ISO 8601 UTC timestamp (current visit)
  previousVisitedAt?: string; // ISO 8601 UTC timestamp (previous visit)
  visitCount: number;
}

export interface NodeVisitHistory {
  visits: Record<string, NodeVisitRecord>; // Key is nodeId
}

// Node exploration/completion tracking (separate from lessons)
export interface NodeCompletionRecord {
  nodeId: string;
  completedAt: string; // ISO 8601 UTC timestamp
  isCompleted: boolean;
  needsReview: boolean;
}

export interface NodeCompletionHistory {
  completions: Record<string, NodeCompletionRecord>; // Key is nodeId
}

export interface ToolbarPositions {
  selectionTools: ToolbarPosition;
  annotation: ToolbarPosition;
  drawingModifiers: ToolbarPosition;
  lessons: ToolbarPosition;
  selectedNodes: ToolbarPosition;
  lessonViewer: ToolbarPosition;
  lessonBuilderV2: ToolbarPosition;
  lessonRunnerV2: ToolbarPosition;
  techniqueExplorer: ToolbarPosition;
  skillsRadar: ToolbarPosition;
  quickNav: ToolbarPosition;
  search: ToolbarPosition;
  teams: ToolbarPosition;
  teamRoster: ToolbarPosition;
  teamGroupMembers: ToolbarPosition;
  defaultTeamGroups: ToolbarPosition;
  datasets: ToolbarPosition;
  zoomControls: ToolbarPosition;
  rotationControl: ToolbarPosition;
  statusPanel: ToolbarPosition;
  viewportInfo: ToolbarPosition;
  visualizationOptions: ToolbarPosition;
  colorizationOptions: ToolbarPosition;
  style: ToolbarPosition;
  overlays: ToolbarPosition;
}

export interface ToolbarVisibility {
  selectionTools: boolean;
  annotation: boolean;
  drawingModifiers: boolean;
  lessons: boolean;
  explorer: boolean;
  // lessonRunner: boolean; // OLD - Replaced by lessonRunnerV2
  selectedNodes: boolean;
  lessonViewer: boolean;
  lessonBuilderV2: boolean;
  lessonRunnerV2: boolean;
  techniqueExplorer: boolean;
  skillsRadar: boolean;
  quickNav: boolean;
  search: boolean;
  teams: boolean;
  teamRoster: boolean;
  teamGroupMembers: boolean;
  defaultTeamGroups: boolean;
  datasets: boolean;
  zoomControls: boolean;
  rotationControl: boolean;
  statusPanel: boolean;
  viewportInfo: boolean;
  visualizationOptions: boolean;
  colorizationOptions: boolean;
  style: boolean;
  overlays: boolean;
}

export interface ToolbarLocks {
  selectionTools: boolean;
  annotation: boolean;
  drawingModifiers: boolean;
  lessons: boolean;
  explorer: boolean;
  // lessonRunner: boolean; // OLD - Replaced by lessonRunnerV2
  selectedNodes: boolean;
  lessonViewer: boolean;
  lessonBuilderV2: boolean;
  lessonRunnerV2: boolean;
  techniqueExplorer: boolean;
  skillsRadar: boolean;
  quickNav: boolean;
  search: boolean;
  teams: boolean;
  teamRoster: boolean;
  teamGroupMembers: boolean;
  defaultTeamGroups: boolean;
  datasets: boolean;
  zoomControls: boolean;
  rotationControl: boolean;
  statusPanel: boolean;
  viewportInfo: boolean;
  visualizationOptions: boolean;
  colorizationOptions: boolean;
  style: boolean;
  overlays: boolean;
}

export interface ToolbarExpandStates {
  lessonBuilderV2: boolean; // leftCollapsed inverted (true = expanded/open)
  lessonRunnerV2: boolean; // leftCollapsed inverted (true = expanded/open)
}

export interface SketchStateModel {
  // Canvas and visualization properties
  zoomLevel: number;
  panX: number;
  panY: number;
  nodeCount: number;
  rotationAngle: number;

  // Data management
  decisionFlows: DecisionFlow[]; // Will be filled by API call later

  // Drawing properties
  drawingMode:
    | 'pencil'
    | 'eraser'
    | 'pan'
    | 'select'
    | 'lasso'
    | 'selectChildren';
  selectedColor: string;
  brushSize: number;
  eraserSize: number;
  eraserMode: 'normal' | 'magic';

  // Theme properties
  isDarkMode: boolean;
  snapToolbarsOnResize: boolean;

  // Drawing data
  strokes: DrawingStroke[];
  shapes: DrawingShape[];

  // History for undo/redo
  history: DrawingHistoryEntry[];
  historyIndex: number;

  // UI state
  selectedShapeId: string | null;
  bottomToolbarVisible: boolean;
  techniqueExplorerHeight: number;
  lessonRunnerHeight: number;

  // Personal collections for favorites and bookmarks
  personalCollections: PersonalCollections;

  // Node visit tracking
  nodeVisitHistory: NodeVisitHistory;

  // Node exploration/completion tracking (separate from lessons)
  nodeCompletionHistory: NodeCompletionHistory;

  // Toolbar state
  toolbarPositions: ToolbarPositions;
  toolbarVisibility: ToolbarVisibility;
  toolbarLocks: ToolbarLocks;
  toolbarExpandStates: ToolbarExpandStates;

  // Auto-fade options for checkpoint logo
  autoFadeOptions: AutoFadeOptions;
}

// Helper function to read theme from localStorage
function loadThemeFromStorage(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('app-theme-dark-mode');
    return stored === 'true';
  }
  return false;
}

// Helper function to read toolbar visibility from localStorage
function loadToolbarVisibilityFromStorage(): Partial<ToolbarVisibility> {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('app-toolbar-visibility');
    console.log(
      '📖 [loadToolbarVisibilityFromStorage] Retrieved from storage:',
      stored
    );
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log(
          '✅ [loadToolbarVisibilityFromStorage] Successfully parsed:',
          parsed
        );
        return parsed;
      } catch (e) {
        console.error(
          '❌ [loadToolbarVisibilityFromStorage] Failed to parse toolbar visibility from localStorage:',
          e
        );
        return {};
      }
    } else {
      console.log(
        '⚠️  [loadToolbarVisibilityFromStorage] No saved toolbar visibility found in localStorage'
      );
      return {};
    }
  } else {
    console.warn(
      '⚠️  [loadToolbarVisibilityFromStorage] window.localStorage not available'
    );
    return {};
  }
}

// Get default toolbar visibility
function getDefaultToolbarVisibility(): ToolbarVisibility {
  const defaults = {
    selectionTools: true,
    annotation: true,
    drawingModifiers: true,
    lessons: true,
    explorer: false,
    selectedNodes: true,
    lessonViewer: false,
    lessonBuilderV2: true,
    lessonRunnerV2: true,
    techniqueExplorer: false,
    skillsRadar: false,
    quickNav: false,
    search: true,
    teams: true,
    teamRoster: true,
    teamGroupMembers: true,
    defaultTeamGroups: false,
    datasets: true,
    zoomControls: true,
    rotationControl: true,
    statusPanel: true,
    viewportInfo: true,
    visualizationOptions: true,
    colorizationOptions: false,
    style: false,
    overlays: false,
  };
  console.log('📋 [getDefaultToolbarVisibility] Returning defaults:', defaults);
  return defaults;
}

// Get initial toolbar visibility by merging defaults with saved state
function getInitialToolbarVisibility(): ToolbarVisibility {
  const defaults = getDefaultToolbarVisibility();
  const saved = loadToolbarVisibilityFromStorage();

  console.log(
    '🔀 [getInitialToolbarVisibility] Merging defaults with saved state'
  );
  console.log('  Defaults:', defaults);
  console.log('  Saved:', saved);

  const merged = {
    ...defaults,
    ...saved,
  };

  console.log('  Merged result:', merged);
  return merged;
}

// Load toolbar expand states from localStorage
function loadToolbarExpandStatesFromStorage(): Partial<ToolbarExpandStates> {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('app-toolbar-expand-states');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn(
          '⚠️  [loadToolbarExpandStatesFromStorage] Failed to parse:',
          e
        );
        return {};
      }
    }
    return {};
  } else {
    console.warn(
      '⚠️  [loadToolbarExpandStatesFromStorage] window.localStorage not available'
    );
    return {};
  }
}

// Get default toolbar expand states
function getDefaultToolbarExpandStates(): ToolbarExpandStates {
  return {
    lessonBuilderV2: true, // true = expanded/open
    lessonRunnerV2: true, // true = expanded/open
  };
}

// Get initial toolbar expand states by merging defaults with saved state
function getInitialToolbarExpandStates(): ToolbarExpandStates {
  const defaults = getDefaultToolbarExpandStates();
  const saved = loadToolbarExpandStatesFromStorage();

  console.log(
    '🔀 [getInitialToolbarExpandStates] Merging defaults with saved state'
  );
  console.log('  Defaults:', defaults);
  console.log('  Saved:', saved);

  const merged = {
    ...defaults,
    ...saved,
  };

  console.log('  Merged result:', merged);
  return merged;
}

export const initialSketchState: SketchStateModel = {
  zoomLevel: 1,
  panX: 0,
  panY: 0,
  nodeCount: 25,
  rotationAngle: 0,
  drawingMode: 'pan',
  selectedColor: '#ff0000',
  brushSize: 3,
  eraserSize: 10,
  eraserMode: 'magic',
  isDarkMode: loadThemeFromStorage(),
  snapToolbarsOnResize: true,
  strokes: [],
  shapes: [],
  history: [],
  historyIndex: -1,
  selectedShapeId: null,
  bottomToolbarVisible: true,
  techniqueExplorerHeight: 400,
  lessonRunnerHeight: 400,
  decisionFlows: [], // Will be populated by API call later
  personalCollections: {
    favoriteNodes: [],
    bookmarkedNodes: [],
  },
  nodeVisitHistory: {
    visits: {},
  },
  nodeCompletionHistory: {
    completions: {},
  },
  toolbarPositions: {
    selectionTools: { x: 20, y: 60 },
    annotation: { x: 20, y: 250 },
    drawingModifiers: { x: 360, y: 60 },
    lessons: { x: 20, y: 440 },
    selectedNodes: { x: 20, y: 640 },
    lessonViewer: { x: 400, y: 200 },
    lessonBuilderV2: { x: 600, y: 100 },
    lessonRunnerV2: { x: 600, y: 150 },
    techniqueExplorer: { x: 500, y: 300 },
    skillsRadar: { x: 500, y: 100 },
    quickNav: { x: 350, y: 60 },
    search: { x: 500, y: 300 },
    teams: { x: 1000, y: 290 },
    teamRoster: { x: 950, y: 390 }, // Left side for full roster
    teamGroupMembers: { x: 1350, y: 390 }, // Right side for group members
    defaultTeamGroups: { x: 1000, y: 490 },
    datasets: { x: 1000, y: 590 },
    zoomControls: { x: 1000, y: 60 },
    rotationControl: { x: 1020, y: 160 },
    statusPanel: { x: 640, y: 680 },
    viewportInfo: { x: 400, y: 340 },
    visualizationOptions: { x: 700, y: 60 },
    colorizationOptions: { x: 750, y: 60 },
    style: { x: 800, y: 60 },
    overlays: { x: 850, y: 60 },
  },
  toolbarVisibility: getInitialToolbarVisibility(),
  toolbarLocks: {
    selectionTools: false,
    annotation: false,
    drawingModifiers: false,
    lessons: false,
    explorer: false,
    // lessonRunner: false, // OLD - Replaced by lessonRunnerV2
    selectedNodes: false,
    lessonViewer: false,
    lessonBuilderV2: false,
    lessonRunnerV2: false,
    techniqueExplorer: false,
    skillsRadar: false,
    quickNav: false,
    search: false,
    teams: false,
    teamRoster: false,
    teamGroupMembers: false,
    defaultTeamGroups: false,
    datasets: false,
    zoomControls: false,
    rotationControl: false,
    statusPanel: false,
    viewportInfo: false,
    visualizationOptions: false,
    colorizationOptions: false,
    style: false,
    overlays: false,
  },
  toolbarExpandStates: getInitialToolbarExpandStates(),
  autoFadeOptions: {
    showLogo: true,
    logoZoomEffect: true,
    backgroundColor: '#000000',
    foregroundColor: '#ffffff',
    displayStageSeconds: 4,
    waitDelaySeconds: 2,
    textMessage: '',
    textZoomEffect: true,
    fontFamily: 'Arial, sans-serif',
    closeToolbarAfterStart: false,
  },
};
