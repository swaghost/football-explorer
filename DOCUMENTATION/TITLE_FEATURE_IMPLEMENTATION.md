# Title Feature Implementation Guide

## Overview

The **Title** feature allows users to add customizable titles to the visualization with full control over positioning, styling, borders, and background.

## Features

### 1. Enable/Disable

- **Enable Title Checkbox**: Toggle to show/hide the title on the visualization
- All title-related controls are automatically disabled when the title is disabled

### 2. Title Positioning (9 Positions)

- **Top Left** - Upper left corner
- **Top Center** - Top center of visualization
- **Top Right** - Upper right corner
- **Middle Left** - Vertically centered left edge
- **Dead Center** - Exact center of visualization
- **Middle Right** - Vertically centered right edge
- **Bottom Left** - Lower left corner
- **Bottom Center** - Bottom center of visualization
- **Bottom Right** - Lower right corner

### 3. Two-Line Text Support

#### Title Line 1 (Primary Title)

- **Text Field**: Custom text for the first line
- **Font Selection**: Choose from all available system fonts
- **Font Size**: 8pt to 72pt (numeric input)
- **Text Color**: Full color picker support
- **Styling Options**:
  - Bold
  - Italic
  - Uppercase
  - Underline

#### Title Line 2 (Subtitle)

- **Text Field**: Custom text for the second line
- **Font Selection**: Choose from all available system fonts
- **Font Size**: 8pt to 72pt (numeric input)
- **Text Color**: Full color picker support
- **Styling Options**:
  - Bold
  - Italic
  - Uppercase
  - Underline

### 4. Border Options

#### Border Types

- **None** - No border or background (text only)
- **Squared Rectangle** - Sharp 90-degree corners with solid border
- **Rounded Rectangle** - Rounded corners with solid border
- **Drop Shadow** - Semi-transparent background with shadow effect

#### Border Customization

- **Border Color**: Full color picker (disabled when border type is "None")
- **Border Thickness**: 1-10px via slider control

### 5. Background Color

- **Background Color Picker**: Set the background color for the title area
- Only visible when border type is not "None"
- Automatically applies behind both title lines within the border

## Implementation Details

### Component Structure

#### Toolbar Component (`toolbar-text-styling.ts`)

**Inputs:**

- `enableTitle: boolean` - Enable/disable title display
- `titlePosition: string` - Current position setting
- `titleLine1: string` - First line text
- `titleLine1Font: string` - First line font family
- `titleLine1Size: number` - First line font size (px)
- `titleLine1Color: string` - First line text color
- `titleLine1Bold: boolean` - First line bold state
- `titleLine1Italic: boolean` - First line italic state
- `titleLine1Uppercase: boolean` - First line uppercase transform
- `titleLine1Underline: boolean` - First line underline style
- `titleLine2: string` - Second line text
- `titleLine2Font: string` - Second line font family
- `titleLine2Size: number` - Second line font size (px)
- `titleLine2Color: string` - Second line text color
- `titleLine2Bold: boolean` - Second line bold state
- `titleLine2Italic: boolean` - Second line italic state
- `titleLine2Uppercase: boolean` - Second line uppercase transform
- `titleLine2Underline: boolean` - Second line underline style
- `titleBorderType: string` - Border style ('none'|'squared'|'rounded'|'shadow')
- `titleBorderColor: string` - Border color
- `titleBorderThickness: number` - Border width (1-10px)
- `titleBackgroundColor: string` - Background fill color

**Outputs:**

- `enableTitleChange` - Emitted when title enable/disable checkbox changes
- `titlePositionChange` - Emitted when position selection changes
- `titleLine1Change` - Emitted when line 1 text changes
- `titleLine1FontChange` - Emitted when line 1 font changes
- `titleLine1SizeChange` - Emitted when line 1 size changes
- `titleLine1ColorChange` - Emitted when line 1 color changes
- `titleLine1BoldChange` - Emitted when line 1 bold toggles
- `titleLine1ItalicChange` - Emitted when line 1 italic toggles
- `titleLine1UppercaseChange` - Emitted when line 1 uppercase toggles
- `titleLine1UnderlineChange` - Emitted when line 1 underline toggles
- `titleLine2Change` - Emitted when line 2 text changes
- `titleLine2FontChange` - Emitted when line 2 font changes
- `titleLine2SizeChange` - Emitted when line 2 size changes
- `titleLine2ColorChange` - Emitted when line 2 color changes
- `titleLine2BoldChange` - Emitted when line 2 bold toggles
- `titleLine2ItalicChange` - Emitted when line 2 italic toggles
- `titleLine2UppercaseChange` - Emitted when line 2 uppercase toggles
- `titleLine2UnderlineChange` - Emitted when line 2 underline toggles
- `titleBorderTypeChange` - Emitted when border type changes
- `titleBorderColorChange` - Emitted when border color changes
- `titleBorderThicknessChange` - Emitted when border thickness changes
- `titleBackgroundColorChange` - Emitted when background color changes

