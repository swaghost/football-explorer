# Vertical Tab Strip Component - Quick Reference

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { Component } from "@angular/core";
import { HtmlCssExampleVerticalTabStrip } from "./path/to/component";

@Component({
  template: ` <app-html-css-example-vertical-tab-strip [visible]="true" [position]="{ x: 100, y: 100 }"> </app-html-css-example-vertical-tab-strip> `,
  imports: [HtmlCssExampleVerticalTabStrip],
})
export class MyComponent {}
```

### 2. With Custom Tabs

```typescript
import { TabConfig } from "./path/to/component";

export class MyComponent {
  tabs: TabConfig[] = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "help", label: "Help", icon: "❓" },
  ];
}
```

### 3. With Custom Templates

```typescript
@ViewChild('customContent') customContent?: TemplateRef<any>;

tabs: TabConfig[] = [
  { id: 'tab1', label: 'Custom', icon: '🎨', content: this.customContent }
];
```

---

## 📊 Default Configuration

**4 Built-in Tabs:**

- Tab 1 (📋) - Default
- Tab 2 (⚙️) - Settings-like
- Tab 3 (🎨) - Creative
- Tab 4 (📊) - Analytics

**Default Values:**

- Text Orientation: Vertical (-90°)
- Tab Width: 40px
- Strip Position: Left
- Selected Tab: 'tab1'

---

## 🎛️ Key Properties

### Text Orientation

```typescript
[textOrientation] = "'vertical'"[textOrientation] = "'horizontal'"; // -90° rotation (default) // 0° rotation
```

### Tab Strip Position

```typescript
[stripPosition] = "'left'"[stripPosition] = "'right'"; // Tabs on left (default) // Tabs on right
```

### Tab Width

```typescript
[tabWidth] = "40"[tabWidth] = "50"; // Default pixels // Wider tabs
```

### Toolbar Integration

```typescript
[visible] =
  "true"[locked] = // Show/hide toolbar
  "false"[expanded] = // Allow dragging
  "true"[isDarkMode] = // Show content
  "false"[position] = // Theme
    "{ x: 0, y: 0 }"; // Position
```

---

## 🎯 Key Methods

```typescript
// Select a tab
selectTab("tab-id");

// Get current tab
const current = getSelectedTab();

// Toggle text orientation
toggleTextOrientation(); // Switches vertical ↔ horizontal
```

---

## 📡 Key Events

```typescript
// Tab selection changed
selectedTabChange =
  "onTabChange($event)"(
    // Text orientation toggled
    textOrientationChange
  ) =
  "onOrientationChange($event)"(
    // Toolbar events (inherited)
    close
  ) =
  "onClose()"(toggleLock) =
  "onToggleLock()"(dragStart) =
    "onDragStart($event)";
```

---

## 🎨 Styling & Theming

### CSS Variables (Override in global styles)

```scss
app-html-css-example-vertical-tab-strip {
  --tab-width: 40px;
  --tab-bg: #f0f0f0;
  --tab-active-bg: #0066cc;
  --tab-text: #333;
  --tab-active-text: #fff;
  --content-bg: #fff;
}
```

### Dark Mode

```typescript
[isDarkMode] = "true"; // Automatically adjusts all colors
```

### Active Tab Color

```scss
// Override active tab color
--tab-active-bg: #ff6b00;
```

---

## 🎭 TabConfig Interface

```typescript
interface TabConfig {
  id: string; // Required: unique identifier
  label: string; // Required: display text
  icon?: string; // Optional: emoji (e.g., '⚙️')
  content?: TemplateRef<any>; // Optional: custom template
  disabled?: boolean; // Optional: disable tab
}
```

---

## 📋 Common Patterns

### Pattern 1: Simple Tabs (No Templates)

```typescript
tabs: TabConfig[] = [
  { id: 'a', label: 'Option A', icon: '🔵' },
  { id: 'b', label: 'Option B', icon: '🟢' },
  { id: 'c', label: 'Option C', icon: '🟡' },
];
```

### Pattern 2: Tabs with Templates

```typescript
@ViewChild('template1') t1?: TemplateRef<any>;
@ViewChild('template2') t2?: TemplateRef<any>;

