/**
 * Interface for node styling configuration
 */
export interface INodeStyle {
  /** Text color for the node */
  textColor: string;
  /** Background/fill color for the node */
  nodeColor: string;
}

/**
 * Configuration for different node selection states
 */
export interface INodeStyleConfig {
  /** Style for the individual selected node */
  selectedNode: INodeStyle;
  /** Style for nodes in the selectedNodes list */
  selectedNodes: INodeStyle;
  /** Style for normal/unselected nodes */
  defaultNode: INodeStyle;
  /** Style for highlighted nodes */
  highlightedNode: INodeStyle;
}
