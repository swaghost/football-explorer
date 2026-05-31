import { Injectable, inject } from '@angular/core';
import * as d3 from 'd3';
import {
  IVisualizationRenderer,
  VisualizationDimensions,
  VisualizationTransform,
  D3TreeNode,
} from '../interfaces';
import { ColorsService } from './colors.service';

/**
 * Service to handle D3 SVG rendering for visualizations
 * Abstracts all DOM manipulation and D3 transitions
 */
@Injectable({ providedIn: 'root' })
export class VisualizationRendererService implements IVisualizationRenderer {
  private colorsService = inject(ColorsService);

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;
  private mainGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;
  private linksGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;
  private nodesGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;
  private labelsGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;
  private backgroundCircle: d3.Selection<
    SVGCircleElement,
    unknown,
    null,
    undefined
  > | null = null;

  private dimensions: VisualizationDimensions = { width: 800, height: 600 };

  /**
   * Initialize the SVG canvas and layer groups
   */
  initializeSvg(
    svgElement: SVGSVGElement,
    dimensions: VisualizationDimensions
  ): void {
    this.dimensions = dimensions;

    // Clear any existing content
    d3.select(svgElement).selectAll('*').remove();

    this.svg = d3
      .select(svgElement)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Create main group for pan/zoom/rotate transformations
    this.mainGroup = this.svg
      .append('g')
      .attr('class', 'main-visualization-group');

    // Create layer groups for proper z-ordering
    this.linksGroup = this.mainGroup
      .append('g')
      .attr('class', 'tree-links-layer');
    this.nodesGroup = this.mainGroup
      .append('g')
      .attr('class', 'tree-nodes-layer');
    this.labelsGroup = this.mainGroup
      .append('g')
      .attr('class', 'tree-labels-layer');

    // Create background circle
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const availableWidth = dimensions.width;
    const availableHeight = dimensions.height - 120;
    const backgroundRadius = Math.min(availableWidth, availableHeight) * 0.35;

    this.backgroundCircle = this.mainGroup
      .append('circle')
      .attr('class', 'background-circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', backgroundRadius)
      .attr('opacity', 0.25)
      .attr('pointer-events', 'all');
  }

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
  ): void {
    if (!this.nodesGroup) return;

    const t = d3.transition().duration(750).ease(d3.easeCubicInOut) as any;

    // Update nodes with enter/update/exit pattern
    const nodeSelection = this.nodesGroup
      .selectAll<SVGCircleElement, D3TreeNode>('.tree-node')
      .data(nodes, (d) => d.id);

    // Remove exiting nodes
    nodeSelection
      .exit()
      .transition(t)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    // Add new nodes
    const nodeEnter = nodeSelection
      .enter()
      .append('circle')
      .attr('class', 'tree-node')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 0)
      .style('opacity', 0)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        options.onNodeClick(d.id);
      });

    // Update all nodes (existing + new)
    nodeEnter
      .merge(nodeSelection)
      .transition(t)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => (d as any).r || 12)
      .style('opacity', options.visible ? 1 : 0)
      .attr('fill', (d) => this.getNodeFillColor(d, options))
      .attr('stroke', (d) => this.getNodeStrokeColor(d, options))
      .attr('stroke-width', (d) => (d.id === options.selectedNodeId ? 3 : 1.5));
  }

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
  ): void {
    if (!this.linksGroup) return;

    const t = d3.transition().duration(750).ease(d3.easeCubicInOut) as any;

    // Update links with enter/update/exit pattern
    const linkSelection = this.linksGroup
      .selectAll<SVGPathElement, any>('.tree-link')
      .data(links, (d, i) => `link-${i}`);

    // Remove exiting links
    linkSelection.exit().transition(t).style('opacity', 0).remove();

    // Add new links
    const linkEnter = linkSelection
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .style('fill', 'none')
      .style('stroke', options.isDarkMode ? '#555' : '#ccc')
      .style('stroke-width', 1.5)
      .style('opacity', 0);

    // Update all links (existing + new)
    linkEnter
      .merge(linkSelection)
      .transition(t)
      .style('opacity', options.visible ? 0.6 : 0)
      .style('stroke', options.isDarkMode ? '#555' : '#ccc')
      .attr('d', (d) => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });
  }

  /**
   * Apply transform (pan/zoom/rotate) to the main group
   */
  applyTransform(
    transform: VisualizationTransform,
    dimensions: VisualizationDimensions
  ): void {
    if (!this.mainGroup) {
      console.warn('⚠️ Main group not initialized, skipping transform');
      return;
    }

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const combinedTransform = `translate(${centerX + transform.panX},${
      centerY + transform.panY
    }) rotate(${transform.rotationAngle}) scale(${
      transform.zoomLevel
    }) translate(${-centerX},${-centerY})`;

    this.mainGroup.attr('transform', combinedTransform);
  }

  /**
   * Get the main SVG group element for custom rendering
   */
  getMainGroup(): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    return this.mainGroup;
  }

  /**
   * Update theme colors for background and existing elements
   */
  updateTheme(isDarkMode: boolean): void {
    if (this.svg) {
      this.svg.style(
        'background',
        this.colorsService.getBackgroundColor(isDarkMode)
      );
    }

    if (this.backgroundCircle) {
      this.backgroundCircle.attr(
        'fill',
        this.colorsService.getBlueColor(isDarkMode)
      );
    }

    // Update existing links
    if (this.linksGroup) {
      this.linksGroup
        .selectAll('.tree-link')
        .style('stroke', isDarkMode ? '#555' : '#ccc');
    }

    // Update existing nodes (will be re-rendered with correct colors on next render)
    if (this.nodesGroup) {
      this.nodesGroup.selectAll('.tree-node').attr('stroke', (d: any) => {
        return isDarkMode ? '#fff' : '#333';
      });
    }
  }

  /**
   * Get the SVG element
   */
  getSvgElement(): d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null {
    return this.svg;
  }

  /**
   * Get dimensions
   */
  getDimensions(): VisualizationDimensions {
    return { ...this.dimensions };
  }

  /**
   * Update dimensions
   */
  updateDimensions(dimensions: VisualizationDimensions): void {
    this.dimensions = dimensions;

    if (this.svg) {
      this.svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);
    }

    // Update background circle
    if (this.backgroundCircle) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const availableWidth = dimensions.width;
      const availableHeight = dimensions.height - 120;
      const backgroundRadius = Math.min(availableWidth, availableHeight) * 0.35;

      this.backgroundCircle
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', backgroundRadius);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }

    this.svg = null;
    this.mainGroup = null;
    this.linksGroup = null;
    this.nodesGroup = null;
    this.labelsGroup = null;
    this.backgroundCircle = null;
  }

  /**
   * Helper to determine node fill color
   */
  private getNodeFillColor(
    node: D3TreeNode,
    options: { isDarkMode: boolean; selectedNodeId: string | null }
  ): string {
    // Simplified coloring - can be extended with color service logic
    if (node.id === options.selectedNodeId) {
      return options.isDarkMode ? '#4a9eff' : '#2563eb';
    }
    return options.isDarkMode ? '#555' : '#ddd';
  }

  /**
   * Helper to determine node stroke color
   */
  private getNodeStrokeColor(
    node: D3TreeNode,
    options: { isDarkMode: boolean; selectedNodeId: string | null }
  ): string {
    return options.isDarkMode ? '#fff' : '#333';
  }
}
