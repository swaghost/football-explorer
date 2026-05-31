import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import p5 from 'p5';

@Component({
  selector: 'app-p5-sketch',
  templateUrl: './p5-sketch.component.html',
  styleUrls: ['./p5-sketch.component.scss'],
})
export class P5SketchComponent implements OnInit, OnDestroy {
  @ViewChild('sketchContainer', { static: true }) sketchContainer!: ElementRef;
  private p5Instance!: p5;

  ngOnInit(): void {
    this.createSketch();
  }

  ngOnDestroy(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  }

  private createSketch() {
    const sketch = (s: p5) => {
      let x = 0;
      s.setup = () => {
        s.createCanvas(400, 200);
      };
      s.draw = () => {
        s.background(220);
        s.circle(x, 100, 50);
        x = (x + 2) % s.width;
      };
    };
    this.p5Instance = new p5(sketch, this.sketchContainer.nativeElement);
  }
}
