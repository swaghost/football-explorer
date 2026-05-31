import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { cluster, hierarchy, tree } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { linkHorizontal, linkRadial, linkVertical } from 'd3-shape';
import { transition } from 'd3-transition';
import { easeCubicInOut } from 'd3-ease';

@Component({
  selector: 'app-transitions-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './d3-example-transitions.html',
  styleUrl: './d3-example-transitions.scss',
})
export class D3ExampleTransitions implements OnInit, AfterViewInit {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  public value = 'treevertical'; // default selection
  width = 1024;
  height = 1024;
  radius = this.width / 2;
  margin = { top: 40, right: 40, bottom: 40, left: 40 };

  diameter = Math.min(this.width, this.height);

  duration = 2000; // 2 SECOND

  center = [this.width / 2, this.height / 2];

  root: any;
  nodes: any;
  links: any;
  layout: any;
  treeHorizontalTreeLayoutFunc: any; // COMPLETE
  treeVerticalTreeLayoutFunc: any; // COMPLETE
  horizontalClusterLayoutFunc: any;
  diagonalHorizontalLayoutFunc: any;
  diagonalVerticalLayoutFunc: any;
  radialClusterLayoutFunc: any;
  radialLinkLayoutFunc: any;
  activeFunc: any;
  theTransition: any;
  nodeListSelection: any;
  linkListSelection: any;

  cluster: any;
  diagonalHorizontal: any;
  diagonalVertical: any;
  radialTree: any;
  radialCluster: any;
  radialDiagonal: any;

  data = {
    name: 'Root',
    children: [
      { name: 'Child 1', children: [] },
      {
        name: 'Child 2',
        children: [{ name: 'Grandchild #1' }, { name: 'Grandchild #2' }],
      },
      {
        name: 'Child 3',
        children: [
          {
            name: 'Grandchild #3',
            children: [
              { name: 'Great-Grandchild #1' },
              { name: 'Great-Grandchild #2' },
            ],
          },
        ],
      },
    ],
  };

  constructor() {}
  ngAfterViewInit(): void {
    this.buildTheRootData();
    this.buildSVGBase();
    this.buildTheTransition();
    this.initTreeFuncs();
    this.adjust();
  }
  ngOnInit() {
    this.buildHorizontalTreeLayoutFunc();
    this.buildVerticalTreeLayoutFunc();
    this.buildHorizontalClusterFunc();
    this.buildDiagonalHorizontalLayoutFunc();
    this.buildDiagonalVerticalLayoutFunc();
    this.buildRadialClusterLayoutFunc();
    this.buildRadialLinkLayoutFunc();
    //this.buildTreeFunc();
    //this.initTreeFuncs();
  }

  initTreeFuncs() {
    // this.tree = d3.layout.tree().size([height, width - 160]);

    // this.cluster = d3.layout.cluster().size([height, width - 160]);
    this.cluster = cluster().size([this.height, this.width - 160]);

    // this.diagonal = d3.svg.diagonal().projection(function (d) {
    //   return [d.y, d.x];
    // });

    this.diagonalHorizontal = linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    // this.diagonalVertical = d3.svg.diagonal().projection(function (d) {
    //   return [d.x, d.y];
    // });

    this.diagonalVertical = linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    // this.radialTree = d3.layout
    //   .tree()
    //   .size([360, this.diameter / 2])
    //   .separation(function (a, b) {
    //     return (a.parent == b.parent ? 1 : 2) / a.depth;
    //   });

    this.radialTree = tree()
      .size([2 * Math.PI, this.diameter / 2])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // var radialCluster = d3.layout
    //   .cluster()
    //   .size([360, diameter / 2])
    //   .separation(function (a, b) {
    //     return (a.parent == b.parent ? 1 : 2) / a.depth;
    //   });
    this.radialCluster = cluster()
      .size([2 * Math.PI, this.diameter / 2])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // var radialDiagonal = d3.svg.diagonal.radial().projection(function (d) {
    //   return [d.y, (d.x / 180) * Math.PI];
    // });

    // this.radialDiagonal = linkRadial()
    //   .angle((d) => (d[0] / 180) * Math.PI)
    //   .radius((d) => d[1]);

    this.radialDiagonal = (d: any) => {
      return linkRadial()
        .angle((d: any) => d.x)
        .radius((d: any) => d.y);
    };
  }

