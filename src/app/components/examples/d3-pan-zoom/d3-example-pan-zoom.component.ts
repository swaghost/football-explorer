import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-d3-pan-zoom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d3-example-pan-zoom.component.html',
  styleUrls: ['./d3-example-pan-zoom.component.scss'],
})
export class D3ExamplePanZoomComponent implements AfterViewInit {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  public width = 800;
  public height = 600;

  public selectedNode: string | null = null;
  public zoomLevel = 1;
  public panX = 0;
  public panY = 0;
  public nodeCount = 25;
  public rotationAngle = 0;
  public tooltip: { visible: boolean; x: number; y: number; text: string } = {
    visible: false,
    x: 0,
    y: 0,
    text: '',
  };

  private svg: any;
  private g: any;
  private zoom: any;
  private degreeGroup: any;
  private currentRotation = 0;

  ngAfterViewInit(): void {
    this.drawSvg();
  }

  drawSvg() {
    // Add double-click event to the topmost 'g' element to reset pan and zoom
    this.svg = d3
      .select(this.svgRef.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', '#f8f8f8');

    // Add degree circle with ticks (fixed, not affected by pan/zoom)
    this.drawDegreeCircle();

    // Create a group for pan/zoom
    this.g = this.svg.append('g');
    // ...existing code for drawing circles, labels, etc...

    // D3 zoom behavior
    // (already declared above, do not redeclare)

    // Add double-click event to the topmost 'g' element to reset pan and zoom

    // Add an aqua background circle to the 'g' group (content area, inside degree circle)
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const backgroundRadius = Math.min(this.width, this.height) * 0.35; // Same as content boundary

    this.g
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', backgroundRadius)
      .attr('fill', 'aqua')
      .attr('opacity', 0.25)
      .attr('pointer-events', 'all')
      .on('dblclick', (event: MouseEvent) => {
        console.log('g dblclick', event);
        const t = d3.transition().duration(2000);
        const center = [this.width / 2, this.height / 2];
        const scale = 1;
        const tx = center[0] - center[0] * scale;
        const ty = center[1] - center[1] * scale;
        this.g
          .transition(t)
          .duration(2000)
          .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
        this.selectedNode = null;
        (this as any).cdRef?.detectChanges?.();
        event.stopPropagation();
      });
    // Generate initial node data
    const circles = this.generateNodeData(this.nodeCount);

    // Draw circles and labels
    this.drawCircles(circles);
    this.drawLabels(circles);

    // D3 zoom behavior (scroll wheel zoom + drag panning)
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .filter((event) => {
        // Allow both wheel events (zoom) and drag events (pan)
        return event.type === 'wheel' || event.type === 'mousedown';
      })
      .on('zoom', (event) => {
        // Handle scroll wheel zoom vs drag panning correctly
        if (event.sourceEvent && event.sourceEvent.type === 'wheel') {
          // For scroll wheel: ONLY update zoom, preserve existing pan values
          this.zoomLevel = event.transform.k;
          // panX and panY stay unchanged - don't let scroll wheel affect pan

          // Update D3's internal transform to match our component state
          // This prevents the transform from getting out of sync
          const correctedTransform = d3.zoomIdentity
            .translate(this.panX, this.panY)
            .scale(this.zoomLevel);
          // Update D3's internal state without triggering another zoom event
          this.svg.property('__zoom', correctedTransform);
        } else {
          // For drag operations: update pan coordinates only, preserve current zoom level
          this.panX = event.transform.x;
          this.panY = event.transform.y;
          // Keep the existing zoom level - don't let drag reset zoom
        }

        // Apply transform using consistent logic
        this.applyTransform();

        // Trigger change detection to update the UI sliders
        (this as any).cdRef?.detectChanges?.();
      });

    // Apply zoom behavior to SVG
    this.svg.call(this.zoom as any);

    // Remove double-click event on SVG. Only 'g' group will handle double-click reset.
  }

  updatePan(event: Event, axis: 'x' | 'y') {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (axis === 'x') {
      this.panX = value;
    } else {
      this.panY = value;
    }

    // Apply the new transform with rotation using consistent logic
    this.applyTransform();

    // Update D3 zoom transform state to sync sliders with drag panning
    const transform = d3.zoomIdentity
      .translate(this.panX, this.panY)
      .scale(this.zoomLevel);
    this.svg.call(this.zoom.transform, transform);
  }

  updateZoom(event: Event) {
    const target = event.target as HTMLInputElement;
    this.zoomLevel = parseFloat(target.value);

    // Apply the new transform with rotation using the same logic as the zoom handler
    this.applyTransform();

    // Update D3 zoom transform state to sync scroll wheel with slider
    const transform = d3.zoomIdentity.scale(this.zoomLevel);
    this.svg.call(this.zoom.transform, transform);
  }

  private applyTransform() {
    // Apply combined transform with rotation - same logic used by zoom handler and sliders
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const combinedTransform = `translate(${centerX + this.panX},${
      centerY + this.panY
    }) rotate(${this.rotationAngle}) scale(${
      this.zoomLevel
    }) translate(${-centerX},${-centerY})`;
    this.g.attr('transform', combinedTransform);
  }

  updateNodeCount(event: Event) {
    const target = event.target as HTMLInputElement;
    this.nodeCount = parseInt(target.value);

    // Regenerate the visualization with new node count
    this.redrawNodes();
  }

  private redrawNodes() {
    // Generate new node data based on nodeCount
    const circles = this.generateNodeData(this.nodeCount);

    // Update circles and labels using enter-update-exit pattern
    this.updateCircles(circles);
    this.updateLabels(circles);
  }

  private generateNodeData(
    count: number
  ): { x: number; y: number; r: number; id: string }[] {
    const circles: { x: number; y: number; r: number; id: string }[] = [];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    // Calculate the content bounds (should be well inside the degree circle)
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const contentRadius = Math.min(this.width, this.height) * 0.35; // Same as degree circle content boundary

    // Create a grid that fits comfortably inside the content area
    const gridRadius = contentRadius * 0.75; // 75% of content radius for comfortable padding
    const gridWidth = gridRadius * 2;
    const gridHeight = gridRadius * 2;

    const spacingX = gridWidth / (cols + 1);
    const spacingY = gridHeight / (rows + 1);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Center the grid within the circle
      const gridStartX = centerX - gridWidth / 2;
      const gridStartY = centerY - gridHeight / 2;

      circles.push({
        x: gridStartX + (col + 1) * spacingX,
        y: gridStartY + (row + 1) * spacingY,
        r: Math.min(spacingX, spacingY) * 0.15,
        id: `${i}`,
      });
    }
    return circles;
  }

