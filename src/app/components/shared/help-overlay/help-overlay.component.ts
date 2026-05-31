import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Shared Help Overlay Component
 *
 * Displays a modal overlay with help content for toolbars and other components.
 * The overlay covers the entire component and shows help text with a close button.
 */
@Component({
  selector: 'app-help-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-overlay.component.html',
  styleUrls: ['./help-overlay.component.scss'],
})
export class HelpOverlayComponent {
  /**
   * Controls the visibility of the help overlay
   */
  @Input() visible: boolean = false;

  /**
   * The help content to display (can include HTML)
   */
  @Input() helpText: string = '';

  /**
   * Emitted when the user closes the help overlay
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Handle click on the overlay background (closes the help)
   */
  onOverlayClick(): void {
    this.close.emit();
  }

  /**
   * Handle click on the close button
   */
  onCloseClick(): void {
    this.close.emit();
  }

  /**
   * Prevent clicks on the help content from closing the overlay
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
