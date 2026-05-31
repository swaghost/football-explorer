# Visualization Strategy Pattern Implementation

## Overview

This document describes the architectural implementation of the Strategy Pattern for D3 visualizations in the application. The implementation allows for flexible, extensible visualization types while maintaining consistent interaction patterns (pan, zoom, rotate, node selection).

## Architecture

### 1. Core Interfaces (`interfaces/visualization-strategy.interface.ts`)

#### `IVisualizationStrategy`

The main interface that all visualization strategies must implement:

- **Metadata**: `type`, `name`, `icon` for UI representation
- **Options**: `getOptions()` returns configurable parameters for this visualization
- **Lifecycle**: `initialize()` and `update()` for rendering
- **Interaction**: `applyTransform()`, `calculatePanToNodePosition()`, `generateLinkPath()`
- **Properties**: `supportsRotation()`, `isRadial()`, `getNodeRadius()`

#### Configuration Interfaces

- `VisualizationConfig` - Base configuration (width, height, isDarkMode, treeVisible)
- `RadialVisualizationConfig` - Adds `radius` for radial layouts
- `CartesianVisualizationConfig` - Adds `margin` for cartesian layouts
- `SunburstVisualizationConfig` - Adds `radius` and `radiusMultiplier`
- `ForceDirectedConfig` - Adds force simulation parameters

#### `VisualizationOptions`

Defines configurable sliders for each visualization type:

```typescript
{
  radius?: { min, max, default, step, label }
  width?: { min, max, default, step, label }
  height?: { min, max, default, step, label }
  radiusMultiplier?: { min, max, default, step, label }
  chargeStrength?: { min, max, default, step, label }
  linkDistance?: { min, max, default, step, label }
}
```

### 2. Visualization Service (`services/visualization.service.ts`)

Central service for managing visualization strategies:

- **Registry**: Maintains a map of all registered strategies
- **Current Strategy**: Tracks the active visualization
- **Delegation**: All visualization operations delegate to the current strategy
- **Options**: Exposes current visualization's configurable options

Key Methods:

- `registerStrategy(strategy)` - Register a new visualization type
- `setCurrentStrategy(type)` - Switch to a different visualization
- `getCurrentOptions()` - Get options for current visualization
- `initialize(data, config)` - Initialize current visualization
- `update(data, config)` - Update current visualization
- `applyTransform(g, transform, config)` - Apply pan/zoom/rotate
- `calculatePanToNodePosition(node, config)` - Calculate pan target

### 3. Base Strategy (`services/visualization-strategies/base-visualization-strategy.ts`)

Abstract base class providing common functionality:

- Default transform logic (pan/zoom/rotate from center)
- Default pan-to-node calculation (center the node)
- Default node radius calculation (root=16px, others=12px)
- Helper methods for creating D3 hierarchies
- Common node mapping logic

### 4. Implemented Strategies

#### RadialTreeStrategy (`radial-tree-strategy.ts`)

- **Type**: `radialTree`
- **Layout**: D3 tree with radial coordinates
- **Options**: Radius (100-1000px, default 400px)
- **Features**: Supports rotation, curved radial links
- **Link Path**: Quadratic curves toward center

#### HorizontalTreeStrategy (`horizontal-tree-strategy.ts`)

- **Type**: `treeHorizontal`
- **Layout**: Left-to-right tree
- **Options**: Width (400-3000px), Height (300-2000px)
- **Features**: No rotation, D3 linkHorizontal for curves
- **Coordinates**: X and Y swapped for horizontal orientation

#### VerticalTreeStrategy (`vertical-tree-strategy.ts`)

- **Type**: `treeVertical`
- **Layout**: Top-to-bottom tree
- **Options**: Width (400-3000px), Height (300-2000px)
- **Features**: No rotation, D3 linkVertical for curves
- **Coordinates**: Standard X/Y orientation

#### ZoomableSunburstStrategy (`zoomable-sunburst-strategy.ts`)

- **Type**: `zoomableSunburst`
- **Layout**: D3 partition with arc generator
- **Options**: Radius (100-1000px), Radius Multiplier (0.5-3x)
- **Features**: Supports rotation, click-to-zoom arcs
- **Rendering**: Uses arc paths instead of node circles
- **Special Methods**: `generateArcPath()`, `arcVisible()`, `labelTransform()`

#### ForceDirectedStrategy (`force-directed-strategy.ts`)

- **Type**: `forceDirected`
- **Layout**: Physics-based force simulation
- **Options**: Charge Strength (-1000 to -100), Link Distance (50-300px)
- **Status**: Placeholder implementation
- **Features**: No rotation, straight line links
- **TODO**: Implement full force simulation with animated updates

### 5. Toolbar Integration

#### ToolbarVisualizationOptionsComponent

Enhanced with dynamic options support:

**New Inputs**:

- `currentVisualizationOptions: VisualizationOptions` - Options for current viz
- `radiusValue`, `widthValue`, `heightValue`, etc. - Current option values

**New Outputs**:

- `radiusChange`, `widthChange`, `heightChange`, etc. - Option change events

**Helper Methods**:

- `hasRadiusOption()`, `hasWidthOption()`, etc. - Check which options to show

**Dynamic UI**:
The toolbar automatically shows/hides option sliders based on the selected visualization:

- Radial Tree → Radius slider
- Horizontal/Vertical Tree → Width + Height sliders
- Sunburst → Radius + Radius Multiplier sliders
- Force-Directed → Charge Strength + Link Distance sliders

## Usage Pattern

### 1. Initialize Strategies

