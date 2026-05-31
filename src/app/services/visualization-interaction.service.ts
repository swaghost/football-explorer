import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as d3 from 'd3';
import {
  IInteractionHandler,
  VisualizationTransform,
  VisualizationDimensions,
  D3TreeNode,
} from '../interfaces';

/**
 * Service to handle all visualization interactions (pan, zoom, rotate, pan-to-node)
 * Encapsulates interaction logic separate from rendering
 */
@Injectable({ providedIn: 'root' })
export class VisualizationInteractionService implements IInteractionHandler {
  private transform: VisualizationTransform = {
    panX: 0,
    panY: 0,
    zoomLevel: 1,
    rotationAngle: 0,
  };

  private zoomBehavior: any = null;
  private svgElement: SVGSVGElement | null = null;
  private rotationDragActive = false;
  private rotationStartAngle = 0;

  /**
   * Set up D3 zoom behavior on the SVG element
   */
  setupZoomBehavior(
    svgElement: SVGSVGElement,
    options: {
      scaleExtent: [number, number];
      onZoom: (transform: VisualizationTransform) => void;
      filter?: (event: any) => boolean;
    }
  ): void {
    this.svgElement = svgElement;

    this.zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(options.scaleExtent)
      .filter(options.filter || (() => true))
      .on('zoom', (event) => {
        // Handle scroll wheel zoom vs drag panning correctly
        if (event.sourceEvent && event.sourceEvent.type === 'wheel') {
          // For scroll wheel: ONLY update zoom, preserve existing pan values
          this.transform.zoomLevel = event.transform.k;

          // Update D3's internal transform to match our component state
          const correctedTransform = d3.zoomIdentity
            .translate(this.transform.panX, this.transform.panY)
            .scale(this.transform.zoomLevel);

          // Update D3's internal state without triggering another zoom event
          d3.select(svgElement).property('__zoom', correctedTransform);
        } else {
          // For drag operations: update pan coordinates only, preserve current zoom level
          this.transform.panX = event.transform.x;
          this.transform.panY = event.transform.y;
        }

        // Notify consumer of transform change
        options.onZoom(this.transform);
      });

    d3.select(svgElement).call(this.zoomBehavior as any);
  }

  /**
   * Pan to a specific node by ID with smooth animation
   */
  panToNode(
    nodeId: string,
    nodes: D3TreeNode[],
    currentTransform: VisualizationTransform,
    dimensions: VisualizationDimensions
  ): Observable<VisualizationTransform> {
    const subject = new Subject<VisualizationTransform>();

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      console.warn('Node not found:', nodeId);
      subject.complete();
      return subject.asObservable();
    }

    // Calculate the transform needed to center the node at the blue dot (screen center)
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // The node coordinates (node.x, node.y) are already in the visualization space
    // We need to calculate pan so that: centerX = node.x * zoom + panX
    // Therefore: panX = centerX - node.x * zoom
    const targetPanX = centerX - node.x * currentTransform.zoomLevel;
    const targetPanY = centerY - node.y * currentTransform.zoomLevel;

    // Animate the pan transition
    const duration = 750;
    const startPanX = this.transform.panX;
    const startPanY = this.transform.panY;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out cubic easing
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.transform.panX =
        startPanX + (targetPanX - startPanX) * easedProgress;
      this.transform.panY =
        startPanY + (targetPanY - startPanY) * easedProgress;

