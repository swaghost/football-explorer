import {
  IMiniFormationPreset,
  IMiniMatchAnimationSequence,
} from '../interfaces/mini-match';

export class SaveCustomFormationPreset {
  static readonly type = '[Mini Match] Save Custom Formation Preset';
  constructor(public payload: IMiniFormationPreset) {}
}

export class UpdateCustomFormationPreset {
  static readonly type = '[Mini Match] Update Custom Formation Preset';
  constructor(
    public payload: { index: number; preset: IMiniFormationPreset }
  ) {}
}

export class DeleteCustomFormationPreset {
  static readonly type = '[Mini Match] Delete Custom Formation Preset';
  constructor(public payload: { index: number }) {}
}

export class ClearCustomFormationPresets {
  static readonly type = '[Mini Match] Clear Custom Formation Presets';
}

export class ImportCustomFormationPresets {
  static readonly type = '[Mini Match] Import Custom Formation Presets';
  constructor(public payload: IMiniFormationPreset[]) {}
}

export class SaveSequence {
  static readonly type = '[Mini Match] Save Sequence';
  constructor(public payload: IMiniMatchAnimationSequence) {}
}

export class UpdateSequence {
  static readonly type = '[Mini Match] Update Sequence';
  constructor(
    public payload: { index: number; sequence: IMiniMatchAnimationSequence }
  ) {}
}

export class DeleteSequence {
  static readonly type = '[Mini Match] Delete Sequence';
  constructor(public payload: { index: number }) {}
}

export class ClearSequences {
  static readonly type = '[Mini Match] Clear Sequences';
}

export class ImportSequences {
  static readonly type = '[Mini Match] Import Sequences';
  constructor(public payload: IMiniMatchAnimationSequence[]) {}
}
