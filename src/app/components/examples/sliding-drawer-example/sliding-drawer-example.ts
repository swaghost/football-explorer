import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSlidingDrawer } from '../../shared/base-sliding-drawer/base-sliding-drawer';

@Component({
  selector: 'app-sliding-drawer-example',
  imports: [CommonModule, BaseSlidingDrawer],
  templateUrl: './sliding-drawer-example.html',
  styleUrl: './sliding-drawer-example.scss',
})
export class SlidingDrawerExample {
  public isLeftDrawerOpen = false;
  public isRightDrawerOpen = false;

  public leftItems = [
    { id: 1, label: 'Left Item 1', icon: '📄' },
    { id: 2, label: 'Left Item 2', icon: '📁' },
    { id: 3, label: 'Left Item 3', icon: '🔧' },
    { id: 4, label: 'Left Item 4', icon: '⚙️' },
  ];

  public rightItems = [
    { id: 5, label: 'Right Item 1', icon: '📊' },
    { id: 6, label: 'Right Item 2', icon: '🎨' },
    { id: 7, label: 'Right Item 3', icon: '🔍' },
    { id: 8, label: 'Right Item 4', icon: '💡' },
  ];

  // Legacy support - kept for backward compatibility
  public get isDrawerOpen(): boolean {
    return this.isLeftDrawerOpen;
  }

  public set isDrawerOpen(value: boolean) {
    this.isLeftDrawerOpen = value;
  }

  public get items() {
    return this.leftItems;
  }

  public toggleDrawer(): void {
    this.isLeftDrawerOpen = !this.isLeftDrawerOpen;
  }

  public closeDrawer(): void {
    this.isLeftDrawerOpen = false;
  }

  public toggleLeftDrawer(): void {
    this.isLeftDrawerOpen = !this.isLeftDrawerOpen;
  }

  public closeLeftDrawer(): void {
    this.isLeftDrawerOpen = false;
  }

  public toggleRightDrawer(): void {
    this.isRightDrawerOpen = !this.isRightDrawerOpen;
  }

  public closeRightDrawer(): void {
    this.isRightDrawerOpen = false;
  }

  public onItemClick(item: any): void {
    console.log('Item clicked:', item);
    this.closeLeftDrawer();
    this.closeRightDrawer();
  }
}
