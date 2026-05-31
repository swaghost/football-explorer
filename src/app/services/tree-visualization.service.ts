import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import {
  IVisualizationStrategy,
  TreeLayoutResult,
  VisualizationDimensions,
  TreeNode,
  D3TreeNode,
} from '../interfaces';

/**
 * Abstract base class for tree-based visualization strategies
 */
abstract class TreeVisualizationStrategyBase implements IVisualizationStrategy {
  protected layout: any;
  protected linkGenerator: any;
  protected dimensions: VisualizationDimensions = {
    width: 800,
    height: 600,
    margin: { top: 40, right: 40, bottom: 40, left: 40 },
  };

  abstract readonly type: string;

  abstract supports(visualizationType: string): boolean;

  abstract initializeLayout(dimensions: VisualizationDimensions): void;

  abstract computeLayout(treeData: TreeNode): TreeLayoutResult;

  /**
   * Helper to create hierarchy from tree data
   */
  protected createHierarchy(treeData: TreeNode): any {
    return d3.hierarchy(treeData);
  }
}

/**
 * Radial Tree visualization strategy
 */
@Injectable({ providedIn: 'root' })
export class RadialTreeStrategy extends TreeVisualizationStrategyBase {
  readonly type = 'radialTree';

  supports(visualizationType: string): boolean {
    return visualizationType === 'radialTree';
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;
    const radius = dimensions.radius || 400;

    this.layout = d3
      .tree()
      .size([360, radius - radius * 0.05])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    this.linkGenerator = d3
      .linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    const hierarchy = this.createHierarchy(treeData);
    const layoutResult = this.layout(hierarchy);
    const centerX = this.dimensions.centerX ?? this.dimensions.width / 2;
    const centerY = this.dimensions.centerY ?? this.dimensions.height / 2;

    const nodes = layoutResult.descendants().map((d: any) => ({
      ...d,
      id: d.data.id,
      videoUrl: d.data.videoUrl,
      x: centerX + d.y * Math.cos((d.x / 180) * Math.PI - Math.PI / 2),
      y: centerY + d.y * Math.sin((d.x / 180) * Math.PI - Math.PI / 2),
      r: d.depth === 0 ? 16 : 12,
    }));

    const links = layoutResult.links().map((d: any) => ({
      source: {
        x:
          centerX +
          d.source.y * Math.cos((d.source.x / 180) * Math.PI - Math.PI / 2),
        y:
          centerY +
          d.source.y * Math.sin((d.source.x / 180) * Math.PI - Math.PI / 2),
      },
      target: {
        x:
          centerX +
          d.target.y * Math.cos((d.target.x / 180) * Math.PI - Math.PI / 2),
        y:
          centerY +
          d.target.y * Math.sin((d.target.x / 180) * Math.PI - Math.PI / 2),
      },
    }));

    return { nodes, links };
  }
}

/**
 * Radial Cluster visualization strategy
 */
@Injectable({ providedIn: 'root' })
export class RadialClusterStrategy extends TreeVisualizationStrategyBase {
  readonly type = 'radialCluster';

  supports(visualizationType: string): boolean {
    return visualizationType === 'radialCluster';
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;
    const radius = dimensions.radius || 400;

    this.layout = d3
      .cluster()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    this.linkGenerator = d3
      .linkRadial()
      .angle((d: any) => d.x)
      .radius((d: any) => d.y);
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    const hierarchy = this.createHierarchy(treeData);
    const layoutResult = this.layout(hierarchy);
    const centerX = this.dimensions.centerX ?? this.dimensions.width / 2;
    const centerY = this.dimensions.centerY ?? this.dimensions.height / 2;

    const nodes = layoutResult.descendants().map((d: any) => ({
      ...d,
      id: d.data.id,
      videoUrl: d.data.videoUrl,
      x: centerX + d.y * Math.cos(d.x - Math.PI / 2),
      y: centerY + d.y * Math.sin(d.x - Math.PI / 2),
      r: d.depth === 0 ? 16 : 12,
    }));

    const links = layoutResult.links().map((d: any) => ({
      source: {
        x: centerX + d.source.y * Math.cos(d.source.x - Math.PI / 2),
        y: centerY + d.source.y * Math.sin(d.source.x - Math.PI / 2),
      },
      target: {
        x: centerX + d.target.y * Math.cos(d.target.x - Math.PI / 2),
        y: centerY + d.target.y * Math.sin(d.target.x - Math.PI / 2),
      },
    }));

    return { nodes, links };
  }
}

