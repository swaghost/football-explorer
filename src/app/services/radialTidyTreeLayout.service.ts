// Radial Tidy Tree Layout Service (Reingold-Tilford for polar coordinates)
// Usage: const layout = new RadialTidyTreeLayout(); layout.layout(rootNode, centerRadius, totalAngle)

export interface RadialTreeNode {
  label: string;
  children?: RadialTreeNode[];
  // Output layout properties:
  angle?: number;
  radius?: number;
  depth?: number;
  labelAngleSpan?: number; // For label spacing and rotation
  parentLabelAngle?: number; // For parent label orientation
  // Optionally, you can add more properties as needed
}

export class RadialTidyTreeLayout {
  // Count leaf nodes in a subtree
  private countLeaves(node: RadialTreeNode): number {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce(
      (sum, child) => sum + this.countLeaves(child),
      0
    );
  }

  // Main layout function
  layout(
    root: RadialTreeNode,
    centerRadius = 0,
    totalAngle: number = 2 * Math.PI,
    radiusStep = 80
  ) {
    const leafCount = this.countLeaves(root);
    this._layoutRecursive(
      root,
      centerRadius,
      0,
      totalAngle,
      radiusStep,
      leafCount
    );
  }

  private _layoutRecursive(
    node: RadialTreeNode,
    radius: number,
    angleStart: number,
    angleSpan: number,
    radiusStep: number,
    totalLeaves: number,
    depth = 0
  ) {
    node.radius = radius;
    node.depth = depth;
    // Place node at center of its angular span
    node.angle = angleStart + angleSpan / 2;
    node.labelAngleSpan = angleSpan; // Store span for label spacing
    // For parent label angle: if children, use midpoint between first and last child; else use node.angle
    if (node.children && node.children.length > 0) {
      // After children are laid out, use their angles
      // But we need to compute them here, so we estimate
      const childLeafCounts = node.children.map((child) =>
        this.countLeaves(child)
      );
      const sumLeaves = childLeafCounts.reduce((a, b) => a + b, 0);
      let currentAngle = angleStart;
      const childAngles: number[] = [];
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childSpan = angleSpan * (childLeafCounts[i] / sumLeaves);
        child.labelAngleSpan = childSpan; // Store span for label spacing
        // Child angle will be at center of its span
        const childAngle = currentAngle + childSpan / 2;
        childAngles.push(childAngle);
        this._layoutRecursive(
          child,
          radius + radiusStep,
          currentAngle,
          childSpan,
          radiusStep,
          totalLeaves,
          depth + 1
        );
        currentAngle += childSpan;
      }
      // Parent label angle: midpoint between first and last child
      node.parentLabelAngle =
        (childAngles[0] + childAngles[childAngles.length - 1]) / 2;
    } else {
      node.parentLabelAngle = node.angle;
    }
  }
}
