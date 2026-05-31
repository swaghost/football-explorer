export interface IMiniMatchKeyframe {
  time: number;
  players: Array<{ id: string; x: number; y: number }>;
  ball: { x: number; y: number };
  connections?: Array<{
    id: string;
    playerIds: string[];
    color: string;
    strokeWidth: number;
    strokeDasharray?: string;
    opacity?: number;
    fillEnabled?: boolean;
    fillColor?: string;
    fillOpacity?: number;
  }>;
  drawingShapes?: Array<{
    id: string;
    type: 'text' | 'line' | 'oval' | 'rectangle' | 'triangle';
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    fill?: string;
    opacity?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textColor?: string;
  }>;
  paths?: Array<{
    id: string;
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    controlPoints?: Array<{ x: number; y: number }>;
    pathType: string; // run | attenuated-run | late-arriving | short-pass | chip | clear | drive | hook | knuckleball | dip | dribble-speed | dribble-gliding | dribble-contact
    drawingStyle: 'straight' | 'curved' | 'hand-drawn';
    duration: number;
    startTime: number;
    color: string;
    visibility: 'visible' | 'hidden';
    participants: Array<{
      objectId: string;
      objectType: 'player' | 'ball' | 'shape';
    }>;
  }>;
}
