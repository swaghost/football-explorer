# Context Relative IsAssumable Implementation

## Overview

Updated the `tenantRelatives` data structure in `TenantConfig` to use an `IContextRelative` interface that includes an `IsAssumable` flag. This allows fine-grained control over which relatives can be selected as context users in the context-user-selection drawer.

## Changes Made

### 1. Interface Definition (`user.interfaces.ts`)

Created new `IContextRelative` interface:

```typescript
export interface IContextRelative {
  UserID: number;
  IsAssumable: boolean;
}
```

Updated `TenantConfig` interface:

```typescript
export interface TenantConfig {
  tenantId: number;
  tenantRoles: number[];
  tenantRelatives: IContextRelative[]; // Changed from number[] to IContextRelative[]
}
```

### 2. Mock Data (`mock-user-data.json`)

Converted all `tenantRelatives` arrays from simple number arrays to `IContextRelative` object arrays.

**Before:**

```json
"tenantRelatives": [3, 4, 5, 7]
```

**After:**

```json
"tenantRelatives": [
  { "UserID": 3, "IsAssumable": true },
  { "UserID": 4, "IsAssumable": true },
  { "UserID": 5, "IsAssumable": true },
  { "UserID": 7, "IsAssumable": true }
]
```

All existing relatives are set to `IsAssumable: true` by default to maintain backward compatibility.

### 3. Service Layer (`mock-user.service.ts`)

Updated `populateTenantRelatives` method:

- Changed parameter type from `number[]` to `IContextRelative[]`
- Added `IContextRelative` import
- Reads `IsAssumable` flag from config and applies it to cloned user object
- Updated code that checks relatives for non-parent roles to use `relativeConfig.UserID`

```typescript
private populateTenantRelatives(
  relativeConfigs: IContextRelative[],
  allUsers: User[],
  currentTenantId?: number
): User[] {
  return relativeConfigs
    .map((relativeConfig) => {
      const user = allUsers.find((u) => u.UserId === relativeConfig.UserID);
      if (!user) return undefined;

      const clonedUser: User = {
        ...user,
        Tenants: [],
        IsAssumable: relativeConfig.IsAssumable,  // Apply IsAssumable from config
      };

      return clonedUser;
    })
    .filter((user): user is User => user !== undefined);
}
```

### 4. Drawer Component (`drawer-context-user-selection.ts`)

Added `isUserAssumable` method:

```typescript
isUserAssumable(user: User): boolean {
  // Check if the user has IsAssumable flag set (default to true if not specified for backwards compatibility)
  return user.IsAssumable !== false;
}
```

Updated `onUserSelect` to check assumability before allowing selection:

```typescript
onUserSelect(user: User): void {
  // Only allow selection if user is assumable
  if (!this.isUserAssumable(user)) {
    return;
  }
  this.userSelected.emit(user);
  this.onClose();
}
```

### 5. Drawer Template (`drawer-context-user-selection.html`)

Added `[class.disabled]` binding to both "Me" and related user items:

```html
<div class="user-item" [class.selected]="isUserSelected(user.UserId)" [class.disabled]="!isUserAssumable(user)" (click)="onUserSelect(user)"></div>
```

### 6. Drawer Styles (`drawer-context-user-selection.scss`)

Added disabled state styling:

```scss
&.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;

  &:hover {
    background: #f5f5f5;
    border-color: #e9ecef;
    transform: none;
  }

  .checkbox-container {
    .checkmark,
    .checkbox {
      color: #999;
    }
  }

  .user-details {
    .user-line-1,
    .user-line-2,
    .user-line-3 {
      color: #999;
    }
  }
}
```

## Usage Example

To make a relative non-assumable (disabled in the drawer), set `IsAssumable: false`:

```json
{
  "UserId": 7,
  "FirstName": "Scott",
  "LastName": "Assenheimer",
  "mockTenantConfig": [
    {
      "tenantId": 5,
      "tenantRoles": [9, 2],
      "tenantRelatives": [
        { "UserID": 3, "IsAssumable": true }, // Can be selected
        { "UserID": 4, "IsAssumable": false }, // Will be disabled in drawer
        { "UserID": 5, "IsAssumable": true }
      ]
    }
  ]
}
```

When the drawer opens, UserID 4 will appear grayed out with reduced opacity, cannot be clicked, and will not emit a selection event.

## Backward Compatibility

- The `isUserAssumable` method defaults to `true` if `IsAssumable` is not specified (`user.IsAssumable !== false`)
- All existing data has been migrated to use `IsAssumable: true` by default
- No breaking changes to existing functionality

## Testing

To test the disabled state:

1. Set a relative's `IsAssumable` to `false` in `mock-user-data.json`
2. Log in as a user who has that relative
3. Open the context-user-selection drawer
4. Verify the relative appears grayed out and cannot be clicked

## Future Enhancements

Potential additions:

- Add tooltip explaining why a user is not assumable
- Add visual indicator (e.g., lock icon) for non-assumable users
- Add admin override to allow assuming non-assumable users
- Log attempts to select non-assumable users for auditing
