import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { patch, updateItem, removeItem, append } from '@ngxs/store/operators';
import { DrawingStroke } from '../interfaces';
import {
  SketchStateModel,
  initialSketchState,
  ToolbarPositions,
  ToolbarVisibility,
  ToolbarLocks,
  ToolbarExpandStates,
  FavoriteNode,
  BookmarkedNode,
  PersonalCollections,
  NodeVisitHistory,
  NodeVisitRecord,
  NodeCompletionHistory,
  NodeCompletionRecord,
} from './sketch.model';
import * as SketchActions from './sketch.actions';

@State<SketchStateModel>({
  name: 'sketch',
  defaults: initialSketchState,
})
@Injectable()
export class SketchState {
  // Selectors
  @Selector()
  static getZoomLevel(state: SketchStateModel): number {
    return state.zoomLevel;
  }

  @Selector()
  static getPanX(state: SketchStateModel): number {
    return state.panX;
  }

  @Selector()
  static getPanY(state: SketchStateModel): number {
    return state.panY;
  }

  @Selector()
  static getNodeCount(state: SketchStateModel): number {
    return state.nodeCount;
  }

  @Selector()
  static getRotationAngle(state: SketchStateModel): number {
    return state.rotationAngle;
  }

  @Selector()
  static getDrawingMode(
    state: SketchStateModel
  ): 'pencil' | 'eraser' | 'pan' | 'select' | 'lasso' | 'selectChildren' {
    return state.drawingMode;
  }

  @Selector()
  static getSelectedColor(state: SketchStateModel): string {
    return state.selectedColor;
  }

  @Selector()
  static getBrushSize(state: SketchStateModel): number {
    return state.brushSize;
  }

  @Selector()
  static getEraserSize(state: SketchStateModel): number {
    return state.eraserSize;
  }

  @Selector()
  static getEraserMode(state: SketchStateModel): 'normal' | 'magic' {
    return state.eraserMode;
  }

  @Selector()
  static getIsDarkMode(state: SketchStateModel): boolean {
    return state.isDarkMode;
  }

  @Selector()
  static getStrokes(state: SketchStateModel): DrawingStroke[] {
    return state.strokes;
  }

  @Selector()
  static getShapes(state: SketchStateModel): any[] {
    return state.shapes || [];
  }

  @Selector()
  static getSelectedShapeId(state: SketchStateModel): string | null {
    return state.selectedShapeId;
  }

  @Selector()
  static canUndo(state: SketchStateModel): boolean {
    return state.history && state.historyIndex > 0;
  }

  @Selector()
  static canRedo(state: SketchStateModel): boolean {
    return state.history && state.historyIndex < state.history.length - 1;
  }

  @Selector()
  static getTechniqueExplorerHeight(state: SketchStateModel): number {
    return state.techniqueExplorerHeight;
  }

  @Selector()
  static getLessonRunnerHeight(state: SketchStateModel): number {
    return state.lessonRunnerHeight;
  }

  @Selector()
  static getStrokeCount(state: SketchStateModel): number {
    return state.strokes.length;
  }

  @Selector()
  static getSnapToolbarsOnResize(state: SketchStateModel): boolean {
    return state.snapToolbarsOnResize;
  }

  @Selector()
  static getBottomToolbarVisible(state: SketchStateModel): boolean {
    return state.bottomToolbarVisible;
  }

  @Selector()
  static getToolbarPositions(state: SketchStateModel): ToolbarPositions {
    return state.toolbarPositions;
  }

  @Selector()
  static getToolbarVisibility(state: SketchStateModel): ToolbarVisibility {
    return state.toolbarVisibility;
  }

  @Selector()
  static getToolbarLocks(state: SketchStateModel): ToolbarLocks {
    return state.toolbarLocks;
  }

  @Selector()
  static getToolbarExpandStates(state: SketchStateModel): ToolbarExpandStates {
    return state.toolbarExpandStates;
  }

  @Selector()
  static getToolbarPosition(state: SketchStateModel) {
    return (toolbarType: keyof ToolbarPositions) =>
      state.toolbarPositions[toolbarType];
  }

  @Selector()
  static isToolbarVisible(state: SketchStateModel) {
    return (toolbarType: keyof ToolbarVisibility) =>
      state.toolbarVisibility[toolbarType];
  }

  @Selector()
  static isToolbarLocked(state: SketchStateModel) {
    return (toolbarType: keyof ToolbarLocks) => state.toolbarLocks[toolbarType];
  }

