/**
 * Branch Colorization Strategy Implementation
 *
 * Colors nodes based on their branch (branch index of first-level children from root).
 * - Branch 0 = Red
 * - Branch 1 = Orange
 * - Branch 2 = Yellow
 * - Branch 3 = Green
 * - Branch 4 = Blue
 * - Branch 5 = Indigo
 * - Branch 6 = Violet
 * etc., cycling through the rainbow.
 *
 * Supports two ColorUniformity modes:
 * - SOLID: Each branch gets a solid color
 * - GRADIENT: Each branch gets a gradient from root to leaf in a direction
 *   - SUNRISE: Darker at root, lighter at leaf
 *   - SUNSET: Lighter at root, darker at leaf
 */

import { IColorizationStrategy } from '../interfaces/colorization/colorization-strategy.interface';
import { IColorizationResult } from '../interfaces/colorization/colorization-result.interface';
import { IColorNodeData } from '../interfaces/colorization/colorization-node-data.interface';
import { TreeNode } from '../interfaces/tree.interfaces';

// Rainbow colors for branch coloring (7 primary colors of the rainbow)
const RAINBOW_COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3', // Violet
];

/**
 * Classifies nodes by branch
 * Assigns colors based on the first-level child index of the root
 */
function classifyByBranch(dataset: any): IColorizationResult {
  const treeRoot: TreeNode | null = dataset?.treeData || null;

  if (!treeRoot) {
    return { key: [], nodeData: [] };
  }

  const result: IColorizationResult = {
    key: [],
    nodeData: [],
  };

  // Build the color key for branches
  const branches = treeRoot.children || [];
  console.log(`[BRANCH] Found ${branches.length} branches from root`);

  branches.forEach((branch, index) => {
    const branchColor = RAINBOW_COLORS[index % RAINBOW_COLORS.length];
    result.key.push({
      value: `branch-${index}`,
      name: branch.name || `Branch ${index}`,
      color: branchColor,
    });
    console.log(
      `[BRANCH] Branch ${index}: "${
        branch.name || 'unnamed'
      }" -> ${branchColor}`
    );
  });

  // Traverse tree and assign colors based on branch
  branches.forEach((branch, branchIndex) => {
    const branchColor = RAINBOW_COLORS[branchIndex % RAINBOW_COLORS.length];
    console.log(`[BRANCH] Processing branch ${branchIndex}...`);
    colorizeNodeAndChildren(
      branch,
      branchIndex,
      branchColor,
      0,
      result.nodeData
    );
  });

  console.log(`[BRANCH] Total nodes colored: ${result.nodeData.length}`);

  return result;
}

/**
 * Recursively colorize a node and all its children
 */
function colorizeNodeAndChildren(
  node: TreeNode,
  branchIndex: number,
  branchColor: string,
  level: number,
  nodeDataArray: IColorNodeData[]
): void {
  // Add this node to the colored nodes array
  nodeDataArray.push({
    nodeId: node.id,
    keyValue: `branch-${branchIndex}`,
    level: level,
    color: branchColor,
  });

  // Debug: log first few nodes being added (and all branch heads)
  const indent = '  '.repeat(level);
  if (level === 0 || nodeDataArray.length <= 10) {
    console.log(
      `[BRANCH] ${indent}+ Node: id="${node.id}" name="${node.name}" level=${level} branch=${branchIndex} color=${branchColor}`
    );
  }

  // Recursively colorize children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      colorizeNodeAndChildren(
        child,
        branchIndex,
        branchColor,
        level + 1,
        nodeDataArray
      );
    });
  }
}

/**
 * Branch Colorization Strategy
 * Implements IColorizationStrategy with branch-based classification
 */
export const BRANCH_STRATEGY: IColorizationStrategy = {
  strategyId: 'branch',
  category: 'by-phase-branch',
  strategyName: 'Branch',
  nodeSelectionFilter: 'Classified',
  colorSelectionMode: 'Rainbow',

  // Optional locks - not specified means user can override
  colorTarget: undefined, // User can choose via dropdown
  colorUniformity: undefined,
  colorGradientDirectionality: undefined,
  linkContrast: undefined,
  linkColor: undefined,
  background: undefined,

  // Strategy Implementation: Classify by branch
  classify: classifyByBranch,
};
