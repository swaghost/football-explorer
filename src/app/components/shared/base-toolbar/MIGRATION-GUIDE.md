# Toolbar Migration Guide

This guide shows how to convert existing toolbar components to use the new `BaseToolbarComponent` for code reuse and consistency.

## Quick Migration Checklist

- [ ] Update component class to extend `BaseToolbarComponent`
- [ ] Implement required properties (`toolbarId`, `toolbarTitle`, `toolbarIcon`)
- [ ] Replace custom header with `baseHeader` template
- [ ] Import base styles and remove duplicate CSS
- [ ] Remove duplicate dragging, positioning, and state management code
- [ ] Test dragging, lock/unlock, expand/collapse, and theme switching

## Before and After Example

### BEFORE: Custom Toolbar Component

```typescript
// toolbar-example.component.ts (BEFORE)
@Component({
  selector: "app-toolbar-example",
  templateUrl: "./toolbar-example.component.html",
  styleUrls: ["./toolbar-example.component.scss"],
})
export class ToolbarExampleComponent implements OnInit, OnDestroy {
  // Duplicate state management
  private position = signal({ left: 20, top: 20 });
  private isVisible = signal(true);
  private isDarkMode = signal(false);
  private isLocked = signal(false);
  private isCollapsed = signal(false);
  private isDragging = false;

  // Duplicate position tracking
  private dragStartX = 0;
  private dragStartY = 0;
  private offsetX = 0;
  private offsetY = 0;

  // Duplicate event listeners
  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  // Component-specific logic
  searchText = "";
  selectedOption = "option1";

  ngOnInit() {
    this.loadPosition();
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

  // Lots of duplicate dragging code...
  onMouseDown(event: MouseEvent) {
    // 50+ lines of duplicate positioning logic
  }

  // Duplicate state management methods...
  toggleDarkMode() {
    /* ... */
  }
  toggleLocked() {
    /* ... */
  }
  toggleCollapsed() {
    /* ... */
  }

  // Component-specific methods
  onSearch() {
    console.log("Searching for:", this.searchText);
  }
}
```

### AFTER: Using BaseToolbarComponent

```typescript
// toolbar-example.component.ts (AFTER)
@Component({
  selector: "app-toolbar-example",
  templateUrl: "./toolbar-example.component.html",
  styleUrls: ["./toolbar-example.component.scss"],
})
export class ToolbarExampleComponent extends BaseToolbarComponent {
  // Required base properties
  readonly toolbarId = "example-toolbar";
  readonly toolbarTitle = "Example Toolbar";
  readonly toolbarIcon = "🔧";

  // Only component-specific properties
  searchText = "";
  selectedOption = "option1";

  // Only component-specific methods
  onSearch() {
    console.log("Searching for:", this.searchText);
  }

  onOptionChange() {
    console.log("Selected option:", this.selectedOption);
  }
}
```

**Lines of code reduction: ~200 lines → ~25 lines (87% reduction)**

## Template Migration

### BEFORE: Custom Header Template

```html
<!-- BEFORE: Custom header with duplicate functionality -->
<div class="draggable-toolbar" [style.left.px]="position().left" [style.top.px]="position().top" [class.dark-mode]="isDarkMode()" [class.locked]="isLocked()">
  <!-- Duplicate header implementation -->
  <div class="toolbar-header" (mousedown)="onMouseDown($event)">
    <h3>{{ title }}</h3>
    <div class="header-buttons">
      <button (click)="toggleDarkMode()">🌙</button>
      <button (click)="toggleLocked()">🔓</button>
      <button (click)="toggleCollapsed()">📁</button>
    </div>
  </div>

  <!-- Component content -->
  <div class="content">
    <!-- Your content here -->
  </div>
</div>
```

### AFTER: Using Base Template

```html
<!-- AFTER: Using base template -->
<div class="draggable-toolbar" [class.dark-mode]="isDarkMode()" [class.locked]="isLocked()" [class.collapsed]="isCollapsed()" [class.dragging]="isDragging" [style.left.px]="position().left" [style.top.px]="position().top" [style.display]="isVisible() ? 'block' : 'none'">
  <!-- Use the base header (no custom implementation needed) -->
  <ng-container *ngTemplateOutlet="baseHeader"></ng-container>

  <!-- Focus only on your content -->
  <div class="panel-content" *ngIf="!isCollapsed()">
    <!-- Your content here -->
  </div>
</div>

<!-- Include base header template (copy from base-toolbar.component.html) -->
<ng-template #baseHeader>
  <!-- Base header implementation -->
</ng-template>
```

## Step-by-Step Migration Process

### Step 1: Update Component Class

1. **Add import and extend base class:**

   ```typescript
   import { BaseToolbarComponent } from '../shared/base-toolbar/base-toolbar.component';

   export class YourToolbarComponent extends BaseToolbarComponent {
   ```

