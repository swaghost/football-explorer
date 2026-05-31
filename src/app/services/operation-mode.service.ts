import { Injectable, signal, computed, inject } from '@angular/core';
import {
  OperationMode,
  OperationModeConfig,
} from '../interfaces/operation-mode.interfaces';
import { Store } from '@ngxs/store';
import { SetToolbarVisibility } from '../state/sketch.actions';
import operationModesConfig from '../config/operation-modes.config.json';

export interface OperationModeState {
  activeMode: string | null;
  availableModes: OperationMode[];
  isInitialized: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OperationModeService {
  private store = inject(Store);

  // Private state signals
  private readonly _activeMode = signal<string | null>(null);
  private readonly _availableModes = signal<OperationMode[]>([]);
  private readonly _isInitialized = signal<boolean>(false);

  // Store toolbar visibility state before mode activation
  private previousToolbarVisibility: Record<string, boolean> = {};

  // Public readonly computed signals
  public readonly activeMode = this._activeMode.asReadonly();
  public readonly availableModes = this._availableModes.asReadonly();
  public readonly isInitialized = this._isInitialized.asReadonly();

  // Computed properties
  public readonly activeModeConfig = computed<OperationMode | null>(() => {
    const activeId = this._activeMode();
    const modes = this._availableModes();
    return modes.find((mode) => mode.id === activeId) || null;
  });

  public readonly visibleToolbars = computed<string[]>(() => {
    const activeConfig = this.activeModeConfig();
    return activeConfig?.visibleToolbars || [];
  });

  public readonly isToolbarVisible = computed<(toolbarId: string) => boolean>(
    () => {
      const visibleIds = this.visibleToolbars();
      return (toolbarId: string) => {
        // If no mode is active, show all toolbars
        if (!this._activeMode()) {
          return true;
        }
        return visibleIds.includes(toolbarId);
      };
    }
  );

  constructor() {
    this.initializeFromConfig();
    this.loadSavedMode();
  }

  /**
   * Initialize operation modes from configuration
   */
  private initializeFromConfig(): void {
    try {
      const config = operationModesConfig as OperationModeConfig;
      this._availableModes.set(config.modes);
      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to load operation modes configuration:', error);
      this._availableModes.set([]);
      this._isInitialized.set(false);
    }
  }

  /**
   * Load saved mode from localStorage or use default
   */
  private loadSavedMode(): void {
    const config = operationModesConfig as OperationModeConfig;

    if (config.rememberLastMode) {
      const savedMode = localStorage.getItem('operation-mode-active');
      if (savedMode && this.isModeAvailable(savedMode)) {
        this._activeMode.set(savedMode);
        // Apply toolbar visibility for the loaded mode
        this.applyToolbarVisibility();
        return;
      }
    }

    // Use default mode if available
    if (config.defaultMode && this.isModeAvailable(config.defaultMode)) {
      this._activeMode.set(config.defaultMode);
      // Apply toolbar visibility for the default mode
      this.applyToolbarVisibility();
    }
  }

  /**
   * Activate a specific operation mode
   */
  public activateMode(modeId: string): boolean {
    console.log(`🟢 OperationModeService: Activating mode '${modeId}'`);

    if (!this.isModeAvailable(modeId)) {
      console.warn(`Operation mode '${modeId}' is not available`);
      return false;
    }

    const wasAnyModeActive = this.isAnyModeActive();

    // Only save current toolbar visibility state if no mode is currently active
    // This handles requirement 4: when first activating a mode, save the clean state
    // and requirement 6: when switching modes, don't save the previous mode's state
    if (!wasAnyModeActive) {
      console.log(`🟢 Saving current toolbar visibility state`);
      this.saveCurrentToolbarVisibility();
    }

    this._activeMode.set(modeId);
    this.saveActiveMode();

    // Apply toolbar visibility for the active mode
    this.applyToolbarVisibility();

    // Emit mode change event for other components
    this.notifyModeChange(modeId);

    console.log(`🟢 Mode '${modeId}' activated successfully`);
    return true;
  }

  /**
   * Deactivate current mode (hide all toolbars)
   */
  public deactivateMode(): void {
    this._activeMode.set(null);
    this.saveActiveMode();

    // Hide all toolbars when turning off operation mode (requirement 5)
    this.hideAllToolbars();

    this.notifyModeChange(null);
  }

  /**
   * Toggle a specific mode (activate if different, deactivate if same)
   */
  public toggleMode(modeId: string): boolean {
    console.log(
      `🔄 OperationModeService: toggleMode called with modeId='${modeId}', current active mode='${this._activeMode()}'`
    );

    if (this._activeMode() === modeId) {
      console.log(
        `🔄 OperationModeService: Deactivating mode '${modeId}' (same as current)`
      );
      this.deactivateMode();
      return false; // Mode was deactivated
    } else {
      console.log(
        `🔄 OperationModeService: Switching from '${this._activeMode()}' to '${modeId}'`
      );
      return this.activateMode(modeId);
    }
  }

  /**
   * Switch directly to a specific mode (always activates the mode, regardless of current state)
   */
  public switchMode(modeId: string): boolean {
    if (!this.isModeAvailable(modeId)) {
      console.warn(`Operation mode '${modeId}' is not available`);
      return false;
    }

    // If switching from no mode to a mode, save current toolbar state
    if (!this.isAnyModeActive()) {
      this.saveCurrentToolbarVisibility();
    }

    this._activeMode.set(modeId);
    this.saveActiveMode();

    // Apply toolbar visibility for the active mode
    this.applyToolbarVisibility();

    // Emit mode change event for other components
    this.notifyModeChange(modeId);

    return true;
  }

  /**
   * Check if a mode is available
   */
  public isModeAvailable(modeId: string): boolean {
    return this._availableModes().some((mode) => mode.id === modeId);
  }

  /**
   * Get mode configuration by ID
   */
  public getModeConfig(modeId: string): OperationMode | null {
    return this._availableModes().find((mode) => mode.id === modeId) || null;
  }

  /**
   * Save active mode to localStorage
   */
  private saveActiveMode(): void {
    const config = operationModesConfig as OperationModeConfig;
    if (config.rememberLastMode) {
      const activeMode = this._activeMode();
      if (activeMode) {
        localStorage.setItem('operation-mode-active', activeMode);
      } else {
        localStorage.removeItem('operation-mode-active');
      }
    }
  }

  /**
   * Notify other components about mode changes
   */
  private notifyModeChange(modeId: string | null): void {
    // Dispatch custom event for non-Angular components or external listeners
    const event = new CustomEvent('operation-mode-changed', {
      detail: {
        modeId,
        visibleToolbars: this.visibleToolbars(),
        activeConfig: this.activeModeConfig(),
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Get all available mode IDs
   */
  public getAllModeIds(): string[] {
    return this._availableModes().map((mode) => mode.id);
  }

  /**
   * Check if any mode is currently active
   */
  public isAnyModeActive(): boolean {
    return this._activeMode() !== null;
  }

  /**
   * Get the name of the currently active mode
   */
  public getActiveModeName(): string | null {
    const activeConfig = this.activeModeConfig();
    return activeConfig?.name || null;
  }

  /**
   * Save current toolbar visibility state before applying mode
   */
  private saveCurrentToolbarVisibility(): void {
    const allToolbarIds = [
      'selectionTools',
      'lessons',
      'selectedNodes',
      'nodeViewer',
      'nodePainter',
      'skillsRadar',
      'quickNav',
      'search',
      'teams',
      'techniqueExplorer',
      'lessonViewer', // Use internal name
      'tenancy',
      'teamRoster',
      'teamGroupMembers',
      'defaultTeamGroups',
      'datasets',
      'zoomControls',
      'rotationControl',
      'statusPanel',
      'viewportInfo',
      'visualizationOptions',
      'nodesList',
      'importExport',
    ];

    // Get current toolbar visibility from store
    const currentVisibility = this.store.selectSnapshot(
      (state) => state.sketch.toolbarVisibility
    );

    allToolbarIds.forEach((toolbarId) => {
      this.previousToolbarVisibility[toolbarId] =
        currentVisibility[toolbarId] || false;
    });
  }

  /**
   * Hide all toolbars (used when deactivating operation modes)
   */
  private hideAllToolbars(): void {
    const allToolbarIds = [
      'selectionTools',
      'lessons',
      'selectedNodes',
      'nodeViewer',
      'nodePainter',
      'skillsRadar',
      'quickNav',
      'search',
      'teams',
      'techniqueExplorer',
      'lessonViewer', // Use internal name
      'tenancy',
      'teamRoster',
      'teamGroupMembers',
      'defaultTeamGroups',
      'datasets',
      'zoomControls',
      'rotationControl',
      'statusPanel',
      'viewportInfo',
      'visualizationOptions',
      'nodesList',
      'importExport',
    ];

    allToolbarIds.forEach((toolbarId) => {
      this.store.dispatch(new SetToolbarVisibility(toolbarId as any, false));
    });

    // Clear the saved state since we're hiding everything
    this.previousToolbarVisibility = {};
  }

  /**
   * Restore previous toolbar visibility state
   */
  private restorePreviousToolbarVisibility(): void {
    Object.entries(this.previousToolbarVisibility).forEach(
      ([toolbarId, isVisible]) => {
        this.store.dispatch(
          new SetToolbarVisibility(toolbarId as any, isVisible)
        );
      }
    );

    // Clear the saved state
    this.previousToolbarVisibility = {};
  }

  /**
   * Map config toolbar names to internal toolbar IDs
   */
  private mapConfigToInternalToolbarId(configId: string): string {
    const mapping: { [key: string]: string } = {
      lessonRunner: 'lessonViewer', // Map lesson runner config to internal lessonViewer
    };
    return mapping[configId] || configId;
  }

  /**
   * Apply toolbar visibility based on the current active mode
   */
  private applyToolbarVisibility(): void {
    console.log(
      `🎛️ OperationModeService: Applying toolbar visibility for mode '${this._activeMode()}'`
    );

    // Define all available toolbar IDs (from D3UIV6 component)
    const allToolbarIds = [
      'selectionTools',
      'lessons',
      'selectedNodes',
      'nodeViewer',
      'nodePainter',
      'skillsRadar',
      'quickNav',
      'search',
      'teams',
      'techniqueExplorer',
      'lessonViewer', // Use internal name
      'tenancy',
      'teamRoster',
      'teamGroupMembers',
      'defaultTeamGroups',
      'datasets',
      'zoomControls',
      'rotationControl',
      'statusPanel',
      'viewportInfo',
      'visualizationOptions',
      'nodesList',
      'importExport',
    ];

    const activeConfig = this.activeModeConfig();

    if (activeConfig) {
      console.log(
        `🎛️ Mode '${activeConfig.id}' visible toolbars:`,
        activeConfig.visibleToolbars
      );

      // Mode is active - show only specified toolbars, hide others
      allToolbarIds.forEach((toolbarId) => {
        const mappedId = this.mapConfigToInternalToolbarId(toolbarId);
        const shouldBeVisible = activeConfig.visibleToolbars.some(
          (configId) => this.mapConfigToInternalToolbarId(configId) === mappedId
        );
        this.store.dispatch(
          new SetToolbarVisibility(mappedId as any, shouldBeVisible)
        );
      });
    } else {
      console.log(`🎛️ No mode active - showing all toolbars`);

      // No mode active - show all toolbars
      allToolbarIds.forEach((toolbarId) => {
        this.store.dispatch(new SetToolbarVisibility(toolbarId as any, true));
      });
    }

    console.log(`🎛️ Toolbar visibility application complete`);
  }
}
