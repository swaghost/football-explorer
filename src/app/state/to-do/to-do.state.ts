import { Injectable } from '@angular/core';
import { Action, State, StateContext, Selector } from '@ngxs/store';
import { IToDoEntry } from '../../interfaces/to-do/to-do.interface';

// Actions
export class AddToDoEntry {
  static readonly type = '[To-Do] Add Entry';
  constructor(public payload: IToDoEntry) {}
}

export class UpdateToDoEntry {
  static readonly type = '[To-Do] Update Entry';
  constructor(public payload: IToDoEntry) {}
}

export class DeleteToDoEntry {
  static readonly type = '[To-Do] Delete Entry';
  constructor(public toDoID: string) {}
}

export class LoadToDoState {
  static readonly type = '[To-Do] Load State';
  constructor(public payload: IToDoEntry[]) {}
}

export class ClearAllToDos {
  static readonly type = '[To-Do] Clear All';
}

// State Interface
export interface ToDoStateModel {
  entries: IToDoEntry[];
}

@State<ToDoStateModel>({
  name: 'toDo',
  defaults: {
    entries: [],
  },
})
@Injectable()
export class ToDoState {
  @Selector()
  static getEntries(state: ToDoStateModel): IToDoEntry[] {
    return state.entries;
  }

  @Action(AddToDoEntry)
  addEntry(ctx: StateContext<ToDoStateModel>, action: AddToDoEntry): void {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      entries: [...state.entries, action.payload],
    });
  }

  @Action(UpdateToDoEntry)
  updateEntry(
    ctx: StateContext<ToDoStateModel>,
    action: UpdateToDoEntry
  ): void {
    const state = ctx.getState();
    const entries = state.entries.map((entry) =>
      entry.toDoID === action.payload.toDoID ? action.payload : entry
    );
    ctx.setState({ ...state, entries });
  }

  @Action(DeleteToDoEntry)
  deleteEntry(
    ctx: StateContext<ToDoStateModel>,
    action: DeleteToDoEntry
  ): void {
    const state = ctx.getState();
    const entries = state.entries.filter(
      (entry) => entry.toDoID !== action.toDoID
    );
    ctx.setState({ ...state, entries });
  }

  @Action(LoadToDoState)
  loadState(ctx: StateContext<ToDoStateModel>, action: LoadToDoState): void {
    ctx.setState({ entries: action.payload });
  }

  @Action(ClearAllToDos)
  clearAll(ctx: StateContext<ToDoStateModel>): void {
    ctx.setState({ entries: [] });
  }
}
