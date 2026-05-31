import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import p5 from 'p5';
import {
  createRadialTreeSketch,
  generateMockRadialTree,
} from '../../../functions/createRadialTreeSketch.function';
import { TreeNode } from '../../../models/tree-node.model';

@Component({
  selector: 'app-p5-example-popups',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './p5-example-popups.html',
  styleUrl: './p5-example-popups.scss',
})
export class P5ExamplePopups implements AfterViewInit {
  showClickPopup = true;
  private _showRadianLines = false;
  private _showDegreeLines = true;
  rotationLerpSpeed = 0.02; // Default speed, lower = slower. Change as needed.

  @ViewChild('sketchContainer', { static: true }) sketchContainer!: ElementRef;
  hoveredNode: TreeNode | null = null;
  clickedNode: TreeNode | null = null;
  hoverPopupPos = { x: 0, y: 0 };
  rotationRadians = 0; // current rotation angle in radians
  targetRotationRadians = 0; // target rotation for smooth animation
  zoom = 1; // current zoom level
  maxRadius = 0;
  sketchCenterX = 0;
  sketchCenterY = 0;
  sketchDiameter = 0;

  constructor() {
    // Ensure initial rotation is set and sketch is drawn in sync
    this.rotationRadians = this.getRotationRadians();
    this.targetRotationRadians = this.getRotationRadians();
  }

  get showRadianLines() {
    return this._showRadianLines;
  }
  set showRadianLines(val: boolean) {
    this._showRadianLines = val;
    this.redrawSketch();
  }

  get showDegreeLines() {
    return this._showDegreeLines;
  }
  set showDegreeLines(val: boolean) {
    this._showDegreeLines = val;
    this.redrawSketch();
  }

  private _rotationDeg = 4;
  get rotationDeg() {
    return this._rotationDeg;
  }
  set rotationDeg(val: number) {
    this._rotationDeg = val;
    const newRotation = (val * Math.PI) / 180;
    this.rotationRadians = newRotation;
    this.targetRotationRadians = newRotation;
    this.redrawSketch();
  }

  getRotationRadians = () => {
    // Always return rotation in radians
    return (this._rotationDeg * Math.PI) / 180;
  };

  onHover = (node: TreeNode | null) => {
    this.hoveredNode = node;
    if (node) {
      // Compute screen position for popup relative to sketch
      const labelOffset = 20;
      const angle = node.angle;
      const radius = node.radius + labelOffset;
      // Convert polar to cartesian
      const x0 = radius * Math.cos(angle);
      const y0 = radius * Math.sin(angle);
      // Rotate by current rotation (always radians)
      const rotation = this.getRotationRadians();
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const x1 = x0 * cosR - y0 * sinR;
      const y1 = x0 * sinR + y0 * cosR;
      // Apply zoom
      const zoom = this.zoom;
      const x2 = x1 * zoom;
      const y2 = y1 * zoom;
      // Offset by sketch center
      this.hoverPopupPos = {
        x: x2 + this.sketchCenterX,
        y: y2 + this.sketchCenterY,
      };
    }
  };

  onClick = (node: TreeNode) => {
    this.clickedNode = node;
    // Current rotation (always radians)
    const current = this.getRotationRadians();
    // Helper to normalize angle to [-PI, PI]
    const normalize = (a: number) => ((a + Math.PI) % (2 * Math.PI)) - Math.PI;
    // Compute global angle for the clicked node
    const globalAngle = normalize(node.angle + current);
    console.log('Clicked node:', node.label);
    console.log(
      'Current rotation (rad):',
      current,
      'deg:',
      (current * 180) / Math.PI
    );
    console.log(
      'Node angle (rad):',
      node.angle,
      'deg:',
      (node.angle * 180) / Math.PI
    );
    console.log(
      'Global angle (rad):',
      globalAngle,
      'deg:',
      (globalAngle * 180) / Math.PI
    );

    // Compute the delta needed to bring label to 0 (level)
    let delta = -globalAngle;
    console.log(
      'Initial delta to level (rad):',
      delta,
      'deg:',
      (delta * 180) / Math.PI
    );

    // If label would be upside down, rotate an extra PI
    const upright = (angle: number) =>
      angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
    if (upright(normalize(node.angle + current + delta))) {
      delta += Math.PI;
      console.log(
        'Label would be upside down, adding PI. New delta (rad):',
        delta,
        'deg:',
        (delta * 180) / Math.PI
      );
    }

    // Normalize delta to shortest path
    delta = normalize(delta);
    console.log(
      'Normalized delta (rad):',
      delta,
      'deg:',
      (delta * 180) / Math.PI
    );

    // Set targetRotation
    this.targetRotationRadians = normalize(current + delta);
    this._rotationDeg = (this.targetRotationRadians * 180) / Math.PI;
    console.log(
      'Set targetRotation (rad):',
      this.targetRotationRadians,
      'deg:',
      this._rotationDeg
    );
  };

  private p5Instance: any;

  ngAfterViewInit() {
    // Dynamically calculate sketch center and max radius
    const rect = this.sketchContainer.nativeElement.getBoundingClientRect();
    this.sketchCenterX = rect.left + rect.width / 2;
    this.sketchCenterY = rect.top + rect.height / 2;

    // Calculate max radius from tree data
    // Use the same tree generator as your sketch
    const tree =
      typeof generateMockRadialTree !== 'undefined'
        ? generateMockRadialTree()
        : null;
    this.maxRadius = tree
      ? getMaxRadius(tree)
      : Math.min(rect.width, rect.height) / 2;

    // Pass a rotation getter that animates rotation toward targetRotation
    this.p5Instance = new p5(
      createRadialTreeSketch(
        (node: any) => this.onHover(node),
        (node: any) => this.onClick(node),
        this.getRotationRadians,
        () => this.zoom,
        getMaxRadius,
        {
          showRadianLines: this.showRadianLines,
          showDegreeLines: this.showDegreeLines,
        }
      ),
      this.sketchContainer.nativeElement
    );
  }

  redrawSketch() {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
    // Recreate the sketch with updated options
    this.p5Instance = new p5(
      createRadialTreeSketch(
        (node: any) => this.onHover(node),
        (node: any) => this.onClick(node),
        this.getRotationRadians,
        () => this.zoom,
        getMaxRadius,
        {
          showRadianLines: this.showRadianLines,
          showDegreeLines: this.showDegreeLines,
        }
      ),
      this.sketchContainer.nativeElement
    );
  }
}

// Helper to get max radius from tree
function getMaxRadius(node: any): number {
  let maxR = node.radius || 0;
  if (node.children && node.children.length) {
    for (const child of node.children) {
      maxR = Math.max(maxR, getMaxRadius(child));
    }
  }
  return maxR;
}
