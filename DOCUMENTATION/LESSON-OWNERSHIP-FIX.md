# Lesson Ownership Context Fix

## Issue Fixed

The lesson creation dialog was incorrectly setting the ownership context, preventing proper lesson selection.

## Problem

When creating lessons, the ownership context was being set incorrectly:

- PERSONAL was using `ContextName: 'PERSONAL'` instead of `ContextName: 'TENANT'`
- SYSTEM was using `ContextName: 'SYS'` instead of `ContextName: 'TENANT'`

## Solution

Updated `dialog-create-lesson.component.ts` in the `onSave()` method to correctly map ownership contexts:

### Fixed Mapping:

- **PERSONAL** → `ContextName: 'TENANT'`, `Context: 0`
- **SYSTEM** → `ContextName: 'TENANT'`, `Context: -1`
- **TENANT** → `ContextName: 'TENANT'`, `Context: [tenant ID]`
- **TEAM** → `ContextName: 'TEAM'`, `Context: [team ID]`

## Files Modified

- `src/app/components/dialogs/dialog-create-lesson/dialog-create-lesson.component.ts`

## Verification

The fix aligns with the existing mock data service which uses:

- `ContextName: 'TENANT'` with `Context: -1` for system-level DecisionFlows
- `ContextName: 'TENANT'` with `Context: 0` for personal-level content

## Expected Result

Users can now successfully create and select lessons with proper ownership context mapping.
