export interface IMiniMatchPlayer {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away';
  number: number;
  color: string;
  numberColor?: string; // Color for player number text (default: white)
}
