import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

// Tree node interface with collapsible properties
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
export interface D3HierarchyNode extends d3.HierarchyNode<TreeNode> {
  id: string;
  _children?: D3HierarchyNode[];
  x0?: number; // Previous x position for animations
  y0?: number; // Previous y position for animations
}

@Component({
  selector: 'app-d3-example-collapsible-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d3-example-collapsible-tree.html',
  styleUrl: './d3-example-collapsible-tree.scss',
})
export class D3ExampleCollapsibleTree
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('treeContainer', { static: true })
  treeContainer!: ElementRef<HTMLDivElement>;

  // Component properties
  public nodeCount = 25;
  public width = 960;
  public height = 600;

  // D3 elements
  private svg: any;
  private root: D3HierarchyNode | null = null;

  // Tree data
  public treeData: TreeNode | null = null;

  // Animation duration
  private duration = 250;

  // Layout settings
  private nodeHeight = 20;
  private indent = 20;

  ngOnInit(): void {
    this.generateTreeData();
  }

  ngAfterViewInit(): void {
    this.initializeSvg();
    this.drawTree();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Generate sample tree data using the same pattern as other components
  private generateTreeData(): void {
    this.treeData = this.generateRandomTreeData(this.nodeCount);
  }

  // Generate random tree data similar to other components in the project
  private generateRandomTreeData(nodeCount: number): TreeNode {
    const root: TreeNode = {
      id: '0',
      name: 'Root',
      children: [],
    };

    if (nodeCount <= 1) return root;

    let nodeCounter = 1;
    const nodes: TreeNode[] = [root]; // Keep track of all nodes that can have children

    // Randomly distribute remaining nodes
    while (nodeCounter < nodeCount && nodes.length > 0) {
      // Pick a random parent from existing nodes
      const randomParentIndex = Math.floor(Math.random() * nodes.length);
      const parent = nodes[randomParentIndex];

      // Decide how many children this parent should get (1 to min(5, remainingNodes))
      const remainingNodes = nodeCount - nodeCounter;
      const maxChildren = Math.min(5, remainingNodes); // Cap at 5 children per node
      const minChildren = 1;
      const childrenCount =
        Math.floor(Math.random() * (maxChildren - minChildren + 1)) +
        minChildren;

      // Add children to this parent
      for (let i = 0; i < childrenCount && nodeCounter < nodeCount; i++) {
        const child: TreeNode = {
          id: nodeCounter.toString(),
          name: `Node ${nodeCounter}`,
          children: [],
        };

        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(child);
        nodes.push(child); // This child can also have children later
        nodeCounter++;
      }

      // Randomly decide if this parent should be removed from potential parents
      // This creates more varied tree structures
      if (Math.random() < 0.3) {
        // 30% chance to stop adding children to this parent
        nodes.splice(randomParentIndex, 1);
      }
    }

    return root;
  }

  // Initialize SVG container
  private initializeSvg(): void {
    this.svg = d3
      .select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('font', '12px sans-serif')
      .style('user-select', 'none');
  }

  // Main tree drawing method
  private drawTree(): void {
    if (!this.treeData) return;

    // Convert data to d3 hierarchy
    this.root = d3.hierarchy(
      this.treeData,
      (d: TreeNode) => d.children
    ) as D3HierarchyNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Collapse all children initially except root
    if (this.root.children) {
      this.root.children.forEach((child) => this.collapse(child));
    }

    this.update(this.root);
  }

  // Collapse a node and its children
  private collapse(d: D3HierarchyNode): void {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((child) => this.collapse(child));
      d.children = undefined;
    }
  }

  // Update tree with indented layout and animations
  private update(source: D3HierarchyNode): void {
    if (!this.root) return;

    // Get all visible nodes (flattened list)
    const nodes = this.flatten(this.root);
    const height = Math.max(500, nodes.length * this.nodeHeight + 40);

    // Update SVG height
    this.svg.attr('height', height);

    // Assign positions
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

  // Flatten tree to get visible nodes
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
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    // Add vertical connector from parent level to child level
    linkEnter
      .append('line')
      .attr('class', 'link-vertical')
      .attr('x1', (d: any) => d.parent!.x0 || source.x0)
      .attr('y1', (d: any) => d.parent!.y0 || source.y0)
      .attr('x2', (d: any) => d.parent!.x0 || source.x0)
      .attr('y2', (d: any) => d.parent!.y0 || source.y0)
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    // UPDATE existing links
    const linkUpdate = linkEnter.merge(link);

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

  // Update nodes with smooth enter/update/exit transitions
  private updateNodes(nodes: D3HierarchyNode[], source: D3HierarchyNode): void {
    // Bind data with proper key function for object constancy
    const node = this.svg
      .selectAll('.node')
      .data(nodes, (d: any) => d.id || (d.id = d.data.id));

    // ENTER new nodes
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', `translate(${source.x0},${source.y0})`)
      .style('opacity', 0)
      .on('click', (event: Event, d: any) => this.click(d));

    // Add expand/collapse button background (for nodes with children)
    nodeEnter
      .append('rect')
      .attr('class', 'toggle-button')
      .attr('x', -8)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 2)
      .style('fill', 'white')
      .style('stroke', '#666')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0));

    // Add +/- symbol
    nodeEnter
      .append('text')
      .attr('class', 'toggle-symbol')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'));

    // Add node labels
    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => (d.children || d._children ? 12 : 4))
      .text((d: any) => d.data.name)
      .style('font-size', '14px')
      .style('fill', '#333')
      .style('cursor', 'pointer');

    // UPDATE existing nodes
    const nodeUpdate = nodeEnter.merge(node);

    // Transition nodes to their new position
    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('opacity', 1);

    // Update toggle button visibility
    nodeUpdate
      .select('.toggle-button')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0));

    // Update toggle symbol
    nodeUpdate
      .select('.toggle-symbol')
      .transition()
      .duration(this.duration)
      .style('opacity', (d: any) => (d.children || d._children ? 1 : 0))
      .text((d: any) => (d._children ? '+' : '−'));

    // Update text position
    nodeUpdate
      .select('.node-label')
      .transition()
      .duration(this.duration)
      .attr('x', (d: any) => (d.children || d._children ? 12 : 4));

    // EXIT nodes that are no longer visible
    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', `translate(${source.x},${source.y})`)
      .style('opacity', 0)
      .remove();

    // Fade out toggle buttons and text
    nodeExit.selectAll('.toggle-button').style('opacity', 0);
    nodeExit.selectAll('.toggle-symbol').style('opacity', 0);
    nodeExit.selectAll('.node-label').style('fill-opacity', 0);
  }

  // Handle node click (toggle children)
  private click(d: any): void {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }

  // Public method to update node count
  public updateNodeCount(event: Event): void {
    const target = event.target as HTMLInputElement;
    const nodeCount = parseInt(target.value);
    this.nodeCount = nodeCount;
    this.regenerateTree();
  }

  // Regenerate tree with new node count
  public regenerateTree(): void {
    console.log(`Regenerating tree with ${this.nodeCount} nodes`);

    // Generate new tree data
    this.generateTreeData();

    // Clear existing SVG content
    this.svg.selectAll('*').remove();

    // Redraw tree
    this.drawTree();
  }
}
