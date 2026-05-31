import { IMiniMatchKeyframe } from './mini-keyframe.gsap.interface';

export interface IMiniMatchAnimationSequence {
  name: string;
  keyframes: IMiniMatchKeyframe[];
  duration: number;
  fieldGrid?: string;
  homeTeamColor?: string;
  awayTeamColor?: string;
}
