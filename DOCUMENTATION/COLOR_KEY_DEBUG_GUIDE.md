# Color Key Implementation Guide

## Latest Update: Foreground Layer

The color key is now rendered in a **dedicated foreground UI layer** that stays in place during pan/zoom/rotate operations. This means:

- ✅ Color key does NOT move with the visualization content
- ✅ Color key stays in the same screen position during pan/zoom/rotate
- ✅ Color key is rendered on top of all other elements
- ✅ Key is positioned using screen coordinates (0-width, 0-height)

## How to Test

1. **Check "Include Color Key"** in the Style Toolbar
2. **Click "Apply Colorization"** button
3. **Watch the bottom-left corner** of the visualization
4. **Pan/Zoom/Rotate** the visualization - the key should STAY IN PLACE
5. **Open DevTools Console** (F12) to see detailed logging

## Expected Behavior

The color key should now be visible as a semi-transparent white box with:

- A dark title "Color Key"
- Colored shape indicators with labels
- Positioned in the bottom-left by default
- Stays in place while visualization moves around it

## Testing Checklist

- [ ] Color key appears in bottom-left after clicking "Apply Colorization"
- [ ] Key doesn't disappear when panning the visualization
- [ ] Key doesn't disappear when zooming in/out
- [ ] Key doesn't disappear when rotating
- [ ] Changing "Key Position" moves the key to new corner
- [ ] Changing "Key Font Size" updates text size
- [ ] Changing "Key Color Size" updates shape size
- [ ] Changing "Key Color Shape" updates indicator shapes
- [ ] Unchecking "Include Color Key" removes the key

## Architecture

**Layer Structure:**

```
SVG (root)
├── this.g (transformed by pan/zoom/rotate)
│   ├── tree-links-layer
│   ├── tree-nodes-layer
│   ├── tree-labels-layer
│   └── drawing-layer
└── this.foregroundLayer (NOT transformed - UI stays in place)
    └── color-key-group (when visible)
```

The foreground layer is added directly to `this.svg` AFTER `this.g`, ensuring:

1. It renders on top (SVG rendering order)
2. It doesn't receive pan/zoom/rotate transforms
3. Coordinates are in screen space (0 to width/height)

## Console Messages

When the color key is rendered, you'll see:

```
🔑 Include Color Key changed to: true
🔑 Rendering color key with options: {...}
✅ Created color key group in foreground layer
📍 Key position calculated: {position: "bottom-left", coordinates: {x: 20, y: 510}, ...}
✅ Color key rendered successfully at {x: 20, y: 510}
```

## Previous Implementation Guide

I've added comprehensive logging to help debug why the color key is not visible. The logging will help us identify where in the rendering pipeline things are breaking down.

## How to Test

1. **Open Browser DevTools Console** (F12 in most browsers)
2. **Check "Include Color Key"** in the Style Toolbar
3. **Apply Colorization** by clicking "Apply Colorization" button
4. **Watch the console** for debug messages with emojis:
   - 🔑 Include Color Key changed
   - 📊 applyColorizationToVisualization called
   - ✅ Created color key group
   - 📍 Key position calculated
   - ✅ Color key rendered successfully

## Expected Console Output (in order)

```
🔑 Include Color Key changed to: true
📊 applyColorizationToVisualization called
SVG Ref: [SVGSVGElement]
D3 SVG: [D3 Selection]
SVG Element: [SVGSVGElement]
Colorization Result: {nodeData: Array(100), key: Array(10)}
Node data count: 100
...
✅ Created color key group
📍 Key position calculated: {
  position: "bottom-left",
  coordinates: {x: 20, y: 510},
  svgDimensions: {width: 800, height: 600}
}
✅ Color key rendered successfully at {x: 20, y: 510}
```

## Debugging Checklist

- [ ] **Check console for errors** - Are there any red error messages?
- [ ] **Verify "Include Color Key" logs** - Is the handler being called?
- [ ] **Check SVG Reference** - Does SVG Ref show a valid element?
- [ ] **Check Key Data** - Does colorizationResult.key have entries?
- [ ] **Check Position Calculation** - Are coordinates within SVG bounds? (0-800 x, 0-600 y)
- [ ] **Check Key Rendering** - Does "Color key rendered successfully" appear?

## Possible Issues and Solutions

### Issue 1: Key doesn't appear after clicking Include Color Key

**Cause:** colorizationResult is not set yet
**Solution:** You must click "Apply Colorization" button first

### Issue 2: Key appears but is not visible

**Cause:** May be hidden behind other elements or off-screen
**Check in DevTools:**

- Inspect the SVG and look for a `<g class="color-key-group">` element
- Check if it has child elements (rect, text, shapes)
- Check the `x` and `y` attributes - are they within bounds?

### Issue 3: Key position is outside visible area

**Cause:** SVG dimensions (this.width/this.height) are incorrect
**Check in DevTools:**

- Look at "svgDimensions" in the logged position
- Compare to actual SVG size in the browser
- The key position should have at least 20px padding from edges

### Issue 4: Key appears with wrong size/styling

**Cause:** keyFontSize or keyColorSize values are not being applied
**Check:**

- Look at the Shape styling in DevTools
- Verify font-size attribute on text elements
- Width/height of shape elements (circles, squares, etc)

## Color Key Properties

All these properties control the key appearance and are wired to re-render automatically:

- **includeColorKey** - Toggle visibility (checkbox)
- **keyPosition** - Where to place key: top-left, top-right, bottom-left, bottom-right
- **keyFont** - Font family (Arial, Helvetica, Courier, etc)
- **keyFontSize** - Text size (8-24px slider)
- **keyColorShape** - Shape indicator type: circle, square, rectangle, triangle, hexagon
- **keyColorUniformity** - Color mode: solid, gradient (currently used in rendering logic)
- **keyColorSize** - Size of color shapes (10-40px slider)

## Files Modified

- `visualization-tester.ts` - Added logging and debugging statements
- No HTML/styling changes in this debug phase

## Next Steps

1. **Run the app** and perform the steps above
2. **Check console output** for any missing logs or errors
3. **Share console output** to help identify the issue
4. **Inspect SVG in DevTools** to see if color-key-group exists
5. **Adjust SVG dimensions** if key is appearing off-screen

---

**Note:** All logging statements start with emojis for easy scanning. Remove them once debugging is complete.
