import { Injectable } from '@angular/core';

export interface PanToNodeOptions {
  nodeX: number;
  nodeY: number;
  screenWidth: number;
  screenHeight: number;
  currentZoomLevel: number;
  duration?: number;
}

export interface PanAnimationCallback {
  onUpdate: (panX: number, panY: number) => void;
  onComplete?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class PanToNodeService {
  constructor() {}

  /**
   * Calculates the target pan coordinates to center a node on screen
   * accounting for the current zoom level.
   *
   * @param options - The pan calculation options
   * @returns The target pan coordinates
   */
  calculatePanToCenter(options: PanToNodeOptions): {
    targetPanX: number;
    targetPanY: number;
  } {
    const { nodeX, nodeY, screenWidth, screenHeight, currentZoomLevel } =
      options;

    // Calculate screen center
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    // Node coordinates are in world space, but we need to account for zoom
    // The transform applies: translate(centerX + panX, centerY + panY) scale(zoom) translate(-centerX, -centerY)
    // To center a point at (nodeX, nodeY), we need:
    // (nodeX - centerX) * zoom + centerX + panX = centerX
    // (nodeY - centerY) * zoom + centerY + panY = centerY
    // Solving for panX and panY:
    // panX = centerX - (nodeX - centerX) * zoom - centerX = -(nodeX - centerX) * zoom
    // panY = centerY - (nodeY - centerY) * zoom - centerY = -(nodeY - centerY) * zoom

    const targetPanX = -(nodeX - centerX) * currentZoomLevel;
    const targetPanY = -(nodeY - centerY) * currentZoomLevel;

    return { targetPanX, targetPanY };
  }

  /**
   * Animates panning from current position to target position with easing
   *
   * @param startPanX - Starting pan X coordinate
   * @param startPanY - Starting pan Y coordinate
   * @param targetPanX - Target pan X coordinate
   * @param targetPanY - Target pan Y coordinate
   * @param callback - Callback functions for animation updates
   * @param duration - Animation duration in milliseconds (default: 500)
   */
  animatePanTo(
    startPanX: number,
    startPanY: number,
    targetPanX: number,
    targetPanY: number,
    callback: PanAnimationCallback,
    duration = 500
  ): void {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentPanX = startPanX + (targetPanX - startPanX) * easeProgress;
      const currentPanY = startPanY + (targetPanY - startPanY) * easeProgress;

      // Call the update callback
      callback.onUpdate(currentPanX, currentPanY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        callback.onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Complete pan-to-node functionality combining calculation and animation
   *
   * @param options - The pan calculation options
   * @param currentPanX - Current pan X coordinate
   * @param currentPanY - Current pan Y coordinate
   * @param callback - Callback functions for animation updates
   */
  panToNode(
    options: PanToNodeOptions,
    currentPanX: number,
    currentPanY: number,
    callback: PanAnimationCallback
  ): void {
    const { nodeX, nodeY, screenWidth, screenHeight, currentZoomLevel } =
      options;

    console.log(
      `PanToNodeService: Panning to node at (${nodeX.toFixed(
        2
      )}, ${nodeY.toFixed(2)}) with zoom level: ${currentZoomLevel}`
    );

    // Calculate target pan coordinates
    const { targetPanX, targetPanY } = this.calculatePanToCenter(options);

    console.log(`Node position: (${nodeX.toFixed(2)}, ${nodeY.toFixed(2)})`);
    console.log(`Screen center: (${screenWidth / 2}, ${screenHeight / 2})`);
    console.log(`Current zoom: ${currentZoomLevel}`);
    console.log(
      `Target pan: (${targetPanX.toFixed(2)}, ${targetPanY.toFixed(2)})`
    );

    // Animate to target position
    this.animatePanTo(
      currentPanX,
      currentPanY,
      targetPanX,
      targetPanY,
      callback,
      options.duration
    );
  }
}
