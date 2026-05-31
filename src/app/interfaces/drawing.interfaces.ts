// Drawing-related interfaces for the D3 tree visualization component

export interface DrawingStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  width: number;
  mode: 'pencil' | 'eraser';
}

export interface DrawingShape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text';
  start: { x: number; y: number };
  end: { x: number; y: number };
  stroke: string;
  fill: string;
  strokeWidth: number;
  fillMode?: 'outline' | 'filled' | 'filled-outline';
  arrowSize?: number;
  text?: string;
  fontSize?: number;
  textColor?: string;
  fontFamily?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textStrikethrough?: boolean;
}

export interface DrawingHistoryEntry {
  strokes: DrawingStroke[];
  shapes: DrawingShape[];
}
