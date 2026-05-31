# NGXS State Persistence Implementation

## Overview

All NGXS state data is now automatically persisted to `localStorage` and will survive page refreshes. This serves as temporary storage until database integration is implemented.

## What Gets Persisted

### Sketch State (includes):

- ✅ **Node Visit History** (`nodeVisitHistory`)

  - Last visited timestamp (UTC) for each node
  - Visit count for each node
  - Stored as: `{ visits: { [nodeId]: { nodeId, lastVisitedAt, visitCount } } }`

- ✅ **Personal Collections** (`personalCollections`)
  - Favorite nodes (with categories: Movements, Match Skills, Technique)
  - Bookmarked nodes
- ✅ **Canvas Settings**
  - Zoom level, pan position, rotation angle
  - Node count
- ✅ **Drawing Data**
  - Strokes, shapes, drawing history
- ✅ **Toolbar State**
  - Positions, visibility, lock states
- ✅ **Tour/Lesson State**
  - Attempted lessons, completed nodes per lesson
  - Current lesson ID

### Other Persisted States:

- ✅ **Lessons State** - All lesson data
- ✅ **Team Selection State** - Team and group selections
- ✅ **Quick Nav State** - Navigation preferences
- ✅ **UI Preferences State** - User interface preferences

## How It Works

### Configuration

Located in `src/app/app.config.ts`:

```typescript
withNgxsStoragePlugin({
  keys: ["lessons", "teamSelection", "sketch", "quickNav", "uiPreferences"],
  serialize: JSON.stringify,
  deserialize: (value: string) => {
    /* ... */
  },
});
```

### Automatic Persistence

- Every NGXS state change is **automatically saved** to localStorage
- Data is **automatically loaded** when the app starts
- No manual save/load code needed in components

### Data Structure in localStorage

States are stored as JSON strings with these keys:

- `@@STATE.lessons`
- `@@STATE.teamSelection`
- `@@STATE.sketch`
- `@@STATE.quickNav`
- `@@STATE.uiPreferences`

### Migration & Initialization

The `InitializeState` action ensures proper structure:

```typescript
// Dispatch on app startup if needed:
this.store.dispatch(new SketchActions.InitializeState());
```

This handles:

- Missing `nodeVisitHistory` → Creates empty structure
- Missing `personalCollections` → Creates empty arrays
- Data format migrations from older versions

## Usage Examples

### Node Visit Tracking

```typescript
// Automatically tracked when node is selected:
this.store.dispatch(new SketchActions.SetSelectedNode(nodeId));
// This records: UTC timestamp + increments visit count

// Retrieve visit data:
const lastVisited = this.store.selectSnapshot(SketchState.getNodeLastVisited)(nodeId);

const visitCount = this.store.selectSnapshot(SketchState.getNodeVisitCount)(nodeId);
```

### Testing Persistence

1. Select several nodes (visit tracking happens automatically)
2. Open browser DevTools → Application → Local Storage
3. Look for `@@STATE.sketch` key
4. Refresh the page
5. Visit history should be preserved

### Clearing Persisted Data

```typescript
// Clear specific data:
this.store.dispatch(new SketchActions.ClearFavorites());
this.store.dispatch(new SketchActions.ClearBookmarks());

// Or manually clear from localStorage:
localStorage.removeItem("@@STATE.sketch");
localStorage.clear(); // Clears all storage
```

## Future Database Integration

When moving to database storage:

1. **Keep localStorage as cache** for instant load
2. **Sync on user actions**:

   ```typescript
   // After updating state, also save to DB:
   this.store.dispatch(new SetSelectedNode(nodeId));
   this.apiService.saveNodeVisit(nodeId, timestamp).subscribe();
   ```

3. **Load from DB on login**:

   ```typescript
   this.apiService.getUserNodeHistory().subscribe((history) => {
     this.store.dispatch(new LoadNodeVisitHistory(history));
   });
   ```

4. **Periodic sync** to catch offline changes

## Data Safety

### Current Setup:

- ✅ Survives page refresh
- ✅ Survives browser restart
- ❌ Lost if user clears browser data
- ❌ Not shared across devices
- ❌ Not backed up

### After Database Integration:

- ✅ Survives all browser events
- ✅ Shared across devices
- ✅ Backed up server-side
- ✅ Supports offline mode with sync

## Development Notes

### Debugging Persistence

Look for these console messages:

- `🔄 Rehydrating toolbar visibility from localStorage`
- `🕒 Rehydrating node visit history: X nodes tracked`
- `🔧 Initialized nodeVisitHistory structure`

### Performance

- LocalStorage has ~5-10MB limit per domain
- Current data structures are very efficient
- Node visit history: ~100 bytes per node
- Can track thousands of nodes before hitting limits

### Browser Compatibility

- Works in all modern browsers
- IE11+ supported (but who cares about IE)
- Private/Incognito mode: Works during session, cleared on close
