# NgXS State Management Implementation

This application now uses NgXS for comprehensive state management with automatic local storage persistence. When you refresh or return to the page, all your settings and drawing data will be restored exactly as you left them.

## Features

### State Management

- **NgXS Store**: Centralized state management for all application data
- **Local Storage Persistence**: Automatic saving and loading of state from browser local storage
- **Real-time Updates**: All UI elements automatically update when state changes

### Persisted State Properties

All of the following properties are automatically saved and restored:

#### Canvas & Visualization

- `zoomLevel`: Current zoom level (0.5x to 5x)
- `panX` / `panY`: Pan position coordinates
- `nodeCount`: Number of visualization nodes (5-100)
- `rotationAngle`: Current rotation angle (0-360°)

#### Drawing Tools

- `drawingMode`: Current tool mode ('pencil', 'eraser', 'pan')
- `selectedColor`: Selected drawing color
- `brushSize`: Pencil brush size (1-20px)
- `eraserSize`: Eraser size (5-50px)
- `eraserMode`: Eraser type ('normal' or 'magic')

#### Theme & UI

- `isDarkMode`: Light/dark theme setting
- `selectedNode`: Currently selected node (if any)
- `strokes`: All drawing strokes and artwork

## Technical Implementation

### State Structure

```typescript
interface SketchStateModel {
  // Canvas and visualization
  zoomLevel: number;
  panX: number;
  panY: number;
  nodeCount: number;
  rotationAngle: number;

  // Drawing properties
  drawingMode: "pencil" | "eraser" | "pan";
  selectedColor: string;
  brushSize: number;
  eraserSize: number;
  eraserMode: "normal" | "magic";

  // Theme and UI
  isDarkMode: boolean;
  selectedNode: string | null;

  // Drawing data
  strokes: DrawingStroke[];
}
```

### Key Files

#### State Management

- `src/app/state/sketch.model.ts` - State interface and initial state
- `src/app/state/sketch.actions.ts` - All NgXS actions for state updates
- `src/app/state/sketch.state.ts` - NgXS state class with selectors and action handlers
- `src/app/state/index.ts` - Barrel exports

#### Configuration

- `src/app/app.config.ts` - NgXS store setup with storage plugin configuration

#### Component Integration

- Component uses NgXS selectors via observables with async pipe
- All user actions dispatch NgXS actions instead of direct property updates
- State changes automatically trigger UI updates and persistence

### Actions Available

#### Canvas Controls

- `UpdateZoom(zoomLevel: number)`
- `UpdatePan(panX: number, panY: number)`
- `UpdateNodeCount(nodeCount: number)`
- `UpdateRotation(rotationAngle: number)`

#### Drawing Tools

- `SetDrawingMode(mode: 'pencil' | 'eraser' | 'pan')`
- `SetSelectedColor(color: string)`
- `UpdateBrushSize(size: number)`
- `UpdateEraserSize(size: number)`
- `SetEraserMode(mode: 'normal' | 'magic')`

#### Theme & UI

- `ToggleTheme()`
- `SetTheme(isDarkMode: boolean)`
- `SetSelectedNode(nodeId: string | null)`

#### Drawing Data

- `AddStroke(stroke: DrawingStroke)`
- `UpdateStroke(strokeId: string, points: Point[])`
- `RemoveStroke(strokeId: string)`
- `SetStrokes(strokes: DrawingStroke[])`
- `ClearAllStrokes()`

#### Utility Actions

- `LoadState(state: Partial<SketchStateModel>)`
- `ResetState()`

## Storage Configuration

The NgXS storage plugin is configured to:

- Store only the 'sketch' state slice
- Use `localStorage` for persistence (survives browser restarts)
- Automatically serialize/deserialize complex objects
- Handle deep state merging on app initialization

## Usage

### State Restoration

1. **Automatic**: When you return to the page, all settings are automatically restored
2. **Immediate**: State is loaded before the UI initializes
3. **Seamless**: No loading delays or flickering

### Persistence Timing

- **Real-time**: Every state change is immediately persisted
- **Debounced**: Storage writes are optimized to prevent performance issues
- **Reliable**: Uses browser's native localStorage API

### Testing State Persistence

1. Open the application
2. Make changes to any controls (zoom, pan, colors, drawing mode, theme, etc.)
3. Create some drawings
4. Refresh the page or close/reopen the browser tab
5. Observe that everything is restored exactly as you left it

## Benefits

### User Experience

- **Continuity**: Never lose your work or settings
- **Convenience**: No need to reconfigure preferences each visit
- **Reliability**: State survives browser crashes, refreshes, and restarts

### Development

- **Predictable**: Centralized state makes debugging easier
- **Scalable**: Easy to add new state properties
- **Maintainable**: Clean separation of state logic from UI components
- **Testable**: NgXS provides excellent testing utilities

### Performance

- **Optimized**: Only changed state is persisted
- **Efficient**: Minimal memory footprint
- **Fast**: No unnecessary re-renders or state calculations

## Troubleshooting

### Clearing Stored State

If you need to reset all stored state:

```javascript
// In browser console
localStorage.removeItem("@@STATE");
// Then refresh the page
```

### Checking Stored State

To inspect what's stored:

```javascript
// In browser console
JSON.parse(localStorage.getItem("@@STATE") || "{}");
```

### State Not Persisting

If state isn't saving properly:

1. Check browser console for errors
2. Verify localStorage is available and not disabled
3. Check if storage quota is exceeded
4. Ensure NgXS storage plugin is properly configured
