import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IToDoEntry,
  IToDoComment,
  ToDoStatus,
  ToDoPriority,
  TargetType,
  SpecificTargetType,
  TARGET_TYPES_BY_CATEGORY,
  ALL_PRIORITIES,
} from '../../../interfaces/to-do/to-do.interface';
import {
  ToDoState,
  UpdateToDoEntry,
  DeleteToDoEntry,
  AddToDoEntry,
} from '../../../state/to-do/to-do.state';

interface KaizenColumn {
  title: string;
  key: string;
  statuses: ToDoStatus[];
  items: IToDoEntry[];
}

interface DropDialogData {
  item: IToDoEntry;
  sourceColumn: KaizenColumn;
  targetColumn: KaizenColumn;
}

@Component({
  selector: 'app-kaizen-board-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kaizen-board-component.html',
  styleUrl: './kaizen-board-component.scss',
})
export class KaizenBoardComponent implements OnInit, OnDestroy {
  columns: KaizenColumn[] = [];
  toDoItems: IToDoEntry[] = [];
  private destroy$ = new Subject<void>();

  // Drop dialog state
  showDropDialog = false;
  dropDialogData: DropDialogData | null = null;
  selectedTargetStatus: ToDoStatus | null = null;
  commentText = '';

  // Create dialog state
  showCreateDialog = false;
  newToDoForm = {
    title: '',
    description: '',
    priority: 'medium' as ToDoPriority,
    targetType: 'Development' as TargetType,
    specificTargetType: 'Feature Request' as SpecificTargetType,
    target: '',
  };

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadToDoItems();
    this.startCleanupInterval();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startCleanupInterval(): void {
    // Check every hour for items that have been deleted for 14+ days
    setInterval(() => {
      this.cleanupExpiredDeletedItems();
    }, 60 * 60 * 1000); // 1 hour
  }

  private cleanupExpiredDeletedItems(): void {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find items that have been deleted for more than 14 days
    const expiredItems = this.toDoItems.filter(
      (item) =>
        item.status === 'Closed - Deleted' &&
        item.deletedAt &&
        new Date(item.deletedAt) < fourteenDaysAgo
    );

    // Permanently delete expired items
    expiredItems.forEach((item) => {
      this.store.dispatch(new DeleteToDoEntry(item.toDoID));
    });
  }

  private initializeColumns(): void {
    this.columns = [
      {
        title: 'Ideas/Opportunities',
        key: 'ideas',
        statuses: [
          'Open',
          'On Hold - Needs Refinement',
          'On Hold - Needs Elaboration',
          'On Hold - Evaluation/Qualification',
        ],
        items: [],
      },
      {
        title: 'Active',
        key: 'active',
        statuses: ['Ready', 'Active / In-Process', 'Pinned'],
        items: [],
      },
      {
        title: 'On Hold',
        key: 'onhold',
        statuses: ['On Hold', 'Suspended'],
        items: [],
      },
      {
        title: 'Q/A',
        key: 'qa',
        statuses: ['In Q/A'],
        items: [],
      },
      {
        title: 'Complete',
        key: 'complete',
        statuses: ['Closed - Complete', 'Closed - Incomplete'],
        items: [],
      },
    ];
  }