  // Auto-fade options selector
  @Selector()
  static getAutoFadeOptions(state: SketchStateModel) {
    return state.autoFadeOptions;
  }

  // Decision Flows selectors
  @Selector()
  static getDecisionFlows(state: SketchStateModel) {
    return state.decisionFlows;
  }

  // Personal Collections selectors
  @Selector()
  static getFavoriteNodes(state: SketchStateModel) {
    return state.personalCollections?.favoriteNodes || [];
  }

  @Selector()
  static getBookmarkedNodes(state: SketchStateModel) {
    return state.personalCollections?.bookmarkedNodes || [];
  }

  @Selector()
  static isFavorite(state: SketchStateModel) {
    return (nodeId: string) => {
      const favorites = state.personalCollections?.favoriteNodes || [];
      return favorites.some((fav) => fav.nodeId === nodeId);
    };
  }

  @Selector()
  static isBookmarked(state: SketchStateModel) {
    return (nodeId: string) => {
      const bookmarks = state.personalCollections?.bookmarkedNodes || [];
      return bookmarks.some((bookmark) => bookmark.nodeId === nodeId);
    };
  }

  @Selector()
  static getFavoritesByCategory(state: SketchStateModel) {
    return (category: 'Movements' | 'Match Skills' | 'Technique') => {
      const favorites = state.personalCollections?.favoriteNodes || [];
      return favorites.filter((fav) => fav.category === category);
    };
  }

  // Node visit history selectors
  @Selector()
  static getNodeVisitHistory(state: SketchStateModel) {
    return state.nodeVisitHistory?.visits || {};
  }

  @Selector()
  static getNodeLastVisited(state: SketchStateModel) {
    return (nodeId: string) => {
      const visit = state.nodeVisitHistory?.visits[nodeId];
      return visit ? new Date(visit.lastVisitedAt) : null;
    };
  }

  @Selector()
  static getNodeVisitCount(state: SketchStateModel) {
    return (nodeId: string) => {
      const visit = state.nodeVisitHistory?.visits[nodeId];
      return visit ? visit.visitCount : 0;
    };
  }

  @Selector()
  static getNodePreviousVisited(state: SketchStateModel) {
    return (nodeId: string) => {
      const visit = state.nodeVisitHistory?.visits[nodeId];
      return visit?.previousVisitedAt
        ? new Date(visit.previousVisitedAt)
        : null;
    };
  }

  // Node exploration/completion selectors (separate from lessons)
  @Selector()
  static getNodeCompletionHistory(state: SketchStateModel) {
    return state.nodeCompletionHistory?.completions || {};
  }

  @Selector()
  static isNodeCompletedInExploration(state: SketchStateModel) {
    return (nodeId: string) => {
      const completion = state.nodeCompletionHistory?.completions[nodeId];
      return completion?.isCompleted || false;
    };
  }

  @Selector()
  static getNodeCompletionDate(state: SketchStateModel) {
    return (nodeId: string) => {
      const completion = state.nodeCompletionHistory?.completions[nodeId];
      return completion?.completedAt ? new Date(completion.completedAt) : null;
    };
  }

  // Actions
  @Action(SketchActions.UpdateZoom)
  updateZoom(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateZoom
  ) {
    ctx.patchState({ zoomLevel: action.zoomLevel });
  }

  @Action(SketchActions.UpdatePan)
  updatePan(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdatePan
  ) {
    ctx.patchState({
      panX: action.panX,
      panY: action.panY,
    });
  }

  @Action(SketchActions.UpdateNodeCount)
  updateNodeCount(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateNodeCount
  ) {
    ctx.patchState({ nodeCount: action.nodeCount });
  }

  @Action(SketchActions.UpdateRotation)
  updateRotation(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateRotation
  ) {
    ctx.patchState({ rotationAngle: action.rotationAngle });
  }

  @Action(SketchActions.SetDrawingMode)
  setDrawingMode(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetDrawingMode
  ) {
    ctx.patchState({ drawingMode: action.mode });
  }

  @Action(SketchActions.SetSelectedColor)
  setSelectedColor(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetSelectedColor
  ) {
    ctx.patchState({ selectedColor: action.color });
  }

  @Action(SketchActions.UpdateBrushSize)
  updateBrushSize(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateBrushSize
  ) {
    ctx.patchState({ brushSize: action.size });
  }

