import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ContentChild,
  TemplateRef,
  AfterContentInit,
  ViewEncapsulation,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogHelpService } from '../../../services/dialog-help.service';

/**
 * Base Dialog Component
 *
 * Provides a standardized dialog wrapper with overlay, header, content area, and footer.
 * All dialogs should use this component to ensure consistency and reduce code duplication.
 *
 * Usage:
 * ```html
 * <app-base-dialog
 *   [visible]="visible"
 *   [title]="'My Dialog'"
 *   [icon]="'📝'"
 *   [isDarkMode]="isDarkMode"
 *   [maxWidth]="'600px'"
 *   (close)="onClose()">
 *
 *   <!-- Dialog content goes here -->
 *   <div class="form-group">...</div>
 *
 *   <!-- Footer buttons -->
 *   <div slot="footer" class="dialog-actions">
 *     <button (click)="onCancel()">Cancel</button>
 *     <button (click)="onSave()">Save</button>
 *   </div>
 * </app-base-dialog>
 * ```
 */
@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None, // Allow styles to pierce through to slotted content
})
export class BaseDialogComponent implements AfterContentInit, OnInit {
  /**
   * Controls the visibility of the dialog
   */
  @Input() visible: boolean = false;

  /**
   * Flag to track if footer content is provided
   */
  hasFooter: boolean = false;

  @ContentChild('footer', { read: TemplateRef })
  footerTemplate?: TemplateRef<any>;

  /**
   * Dialog title text
   */
  @Input() title: string = '';

  /**
   * Optional emoji or icon to show before the title
   */
  @Input() icon: string = '';

  /**
   * Unique identifier for the dialog (used for help system)
   */
  @Input() dialogId: string = '';

  /**
   * Whether to show the help button (default: true)
   */
  @Input() showHelpButton: boolean = true;

  /**
   * Enable dark mode styling
   */
  @Input() isDarkMode: boolean = false;

  /**
   * Help overlay state
   */
  protected showHelpOverlay: boolean = false;

  /**
   * Help text content (loaded from DialogHelpService)
   */
  protected dialogHelp: string = '';

  /**
   * Inject dialog help service
   */
  protected dialogHelpService = inject(DialogHelpService);

  /**
   * Maximum width of the dialog container (default: 500px)
   */
  @Input() maxWidth: string = '500px';

  /**
   * Maximum height of the dialog container (default: 80vh)
   */
  @Input() maxHeight: string = '80vh';

  /**
   * Whether to show the header close button (default: true)
   */
  @Input() showCloseButton: boolean = true;

  /**
   * Whether clicking the overlay should close the dialog (default: true)
   */
  @Input() closeOnOverlayClick: boolean = true;

  /**
   * Whether pressing ESC should close the dialog (default: true)
   */
  @Input() closeOnEscape: boolean = true;

  /**
   * Custom CSS class to apply to the dialog container
   */
  @Input() dialogClass: string = '';

  /**
   * Emitted when the user attempts to close the dialog
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Handle overlay click
   */
  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close.emit();
    }
  }

  /**
   * Handle close button click
   */
  onCloseClick(): void {
    this.close.emit();
  }

  /**
   * Prevent clicks on the dialog content from closing the overlay
   */
  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Handle ESC key press
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.visible && this.closeOnEscape) {
      event.preventDefault();
      this.close.emit();
    }
  }

  /**
   * Initialize component and load help text
   */
  ngOnInit(): void {
    this.loadHelpText();
  }

  /**
   * Check if footer content is provided
   */
  ngAfterContentInit(): void {
    // Check if there's any element with slot="footer"
    // This will be handled in the template with ng-content
    this.hasFooter = true; // Always show footer container if slot is used
  }

  /**
   * Load help text from service based on dialogId
   */
  protected loadHelpText(): void {
    if (!this.dialogId) {
      return;
    }

    // Check if data is already loaded, otherwise wait for it
    if (this.dialogHelpService.isLoaded()) {
      this.dialogHelp = this.dialogHelpService.getHelpSync(this.dialogId);
    } else {
      // Subscribe to get help text when data is loaded
      this.dialogHelpService.getHelp(this.dialogId).subscribe((help) => {
        this.dialogHelp = help;
      });
    }
  }

  /**
   * Handle help overlay toggle
   */
  onToggleHelp(): void {
    this.showHelpOverlay = !this.showHelpOverlay;
  }

  /**
   * Close help overlay
   */
  onCloseHelp(): void {
    this.showHelpOverlay = false;
  }

  /**
   * Get the dialog container styles
   */
  getDialogStyles(): any {
    return {
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight,
    };
  }
}