tabs: TabConfig[] = [
  { id: 'a', label: 'Custom', icon: '🎨', content: this.t1 },
  { id: 'b', label: 'Data', icon: '📊', content: this.t2 },
];
```

### Pattern 3: Mixed Tabs (Some with templates, some without)

```typescript
tabs: TabConfig[] = [
  { id: 'custom', label: 'Custom', icon: '🎨', content: this.customTemplate },
  { id: 'default', label: 'Default', icon: '📋' },  // Uses default content
];
```

### Pattern 4: Dynamic Tabs

```typescript
addTab(newTab: TabConfig): void {
  this.tabs = [...this.tabs, newTab];
}

removeTab(tabId: string): void {
  this.tabs = this.tabs.filter(t => t.id !== tabId);
}
```

### Pattern 5: Tab Selection Handling

```typescript
selectedTab = 'default-id';

onTabChange(tabId: string): void {
  this.selectedTab = tabId;
  this.loadTabContent(tabId);  // Load data for tab
  console.log('Tab switched to:', tabId);
}
```

---

## 🔍 State Management

### Get Current Tab

```typescript
const current = this.tabComponent.getSelectedTab();
if (current) {
  console.log(current.id, current.label, current.icon);
}
```

### Programmatic Tab Selection

```typescript
this.tabComponent.selectTab("specific-tab-id");
```

### Check If Tab is Selected

```typescript
const isSelected = this.selectedTabId === "tab-id";
```

---

## ♿ Accessibility

### Keyboard Navigation

- **Tab/Shift+Tab** - Move between tabs
- **Enter/Space** - Activate tab
- **Arrow Up/Down** - Navigate tabs (when focused)

### Best Practices

- Always provide meaningful labels
- Use icons that are self-explanatory
- Consider colorblind users (use icons, not just colors)
- Ensure sufficient contrast in dark mode

---

## 📱 Responsive Behavior

The component automatically adjusts:

- Mobile: Tab width becomes 36px (from 40px)
- Small screens: Text sizing reduces
- Touch devices: Larger tap targets

```scss
// Customize responsive behavior
@media (max-width: 768px) {
  --tab-width: 36px;
  // Add your overrides
}
```

---

## 🐛 Troubleshooting

### Tab not switching

```typescript
// Make sure tab ID exists
selectTab("tab-id"); // 'tab-id' must exist in tabs array

// Check selectedTabId property
console.log(this.selectedTabId);
```

### Text not rotating

```typescript
// Check textOrientation
console.log(this.textOrientation); // Should be 'vertical' or 'horizontal'

// Toggle to verify
this.toggleTextOrientation();
```

### Styling not applying

```scss
// Make sure overrides are in the right scope
app-html-css-example-vertical-tab-strip {
  --tab-active-bg: #ff6b00; // Target the component
}
```

### Toolbar not dragging

```typescript
// Check locked property
[locked] = // Check visible property
"false"[visible] = "true"; // Must be false to allow dragging // Must be true to show toolbar
```

---

## 📚 Full Documentation

See `USAGE_EXAMPLE.md` for comprehensive documentation including:

- Advanced template patterns
- Multiple configuration examples
- Complete API reference
- Integration examples
- Dark mode details
- Styling guide

---

## ✅ Verification Checklist

When using the component, verify:

- ✅ Component is imported
- ✅ Tabs array is defined
- ✅ Tab IDs are unique
- ✅ Templates are properly bound
- ✅ Event handlers are defined
- ✅ Styling (if custom) is applied
- ✅ No console errors

---

## 🔗 Component Files

- **TypeScript:** `html-css-example-vertical-tab-strip.ts`
- **Template:** `html-css-example-vertical-tab-strip.html`
- **Styles:** `html-css-example-vertical-tab-strip.scss`
- **Usage Guide:** `USAGE_EXAMPLE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Quick Reference:** `QUICK_REFERENCE.md` (this file)

---

**Last Updated:** December 28, 2025
**Status:** Production Ready ✅
