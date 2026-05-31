# Font Configuration Guide - Option C (Local Hosting)

## Overview

This project uses locally-hosted font declarations to ensure consistent font rendering across all user systems. All fonts are declared with proper fallback chains.

## Font Directory Structure

```
src/
  styles/
    fonts.scss          <- Font declarations and variables
  assets/
    fonts/              <- Font files directory (for future .woff/.woff2 files)
```

## Font Declarations

### Primary Fonts with Fallback Chains

The following fonts are declared in `src/styles/fonts.scss`:

1. **Times New Roman**

   - Primary: Local Times New Roman (Windows/Mac system font)
   - Fallback: Georgia → Times → serif

2. **Courier New**

   - Primary: Local Courier New (monospace system font)
   - Fallback: Courier → monospace

3. **Garamond**

   - Primary: Local Garamond
   - Fallback: Georgia → serif

4. **Palatino Linotype**

   - Primary: Local Palatino Linotype
   - Fallback: Book Antiqua → Palatino → serif

5. **Comic Sans MS**

   - Primary: Local Comic Sans MS
   - Fallback: cursive (generic)

6. **Standard Fonts** (Arial, Helvetica, Georgia, Verdana, Trebuchet MS)
   - Declared with appropriate fallback chains

## Integration Points

### CSS Import

In `src/styles.scss`:

```scss
@import "styles/fonts.scss";
```

### TypeScript Font Mapping

In `src/app/components/main/visualization-tester/visualization-tester.ts`:
The `getFontFamilyWithFallback()` method maps font names to proper CSS font-family strings, maintaining consistency with the SCSS declarations.

## Future Enhancement: Web Font Files

To add true local .woff/.woff2 files:

1. **Download fonts from Google Fonts:**

   - Visit https://fonts.google.com/
   - Select desired fonts (Times New Roman equivalent, Courier, etc.)
   - Download the .woff2 files

2. **Place files in `src/assets/fonts/`:**

   ```
   src/assets/fonts/
     times-new-roman.woff2
     courier-new.woff2
     garamond.woff2
     etc.
   ```

3. **Update `src/styles/fonts.scss`:**

   ```scss
   @font-face {
     font-family: "Times New Roman";
     src: url("/assets/fonts/times-new-roman.woff2") format("woff2");
     font-weight: 400;
     font-style: normal;
   }
   ```

4. **Build will automatically optimize fonts** through the Angular build pipeline.

## Current Implementation

- ✅ All fonts declared with proper fallback chains
- ✅ System fonts used (no external downloads required currently)
- ✅ CSS fallback hierarchy ensures rendering on all platforms
- ⏳ Ready for .woff2 file integration when needed

## Testing

Fonts are applied to:

- Tree node text labels (via `treeTextSize`)
- Root node text (via `rootNodeSize`)
- Font selection dropdown shows all 12+ available fonts

## Compatibility

- ✅ Works on Windows, macOS, Linux with system fonts
- ✅ Graceful degradation via fallback chains
- ✅ Ready for web font enhancement without code changes
