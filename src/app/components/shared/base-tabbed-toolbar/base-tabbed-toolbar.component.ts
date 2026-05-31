import { Input, Output, EventEmitter, Directive } from '@angular/core';
import { BaseToolbarComponent } from '../base-toolbar/base-toolbar.component';
import { TabConfig } from '../../../interfaces/ui/tabbed-toolbar-control/tab-config';

/**
 * Base Tabbed Toolbar Component
 * Extends BaseToolbarComponent with tabbed interface functionality
 * Can be extended by specific implementations like VerticalTabStrip, HorizontalTabs, etc.
 */
@Directive()
export abstract class BaseTabbedToolbar extends BaseToolbarComponent {
  // Abstract members inherited from BaseToolbarComponent
  abstract readonly toolbarId: string;
  abstract readonly toolbarTitle: string;
  abstract readonly toolbarIcon: string;
  // Tab configuration
  @Input() tabs: TabConfig[] = [];
  @Input() selectedTabId: string = '';
  @Input() textOrientation: 'vertical' | 'horizontal' = 'vertical';

  // Events
  @Output() selectedTabChange = new EventEmitter<string>();
  @Output() textOrientationChange = new EventEmitter<
    'vertical' | 'horizontal'
  >();

  constructor() {
    super();
  }

  /**
   * Select a tab by id
   */
  selectTab(tabId: string): void {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab && !tab.disabled) {
      this.selectedTabId = tabId;
      this.selectedTabChange.emit(tabId);
    }
  }

  /**
   * Get the currently selected tab
   */
  getSelectedTab(): TabConfig | undefined {
    return this.tabs.find((t) => t.id === this.selectedTabId);
  }

  /**
   * Toggle text orientation between vertical and horizontal
   */
  toggleTextOrientation(): void {
    const newOrientation =
      this.textOrientation === 'vertical' ? 'horizontal' : 'vertical';
    this.textOrientation = newOrientation;
    this.textOrientationChange.emit(newOrientation);
  }

  /**
   * Get rotation angle for tab text
   */
  getTextRotation(): string {
    return this.textOrientation === 'vertical'
      ? 'rotate(-90deg)'
      : 'rotate(0deg)';
  }

  /**
   * Get CSS classes for a specific tab
   */
  getTabClasses(tab: TabConfig): Record<string, boolean> {
    return {
      'vertical-tab': true,
      'tab-active': tab.id === this.selectedTabId,
      'tab-disabled': tab.disabled || false,
      'vertical-text': this.textOrientation === 'vertical',
      'horizontal-text': this.textOrientation === 'horizontal',
    };
  }
}