#### Visualization Component (`visualization-tester.ts`)

**Public Properties:**

```typescript
public enableTitle: boolean = false;
public titlePosition: 'top-left' | 'top-center' | 'top-right' |
                      'middle-left' | 'center' | 'middle-right' |
                      'bottom-left' | 'bottom-center' | 'bottom-right' = 'top-center';
public titleLine1: string = 'Title Line 1';
public titleLine1Font: string = 'Arial';
public titleLine1Size: number = 24;
public titleLine1Color: string = '#000000';
public titleLine1Bold: boolean = false;
public titleLine1Italic: boolean = false;
public titleLine1Uppercase: boolean = false;
public titleLine1Underline: boolean = false;
public titleLine2: string = 'Title Line 2';
public titleLine2Font: string = 'Arial';
public titleLine2Size: number = 16;
public titleLine2Color: string = '#666666';
public titleLine2Bold: boolean = false;
public titleLine2Italic: boolean = false;
public titleLine2Uppercase: boolean = false;
public titleLine2Underline: boolean = false;
public titleBorderType: 'none' | 'squared' | 'rounded' | 'shadow' = 'shadow';
public titleBorderColor: string = '#333333';
public titleBorderThickness: number = 2;
public titleBackgroundColor: string = 'rgba(255, 255, 255, 0.95)';
```

**Event Handlers:**

- `onEnableTitleChange(enabled: boolean)` - Handle enable/disable toggle
- `onTitlePositionChange(position: string)` - Handle position changes
- `onTitleLine1Change(text: string)` - Handle line 1 text changes
- `onTitleLine1FontChange(font: string)` - Handle line 1 font changes
- `onTitleLine1SizeChange(size: number)` - Handle line 1 size changes
- `onTitleLine1ColorChange(color: string)` - Handle line 1 color changes
- `onTitleLine1BoldChange(bold: boolean)` - Handle line 1 bold toggle
- `onTitleLine1ItalicChange(italic: boolean)` - Handle line 1 italic toggle
- `onTitleLine1UppercaseChange(uppercase: boolean)` - Handle line 1 uppercase toggle
- `onTitleLine1UnderlineChange(underline: boolean)` - Handle line 1 underline toggle
- `onTitleLine2Change(text: string)` - Handle line 2 text changes
- `onTitleLine2FontChange(font: string)` - Handle line 2 font changes
- `onTitleLine2SizeChange(size: number)` - Handle line 2 size changes
- `onTitleLine2ColorChange(color: string)` - Handle line 2 color changes
- `onTitleLine2BoldChange(bold: boolean)` - Handle line 2 bold toggle
- `onTitleLine2ItalicChange(italic: boolean)` - Handle line 2 italic toggle
- `onTitleLine2UppercaseChange(uppercase: boolean)` - Handle line 2 uppercase toggle
- `onTitleLine2UnderlineChange(underline: boolean)` - Handle line 2 underline toggle
- `onTitleBorderTypeChange(borderType: string)` - Handle border type changes
- `onTitleBorderColorChange(color: string)` - Handle border color changes
- `onTitleBorderThicknessChange(thickness: number)` - Handle border thickness changes
- `onTitleBackgroundColorChange(color: string)` - Handle background color changes

**Rendering Methods:**

- `private showTitle()` - Render the title on the visualization
- `private hideTitle()` - Remove the title from the visualization
- `private getTitlePositionCoordinates(boxWidth, boxHeight)` - Calculate position based on titlePosition setting

### Rendering Logic

#### Title Rendering Process

1. Check if `enableTitle` is true; if false, call `hideTitle()` and return
2. Create a D3 group element for the title (`titleGroup`)
3. Measure text dimensions for both lines using temporary SVG text elements
4. Calculate bounding box dimensions including padding
5. Determine position coordinates based on `titlePosition` setting
6. Draw background rectangle with appropriate styling:
   - **Squared**: Sharp corners, solid border
   - **Rounded**: Rounded corners (rx=8, ry=8), solid border
   - **Shadow**: Rounded corners (rx=4, ry=4), drop-shadow filter
   - **None**: Skip background/border drawing
7. Render both text lines with their respective styling
8. Apply all text attributes (color, font, size, bold, italic, underline, uppercase)

#### Position Calculation

The `getTitlePositionCoordinates()` method calculates coordinates based on:

- Content boundaries: `[-width/2, -height/2]` to `[width/2, height/2]`
- Padding: 20px from edges
- Box dimensions: calculated from text measurements + borders + padding

**Position Grid:**

```
Top-Left      Top-Center      Top-Right
Middle-Left   Dead-Center     Middle-Right
Bottom-Left   Bottom-Center   Bottom-Right
```

### Font Family Fallback

