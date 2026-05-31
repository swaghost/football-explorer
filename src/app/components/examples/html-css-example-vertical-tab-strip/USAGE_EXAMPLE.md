# Vertical Tab Strip Component - Usage Example

## Overview

The `HtmlCssExampleVerticalTabStrip` component is a draggable, extensible vertical tab strip that extends the `BaseToolbarComponent`. It provides a professional UI for organizing content into tabs with support for custom templates, icons, and both vertical and horizontal text orientation.

## Key Features

- ✅ **Extends BaseToolbarComponent** - Inherits drag, lock, expand, help overlay functionality
- ✅ **Vertical Tab Strip** - Tabs stick out from the side of the content panel
- ✅ **Text Rotation** - Support for both vertical (-90°) and horizontal (0°) text
- ✅ **Icons & Labels** - Optional emoji/icon support alongside tab text
- ✅ **Generic Templates** - Supply custom component templates for each tab's content
- ✅ **At Least 4 Tabs** - Easily extensible to any number of tabs
- ✅ **Responsive Design** - Adapts to different screen sizes
- ✅ **Dark Mode Support** - Full dark mode theme support
- ✅ **Accessible** - Proper ARIA attributes and keyboard support

## Basic Usage

### Simple Example with Default Content

```typescript
import { Component } from "@angular/core";
import { HtmlCssExampleVerticalTabStrip } from "./html-css-example-vertical-tab-strip";

@Component({
  selector: "app-demo",
  template: ` <app-html-css-example-vertical-tab-strip [visible]="true" [position]="{ x: 100, y: 100 }" [isDarkMode]="isDarkMode"> </app-html-css-example-vertical-tab-strip> `,
  standalone: true,
  imports: [HtmlCssExampleVerticalTabStrip],
})
export class DemoComponent {
  isDarkMode = false;
}
```

The component comes with 4 default tabs:

- Tab 1 (📋)
- Tab 2 (⚙️)
- Tab 3 (🎨)
- Tab 4 (📊)

### Custom Tabs Configuration

```typescript
import { Component } from "@angular/core";
import { TabConfig } from "./html-css-example-vertical-tab-strip";

@Component({
  selector: "app-custom-tabs-demo",
  template: ` <app-html-css-example-vertical-tab-strip [visible]="true" [tabs]="customTabs" [selectedTabId]="selectedTab" (selectedTabChange)="onTabChange($event)"> </app-html-css-example-vertical-tab-strip> `,
  standalone: true,
  imports: [HtmlCssExampleVerticalTabStrip],
})
export class CustomTabsDemoComponent {
  selectedTab = "settings";

  customTabs: TabConfig[] = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "help", label: "Help", icon: "❓" },
    { id: "about", label: "About", icon: "ℹ️" },
    { id: "extras", label: "Extras", icon: "🎁" }, // Can have more than 4
  ];

  onTabChange(tabId: string): void {
    this.selectedTab = tabId;
    console.log("Selected tab:", tabId);
  }
}
```

## Advanced Usage with Custom Templates

### Using ng-template for Custom Tab Content

