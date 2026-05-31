# Drawer-Datasets ngOnChanges Debug Analysis

## Problem

The `ngOnChanges` lifecycle hook in `drawer-datasets.ts` is firing too frequently, causing performance issues and potentially an infinite loop.

## Root Cause Analysis

### The Issue: Getter Functions Creating New Array References

In `d3-ui-vers6.ts`, the following getter functions are used as inputs to `drawer-datasets`:

```typescript
// Line 1166-1169
public get teams(): Team[] {
  const tenant = this.selectedTenant;
  return tenant?.Teams || [];  // ⚠️ NEW ARRAY REFERENCE EACH TIME
}

// Line 1172-1175
public get teamGroups(): TeamGroup[] {
  const team = this.selectedTeam;
  return team?.TeamGroups || [];  // ⚠️ NEW ARRAY REFERENCE EACH TIME
}
```

These getters are bound in the template:

```html
<app-drawer-datasets [teams]="teams" <!-- Getter called on every change detection -->
  [teamGroups]="teamGroups"
  <!-- Getter called on every change detection -->
  ...
</app-drawer-datasets>
```

### Why This Causes Infinite Loops

1. **Getter Evaluation**: Every time Angular runs change detection, it evaluates `teams` and `teamGroups` getters
2. **New Array Reference**: The `|| []` operator creates a NEW empty array every time `tenant?.Teams` or `team?.TeamGroups` is falsy
3. **Change Detection Triggered**: Angular detects the new array reference as a change
4. **ngOnChanges Fires**: The component's `ngOnChanges` is called
5. **updateTree() Called**: This may trigger store updates or state changes
6. **Store Update**: Store subscription in constructor calls `updateTree()` again
7. **Change Detection Again**: Angular runs change detection cycle
8. **Loop Continues**: Back to step 1

### Double Subscription Problem

There's also a duplicate subscription issue:

```typescript
constructor(private store: Store) {
  // Subscribes to selectedContextDataset changes
  this.subscription.add(
    this.store
      .select(GlobalContextState.selectedContextDataset)
      .subscribe(() => {
        if (this.svg) {
          this.updateTree();  // Triggers update
        }
      })
  );
}

ngOnChanges(changes: SimpleChanges): void {
  // Also triggers on ANY input change
  if (changes['decisionFlows'] || ...) {
    if (this.svg) {
      this.updateTree();  // Same method called again
    }
  }
}
```

## Debug Logging Added

Enhanced `ngOnChanges` with comprehensive logging to identify:

- Which inputs are actually changing
- Whether the data values are the same (reference vs value comparison)
- Stack traces to see what's triggering change detection
- Frequency of calls

## Solutions

### 1. **Cache Array References in Parent Component** (Recommended)

```typescript
// In d3-ui-vers6.ts
private _cachedTeams: Team[] | null = null;
private _cachedTeamsSource: Team[] | undefined = undefined;

public get teams(): Team[] {
  const tenant = this.selectedTenant;
  const source = tenant?.Teams;

  // Return cached reference if source hasn't changed
  if (source === this._cachedTeamsSource) {
    return this._cachedTeams || [];
  }

  // Update cache
  this._cachedTeamsSource = source;
  this._cachedTeams = source || [];
  return this._cachedTeams;
}
```

### 2. **Add Change Detection Strategy** (Best Practice)

```typescript
@Component({
  selector: 'app-drawer-datasets',
  changeDetection: ChangeDetectionStrategy.OnPush,  // Add this
  // ...
})
```

### 3. **Use trackBy for Arrays**

If the component uses `*ngFor`, add `trackBy` functions to prevent unnecessary re-renders.

### 4. **Consolidate Update Logic**

Instead of calling `updateTree()` from both constructor subscription and `ngOnChanges`, create a single debounced update method:

```typescript
private updateTreeDebounced = debounce(() => {
  if (this.svg) {
    this.updateTree();
  }
}, 100);

ngOnChanges(changes: SimpleChanges): void {
  if (changes['decisionFlows'] || ...) {
    this.updateTreeDebounced();
  }
}
```

### 5. **Add Memoization with Deep Equality Check**

```typescript
ngOnChanges(changes: SimpleChanges): void {
  // Only update if actual data changed, not just references
  if (changes['teams']) {
    const prev = changes['teams'].previousValue;
    const curr = changes['teams'].currentValue;

    // Skip if arrays are structurally identical
    if (this.arraysEqual(prev, curr)) {
      return;
    }
  }

  // ... similar checks for other inputs

  if (this.svg) {
    this.updateTree();
  }
}

private arraysEqual(a: any[], b: any[]): boolean {
  if (a?.length !== b?.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
```

## Testing Steps

1. Open the application in development mode
2. Open browser DevTools console
3. Open the Datasets drawer
4. Observe the console logs:
   - Count how many times `ngOnChanges` fires
   - Check if `referenceEqual` is false but data is the same
   - Look at stack traces to identify trigger points
5. Interact with the UI (select tenants, teams, etc.)
6. Monitor performance and log frequency

## Expected Findings

You should see:

- `teams` and `teamGroups` showing `referenceEqual: false` even when data hasn't changed
- Multiple rapid-fire calls in succession
- Empty arrays being passed repeatedly when no tenant/team is selected

## Next Steps

1. Run the app and collect the debug logs
2. Confirm which inputs are causing the issue
3. Implement solution #1 (caching) as the quickest fix
4. Consider adding OnPush change detection for better performance
5. Remove debug logging once issue is resolved
