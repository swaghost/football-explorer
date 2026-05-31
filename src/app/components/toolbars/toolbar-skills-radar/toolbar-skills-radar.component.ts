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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { Store } from '@ngxs/store';
import { ILesson } from '../../../interfaces/lesson-builder.interfaces';
import { SketchState } from '../../../state/sketch.state';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { HelpOverlayComponent } from '../../shared/help-overlay/help-overlay.component';

export interface IRadarNode {
  NodeID: number;
  NodeName: string;
  NodeCurrentValue: number;
  NodeDesiredValue: number;
  NodeProValue: number;
  isVisible: boolean;
}

interface RadarShapeData {
  type: string;
  points: [number, number][];
  color: string;
  opacity: number;
  strokeOpacity: number;
  visible: boolean;
}

@Component({
  selector: 'app-toolbar-skills-radar',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpOverlayComponent],
  templateUrl: './toolbar-skills-radar.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-skills-radar.component.scss',
  ],
})
export class ToolbarSkillsRadarComponent
  extends BaseToolbarComponent
  implements OnInit, OnChanges, AfterViewInit
{
  // Required base component properties
  override readonly toolbarId = 'skills-radar-toolbar';
  override readonly toolbarTitle = 'Skills Radar';
  override readonly toolbarIcon = '🕸️';
  protected override toolbarHelp =
    'Visual radar chart displaying skill proficiency levels for selected nodes. Shows three overlapping shapes: Perceived (blue) represents current self-assessed skill level, Desired (orange) shows target proficiency goals, and Pro (green) indicates professional/expert level expectations. Each axis represents a different node/skill, with five concentric rings from center (1-Unfamiliar) to outer edge (5-Match-Inflicted). Adjust individual skill levels using the sliders below the chart. Toggle shape visibility to focus on specific comparisons. Useful for skill gap analysis, training needs assessment, and tracking progression toward desired competency levels.';
  @ViewChild('radarChart', { static: false })
  private chartContainer?: ElementRef;

  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() selectedNodes: string[] = [];
  @Input() selectedLesson: ILesson | null = null; // For accessing stored radar values

  // Component-specific outputs
  @Output() positionChange = new EventEmitter<any>();
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() lockChange = new EventEmitter<boolean>();
  @Output() radarValuesChanged = new EventEmitter<{
    nodeId: string;
    currentValue: number;
    desiredValue: number;
    proValue: number;
  }>();

  public nodes: IRadarNode[] = [];

  // Visibility controls
  public showPerceived = true;
  public showDesired = true;
  public showPro = true;

  // Ensure position is always defined
  public get safePosition(): any {
    return this.position || { x: 500, y: 100 };
  }

  // Chart properties
  private svg: any;
  private chartGroup: any;
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

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {
    super();
    // Set default position if not provided
    if (!this.position) {
      this.position = { x: 500, y: 100 };
    }
  }

  ngOnInit(): void {
    super.ngOnInit(); // Initialize base component (loads help text)
    if (!this.position) {
      this.position = { x: 500, y: 100 };
    }
    this.generateNodesFromSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.position) {
      this.position = { x: 500, y: 100 };
    }

    if (changes['selectedNodes']) {
      console.log('🎯 Skills Radar: selectedNodes changed', this.selectedNodes);
      this.generateNodesFromSelection();

      if (this.svg && this.chartContainer && this.visible && this.expanded) {
        setTimeout(() => {
          this.updateChart(); // Use updateChart for smooth transitions
        }, 100);
      }
    }

    // Redraw chart when dark mode changes
    if (
      changes['isDarkMode'] &&
      this.svg &&
      this.chartContainer &&
      this.visible
    ) {
      console.log('🎯 Skills Radar: Dark mode changed, updating background');
      this.updateChartBackground();
      setTimeout(() => {
        this.createChart(); // Recreate chart with new colors
      }, 50);
    }

    if (
      changes['visible'] &&
      changes['visible'].currentValue &&
      !changes['visible'].previousValue
    ) {
      console.log('🎯 Skills Radar: Became visible');
      // Reset SVG reference when becoming visible to force recreation
      this.svg = null as any;
      this.chartGroup = null as any;
      setTimeout(() => {
        this.createChart(); // Always create chart to show concentric circles
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    console.log('🎯 Skills Radar: ngAfterViewInit called', {
      visible: this.visible,
      expanded: this.expanded,
      nodesLength: this.nodes.length,
    });

    if (this.visible && this.expanded) {
      setTimeout(() => {
        this.createChart(); // Always create chart to show concentric circles
      }, 100);
    }
  }

  private generateNodesFromSelection(): void {
    const oldNodes = [...this.nodes];

    // Only show nodes when there are actually selected nodes
    if (this.selectedNodes.length === 0) {
      this.nodes = [];
      console.log('🎯 No selected nodes - clearing radar chart');
      return;
    }

    console.log('🎯 Generating nodes from:', this.selectedNodes);

    this.nodes = this.selectedNodes.map((nodeId, i) => {
      const existingNode = oldNodes.find((n) => n.NodeName === nodeId);
      if (existingNode) {
        return {
          ...existingNode,
          NodeName: nodeId,
        };
      }

      // Generate stable NodeID based on name to maintain D3 data binding
      const stableNodeID = nodeId.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a; // Convert to 32bit integer
      }, 0);

      // Check if this node exists in the selected lesson with stored radar values
      let currentValue = 1; // Default perceived value
      let desiredValue = 3; // Default desired value
      let proValue = 4; // Default elite value

      if (this.selectedLesson && this.selectedLesson.LessonNodes) {
        const lessonNode = this.selectedLesson.LessonNodes.find(
          (ln) => ln.NodeID === nodeId
        );
        if (lessonNode) {
          currentValue = lessonNode.NodeCurrentValue ?? 1;
          desiredValue = lessonNode.NodeDesiredValue ?? 3;
          proValue = lessonNode.NodeProValue ?? 4;
        }
      }

      return {
        NodeID: Math.abs(stableNodeID), // Ensure positive ID
        NodeName: nodeId,
        NodeCurrentValue: currentValue, // Use stored or default value
        NodeDesiredValue: desiredValue, // Use stored or default value
        NodeProValue: proValue, // Use stored or default value
        isVisible: true,
      };
    });

    console.log('🎯 Generated nodes:', this.nodes);
  }

  // Toggle and control methods - onToggleExpanded handled by base component
  // Override to add chart recreation logic
  override onToggleExpanded(): void {
    super.onToggleExpanded();
    if (this.expanded && this.nodes.length > 0) {
      setTimeout(() => {
        this.createChart();
      }, 100);
    }
  }

  // onClose and onToggleLock handled by base component

  public togglePerceived(): void {
    this.showPerceived = !this.showPerceived;
    this.updateShapesVisibility();
  }

  public toggleDesired(): void {
    this.showDesired = !this.showDesired;
    this.updateShapesVisibility();
  }

  public togglePro(): void {
    this.showPro = !this.showPro;
    this.updateShapesVisibility();
  }

  public resetRadarValues(): void {
    console.log('🎯 Resetting radar values to defaults');

    // Reset all node values to defaults
    this.nodes.forEach((node) => {
      node.NodeCurrentValue = 1; // Perceived default
      node.NodeDesiredValue = 3; // Desired default
      node.NodeProValue = 4; // Elite default

      // Emit change event for each node to update lesson storage
      this.radarValuesChanged.emit({
        nodeId: node.NodeName,
        currentValue: node.NodeCurrentValue,
        desiredValue: node.NodeDesiredValue,
        proValue: node.NodeProValue,
      });
    });

    // Redraw the chart with new values
    if (this.chartGroup) {
      this.updateChart();
    }
  }

  public onToggleNode(node: IRadarNode): void {
    node.isVisible = !node.isVisible;
    console.log(
      `🎯 Toggled node ${node.NodeName} to ${
        node.isVisible ? 'visible' : 'hidden'
      }`
    );

    if (this.svg) {
      this.updateChart();
    }
  }

  public trackByNodeId(index: number, node: IRadarNode): number {
    return node.NodeID;
  }

  // Drag functionality handled by BaseToolbarComponent

  // Chart creation and management
  private createChart(): void {
    console.log('🎯 Skills Radar: createChart called', {
      chartContainer: !!this.chartContainer,
      nodesLength: this.nodes.length,
      visible: this.visible,
      expanded: this.expanded,
    });

    if (!this.chartContainer) {
      console.log('🎯 Skills Radar: No chart container available');
      return;
    }

    // Always create the basic chart structure (grid and axes) even with no nodes
    const hasNodes = this.nodes.length > 0;

    // Create SVG only if it doesn't exist
    if (!this.svg || this.svg.empty()) {
      // Clear any existing chart first
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

      this.svg = d3
        .select(this.chartContainer.nativeElement)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('background', 'transparent');

      // Add background rectangle that adapts to theme
      const bgColor = this.isDarkMode
        ? 'rgba(30, 30, 30, 0.9)'
        : 'rgba(255, 255, 255, 0.9)';
      this.svg
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', bgColor)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('class', 'chart-background');

      // Create main group
      this.chartGroup = this.svg
        .append('g')
        .attr('transform', `translate(${this.center.x}, ${this.center.y})`);

      this.drawGrid(this.chartGroup);
      this.drawAxes(this.chartGroup);
      // this.drawLegend(); // Temporarily disabled
    }

    // Update nodes with smooth transitions (this handles empty nodes case internally)
    this.updateNodes();

    console.log('🎯 Skills Radar: Chart created/updated successfully');
  }

  private updateChartBackground(): void {
    if (!this.svg) return;

    const bgColor = this.isDarkMode
      ? 'rgba(30, 30, 30, 0.9)'
      : 'rgba(255, 255, 255, 0.9)';
    this.svg
      .select('.chart-background')
      .transition()
      .duration(300)
      .attr('fill', bgColor);
  }

  private drawGrid(g: any): void {
    // Get grid color based on dark mode
    const gridColor = this.isDarkMode ? '#555' : '#ddd';

    // Draw concentric circles for each skill level
    for (let i = 1; i <= 5; i++) {
      const circleRadius = (this.radius / 5) * i;
      g.append('circle')
        .attr('class', 'grid-element')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', circleRadius)
        .attr('fill', 'none')
        .attr('stroke', gridColor)
        .attr('stroke-width', 1);
      // Static grid labels removed - using dynamic labels from selectedNodes instead
    }
  }

  private drawAxes(g: any): void {
    const visibleNodes = this.nodes.filter((node) => node.isVisible);
    const radius = this.radius;

    // Get colors based on dark mode
    const axisColor = this.isDarkMode ? '#555' : '#ddd';
    const labelColor = this.isDarkMode ? '#e0e0e0' : '#333';

    // If no nodes, show four cardinal axes
    if (visibleNodes.length === 0) {
      const cardinalDirections = [
        { angle: -Math.PI / 2, label: 'North' }, // Top
        { angle: 0, label: 'East' }, // Right
        { angle: Math.PI / 2, label: 'South' }, // Bottom
        { angle: Math.PI, label: 'West' }, // Left
      ];

      g.selectAll('.cardinal-axis').remove();

      cardinalDirections.forEach((dir, i) => {
        const x = Math.cos(dir.angle) * radius;
        const y = Math.sin(dir.angle) * radius;

        // Draw axis line
        g.append('line')
          .attr('class', 'cardinal-axis')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', axisColor)
          .attr('stroke-width', 1)
          .attr('opacity', 0.5);

        // Draw axis label
        g.append('text')
          .attr('class', 'cardinal-axis')
          .attr('x', x * 1.1)
          .attr('y', y * 1.1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'normal')
          .attr('fill', labelColor)
          .attr('opacity', 0.6)
          .text(dir.label);
      });
      return;
    }

    // Clear cardinal axes when we have actual nodes
    g.selectAll('.cardinal-axis').remove();

    const angleSlice = (Math.PI * 2) / visibleNodes.length;

    // Add axes with enter/update/exit pattern
    const axisGroup = g
      .selectAll('.axis-group')
      .data(visibleNodes, (d: IRadarNode) => d.NodeName); // Use NodeName as stable key

    const axisEnter = axisGroup.enter().append('g').attr('class', 'axis-group');

    // Add axis lines
    axisEnter
      .append('line')
      .attr('class', 'axis-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('stroke', axisColor)
      .attr('stroke-width', 1);

    // Add axis labels
    axisEnter
      .append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', labelColor);

    // Update positions for all axes (enter + update)
    const axisUpdate = axisEnter.merge(axisGroup);

    axisUpdate.each((d: IRadarNode, i: number, nodes: any[]) => {
      const element = nodes[i];
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = Math.cos(angle) * radius;
      const y2 = Math.sin(angle) * radius;

      // Update line position
      d3.select(element)
        .select('.axis-line')
        .transition()
        .duration(750)
        .attr('x2', x2)
        .attr('y2', y2);

      // Update label position and text
      const labelRadius = radius + 30; // Increased distance for better visibility
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      d3.select(element)
        .select('.axis-label')
        .transition()
        .duration(750)
        .attr('x', labelX)
        .attr('y', labelY)
        .text(d.NodeName); // Use actual node name
    });

    // Remove old axes
    axisGroup.exit().transition().duration(750).style('opacity', 0).remove();

    console.log(
      '🎯 Axes drawn with labels for nodes:',
      visibleNodes.map((n) => n.NodeName)
    );
  }

  private drawNodes(g: any): void {
    const visibleNodes = this.nodes.filter((node) => node.isVisible);

    if (visibleNodes.length === 0) {
      console.log('🎯 Skills Radar: No visible nodes to draw');
      return;
    }

    const angleSlice = (Math.PI * 2) / visibleNodes.length;

    // Prepare data points for shapes
    const currentPoints: [number, number][] = [];
    const desiredPoints: [number, number][] = [];
    const proPoints: [number, number][] = [];

    visibleNodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

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

    // Get colors based on dark mode
    const currentColor = this.isDarkMode ? '#ff6666' : '#ff4444';
    const desiredColor = this.isDarkMode ? '#6666ff' : '#4444ff';
    const proColor = this.isDarkMode ? '#66ff66' : '#44ff44';

    // Draw pro value shape first (bottom layer - Green)
    g.append('path')
      .datum(proPoints)
      .attr('d', lineGenerator)
      .attr('fill', proColor)
      .attr('fill-opacity', 0.15)
      .attr('stroke', proColor)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.5)
      .attr('class', 'pro-shape')
      .style('opacity', this.showPro ? 1 : 0);

    // Draw desired value shape second (middle layer - Blue)
    g.append('path')
      .datum(desiredPoints)
      .attr('d', lineGenerator)
      .attr('fill', desiredColor)
      .attr('fill-opacity', 0.2)
      .attr('stroke', desiredColor)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('class', 'desired-shape')
      .style('opacity', this.showDesired ? 1 : 0);

    // Draw current value shape third (top layer - Red)
    g.append('path')
      .datum(currentPoints)
      .attr('d', lineGenerator)
      .attr('fill', currentColor)
      .attr('fill-opacity', 0.3)
      .attr('stroke', currentColor)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)
      .attr('class', 'current-shape')
      .style('opacity', this.showPerceived ? 1 : 0);

    // Draw individual sliders for each visible node
    visibleNodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

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
      // Get colors based on dark mode
      const currentColor = this.isDarkMode ? '#ff6666' : '#ff4444';
      const desiredColor = this.isDarkMode ? '#6666ff' : '#4444ff';
      const proColor = this.isDarkMode ? '#66ff66' : '#44ff44';
      const strokeColor = this.isDarkMode ? '#666' : '#333';

      // Pro line (Green)
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', proX)
        .attr('y2', proY)
        .attr('stroke', proColor)
        .attr('stroke-width', 2)
        .attr('opacity', this.showPro ? 0.6 : 0)
        .attr('class', `pro-line-${node.NodeID}`);

      // Desired line (Blue)
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', desiredX)
        .attr('y2', desiredY)
        .attr('stroke', desiredColor)
        .attr('stroke-width', 2)
        .attr('opacity', this.showDesired ? 0.7 : 0)
        .attr('class', `desired-line-${node.NodeID}`);

      // Current value slider (draggable - Red)
      const currentSlider = g
        .append('circle')
        .attr('cx', currentX)
        .attr('cy', currentY)
        .attr('r', 8)
        .attr('fill', currentColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('class', `current-slider-${node.NodeID}`)
        .style('opacity', this.showPerceived ? 1 : 0);

      // Desired value slider (draggable - Blue)
      const desiredSlider = g
        .append('circle')
        .attr('cx', desiredX)
        .attr('cy', desiredY)
        .attr('r', 8)
        .attr('fill', desiredColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('class', `desired-slider-${node.NodeID}`)
        .style('opacity', this.showDesired ? 1 : 0);

      // Pro value slider (draggable - Green)
      const proSlider = g
        .append('circle')
        .attr('cx', proX)
        .attr('cy', proY)
        .attr('r', 8)
        .attr('fill', proColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('class', `pro-slider-${node.NodeID}`)
        .style('opacity', this.showPro ? 1 : 0);

      // Add drag behavior to all sliders
      this.addDragBehavior(currentSlider, node, 'current', angle, g);
      this.addDragBehavior(desiredSlider, node, 'desired', angle, g);
      this.addDragBehavior(proSlider, node, 'pro', angle, g);

      // Add value labels
      g.append('text')
        .attr('x', currentX + 12)
        .attr('y', currentY + 4)
        .attr('font-size', '12px')
        .attr('fill', currentColor)
        .attr('font-weight', 'bold')
        .attr('class', `current-label-${node.NodeID}`)
        .style('opacity', this.showPerceived ? 1 : 0)
        .text(node.NodeCurrentValue.toString());

      g.append('text')
        .attr('x', desiredX + 12)
        .attr('y', desiredY + 4)
        .attr('font-size', '12px')
        .attr('fill', desiredColor)
        .attr('font-weight', 'bold')
        .attr('class', `desired-label-${node.NodeID}`)
        .style('opacity', this.showDesired ? 1 : 0)
        .text(node.NodeDesiredValue.toString());

      g.append('text')
        .attr('x', proX + 12)
        .attr('y', proY + 4)
        .attr('font-size', '12px')
        .attr('fill', proColor)
        .attr('font-weight', 'bold')
        .attr('class', `pro-label-${node.NodeID}`)
        .style('opacity', this.showPro ? 1 : 0)
        .text(node.NodeProValue.toString());
    });
  }

  private updateNodes(): void {
    if (!this.chartGroup) return;

    const visibleNodes = this.nodes.filter((node) => node.isVisible);
    const transitionDuration = 750;

    if (visibleNodes.length === 0) {
      // Remove all existing elements when no visible nodes
      this.chartGroup
        .selectAll('.node-group')
        .transition()
        .duration(transitionDuration)
        .style('opacity', 0)
        .remove();
      this.chartGroup
        .selectAll('.radar-shape')
        .transition()
        .duration(transitionDuration)
        .style('opacity', 0)
        .remove();
      return;
    }

    const angleSlice = (Math.PI * 2) / visibleNodes.length;

    // Update radar shapes using enter/update/exit pattern
    this.updateRadarShapes(visibleNodes, angleSlice, transitionDuration);

    // Update individual node elements
    this.updateNodeElements(visibleNodes, angleSlice, transitionDuration);
  }

  private updateRadarShapes(
    visibleNodes: IRadarNode[],
    angleSlice: number,
    duration: number
  ): void {
    // Prepare data points for shapes
    const shapeData = this.calculateShapePoints(visibleNodes, angleSlice);

    // Create line generator for smooth curves
    const lineGenerator = d3.line().curve(d3.curveLinearClosed);

    // Bind shape data
    const shapes = this.chartGroup.selectAll('.radar-shape').data(
      [
        {
          type: 'pro',
          points: shapeData.proPoints,
          color: '#44ff44',
          opacity: 0.15,
          strokeOpacity: 0.5,
          visible: this.showPro,
        },
        {
          type: 'desired',
          points: shapeData.desiredPoints,
          color: '#4444ff',
          opacity: 0.2,
          strokeOpacity: 0.6,
          visible: this.showDesired,
        },
        {
          type: 'current',
          points: shapeData.currentPoints,
          color: '#ff4444',
          opacity: 0.3,
          strokeOpacity: 0.8,
          visible: this.showPerceived,
        },
      ],
      (d: RadarShapeData) => d.type
    );

    // Enter new shapes
    const shapesEnter = shapes
      .enter()
      .append('path')
      .attr('class', (d: RadarShapeData) => `radar-shape ${d.type}-shape`)
      .attr('fill', (d: RadarShapeData) => d.color)
      .attr('stroke', (d: RadarShapeData) => d.color)
      .attr('stroke-width', 2)
      .style('opacity', 0);

    // Merge enter and update selections
    const shapesUpdate = shapesEnter.merge(shapes);

    // Update all shapes with transitions
    shapesUpdate
      .transition()
      .duration(duration)
      .attr('d', (d: RadarShapeData) => lineGenerator(d.points))
      .attr('fill-opacity', (d: RadarShapeData) => d.opacity)
      .attr('stroke-opacity', (d: RadarShapeData) => d.strokeOpacity)
      .style('opacity', (d: RadarShapeData) => (d.visible ? 1 : 0));

    // Exit old shapes
    shapes.exit().transition().duration(duration).style('opacity', 0).remove();
  }

  private updateNodeElements(
    visibleNodes: IRadarNode[],
    angleSlice: number,
    duration: number
  ): void {
    // Bind node data
    const nodeGroups = this.chartGroup
      .selectAll('.node-group')
      .data(visibleNodes, (d: IRadarNode) => d.NodeID.toString());

    // Enter new node groups
    const nodeGroupsEnter = nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('opacity', 0);

    // Add elements to new node groups
    this.addNodeElements(nodeGroupsEnter);

    // Merge enter and update selections
    const nodeGroupsUpdate = nodeGroupsEnter.merge(nodeGroups);

    // Update positions and values for all nodes
    nodeGroupsUpdate.each((node: IRadarNode, i: number, nodes: any[]) => {
      const angle = angleSlice * i - Math.PI / 2;
      const group = d3.select(nodes[i]);

      this.updateNodePosition(group, node, angle, duration);
    });

    // Fade in new elements
    nodeGroupsEnter.transition().duration(duration).style('opacity', 1);

    // Exit old node groups
    nodeGroups
      .exit()
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .remove();
  }

  private addNodeElements(nodeGroupsEnter: any): void {
    // Get colors based on dark mode
    const strokeColor = this.isDarkMode ? '#333' : '#fff';
    const currentColor = this.isDarkMode ? '#ff6666' : '#ff4444';
    const desiredColor = this.isDarkMode ? '#6666ff' : '#4444ff';
    const proColor = this.isDarkMode ? '#66ff66' : '#44ff44';

    // Add lines for each value type
    nodeGroupsEnter
      .append('line')
      .attr('class', 'pro-line')
      .attr('stroke', proColor)
      .attr('stroke-width', 2);
    nodeGroupsEnter
      .append('line')
      .attr('class', 'desired-line')
      .attr('stroke', desiredColor)
      .attr('stroke-width', 2);

    // Add circles for each value type
    nodeGroupsEnter
      .append('circle')
      .attr('class', 'current-slider')
      .attr('r', 8)
      .attr('fill', currentColor)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    nodeGroupsEnter
      .append('circle')
      .attr('class', 'desired-slider')
      .attr('r', 8)
      .attr('fill', desiredColor)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    nodeGroupsEnter
      .append('circle')
      .attr('class', 'pro-slider')
      .attr('r', 8)
      .attr('fill', proColor)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    // Add labels for each value type
    nodeGroupsEnter
      .append('text')
      .attr('class', 'current-label')
      .attr('font-size', '12px')
      .attr('fill', currentColor)
      .attr('font-weight', 'bold');
    nodeGroupsEnter
      .append('text')
      .attr('class', 'desired-label')
      .attr('font-size', '12px')
      .attr('fill', desiredColor)
      .attr('font-weight', 'bold');
    nodeGroupsEnter
      .append('text')
      .attr('class', 'pro-label')
      .attr('font-size', '12px')
      .attr('fill', proColor)
      .attr('font-weight', 'bold');
  }

  private updateNodePosition(
    group: any,
    node: IRadarNode,
    angle: number,
    duration: number
  ): void {
    const currentRadius = (this.radius / 5) * node.NodeCurrentValue;
    const desiredRadius = (this.radius / 5) * node.NodeDesiredValue;
    const proRadius = (this.radius / 5) * node.NodeProValue;

    const currentX = Math.cos(angle) * currentRadius;
    const currentY = Math.sin(angle) * currentRadius;
    const desiredX = Math.cos(angle) * desiredRadius;
    const desiredY = Math.sin(angle) * desiredRadius;
    const proX = Math.cos(angle) * proRadius;
    const proY = Math.sin(angle) * proRadius;

    // Update lines with transitions
    group
      .select('.pro-line')
      .transition()
      .duration(duration)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', proX)
      .attr('y2', proY)
      .attr('opacity', this.showPro ? 0.6 : 0);

    group
      .select('.desired-line')
      .transition()
      .duration(duration)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', desiredX)
      .attr('y2', desiredY)
      .attr('opacity', this.showDesired ? 0.7 : 0);

    // Update circles with transitions
    const currentSlider = group
      .select('.current-slider')
      .transition()
      .duration(duration)
      .attr('cx', currentX)
      .attr('cy', currentY)
      .style('opacity', this.showPerceived ? 1 : 0);

    const desiredSlider = group
      .select('.desired-slider')
      .transition()
      .duration(duration)
      .attr('cx', desiredX)
      .attr('cy', desiredY)
      .style('opacity', this.showDesired ? 1 : 0);

    const proSlider = group
      .select('.pro-slider')
      .transition()
      .duration(duration)
      .attr('cx', proX)
      .attr('cy', proY)
      .style('opacity', this.showPro ? 1 : 0);

    // Update labels with transitions
    group
      .select('.current-label')
      .transition()
      .duration(duration)
      .attr('x', currentX + 12)
      .attr('y', currentY + 4)
      .style('opacity', this.showPerceived ? 1 : 0)
      .text(node.NodeCurrentValue.toString());

    group
      .select('.desired-label')
      .transition()
      .duration(duration)
      .attr('x', desiredX + 12)
      .attr('y', desiredY + 4)
      .style('opacity', this.showDesired ? 1 : 0)
      .text(node.NodeDesiredValue.toString());

    group
      .select('.pro-label')
      .transition()
      .duration(duration)
      .attr('x', proX + 12)
      .attr('y', proY + 4)
      .style('opacity', this.showPro ? 1 : 0)
      .text(node.NodeProValue.toString());

    // Add drag behavior to sliders (only for new elements)
    if (
      group.select('.current-slider').empty() === false &&
      !group.select('.current-slider').on('start.drag')
    ) {
      this.addDragBehavior(
        group.select('.current-slider'),
        node,
        'current',
        angle,
        this.chartGroup
      );
      this.addDragBehavior(
        group.select('.desired-slider'),
        node,
        'desired',
        angle,
        this.chartGroup
      );
      this.addDragBehavior(
        group.select('.pro-slider'),
        node,
        'pro',
        angle,
        this.chartGroup
      );
    }
  }

  private calculateShapePoints(visibleNodes: IRadarNode[], angleSlice: number) {
    const currentPoints: [number, number][] = [];
    const desiredPoints: [number, number][] = [];
    const proPoints: [number, number][] = [];

    visibleNodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

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

    return { currentPoints, desiredPoints, proPoints };
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

      // Emit radar values changed event for persistence
      this.radarValuesChanged.emit({
        nodeId: node.NodeName,
        currentValue: node.NodeCurrentValue,
        desiredValue: node.NodeDesiredValue,
        proValue: node.NodeProValue,
      });

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

  private updateShapesWithTransition(g: any): void {
    const visibleNodes = this.nodes.filter((node) => node.isVisible);

    if (visibleNodes.length === 0) {
      return;
    }

    const angleSlice = (Math.PI * 2) / visibleNodes.length;

    // Prepare updated data points for shapes
    const currentPoints: [number, number][] = [];
    const desiredPoints: [number, number][] = [];
    const proPoints: [number, number][] = [];

    visibleNodes.forEach((node, i) => {
      const angle = angleSlice * i - Math.PI / 2;

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

    // Update shapes with smooth transitions
    g.select('.pro-shape')
      .datum(proPoints)
      .transition()
      .duration(300)
      .ease(d3.easeQuadInOut)
      .attr('d', lineGenerator);

    g.select('.desired-shape')
      .datum(desiredPoints)
      .transition()
      .duration(300)
      .ease(d3.easeQuadInOut)
      .attr('d', lineGenerator);

    g.select('.current-shape')
      .datum(currentPoints)
      .transition()
      .duration(300)
      .ease(d3.easeQuadInOut)
      .attr('d', lineGenerator);
  }

  public updateShapesVisibility(): void {
    if (!this.chartGroup) return;

    // Update radar shape visibility with smooth transitions
    this.chartGroup
      .selectAll('.radar-shape')
      .transition()
      .duration(300)
      .style('opacity', (d: RadarShapeData) => {
        // Update visibility based on current checkbox states
        let shouldShow = false;
        if (d.type === 'current') shouldShow = this.showPerceived;
        else if (d.type === 'desired') shouldShow = this.showDesired;
        else if (d.type === 'pro') shouldShow = this.showPro;
        return shouldShow ? d.opacity : 0;
      });

    // Update all node elements visibility
    this.chartGroup
      .selectAll('.node-group')
      .each((d: IRadarNode, i: number, nodes: any[]) => {
        const group = d3.select(nodes[i]);

        // Update sliders
        group
          .select('.current-slider')
          .transition()
          .duration(300)
          .style('opacity', this.showPerceived ? 1 : 0);

        group
          .select('.desired-slider')
          .transition()
          .duration(300)
          .style('opacity', this.showDesired ? 1 : 0);

        group
          .select('.pro-slider')
          .transition()
          .duration(300)
          .style('opacity', this.showPro ? 1 : 0);

        // Update labels
        group
          .select('.current-label')
          .transition()
          .duration(300)
          .style('opacity', this.showPerceived ? 1 : 0);

        group
          .select('.desired-label')
          .transition()
          .duration(300)
          .style('opacity', this.showDesired ? 1 : 0);

        group
          .select('.pro-label')
          .transition()
          .duration(300)
          .style('opacity', this.showPro ? 1 : 0);

        // Update lines
        group
          .select('.desired-line')
          .transition()
          .duration(300)
          .attr('opacity', this.showDesired ? 0.7 : 0);

        group
          .select('.pro-line')
          .transition()
          .duration(300)
          .attr('opacity', this.showPro ? 0.6 : 0);
      });
  }

  private drawLegend(): void {
    // Legend temporarily disabled for debugging
    console.log('🎯 Legend drawing disabled');
  }

  private updateChart(): void {
    if (!this.svg || !this.chartContainer) {
      if (this.visible && this.expanded && this.nodes.length > 0) {
        setTimeout(() => {
          this.createChart();
        }, 100);
      }
      return;
    }

    // If no nodes, clear the chart content but keep the grid
    if (this.nodes.length === 0) {
      const g = this.svg.select('g');
      g.selectAll('.radar-shape').remove();
      g.selectAll('.node-group').remove();
      g.selectAll('.axis').remove();
      g.selectAll('.axis-label').remove();
      console.log('🎯 Chart cleared - no nodes to display');
      return;
    }

    const g = this.svg.select('g');
    const visibleNodes = this.nodes.filter((node) => node.isVisible);
    const angleSlice = (Math.PI * 2) / visibleNodes.length;

    // Update grid
    g.selectAll('.grid-element').remove();
    this.drawGrid(g);

    // Update axes and labels with smooth transitions
    this.drawAxes(g);

    // Update radar shapes and nodes with smooth transitions
    this.updateRadarShapes(visibleNodes, angleSlice, 750);
    this.updateNodeElements(visibleNodes, angleSlice, 750);

    console.log('🎯 Chart updated with smooth transitions');
  }
}
