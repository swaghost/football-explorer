import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarHelpService } from '../../../services/toolbar-help.service';

/**
 * Base sliding drawer component that can slide in from left or right
 *
 * Usage:
 * ```html
 * <!-- Default: slides from left -->
 * <app-base-sliding-drawer [isOpen]="isOpen" [title]="'My Drawer'" (close)="onClose()">
 *   <p>Drawer content goes here</p>
 * </app-base-sliding-drawer>
 *
 * <!-- Slide from right -->
 * <app-base-sliding-drawer [isOpen]="isOpen" [title]="'My Drawer'" [position]="'right'" (close)="onClose()">
 *   <p>Drawer content goes here</p>
 * </app-base-sliding-drawer>
 *
 * <!-- With help support -->
 * <app-base-sliding-drawer [isOpen]="isOpen" [title]="'My Drawer'" [drawerId]="'my-drawer'" [drawerHelp]="'Help text...'" (close)="onClose()">
 *   <p>Drawer content goes here</p>
 * </app-base-sliding-drawer>
 * ```
 */
@Component({
  selector: 'app-base-sliding-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-sliding-drawer.html',
  styleUrl: './base-sliding-drawer.scss',
})
export class BaseSlidingDrawer implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Menu';
  @Input() width = '320px';
  @Input() showOverlay = true;
  /** Specify which side the drawer slides in from. Default is 'left'. */
  @Input() position: 'left' | 'right' = 'left';
  /** Optional drawer ID for loading help text from service */
  @Input() drawerId = '';
  /** Optional help text to display. Can be set directly or loaded from service using drawerId */
  @Input() drawerHelp = '';
  /** Show or hide the help button. Default is true if drawerHelp or drawerId is provided */
  @Input() showHelpButton = false;

  @Output() close = new EventEmitter<void>();

  // Help overlay state
  protected showHelpOverlay = false;
  protected helpService = inject(ToolbarHelpService);

  ngOnInit(): void {
    // Auto-enable help button if help text or drawer ID is provided
    if (!this.showHelpButton && (this.drawerHelp || this.drawerId)) {
      this.showHelpButton = true;
    }

    // Load help text from service if drawerId is provided
    if (this.drawerId && !this.drawerHelp) {
      this.loadHelpText();
    }
  }

  public onClose(): void {
    this.close.emit();
  }

  public onOverlayClick(): void {
    if (this.showOverlay) {
      this.onClose();
    }
  }

  /**
   * Toggle help overlay visibility
   */
  public onToggleHelp(): void {
    this.showHelpOverlay = !this.showHelpOverlay;
  }

  /**
   * Close help overlay
   */
  public onCloseHelp(): void {
    this.showHelpOverlay = false;
  }

  /**
   * Load help text from service based on drawerId
   */
  protected loadHelpText(): void {
    if (this.helpService.isLoaded()) {
      this.drawerHelp = this.helpService.getHelpSync(this.drawerId);
    } else {
      this.helpService.getHelp(this.drawerId).subscribe((help) => {
        this.drawerHelp = help;
      });
    }
  }
}
