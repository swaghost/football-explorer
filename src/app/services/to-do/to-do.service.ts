import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  IToDoEntry,
  ToDoStatus,
  TargetType,
  SpecificTargetType,
  ToDoPriority,
} from '../../interfaces/to-do/to-do.interface';
import {
  AddToDoEntry,
  UpdateToDoEntry,
  DeleteToDoEntry,
  ClearAllToDos,
  ToDoState,
} from '../../state/to-do/to-do.state';
import { GlobalContextState } from '../../state/user-context.state';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ToDoService {
  constructor(private store: Store) {}

  // Selectors
  get entries$(): Observable<IToDoEntry[]> {
    return this.store.select(ToDoState.getEntries);
  }

  getEntryById$(toDoID: string): Observable<IToDoEntry | undefined> {
    return this.store.select((state) =>
      state.toDo?.entries?.find((e) => e.toDoID === toDoID)
    );
  }

  // CRUD Operations
  create(
    titleOrEntry: string | IToDoEntry,
    description?: string,
    status?: ToDoStatus,
    priority?: ToDoPriority,
    targetType?: TargetType,
    specificTargetType?: SpecificTargetType,
    target?: string
  ): void {
    let entry: IToDoEntry;

    // Check if first argument is a full entry object (for imports)
    if (typeof titleOrEntry === 'object' && titleOrEntry !== null) {
      entry = titleOrEntry as IToDoEntry;
      // Ensure toDoID is set (generate one if missing or empty)
      if (!entry.toDoID || entry.toDoID.trim() === '') {
        entry.toDoID = uuidv4();
      }
      // Ensure UTC timestamps are set for imported entries
      if (!entry.createdUTC) {
        entry.createdUTC = new Date(
          entry.createdAt || Date.now()
        ).toISOString();
      }
      if (!entry.lastUpdatedUTC) {
        entry.lastUpdatedUTC = new Date(
          entry.updatedAt || Date.now()
        ).toISOString();
      }
      // Ensure userId is set
      if (!entry.userId) {
        const currentUser = this.store.selectSnapshot(
          GlobalContextState.selectedContextUser
        );
        entry.userId = currentUser?.UserId?.toString() || 'unknown';
      }
    } else {
      // Original parameter-based create for new entries
      const now = Date.now();
      const currentUser = this.store.selectSnapshot(
        GlobalContextState.selectedContextUser
      );
      const userId = currentUser?.UserId?.toString() || 'unknown';
      const nowUTC = new Date(now).toISOString();

      entry = {
        toDoID: uuidv4(),
        userId,
        title: titleOrEntry as string,
        description: description || '',
        status: status || 'Open',
        priority: priority || 'medium',
        targetType: targetType || 'Development',
        specificTargetType: specificTargetType || 'Feature Request',
        target: target || '',
        createdAt: now,
        updatedAt: now,
        createdUTC: nowUTC,
        lastUpdatedUTC: nowUTC,
        pinned: false,
        ownershipContext: {
          contextType: 'USER',
          contextId: parseInt(userId) || 0,
        },
      };
    }

    this.store.dispatch(new AddToDoEntry(entry));
  }

  update(entry: IToDoEntry): void {
    const now = Date.now();
    const updated: IToDoEntry = {
      ...entry,
      updatedAt: now,
      lastUpdatedUTC: new Date(now).toISOString(),
    };
    this.store.dispatch(new UpdateToDoEntry(updated));
  }

  delete(toDoID: string): void {
    this.store.dispatch(new DeleteToDoEntry(toDoID));
  }

  clearAll(): void {
    this.store.dispatch(new ClearAllToDos());
  }

  // Bulk operations
  updateStatusBatch(
    ids: string[],
    status: ToDoStatus,
    entries: IToDoEntry[]
  ): void {
    ids.forEach((id) => {
      const entry = entries.find((e) => e.toDoID === id);
      if (entry) {
        this.update({ ...entry, status });
      }
    });
  }

  updatePriorityBatch(
    ids: string[],
    priority: ToDoPriority,
    entries: IToDoEntry[]
  ): void {
    ids.forEach((id) => {
      const entry = entries.find((e) => e.toDoID === id);
      if (entry) {
        this.update({ ...entry, priority });
      }
    });
  }

  togglePinBatch(ids: string[], entries: IToDoEntry[]): void {
    ids.forEach((id) => {
      const entry = entries.find((e) => e.toDoID === id);
      if (entry) {
        this.update({ ...entry, pinned: !entry.pinned });
      }
    });
  }

  deleteBatch(ids: string[]): void {
    ids.forEach((id) => this.delete(id));
  }

  // Filter helpers (for component use)
  filterByStatus(entries: IToDoEntry[], status: ToDoStatus): IToDoEntry[] {
    return entries.filter((e) => e.status === status);
  }

  filterByTargetType(
    entries: IToDoEntry[],
    targetType: TargetType | 'All'
  ): IToDoEntry[] {
    if (targetType === 'All') return entries;
    return entries.filter((e) => e.targetType === targetType);
  }

  filterByPriority(
    entries: IToDoEntry[],
    priority: ToDoPriority
  ): IToDoEntry[] {
    return entries.filter((e) => e.priority === priority);
  }

  // Sort helpers
  sortByPinned(entries: IToDoEntry[]): IToDoEntry[] {
    return [...entries].sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });
  }

  sortByUpdated(entries: IToDoEntry[], descending = true): IToDoEntry[] {
    return [...entries].sort((a, b) => {
      const diff = b.updatedAt - a.updatedAt;
      return descending ? diff : -diff;
    });
  }

  sortByCreated(entries: IToDoEntry[], descending = true): IToDoEntry[] {
    return [...entries].sort((a, b) => {
      const diff = b.createdAt - a.createdAt;
      return descending ? diff : -diff;
    });
  }
}
