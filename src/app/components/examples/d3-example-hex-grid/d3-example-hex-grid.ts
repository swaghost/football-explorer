import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

interface Node {
  id: string;
  name: string;
  x?: number;
  y?: number;
  r?: number;
  angle?: number;
  radius?: number;
}

interface TreeNode extends Node {
  children?: TreeNode[];
}

interface D3Node extends d3.HierarchyNode<TreeNode> {
  x: number;
  y: number;
  id?: string;
  r?: number;
}

@Component({
  selector: 'app-d3-example-hex-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d3-example-hex-grid.html',
  styleUrl: './d3-example-hex-grid.scss',
})
export class D3ExampleHexGrid implements AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null =
    null;
  private g: any;
  private zoom: any;
  private width = 1200;
  private height = 800;

  // Control properties
  public zoomLevel = 1;
  public panX = 0;
  public panY = 0;
  public nodeCount = 25;
  public rotationAngle = 0;
  public selectedNode: string | null = null;

  private nodeTree: TreeNode | null = null;
  private branchColors: Map<number, string> = new Map();
  private nodeToColorMap: Map<string, string> = new Map();

  constructor(private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.initializeSVG();
    this.generateTreeStructure();
    this.renderHexGrid();
  }

  private initializeSVG(): void {
    if (!this.svgContainer) return;

    // Clear any existing SVG
    d3.select(this.svgContainer.nativeElement).selectAll('svg').remove();

    // Create SVG
    this.svg = d3
      .select(this.svgContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('style', 'background: #f5f5f5; border: 1px solid #ccc;');

    // Add background
    this.svg
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', '#f5f5f5');

    // Create main group for pan/zoom/rotate transformations
    this.g = this.svg.append('g');

    // Setup D3 zoom behavior
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .filter((event) => {
        return event.type === 'wheel' || event.type === 'mousedown';
      })
      .on('zoom', (event) => {
        if (event.sourceEvent && event.sourceEvent.type === 'wheel') {
          // For scroll wheel: only update zoom
          this.zoomLevel = event.transform.k;
          const correctedTransform = d3.zoomIdentity
            .translate(this.panX, this.panY)
            .scale(this.zoomLevel);
          this.svg!.property('__zoom', correctedTransform);
        } else {
          // For drag: update pan only
          this.panX = event.transform.x;
          this.panY = event.transform.y;
        }

        this.applyTransform();
        this.cdRef.detectChanges();
      });

    this.svg.call(this.zoom as any);
    console.log('Zoom behavior attached');
  }

  /**
   * Generate a tree structure with random parent-child relationships
   * Assigns nodes to a hierarchical structure that radiates outward
   */
  private generateTreeStructure(): void {
    this.nodeToColorMap.clear();
    this.branchColors.clear();

    // Create root node
    const root: TreeNode = {
      id: '0',
      name: 'Root',
      children: [],
    };

    // Rainbow color palette for branches
    const rainbowPalette = [
      '#e74c3c', // Red
      '#e67e22', // Orange
      '#f39c12', // Yellow-Orange
      '#2ecc71', // Green
      '#3498db', // Blue
      '#9b59b6', // Purple
      '#e91e63', // Pink
    ];

    // Root gets the first color
    this.nodeToColorMap.set('0', rainbowPalette[0]);

    let nodeId = 1;
    let currentLevel = [root];
    let firstLevelBranchIndex = 1; // Start at 1 so first-level children get different colors from root

    // Map to track which branch each node belongs to (for descendants)
    const nodeToBranchMap = new Map<string, number>();
    nodeToBranchMap.set('0', 0);

    while (nodeId < this.nodeCount && currentLevel.length > 0) {
      const nextLevel: TreeNode[] = [];

      for (const parent of currentLevel) {
        if (nodeId >= this.nodeCount) break;

        // Determine branch index for children
        let parentBranchIndex = nodeToBranchMap.get(parent.id) || 0;

        // If parent is root (id=0) and this is the first child level,
        // assign new branch colors for each child
        const isRootLevel = parent.id === '0';

        // Assign 2-4 children to each parent
        const childCount = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < childCount && nodeId < this.nodeCount; i++) {
          const child: TreeNode = {
            id: nodeId.toString(),
            name: `Node ${nodeId}`,
            children: [],
          };

          // Determine branch color
          let branchIndex: number;
          if (isRootLevel) {
            // First-level children get new branch colors from rainbow
            branchIndex = firstLevelBranchIndex % rainbowPalette.length;
            firstLevelBranchIndex++;
          } else {
            // All other descendants inherit parent's branch color
            branchIndex = parentBranchIndex;
          }

          const color = rainbowPalette[branchIndex % rainbowPalette.length];
          this.nodeToColorMap.set(child.id, color);
          nodeToBranchMap.set(child.id, branchIndex);

          if (!parent.children) parent.children = [];
          parent.children.push(child);
          nextLevel.push(child);
          nodeId++;
        }
      }

      currentLevel = nextLevel;
    }

    this.nodeTree = root;
  }

  /**
   * Position nodes radially outward based on tree depth
   * Maintains seamless hex grid while radiating from center
   */
  private assignNodesToRadialPositions(
    hexes: Array<{ x: number; y: number; q: number; r: number }>
  ): Array<{
    id: string;
    x: number;
    y: number;
    r: number;
    color: string;
    depth: number;
  }> {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const nodes: Array<{
      id: string;
      x: number;
      y: number;
      r: number;
      color: string;
      depth: number;
    }> = [];

    if (!this.nodeTree) return nodes;

    // Flatten tree with depth information
    const nodeList: Array<{ node: TreeNode; depth: number }> = [];
    const traverse = (node: TreeNode, depth: number) => {
      nodeList.push({ node, depth });
      if (node.children) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    };

    traverse(this.nodeTree, 0);

    // Sort nodes by depth first (for layer-by-layer placement)
    nodeList.sort((a, b) => a.depth - b.depth);

    // Sort hexes by distance from center for radial positioning
    const hexesWithDistance = hexes.map((hex) => ({
      ...hex,
      distanceFromCenter: Math.sqrt(
        Math.pow(hex.x - centerX, 2) + Math.pow(hex.y - centerY, 2)
      ),
    }));

    // Sort by distance to place nodes radiating outward
    hexesWithDistance.sort(
      (a, b) => a.distanceFromCenter - b.distanceFromCenter
    );

    // Assign nodes to hexes in radial order
    for (let i = 0; i < nodeList.length && i < hexesWithDistance.length; i++) {
      const { node, depth } = nodeList[i];
      const hex = hexesWithDistance[i];

      const color = this.nodeToColorMap.get(node.id) || '#95a5a6';

      nodes.push({
        id: node.id,
        x: hex.x,
        y: hex.y,
        r: Math.max(10, 18 - depth * 1.5), // Decrease size with depth
        color: color,
        depth: depth,
      });
    }

    return nodes;
  }

  private renderHexGrid(): void {
    if (!this.g) return;

    // Create hex grid and populate with nodes
    const hexGrid = this.generateHexGrid();

    const nodesWithPositions = this.assignNodesToRadialPositions(hexGrid);

    // Draw hex grid background with node colors
    this.drawHexGridBackground(hexGrid, nodesWithPositions);

    // Draw nodes
    this.drawNodes(nodesWithPositions);
  }

  private generateHexGrid(): Array<{
    x: number;
    y: number;
    q: number;
    r: number;
  }> {
    /**
     * Generate seamless hexagonal grid using axial coordinates (q, r)
     * Uses proper hexagon geometry for interlocking tiles
     * Grid covers the entire viewport accounting for zoom level
     */
    const hexRadius = 30; // Distance from center to vertex
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const hexes: Array<{ x: number; y: number; q: number; r: number }> = [];

    // Calculate grid radius based on canvas dimensions and zoom level
    // At smaller zoom levels, we need more hexes to cover the expanded viewport
    const effectiveWidth = this.width / this.zoomLevel;
    const effectiveHeight = this.height / this.zoomLevel;

    // Maximum distance from center to viewport corner (accounting for zoom)
    const maxDistance = Math.sqrt(
      Math.pow(Math.max(centerX, effectiveWidth - centerX), 2) +
        Math.pow(Math.max(centerY, effectiveHeight - centerY), 2)
    );
    // Approximate hex spacing is hexRadius * sqrt(3)
    const hexSpacing = hexRadius * Math.sqrt(3);
    const gridRadius = Math.ceil(maxDistance / hexSpacing) + 3;

    // Generate hex grid using axial coordinates with proper spacing
    for (let q = -gridRadius; q <= gridRadius; q++) {
      for (let r = -gridRadius; r <= gridRadius; r++) {
        if (Math.abs(q + r) <= gridRadius) {
          // Convert axial (q, r) to pixel coordinates for flat-top hexagons
          const x = centerX + (3 / 2) * hexRadius * q;
          const y =
            centerY +
            (Math.sqrt(3) / 2) * hexRadius * q +
            Math.sqrt(3) * hexRadius * r;

          hexes.push({ x, y, q, r });
        }
      }
    }

    return hexes;
  }

  private drawHexGridBackground(
    hexes: Array<{ x: number; y: number; q: number; r: number }>,
    nodes: Array<{
      id: string;
      x: number;
      y: number;
      r: number;
      color: string;
      depth: number;
    }>
  ): void {
    if (!this.g) return;

    const hexRadius = 30;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Create a map of hex positions to node colors
    const hexToColorMap = new Map<string, string>();
    for (const node of nodes) {
      const key = `${node.x},${node.y}`;
      hexToColorMap.set(key, node.color);
    }

    // Draw hex grid cells with seamless interlocking
    this.g
      .selectAll('.hex-cell')
      .data(hexes, (d: any, i: number) => i)
      .join('polygon')
      .attr('class', 'hex-cell')
      .attr('points', (d: any) => this.getHexagonPoints(d.x, d.y, hexRadius))
      .attr('fill', (d: any) => {
        // Check if this hex has a node
        const hexKey = `${d.x},${d.y}`;
        const nodeColor = hexToColorMap.get(hexKey);
        if (nodeColor) {
          return nodeColor; // Color hex with node's color
        }

        // Mark center hex with black/white pattern
        const dist = Math.sqrt(
          Math.pow(d.x - centerX, 2) + Math.pow(d.y - centerY, 2)
        );
        if (dist < 15) {
          return '#000'; // Center tile is black
        }
        return '#f5f5f5'; // Empty hexes are light background
      })
      .attr('stroke', '#bbb')
      .attr('stroke-width', 0.5)
      .attr('opacity', 1);

    // Add white outline to center hex for contrast
    const centerHex = hexes.find((h) => {
      const dist = Math.sqrt(
        Math.pow(h.x - centerX, 2) + Math.pow(h.y - centerY, 2)
      );
      return dist < 15;
    });

    if (centerHex) {
      this.g
        .append('polygon')
        .attr('class', 'center-hex')
        .attr(
          'points',
          this.getHexagonPoints(centerHex.x, centerHex.y, hexRadius)
        )
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 1);
    }
  }

  private drawNodes(
    nodes: Array<{
      id: string;
      x: number;
      y: number;
      r: number;
      color: string;
      depth: number;
    }>
  ): void {
    if (!this.g) return;

    const nodeSelection = this.g
      .selectAll('.hex-node')
      .data(nodes, (d: any) => d.id)
      .join((enter) => {
        const g = enter
          .append('g')
          .attr('class', 'hex-node')
          .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.3em')
          .attr('font-size', '12px')
          .attr('fill', '#000')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .attr('transform', `rotate(${-this.rotationAngle})`)
          .text((d: any) => d.id);

        return g;
      })
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodeSelection.on('click', (event: any, d: any) => {
      this.selectedNode = d.id || null;
      this.cdRef.detectChanges();
      event.stopPropagation();
    });
  }

  private getHexagonPoints(
    centerX: number,
    centerY: number,
    radius: number
  ): string {
    /**
     * Generate hexagon points for a given center and radius
     * Returns a points string for SVG polygon
     */
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }

  // ==================== Control Methods ====================

  updatePan(event: Event, axis: 'x' | 'y'): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (axis === 'x') {
      this.panX = value;
    } else {
      this.panY = value;
    }

    this.applyTransform();

    const transform = d3.zoomIdentity
      .translate(this.panX, this.panY)
      .scale(this.zoomLevel);
    this.svg!.call(this.zoom.transform, transform);
  }

  updateZoom(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.zoomLevel = parseFloat(target.value);

    this.applyTransform();

    // Regenerate hex grid to cover expanded viewport when zooming out
    this.redrawHexGrid();

    const transform = d3.zoomIdentity.scale(this.zoomLevel);
    this.svg!.call(this.zoom.transform, transform);
  }

  updateRotation(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rotationAngle = parseInt(target.value);

    this.applyTransform();

    // Update text rotation to keep text level
    this.g
      .selectAll('.hex-node text')
      .attr('transform', `rotate(${-this.rotationAngle})`);
  }

  updateNodeCount(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nodeCount = parseInt(target.value);

    this.redraw();
  }

  randomizeNodes(): void {
    // Regenerate parent/child relationships randomly
    this.redraw();
  }

  private redrawHexGrid(): void {
    if (!this.g) return;

    // Remove only hex cells and nodes, keep the center hex
    this.g.selectAll('.hex-cell').remove();
    this.g.selectAll('.hex-node').remove();

    // Regenerate hex grid and nodes with current zoom level
    const hexGrid = this.generateHexGrid();
    const nodesWithPositions = this.assignNodesToRadialPositions(hexGrid);

    this.drawHexGridBackground(hexGrid, nodesWithPositions);
    this.drawNodes(nodesWithPositions);
  }

  private applyTransform(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const combinedTransform = `translate(${centerX + this.panX},${
      centerY + this.panY
    }) rotate(${this.rotationAngle}) scale(${
      this.zoomLevel
    }) translate(${-centerX},${-centerY})`;
    this.g.attr('transform', combinedTransform);
  }

  private redraw(): void {
    if (!this.g) return;

    this.g.selectAll('*').remove();

    this.generateTreeStructure();
    const hexGrid = this.generateHexGrid();
    const nodesWithPositions = this.assignNodesToRadialPositions(hexGrid);

    this.drawHexGridBackground(hexGrid, nodesWithPositions);
    this.drawNodes(nodesWithPositions);

    this.applyTransform();
  }

  // ==================== Getters for Template ====================

  get panXMin(): number {
    return -this.width / 2;
  }

  get panXMax(): number {
    return this.width / 2;
  }

  get panYMin(): number {
    return -this.height / 2;
  }

  get panYMax(): number {
    return this.height / 2;
  }
}
