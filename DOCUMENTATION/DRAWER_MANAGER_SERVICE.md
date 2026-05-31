# Drawer Manager Service - Centralized Drawer State Management

## Overview

The `DrawerManagerService` provides centralized management of drawer state throughout the application. It eliminates the need for custom logic in each drawer toggle method and ensures that only one drawer per side can be open at a time.

## Key Features

✅ **Automatic Drawer Closing** - Opening a drawer automatically closes other drawers on the same side  
✅ **Side-Based Grouping** - Drawers are grouped by position ('left' or 'right')  
✅ **Reactive State** - Observable-based state updates for Angular change detection  
✅ **Centralized Logic** - All drawer management logic in one service  
✅ **Type-Safe** - Full TypeScript support with proper interfaces

## Architecture

### Service Structure

```typescript
export interface DrawerConfig {
  id: string;
  position: "left" | "right";
  isOpen: boolean;
}
```

The service maintains:

- A `Map<string, BehaviorSubject<boolean>>` for reactive state
- A `Map<string, DrawerConfig>` for drawer metadata

### Component Integration

Components register their drawers in `ngOnInit()` and subscribe to state changes:

```typescript
ngOnInit() {
  // Register drawer
  this.drawerManager.registerDrawer('myDrawer', 'left');

  // Subscribe to state
  this.drawerManager.isOpen('myDrawer')
    .pipe(takeUntil(this.destroy$))
    .subscribe(isOpen => {
      this.isMyDrawerOpen = isOpen;
    });
}
```

## Usage Examples

### Basic Toggle

```typescript
public toggleLoginDrawer(): void {
  this.drawerManager.toggle('login');
}
```

This replaces the old manual approach:

```typescript
// OLD WAY - DON'T DO THIS
public toggleLoginDrawer(): void {
  if (!this.isLoginDrawerOpen) {
    this.isTenantDrawerOpen = false;
    this.isPlayerSelectionDrawerOpen = false;
    this.isTeamsDrawerOpen = false;
    // ... etc
  }
  this.isLoginDrawerOpen = !this.isLoginDrawerOpen;
}
```

### Explicit Open/Close

```typescript
// Open a specific drawer (closes others on same side)
this.drawerManager.open("datasets");

// Close a specific drawer
this.drawerManager.close("datasets");
```

### Close All Drawers

```typescript
// Close all drawers on left side
this.drawerManager.closeAllOnSide("left");

// Close all drawers regardless of side
this.drawerManager.closeAll();
```

### Query Drawer State

```typescript
// Get current state synchronously
const isOpen = this.drawerManager.isOpenSync("login");

// Get list of all drawer IDs
const allDrawers = this.drawerManager.getDrawerIds();

// Get drawers filtered by side
const leftDrawers = this.drawerManager.getDrawerIds("left");

// Count open drawers
const openCount = this.drawerManager.getOpenCount("left");
```

## Registered Drawers

### Left-Side Drawers

| Drawer ID         | Purpose                       |
| ----------------- | ----------------------------- |
| `login`           | User login/selection          |
| `tenant`          | Tenant/organization selection |
| `playerSelection` | Player/user context selection |
| `teams`           | Team management               |
| `teamGroups`      | Team group management         |
| `assignedLessons` | Lesson assignments            |
| `datasets`        | Dataset browser               |
| `lessonBuilder`   | Lesson builder interface      |

### Right-Side Drawers

Currently, right-side drawers (context, subscription) are not using the service but can be migrated:

```typescript
this.drawerManager.registerDrawer("context", "right");
this.drawerManager.registerDrawer("subscription", "right");
```

## API Reference

### Registration

```typescript
registerDrawer(id: string, position: 'left' | 'right'): void
unregisterDrawer(id: string): void
```

### State Management

```typescript
toggle(id: string): void
open(id: string): void
close(id: string): void
closeAllOnSide(position: 'left' | 'right', exceptId?: string): void
closeAll(): void
```

### State Queries

```typescript
isOpen(id: string): Observable<boolean>
isOpenSync(id: string): boolean
getDrawerIds(position?: 'left' | 'right'): string[]
getOpenCount(position?: 'left' | 'right'): number
```

## Benefits Over Manual Approach

| Aspect            | Manual Toggle Methods                       | DrawerManagerService       |
| ----------------- | ------------------------------------------- | -------------------------- |
| **Lines of Code** | ~15 lines per toggle method                 | ~3 lines per toggle method |
| **Maintenance**   | Must update every method when adding drawer | Add one registration line  |
| **Consistency**   | Easy to forget drawers                      | Automatic and complete     |
| **Testing**       | Must test each method                       | Test service once          |
| **Readability**   | Repetitive boilerplate                      | Clean, declarative         |

## Migration Guide

### Before (Manual)

```typescript
public toggleDatasetsDrawer(): void {
  if (!this.isDatasetsDrawerOpen) {
    this.isLoginDrawerOpen = false;
    this.isTenantDrawerOpen = false;
    this.isPlayerSelectionDrawerOpen = false;
    this.isTeamsDrawerOpen = false;
    this.isTeamGroupsDrawerOpen = false;
    this.isAssignedLessonsDrawerOpen = false;
    this.isLessonBuilderDrawerOpen = false;
  }
  this.isDatasetsDrawerOpen = !this.isDatasetsDrawerOpen;
}
```

### After (Service-Based)

```typescript
// In ngOnInit:
this.drawerManager.registerDrawer('datasets', 'left');
this.drawerManager.isOpen('datasets')
  .pipe(takeUntil(this.destroy$))
  .subscribe(isOpen => this.isDatasetsDrawerOpen = isOpen);

// Toggle method:
public toggleDatasetsDrawer(): void {
  this.drawerManager.toggle('datasets');
}
```

## Future Enhancements

Potential improvements to the service:

1. **Persistence** - Save drawer state to localStorage
2. **Animation Coordination** - Coordinate close/open animations
3. **History** - Track drawer open/close history
4. **Analytics** - Track which drawers are used most
5. **Keyboard Shortcuts** - Global keyboard support
6. **Groups** - Define custom drawer groups beyond left/right

## Code Location

- **Service**: `src/app/services/drawer-manager.service.ts`
- **Tests**: `src/app/services/drawer-manager.service.spec.ts`
- **Usage**: `src/app/components/main/dr-ui-vers6/d3-ui-vers6.ts`

## Summary

The DrawerManagerService dramatically simplifies drawer management by:

- Reducing code duplication from ~120 lines to ~45 lines
- Eliminating the need to update every toggle method when adding drawers
- Providing a centralized, testable solution
- Maintaining the same external API for components

This is a significant improvement in code organization and maintainability.