/**
 * Horizontal Tree visualization strategy
 */
@Injectable({ providedIn: 'root' })
export class HorizontalTreeStrategy extends TreeVisualizationStrategyBase {
  readonly type = 'treeHorizontal';

  supports(visualizationType: string): boolean {
    return visualizationType === 'treeHorizontal';
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;
    const margin = dimensions.margin || {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    };
    // Use user-controlled width and height
    const width = dimensions.width;
    const height = dimensions.height;

    this.layout = d3
      .tree()
      .size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ]);

    this.linkGenerator = d3
      .linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    const hierarchy = this.createHierarchy(treeData);
    const layoutResult = this.layout(hierarchy);
    const margin = this.dimensions.margin || {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    };

    // Center the tree around the viewport center (use centerX/centerY from dimensions)
    const centerX = this.dimensions.centerX ?? this.dimensions.width / 2;
    const centerY = this.dimensions.centerY ?? this.dimensions.height / 2;
    const treeWidth = this.dimensions.width - margin.left - margin.right;
    const treeHeight = this.dimensions.height - margin.top - margin.bottom;

    const nodes = layoutResult.descendants().map((d: any) => ({
      ...d,
      id: d.data.id,
      videoUrl: d.data.videoUrl,
      x: centerX - treeWidth / 2 + d.y,
      y: centerY - treeHeight / 2 + d.x,
      r: d.depth === 0 ? 16 : 12,
    }));

    const links = layoutResult.links().map((d: any) => ({
      source: {
        x: centerX - treeWidth / 2 + d.source.y,
        y: centerY - treeHeight / 2 + d.source.x,
      },
      target: {
        x: centerX - treeWidth / 2 + d.target.y,
        y: centerY - treeHeight / 2 + d.target.x,
      },
    }));

    return { nodes, links };
  }
}

/**
 * Vertical Tree visualization strategy
 */
@Injectable({ providedIn: 'root' })
export class VerticalTreeStrategy extends TreeVisualizationStrategyBase {
  readonly type = 'treeVertical';

  supports(visualizationType: string): boolean {
    return visualizationType === 'treeVertical';
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;
    const margin = dimensions.margin || {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    };
    // Use user-controlled width and height
    const width = dimensions.width;
    const height = dimensions.height;

    this.layout = d3
      .tree()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ]);

    this.linkGenerator = d3
      .linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    const hierarchy = this.createHierarchy(treeData);
    const layoutResult = this.layout(hierarchy);
    const margin = this.dimensions.margin || {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    };

    // Center the tree around the viewport center (use centerX/centerY from dimensions)
    const centerX = this.dimensions.centerX ?? this.dimensions.width / 2;
    const centerY = this.dimensions.centerY ?? this.dimensions.height / 2;
    const treeWidth = this.dimensions.width - margin.left - margin.right;
    const treeHeight = this.dimensions.height - margin.top - margin.bottom;

    const nodes = layoutResult.descendants().map((d: any) => ({
      ...d,
      id: d.data.id,
      videoUrl: d.data.videoUrl,
      x: centerX - treeWidth / 2 + d.x,
      y: centerY - treeHeight / 2 + d.y,
      r: d.depth === 0 ? 16 : 12,
    }));

    const links = layoutResult.links().map((d: any) => ({
      source: {
        x: centerX - treeWidth / 2 + d.source.x,
        y: centerY - treeHeight / 2 + d.source.y,
      },
      target: {
        x: centerX - treeWidth / 2 + d.target.x,
        y: centerY - treeHeight / 2 + d.target.y,
      },
    }));

    return { nodes, links };
  }
}

/**
 * Horizontal Cluster visualization strategy
 */
@Injectable({ providedIn: 'root' })
export class HorizontalClusterStrategy extends TreeVisualizationStrategyBase {
  readonly type = 'clusterHorizontal';