  @Action(SketchActions.UpdateEraserSize)
  updateEraserSize(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateEraserSize
  ) {
    ctx.patchState({ eraserSize: action.size });
  }

  @Action(SketchActions.SetEraserMode)
  setEraserMode(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetEraserMode
  ) {
    ctx.patchState({ eraserMode: action.mode });
  }

  @Action(SketchActions.ToggleTheme)
  toggleTheme(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    const newDarkMode = !state.isDarkMode;
    ctx.patchState({ isDarkMode: newDarkMode });
    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('app-theme-dark-mode', String(newDarkMode));
    }
  }

  @Action(SketchActions.SetTheme)
  setTheme(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetTheme
  ) {
    ctx.patchState({ isDarkMode: action.isDarkMode });
    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('app-theme-dark-mode', String(action.isDarkMode));
    }
  }

  @Action(SketchActions.ToggleSnapToolbarsOnResize)
  toggleSnapToolbarsOnResize(ctx: StateContext<SketchStateModel>) {
    const currentState = ctx.getState();
    ctx.patchState({
      snapToolbarsOnResize: !currentState.snapToolbarsOnResize,
    });
  }

  @Action(SketchActions.SetSnapToolbarsOnResize)
  setSnapToolbarsOnResize(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetSnapToolbarsOnResize
  ) {
    ctx.patchState({ snapToolbarsOnResize: action.snapToolbarsOnResize });
  }

  @Action(SketchActions.ToggleBottomToolbar)
  toggleBottomToolbar(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    ctx.patchState({ bottomToolbarVisible: !state.bottomToolbarVisible });
  }

  @Action(SketchActions.SetBottomToolbarVisible)
  setBottomToolbarVisible(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetBottomToolbarVisible
  ) {
    ctx.patchState({ bottomToolbarVisible: action.visible });
  }

  @Action(SketchActions.AddStroke)
  addStroke(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.AddStroke
  ) {
    ctx.setState(
      patch({
        strokes: append([action.stroke]),
      })
    );
    // Save history after adding a stroke
    ctx.dispatch(new SketchActions.SaveHistory());
  }

  @Action(SketchActions.UpdateStroke)
  updateStroke(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateStroke
  ) {
    ctx.setState(
      patch({
        strokes: updateItem<DrawingStroke>(
          (stroke) => stroke.id === action.strokeId,
          patch({ points: action.points })
        ),
      })
    );
  }

  @Action(SketchActions.RemoveStroke)
  removeStroke(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.RemoveStroke
  ) {
    ctx.setState(
      patch({
        strokes: removeItem<DrawingStroke>(
          (stroke) => stroke.id === action.strokeId
        ),
      })
    );
  }

  @Action(SketchActions.SetStrokes)
  setStrokes(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetStrokes
  ) {
    ctx.patchState({ strokes: action.strokes });
  }

  @Action(SketchActions.ClearAllStrokes)
  clearAllStrokes(ctx: StateContext<SketchStateModel>) {
    ctx.patchState({ strokes: [] });
    ctx.dispatch(new SketchActions.SaveHistory());
  }

  // Shape actions
  @Action(SketchActions.AddShape)
  addShape(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.AddShape
  ) {
    const state = ctx.getState();
    const currentShapes = state.shapes || [];
    console.log(
      'AddShape action: current shapes:',
      currentShapes,
      'new shape:',
      action.shape
    );
    ctx.patchState({ shapes: [...currentShapes, action.shape] });
    ctx.dispatch(new SketchActions.SaveHistory());
  }

  @Action(SketchActions.UpdateShape)
  updateShape(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateShape
  ) {
    const state = ctx.getState();
    const shapes = state.shapes.map((shape) =>
      shape.id === action.shapeId ? { ...shape, ...action.updates } : shape
    );
    ctx.patchState({ shapes });
    ctx.dispatch(new SketchActions.SaveHistory());
  }

  @Action(SketchActions.DeleteShape)
  deleteShape(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.DeleteShape
  ) {
    const state = ctx.getState();
    const shapes = state.shapes.filter((shape) => shape.id !== action.shapeId);
    ctx.patchState({ shapes, selectedShapeId: null });
    ctx.dispatch(new SketchActions.SaveHistory());
  }

  @Action(SketchActions.SetShapes)
  setShapes(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetShapes
  ) {
    ctx.patchState({ shapes: action.shapes });
  }

  @Action(SketchActions.ClearAllShapes)
  clearAllShapes(ctx: StateContext<SketchStateModel>) {
    ctx.patchState({ shapes: [], selectedShapeId: null });
    ctx.dispatch(new SketchActions.SaveHistory());
  }

  @Action(SketchActions.SetSelectedShape)
  setSelectedShape(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetSelectedShape
  ) {
    ctx.patchState({ selectedShapeId: action.shapeId });
  }

  // History actions
  @Action(SketchActions.SaveHistory)
  saveHistory(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    const entry = {
      strokes: [...(state.strokes || [])],
      shapes: [...(state.shapes || [])],
    };

    // Initialize history if it doesn't exist
    const currentHistory = state.history || [];

    // Remove any history after current index (for redo branch)
    const newHistory = currentHistory.slice(0, state.historyIndex + 1);
    newHistory.push(entry);

    // Limit history to 50 entries
    const limitedHistory = newHistory.slice(-50);

    ctx.patchState({
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1,
    });
  }

  @Action(SketchActions.Undo)
  undo(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    if (state.history && state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      ctx.patchState({
        strokes: entry.strokes,
        shapes: entry.shapes,
        historyIndex: newIndex,
      });
    }
  }

  @Action(SketchActions.Redo)
  redo(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    if (state.history && state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];
      ctx.patchState({
        strokes: entry.strokes,
        shapes: entry.shapes,
        historyIndex: newIndex,
      });
    }
  }

  @Action(SketchActions.TrackNodeVisit)
  trackNodeVisit(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.TrackNodeVisit
  ) {
    const state = ctx.getState();

    // Ensure nodeVisitHistory exists (for backward compatibility with old localStorage)
    const visits = state.nodeVisitHistory?.visits || {};
    const currentVisit = visits[action.nodeId];
    const visitCount = currentVisit ? currentVisit.visitCount + 1 : 1;
    const now = new Date().toISOString();

    const updatedVisits = {
      ...visits,
      [action.nodeId]: {
        nodeId: action.nodeId,
        lastVisitedAt: now, // Current visit UTC timestamp
        previousVisitedAt: currentVisit?.lastVisitedAt, // Store previous visit timestamp
        visitCount: visitCount,
      },
    };

    ctx.patchState({
      nodeVisitHistory: {
        visits: updatedVisits,
      },
    });
  }

  @Action(SketchActions.SetTechniqueExplorerHeight)
  setTechniqueExplorerHeight(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetTechniqueExplorerHeight
  ) {
    ctx.patchState({ techniqueExplorerHeight: action.height });
  }

  @Action(SketchActions.SetLessonRunnerHeight)
  setLessonRunnerHeight(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetLessonRunnerHeight
  ) {
    ctx.patchState({ lessonRunnerHeight: action.height });
  }

  // Toolbar actions
  @Action(SketchActions.UpdateToolbarPosition)
  updateToolbarPosition(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateToolbarPosition
  ) {
    const currentState = ctx.getState();
    ctx.patchState({
      toolbarPositions: {
        ...currentState.toolbarPositions,
        [action.toolbarType]: action.position,
      },
    });
  }

  @Action(SketchActions.SetToolbarPositions)
  setToolbarPositions(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetToolbarPositions
  ) {
    ctx.patchState({ toolbarPositions: action.positions });
  }

  @Action(SketchActions.ToggleToolbarVisibility)
  toggleToolbarVisibility(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.ToggleToolbarVisibility
  ) {
    const currentState = ctx.getState();
    const updatedVisibility = {
      ...currentState.toolbarVisibility,
      [action.toolbarType]: !currentState.toolbarVisibility[action.toolbarType],
    };

    console.log(`🔄 State: ToggleToolbarVisibility for ${action.toolbarType}`, {
      currentValue: currentState.toolbarVisibility[action.toolbarType],
      newValue: updatedVisibility[action.toolbarType],
    });

    ctx.patchState({
      toolbarVisibility: updatedVisibility,
    });

    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const jsonString = JSON.stringify(updatedVisibility);
        localStorage.setItem('app-toolbar-visibility', jsonString);
        console.log(
          '💾 [localStorage] Saved toolbar visibility after toggle:',
          jsonString.substring(0, 100) + '...'
        );
      } catch (error) {
        console.error(
          '❌ [localStorage] Failed to save toolbar visibility:',
          error
        );
      }
    }
  }

  @Action(SketchActions.SetToolbarVisibility)
  setToolbarVisibility(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetToolbarVisibility
  ) {
    const currentState = ctx.getState();
    const updatedVisibility = {
      ...currentState.toolbarVisibility,
      [action.toolbarType]: action.visible,
    };

    console.log(
      `🔧 [SketchState] SetToolbarVisibility: ${action.toolbarType} = ${action.visible}`
    );
    console.log('📊 Updated visibility state:', updatedVisibility);
    console.log(
      '🔍 Current NGXS state before patch:',
      currentState.toolbarVisibility
    );

    ctx.patchState({
      toolbarVisibility: updatedVisibility,
    });

    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const jsonString = JSON.stringify(updatedVisibility);
        localStorage.setItem('app-toolbar-visibility', jsonString);
        console.log(
          '💾 [localStorage] Saved toolbar visibility:',
          jsonString.substring(0, 100) + '...'
        );
      } catch (error) {
        console.error(
          '❌ [localStorage] Failed to save toolbar visibility:',
          error
        );
      }
    }

    // Log the state after patch (for debugging)
    setTimeout(() => {
      const stateAfterPatch = ctx.getState();
      console.log(
        '✅ [NGXS] Visibility state after patchState:',
        stateAfterPatch.toolbarVisibility
      );
    }, 0);
  }

  @Action(SketchActions.SetAllToolbarVisibility)
  setAllToolbarVisibility(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetAllToolbarVisibility
  ) {
    const currentState = ctx.getState();
    const updatedVisibility: ToolbarVisibility = {} as ToolbarVisibility;
    Object.keys(currentState.toolbarVisibility).forEach((key) => {
      updatedVisibility[key as keyof ToolbarVisibility] = action.visible;
    });

    console.log(
      `🔧 [SketchState] SetAllToolbarVisibility: all = ${action.visible}`
    );

    ctx.patchState({ toolbarVisibility: updatedVisibility });

    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const jsonString = JSON.stringify(updatedVisibility);
        localStorage.setItem('app-toolbar-visibility', jsonString);
        console.log(
          '💾 [localStorage] Saved all toolbar visibility:',
          jsonString.substring(0, 100) + '...'
        );
      } catch (error) {
        console.error(
          '❌ [localStorage] Failed to save all toolbar visibility:',
          error
        );
      }
    } else {
      console.warn('⚠️  [localStorage] window.localStorage not available');
    }
  }

  @Action(SketchActions.ToggleToolbarLock)
  toggleToolbarLock(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.ToggleToolbarLock
  ) {
    const currentState = ctx.getState();
    ctx.patchState({
      toolbarLocks: {
        ...currentState.toolbarLocks,
        [action.toolbarType]: !currentState.toolbarLocks[action.toolbarType],
      },
    });
  }

  @Action(SketchActions.SetToolbarLock)
  setToolbarLock(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetToolbarLock
  ) {
    const currentState = ctx.getState();
    ctx.patchState({
      toolbarLocks: {
        ...currentState.toolbarLocks,
        [action.toolbarType]: action.locked,
      },
    });
  }

  @Action(SketchActions.LoadState)
  loadState(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.LoadState
  ) {
    ctx.patchState(action.state);
  }

  @Action(SketchActions.ResetState)
  resetState(ctx: StateContext<SketchStateModel>) {
    ctx.setState(initialSketchState);
  }

  // Decision Flow actions
  @Action(SketchActions.LoadDecisionFlows)
  loadDecisionFlows(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.LoadDecisionFlows
  ) {
    ctx.patchState({
      decisionFlows: action.decisionFlows,
    });
  }

  @Action(SketchActions.AddDecisionFlow)
  addDecisionFlow(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.AddDecisionFlow
  ) {
    const state = ctx.getState();
    ctx.patchState({
      decisionFlows: [...state.decisionFlows, action.decisionFlow],
    });
  }

  @Action(SketchActions.UpdateDecisionFlow)
  updateDecisionFlow(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.UpdateDecisionFlow
  ) {
    const state = ctx.getState();
    const updatedFlows = state.decisionFlows.map((flow) =>
      flow.FlowID === action.flowId ? { ...flow, ...action.updates } : flow
    );
    ctx.patchState({
      decisionFlows: updatedFlows,
    });
  }

  @Action(SketchActions.RemoveDecisionFlow)
  removeDecisionFlow(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.RemoveDecisionFlow
  ) {
    const state = ctx.getState();
    const filteredFlows = state.decisionFlows.filter(
      (flow) => flow.FlowID !== action.flowId
    );
    ctx.patchState({
      decisionFlows: filteredFlows,
    });
  }

  @Action(SketchActions.RefreshDatasetsByContext)
  refreshDatasetsByContext(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.RefreshDatasetsByContext
  ) {
    console.log('🔄 Refreshing datasets by context:', {
      tenantId: action.tenantId,
      teamId: action.teamId,
    });

    // TODO: In a real application, this would make an API call to fetch datasets
    // based on the current context (tenant/team). For now, this action serves as a
    // trigger that the component can listen to for handling selected dataset validation.

    console.log('📊 Dataset context refresh action dispatched');
  }

  // Personal Collections action handlers
  @Action(SketchActions.AddToFavorites)
  addToFavorites(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.AddToFavorites
  ) {
    const state = ctx.getState();
    const existingFavorites = state.personalCollections?.favoriteNodes || [];

    // Check if already in favorites
    if (existingFavorites.some((fav) => fav.nodeId === action.nodeId)) {
      return; // Already favorited
    }

    const newFavorite: FavoriteNode = {
      nodeId: action.nodeId,
      category: action.category,
      addedAt: new Date(),
      nodeTitle: action.nodeTitle,
      datasetId: action.datasetId,
    };

    ctx.patchState({
      personalCollections: {
        ...state.personalCollections,
        favoriteNodes: [...existingFavorites, newFavorite],
      },
    });
  }

  @Action(SketchActions.RemoveFromFavorites)
  removeFromFavorites(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.RemoveFromFavorites
  ) {
    const state = ctx.getState();
    const existingFavorites = state.personalCollections?.favoriteNodes || [];

    ctx.patchState({
      personalCollections: {
        ...state.personalCollections,
        favoriteNodes: existingFavorites.filter(
          (fav) => fav.nodeId !== action.nodeId
        ),
      },
    });
  }

  @Action(SketchActions.AddToBookmarks)
  addToBookmarks(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.AddToBookmarks
  ) {
    const state = ctx.getState();
    const existingBookmarks = state.personalCollections?.bookmarkedNodes || [];

    // Check if already bookmarked
    if (
      existingBookmarks.some((bookmark) => bookmark.nodeId === action.nodeId)
    ) {
      return; // Already bookmarked
    }

    const newBookmark: BookmarkedNode = {
      nodeId: action.nodeId,
      addedAt: new Date(),
      nodeTitle: action.nodeTitle,
      datasetId: action.datasetId,
    };

    ctx.patchState({
      personalCollections: {
        ...state.personalCollections,
        bookmarkedNodes: [...existingBookmarks, newBookmark],
      },
    });
  }

  @Action(SketchActions.RemoveFromBookmarks)
  removeFromBookmarks(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.RemoveFromBookmarks
  ) {
    const state = ctx.getState();
    const existingBookmarks = state.personalCollections?.bookmarkedNodes || [];

    ctx.patchState({
      personalCollections: {
        ...state.personalCollections,
        bookmarkedNodes: existingBookmarks.filter(
          (bookmark) => bookmark.nodeId !== action.nodeId
        ),
      },
    });
  }

  @Action(SketchActions.ClearFavorites)
  clearFavorites(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    ctx.patchState({
      personalCollections: {
        ...state.personalCollections,
        favoriteNodes: [],
      },
    });
  }

  @Action(SketchActions.ClearBookmarks)
  clearBookmarks(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    ctx.patchState({
      personalCollections: {
        ...state.personalCollections,
        bookmarkedNodes: [],
      },
    });
  }

  // Initialize state with proper structure (ensures migrations from old versions)
  @Action(SketchActions.InitializeState)
  initializeState(ctx: StateContext<SketchStateModel>) {
    const state = ctx.getState();
    const updates: Partial<SketchStateModel> = {};

    // Ensure nodeVisitHistory exists with proper structure
    if (
      !state.nodeVisitHistory ||
      typeof state.nodeVisitHistory.visits !== 'object'
    ) {
      updates.nodeVisitHistory = { visits: {} };
      console.log('🔧 Initialized nodeVisitHistory structure');
    }

    // Ensure personalCollections exists
    if (!state.personalCollections) {
      updates.personalCollections = {
        favoriteNodes: [],
        bookmarkedNodes: [],
      };
      console.log('🔧 Initialized personalCollections structure');
    }

    // Ensure nodeCompletionHistory exists
    if (
      !state.nodeCompletionHistory ||
      typeof state.nodeCompletionHistory.completions !== 'object'
    ) {
      updates.nodeCompletionHistory = { completions: {} };
      console.log('🔧 Initialized nodeCompletionHistory structure');
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      ctx.patchState(updates);
    }
  }

  // Node exploration completion actions (separate from lessons)
  @Action(SketchActions.MarkNodeCompletedInExploration)
  markNodeCompletedInExploration(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.MarkNodeCompletedInExploration
  ) {
    const state = ctx.getState();
    const now = new Date().toISOString();

    // Ensure nodeCompletionHistory exists (for backward compatibility with old localStorage)
    const completions = state.nodeCompletionHistory?.completions || {};

    const updatedCompletions = {
      ...completions,
      [action.nodeId]: {
        nodeId: action.nodeId,
        completedAt: now,
        isCompleted: true,
        needsReview: false,
      },
    };

    ctx.patchState({
      nodeCompletionHistory: {
        completions: updatedCompletions,
      },
    });
  }

  @Action(SketchActions.MarkNodeNeedsReview)
  markNodeNeedsReview(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.MarkNodeNeedsReview
  ) {
    const state = ctx.getState();

    // Ensure nodeCompletionHistory exists (for backward compatibility with old localStorage)
    const completions = state.nodeCompletionHistory?.completions || {};
    const completion = completions[action.nodeId];

    if (completion) {
      const updatedCompletions = {
        ...completions,
        [action.nodeId]: {
          ...completion,
          isCompleted: false,
          needsReview: true,
        },
      };

      ctx.patchState({
        nodeCompletionHistory: {
          completions: updatedCompletions,
        },
      });
    }
  }

  // Auto-fade options action handlers
  @Action(SketchActions.SetAutoFadeOptions)
  setAutoFadeOptions(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetAutoFadeOptions
  ) {
    ctx.patchState({
      autoFadeOptions: action.options,
    });
  }

  @Action(SketchActions.ResetAutoFadeOptions)
  resetAutoFadeOptions(ctx: StateContext<SketchStateModel>) {
    ctx.patchState({
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
    });
  }

  @Action(SketchActions.SetToolbarExpandState)
  setToolbarExpandState(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.SetToolbarExpandState
  ) {
    const currentState = ctx.getState();
    const updatedExpandStates = {
      ...currentState.toolbarExpandStates,
      [action.toolbarType]: action.expanded,
    };

    console.log(
      `🔧 [SketchState] SetToolbarExpandState: ${String(
        action.toolbarType
      )} = ${action.expanded}`
    );

    ctx.patchState({ toolbarExpandStates: updatedExpandStates });

    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const jsonString = JSON.stringify(updatedExpandStates);
        localStorage.setItem('app-toolbar-expand-states', jsonString);
        console.log(
          '💾 [localStorage] Saved toolbar expand states:',
          jsonString
        );
      } catch (error) {
        console.error(
          '❌ [localStorage] Failed to save toolbar expand states:',
          error
        );
      }
    } else {
      console.warn('⚠️  [localStorage] window.localStorage not available');
    }
  }

  @Action(SketchActions.ToggleToolbarExpandState)
  toggleToolbarExpandState(
    ctx: StateContext<SketchStateModel>,
    action: SketchActions.ToggleToolbarExpandState
  ) {
    const currentState = ctx.getState();
    const currentExpandState = currentState.toolbarExpandStates[
      action.toolbarType as keyof typeof currentState.toolbarExpandStates
    ] as boolean;
    const updatedExpandStates = {
      ...currentState.toolbarExpandStates,
      [action.toolbarType]: !currentExpandState,
    };

    console.log(
      `🔧 [SketchState] ToggleToolbarExpandState: ${String(
        action.toolbarType
      )} = ${!currentExpandState}`
    );

    ctx.patchState({ toolbarExpandStates: updatedExpandStates });

    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const jsonString = JSON.stringify(updatedExpandStates);
        localStorage.setItem('app-toolbar-expand-states', jsonString);
        console.log(
          '💾 [localStorage] Saved toolbar expand states:',
          jsonString
        );
      } catch (error) {
        console.error(
          '❌ [localStorage] Failed to save toolbar expand states:',
          error
        );
      }
    } else {
      console.warn('⚠️  [localStorage] window.localStorage not available');
    }
  }
}
