import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IToDoEntry,
  TargetType,
  ToDoStatus,
  ALL_STATUSES,
  ALL_PRIORITIES,
  TARGET_TYPES_BY_CATEGORY,
} from '../../interfaces/to-do/to-do.interface';
import { ToDoService } from '../../services/to-do/to-do.service';
import { SketchState } from '../../state';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-to-do-list-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  template: `
    <div class="to-do-drawer" [class.dark-mode]="isDarkMode">
      <div class="drawer-header">
        <h3>To-Do List</h3>
        <button class="btn-icon" (click)="addNewEntry()" title="Add new to-do">
          ➕
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Target Type:</label>
          <select [(ngModel)]="selectedTargetType" (change)="onFilterChange()">
            <option value="All">All</option>
            <option value="Development">Development</option>
            <option value="Architecting">Architecting</option>
            <option value="Teaching">Teaching</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="selectedStatus" (change)="onFilterChange()">
            <option value="">All Statuses</option>
            <option *ngFor="let status of allStatuses" [value]="status">
              {{ status }}
            </option>
          </select>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="bulk-actions" *ngIf="selectedEntries.size > 0">
        <span class="selection-count">{{ selectedEntries.size }} selected</span>
        <div class="action-buttons">
          <button
            class="btn-action"
            (click)="bulkUpdateStatus('Open')"
            title="Mark as Open"
          >
            Open
          </button>
          <button
            class="btn-action"
            (click)="bulkUpdateStatus('Ready')"
            title="Mark as Ready"
          >
            Ready
          </button>
          <button
            class="btn-action"
            (click)="bulkUpdateStatus('On Hold')"
            title="Mark as On Hold"
          >
            Hold
          </button>
          <button
            class="btn-action"
            (click)="bulkTogglePin()"
            title="Toggle pin status"
          >
            Pin
          </button>
          <button
            class="btn-action btn-danger"
            (click)="bulkDelete()"
            title="Delete selected"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- To-Do List -->
      <div class="to-do-list">
        <div
          *ngIf="filteredEntries$ | async as entries"
          class="entries-container"
        >
          <div *ngIf="entries.length === 0" class="no-entries">
            No to-do entries found
          </div>

          <div
            *ngFor="let entry of entries"
            class="to-do-item"
            [class.pinned]="entry.pinned"
            [class.selected]="selectedEntries.has(entry.toDoID)"
          >
            <div class="item-header">
              <input
                type="checkbox"
                [checked]="selectedEntries.has(entry.toDoID)"
                (change)="toggleSelection(entry.toDoID)"
                class="item-checkbox"
              />

              <div class="item-title-section">
                <h4 class="item-title">{{ entry.title }}</h4>
                <div class="item-meta">
                  <button
                    *ngIf="entry.description"
                    class="btn-expand-compact"
                    (click)="toggleDescription(entry.toDoID)"
                    [title]="
                      expandedDescriptions.has(entry.toDoID)
                        ? 'Hide description'
                        : 'Show description'
                    "
                  >
                    {{ expandedDescriptions.has(entry.toDoID) ? '▼' : '▶' }}
                  </button>
                  <span
                    class="badge status"
                    [ngClass]="entry.status.toLowerCase()"
                  >
                    {{ entry.status }}
                  </span>
                  <span
                    class="badge priority"
                    [ngClass]="entry.priority.toLowerCase()"
                  >
                    {{ entry.priority }}
                  </span>
                  <span class="badge target-type">{{ entry.targetType }}</span>
                  <span class="badge specific-target-type">{{
                    entry.specificTargetType
                  }}</span>
                </div>
              </div>

              <div class="item-actions">
                <button
                  class="btn-icon"
                  (click)="editEntry(entry)"
                  title="Edit entry"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon"
                  [class.pinned]="entry.pinned"
                  (click)="togglePin(entry)"
                  title="Toggle pin"
                >
                  📌
                </button>
              </div>
            </div>

            <div
              class="item-description"
              *ngIf="
                entry.description && expandedDescriptions.has(entry.toDoID)
              "
            >
              {{ entry.description }}
            </div>

            <div class="item-target">
              <small>Target: {{ entry.target }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirmation-dialog
        [visible]="showDeleteConfirmation"
        title="Delete To-Do Entries"
        [message]="
          'Delete ' +
          selectedEntries.size +
          ' to-do ' +
          (selectedEntries.size === 1 ? 'entry' : 'entries') +
          '? This cannot be undone.'
        "
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="onDeleteConfirmed($event)"
      >
      </app-confirmation-dialog>
    </div>
  `,
  styles: [
    `
      .to-do-drawer {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--color-bg-secondary, #f5f5f5);
        padding: 12px;
        font-size: 12px;
      }

      .drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--color-border, #ddd);
      }

      .drawer-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .header-buttons {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        font-size: 16px;
        color: var(--color-text-secondary, #666);
        transition: color 0.2s;
      }

      .btn-icon:hover {
        color: var(--color-text-primary, #000);
      }

      .filters-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
        padding: 8px;
        background: var(--color-bg-primary, #fff);
        border-radius: 4px;
      }

      .filter-group {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .filter-group label {
        min-width: 70px;
        font-weight: 600;
        color: var(--color-text-secondary, #666);
      }

      .filter-group select {
        flex: 1;
        padding: 4px 6px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 3px;
        background: var(--color-bg-primary, #fff);
        color: var(--color-text-primary, #000);
        font-size: 11px;
      }

      .bulk-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
        padding: 8px;
        background: var(--color-accent-light, #f0f4ff);
        border-radius: 4px;
        border: 1px solid var(--color-accent, #6366f1);
      }

      .selection-count {
        font-weight: 600;
        color: var(--color-accent, #6366f1);
        font-size: 11px;
      }

      .action-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .btn-action {
        padding: 4px 8px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 3px;
        background: var(--color-bg-primary, #fff);
        color: var(--color-text-primary, #000);
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s;
      }

      .btn-action:hover {
        background: var(--color-accent, #6366f1);
        color: white;
        border-color: var(--color-accent, #6366f1);
      }

      .btn-action.btn-danger:hover {
        background: #ef4444;
        border-color: #ef4444;
      }

      .to-do-list {
        flex: 1;
        overflow-y: auto;
        border-top: 1px solid var(--color-border, #ddd);
        padding-top: 8px;
      }

      .entries-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .no-entries {
        text-align: center;
        padding: 20px;
        color: var(--color-text-secondary, #666);
        font-style: italic;
      }

      .to-do-item {
        padding: 8px;
        border: 1px solid var(--color-border, #ddd);
        border-radius: 4px;
        background: var(--color-bg-primary, #fff);
        transition: all 0.2s;
      }

      .to-do-item.pinned {
        border-left: 3px solid var(--color-accent, #6366f1);
        background: var(--color-accent-light, #f0f4ff);
      }

      .to-do-item.selected {
        border-color: var(--color-accent, #6366f1);
        background: var(--color-accent-light, #f0f4ff);
      }

      .item-header {
        display: flex;
        gap: 6px;
        align-items: flex-start;
        margin-bottom: 6px;
      }

      .item-checkbox {
        margin-top: 3px;
        cursor: pointer;
      }

      .item-title-section {
        flex: 1;
        min-width: 0;
      }

      .item-title {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        word-break: break-word;
      }

      .item-meta {
        display: flex;
        gap: 4px;
        margin-top: 4px;
        flex-wrap: wrap;
      }

      .badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 10px;
        font-weight: 600;
        white-space: nowrap;
      }

      .badge.status {
        background: var(--color-status-bg, #e0e0e0);
        color: var(--color-status-text, #333);
      }

      .badge.status.open {
        background: #fff3cd;
        color: #856404;
      }

      .badge.status.ready {
        background: #d1e7dd;
        color: #0f5132;
      }

      .badge.status.complete {
        background: #cce5ff;
        color: #084298;
      }

      .badge.priority {
        background: var(--color-priority-bg, #f0f0f0);
        color: var(--color-priority-text, #666);
      }

      .badge.priority.critical {
        background: #f8d7da;
        color: #721c24;
      }

      .badge.priority.high {
        background: #ffeaa7;
        color: #856404;
      }

      .badge.target-type {
        background: var(--color-border, #ddd);
        color: var(--color-text-secondary, #666);
      }

      .badge.specific-target-type {
        background: #e8f4f8;
        color: #0c5f7c;
      }

      .item-actions {
        display: flex;
        gap: 2px;
      }

      .item-actions .btn-icon {
        padding: 2px;
        font-size: 14px;
      }

      .item-actions .btn-icon.pinned {
        color: var(--color-accent, #6366f1);
      }

      .item-description {
        font-size: 11px;
        color: var(--color-text-secondary, #666);
        margin: 4px 0;
        padding: 4px 6px;
        background: var(--color-bg-secondary, #f5f5f5);
        border-radius: 2px;
        border-left: 2px solid var(--color-border, #ddd);
      }

      .item-description-header {
        display: flex;
        gap: 6px;
        align-items: center;
        margin: 4px 0;
        padding: 0;
      }

      .btn-expand {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        font-size: 10px;
        color: var(--color-text-secondary, #666);
        min-width: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .btn-expand:hover {
        color: var(--color-text-primary, #000);
      }

      .btn-expand-compact {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        font-size: 9px;
        color: var(--color-text-secondary, #666);
        min-width: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
        margin-right: 2px;
      }

      .btn-expand-compact:hover {
        color: var(--color-text-primary, #000);
      }

      .desc-label {
        font-size: 10px;
        font-weight: 600;
        color: var(--color-text-secondary, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .item-target {
        font-size: 10px;
        color: var(--color-text-secondary, #999);
        margin-top: 4px;
      }

      /* Scrollbar styling */
      .to-do-list::-webkit-scrollbar {
        width: 6px;
      }

      .to-do-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .to-do-list::-webkit-scrollbar-thumb {
        background: var(--color-scrollbar, #ccc);
        border-radius: 3px;
      }

      .to-do-list::-webkit-scrollbar-thumb:hover {
        background: var(--color-scrollbar-hover, #aaa);
      }

      /* Dark Mode Support */
      .to-do-drawer.dark-mode {
        background: var(--color-bg-secondary, #1e1e1e);
        color: var(--color-text-primary, #e0e0e0);
      }

      .to-do-drawer.dark-mode .drawer-header {
        border-bottom-color: var(--color-border, #444);
      }

      .to-do-drawer.dark-mode .drawer-header h3 {
        color: var(--color-text-primary, #e0e0e0);
      }

      .to-do-drawer.dark-mode .btn-icon {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .btn-icon:hover {
        color: var(--color-text-primary, #e0e0e0);
      }

      .to-do-drawer.dark-mode .filters-section {
        background: var(--color-bg-primary, #2a2a2a);
        border-color: var(--color-border, #444);
      }

      .to-do-drawer.dark-mode .filter-group label {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .filter-group select {
        background: var(--color-bg-primary, #2a2a2a);
        color: var(--color-text-primary, #e0e0e0);
        border-color: var(--color-border, #444);
      }

      .to-do-drawer.dark-mode .bulk-actions {
        background: var(--color-accent-light, #1a2a4a);
        border-color: var(--color-accent, #4a5fd9);
      }

      .to-do-drawer.dark-mode .selection-count {
        color: var(--color-accent, #6fa3ff);
      }

      .to-do-drawer.dark-mode .btn-action {
        background: var(--color-bg-primary, #2a2a2a);
        color: var(--color-text-primary, #e0e0e0);
        border-color: var(--color-border, #444);
      }

      .to-do-drawer.dark-mode .btn-action:hover {
        background: var(--color-accent, #4a5fd9);
        border-color: var(--color-accent, #4a5fd9);
      }

      .to-do-drawer.dark-mode .to-do-list {
        border-top-color: var(--color-border, #444);
      }

      .to-do-drawer.dark-mode .no-entries {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .to-do-item {
        background: var(--color-bg-primary, #2a2a2a);
        border-color: var(--color-border, #444);
      }

      .to-do-drawer.dark-mode .to-do-item.pinned {
        background: var(--color-accent-light, #1a2a4a);
        border-color: var(--color-accent, #4a5fd9);
      }

      .to-do-drawer.dark-mode .to-do-item.selected {
        background: var(--color-accent-light, #1a2a4a);
        border-color: var(--color-accent, #4a5fd9);
      }

      .to-do-drawer.dark-mode .item-title {
        color: var(--color-text-primary, #e0e0e0);
      }

      .to-do-drawer.dark-mode .item-description {
        background: var(--color-bg-secondary, #1e1e1e);
        border-left-color: var(--color-border, #444);
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .item-description-header {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .btn-expand {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .btn-expand:hover {
        color: var(--color-text-primary, #e0e0e0);
      }

      .to-do-drawer.dark-mode .btn-expand-compact {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .btn-expand-compact:hover {
        color: var(--color-text-primary, #e0e0e0);
      }

      .to-do-drawer.dark-mode .desc-label {
        color: var(--color-text-secondary, #999);
      }

      .to-do-drawer.dark-mode .badge.specific-target-type {
        background: #0f3a47;
        color: #5ba8c7;
      }

      .to-do-drawer.dark-mode .item-target {
        color: var(--color-text-secondary, #666);
      }
    `,
  ],
})
export class ToDoListDrawerComponent implements OnInit, OnDestroy {
  @Output() editDialog = new EventEmitter<any>();

