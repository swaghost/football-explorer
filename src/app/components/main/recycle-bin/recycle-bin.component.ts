import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IToDoEntry,
  ToDoStatus,
} from '../../../interfaces/to-do/to-do.interface';
import {
  ToDoState,
  UpdateToDoEntry,
  DeleteToDoEntry,
} from '../../../state/to-do/to-do.state';

interface DeletedItemDisplay extends IToDoEntry {
  daysRemaining: number;
  percentRemaining: number;
}

@Component({
  selector: 'app-recycle-bin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.scss',
})
export class RecycleBinComponent implements OnInit, OnDestroy {
  deletedItems: DeletedItemDisplay[] = [];
  private destroy$ = new Subject<void>();
  private updateInterval: any;

  // Restore dialog state
  showRestoreDialog = false;
  selectedItem: DeletedItemDisplay | null = null;
  selectedRestoreStatus: ToDoStatus | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.loadDeletedItems();
    this.startUpdateInterval();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private loadDeletedItems(): void {
    this.store
      .select(ToDoState.getEntries)
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.deletedItems = items
          .filter(
            (item) => item.status === 'Closed - Deleted' && item.deletedAt
          )
          .map((item) =>
            this.calculateDaysRemaining(item as DeletedItemDisplay)
          )
          .sort((a, b) => b.daysRemaining - a.daysRemaining); // Show items with more time first
      });
  }

  private calculateDaysRemaining(item: DeletedItemDisplay): DeletedItemDisplay {
    if (!item.deletedAt) {
      return {
        ...item,
        daysRemaining: 14,
        percentRemaining: 100,
      };
    }

    const deletedDate = new Date(item.deletedAt);
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPassed = now.getTime() - deletedDate.getTime();
    const daysPassed = Math.floor(msPassed / msPerDay);
    const daysRemaining = Math.max(0, 14 - daysPassed);
    const percentRemaining = (daysRemaining / 14) * 100;

    return {
      ...item,
      daysRemaining,
      percentRemaining,
    };
  }

  private startUpdateInterval(): void {
    // Update display every minute to keep days remaining accurate
    this.updateInterval = setInterval(() => {
      this.deletedItems = this.deletedItems.map((item) =>
        this.calculateDaysRemaining(item)
      );
    }, 60 * 1000); // 1 minute
  }

  openRestoreDialog(item: DeletedItemDisplay): void {
    this.selectedItem = item;
    this.selectedRestoreStatus = null;
    this.showRestoreDialog = true;
  }

  closeRestoreDialog(): void {
    this.showRestoreDialog = false;
    this.selectedItem = null;
    this.selectedRestoreStatus = null;
  }

  restoreItem(): void {
    if (!this.selectedItem || !this.selectedRestoreStatus) return;

    const restoredItem: IToDoEntry = {
      ...this.selectedItem,
      comments: this.selectedItem.comments
        ? [...this.selectedItem.comments]
        : [],
      status: this.selectedRestoreStatus,
      deletedAt: null,
      lastUpdatedUTC: new Date().toISOString(),
    };

    this.store.dispatch(new UpdateToDoEntry(restoredItem));
    this.closeRestoreDialog();
  }

  permanentlyDelete(item: DeletedItemDisplay): void {
    if (
      confirm(
        `Are you sure you want to permanently delete "${item.title}"? This cannot be undone.`
      )
    ) {
      this.store.dispatch(new DeleteToDoEntry(item.toDoID));
    }
  }

  getRestoreStatusOptions(): ToDoStatus[] {
    return [
      'Open',
      'Ready',
      'On Hold',
      'Active / In-Process',
      'In Q/A',
    ] as ToDoStatus[];
  }

  getStatusColor(percentRemaining: number): string {
    if (percentRemaining > 66) {
      return '#4CAF50'; // Green
    } else if (percentRemaining > 33) {
      return '#FFC107'; // Yellow
    } else {
      return '#FF5252'; // Red
    }
  }

  getStatusLabel(percentRemaining: number): string {
    if (percentRemaining > 66) {
      return 'Safe';
    } else if (percentRemaining > 33) {
      return 'Warning';
    } else {
      return 'Critical';
    }
  }
}
