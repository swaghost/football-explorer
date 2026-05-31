import { Injectable } from '@angular/core';
import { INodeStyle, INodeStyleConfig } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ColorsService {
  // Drawing colors palette
  private readonly drawingColors = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#000000', // Black
    '#ffffff', // White
    '#ff8000', // Orange
    '#8000ff', // Purple
    '#808080', // Gray
    '#964B00', // Brown
  ];

  // UI theme colors
  private readonly uiColors = {
    // Selection colors
    singleSelection: '#00bcd4', // Cyan for single selection
    multiSelection: '#4caf50', // Green for multi-selection
    highlight: '#ff9800', // Orange highlight color

    // Tree node colors
    rootNode: '#d84315', // Root node color
    childNode: '#1565c0', // Child node color

    // Lasso colors
    lassoSelect: '#ff6600', // Orange for lasso select mode
    lassoDeselect: '#ff0066', // Pink for lasso deselect mode

    // Dark mode colors
    darkBackground: '#2a2a2a', // Dark mode background
    lightBackground: '#f8f8f8', // Light mode background
    darkText: '#fff', // Dark mode text
    lightText: '#333', // Light mode text
    darkBlue: '#1e3a5f', // Dark mode blue
    lightBlue: '#00ffff', // Light mode blue (aqua)

    // Default node border colors
    defaultBorder: '#2196f3', // Default border color
    darkModeBorder: '#64b5f6', // Dark mode border color
  };

  // Unified node styling configuration
  private readonly nodeStyleConfig: INodeStyleConfig = {
    selectedNode: {
      textColor: '#ffffff', // White text for contrast
      nodeColor: '#ff6b35', // Orange for selected node (consistent across all components)
    },
    selectedNodes: {
      textColor: '#ffffff', // White text for contrast
      nodeColor: '#2196f3', // Blue for multi-selected nodes (contrasting with orange selectedNode)
    },
    defaultNode: {
      textColor: '#1a1a1a', // Darker gray text for better readability
      nodeColor: '#90a4ae', // Gray for default nodes
    },
    highlightedNode: {
      textColor: '#000000', // Black text for contrast
      nodeColor: '#ffeb3b', // Yellow for highlighted nodes
    },
  };

  // Current selected drawing color
  private selectedDrawingColor: string = this.drawingColors[0]; // Default to red

  constructor() {}

  /**
   * Get all available drawing colors
   */
  getDrawingColors(): string[] {
    return [...this.drawingColors];
  }

  /**
   * Get the currently selected drawing color
   */
  getSelectedDrawingColor(): string {
    return this.selectedDrawingColor;
  }

  /**
   * Set the selected drawing color
   */
  setSelectedDrawingColor(color: string): void {
    if (this.drawingColors.includes(color)) {
      this.selectedDrawingColor = color;
    } else {
      console.warn(`Color ${color} is not in the drawing colors palette`);
    }
  }

  /**
   * Get the unified node styling configuration
   */
  getNodeStyleConfig(): INodeStyleConfig {
    return { ...this.nodeStyleConfig };
  }

  /**
   * Get style for selected node
   */
  getSelectedNodeStyle(isDarkMode?: boolean): INodeStyle {
    const baseStyle = { ...this.nodeStyleConfig.selectedNode };

    // Override text color based on mode for better visibility
    if (isDarkMode === false) {
      // Light mode: use royal blue for better contrast against white backgrounds
      baseStyle.textColor = '#4169e1'; // Royal blue
    } else if (isDarkMode === true) {
      // Dark mode: keep white text for contrast against dark backgrounds
      baseStyle.textColor = '#ffffff';
    }
    // If isDarkMode is undefined, use the default from config

    return baseStyle;
  }

  /**
   * Get style for nodes in selectedNodes list
   */
  getSelectedNodesStyle(isDarkMode?: boolean): INodeStyle {
    const baseStyle = { ...this.nodeStyleConfig.selectedNodes };

    // Override text color based on mode for better visibility
    if (isDarkMode === false) {
      // Light mode: use dark blue for better contrast against white backgrounds
      baseStyle.textColor = '#1565c0'; // Dark blue
    } else if (isDarkMode === true) {
      // Dark mode: keep white text for contrast against dark backgrounds
      baseStyle.textColor = '#ffffff';
    }
    // If isDarkMode is undefined, use the default from config

    return baseStyle;
  }

  /**
   * Get style for default/unselected nodes
   * @param isDarkMode - Whether dark mode is enabled
   * @param isBackgroundLight - Whether the background is light/white (optional, defaults to !isDarkMode)
   */
  getDefaultNodeStyle(
    isDarkMode?: boolean,
    isBackgroundLight?: boolean
  ): INodeStyle {
    const baseStyle = { ...this.nodeStyleConfig.defaultNode };

    // Determine if background is light (use provided isBackgroundLight or default to isDarkMode)
    const bgIsLight =
      isBackgroundLight !== undefined
        ? isBackgroundLight
        : isDarkMode === false;

    // Override text and node colors based on background lightness
    if (bgIsLight) {
      // Light background (white/aqua): use gray nodes for contrast
      baseStyle.textColor = '#1a1a1a';
      baseStyle.nodeColor = '#90a4ae'; // Gray
    } else {
      // Dark background (black/blue/green): use white nodes for contrast
      baseStyle.textColor = '#e5e7eb'; // Light gray
      baseStyle.nodeColor = '#ffffff'; // White
    }

    return baseStyle;
  }

  /**
   * Get style for highlighted nodes
   */
  getHighlightedNodeStyle(): INodeStyle {
    return { ...this.nodeStyleConfig.highlightedNode };
  }

  /**
   * Get a summary of all node colors for debugging/documentation
   */
  getNodeColorSummary(): Record<string, string> {
    return {
      selectedNode: this.nodeStyleConfig.selectedNode.nodeColor,
      selectedNodes: this.nodeStyleConfig.selectedNodes.nodeColor,
      defaultNode: this.nodeStyleConfig.defaultNode.nodeColor,
      highlightedNode: this.nodeStyleConfig.highlightedNode.nodeColor,
    };
  }

  /**
   * Get UI colors for different components and states
   */
  getUIColors() {
    return { ...this.uiColors };
  }

  /**
   * Get specific UI color by key
   */
  getUIColor(key: keyof typeof ColorsService.prototype.uiColors): string {
    return this.uiColors[key];
  }

  /**
   * Get selection color based on selection type
   */
  getSelectionColor(type: 'single' | 'multi' | 'highlight'): string {
    switch (type) {
      case 'single':
        return this.uiColors.singleSelection;
      case 'multi':
        return this.uiColors.multiSelection;
      case 'highlight':
        return this.uiColors.highlight;
      default:
        return this.uiColors.singleSelection;
    }
  }

  /**
   * Get node color based on node type and theme
   */
  getNodeColor(type: 'root' | 'child', isDarkMode = false): string {
    if (type === 'root') {
      return this.uiColors.rootNode;
    } else {
      return this.uiColors.childNode;
    }
  }

  /**
   * Get border color based on theme
   */
  getBorderColor(isDarkMode = false): string {
    return isDarkMode
      ? this.uiColors.darkModeBorder
      : this.uiColors.defaultBorder;
  }

  /**
   * Get background color based on theme
   */
  getBackgroundColor(isDarkMode = false): string {
    return isDarkMode
      ? this.uiColors.darkBackground
      : this.uiColors.lightBackground;
  }

  /**
   * Get text color based on theme
   */
  getTextColor(isDarkMode = false): string {
    return isDarkMode ? this.uiColors.darkText : this.uiColors.lightText;
  }

  /**
   * Get lasso color based on mode
   */
  getLassoColor(mode: 'select' | 'deselect'): string {
    return mode === 'select'
      ? this.uiColors.lassoSelect
      : this.uiColors.lassoDeselect;
  }

  /**
   * Get blue color based on theme
   */
  getBlueColor(isDarkMode = false): string {
    return isDarkMode ? this.uiColors.darkBlue : this.uiColors.lightBlue;
  }

  /**
   * Check if a color is a valid drawing color
   */
  isValidDrawingColor(color: string): boolean {
    return this.drawingColors.includes(color);
  }

  /**
   * Get color name or description for a hex color
   */
  getColorName(color: string): string {
    const colorMap: Record<string, string> = {
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#000000': 'Black',
      '#ffffff': 'White',
      '#ff8000': 'Orange',
      '#8000ff': 'Purple',
      '#808080': 'Gray',
      '#964B00': 'Brown',
    };

    return colorMap[color.toLowerCase()] || color;
  }

  /**
   * Reset selected drawing color to default
   */
  resetSelectedDrawingColor(): void {
    this.selectedDrawingColor = this.drawingColors[0];
  }
}
