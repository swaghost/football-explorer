
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { DecisionFlowService, HierarchyFlowDetail } from '@soccr.io/api';
import * as d3 from 'd3';
import { D3UtilityService } from '../../services/d3-gv-utility.service';
import { initialize, svg2png } from 'svg2png-wasm';
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-d3-example-tree-rtc-efficiency',
    templateUrl: './d3-example-tree-rtc-efficiency.component.html',
    styleUrl: './d3-example-tree-rtc-efficiency.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class D3ExampleTreeRtcEfficiencyComponent {

    @ViewChild('svgContainer') svgContainer!: ElementRef;

    constructor(private decisions: DecisionFlowService, private d3util: D3UtilityService, private el: ElementRef, private http: HttpClient) { }
  
    async ngOnInit() {
      this.loadData();

      await initialize(fetch('/assets/svg2png-wasm/svg2png_wasm_bg.wasm'));
  
    }
  
    private loadData(){
      this.loadFlow();
      this.loadTestData();
    }

    private loadFlow(){
      this.decisions.getDecisionFlowAsHierarchy(31).subscribe(data => {
        this.flow = data;
        console.log('Raw data:', this.flow); // Log the raw data
  
        this.stratifyEm = d3.stratify()
          .id(function(d: any) { 
            return d.ID; 
          })
          .parentId(function(d: any) { 
            return d.ParentID; 
          });
  
        try {
          // Convert the data into a hierarchy
          this.stratifiedNodes = this.stratifyEm(this.flow.Nodes);
          console.log('Stratified nodes:', this.stratifiedNodes); // Log the stratified nodes
          let result = this.createRadialTree();
              
  
        } catch (error) {
          console.error('Error stratifying data:', error);
        }
      });
    }
    private loadTestData() {
      
  
      this.http.get('/assets/d3/indented-tree/indented-tree-sample-data.json')
        .subscribe(data => {
          this.ChartData = data;
          //d3.select('#graph').append(() => this.createRadialTree());
        });
    }
  
    // private transform([x, y, r]: [number, number, number]): string {
    //   let trans = `
    //     translate(${this._Width / 2}, ${this._Height / 2})
    //     scale(${this._Height / r})
    //     translate(${-x}, ${-y})
    //   `;
    //   console.log("INTERMEDIATE",trans);
    //   return trans;
    // }
  
    private SELECT_TREE = "svgRadialTree";
    private SELECT_OVERARCH = "gOverArch";
    private SELECT_LINKGROUP = "gLinks";
    private SELECT_NODEGROUP = "gNodes";
    private flow: HierarchyFlowDetail;
    private stratifiedNodes: any;
    private stratifyEm: any;
    private _TreeData: any; 
    private _Tree: any;
    private _Root: any;
    private _Data: any;
    private _Zoom: any;
    private ChartData: any;    
    private _Width = 3880;
    private _Height = 3880;
    private _Radius = 3880 / 2;
    private _LastTransition:any;
    
    private _CurrentTransform: [number, number, number] = [this._Width / 2, this._Height / 2, this._Height];
    
    private createRadialTree() {
      // Specify the chart’s dimensions.
      this._Data = this.stratifiedNodes;
      const width = this._Width;
      const height = this._Height;
      const padding = 100; // Add padding to prevent cutting off
      const cx = width * 0.5; // adjust as needed to fit
      const cy = height * 0.5; // adjust as needed to fit
      this._Radius = Math.min(width, height) / 2 - 30;
      const radius = this._Radius;
  
      // Create a radial tree layout. The layoutâ€™s first dimension (x)
      // is the angle, while the second (y) is the radius.
      this._Tree = d3.tree()
        .size([2 * Math.PI, radius])
        // Option 1: Base separation (commented out)
        //.separation((a, b) => (a.parent == b.parent ? 3 : 6) / a.depth);

        // Option 2: More aggressive separation (currently used)
        .separation((a, b) => (a.parent == b.parent ? 8 : 16) / Math.sqrt(a.depth));

        // Option 3: Constant separation (commented out)
        //.separation((a, b) => (a.parent == b.parent ? 3 : 6));
      
      
     
  
      // Creates the SVG container.
      const svg = d3.create("svg")
        .attr("id","svgRadialTree")
        .attr("width", width + padding * 2)
        .attr("height", height + padding * 2)
        .attr("viewBox", [-cx, -cy, width, height])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");
      
        const gOverArch = svg.append("g")
          .attr("id","gOverArch")
          .attr("fill", "none");              

        const gLinks = gOverArch.append("g")
          .attr("id","gLinks");

        const gNodes = gOverArch.append("g")
          .attr("id","gNodes");
        gNodes.raise();

        // const gLabels = gOverArch
        //   .append("g")
        //   .attr("id","gLabels")      
        //   .classed("gLabels",true);          
        //gLabels.raise();
        
        const trans = (animate) => d3.transition()
        .duration(animate ? 400 : 0)
        .ease(d3.easeLinear)
        .on("end", function() {
            const box = gOverArch.node().getBBox();
            svg.transition().duration(1000).attr("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
        });

        d3.select('#graph').append(() => svg.node());    

        this._TreeData = d3.hierarchy(this._Data, d => d.children)
        .sort((a, b) => d3.ascending(a.data.Name, b.data.Name));
                
        this.updateRadialTree(false);
        this.addImage();
        this.buildTooltip();
      // Append a top-most group element to contain all other elements
   
  
      // x and y are scales that project the data space to the ‘unzoomed’ pixel referential           
  
      return svg.node();
    }
  
    private _Transform([x, y, r]: [number, number, number]): string {
      return `
        translate(${this._Width / 2}, ${this._Height / 2})
        scale(${this._Height / r})
        translate(${-x}, ${-y})
      `;
    }

    private toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    }
    private toggleAll(d) {
      if (d.children) {
        d.children.forEach(this.toggleAll);
        this.toggle(d);
      }
    }

    private updateRadialTree(animate = false) {
      
      this._Root = this._Tree(this._TreeData);
      

      const that = this;
      let svg = d3.select("#svgRadialTree");
      const overArchGroup = svg.select("#gOverArch");
      console.log("CHECK OVERARCH", overArchGroup.empty());
      let effic = overArchGroup.select("#gEffic");
      let linkGroup = overArchGroup.select("#gLinks");
      let nodeGroup = overArchGroup.select("#gNodes");
      //let labelGroup= overArchGroup.select("#gLabels");

    
      const linkData = this._Root.links();
      const nodeData = this._Root.descendants().reverse();

      //console.log("root",this._Root)
      //console.log("linkData", linkData);
      //console.log("nodeData", nodeData);
      console.log("gOverArch", overArchGroup)
      console.log("gLinks", linkGroup)
      console.log("gNodes", nodeGroup)
      //console.log("gLabels", labelGroup)

 



    
    let t1 = d3.transition("updateRadialTree")
      .duration(250)
      .ease(d3.easeLinear);
      

    let links = linkGroup
    .selectAll("path")
    .data(this._Root.links(), function(d) { return "l_"+d.source.data.id+"_"+d.target.data.id})
    .join(
      enter => {
        enter.append("path")       
        .attr("id", d =>  function(d) { return "l_"+d.source.data.id+"_"+d.target.data.id})   
        .classed("link", true)           
        .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y))
      },
      update => {
        update.attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));     
      },
      exit => exit.remove()
    );        

    // Append nodes.
    let nodes = nodeGroup.selectAll("g.node")
    .data(this._Root.descendants(), d => `g_${d.data.id}`)
    .join(
      enter => {
        let gEnter = enter.append("g")
        .attr("id", d => `g_${d.data.id}`) // Set the id attribute    
        .attr("class", "node")
        .attr("transform", d => `rotate(${(d.x * 180 / Math.PI) - 90}) translate(${d.y},0)`);

        gEnter.append("circle")
          .attr("id", d => `c_${d.data.id}`) // Set the id attribute        
          //.attr("fill", d => d.children ? "#555" : "#999")
          //.attr("fill", d => d.children ? "#555" : "white")
          .classed("nodeLeaf",d => !d.children || d.children.length < 1 && !d._children? true:false)
          .classed("nodeBranchOpen",d => d.children && d.children.length > 0 ? true:false)
          .classed("nodeBranchClosed",d => d._children && d.children && d._children.length > 0 ? true:false)
          .on("click", function(event,d) { 
            console.log("event",event);
            console.log("target",d);
            that.toggle(d);
            that.updateRadialTree(d); 
          });

          gEnter.append("text")
            .attr("id", d => `t_${d.data.id}`) // Set the id attribute        
            .attr("dy", 3)
            .attr("x", d => d.x < Math.PI ? 8 : -8) // Position text based on rotation
            .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
            .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null) // Flip text if needed
            .text(d=>this.getCustomNameFlip(d.data,d.x < Math.PI))
            .classed("txtLeaf",d => (!d.children || d.children.length < 1 ) && !d.data.data.NodeIsSingletonLeaf? true:false)
            .classed("txtBranch",d => d.children ? true:false)    
            .classed("txtOrphanLeaf",d => (!d.children || d.children.length < 1 ) && d.data.data.NodeIsSingletonLeaf? true:false)
            .on("mouseover", that.mouseover)
            .on("mousemove",that. mousemove)
            .on("mouseleave", that.mouseleave)
            .on("click", function(event,d) { 
              console.log("event",event);
              console.log("target",d);              
            });
      },
      update =>{
        update
          .attr("transform", d => `rotate(${(d.x * 180 / Math.PI) - 90}) translate(${d.y},0)`);
          
        update
          .selectAll("circle")
          .classed("nodeLeaf",d => !d.children || d.children.length < 1 && !d._children? true:false)
          .classed("nodeBranchOpen",d => d.children && d.children.length > 0 ? true:false)
          .classed("nodeBranchClosed",d => d._children && d.children && d._children.length > 0 ? true:false);

        update
          .selectAll("text")   
          .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
          .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null) // Flip text if needed
          .text(d=>this.getCustomNameFlip(d.data,d.x < Math.PI));       
      },
      exit => {
        exit.remove();
      }
    );
  //   .transition()
  //   .duration(2000)
  //   .ease(d3.easeLinear)
  //   .on("end", function() {
  //     const box = overArchGroup.node().getBBox();
  //     svg.transition().duration(1000).attr("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
  // });


    

  



    var duration = d3.event && d3.event.altKey ? 5000 : 500;

      


        const zoom = d3.zoom()
        .interpolate(d3.interpolateZoom)
        .scaleExtent([0.1, 20]) // Limits zoom scale
        .on("zoom", (event) => {                            
          requestAnimationFrame(() => {

            overArchGroup
            .transition()
            .duration(Math.max(200, 600 - event.transform.k * 200)) // Adaptive duration
            .ease(d3.easeLinear)
            .attrTween("transform", () => d3.interpolateTransformSvg(overArchGroup.attr("transform"), event.transform));

          // overArchGroup
          // .transition()
          // .duration(250)
          // .ease(d3.easeLinear)
          // .attrTween("transform", () => {
          //   const i = d3.interpolateString(overArchGroup.attr("transform"), event.transform);
          //   return t => i(t);
          // });

          // overArchGroup
          //   .transition()
          //   .duration(750)
          //   .ease(d3.easeCubicOut)
          //   .attr("transform",event.transform)
        });

        });

        svg.call(zoom)
        .on("dblclick.zoom", (event) => {
          svg.transition()
              .duration(750)
              .call(zoom.transform, d3.zoomIdentity
                .translate(this._Width / 2, this._Height / 2)
                .scale(1)
              );
        });
        
    }

    
    private getCustomName(node: any): string {
      // Customize the name field as needed
      let name = `${node.data.Name} (${node.data.ID})`;
      //console.log(name);
      return name;
    }
  
    private addImage(){
      let logoDIM = 256;
      let svg = d3.select("#svgRadialTree");
      const overArchGroup = svg.select("#gOverArch");
      let logoSelection = svg.select("#LOGO");
      if(logoSelection.node() == null){    
        // Create an SVG container
      const bbox = overArchGroup.node().getBBox();
      const imgWidth = logoDIM;  // Set image width
      const imgHeight = logoDIM; // Set image height
      const radius1 = imgWidth / 1.9; // Radius for the circular path

      const radius2 = imgWidth / 1.7; // Radius for the circular path

      // Append the PNG image to the group, placing it in the lower right corner
      overArchGroup.append("image")
      .attr("xlink:href", "assets/site/logo/LOGO.SOCCR.ORG.VINTAGE.IMPACT.TRANSPARENT.png") // Replace with the actual image path
      .attr("width", imgWidth)
      .attr("height", imgHeight)
      .attr("x", bbox.x + bbox.width - imgWidth)
      .attr("y", bbox.y + bbox.height - imgHeight);


      let centerX = bbox.x + bbox.width - imgWidth / 2; // Center X position
      let centerY = bbox.y + bbox.height - imgHeight / 2; // Center Y position\
      // Create a circular path for the text to follow
      
      overArchGroup.append("path")
      .attr("id", "textPathTop") // Unique ID for reference
      .attr("d", `M ${centerX - radius1}, ${centerY} 
                   A ${radius1},${radius1} 0 1,1 ${centerX + radius1},${centerY} 
                   A ${radius1},${radius1} 0 1,1 ${centerX - radius1},${centerY}`) // Draw circular arc
      .attr("fill", "none")      
      .attr("stroke", "transparent"); // Hide stroke (used only for positioning)
      

      overArchGroup.append("text")
        .append("textPath")
        .attr("xlink:href", "#textPathTop") // Attach text to the circular path
        //.attr("startOffset", "50%") // Center text along the path
        .attr("startOffset", "25%") // Center text along the path
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        //.style("font-weight", "bold")
        .style("font-family", "EurostileLinoTypeOblique")
        .style("fill", "red")
        .text("'SECRETS OF THE GAME - EUROPEAN FOOTBALL'");
        //.text("©Scott Assenheimer's soccr.org");
         
        
        overArchGroup.append("path")
        .attr("id", "textPathBottom") // Unique ID for reference
        .attr("d", `M ${centerX - radius2}, ${centerY} 
                     A ${radius2},${radius2} 0 0,0 ${centerX + radius2},${centerY} 
                     A ${radius2},${radius2} 0 0,0 ${centerX - radius2},${centerY}`) // Draw circular arc
        .attr("fill", "none")      
        .attr("stroke", "transparent"); // Hide stroke (used only for positioning)

        overArchGroup.append("text")
        .append("textPath")
        .attr("xlink:href", "#textPathBottom") // Attach text to the circular path
        //.attr("startOffset", "50%") // Center text along the path
        .attr("startOffset", "25%") // Center text along the path
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        //.style("font-weight", "bold")
        .style("font-family", "EurostileLinoTypeOblique")
        .style("fill", "red")       
        .text("\u00A9 2025 SCOTT ASSENHEIMER'S SOCCR.ORG");

  // Append the text element to overlay the image
    const currentYear = new Date().getFullYear();
      overArchGroup.append("text")
      .text(currentYear)
      .attr("x", bbox.x + bbox.width - imgWidth / 2)
      .attr("y", (bbox.y + bbox.height - imgHeight / 2) + 55)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "black") // Set color for contrast
      .attr("font-size", "48px")
      .attr("font-weight", "bold");

      overArchGroup.append("text")
      .text(currentYear)
      .attr("x", bbox.x + bbox.width - imgWidth / 2)
      .attr("y", (bbox.y + bbox.height - imgHeight / 2) + 50)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white") // Set color for contrast
      .attr("font-size", "48px")
      .attr("font-weight", "bold");

      let rectWidth = 200
      let rectHeight = 300
      let rectPadding = 50
      overArchGroup.append("rect")
      .attr("x", bbox.x) // Lower left side
      .attr("y", (bbox.y + bbox.height - rectHeight) - rectPadding) // Align to the bottom
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("fill", "none") // Transparent fill
      .attr("stroke", "white") // White border
      .attr("stroke-width", 2)
      .attr("rx", 10) // Rounded corners
      .attr("ry", 10); // Rounded corners
        // const node = overArchGroup.node();
        // const bbBox = node.getBBox();
        // const [gWidth, gHeight] = [bbBox.width, bbBox.height];        
        // const [imageX,imageY]=[gWidth.width - logoDIM,gHeight.height - logoDIM];
        // let image = this.d3util.addImage(overArchGroup,"assets/site/logo/LOGO.SOCCR.ORG.VINTAGE.IMPACT.TRANSPARENT.png",imageX,imageY,logoDIM,logoDIM, "LOGO");
      
      
        // const marginLeft = { left: 20, bottom: 40 }; // Adjust as needed

        // overArchGroup.append("text")
        // .text(currentYear)
        // .attr("x", bbox.x + bbox.width - imgWidth / 2)
        // .attr("y", (bbox.y + bbox.height - imgHeight / 2) + 50)
        // .attr("text-anchor", "middle")
        // .attr("dominant-baseline", "middle")
        // .attr("fill", "white") // Set color for contrast
        // .attr("font-size", "48px")
        // .attr("font-weight", "bold");

        // overArchGroup.append("text")
        //   .attr("x", bbox.x + marginLeft.left) // Left margin
        //   .attr("y", bbox.y + bbox.height - marginLeft.bottom) // Bottom margin
        //   .style("font-size", "24px") // Large text
        //   .style("font-family", "EurostileLinoTypeOblique")
        //   .style("font-weight", "bold")
        //   .style("fill", "red") // Text color
        //   .text("Secrets of the Game - European Football"); // Text content

      }

      
    }

    private getCustomNameFlip(node: any, flip: boolean): string {
      // Customize the name field as needed
      if(!flip)    
        return `${node.data.Name} (${node.data.ID})`;
      else 
        return `(${node.data.ID}) ${node.data.Name}`;   
     
    }  
  
    private onNodeClick(d: any, g: any, width: number, height: number): void {
      // Handle node click event
      console.log('Node clicked:', d);
  
    }
    
    private zoomed(event) {
      d3.select("#"+this.SELECT_OVERARCH).attr("transform", event.transform);
    }
    findNodesInSelection(sourceSelection, targetSelection){
      const filteredLinks = sourceSelection.filter(function(d) {
        return targetSelection.nodes().includes(this);
        });
     return filteredLinks; 
    }
    getPathToRoot(node) {
      let path = [];
      let nodes = [];
      nodes.push(node);
      while (node.parent) {
          path.push({ source: node.parent, target: node });
          nodes.push(node.parent);
          node = node.parent;
      }      
      return {
        links: path,
        nodes:nodes};
    }
    
    public LeafExpandedCollapsed(d: any): number {
      if(d.id=="1629"){
        console.log("hitting it - ",d);
      }
      if((d.data.children == null || d.data.children!.length==0)
         && 
         (d.data.altChildren == null || d.data.altChildren!.length > 0)
          ){
            return 0;
          }
      if(d.data.children && d.data.children.length > 0){
        // expanded
        return 1;
      } else if(d.data.children == null || d.data.children.length==0 && d.data.altChildren !=null && d.data.altChildren.length > 0){
        // collapsed
        return 2;
      } else {
        // no children.
        return 0;              
      };  
    }
      
    private swapChildrenIfAny(d:any):number {
      let iReturn = 0;
      if(      
        (d.data.altChildren != undefined && d.data.altChildren.length > 0)
        ||
        (d.data.children != undefined && d.data.children.length > 0)
      )
      {
        let altChildren = d.data.altChildren || [];
        let children = d.data.children;
        if(altChildren.length > 0 && children.length == 0){
          console.log('Node - Expanding', d);
          iReturn = 1;
        } else {
          console.log('Node - Collapsing', d);
          iReturn = 2;
        }
      
        d.data.children = altChildren
        d.data.altChildren = children;
        
      }
      return iReturn;
    }
