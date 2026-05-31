import { Injectable } from '@angular/core';
import { ToolbarPosition } from '../interfaces';

export interface ToolbarSize {
  width: number;
  height: number;
}

export interface ToolbarSnapOptions {
  margin?: number;
  snapThreshold?: number;
  windowWidth: number;
  windowHeight: number;
  previousWindowWidth?: number;
  previousWindowHeight?: number;
}

export interface ToolbarSnapData {
  positions: Record<string, ToolbarPosition>;
  sizes: Record<string, ToolbarSize>;
  lockedToolbars?: Record<string, boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class ToolbarSnapService {
  constructor() {}

  /**
   * Constrains toolbar positions to window bounds and snaps them to edges
   * @param data Toolbar data including positions, sizes, and optional lock states
   * @param options Snap configuration options
   * @returns Updated toolbar positions
   */
  constrainToolbarsToWindow(
    data: ToolbarSnapData,
    options: ToolbarSnapOptions
  ): Record<string, ToolbarPosition> {
    const {
      margin = 20,
      snapThreshold = 50,
      windowWidth,
      windowHeight,
      previousWindowWidth,
      previousWindowHeight,
    } = options;

    const { positions, sizes, lockedToolbars = {} } = data;
    const updatedPositions: Record<string, ToolbarPosition> = {};

    console.log('ToolbarSnapService: Constraining toolbars to window bounds');
    console.log('Window dimensions:', windowWidth, 'x', windowHeight);
    if (previousWindowWidth && previousWindowHeight) {
      console.log(
        'Previous dimensions:',
        previousWindowWidth,
        'x',
        previousWindowHeight
      );
    }

    // Calculate previous window bounds for edge detection if previous dimensions provided
    const prevMaxXBounds: Record<string, number> = {};
    const prevMaxYBounds: Record<string, number> = {};

    if (previousWindowWidth && previousWindowHeight) {
      Object.keys(sizes).forEach((key) => {
        const size = sizes[key];
        prevMaxXBounds[key] = previousWindowWidth - size.width - margin;
        prevMaxYBounds[key] = previousWindowHeight - size.height - margin;
      });
    }

    // Constrain each toolbar within window bounds and snap to edges
    Object.keys(positions).forEach((toolbarKey) => {
      const position = { ...positions[toolbarKey] }; // Create a copy
      const size = sizes[toolbarKey];

      // Skip if size not defined or toolbar is locked
      if (!size || lockedToolbars[toolbarKey]) {
        updatedPositions[toolbarKey] = position;
        return;
      }

      // Calculate current window bounds
      const maxX = windowWidth - size.width - margin;
      const minX = margin;
      const maxY = windowHeight - size.height - margin;
      const minY = margin;

      console.log(`Processing toolbar ${toolbarKey}:`);
      console.log(`  Current position: (${position.x}, ${position.y})`);
      console.log(`  Size: ${size.width}x${size.height}`);
      console.log(`  Bounds: X[${minX}, ${maxX}], Y[${minY}, ${maxY}]`);

      // X-axis snapping logic
      if (previousWindowWidth && previousWindowHeight) {
        const prevMaxX = prevMaxXBounds[toolbarKey];

        // Check if toolbar was at or very close to previous right edge
        if (Math.abs(position.x - prevMaxX) <= 5) {
          console.log(
            `  ${toolbarKey} was at previous right edge, snapping to new right edge`
          );
          position.x = maxX;
        }
        // Check if toolbar is beyond current bounds (window shrunk)
        else if (position.x > maxX) {
          console.log(
            `  ${toolbarKey} beyond current right boundary, constraining to maxX=${maxX}`
          );
          position.x = maxX;
        }
        // Check if toolbar is close to left edge
        else if (position.x <= minX + snapThreshold) {
          console.log(
            `  ${toolbarKey} close to left edge, snapping to minX=${minX}`
          );
          position.x = minX;
        }
        // Check if toolbar is close to current right edge
        else if (position.x >= maxX - snapThreshold) {
          console.log(
            `  ${toolbarKey} close to right edge, snapping to maxX=${maxX}`
          );
          position.x = maxX;
        } else {
          // Ensure within bounds but don't move unnecessarily
          position.x = Math.max(minX, Math.min(maxX, position.x));
        }
      } else {
        // Simple constraint with edge snapping for new positions
        if (position.x <= minX + snapThreshold) {
          position.x = minX;
        } else if (position.x >= maxX - snapThreshold) {
          position.x = maxX;
        } else {
          position.x = Math.max(minX, Math.min(maxX, position.x));
        }
      }

      // Y-axis snapping logic
      if (previousWindowWidth && previousWindowHeight) {
        const prevMaxY = prevMaxYBounds[toolbarKey];

        // Check if toolbar was at or very close to previous bottom edge
        if (Math.abs(position.y - prevMaxY) <= 5) {
          console.log(
            `  ${toolbarKey} was at previous bottom edge, snapping to new bottom edge`
          );
          position.y = maxY;
        }
        // Check if toolbar is beyond current bounds (window shrunk)
        else if (position.y > maxY) {
          console.log(
            `  ${toolbarKey} beyond current bottom boundary, constraining to maxY=${maxY}`
          );
          position.y = maxY;
        }
        // Check if toolbar is close to top edge
        else if (position.y <= minY + snapThreshold) {
          console.log(
            `  ${toolbarKey} close to top edge, snapping to minY=${minY}`
          );
          position.y = minY;
        }
        // Check if toolbar is close to current bottom edge
        else if (position.y >= maxY - snapThreshold) {
          console.log(
            `  ${toolbarKey} close to bottom edge, snapping to maxY=${maxY}`
          );
          position.y = maxY;
        } else {
          // Ensure within bounds but don't move unnecessarily
          position.y = Math.max(minY, Math.min(maxY, position.y));
        }
      } else {
        // Simple constraint with edge snapping for new positions
        if (position.y <= minY + snapThreshold) {
          position.y = minY;
        } else if (position.y >= maxY - snapThreshold) {
          position.y = maxY;
        } else {
          position.y = Math.max(minY, Math.min(maxY, position.y));
        }
      }

      console.log(`  Final position: (${position.x}, ${position.y})`);
      updatedPositions[toolbarKey] = position;
    });

    return updatedPositions;
  }

  /**
   * Check if a position is close to window edges for snapping
   * @param position Current position
   * @param size Toolbar size
   * @param options Snap options
   * @returns Object indicating proximity to edges
   */
  checkEdgeProximity(
    position: ToolbarPosition,
    size: ToolbarSize,
    options: ToolbarSnapOptions
  ) {
    const {
      margin = 20,
      snapThreshold = 50,
      windowWidth,
      windowHeight,
    } = options;

    const maxX = windowWidth - size.width - margin;
    const minX = margin;
    const maxY = windowHeight - size.height - margin;
    const minY = margin;

    return {
      nearLeftEdge: position.x <= minX + snapThreshold,
      nearRightEdge: position.x >= maxX - snapThreshold,
      nearTopEdge: position.y <= minY + snapThreshold,
      nearBottomEdge: position.y >= maxY - snapThreshold,
      withinBounds:
        position.x >= minX &&
        position.x <= maxX &&
        position.y >= minY &&
        position.y <= maxY,
    };
  }

  /**
   * Snap a single toolbar position to the nearest edge if within threshold
   * @param position Current position
   * @param size Toolbar size
   * @param options Snap options
   * @returns Snapped position
   */
  snapToNearestEdge(
    position: ToolbarPosition,
    size: ToolbarSize,
    options: ToolbarSnapOptions
  ): ToolbarPosition {
    const {
      margin = 20,
      snapThreshold = 50,
      windowWidth,
      windowHeight,
    } = options;

    const maxX = windowWidth - size.width - margin;
    const minX = margin;
    const maxY = windowHeight - size.height - margin;
    const minY = margin;

    const snappedPosition = { ...position };

    // X-axis snapping
    if (Math.abs(position.x - minX) <= snapThreshold) {
      snappedPosition.x = minX;
    } else if (Math.abs(position.x - maxX) <= snapThreshold) {
      snappedPosition.x = maxX;
    }

    // Y-axis snapping
    if (Math.abs(position.y - minY) <= snapThreshold) {
      snappedPosition.y = minY;
    } else if (Math.abs(position.y - maxY) <= snapThreshold) {
      snappedPosition.y = maxY;
    }

    // Ensure within bounds
    snappedPosition.x = Math.max(minX, Math.min(maxX, snappedPosition.x));
    snappedPosition.y = Math.max(minY, Math.min(maxY, snappedPosition.y));

    return snappedPosition;
  }
}
