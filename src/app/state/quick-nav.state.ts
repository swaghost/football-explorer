import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

// State Model
export interface QuickNavStateModel {
  defaultLevelExpansion: number;
  treeExpansionState: Record<string, boolean>;
  lastTreeNodeCount: number;
}

// Actions
export class SetDefaultLevelExpansion {
  static readonly type = '[QuickNav] Set Default Level Expansion';
  constructor(public level: number) {}
}

export class SetTreeExpansionState {
  static readonly type = '[QuickNav] Set Tree Expansion State';
  constructor(public expansionState: Record<string, boolean>) {}
}

export class UpdateNodeExpansion {
  static readonly type = '[QuickNav] Update Node Expansion';
  constructor(public nodeId: string, public isExpanded: boolean) {}
}

export class ResetTreeExpansionState {
  static readonly type = '[QuickNav] Reset Tree Expansion State';
  constructor(public nodeCount: number) {}
}

export class UpdateTreeNodeCount {
  static readonly type = '[QuickNav] Update Tree Node Count';
  constructor(public nodeCount: number) {}
}

// State
@State<QuickNavStateModel>({
  name: 'quickNav',
  defaults: {
    defaultLevelExpansion: 2,
    treeExpansionState: {},
    lastTreeNodeCount: 0,
  },
})
@Injectable()
export class QuickNavState {
  @Selector()
  static defaultLevelExpansion(state: QuickNavStateModel): number {
    return state.defaultLevelExpansion;
  }

  @Selector()
  static treeExpansionState(
    state: QuickNavStateModel
  ): Record<string, boolean> {
    return state.treeExpansionState;
  }

  @Selector()
  static lastTreeNodeCount(state: QuickNavStateModel): number {
    return state.lastTreeNodeCount;
  }

  @Action(SetDefaultLevelExpansion)
  setDefaultLevelExpansion(
    ctx: StateContext<QuickNavStateModel>,
    action: SetDefaultLevelExpansion
  ) {
    ctx.patchState({
      defaultLevelExpansion: Math.max(0, Math.min(10, action.level)), // Clamp between 0-10
    });
  }

  @Action(SetTreeExpansionState)
  setTreeExpansionState(
    ctx: StateContext<QuickNavStateModel>,
    action: SetTreeExpansionState
  ) {
    ctx.patchState({
      treeExpansionState: { ...action.expansionState },
    });
  }

  @Action(UpdateNodeExpansion)
  updateNodeExpansion(
    ctx: StateContext<QuickNavStateModel>,
    action: UpdateNodeExpansion
  ) {
    const state = ctx.getState();
    ctx.patchState({
      treeExpansionState: {
        ...state.treeExpansionState,
        [action.nodeId]: action.isExpanded,
      },
    });
  }

  @Action(ResetTreeExpansionState)
  resetTreeExpansionState(
    ctx: StateContext<QuickNavStateModel>,
    action: ResetTreeExpansionState
  ) {
    ctx.patchState({
      treeExpansionState: {},
      lastTreeNodeCount: action.nodeCount,
    });
  }

  @Action(UpdateTreeNodeCount)
  updateTreeNodeCount(
    ctx: StateContext<QuickNavStateModel>,
    action: UpdateTreeNodeCount
  ) {
    ctx.patchState({
      lastTreeNodeCount: action.nodeCount,
    });
  }
}
