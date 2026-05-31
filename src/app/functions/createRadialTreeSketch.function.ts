import p5 from 'p5';

interface TreeNode {
  label: string;
  angle: number;
  radius: number;
  children: TreeNode[];
}

export function generateMockRadialTree(): TreeNode {
  const maxDepth = 3;
  const branchFactor = 3;
  const radiusStep = 100;
  let nodeIndex = 0;
  function createNode(
    depth: number,
    angleStart: number,
    angleEnd: number
  ): TreeNode {
    const angle = (angleStart + angleEnd) / 2;
    const radius = depth * radiusStep;
    const label = `Node ${nodeIndex++}`;
    const children: TreeNode[] = [];
    if (depth < maxDepth) {
      const step = (angleEnd - angleStart) / branchFactor;
      for (let i = 0; i < branchFactor; i++) {
        children.push(
          createNode(
            depth + 1,
            angleStart + i * step,
            angleStart + (i + 1) * step
          )
        );
      }
    }
    return { label, angle, radius, children };
  }
  return createNode(0, 0, 2 * Math.PI);
}

function getUprightLabelAngle(angle: number): number {
  let norm = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (norm > Math.PI / 2 || norm < -Math.PI / 2) {
    norm += Math.PI;
    norm = ((norm + Math.PI) % (2 * Math.PI)) - Math.PI;
  }
  return norm;
}

function drawTree(
  s: p5,
  node: TreeNode,
  parentPos?: { x: number; y: number },
  rotation = 0
) {
  // Convert polar to cartesian
  const globalAngle = node.angle + rotation;
  const x = node.radius * Math.cos(globalAngle);
  const y = node.radius * Math.sin(globalAngle);
  const currentPos = { x, y };

  // Draw edge from parent to current node
  if (parentPos) {
    s.stroke(255, 0, 0);
    s.line(parentPos.x, parentPos.y, currentPos.x, currentPos.y);
  }

  // Recursively draw children
  for (const child of node.children) {
    drawTree(s, child, currentPos, rotation);
  }

  // Draw node
  s.push();
  s.translate(x, y);
  s.noStroke();
  s.fill(0, 255, 255); // Aqua color
  s.circle(0, 0, 10);
  s.pop();

  // Draw label
  const labelOffset = 30;
  const labelRadius = node.radius + labelOffset;
  const labelX = labelRadius * Math.cos(globalAngle);
  const labelY = labelRadius * Math.sin(globalAngle);
  s.push();
  s.translate(labelX, labelY);
  s.rotate(getUprightLabelAngle(globalAngle));
  s.textAlign(s.CENTER, s.CENTER);
  s.fill(255); // Inverted: white text for dark background
  s.noStroke();
  s.text(node.label, 0, 0);
  s.pop();
}

function getMaxRadius(tree: TreeNode): number {
  let max = tree.radius;
  for (const child of tree.children) {
    max = Math.max(max, getMaxRadius(child));
  }
  return max;
}

