/**
 * Colorization Application Service
 *
 * Applies colorization results from strategies to the visualization.
 * Handles updating node colors, managing color keys, and rendering changes.
 */

import { Injectable } from '@angular/core';
import { IColorizationResult } from '../interfaces/colorization/colorization-result.interface';
import { IColorNodeData } from '../interfaces/colorization/colorization-node-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ColorizationApplicationService {
  constructor() {}

  /**
   * Apply colorization to node circles based on nodeId
   * @param svg The SVG element containing the tree visualization
   * @param result The colorization result to apply
   * @param colorTarget Optional color target to determine how colors are applied
   * @param targetSelector Optional CSS selector for the parent element containing nodes
   * @param skipRootNodeColorization Whether to skip coloring the root node
   * @param colorBrightness Brightness percentage (0-100) for the base color
   * @param colorGradientBrightnessEnd Brightness percentage at the gradient end
   */
  applyColorizationToNodeCircles(
    svg: SVGElement | null,
    result: IColorizationResult,
    colorTarget: 'nodes' | 'text' | 'both' = 'both',
    targetSelector: string = 'circle.tree-node',
    skipRootNodeColorization: boolean = false,
    colorBrightness: number = 100,
    colorGradientBrightnessEnd: number = 0
  ): void {
    console.log('🎯 applyColorizationToNodeCircles called');
    console.log('SVG valid:', !!svg);
    console.log('Result valid:', !!result);
    console.log('Node data:', result?.nodeData?.length);
    console.log('Color uniformity:', result?.colorUniformity);
    console.log(
      'Gradient directionality:',
      result?.colorGradientDirectionality
    );
    console.log('Node opacity:', result?.nodeOpacity);

    // DEBUG: Branch/Selection colorization
    if (result?.nodeData && result.nodeData.length > 0) {
      console.log('=== COLORIZATION DEBUG ===');
      console.log('Strategy result - Node data sample:');
      const qualifiedCount = result.nodeData.filter(
        (nd) => nd.keyValue === 'qualified'
      ).length;
      const unqualifiedCount = result.nodeData.filter(
        (nd) => nd.keyValue === 'unqualified'
      ).length;
      console.log(`  Qualified nodes: ${qualifiedCount}`);
      console.log(`  Unqualified nodes: ${unqualifiedCount}`);
      console.log(
        `  Total nodes in strategy result: ${result.nodeData.length}`
      );
      if (result.nodeData.length > 0) {
        console.log('  First 5 nodes from strategy:');
        for (let i = 0; i < Math.min(5, result.nodeData.length); i++) {
          const nd = result.nodeData[i];
          console.log(
            `    Node ${i}: id="${nd.nodeId}", keyValue="${nd.keyValue}", color="${nd.color}"`
          );
        }
      }
      console.log('==========================');
    }

    if (!svg || !result || !result.nodeData || result.nodeData.length === 0) {
      console.error('❌ Invalid input to applyColorizationToNodeCircles');
      return;
    }

    // Apply opacity to all circles if specified
    const nodeOpacity = result.nodeOpacity ?? 1;
    console.log('Applying node opacity:', nodeOpacity);
    const opacityCircles = svg.querySelectorAll('circle.tree-node');
    opacityCircles.forEach((circle) => {
      (circle as SVGElement).style.opacity = nodeOpacity.toString();
    });

    // Create a map of nodeId to color with depth-based shading
    const colorMap = this.buildColorMap(
      result.nodeData,
      result.colorUniformity,
      result.colorGradientDirectionality,
      colorBrightness,
      colorGradientBrightnessEnd
    );
    console.log('Color map size:', colorMap.size);

    // Apply colors to SVG nodes - support both circle.node and circle.tree-node
    let nodes = svg.querySelectorAll(targetSelector);
    console.log(
      'Found nodes with selector "' + targetSelector + '":',
      nodes.length
    );

    if (nodes.length === 0) {
      console.log('Trying fallback selector "circle.node"');
      nodes = svg.querySelectorAll('circle.node');
      console.log('Found nodes with fallback:', nodes.length);
    }

    if (nodes.length === 0) {
      console.log('❌ No nodes found! SVG structure:');
      console.log('SVG children count:', svg.children.length);
      for (let i = 0; i < Math.min(5, svg.children.length); i++) {
        console.log(
          '  Child',
          i,
          ':',
          svg.children[i].tagName,
          'class:',
          svg.children[i].className
        );
      }
      console.log('All circles in SVG:', svg.querySelectorAll('circle').length);
      console.log('All g elements:', svg.querySelectorAll('g').length);
      const debugCircles = svg.querySelectorAll('circle');
      if (debugCircles.length > 0) {
        console.log('First circle element:', debugCircles[0]);
        console.log('  id:', debugCircles[0].id);
        console.log('  class:', debugCircles[0].className);
      }
      return;
    }

    console.log('Total nodes to color:', nodes.length);
    console.log(
      'ColorTarget:',
      colorTarget,
      '- Only coloring nodes because target is:',
      colorTarget
    );
    let coloredCount = 0;

    // Skip if colorTarget is 'text' - node circles should NOT be colored when targeting text
    if (colorTarget === 'text') {
      console.log(
        '⏭️  Skipping node circle coloring because colorTarget is "text"'
      );
      return;
    }

    // Debug: Print all circle IDs
    console.log('=== CIRCLE ID DEBUG ===');
    const allCircles = svg.querySelectorAll('circle.tree-node');
    console.log('Total circle.tree-node elements:', allCircles.length);
    for (let i = 0; i < Math.min(10, allCircles.length); i++) {
      const circle = allCircles[i] as any;
      console.log(
        `  Circle ${i}: id="${circle.id}", r="${circle.getAttribute(
          'r'
        )}", cx="${circle.getAttribute('cx')}"`
      );
    }
    console.log('======================');

    // Also check if circles have empty IDs (which would break our matching)
    let circlesWithoutId = 0;
    for (let i = 0; i < allCircles.length; i++) {
      if (!allCircles[i].id || allCircles[i].id === '') {
        circlesWithoutId++;
      }
    }
    console.log(
      `⚠️  Circles without IDs: ${circlesWithoutId} out of ${allCircles.length}`
    );

    // NEW: Try matching by index if all else fails
    const allHaveNoId = circlesWithoutId === nodes.length;
    const useIndexFallback = allHaveNoId; // Use fallback if ALL circles lack IDs, regardless of map size
    if (useIndexFallback) {
      console.log(
        '⚠️  FALLBACK: All circles missing IDs, using index-based matching'
      );
      const colorMapEntries = Array.from(colorMap.entries());

      // Try to match by index: some circles might not have colors (like root at index 0)
      nodes.forEach((node: Element, index: number) => {
        // Skip root node if override is enabled
        if (skipRootNodeColorization && index === 0) {
          console.log(
            `Index ${index}: Root node - skipping due to root node override enabled`
          );
          return;
        }

        // For index 0 (root), skip coloring since it's usually not colored
        // For other indices, map to colorMap entry (accounting for root being index 0 but not in colorMap)
        let colorIndex = index - 1; // Subtract 1 because colorMap keys start at 1, not 0

        if (colorIndex >= 0 && colorIndex < colorMapEntries.length) {
          const [nodeId, color] = colorMapEntries[colorIndex];
          console.log(
            `Index ${index}: Coloring with color from nodeId "${nodeId}": ${color}`
          );
          // Apply colors to node circles only (text will be colored separately if needed)
          this.applyColorToElement(node as SVGElement, color, 'fill');
          coloredCount++;
        } else if (index === 0) {
          console.log(
            `Index ${index}: Root node - skipping (typically not colored)`
          );
        }
      });
    } else {
      // Normal path: match by ID
      const failureReasons: { [key: string]: number } = {};
      let successCount = 0;
      let failureCount = 0;

      console.log('🔍 Applying colors to nodes by ID:');
      console.log(`   ColorMap has ${colorMap.size} entries`);
      console.log(
        '   ColorMap keys:',
        Array.from(colorMap.keys()).slice(0, 10).join(', ')
      );

      nodes.forEach((node: Element, index: number) => {
        // Skip root node if override is enabled
        if (skipRootNodeColorization && index === 0) {
          console.log(
            `Index ${index}: Root node - skipping due to root node override enabled`
          );
          return;
        }

        const nodeId = this.getNodeId(node);
        const nodeElement = node as SVGElement;
        const htmlId = nodeElement.getAttribute('id');
        const dataNodeId = nodeElement.getAttribute('data-node-id');

        if (nodeId && colorMap.has(nodeId)) {
          const color = colorMap.get(nodeId)!;
          // Apply colors to node circles only (text will be colored separately if needed)
          this.applyColorToElement(node as SVGElement, color, 'fill');
          coloredCount++;
          successCount++;
          if (successCount <= 5) {
            console.log(
              `  ✅ Node ${index}: nodeId="${nodeId}" (html-id="${htmlId}", data-node-id="${dataNodeId}"), color="${color}"`
            );
          }
        } else {
          // Enhanced debugging
          if (!nodeId) {
            failureReasons['no-id'] = (failureReasons['no-id'] || 0) + 1;
            failureCount++;
            if (failureCount <= 5) {
              console.log(
                `  ❌ Node ${index}: NO ID FOUND (html-id="${htmlId}", data-node-id="${dataNodeId}")`
              );
            }
          } else {
            // Node ID exists but not in color map
            const matchingInColorMap = Array.from(colorMap.keys()).filter(
              (k) => k.includes(nodeId) || nodeId.includes(k)
            );
            const reason = `not-in-map (similar: ${matchingInColorMap.length})`;
            failureReasons['not-in-map'] =
              (failureReasons['not-in-map'] || 0) + 1;
            failureCount++;
            if (failureCount <= 5) {
              console.log(
                `  ❌ Node ${index}: id="${nodeId}" NOT IN COLORMAP (similar keys: ${matchingInColorMap.join(
                  ', '
                )})`
              );
            }
          }
        }
      });

      if (successCount > 5) {
        console.log(`  ... and ${successCount - 5} more successfully colored`);
      }
      if (failureCount > 5) {
        console.log(`  ... and ${failureCount - 5} more failures`);
      }
      if (Object.keys(failureReasons).length > 0) {
        console.log('⚠️  Coloring failures summary:', failureReasons);
      }
    }

    console.log('✅ Colored', coloredCount, 'out of', nodes.length, 'nodes');
  }

  /**
   * Apply colorization to text elements based on nodeId
   * @param svg The SVG element containing the tree visualization
   * @param result The colorization result to apply
   * @param colorTarget The target to apply colorization to
   * @param targetSelector Optional CSS selector for text elements
   * @param skipRootNodeColorization Whether to skip coloring the root node
   * @param colorBrightness Brightness percentage (0-100) for the base color
   * @param colorGradientBrightnessEnd Brightness percentage at the gradient end
   */
  applyColorizationToText(
    svg: SVGElement | null,
    result: IColorizationResult,
    colorTarget: 'nodes' | 'text' | 'both' = 'both',
    targetSelector: string = 'text.tree-label',
    skipRootNodeColorization: boolean = false,
    colorBrightness: number = 100,
    colorGradientBrightnessEnd: number = 0
  ): void {
    if (!svg || !result || !result.nodeData || result.nodeData.length === 0) {
      console.warn(
        '⚠️ applyColorizationToText: Missing SVG, result, or nodeData'
      );
      return;
    }

    // Skip if colorTarget is 'nodes' - text should NOT be colored when targeting nodes
    if (colorTarget === 'nodes') {
      console.log('⏭️  Skipping text coloring because colorTarget is "nodes"');
      return;
    }

    const colorMap = this.buildColorMap(
      result.nodeData,
      result.colorUniformity,
      result.colorGradientDirectionality,
      colorBrightness,
      colorGradientBrightnessEnd
    );
    console.log('🔤 applyColorizationToText called');
    console.log('  Looking for text elements with selector:', targetSelector);

    // Try specific selectors first
    let textElements = svg.querySelectorAll('text.tree-node-label');
    console.log(
      `  Found ${textElements.length} elements with selector "text.tree-node-label"`
    );

    if (textElements.length === 0) {
      console.log('  Trying fallback selector "text.tree-label"');
      textElements = svg.querySelectorAll('text.tree-label');
      console.log(
        `  Found ${textElements.length} elements with fallback selector "text.tree-label"`
      );
    }

    if (textElements.length === 0) {
      console.log('  Trying fallback selector "text.node-label"');
      textElements = svg.querySelectorAll('text.node-label');
      console.log(
        `  Found ${textElements.length} elements with fallback selector "text.node-label"`
      );
    }

    if (textElements.length === 0) {
      console.log('  Trying all text elements');
      textElements = svg.querySelectorAll('text');
      console.log(`  Found ${textElements.length} total text elements`);
    }

    console.log(`🎨 Coloring ${textElements.length} text elements`);
    let coloredTextCount = 0;

    // Check if text elements have nodeIds
    let textWithoutId = 0;
    for (let i = 0; i < textElements.length; i++) {
      const nodeId = this.getNodeId(textElements[i]);
      if (!nodeId || nodeId === 'null') {
        textWithoutId++;
      }
    }
    console.log(
      `⚠️  Text elements without valid IDs: ${textWithoutId} out of ${textElements.length}`
    );

    // NEW: Try index-based fallback if all text elements lack nodeIds
    const allTextHaveNoId = textWithoutId === textElements.length;
    const useIndexFallback = allTextHaveNoId && textElements.length > 0;

    if (useIndexFallback) {
      console.log(
        '⚠️  FALLBACK: All text elements missing IDs, using index-based matching'
      );
      const colorMapEntries = Array.from(colorMap.entries());

      // Try to match by index
      textElements.forEach((textEl: Element, index: number) => {
        // Skip root node if override is enabled
        if (skipRootNodeColorization && index === 0) {
          console.log(
            `Index ${index}: Root text - skipping due to root node override enabled`
          );
          return;
        }

        // For index 0 (root), skip coloring since it's usually not colored
        // For other indices, map to colorMap entry (accounting for root being index 0 but not in colorMap)
        let colorIndex = index - 1; // Subtract 1 because colorMap keys start at 1, not 0

        if (colorIndex >= 0 && colorIndex < colorMapEntries.length) {
          const [nodeId, color] = colorMapEntries[colorIndex];
          console.log(
            `Index ${index}: Coloring text with color from nodeId "${nodeId}": ${color}`
          );
          // Apply colors to text elements (both fill and stroke when targeting text, fill only when targeting both)
          if (colorTarget === 'text') {
            // When targeting text, apply both fill and stroke colors
            this.applyColorToElement(textEl as SVGElement, color, 'fill');
            this.applyColorToElement(textEl as SVGElement, color, 'stroke');
          } else {
            // When targeting both, apply fill only
            this.applyColorToElement(textEl as SVGElement, color, 'fill');
          }
          coloredTextCount++;
        } else if (index === 0) {
          console.log(
            `Index ${index}: Root text - skipping (typically not colored)`
          );
        }
      });
    } else {
      // Normal path: match by ID
      const failureReasons: { [key: string]: number } = {};
      textElements.forEach((textEl: Element, index: number) => {
        // Skip root node if override is enabled
        if (skipRootNodeColorization && index === 0) {
          console.log(
            `Index ${index}: Root text - skipping due to root node override enabled`
          );
          return;
        }

        const nodeId = this.getNodeId(textEl);
        if (nodeId && colorMap.has(nodeId)) {
          const color = colorMap.get(nodeId);
          console.log(`  Text ${index}: nodeId="${nodeId}" -> color=${color}`);
          // Apply colors to text elements (both fill and stroke when targeting text, fill only when targeting both)
          if (colorTarget === 'text') {
            // When targeting text, apply both fill and stroke colors
            this.applyColorToElement(textEl as SVGElement, color, 'fill');
            this.applyColorToElement(textEl as SVGElement, color, 'stroke');
          } else {
            // When targeting both, apply fill only
            this.applyColorToElement(textEl as SVGElement, color, 'fill');
          }
          coloredTextCount++;
        } else {
          const reason = !nodeId || nodeId === 'null' ? 'no-id' : 'not-in-map';
          failureReasons[reason] = (failureReasons[reason] || 0) + 1;
        }
      });

      if (Object.keys(failureReasons).length > 0) {
        console.log('⚠️  Text coloring failures:', failureReasons);
      }
    }

    console.log(
      `✅ Colored ${coloredTextCount} out of ${textElements.length} text elements`
    );
  }

  /**
   * Apply colorization to both nodes and text
   * @param svg The SVG element containing the tree visualization
   * @param result The colorization result to apply
   * @param colorTarget 'nodes', 'text', or 'both'
   * @param skipRootNodeColorization Whether to skip coloring the root node
   * @param colorBrightness Brightness percentage (0-100) for the base color
   * @param colorGradientBrightnessEnd Brightness percentage at the gradient end
   */
  applyColorization(
    svg: SVGElement | null,
    result: IColorizationResult,
    colorTarget: 'nodes' | 'text' | 'both' = 'both',
    skipRootNodeColorization: boolean = false,
    colorBrightness: number = 100,
    colorGradientBrightnessEnd: number = 0
  ): void {
    console.log('📦 applyColorization called');
    console.log('SVG element:', !!svg);
    console.log('Result:', !!result);
    console.log('Color target:', colorTarget);
    console.log('Skip root node colorization:', skipRootNodeColorization);
    console.log('Color brightness:', colorBrightness);
    console.log('Gradient brightness end:', colorGradientBrightnessEnd);

    if (!svg || !result) {
      console.error('❌ SVG or result missing');
      return;
    }

    console.log('Applying colorization for target:', colorTarget);

    if (colorTarget === 'nodes' || colorTarget === 'both') {
      console.log('Calling applyColorizationToNodeCircles...');
      this.applyColorizationToNodeCircles(
        svg,
        result,
        colorTarget,
        'circle.tree-node',
        skipRootNodeColorization,
        colorBrightness,
        colorGradientBrightnessEnd
      );
    }

    if (colorTarget === 'text' || colorTarget === 'both') {
      console.log('Calling applyColorizationToText...');
      this.applyColorizationToText(
        svg,
        result,
        colorTarget,
        'text.tree-label',
        skipRootNodeColorization,
        colorBrightness,
        colorGradientBrightnessEnd
      );
    }

    console.log('✅ applyColorization complete');
  }

  /**
   * Clear colorization from SVG
   * Only clears what will be re-colored, respecting colorTarget
   * Skips root node (first element) to preserve root node overrides
   * @param svg The SVG element containing the tree visualization
   * @param colorTarget The target elements being colorized ('nodes', 'text', or 'both')
   */
  clearColorization(
    svg: SVGElement | null,
    colorTarget: 'nodes' | 'text' | 'both' = 'both'
  ): void {
    if (!svg) {
      return;
    }

    // Only clear circle colors if we're about to colorize nodes
    if (colorTarget === 'nodes' || colorTarget === 'both') {
      const nodeCircles = svg.querySelectorAll('circle.tree-node, circle.node');
      nodeCircles.forEach((node: Element, index: number) => {
        // Skip root node (first element) to preserve root node override colors
        if (index === 0) return;
        (node as SVGElement).style.fill = '';
        (node as SVGElement).style.stroke = '';
      });
    }

    // Only clear text colors if we're about to colorize text
    if (colorTarget === 'text' || colorTarget === 'both') {
      const textElements = svg.querySelectorAll(
        'text.tree-node-label, text.tree-label, text.node-label, text'
      );
      textElements.forEach((textEl: Element, index: number) => {
        // Skip root node text (first element) to preserve root node override colors
        if (index === 0) return;
        (textEl as SVGElement).style.fill = '';
        (textEl as SVGElement).style.stroke = '';
      });
    }
  }

  /**
   * Render a color key/legend based on the colorization result
   * @param result The colorization result containing key information
   * @param position Position where the key should appear
   * @returns HTML element for the color key
   */
  generateColorKey(
    result: IColorizationResult,
    position:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right' = 'top-right'
  ): HTMLElement {
    const keyContainer = document.createElement('div');
    keyContainer.className = 'color-key-legend';
    keyContainer.style.cssText = `
      position: absolute;
      ${this.getPositionStyles(position)}
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      min-width: 120px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      z-index: 1000;
    `;

    // Add title
    const title = document.createElement('div');
    title.style.cssText =
      'font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 6px;';
    title.textContent = 'Color Key';
    keyContainer.appendChild(title);

    // Add color entries
    if (result.key && result.key.length > 0) {
      result.key.forEach((keyEntry) => {
        const entry = document.createElement('div');
        entry.style.cssText =
          'display: flex; align-items: center; gap: 8px; margin: 6px 0;';

        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
          width: 16px;
          height: 16px;
          border-radius: 2px;
          background-color: ${keyEntry.color};
          border: 1px solid rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        `;

        const label = document.createElement('span');
        label.textContent = keyEntry.name;
        label.style.cssText = 'flex: 1;';

        entry.appendChild(colorBox);
        entry.appendChild(label);
        keyContainer.appendChild(entry);
      });
    }

    return keyContainer;
  }

  /**
   * Build a map of nodeId to color for quick lookup
   * @param nodeData Array of color node data
   * @param uniformity Color uniformity mode ('Solid' or 'Gradient')
   * @param directionality Gradient direction ('sunset' or 'sunrise')
   * @param colorBrightness Brightness percentage (0-100) for the base color
   * @param colorGradientBrightnessEnd Brightness percentage at the gradient end (only used with Gradient)
   */
  private buildColorMap(
    nodeData: IColorNodeData[],
    uniformity?: 'Solid' | 'Gradient',
    directionality?: 'sunset' | 'sunrise',
    colorBrightness: number = 100,
    colorGradientBrightnessEnd: number = 0
  ): Map<string, string> {
    const colorMap = new Map<string, string>();

    // Get level range for gradient calculations
    const levels = nodeData.map((n) => n.level);
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);
    const levelRange = maxLevel - minLevel || 1; // Avoid division by zero

    nodeData.forEach((data) => {
      let finalColor = data.color;

      // Apply brightness adjustment to base color if not 100%
      if (colorBrightness !== 100) {
        const brightnessDelta = colorBrightness - 100;
        if (brightnessDelta > 0) {
          // Lighten the base color
          finalColor = this.lightenColor(data.color, brightnessDelta);
        } else {
          // Darken the base color
          finalColor = this.darkenColor(data.color, Math.abs(brightnessDelta));
        }
        console.log(
          `  Base color adjustment: ${data.color} -> ${finalColor} (brightness: ${colorBrightness}%)`
        );
      }

      // If gradient mode, apply level-based shading with brightness range
      if (uniformity === 'Gradient' && directionality) {
        // Normalize level to 0-1 range
        const normalizedLevel = (data.level - minLevel) / levelRange;

        // Calculate brightness range: from colorBrightness to colorGradientBrightnessEnd
        const brightnessStart = colorBrightness;
        const brightnessEnd = colorGradientBrightnessEnd;

        // For sunset: start at brightnessStart (top level) and go to brightnessEnd (bottom level)
        // For sunrise: start at brightnessEnd (top level) and go to brightnessStart (bottom level)
        let brightnessAtLevel: number;
        if (directionality === 'sunset') {
          // Sunset: bright at top, darker at bottom
          // normalizedLevel 0 (top) = brightnessStart, normalizedLevel 1 (bottom) = brightnessEnd
          brightnessAtLevel =
            brightnessStart +
            (brightnessEnd - brightnessStart) * normalizedLevel;
        } else {
          // Sunrise: dark at top, bright at bottom
          // normalizedLevel 0 (top) = brightnessEnd, normalizedLevel 1 (bottom) = brightnessStart
          brightnessAtLevel =
            brightnessEnd + (brightnessStart - brightnessEnd) * normalizedLevel;
        }

        // Apply the brightness adjustment to the base color
        const brightnessDelta = brightnessAtLevel - 100;
        let adjustedColor = finalColor;

        if (brightnessDelta > 0) {
          // Lighten
          adjustedColor = this.lightenColor(adjustedColor, brightnessDelta);
        } else if (brightnessDelta < 0) {
          // Darken
          adjustedColor = this.darkenColor(
            adjustedColor,
            Math.abs(brightnessDelta)
          );
        }

        finalColor = adjustedColor;

        console.log(
          `  Level ${data.level}: Base ${
            data.color
          } -> Brightness ${brightnessAtLevel}% -> Final ${finalColor} (${
            directionality === 'sunset' ? 'sunset' : 'sunrise'
          })`
        );
      } else if (uniformity === 'Solid' && colorBrightness !== 100) {
        // For solid mode, brightness is already applied to finalColor above
        console.log(
          `  Level ${data.level}: ${data.color} -> ${finalColor} (solid mode, brightness: ${colorBrightness}%)`
        );
      }

      colorMap.set(data.nodeId, finalColor);
      console.log('  Map entry:', data.nodeId, '->', finalColor);
    });

    console.log('Color map built with', colorMap.size, 'entries');
    return colorMap;
  }

  /**
   * Lighten a color by a specified percentage
   * @param color Hex color string
   * @param percent Percentage to lighten (0-100)
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * Math.min(percent, 100));
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min(((num >> 8) & 0x00ff) + amt, 255);
    const B = Math.min((num & 0x0000ff) + amt, 255);
    return (
      '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
    );
  }

  /**
   * Darken a color by a specified percentage
   * @param color Hex color string
   * @param percent Percentage to darken (0-100)
   */
  /**
   * Darken a color by reducing its lightness while preserving hue and saturation
   * This ensures the color remains visible and doesn't fade to black
   * @param color Hex color string
   * @param percent Percentage to darken (0-100)
   */
  private darkenColor(color: string, percent: number): string {
    // Convert hex to RGB
    const num = parseInt(color.replace('#', ''), 16);
    const R = (num >> 16) & 255;
    const G = (num >> 8) & 255;
    const B = num & 255;

    // Convert RGB to HSL
    const r = R / 255;
    const g = G / 255;
    const b = B / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    // Reduce lightness by percent, but keep minimum lightness at 20%
    // This ensures color remains visible even at maximum darkness
    const darkPercent = Math.min(percent, 100) / 100;
    const minLightness = 0.2; // 20% minimum lightness
    const newLightness = Math.max(minLightness, l * (1 - darkPercent));

    // Convert HSL back to RGB
    let r2, g2, b2;
    if (s === 0) {
      r2 = g2 = b2 = newLightness;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q =
        newLightness < 0.5
          ? newLightness * (1 + s)
          : newLightness + s - newLightness * s;
      const p = 2 * newLightness - q;
      r2 = hue2rgb(p, q, h + 1 / 3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1 / 3);
    }

    const R2 = Math.round(r2 * 255);
    const G2 = Math.round(g2 * 255);
    const B2 = Math.round(b2 * 255);

    return (
      '#' + (0x1000000 + (R2 << 16) + (G2 << 8) + B2).toString(16).slice(1)
    );
  }

  /**
   * Apply a color to an SVG element
   * @param element The SVG element to color
   * @param color The color value (hex, rgb, etc.)
   * @param attribute The attribute to apply color to ('fill' or 'stroke')
   */
  private applyColorToElement(
    element: SVGElement,
    color: string,
    attribute: 'fill' | 'stroke' = 'fill'
  ): void {
    if (attribute === 'fill') {
      element.style.fill = color;
    } else if (attribute === 'stroke') {
      element.style.stroke = color;
    }
  }

  /**
   * Extract nodeId from an SVG element
   * Tries multiple approaches: data-node-id, data-id, id, or parent's id
   */
  private getNodeId(element: Element): string | null {
    // Try data-node-id attribute first (most reliable, set by standardized drawing code)
    let nodeId = element.getAttribute('data-node-id');
    if (nodeId && nodeId.trim()) {
      return nodeId;
    }

    // Try id attribute (circles will have numeric IDs like "0", "1", "2")
    // Text elements will have "label-0", "label-1", etc.
    nodeId = element.getAttribute('id') || (element as any).id;
    if (nodeId && nodeId.trim()) {
      // Handle "label-X" format for text elements
      if (nodeId.startsWith('label-')) {
        return nodeId.substring(6); // Extract X from "label-X"
      }
      return nodeId;
    }

    return null;
  }

  /**
   * Get CSS position styles based on position parameter
   */
  private getPositionStyles(position: string): string {
    const padding = '12px';
    switch (position) {
      case 'top-left':
        return `top: ${padding}; left: ${padding};`;
      case 'top-right':
        return `top: ${padding}; right: ${padding};`;
      case 'bottom-left':
        return `bottom: ${padding}; left: ${padding};`;
      case 'bottom-right':
        return `bottom: ${padding}; right: ${padding};`;
      default:
        return `top: ${padding}; right: ${padding};`;
    }
  }
}
