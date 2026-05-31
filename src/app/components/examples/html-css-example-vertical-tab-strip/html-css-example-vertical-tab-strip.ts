import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTabbedToolbar } from '../../shared/base-tabbed-toolbar/base-tabbed-toolbar.component';
import { TabConfig } from '../../../interfaces/ui/tabbed-toolbar-control/tab-config';
import { HelpOverlayComponent } from '../../shared/help-overlay/help-overlay.component';

/**
 * Vertical Tab Strip Component - Extends BaseTabbedToolbar
 * Allows a vertical tab strip that sticks out from a toolbar div panel
 * Features:
 * - At least 4 tab sections supported (easily extensible)
 * - Generic templates for tab content
 * - Icons alongside tab text
 * - Text rotation: -90 degrees (vertical) or 0 degrees (horizontal)
 * - Extends base toolbar functionality (drag, lock, expand, etc.)
 */
@Component({
  selector: 'app-html-css-example-vertical-tab-strip',
  standalone: true,
  imports: [CommonModule, HelpOverlayComponent],
  templateUrl: './html-css-example-vertical-tab-strip.html',
  styleUrl: './html-css-example-vertical-tab-strip.scss',
})
export class HtmlCssExampleVerticalTabStrip
  extends BaseTabbedToolbar
  implements OnInit
{
  // Required base component properties
  readonly toolbarId = 'vertical-tabs-toolbar';
  readonly toolbarTitle = 'Vertical Tabs';
  readonly toolbarIcon = '📑';

  // Tab configuration
  @Input() override tabs: TabConfig[] = [
    {
      id: 'tab1',
      label: 'Tab 1',
      icon: '📋',
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      icon: '⚙️',
    },
    {
      id: 'tab3',
      label: 'Tab 3',
      icon: '🎨',
    },
    {
      id: 'tab4',
      label: 'Tab 4',
      icon: '📊',
    },
  ];

  @Input() override selectedTabId: string = 'tab1';
  @Input() override textOrientation: 'vertical' | 'horizontal' = 'vertical'; // -90deg or 0deg
  @Input() tabWidth: number = 35; // Width of tab strip when vertical
  @Input() stripPosition: 'left' | 'right' = 'left'; // Position of tab strip relative to content

  // Events
  @Output() override selectedTabChange = new EventEmitter<string>();
  @Output() override textOrientationChange = new EventEmitter<
    'vertical' | 'horizontal'
  >();

  constructor() {
    super();
    // Set defaults for demo display
    this.visible = true;
    this.position = { x: 50, y: 50 };
    this.expanded = true;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Set default width for vertical tabs
    if (this.textOrientation === 'vertical') {
      // Panel width should accommodate tab strip + content
      // This is handled by CSS classes
    }
  }

  /**
   * Get CSS classes for the tab strip
   */
  getTabStripClasses(): Record<string, boolean> {
    return {
      'vertical-tab-strip': true,
      'dark-mode': this.isDarkMode,
      'tab-strip-left': this.stripPosition === 'left',
      'tab-strip-right': this.stripPosition === 'right',
    };
  }
}
