# Shared Stylesheet Architecture

This directory contains shared stylesheets that are used across D3UIV6 and all toolbar/dialog components to ensure consistency and maintainability.

## Directory Structure

```
src/app/styles/
├── _shared.scss           # Main entry point - import this file
├── base/
│   ├── _variables.scss    # CSS custom properties and SCSS variables
│   ├── _typography.scss   # Typography base styles and utilities
│   └── _utilities.scss    # Layout and utility classes
└── components/
    ├── _toolbar-base.scss # Shared toolbar styles (.draggable-toolbar, .panel-header, etc.)
    └── _buttons.scss      # Button components and variants
```

## Usage

### In Angular Components

Import the main shared stylesheet in your component:

```typescript
@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.html',
  styleUrls: [
    '../../../styles/_shared.scss',  // Import shared styles
    './my-component.scss'            // Component-specific styles
  ]
})
```

### Available CSS Custom Properties

All styles use CSS custom properties (CSS variables) for theming:

```scss
// Colors
--color-primary: #2196f3;
--color-secondary: #ff6b35;
--color-success: #28a745;
--color-warning: #fd7e14;
--color-danger: #dc3545;

// Typography
--font-family-base: "Inter", sans-serif;
--font-family-mono: "JetBrains Mono", monospace;
--font-size-xs: 10px;
--font-size-sm: 11px;
--font-size-base: 12px;

// Spacing
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;

// And many more...
```

### Dark Mode Support

Dark mode is automatically supported through CSS custom properties:

```scss
.dark-mode {
  --color-primary: #64b5f6;
  --bg-white: #424242;
  --text-primary: #ffffff;
  // Colors automatically adjust
}
```

## Shared Components

### Draggable Toolbars

All toolbar components inherit from `.draggable-toolbar`:

```html
<div class="draggable-toolbar" [class.dark-mode]="isDarkMode">
  <div class="panel-header drag-handle">
    <h3>Toolbar Title</h3>
    <div class="header-actions">
      <button class="close-button">×</button>
    </div>
  </div>
  <div class="panel-content">
    <!-- Toolbar content -->
  </div>
</div>
```

### Buttons

Use standardized button classes:

```html
<!-- Primary button -->
<button class="btn btn-primary">Save</button>

<!-- Secondary button -->
<button class="btn btn-secondary">Cancel</button>

<!-- Small button -->
<button class="btn btn-primary btn-sm">Small</button>

<!-- Icon button -->
<button class="btn-icon">🔍</button>

<!-- Toolbar toggle button -->
<button class="toolbar-toggle-btn" [class.active]="isActive">
  <span class="toolbar-icon">📊</span>
  <span class="toolbar-status">ON</span>
</button>
```

### Layout Utilities

Use utility classes for common layouts:

```html
<div class="flex items-center gap-2">
  <span class="text-sm text-muted">Status:</span>
  <span class="font-medium">Active</span>
</div>

<div class="p-3 bg-white rounded shadow">
  <h4 class="mb-2">Card Title</h4>
  <p class="text-secondary">Card content</p>
</div>
```

## Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Change variables in one place to update the entire app
3. **Dark Mode**: Automatic dark mode support across all components
4. **Performance**: Shared styles reduce CSS duplication
5. **Developer Experience**: Predictable class names and utilities

## Migration Guide

### From D3UIV6 Styles

If migrating a component that previously used `d3-ui-vers6.scss`:

1. Replace the stylesheet import:

   ```typescript
   // Before
   styleUrls: ["../../main/dr-ui-vers6/d3-ui-vers6.scss"];

   // After
   styleUrls: ["../../../styles/_shared.scss", "./component.scss"];
   ```

2. Update component-specific styles to use CSS custom properties:

   ```scss
   // Before
   .my-button {
     background: #2196f3;
     color: white;
     padding: 8px 16px;
   }

   // After
   .my-button {
     background: var(--color-primary);
     color: var(--text-white);
     padding: var(--spacing-2) var(--spacing-4);
   }
   ```

3. Use shared component classes where possible:

   ```scss
   // Before
   .my-button {
     background: #2196f3;
     border: 1px solid #1976d2;
     border-radius: 6px;
     padding: 8px 16px;
     // ... many lines of button styles
   }

   // After
   .my-button {
     @extend .btn;
     @extend .btn-primary;
     // Custom styles only
   }
   ```

## Component-Specific Styles

Each component should still have its own stylesheet for:

- Component-specific layout and positioning
- Unique visual elements
- Complex interactions not covered by shared styles
- Business logic specific styling

Keep shared styles in the shared directory and component-specific styles in component files.
