import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import toolbarHelpData from '../config/help-toolbars.config.json';

/**
 * Service for loading and managing toolbar help text.
 * Currently loads from JSON file, can be replaced with database call later.
 */
@Injectable({
  providedIn: 'root',
})
export class ToolbarHelpService {
  private helpData = new BehaviorSubject<Record<string, string>>({});
  private loaded = false;

  constructor(private http: HttpClient) {
    this.loadHelpData();
  }

  /**
   * Load toolbar help data from JSON configuration file
   */
  private loadHelpData(): void {
    try {
      const data = toolbarHelpData as Record<string, string>;
      console.log(
        '📚 Toolbar help data loaded:',
        Object.keys(data).length,
        'entries'
      );
      this.loaded = true;
      this.helpData.next(data);
    } catch (error) {
      console.error('❌ Failed to load toolbar help data:', error);
      this.helpData.next({});
    }
  }

  /**
   * Get help text for a specific toolbar
   * @param toolbarId The unique identifier for the toolbar
   * @returns The help text for the toolbar, or a default message if not found
   */
  getHelp(toolbarId: string): Observable<string> {
    return this.helpData.pipe(
      map((data) => {
        const help = data[toolbarId];
        if (!help) {
          // Only warn if data has been loaded and key is still missing
          if (this.loaded) {
            console.warn(`⚠️ No help text found for toolbar: ${toolbarId}`);
          }
          return `<h2>No Help Available</h2><br/>No help specified for <strong>${toolbarId}</strong>.`;
        }
        return help;
      })
    );
  }

  /**
   * Get help text synchronously (for components that need immediate access)
   * @param toolbarId The unique identifier for the toolbar
   * @returns The help text for the toolbar, or a default message if not found
   */
  getHelpSync(toolbarId: string): string {
    const data = this.helpData.value;
    const help = data[toolbarId];
    if (!help) {
      // Only warn if data has been loaded and key is still missing
      if (this.loaded) {
        console.warn(`⚠️ No help text found for toolbar: ${toolbarId}`);
      }
      return `<h2>No Help Available</h2><br/>No help specified for <strong>${toolbarId}</strong>.`;
    }
    return help;
  }

  /**
   * Get all help data as an observable
   */
  getAllHelp(): Observable<Record<string, string>> {
    return this.helpData.asObservable();
  }

  /**
   * Check if help data has been loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Reload help data (useful for future database integration)
   */
  reload(): void {
    this.loadHelpData();
  }
}
