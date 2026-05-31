export interface IMiniFormationPreset {
  name: string;
  description?: string;
  playerPositions: Array<{
    id: string;
    number: number;
    team: 'home' | 'away';
    x: number;
    y: number;
  }>;
  ballPosition: { x: number; y: number };
  homeTeamColor: string;
  awayTeamColor: string;
  selectedHomePlayerNumbers: number[];
  selectedAwayPlayerNumbers: number[];
}
