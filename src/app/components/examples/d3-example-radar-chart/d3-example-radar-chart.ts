import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

export interface IRadarNode {
  NodeID: number;
  NodeName: string;
  NodeCurrentValue: number;
  NodeDesiredValue: number;
  NodeProValue: number;
}

@Component({
  selector: 'app-d3-example-radar-chart',
  imports: [CommonModule, FormsModule],
  templateUrl: './d3-example-radar-chart.html',
  styleUrl: './d3-example-radar-chart.scss',
})
export class D3ExampleRadarChart implements OnInit, AfterViewInit {
  @ViewChild('radarChart', { static: true })
  private chartContainer!: ElementRef;

  nodeCount = 5;
  nodes: IRadarNode[] = [];

  // Toggle visibility controls
  showPerceived = true;
  showProElite = true;

  private svg: any;
  private width = 600;
  private height = 600;
  private radius = 200;
  private center = { x: this.width / 2, y: this.height / 2 };

  private skillLevels = [
    { value: 1, label: 'Unfamiliar' },
    { value: 2, label: 'Introduced' },
    { value: 3, label: 'Familiar/Unpracticed' },
    { value: 4, label: 'Match-Ready/Nuanced' },
    { value: 5, label: 'Match-Inflicted' },
  ];

  ngOnInit(): void {
    this.generateNodes();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  generateNodes(): void {
    const oldNodes = [...this.nodes]; // Preserve existing nodes
    this.nodes = Array.from({ length: this.nodeCount }, (_, i) => {
      // If we have an existing node at this position, keep its values
      const existingNode = oldNodes[i];
      if (existingNode) {
        return {
          ...existingNode,
          NodeID: i + 1,
          NodeName: `Node ${i + 1}`,
        };
      }
      // Create new node with random values
      return {
        NodeID: i + 1,
        NodeName: `Node ${i + 1}`,
        NodeCurrentValue: Math.floor(Math.random() * 5) + 1,
        NodeDesiredValue: Math.floor(Math.random() * 5) + 1,
        NodeProValue: Math.floor(Math.random() * 5) + 1,
      };
    });
  }

  onNodeCountChange(): void {
    this.generateNodes();
    this.updateChartSmooth();
  }

  onToggleChange(): void {
    this.updateShapesVisibility();
  }

  onTogglePerceived(): void {
    this.updateChart();
  }

  onToggleProElite(): void {
    this.updateChart();
  }

  createChart(): void {
    // Clear any existing chart
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    // Create SVG
    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Create main group
    const g = this.svg
      .append('g')
      .attr('transform', `translate(${this.center.x}, ${this.center.y})`);

    this.drawGrid(g);
    this.drawAxes(g);
    this.drawNodes(g);
    this.drawLegend();
  }

  private drawGrid(g: any): void {
    // Draw concentric circles for each skill level
    for (let i = 1; i <= 5; i++) {
      const circleRadius = (this.radius / 5) * i;
      g.append('circle')
        .attr('class', 'grid-element')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', circleRadius)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);

      // Add level labels
      g.append('text')
        .attr('class', 'grid-element')
        .attr('x', 5)
        .attr('y', -circleRadius + 5)
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(i.toString());
    }
  }

  private drawAxes(g: any): void {
    const angleSlice = (Math.PI * 2) / this.nodeCount;

    // Draw axis lines
    for (let i = 0; i < this.nodeCount; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = Math.cos(angle) * this.radius;
      const y2 = Math.sin(angle) * this.radius;

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);

      // Add axis labels
      const labelRadius = this.radius + 20;
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(this.nodes[i]?.NodeName || `Node ${i + 1}`);
    }
  }

