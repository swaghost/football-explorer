import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as d3Hierarchy from 'd3-hierarchy';
import p5 from 'p5';

@Component({
  selector: 'app-radial-rt-tree',
  templateUrl: './radial-rt-tree.component.html',
  styleUrls: ['./radial-rt-tree.component.scss'],
})
export class RadialRtTreeComponent implements OnInit, OnDestroy {
  @ViewChild('sketchContainer', { static: true }) sketchContainer!: ElementRef;
  private p5Instance!: p5;
  private treeData: any;
  zoom = 1;
  rotation = 0;
  hoveredNode: any = null;
  clickedLabel: any = null;

  ngOnInit(): void {
    this.generateTreeData();
    this.createSketch();
  }

  ngOnDestroy(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  }

  generateTreeData() {
    // Generate randomized hierarchical data
    function makeChildren(
      prefix: string,
      depth: number,
      breadth: number
    ): any[] {
      if (depth === 0) return [];
      return Array.from({ length: breadth }, (_, i) => ({
        name: `${prefix}${i + 1}`,
        value: Math.round(Math.random() * 100),
        children: makeChildren(
          `${prefix}${i + 1}-`,
          depth - 1,
          Math.max(2, Math.floor(Math.random() * breadth))
        ),
      }));
    }
    const data = {
      name: 'root',
      children: makeChildren('N', 4, 8),
    };
    type TreeNode = typeof data;
    const root = d3Hierarchy.hierarchy<TreeNode>(data);
    const treeLayout = d3Hierarchy.tree<TreeNode>().size([2 * Math.PI, 200]);
    this.treeData = treeLayout(root);
  }

  private createSketch() {
    const component = this;
    const sketch = (s: p5) => {
      let canvasW = window.innerWidth;
      let canvasH = window.innerHeight;
      let dragging = false;
      let lastX = 0;
      s.setup = () => {
        s.createCanvas(canvasW, canvasH);
        s.angleMode(s.RADIANS);
        s.noLoop();
        s.textFont('Segoe UI, Arial, sans-serif');
        s.textSize(12);
      };
      s.windowResized = () => {
        canvasW = window.innerWidth;
        canvasH = window.innerHeight;
        s.resizeCanvas(canvasW, canvasH);
        s.redraw();
      };
      s.mouseWheel = (event: any) => {
        component.zoom = Math.max(
          0.2,
          Math.min(5, component.zoom - event.delta * 0.001)
        );
        s.redraw();
      };
      s.mousePressed = () => {
        dragging = true;
        lastX = s.mouseX;
      };
      s.mouseReleased = () => {
        dragging = false;
      };
      s.mouseDragged = () => {
        if (dragging) {
          const dx = s.mouseX - lastX;
          component.rotation += dx * 0.01;
          lastX = s.mouseX;
          s.redraw();
        }
      };
      s.draw = () => {
        s.background(0);
        s.translate(canvasW / 2, canvasH / 2);
        s.scale(component.zoom);
        s.rotate(component.rotation);
        const maxRadius = Math.min(canvasW, canvasH) * 0.45;
        // Draw edges
        component.treeData.links().forEach((link: any) => {
          const a = polarToCartesian(link.source.x, link.source.y, maxRadius);
          const b = polarToCartesian(link.target.x, link.target.y, maxRadius);
          s.stroke(60);
          s.strokeWeight(2);
          s.line(a.x, a.y, b.x, b.y);
        });
        // Draw nodes and labels
        let hovered: any = null;
        component.treeData.descendants().forEach((d: any) => {
          const pos = polarToCartesian(d.x, d.y, maxRadius);
          // Node
          s.noStroke();
          s.fill('red');
          s.circle(pos.x, pos.y, 10);
          // Hover detection
          if (
            s.dist(
              s.mouseX - canvasW / 2,
              s.mouseY - canvasH / 2,
              pos.x,
              pos.y
            ) <
            10 / component.zoom
          ) {
            hovered = d;
          }
          // Label
          s.fill(255);
          s.textAlign(s.LEFT, s.CENTER);
          s.push();
          s.translate(pos.x + Math.cos(d.x) * 16, pos.y + Math.sin(d.x) * 16);
          s.rotate(d.x);
          s.text(d.data.name, 0, 0);
          s.pop();
        });
        // Tooltip
        if (hovered) {
          component.hoveredNode = hovered;
          s.push();
          s.resetMatrix();
          s.fill(30, 30, 30, 220);
          s.stroke(255, 0, 0);
          s.rect(s.mouseX + 10, s.mouseY - 10, 120, 40, 8);
          s.noStroke();
          s.fill(255);
          s.textAlign(s.LEFT, s.TOP);
          s.text(
            `Node: ${hovered.data.name}\nValue: ${hovered.data.value}`,
            s.mouseX + 18,
            s.mouseY
          );
          s.pop();
        } else {
          component.hoveredNode = null;
        }
      };
      // Click detection for labels
      s.mouseClicked = () => {
        const maxRadius = Math.min(canvasW, canvasH) * 0.45;
        let clicked = null;
        component.treeData.descendants().forEach((d: any) => {
          const pos = polarToCartesian(d.x, d.y, maxRadius);
          const labelX = pos.x + Math.cos(d.x) * 16;
          const labelY = pos.y + Math.sin(d.x) * 16;
          if (
            s.dist(
              s.mouseX - canvasW / 2,
              s.mouseY - canvasH / 2,
              labelX,
              labelY
            ) <
            30 / component.zoom
          ) {
            clicked = d;
          }
        });
        if (clicked) {
          component.clickedLabel = clicked;
          s.redraw();
        }
      };
      function polarToCartesian(
        angle: number,
        radius: number,
        maxRadius: number
      ) {
        return {
          x: Math.cos(angle) * (radius / 200) * maxRadius,
          y: Math.sin(angle) * (radius / 200) * maxRadius,
        };
      }
    };
    this.p5Instance = new p5(sketch, this.sketchContainer.nativeElement);
  }
}
