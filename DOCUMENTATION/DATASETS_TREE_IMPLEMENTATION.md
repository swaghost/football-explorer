# Datasets Drawer - D3 Tree Implementation

## Overview

The datasets drawer has been converted from a tab-based list view to a hierarchical D3 collapsible tree visualization, similar to `D3ExampleCollapsibleTree`. This provides a more intuitive way to browse datasets organized by ownership context, teams, and team groups.

**Tenant Context Filtering:** The drawer automatically filters datasets based on the currently selected tenant, showing only:

- System datasets (Context === -1)
- Personal datasets (Context === 0)
- Datasets belonging to the current tenant and its teams/team groups

The tree refreshes automatically when the tenant or login context changes.

## Implementation Date

November 6, 2025

## Tree Structure

### Hierarchy

```
Root: "Available Datasets"
├── System (n)
│   └── Dataset 1, Dataset 2, ...
├── Personal (n)
│   └── Dataset 1, Dataset 2, ...
└── Tenant (n)
    ├── Team 1
    │   ├── TeamGroup A
    │   │   └── Dataset 1, Dataset 2, ...
    │   └── TeamGroup B
    │       └── Dataset 3, Dataset 4, ...
    └── Team 2
        └── TeamGroup C
            └── Dataset 5, Dataset 6, ...
```

### Node Types

1. **Root** - "Available Datasets" (📊)
2. **Context** - System, Personal, Tenant (📁)
3. **Team** - Individual teams within Tenant context (🏀)
4. **TeamGroup** - Team groups within teams (👥)
5. **Dataset** - Individual DecisionFlow datasets (📄)

## Files Modified

### 1. drawer-datasets.ts

**Changes:**

- Added D3.js imports and types
- Added `DatasetTreeNode` interface for tree structure
- Added `@ViewChild('treeContainer')` for SVG container
- Added `@Input() teams` and `@Input() teamGroups` for hierarchy building
- Added D3 properties: `svg`, `root`, `duration`, `nodeHeight`, `indent`

**Key Methods:**

#### `buildTreeData(): DatasetTreeNode`

Constructs the hierarchical tree structure from flat dataset list:

- **Root Node**: "Available Datasets"
- **System Datasets**: `ContextName === 'SYS' && Context === -1`
- **Personal Datasets**: `ContextName === 'PERSONAL' || (ContextName === 'SYS' && Context === 0)`
- **Tenant Datasets**: Groups by `TENANT` → `TEAM` → `TEAMGROUP`
  - Uses `teamMap` to organize datasets by parent team
  - Resolves TeamGroup → Team relationship via `teamGroup.OwnershipContext.Context`
  - Only shows teams/groups that contain datasets

#### `initializeSvg()`

Creates SVG container:

- Width: 100% of container
- Height: 500px
- Transform group for tree positioning

#### `updateTree()`

Updates tree visualization:

- Converts data to `d3.hierarchy`
- Expands root level, collapses all grandchildren
- Triggers re-render

#### `update(source: any)`

Renders tree with animations:

- Calculates node positions (24px vertical spacing, 20px indent)
- Updates links with smooth transitions
- Updates nodes with expand/collapse animations
- Duration: 250ms

#### `updateLinks(links: any[], source: any)`

Draws connection lines:

- Uses D3 enter/update/exit pattern
- Animates from source position
- Smooth transitions between states

#### `updateNodes(nodes: any[], source: any)`

Renders tree nodes:

- Draws circles for nodes
- Adds emoji icons based on type
- Displays labels with counts
- Adds expand/collapse toggle buttons (+/-)
- Highlights selected dataset (bold blue text)

#### `handleNodeClick(event: MouseEvent, d: any)`

Handles node interactions:

- **Dataset nodes**: Dispatches `SetSelectedContextDataset` action and updates the tree
  - Special handling for FlowID === -1: Marks dataset for regeneration
  - Parent component handles actual regeneration based on state change
- **Parent nodes**: Toggles expand/collapse

#### `getFilteredDatasetsByTenant()`

Filters datasets by current tenant context:

- **No tenant selected**: Shows only System (Context === -1) and Personal (Context === 0)
- **Tenant selected**: Shows System, Personal, current tenant, and teams/teamgroups within tenant
  - Gets team IDs for current tenant
  - Gets teamgroup IDs for those teams
  - Filters datasets to match tenant context hierarchy
- **Automatic refresh**: Triggered by ngOnChanges when selectedOrganizationId changes

### 2. drawer-datasets.html

**Changes:**

- Removed tab-based UI (tabs-container, datasets-list)
- Added single tree container: `<div #treeContainer class="tree-container"></div>`
- Kept action buttons section unchanged

### 3. drawer-datasets.scss

**Changes:**

