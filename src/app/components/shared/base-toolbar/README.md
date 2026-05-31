# BaseToolbarComponent

A reusable abstract base component for all draggable toolbars in the application. This component provides common functionality including dragging, positioning, state management, and UI controls.

## Features

- **Draggable Interface**: Click and drag toolbar using the header or drag handle
- **Position Persistence**: Remembers position between sessions using localStorage
- **Lock/Unlock**: Toggle dragging capability
- **Expand/Collapse**: Show/hide content area
- **Dark/Light Mode**: Theme switching support
- **Control-Click Rescue**: Reset position when control-clicking the title
- **Viewport Constraints**: Keeps toolbar within visible area
- **Responsive Design**: Adapts to different screen sizes

## Usage

### 1. Extend the Base Class

```typescript
import { Component, inject } from "@angular/core";
import { BaseToolbarComponent } from "../shared/base-toolbar/base-toolbar.component";

@Component({
  selector: "app-my-toolbar",
  templateUrl: "./my-toolbar.component.html",
  styleUrls: ["./my-toolbar.component.scss"],
})
export class MyToolbarComponent extends BaseToolbarComponent {
  // Required properties
  readonly toolbarId = "my-toolbar";
  readonly toolbarTitle = "My Toolbar";
  readonly toolbarIcon = "🔧";

  // Add your custom logic here
  doSomething() {
    console.log("Custom functionality");
  }
}
```

### 2. Use the Base Template

Your component template should include the base template:

```html
<!-- my-toolbar.component.html -->
<div class="draggable-toolbar" [class.dark-mode]="isDarkMode()" [class.locked]="isLocked()" [class.collapsed]="isCollapsed()" [class.dragging]="isDragging" [style.left.px]="position().left" [style.top.px]="position().top" [style.display]="isVisible() ? 'block' : 'none'">
  <!-- Use the base header -->
  <ng-container *ngTemplateOutlet="baseHeader"></ng-container>

  <!-- Your custom content -->
  <div class="panel-content" *ngIf="!isCollapsed()">
    <h4>My Custom Content</h4>
    <p>Add your toolbar-specific content here</p>

    <!-- Example form -->
    <div class="form-group">
      <label>Example Input:</label>
      <input type="text" placeholder="Enter something..." />
    </div>

    <div class="button-container">
      <button class="btn btn-primary">Action</button>
      <button class="btn">Cancel</button>
    </div>
  </div>

  <!-- Optional footer -->
  <div class="panel-footer" *ngIf="!isCollapsed()">
    <small>Footer content</small>
  </div>
</div>

<!-- Include the base template for the header -->
<ng-template #baseHeader>
  <div class="panel-header drag-handle" (mousedown)="onMouseDown($event)" (touchstart)="onTouchStart($event)">
    <h3 (click)="onTitleClick($event)">
      <span class="toolbar-icon">{{ toolbarIcon }}</span>
      {{ toolbarTitle }}
    </h3>
    <div class="header-actions">
      <button (click)="toggleDarkMode()" [title]="isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">{{ isDarkMode() ? '☀️' : '🌙' }}</button>
      <button (click)="toggleLocked()" [title]="isLocked() ? 'Unlock Toolbar' : 'Lock Toolbar'">{{ isLocked() ? '🔒' : '🔓' }}</button>
      <button (click)="toggleCollapsed()" [title]="isCollapsed() ? 'Expand Toolbar' : 'Collapse Toolbar'">{{ isCollapsed() ? '📂' : '📁' }}</button>
      <span class="drag-icon" [title]="isLocked() ? 'Toolbar is locked' : 'Drag to move'" *ngIf="!isLocked()"> ⋮⋮ </span>
    </div>
  </div>
</ng-template>
```

### 3. Import Required Styles

Include the base styles in your component:

```scss
// my-toolbar.component.scss
@import "../shared/base-toolbar/base-toolbar.component.scss";

// Add your custom styles here
.my-custom-style {
  // Your custom CSS
}
```

## Required Implementation

When extending `BaseToolbarComponent`, you must provide:

- `toolbarId`: Unique identifier for localStorage key
- `toolbarTitle`: Display title in the header
- `toolbarIcon`: Icon/emoji to display next to title

## Available Methods

### State Management

