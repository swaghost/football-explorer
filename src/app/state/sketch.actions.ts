import {
  ToolbarPositions,
  ToolbarVisibility,
  ToolbarLocks,
  ToolbarExpandStates,
  FavoriteNode,
  BookmarkedNode,
} from './sketch.model';
import { DecisionFlow, DrawingStroke, DrawingShape } from '../interfaces';

// Canvas and visualization actions
export class UpdateZoom {
  static readonly type = '[Sketch] Update Zoom';
  constructor(public zoomLevel: number) {}
}

export class UpdatePan {
  static readonly type = '[Sketch] Update Pan';
  constructor(public panX: number, public panY: number) {}
}

export class UpdateNodeCount {
  static readonly type = '[Sketch] Update Node Count';
  constructor(public nodeCount: number) {}
}

export class UpdateRotation {
  static readonly type = '[Sketch] Update Rotation';
  constructor(public rotationAngle: number) {}
}

// Drawing mode actions
export class SetDrawingMode {
  static readonly type = '[Sketch] Set Drawing Mode';
  constructor(
    public mode:
      | 'pencil'
      | 'eraser'
      | 'pan'
      | 'select'
      | 'lasso'
      | 'selectChildren'
  ) {}
}

export class SetSelectedColor {
  static readonly type = '[Sketch] Set Selected Color';
  constructor(public color: string) {}
}

export class UpdateBrushSize {
  static readonly type = '[Sketch] Update Brush Size';
  constructor(public size: number) {}
}

export class UpdateEraserSize {
  static readonly type = '[Sketch] Update Eraser Size';
  constructor(public size: number) {}
}

export class SetEraserMode {
  static readonly type = '[Sketch] Set Eraser Mode';
  constructor(public mode: 'normal' | 'magic') {}
}

// Theme actions
export class ToggleTheme {
  static readonly type = '[Sketch] Toggle Theme';
}

export class SetTheme {
  static readonly type = '[Sketch] Set Theme';
  constructor(public isDarkMode: boolean) {}
}

export class ToggleSnapToolbarsOnResize {
  static readonly type = '[Sketch] Toggle Snap Toolbars On Resize';
}

export class SetSnapToolbarsOnResize {
  static readonly type = '[Sketch] Set Snap Toolbars On Resize';
  constructor(public snapToolbarsOnResize: boolean) {}
}

// Bottom toolbar actions
export class ToggleBottomToolbar {
  static readonly type = '[Sketch] Toggle Bottom Toolbar';
}

export class SetBottomToolbarVisible {
  static readonly type = '[Sketch] Set Bottom Toolbar Visible';
  constructor(public visible: boolean) {}
}

// Drawing actions
export class AddStroke {
  static readonly type = '[Sketch] Add Stroke';
  constructor(public stroke: DrawingStroke) {}
}

export class UpdateStroke {
  static readonly type = '[Sketch] Update Stroke';
  constructor(
    public strokeId: string,
    public points: { x: number; y: number }[]
  ) {}
}

export class RemoveStroke {
  static readonly type = '[Sketch] Remove Stroke';
  constructor(public strokeId: string) {}
}

export class SetStrokes {
  static readonly type = '[Sketch] Set Strokes';
  constructor(public strokes: DrawingStroke[]) {}
}

export class ClearAllStrokes {
  static readonly type = '[Sketch] Clear All Strokes';
}

// Shape actions
export class AddShape {
  static readonly type = '[Sketch] Add Shape';
  constructor(public shape: any) {}
}

export class UpdateShape {
  static readonly type = '[Sketch] Update Shape';
  constructor(public shapeId: string, public updates: Partial<any>) {}
}

export class DeleteShape {
  static readonly type = '[Sketch] Delete Shape';
  constructor(public shapeId: string) {}
}

export class SetShapes {
  static readonly type = '[Sketch] Set Shapes';
  constructor(public shapes: any[]) {}
}

export class ClearAllShapes {
  static readonly type = '[Sketch] Clear All Shapes';
}

export class SetSelectedShape {
  static readonly type = '[Sketch] Set Selected Shape';
  constructor(public shapeId: string | null) {}
}

// History actions
export class SaveHistory {
  static readonly type = '[Sketch] Save History';
}

export class Undo {
  static readonly type = '[Sketch] Undo';
}

export class Redo {
  static readonly type = '[Sketch] Redo';
}

// UI state actions
export class TrackNodeVisit {
  static readonly type = '[Sketch] Track Node Visit';
  constructor(public nodeId: string) {}
}

export class SetTechniqueExplorerHeight {
  static readonly type = '[Sketch] Set Technique Explorer Height';
  constructor(public height: number) {}
}

export class SetLessonRunnerHeight {
  static readonly type = '[Sketch] Set Lesson Runner Height';
  constructor(public height: number) {}
}

// Toolbar actions
export class UpdateToolbarPosition {
  static readonly type = '[Sketch] Update Toolbar Position';
  constructor(
    public toolbarType: keyof ToolbarPositions,
    public position: { x: number; y: number }
  ) {}
}

