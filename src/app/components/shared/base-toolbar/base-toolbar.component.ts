import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
  Directive,
  TemplateRef,
  ContentChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarHelpService } from '../../../services/toolbar-help.service';
import { HelpOverlayComponent } from '../help-overlay/help-overlay.component';

export interface ToolbarPosition {
  x: number;
  y: number;
}

export interface ToolbarState {
  visible: boolean;
  position: ToolbarPosition;
  locked: boolean;
  expanded: boolean;
  height?: number; // Optional height for resizable toolbars
}

/**
 * Base directive that provides common functionality for all draggable toolbars
 * This includes: header, footer, lock/unlock, open/close, expand/condense,
 * drag functionality, light/dark mode, control-click rescue, and position remembering
 *
 * ## Adding Custom Header Buttons
 *
 * Child components can add additional header buttons that appear before the standard buttons
 * (help, expand, close, lock, drag). Use an ng-template with the reference #additionalHeaderButtons:
 *
 * Example in your component template:
 * ```html
 * <div [ngClass]="getToolbarClasses()" ...>
 *   <div [ngClass]="getHeaderClasses()" ...>
 *     <h3>{{ toolbarIcon }} {{ toolbarTitle }}</h3>
 *     <div class="header-actions">
 *       <!-- Your custom buttons will be inserted here -->
 *       <ng-container *ngIf="hasAdditionalHeaderButtons()">
 *         <ng-container *ngTemplateOutlet="additionalHeaderButtons"></ng-container>
 *       </ng-container>
 *       <!-- Standard buttons follow -->
 *       ...
 *     </div>
 *   </div>
 *
 *   <!-- Define your custom buttons template -->
 *   <ng-template #additionalHeaderButtons>
 *     <button class="my-custom-btn header-btn" (click)="myAction()" title="My Action">
 *       🌟
 *     </button>
 *   </ng-template>
 * </div>
 * ```
 */
@Directive()
export abstract class BaseToolbarComponent implements OnInit, OnDestroy {
  // Common toolbar properties
  @Input() visible = false;

  @Input() isDarkMode = false;
  @Input() position: ToolbarPosition = { x: 0, y: 0 };
  @Input() locked = false;
  @Input() expanded = true;
  @Input() resizable = false; // Enable/disable vertical resize functionality
  @Input() minHeight = 200; // Minimum height for resizable toolbars
  @Input() maxHeight = 800; // Maximum height for resizable toolbars
  @Input() defaultHeight = 400; // Default height for resizable toolbars
  @Input() applyConstraints?: (
    x: number,
    y: number,
    toolbarId: string
  ) => { x: number; y: number }; // Optional collision detection callback

  // Common toolbar events
  @Output() close = new EventEmitter<void>();
  @Output() toggleLock = new EventEmitter<void>();
  @Output() dragStart = new EventEmitter<MouseEvent>();
  @Output() toggleExpanded = new EventEmitter<void>();
  @Output() positionChange = new EventEmitter<ToolbarPosition>();
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() stateChange = new EventEmitter<ToolbarState>();
  @Output() heightChange = new EventEmitter<number>();

  // Internal state for dragging
  protected isDragging = false;
  protected dragOffset = { x: 0, y: 0 };
  protected originalPosition: ToolbarPosition = { x: 0, y: 0 };

  // Internal state for resizing
  protected isResizing = false;
  protected resizeStartY = 0;
  protected resizeStartHeight = 0;
  public panelHeight = 400; // Current height for resizable toolbars

  // Help overlay state
  protected showHelpOverlay = false;

  // Content projection for additional header buttons
  @ContentChild('additionalHeaderButtons')
  additionalHeaderButtons?: TemplateRef<any>;

  // Inject toolbar help service
  protected toolbarHelpService = inject(ToolbarHelpService);

  // Abstract properties that child components must implement
  abstract readonly toolbarId: string;
  abstract readonly toolbarTitle: string;
  abstract readonly toolbarIcon: string;