2. **Add required properties:**

   ```typescript
   readonly toolbarId = 'your-unique-id';      // Must be unique
   readonly toolbarTitle = 'Your Toolbar';     // Display name
   readonly toolbarIcon = '🔧';                // Icon/emoji
   ```

3. **Remove duplicate code:**

   - Remove position management properties and methods
   - Remove dragging event handlers
   - Remove state management (dark mode, locked, collapsed, visible)
   - Remove localStorage save/load logic
   - Remove viewport constraint logic

4. **Keep only component-specific logic:**
   - Business logic methods
   - Form handling
   - Data processing
   - API calls
   - Component-specific state

### Step 2: Update Template

1. **Replace custom header with base template:**

   ```html
   <!-- Remove this -->
   <div class="custom-header">...</div>

   <!-- Replace with this -->
   <ng-container *ngTemplateOutlet="baseHeader"></ng-container>
   ```

2. **Copy base header template:**
   Copy the `#baseHeader` template from `base-toolbar.component.html`

3. **Update content area:**
   ```html
   <div class="panel-content" *ngIf="!isCollapsed()">
     <!-- Your existing content -->
   </div>
   ```

### Step 3: Update Styles

1. **Import base styles:**

   ```scss
   @import "../shared/base-toolbar/base-toolbar.component.scss";
   ```

2. **Remove duplicate styles:**

   - Remove positioning and dragging styles
   - Remove header and button styles
   - Remove dark mode styles
   - Remove common form styles

3. **Keep only component-specific styles:**
   - Custom layouts
   - Specialized form elements
   - Component-specific colors/spacing

### Step 4: Test Migration

✅ **Test these features:**

- Dragging functionality
- Lock/unlock toggle
- Expand/collapse toggle
- Dark/light mode toggle
- Position persistence (refresh page)
- Control-click title to reset position
- Viewport boundary constraints
- Responsive behavior

## Common Migration Issues

### Issue 1: Method Not Found

```
Property 'toggleDarkMode' does not exist
```

**Solution:** Remove custom implementation, use inherited method from base class.

### Issue 2: Template Reference Error

```
Cannot read property 'templateOutlet' of undefined
```

**Solution:** Copy the `#baseHeader` template from the base component.

### Issue 3: Styles Not Applied

```
Toolbar appears unstyled
```

**Solution:** Import base styles with `@import '../shared/base-toolbar/base-toolbar.component.scss';`

### Issue 4: Position Not Saved

```
Toolbar resets position on page refresh
```

**Solution:** Ensure `toolbarId` is unique and properly set.

## Migration Validation

### Code Quality Checklist

- [ ] No duplicate positioning logic
- [ ] No duplicate state management
- [ ] No duplicate event handlers
- [ ] Only component-specific methods remain
- [ ] Base styles imported correctly
- [ ] TypeScript compilation passes
- [ ] ESLint validation passes

### Functionality Checklist

- [ ] Dragging works correctly
- [ ] Position persists across sessions
- [ ] Lock/unlock functions
- [ ] Expand/collapse functions
- [ ] Dark/light mode switching
- [ ] Control-click rescue works
- [ ] Stays within viewport bounds
- [ ] Component-specific features work

## Performance Benefits

**Before Migration (per toolbar):**

- ~200 lines of duplicate code
- Duplicate event listeners
- Redundant state management
- Inconsistent behavior
- Higher maintenance burden

**After Migration:**

- ~25 lines of component-specific code
- Shared event handling
- Centralized state management
- Consistent behavior across all toolbars
- Single point of maintenance for common features

## Example: Converting Toolbar Lessons

### Before (220 lines of duplicate code)

```typescript
export class ToolbarLessonsComponent {
  // 50+ lines of position/drag logic
  // 30+ lines of state management
  // 40+ lines of event handling
  // 20+ lines of localStorage logic
  // 30+ lines of styling/theme logic
  // 50+ lines of lesson-specific logic
}
```

### After (45 lines of focused code)

```typescript
export class ToolbarLessonsComponent extends BaseToolbarComponent {
  readonly toolbarId = "lessons-toolbar";
  readonly toolbarTitle = "Lessons";
  readonly toolbarIcon = "📚";

  // Only the 50 lines of lesson-specific logic remain
}
```

## Next Steps

1. **Start with one toolbar** - Choose a simple toolbar for first migration
2. **Test thoroughly** - Ensure all functionality works correctly
3. **Migrate incrementally** - Convert one toolbar at a time
4. **Update documentation** - Document any component-specific usage patterns
5. **Team training** - Ensure team understands new base component pattern

The `BaseToolbarComponent` eliminates ~175 lines of duplicate code per toolbar component, resulting in more maintainable, consistent, and reliable toolbar functionality across the entire application.
