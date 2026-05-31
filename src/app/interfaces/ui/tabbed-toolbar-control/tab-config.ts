import { TemplateRef } from '@angular/core';

/**
 * Tab configuration interface for tabbed toolbar controls
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: string; // Optional emoji or icon character
  content?: TemplateRef<any>; // Optional template for tab content
  disabled?: boolean;
}
