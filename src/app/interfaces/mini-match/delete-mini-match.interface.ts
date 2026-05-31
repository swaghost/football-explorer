import { IMiniKeyFrame } from './delete-mini-keyFrame.interface';
import { IMiniTeam } from './delete-mini-team.interface';

export interface IMiniMatch {
  name: string;
  perTeamPlayerCount: number;
  teams: IMiniTeam[];
  keyFrames: IMiniKeyFrame[];
  currentKeyFrameIndex?: number;
}