- `isVisible()`: Check if toolbar is visible
- `isDarkMode()`: Check if dark mode is enabled
- `isLocked()`: Check if toolbar is locked (non-draggable)
- `isCollapsed()`: Check if toolbar is collapsed
- `position()`: Get current position { left, top }

### State Toggles

- `toggleDarkMode()`: Switch between light/dark themes
- `toggleLocked()`: Toggle lock state
- `toggleCollapsed()`: Toggle collapsed state
- `show()`: Make toolbar visible
- `hide()`: Hide toolbar

### Position Management

- `resetPosition()`: Reset to default position
- `savePosition()`: Manually save current position
- `constrainToViewport()`: Ensure toolbar stays in view

### Event Handlers (override if needed)

- `onMouseDown(event)`: Handle mouse drag start
- `onTouchStart(event)`: Handle touch drag start
- `onTitleClick(event)`: Handle title click (control-click rescue)

## Configuration

### Default Settings

The base component uses these defaults (can be overridden):

```typescript
// Default position
defaultPosition = { left: 20, top: 20 };

// Default states
private initialStates = {
  isVisible: true,
  isDarkMode: false,
  isLocked: false,
  isCollapsed: false
};
```

### Customizing Defaults

```typescript
export class MyToolbarComponent extends BaseToolbarComponent {
  readonly toolbarId = "my-toolbar";
  readonly toolbarTitle = "My Toolbar";
  readonly toolbarIcon = "🔧";

  // Override defaults
  defaultPosition = { left: 100, top: 100 };

  constructor() {
    super();
    // Set initial state
    this.setStates({
      isDarkMode: true, // Start in dark mode
      isCollapsed: false,
    });
  }
}
```

## Styling

The base component provides comprehensive CSS variables for theming:

```scss
.draggable-toolbar {
  // Light mode (default)
  --toolbar-bg: #ffffff;
  --toolbar-text: #2c3e50;
  --toolbar-border: #bdc3c7;
  --button-bg: #ecf0f1;
  --button-hover-bg: #d5dbdb;
  --button-text: #2c3e50;
  --input-bg: #ffffff;
  --input-text: #2c3e50;
  --input-border: #bdc3c7;

  // Dark mode (when .dark-mode class is present)
  &.dark-mode {
    --toolbar-bg: #1a252f;
    --toolbar-text: #ecf0f1;
    --toolbar-border: #2c3e50;
    --button-bg: #34495e;
    --button-hover-bg: #4a6741;
    --button-text: #ecf0f1;
    --input-bg: #2c3e50;
    --input-text: #ecf0f1;
    --input-border: #34495e;
  }
}
```

## Migration Guide

### Converting Existing Toolbars

1. **Update Component Class**:

   ```typescript
   // Before
   export class ToolbarLessonsComponent {
     // ... lots of duplicate code
   }

   // After
   export class ToolbarLessonsComponent extends BaseToolbarComponent {
     readonly toolbarId = "lessons-toolbar";
     readonly toolbarTitle = "Lessons";
     readonly toolbarIcon = "📚";

     // Keep only lesson-specific logic
   }
   ```

2. **Update Template**:

   - Replace custom header with `baseHeader` template
   - Keep only content-specific HTML
   - Use provided CSS classes

3. **Update Styles**:
   - Import base styles
   - Remove duplicate CSS
   - Keep only component-specific styles

## Best Practices

1. **Unique IDs**: Always use unique `toolbarId` values
2. **Meaningful Titles**: Use clear, descriptive `toolbarTitle`
3. **Appropriate Icons**: Choose relevant `toolbarIcon` (emoji or text)
4. **Responsive Content**: Ensure your content works at different sizes
5. **Accessibility**: Use proper labels and ARIA attributes
6. **Performance**: Avoid heavy computations in getters

## Troubleshooting

### Common Issues

1. **Toolbar not draggable**: Check that `isLocked()` returns false
2. **Position not saved**: Ensure `toolbarId` is unique and provided
3. **Styles not applied**: Import base SCSS file
4. **Template errors**: Include the `baseHeader` template

### Debug Mode

Enable debug logging in development:

```typescript
export class MyToolbarComponent extends BaseToolbarComponent {
  constructor() {
    super();
    // Enable debug logging
    if (!environment.production) {
      this.debugMode = true;
    }
  }
}
```

## Examples

See the `toolbar-lessons.component.ts` and `toolbar-datasets.component.ts` for complete implementation examples.
