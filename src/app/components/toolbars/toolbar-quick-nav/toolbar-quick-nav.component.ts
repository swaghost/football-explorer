import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import * as d3 from 'd3';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  QuickNavState,
  SetDefaultLevelExpansion,
  SetTreeExpansionState,
  UpdateNodeExpansion,
  ResetTreeExpansionState,
  UpdateTreeNodeCount,
} from '../../../state/quick-nav.state';
import { ColorsService } from '../../../services/colors.service';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';

// Tree node interface compatible with the main component
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  _children?: TreeNode[]; // Hidden children when collapsed
  x?: number;
  y?: number;
  depth?: number;
}

// D3 hierarchy node type for collapsible tree
export interface D3HierarchyNode extends d3.HierarchyPointNode<TreeNode> {
  id?: string;
  _children?: D3HierarchyNode[];
  x0?: number; // Previous x position for animations
  y0?: number; // Previous y position for animations
}

@Component({
  selector: 'app-toolbar-quick-nav',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-quick-nav.component.html',
  styleUrls: ['./toolbar-quick-nav.component.scss'],
})
export class ToolbarQuickNavComponent
  extends BaseToolbarComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  // Required base component properties
  readonly toolbarId = 'quick-nav-toolbar';
  readonly toolbarTitle = 'Quick-Nav';
  readonly toolbarIcon = '🌳';

  // Help text for this toolbar
  @ViewChild('treeContainer', { static: false })
  treeContainer!: ElementRef<HTMLDivElement>;

  // Quick-Nav specific inputs
  @Input() treeData: TreeNode | null = null;
  @Input() selectedNode: string | null = null;
  @Input() selectedNodes: string[] = []; // Array of selected node IDs
  @Input() followSelectedNode = true; // Enable/disable follow functionality

  // Quick-Nav specific outputs
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() nodeToggleSelection = new EventEmitter<string>(); // For shift-click multi-selection

  // D3 elements
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;
  private root: D3HierarchyNode | null = null;

  // Component properties
  private width = 300;
  private height = 400;
  private duration = 250;
  private nodeHeight = 20; // Tight spacing like D3ExampleCollapsibleTree
  private indent = 20; // Indentation per level
  private i = 0; // Counter for unique node IDs

  // NGXS state properties
  public defaultLevelExpansion = 1;
  private expansionState: Record<string, boolean> = {};
  private lastNodeCount = 0;
  public currentNodeCount = 0; // Made public for template access

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store,
    private colorsService: ColorsService
  ) {
    super();
    // Load state from NGXS
    this.defaultLevelExpansion = this.store.selectSnapshot(
      QuickNavState.defaultLevelExpansion
    );
    this.expansionState = this.store.selectSnapshot(
      QuickNavState.treeExpansionState
    );
    this.lastNodeCount = this.store.selectSnapshot(
      QuickNavState.lastTreeNodeCount
    );

    console.log(
      `📍 QuickNav initialized with default expansion: ${this.defaultLevelExpansion} levels`
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();

    // Subscribe to NGXS state changes
    this.store
      .select(QuickNavState.defaultLevelExpansion)
      .subscribe((level) => {
        if (level !== this.defaultLevelExpansion) {
          console.log(
            `📡 NGXS state changed default expansion: ${this.defaultLevelExpansion} → ${level}`
          );
          this.defaultLevelExpansion = level;
          this.cdr.detectChanges();

          // Reinitialize tree with new expansion level if tree is visible and data exists
          if (this.treeData && this.expanded && this.visible && this.root) {
            this.initializeTree();
          }
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.expanded && this.visible) {
      // Small delay to ensure NGXS state is loaded and DOM is ready
      setTimeout(() => {
        // Refresh defaultLevelExpansion from state in case it wasn't loaded yet
        this.defaultLevelExpansion = this.store.selectSnapshot(
          QuickNavState.defaultLevelExpansion
        );
        this.initializeTree();
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle tree data changes - this is the primary trigger for updates
    if (changes['treeData'] && this.treeData) {
      this.updateTree();
    }

    // Handle expansion state changes
    if (changes['expanded'] && this.expanded && this.visible) {
      // Reset root reference when expanding to force full reinitialization
      this.root = null as any;
      this.svg = null as any;
      setTimeout(() => {
        // Refresh defaultLevelExpansion from state
        this.defaultLevelExpansion = this.store.selectSnapshot(
          QuickNavState.defaultLevelExpansion
        );
        this.initializeTree();
      }, 100);
    }

    // Handle toolbar becoming visible - always initialize tree if expanded
    if (changes['visible'] && this.visible && this.expanded) {
      // Reset root reference when becoming visible to force full reinitialization
      this.root = null as any;
      this.svg = null as any;
      setTimeout(() => {
        // Refresh defaultLevelExpansion from state
        this.defaultLevelExpansion = this.store.selectSnapshot(
          QuickNavState.defaultLevelExpansion
        );
        this.initializeTree();
      }, 100);
    }

    // Handle when both visible and treeData become available - important for first load
    if (
      (changes['visible'] || changes['treeData']) &&
      this.visible &&
      this.expanded &&
      this.treeData &&
      !this.root
    ) {
      setTimeout(() => {
        // Refresh defaultLevelExpansion from state
        this.defaultLevelExpansion = this.store.selectSnapshot(
          QuickNavState.defaultLevelExpansion
        );
        this.initializeTree();
      }, 100);
    }

    // Handle dark mode changes - update text colors
    if (changes['isDarkMode'] && this.root) {
      this.update(this.root);
    }

    if (changes['selectedNode'] && this.selectedNode && this.root) {
      // The selected node highlighting is now handled in updateNodes method
      // during the normal update cycle - trigger a refresh
      this.update(this.root);

      // Add follow functionality - only if enabled and toolbar is visible
      if (this.followSelectedNode && this.visible && this.expanded) {
        this.expandToAndScrollToNode(this.selectedNode);
      }
    }

    if (changes['selectedNodes'] && this.root) {
      // Update visual highlighting when selectedNodes array changes
      this.update(this.root);
    }

    // Handle newly opened toolbar - scroll to selected node if one exists
    if (
      changes['visible'] &&
      this.visible &&
      this.selectedNode &&
      this.followSelectedNode
    ) {
      setTimeout(() => {
        if (this.selectedNode) {
          this.expandToAndScrollToNode(this.selectedNode);
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.svg) {
      this.svg.remove();
    }
  }

  onDefaultLevelExpansionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Math.max(0, Math.min(10, parseInt(target.value, 10) || 0));
    this.defaultLevelExpansion = value;

    console.log(`🔢 User changed default expansion to: ${value} levels`);

    // Update NGXS state
    this.store.dispatch(new SetDefaultLevelExpansion(value));

    // Clear expansion state so the new default takes effect
    this.store.dispatch(new ResetTreeExpansionState(this.currentNodeCount));

    // Reinitialize tree with new expansion level
    if (this.treeData && this.expanded && this.visible) {
      this.initializeTree();
    }
  }

  private initializeTree(): void {
    if (!this.treeContainer?.nativeElement || !this.treeData) {
      return;
    }

    console.log(
      `🌳 Initializing tree with ${this.defaultLevelExpansion} level expansion`
    );

    // Clear any existing SVG
    d3.select(this.treeContainer.nativeElement).selectAll('*').remove();

    // Create SVG with bar-style layout (no margins needed)
    this.svg = d3
      .select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('font', '12px sans-serif')
      .style('user-select', 'none');

    // Initialize root for indented layout
    this.root = d3.hierarchy(
      this.treeData,
      (d) => d.children
    ) as D3HierarchyNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Start with all nodes collapsed (move children to _children)
    this.collapse(this.root);

    // Apply default level expansion first
    this.applyDefaultExpansion(this.root, 0);

    // Only restore state if there's meaningful saved state, and we're not in a manual initialization
    this.store
      .select(QuickNavState.treeExpansionState)
      .pipe(take(1))
      .subscribe((expansionState) => {
        const hasExpansionState = Object.keys(expansionState).length > 0;

        // Only apply saved state if it exists and we have the same node count
        // This prevents old saved state from overriding new default expansion settings
        if (
          hasExpansionState &&
          this.currentNodeCount ===
            this.store.selectSnapshot(QuickNavState.lastTreeNodeCount)
        ) {
          console.log(
            `🔄 Restoring saved expansion state for ${this.currentNodeCount} nodes`
          );
          this.applyExpansionState(
            this.root!,
            expansionState as Record<string, boolean>
          );
        } else {
          console.log(
            `🌳 Using default expansion: ${this.defaultLevelExpansion} levels`
          );
        }

        this.update(this.root!);
      });
  }

  private updateTree(): void {
    if (!this.root || !this.treeData) {
      this.initializeTree();
      return;
    }

    // Store current node count for comparison
    const previousNodeCount = this.currentNodeCount;

    // Update the root data
    this.root = d3.hierarchy(
      this.treeData,
      (d) => d.children
    ) as D3HierarchyNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Count nodes in new tree
    this.currentNodeCount = this.countNodes(this.root);

    // If node count changed, reset expansion state and apply default expansion
    if (this.currentNodeCount !== previousNodeCount) {
      // Refresh defaultLevelExpansion from state when tree data changes
      this.defaultLevelExpansion = this.store.selectSnapshot(
        QuickNavState.defaultLevelExpansion
      );

      console.log(
        `🔄 New tree loaded (${this.currentNodeCount} nodes) - applying ${this.defaultLevelExpansion} level expansion`
      );

      // Start with all nodes collapsed
      this.collapse(this.root);

      this.store.dispatch(new ResetTreeExpansionState(this.currentNodeCount));
      this.applyDefaultExpansion(this.root, 0);
      this.update(this.root);
    } else {
      // Otherwise, restore previous expansion state if available
      this.store
        .select(QuickNavState.treeExpansionState)
        .pipe(take(1))
        .subscribe((expansionState) => {
          const hasExpansionState = Object.keys(expansionState).length > 0;
          if (hasExpansionState) {
            this.applyExpansionState(
              this.root!,
              expansionState as Record<string, boolean>
            );
          } else {
            this.applyDefaultExpansion(this.root!, 0);
          }

          this.update(this.root!);
        });
    }
  }

  private update(source: D3HierarchyNode): void {
    if (!this.root || !this.svg) return;

    // Get all visible nodes (flattened list) like D3ExampleCollapsibleTree
    const nodes = this.flatten(this.root);
    const height = Math.max(400, nodes.length * this.nodeHeight + 40);

    // Update SVG height
    this.svg.attr('height', height);

    // Assign positions with indented layout
    let index = -1;
    nodes.forEach((d: any) => {
      d.y0 = d.y;
      d.y = ++index * this.nodeHeight + 20;
      d.x = d.depth * this.indent + 20; // Add left margin
    });

    // Update links (connection lines) first
    this.updateLinks(nodes, source);

    // Update nodes using enter/update/exit pattern
    this.updateNodes(nodes, source);

    // Store old positions for next transition
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Flatten tree to get visible nodes (from D3ExampleCollapsibleTree)
  private flatten(root: D3HierarchyNode): D3HierarchyNode[] {
    const nodes: D3HierarchyNode[] = [];

    function recurse(node: D3HierarchyNode) {
      nodes.push(node);
      if (node.children) {
        node.children.forEach(recurse);
      }
    }

    recurse(root);
    return nodes;
  }

  // Update links (connection lines) between nodes
  private updateLinks(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
    if (!this.svg) return;

    // Generate links data - each node (except root) needs a link to its parent
    const links = nodes.slice(1); // Skip root node

    // Bind data with proper key function
    const link = this.svg.selectAll('.link').data(links, (d: any) => d.id);

    // ENTER new links
    const linkEnter = link
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('opacity', 0);

    // Add horizontal line from parent to child
    linkEnter
      .append('line')
      .attr('class', 'link-horizontal')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', this.isDarkMode ? '#4a5568' : '#ccc')
      .style('stroke-width', 1);

    // Add vertical connector from parent level to child level
    linkEnter
      .append('line')
      .attr('class', 'link-vertical')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', this.isDarkMode ? '#4a5568' : '#ccc')
      .style('stroke-width', 1);

    // UPDATE existing links
    const linkUpdate = linkEnter.merge(link as any);

    // Transition links to their new position
    linkUpdate.transition().duration(this.duration).style('opacity', 1);

    // Update horizontal lines
    linkUpdate
      .select('.link-horizontal')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.parent!.x)
      .attr('y1', (d: any) => d.y)
      .attr('x2', (d: any) => d.x)
      .attr('y2', (d: any) => d.y);

    // Update vertical lines
    linkUpdate
      .select('.link-vertical')
      .transition()
      .duration(this.duration)
      .attr('x1', (d: any) => d.parent!.x)
      .attr('y1', (d: any) => d.parent!.y)
      .attr('x2', (d: any) => d.parent!.x)
      .attr('y2', (d: any) => d.y);

    // EXIT links that are no longer needed
    const linkExit = link
      .exit()
      .transition()
      .duration(this.duration)
      .style('opacity', 0)
      .remove();

    // Transition exiting links back to parent position
    linkExit
      .selectAll('line')
      .attr('x1', source.x)
      .attr('y1', source.y)
      .attr('x2', source.x)
      .attr('y2', source.y);
  }

  // Update nodes with smooth enter/update/exit transitions (bar-style layout)
  private updateNodes(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
    if (!this.svg) return;

    // Bind data with proper key function for object constancy
    const node = this.svg
      .selectAll('.node')
      .data(nodes, (d: any) => d.id || (d.id = d.data.id));

    // ENTER new nodes
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('data-node-id', (d: D3HierarchyNode) => d.data.id) // Add for scrolling functionality
      .attr('transform', () => {
        const x = source.x0 !== undefined ? source.x0 : 0;
        const y = source.y0 !== undefined ? source.y0 : 0;
        return `translate(${x},${y})`;
      })
      .style('opacity', 0);

    // Add expand/collapse button background (for nodes with children)
    nodeEnter
      .append('rect')
      .attr('class', 'toggle-button')
      .attr('x', -8)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 2)
      .style('fill', this.isDarkMode ? '#2d3748' : 'white')
      .style('stroke', this.isDarkMode ? '#4a5568' : '#666')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .on('click', (event: Event, d: any) => this.handleToggleClick(event, d));

    // Add +/- symbol
    nodeEnter
      .append('text')
      .attr('class', 'toggle-symbol')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', this.isDarkMode ? '#e2e8f0' : '#333')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'))
      .on('click', (event: Event, d: any) => this.handleToggleClick(event, d));

    // Add background rectangle for node highlighting
    nodeEnter
      .append('rect')
      .attr('class', 'node-background')
      .attr('x', 8) // Start after the toggle button area
      .attr('y', -9)
      .attr('height', 18)
      .attr('rx', 3)
      .style('fill', 'transparent')
      .style('stroke', 'none')
      .style('cursor', 'pointer')
      .style('pointer-events', 'none') // Prevent this from blocking clicks
      .on('click', (event: Event, d: any) =>
        this.handleNodeLabelClick(event, d)
      );

    // Add node labels
    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => (d.children || d._children ? 12 : 4))
      .text((d: any) => d.data.name || 'Root') // Fallback to 'Root' only if name is empty
      .style('font-size', '12px')
      .style('fill', this.isDarkMode ? '#fff' : '#1a1a1a')
      .style('cursor', 'pointer')
      .on('click', (event: Event, d: any) =>
        this.handleNodeLabelClick(event, d)
      );

    // Re-add toggle button and symbol AFTER background to ensure they're on top
    nodeEnter
      .append('rect')
      .attr('class', 'toggle-button-overlay')
      .attr('x', -8)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 2)
      .style('fill', this.isDarkMode ? '#2d3748' : 'white')
      .style('stroke', this.isDarkMode ? '#4a5568' : '#666')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .style('pointer-events', (d: any) =>
        d.children || d._children ? 'all' : 'none'
      )
      .on('click', (event: Event, d: any) => this.handleToggleClick(event, d));

    // Re-add +/- symbol AFTER background to ensure it's on top
    nodeEnter
      .append('text')
      .attr('class', 'toggle-symbol-overlay')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', this.isDarkMode ? '#e2e8f0' : '#333')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .style('pointer-events', (d: any) =>
        d.children || d._children ? 'all' : 'none'
      )
      .text((d: any) => (d._children ? '+' : '−'))
      .on('click', (event: Event, d: any) => this.handleToggleClick(event, d));

    // UPDATE existing nodes
    const nodeUpdate = nodeEnter.merge(node as any);

    // Transition nodes to their new position
    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => {
        const x = d.x !== undefined ? d.x : 0;
        const y = d.y !== undefined ? d.y : 0;
        return `translate(${x},${y})`;
      })
      .style('opacity', 1);

    // Update toggle button visibility and styling
    nodeUpdate
      .select('.toggle-button')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .style('fill', this.isDarkMode ? '#2d3748' : 'white')
      .style('stroke', this.isDarkMode ? '#4a5568' : '#666');

    // Update toggle button overlay (ensure it's always clickable)
    nodeUpdate
      .select('.toggle-button-overlay')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .style('fill', this.isDarkMode ? '#2d3748' : 'white')
      .style('stroke', this.isDarkMode ? '#4a5568' : '#666')
      .style('pointer-events', (d: any) =>
        d.children || d._children ? 'all' : 'none'
      );

    // Update toggle symbol
    nodeUpdate
      .select('.toggle-symbol')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .style('fill', this.isDarkMode ? '#e2e8f0' : '#333')
      .text((d: any) => (d._children ? '+' : '−'));

    // Update toggle symbol overlay (ensure it's always clickable)
    nodeUpdate
      .select('.toggle-symbol-overlay')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .style('fill', this.isDarkMode ? '#e2e8f0' : '#333')
      .style('pointer-events', (d: any) =>
        d.children || d._children ? 'all' : 'none'
      )
      .text((d: any) => (d._children ? '+' : '−'));

    // Update text position and styling
    nodeUpdate
      .select('.node-label')
      .transition()
      .duration(this.duration)
      .attr('x', (d: any) => (d.children || d._children ? 12 : 4))
      .text((d: any) => d.data.name || 'Root') // Ensure text is updated with actual data or fallback
      .style('fill', (d: any) => {
        const isMainSelected = this.selectedNode === d.data.id;
        const isMultiSelected = this.selectedNodes.includes(d.data.id);

        if (isMainSelected) {
          // Main selected node - use unified selected node text color with dark mode awareness
          return this.colorsService.getSelectedNodeStyle(this.isDarkMode)
            .textColor;
        } else if (isMultiSelected) {
          // Multi-selected node - use unified selected nodes text color with dark mode awareness
          return this.colorsService.getSelectedNodesStyle(this.isDarkMode)
            .textColor;
        } else {
          // Normal node - use dark mode aware text color
          return this.isDarkMode ? '#e5e7eb' : '#1a1a1a';
        }
      })
      .style('font-weight', (d: any) => {
        const isMainSelected = this.selectedNode === d.data.id;
        const isMultiSelected = this.selectedNodes.includes(d.data.id);
        return isMainSelected || isMultiSelected ? 'bold' : 'normal';
      });

    // Update background rectangles for selection highlighting
    nodeUpdate
      .select('.node-background')
      .transition()
      .duration(this.duration)
      .attr('width', (d: any) => {
        // Calculate width based on text length plus padding
        const textLength = d.data.name.length * 7; // Approximate character width
        return Math.max(textLength + 16, 60); // Minimum width of 60px
      })
      .style('fill', (d: any) => {
        const isMainSelected = this.selectedNode === d.data.id;
        const isMultiSelected = this.selectedNodes.includes(d.data.id);

        if (isMainSelected) {
          // Main selected node - use prominent highlighting
          return this.isDarkMode
            ? 'rgba(59, 130, 246, 0.3)'
            : 'rgba(59, 130, 246, 0.2)'; // Blue
        } else if (isMultiSelected) {
          // Multi-selected node - use secondary highlighting
          return this.isDarkMode
            ? 'rgba(34, 197, 94, 0.3)'
            : 'rgba(34, 197, 94, 0.2)'; // Green
        } else {
          // Normal node - transparent background
          return 'transparent';
        }
      })
      .style('stroke', (d: any) => {
        const isMainSelected = this.selectedNode === d.data.id;
        const isMultiSelected = this.selectedNodes.includes(d.data.id);

        if (isMainSelected) {
          // Main selected node - solid border
          return this.isDarkMode ? '#3b82f6' : '#2563eb'; // Blue border
        } else if (isMultiSelected) {
          // Multi-selected node - dashed border
          return this.isDarkMode ? '#22c55e' : '#16a34a'; // Green border
        } else {
          // Normal node - no border
          return 'none';
        }
      })
      .style('stroke-width', (d: any) => {
        const isMainSelected = this.selectedNode === d.data.id;
        const isMultiSelected = this.selectedNodes.includes(d.data.id);
        return isMainSelected || isMultiSelected ? '1px' : '0px';
      })
      .style('stroke-dasharray', (d: any) => {
        const isMultiSelected = this.selectedNodes.includes(d.data.id);
        const isMainSelected = this.selectedNode === d.data.id;
        // Use dashed border for multi-selected, solid for main selected
        return isMultiSelected && !isMainSelected ? '3,2' : 'none';
      });

    // EXIT nodes that are no longer visible
    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', () => {
        const x = source.x !== undefined ? source.x : 0;
        const y = source.y !== undefined ? source.y : 0;
        return `translate(${x},${y})`;
      })
      .style('opacity', 0)
      .remove();

    // Fade out toggle buttons and text
    nodeExit.selectAll('.toggle-button').style('opacity', 0);
    nodeExit.selectAll('.toggle-symbol').style('opacity', 0);
    nodeExit.selectAll('.node-label').style('fill-opacity', 0);
  }

  // Handle clicks on toggle buttons/symbols (expand/collapse)
  private handleToggleClick(event: Event, d: D3HierarchyNode): void {
    event.stopPropagation();

    const isExpanded = !!d.children;

    if (d.children) {
      d._children = d.children;
      d.children = undefined;
    } else {
      d.children = d._children;
      d._children = undefined;
    }

    // Update NGXS state with the new expansion state
    this.store.dispatch(new UpdateNodeExpansion(d.data.id, !isExpanded));

    this.update(d);
  }

  // Handle clicks on node labels (selection)
  private handleNodeLabelClick(event: Event, d: D3HierarchyNode): void {
    event.stopPropagation();

    const mouseEvent = event as MouseEvent;

    if (mouseEvent.shiftKey) {
      // Shift+click: toggle multi-selection
      this.nodeToggleSelection.emit(d.data.id);
    } else {
      // Normal click: single selection
      this.nodeSelected.emit(d.data.id);
    }
  }

  private collapse(d: D3HierarchyNode): void {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((child) => this.collapse(child));
      d.children = undefined;
    }
  }

  private applyDefaultExpansion(
    node: D3HierarchyNode,
    currentLevel: number
  ): void {
    // Use <= to be more intuitive: if defaultLevelExpansion is 2,
    // expand through level 2 (root + first 2 levels of children)
    if (currentLevel <= this.defaultLevelExpansion && node._children) {
      // console.log(
      //   `  ✅ Expanding node "${node.data.name}" at level ${currentLevel}`
      // );
      node.children = node._children;
      node._children = undefined;

      if (node.children) {
        node.children.forEach((child) =>
          this.applyDefaultExpansion(child, currentLevel + 1)
        );
      }
    } else if (node.children) {
      // Collapse nodes beyond default level
      console.log(
        `  🔒 Collapsing node "${node.data.name}" at level ${currentLevel}`
      );
      this.collapse(node);
    }
  }

  private applyExpansionState(
    node: D3HierarchyNode,
    expansionState: Record<string, boolean>
  ): void {
    const nodeId = node.data.id;
    const isExpanded = expansionState[nodeId];

    if (isExpanded !== undefined) {
      if (isExpanded && node._children) {
        // Expand this node
        node.children = node._children;
        node._children = undefined;
      } else if (!isExpanded && node.children) {
        // Collapse this node
        node._children = node.children;
        node.children = undefined;
      }
    }

    // Recursively apply to children
    const children = node.children || node._children;
    if (children) {
      children.forEach((child) =>
        this.applyExpansionState(child, expansionState)
      );
    }
  }

  private countNodes(node: D3HierarchyNode): number {
    let count = 1;
    const children = node.children || node._children;
    if (children) {
      children.forEach((child) => {
        count += this.countNodes(child);
      });
    }
    return count;
  }

  /**
   * Expand the tree to show the specified node and scroll to it
   */
  private expandToAndScrollToNode(nodeId: string): void {
    if (!this.root || !nodeId) {
      return;
    }

    // Find the path to the target node
    const pathToNode = this.findPathToNode(this.root, nodeId);
    if (!pathToNode || pathToNode.length === 0) {
      console.log(`Quick-Nav: Node ${nodeId} not found in tree`);
      return;
    }

    console.log(`Quick-Nav: Expanding path to node ${nodeId}`);

    // Expand all nodes in the path except the last one (the target node itself)
    for (let i = 0; i < pathToNode.length - 1; i++) {
      const node = pathToNode[i];
      if (node._children) {
        // Expand this node
        node.children = node._children;
        node._children = undefined;

        // Update expansion state
        this.store.dispatch(new UpdateNodeExpansion(node.data.id, true));
      }
    }

    // Update the visualization
    this.update(this.root);

    // Scroll to the target node after a short delay to ensure DOM is updated
    setTimeout(() => {
      this.scrollToNode(nodeId);
    }, this.duration + 50);
  }

  /**
   * Find the path from root to a specific node
   */
  private findPathToNode(
    node: D3HierarchyNode,
    targetNodeId: string
  ): D3HierarchyNode[] | null {
    if (node.data.id === targetNodeId) {
      return [node];
    }

    const children = node.children || node._children;
    if (children) {
      for (const child of children) {
        const path = this.findPathToNode(child, targetNodeId);
        if (path) {
          return [node, ...path];
        }
      }
    }

    return null;
  }

  /**
   * Scroll the tree container to show the specified node
   */
  private scrollToNode(nodeId: string): void {
    if (!this.treeContainer?.nativeElement) {
      return;
    }

    // Find the SVG element for the target node
    const nodeElement = this.svg
      ?.select(`g[data-node-id="${nodeId}"]`)
      ?.node() as SVGElement;
    if (!nodeElement) {
      console.log(`Quick-Nav: Could not find SVG element for node ${nodeId}`);
      return;
    }

    // Get the node's position
    const nodeTransform = nodeElement.getAttribute('transform');
    if (!nodeTransform) {
      return;
    }

    // Parse translate values from transform
    const translateMatch = nodeTransform.match(/translate\(([^,]+),([^)]+)\)/);
    if (!translateMatch) {
      return;
    }

    const nodeY = parseFloat(translateMatch[2]);
    const containerElement = this.treeContainer.nativeElement;
    const containerHeight = containerElement.clientHeight;

    // Calculate scroll position to center the node in the view
    const targetScrollTop = nodeY - containerHeight / 2;

    // Smooth scroll to the node
    containerElement.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });

    console.log(`Quick-Nav: Scrolled to node ${nodeId} at position ${nodeY}`);
  }
}
