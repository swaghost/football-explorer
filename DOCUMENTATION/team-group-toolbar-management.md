# Team Group Toolbar Management

This document describes the implementation of automatic toolbar visibility management when teams and team groups are selected in the D3UIV6 component.

## Overview

The system automatically shows and hides relevant toolbars when users select teams or team groups, providing a clean and focused user experience by displaying only the toolbars relevant to the current selection context.

## Toolbar Types

### Team-Related Toolbars

- **`teamRoster`**: Displays the full roster of players for a selected team
- **`teamGroupMembers`**: Shows players belonging to a specific team group within a team
- **`defaultTeamGroups`**: Manages default team group configurations (always available)

## Behavior Logic

### When a Team is Selected

**Triggers:**

- User selects a team from the team dropdown
- Team selection changes via NGXS state action `SetSelectedTeam`

**Actions:**

- ✅ **Show** `teamRoster` toolbar (displays full team roster)
- ✅ **Hide** `teamGroupMembers` toolbar (only if no team group is selected)

**Code Location:** Lines 1061-1076 in `d3-ui-vers6.ts`

```typescript
// Manage team-related toolbar visibility
if (id !== null) {
  // Team selected - show team roster toolbar
  this.store.dispatch(new SetToolbarVisibility("teamRoster" as any, true));
  // If no team group is selected, hide team group members toolbar
  if (!this.currentSelectedTeamGroupId) {
    this.store.dispatch(new SetToolbarVisibility("teamGroupMembers" as any, false));
  }
} else {
  // No team selected - hide team-related toolbars
  this.store.dispatch(new SetToolbarVisibility("teamRoster" as any, false));
  this.store.dispatch(new SetToolbarVisibility("teamGroupMembers" as any, false));
}
```

### When a Team Group is Selected

**Triggers:**

- User selects a team group from the team group dropdown
- Team group selection changes via NGXS state action `SetSelectedTeamGroup`

**Actions:**

- ✅ **Show** `teamGroupMembers` toolbar (displays team group members)
- ✅ **Hide** `teamRoster` toolbar (focuses attention on team group subset)

**Code Location:** Lines 1085-1098 in `d3-ui-vers6.ts`

```typescript
// Manage team group-related toolbar visibility
if (id !== null) {
  // Team group selected - show team group members toolbar
  this.store.dispatch(new SetToolbarVisibility("teamGroupMembers" as any, true));
  // Hide team roster toolbar since we're focusing on team group members
  this.store.dispatch(new SetToolbarVisibility("teamRoster" as any, false));
} else {
  // No team group selected - hide team group members toolbar
  this.store.dispatch(new SetToolbarVisibility("teamGroupMembers" as any, false));
  // Show team roster toolbar if a team is selected
  if (this.currentSelectedTeamId) {
    this.store.dispatch(new SetToolbarVisibility("teamRoster" as any, true));
  }
}
```

### When Selections are Cleared

**Team Selection Cleared:**

- ✅ **Hide** both `teamRoster` and `teamGroupMembers` toolbars

**Team Group Selection Cleared:**

- ✅ **Hide** `teamGroupMembers` toolbar
- ✅ **Show** `teamRoster` toolbar (if a team is still selected)

## Implementation Details

### State Subscriptions

The logic is implemented through reactive subscriptions to NGXS state changes:

```typescript
// Team selection subscription
this.selectedTeamId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
  // Handle team selection changes and toolbar visibility
});

// Team group selection subscription
this.selectedTeamGroupId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
  // Handle team group selection changes and toolbar visibility
});
```

### State Properties Used

- `this.currentSelectedTeamId`: Current selected team ID from state
- `this.currentSelectedTeamGroupId`: Current selected team group ID from state

### NGXS Actions Used

- `SetToolbarVisibility(toolbarType, isVisible)`: Shows or hides specific toolbars

## User Experience Flow

### Scenario 1: Select Team Only

1. User selects "Team A"
2. `teamRoster` toolbar opens showing all Team A players
3. `teamGroupMembers` toolbar remains closed

### Scenario 2: Select Team, Then Team Group

1. User selects "Team A"
2. `teamRoster` toolbar opens
3. User selects "Forwards" team group within Team A
4. `teamGroupMembers` toolbar opens showing only forward players
5. `teamRoster` toolbar automatically closes to reduce clutter

### Scenario 3: Clear Team Group Selection

1. User has Team A and Forwards selected
2. `teamGroupMembers` toolbar is open
3. User clears team group selection
4. `teamGroupMembers` toolbar closes
5. `teamRoster` toolbar automatically reopens showing all Team A players

### Scenario 4: Clear Team Selection

1. User has Team A selected (with or without team group)
2. Both/either relevant toolbars are open
3. User clears team selection
4. All team-related toolbars close

## Benefits

### Reduced Cognitive Load

- Only shows relevant information for current selection
- Automatically closes irrelevant toolbars to reduce screen clutter

### Intuitive Workflow

- Natural progression from team-wide view to team group-specific view
- Automatic transitions feel responsive and intelligent

### Consistent Behavior

- Predictable toolbar management across all selection scenarios
- Clear visual feedback for current selection context

## Technical Notes

### Performance

- Uses reactive state subscriptions for efficient updates
- Only dispatches toolbar visibility actions when selections actually change

### Maintainability

- Centralized logic in state subscription handlers
- Clear separation between team and team group management logic

### Extensibility

- Easy to add additional toolbar types to the visibility management
- Logic can be extended for other selection contexts (e.g., player selection)

## Future Enhancements

1. **Animation Transitions**: Add smooth open/close animations for toolbar transitions
2. **User Preferences**: Allow users to override automatic toolbar management
3. **Context Memory**: Remember which toolbars were manually opened in specific contexts
4. **Smart Positioning**: Automatically position toolbars to avoid overlap
5. **Bulk Selection**: Handle multiple team/team group selections simultaneously
