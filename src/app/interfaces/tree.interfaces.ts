import * as d3 from 'd3';

// Tree node interface
export interface TreeNode {
  id: string;
  name: string;
  description?: string; // Optional description field for node details
  videoUrl?: string; // Optional video URL for node media content
  children?: TreeNode[];
  x?: number;
  y?: number;
  depth?: number;
}

// D3 hierarchy node type
export interface D3TreeNode extends d3.HierarchyPointNode<TreeNode> {
  id: string;
  data: TreeNode;
  videoUrl?: string; // Added directly to D3TreeNode for easier template access
  angle?: number; // For radial layouts
  radius?: number; // For radial layouts
}
