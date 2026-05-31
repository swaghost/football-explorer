/**
 * Toolbar Generator Utility
 *
 * This utility provides a systematic approach to adding new toolbars to the application
 * without the need for extensive debugging each time.
 */

export interface ToolbarConfig {
  key: string;
  displayName: string;
  icon: string;
  position: { x: number; y: number };
  side: 'left' | 'right';
  defaultVisible?: boolean;
  defaultLocked?: boolean;
}

export class ToolbarGenerator {
  /**
   * Generates the necessary code snippets for adding a new toolbar
   */
  static generateToolbarIntegration(
    config: ToolbarConfig
  ): ToolbarIntegrationCode {
    return {
      // 1. Add to interfaces in sketch.model.ts
      interfaceAdditions: {
        toolbarPositions: `  ${config.key}: { x: number; y: number };`,
        toolbarVisibility: `  ${config.key}: boolean;`,
        toolbarLocks: `  ${config.key}: boolean;`,
      },

      // 2. Add to initial state in sketch.model.ts
      initialStateAdditions: {
        toolbarPositions: `    ${config.key}: { x: ${config.position.x}, y: ${config.position.y} },`,
        toolbarVisibility: `    ${config.key}: ${
          config.defaultVisible ?? true
        },`,
        toolbarLocks: `    ${config.key}: ${config.defaultLocked ?? false},`,
      },

      // 3. Add to toolbarTypes array in main component
      toolbarTypesAddition: `    '${config.key}',`,

      // 4. Add to getToolbarIcon method
      iconCase: `      case '${config.key}':
        return '${config.icon}';`,

      // 5. Add to getToolbarDisplayName method
      displayNameCase: `      ${config.key}: '${config.displayName}',`,

      // 6. HTML template integration
      htmlTemplate: `    <!-- ${config.displayName} Panel (Component) -->
    <app-toolbar-${config.key} [visible]="toolbarVisibility.${
        config.key
      }" [isDarkMode]="isDarkMode"
        [position]="toolbarPositions.${config.key}" [locked]="toolbarLocks.${
        config.key
      }" [expanded]="${config.key}Expanded"
        [treeData]="treeData" (close)="hideToolbar('${
          config.key
        }')" (toggleLock)="toggleToolbarLock('${config.key}')"
        (dragStart)="onToolbarDragStart($event, '${
          config.key
        }')" (toggleExpanded)="toggle${this.capitalize(config.key)}Expanded()"
        (nodeSelected)="on${this.capitalize(config.key)}NodeSelected($event)">
    </app-toolbar-${config.key}>`,

      // 7. Component property and methods
      componentAdditions: {
        property: `  public ${config.key}Expanded: boolean = false;`,
        toggleMethod: `  public toggle${this.capitalize(
          config.key
        )}Expanded(): void {
    this.${config.key}Expanded = !this.${config.key}Expanded;
  }`,
        nodeSelectedMethod: `  public on${this.capitalize(
          config.key
        )}NodeSelected(node: any): void {
    // Handle node selection from ${config.displayName} toolbar
    this.selectNode(node);
  }`,
      },

      // 8. Import statement
      importStatement: `import { Toolbar${this.capitalize(
        config.key
      )}Component } from '../../toolbars/toolbar-${config.key}.component';`,

      // 9. Component imports array addition
      importsArrayAddition: `    Toolbar${this.capitalize(
        config.key
      )}Component,`,
    };
  }