  private drawCircles(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    this.g
      .selectAll('circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r)
      .attr('fill', '#2196f3')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        console.log('circle click', d.id, event);
        const scale = 2;
        const tx = this.width / 2 - d.x * scale;
        const ty = this.height / 2 - d.y * scale;
        this.g
          .transition()
          .duration(600)
          .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
        this.selectedNode = d.id;
        (this as any).cdRef?.detectChanges?.();
        event.stopPropagation();
      });
  }

  private updateCircles(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    // Join new data with existing circles
    const circleSelection = this.g
      .selectAll('circle')
      .data(circles, (d: any) => d.id);

    // EXIT: Remove old elements with smooth fade out
    circleSelection
      .exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    // ENTER: Add new elements with smooth fade in
    const enterCircles = circleSelection
      .enter()
      .append('circle')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', 0) // Start with radius 0
      .attr('fill', '#2196f3')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .style('opacity', 0); // Start transparent

    // Add event handlers to new circles
    enterCircles
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        console.log('circle click', d.id, event);
        const scale = 2;
        const tx = this.width / 2 - d.x * scale;
        const ty = this.height / 2 - d.y * scale;
        this.g
          .transition()
          .duration(600)
          .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
        this.selectedNode = d.id;
        (this as any).cdRef?.detectChanges?.();
        event.stopPropagation();
      });

    // UPDATE: Merge enter and existing selections, then animate to new positions
    enterCircles
      .merge(circleSelection)
      .transition()
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r)
      .style('opacity', 1);
  }

  private drawLabels(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    this.g
      .selectAll('text')
      .data(circles)
      .enter()
      .append('text')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => Math.min(12, d.r))
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .text((d: any) => d.id)
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        console.log('label click', d.id, event);
        const scale = 2;
        const tx = this.width / 2 - d.x * scale;
        const ty = this.height / 2 - d.y * scale;
        this.g
          .transition()
          .duration(600)
          .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
        this.selectedNode = d.id;
        (this as any).cdRef?.detectChanges?.();
      });
  }

  private updateLabels(
    circles: { x: number; y: number; r: number; id: string }[]
  ) {
    // Join new data with existing text labels
    const labelSelection = this.g
      .selectAll('text')
      .data(circles, (d: any) => d.id);

    // EXIT: Remove old labels with smooth fade out
    labelSelection
      .exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .attr('font-size', 0)
      .remove();

    // ENTER: Add new labels with smooth fade in
    const enterLabels = labelSelection
      .enter()
      .append('text')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 0) // Start with font-size 0
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .style('opacity', 0) // Start transparent
      .text((d: any) => d.id);

    // Add event handlers to new labels
    enterLabels
      .on('mouseover', (event: any, d: any) => {
        this.tooltip = {
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          text: d.id,
        };
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mousemove', (event: any, d: any) => {
        this.tooltip.x = event.offsetX;
        this.tooltip.y = event.offsetY;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('mouseout', () => {
        this.tooltip.visible = false;
        (this as any).cdRef?.detectChanges?.();
      })
      .on('click', (event: any, d: any) => {
        console.log('label click', d.id, event);
        const scale = 2;
        const tx = this.width / 2 - d.x * scale;
        const ty = this.height / 2 - d.y * scale;
        this.g
          .transition()
          .duration(600)
          .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
        this.selectedNode = d.id;
        (this as any).cdRef?.detectChanges?.();
      });

    // UPDATE: Merge enter and existing selections, then animate to new positions
    enterLabels
      .merge(labelSelection)
      .transition()
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 5)
      .attr('font-size', (d: any) => Math.min(12, d.r))
      .style('opacity', 1);
  }

  private drawDegreeCircle() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    // Calculate radius to be outside the content area
    // Content area is 80% of the smaller dimension, so degree circle should be larger
    const contentRadius = Math.min(this.width, this.height) * 0.35; // Content boundary
    const radius = contentRadius + 60; // Position degree circle 60px outside content area

    // Create a group for degree markings (will rotate together with content)
    this.degreeGroup = this.svg.append('g').attr('class', 'degree-circle');

    // Draw the main circle
    this.degreeGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Draw degree ticks and labels
    const majorDegrees = [
      0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
    ];
    const minorDegrees = [15, 75, 105, 165, 195, 255, 285, 345]; // Additional minor ticks

    // Major degree ticks (longer lines)
    majorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180; // -90 to start from top (0°)
      const x1 = centerX + Math.cos(radian) * (radius - 15);
      const y1 = centerY + Math.sin(radian) * (radius - 15);
      const x2 = centerX + Math.cos(radian) * (radius + 5);
      const y2 = centerY + Math.sin(radian) * (radius + 5);

      // Tick mark
      this.degreeGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);

      // Degree label
      const labelX = centerX + Math.cos(radian) * (radius + 20);
      const labelY = centerY + Math.sin(radian) * (radius + 20);

      this.degreeGroup
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .attr('opacity', 0.8)
        .text(`${degree}°`);
    });

    // Minor degree ticks (shorter lines)
    minorDegrees.forEach((degree) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const x1 = centerX + Math.cos(radian) * (radius - 8);
      const y1 = centerY + Math.sin(radian) * (radius - 8);
      const x2 = centerX + Math.cos(radian) * (radius + 2);
      const y2 = centerY + Math.sin(radian) * (radius + 2);

      this.degreeGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    });

    // Add cardinal direction labels (N, E, S, W)
    const cardinalDirections = [
      { degree: 0, label: 'N' },
      { degree: 90, label: 'E' },
      { degree: 180, label: 'S' },
      { degree: 270, label: 'W' },
    ];

    cardinalDirections.forEach(({ degree, label }) => {
      const radian = ((degree - 90) * Math.PI) / 180;
      const labelX = centerX + Math.cos(radian) * (radius + 35);
      const labelY = centerY + Math.sin(radian) * (radius + 35);

      this.degreeGroup
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', '#2196f3')
        .attr('opacity', 0.9)
        .text(label);
    });

    // Add center crosshair
    this.degreeGroup
      .append('line')
      .attr('x1', centerX - 10)
      .attr('y1', centerY)
      .attr('x2', centerX + 10)
      .attr('y2', centerY)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    this.degreeGroup
      .append('line')
      .attr('x1', centerX)
      .attr('y1', centerY - 10)
      .attr('x2', centerX)
      .attr('y2', centerY + 10)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Note: Drag-to-rotate functionality removed for better smoothness
    // Use the rotation slider for precise rotation control
  }

  updateRotation(event: Event) {
    const target = event.target as HTMLInputElement;
    this.rotationAngle = parseInt(target.value);
    this.currentRotation = (this.rotationAngle * Math.PI) / 180;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Apply rotation to degree circle
    const degreeTransform = `translate(${centerX},${centerY}) rotate(${
      this.rotationAngle
    }) translate(${-centerX},${-centerY})`;
    this.degreeGroup.attr('transform', degreeTransform);

    // Apply rotation to main content using consistent transform logic
    this.applyTransform();
  }
}
