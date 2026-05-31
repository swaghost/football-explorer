import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import p5 from 'p5';

@Component({
  selector: 'app-p5-example-tree-radial',
  imports: [],
  templateUrl: './p5-example-tree-radial-drag-spin.html',
  styleUrl: './p5-example-tree-radial-drag-spin.scss',
})
export class P5ExampleTreeRadialDragSpin implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  private sketch!: p5;
  private rotation = 0;
  private targetRotation = 0;
  private dragging = false;
  private lastX = 0;

  ngAfterViewInit(): void {
    const sketchFn = (p: p5) => {
      const centerX = 300;
      const centerY = 300;
      const radius = 200;
      const levels = 3;
      const childrenPerNode = 6;

      interface NodeData {
        angle: number;
        level: number;
        label: string;
        x: number;
        y: number;
      }

      const nodes: NodeData[] = [];

      p.setup = () => {
        p.createCanvas(600, 600).parent(this.canvasContainer.nativeElement);
        p.angleMode(p.RADIANS);
        p.textAlign(p.CENTER, p.CENTER);

        for (let level = 1; level <= levels; level++) {
          for (let i = 0; i < childrenPerNode; i++) {
            const angle = (p.TWO_PI / childrenPerNode) * i;
            nodes.push({ angle, level, label: `L${level}-${i}`, x: 0, y: 0 });
          }
        }
      };

      p.draw = () => {
        p.background(255);

        // Animate rotation toward target
        const delta = this.targetRotation - this.rotation;
        if (Math.abs(delta) > 0.001) {
          this.rotation += delta * 0.1;
        }

        p.translate(centerX, centerY);
        p.rotate(this.rotation);

        for (const node of nodes) {
          const r = (radius / levels) * node.level;
          const x = r * p.cos(node.angle);
          const y = r * p.sin(node.angle);
          node.x = x;
          node.y = y;

          // Connector
          const controlX = x / 2 + 30 * p.cos(node.angle + p.PI / 2);
          const controlY = y / 2 + 30 * p.sin(node.angle + p.PI / 2);
          p.stroke(150);
          p.noFill();
          p.bezier(0, 0, controlX, controlY, controlX, controlY, x, y);

          // Node
          p.fill('dodgerblue');
          p.noStroke();
          p.ellipse(x, y, 20, 20);

          // Label extending outward
          const labelOffset = 30;
          const lx = x + labelOffset * p.cos(node.angle);
          const ly = y + labelOffset * p.sin(node.angle);
          p.push();
          p.translate(lx, ly);
          p.rotate(node.angle);
          p.fill(0);
          p.textSize(12);
          p.text(node.label, 0, 0);
          p.pop();
        }
      };

      p.mousePressed = () => {
        this.dragging = true;
        this.lastX = p.mouseX;

        const mx = p.mouseX - centerX;
        const my = p.mouseY - centerY;

        for (const node of nodes) {
          const dx = mx - node.x;
          const dy = my - node.y;
          if (p.dist(mx, my, node.x, node.y) < 15) {
            const desiredRotation = -node.angle;
            const currentRotation = this.rotation % p.TWO_PI;
            const shortest =
              ((desiredRotation - currentRotation + p.PI) % p.TWO_PI) - p.PI;
            this.targetRotation = this.rotation + shortest;
            this.dragging = false; // cancel drag if node clicked
            break;
          }
        }
      };

      p.mouseReleased = () => {
        this.dragging = false;
      };

      p.mouseDragged = () => {
        if (this.dragging) {
          const dx = p.mouseX - this.lastX;
          this.rotation += dx * 0.01;
          this.targetRotation = this.rotation; // cancel auto-rotation
          this.lastX = p.mouseX;
        }
      };
    };

    this.sketch = new p5(sketchFn);
  }

  ngOnDestroy(): void {
    this.sketch?.remove();
  }
}
