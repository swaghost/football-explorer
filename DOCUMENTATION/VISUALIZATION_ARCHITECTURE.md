# Visualization Architecture Refactoring

## Overview

The visualization logic in `visualization-tester` has been abstracted into a service-based architecture using the Strategy Pattern. This allows for pluggable visualization types while maintaining all existing interactivity (pan, zoom, rotate, pan-to-node, select node).

## Architecture

### Core Interfaces (`src/app/interfaces/visualization.interfaces.ts`)

#### `IVisualizationStrategy`

Defines the contract for visualization layout algorithms. Each visualization type (radial tree, horizontal cluster, etc.) implements this interface.

**Key Methods:**

- `initializeLayout(dimensions)` - Set up the D3 layout with given dimensions
- `computeLayout(treeData)` - Calculate node and link positions
- `supports(visualizationType)` - Check if this strategy handles a given type

#### `IVisualizationRenderer`

Abstracts all D3 DOM manipulation and SVG rendering.

**Key Methods:**

- `initializeSvg(svgElement, dimensions)` - Set up SVG canvas and layer groups
- `renderNodes(nodes, options)` - Render nodes with smooth transitions
- `renderLinks(links, options)` - Render links with smooth transitions
- `applyTransform(transform, dimensions)` - Apply pan/zoom/rotate transformations
- `updateTheme(isDarkMode)` - Update colors for theme changes

#### `IInteractionHandler`

Encapsulates all user interaction logic (pan, zoom, rotate, select).

**Key Methods:**

- `setupZoomBehavior(svgElement, options)` - Configure D3 zoom/pan behavior
- `panToNode(nodeId, nodes, transform, dimensions)` - Animate pan to a specific node
- `resetTransform(dimensions)` - Reset to default view with animation
- `handleRotationDrag(event, currentRotation, dimensions)` - Handle Alt+drag rotation
- `updatePan(axis, value)` / `updateZoom(value)` - Programmatic control

### Services

#### `TreeVisualizationService`

**Purpose:** Manages tree-based visualization strategies and delegates layout computation.

**Implementation:**

- Contains 6 strategy implementations:
  - `RadialTreeStrategy`
  - `RadialClusterStrategy`
  - `HorizontalTreeStrategy`
  - `VerticalTreeStrategy`
  - `HorizontalClusterStrategy`
  - `VerticalClusterStrategy`

**Usage:**

```typescript
// Set visualization type and dimensions
treeVisualizationService.setVisualizationType("radialTree", {
  width: 800,
  height: 600,
  radius: 400,
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
});

// Compute layout
const result = treeVisualizationService.computeLayout(treeData);
// result.nodes: D3TreeNode[]
// result.links: Array<{source: {x, y}, target: {x, y}}>
```

#### `VisualizationInteractionService`

**Purpose:** Handles all user interactions with consistent behavior across visualization types.

**Features:**

- Separate handling of wheel zoom vs drag pan
- Smooth animations for pan-to-node
- Rotation via Alt+drag
- Transform state management
- D3 zoom behavior integration

**Usage:**

```typescript
// Setup zoom behavior
visualizationInteractionService.setupZoomBehavior(svgElement, {
  scaleExtent: [0.5, 5],
  onZoom: (transform) => {
    this.panX = transform.panX;
    this.panY = transform.panY;
    this.zoomLevel = transform.zoomLevel;
    this.applyTransform();
  },
  filter: (event) => /* custom filter logic */
});

// Pan to node with animation
visualizationInteractionService
  .panToNode(nodeId, nodes, currentTransform, dimensions)
  .subscribe({
    next: (transform) => { /* update UI */ },
    complete: () => { /* animation done */ }
  });
```

#### `VisualizationRendererService`

**Purpose:** Abstracts D3 SVG rendering with proper layering and transitions.

**Features:**

- Automatic layer management (links, nodes, labels)
- Enter/update/exit transitions
- Theme support
- Transform application
- Dimension updates

**Usage:**

```typescript
// Initialize SVG
visualizationRendererService.initializeSvg(svgElement, {
  width: 800,
  height: 600,
});

// Render nodes
visualizationRendererService.renderNodes(nodes, {
  visible: true,
  isDarkMode: false,
  selectedNodeId: "node-123",
  onNodeClick: (nodeId) => {
    /* handle click */
  },
});

// Render links
visualizationRendererService.renderLinks(links, {
  visible: true,
  isDarkMode: false,
});

// Apply transform
visualizationRendererService.applyTransform(
  {
    panX: 100,
    panY: 50,
    zoomLevel: 1.5,
    rotationAngle: 45,
  },
  dimensions
);
```

## Integration with visualization-tester

### Key Changes

1. **Service Injection**

```typescript
private treeVisualizationService = inject(TreeVisualizationService);
private visualizationInteractionService = inject(VisualizationInteractionService);
private visualizationRendererService = inject(VisualizationRendererService);
```

2. **Layout Initialization**

```typescript
private initializeVisualizationLayouts(): void {
  const dimensions = {
    width: this.width,
    height: this.height,
    radius: this.visualizationRadius,
    margin: { top: 40, right: 40, bottom: 40, left: 40 },
  };

  this.treeVisualizationService.setVisualizationType(
    this.selectedVisualization,
    dimensions
  );

  // Legacy D3 layouts kept for backward compatibility
  // ...
}
```