  buildTheRootData() {
    this.root = hierarchy(this.data);
  }
  buildSVGBase() {
    const svg = select(this.svgRef.nativeElement);
    const g = svg.append('g');
  }
  buildTheTransition() {
    this.theTransition = transition('fade-in')
      .duration(1000)
      .ease(easeCubicInOut);
  }
  buildHorizontalTreeLayoutFunc() {
    this.treeHorizontalTreeLayoutFunc = tree().size([
      this.height - this.margin.top - this.margin.bottom,
      this.width - this.margin.left - this.margin.right,
    ]); // width is depth!
    //this.treeLayoutFunc(this.root);
  }

  buildVerticalTreeLayoutFunc() {
    this.treeVerticalTreeLayoutFunc = tree().size([
      this.width - this.margin.left - this.margin.right,
      this.height - this.margin.top - this.margin.bottom,
    ]); // width is depth!
    //this.treeLayoutFunc(this.root);
  }

  buildHorizontalClusterFunc() {
    this.horizontalClusterLayoutFunc = cluster().size([
      this.height,
      this.width - 160,
    ]);
    //this.treeLayoutFunc(this.root);
  }

  buildDiagonalHorizontalLayoutFunc() {
    this.diagonalHorizontalLayoutFunc = linkHorizontal()
      .x((d) => d[0])
      .y((d) => d[1]);
  }

  buildDiagonalVerticalLayoutFunc() {
    this.diagonalVerticalLayoutFunc = linkVertical()
      .x((d) => d[0])
      .y((d) => d[1]);
  }

  buildRadialClusterLayoutFunc() {
    this.radialClusterLayoutFunc = cluster()
      .size([2 * Math.PI, this.diameter / 2]) // angle in radians, radius
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
  }

  buildRadialLinkLayoutFunc() {
    this.radialLinkLayoutFunc = (d: any) => {
      return linkRadial()
        .angle((d: any) => {
          return d.x;
        })
        .radius((d: any) => {
          return d.y;
        });
    };
  }

  // buildHorizontalTreeData() {
  //   this.activeFunc = this.treeHorizontalTreeLayoutFunc;
  //   this.layout = this.activeFunc(this.root);
  //   this.nodes = this.root.descendants();
  //   this.links = this.root.links();
  // }

  // buildVerticalTreeData() {
  //   this.activeFunc = this.treeVerticalTreeLayoutFunc;
  //   this.layout = this.activeFunc(this.root);
  //   this.nodes = this.root.descendants();
  //   this.links = this.root.links();
  // }

  // buildTreeStandardHorizontalVisual(
  //   rootElement: any,
  //   nodeElements: any,
  //   linkElements: any,
  //   isInDelay = false
  // ) {
  //   const svg = select(this.svgRef.nativeElement);

  //   const g = svg.select('g');
  //   g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);

  //   // Links
  //   this.linkListSelection = g
  //     .selectAll('.link')
  //     .data(linkElements)
  //     .enter()
  //     .append('path')
  //     .attr('class', 'link')
  //     .attr('fill', 'none')
  //     .attr('stroke', 'gray')
  //     .attr('stroke-width', 1.5)
  //     .attr('d', (d: any) =>
  //       linkHorizontal()
  //         .x((n: any) => n.y)
  //         .y((n: any) => n.x)(d)
  //     );

  //   // Nodes
  //   this.nodeListSelection = g
  //     .selectAll('.node')
  //     .data(nodeElements)
  //     .enter()
  //     .append('g')
  //     .attr('class', 'node')
  //     .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

  //   this.nodeListSelection.append('circle').attr('r', 5).attr('fill', 'red');

  //   this.nodeListSelection
  //     .append('text')
  //     .attr('dy', '0.35em')
  //     .attr('x', (d: any) => 10)
  //     //.style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
  //     .style('text-anchor', (d: any) => 'start')
  //     .text((d: any) => d.data.name);
  // }

  // buildTreeStandardVerticalVisual(
  //   rootElement: any,
  //   nodeElements: any,
  //   linkElements: any,
  //   isInDelay = false
  // ) {
  //   const svg = select(this.svgRef.nativeElement);

  //   const g = svg.select('g');

  //   g.attr('transform', `translate(${this.margin.left},${this.margin.top})`);

  //   // Links
  //   this.linkListSelection = g
  //     .selectAll('.link')
  //     .data(linkElements)
  //     .enter()
  //     .append('path')
  //     .attr('class', 'link')
  //     .attr('fill', 'none')
  //     .attr('stroke', 'gray')
  //     .attr('stroke-width', 1.5)
  //     .attr('d', (d: any) =>
  //       linkVertical()
  //         .x((n: any) => n.x)
  //         .y((n: any) => n.y)(d)
  //     );

