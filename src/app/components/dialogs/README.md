# Dialog Components Migration Guide

This guide shows how to replace the inline dialogs in D3UIV6 with the new standalone dialog components.

## Overview

The following dialog components have been created to replace inline dialog HTML:

1. `DialogEditTeamGroupComponent` - Replaces team group edit dialog
2. `DialogPlayerEditComponent` - Replaces player edit dialog
3. `DialogAddPlayerComponent` - Replaces add player dialog
4. `DialogCreateTeamComponent` - Replaces create team dialog
5. `DialogDeleteTeamComponent` - Replaces delete team confirmation
6. `DialogDeleteTeamGroupComponent` - Replaces delete team group confirmation
7. `DialogCreateTeamGroupComponent` - Replaces create team group dialog
8. `DialogAddDefaultTeamGroupsComponent` - Replaces add default team groups dialog
9. `DialogEditLessonComponent` - Replaces edit lesson dialog

## Migration Steps

### Step 1: Import Dialog Components

Add the dialog components to your main component imports:

```typescript
import {
  DialogEditTeamGroupComponent,
  DialogPlayerEditComponent,
  DialogAddPlayerComponent,
  DialogCreateTeamComponent,
  DialogDeleteTeamComponent,
  DialogDeleteTeamGroupComponent,
  DialogCreateTeamGroupComponent,
  DialogAddDefaultTeamGroupsComponent,
  DialogEditLessonComponent
} from './dialogs';

@Component({
  selector: 'app-d3-ui-vers6',
  standalone: true,
  imports: [
    // ... existing imports
    DialogEditTeamGroupComponent,
    DialogPlayerEditComponent,
    DialogAddPlayerComponent,
    DialogCreateTeamComponent,
    DialogDeleteTeamComponent,
    DialogDeleteTeamGroupComponent,
    DialogCreateTeamGroupComponent,
    DialogAddDefaultTeamGroupsComponent,
    DialogEditLessonComponent
  ],
  // ... rest of component config
})
```

### Step 2: Replace Dialog HTML

In your template, replace the existing dialog HTML blocks with component tags:

#### Before (remove this):

```html
<div class="modal-overlay" *ngIf="showEditTeamGroupDialog" (click)="closeEditTeamGroupDialog()">
  <div class="team-group-edit-dialog" (click)="$event.stopPropagation()">
    <!-- ... entire dialog content ... -->
  </div>
</div>
```

#### After (use this):

```html
<app-dialog-edit-team-group [visible]="showEditTeamGroupDialog" [editingTeamGroup]="editingTeamGroup" [selectedTeam]="selectedTeam" [playerSortBy]="playerSortBy" [playerSortOptions]="playerSortOptions" [tempSelectedPlayerIds]="tempSelectedPlayerIds" (close)="closeEditTeamGroupDialog()" (save)="saveTeamGroupChanges()" (playerSortChange)="onPlayerSortChange($event)" (tempPlayerCheckboxChange)="onTempPlayerCheckboxChange($event)"> </app-dialog-edit-team-group>
```

### Step 3: Update Event Handlers

Some event handlers may need slight modifications to work with the new component structure:

```typescript
// Update checkbox change handler to match new signature
public onTempPlayerCheckboxChange(data: {playerId: number, checked: boolean}): void {
  const { playerId, checked } = data;
  // Your existing logic here
}
```

### Step 4: Keep Existing Methods

Most of your existing dialog methods can remain unchanged:

```typescript
// These methods can stay the same
public closeEditTeamGroupDialog(): void {
  this.showEditTeamGroupDialog = false;
}

public saveTeamGroupChanges(): void {
  // Your existing save logic
  this.closeEditTeamGroupDialog();
}
```

## Benefits

✅ **Cleaner HTML** - Main template is much smaller and more readable
✅ **Reusable Components** - Dialogs can be used in other components
✅ **Better Testing** - Each dialog can be tested independently
✅ **Maintainability** - Dialog logic is isolated and easier to modify
✅ **Type Safety** - Strong typing through @Input and @Output decorators
✅ **No Functionality Loss** - All existing features are preserved

## Complete Example

See `integration-example.html` and `integration-example.ts` for complete examples of how to integrate these components.

## Next Steps

1. Replace one dialog at a time to ensure nothing breaks
2. Test each dialog thoroughly after replacement
3. Remove the old dialog HTML blocks once new components are working
4. Consider extracting toolbar components next using the same pattern
