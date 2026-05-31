import { IMiniPlayer } from './delete-mini-player.interface';

export interface IMiniTeam {
  teamName: string;
  teamColor: string;
  playerCount: number;
  players: IMiniPlayer[];
  sequence: any[];
}
