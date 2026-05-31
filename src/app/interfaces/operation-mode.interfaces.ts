/**
 * Operation Mode Interfaces
 * Defines the structure for configurable operation modes that control toolbar visibility
 */

export interface OperationMode {
  /** Unique identifier for the operation mode */
  id: string;

  /** Display name for the operation mode button */
  name: string;

  /** Icon to display on the operation mode button (emoji or icon class) */
  icon: string;

  /** Tooltip text for the operation mode button */
  tooltip: string;

  /** List of toolbar IDs that should be visible in this mode */
  visibleToolbars: string[];

  /** Whether this mode is currently active */
  isActive?: boolean;

  /** Optional description of what this mode is for */
  description?: string;
}

export interface OperationModeConfig {
  /** List of available operation modes */
  modes: OperationMode[];

  /** Default mode to activate on startup (optional) */
  defaultMode?: string;

  /** Whether to remember the last active mode */
  rememberLastMode?: boolean;
}

/**
 * Known toolbar IDs for type safety
 * These should match the toolbarId properties from BaseToolbarComponent implementations
 */
export enum ToolbarId {
  // Data Management
  DATASETS = 'datasets-toolbar',
  LESSONS = 'lessons-toolbar',

  // Team Management
  TEAMS = 'teams-toolbar',
  TEAM_ROSTER = 'team-roster-toolbar',
  TEAM_GROUP_MEMBERS = 'team-group-members-toolbar',
  DEFAULT_TEAM_GROUPS = 'default-team-groups-toolbar',

  // Navigation
  NAVIGATION = 'navigation-toolbar',
  QUICK_NAV = 'quick-nav-toolbar',
  NODES_LIST = 'nodes-list-toolbar',

  // Node Tools
  NODE_PAINTER = 'node-painter-toolbar',
  NODE_VIEWER = 'node-viewer-toolbar',
  SELECTED_NODES = 'selected-nodes-toolbar',

  // Drawing & Visualization
  SELECTION_TOOLS = 'selection-tools-toolbar',
  VISUALIZATION_OPTIONS = 'visualization-options-toolbar',
  ZOOM_CONTROLS = 'zoom-controls-toolbar',

  // Lesson Tools
  LESSON_EXPLORER = 'lesson-explorer-toolbar',
  LESSON_RUNNER = 'lesson-runner-toolbar',

  // Search & Explorer
  SEARCH = 'search-toolbar',
  SEARCH_NEW = 'search-new-toolbar',
  SEARCH_SIMPLE = 'search-simple-toolbar',
  EXPLORER = 'explorer-toolbar',

  // Admin & Config
  TENANCY = 'tenancy-toolbar',
  SKILLS_RADAR = 'skills-radar-toolbar',
  STATUS_PANEL = 'status-panel-toolbar',
  VIEWPORT_INFO = 'viewport-info-toolbar',
  ROTATION_CONTROL = 'rotation-control-toolbar',
}

/**
 * Event interface for operation mode changes
 */
export interface OperationModeChangeEvent {
  /** The newly activated mode */
  newMode: OperationMode;

  /** The previously active mode (if any) */
  previousMode?: OperationMode;

  /** Timestamp of the change */
  timestamp: Date;
}