  // Optional help text - will be loaded from service based on toolbarId
  protected toolbarHelp: string = '';

  ngOnInit(): void {
    this.panelHeight = this.defaultHeight;
    this.loadToolbarState();
    // Load help text from service
    this.loadHelpText();
  }

  ngOnDestroy(): void {
    this.saveToolbarState();
    // Clean up resize event listeners
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    document.body.style.userSelect = '';
  }

  /**
   * Control+Click rescue functionality - shows toolbar in center if hidden
   */
  @HostListener('document:keydown.control.click', ['$event'])
  onControlClick(event: Event): void {
    if (!this.visible) {
      this.rescueToolbar();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle toolbar close
   */
  onClose(): void {
    console.log(`🎯 [BaseToolbar ${this.toolbarId}] onClose() called`);
    this.visible = false;
    this.visibilityChange.emit(this.visible);
    console.log(
      `🎯 [BaseToolbar ${this.toolbarId}] Emitted visibilityChange: ${this.visible}`
    );
    this.emitStateChange();
    this.close.emit();
    console.log(`🎯 [BaseToolbar ${this.toolbarId}] Emitted close event`);
  }

  /**
   * Handle toolbar lock/unlock toggle
   */
  onToggleLock(): void {
    this.locked = !this.locked;
    this.emitStateChange();
    this.toggleLock.emit();
  }

  /**
   * Handle expand/condense toggle
   */
  onToggleExpanded(): void {
    this.expanded = !this.expanded;
    this.emitStateChange();
    this.toggleExpanded.emit();

    // Apply aggressive collapse enforcement after a short delay
    setTimeout(() => {
      this.enforceCollapseState();
    }, 10);
  }

  /**
   * Handle help overlay toggle
   */
  onToggleHelp(): void {
    this.showHelpOverlay = !this.showHelpOverlay;
  }

  /**
   * Load help text from service based on toolbarId
   */
  protected loadHelpText(): void {
    // Check if data is already loaded, otherwise wait for it
    if (this.toolbarHelpService.isLoaded()) {
      this.toolbarHelp = this.toolbarHelpService.getHelpSync(this.toolbarId);
    } else {
      // Subscribe to get help text when data is loaded
      this.toolbarHelpService.getHelp(this.toolbarId).subscribe((help) => {
        this.toolbarHelp = help;
      });
    }
  }

  /**
   * Close help overlay
   */
  onCloseHelp(): void {
    this.showHelpOverlay = false;
  }

  /**
   * Aggressively enforce the collapse state to handle CSS conflicts
   */
  private enforceCollapseState(): void {
    try {
      const toolbarElement = document.querySelector(
        `[data-toolbar-type="${this.toolbarId}"]`
      ) as HTMLElement;
      if (!toolbarElement) return;

      if (!this.expanded) {
        // Force collapsed state
        toolbarElement.classList.add('collapsed');

        // Find and hide all content sections
        const contentSelectors = [
          '.panel-content',
          '.content',
          '.tool-section',
          '.section',
          '.controls',
          '.button-grid',
          '.control-group',
          '.form-group',
          '.toolbar-content',
          '.main-content',
          '.body',
          '.panel-body',
          '.content-section',
          '.nodes-scroll-list',
          '.selection-tools-container',
          '.tenancy-container',
          '.lesson-controls',
          '.video-container',
        ];

        contentSelectors.forEach((selector) => {
          const elements = toolbarElement.querySelectorAll(selector);
          elements.forEach((element) => {
            (element as HTMLElement).classList.add('force-collapse-content');
          });
        });

        // Ensure header remains visible
        const header = toolbarElement.querySelector(
          '.panel-header'
        ) as HTMLElement;
        if (header) {
          header.style.display = 'flex';
          header.style.visibility = 'visible';
          header.style.opacity = '1';
        }
      } else {
        // Force expanded state
        toolbarElement.classList.remove('collapsed');

        // Remove forced collapse from all elements
        const collapsedElements = toolbarElement.querySelectorAll(
          '.force-collapse-content'
        );
        collapsedElements.forEach((element) => {
          element.classList.remove('force-collapse-content');
        });
      }
    } catch (error) {
      console.warn('Error enforcing collapse state:', error);
    }
  }

  /**
   * Handle drag start
   */
  onDragStart(event: MouseEvent): void {
    if (this.locked) {
      return;
    }

    this.isDragging = true;
    this.originalPosition = { ...this.position };
    this.dragOffset = {
      x: event.clientX - this.position.x,
      y: event.clientY - this.position.y,
    };

    // Add global mouse event listeners
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);

    // Prevent text selection during drag
    event.preventDefault();

    this.dragStart.emit(event);
  }

  /**
   * Handle drag move
   */
  private onDragMove = (event: MouseEvent): void => {
    if (!this.isDragging || this.locked) {
      return;
    }

    const newPosition: ToolbarPosition = {
      x: event.clientX - this.dragOffset.x,
      y: event.clientY - this.dragOffset.y,
    };

    // Apply collision detection if callback provided, otherwise just constrain to viewport
    let constrainedPosition: ToolbarPosition;
    if (this.applyConstraints) {
      // console.log(
      //   `[BaseToolbar ${this.toolbarId}] Calling applyConstraints with (${newPosition.x}, ${newPosition.y})`
      // );
      constrainedPosition = this.applyConstraints(
        newPosition.x,
        newPosition.y,
        this.toolbarId
      );
      // console.log(
      //   `[BaseToolbar ${this.toolbarId}] Got constrained position (${constrainedPosition.x}, ${constrainedPosition.y})`
      // );
    } else {
      // console.log(
      //   `[BaseToolbar ${this.toolbarId}] NO applyConstraints callback! Using viewport constraint only`
      // );
      constrainedPosition = this.constrainToViewport(newPosition);
    }

    this.position = constrainedPosition;
    this.positionChange.emit(this.position);
  };

  /**
   * Handle drag end
   */
  private onDragEnd = (event: MouseEvent): void => {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;

    // Remove global mouse event listeners
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);

    // Save final position
    this.saveToolbarState();
    this.emitStateChange();
  };

