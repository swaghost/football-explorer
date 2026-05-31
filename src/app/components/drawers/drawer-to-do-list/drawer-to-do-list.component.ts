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
} from '../../../interfaces/to-do/to-do.interface';
import { ToDoService } from '../../../services/to-do/to-do.service';
import { SketchState } from '../../../state';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-drawer-to-do-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  templateUrl: './drawer-to-do-list.component.html',
  styleUrl: './drawer-to-do-list.component.scss',
})
export class DrawerToDoListComponent implements OnInit, OnDestroy {
  @Output() editDialog = new EventEmitter<any>();

  filteredEntries$!: Observable<IToDoEntry[]>;
  allStatuses = ALL_STATUSES;
  allPriorities = ALL_PRIORITIES;
  isDarkMode = false;

  selectedTargetType: TargetType | 'All' = 'All';
  selectedStatus: ToDoStatus | '' = '';
  selectedEntries = new Set<string>();
  expandedDescriptions = new Set<string>();
  expandedChildren = new Set<string>(); // Track which entries have expanded children

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

    // Only include top-level entries (no parent) - don't include children here
    filtered = filtered.filter((entry) => !entry.parentToDoID);

    // Sort: pinned first, then by updated date
    filtered = this.toDoService.sortByPinned(filtered);
    filtered = this.toDoService.sortByUpdated(filtered);

    this.filteredEntries$ = new Observable((subscriber) => {
      subscriber.next(filtered);
      subscriber.complete();
    });
  }

  toggleSelection(toDoID: string): void {
    if (this.selectedEntries.has(toDoID)) {
      this.selectedEntries.delete(toDoID);
    } else {
      this.selectedEntries.add(toDoID);
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

  toggleChildren(entryId: string): void {
    if (this.expandedChildren.has(entryId)) {
      this.expandedChildren.delete(entryId);
    } else {
      this.expandedChildren.add(entryId);
    }
  }

  toggleExpanded(entryId: string): void {
    // Toggle both description and children together
    const isCurrentlyExpanded =
      this.expandedDescriptions.has(entryId) ||
      this.expandedChildren.has(entryId);
    if (isCurrentlyExpanded) {
      this.expandedDescriptions.delete(entryId);
      this.expandedChildren.delete(entryId);
    } else {
      this.expandedDescriptions.add(entryId);
      this.expandedChildren.add(entryId);
    }
  }

  getChildrenOfEntry(parentToDoID: string): IToDoEntry[] {
    // Return only children that match the current filter settings
    let children = this.entries.filter(
      (entry) => entry.parentToDoID === parentToDoID
    );

    // Apply the same filters as parent entries
    if (this.selectedTargetType !== 'All') {
      children = this.toDoService.filterByTargetType(
        children,
        this.selectedTargetType
      );
    }

    if (this.selectedStatus) {
      children = this.toDoService.filterByStatus(children, this.selectedStatus);
    }

    return children;
  }

  hasChildren(entryId: string): boolean {
    return this.entries.some((entry) => entry.parentToDoID === entryId);
  }

  editEntry(entry: IToDoEntry): void {
    console.log('✏️ Edit button clicked for entry:', entry.toDoID, entry.title);
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
    const nowUTC = new Date(now).toISOString();
    this.editDialog.emit({
      entry: {
        toDoID: '',
        userId: '',
        title: '',
        description: '',
        status: 'Open',
        priority: 'medium',
        targetType: 'Development',
        specificTargetType: 'Feature Request',
        target: '',
        createdAt: now,
        updatedAt: now,
        createdUTC: nowUTC,
        lastUpdatedUTC: nowUTC,
        pinned: false,
        parentToDoID: null,
        ownershipContext: {
          contextType: 'USER',
          contextId: 0,
        },
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

  addChildToEntry(parentEntry: IToDoEntry): void {
    const now = Date.now();
    const nowUTC = new Date(now).toISOString();
    this.editDialog.emit({
      entry: {
        toDoID: '',
        userId: '',
        title: '',
        description: '',
        status: 'Open',
        priority: 'medium',
        targetType: parentEntry.targetType,
        specificTargetType: parentEntry.specificTargetType,
        target: parentEntry.target,
        createdAt: now,
        updatedAt: now,
        createdUTC: nowUTC,
        lastUpdatedUTC: nowUTC,
        pinned: false,
        parentToDoID: parentEntry.toDoID, // Set parent ID
        ownershipContext: {
          contextType: 'USER',
          contextId: 0,
        },
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
    // Automatically expand the children section
    this.expandedChildren.add(parentEntry.toDoID);
  }

  closeEditDialog(): void {
    // No longer needed - handled by parent
  }

  saveEntry(entry: IToDoEntry): void {
    if (entry.toDoID) {
      this.toDoService.update(entry);
    } else {
      // Create new entry - pass full entry object so all fields are preserved
      this.toDoService.create(entry);
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

  exportToJSON(): void {
    // Get current timestamp in format YYYYMMDD.HHMMSS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}.${hours}${minutes}${seconds}`;
    const filename = `todo.${timestamp}.json`;

    // Create the JSON content with all entries
    const jsonContent = JSON.stringify(this.entries, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  importJSON(importedEntries: IToDoEntry[]): void {
    // Filter out entries that already exist (same userId and toDoID)
    const entriesToImport = importedEntries.filter((importedEntry) => {
      return !this.entries.some(
        (existingEntry) =>
          existingEntry.toDoID === importedEntry.toDoID &&
          existingEntry.userId === importedEntry.userId
      );
    });

    if (entriesToImport.length === 0) {
      alert('No new items to import. All items already exist.');
      return;
    }

    // Import the entries that don't already exist
    entriesToImport.forEach((entry) => {
      this.toDoService.create(entry);
    });

    this.applyFilters();
    alert(`Successfully imported ${entriesToImport.length} new item(s).`);
  }
}
