import { TestBed } from '@angular/core/testing';
import {
  ToolbarSnapService,
  ToolbarSnapData,
  ToolbarSnapOptions,
} from './toolbar-snap.service';

describe('ToolbarSnapService', () => {
  let service: ToolbarSnapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolbarSnapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constrainToolbarsToWindow', () => {
    it('should constrain toolbar positions within window bounds', () => {
      const data: ToolbarSnapData = {
        positions: {
          toolbar1: { x: -50, y: -50 }, // Outside bounds
          toolbar2: { x: 1500, y: 1000 }, // Outside bounds
          toolbar3: { x: 100, y: 100 }, // Inside bounds
        },
        sizes: {
          toolbar1: { width: 200, height: 150 },
          toolbar2: { width: 200, height: 150 },
          toolbar3: { width: 200, height: 150 },
        },
      };

      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
      };

      const result = service.constrainToolbarsToWindow(data, options);

      // toolbar1 should be constrained to top-left margin
      expect(result['toolbar1'].x).toBe(20);
      expect(result['toolbar1'].y).toBe(20);

      // toolbar2 should be constrained to bottom-right bounds
      expect(result['toolbar2'].x).toBe(580); // 800 - 200 - 20
      expect(result['toolbar2'].y).toBe(430); // 600 - 150 - 20

      // toolbar3 should remain unchanged as it's within bounds
      expect(result['toolbar3'].x).toBe(100);
      expect(result['toolbar3'].y).toBe(100);
    });

    it('should snap toolbars to edges when within snap threshold', () => {
      const data: ToolbarSnapData = {
        positions: {
          toolbar1: { x: 40, y: 40 }, // Close to top-left edge
          toolbar2: { x: 540, y: 390 }, // Close to bottom-right edge
        },
        sizes: {
          toolbar1: { width: 200, height: 150 },
          toolbar2: { width: 200, height: 150 },
        },
      };

      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
      };

      const result = service.constrainToolbarsToWindow(data, options);

      // toolbar1 should snap to margin (20) as it's within threshold
      expect(result['toolbar1'].x).toBe(20);
      expect(result['toolbar1'].y).toBe(20);

      // toolbar2 should snap to max bounds
      expect(result['toolbar2'].x).toBe(580); // 800 - 200 - 20
      expect(result['toolbar2'].y).toBe(430); // 600 - 150 - 20
    });

    it('should respect locked toolbars', () => {
      const data: ToolbarSnapData = {
        positions: {
          toolbar1: { x: -50, y: -50 }, // Outside bounds but locked
          toolbar2: { x: -50, y: -50 }, // Outside bounds, not locked
        },
        sizes: {
          toolbar1: { width: 200, height: 150 },
          toolbar2: { width: 200, height: 150 },
        },
        lockedToolbars: {
          toolbar1: true,
          toolbar2: false,
        },
      };

      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
      };

      const result = service.constrainToolbarsToWindow(data, options);

      // toolbar1 should remain unchanged because it's locked
      expect(result['toolbar1'].x).toBe(-50);
      expect(result['toolbar1'].y).toBe(-50);

      // toolbar2 should be constrained because it's not locked
      expect(result['toolbar2'].x).toBe(20);
      expect(result['toolbar2'].y).toBe(20);
    });

    it('should handle previous window size for edge detection', () => {
      const data: ToolbarSnapData = {
        positions: {
          toolbar1: { x: 480, y: 350 }, // Was at previous right/bottom edge
        },
        sizes: {
          toolbar1: { width: 200, height: 150 },
        },
      };

      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
        previousWindowWidth: 700,
        previousWindowHeight: 520,
      };

      const result = service.constrainToolbarsToWindow(data, options);

      // toolbar1 should snap to new right/bottom edges
      expect(result['toolbar1'].x).toBe(580); // 800 - 200 - 20
      expect(result['toolbar1'].y).toBe(430); // 600 - 150 - 20
    });
  });

  describe('checkEdgeProximity', () => {
    it('should detect proximity to edges', () => {
      const position = { x: 40, y: 40 };
      const size = { width: 200, height: 150 };
      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
      };

      const proximity = service.checkEdgeProximity(position, size, options);

      expect(proximity.nearLeftEdge).toBe(true);
      expect(proximity.nearTopEdge).toBe(true);
      expect(proximity.nearRightEdge).toBe(false);
      expect(proximity.nearBottomEdge).toBe(false);
      expect(proximity.withinBounds).toBe(true);
    });
  });

  describe('snapToNearestEdge', () => {
    it('should snap position to nearest edge when within threshold', () => {
      const position = { x: 40, y: 540 };
      const size = { width: 200, height: 150 };
      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
      };

      const snapped = service.snapToNearestEdge(position, size, options);

      expect(snapped.x).toBe(20); // Snapped to left edge
      expect(snapped.y).toBe(430); // Snapped to bottom edge (600 - 150 - 20)
    });

    it('should not snap if not within threshold', () => {
      const position = { x: 100, y: 100 };
      const size = { width: 200, height: 150 };
      const options: ToolbarSnapOptions = {
        margin: 20,
        snapThreshold: 50,
        windowWidth: 800,
        windowHeight: 600,
      };

      const snapped = service.snapToNearestEdge(position, size, options);

      expect(snapped.x).toBe(100); // No snapping
      expect(snapped.y).toBe(100); // No snapping
    });
  });
});
