export interface IMiniKeyFrame {
  time: number;
  teams: {
    teamName: string;
    players: {
      playerNumber: number;
      playerCenterX: number;
      playerCenterY: number;
    }[];
  }[];
}
