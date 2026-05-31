# Lesson Toolbar Tenant Context Fix

## Issue Fixed

The lesson toolbar wasn't properly re-evaluating lesson availability when the tenant changed, and the filtering logic wasn't compatible with the new ownership context structure.

## Problems Addressed

### 1. Incompatible Ownership Context Structure

- Lesson filtering logic was checking for old `'SYS'` context name
- New structure uses `'TENANT'` with different Context values:
  - System: `ContextName: 'TENANT'`, `Context: -1`
  - Personal: `ContextName: 'TENANT'`, `Context: 0`
  - Tenant: `ContextName: 'TENANT'`, `Context: [tenantId]`
  - Team: `ContextName: 'TEAM'`, `Context: [teamId]`

### 2. No Reactive Updates on Tenant Changes

- Component didn't implement `OnChanges` to detect tenant/team changes
- Lessons weren't re-evaluated when context changed

## Solutions Implemented

### 1. Updated Filtering Logic

**`passesOwnershipFilter()` method:**

- Now handles `'TENANT'` context with different Context values
- System lessons (Context: -1) map to system filter
- Personal lessons (Context: 0) map to tenant filter
- Tenant lessons (Context: tenantId) map to tenant filter
- Maintains backward compatibility with legacy `'SYS'` context

**`isLessonSelectable()` method:**

- Updated to properly check tenant/team compatibility
- System lessons (Context: -1) are always selectable
- Personal lessons (Context: 0) are always selectable
- Tenant lessons must match current tenant ID
- Team lessons must match current team ID

**`getOwnershipLabel()` method:**

- Returns appropriate labels based on context structure:
  - "System" for Context: -1
  - "Personal" for Context: 0
  - "Tenant" for specific tenant IDs

### 2. Added Reactive Updates

**Implemented `OnChanges` interface:**

- Added `ngOnChanges()` method to detect input changes
- Monitors `currentTenantId`, `currentTeamId`, and `allLessons` changes
- Logs changes for debugging purposes

**Added `evaluateLessonAvailability()` method:**

- Re-evaluates lesson selectability when context changes
- Automatically clears selected lesson if it becomes invalid
- Emits `lessonSelect.emit(null)` to clear invalid selections
- Logs available lessons for current context

## Files Modified

- `src/app/components/toolbars/lessons/toolbar-lessons.component.ts`

## Expected Behavior

### When Tenant Changes:

1. **Automatic Re-evaluation:** Component detects tenant ID change via `ngOnChanges`
2. **Filter Update:** Lessons are filtered based on new tenant context
3. **Selection Validation:** If current lesson is incompatible, it's automatically cleared
4. **UI Update:** Lesson items show correct enabled/disabled states
5. **Logging:** Console shows available lessons for debugging

### Lesson Availability Rules:

- **System lessons** (`Context: -1`): Always available regardless of tenant
- **Personal lessons** (`Context: 0`): Always available to the user
- **Tenant lessons** (`Context: tenantId`): Only available when matching current tenant
- **Team lessons** (`Context: teamId`): Only available when matching current team

### Visual Feedback:

- Selectable lessons: Normal styling, clickable
- Non-selectable lessons: `disabled` class applied, click prevented
- Current selection automatically cleared if incompatible

## Benefits

- ✅ Lessons automatically enable/disable based on tenant context
- ✅ Invalid lesson selections are automatically cleared
- ✅ Maintains backward compatibility with existing lesson structure
- ✅ Provides debugging information via console logs
- ✅ Prevents user confusion with proper visual feedback
