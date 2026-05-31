import { Routes } from '@angular/router';
// Only import main UI components that need to be immediately available
import { VisualizationTester } from './components/main/visualization-tester/visualization-tester';
import { D3ExampleRadialRemake } from './components/examples/d3-example-radial-remake/d3-example-radial-remake';
import { KaizenBoardComponent } from './components/main/kaizen-board-component/kaizen-board-component';
import { RecycleBinComponent } from './components/main/recycle-bin/recycle-bin.component';

export const routes: Routes = [
  {
    path: 'viz',
    component: VisualizationTester,
  },
  {
    path: 'example/d3/radial-remake',
    component: D3ExampleRadialRemake,
  },
  {
    path: 'todo/board',
    component: KaizenBoardComponent,
  },
  {
    path: 'todo/recycle-bin',
    component: RecycleBinComponent,
  },
  // Example components - lazy loaded to reduce initial bundle size
  {
    path: 'test1',
    loadComponent: () =>
      import('./components/examples/p5-v2-test/p5-sketch.component').then(
        (m) => m.P5SketchComponent
      ),
  },
  {
    path: 'example/p5/tree/radial/popups',
    loadComponent: () =>
      import('./components/examples/p5-example-popups/p5-example-popups').then(
        (m) => m.P5ExamplePopups
      ),
  },
  {
    path: 'example/p5/tree/radial',
    loadComponent: () =>
      import(
        './components/examples/p5-example-tree-radial-drag-spin/p5-example-tree-radial-drag-spin'
      ).then((m) => m.P5ExampleTreeRadialDragSpin),
  },
  {
    path: 'example/d3p5/rt-tree',
    loadComponent: () =>
      import('./components/examples/radial-tree/radial-rt-tree.component').then(
        (m) => m.RadialRtTreeComponent
      ),
  },
  {
    path: 'example/d3/drag-rotate',
    loadComponent: () =>
      import(
        './components/examples/d3-example-drag-rotate/d3-example-drag-rotate'
      ).then((m) => m.D3ExampleDragRotate),
  },
  {
    path: 'example/d3/transitions',
    loadComponent: () =>
      import(
        './components/examples/d3-example-transitions/d3-example-transitions'
      ).then((m) => m.D3ExampleTransitions),
  },
  {
    path: 'example/d3/pan-zoom/full',
    loadComponent: () =>
      import(
        './components/examples/d3-pan-zoom-full-window/d3-example-pan-zoom-full-window.component'
      ).then((m) => m.D3ExamplePanZoomFullWindowComponent),
  },
  {
    path: 'example/d3/pan-zoom/sketch',
    loadComponent: () =>
      import(
        './components/examples/d3-pzfw-sketch-nodes/d3-example-pzfw-sketch-nodes.component'
      ).then((m) => m.D3ExamplePZFWSketchNodesComponent),
  },
  {
    path: 'example/d3/pan-zoom',
    loadComponent: () =>
      import(
        './components/examples/d3-pan-zoom/d3-example-pan-zoom.component'
      ).then((m) => m.D3ExamplePanZoomComponent),
  },
  {
    path: 'example/d3/pan-zoom/tree',
    loadComponent: () =>
      import(
        './components/examples/d3-pzfw-sketch-tree/d3-pzfw-sketch-tree.component'
      ).then((m) => m.D3ExamplePZFWSketchTreeComponent),
  },
  {
    path: 'example/d3/garbage/1',
    loadComponent: () =>
      import(
        './components/examples/d3-pzfw-sketch-tree-transition/d3-pzfw-sketch-tree-transition.component'
      ).then((m) => m.D3ExamplePZFWSketchTreeTransitionComponent),
  },
  {
    path: 'example/d3/radar-chart',
    loadComponent: () =>
      import(
        './components/examples/d3-example-radar-chart/d3-example-radar-chart'
      ).then((m) => m.D3ExampleRadarChart),
  },
  {
    path: 'example/d3/collapsible-tree',
    loadComponent: () =>
      import(
        './components/examples/d3-example-collapsible-tree/d3-example-collapsible-tree'
      ).then((m) => m.D3ExampleCollapsibleTree),
  },

  {
    path: 'example/d3/pan-to-point',
    loadComponent: () =>
      import(
        './components/examples/d3-example-pan-to-point/d3-example-pan-to-point'
      ).then((m) => m.D3ExamplePanToPoint),
  },
  {
    path: 'example/d3/force-directed',
    loadComponent: () =>
      import(
        './components/examples/d3-example-force-directed-layout/d3-example-force-directed-layout'
      ).then((m) => m.D3ExampleForceDirectedLayout),
  },
  {
    path: 'example/d3/sunburst',
    loadComponent: () =>
      import(
        './components/examples/d3-example-sunburst/d3-example-sunburst'
      ).then((m) => m.D3ExampleSunburst),
  },
  {
    path: 'example/d3/hex-grid',
    loadComponent: () =>
      import(
        './components/examples/d3-example-hex-grid/d3-example-hex-grid'
      ).then((m) => m.D3ExampleHexGrid),
  },
  {
    path: 'example/sliding-drawer',
    loadComponent: () =>
      import(
        './components/examples/sliding-drawer-example/sliding-drawer-example'
      ).then((m) => m.SlidingDrawerExample),
  },
  {
    path: 'example/gsap/field',
    loadComponent: () =>
      import(
        './components/examples/gsap-soccer-field/gsap-soccer-field.component'
      ).then((m) => m.GsapSoccerFieldComponent),
  },
  {
    path: 'example/html-css/vertical-tab-strip',
    loadComponent: () =>
      import(
        './components/examples/html-css-example-vertical-tab-strip/html-css-example-vertical-tab-strip'
      ).then((m) => m.HtmlCssExampleVerticalTabStrip),
  },
];