export class SetToolbarPositions {
  static readonly type = '[Sketch] Set Toolbar Positions';
  constructor(public positions: ToolbarPositions) {}
}

export class ToggleToolbarVisibility {
  static readonly type = '[Sketch] Toggle Toolbar Visibility';
  constructor(public toolbarType: keyof ToolbarVisibility) {}
}

export class SetToolbarVisibility {
  static readonly type = '[Sketch] Set Toolbar Visibility';
  constructor(
    public toolbarType: keyof ToolbarVisibility,
    public visible: boolean
  ) {}
}

export class SetAllToolbarVisibility {
  static readonly type = '[Sketch] Set All Toolbar Visibility';
  constructor(public visible: boolean) {}
}

export class ToggleToolbarLock {
  static readonly type = '[Sketch] Toggle Toolbar Lock';
  constructor(public toolbarType: keyof ToolbarLocks) {}
}

export class SetToolbarLock {
  static readonly type = '[Sketch] Set Toolbar Lock';
  constructor(public toolbarType: keyof ToolbarLocks, public locked: boolean) {}
}

export class ToggleToolbarExpanded {
  static readonly type = '[Sketch] Toggle Toolbar Expanded';
  constructor(public toolbarType: keyof ToolbarExpandStates) {}
}

export class SetToolbarExpanded {
  static readonly type = '[Sketch] Set Toolbar Expanded';
  constructor(
    public toolbarType: keyof ToolbarExpandStates,
    public expanded: boolean
  ) {}
}

// Bulk state actions
export class LoadState {
  static readonly type = '[Sketch] Load State';
  constructor(public state: Partial<any>) {}
}

export class ResetState {
  static readonly type = '[Sketch] Reset State';
}

// Decision Flow actions
export class LoadDecisionFlows {
  static readonly type = '[Sketch] Load Decision Flows';
  constructor(public decisionFlows: DecisionFlow[]) {}
}

export class AddDecisionFlow {
  static readonly type = '[Sketch] Add Decision Flow';
  constructor(public decisionFlow: DecisionFlow) {}
}

export class UpdateDecisionFlow {
  static readonly type = '[Sketch] Update Decision Flow';
  constructor(public flowId: number, public updates: Partial<DecisionFlow>) {}
}

export class RemoveDecisionFlow {
  static readonly type = '[Sketch] Remove Decision Flow';
  constructor(public flowId: number) {}
}

export class RefreshDatasetsByContext {
  static readonly type = '[Sketch] Refresh Datasets By Context';
  constructor(public tenantId: number | null, public teamId: number | null) {}
}

// Personal Collections actions
export class AddToFavorites {
  static readonly type = '[Sketch] Add To Favorites';
  constructor(
    public nodeId: string,
    public category: 'Movements' | 'Match Skills' | 'Technique',
    public nodeTitle?: string,
    public datasetId?: string
  ) {}
}

export class RemoveFromFavorites {
  static readonly type = '[Sketch] Remove From Favorites';
  constructor(public nodeId: string) {}
}

export class AddToBookmarks {
  static readonly type = '[Sketch] Add To Bookmarks';
  constructor(
    public nodeId: string,
    public nodeTitle?: string,
    public datasetId?: string
  ) {}
}

export class RemoveFromBookmarks {
  static readonly type = '[Sketch] Remove From Bookmarks';
  constructor(public nodeId: string) {}
}

export class ClearFavorites {
  static readonly type = '[Sketch] Clear Favorites';
}

export class ClearBookmarks {
  static readonly type = '[Sketch] Clear Bookmarks';
}

// State initialization and migration
export class InitializeState {
  static readonly type = '[Sketch] Initialize State';
}

// Node exploration completion actions (separate from lessons)
export class MarkNodeCompletedInExploration {
  static readonly type = '[Sketch] Mark Node Completed In Exploration';
  constructor(public nodeId: string) {}
}

export class MarkNodeNeedsReview {
  static readonly type = '[Sketch] Mark Node Needs Review';
  constructor(public nodeId: string) {}
}

// Auto-fade options actions
export class SetAutoFadeOptions {
  static readonly type = '[Sketch] Set Auto Fade Options';
  constructor(public options: any) {} // Will use AutoFadeOptions type
}

export class ResetAutoFadeOptions {
  static readonly type = '[Sketch] Reset Auto Fade Options';
}

// Toolbar expand states actions
export class SetToolbarExpandState {
  static readonly type = '[Sketch] Set Toolbar Expand State';
  constructor(
    public toolbarType: keyof any, // lessonBuilderV2 | lessonRunnerV2
    public expanded: boolean
  ) {}
}

export class ToggleToolbarExpandState {
  static readonly type = '[Sketch] Toggle Toolbar Expand State';
  constructor(public toolbarType: keyof any) {} // lessonBuilderV2 | lessonRunnerV2
}
