import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  effect,
  untracked,
  ElementRef,
  ViewChild,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import {
  TreeVariableControl,
  TreeVariableControlConfig,
  ColorMode as SharedColorMode,
  LinkStyle,
  LayoutType,
} from '../../shared/tree-variable-control/tree-variable-control';

interface HierarchicalNode {
  ID: number;
  ParentID: number | null;
  Name: string;
  Status?: 'active' | 'inactive' | 'pending' | 'complete';
  Category?: string;
  Value?: number;
  CustomProperty?: string;
}

interface D3Node extends d3.HierarchyPointNode<HierarchicalNode> {
  x: number;
  y: number;
}

type ColorMode =
  | 'status'
  | 'depth'
  | 'category'
  | 'value'
  | 'custom'
  | 'branch-block'
  | 'branch-gradient'
  | 'red-block'
  | 'red-gradient'
  | 'orange-block'
  | 'orange-gradient'
  | 'yellow-block'
  | 'yellow-gradient'
  | 'green-block'
  | 'green-gradient'
  | 'blue-block'
  | 'blue-gradient'
  | 'indigo-block'
  | 'indigo-gradient'
  | 'violet-block'
  | 'violet-gradient'
  | 'grayscale-block'
  | 'grayscale-gradient';

@Component({
  selector: 'app-d3-example-radial-remake',
  imports: [CommonModule, FormsModule, TreeVariableControl],
  templateUrl: './d3-example-radial-remake.html',
  styleUrl: './d3-example-radial-remake.scss',
})
export class D3ExampleRadialRemake implements OnInit, OnDestroy {
  @ViewChild('svgContainer', { static: true })
  svgContainer!: ElementRef<HTMLDivElement>;

  // Signals for reactive state
  colorMode = signal<ColorMode>('status');
  data = signal<HierarchicalNode[]>([]);
  nodeCount = signal<number>(500);
  svgDarkMode = signal<boolean>(false);
  maxNameLength = signal<number>(50);
  linkStyle = signal<LinkStyle>('curve');
  colorTarget = signal<'nodes' | 'text'>('nodes');
  showLabels = signal<boolean>(true);
  radius = signal<number>(800);
  rotation = signal<number>(0);
  layoutType = signal<LayoutType>('tree');

  // Diagnostic signals
  svgWidth = signal<number>(0);
  svgHeight = signal<number>(0);
  svgRadius = signal<number>(0);
  optimalRadius = signal<number>(800);
  containerWidth = signal<number>(0);
  containerHeight = signal<number>(0);

  // Computed config for shared control component
  treeConfig = computed<TreeVariableControlConfig>(() => ({
    title: 'D3 Radial Tree - Dynamic Node Coloring',
    colorMode: this.colorMode() as SharedColorMode,
    nodeCount: this.nodeCount(),
    maxNameLength: this.maxNameLength(),
    svgDarkMode: this.svgDarkMode(),
    linkStyle: this.linkStyle(),
    colorTarget: this.colorTarget(),
    showLabels: this.showLabels(),
    radius: this.radius(),
    rotation: this.rotation(),
    layoutType: this.layoutType(),
    svgWidth: this.svgWidth(),
    svgHeight: this.svgHeight(),
    svgRadius: this.svgRadius(),
    optimalRadius: this.optimalRadius(),
    containerWidth: this.containerWidth(),
    containerHeight: this.containerHeight(),
  }));

  // Flag to track if we need to regenerate on node count change
  private previousNodeCount = 50;
  private previousMaxNameLength = 50;

  // D3 elements
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private root!: d3.HierarchyPointNode<HierarchicalNode>;

  // Layout dimensions - will be calculated dynamically
  private width = 0;
  private height = 0;
  private calculatedRadius = 0;
  private zoomSetup = false;

  // Performance optimization: color cache
  private colorCache = new Map<string, string>();

  // Performance optimization: debounce timer
  private updateTimer: any = null;

  // Flag to track if we've set initial radius based on optimal
  private hasSetInitialRadius = false;

  // Performance optimization: cached selectors
  private cachedNodesGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;
  private cachedLinksGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;

  // Color scales
  private statusColorScale = d3
    .scaleOrdinal<string>()
    .domain(['active', 'inactive', 'pending', 'complete'])
    .range(['#4caf50', '#f44336', '#ff9800', '#2196f3']);

  private depthColorScale = d3
    .scaleSequential(d3.interpolateViridis)
    .domain([0, 5]);

  private categoryColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain([]);

  private valueColorScale = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain([0, 100]);

  private customColorScale = d3.scaleOrdinal(d3.schemePaired).domain([]);

  // ROYGBIV colors for branch mode
  private branchColors = [
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#0000FF', // Blue
    '#4B0082', // Indigo
    '#9400D3', // Violet
  ];

  constructor() {
    // Effect to update node colors when color mode changes
    effect(() => {
      const mode = this.colorMode();
      if (this.svg) {
        // Use untracked to prevent reading other signals
        untracked(() => this.updateNodeColors(mode));
      }
    });

    // Effect to regenerate tree when node count changes
    effect(() => {
      const count = this.nodeCount();
      if (this.svg && count !== this.previousNodeCount) {
        this.previousNodeCount = count;
        this.generateMockData(count);
        this.renderRadialTree();
      }
    });

    // Effect to regenerate tree when max name length changes
    effect(() => {
      const length = this.maxNameLength();
      if (this.svg && length !== this.previousMaxNameLength) {
        this.previousMaxNameLength = length;
        this.generateMockData(this.nodeCount());
        this.renderRadialTree();
      }
    });

    // Effect to update visualization when dark mode changes
    effect(() => {
      const darkMode = this.svgDarkMode();
      if (this.svg) {
        untracked(() => this.updateVisualizationColors(darkMode));
      }
    });

    // Effect to update links when link style changes
    effect(() => {
      const style = this.linkStyle();
      if (this.svg && this.root) {
        untracked(() => this.updateLinks());
      }
    });

    // Effect to update visualization when color target changes
    effect(() => {
      const target = this.colorTarget();
      if (this.svg && this.root) {
        untracked(() => this.updateNodes());
      }
    });

    // Effect to toggle label visibility
    effect(() => {
      const showLabels = this.showLabels();
      if (this.svg) {
        untracked(() => {
          this.svg
            .selectAll('.nodes text')
            .style('display', showLabels ? null : 'none');
        });
      }
    });

    // Effect to update tree when radius, rotation, or layout type changes
    effect(() => {
      const radius = this.radius();
      const rotation = this.rotation();
      const layoutType = this.layoutType();
      console.log(
        '[EFFECT] Radius changed to:',
        radius,
        'Rotation:',
        rotation,
        'Layout:',
        layoutType
      );
      if (this.svg && this.root) {
        untracked(() => this.renderRadialTree());
      }
    });
  }

