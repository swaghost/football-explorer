import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appToolbarCollapse]',
  standalone: true,
})
export class ToolbarCollapseDirective implements OnChanges {
  @Input('appToolbarCollapse') collapsed: boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.enforceCollapseState();
  }

  private enforceCollapseState(): void {
    const element = this.elementRef.nativeElement as HTMLElement;

    if (this.collapsed) {
      // Add collapsed class
      this.renderer.addClass(element, 'collapsed');

      // Force hide all content sections
      const contentSelectors = [
        '.panel-content',
        '.content',
        '.tool-section',
        '.section',
        '.controls',
        '.button-grid',
        '.control-group',
        '.form-group',
        '.toolbar-content',
        '.main-content',
        '.body',
        '.panel-body',
        '.content-section',
        '.nodes-scroll-list',
        '.selection-tools-container',
        '.tenancy-container',
        '.lesson-controls',
        '.video-container',
        '.org-selector-list',
        '.tenancy-info',
        '.organization-list',
        '.node-content',
        '.node-title-section',
        '.scrollable-content',
        '.two-column-toggles',
        '.toggle-column',
        '.teams-container',
        '.node-viewer-footer',
        '.navigation-buttons',
        '.tree-container',
        '.nodes-list-container',
        '.default-groups-list',
        '.groups-container',
        '.mode-buttons',
        '.drawing-canvas',
        '.control-row',
        '.level-expansion-controls',
        '.action-buttons',
      ];

      contentSelectors.forEach((selector) => {
        const elements = element.querySelectorAll(selector);
        elements.forEach((contentElement) => {
          this.renderer.addClass(contentElement, 'force-collapse-content');
          this.renderer.setStyle(contentElement, 'display', 'none');
          this.renderer.setStyle(contentElement, 'visibility', 'hidden');
          this.renderer.setStyle(contentElement, 'opacity', '0');
          this.renderer.setStyle(contentElement, 'height', '0');
          this.renderer.setStyle(contentElement, 'position', 'absolute');
          this.renderer.setStyle(contentElement, 'left', '-9999px');
          this.renderer.setStyle(contentElement, 'top', '-9999px');
        });
      });

      // Ensure header remains visible
      const header = element.querySelector('.panel-header');
      if (header) {
        this.renderer.setStyle(header, 'display', 'flex');
        this.renderer.setStyle(header, 'visibility', 'visible');
        this.renderer.setStyle(header, 'opacity', '1');
        this.renderer.setStyle(header, 'position', 'relative');
        this.renderer.setStyle(header, 'left', 'auto');
        this.renderer.setStyle(header, 'top', 'auto');
      }

      // Force toolbar height
      this.renderer.setStyle(element, 'max-height', '40px');
      this.renderer.setStyle(element, 'height', 'auto');
    } else {
      // Remove collapsed class
      this.renderer.removeClass(element, 'collapsed');

      // Remove forced collapse from all elements
      const collapsedElements = element.querySelectorAll(
        '.force-collapse-content'
      );
      collapsedElements.forEach((contentElement) => {
        this.renderer.removeClass(contentElement, 'force-collapse-content');
        this.renderer.removeStyle(contentElement, 'display');
        this.renderer.removeStyle(contentElement, 'visibility');
        this.renderer.removeStyle(contentElement, 'opacity');
        this.renderer.removeStyle(contentElement, 'height');
        this.renderer.removeStyle(contentElement, 'position');
        this.renderer.removeStyle(contentElement, 'left');
        this.renderer.removeStyle(contentElement, 'top');
      });

      // Reset toolbar height
      this.renderer.removeStyle(element, 'max-height');
      this.renderer.removeStyle(element, 'height');
    }
  }
}