- Removed tab and list styles
- Added tree-specific styles:
  - `.tree-container`: Scrollable container
  - `.link`: Connection lines
  - `.node`: Node styles with hover effects
  - `.node-icon`: Emoji icons
  - `.node-label`: Text labels with selection state
  - `.toggle-button`: Expand/collapse controls
  - Node type classes: `.node-root`, `.node-context`, `.node-team`, `.node-teamgroup`, `.node-dataset`
- Added dark mode overrides for tree elements

### 4. d3-ui-vers6.html

**Changes:**

- Added `[teams]="teams"` binding to datasets drawer
- Added `[teamGroups]="teamGroups"` binding to datasets drawer

## Visual Design

### Light Mode

- Background: White (#fff)
- Links: Light gray (#dee2e6)
- Nodes: White circles with colored borders
  - Root/Context: Blue (#007bff)
  - Team: Teal (#17a2b8)
  - TeamGroup: Yellow (#ffc107)
  - Dataset: Blue (#007bff)
- Selected: Light blue background (#e7f3ff), bold blue text
- Hover: Light gray fill (#f8f9fa)

### Dark Mode

- Background: Dark gray (#2d2d2d)
- Links: Dark gray (#444)
- Nodes: Dark circles with colored borders
  - Root/Context: Light blue (#4d9fff)
  - Team: Cyan (#3bc2d8)
  - TeamGroup: Yellow (#ffd454)
  - Dataset: Light blue (#4d9fff)
- Selected: Dark blue background (#1a3a5a), light blue text
- Hover: Medium gray fill (#3a3a3a)

## Features

### Collapsible Tree

- Click parent nodes to expand/collapse children
- Initial state: Root and first level expanded, rest collapsed
- Smooth animations (250ms duration)
- Toggle buttons (+/-) on nodes with children

### Dataset Selection

- Click dataset nodes to select
- Selected dataset highlighted with bold text and background
- Dispatches `SetSelectedContextDataset` action to GlobalContextState
- Updates context drawer automatically

### Smart Hierarchy

- Only shows teams/groups that contain datasets
- Empty contexts still shown (with count 0)
- Filters datasets by ownership context and ID
- Resolves team hierarchy from TeamGroup relationships

### Visual Indicators

- Emoji icons for each node type
- Count badges showing number of children
- Color-coded node borders by type
- Expand/collapse indicators

## Testing Checklist

- [ ] Tree renders with sample datasets
- [ ] System datasets appear under System node
- [ ] Personal datasets appear under Personal node
- [ ] Tenant datasets grouped by team and team group
- [ ] Only teams with datasets are shown
- [ ] Only team groups with datasets are shown
- [ ] Expand/collapse animations work smoothly
- [ ] Clicking dataset selects it
- [ ] Selected dataset highlighted correctly
- [ ] GlobalContextState updated on selection
- [ ] Context drawer shows selected dataset
- [ ] Dark mode styling works correctly
- [ ] Empty states handled gracefully
- [ ] Hover effects work on all node types
- [ ] Action buttons still functional

## Performance Considerations

- Tree rebuilds on data changes (via ngOnChanges)
- D3 uses efficient enter/update/exit pattern
- Only visible nodes rendered (collapsed nodes hidden)
- Animations optimized at 250ms duration

## Future Enhancements

- [ ] Search/filter functionality
- [ ] Drag-and-drop to reorganize
- [ ] Right-click context menus on nodes
- [ ] Keyboard navigation support
- [ ] Virtualization for large datasets
- [ ] Export tree visualization as image
- [ ] Customizable node icons/colors
- [ ] Tooltip with detailed dataset information

## Related Files

- `src/app/components/drawers/drawer-datasets/drawer-datasets.ts`
- `src/app/components/drawers/drawer-datasets/drawer-datasets.html`
- `src/app/components/drawers/drawer-datasets/drawer-datasets.scss`
- `src/app/components/main/dr-ui-vers6/d3-ui-vers6.html`
- `src/app/components/main/dr-ui-vers6/d3-ui-vers6.ts`
- `src/app/components/drawers/drawer-context/drawer-context.ts`
- `src/app/components/drawers/drawer-context/drawer-context.html`
- `src/app/state/user-context/user-context.state.ts`
- `src/app/state/user-context/user-context.model.ts`
- `src/app/state/user-context/user-context.actions.ts`

## Dependencies

- **D3.js v7+**: Tree visualization and animations
- **Angular 18+**: Component framework
- **NGXS**: State management
- **TypeScript**: Type safety

## Migration Notes

This implementation replaces the previous tab-based list view while maintaining all functionality:

- Dataset selection still works the same way
- All action buttons (Create, Combine, Promote, Demote, Delete) unchanged
- State management integration unchanged
- Event emissions unchanged
- Parent component compatibility maintained

The tree structure provides better visual organization and makes it easier to understand the relationship between datasets, teams, and team groups.