  //   // Nodes
  //   this.nodeListSelection = g
  //     .selectAll('.node')
  //     .data(nodeElements)
  //     .enter()
  //     .append('g')
  //     .attr('class', 'node')
  //     .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

  //   this.nodeListSelection
  //     .append('circle')
  //     .attr('r', 5)
  //     .attr('fill', '#69b3a2');

  //   this.nodeListSelection
  //     .append('text')
  //     .attr('dy', '0.35em')
  //     //.attr('y', (d: any) => (d.children ? -10 : 10))
  //     .attr('y', (d: any) => 20)
  //     //.style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
  //     .style('text-anchor', (d: any) => 'middle')
  //     .text((d: any) => d.data.name);
  // }

  change(event: any) {
    this.value = event.target.value;
    this.adjust();
  }
  adjust() {
    if (this.value === 'radialtree') {
      this.transitionToRadialTree();
    } else if (this.value === 'radialtreetidy') {
      this.transitionToRadialTidyTree();
      console.log(this.value + ' - Not implemented yet');
    } else if (this.value === 'radialtreevertical') {
      //this.transitionToRadialTreeVertical();
      console.log(this.value + ' - Not implemented yet');
    } else if (this.value === 'radialcluster') {
      this.transitionToRadialCluster();
    } else if (this.value === 'treehorizontal') {
      this.transitionToTreeHorizontal();
    } else if (this.value === 'treevertical') {
      this.transitionToTreeVertical();
    } else if (this.value === 'clusterhorizontal') {
      this.transitionToHorizontalCluster();
    } else if (this.value === 'clustervertical') {
      this.transitionToClusterVertical();
    }
  }

  // WORKING.
  transitionToRadialTree() {
    const myRadialTree = tree()
      .size([360, this.diameter / 2 - this.diameter * 0.05])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const myRadialDiagonal = linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);

    //this.activeFunc = this.radialLinkLayoutFunc;
    this.activeFunc = myRadialTree;
    this.layout = this.activeFunc(this.root); // recalculate layout
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(2000).ease(easeCubicInOut);

    const svg = select(this.svgRef.nativeElement);

    const g = svg.select('g');

    g.transition(t).attr(
      'transform',
      'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
    );
    // svg
    //   .transition()
    //   .duration(this.duration)
    //   .attr(
    //     'transform',
    //     'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
    //   );
    // set appropriate translation (origin in middle of svg)