  private drawNodes(g: any): void {
    const angleSlice = (Math.PI * 2) / this.nodeCount;

    // Prepare data points for shapes
    const currentPoints: [number, number][] = [];
    const desiredPoints: [number, number][] = [];
    const proPoints: [number, number][] = [];

    this.nodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

      // Calculate positions for current, desired, and pro values
      const currentRadius = (this.radius / 5) * node.NodeCurrentValue;
      const desiredRadius = (this.radius / 5) * node.NodeDesiredValue;
      const proRadius = (this.radius / 5) * node.NodeProValue;

      const currentX = Math.cos(angle) * currentRadius;
      const currentY = Math.sin(angle) * currentRadius;
      const desiredX = Math.cos(angle) * desiredRadius;
      const desiredY = Math.sin(angle) * desiredRadius;
      const proX = Math.cos(angle) * proRadius;
      const proY = Math.sin(angle) * proRadius;

      currentPoints.push([currentX, currentY]);
      desiredPoints.push([desiredX, desiredY]);
      proPoints.push([proX, proY]);
    });

    // Create line generator for smooth curves
    const lineGenerator = d3.line().curve(d3.curveLinearClosed);

    // Draw pro value shape first (bottom layer - Green)
    g.append('path')
      .datum(proPoints)
      .attr('d', lineGenerator)
      .attr('fill', '#44ff44')
      .attr('fill-opacity', 0.15)
      .attr('stroke', '#44ff44')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.5)
      .attr('class', 'pro-shape');

    // Draw desired value shape second (middle layer - Blue)
    g.append('path')
      .datum(desiredPoints)
      .attr('d', lineGenerator)
      .attr('fill', '#4444ff')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#4444ff')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('class', 'desired-shape');

    // Draw current value shape third (top layer - Red)
    g.append('path')
      .datum(currentPoints)
      .attr('d', lineGenerator)
      .attr('fill', '#ff4444')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#ff4444')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)
      .attr('class', 'current-shape');

    // Draw individual nodes with sliders
    this.nodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

      // Calculate positions for current, desired, and pro values
      const currentRadius = (this.radius / 5) * node.NodeCurrentValue;
      const desiredRadius = (this.radius / 5) * node.NodeDesiredValue;
      const proRadius = (this.radius / 5) * node.NodeProValue;

      const currentX = Math.cos(angle) * currentRadius;
      const currentY = Math.sin(angle) * currentRadius;
      const desiredX = Math.cos(angle) * desiredRadius;
      const desiredY = Math.sin(angle) * desiredRadius;
      const proX = Math.cos(angle) * proRadius;
      const proY = Math.sin(angle) * proRadius;

      // Draw lines from center to each value
      // Pro line (Green)
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', proX)
        .attr('y2', proY)
        .attr('stroke', '#44ff44')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .attr('class', `pro-line-${node.NodeID}`);

      // Desired line (Blue)
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', desiredX)
        .attr('y2', desiredY)
        .attr('stroke', '#4444ff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('class', `desired-line-${node.NodeID}`);

      // Current value slider (draggable - Red)
      const currentSlider = g
        .append('circle')
        .attr('cx', currentX)
        .attr('cy', currentY)
        .attr('r', 8)
        .attr('fill', '#ff4444')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('class', `current-slider-${node.NodeID}`);

      // Desired value slider (draggable - Blue)
      const desiredSlider = g
        .append('circle')
        .attr('cx', desiredX)
        .attr('cy', desiredY)
        .attr('r', 8)
        .attr('fill', '#4444ff')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('class', `desired-slider-${node.NodeID}`);

      // Pro value slider (draggable - Green)
      const proSlider = g
        .append('circle')
        .attr('cx', proX)
        .attr('cy', proY)
        .attr('r', 8)
        .attr('fill', '#44ff44')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('class', `pro-slider-${node.NodeID}`);

      // Add drag behavior to all sliders
      this.addDragBehavior(currentSlider, node, 'current', angle, g);
      this.addDragBehavior(desiredSlider, node, 'desired', angle, g);
      this.addDragBehavior(proSlider, node, 'pro', angle, g);

      // Add value labels
      g.append('text')
        .attr('x', currentX + 12)
        .attr('y', currentY + 4)
        .attr('font-size', '12px')
        .attr('fill', '#ff4444')
        .attr('font-weight', 'bold')
        .attr('class', `current-label-${node.NodeID}`)
        .text(node.NodeCurrentValue.toString());

      g.append('text')
        .attr('x', desiredX + 12)
        .attr('y', desiredY + 4)
        .attr('font-size', '12px')
        .attr('fill', '#4444ff')
        .attr('font-weight', 'bold')
        .attr('class', `desired-label-${node.NodeID}`)
        .text(node.NodeDesiredValue.toString());

      g.append('text')
        .attr('x', proX + 12)
        .attr('y', proY + 4)
        .attr('font-size', '12px')
        .attr('fill', '#44ff44')
        .attr('font-weight', 'bold')
        .attr('class', `pro-label-${node.NodeID}`)
        .text(node.NodeProValue.toString());
    });
  }

  private addDragBehavior(
    element: any,
    node: IRadarNode,
    type: 'current' | 'desired' | 'pro',
    angle: number,
    g: any
  ): void {
    const drag = d3.drag().on('drag', (event) => {
      const mouseX = event.x;
      const mouseY = event.y;

      // Calculate distance from center
      const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

      // Constrain to axis line
      const constrainedDistance = Math.max(
        this.radius / 5,
        Math.min(distance, this.radius)
      );
      const newX = Math.cos(angle) * constrainedDistance;
      const newY = Math.sin(angle) * constrainedDistance;

      // Update slider position with smooth transition
      element
        .transition()
        .duration(50)
        .ease(d3.easeQuadOut)
        .attr('cx', newX)
        .attr('cy', newY);

      // Calculate new value (1-5)
      const newValue = Math.round((constrainedDistance / this.radius) * 5);
      const clampedValue = Math.max(1, Math.min(5, newValue));

      // Update node data
      if (type === 'current') {
        node.NodeCurrentValue = clampedValue;
      } else if (type === 'desired') {
        node.NodeDesiredValue = clampedValue;
      } else if (type === 'pro') {
        node.NodeProValue = clampedValue;
      }

      // Update label with smooth transition
      g.select(`.${type}-label-${node.NodeID}`)
        .transition()
        .duration(50)
        .ease(d3.easeQuadOut)
        .attr('x', newX + 12)
        .attr('y', newY + 4)
        .text(clampedValue.toString());

      // Update line with smooth transition
      if (type === 'desired') {
        g.select(`.desired-line-${node.NodeID}`)
          .transition()
          .duration(50)
          .ease(d3.easeQuadOut)
          .attr('x2', newX)
          .attr('y2', newY);
      } else if (type === 'pro') {
        g.select(`.pro-line-${node.NodeID}`)
          .transition()
          .duration(50)
          .ease(d3.easeQuadOut)
          .attr('x2', newX)
          .attr('y2', newY);
      }

      // Redraw the shapes with updated values using smooth transition
      this.updateShapesWithTransition(g);
    });

    element.call(drag);
  }

  private updateShapes(g: any): void {
    const angleSlice = (Math.PI * 2) / this.nodeCount;

    // Prepare updated data points for shapes
    const currentPoints: [number, number][] = [];
    const desiredPoints: [number, number][] = [];
    const proPoints: [number, number][] = [];

    this.nodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

      // Calculate positions for current, desired, and pro values
      const currentRadius = (this.radius / 5) * node.NodeCurrentValue;
      const desiredRadius = (this.radius / 5) * node.NodeDesiredValue;
      const proRadius = (this.radius / 5) * node.NodeProValue;

      const currentX = Math.cos(angle) * currentRadius;
      const currentY = Math.sin(angle) * currentRadius;
      const desiredX = Math.cos(angle) * desiredRadius;
      const desiredY = Math.sin(angle) * desiredRadius;
      const proX = Math.cos(angle) * proRadius;
      const proY = Math.sin(angle) * proRadius;

      currentPoints.push([currentX, currentY]);
      desiredPoints.push([desiredX, desiredY]);
      proPoints.push([proX, proY]);
    });

    // Create line generator for smooth curves
    const lineGenerator = d3.line().curve(d3.curveLinearClosed);

    // Update pro value shape
    g.select('.pro-shape').datum(proPoints).attr('d', lineGenerator);

    // Update desired value shape
    g.select('.desired-shape').datum(desiredPoints).attr('d', lineGenerator);

    // Update current value shape
    g.select('.current-shape').datum(currentPoints).attr('d', lineGenerator);
  }

  private updateShapesWithTransition(g: any): void {
    const angleSlice = (Math.PI * 2) / this.nodeCount;

    // Prepare updated data points for shapes
    const currentPoints: [number, number][] = [];
    const desiredPoints: [number, number][] = [];
    const proPoints: [number, number][] = [];

    this.nodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

      // Calculate positions for current, desired, and pro values
      const currentRadius = (this.radius / 5) * node.NodeCurrentValue;
      const desiredRadius = (this.radius / 5) * node.NodeDesiredValue;
      const proRadius = (this.radius / 5) * node.NodeProValue;

      const currentX = Math.cos(angle) * currentRadius;
      const currentY = Math.sin(angle) * currentRadius;
      const desiredX = Math.cos(angle) * desiredRadius;
      const desiredY = Math.sin(angle) * desiredRadius;
      const proX = Math.cos(angle) * proRadius;
      const proY = Math.sin(angle) * proRadius;

      currentPoints.push([currentX, currentY]);
      desiredPoints.push([desiredX, desiredY]);
      proPoints.push([proX, proY]);
    });

    // Create line generator for smooth curves
    const lineGenerator = d3.line().curve(d3.curveLinearClosed);

    // Update pro value shape with smooth transition (bottom layer - Green)
    g.select('.pro-shape')
      .datum(proPoints)
      .transition()
      .duration(400)
      .ease(d3.easeQuadInOut)
      .attr('d', lineGenerator);

    // Update desired value shape with smooth transition (middle layer - Blue)
    g.select('.desired-shape')
      .datum(desiredPoints)
      .transition()
      .duration(400)
      .ease(d3.easeQuadInOut)
      .attr('d', lineGenerator);

    // Update current value shape with smooth transition (top layer - Red)
    g.select('.current-shape')
      .datum(currentPoints)
      .transition()
      .duration(400)
      .ease(d3.easeQuadInOut)
      .attr('d', lineGenerator);
  }

  private updateShapesVisibility(): void {
    const g = this.svg.select('g');

    // Update perceived shape visibility
    g.select('.current-shape')
      .transition()
      .duration(300)
      .style('opacity', this.showPerceived ? 1 : 0);

    // Update all current/perceived sliders
    g.selectAll('[class*="current-slider-"]')
      .transition()
      .duration(300)
      .style('opacity', this.showPerceived ? 1 : 0);

    // Update pro/elite shape visibility
    g.select('.pro-shape')
      .transition()
      .duration(300)
      .style('opacity', this.showProElite ? 1 : 0);

    // Update all pro sliders
    g.selectAll('[class*="pro-slider-"]')
      .transition()
      .duration(300)
      .style('opacity', this.showProElite ? 1 : 0);

    // Target is always visible (desired-slider and desired-shape)
  }
  private drawLegend(): void {
    // Remove existing legends
    this.svg.selectAll('.skill-legend').remove();
    this.svg.selectAll('.value-legend').remove();

    // Skill Levels Legend (upper left)
    const skillLegend = this.svg
      .append('g')
      .attr('class', 'skill-legend')
      .attr('transform', `translate(20, 20)`); // Upper left positioning

    // Skill Levels Title
    skillLegend
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Skill Levels');

    // Skill level descriptions
    this.skillLevels.forEach((level, i) => {
      const y = 25 + i * 20;

      skillLegend
        .append('text')
        .attr('x', 0)
        .attr('y', y)
        .attr('font-size', '12px')
        .text(`${level.value}. ${level.label}`);
    });

    // Value Types Legend (upper right)
    const valueLegend = this.svg
      .append('g')
      .attr('class', 'value-legend')
      .attr('transform', `translate(${this.width - 180}, 20)`); // Upper right positioning

    valueLegend
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Value Types');

    // Perceived value legend (Red)
    valueLegend
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 25)
      .attr('r', 6)
      .attr('fill', '#ff4444'); // Red

    valueLegend
      .append('text')
      .attr('x', 25)
      .attr('y', 30)
      .attr('font-size', '12px')
      .text('Perceived');

    // Target value legend (Blue)
    valueLegend
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 45)
      .attr('r', 6)
      .attr('fill', '#4444ff'); // Blue

    valueLegend
      .append('text')
      .attr('x', 25)
      .attr('y', 50)
      .attr('font-size', '12px')
      .text('Target');

    // Pro/Elite value legend (Green)
    valueLegend
      .append('circle')
      .attr('cx', 10)
      .attr('cy', 65)
      .attr('r', 6)
      .attr('fill', '#44ff44'); // Green

    valueLegend
      .append('text')
      .attr('x', 25)
      .attr('y', 70)
      .attr('font-size', '12px')
      .text('Pro/Elite');
  }

  private updateChartSmooth(): void {
    if (!this.svg) {
      this.createChart();
      return;
    }

    const g = this.svg.select('g');

    // Update grid and axes first (these need complete redraw)
    g.selectAll('.grid-element').remove();
    g.selectAll('.axis-element').remove();
    this.drawGrid(g);
    this.updateAxes(g);

    // Update nodes using enter/update/exit pattern
    this.updateNodesSmooth(g);

    // Update shapes with coordinated timing
    setTimeout(() => {
      this.updateShapesWithTransition(g);
    }, 100); // Start shape transition slightly after node positioning begins
  }

  private updateAxes(g: any): void {
    const angleSlice = (Math.PI * 2) / this.nodeCount;

    // Bind data to axis lines
    const axisLines = g
      .selectAll('.axis-line')
      .data(this.nodes, (d: any) => d.NodeID);

    // Exit - remove old axis lines
    axisLines.exit().transition().duration(300).style('opacity', 0).remove();

    // Enter - add new axis lines
    const enterLines = axisLines
      .enter()
      .append('line')
      .attr('class', 'axis-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1)
      .style('opacity', 0);

    // Update - transition existing and new lines to new positions
    axisLines
      .merge(enterLines)
      .transition()
      .duration(500)
      .ease(d3.easeQuadInOut)
      .style('opacity', 1)
      .attr('x2', (d: IRadarNode, i: number) => {
        const angle = angleSlice * i - Math.PI / 2;
        return Math.cos(angle) * this.radius;
      })
      .attr('y2', (d: IRadarNode, i: number) => {
        const angle = angleSlice * i - Math.PI / 2;
        return Math.sin(angle) * this.radius;
      });

    // Bind data to axis labels
    const axisLabels = g
      .selectAll('.axis-label')
      .data(this.nodes, (d: any) => d.NodeID);

    // Exit - remove old axis labels
    axisLabels.exit().transition().duration(300).style('opacity', 0).remove();

    // Enter - add new axis labels
    const enterLabels = axisLabels
      .enter()
      .append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('opacity', 0);

    // Update - transition existing and new labels to new positions
    axisLabels
      .merge(enterLabels)
      .transition()
      .duration(500)
      .ease(d3.easeQuadInOut)
      .style('opacity', 1)
      .attr('x', (d: IRadarNode, i: number) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelRadius = this.radius + 20;
        return Math.cos(angle) * labelRadius;
      })
      .attr('y', (d: IRadarNode, i: number) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelRadius = this.radius + 20;
        return Math.sin(angle) * labelRadius;
      })
      .text((d: IRadarNode) => d.NodeName);
  }

  private updateNodesSmooth(g: any): void {
    const angleSlice = (Math.PI * 2) / this.nodeCount;

    // Update shapes first
    this.updateShapes(g);

    // Bind data to node groups
    const nodeGroups = g
      .selectAll('.node-group')
      .data(this.nodes, (d: any) => d.NodeID);

    // Exit - remove old nodes
    nodeGroups.exit().transition().duration(300).style('opacity', 0).remove();

    // Enter - add new nodes
    const enterGroups = nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('opacity', 0);

    // Add elements to new node groups
    enterGroups.each((d: IRadarNode, i: number, nodes: any[]) => {
      const group = d3.select(nodes[i]);
      const angle = angleSlice * i - Math.PI / 2;

      // Calculate positions
      const currentRadius = (this.radius / 5) * d.NodeCurrentValue;
      const desiredRadius = (this.radius / 5) * d.NodeDesiredValue;
      const currentX = Math.cos(angle) * currentRadius;
      const currentY = Math.sin(angle) * currentRadius;
      const desiredX = Math.cos(angle) * desiredRadius;
      const desiredY = Math.sin(angle) * desiredRadius;

      // Desired line
      group
        .append('line')
        .attr('class', 'desired-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', desiredX)
        .attr('y2', desiredY)
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7);

      // Current slider
      const currentSlider = group
        .append('circle')
        .attr('class', 'current-slider')
        .attr('cx', currentX)
        .attr('cy', currentY)
        .attr('r', 8)
        .attr('fill', '#4ecdc4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer');

      // Desired slider
      const desiredSlider = group
        .append('circle')
        .attr('class', 'desired-slider')
        .attr('cx', desiredX)
        .attr('cy', desiredY)
        .attr('r', 8)
        .attr('fill', '#ff6b6b')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer');

      // Labels
      group
        .append('text')
        .attr('class', 'current-label')
        .attr('x', currentX + 12)
        .attr('y', currentY + 4)
        .attr('font-size', '12px')
        .attr('fill', '#4ecdc4')
        .attr('font-weight', 'bold')
        .text(d.NodeCurrentValue.toString());

      group
        .append('text')
        .attr('class', 'desired-label')
        .attr('x', desiredX + 12)
        .attr('y', desiredY + 4)
        .attr('font-size', '12px')
        .attr('fill', '#ff6b6b')
        .attr('font-weight', 'bold')
        .text(d.NodeDesiredValue.toString());

      // Add drag behaviors
      this.addDragBehaviorToGroup(group, d, angle, g);
    });

    // Update - transition existing and new nodes to new positions
    nodeGroups
      .merge(enterGroups)
      .transition()
      .duration(500)
      .ease(d3.easeQuadInOut)
      .style('opacity', 1)
      .each((d: IRadarNode, i: number, nodes: any[]) => {
        const group = d3.select(nodes[i]);
        const angle = angleSlice * i - Math.PI / 2;

        // Calculate new positions
        const currentRadius = (this.radius / 5) * d.NodeCurrentValue;
        const desiredRadius = (this.radius / 5) * d.NodeDesiredValue;
        const currentX = Math.cos(angle) * currentRadius;
        const currentY = Math.sin(angle) * currentRadius;
        const desiredX = Math.cos(angle) * desiredRadius;
        const desiredY = Math.sin(angle) * desiredRadius;

        // Update positions with smooth transitions
        group
          .select('.desired-line')
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('x2', desiredX)
          .attr('y2', desiredY);

        group
          .select('.current-slider')
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('cx', currentX)
          .attr('cy', currentY);

        group
          .select('.desired-slider')
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('cx', desiredX)
          .attr('cy', desiredY);

        group
          .select('.current-label')
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('x', currentX + 12)
          .attr('y', currentY + 4)
          .text(d.NodeCurrentValue.toString());

        group
          .select('.desired-label')
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('x', desiredX + 12)
          .attr('y', desiredY + 4)
          .text(d.NodeDesiredValue.toString());

        // Re-add drag behaviors for updated elements (after transition completes)
        setTimeout(() => {
          this.addDragBehaviorToGroup(group, d, angle, g);
        }, 500);
      });
  }

  private addDragBehaviorToGroup(
    group: any,
    node: IRadarNode,
    angle: number,
    g: any
  ): void {
    const currentSlider = group.select('.current-slider');
    const desiredSlider = group.select('.desired-slider');

    // Remove existing drag behaviors to avoid duplicates
    currentSlider.on('.drag', null);
    desiredSlider.on('.drag', null);

    // Add drag behavior to current value slider
    this.addDragBehavior(currentSlider, node, 'current', angle, g);

    // Add drag behavior to desired value slider
    this.addDragBehavior(desiredSlider, node, 'desired', angle, g);
  }

  private updateChart(): void {
    if (this.svg) {
      this.createChart();
    }
  }
}
