import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { MockDataService } from '../../../services/mock-data.service';

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

@Component({
  selector: 'app-d3-example-force-directed-layout',
  imports: [CommonModule, FormsModule],
  templateUrl: './d3-example-force-directed-layout.html',
  styleUrl: './d3-example-force-directed-layout.scss',
  standalone: true,
})
export class D3ExampleForceDirectedLayout
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef;

  private mockDataService = inject(MockDataService);
  private svg: any;
  private simulation: any;
  private width = 960;
  private height = 600;
  private nodes: GraphNode[] = [];
  private links: GraphLink[] = [];

  nodeCount = 7;
  minNodes = 3;
  maxNodes = 50;

  private treeData: TreeNode | null = null;

  ngOnInit(): void {
    this.generateTreeData();
    this.convertTreeToGraph();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  private generateTreeData(): void {
    const nodeCount = this.nodeCount;
    const nodes: TreeNode[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({ id: String(i), name: `Node ${i}` });
    }

    // Create tree structure - first node is root
    const root = nodes[0];
    root.children = [];

    // Distribute remaining nodes as children
    for (let i = 1; i < nodeCount; i++) {
      const parentIndex = Math.floor(Math.random() * i);
      const parent = nodes[parentIndex];

      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(nodes[i]);
    }

    this.treeData = root;
  }

  private convertTreeToGraph(): void {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    if (!this.treeData) return;

    const traverse = (node: TreeNode, parent?: TreeNode) => {
      nodes.push({ id: node.id, name: node.name });

      if (parent) {
        links.push({
          source: parent.id,
          target: node.id,
        });
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, node));
      }
    };

    traverse(this.treeData);

    this.nodes = nodes;
    this.links = links;
  }

  private createChart(): void {
    const container = this.chartContainer.nativeElement;

    // Create SVG
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height]);

    // Create force simulation
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(this.links)
          .id((d: any) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collide', d3.forceCollide(50));

    this.updateChart();

    this.simulation.on('tick', () => {
      this.updatePositions();
    });
  }

  private updateChart(): void {
    // Update links using enter/update/exit pattern
    const linkSelection = this.svg
      .selectAll('.link')
      .data(this.links, (d: any) => `${d.source.id}-${d.target.id}`);

    // Exit
    linkSelection.exit().remove();

    // Enter + Update
    const linkEnter = linkSelection
      .enter()
      .insert('line', '.node') // Insert before nodes so links draw underneath
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    linkEnter.merge(linkSelection);

    // Update nodes using enter/update/exit pattern
    const nodeSelection = this.svg
      .selectAll('.node')
      .data(this.nodes, (d: any) => d.id);

    // Exit
    nodeSelection.exit().remove();

    // Enter
    const nodeEnter = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => this.dragStarted(event, d))
          .on('drag', (event, d) => this.dragged(event, d))
          .on('end', (event, d) => this.dragEnded(event, d))
      );

    nodeEnter
      .append('circle')
      .attr('r', 20)
      .attr('fill', '#1f77b4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodeEnter
      .append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('font-size', '12px')
      .text((d) => d.name);

    // Merge enter and update
    nodeEnter.merge(nodeSelection);
  }

  private updatePositions(): void {
    this.svg
      .selectAll('.link')
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    this.svg
      .selectAll('.node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  }

  private dragStarted(event: any, d: GraphNode): void {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: any, d: GraphNode): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(event: any, d: GraphNode): void {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  onNodeCountChange(): void {
    // Regenerate tree data
    this.generateTreeData();
    this.convertTreeToGraph();

    // Update simulation with new data
    if (this.simulation) {
      this.simulation.nodes(this.nodes);
      this.simulation.force('link').links(this.links);
      this.simulation.alpha(1).restart();
    }

    // Update the visualization using enter/update/exit
    this.updateChart();
  }
}
