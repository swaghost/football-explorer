import { IColorizationKey } from './colorization-key.interface';
import { IColorNodeData } from './colorization-node-data.interface';

/**
 * Result of applying a colorization strategy to a dataset
 * Contains the key/legend and the colored node data
 */
export interface IColorizationResult {
  key: IColorizationKey[]; // Legend: list of possible values and their colors
  nodeData: IColorNodeData[]; // Colored nodes with their assigned key values
  colorUniformity?: 'Solid' | 'Gradient'; // Color display mode
  colorGradientDirectionality?: 'sunset' | 'sunrise'; // Gradient direction (only if colorUniformity is Gradient)
  nodeOpacity?: number; // Node opacity (0-1), default 1 (fully opaque)
}
