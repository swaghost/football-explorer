import {
  IMiniFormationPreset,
  IMiniMatchAnimationSequence,
} from '../interfaces/mini-match';

export interface MiniMatchStateModel {
  customFormationPresets: IMiniFormationPreset[];
  savedSequences: IMiniMatchAnimationSequence[];
}

export const initialMiniMatchState: MiniMatchStateModel = {
  customFormationPresets: [],
  savedSequences: [],
};