Tooltip: any;

private buildTooltip(){
 // create a tooltip
  d3.select("#div_template")
    .append("div")
    .classed("tooltip",true)
    .attr("id", "graphTooltip")
    .style("opacity", 0);
    //.attr("class", "tooltip")
    //.style("background-color", "white")
}
  // Three function that change the tooltip when user hover / move / leave a cell
  private mouseover(event) {
    let selection = d3.select("#graphTooltip")
    let name = event.srcElement.__data__.data.data.Name;
    let desc = event.srcElement.__data__.data.data.Description;
    if(desc != null && desc != undefined && desc.length > 0)
    {
      selection.classed("tooltip",true);
      selection.classed("tooltip-empty",false);
    } else {
      selection.classed("tooltip",false);
      selection.classed("tooltip-empty",true);
    }
    selection.style("opacity", 1)   

        
    }
    private mousemove(event) {
      let name = event.srcElement.__data__.data.data.Name;
      let ID = event.srcElement.__data__.data.data.ID;
      let desc = event.srcElement.__data__.data.data.Description;
      let empty = true;
      let card = '';
      let showCodes = true;
      
      if(desc != null && desc != undefined && desc.length > 0) {
          empty = false;
      }
      
      if(empty) {
          card = "<div class='tooltip-card-header-empty'>"+showCodes?ID+" - ":""+name+"</div>";
      } else {
          card = "<div class='tooltip-card-header'>"+name+"</div>";
          if(desc != null && desc != undefined && desc.length > 0) {
              card += "<div class='tooltip-card-text'>"+desc+"</div>";
          }
      }
        
      
    card = "<div>"+card+"</div>";
    d3.select("#graphTooltip")
      .html(card)
      //.style("left", (event.layerX).toString() + "px")
      //.style("top", (event.layerY.toString() + "px"))

      .style("left", (event.clientX).toString() + "px")
      .style("top", (event.clientY.toString() + "px"));

  }
  private mouseleave(event) {
       d3.select("#graphTooltip")
        .style("opacity", 0)
    }
  
 
  }

  