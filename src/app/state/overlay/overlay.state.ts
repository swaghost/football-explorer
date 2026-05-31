/**
 * Overlay NGXS State
 * Manages overlay sets and items for the visualization
 */

import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { IOverlayState, IOverlaySet, IOverlayItem } from '../../interfaces/overlay/overlay.interface';
import { OverlayActions } from './overlay.actions';
import { v4 as uuid } from 'uuid';

const initialState: IOverlayState = {
  sets: [],
  selectedSetId: null,
};

@State<IOverlayState>({
  name: 'overlay',
  defaults: initialState,
})
@Injectable()
export class OverlayState {
  @Selector()
  static getOverlaySets(state: IOverlayState): IOverlaySet[] {
    return state.sets;
  }

  @Selector()
  static getSelectedSetId(state: IOverlayState): string | null {
    return state.selectedSetId;
  }

  @Selector()
  static getSelectedSet(state: IOverlayState): IOverlaySet | null {
    if (!state.selectedSetId) return null;
    return state.sets.find((set) => set.id === state.selectedSetId) || null;
  }

  @Selector()
  static getSelectedSetItems(state: IOverlayState): IOverlayItem[] {
    if (!state.selectedSetId) return [];
    const set = state.sets.find((s) => s.id === state.selectedSetId);
    return set?.items || [];
  }

  @Action(OverlayActions.CreateOverlaySet)
  createOverlaySet(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.CreateOverlaySet
  ): void {
    const state = ctx.getState();
    const newSet: IOverlaySet = {
      id: uuid(),
      name: action.payload.name,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    ctx.setState({
      ...state,
      sets: [...state.sets, newSet],
      selectedSetId: newSet.id,
    });
  }

  @Action(OverlayActions.DeleteOverlaySet)
  deleteOverlaySet(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.DeleteOverlaySet
  ): void {
    const state = ctx.getState();
    const updatedSets = state.sets.filter((s) => s.id !== action.payload.setId);
    const newSelectedSetId =
      state.selectedSetId === action.payload.setId
        ? updatedSets.length > 0
          ? updatedSets[0].id
          : null
        : state.selectedSetId;

    ctx.setState({
      ...state,
      sets: updatedSets,
      selectedSetId: newSelectedSetId,
    });
  }

  @Action(OverlayActions.SelectOverlaySet)
  selectOverlaySet(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.SelectOverlaySet
  ): void {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      selectedSetId: action.payload.setId,
    });
  }

  @Action(OverlayActions.AddOverlayItem)
  addOverlayItem(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.AddOverlayItem
  ): void {
    const state = ctx.getState();
    const updatedSets = state.sets.map((set) => {
      if (set.id === action.payload.setId) {
        const newItem: IOverlayItem = {
          id: uuid(),
          element: action.payload.element as any,
          location: action.payload.location as any,
          createdAt: Date.now(),
        };
        return {
          ...set,
          items: [...set.items, newItem],
          updatedAt: Date.now(),
        };
      }
      return set;
    });

    ctx.setState({
      ...state,
      sets: updatedSets,
    });
  }

  @Action(OverlayActions.RemoveOverlayItem)
  removeOverlayItem(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.RemoveOverlayItem
  ): void {
    const state = ctx.getState();
    const updatedSets = state.sets.map((set) => {
      if (set.id === action.payload.setId) {
        return {
          ...set,
          items: set.items.filter((item) => item.id !== action.payload.itemId),
          updatedAt: Date.now(),
        };
      }
      return set;
    });

    ctx.setState({
      ...state,
      sets: updatedSets,
    });
  }

  @Action(OverlayActions.ClearOverlaySet)
  clearOverlaySet(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.ClearOverlaySet
  ): void {
    const state = ctx.getState();
    const updatedSets = state.sets.map((set) => {
      if (set.id === action.payload.setId) {
        return {
          ...set,
          items: [],
          updatedAt: Date.now(),
        };
      }
      return set;
    });

    ctx.setState({
      ...state,
      sets: updatedSets,
    });
  }

  @Action(OverlayActions.LoadOverlaySets)
  loadOverlaySets(
    ctx: StateContext<IOverlayState>,
    action: OverlayActions.LoadOverlaySets
  ): void {
    ctx.setState({
      sets: action.payload.sets,
      selectedSetId: action.payload.sets.length > 0 ? action.payload.sets[0].id : null,
    });
  }
}
