# Vertical Tab Strip Component - Visual Architecture

## 🏗️ Component Layout

### Visual Structure

```
┌─────────────────────────────────────────────────┐
│          TOOLBAR HEADER (BaseToolbarComponent)   │
├─────────────────────────────────────────────────┤
│  📑 Vertical Tabs  [?] [↕️] [🔽] [✖] [🔒] [⋮⋮]  │
├─────────┬───────────────────────────────────────┤
│         │                                       │
│ ┌─────┐ │   TAB CONTENT AREA                    │
│ │ TAB │ │  ┌─────────────────────────────────┐  │
│ │ 1   │ │  │ Content for Tab 1               │  │
│ │ 📋  │ │  │ (Default or Custom Template)   │  │
│ ├─────┤ │  │                                 │  │
│ │ TAB │ │  │ - Scrollable                    │  │
│ │ 2   │ │  │ - Flexible height               │  │
│ │ ⚙️  │ │  │ - Auto-hidden when collapsed   │  │
│ ├─────┤ │  │                                 │  │
│ │ TAB │ │  └─────────────────────────────────┘  │
│ │ 3   │ │                                       │
│ │ 🎨  │ │                                       │
│ ├─────┤ │                                       │
│ │ TAB │ │                                       │
│ │ 4   │ │                                       │
│ │ 📊  │ │                                       │
│ └─────┘ │                                       │
│ TAB     │                                       │
│ STRIP   │                                       │
│ (40px)  │                                       │
│         │                                       │
└─────────┴───────────────────────────────────────┘
```

## 📐 Responsive Breakpoints

### Desktop (> 768px)

```
┌──────────────────────┐
│      HEADER          │
├─┬────────────────────┤
│ │                    │
│T│ Content Area       │  Tab Width: 40px
│A│ (Tab 1 selected)   │
│B│                    │
│S│                    │
│ │                    │
└─┴────────────────────┘
```

### Mobile (≤ 768px)

```
┌──────────────────────┐
│      HEADER          │
├─┬────────────────────┤
│ │                    │
│T│ Content Area       │  Tab Width: 36px
│A│ (Optimized)        │  Text: 10px
│B│                    │
│S│                    │
│ │                    │
└─┴────────────────────┘
```

## 🎨 Tab States

### Normal Tab

```
┌─────┐
│ 📋  │  Background: --tab-bg (#f0f0f0)
│ Tab │  Color: --tab-text (#333)
│ 1   │  Border: --tab-border (#ccc)
└─────┘
```

### Hover State

```
┌─────┐
│ 📋  │  Background: --tab-hover-bg (#e0e0e0)
│ Tab │  Enhanced shadow
│ 1   │  Cursor changes to pointer
└─────┘
```

### Active Tab

```
┌─────┐
│ 📋  │  Background: --tab-active-bg (#0066cc)
│ Tab │  Color: --tab-active-text (#fff)
│ 1   │  Font: Bold, larger shadow
└─────┘
```

### Disabled Tab

```
┌─────┐
│ 🔒  │  Opacity: 50%
│ Tab │  Cursor: not-allowed
│ 3   │  Background: #f5f5f5
└─────┘
```

## 🔄 Text Rotation States

### Vertical (Default)

```
T
a     Reading order: Rotate -90°
b     Transform: rotate(-90deg)
1
```

### Horizontal

```
Tab 1     Reading order: Left to right
          Transform: rotate(0deg)
```

## 📊 Component Inheritance Hierarchy

```
                  BaseToolbarComponent
                           △
                           │
                           │
        HtmlCssExampleVerticalTabStrip
                    │
        ┌───────────┼───────────┐
        │           │           │
   - Tab Logic   - Styling   - Events
   - Templates   - Animation
   - Icons       - Dark Mode
```

## 🎛️ Input/Output Flow

```
Parent Component
       │
       ├─── [visible] ────────────────┐
       ├─── [tabs] ───────────────────┤
       ├─── [selectedTabId] ──────────┤
       ├─── [textOrientation] ────────┤
       ├─── [isDarkMode] ─────────────┤
       │                              │
       │    HtmlCssExampleVerticalTabStrip
       │                              │
       ├─ (selectedTabChange) ─────────┤
       ├─ (textOrientationChange) ─────┤
       ├─ (close) ─────────────────────┤
       ├─ (toggleLock) ────────────────┤
       └─ (dragStart) ──────────────────┘
```

## 🎯 Tab Selection Flow

```
User clicks Tab
       │
       ▼
selectTab(tabId) method called
       │
       ▼
Verify tab exists & not disabled
       │
       ▼
Update selectedTabId property
       │
       ▼
Emit selectedTabChange event
       │
       ▼
Template updates with *ngIf
       │
       ▼
Display selected tab content
       │
       ▼
Animation: fadeIn (0.2s)
```

## 🔀 Text Orientation Toggle Flow

```
User clicks orientation button
       │
       ▼
toggleTextOrientation() method
       │
       ▼
Toggle: vertical ↔ horizontal
       │
       ▼
Update textOrientation property
       │
       ▼
Emit textOrientationChange event
       │
       ▼
getTextRotation() recalculates
       │
       ▼
Apply CSS transform to tabs
       │
       ▼
Visual update (instant)
```

## 🎨 Dark Mode Color Scheme