  /**
   * Handle vertical resize start
   */
  onResizeStart(event: MouseEvent): void {
    if (!this.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeStartY = event.clientY;
    this.resizeStartHeight = this.panelHeight;

    // Add global event listeners
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);

    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
  }

  /**
   * Handle vertical resize move
   */
  private onResizeMove = (event: MouseEvent): void => {
    if (!this.isResizing) return;

    const deltaY = event.clientY - this.resizeStartY;
    const newHeight = Math.max(
      this.minHeight,
      Math.min(this.maxHeight, this.resizeStartHeight + deltaY)
    );

    this.panelHeight = newHeight;
    this.heightChange.emit(newHeight);
  };

  /**
   * Handle vertical resize end
   */
  private onResizeEnd = (): void => {
    if (!this.isResizing) return;

    this.isResizing = false;

    // Remove global event listeners
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);

    // Restore text selection
    document.body.style.userSelect = '';

    // Save final height
    this.saveToolbarState();
    this.emitStateChange();
  };

  /**
   * Constrain toolbar position to viewport bounds
   */
  private constrainToViewport(position: ToolbarPosition): ToolbarPosition {
    const margin = 10; // Minimum margin from viewport edge
    const toolbar = document.querySelector(
      `[data-toolbar-type="${this.toolbarId}"]`
    ) as HTMLElement;

    if (!toolbar) {
      return position;
    }

    const rect = toolbar.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;

    return {
      x: Math.max(margin, Math.min(position.x, maxX)),
      y: Math.max(margin, Math.min(position.y, maxY)),
    };
  }

  /**
   * Rescue toolbar by showing it in the center of the viewport
   */
  protected rescueToolbar(): void {
    const centerX = window.innerWidth / 2 - 200; // Approximate toolbar width
    const centerY = window.innerHeight / 2 - 150; // Approximate toolbar height

    this.position = { x: centerX, y: centerY };
    this.visible = true;
    this.expanded = true;
    this.locked = false;

    this.positionChange.emit(this.position);
    this.visibilityChange.emit(this.visible);
    this.emitStateChange();
  }

  /**
   * Save toolbar state to localStorage
   */
  protected saveToolbarState(): void {
    const state: ToolbarState = {
      visible: this.visible,
      position: this.position,
      locked: this.locked,
      expanded: this.expanded,
    };

    // Include height if toolbar is resizable
    if (this.resizable) {
      state.height = this.panelHeight;
    }

    try {
      localStorage.setItem(
        `toolbar-${this.toolbarId}-state`,
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn(
        `Failed to save toolbar state for ${this.toolbarId}:`,
        error
      );
    }
  }

  /**
   * Load toolbar state from localStorage
   */
  protected loadToolbarState(): void {
    try {
      const savedState = localStorage.getItem(
        `toolbar-${this.toolbarId}-state`
      );
      if (savedState) {
        const state: ToolbarState = JSON.parse(savedState);

        // Only restore if values are valid
        if (
          state.position &&
          typeof state.position.x === 'number' &&
          typeof state.position.y === 'number'
        ) {
          this.position = this.constrainToViewport(state.position);
        }

        if (typeof state.locked === 'boolean') {
          this.locked = state.locked;
        }

        if (typeof state.expanded === 'boolean') {
          this.expanded = state.expanded;
        }

        // Restore height if toolbar is resizable
        if (this.resizable && typeof state.height === 'number') {
          this.panelHeight = Math.max(
            this.minHeight,
            Math.min(this.maxHeight, state.height)
          );
        }

        // NOTE: Do NOT restore visibility state from localStorage
        // Visibility is managed by the parent component via NGXS state binding
        // The parent controls visibility through [visible] input property
      }
    } catch (error) {
      console.warn(
        `Failed to load toolbar state for ${this.toolbarId}:`,
        error
      );
    }
  }

  /**
   * Emit complete state change
   */
  protected emitStateChange(): void {
    const state: ToolbarState = {
      visible: this.visible,
      position: this.position,
      locked: this.locked,
      expanded: this.expanded,
    };

    // Include height if toolbar is resizable
    if (this.resizable) {
      state.height = this.panelHeight;
    }

    this.stateChange.emit(state);
  }

  /**
   * Get CSS classes for the toolbar container
   */
  getToolbarClasses(): Record<string, boolean> {
    return {
      'draggable-toolbar': true,
      'dark-mode': this.isDarkMode,
      collapsed: !this.expanded,
      locked: this.locked,
      dragging: this.isDragging,
      resizing: this.isResizing,
      resizable: this.resizable,
    };
  }

  /**
   * Get inline styles for the toolbar container
   */
  getToolbarStyles(): Record<string, string> {
    const styles: Record<string, string> = {
      'left.px': this.position.x.toString(),
      'top.px': this.position.y.toString(),
      'z-index': this.isDragging ? '9999' : '1000',
    };

    // Apply dynamic height if resizable is enabled
    if (this.resizable) {
      styles['height.px'] = this.panelHeight.toString();
    }

    return styles;
  }

  /**
   * Get title for expand/collapse button
   */
  getExpandButtonTitle(): string {
    return this.expanded ? 'Collapse panel' : 'Expand panel';
  }

  /**
   * Get title for lock/unlock button
   */
  getLockButtonTitle(): string {
    return this.locked ? 'Unlock toolbar' : 'Lock toolbar';
  }

  /**
   * Get CSS classes for panel header
   */
  getHeaderClasses(): Record<string, boolean> {
    return {
      'panel-header': true,
      'drag-handle': true,
      locked: this.locked,
    };
  }

  /**
   * Check if child component has additional header buttons
   */
  hasAdditionalHeaderButtons(): boolean {
    return !!this.additionalHeaderButtons;
  }
}
