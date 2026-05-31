# Colorizer Export/Import with OS-Compatible Names

## Overview

Complete implementation of colorizer export/import functionality with automatic OS-compatible filename validation and sanitization. Colorizers are always exported as `COLORIZER.[sanitized-name].json`.

## Components Created

### 1. Utility Functions - `colorizer-export.utils.ts`

**`sanitizeColorizerName(name: string): string`**

- Removes all OS-incompatible characters:
  - Windows-invalid: `< > : " / \ | ? *`
  - Unix-invalid: `/`
- Trims leading/trailing dots and spaces
- Limits to 200 characters
- Returns "colorizer" if result is empty
- Example: `My "Test" Colorizer` → `My -Test- Colorizer`

**`getColorizerExportFilename(colorizerName: string): string`**

- Returns: `COLORIZER.[sanitized-name].json`
- Automatically sanitizes the name
- Example: `getColorizerExportFilename("Team's Best Setup")` → `COLORIZER.Team-s-Best-Setup.json`

**`extractColorizerNameFromFilename(filename: string): string | null`**

- Reverses the above process
- Extracts colorizer name from filename
- Returns null if filename doesn't match pattern

**`isValidColorizerName(name: string): boolean`**

- Returns false if:
  - Name is empty or whitespace-only
  - Name is too long (>255 chars)
  - Name is not a string

### 2. Export/Import Service - `colorizer-export-import.service.ts`

**`exportColorizerToJson(colorizer: ISavedColorizer): string`**

- Converts colorizer to formatted JSON (2-space indent)
- Returns JSON string

**`exportColorizerAsFile(colorizer: ISavedColorizer): void`**

- Triggers browser file download
- Filename: `COLORIZER.[sanitized-name].json`
- Automatically handled by browser

**`importColorizerFromJson(jsonString: string): ISavedColorizer | null`**

- Parses JSON string
- Validates colorizer structure:
  - Required: colorizerId, colorizerName, strategy, colorTarget, ownershipContext
  - Strategy must have: category, strategyName
  - colorTarget must be: 'nodes', 'text', or 'both'
- Returns null if invalid

**`importColorizerFromFile(file: File): Promise<ISavedColorizer | null>`**

- Reads file asynchronously
- Parses and validates
- Promise-based for async handling

**`exportMultipleColorizers(colorizers: ISavedColorizer[]): string`**

- Bulk export with metadata
- Includes: exportedAt, version, count, colorizers[]

### 3. State Management - `colorizer-library.state.ts` (Updated)

**Automatic Name Sanitization**

- `AddColorizerToLibrary` action now sanitizes names
- Ensures all stored colorizers have OS-compatible names
- Parent components can send unsanitized names; state handles normalization

```typescript
// Before saving, name is automatically sanitized
const savedColorizer: ISavedColorizer = {
  ...action.payload.colorizer,
  colorizerName: sanitizeColorizerName(action.payload.colorizerName), // ← Automatic
  // ... other fields
};
```

### 4. Name Validation Dialog - `colorizer-name-dialog.component.ts`

Standalone Angular Material dialog for user input with validation.

**Features:**

- Real-time sanitization preview
- Export filename preview: `COLORIZER.[name].json`
- Shows original vs sanitized name if different
- Validation error messages
- Enter key to save
- Disabled save button if invalid

**Usage:**

```typescript
constructor(private dialog: MatDialog) {}

openColorizerNameDialog(): void {
  this.dialog.open(ColorizerNameDialogComponent, {
    data: {
      title: 'Save Colorizer',
      message: 'Enter a name for your colorizer:',
      defaultName: 'My Colorizer',
      allowEmpty: false,
    },
  }).afterClosed().subscribe((result) => {
    if (result) {
      // result.originalName: User input (unsanitized)
      // result.sanitizedName: Final name for export
      this.dispatch(new AddColorizerToLibrary({
        colorizer: this.currentColorizer,
        colorizerName: result.originalName, // State will sanitize
        ownershipContext: this.ownershipContext,
      }));
    }
  });
}
```

### 5. Toolbar Updates - `toolbar-colorization-options.component.ts/html`

**New Outputs:**

- `@Output() exportColorizer` - Emit on export button click
- `@Output() importColorizer` - Emit on import button click

**New UI Section: "File Transfer"**

- 📥 **Export** - Downloads current colorizer as JSON
- 📤 **Import** - Opens file picker to import saved JSON

**Styling:**

- Primary buttons (blue): Library operations (Save, Save As, Load)
- Secondary buttons (gray): File operations (Export, Import)

## Data Flow

### Save Colorizer

```
User Input (unsanitized)
    ↓
Dialog Component (validates & shows preview)
    ↓
Parent Component (dispatches AddColorizerToLibrary action)
    ↓
ColorizerLibraryState.addColorizerToLibrary()
    ↓
sanitizeColorizerName() ← Automatic name sanitization
    ↓
ISavedColorizer stored in state with sanitized name
    ↓
localStorage persistence
```