### Light Mode (isDarkMode: false)

```
Variable                Value
--tab-bg               #f0f0f0 (Light Gray)
--tab-hover-bg         #e0e0e0 (Darker Gray)
--tab-active-bg        #0066cc (Blue)
--tab-text             #333 (Dark)
--tab-active-text      #fff (White)
--content-bg           #fff (White)
--content-text         #333 (Dark)
```

### Dark Mode (isDarkMode: true)

```
Variable                Value
--tab-bg               #2a2a2a (Dark Gray)
--tab-hover-bg         #3a3a3a (Darker Gray)
--tab-active-bg        #0080ff (Bright Blue)
--tab-text             #e0e0e0 (Light)
--tab-active-text      #fff (White)
--content-bg           #1e1e1e (Very Dark)
--content-text         #e0e0e0 (Light)
```

## 📱 Responsive Layout Adaptation

### Wide Screen (>1200px)

```
└─ Tab Strip (40px) ─ Content (100% - 40px) ─┘
```

### Medium Screen (768px - 1200px)

```
└─ Tab Strip (40px) ─ Content (100% - 40px) ─┘
```

### Small Screen (< 768px)

```
└─ Tab Strip (36px) ─ Content (100% - 36px) ─┘
   Text: 10px         Font: Smaller
```

## 🧩 Tab Content Rendering

```
For each Tab in tabs array:
    │
    ├─ If tab.content exists:
    │   │
    │   └─ Render custom template with ngTemplateOutlet
    │
    └─ Else:
        │
        └─ Render default content (h4 + description)
```

## 🎭 Component State Diagram

```
        ┌─────────────┐
        │   CREATED   │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │   VISIBLE   │
        └──────┬──────┘
               │
        ┌──────┴──────────────┐
        │                     │
        ▼                     ▼
    ┌────────┐         ┌───────────┐
    │EXPANDED│         │ COLLAPSED │
    └────┬───┘         └─────┬─────┘
         │                   │
    Show content          Hide content
    Tab clickable         Tab hidden
        │                   │
        └───────┬───────────┘
                │
                ▼
            ┌────────┐
            │ LOCKED │
            └────┬───┘
                 │
            Prevent drag
            Allow interact
```

## 🎬 Animation Timeline

### Tab Switch (200ms)

```
Time: 0ms
  Old content: opacity 1.0
  New content: opacity 0.0

Time: 100ms (50%)
  Fade transition

Time: 200ms
  Old content: opacity 0.0
  New content: opacity 1.0
  Complete
```

## 🔌 Event Propagation

```
Tab Click Event
    │
    ├─ Prevent default
    ├─ Stop propagation
    │
    └─ Call selectTab(tabId)
        │
        ├─ selectTab method
        │   ├─ Validate tab
        │   ├─ Update property
        │   └─ Emit event
        │
        └─ selectedTabChange event
            │
            └─ Parent receives new tabId
```

## 📦 Component Dependencies

```
HtmlCssExampleVerticalTabStrip
    │
    ├─ @angular/core
    │   ├─ Component
    │   ├─ Input
    │   ├─ Output
    │   ├─ EventEmitter
    │   ├─ OnInit
    │   └─ TemplateRef
    │
    ├─ @angular/common
    │   ├─ CommonModule
    │   ├─ *ngFor
    │   ├─ *ngIf
    │   └─ ngTemplateOutlet
    │
    └─ BaseToolbarComponent
        ├─ Toolbar header
        ├─ Drag & drop
        ├─ Position management
        └─ State persistence
```

## 🎛️ Method Call Graph

```
ngOnInit()
    │
    └─ super.ngOnInit()
        └─ BaseToolbarComponent initialization

selectTab(tabId)
    ├─ find(tab => tab.id === tabId)
    ├─ Update selectedTabId
    └─ Emit selectedTabChange

toggleTextOrientation()
    ├─ Toggle: vertical ↔ horizontal
    └─ Emit textOrientationChange

getSelectedTab()
    └─ return find(tab => tab.id === selectedTabId)

getTextRotation()
    └─ return 'vertical' ? 'rotate(-90deg)' : 'rotate(0deg)'

getTabStripClasses()
    └─ return ngClass object

getTabClasses(tab)
    └─ return ngClass object
```

## 💾 State Storage

```
Component State:
├─ selectedTabId: string = 'tab1'
├─ textOrientation: 'vertical' | 'horizontal' = 'vertical'
├─ tabs: TabConfig[] = [default 4 tabs]
├─ isDarkMode: boolean = false
├─ visible: boolean = false
└─ ... [from BaseToolbarComponent]
```

## 🎨 CSS Class Hierarchy

```
.vertical-tab-strip-panel (Root)
    │
    ├─ .toolbar-header (Inherited)
    │   └─ .header-actions
    │
    ├─ .tab-container
    │   ├─ .vertical-tab-strip
    │   │   └─ .vertical-tab (repeating)
    │   │       ├─ .tab-active
    │   │       ├─ .tab-disabled
    │   │       ├─ .vertical-text
    │   │       └─ .horizontal-text
    │   │
    │   └─ .tab-content-area
    │       └─ .tab-content (repeating)
    │
    └─ .resize-handle
```

---

This visual architecture demonstrates the component's professional structure, responsive design, and comprehensive state management system.
