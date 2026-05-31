/**
 * Branch/Selection Colorization Strategy Implementation
 *
 * Colorizes a single selected branch with a qualified color, while coloring
 * all other branches and unselected nodes with an unqualified color.
 *
 * This allows users to highlight a specific branch (phase) while showing
 * all other nodes in a different color for context.
 *
 * Features:
 * - User-defined colors for qualified (included) and unqualified (excluded) nodes
 * - Supports solid or gradient coloring by level
 * - Gradient direction (SUNRISE/SUNSET) controls level-based shading
 */

import { IColorizationStrategy } from '../interfaces/colorization/colorization-strategy.interface';
import { IColorizationResult } from '../interfaces/colorization/colorization-result.interface';
import { IColorNodeData } from '../interfaces/colorization/colorization-node-data.interface';
import { TreeNode } from '../interfaces/tree.interfaces';

// Default colors
const DEFAULT_UNQUALIFIED_COLOR = '#cccccc'; // Gray for non-selected nodes

/**
 * Interface for Branch/Selection strategy arguments
 */
interface BranchSelectionArgs {
  selectedBranchIndex: number;
  qualifiedColor: string;
  unqualifiedColor?: string;
}

/**
 * Extracts the list of branches (first-level children) from the dataset
 * Returns an array of branch names for display in the dropdown
 */
export function getBranchesFromDataset(dataset: any): string[] {
  if (!dataset || !dataset.treeData || !dataset.treeData.children) {
    return [];
  }
  return dataset.treeData.children.map(
    (branch: TreeNode, index: number) =>
      `${index + 1}. ${branch.name || `Branch ${index}`}`
  );
}

/**
 * Parses node selection arguments as BranchSelectionArgs
 */
function parseBranchSelectionArgs(
  argsJson?: string
): BranchSelectionArgs | null {
  if (!argsJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(argsJson);
    return {
      selectedBranchIndex: parsed.selectedBranchIndex,
      qualifiedColor: parsed.qualifiedColor || '#0000FF',
      unqualifiedColor: parsed.unqualifiedColor || DEFAULT_UNQUALIFIED_COLOR,
    };
  } catch (e) {
    console.error('Failed to parse branch selection arguments:', e);
    return null;
  }
}

/**
 * Qualifies nodes based on selected branch
 * Nodes in the selected branch get the qualified color,
 * all other nodes get the unqualified color
 */
function qualifyByBranchSelection(
  dataset: any,
  nodeSelectionArguments?: string
): IColorizationResult {
  const treeRoot: TreeNode | null = dataset?.treeData || null;

  if (!treeRoot) {
    console.log('❌ Branch-Selection Strategy: No treeData found in dataset');
    return { key: [], nodeData: [] };
  }

  const args = parseBranchSelectionArgs(nodeSelectionArguments);
  console.log('🔍 Branch-Selection Strategy - Parsed arguments:', {
    selectedBranchIndex: args?.selectedBranchIndex,
    qualifiedColor: args?.qualifiedColor,
    unqualifiedColor: args?.unqualifiedColor,
  });

  if (!args || args.selectedBranchIndex < 0) {
    console.error(
      '❌ Branch-Selection Strategy: Invalid arguments or selectedBranchIndex'
    );
    return { key: [], nodeData: [] };
  }

  const result: IColorizationResult = {
    key: [
      {
        value: 'qualified',
        name: 'Selected Branch',
        color: args.qualifiedColor,
      },
      {
        value: 'unqualified',
        name: 'Other Branches',
        color: args.unqualifiedColor,
      },
    ],
    nodeData: [],
  };

  const branches = treeRoot.children || [];
  console.log(
    `🌳 Branch-Selection Strategy: Found ${branches.length} branches, processing...`
  );

  // Process each branch
  branches.forEach((branch, branchIndex) => {
    const isSelectedBranch = branchIndex === args.selectedBranchIndex;
    const branchColor = isSelectedBranch
      ? args.qualifiedColor
      : args.unqualifiedColor;
    const keyValue = isSelectedBranch ? 'qualified' : 'unqualified';

    console.log(
      `Branch ${branchIndex}: "${branch.name}" - ${keyValue} (color: ${branchColor})`
    );

    colorizeNodeAndChildren(branch, keyValue, branchColor, 0, result.nodeData);
  });

  console.log(
    `✅ Branch-Selection Strategy: Processed ${result.nodeData.length} total nodes`
  );
  const qualifiedCount = result.nodeData.filter(
    (n) => n.keyValue === 'qualified'
  ).length;
  const unqualifiedCount = result.nodeData.filter(
    (n) => n.keyValue === 'unqualified'
  ).length;
  console.log(
    `  → Qualified: ${qualifiedCount}, Unqualified: ${unqualifiedCount}`
  );

  // Sample the first few nodes
  if (result.nodeData.length > 0) {
    console.log('  Sample nodes:');
    for (let i = 0; i < Math.min(5, result.nodeData.length); i++) {
      const nd = result.nodeData[i];
      console.log(
        `    ${i}: id="${nd.nodeId}", keyValue="${nd.keyValue}", color="${nd.color}"`
      );
    }
  }

  return result;
}

/**
 * Recursively colorize a node and all its children
 */
function colorizeNodeAndChildren(
  node: TreeNode,
  keyValue: string,
  color: string,
  level: number,
  nodeDataArray: IColorNodeData[]
): void {
  // Add this node to the colored nodes array
  const nodeEntry: IColorNodeData = {
    nodeId: node.id,
    keyValue: keyValue,
    level: level,
    color: color,
  };
  nodeDataArray.push(nodeEntry);

  if (level === 0) {
    console.log(
      `  ↳ Root node: id="${node.id}", keyValue="${keyValue}", color="${color}"`
    );
  }

  // Recursively colorize children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      colorizeNodeAndChildren(child, keyValue, color, level + 1, nodeDataArray);
    });
  }
}

/**
 * Branch/Selection Colorization Strategy
 * Implements IColorizationStrategy with branch selection qualification
 */
export const BRANCH_SELECTION_STRATEGY: IColorizationStrategy = {
  strategyId: 'branch-selection',
  category: 'by-phase-branch',
  strategyName: 'Branch/Selection',
  nodeSelectionFilter: 'Qualified',
  colorSelectionMode: 'User-Defined-Color',

  // Optional locks - not specified means user can override
  colorTarget: undefined, // User can choose via dropdown
  colorUniformity: undefined,
  colorGradientDirectionality: undefined,
  linkContrast: undefined,
  linkColor: undefined,
  background: undefined,
  defaultColor: '#FF0000', // Red for qualified nodes

  // Strategy Implementation: Qualify by branch selection
  qualify: qualifyByBranchSelection,

  // Helper method to get branches from dataset
  getBranches: getBranchesFromDataset,
};