  ngOnInit(): void {
    this.generateMockData(this.nodeCount());
    this.initializeSVG();
    this.renderRadialTree();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private generateMockData(count: number = 12): void {
    const statuses: ('active' | 'inactive' | 'pending' | 'complete')[] = [
      'active',
      'inactive',
      'pending',
      'complete',
    ];
    const categories = ['A', 'B', 'C', 'D', 'E'];
    const customProperties = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

    // Pre-allocate array for better performance
    const mockData: HierarchicalNode[] = new Array(count);

    // Always create root node
    mockData[0] = {
      ID: 1,
      ParentID: null,
      Name: this.generateRandomName(),
      Status: this.randomItem(statuses),
      Category: this.randomItem(categories),
      Value: this.randomInt(80, 100),
      CustomProperty: this.randomItem(customProperties),
    };

    // Generate remaining nodes
    for (let i = 2; i <= count; i++) {
      // Select a random parent from existing nodes
      const parentID = this.randomInt(1, i - 1);

      mockData[i - 1] = {
        ID: i,
        ParentID: parentID,
        Name: this.generateRandomName(),
        Status: this.randomItem(statuses),
        Category: this.randomItem(categories),
        Value: this.randomInt(0, 100),
        CustomProperty: this.randomItem(customProperties),
      };
    }

    this.data.set(mockData);
  }

  private randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateRandomName(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const length = this.randomInt(10, this.maxNameLength());
    let name = '';
    for (let i = 0; i < length; i++) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return name;
  }

  private initializeSVG(): void {
    // Clear any existing SVG
    d3.select(this.svgContainer.nativeElement).select('svg').remove();

    // Clear cached selectors
    this.cachedNodesGroup = null;
    this.cachedLinksGroup = null;

    // Calculate dimensions based on container size and node count
    const container = this.svgContainer.nativeElement;
    const baseWidth = container.clientWidth || 1200;
    const baseHeight = container.clientHeight || 1200;

    // Scale up dimensions based on node count to prevent crowding
    const nodeCount = this.nodeCount();
    const scaleFactor = Math.max(1, Math.sqrt(nodeCount / 50));

    this.width = Math.max(baseWidth, 1200 * scaleFactor);
    this.height = Math.max(baseHeight, 1200 * scaleFactor);
    this.calculatedRadius = Math.min(this.width, this.height) / 2 - 100;

    // Update diagnostic signals
    this.svgWidth.set(this.width);
    this.svgHeight.set(this.height);
    this.svgRadius.set(this.radius());
    this.containerWidth.set(baseWidth);
    this.containerHeight.set(baseHeight);

    // Create new SVG with viewBox for scaling
    this.svg = d3
      .select(this.svgContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('max-width', 'none')
      .style('max-height', 'none');

    // Create group for radial tree, centered (with initial rotation)
    const rotation = this.rotation();
    this.g = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.width / 2},${this.height / 2}) rotate(${rotation})`
      );
  }

  private renderRadialTree(): void {
    const data = this.data();

    // Clear color cache on regeneration
    this.colorCache.clear();

    // Stratify the data (convert flat ID/ParentID structure to hierarchy)
    const stratify = d3
      .stratify<HierarchicalNode>()
      .id((d) => d.ID.toString())
      .parentId((d) => (d.ParentID !== null ? d.ParentID.toString() : null));

    const hierarchyRoot = stratify(data);

    // Calculate tree depth to determine required radius
    const treeDepth = hierarchyRoot.height;

    // Get user's desired radius from slider
    const userRadius = this.radius();
    console.log(
      '[RENDER] userRadius from signal:',
      userRadius,
      'treeDepth:',
      treeDepth
    );

    // Use user-specified radius directly
    this.calculatedRadius = userRadius;
    console.log('[RENDER] calculatedRadius set to:', this.calculatedRadius);

    // Calculate needed SVG dimensions to fit the radius
    const minDimension = this.calculatedRadius * 2 + 200; // Add padding
    console.log(
      '[RENDER] minDimension needed:',
      minDimension,
      'current width:',
      this.width,
      'height:',
      this.height
    ); // Expand SVG if needed to accommodate the radius
    if (minDimension > this.width || minDimension > this.height) {
      this.width = Math.max(this.width, minDimension);
      this.height = Math.max(this.height, minDimension);

      // Update SVG dimensions
      this.svg
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', `0 0 ${this.width} ${this.height}`);

      // Update center transform (preserve rotation)
      const rotation = this.rotation();
      this.g.attr(
        'transform',
        `translate(${this.width / 2},${this.height / 2}) rotate(${rotation})`
      );

      // Update diagnostic signals
      this.svgWidth.set(this.width);
      this.svgHeight.set(this.height);
      this.svgRadius.set(this.calculatedRadius);
    } else {
      // SVG is already large enough, just update transform with rotation
      const rotation = this.rotation();
      this.g.attr(
        'transform',
        `translate(${this.width / 2},${this.height / 2}) rotate(${rotation})`
      );
      this.svgRadius.set(this.calculatedRadius);
    }

    // Create radial tree layout (use cluster if selected)
    const layoutType = this.layoutType();
    const layoutFunction =
      layoutType === 'cluster'
        ? d3.cluster<HierarchicalNode>()
        : d3.tree<HierarchicalNode>();

    console.log(
      '[RENDER] Creating tree layout with calculatedRadius:',
      this.calculatedRadius
    );
    const tree = layoutFunction
      .size([2 * Math.PI, this.calculatedRadius])
      .separation((a, b) => {
        return this.calculateNodeSeparation(a, b);
      });

    this.root = tree(hierarchyRoot);

    // Calculate the minimum radius needed to prevent overlaps
    const optimalRadius = this.calculateOptimalRadius(this.root);
    this.optimalRadius.set(optimalRadius);

    // On first render, set radius to 2/3 of optimal
    if (!this.hasSetInitialRadius) {
      const initialRadius = Math.round((optimalRadius * 2) / 3);
      this.radius.set(initialRadius);
      this.calculatedRadius = initialRadius;
      this.hasSetInitialRadius = true;
      console.log(
        '[RADIUS] Setting initial radius to 2/3 of optimal:',
        initialRadius,
        'Optimal:',
        optimalRadius
      );
    }

    console.log(
      '[RADIUS] Optimal radius for no overlaps:',
      optimalRadius,
      'Current radius:',
      this.calculatedRadius
    );

    // Adjust radial positions based on parent text length
    this.adjustRadialPositions(this.root);

    // Update links and nodes using enter/update/exit pattern
    this.updateLinks();
    this.updateNodes();

    // Setup zoom functionality only once
    if (!this.zoomSetup) {
      this.setupZoom();
      this.zoomSetup = true;
    }
  }

  private updateLinks(): void {
    // Dynamic transition duration based on node count
    const nodeCount = this.nodeCount();
    const transitionDuration =
      nodeCount > 1000
        ? 0
        : nodeCount > 500
        ? 150
        : nodeCount > 100
        ? 300
        : 500;

    // Use cached selector or create and cache
    if (!this.cachedLinksGroup || this.cachedLinksGroup.empty()) {
      this.cachedLinksGroup = this.g.select<SVGGElement>('.links');
      if (this.cachedLinksGroup.empty()) {
        this.cachedLinksGroup = this.g
          .append('g')
          .attr('class', 'links')
          .attr('fill', 'none')
          .attr('stroke', this.svgDarkMode() ? '#666' : '#aaa')
          .attr('stroke-opacity', 0.2)
          .attr('stroke-width', 1.5);
      }
    }

    // Bind data with key function
    const links = this.cachedLinksGroup
      .selectAll<SVGPathElement, any>('path')
      .data(
        this.root.links(),
        (d: any) => `${d.source.data.ID}-${d.target.data.ID}`
      );

    // EXIT: Remove old links with transition
    links
      .exit()
      .transition()
      .duration(transitionDuration)
      .attr('stroke-opacity', 0)
      .remove();

    // Determine link generator based on style
    const linkStyle = this.linkStyle();
    let linkPath: (d: any) => string;

    switch (linkStyle) {
      case 'line':
        // Straight lines: simple path calculation, fastest
        linkPath = (d: any) => {
          const sourceX = Math.cos(d.source.x - Math.PI / 2) * d.source.y;
          const sourceY = Math.sin(d.source.x - Math.PI / 2) * d.source.y;
          const targetX = Math.cos(d.target.x - Math.PI / 2) * d.target.y;
          const targetY = Math.sin(d.target.x - Math.PI / 2) * d.target.y;
          return `M${sourceX},${sourceY}L${targetX},${targetY}`;
        };
        break;

      case 'curve':
        // Radial curves: smooth bezier curves
        const linkRadial = d3
          .linkRadial<any, D3Node>()
          .angle((d) => d.x)
          .radius((d) => d.y);
        linkPath = linkRadial as any;
        break;

      case 'diagonal':
        // Diagonal: cubic bezier curves in cartesian space
        linkPath = (d: any) => {
          const sourceX = Math.cos(d.source.x - Math.PI / 2) * d.source.y;
          const sourceY = Math.sin(d.source.x - Math.PI / 2) * d.source.y;
          const targetX = Math.cos(d.target.x - Math.PI / 2) * d.target.y;
          const targetY = Math.sin(d.target.x - Math.PI / 2) * d.target.y;
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          return `M${sourceX},${sourceY}Q${midX},${midY},${targetX},${targetY}`;
        };
        break;

      case 'orthogonal':
        // Orthogonal: step-wise right angle connections
        linkPath = (d: any) => {
          const sourceX = Math.cos(d.source.x - Math.PI / 2) * d.source.y;
          const sourceY = Math.sin(d.source.x - Math.PI / 2) * d.source.y;
          const targetX = Math.cos(d.target.x - Math.PI / 2) * d.target.y;
          const targetY = Math.sin(d.target.x - Math.PI / 2) * d.target.y;
          const midRadius = (d.source.y + d.target.y) / 2;
          const midX = Math.cos(d.source.x - Math.PI / 2) * midRadius;
          const midY = Math.sin(d.source.x - Math.PI / 2) * midRadius;
          return `M${sourceX},${sourceY}L${midX},${midY}L${targetX},${targetY}`;
        };
        break;

      case 'step':
        // Step: horizontal-first step connections
        linkPath = (d: any) => {
          const sourceX = Math.cos(d.source.x - Math.PI / 2) * d.source.y;
          const sourceY = Math.sin(d.source.x - Math.PI / 2) * d.source.y;
          const targetX = Math.cos(d.target.x - Math.PI / 2) * d.target.y;
          const targetY = Math.sin(d.target.x - Math.PI / 2) * d.target.y;
          const midRadius = (d.source.y + d.target.y) / 2;
          const midSourceX = Math.cos(d.source.x - Math.PI / 2) * midRadius;
          const midSourceY = Math.sin(d.source.x - Math.PI / 2) * midRadius;
          const midTargetX = Math.cos(d.target.x - Math.PI / 2) * midRadius;
          const midTargetY = Math.sin(d.target.x - Math.PI / 2) * midRadius;
          return `M${sourceX},${sourceY}L${midSourceX},${midSourceY}L${midTargetX},${midTargetY}L${targetX},${targetY}`;
        };
        break;

      default:
        // Default to curve
        const defaultLink = d3
          .linkRadial<any, D3Node>()
          .angle((d) => d.x)
          .radius((d) => d.y);
        linkPath = defaultLink as any;
    }

    // ENTER: Add new links
    const linksEnter = links
      .enter()
      .append('path')
      .attr('d', linkPath)
      .attr('stroke-opacity', 0);

    // UPDATE: Merge enter + update and transition
    links
      .merge(linksEnter)
      .transition()
      .duration(transitionDuration)
      .attr('d', linkPath)
      .attr('stroke-opacity', 0.2);
  }

  /**
   * Calculate the minimum radius needed to prevent any node/text overlaps
   * Analyzes the tree structure and estimates required spacing
   */
  private calculateOptimalRadius(
    root: d3.HierarchyPointNode<HierarchicalNode>
  ): number {
    const fontSize = 12;
    const baseOffset = 12;
    const safetyMargin = 8;

    // Get all nodes grouped by depth
    const nodesByDepth: d3.HierarchyPointNode<HierarchicalNode>[][] = [];
    root.descendants().forEach((node) => {
      if (!nodesByDepth[node.depth]) {
        nodesByDepth[node.depth] = [];
      }
      nodesByDepth[node.depth].push(node);
    });

    let maxRequiredRadius = 0;

    // For each depth level, calculate the minimum radius needed
    nodesByDepth.forEach((nodesAtDepth, depth) => {
      if (nodesAtDepth.length === 0) return;

      // Calculate the maximum text width at this depth
      const maxTextWidth = Math.max(
        ...nodesAtDepth.map((node) => {
          const textWidth = this.calculateTextWidth(
            node.data.Name || '',
            fontSize,
            0.25
          );
          return textWidth + baseOffset + safetyMargin;
        })
      );

      // Calculate angular spacing between nodes at this depth
      const angularSpread =
        nodesAtDepth.length > 1
          ? (2 * Math.PI) / nodesAtDepth.length
          : 2 * Math.PI;

      // For a given angular spacing, calculate the minimum radius where
      // arc length = radius * angle >= required text width
      const requiredRadiusForText = maxTextWidth / angularSpread;

      // Add depth-based minimum spacing
      const depthMultiplier = depth + 1;
      const radiusForThisDepth = Math.max(
        requiredRadiusForText,
        100 * depthMultiplier // Minimum radial spacing between depths
      );

      maxRequiredRadius = Math.max(maxRequiredRadius, radiusForThisDepth);
    });

    // Add extra margin for safety
    return Math.ceil(maxRequiredRadius * 1.2);
  }

  /**
   * Adjust radial positions of nodes based on parent text length
   * This prevents text overlap by pushing children further out when parents have long names
   */
  private adjustRadialPositions(
    node: d3.HierarchyPointNode<HierarchicalNode>
  ): void {
    // Perform collision detection and adjustment
    this.detectAndResolveCollisions(node);
  }

  /**
   * Detect and resolve text-to-node collisions in the radial tree
   * Uses bounding box collision detection in polar coordinates
   */
  private detectAndResolveCollisions(
    node: d3.HierarchyPointNode<HierarchicalNode>
  ): void {
    const fontSize = 12;
    const baseOffset = 12;
    const safetyMargin = 8; // Extra padding to ensure no overlap

    // Get all nodes in a flat array for collision checking
    const allNodes = node.descendants();

    // Process nodes from root to leaves (top-down)
    // This ensures parent text positions are finalized before checking children
    for (let i = 0; i < allNodes.length; i++) {
      const currentNode = allNodes[i];

      // Calculate the text bounding box for the current node
      const currentTextBounds = this.getTextBounds(
        currentNode,
        fontSize,
        baseOffset
      );

      // Check all deeper (higher radius) nodes for collisions
      for (let j = i + 1; j < allNodes.length; j++) {
        const deeperNode = allNodes[j];

        // Only check nodes that are actually deeper (larger radius)
        if (deeperNode.y && currentNode.y && deeperNode.y > currentNode.y) {
          // Get the deeper node's text bounds as well
          const deeperTextBounds = this.getTextBounds(
            deeperNode,
            fontSize,
            baseOffset
          );

          // Check BOTH:
          // 1. Does the deeper node's circle collide with current node's text?
          // 2. Does the deeper node's text collide with current node's text?
          const nodeCollides = this.nodeCollidesWithTextBounds(
            deeperNode,
            currentTextBounds
          );
          const textCollides = this.textBoundsCollide(
            deeperTextBounds,
            currentTextBounds
          );

          if (nodeCollides || textCollides) {
            // Calculate how much to push the deeper node outward
            // Need to clear both the current node's text AND ensure deeper text doesn't overlap
            const requiredRadius = Math.max(
              currentTextBounds.maxRadius + safetyMargin,
              // If text collides, we need to account for the deeper node's text extending backward
              textCollides ? currentTextBounds.maxRadius + safetyMargin : 0
            );
            const pushAmount = Math.max(0, requiredRadius - deeperNode.y);

            if (pushAmount > 0) {
              // Push this node and all its descendants outward
              this.pushNodeAndDescendants(deeperNode, pushAmount);

              // Recalculate deeper node's text bounds after pushing
              // (This is important for subsequent collision checks)
            }
          }
        }
      }
    }
  }

  /**
   * Calculate the bounding box of a node's text in polar coordinates
   */
  private getTextBounds(
    node: any,
    fontSize: number,
    baseOffset: number
  ): {
    minAngle: number;
    maxAngle: number;
    minRadius: number;
    maxRadius: number;
  } {
    const textOffsetMultiplier = this.getTextOffsetMultiplier(node);
    const actualTextOffset = baseOffset * textOffsetMultiplier;

    // Calculate text width with padding (extends tangentially, not radially)
    const textWidth = this.calculateTextWidth(
      node.data.Name || '',
      fontSize,
      0.25 // Increased padding for safety
    );

    // Node position
    const angle = node.x; // Angle in radians
    const radius = node.y; // Radial distance
    const nodeCircleRadius = 6;

    // The complete radial extent includes:
    // 1. Node circle (radius - nodeCircleRadius to radius + nodeCircleRadius)
    // 2. Gap between node and text (actualTextOffset)
    // 3. Text height (fontSize)
    const minRadius = radius - nodeCircleRadius;
    const maxRadius = radius + nodeCircleRadius + actualTextOffset + fontSize;

    // Text extends tangentially (along the arc) from the node
    // The text center is at radius + nodeCircleRadius + actualTextOffset
    const textCenterRadius = radius + nodeCircleRadius + actualTextOffset;

    // Calculate angular spread at the text center radius
    // We need to include:
    // 1. The node circle's angular footprint
    // 2. The text's angular footprint
    const nodeAngularFootprint = (nodeCircleRadius * 2) / Math.max(radius, 50);
    const textAngularSpread = textWidth / Math.max(textCenterRadius, 50);
    const totalAngularSpread = nodeAngularFootprint + textAngularSpread;

    // Text direction: if angle < π, text goes right (positive angle)
    // if angle >= π, text goes left (negative angle) due to rotation
    let minAngle: number, maxAngle: number;

    if (angle < Math.PI) {
      // Text extends in positive angular direction
      // Start from node center minus half node footprint
      minAngle = angle - nodeAngularFootprint / 2;
      maxAngle = angle + nodeAngularFootprint / 2 + textAngularSpread;
    } else {
      // Text extends in negative angular direction (due to 180° rotation)
      // Start from node center plus half node footprint
      minAngle = angle - nodeAngularFootprint / 2 - textAngularSpread;
      maxAngle = angle + nodeAngularFootprint / 2;
    }

    return {
      minAngle,
      maxAngle,
      minRadius,
      maxRadius,
    };
  }

  /**
   * Check if a node's position collides with a text bounding box
   */
  private nodeCollidesWithTextBounds(
    node: any,
    textBounds: {
      minAngle: number;
      maxAngle: number;
      minRadius: number;
      maxRadius: number;
    }
  ): boolean {
    const nodeAngle = node.x;
    const nodeRadius = node.y;
    const nodeCircleRadius = 6;
    const safetyBuffer = 4; // Extra space for safety

    // Normalize angles to handle wraparound at 2π
    const normalizeAngle = (a: number) => {
      while (a < 0) a += 2 * Math.PI;
      while (a > 2 * Math.PI) a -= 2 * Math.PI;
      return a;
    };

    const normNodeAngle = normalizeAngle(nodeAngle);
    const normMinAngle = normalizeAngle(textBounds.minAngle);
    const normMaxAngle = normalizeAngle(textBounds.maxAngle);

    // Expand the bounds slightly for safety
    const expandedMinAngle = normalizeAngle(normMinAngle - 0.05); // ~3 degrees
    const expandedMaxAngle = normalizeAngle(normMaxAngle + 0.05);

    // Check if node angle is within expanded text angular bounds
    let angleOverlaps = false;
    if (expandedMaxAngle >= expandedMinAngle) {
      angleOverlaps =
        normNodeAngle >= expandedMinAngle && normNodeAngle <= expandedMaxAngle;
    } else {
      // Handle wraparound case
      angleOverlaps =
        normNodeAngle >= expandedMinAngle || normNodeAngle <= expandedMaxAngle;
    }

    // Check if node radius overlaps with text radial bounds
    // Node occupies radius ± nodeCircleRadius, add safety buffer
    const nodeMinRadius = nodeRadius - nodeCircleRadius - safetyBuffer;
    const nodeMaxRadius = nodeRadius + nodeCircleRadius + safetyBuffer;

    const radiusOverlaps = !(
      nodeMinRadius > textBounds.maxRadius ||
      nodeMaxRadius < textBounds.minRadius
    );

    return angleOverlaps && radiusOverlaps;
  }

  /**
   * Check if two text bounding boxes collide
   */
  private textBoundsCollide(
    bounds1: {
      minAngle: number;
      maxAngle: number;
      minRadius: number;
      maxRadius: number;
    },
    bounds2: {
      minAngle: number;
      maxAngle: number;
      minRadius: number;
      maxRadius: number;
    }
  ): boolean {
    const safetyBuffer = 0.05; // ~3 degrees in radians
    const radialBuffer = 4; // 4 pixels

    // Normalize angles to handle wraparound at 2π
    const normalizeAngle = (a: number) => {
      while (a < 0) a += 2 * Math.PI;
      while (a > 2 * Math.PI) a -= 2 * Math.PI;
      return a;
    };

    const norm1Min = normalizeAngle(bounds1.minAngle - safetyBuffer);
    const norm1Max = normalizeAngle(bounds1.maxAngle + safetyBuffer);
    const norm2Min = normalizeAngle(bounds2.minAngle - safetyBuffer);
    const norm2Max = normalizeAngle(bounds2.maxAngle + safetyBuffer);

    // Check angular overlap (accounting for wraparound)
    let angleOverlaps = false;

    // Helper function to check if angle is within range
    const angleInRange = (angle: number, min: number, max: number): boolean => {
      if (max >= min) {
        return angle >= min && angle <= max;
      } else {
        // Wraparound case
        return angle >= min || angle <= max;
      }
    };

    // Check if ranges overlap
    if (
      angleInRange(norm2Min, norm1Min, norm1Max) ||
      angleInRange(norm2Max, norm1Min, norm1Max) ||
      angleInRange(norm1Min, norm2Min, norm2Max) ||
      angleInRange(norm1Max, norm2Min, norm2Max)
    ) {
      angleOverlaps = true;
    }

    // Check radial overlap with buffer
    const radiusOverlaps = !(
      bounds1.minRadius - radialBuffer > bounds2.maxRadius + radialBuffer ||
      bounds1.maxRadius + radialBuffer < bounds2.minRadius - radialBuffer
    );

    return angleOverlaps && radiusOverlaps;
  }

  /**
   * Push a node and all its descendants outward by a given amount
   */
  private pushNodeAndDescendants(
    node: d3.HierarchyPointNode<HierarchicalNode>,
    pushAmount: number
  ): void {
    node.y = (node.y || 0) + pushAmount;

    if (node.children) {
      node.children.forEach((child) => {
        this.pushNodeAndDescendants(child, pushAmount);
      });
    }
  }

  private updateNodes(): void {
    // Use cached selector or create and cache
    if (!this.cachedNodesGroup || this.cachedNodesGroup.empty()) {
      this.cachedNodesGroup = this.g.select<SVGGElement>('.nodes');
      if (this.cachedNodesGroup.empty()) {
        this.cachedNodesGroup = this.g.append('g').attr('class', 'nodes');
      }
    }

    // Dynamic transition duration based on node count
    const nodeCount = this.nodeCount();
    const transitionDuration =
      nodeCount > 1000
        ? 0
        : nodeCount > 500
        ? 150
        : nodeCount > 100
        ? 300
        : 500;

    // Bind data with key function - using g elements for grouping
    const nodes = this.cachedNodesGroup
      .selectAll<SVGGElement, any>('g.node')
      .data(this.root.descendants(), (d: any) => `g_${d.data.ID}`);

    // EXIT: Remove old node groups with transition
    nodes
      .exit()
      .transition()
      .duration(transitionDuration)
      .attr('opacity', 0)
      .remove();

    // ENTER: Add new node groups
    const nodesEnter = nodes
      .enter()
      .append('g')
      .attr('id', (d: any) => `g_${d.data.ID}`)
      .attr('class', 'node')
      .attr(
        'transform',
        (d: any) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      )
      .attr('opacity', 0);

    // Add circles to node groups
    nodesEnter
      .append('circle')
      .attr('id', (d: any) => `c_${d.data.ID}`)
      .attr('r', 6)
      .attr('stroke', this.svgDarkMode() ? '#333' : '#fff')
      .attr('stroke-width', 2)
      .attr('fill', (d: any) =>
        this.colorTarget() === 'nodes'
          ? this.getNodeColor(d, this.colorMode())
          : this.svgDarkMode()
          ? '#fff'
          : '#333'
      );

    // Add text labels to node groups
    nodesEnter
      .append('text')
      .attr('id', (d: any) => `t_${d.data.ID}`)
      .attr('dy', '0.31em')
      .attr('x', (d: any) => {
        const baseOffset = 12;
        const multiplier = this.getTextOffsetMultiplier(d);
        return this.shouldFlipText(d.x)
          ? -baseOffset * multiplier
          : baseOffset * multiplier;
      })
      .attr('text-anchor', (d: any) =>
        this.shouldFlipText(d.x) ? 'end' : 'start'
      )
      .attr('transform', (d: any) =>
        this.shouldFlipText(d.x) ? 'rotate(180)' : null
      )
      .attr('fill', (d: any) =>
        this.colorTarget() === 'text'
          ? this.getNodeColor(d, this.colorMode())
          : this.svgDarkMode()
          ? '#fff'
          : '#333'
      )
      .attr('font-family', 'Courier New, monospace')
      .attr('font-size', 12)
      .attr('font-weight', 400)
      .text((d: any) => this.truncateText(d.data.Name));

    // UPDATE: Merge enter + update and transition
    const nodesMerge = nodes.merge(nodesEnter);

    nodesMerge
      .transition()
      .duration(transitionDuration)
      .attr(
        'transform',
        (d: any) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      )
      .attr('opacity', 1);

    // Update circles
    nodesMerge
      .selectAll('circle')
      .transition()
      .duration(transitionDuration)
      .attr('fill', (d: any) =>
        this.colorTarget() === 'nodes'
          ? this.getNodeColor(d, this.colorMode())
          : this.svgDarkMode()
          ? '#fff'
          : '#333'
      )
      .attr('stroke', this.svgDarkMode() ? '#333' : '#fff');

    // Update text
    nodesMerge
      .selectAll('text')
      .transition()
      .duration(transitionDuration)
      .attr('x', (d: any) => {
        const baseOffset = 12;
        const multiplier = this.getTextOffsetMultiplier(d);
        return this.shouldFlipText(d.x)
          ? -baseOffset * multiplier
          : baseOffset * multiplier;
      })
      .attr('text-anchor', (d: any) =>
        this.shouldFlipText(d.x) ? 'end' : 'start'
      )
      .attr('transform', (d: any) =>
        this.shouldFlipText(d.x) ? 'rotate(180)' : null
      )
      .attr('fill', (d: any) =>
        this.colorTarget() === 'text'
          ? this.getNodeColor(d, this.colorMode())
          : this.svgDarkMode()
          ? '#fff'
          : '#333'
      )
      .text((d: any) => this.truncateText(d.data.Name));
  }

  private updateNodeColors(mode: ColorMode): void {
    // Update based on color target
    if (this.colorTarget() === 'nodes') {
      // Apply colors to circles
      this.g
        .selectAll('.nodes circle')
        .transition()
        .duration(500)
        .attr('fill', (d: any) => this.getNodeColor(d, mode));

      // Set text to contrast color
      this.g
        .selectAll('.nodes text')
        .transition()
        .duration(500)
        .attr('fill', this.svgDarkMode() ? '#fff' : '#333');
    } else {
      // Apply colors to text
      this.g
        .selectAll('.nodes text')
        .transition()
        .duration(500)
        .attr('fill', (d: any) => this.getNodeColor(d, mode));

      // Set circles to contrast color
      this.g
        .selectAll('.nodes circle')
        .transition()
        .duration(500)
        .attr('fill', this.svgDarkMode() ? '#fff' : '#333');
    }
  }

  private getNodeColor(
    d: d3.HierarchyPointNode<HierarchicalNode>,
    mode: ColorMode
  ): string {
    // Use cache for performance
    const cacheKey = `${mode}-${d.data.ID}-${d.depth}`;
    if (this.colorCache.has(cacheKey)) {
      return this.colorCache.get(cacheKey)!;
    }

    let color: string;
    switch (mode) {
      case 'status':
        color = this.statusColorScale(d.data.Status || 'inactive') as string;
        break;

      case 'depth':
        color = this.depthColorScale(d.depth) as string;
        break;

      case 'category':
        color = this.categoryColorScale(d.data.Category || 'Unknown') as string;
        break;

      case 'value':
        color = this.valueColorScale(d.data.Value || 0) as string;
        break;

      case 'custom':
        color = this.customColorScale(
          d.data.CustomProperty || 'Unknown'
        ) as string;
        break;

      case 'branch-block':
        color = this.getBranchColor(d);
        break;

      case 'branch-gradient':
        color = this.getBranchGradientColor(d);
        break;

      case 'red-block':
        color = '#FF0000';
        break;

      case 'red-gradient':
        color = this.getSingleColorGradient(d, '#FF0000');
        break;

      case 'orange-block':
        color = '#FF7F00';
        break;

      case 'orange-gradient':
        color = this.getSingleColorGradient(d, '#FF7F00');
        break;

      case 'yellow-block':
        color = '#FFFF00';
        break;

      case 'yellow-gradient':
        color = this.getSingleColorGradient(d, '#FFFF00');
        break;

      case 'green-block':
        color = '#00FF00';
        break;

      case 'green-gradient':
        color = this.getSingleColorGradient(d, '#00FF00');
        break;

      case 'blue-block':
        color = '#0000FF';
        break;

      case 'blue-gradient':
        color = this.getSingleColorGradient(d, '#0000FF');
        break;

      case 'indigo-block':
        color = '#4B0082';
        break;

      case 'indigo-gradient':
        color = this.getSingleColorGradient(d, '#4B0082');
        break;

      case 'violet-block':
        color = '#9400D3';
        break;

      case 'violet-gradient':
        color = this.getSingleColorGradient(d, '#9400D3');
        break;

      case 'grayscale-block':
        color = '#888888';
        break;

      case 'grayscale-gradient':
        color = this.getSingleColorGradient(d, '#000000');
        break;

      default:
        color = '#999';
    }

    // Cache the result
    this.colorCache.set(cacheKey, color);
    return color;
  }

  /**
   * Calculate if text should be flipped based on node angle and current rotation
   * Returns true if the effective angle is on the left side (would be upside down)
   */
  private shouldFlipText(nodeAngle: number): boolean {
    const rotationRadians = (this.rotation() * Math.PI) / 180;
    const nodeOffsetRadians = -Math.PI / 2; // Account for the -90° in node transform

    // Calculate effective angle after rotation and offset (normalize to 0-2π)
    let effectiveAngle =
      (nodeAngle + rotationRadians + nodeOffsetRadians) % (2 * Math.PI);
    if (effectiveAngle < 0) effectiveAngle += 2 * Math.PI;

    // Flip if on left side (>= π means left half of circle)
    return effectiveAngle >= Math.PI;
  }

  private getBranchColor(d: d3.HierarchyPointNode<HierarchicalNode>): string {
    // If it's the root, return gray
    if (!d.parent) {
      return '#888';
    }

    // Find the top-level ancestor (direct child of root)
    let ancestor = d;
    while (ancestor.parent && ancestor.parent.parent) {
      ancestor = ancestor.parent;
    }

    // Get the index of this ancestor among root's children
    if (ancestor.parent) {
      const children = ancestor.parent.children || [];
      const index = children.indexOf(ancestor as any);
      return this.branchColors[index % this.branchColors.length];
    }

    return '#888';
  }

  private getBranchGradientColor(
    d: d3.HierarchyPointNode<HierarchicalNode>
  ): string {
    // If it's the root, return gray
    if (!d.parent) {
      return '#888';
    }

    // Find the top-level ancestor (direct child of root)
    let ancestor = d;
    let depth = 0;
    while (ancestor.parent && ancestor.parent.parent) {
      ancestor = ancestor.parent;
      depth++;
    }

    // Get the base color for this branch
    if (ancestor.parent) {
      const children = ancestor.parent.children || [];
      const index = children.indexOf(ancestor as any);
      const baseColor = this.branchColors[index % this.branchColors.length];

      // Convert hex to RGB
      const rgb = this.hexToRgb(baseColor);
      if (!rgb) return baseColor;

      // Calculate lightness factor (0 = light, 1 = dark)
      // Use depth relative to the branch to create gradient
      const maxDepth = this.getMaxDepth(ancestor);
      const lightnessFactor = maxDepth > 0 ? depth / maxDepth : 0;

      // Interpolate from light (add white) to original color
      const r = Math.round(rgb.r + (255 - rgb.r) * (1 - lightnessFactor));
      const g = Math.round(rgb.g + (255 - rgb.g) * (1 - lightnessFactor));
      const b = Math.round(rgb.b + (255 - rgb.b) * (1 - lightnessFactor));

      return `rgb(${r}, ${g}, ${b})`;
    }

    return '#888';
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private getMaxDepth(node: d3.HierarchyPointNode<HierarchicalNode>): number {
    if (!node.children || node.children.length === 0) {
      return 0;
    }
    return (
      1 + Math.max(...node.children.map((child) => this.getMaxDepth(child)))
    );
  }

  private getSingleColorGradient(
    d: d3.HierarchyPointNode<HierarchicalNode>,
    baseColor: string
  ): string {
    // Convert hex to RGB
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return baseColor;

    // Calculate lightness factor based on depth from root
    const maxDepth = this.root ? this.root.height : 5;
    const lightnessFactor = maxDepth > 0 ? d.depth / maxDepth : 0;

    // Interpolate from light (add white) to original color
    const r = Math.round(rgb.r + (255 - rgb.r) * (1 - lightnessFactor));
    const g = Math.round(rgb.g + (255 - rgb.g) * (1 - lightnessFactor));
    const b = Math.round(rgb.b + (255 - rgb.b) * (1 - lightnessFactor));

    return `rgb(${r}, ${g}, ${b})`;
  }

  onColorModeChange(mode: ColorMode): void {
    this.colorMode.set(mode);
  }

  onNodeCountChange(count: number): void {
    this.nodeCount.set(count);
  }

  onMaxNameLengthChange(length: number): void {
    this.maxNameLength.set(length);
  }

  onRegenerateTree(): void {
    this.generateMockData(this.nodeCount());
    this.renderRadialTree();
  }

  onToggleSvgDarkMode(): void {
    this.svgDarkMode.set(!this.svgDarkMode());
  }

  onLinkStyleChange(style: LinkStyle): void {
    this.linkStyle.set(style);
  }

  onColorTargetChange(target: 'nodes' | 'text'): void {
    this.colorTarget.set(target);
  }

  onShowLabelsChange(show: boolean): void {
    this.showLabels.set(show);
  }

  onRadiusChange(radius: number): void {
    console.log('[EVENT] onRadiusChange called with:', radius);
    this.radius.set(radius);
    console.log('[EVENT] radius signal now:', this.radius());
  }

  onRotationChange(rotation: number): void {
    this.rotation.set(rotation);
  }

  onLayoutTypeChange(type: LayoutType): void {
    this.layoutType.set(type);
  }

  /**
   * Calculate the minimum text width based on font size and text length
   * @param text The text string to measure
   * @param fontSize Font size in pixels
   * @param paddingPercentage Additional padding as a percentage (e.g., 0.2 for 20% padding)
   * @returns The estimated text width including padding
   */
  private calculateTextWidth(
    text: string,
    fontSize: number,
    paddingPercentage: number
  ): number {
    // Monospace fonts (Courier New) character width is approximately 0.6 * fontSize
    // Increase this to be more conservative and ensure no overlap
    const charWidth = fontSize * 0.7; // Increased from 0.6 to 0.7
    const baseWidth = text.length * charWidth;
    const padding = baseWidth * paddingPercentage;
    return baseWidth + padding;
  }

  /**
   * Calculate text offset to prevent overlap in single-child chains
   * Alternates text placement for consecutive single-child nodes
   * @param d The node data
   * @returns Text offset multiplier (1 for normal, 2-4 for adjusted)
   */
  private getTextOffsetMultiplier(d: any): number {
    // Use consistent small spacing for all nodes
    // The collision detection system handles pushing nodes apart when needed
    return 1;
  }

  /**
   * Truncate text if it's too long to prevent extreme overlap
   * @param text The text to potentially truncate
   * @param maxLength Maximum length before truncation
   * @returns Truncated text with ellipsis if needed
   */
  private truncateText(text: string, maxLength: number = 60): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 1) + '\u2026';
  }

  /**
   * Calculate the angular separation needed between two nodes to prevent text overlap
   * @param a First node
   * @param b Second node
   * @returns The separation value for d3.tree
   */
  private calculateNodeSeparation(
    a: d3.HierarchyPointNode<HierarchicalNode>,
    b: d3.HierarchyPointNode<HierarchicalNode>
  ): number {
    // For large trees, use simplified calculation
    if (this.nodeCount() > 500) {
      const depthFactor = Math.max(1, Math.sqrt(a.depth));
      const baseSep = (a.parent === b.parent ? 3 : 6) / depthFactor;
      console.log(
        '[SEPARATION] Large tree mode - baseSep:',
        baseSep,
        'nodeCount:',
        this.nodeCount()
      );
      return baseSep;
    }

    const fontSize = 12;
    const paddingPercentage = 0.25;
    const textOffset = 16;

    // Cache text width calculations to avoid redundant work
    const aTextWidth = this.calculateTextWidth(
      a.data.Name || '',
      fontSize,
      paddingPercentage
    );
    const bTextWidth = this.calculateTextWidth(
      b.data.Name || '',
      fontSize,
      paddingPercentage
    );

    const maxTextWidth = Math.max(aTextWidth, bTextWidth);
    const radiusAtDepth = a.y || this.calculatedRadius * (a.depth / 10);
    const requiredArcLength = maxTextWidth + textOffset;
    const minAngularSeparation =
      requiredArcLength / Math.max(radiusAtDepth, 100);

    // Base structural separation based on tree hierarchy
    const nodeCount = this.nodeCount();
    const depthFactor = Math.max(1, Math.sqrt(a.depth));
    const nodeCountFactor = nodeCount < 100 ? 1.5 : nodeCount < 500 ? 1.2 : 1.0;

    // Special handling for single child nodes - offset to one side
    let baseSeparation: number;
    if (a.parent === b.parent) {
      // Siblings
      const siblingCount = a.parent?.children?.length || 0;
      if (siblingCount === 1) {
        // Single child: use larger offset to move it to one side
        baseSeparation = 6 / depthFactor;
      } else {
        // Multiple children: normal sibling spacing
        baseSeparation = 4 / depthFactor;
      }
    } else {
      // Different parents
      baseSeparation = 8 / depthFactor;
    }

    // Convert angular separation to d3.tree separation units (which uses 2π as full circle)
    const textBasedSeparation = (minAngularSeparation / (2 * Math.PI)) * 100;

    // Use the maximum of text-based and structural separation
    const finalSeparation = Math.max(baseSeparation, textBasedSeparation);

    return finalSeparation * nodeCountFactor;
  }

  private setupZoom(): void {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 20])
      .on('zoom', (event) => {
        const rotation = this.rotation();
        this.g
          .transition()
          .duration(Math.max(200, 600 - event.transform.k * 200))
          .ease(d3.easeLinear)
          .attr(
            'transform',
            `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k}) rotate(${rotation})`
          );
      });

    this.svg.call(zoom as any);

    // Double-click to reset zoom
    this.svg.on('dblclick.zoom', () => {
      const rotation = this.rotation();
      this.svg
        .transition()
        .duration(750)
        .call(
          zoom.transform as any,
          d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(1)
        );
    });
  }

  private updateVisualizationColors(darkMode: boolean): void {
    // Update node stroke
    this.g
      .selectAll('.nodes circle')
      .transition()
      .duration(300)
      .attr('stroke', darkMode ? '#333' : '#fff');

    // Update fills based on color target
    if (this.colorTarget() === 'nodes') {
      // Circles have colors, text has contrast
      this.g
        .selectAll('.nodes text')
        .transition()
        .duration(300)
        .attr('fill', darkMode ? '#fff' : '#333');

      this.g
        .selectAll('.nodes circle')
        .transition()
        .duration(300)
        .attr('fill', (d: any) => this.getNodeColor(d, this.colorMode()));
    } else {
      // Text has colors, circles have contrast
      this.g
        .selectAll('.nodes circle')
        .transition()
        .duration(300)
        .attr('fill', darkMode ? '#fff' : '#333');

      this.g
        .selectAll('.nodes text')
        .transition()
        .duration(300)
        .attr('fill', (d: any) => this.getNodeColor(d, this.colorMode()));
    }

    // Update link color
    this.g
      .selectAll('.links path')
      .transition()
      .duration(300)
      .attr('stroke', darkMode ? '#666' : '#aaa');
  }
}