The title rendering uses `getFontFamilyWithFallback()` to ensure fonts render correctly with fallback chains. See [FONT_HOSTING_GUIDE.md](FONT_HOSTING_GUIDE.md) for details.

## User Interface

### Title Tab Layout

The Title tab is organized in sections:

1. **Title Settings** section

   - Enable Title checkbox (master control)
   - Position dropdown

2. **Title Line 1** section

   - Text input field
   - Font selector + Font size (side-by-side)
   - Color picker
   - Checkbox group: Bold, Italic, Uppercase, Underline

3. **Title Line 2** section

   - Text input field
   - Font selector + Font size (side-by-side)
   - Color picker
   - Checkbox group: Bold, Italic, Uppercase, Underline

4. **Border** section

   - Border Type dropdown
   - Border Color picker (disabled when "None" selected)
   - Border Thickness slider with pixel display

5. **Background** section
   - Background Color picker

### Control States

- All controls inside `indent-section` are disabled when title is disabled
- Visual feedback: opacity reduced (0.5) and pointer-events disabled

## Styling Considerations

### Font Styling Application

```typescript
const applyFontStyle = (element, font, size, bold, italic) => {
  element
    .attr("font-family", this.getFontFamilyWithFallback(font))
    .attr("font-size", size)
    .attr("font-weight", bold ? "bold" : "normal")
    .attr("font-style", italic ? "italic" : "normal");
};
```

### Text Decoration

- **Underline**: Applied via `text-decoration` SVG attribute
- **Uppercase**: Applied by converting text to uppercase in TypeScript before rendering
- **Bold/Italic**: Applied via font-weight and font-style attributes

### Border Styling Details

| Type    | rx  | ry  | stroke-width    | filter                                  |
| ------- | --- | --- | --------------- | --------------------------------------- |
| squared | 0   | 0   | borderThickness | none                                    |
| rounded | 8   | 8   | borderThickness | none                                    |
| shadow  | 4   | 4   | 1               | drop-shadow(0 2px 6px rgba(0,0,0,0.15)) |
| none    | —   | —   | —               | —                                       |

## Default Values

| Property             | Default                     |
| -------------------- | --------------------------- |
| enableTitle          | false                       |
| titlePosition        | 'top-center'                |
| titleLine1           | 'Title Line 1'              |
| titleLine1Font       | 'Arial'                     |
| titleLine1Size       | 24px                        |
| titleLine1Color      | '#000000'                   |
| titleLine1Bold       | false                       |
| titleLine1Italic     | false                       |
| titleLine1Uppercase  | false                       |
| titleLine1Underline  | false                       |
| titleLine2           | 'Title Line 2'              |
| titleLine2Font       | 'Arial'                     |
| titleLine2Size       | 16px                        |
| titleLine2Color      | '#666666'                   |
| titleLine2Bold       | false                       |
| titleLine2Italic     | false                       |
| titleLine2Uppercase  | false                       |
| titleLine2Underline  | false                       |
| titleBorderType      | 'shadow'                    |
| titleBorderColor     | '#333333'                   |
| titleBorderThickness | 2px                         |
| titleBackgroundColor | 'rgba(255, 255, 255, 0.95)' |

## Integration Points

1. **Toolbar Component** - Provides UI for title configuration
2. **Visualization Component** - Manages title state and rendering
3. **HTML Template** - Binds toolbar inputs/outputs to visualization properties
4. **D3.js** - Renders title elements as SVG text and shapes

## Performance Considerations

- Title is re-rendered only when:
  - A title property changes
  - Visualization layout changes (via `updateVisualization()`)
  - Enable state toggles
- Temporary text elements are created and destroyed for text measurement
- Text measurement occurs on every render to ensure accurate positioning
- Title is transformed with main visualization (pans/zooms/rotates together)

## Troubleshooting

### Title Not Appearing

1. Check that `enableTitle` is true
2. Verify `titleLine1` or `titleLine2` has non-empty text
3. Check browser console for rendering errors
4. Ensure visualization has been properly initialized

### Text Overflow

- Text does not automatically wrap; very long text may extend beyond border
- Solution: Use shorter text or increase border width
- Lines are positioned with fixed spacing regardless of text length

### Font Not Rendering

- Check [FONT_HOSTING_GUIDE.md](FONT_HOSTING_GUIDE.md)
- System fonts require proper fallback chains
- Browser console will log font family used

### Position Off-Screen

- Verify `titlePosition` value is valid
- Check visualization dimensions
- Ensure sufficient padding is set (20px default)

## Future Enhancements

Potential improvements for future versions:

- Text wrapping support
- Multi-line text with automatic sizing
- Text shadow/glow effects
- Custom border patterns
- Animation/fade-in effects
- Text rotation/transformation
- Alignment options (left/center/right)
- Letter spacing controls
- Text shadow with color picker