    this.linkListSelection = g
      .selectAll('.link')
      .data(this.links, (d: any) => d.target.data.name)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) => myRadialDiagonal(d)),

        (update) =>
          update
            .transition(t)
            .duration(this.duration)
            .style('stroke', '#fc8d62')
            .attr('d', (d: any) => myRadialDiagonal(d)),

        (exit) => exit.remove().transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .duration(this.duration)
      .style('opacity', 1);

    g.selectAll('.node')
      .data(this.nodes, (d: any) => d.data.name)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            )
            .style('opacity', 0)
            .call((g) => {
              g.append('circle').attr('r', 4).attr('fill', '#66c2a5');

              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', (d: any) => (d.x < 180 ? 6 : -6))
                .attr('text-anchor', (d: any) => (d.x < 180 ? 'start' : 'end'))
                .attr('transform', (d: any) =>
                  d.x >= 180 ? 'rotate(180)' : null
                )
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),

        (update) =>
          update
            .transition(t)
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);
  }

  transitionToRadialTidyTree() {
    const radialTreeLayout = tree()
      .size([360, this.diameter / 2 - this.diameter * 0.05])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const radialLinkPath = linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);

    // Compute layout
    this.activeFunc = radialTreeLayout;
    this.layout = this.activeFunc(this.root);
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(this.duration).ease(easeCubicInOut);
    const svg = select(this.svgRef.nativeElement);
    const g = svg.select('g');

    // Center the radial tree
    g.transition(t).attr(
      'transform',
      `translate(${this.width / 2},${this.height / 2})`
    );

    // Render links
    this.linkListSelection = g
      .selectAll<SVGPathElement, any>('.link')
      .data(this.links, (d: any) => d.target.data.name)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) => radialLinkPath(d)),

        (update) =>
          update
            .transition(t)
            .style('stroke', '#fc8d62')
            .attr('d', (d: any) => radialLinkPath(d)),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // Optional: render nodes as circles
    g.selectAll<SVGCircleElement, any>('.node')
      .data(this.nodes, (d: any) => d.data.name)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('class', 'node')
            .attr('r', 4)
            .attr('fill', '#66c2a5')
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            )
            .style('opacity', 0),

        (update) =>
          update
            .transition(t)
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);
  }

  // WORKING.
  transitionToRadialCluster() {
    const myRadialCluster = cluster()
      .size([360, this.diameter / 2 - this.diameter * 0.05])
      .separation(function (a, b) {
        return (a.parent == b.parent ? 1 : 2) / a.depth;
      });

    const myRadialDiagonal = linkRadial()
      .angle((d: any) => (d.x / 180) * Math.PI)
      .radius((d: any) => d.y);

    this.activeFunc = myRadialCluster;
    this.layout = this.activeFunc(this.root);
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(2000).ease(easeCubicInOut);

    const svg = select(this.svgRef.nativeElement);

    const g = svg.select('g');

    g.transition(t).attr(
      'transform',
      'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
    );

    this.linkListSelection = g
      .selectAll('.link')
      .data(this.links, (d: any) => d.target.data.name)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .attr('d', (d: any) => myRadialDiagonal(d)),
        (update) =>
          update
            .transition(t)
            .style('stroke', '#66c2a5')
            .attr('d', (d: any) => myRadialDiagonal(d)),

        (exit) => exit.remove().transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    g.selectAll<SVGCircleElement, any>('.node')
      .data(this.nodes, (d: any) => d.data.name)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('class', 'node')
            .attr('r', 4)
            .attr('fill', '#66c2a5')
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            )
            .style('opacity', 0),

        (update) =>
          update
            .transition(t)
            .attr(
              'transform',
              (d: any) => `rotate(${d.x - 90}) translate(${d.y},0)`
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);
  }

  // WORKING.
  transitionToTreeHorizontal() {
    this.activeFunc = this.treeHorizontalTreeLayoutFunc;
    this.layout = this.activeFunc(this.root);
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(2000);

    const svg = select(this.svgRef.nativeElement);

    const g = svg.select('g');

    // svg
    //   .transition()
    //   .duration(this.duration)
    //   .attr('transform', 'translate(40,0)');

    g.transition(t).attr('transform', `translate(40,0)`);

    this.linkListSelection = g
      .selectAll<SVGPathElement, any>('.link')
      .data(this.links, (d) => d.target.data.id || d.target.data.name) // optional key function
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .transition(t)
            .style('opacity', 1)
            .attr('d', (d: any) =>
              linkHorizontal()
                .x((n: any) => n.y)
                .y((n: any) => n.x)(d)
            ),

        (update) =>
          update
            .transition(t)
            .attr('stroke', 'gray') // optional update styling
            .attr('d', (d: any) =>
              linkHorizontal()
                .x((n: any) => n.y)
                .y((n: any) => n.x)(d)
            ),

        (exit) => exit.remove().transition(t).style('opacity', 0).remove()
      );

    g.selectAll('.node')
      .data(this.nodes, (d: any) => d.data.id || d.data.name)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
            .style('opacity', 0)
            .call((g) => {
              g.append('circle').attr('r', 4).attr('fill', '#66c2a5');

              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', (d: any) => (d.children ? -8 : 8))
                .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
                .attr('transform', 'rotate(0)') // force horizontal
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),

        (update) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
            .call(
              (g) =>
                g
                  .select('text')
                  .attr('x', (d: any) => (d.children ? -8 : 8))
                  .attr('text-anchor', (d: any) =>
                    d.children ? 'end' : 'start'
                  )
                  .attr('transform', 'rotate(0)') // keep horizontal
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // this.linkListSelection
    //   .data(this.links)
    //   .transition()
    //   .duration(this.duration)
    //   .style('stroke', '#e78ac3')
    //   .attr('d', this.treeHorizontalTreeLayoutFunc); // get the new tree path
  }

  // WORKING.
  transitionToTreeVertical() {
    this.activeFunc = this.treeVerticalTreeLayoutFunc;
    this.layout = this.activeFunc(this.root);
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(2000);

    const svg = select(this.svgRef.nativeElement);

    const g = svg.select('g');

    g.transition(t).attr('transform', `translate(0,40)`);

    // svg
    //   .transition()
    //   .duration(this.duration)
    //   .attr('transform', 'translate(40,0)');

    this.linkListSelection = g
      .selectAll<SVGPathElement, any>('.link')
      .data(this.links, (d) => d.target.data.id || d.target.data.name) // optional key function
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('stroke-width', 1.5)
            .style('opacity', 0)
            .transition(t)
            .style('opacity', 1)
            .attr('d', (d: any) =>
              linkVertical()
                .x((n: any) => n.x)
                .y((n: any) => n.y)(d)
            ),

        (update) =>
          update
            .transition(t)
            .attr('stroke', 'gray') // optional update styling
            .attr('d', (d: any) =>
              linkVertical()
                .x((n: any) => n.x)
                .y((n: any) => n.y)(d)
            ),

        (exit) => exit.remove().transition(t).style('opacity', 0).remove()
      );

    g.selectAll('.node')
      .data(this.nodes, (d: any) => d.data.id || d.data.name)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
            .style('opacity', 0)
            .call((g) => {
              g.append('circle').attr('r', 4).attr('fill', '#66c2a5');

              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', 0)
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(90)') // force vertical orientation
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),

        (update) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
            .call(
              (g) =>
                g
                  .select('text')
                  .attr('x', 0)
                  .attr('text-anchor', 'middle')
                  .attr('transform', 'rotate(90)') // keep vertical during update
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    // this.linkListSelection
    //   .data(this.links)
    //   .transition()
    //   .duration(this.duration)
    //   .style('stroke', 'green')
    //   .attr('d', this.diagonalVerticalLayoutFunc); // get the new tree path
  }

  transitionToHorizontalCluster() {
    const myDiagonal = linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    this.activeFunc = this.horizontalClusterLayoutFunc;
    this.layout = this.activeFunc(this.root);
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(2000);

    const svg = select(this.svgRef.nativeElement);

    const g = svg.select('g');

    g.transition(t).attr('transform', `translate(0,40)`);

    this.linkListSelection = g
      .selectAll<SVGPathElement, any>('.link')
      .data(this.links, (d: any) => d.target?.data?.id || d.target?.data?.name) // optional key function
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .attr('d', (d: any) => myDiagonal(d))
            .style('opacity', 0),

        (update) =>
          update
            .transition(t)
            .style('stroke', '#8da0cb')
            .attr('d', (d: any) => myDiagonal(d)),

        (exit) => exit.remove().transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    g.selectAll('.node')
      .data(this.nodes, (d: any) => d.data.id || d.data.name)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
            .style('opacity', 0)
            .call((g) => {
              g.append('circle').attr('r', 4).attr('fill', '#fc8d62');

              g.append('text')
                .attr('dy', '0.31em')
                .attr('x', (d: any) => (d.children ? -8 : 8))
                .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
                .attr('transform', 'rotate(0)') // force horizontal
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),

        (update) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
            .call(
              (g) =>
                g
                  .select('text')
                  .attr('x', (d: any) => (d.children ? -8 : 8))
                  .attr('text-anchor', (d: any) =>
                    d.children ? 'end' : 'start'
                  )
                  .attr('transform', 'rotate(0)') // keep horizontal
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);
  }

  transitionToClusterVertical() {
    const myDiagonal = linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    this.activeFunc = this.horizontalClusterLayoutFunc;
    this.layout = this.activeFunc(this.root);
    this.nodes = this.root.descendants();
    this.links = this.root.links();

    const t = transition().duration(2000);

    const svg = select(this.svgRef.nativeElement);

    const g = svg.select('g');

    g.transition(t).attr('transform', `translate(0,40)`);

    this.linkListSelection = g
      .selectAll<SVGPathElement, any>('.link')
      .data(this.links, (d: any) => d.target?.data?.id || d.target?.data?.name) // optional key function
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .attr('d', (d: any) => myDiagonal(d))
            .style('opacity', 0),

        (update) =>
          update
            .transition(t)
            .style('stroke', '#8da0cb')
            .attr('d', (d: any) => myDiagonal(d)),

        (exit) => exit.remove().transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);

    g.selectAll('.node')
      .data(this.nodes, (d: any) => d.data.id || d.data.name)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
            .style('opacity', 0)
            .call((g) => {
              g.append('circle').attr('r', 4).attr('fill', '#fc8d62');

              g.append('text')
                .attr('dy', '0.31em')
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(90)')
                .text((d: any) => d.data.name)
                .style('font', '12px sans-serif');
            }),

        (update) =>
          update
            .transition(t)
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
            .call(
              (g) => g.select('text').attr('transform', 'rotate(90)') // always upright
            ),

        (exit) => exit.transition(t).style('opacity', 0).remove()
      )
      .transition(t)
      .style('opacity', 1);
  }
}
