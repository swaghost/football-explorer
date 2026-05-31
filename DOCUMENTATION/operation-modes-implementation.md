# Operation Modes Implementation

This document describes the implementation of the configurable operation modes system for D3UIV6, allowing users to quickly switch between different toolbar configurations for specific workflows.

## Files Created

### 1. `src/app/interfaces/operation-mode.interfaces.ts`

Defines the TypeScript interfaces for the operation modes system:

- **`OperationMode`**: Main interface defining a mode with id, name, icon, description, tooltip, and visibleToolbars array
- **`OperationModeConfig`**: Configuration interface for the entire system with modes array, defaultMode, and rememberLastMode settings
- **`OperationModeButton`**: Interface for button-specific properties like tooltips and colors

### 2. `src/app/config/operation-modes.config.json`

JSON configuration file defining the available operation modes:

- **Team Builder**: Shows team management toolbars (teams, team groups, rosters)
- **Dataset Builder**: Shows dataset creation and navigation tools
- **Lesson Builder**: Shows lesson creation with drawing and selection tools
- **Lesson Mode**: Shows lesson execution and learning tools
- **Explorer Mode**: Shows free exploration with drawing and navigation tools

### 3. `src/app/services/operation-mode.service.ts`

Angular service managing operation mode state and behavior:

- **State Management**: Uses Angular signals for reactive state updates
- **Configuration Loading**: Automatically loads modes from config file
- **Persistence**: Saves/loads active mode to/from localStorage
- **Toolbar Visibility**: Provides computed signal for checking toolbar visibility
- **Mode Switching**: Methods for activating, deactivating, and toggling modes

### 4. Updated `dr-ui-vers6` Component

Modified the main D3UIV6 component to integrate operation modes:

#### HTML Template (`d3-ui-vers6.html`)

- Added operation mode buttons in bottom toolbar center section
- Buttons display mode icon and name, with active state styling
- Positioned between breadcrumb navigation (left) and key indicators (right)

#### TypeScript Component (`d3-ui-vers6.ts`)

- Injected `OperationModeService` in constructor
- Added methods for handling mode clicks and checking active state
- Added tooltip generation for mode buttons

#### SCSS Styles (`d3-ui-vers6.scss`)

- Added `.bottom-toolbar-center` section for operation mode buttons
- Styled `.operation-mode-btn` with hover and active states
- Responsive design hides button text on smaller screens
- Dark mode support with different color schemes

### 5. Updated Index Files

- Added operation mode service export to `src/app/services/index.ts`
- Added operation mode interfaces export to `src/app/interfaces/index.ts`

## Features

### Configuration-Driven

- All operation modes defined in JSON configuration file
- Easy to add new modes or modify existing ones
- No code changes required for basic mode configuration

### Reactive State Management

- Uses Angular signals for efficient state updates
- Computed properties automatically update when state changes
- Service provides read-only signals to prevent external mutation

### Persistence

- Remembers last selected mode across browser sessions
- Configurable via `rememberLastMode` setting
- Uses localStorage for persistence

### Toolbar Visibility Control

- Each mode defines which toolbars should be visible
- When no mode is active, all toolbars are shown
- Provides computed function to check if specific toolbar should be visible

### Visual Feedback

- Active mode highlighted with distinct styling
- Hover effects for better user interaction
- Icons and text provide clear mode identification
- Responsive design for different screen sizes

### Extensible Design

- Easy to add new operation modes
- Support for custom icons, colors, and categories
- Configurable tooltips and descriptions
- Button-specific styling options

## Usage

### For Users

1. Look at the bottom toolbar center section for operation mode buttons
2. Click any mode button to activate that mode's toolbar configuration
3. Click the same button again to deactivate the mode (shows all toolbars)
4. The selected mode persists across browser sessions

### For Developers

1. **Add New Mode**: Edit `operation-modes.config.json` and add new mode object
2. **Modify Existing Mode**: Update the mode configuration in the JSON file
3. **Change Default Mode**: Update `defaultMode` property in config
4. **Disable Persistence**: Set `rememberLastMode` to false in config

### Checking Toolbar Visibility

The operation mode service provides a computed function to check if a toolbar should be visible:

```typescript
// In any component that needs to check visibility
constructor(private operationModeService: OperationModeService) {}

shouldShowToolbar(toolbarId: string): boolean {
  return this.operationModeService.isToolbarVisible()(toolbarId);
}
```

## Implementation Benefits

1. **User Experience**: Quick switching between workflow-specific tool sets
2. **Reduced Clutter**: Only shows relevant toolbars for current task
3. **Workflow Optimization**: Predefined modes for common use cases
4. **Flexibility**: Easy configuration without code changes
5. **Persistence**: Remembers user preferences
6. **Performance**: Efficient signal-based reactive updates
7. **Maintainability**: Clean separation of configuration and logic

## Future Enhancements

1. **Custom Mode Creation**: Allow users to create their own operation modes
2. **Mode Categories**: Group modes by workflow type
3. **Keyboard Shortcuts**: Add hotkeys for quick mode switching
4. **Visual Themes**: Different color schemes per mode
5. **Mode Analytics**: Track usage patterns for optimization
6. **Export/Import**: Share operation mode configurations
7. **Context-Sensitive Modes**: Auto-suggest modes based on current state

## Technical Notes

- The service automatically initializes on application startup
- Configuration is loaded synchronously from JSON file
- All state changes emit custom events for external integrations
- The system is designed to be framework-agnostic at the core
- TypeScript provides full type safety for configuration and state
- Angular signals ensure efficient change detection and updates
