import { Observable } from 'rxjs';
import * as d3 from 'd3';
import { TreeNode, D3TreeNode } from './index';

/**
 * Background definition with link contrast colors
 */
export interface IBackgroundDefinition {
  Name: string;
  HighContrastLinkColor: string;
  LowContrastLinkColor: string;
  VeryLowContrastLinkColor: string;
  AbsentLinkColor: string;
  AllowOverride: boolean;
}

/**
 * Configuration for visualization dimensions
 */
export interface VisualizationDimensions {
  width: number; // Tree spread width (user-controlled)
  height: number; // Tree spread height (user-controlled)
  radius?: number; // For radial visualizations (user-controlled)
  margin?: { top: number; right: number; bottom: number; left: number };
  centerX?: number; // Viewport center X (actual window width / 2)
  centerY?: number; // Viewport center Y (actual window height / 2)
}

/**
 * Transform state for pan/zoom/rotate interactions
 */
export interface VisualizationTransform {
  panX: number;
  panY: number;
  zoomLevel: number;
  rotationAngle: number;
}

/**
 * Result of computing a tree layout
 */
export interface TreeLayoutResult {
  nodes: D3TreeNode[];
  links: Array<{
    source: { x: number; y: number };
    target: { x: number; y: number };
  }>;
}

/**
 * Strategy pattern interface for different visualization types
 * Allows pluggable visualization algorithms (tree, cluster, force-directed, etc.)
 */
export interface IVisualizationStrategy {
  /**
   * Unique identifier for this visualization type
   */
  readonly type: string;

  /**
   * Initialize the layout algorithm with given dimensions
   */
  initializeLayout(dimensions: VisualizationDimensions): void;

  /**
   * Compute the layout for the given tree data
   */
  computeLayout(treeData: TreeNode): TreeLayoutResult;

  /**
   * Check if this strategy supports the given visualization type name
   */
  supports(visualizationType: string): boolean;
}

/**
 * Interface for rendering visualization elements to SVG
 * Abstracts D3 DOM manipulation
 */
export interface IVisualizationRenderer {
  /**
   * Initialize the SVG canvas and layer groups
   */
  initializeSvg(
    svgElement: SVGSVGElement,
    dimensions: VisualizationDimensions
  ): void;

  /**
   * Render nodes with smooth transitions
   */
  renderNodes(
    nodes: D3TreeNode[],
    options: {
      visible: boolean;
      isDarkMode: boolean;
      selectedNodeId: string | null;
      onNodeClick: (nodeId: string) => void;
    }
  ): void;

  /**
   * Render links with smooth transitions
   */
  renderLinks(
    links: Array<{
      source: { x: number; y: number };
      target: { x: number; y: number };
    }>,
    options: {
      visible: boolean;
      isDarkMode: boolean;
    }
  ): void;

  /**
   * Apply transform (pan/zoom/rotate) to the main group
   */
  applyTransform(
    transform: VisualizationTransform,
    dimensions: VisualizationDimensions
  ): void;

  /**
   * Get the main SVG group element for custom rendering
   */
  getMainGroup(): d3.Selection<SVGGElement, unknown, null, undefined> | null;

  /**
   * Update theme colors
   */
  updateTheme(isDarkMode: boolean): void;

  /**
   * Clean up resources
   */
  destroy(): void;
}

/**
 * Interface for handling user interactions (pan, zoom, rotate, select)
 * Encapsulates all interaction logic separate from rendering
 */
export interface IInteractionHandler {
  /**
   * Set up zoom behavior on the SVG element
   */
  setupZoomBehavior(
    svgElement: SVGSVGElement,
    options: {
      scaleExtent: [number, number];
      onZoom: (transform: VisualizationTransform) => void;
      filter?: (event: any) => boolean;
    }
  ): void;

  /**
   * Pan to a specific node by ID with smooth animation
   */
  panToNode(
    nodeId: string,
    nodes: D3TreeNode[],
    currentTransform: VisualizationTransform,
    dimensions: VisualizationDimensions
  ): Observable<VisualizationTransform>;

  /**
   * Reset pan and zoom to default
   */
  resetTransform(
    dimensions: VisualizationDimensions
  ): Observable<VisualizationTransform>;

  /**
   * Handle rotation via Alt+drag
   */
  handleRotationDrag(
    event: MouseEvent,
    currentRotation: number,
    dimensions: VisualizationDimensions
  ): Observable<number>;

  /**
   * Programmatically set transform values
   */
  setTransform(transform: Partial<VisualizationTransform>): void;

  /**
   * Get current transform state
   */
  getTransform(): VisualizationTransform;

  /**
   * Clean up event listeners
   */
  destroy(): void;
}

/**
 * Options for configuring a visualization
 */
export interface VisualizationOptions {
  visualizationType: string;
  dimensions: VisualizationDimensions;
  treeData: TreeNode;
  isDarkMode: boolean;
  treeVisible: boolean;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
}
