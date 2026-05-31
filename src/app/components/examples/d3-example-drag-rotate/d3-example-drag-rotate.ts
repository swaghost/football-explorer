import { DecimalPipe } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

type TickMode = 'degrees' | 'radians' | 'none';

@Component({
  selector: 'app-d3-example-drag-rotate',
  imports: [DecimalPipe],
  templateUrl: './d3-example-drag-rotate.html',
  styleUrl: './d3-example-drag-rotate.scss',
})
export class D3ExampleDragRotate implements AfterViewInit {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  public width = 1024;
  public height = 1024;
  private center = [this.width / 2, this.height / 2];
  private currentAngle = 0;
  public sliderAngle = 0; // Slider value in degrees
  public tickMode: TickMode = 'degrees';
  public zoom = 1; // Zoom factor
  public zoomSlider = 1; // For slider UI

  private rotatingGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;
  private tickGroup: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null = null;

  ngAfterViewInit(): void {
    this.drawSvg();
    this.attachZoomDrag();
  }

  drawSvg() {
    const svg = d3.select(this.svgRef.nativeElement);

    // Clear SVG in case of hot reload or redraw
    svg.selectAll('*').remove();

    // Outer circle with ticks (non-rotating, but scales with zoom)
    const baseOuterRadius = 180;
    const outerRadius = baseOuterRadius * this.zoom;
    this.tickGroup = svg
      .append('g')
      .attr('transform', `translate(${this.center})`);

    this.drawTicks(outerRadius, this.tickMode);

    // Rotating group (inner circle)
    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.center}) rotate(${this.sliderAngle}) scale(${this.zoom})`
      );

    g.append('circle')
      .attr('r', 100)
      .attr('fill', 'lightblue')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .text('Drag to Rotate');

    let startAngle = 0;

    const drag = d3
      .drag<SVGGElement, unknown>()
      .on('start', (event) => {
        const [x, y] = d3.pointer(event, svg.node());
        startAngle =
          Math.atan2(y - this.center[1], x - this.center[0]) -
          this.currentAngle;
      })
      .on('drag', (event) => {
        const [x, y] = d3.pointer(event, svg.node());
        this.currentAngle =
          Math.atan2(y - this.center[1], x - this.center[0]) - startAngle;
        g.attr(
          'transform',
          `translate(${this.center}) rotate(${
            (this.currentAngle * 180) / Math.PI
          }) scale(${this.zoom})`
        );
        // Sync slider with drag, allow negative angles
        this.sliderAngle = Math.round((this.currentAngle * 180) / Math.PI);

        // Redraw outer ticks to match zoom
        const newOuterRadius = baseOuterRadius * this.zoom;
        this.drawTicks(newOuterRadius, this.tickMode);
      });

    g.call(drag);

    this.rotatingGroup = g;
  }

  drawTicks(outerRadius: number, mode: TickMode) {
    if (!this.tickGroup) return;
    this.tickGroup.selectAll('*').remove();

    // Draw outer circle
    this.tickGroup
      .append('circle')
      .attr('r', outerRadius)
      .attr('fill', 'none')
      .attr('stroke', '#444')
      .attr('stroke-width', 2);

    if (mode === 'none') return;

    if (mode === 'degrees') {
      for (let deg = 0; deg < 360; deg++) {
        const rad = (deg * Math.PI) / 180;
        const isMajor = deg % 30 === 0;
        const tickLen = isMajor ? 20 : 8;
        const x1 = Math.cos(rad) * (outerRadius - tickLen);
        const y1 = Math.sin(rad) * (outerRadius - tickLen);
        const x2 = Math.cos(rad) * outerRadius;
        const y2 = Math.sin(rad) * outerRadius;

        this.tickGroup
          .append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', isMajor ? '#222' : '#888')
          .attr('stroke-width', isMajor ? 3 : 1);

        // Add degree labels at major ticks
        if (isMajor) {
          const labelRadius = outerRadius + 30;
          const lx = Math.cos(rad) * labelRadius;
          const ly = Math.sin(rad) * labelRadius;
          this.tickGroup
            .append('text')
            .attr('x', lx)
            .attr('y', ly)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', 18)
            .attr('fill', '#222')
            .text(deg.toString());
        }
      }
    } else if (mode === 'radians') {
      // Major ticks every π/6 (30 degrees), minor ticks every π/180 (1 degree)
      for (let i = 0; i < 360; i++) {
        const rad = (i * Math.PI) / 180;
        const isMajor = i % 30 === 0;
        const tickLen = isMajor ? 20 : 8;
        const x1 = Math.cos(rad) * (outerRadius - tickLen);
        const y1 = Math.sin(rad) * (outerRadius - tickLen);
        const x2 = Math.cos(rad) * outerRadius;
        const y2 = Math.sin(rad) * outerRadius;

        this.tickGroup
          .append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', isMajor ? '#222' : '#888')
          .attr('stroke-width', isMajor ? 3 : 1);

        // Add radian labels at major ticks
        if (isMajor) {
          const labelRadius = outerRadius + 30;
          const lx = Math.cos(rad) * labelRadius;
          const ly = Math.sin(rad) * labelRadius;
          let label = '';
          switch (i) {
            case 0:
              label = '0';
              break;
            case 30:
              label = 'π/6';
              break;
            case 60:
              label = 'π/3';
              break;
            case 90:
              label = 'π/2';
              break;
            case 120:
              label = '2π/3';
              break;
            case 150:
              label = '5π/6';
              break;
            case 180:
              label = 'π';
              break;
            case 210:
              label = '7π/6';
              break;
            case 240:
              label = '4π/3';
              break;
            case 270:
              label = '3π/2';
              break;
            case 300:
              label = '5π/3';
              break;
            case 330:
              label = '11π/6';
              break;
            case 360:
              label = '2π';
              break;
            default:
              label = '';
              break;
          }
          if (label) {
            this.tickGroup
              .append('text')
              .attr('x', lx)
              .attr('y', ly)
              .attr('text-anchor', 'middle')
              .attr('alignment-baseline', 'middle')
              .attr('font-size', 18)
              .attr('fill', '#222')
              .text(label);
          }
        }
      }
    }
  }

  // Called when slider changes
  onSliderChange(event: any) {
    this.sliderAngle = +event.target.value;
    this.currentAngle = (this.sliderAngle * Math.PI) / 180;
    if (this.rotatingGroup) {
      this.rotatingGroup.attr(
        'transform',
        `translate(${this.center}) rotate(${this.sliderAngle}) scale(${this.zoom})`
      );
    }
    // Redraw outer ticks to match zoom
    const baseOuterRadius = 180;
    this.drawTicks(baseOuterRadius * this.zoom, this.tickMode);
  }

  // Called when radio button changes
  onTickModeChange(event: any) {
    this.tickMode = event.target.value as TickMode;
    this.drawSvg(); // Redraw everything so ticks and zoom are always in sync
  }

  // Attach zoom drag to SVG
  attachZoomDrag() {
    const svg = d3.select(this.svgRef.nativeElement);
    let isZooming = false;
    let lastY = 0;

    svg.on('mousedown.zoomdrag', (event: MouseEvent) => {
      const [x, y] = d3.pointer(event, svg.node());
      // Only start zoom drag if outside the tick circle
      const dx = x - this.center[0];
      const dy = y - this.center[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 200) {
        isZooming = true;
        lastY = y;
        event.preventDefault();
      }
    });

    svg.on('mousemove.zoomdrag', (event: MouseEvent) => {
      if (isZooming) {
        const [, y] = d3.pointer(event, svg.node());
        const deltaY = y - lastY;
        lastY = y;
        // Adjust zoom factor, clamp between 0.2 and 5
        this.zoom = Math.max(0.2, Math.min(5, this.zoom - deltaY * 0.01));
        this.zoomSlider = this.zoom;
        if (this.rotatingGroup) {
          this.rotatingGroup.attr(
            'transform',
            `translate(${this.center}) rotate(${this.sliderAngle}) scale(${this.zoom})`
          );
        }
        // Redraw outer ticks to match zoom (live update)
        const baseOuterRadius = 180;
        this.drawTicks(baseOuterRadius * this.zoom, this.tickMode);
      }
    });

    svg.on('mouseup.zoomdrag', () => {
      isZooming = false;
      // Ensure ticks are redrawn after zoom drag stops
      const baseOuterRadius = 180;
      this.drawTicks(baseOuterRadius * this.zoom, this.tickMode);
    });

    svg.on('mouseleave.zoomdrag', () => {
      isZooming = false;
      // Ensure ticks are redrawn after zoom drag stops
      const baseOuterRadius = 180;
      this.drawTicks(baseOuterRadius * this.zoom, this.tickMode);
    });
  }

  // Called when zoom slider changes
  onZoomSliderChange(event: any) {
    this.zoomSlider = +event.target.value;
    this.zoom = this.zoomSlider;
    if (this.rotatingGroup) {
      this.rotatingGroup.attr(
        'transform',
        `translate(${this.center}) rotate(${this.sliderAngle}) scale(${this.zoom})`
      );
    }
    // Redraw outer ticks to match zoom
    const baseOuterRadius = 180;
    this.drawTicks(baseOuterRadius * this.zoom, this.tickMode);
  }
}
