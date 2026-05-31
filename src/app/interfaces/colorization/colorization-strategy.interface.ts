/**
 * Represents a colorization strategy definition
 * Strategies define HOW nodes are classified/qualified and colored
 */
import { IColorizationResult } from './colorization-result.interface';
import { TreeNode } from '../tree.interfaces';

export interface IColorizationStrategy {
  // Identity
  strategyId: string; // Unique identifier for the strategy (e.g., 'branch', 'lesson-status')
  category: string; // Category name (e.g., 'by-lesson-status', 'by-position', 'iq-development')
  strategyName: string; // Display name for the strategy

  // Node Selection
  nodeSelectionFilter: 'All' | 'Classified' | 'Qualified'; // How nodes are selected
  nodeSelectionArguments?: { value: string; label: string }[]; // Optional arguments for Classified/Qualified

  // Color Configuration
  colorSelectionMode: 'Rainbow' | 'System-Defined-Color' | 'User-Defined-Color'; // How colors are chosen
  predefinedColorKey?: Record<string, string>; // Static color mapping if System-Defined-Color

  // Optional Constraints (if defined, Colorizer cannot override)
  colorTarget?: 'nodes' | 'text' | 'both'; // If defined, Colorizer cannot override this
  colorUniformity?: 'Solid' | 'Gradient'; // None = user can choose
  colorGradientDirectionality?: 'sunset' | 'sunrise'; // Only applies if Gradient
  nodeOpacity?: number; // Node opacity (0-1). If defined, Colorizer cannot override this
  linkContrast?: 'high' | 'low' | 'very-low' | 'absent'; // Link contrast level
  linkColor?: string; // Override link color (hex or rgb)
  background?: string; // Background style
  defaultColor?: string; // Default color for User-Defined-Color mode (hex format)
  includeColorKey?: boolean; // If defined, Colorizer cannot override this (optional constraint)
  treeTextFont?: string; // Tree text font (optional, can be overridden by Colorizer)

  // Strategy Implementation Methods
  classify?: (
    dataset: any,
    nodeSelectionArguments?: string
  ) => IColorizationResult; // Classify nodes based on strategy logic
  qualify?: (
    dataset: any,
    nodeSelectionArguments?: string
  ) => IColorizationResult; // Qualify nodes based on strategy logic
  colorizeAll?: (dataset: any) => IColorizationResult; // Colorize all nodes without filtering
  getBranches?: (dataset: any) => string[]; // Get available branches from dataset (optional)
}