```typescript
import { Component, TemplateRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HtmlCssExampleVerticalTabStrip, TabConfig } from "./html-css-example-vertical-tab-strip";

@Component({
  selector: "app-advanced-tabs-demo",
  template: `
    <app-html-css-example-vertical-tab-strip [visible]="true" [tabs]="tabs" [selectedTabId]="selectedTab" [textOrientation]="textOrientation" [stripPosition]="stripPosition" (selectedTabChange)="onTabChange($event)" (textOrientationChange)="onOrientationChange($event)"> </app-html-css-example-vertical-tab-strip>

    <!-- Define template for Settings tab -->
    <ng-template #settingsContent>
      <div class="settings-panel">
        <h2>Settings</h2>
        <label>
          <input type="checkbox" [(ngModel)]="isDarkMode" />
          Dark Mode
        </label>
        <label>
          <input type="checkbox" [(ngModel)]="enableNotifications" />
          Enable Notifications
        </label>
      </div>
    </ng-template>

    <!-- Define template for Data tab -->
    <ng-template #dataContent>
      <div class="data-panel">
        <h2>Data Management</h2>
        <button (click)="exportData()">📥 Export Data</button>
        <button (click)="importData()">📤 Import Data</button>
        <button (click)="clearData()">🗑️ Clear Data</button>
      </div>
    </ng-template>

    <!-- Define template for Chart tab -->
    <ng-template #chartContent>
      <div class="chart-panel">
        <h2>Analytics</h2>
        <p>Chart visualization would go here</p>
        <div class="placeholder-chart"></div>
      </div>
    </ng-template>
  `,
  standalone: true,
  imports: [CommonModule, HtmlCssExampleVerticalTabStrip],
  styles: [
    `
      .settings-panel,
      .data-panel,
      .chart-panel {
        padding: 20px;
      }
      label {
        display: block;
        margin: 10px 0;
      }
      button {
        margin: 5px 0;
        padding: 8px 16px;
      }
      .placeholder-chart {
        width: 100%;
        height: 200px;
        background: #f0f0f0;
        border-radius: 4px;
        margin-top: 20px;
      }
    `,
  ],
})
export class AdvancedTabsDemoComponent {
  @ViewChild("settingsContent") settingsContent?: TemplateRef<any>;
  @ViewChild("dataContent") dataContent?: TemplateRef<any>;
  @ViewChild("chartContent") chartContent?: TemplateRef<any>;

  selectedTab = "settings";
  textOrientation: "vertical" | "horizontal" = "vertical";
  stripPosition: "left" | "right" = "left";
  isDarkMode = false;
  enableNotifications = true;

  tabs: TabConfig[] = [];

  ngAfterViewInit(): void {
    // Assign templates to tabs after view initialization
    this.tabs = [
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        content: this.settingsContent,
      },
      {
        id: "data",
        label: "Data",
        icon: "📊",
        content: this.dataContent,
      },
      {
        id: "chart",
        label: "Analytics",
        icon: "📈",
        content: this.chartContent,
      },
      {
        id: "help",
        label: "Help",
        icon: "❓",
        // No content - will show default content
      },
    ];
  }

  onTabChange(tabId: string): void {
    this.selectedTab = tabId;
  }

  onOrientationChange(orientation: "vertical" | "horizontal"): void {
    this.textOrientation = orientation;
  }

  exportData(): void {
    /* ... */
  }
  importData(): void {
    /* ... */
  }
  clearData(): void {
    /* ... */
  }
}
```

## Component Templates as Separate Components

For more complex content, create separate components and use them as templates:

```typescript
// settings-tab.component.ts
@Component({
  selector: "app-settings-tab",
  template: `<div class="settings">...</div>`,
  standalone: true,
})
export class SettingsTabComponent {
  @Output() settingChanged = new EventEmitter<any>();
}

// main.component.ts
@Component({
  template: `
    <ng-template #settingsTemplate>
      <app-settings-tab (settingChanged)="onSettingChange($event)"></app-settings-tab>
    </ng-template>

    <app-html-css-example-vertical-tab-strip [tabs]="tabs"></app-html-css-example-vertical-tab-strip>
  `,
  imports: [SettingsTabComponent, HtmlCssExampleVerticalTabStrip],
})
export class MainComponent {
  @ViewChild("settingsTemplate") settingsTemplate?: TemplateRef<any>;

  tabs: TabConfig[] = [{ id: "settings", label: "Settings", icon: "⚙️", content: this.settingsTemplate }];
}
```

## API Reference

### Inputs

| Input             | Type                         | Default          | Description                                    |
| ----------------- | ---------------------------- | ---------------- | ---------------------------------------------- |
| `tabs`            | `TabConfig[]`                | 4 default tabs   | Array of tab configurations                    |
| `selectedTabId`   | `string`                     | `'tab1'`         | ID of currently selected tab                   |
| `textOrientation` | `'vertical' \| 'horizontal'` | `'vertical'`     | Text rotation: -90° or 0°                      |
| `tabWidth`        | `number`                     | `40`             | Width of tab strip in pixels                   |
| `stripPosition`   | `'left' \| 'right'`          | `'left'`         | Position of tab strip                          |
| `visible`         | `boolean`                    | `false`          | Toolbar visibility (from BaseToolbarComponent) |
| `isDarkMode`      | `boolean`                    | `false`          | Dark mode theme                                |
| `position`        | `ToolbarPosition`            | `{ x: 0, y: 0 }` | Toolbar position                               |
| `locked`          | `boolean`                    | `false`          | Lock toolbar from dragging                     |
| `expanded`        | `boolean`                    | `true`           | Show/hide content panel                        |

