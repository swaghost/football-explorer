import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import dialogHelpData from '../config/help-dialogs.config.json';

/**
 * Dialog Help Service
 *
 * Provides help text for dialog components.
 * Help text is loaded from a JSON configuration file.
 *
 * Usage in dialog component:
 * ```typescript
 * export class MyDialogComponent extends BaseDialogComponent {
 *   dialogId = 'my-dialog';
 *   // Help will be automatically loaded via BaseDialogComponent
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class DialogHelpService {
  private helpData: Record<string, string> = {};
  private loaded = false;
  private loadedSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadHelpData();
  }

  /**
   * Load help data from JSON file
   */
  private loadHelpData(): void {
    try {
      this.helpData = dialogHelpData as Record<string, string>;
      this.loaded = true;
      this.loadedSubject.next(true);
    } catch (error) {
      console.error('Error loading dialog help data:', error);
      this.helpData = {};
      this.loaded = true;
      this.loadedSubject.next(true);
    }
  }

  /**
   * Check if help data is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get loaded state as observable
   */
  getLoadedState(): Observable<boolean> {
    return this.loadedSubject.asObservable();
  }

  /**
   * Get help text for a dialog (Observable)
   * @param dialogId - The unique identifier for the dialog
   * @returns Observable with help text HTML
   */
  getHelp(dialogId: string): Observable<string> {
    return new Observable((observer) => {
      if (this.loaded) {
        observer.next(this.getHelpSync(dialogId));
        observer.complete();
      } else {
        // Wait for data to load
        const subscription = this.loadedSubject.subscribe((loaded) => {
          if (loaded) {
            observer.next(this.getHelpSync(dialogId));
            observer.complete();
            subscription.unsubscribe();
          }
        });
      }
    });
  }

  /**
   * Get help text for a dialog synchronously
   * @param dialogId - The unique identifier for the dialog
   * @returns Help text HTML or default message
   */
  getHelpSync(dialogId: string): string {
    const help = this.helpData[dialogId];
    return (
      help ||
      `<h2>No Help Available</h2><br/>No help specified for <strong>${dialogId}</strong>.`
    );
  }

  /**
   * Get all available dialog help entries
   * @returns Record of all dialog IDs and their help text
   */
  getAllHelp(): Record<string, string> {
    return { ...this.helpData };
  }

  /**
   * Check if help exists for a specific dialog
   * @param dialogId - The unique identifier for the dialog
   * @returns True if help text exists for this dialog
   */
  hasHelp(dialogId: string): boolean {
    return dialogId in this.helpData;
  }
}
