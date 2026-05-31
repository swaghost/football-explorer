# Dark Mode & List Item Styling Verification Steps

## Overview

This document provides step-by-step instructions to verify that:

1. Dark mode selection is persisted across page reloads
2. All list items have consistent styling in both light and dark modes
3. Selected nodes and list items have proper highlighting

## Changes Made

### 1. Theme Persistence ✅

- Dark mode preference is now saved to `localStorage` under key `app-theme-dark-mode`
- Theme loads automatically on page reload
- Theme changes are dispatched to NGXS state for consistency

### 2. Node Color Consistency ✅

- Default nodes now use dark-mode-aware colors
- Light mode: Dark text (`#1a1a1a`) on light backgrounds
- Dark mode: Light text (`#e5e7eb`) on dark backgrounds (`#404040`)

### 3. Common List Item Styles ✅

- Added standardized CSS classes in `_toolbar-base.scss`:
  - `.common-list-item` - Base list item style
  - `.common-list-item-title` - Title/name styling
  - `.common-list-item-subtitle` - Subtitle/description styling
- Colors match team groups toolbar (`#404040` background in dark mode)

## Verification Steps

### Part 1: Theme Persistence Test

1. **Start the application**

   ```powershell
   npm run start
   ```

2. **Open browser DevTools Console** (F12)

   - Look for console logs about theme loading

3. **Test Light Mode Default**

   - First launch should be in light mode (unless you've changed it before)
   - Check console: Should see `isDarkMode$ subscription received: false`

4. **Toggle to Dark Mode**

   - Click the theme toggle button (🌙/☀️ icon in top toolbar)
   - Check console logs:
     ```
     toggleTheme called, current isDarkMode: false
     Theme toggle dispatched to NGXS
     isDarkMode$ subscription received: true
     ```
   - **Verify**: Page background should become dark, UI should switch to dark theme

5. **Verify localStorage**

   - Open DevTools > Application tab > Local Storage
   - Find key: `app-theme-dark-mode`
   - Value should be: `"true"`

6. **Reload the page** (F5 or Ctrl+R)

   - **Expected**: Page should load in DARK mode (theme persisted!)
   - Check console on load: Should see `isDarkMode$ subscription received: true`

7. **Toggle back to Light Mode**

   - Click theme toggle again
   - **Verify**: Page switches to light mode
   - Check localStorage: `app-theme-dark-mode` should now be `"false"`

8. **Reload again**
   - **Expected**: Page should load in LIGHT mode

**✅ PASS CRITERIA**: Theme persists across reloads correctly

---

### Part 2: List Item Color Consistency Test

#### A. Bookmarks Toolbar

1. Open Bookmarks toolbar
2. Add some bookmarks if none exist (right-click nodes → bookmark)
3. **In LIGHT mode**, verify:
   - List items have white background (`#ffffff`)
   - Text is dark and readable
   - Hover changes background slightly lighter
   - Selected bookmark has blue highlight
4. **Switch to DARK mode**, verify:
   - List items have dark gray background (`#404040`)
   - Text is light gray/white and readable
   - Hover changes to `#4a4a4a`
   - Selected bookmark has dark blue highlight (`#1a365d`)

#### B. My Toolbox (Favorites) Toolbar

1. Open My Toolbox toolbar
2. Add some favorites if none exist
3. **In LIGHT mode**, verify same as bookmarks
4. **In DARK mode**, verify:
   - Favorite items have `#404040` background
   - Text is light and readable
   - Matches bookmarks styling

#### C. Lessons Toolbar

1. Open Lessons toolbar
2. View lesson list
3. **In LIGHT mode**, verify:
   - Lesson items have white background
   - Text is dark and readable
4. **In DARK mode**, verify:
   - Lesson items have `#404040` background
   - Matches bookmarks and favorites styling

#### D. Teams Toolbar

1. Open Teams toolbar
2. View team groups list
3. **In DARK mode**, verify:
   - Team group items have dark gray background
   - All list items look consistent with other toolbars

**✅ PASS CRITERIA**: All list items in all toolbars have:

- Consistent `#404040` background in dark mode
- Consistent light text color in dark mode
- Same hover and selection states

---

### Part 3: Node Visualization Test

1. **Load a decision tree** (any dataset)

2. **In LIGHT mode**, verify:

   - Unselected nodes are visible with appropriate contrast
   - Node labels use dark text (`#1a1a1a`)
   - Tree is readable

3. **Switch to DARK mode**, verify:

   - Background becomes dark
   - Unselected nodes use light text (`#e5e7eb`)
   - Node circles use dark gray fill (`#404040`)
   - Tree remains readable with good contrast

4. **Test node selection**:
   - Click a node to select it
   - **In both modes**: Selected node should have distinct orange highlight
   - Multi-select nodes (Shift+click)
   - **In both modes**: Multi-selected nodes should have blue highlight

**✅ PASS CRITERIA**: Nodes are readable in both modes with proper contrast

---

### Part 4: Console Log Verification

Throughout testing, watch for these console logs:

**On page load:**

```
isDarkMode$ subscription received: [true/false]
```

**On theme toggle:**

```
toggleTheme called, current isDarkMode: [current value]
Theme toggle dispatched to NGXS
isDarkMode$ subscription received: [new value]
updateTheme called with isDarkMode: [new value]
```

**✅ PASS CRITERIA**: Console logs show proper state flow

---

## Common Issues & Solutions

### Issue: Theme doesn't persist

- **Check**: localStorage in DevTools
- **Solution**: Clear browser cache and try again

### Issue: List items still white in dark mode

- **Check**: Toolbar has `dark-mode` class applied
- **Solution**: Verify toolbar HTML has `[class.dark-mode]="isDarkMode"` binding

### Issue: Console shows errors

- **Solution**: Share the errors so we can debug

---

## Report Template

Please test each section and report back using this format:

```
PART 1 - Theme Persistence: ✅ PASS / ❌ FAIL
- Notes: [any observations]

PART 2 - List Items:
- Bookmarks: ✅ PASS / ❌ FAIL
- My Toolbox: ✅ PASS / ❌ FAIL
- Lessons: ✅ PASS / ❌ FAIL
- Teams: ✅ PASS / ❌ FAIL
- Notes: [any observations]

PART 3 - Node Visualization: ✅ PASS / ❌ FAIL
- Notes: [any observations]

PART 4 - Console Logs: ✅ PASS / ❌ FAIL
- Notes: [any unusual logs]

OVERALL: ✅ ALL TESTS PASS / ⚠️ SOME ISSUES / ❌ MAJOR ISSUES
```

---

## Next Steps

After you've completed testing:

1. If all tests pass ✅ - We're done! The changes are working correctly.
2. If some tests fail ⚠️ - Share which specific tests failed and what you observed.
3. If major issues ❌ - Share error messages and screenshots if possible.

I'll be ready to debug and fix any issues you find!
