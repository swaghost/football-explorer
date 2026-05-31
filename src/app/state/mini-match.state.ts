import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { patch, append, removeItem, updateItem } from '@ngxs/store/operators';
import { MiniMatchStateModel, initialMiniMatchState } from './mini-match.model';
import {
  SaveCustomFormationPreset,
  UpdateCustomFormationPreset,
  DeleteCustomFormationPreset,
  ClearCustomFormationPresets,
  ImportCustomFormationPresets,
  SaveSequence,
  UpdateSequence,
  DeleteSequence,
  ClearSequences,
  ImportSequences,
} from './mini-match.actions';
import {
  IMiniFormationPreset,
  IMiniMatchAnimationSequence,
} from '../interfaces/mini-match';

@State<MiniMatchStateModel>({
  name: 'miniMatch',
  defaults: initialMiniMatchState,
})
@Injectable()
export class MiniMatchState {
  // Selectors for Formation Presets
  @Selector()
  static getCustomFormationPresets(
    state: MiniMatchStateModel
  ): IMiniFormationPreset[] {
    return state.customFormationPresets;
  }

  @Selector()
  static getFormationPresetCount(state: MiniMatchStateModel): number {
    return state.customFormationPresets.length;
  }

  // Selectors for Sequences
  @Selector()
  static getSavedSequences(
    state: MiniMatchStateModel
  ): IMiniMatchAnimationSequence[] {
    return state.savedSequences;
  }

  @Selector()
  static getSequenceCount(state: MiniMatchStateModel): number {
    return state.savedSequences.length;
  }

  // Formation Preset Actions
  @Action(SaveCustomFormationPreset)
  saveCustomFormationPreset(
    ctx: StateContext<MiniMatchStateModel>,
    action: SaveCustomFormationPreset
  ): void {
    ctx.patchState({
      customFormationPresets: [
        ...ctx.getState().customFormationPresets,
        action.payload,
      ],
    });
  }

  @Action(UpdateCustomFormationPreset)
  updateCustomFormationPreset(
    ctx: StateContext<MiniMatchStateModel>,
    action: UpdateCustomFormationPreset
  ): void {
    ctx.patchState({
      customFormationPresets: [
        ...ctx.getState().customFormationPresets.slice(0, action.payload.index),
        action.payload.preset,
        ...ctx
          .getState()
          .customFormationPresets.slice(action.payload.index + 1),
      ],
    });
  }

  @Action(DeleteCustomFormationPreset)
  deleteCustomFormationPreset(
    ctx: StateContext<MiniMatchStateModel>,
    action: DeleteCustomFormationPreset
  ): void {
    ctx.patchState({
      customFormationPresets: ctx
        .getState()
        .customFormationPresets.filter((_, i) => i !== action.payload.index),
    });
  }

  @Action(ClearCustomFormationPresets)
  clearCustomFormationPresets(ctx: StateContext<MiniMatchStateModel>): void {
    ctx.patchState({
      customFormationPresets: [],
    });
  }

  @Action(ImportCustomFormationPresets)
  importCustomFormationPresets(
    ctx: StateContext<MiniMatchStateModel>,
    action: ImportCustomFormationPresets
  ): void {
    ctx.patchState({
      customFormationPresets: [
        ...ctx.getState().customFormationPresets,
        ...action.payload,
      ],
    });
  }

  // Sequence Actions
  @Action(SaveSequence)
  saveSequence(
    ctx: StateContext<MiniMatchStateModel>,
    action: SaveSequence
  ): void {
    ctx.patchState({
      savedSequences: [...ctx.getState().savedSequences, action.payload],
    });
  }

  @Action(UpdateSequence)
  updateSequence(
    ctx: StateContext<MiniMatchStateModel>,
    action: UpdateSequence
  ): void {
    ctx.patchState({
      savedSequences: [
        ...ctx.getState().savedSequences.slice(0, action.payload.index),
        action.payload.sequence,
        ...ctx.getState().savedSequences.slice(action.payload.index + 1),
      ],
    });
  }

  @Action(DeleteSequence)
  deleteSequence(
    ctx: StateContext<MiniMatchStateModel>,
    action: DeleteSequence
  ): void {
    ctx.patchState({
      savedSequences: ctx
        .getState()
        .savedSequences.filter((_, i) => i !== action.payload.index),
    });
  }

  @Action(ClearSequences)
  clearSequences(ctx: StateContext<MiniMatchStateModel>): void {
    ctx.patchState({
      savedSequences: [],
    });
  }

  @Action(ImportSequences)
  importSequences(
    ctx: StateContext<MiniMatchStateModel>,
    action: ImportSequences
  ): void {
    ctx.patchState({
      savedSequences: [...ctx.getState().savedSequences, ...action.payload],
    });
  }
}