  filteredEntries$!: Observable<IToDoEntry[]>;
  allStatuses = ALL_STATUSES;
  allPriorities = ALL_PRIORITIES;
  isDarkMode = false;

  selectedTargetType: TargetType | 'All' = 'All';
  selectedStatus: ToDoStatus | '' = '';
  selectedEntries = new Set<string>();
  expandedDescriptions = new Set<string>();

  // Dialog state
  showEditDialog = false;
  editingEntry: IToDoEntry | null = null;
  showDeleteConfirmation = false;
  teamPlayers: string[] = [
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
    'Player 5',
    'Player 6',
    'Player 7',
    'Player 8',
    'Player 9',
    'Player 10',
    'Player 11',
  ];
  teamGroups: string[] = ['Starters', 'Substitutes', 'Reserves'];

  private destroy$ = new Subject<void>();
  private entries: IToDoEntry[] = [];

  constructor(private toDoService: ToDoService, private store: Store) {}

  ngOnInit(): void {
    this.toDoService.entries$
      .pipe(takeUntil(this.destroy$))
      .subscribe((entries) => {
        this.entries = entries;
        this.applyFilters();
      });

    this.store
      .select(SketchState.getIsDarkMode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDarkMode) => {
        this.isDarkMode = isDarkMode;
      });

    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.entries];

    // Filter by target type
    if (this.selectedTargetType !== 'All') {
      filtered = this.toDoService.filterByTargetType(
        filtered,
        this.selectedTargetType
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = this.toDoService.filterByStatus(filtered, this.selectedStatus);
    }

    // Sort: pinned first, then by updated date
    filtered = this.toDoService.sortByPinned(filtered);
    filtered = this.toDoService.sortByUpdated(filtered);

    this.filteredEntries$ = new Observable((subscriber) => {
      subscriber.next(filtered);
      subscriber.complete();
    });
  }

  toggleSelection(id: string): void {
    if (this.selectedEntries.has(id)) {
      this.selectedEntries.delete(id);
    } else {
      this.selectedEntries.add(id);
    }
  }

  togglePin(entry: IToDoEntry): void {
    this.toDoService.update({ ...entry, pinned: !entry.pinned });
  }

  toggleDescription(entryId: string): void {
    if (this.expandedDescriptions.has(entryId)) {
      this.expandedDescriptions.delete(entryId);
    } else {
      this.expandedDescriptions.add(entryId);
    }
  }

  editEntry(entry: IToDoEntry): void {
    this.editDialog.emit({
      entry: { ...entry },
      teamPlayers: [
        'Player 1',
        'Player 2',
        'Player 3',
        'Player 4',
        'Player 5',
        'Player 6',
        'Player 7',
        'Player 8',
        'Player 9',
        'Player 10',
        'Player 11',
      ],
      teamGroups: ['Starters', 'Substitutes', 'Reserves'],
    });
  }

  addNewEntry(): void {
    const now = Date.now();
    this.editDialog.emit({
      entry: {
        id: '',
        title: '',
        description: '',
        status: 'Open',
        priority: 'medium',
        targetType: 'Development',
        specificTargetType: 'Feature Request',
        target: '',
        createdAt: now,
        updatedAt: now,
        pinned: false,
      },
      teamPlayers: [
        'Player 1',
        'Player 2',
        'Player 3',
        'Player 4',
        'Player 5',
        'Player 6',
        'Player 7',
        'Player 8',
        'Player 9',
        'Player 10',
        'Player 11',
      ],
      teamGroups: ['Starters', 'Substitutes', 'Reserves'],
    });
  }

  closeEditDialog(): void {
    // No longer needed - handled by parent
  }

  saveEntry(entry: IToDoEntry): void {
    if (entry.toDoID) {
      this.toDoService.update(entry);
    } else {
      this.toDoService.create(
        entry.title,
        entry.description,
        entry.status,
        entry.priority,
        entry.targetType,
        entry.specificTargetType,
        entry.target
      );
    }
    this.applyFilters();
  }

  bulkUpdateStatus(status: ToDoStatus): void {
    const ids = Array.from(this.selectedEntries);
    this.toDoService.updateStatusBatch(ids, status, this.entries);
    this.selectedEntries.clear();
    this.applyFilters();
  }

  bulkTogglePin(): void {
    const ids = Array.from(this.selectedEntries);
    this.toDoService.togglePinBatch(ids, this.entries);
    this.selectedEntries.clear();
    this.applyFilters();
  }

  bulkDelete(): void {
    this.showDeleteConfirmation = true;
  }

  onDeleteConfirmed(confirmed: boolean): void {
    this.showDeleteConfirmation = false;

    if (confirmed) {
      const ids = Array.from(this.selectedEntries);
      this.toDoService.deleteBatch(ids);
      this.selectedEntries.clear();
      this.applyFilters();
    }
  }
}