### Outputs

| Output                  | Type                                       | Description                                              |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------- |
| `selectedTabChange`     | `EventEmitter<string>`                     | Emits when tab is selected                               |
| `textOrientationChange` | `EventEmitter<'vertical' \| 'horizontal'>` | Emits when text orientation changes                      |
| `close`                 | `EventEmitter<void>`                       | Emits when toolbar is closed (from BaseToolbarComponent) |
| `toggleLock`            | `EventEmitter<void>`                       | Emits when lock is toggled                               |
| `dragStart`             | `EventEmitter<MouseEvent>`                 | Emits when drag starts                                   |

### Methods

| Method                  | Parameters      | Return                   | Description                             |
| ----------------------- | --------------- | ------------------------ | --------------------------------------- |
| `selectTab`             | `tabId: string` | `void`                   | Select a tab programmatically           |
| `getSelectedTab`        |                 | `TabConfig \| undefined` | Get current tab configuration           |
| `toggleTextOrientation` |                 | `void`                   | Toggle between vertical/horizontal text |
| `getTextRotation`       |                 | `string`                 | Get CSS transform value                 |

### TabConfig Interface

```typescript
interface TabConfig {
  id: string; // Unique identifier
  label: string; // Display label
  icon?: string; // Emoji or icon character
  content?: TemplateRef<any>; // Custom template for content
  disabled?: boolean; // Disable the tab
}
```

## Styling

The component uses CSS variables for easy theming:

```scss
// Default theme
--tab-bg: #f0f0f0;
--tab-hover-bg: #e0e0e0;
--tab-active-bg: #0066cc;
--tab-text: #333;
--tab-active-text: #fff;
--tab-border: #ccc;
--content-bg: #fff;
--content-text: #333;
```

Override these in your global styles or component styles:

```scss
app-html-css-example-vertical-tab-strip {
  --tab-active-bg: #ff6b00;
  --tab-width: 50px;
}
```

## Keyboard Navigation

- **Tab/Shift+Tab** - Navigate between tabs
- **Enter/Space** - Select focused tab
- **Arrow Keys** - Navigate tabs when strip is focused

## Accessibility

- Full keyboard navigation support
- ARIA labels on all interactive elements
- Proper focus management
- Color contrast meets WCAG standards
- Semantic HTML structure

## Examples of Custom Tab Configurations

### Configuration 1: More than 4 tabs

```typescript
const tabs: TabConfig[] = [
  { id: "tab1", label: "Overview", icon: "👁️" },
  { id: "tab2", label: "Settings", icon: "⚙️" },
  { id: "tab3", label: "Data", icon: "💾" },
  { id: "tab4", label: "Analytics", icon: "📊" },
  { id: "tab5", label: "Reports", icon: "📄" },
  { id: "tab6", label: "Help", icon: "❓" },
];
```

### Configuration 2: Some disabled tabs

```typescript
const tabs: TabConfig[] = [
  { id: "tab1", label: "Active", icon: "✅" },
  { id: "tab2", label: "Disabled", icon: "🔒", disabled: true },
  { id: "tab3", label: "Active", icon: "✅" },
  { id: "tab4", label: "Disabled", icon: "🔒", disabled: true },
];
```

### Configuration 3: Tabs without icons

```typescript
const tabs: TabConfig[] = [
  { id: "tab1", label: "Documentation" },
  { id: "tab2", label: "API Reference" },
  { id: "tab3", label: "Examples" },
  { id: "tab4", label: "Support" },
];
```

## Complete Integration Example

See the component itself for a complete, working example that demonstrates:

- How to extend BaseToolbarComponent
- How to implement draggable toolbars
- How to support dark mode
- How to use generic templates
- How to manage toolbar state