export const createRadialTreeSketch = (
  onHover: (node: TreeNode | null) => void,
  onClick: (node: TreeNode) => void,
  getRotation: () => number,
  getZoom: () => number,
  getMaxRadius: (tree: TreeNode) => number,
  options?: { showRadianLines?: boolean; showDegreeLines?: boolean }
) => {
  let treeData: TreeNode;
  let lastDrawRotation = 0;
  const sketch = (s: p5) => {
    s.setup = () => {
      s.createCanvas(s.windowWidth, s.windowHeight);
      treeData = generateMockRadialTree();
    };
    s.draw = () => {
      // Invert background to dark
      s.background(20);
      s.translate(s.width / 2, s.height / 2);
      s.scale(getZoom());
      const markerRadius = getMaxRadius(treeData) + 80;
      // Draw axis marker ring (degree circle) only if enabled
      if (!options || options.showDegreeLines) {
        s.push();
        s.noFill();
        s.stroke(220); // light gray ring
        s.circle(0, 0, markerRadius * 2);
        s.pop();
      }
      // Draw radian circle only if enabled
      if (!options || options.showRadianLines) {
        const radianLineRadius = markerRadius + 40;
        s.push();
        s.noFill();
        s.stroke(0, 255, 128); // Aqua-green for radian circle
        s.circle(0, 0, radianLineRadius * 2);
        s.pop();
        // Draw radian lines if enabled
        for (let i = 0; i < 8; i++) {
          // 0 to 2PI in steps of PI/4
          const rad = (i * Math.PI) / 4;
          const x2 = radianLineRadius * Math.cos(rad);
          const y2 = radianLineRadius * Math.sin(rad);
          s.push();
          s.stroke(0, 255, 128); // Aqua-green for radian lines
          s.line(0, 0, x2, y2);
          s.noStroke();
          s.fill(0, 255, 128);
          s.textAlign(s.CENTER, s.CENTER);
          s.text(
            `${i}π/4`,
            (radianLineRadius + 18) * Math.cos(rad),
            (radianLineRadius + 18) * Math.sin(rad)
          );
          s.pop();
        }
      }
      // Draw degree lines if enabled
      if (!options || options.showDegreeLines) {
        for (let deg = 0; deg < 360; deg++) {
          const rad = (deg * Math.PI) / 180;
          let inner = markerRadius - 5;
          let r = 180,
            g = 180,
            b = 255; // light blue for degree markers
          // Larger marker for every 5 degrees
          if (deg % 5 === 0) {
            inner = markerRadius - 10;
            r = 255;
            g = 255;
            b = 255; // white for 5-degree markers
          }
          const x1 = inner * Math.cos(rad);
          const y1 = inner * Math.sin(rad);
          const x2 = markerRadius * Math.cos(rad);
          const y2 = markerRadius * Math.sin(rad);
          s.push();
          s.stroke(r, g, b);
          s.line(x1, y1, x2, y2);
          // Label every 30 degrees
          if (deg % 30 === 0) {
            s.noStroke();
            s.fill(255); // white text for contrast
            s.textAlign(s.CENTER, s.CENTER);
            s.text(
              `${deg}`,
              (markerRadius + 18) * Math.cos(rad),
              (markerRadius + 18) * Math.sin(rad)
            );
          }
          s.pop();
        }
      }
      // Now rotate nodes only
      lastDrawRotation = getRotation();
      s.rotate(lastDrawRotation);
      drawTree(s, treeData, undefined, lastDrawRotation);
    };
    s.mouseMoved = () => {
      let found = null;
      // Step 1: subtract center
      let mx = s.mouseX - s.width / 2;
      let my = s.mouseY - s.height / 2;
      // Step 2: inverse scale
      const zoom = getZoom();
      mx /= zoom;
      my /= zoom;
      // Step 3: convert mouse to polar coordinates
      const mouseRadius = Math.sqrt(mx * mx + my * my);
      let mouseAngle = Math.atan2(my, mx);
      // Step 4: subtract rotation
      const rotation = getRotation();
      mouseAngle -= rotation;
      // Step 5: normalize angle to [-PI, PI]
      mouseAngle = ((mouseAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
      function search(node: TreeNode) {
        // Node polar coordinates
        const nodeRadius = node.radius;
        let nodeAngle = node.angle;
        nodeAngle = ((nodeAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
        // Node hit
        const dNode = Math.abs(mouseRadius - nodeRadius);
        const aNode = Math.abs(mouseAngle - nodeAngle);
        if (dNode < 10 && aNode < 0.25) found = node;
        // Label polar coordinates
        const labelOffset = 30;
        const labelRadius = node.radius + labelOffset;
        const dLabel = Math.abs(mouseRadius - labelRadius);
        const aLabel = Math.abs(mouseAngle - nodeAngle);
        if (dLabel < 18 && aLabel < 0.25) found = node;
        for (const child of node.children) search(child);
      }
      search(treeData);
      onHover(found);
    };
    s.mouseClicked = () => {
      let found = null;
      let mx = s.mouseX - s.width / 2;
      let my = s.mouseY - s.height / 2;
      const zoom = getZoom();
      mx /= zoom;
      my /= zoom;
      const mouseRadius = Math.sqrt(mx * mx + my * my);
      let mouseAngle = Math.atan2(my, mx);
      const rotation = getRotation();
      mouseAngle -= rotation;
      mouseAngle = ((mouseAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
      function search(node: TreeNode) {
        const nodeRadius = node.radius;
        let nodeAngle = node.angle;
        nodeAngle = ((nodeAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
        const dNode = Math.abs(mouseRadius - nodeRadius);
        const aNode = Math.abs(mouseAngle - nodeAngle);
        if (dNode < 10 && aNode < 0.25) found = node;
        const labelOffset = 30;
        const labelRadius = node.radius + labelOffset;
        const dLabel = Math.abs(mouseRadius - labelRadius);
        const aLabel = Math.abs(mouseAngle - nodeAngle);
        if (dLabel < 18 && aLabel < 0.25) found = node;
        for (const child of node.children) search(child);
      }
      search(treeData);
      if (found) onClick(found);
    };
  };
  return sketch;
};
