// Base Toolbar Component Exports
export { BaseToolbarComponent } from './base-toolbar.component';

// Example implementation
export { ExampleToolbarComponent } from './example-toolbar.component';

// Types and interfaces used by base toolbar
export interface ToolbarPosition {
  left: number;
  top: number;
}

export interface ToolbarState {
  isVisible?: boolean;
  isDarkMode?: boolean;
  isLocked?: boolean;
  isCollapsed?: boolean;
}

// Default configuration
export const DEFAULT_TOOLBAR_POSITION: ToolbarPosition = {
  left: 20,
  top: 20,
};

export const DEFAULT_TOOLBAR_STATE: Required<ToolbarState> = {
  isVisible: true,
  isDarkMode: false,
  isLocked: false,
  isCollapsed: false,
};