3. **Update Visualization**

```typescript
private updateVisualization(): void {
  const dimensions = { /* ... */ };

  this.treeVisualizationService.setVisualizationType(
    this.selectedVisualization,
    dimensions
  );

  const layoutResult = this.treeVisualizationService.computeLayout(this.treeData);

  if (layoutResult) {
    this.treeNodes = layoutResult.nodes;
    this.treeLinks = layoutResult.links;
    this.transitionToNewLayout(layoutResult.nodes, layoutResult.links);
  }
}
```

4. **Pan/Zoom Handling**

```typescript
updatePan(event: Event, axis: 'x' | 'y') {
  const value = parseFloat((event.target as HTMLInputElement).value);
  this.visualizationInteractionService.updatePan(axis, value);
  // ...
}

updateZoom(event: Event) {
  const zoomLevel = parseFloat((event.target as HTMLInputElement).value);
  this.visualizationInteractionService.updateZoom(zoomLevel);
  // ...
}
```

5. **Pan-to-Node**

```typescript
panToNode(node: D3TreeNode): void {
  const dimensions = { width: this.width, height: this.height };
  const currentTransform = this.visualizationInteractionService.getTransform();

  this.visualizationInteractionService
    .panToNode(node.id, this.treeNodes, currentTransform, dimensions)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (transform) => {
        this.panX = transform.panX;
        this.panY = transform.panY;
        this.applyTransform();
        this.cdr.detectChanges();
      }
    });
}
```

6. **Rotation**

```typescript
private startRotationDrag(event: MouseEvent) {
  const dimensions = { width: this.width, height: this.height };

  this.visualizationInteractionService
    .handleRotationDrag(event, this.rotationAngle, dimensions)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (newRotation) => {
        this.rotationAngle = Math.round(newRotation);
        this.applyTransform();
      }
    });
}
```

7. **Cleanup**

```typescript
ngOnDestroy(): void {
  this.visualizationInteractionService.destroy();
  this.visualizationRendererService.destroy();
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Benefits

### 1. **Separation of Concerns**

- Layout computation (TreeVisualizationService)
- Interaction handling (VisualizationInteractionService)
- Rendering (VisualizationRendererService)
- Component orchestration (visualization-tester)

### 2. **Extensibility**

Add new visualization types by implementing `IVisualizationStrategy`:

```typescript
@Injectable({ providedIn: "root" })
export class ForceDirectedStrategy implements IVisualizationStrategy {
  readonly type = "forceDirected";

  supports(visualizationType: string): boolean {
    return visualizationType === "forceDirected";
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    // D3 force simulation setup
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    // Force-directed layout calculation
  }
}
```

Register in `TreeVisualizationService` constructor:

```typescript
constructor(
  private forceDirected: ForceDirectedStrategy,
  // ... other strategies
) {
  this.strategies = [
    forceDirected,
    // ... other strategies
  ];
}
```

### 3. **Testability**

Services can be unit tested independently:

```typescript
describe("TreeVisualizationService", () => {
  it("should compute radial tree layout", () => {
    const service = new TreeVisualizationService(/* ... */);
    service.setVisualizationType("radialTree", dimensions);
    const result = service.computeLayout(mockTreeData);

    expect(result.nodes).toHaveLength(expectedCount);
    expect(result.links).toBeDefined();
  });
});
```

### 4. **Reusability**

Services can be used in other components (e.g., `d3-ui-vers6`):

```typescript
@Component({
  /* ... */
})
export class D3UiVers6 {
  private treeVisualizationService = inject(TreeVisualizationService);
  private visualizationInteractionService = inject(VisualizationInteractionService);

  // Same service-based implementation
}
```

### 5. **Maintainability**

- Visualization logic centralized in services
- Component code cleaner and focused on orchestration
- Easy to trace bugs to specific service
- Legacy code preserved during transition

## Backward Compatibility

The refactoring maintains backward compatibility:

1. **Legacy D3 layouts preserved** - Original layout properties kept for existing code that references them
2. **Dual zoom behavior** - Both service-based and direct D3 zoom handlers coexist during transition
3. **Fallback to PanToNodeService** - If new service unavailable, falls back to original implementation
4. **No HTML/template changes** - All existing event bindings work unchanged

## Migration Path

To fully migrate a component to the new architecture:

1. **Inject services**
2. **Replace direct D3 calls with service methods**
3. **Update initialization to use `TreeVisualizationService`**
4. **Migrate pan/zoom/rotate to `VisualizationInteractionService`**
5. **Optional: Use `VisualizationRendererService` for rendering**
6. **Clean up legacy code once verified working**

## Future Enhancements

1. **Additional visualizations:**

   - Force-directed graph
   - Treemap
   - Sunburst
   - Network graph

2. **Advanced interactions:**

   - Multi-touch gestures
   - Fisheye distortion
   - Focus+context views
   - Animated transitions between layouts

3. **Performance optimizations:**

   - Virtual rendering for large trees
   - WebGL-based rendering
   - Web Workers for layout computation

4. **Accessibility:**
   - Keyboard navigation
   - Screen reader support
   - High contrast themes

## Conclusion

This refactoring establishes a solid foundation for visualization in the application. The service-based architecture with Strategy Pattern allows easy addition of new visualization types while maintaining all existing functionality. The separation of concerns improves code quality, testability, and maintainability.
