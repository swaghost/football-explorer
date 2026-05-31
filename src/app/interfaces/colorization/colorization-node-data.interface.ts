/**
 * Represents colored node data after colorization has been applied
 */
export interface IColorNodeData {
  nodeId: string; // Unique identifier for the node
  keyValue: string; // Which key this node is assigned to
  level: number; // Depth level in the tree for gradient calculations
  color: string; // Final assigned color (hex format #RRGGBB or rgb string)
}
