I need a new toolbar, this one will deal with creating "overlays" which are additional graphical elements to be added to the main graphic when I want to print send it to a printer or capture a screenshot.

There should be overlay state which is saved in NGXS state. Create overlay-state models, Overlay state consists of a list of "overlays sets". An overlay set is name (string) and a list of items of type "overlay". When an "overlay" is created it consists of a single "OverlayElement" (string), and a OverlayLocation (string). More than one overlay can be added to the overlay set to be rendered on the main graphic in it's own layer.

The overlay are such things as the following items, I will define how those are rendedered later.

- Title (dataset default)
- Title (entered)
- Keys (using colorization selections)
- Tenant Badge (current tenant's graphic)
- Team Badge (currently selected team's graphic, or tenant's graphic if none exists)
- Club Badge (Selected)
- Club Badge (Uploaded)

- Club Information (Selected)
- Club Information (Entered)
- Club Information (Uploaded)

- Club Stadium Information (Selected)
- Club Stadium Information (Entered)
- Club Stadium Information (Uploaded)

Locations is one of 9 spots 
- top left
- top center
- top right
- middle left
- dead center
- middle right
- bottom left
- bottom center
- bottom right
 

1. Create a new toolbar called "overlays".
2. This toolbar should work like all the other toolbar, and align with the right side toolbars toggles in the top toolbar.
3. It should adhere to light mode and dark mode.
4. There should be a list of current "Overlay Sets" (from State, I will replace this with an API later)
5. There should be a button allows me to create a new overlay set (presenting a dialog to enter a name)
6. Once created, selecting that overlay set should allow me to "create new overlay" (selecting the type and location)
7. Allow me to create a new overlay element by choosing an overlay element and overlay location and add it to a queue of overlay elements.
8. I should be able to edit and remove the overlay elements as well. Editing should remove the overlay items.
9. There should be an "clear overlay" button (create as empty placeholder)
10. There should be an "apply overlay" button (create as empty placeholder). We're not going to focus on adding to the graphic at the moment.
11. There should be toolbar help like all the other toolbars.