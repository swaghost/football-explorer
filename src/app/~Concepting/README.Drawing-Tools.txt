-62% on the year, 
1. Create a new "drawing tools" toolbar with a pencil for an icon. This toolbar should inherit from the toolbar base component, adhere to light mode and dark mode, have toolbar help and headers and footers, and be the same width and height as selection tools toolbar.

2. Make sure it's added to the top toolbar next to the selection toolbar.

3. Move the pencil/drawing and eraser functionality down to a new section of the selection tools toolbar. Put some space between those two buttons and the others.


1. Add to the 'drawing' part of the selection tools toolbar the ability to draw a rectangular shape by click and dragging. A modifier should allow you to change the thickness and outline color of the rectangular shape. A checkbox should make it constrained (so that always draws a perfect square). it doesn't select anything, it just draws an erasable rectangular outline shape.

2. Add to the 'drawing' part of the selection tools toolbar  the ability to draw a circular shape by clicking and dragging. A modifier should allow you to change the thickness and outline color of the circular shape.A checkbox should make it constrained (so that always draws a perfect circle). It doesn't select anything, it just draws an erasable circular outline shape.

3. Add to the 'drawing' part of the selection tools toolbar the ability to draw an error by clicking and dragging. A modifier should allow you change the size and outline and fill color of the arrow. I should be able to drag an error from one spot to another and have the arrow draw between the start and end drag points.

4. Add to the 'drawing' part of the selection tools toolbar the ability to type text on the main diagram like you can draw on it.  A modifier should allow you change the font size, color of the text, whether it's bold, strikethrough, or italicized, and choose the font family. 


Add to the selection tools toolbar a "Zoom" which allows you to click and zoom on an area of the screen without changing the position of the 
You should also be able to drag and zoom on the screen and then center and zoom.
Clicking shift while doing so should zoom out.

use the custom compact RGB trio (three number inputs for R/G/B) instead of a hex textbox for text boxes.

I wired up event emitters (e.g., onUpdateArrowFillColor) — implement the drawing on the canvas in the parent/viewer where these outputs are handled. 

Implement simple drawing handlers that listen to these events and draw directly on the viewer/canvas

Use RGB numeric inputs instead of hex textboxes.
Implement the actual drawing handlers (rect/circle/arrow/text) in the viewer (I can search for the canvas/renderer code and add a minimal handler).
Reduce the size/visual style of the color picker components for tighter layout.

1. Use RGB numeric inputs instead of hex textboxes for color input.
2. Implement the actual drawing handlers (rect/circle/arrow/text) in the viewer (I can search for 3. the canvas/renderer code and add a minimal handler).
4. Reduce the size/visual style of the color picker components for tighter layout.
5. Add a "screenshot" button that takes a picture of the current screen and downloads it. Modifier would be "PNG" or "JPEG" with the default being PNG.
5. Separate all the drawing tools and modifiers from the selection tools and modifiers into it's own new "toolbar-annotation" component.

please make this component inherit from BaseToolbarComponent without altering it's own unique functionality or it's current css. Please make sure the toolbar common css is imported and that for headers and footers the toolbar's individual style is not overriding the common style. If it's a standalone component alter it to make it share the common toolbar base without altering it's functionality.  Make sure the headers and footers are clipped to appear like the other toolbars and that it adheres to light mode and dark mode functionality.  Please make sure when are converting the toolbar to the shared component we are using the latest footer structure and css that creates a clipped gradient fill that fills the footer and headers to match the current standard. Make sure it has toolbar help.