```typescript
constructor(private visualizationService: VisualizationService) {
  // Register all strategies
  this.visualizationService.registerStrategy(new RadialTreeStrategy());
  this.visualizationService.registerStrategy(new HorizontalTreeStrategy());
  this.visualizationService.registerStrategy(new VerticalTreeStrategy());
  this.visualizationService.registerStrategy(new ZoomableSunburstStrategy());
  this.visualizationService.registerStrategy(new ForceDirectedStrategy());

  // Set default
  this.visualizationService.setCurrentStrategy('radialTree');
}
```

### 2. Switch Visualization

```typescript
onVisualizationChange(type: string) {
  this.visualizationService.setCurrentStrategy(type);

  // Get new options for toolbar
  this.currentVisualizationOptions = this.visualizationService.getCurrentOptions();

  // Re-render
  this.updateVisualization();
}
```

### 3. Render Visualization

```typescript
updateVisualization() {
  const config: VisualizationConfig = {
    width: this.width,
    height: this.height,
    isDarkMode: this.isDarkMode,
    treeVisible: this.treeVisible,
    radius: this.radiusValue,  // For radial visualizations
    margin: { top: 40, right: 40, bottom: 40, left: 40 }  // For cartesian
  };

  const result = this.visualizationService.update(this.treeData, config);

  if (result) {
    this.treeNodes = result.nodes;
    this.treeLinks = result.links;
    this.drawTree(result.nodes, result.links);
  }
}
```

### 4. Apply Transform

```typescript
applyTransform() {
  const transform: TransformState = {
    panX: this.panX,
    panY: this.panY,
    zoomLevel: this.zoomLevel,
    rotationAngle: this.rotationAngle
  };

  const config: VisualizationConfig = {
    width: this.width,
    height: this.height,
    isDarkMode: this.isDarkMode,
    treeVisible: this.treeVisible
  };

  this.visualizationService.applyTransform(this.g, transform, config);
}
```

### 5. Pan to Node

```typescript
panToNode(node: D3TreeNode) {
  const config: VisualizationConfig = { ... };
  const position = this.visualizationService.calculatePanToNodePosition(node, config);

  if (position) {
    this.panX = position.x;
    this.panY = position.y;
    this.applyTransform();
  }
}
```

## Benefits

### 1. Extensibility

Adding a new visualization type requires:

1. Create a new strategy class implementing `IVisualizationStrategy`
2. Register it in the service
3. Add to visualization dropdown options
4. No changes to existing code!

### 2. Maintainability

- Each visualization's logic is isolated in its own class
- Common functionality is shared in base class
- Clear separation of concerns

### 3. Consistency

- All visualizations support the same interaction patterns
- Pan, zoom, and node selection work identically across types
- Rotation is automatically enabled/disabled based on visualization

### 4. Flexibility

- Each visualization can have its own configurable options
- Options are dynamically shown/hidden in the toolbar
- Easy to add new options to existing visualizations

### 5. Testability

- Each strategy can be unit tested independently
- Service can be mocked for component testing
- Clear contracts via interfaces

## Future Enhancements

### 1. Complete Force-Directed Implementation

- Implement full D3 force simulation
- Add animated transitions
- Support for dragging nodes
- Real-time force adjustments

### 2. Additional Visualizations

- Radial Cluster (compact variant)
- Treemap
- Icicle (horizontal partition)
- Circle Pack
- Network Graph (non-hierarchical)

### 3. Advanced Options

- Color schemes per visualization
- Animation speed controls
- Label positioning options
- Custom node sizing strategies

### 4. Persistence

- Save user preferences per visualization
- Remember last used settings
- Export/import visualization configurations

### 5. Performance

- Virtual rendering for large trees
- Level-of-detail adjustments
- Progressive rendering
- WebGL acceleration for force-directed

## Integration Checklist

To integrate into visualization-tester component:

- [x] Create strategy interfaces
- [x] Implement base strategy class
- [x] Implement RadialTreeStrategy
- [x] Implement HorizontalTreeStrategy
- [x] Implement VerticalTreeStrategy
- [x] Implement ZoomableSunburstStrategy
- [x] Create ForceDirectedStrategy placeholder
- [x] Create VisualizationService
- [x] Update toolbar component with dynamic options
- [ ] Inject VisualizationService into visualization-tester
- [ ] Register all strategies on init
- [ ] Update visualization dropdown to use strategies
- [ ] Replace current visualization logic with strategy calls
- [ ] Wire up dynamic option changes to config
- [ ] Test all visualization types
- [ ] Test pan/zoom/rotate for each type
- [ ] Test node selection across visualizations
- [ ] Update documentation

## Files Created

1. `src/app/interfaces/visualization-strategy.interface.ts` - Core interfaces
2. `src/app/services/visualization.service.ts` - Strategy manager
3. `src/app/services/visualization-strategies/base-visualization-strategy.ts` - Base class
4. `src/app/services/visualization-strategies/radial-tree-strategy.ts` - Radial tree
5. `src/app/services/visualization-strategies/horizontal-tree-strategy.ts` - Horizontal tree
6. `src/app/services/visualization-strategies/vertical-tree-strategy.ts` - Vertical tree
7. `src/app/services/visualization-strategies/zoomable-sunburst-strategy.ts` - Sunburst
8. `src/app/services/visualization-strategies/force-directed-strategy.ts` - Force-directed placeholder
9. `src/app/services/visualization-strategies/index.ts` - Barrel export
10. Updated: `src/app/components/toolbars/toolbar-visualization-options/` - Dynamic options

## Conclusion

This architecture provides a robust, extensible foundation for managing multiple D3 visualizations while maintaining consistent user interactions. The Strategy Pattern allows easy addition of new visualization types without modifying existing code, and the dynamic options system ensures users only see relevant controls for each visualization type.