  private loadToDoItems(): void {
    this.store
      .select(ToDoState.getEntries)
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.toDoItems = items;
        this.groupItemsByColumn();
      });
  }

  private groupItemsByColumn(): void {
    // Reset all column items
    this.columns.forEach((col) => (col.items = []));

    // Group items by column, excluding deleted items from other columns
    this.toDoItems.forEach((item) => {
      // Skip permanently deleted items or items in Closed - Deleted status
      if (item.status === 'Closed - Deleted') {
        return; // Don't show deleted items in regular columns
      }

      const column = this.columns.find((col) =>
        col.statuses.includes(item.status)
      );
      if (column) {
        column.items.push(item);
      }
    });
  }

  onDragStart(
    event: DragEvent,
    item: IToDoEntry,
    sourceColumn: KaizenColumn
  ): void {
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('application/json', JSON.stringify(item));
    (event.target as HTMLElement).classList.add('dragging');
  }

  onDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).classList.remove('dragging');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, targetColumn: KaizenColumn): void {
    event.preventDefault();
    event.stopPropagation();

    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    const item: IToDoEntry = JSON.parse(data);
    const sourceColumn = this.columns.find((col) =>
      col.statuses.includes(item.status)
    );

    if (!sourceColumn) return;

    // Handle same-column reordering (sorting within the column)
    if (sourceColumn.key === targetColumn.key) {
      this.handleSameColumnDrop(item, sourceColumn, event);
      return;
    }

    // Show drop dialog to select target status and add comment
    this.dropDialogData = {
      item,
      sourceColumn,
      targetColumn,
    };
    this.selectedTargetStatus = targetColumn.statuses[0]; // Default to first status in target column
    this.commentText = '';
    this.showDropDialog = true;
  }

  confirmDrop(): void {
    if (!this.dropDialogData || !this.selectedTargetStatus) return;

    // Deep copy the item with a new comments array to avoid mutating the original
    const updatedItem: IToDoEntry = {
      ...this.dropDialogData.item,
      comments: this.dropDialogData.item.comments
        ? [...this.dropDialogData.item.comments]
        : [],
    };
    updatedItem.status = this.selectedTargetStatus;

    // Add comment if provided
    if (this.commentText.trim()) {
      const comment: IToDoComment = {
        commentID: this.generateUniqueId(),
        text: this.commentText.trim(),
        createdUTC: new Date().toISOString(),
        userId: 'current-user', // TODO: Get actual current user ID
      };
      updatedItem.comments.push(comment);
    }

    updatedItem.lastUpdatedUTC = new Date().toISOString();

    // Dispatch update action
    this.store.dispatch(new UpdateToDoEntry(updatedItem));

    // Close dialog
    this.closedropDialog();
  }

  closedropDialog(): void {
    this.showDropDialog = false;
    this.dropDialogData = null;
    this.selectedTargetStatus = null;
    this.commentText = '';
  }

  private handleSameColumnDrop(
    draggedItem: IToDoEntry,
    column: KaizenColumn,
    event: DragEvent
  ): void {
    // Find the dragged item's current index
    const draggedIndex = column.items.findIndex(
      (item) => item.toDoID === draggedItem.toDoID
    );

    if (draggedIndex === -1) return;

    // Calculate the drop target index based on the mouse Y position
    const columnContent = event.currentTarget as HTMLElement;
    const allCards = Array.from(columnContent.querySelectorAll('.to-do-card'));
    const draggedCard = allCards[draggedIndex] as HTMLElement;

    let targetIndex = draggedIndex;
    const draggedRect = draggedCard.getBoundingClientRect();
    const draggedCenterY = draggedRect.top + draggedRect.height / 2;

    // Find the card under the drop position
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i] as HTMLElement;
      const cardRect = card.getBoundingClientRect();
      const cardCenterY = cardRect.top + cardRect.height / 2;

      // If we're dropping above this card, set targetIndex to this card's index
      if (event.clientY < cardCenterY && i < column.items.length) {
        targetIndex = i;
        break;
      } else if (i === allCards.length - 1) {
        // Dropped at the end
        targetIndex = column.items.length - 1;
      }
    }

    // Only reorder if position changed
    if (targetIndex !== draggedIndex) {
      // Remove item from old position
      const [removed] = column.items.splice(draggedIndex, 1);

      // Insert at new position
      column.items.splice(targetIndex, 0, removed);

      // Update sortOrder to persist the new order
      column.items.forEach((item, index) => {
        const updatedItem = { ...item };
        updatedItem.sortOrder = index;
        updatedItem.lastUpdatedUTC = new Date().toISOString();
        this.store.dispatch(new UpdateToDoEntry(updatedItem));
      });
    }
  }

  onDropTrash(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    const item: IToDoEntry = JSON.parse(data);

    // Soft delete: set status to 'Closed - Deleted' and add deletedAt timestamp
    const deletedItem: IToDoEntry = {
      ...item,
      comments: item.comments ? [...item.comments] : [],
      status: 'Closed - Deleted',
      deletedAt: new Date().toISOString(),
      lastUpdatedUTC: new Date().toISOString(),
    };

    // Dispatch update action instead of delete
    this.store.dispatch(new UpdateToDoEntry(deletedItem));
  }

  onTrashClick(): void {
    this.router.navigate(['/todo/recycle-bin']);
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getTargetStatusOptions(): ToDoStatus[] {
    return this.dropDialogData?.targetColumn.statuses || [];
  }

  openCreateDialog(): void {
    this.newToDoForm = {
      title: '',
      description: '',
      priority: 'medium',
      targetType: 'Development',
      specificTargetType: 'Feature Request',
      target: '',
    };
    this.showCreateDialog = true;
  }

  closeCreateDialog(): void {
    this.showCreateDialog = false;
  }

  getAvailableSpecificTargets(): SpecificTargetType[] {
    return TARGET_TYPES_BY_CATEGORY[this.newToDoForm.targetType] || [];
  }

  createToDoItem(): void {
    if (!this.newToDoForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const newItem: IToDoEntry = {
      toDoID: this.generateUniqueId(),
      userId: 'current-user',
      title: this.newToDoForm.title.trim(),
      description: this.newToDoForm.description.trim(),
      status: 'Open',
      priority: this.newToDoForm.priority,
      targetType: this.newToDoForm.targetType,
      specificTargetType: this.newToDoForm.specificTargetType,
      target: this.newToDoForm.target.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdUTC: new Date().toISOString(),
      lastUpdatedUTC: new Date().toISOString(),
      comments: [],
      ownershipContext: {
        contextType: 'USER',
        contextId: 1, // TODO: Get actual current user ID
      },
    };

    this.store.dispatch(new AddToDoEntry(newItem));
    this.closeCreateDialog();
  }

  getAllPriorities(): ToDoPriority[] {
    return ALL_PRIORITIES;
  }
}