### Export Colorizer

```
ColorizerLibraryState (saved with sanitized name)
    ↓
Service.exportColorizerAsFile()
    ↓
getColorizerExportFilename()
    ↓
Download: COLORIZER.[sanitized-name].json
```

### Import Colorizer

```
User selects file: COLORIZER.*.json
    ↓
Service.importColorizerFromFile()
    ↓
Validates JSON structure
    ↓
Parent dispatches AddColorizerToLibrary(imported colorizer)
    ↓
State sanitizes name again (defensive)
    ↓
Stored in library with potentially re-sanitized name
```

## Name Sanitization Examples

| Input                       | Sanitized                     | Export Filename                      |
| --------------------------- | ----------------------------- | ------------------------------------ |
| `My Custom Colorizer`       | `My Custom Colorizer`         | `COLORIZER.My Custom Colorizer.json` |
| `Test "Setup"`              | `Test -Setup-`                | `COLORIZER.Test -Setup-.json`        |
| `Path/To/Colorizer`         | `Path-To-Colorizer`           | `COLORIZER.Path-To-Colorizer.json`   |
| `Windows<>Bad?Name`         | `Windows---BadName`           | `COLORIZER.Windows---BadName.json`   |
| `Very........Long.....Dots` | `VeryLongDots`                | `COLORIZER.VeryLongDots.json`        |
| `😀 Emoji Name`             | ` Emoji Name` (emoji removed) | `COLORIZER. Emoji Name.json`         |

## Architecture

```
┌─────────────────────────────────┐
│  User Input (Dialog)            │
│  - Original name (unsanitized)  │
└────────────────┬────────────────┘
                 │ Shows preview
                 ▼
┌─────────────────────────────────────────┐
│  ColorizerNameDialog Component          │
│  - Real-time sanitization display       │
│  - Export filename preview              │
│  - Validation errors                    │
└────────────────┬────────────────────────┘
                 │ Close with result
                 ▼
┌─────────────────────────────────────────┐
│  Parent Component (visualization-tester)│
│  - Dispatch AddColorizerToLibrary       │
│  - Can pass unsanitized name            │
└────────────────┬────────────────────────┘
                 │ Action payload
                 ▼
┌─────────────────────────────────────────┐
│  ColorizerLibraryState.addColorizerToLib│
│  - Sanitizes name via utility function  │
│  - Stores with sanitized name           │
│  - Persists to localStorage             │
└────────────────┬────────────────────────┘
                 │ User clicks Export
                 ▼
┌─────────────────────────────────────────┐
│  Export/Import Service                  │
│  - getColorizerExportFilename()         │
│  - Generates: COLORIZER.[name].json     │
│  - Browser downloads file               │
└─────────────────────────────────────────┘
```

## Integration Checklist

- [x] Sanitization utility functions created
- [x] Export/import service created
- [x] Name validation dialog created (Material)
- [x] State automatically sanitizes on save
- [x] Toolbar UI buttons added
- [x] File naming pattern: `COLORIZER.[name].json`
- [x] Preview in dialog showing final filename
- [x] No compilation errors

## Next Steps for Parent Component

1. **Import the dialog:**

   ```typescript
   import { ColorizerNameDialogComponent } from "...colorizer-name-dialog.component";
   import { MatDialog } from "@angular/material/dialog";
   ```

2. **Listen to toolbar events:**

   ```html
   (saveColorizer)="onSaveColorizer()" (saveColorizerAs)="onSaveColorizerAs()" (loadColorizer)="onLoadColorizer()" (exportColorizer)="onExportColorizer()" (importColorizer)="onImportColorizer()"
   ```

3. **Implement handlers** with dialog for save operations
4. **Use service** for export/import file operations
5. **Dispatch state actions** to manage library

## Key Design Decisions

1. **Automatic Sanitization**: Names are sanitized at state level, not user input level

   - Allows flexibility in UI (can show original before sanitizing)
   - Guarantees all stored names are always valid
   - Defensive: Even if parent passes bad names, they're fixed

2. **Preview in Dialog**: Users see exact export filename before saving

   - Builds confidence in the system
   - Shows how their name will be modified
   - No surprises when exporting

3. **Reversible Pattern**: `COLORIZER.[name].json` is easily parseable

   - Import can validate structure
   - Supports smart rename/duplicate on import
   - Clear intent (COLORIZER. prefix)

4. **Validation at Multiple Levels**:
   - Dialog: User feedback
   - Utility: Reusable validation
   - State: Last-mile sanitization
   - Service: Structure validation on import

## Testing Recommendations

- Test with special characters: `<>:"/\|?*`
- Test with Unicode: emojis, Chinese, Arabic characters
- Test with very long names (>255 chars)
- Test filename extraction from various formats
- Test import validation with malformed JSON
- Test localStorage persistence with sanitized names
- Test export filename generation across all edge cases
