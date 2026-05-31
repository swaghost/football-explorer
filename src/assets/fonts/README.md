# Custom Fonts Directory

This directory contains custom font files for the application. Fonts are dynamically loaded from a manifest file, making it easy to add or remove fonts without modifying any service code.

## Adding New Fonts

To add a new custom font:

1. **Copy the font file** to this directory (e.g., `my-font.ttf`)

2. **Update `fonts.json`** with the new font entry:

   ```json
   {
     "id": "my-font",
     "name": "My Font",
     "family": "My-Font",
     "path": "assets/fonts/my-font.ttf",
     "displayName": "My Font Display Name",
     "fallback": "sans-serif"
   }
   ```

   **Optional properties:**

   - `weight`: Font weight (normal, bold, 100-900) - default: "normal"
   - `style`: Font style (normal, italic) - default: "normal"

3. **Reload the application** - The new font will appear in all font selection dropdowns

## Removing Fonts

To remove a font:

1. **Delete the font file** from this directory

2. **Remove the entry** from `fonts.json`

3. **Reload the application**

## Current Fonts

All available fonts are listed in `fonts.json`. Standard system fonts (Arial, Verdana, Georgia, etc.) are hardcoded in the FontService and always available.

## Font Configuration

Fonts are defined in `fonts.json` with the following structure:

```json
{
  "customFonts": [
    {
      "id": "unique-id", // Unique identifier
      "name": "Font Name", // Internal name
      "family": "FontFamily", // CSS font-family name
      "path": "assets/fonts/...", // Path to font file
      "displayName": "Display Name", // User-friendly name (shown in UI)
      "fallback": "sans-serif", // Fallback font family
      "weight": "bold", // Optional: font weight
      "style": "italic" // Optional: font style
    }
  ]
}
```

## Font Family Names

Each font must have a unique `family` name used in CSS @font-face rules. If you have multiple variants of the same font (e.g., bold, italic), use different family names:

- Base: `"FontName"`
- Bold: `"FontName-Bold"`
- Italic: `"FontName-Italic"`
- Bold Italic: `"FontName-BoldItalic"`

## Technical Details

- The `FontService` loads standard fonts at construction time
- Custom fonts are loaded asynchronously from `fonts.json`
- When a component needs fonts, it calls `ensureCustomFontsLoaded()` to wait for the manifest
- @font-face rules are injected into the document when fonts are used
- Font files must be in `.ttf` (TrueType) format