  supports(visualizationType: string): boolean {
    return visualizationType === 'clusterHorizontal';
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;
    const width = dimensions.width;
    const height = dimensions.height;

    this.layout = d3.cluster().size([height, width - 160]);

    this.linkGenerator = d3
      .linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    const hierarchy = this.createHierarchy(treeData);
    const layoutResult = this.layout(hierarchy);

    // Center the cluster around the viewport center
    const centerX = this.dimensions.centerX ?? this.dimensions.width / 2;
    const centerY = this.dimensions.centerY ?? this.dimensions.height / 2;
    const clusterWidth = this.dimensions.width - 160;
    const clusterHeight = this.dimensions.height;

    const nodes = layoutResult.descendants().map((d: any) => ({
      ...d,
      id: d.data.id,
      videoUrl: d.data.videoUrl,
      x: centerX - clusterWidth / 2 + d.y,
      y: centerY - clusterHeight / 2 + d.x,
      r: d.depth === 0 ? 16 : 12,
    }));

    const links = layoutResult.links().map((d: any) => ({
      source: {
        x: centerX - clusterWidth / 2 + d.source.y,
        y: centerY - clusterHeight / 2 + d.source.x,
      },
      target: {
        x: centerX - clusterWidth / 2 + d.target.y,
        y: centerY - clusterHeight / 2 + d.target.x,
      },
    }));

    return { nodes, links };
  }
}

/**
 * Vertical Cluster visualization strategy
 */
@Injectable({ providedIn: 'root' })
export class VerticalClusterStrategy extends TreeVisualizationStrategyBase {
  readonly type = 'clusterVertical';

  supports(visualizationType: string): boolean {
    return visualizationType === 'clusterVertical';
  }

  initializeLayout(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;
    const width = dimensions.width;
    const height = dimensions.height;

    this.layout = d3.cluster().size([width - 160, height]);

    this.linkGenerator = d3
      .linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);
  }

  computeLayout(treeData: TreeNode): TreeLayoutResult {
    const hierarchy = this.createHierarchy(treeData);
    const layoutResult = this.layout(hierarchy);

    // Center the cluster around the viewport center
    const centerX = this.dimensions.centerX ?? this.dimensions.width / 2;
    const centerY = this.dimensions.centerY ?? this.dimensions.height / 2;
    const clusterWidth = this.dimensions.width - 160;
    const clusterHeight = this.dimensions.height;

    const nodes = layoutResult.descendants().map((d: any) => ({
      ...d,
      id: d.data.id,
      videoUrl: d.data.videoUrl,
      x: centerX - clusterWidth / 2 + d.x,
      y: centerY - clusterHeight / 2 + d.y,
      r: d.depth === 0 ? 16 : 12,
    }));

    const links = layoutResult.links().map((d: any) => ({
      source: {
        x: centerX - clusterWidth / 2 + d.source.x,
        y: centerY - clusterHeight / 2 + d.source.y,
      },
      target: {
        x: centerX - clusterWidth / 2 + d.target.x,
        y: centerY - clusterHeight / 2 + d.target.y,
      },
    }));

    return { nodes, links };
  }
}

/**
 * Main service that manages tree visualization strategies
 */
@Injectable({ providedIn: 'root' })
export class TreeVisualizationService {
  private strategies: IVisualizationStrategy[] = [];
  private currentStrategy: IVisualizationStrategy | null = null;

  constructor(
    private radialTree: RadialTreeStrategy,
    private radialCluster: RadialClusterStrategy,
    private horizontalTree: HorizontalTreeStrategy,
    private verticalTree: VerticalTreeStrategy,
    private horizontalCluster: HorizontalClusterStrategy,
    private verticalCluster: VerticalClusterStrategy
  ) {
    // Register all available strategies
    this.strategies = [
      radialTree,
      radialCluster,
      horizontalTree,
      verticalTree,
      horizontalCluster,
      verticalCluster,
    ];
  }

  /**
   * Set the active visualization type and initialize its layout
   */
  setVisualizationType(
    visualizationType: string,
    dimensions: VisualizationDimensions
  ): void {
    const strategy = this.strategies.find((s) => s.supports(visualizationType));

    if (!strategy) {
      console.warn('Unknown visualization type:', visualizationType);
      return;
    }

    this.currentStrategy = strategy;
    this.currentStrategy.initializeLayout(dimensions);
  }

  /**
   * Compute the layout for the given tree data using the current strategy
   */
  computeLayout(treeData: TreeNode): TreeLayoutResult | null {
    if (!this.currentStrategy) {
      console.warn('No visualization strategy selected');
      return null;
    }

    return this.currentStrategy.computeLayout(treeData);
  }

  /**
   * Get the current strategy type
   */
  getCurrentStrategyType(): string | null {
    return this.currentStrategy?.type || null;
  }

  /**
   * Check if a strategy exists for the given type
   */
  hasStrategy(visualizationType: string): boolean {
    return this.strategies.some((s) => s.supports(visualizationType));
  }
}