  /**
   * Generates a complete toolbar component template
   */
  static generateComponentTemplate(config: ToolbarConfig): string {
    const componentName = `Toolbar${this.capitalize(config.key)}Component`;

    return `import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarPosition } from '../interfaces';

@Component({
  selector: 'app-toolbar-${config.key}',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <!-- ${config.displayName} Panel (Draggable) -->
    <div
      class="draggable-toolbar ${config.key}-panel"
      [class.dark-mode]="isDarkMode"
      [class.collapsed]="!expanded"
      [style.position]="'fixed'"
      [style.left.px]="safePosition.x"
      [style.top.px]="safePosition.y"
      [style.z-index]="'1000'"
      [style.background]="isDarkMode ? '#2d3748' : '#ffffff'"
      [style.border]="'2px solid ' + (isDarkMode ? '#4a5568' : '#e2e8f0')"
      [style.border-radius]="'8px'"
      [style.box-shadow]="'0 4px 6px rgba(0, 0, 0, 0.1)'"
      [style.min-width]="'300px'"
      [style.display]="visible ? 'block' : 'none'"
      *ngIf="visible"
      data-toolbar-type="${config.key}"
    >
      <div
        class="panel-header drag-handle"
        [class.locked]="locked"
        (mousedown)="onDragStart($event)"
      >
        <h3>${config.icon} ${config.displayName}</h3>
        <div class="header-actions">
          <button
            class="expand-toggle"
            (click)="onToggleExpanded()"
            [title]="expanded ? 'Collapse panel' : 'Expand panel'"
          >
            {{ expanded ? '🔼' : '🔽' }}
          </button>
          <button
            class="close-button"
            (click)="onClose()"
            title="Close toolbar"
          >
            ✖️
          </button>
        </div>
      </div>

      <div class="panel-content" [class.collapsed]="!expanded">
        <!-- Add your ${config.displayName} content here -->
        <p>This is the ${config.displayName} toolbar content.</p>
        <p>Add your specific functionality here.</p>
      </div>
    </div>
  \`,
  styles: [\`
    .${config.key}-panel {
      background: var(--toolbar-bg, #ffffff);
      border: 2px solid var(--toolbar-border, #e2e8f0);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 300px;
      max-height: 600px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .${config.key}-panel.dark-mode {
      background: var(--dark-toolbar-bg, #2d3748);
      border-color: var(--dark-toolbar-border, #4a5568);
      color: var(--dark-text, #e2e8f0);
    }
    
    .panel-header {
      background: var(--header-bg, #f7fafc);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      padding: 12px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .panel-header.locked {
      cursor: default;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .header-actions button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }
    
    .panel-content {
      padding: 16px;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .panel-content.collapsed {
      display: none;
    }
  \`]
})
export class ${componentName} implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() isDarkMode: boolean = false;
  @Input() position: ToolbarPosition | null = null;
  @Input() locked: boolean = false;
  @Input() expanded: boolean = true;
  @Input() treeData: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() toggleLock = new EventEmitter<void>();
  @Output() dragStart = new EventEmitter<MouseEvent>();
  @Output() toggleExpanded = new EventEmitter<void>();
  @Output() nodeSelected = new EventEmitter<any>();

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(changes: any): void {
    // Handle property changes
  }

  get safePosition(): ToolbarPosition {
    return this.position || { x: ${config.position.x}, y: ${config.position.y} };
  }

  onClose(): void {
    this.close.emit();
  }

  onToggleLock(): void {
    this.toggleLock.emit();
  }

  onDragStart(event: MouseEvent): void {
    this.dragStart.emit(event);
  }

  onToggleExpanded(): void {
    this.toggleExpanded.emit();
  }
}`;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export interface ToolbarIntegrationCode {
  interfaceAdditions: {
    toolbarPositions: string;
    toolbarVisibility: string;
    toolbarLocks: string;
  };
  initialStateAdditions: {
    toolbarPositions: string;
    toolbarVisibility: string;
    toolbarLocks: string;
  };
  toolbarTypesAddition: string;
  iconCase: string;
  displayNameCase: string;
  htmlTemplate: string;
  componentAdditions: {
    property: string;
    toggleMethod: string;
    nodeSelectedMethod: string;
  };
  importStatement: string;
  importsArrayAddition: string;
}

/**
 * Usage Example:
 *
 * const config: ToolbarConfig = {
 *   key: 'analytics',
 *   displayName: 'Analytics',
 *   icon: '📊',
 *   position: { x: 600, y: 200 },
 *   side: 'left',
 *   defaultVisible: true,
 *   defaultLocked: false
 * };
 *
 * const integration = ToolbarGenerator.generateToolbarIntegration(config);
 * const component = ToolbarGenerator.generateComponentTemplate(config);
 */
