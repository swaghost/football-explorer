# Team Group Selection - Quick Reference

## Issue Resolved ✅

**Problem**: When clicking on a team group, the correct draggable toolbars were not opening and closing automatically.

**Solution**: Implemented automatic toolbar visibility management that responds to team and team group selection changes.

## Current Behavior

### When you select a team group:

1. **`teamGroupMembers` toolbar opens** - Shows players in the selected team group
2. **`teamRoster` toolbar closes** - Hides the full team roster to focus on team group

### When you clear team group selection:

1. **`teamGroupMembers` toolbar closes** - Hides team group members
2. **`teamRoster` toolbar opens** - Shows full team roster (if team is selected)

### When you select a team:

1. **`teamRoster` toolbar opens** - Shows all players in the team
2. **`teamGroupMembers` toolbar closes** - Hides team group view (if no team group selected)

### When you clear team selection:

1. **Both toolbars close** - Cleans up the interface

## Implementation Location

**File**: `src/app/components/main/dr-ui-vers6/d3-ui-vers6.ts`

**Team Selection Logic**: Lines 1061-1076
**Team Group Selection Logic**: Lines 1085-1098

## Testing the Fix

1. Open the application
2. Select a team from the dropdown
3. Verify `teamRoster` toolbar opens
4. Select a team group within that team
5. Verify `teamGroupMembers` toolbar opens and `teamRoster` closes
6. Clear team group selection
7. Verify `teamGroupMembers` closes and `teamRoster` reopens

## Key Benefits

- **Focused Interface**: Only shows relevant toolbars for current selection
- **Automatic Management**: No manual toolbar opening/closing required
- **Intuitive Flow**: Natural progression from team → team group views
- **Reduced Clutter**: Automatically hides irrelevant toolbars

---

**Status**: ✅ Implemented and Working  
**Date**: October 19, 2025
