import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
}

@Component({
  selector: 'app-d3-example-sunburst',
  imports: [CommonModule, FormsModule],
  templateUrl: './d3-example-sunburst.html',
  styleUrl: './d3-example-sunburst.scss',
  standalone: true,
})
export class D3ExampleSunburst implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef;

  private svg: any;
  private g: any;
  private zoom: any;
  private width = 928;
  private height = 928;

  radiusMultiplier = 1;
  minRadius = 0.5;
  maxRadius = 3;

  zoomLevel = 1;
  minZoom = 0.5;
  maxZoom = 8;

  rotation = 0;
  minRotation = 0;
  maxRotation = 360;

  private isRotating = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  get radius(): number {
    return (this.width / 6) * this.radiusMultiplier;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateDimensions();
    this.onRadiusChange();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.altKey) {
      this.isRotating = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isRotating && event.altKey) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;

      // Use horizontal movement for rotation (or combine both)
      const rotationDelta = deltaX * 0.5; // Adjust sensitivity

      this.rotation += rotationDelta;

      // Normalize rotation to 0-360 range
      while (this.rotation < 0) this.rotation += 360;
      while (this.rotation >= 360) this.rotation -= 360;

      this.updateRotation();

      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isRotating = false;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Alt') {
      this.isRotating = false;
    }
  }

  private updateDimensions(): void {
    const container = this.chartContainer.nativeElement;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
  } // Sample hierarchical data
  private data: HierarchyNode = {
    name: 'Root',
    children: [
      {
        name: 'Analytics',
        children: [
          {
            name: 'Cluster',
            children: [
              { name: 'AgglomerativeCluster', value: 3938 },
              { name: 'CommunityStructure', value: 3812 },
              { name: 'HierarchicalCluster', value: 6714 },
              { name: 'MergeEdge', value: 743 },
            ],
          },
          {
            name: 'Graph',
            children: [
              { name: 'BetweennessCentrality', value: 3534 },
              { name: 'LinkDistance', value: 5731 },
              { name: 'MaxFlowMinCut', value: 7840 },
              { name: 'ShortestPaths', value: 5914 },
              { name: 'SpanningTree', value: 3416 },
            ],
          },
          {
            name: 'Optimization',
            children: [{ name: 'AspectRatioBanker', value: 7074 }],
          },
        ],
      },
      {
        name: 'Animate',
        children: [
          { name: 'Easing', value: 17010 },
          { name: 'FunctionSequence', value: 5842 },
          {
            name: 'Interpolate',
            children: [
              { name: 'ArrayInterpolator', value: 1983 },
              { name: 'ColorInterpolator', value: 2047 },
              { name: 'DateInterpolator', value: 1375 },
              { name: 'Interpolator', value: 8746 },
              { name: 'MatrixInterpolator', value: 2202 },
              { name: 'NumberInterpolator', value: 1382 },
              { name: 'ObjectInterpolator', value: 1629 },
              { name: 'PointInterpolator', value: 1675 },
              { name: 'RectangleInterpolator', value: 2042 },
            ],
          },
          { name: 'ISchedulable', value: 1041 },
          { name: 'Parallel', value: 5176 },
          { name: 'Pause', value: 449 },
          { name: 'Scheduler', value: 5593 },
          { name: 'Sequence', value: 5534 },
          { name: 'Transition', value: 9201 },
          { name: 'Transitioner', value: 19975 },
          { name: 'TransitionEvent', value: 1116 },
          { name: 'Tween', value: 6006 },
        ],
      },
      {
        name: 'Data',
        children: [
          {
            name: 'Converters',
            children: [
              { name: 'Converters', value: 721 },
              { name: 'DelimitedTextConverter', value: 4294 },
            ],
          },
          { name: 'DataField', value: 1759 },
          { name: 'DataSchema', value: 2165 },
          { name: 'DataSet', value: 586 },
          { name: 'DataSource', value: 3331 },
          { name: 'DataTable', value: 772 },
          { name: 'DataUtil', value: 3322 },
        ],
      },
      {
        name: 'Display',
        children: [
          { name: 'DirtySprite', value: 8833 },
          { name: 'LineSprite', value: 1732 },
          { name: 'RectSprite', value: 3623 },
          { name: 'TextSprite', value: 10066 },
        ],
      },
      {
        name: 'Flex',
        children: [{ name: 'FlareVis', value: 4116 }],
      },
    ],
  };

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.updateDimensions();
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }

  private createChart(): void {
    const container = this.chartContainer.nativeElement;

    // Create color scale
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, this.data.children!.length + 1)
    );

    // Compute the layout
    const hierarchy = d3
      .hierarchy(this.data)
      .sum((d: any) => d.value)
      .sort((a, b) => b.value! - a.value!);

    const root = d3
      .partition<HierarchyNode>()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    root.each((d: any) => (d.current = d));

    // Create arc generator
    const arc = d3
      .arc<any>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(this.radius * 1.5)
      .innerRadius((d) => d.y0 * this.radius)
      .outerRadius((d) => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1));

    // Create SVG
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      ])
      .style('font', '10px sans-serif');

    // Add zoom behavior
    this.zoom = d3
      .zoom()
      .scaleExtent([this.minZoom, this.maxZoom])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.zoomLevel = event.transform.k;
      });

    this.svg.call(this.zoom);

    // Create main group for all elements
    this.g = this.svg.append('g');

    // Append arcs
    const path = this.g
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d: any) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', (d: any) =>
        this.arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr('pointer-events', (d: any) =>
        this.arcVisible(d.current) ? 'auto' : 'none'
      )
      .attr('d', (d: any) => arc(d.current));

    // Add click interaction
    path
      .filter((d: any) => d.children)
      .style('cursor', 'pointer')
      .on('click', (event: any, p: any) =>
        this.clicked(event, p, path, label, arc, root)
      );

    // Add tooltips
    path.append('title').text(
      (d: any) =>
        `${d
          .ancestors()
          .map((d: any) => d.data.name)
          .reverse()
          .join('/')}
${d.value?.toLocaleString()}`
    );

    // Add labels
    const label = this.g
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill-opacity', (d: any) => +this.labelVisible(d.current))
      .attr('transform', (d: any) => this.labelTransform(d.current))
      .text((d: any) => d.data.name);

    // Add center circle
    const parent = this.g
      .append('circle')
      .datum(root)
      .attr('r', this.radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', (event: any, p: any) =>
        this.clicked(event, p, path, label, arc, root)
      );
  }

  private clicked(
    event: any,
    p: any,
    path: any,
    label: any,
    arc: any,
    root: any
  ): void {
    const parentCircle = this.svg.select('circle');
    parentCircle.datum(p.parent || root);

    root.each(
      (d: any) =>
        (d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        })
    );

    const t = this.svg.transition().duration(750);

    const arcVisibleFn = this.arcVisible.bind(this);

    // Transition the data on all arcs
    path
      .transition(t)
      .tween('data', (d: any) => {
        const i = d3.interpolate(d.current, d.target);
        return (t: number) => (d.current = i(t));
      })
      .filter(function (this: any, d: any) {
        return +this.getAttribute('fill-opacity') || arcVisibleFn(d.target);
      })
      .attr('fill-opacity', (d: any) =>
        this.arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr('pointer-events', (d: any) =>
        this.arcVisible(d.target) ? 'auto' : 'none'
      )
      .attrTween('d', (d: any) => () => arc(d.current));

    // Transition labels
    label
      .transition(t)
      .attr('fill-opacity', (d: any) => +this.labelVisible(d.target))
      .attrTween('transform', (d: any) => () => this.labelTransform(d.current));
  }

  private arcVisible(d: any): boolean {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  private labelVisible(d: any): boolean {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  private labelTransform(d: any): string {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * this.radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  onRadiusChange(): void {
    // Clear existing visualization
    if (this.svg) {
      this.svg.selectAll('*').remove();
      this.svg.remove();
    }

    // Recreate chart with new radius
    this.createChart();
  }

  onZoomChange(): void {
    if (this.svg && this.zoom) {
      const transform = d3.zoomIdentity.scale(this.zoomLevel);
      this.svg.transition().duration(300).call(this.zoom.transform, transform);
    }
  }

  onRotationChange(): void {
    this.updateRotation();
  }

  private updateRotation(): void {
    if (this.g) {
      this.g.attr('transform', `rotate(${this.rotation})`);
    }
  }
}
