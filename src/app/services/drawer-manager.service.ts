import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Drawer registration interface
 */
export interface DrawerConfig {
  id: string;
  position: 'left' | 'right';
  isOpen: boolean;
}

/**
 * Centralized drawer management service
 *
 * Handles drawer state and ensures only one drawer per side is open at a time.
 *
 * Usage:
 * ```typescript
 * // In component constructor/ngOnInit:
 * drawerManager.registerDrawer('login', 'left');
 *
 * // Subscribe to drawer state:
 * drawerManager.isOpen('login').subscribe(isOpen => {
 *   this.isLoginDrawerOpen = isOpen;
 * });
 *
 * // Toggle drawer (auto-closes others on same side):
 * drawerManager.toggle('login');
 *
 * // Or manually control:
 * drawerManager.open('login');
 * drawerManager.close('login');
 * drawerManager.closeAll();
 * drawerManager.closeAllOnSide('left');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class DrawerManagerService {
  private drawers = new Map<string, BehaviorSubject<boolean>>();
  private drawerConfigs = new Map<string, DrawerConfig>();

  /**
   * Register a drawer with the manager
   * @param id Unique drawer identifier
   * @param position Which side the drawer appears on
   */
  public registerDrawer(id: string, position: 'left' | 'right'): void {
    if (!this.drawers.has(id)) {
      this.drawers.set(id, new BehaviorSubject<boolean>(false));
      this.drawerConfigs.set(id, { id, position, isOpen: false });
    }
  }

  /**
   * Unregister a drawer (cleanup on component destroy)
   * @param id Drawer identifier
   */
  public unregisterDrawer(id: string): void {
    const subject = this.drawers.get(id);
    if (subject) {
      subject.complete();
      this.drawers.delete(id);
      this.drawerConfigs.delete(id);
    }
  }

  /**
   * Get observable for drawer open state
   * @param id Drawer identifier
   * @returns Observable<boolean> of drawer open state
   */
  public isOpen(id: string): Observable<boolean> {
    const subject = this.drawers.get(id);
    if (!subject) {
      console.warn(`Drawer '${id}' not registered`);
      return new BehaviorSubject<boolean>(false).asObservable();
    }
    return subject.asObservable();
  }

  /**
   * Get current open state synchronously
   * @param id Drawer identifier
   * @returns Current open state
   */
  public isOpenSync(id: string): boolean {
    return this.drawers.get(id)?.value ?? false;
  }

  /**
   * Toggle drawer open/closed state
   * Automatically closes other drawers on the same side
   * @param id Drawer identifier
   */
  public toggle(id: string): void {
    const subject = this.drawers.get(id);
    const config = this.drawerConfigs.get(id);

    if (!subject || !config) {
      console.warn(`Drawer '${id}' not registered`);
      return;
    }

    const currentState = subject.value;

    // If opening this drawer, close all others on the same side
    if (!currentState) {
      this.closeAllOnSide(config.position, id);
    }

    // Toggle the drawer
    const newState = !currentState;
    subject.next(newState);
    config.isOpen = newState;
  }

  /**
   * Open a specific drawer
   * Automatically closes other drawers on the same side
   * @param id Drawer identifier
   */
  public open(id: string): void {
    const subject = this.drawers.get(id);
    const config = this.drawerConfigs.get(id);

    if (!subject || !config) {
      console.warn(`Drawer '${id}' not registered`);
      return;
    }

    // Close all others on the same side
    this.closeAllOnSide(config.position, id);

    // Open this drawer
    subject.next(true);
    config.isOpen = true;
  }

  /**
   * Close a specific drawer
   * @param id Drawer identifier
   */
  public close(id: string): void {
    const subject = this.drawers.get(id);
    const config = this.drawerConfigs.get(id);

    if (subject && config) {
      subject.next(false);
      config.isOpen = false;
    }
  }

  /**
   * Close all drawers on a specific side
   * @param position Which side ('left' or 'right')
   * @param exceptId Optional drawer ID to exclude from closing
   */
  public closeAllOnSide(position: 'left' | 'right', exceptId?: string): void {
    this.drawerConfigs.forEach((config, id) => {
      if (config.position === position && id !== exceptId) {
        this.close(id);
      }
    });
  }

  /**
   * Close all drawers regardless of side
   */
  public closeAll(): void {
    this.drawers.forEach((subject, id) => {
      this.close(id);
    });
  }

  /**
   * Get all registered drawer IDs
   * @param position Optional filter by position
   * @returns Array of drawer IDs
   */
  public getDrawerIds(position?: 'left' | 'right'): string[] {
    if (position) {
      return Array.from(this.drawerConfigs.values())
        .filter((config) => config.position === position)
        .map((config) => config.id);
    }
    return Array.from(this.drawerConfigs.keys());
  }

  /**
   * Get count of open drawers
   * @param position Optional filter by position
   * @returns Number of open drawers
   */
  public getOpenCount(position?: 'left' | 'right'): number {
    let count = 0;
    this.drawerConfigs.forEach((config) => {
      if ((!position || config.position === position) && config.isOpen) {
        count++;
      }
    });
    return count;
  }
}