      subject.next({ ...this.transform });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Update D3 zoom transform state after animation completes
        if (this.svgElement && this.zoomBehavior) {
          const transform = d3.zoomIdentity
            .translate(this.transform.panX, this.transform.panY)
            .scale(this.transform.zoomLevel);
          d3.select(this.svgElement).call(
            this.zoomBehavior.transform,
            transform
          );
        }
        subject.complete();
      }
    };

    requestAnimationFrame(animate);
    return subject.asObservable();
  }

  /**
   * Reset pan and zoom to default with smooth animation
   */
  resetTransform(
    dimensions: VisualizationDimensions
  ): Observable<VisualizationTransform> {
    const subject = new Subject<VisualizationTransform>();

    const targetTransform: VisualizationTransform = {
      panX: 0,
      panY: 0,
      zoomLevel: 1,
      rotationAngle: this.transform.rotationAngle, // Preserve rotation
    };

    const duration = 2000;
    const startTransform = { ...this.transform };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out cubic easing
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.transform.panX =
        startTransform.panX +
        (targetTransform.panX - startTransform.panX) * easedProgress;
      this.transform.panY =
        startTransform.panY +
        (targetTransform.panY - startTransform.panY) * easedProgress;
      this.transform.zoomLevel =
        startTransform.zoomLevel +
        (targetTransform.zoomLevel - startTransform.zoomLevel) * easedProgress;

      subject.next({ ...this.transform });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Update D3 zoom transform state after animation completes
        if (this.svgElement && this.zoomBehavior) {
          const transform = d3.zoomIdentity
            .translate(this.transform.panX, this.transform.panY)
            .scale(this.transform.zoomLevel);
          d3.select(this.svgElement).call(
            this.zoomBehavior.transform,
            transform
          );
        }
        subject.complete();
      }
    };

    requestAnimationFrame(animate);
    return subject.asObservable();
  }

  /**
   * Handle rotation via Alt+drag
   */
  handleRotationDrag(
    event: MouseEvent,
    currentRotation: number,
    dimensions: VisualizationDimensions
  ): Observable<number> {
    const subject = new Subject<number>();

    if (!this.rotationDragActive) {
      // Start rotation drag
      this.rotationDragActive = true;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      this.rotationStartAngle =
        Math.atan2(event.clientY - centerY, event.clientX - centerX) *
          (180 / Math.PI) -
        currentRotation;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const angle =
          Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
          (180 / Math.PI);
        const newRotation = angle - this.rotationStartAngle;

        this.transform.rotationAngle = newRotation;
        subject.next(newRotation);
      };

      const handleMouseUp = () => {
        this.rotationDragActive = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        subject.complete();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return subject.asObservable();
  }

  /**
   * Programmatically set transform values
   */
  setTransform(transform: Partial<VisualizationTransform>): void {
    this.transform = { ...this.transform, ...transform };

    // Update D3 zoom behavior if available
    if (this.svgElement && this.zoomBehavior) {
      const d3Transform = d3.zoomIdentity
        .translate(this.transform.panX, this.transform.panY)
        .scale(this.transform.zoomLevel);
      d3.select(this.svgElement).call(this.zoomBehavior.transform, d3Transform);
    }
  }

  /**
   * Get current transform state
   */
  getTransform(): VisualizationTransform {
    return { ...this.transform };
  }

  /**
   * Update pan from slider or programmatic source
   */
  updatePan(axis: 'x' | 'y', value: number): void {
    if (axis === 'x') {
      this.transform.panX = value;
    } else {
      this.transform.panY = value;
    }

    // Update D3 zoom transform state to sync
    if (this.svgElement && this.zoomBehavior) {
      const transform = d3.zoomIdentity
        .translate(this.transform.panX, this.transform.panY)
        .scale(this.transform.zoomLevel);
      d3.select(this.svgElement).call(this.zoomBehavior.transform, transform);
    }
  }

  /**
   * Update zoom from slider or programmatic source
   */
  updateZoom(zoomLevel: number): void {
    this.transform.zoomLevel = zoomLevel;

    // Update D3 zoom transform state to sync
    if (this.svgElement && this.zoomBehavior) {
      const transform = d3.zoomIdentity
        .translate(this.transform.panX, this.transform.panY)
        .scale(this.transform.zoomLevel);
      d3.select(this.svgElement).call(this.zoomBehavior.transform, transform);
    }
  }

  /**
   * Update rotation angle
   */
  updateRotation(angle: number): void {
    this.transform.rotationAngle = angle;
  }

  /**
   * Center the view by resetting pan to (0, 0) while preserving zoom and rotation
   */
  centerView(): void {
    this.transform.panX = 0;
    this.transform.panY = 0;

    // Update D3 zoom transform state to sync
    if (this.svgElement && this.zoomBehavior) {
      const transform = d3.zoomIdentity
        .translate(this.transform.panX, this.transform.panY)
        .scale(this.transform.zoomLevel);
      d3.select(this.svgElement).call(this.zoomBehavior.transform, transform);
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.rotationDragActive = false;
    this.zoomBehavior = null;
    this.svgElement = null;
  }
}
